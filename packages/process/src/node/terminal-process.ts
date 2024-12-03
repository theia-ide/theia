// *****************************************************************************
// Copyright (C) 2017 Ericsson and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { injectable, inject, named } from '@theia/core/shared/inversify';
import { Disposable, DisposableCollection, Emitter, Event, isWindows } from '@theia/core';
import { ILogger } from '@theia/core/lib/common';
import { Process, ProcessType, ProcessOptions, /* ProcessErrorEvent */ } from './process';
import { ProcessManager } from './process-manager';
import { IPty, spawn } from 'node-pty';
import { MultiRingBuffer, MultiRingBufferReadableStream } from './multi-ring-buffer';
import { DevNullStream } from './dev-null-stream';
import { signame } from './utils';
import { PseudoPty } from './pseudo-pty';
import { Writable } from 'stream';

export const TerminalProcessOptions = Symbol('TerminalProcessOptions');
export interface TerminalProcessOptions extends ProcessOptions {
    /**
     * Windows only. Allow passing complex command lines already escaped for CommandLineToArgvW.
     */
    commandLine?: string;
    isPseudo?: boolean;
}

export const TerminalProcessFactory = Symbol('TerminalProcessFactory');
export interface TerminalProcessFactory {
    (options: TerminalProcessOptions): TerminalProcess;
}

export enum NodePtyErrors {
    EACCES = 'Permission denied',
    ENOENT = 'No such file or directory'
}

/**
 * Run arbitrary processes inside pseudo-terminals (PTY).
 *
 * Note: a PTY is not a shell process (bash/pwsh/cmd...)
 */
@injectable()
export class TerminalProcess extends Process {

    protected readonly terminal: IPty | undefined;
    private _delayedResizer: DelayedResizer | undefined;
    private _exitCode: number | undefined;

    readonly outputStream = this.createOutputStream();
    readonly errorStream = new DevNullStream({ autoDestroy: true });
    readonly inputStream: Writable;

    constructor( // eslint-disable-next-line @typescript-eslint/indent
        @inject(TerminalProcessOptions) protected override readonly options: TerminalProcessOptions,
        @inject(ProcessManager) processManager: ProcessManager,
        @inject(MultiRingBuffer) protected readonly ringBuffer: MultiRingBuffer,
        @inject(ILogger) @named('process') logger: ILogger
    ) {
        super(processManager, logger, ProcessType.Terminal, options);

        if (options.isPseudo) {
            // do not need to spawn a process, new a pseudo pty instead
            this.terminal = new PseudoPty();
            this.inputStream = new DevNullStream({ autoDestroy: true });
            return;
        }

        if (this.isForkOptions(this.options)) {
            throw new Error('terminal processes cannot be forked as of today');
        }
        this.logger.debug('Starting terminal process', JSON.stringify(options, undefined, 2));

        // Delay resizes to avoid conpty not respecting very early resize calls
        // see https://github.com/microsoft/vscode/blob/a1c783c/src/vs/platform/terminal/node/terminalProcess.ts#L177
        if (isWindows) {
            this._delayedResizer = new DelayedResizer();
            this._delayedResizer.onTrigger(dimensions => {
                this._delayedResizer?.dispose();
                this._delayedResizer = undefined;
                if (dimensions.cols && dimensions.rows) {
                    this.resize(dimensions.cols, dimensions.rows);
                }
            });
        }

        const startTerminal = (command: string): { terminal: IPty | undefined, inputStream: Writable } => {
            try {
                return this.createPseudoTerminal(command, options, ringBuffer);
            } catch (error) {
                // Normalize the error to make it as close as possible as what
                // node's child_process.spawn would generate in the same
                // situation.
                const message: string = error.message;

                if (message.startsWith('File not found: ') || message.endsWith(NodePtyErrors.ENOENT)) {
                    if (isWindows && command && !command.toLowerCase().endsWith('.exe')) {
                        const commandExe = command + '.exe';
                        this.logger.debug(`Trying terminal command '${commandExe}' because '${command}' was not found.`);
                        return startTerminal(commandExe);
                    }

                    // Proceed with failure, reporting the original command because it was
                    // the intended command and it was not found
                    error.errno = 'ENOENT';
                    error.code = 'ENOENT';
                    error.path = options.command;
                } else if (message.endsWith(NodePtyErrors.EACCES)) {
                    // The shell program exists but was not accessible, so just fail
                    error.errno = 'EACCES';
                    error.code = 'EACCES';
                    error.path = options.command;
                }

                // node-pty throws exceptions on Windows.
                // Call the client error handler, but first give them a chance to register it.
                this.emitOnErrorAsync(error);

                return { terminal: undefined, inputStream: new DevNullStream({ autoDestroy: true }) };
            }
        };

        const { terminal, inputStream } = startTerminal(options.command);
        this.terminal = terminal;
        this.inputStream = inputStream;
    }

    debugString(): string {
        return JSON.stringify(this.terminal);
    }

    /**
     * Helper for the constructor to attempt to create the pseudo-terminal encapsulating the shell process.
     *
     * @param command the shell command to launch
     * @param options options for the shell process
     * @param ringBuffer a ring buffer in which to collect terminal output
     * @returns the terminal PTY and a stream by which it may be sent input
     */
    private createPseudoTerminal(command: string, options: TerminalProcessOptions, ringBuffer: MultiRingBuffer): { terminal: IPty | undefined, inputStream: Writable } {
        const terminal = spawn(
            command,
            (isWindows && options.commandLine) || options.args || [],
            options.options || {}
        );

        if (process.pid !== undefined) {
            process.nextTick(() => this.emitOnStarted());
        }

        // node-pty actually wait for the underlying streams to be closed before emitting exit.
        // We should emulate the `exit` and `close` sequence.
        terminal.onExit(({ exitCode, signal }) => {
            // Make sure to only pass either code or signal as !undefined, not
            // both.
            //
            // node-pty quirk: On Linux/macOS, if the process exited through the
            // exit syscall (with an exit code), signal will be 0 (an invalid
            // signal value).  If it was terminated because of a signal, the
            // signal parameter will hold the signal number and code should
            // be ignored.
            this._exitCode = exitCode;
            if (signal === undefined || signal === 0) {
                this.onTerminalExit(exitCode, undefined);
            } else {
                this.onTerminalExit(undefined, signame(signal));
            }
            process.nextTick(() => {
                if (signal === undefined || signal === 0) {
                    this.emitOnClose(exitCode, undefined);
                } else {
                    this.emitOnClose(undefined, signame(signal));
                }
            });
        });

        terminal.onData((data: string) => {
            ringBuffer.enq(data);
        });

        const inputStream = new Writable({
            write: (chunk: string) => {
                this.write(chunk);
            },
        });

        return { terminal, inputStream };
    }

    createOutputStream(): MultiRingBufferReadableStream {
        return this.ringBuffer.getStream();
    }

    get pid(): number {
        this.checkTerminal();
        return this.terminal!.pid;
    }

    get executable(): string {
        return (this.options as ProcessOptions).command;
    }

    get arguments(): string[] {
        return this.options.args || [];
    }

    protected onTerminalExit(code: number | undefined, signal: string | undefined): void {
        this.emitOnExit(code, signal);
        this.unregisterProcess();
    }

    unregisterProcess(): void {
        this.processManager.unregister(this);
    }

    kill(signal?: string): void {
        if (this.terminal && this.killed === false) {
            this.terminal.kill(signal);
        }
    }

    resize(cols: number, rows: number): void {
        if (typeof cols !== 'number' || typeof rows !== 'number' || isNaN(cols) || isNaN(rows)) {
            return;
        }
        this.checkTerminal();
        try {
            // Ensure that cols and rows are always >= 1, this prevents a native exception in winpty.
            cols = Math.max(cols, 1);
            rows = Math.max(rows, 1);

            // Delay resize if needed
            if (this._delayedResizer) {
                this._delayedResizer.cols = cols;
                this._delayedResizer.rows = rows;
                return;
            }

            this.terminal!.resize(cols, rows);
        } catch (error) {
            // swallow error if the pty has already exited
            // see also https://github.com/microsoft/vscode/blob/a1c783c/src/vs/platform/terminal/node/terminalProcess.ts#L549
            if (this._exitCode !== undefined &&
                error.message !== 'ioctl(2) failed, EBADF' &&
                error.message !== 'Cannot resize a pty that has already exited') {
                throw error;
            }
        }
    }

    write(data: string): void {
        this.checkTerminal();
        this.terminal!.write(data);
    }

    protected checkTerminal(): void | never {
        if (!this.terminal) {
            throw new Error('pty process did not start correctly');
        }
    }

}

/**
 * Tracks the latest resize event to be trigger at a later point.
 */
class DelayedResizer extends DisposableCollection {
    rows: number | undefined;
    cols: number | undefined;
    private _timeout: NodeJS.Timeout;

    private readonly _onTrigger = new Emitter<{ rows?: number; cols?: number }>();
    get onTrigger(): Event<{ rows?: number; cols?: number }> { return this._onTrigger.event; }

    constructor() {
        super();
        this.push(this._onTrigger);
        this._timeout = setTimeout(() => this._onTrigger.fire({ rows: this.rows, cols: this.cols }), 1000);
        this.push(Disposable.create(() => clearTimeout(this._timeout)));
    }

    override dispose(): void {
        super.dispose();
        clearTimeout(this._timeout);
    }
}
