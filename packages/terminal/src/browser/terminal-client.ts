/********************************************************************************
 * Copyright (C) 2019 Red Hat, Inc. and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject, postConstruct, named } from 'inversify';
import { TerminalWidget } from './terminal-widget';
import { ShellTerminalServerProxy } from '../common/shell-terminal-protocol';
import { IBaseTerminalServer } from '../common/base-terminal-protocol';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { MessageConnection } from 'vscode-jsonrpc';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { terminalsPath } from '../common/terminal-protocol';
import { TerminalWatcher } from '../common/terminal-watcher';
import { ILogger, Disposable, DisposableCollection } from '@theia/core';

export const TerminalClient = Symbol('TerminalClient');
/**
 * TerminalClient contains connection logic between terminal server side and terminal widget. So it's incupsulated connection
 * specific logic in the separated code layer. Terminal widget responsible to render backend output and catch user input. Terminal client
 * responcible to create connection with backend, send output to the terminal widget, and send user input from terminal widget.
 * Terminal client should create connection with terminal server side and send user input from terminal widget to the terminal backend, move
 * terminal output from terminal backend to the terminal widget. Potentionally terminal backend could be separed service isolated of Theia.
 * This interface provide extensibility terminal wiget and terminal server side. This common interface allow to use different implementation
 * terminal widget for the same terminal backend. Also it's allow to reuse current terminal widget to comunication with some custom server side.
 */
export interface TerminalClient extends Disposable {

    // todo
    readonly options: TerminalClientOptions;

    // readonly widget: TerminalWidget;

    /**
     * Create connection with terminal backend and return connection id.
     */
    createConnection(terminalWidget: TerminalWidget): Promise<number>;

    // onSessionIdChanged - for reconnection stuff, but need to think about it.

    resize(cols: number, rows: number): void;

    kill(): Promise<void>;

    sendText(text: string): Promise<void>;

    // define iterceptor function, but like optional argument.
}

export const TerminalClientOptions = Symbol('TerminalClientOptions');
export interface TerminalClientOptions {
    readonly cwd?: string;
    readonly connectionId?: number;
    readonly closeOnDispose: boolean;
    readonly terminalDomId: string;
}

// export interface TerminalClientOptionsToRestore extends Partial<TerminalClientOptions>{
//     connectionId: number;
// }

// todo move implementation to the separated ts file.
/**
 * Default implementation Terminal Client.
 */
@injectable()
export class DefaultTerminalClient implements TerminalClient, Disposable {

    @inject(ShellTerminalServerProxy)
    protected readonly shellTerminalServer: ShellTerminalServerProxy;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(WebSocketConnectionProvider)
    protected readonly webSocketConnectionProvider: WebSocketConnectionProvider;

    @inject(TerminalClientOptions)
    _options: TerminalClientOptions;

    get options(): TerminalClientOptions {
        return this._options;
    }

    @inject(TerminalWatcher)
    protected readonly terminalWatcher: TerminalWatcher;

    @inject(ILogger) @named('terminal')
    protected readonly logger: ILogger;

    private termWidget: TerminalWidget;
    private terminalId: number;

    protected waitForConnection: Deferred<MessageConnection>;

    protected readonly toDispose = new DisposableCollection();
    protected onDidCloseDisposable: Disposable;

    @postConstruct()
    protected init(): void {
        this.terminalWatcher.onTerminalError(({ terminalId, error }) => {
            if (terminalId === this.terminalId) {
                this.disposeWidget();
                this.logger.error(`The terminal process terminated. Cause: ${error}`);
            }
        });
        this.terminalWatcher.onTerminalExit(({ terminalId }) => {
            if (terminalId === this.terminalId) {
                this.disposeWidget();
            }
        });
    }

    private disposeWidget(): void {
        if (this.onDidCloseDisposable) {
            this.onDidCloseDisposable.dispose();
        }
        if (this.options.closeOnDispose) {
            this.termWidget.dispose();
        }
    }

    dispose(): void {
        this.toDispose.dispose();
        console.log('dispose terminal client!!!!');
    }

    async createConnection(terminalWidget: TerminalWidget): Promise<number> {
        this.termWidget = terminalWidget;
        this.toDispose.push(this.termWidget);

        this.terminalId = await this.createTerminalProcess(); // : await this.attachTerminal(id);
        this._options = {connectionId: this.terminalId , ...this.options};

        console.log(' check options ', this.options);
        this.connectTerminalProcess();
        this.onDidCloseDisposable = this.termWidget.onTerminalDidClose(() => this.kill());
        const onResizeDisposable = this.termWidget.onTerminalResize(size => this.resize(size.cols, size.rows));

        this.toDispose.pushAll([this.onDidCloseDisposable, onResizeDisposable]);

        return this.terminalId;
    }

    protected async createTerminalProcess(): Promise<number> {
        let rootURI = this.options.cwd;
        if (!rootURI) {
            const root = (await this.workspaceService.roots)[0];
            rootURI = root && root.uri;
        }
        // const { cols, rows } = this.term;

        const terminalId = await this.shellTerminalServer.create({
            shell: 'sh', // this.options.shellPath,
            args: [],  // this.options.shellArgs,
            // env: this.options.env,
            rootURI: rootURI,
            cols: 80,
            rows: 24
        });
        if (IBaseTerminalServer.validateId(terminalId)) {
            return terminalId;
        }
        throw new Error('Error creating terminal widget, see the backend error log for more information.');
    }

     protected connectTerminalProcess(): void {
        if (typeof this.terminalId !== 'number') {
            return;
        }

        // this.toDisposeOnConnect.dispose();
        // this.toDispose.push(this.toDisposeOnConnect);
        // this.term.reset();
        const waitForConnection = this.waitForConnection = new Deferred<MessageConnection>();
        this.webSocketConnectionProvider.listen({
            path: `${terminalsPath}/${this.terminalId}`,
            onConnection: connection => {
                connection.onNotification('onData', (data: string) => this.termWidget.write(data));

                this.termWidget.onUserInput(data => data && connection.sendRequest('write', data));
                // connection.onDispose(() => this.term.off('data', sendData));

                // this.toDisposeOnConnect.push(connection);
                connection.listen();
                if (waitForConnection) {
                    waitForConnection.resolve(connection);
                }
            }
        }, { reconnecting: false });
    }

    resize(cols: number, rows: number): void {
        if (typeof this.terminalId !== 'number') {
            return;
        }

        this.shellTerminalServer.resize(this.terminalId, cols, rows);
    }

    async kill(): Promise<void> {
        console.log('kill terminal ', this.terminalId);
        await this.shellTerminalServer.close(this.terminalId);
    }

    async sendText(text: string): Promise<void> {
        if (this.waitForConnection) {
            this.waitForConnection.promise.then(connection =>
                connection.sendRequest('write', text)
            );
        }
    }
}
