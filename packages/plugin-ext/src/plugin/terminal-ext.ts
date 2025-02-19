// *****************************************************************************
// Copyright (C) 2018 Red Hat, Inc. and others.
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

import { UUID } from '@theia/core/shared/@lumino/coreutils';
import { inject, injectable } from '@theia/core/shared/inversify';
import { TerminalServiceExt, TerminalServiceMain, PLUGIN_RPC_CONTEXT, Plugin, TerminalOptions } from '../common/plugin-api-rpc';
import { RPCProtocol } from '../common/rpc-protocol';
import { Event, Emitter } from '@theia/core/lib/common/event';
import { MultiKeyMap } from '@theia/core/lib/common/collections';
import { Deferred } from '@theia/core/lib/common/promise-util';
import * as theia from '@theia/plugin';
import * as Converter from './type-converters';
import { Disposable, EnvironmentVariableMutatorType, TerminalExitReason, ThemeIcon } from './types-impl';
import { NO_ROOT_URI, SerializableEnvironmentVariableCollection } from '@theia/terminal/lib/common/shell-terminal-protocol';
import { ProvidedTerminalLink } from '../common/plugin-api-rpc-model';
import { PluginIconPath } from './plugin-icon-path';

/**
 * Provides high level terminal plugin api to use in the Theia plugins.
 * This service allow(with help proxy) create and use terminal emulator.
 */
@injectable()
export class TerminalServiceExtImpl implements TerminalServiceExt {
    private readonly proxy: TerminalServiceMain;

    private readonly _terminals = new Map<string, TerminalExtImpl>();

    private readonly _pseudoTerminals = new Map<string, PseudoTerminal>();

    private static nextProviderId = 0;
    private readonly terminalLinkProviders = new Map<string, theia.TerminalLinkProvider>();
    private readonly terminalObservers = new Map<string, theia.TerminalObserver>();
    private readonly terminalProfileProviders = new Map<string, theia.TerminalProfileProvider>();
    private readonly onDidCloseTerminalEmitter = new Emitter<theia.Terminal>();
    readonly onDidCloseTerminal: theia.Event<theia.Terminal> = this.onDidCloseTerminalEmitter.event;

    private readonly onDidOpenTerminalEmitter = new Emitter<theia.Terminal>();
    readonly onDidOpenTerminal: theia.Event<theia.Terminal> = this.onDidOpenTerminalEmitter.event;

    private readonly onDidChangeActiveTerminalEmitter = new Emitter<theia.Terminal | undefined>();
    readonly onDidChangeActiveTerminal: theia.Event<theia.Terminal | undefined> = this.onDidChangeActiveTerminalEmitter.event;

    private readonly onDidChangeTerminalStateEmitter = new Emitter<theia.Terminal>();
    readonly onDidChangeTerminalState: theia.Event<theia.Terminal> = this.onDidChangeTerminalStateEmitter.event;

    protected environmentVariableCollections: MultiKeyMap<string, EnvironmentVariableCollectionImpl> = new MultiKeyMap(2);

    private shell: string;
    private readonly onDidChangeShellEmitter = new Emitter<string>();
    readonly onDidChangeShell: theia.Event<string> = this.onDidChangeShellEmitter.event;

    constructor(@inject(RPCProtocol) rpc: RPCProtocol) {
        this.proxy = rpc.getProxy(PLUGIN_RPC_CONTEXT.TERMINAL_MAIN);
    }

    get terminals(): TerminalExtImpl[] {
        return [...this._terminals.values()];
    }

    get defaultShell(): string {
        return this.shell || '';
    }

    async $setShell(shell: string): Promise<void> {
        if (this.shell !== shell) {
            this.shell = shell;
            this.onDidChangeShellEmitter.fire(shell);
        }
    }

    createTerminal(
        plugin: Plugin,
        nameOrOptions: theia.TerminalOptions | theia.PseudoTerminalOptions | theia.ExtensionTerminalOptions | string | undefined,
        shellPath?: string, shellArgs?: string[] | string
    ): theia.Terminal {
        const id = `plugin-terminal-${UUID.uuid4()}`;
        let options: TerminalOptions;
        let pseudoTerminal: theia.Pseudoterminal | undefined = undefined;
        if (typeof nameOrOptions === 'object') {
            if ('pty' in nameOrOptions) {
                pseudoTerminal = nameOrOptions.pty;
                options = {
                    name: nameOrOptions.name,
                };
                this._pseudoTerminals.set(id, new PseudoTerminal(id, this.proxy, pseudoTerminal));
            } else {
                options = nameOrOptions;
            }
        } else {
            options = {
                name: nameOrOptions,
                shellPath: shellPath,
                shellArgs: shellArgs
            };
        }

        let parentId;
        if (options.location && typeof options.location === 'object' && 'parentTerminal' in options.location) {
            const parentTerminal = options.location.parentTerminal;
            if (parentTerminal instanceof TerminalExtImpl) {
                for (const [k, v] of this._terminals) {
                    if (v === parentTerminal) {
                        parentId = k;
                        break;
                    }
                }
            }
        }

        if (typeof nameOrOptions === 'object' && 'iconPath' in nameOrOptions) {
            const iconPath = nameOrOptions.iconPath;
            options.iconUrl = PluginIconPath.toUrl(iconPath, plugin) ?? ThemeIcon.get(iconPath);
        }

        if (typeof nameOrOptions === 'object' && 'color' in nameOrOptions) {
            options.color = nameOrOptions.color;
        }

        this.proxy.$createTerminal(id, options, parentId, !!pseudoTerminal);

        let creationOptions: theia.TerminalOptions | theia.ExtensionTerminalOptions = options;
        // make sure to pass ExtensionTerminalOptions as creation options
        if (typeof nameOrOptions === 'object' && 'pty' in nameOrOptions) {
            creationOptions = nameOrOptions;
        }
        return this.obtainTerminal(id, options.name || 'Terminal', creationOptions);
    }

    attachPtyToTerminal(terminalId: number, pty: theia.Pseudoterminal): void {
        this._pseudoTerminals.set(terminalId.toString(), new PseudoTerminal(terminalId, this.proxy, pty, true));
    }

    protected obtainTerminal(id: string, name: string, options?: theia.TerminalOptions | theia.ExtensionTerminalOptions): TerminalExtImpl {
        let terminal = this._terminals.get(id);
        if (!terminal) {
            terminal = new TerminalExtImpl(this.proxy, options ?? {});
            this._terminals.set(id, terminal);
        }
        terminal.name = name;
        return terminal;
    }

    $terminalOnInput(id: string, data: string): void {
        const terminal = this._pseudoTerminals.get(id);
        if (!terminal) {
            return;
        }
        terminal.emitOnInput(data);
    }

    $terminalStateChanged(id: string): void {
        const terminal = this._terminals.get(id);
        if (!terminal) {
            return;
        }
        if (!terminal.state.isInteractedWith) {
            terminal.state = { isInteractedWith: true };
            this.onDidChangeTerminalStateEmitter.fire(terminal);
        }
    }

    $terminalSizeChanged(id: string, clos: number, rows: number): void {
        const terminal = this._pseudoTerminals.get(id);
        if (!terminal) {
            return;
        }
        terminal.emitOnResize(clos, rows);
    }

    $terminalCreated(id: string, name: string): void {
        const terminal = this.obtainTerminal(id, name);
        terminal.id.resolve(id);
        this.onDidOpenTerminalEmitter.fire(terminal);
    }

    $terminalNameChanged(id: string, name: string): void {
        const terminal = this._terminals.get(id);
        if (terminal) {
            terminal.name = name;
        }
    }

    $terminalOpened(id: string, processId: number, terminalId: number, cols: number, rows: number): void {
        const terminal = this._terminals.get(id);
        if (terminal) {
            // resolve for existing clients
            terminal.deferredProcessId.resolve(processId);
            // install new if terminal is reconnected
            terminal.deferredProcessId = new Deferred<number>();
            terminal.deferredProcessId.resolve(processId);
        }

        // Switch the pseudoterminal keyed by terminalId to be keyed by terminal ID
        const tId = terminalId.toString();
        if (this._pseudoTerminals.has(tId)) {
            const pseudo = this._pseudoTerminals.get(tId);
            if (pseudo) {
                this._pseudoTerminals.set(id, pseudo);
            }
            this._pseudoTerminals.delete(tId);
        }

        const pseudoTerminal = this._pseudoTerminals.get(id);
        if (pseudoTerminal) {
            pseudoTerminal.emitOnOpen(cols, rows);
        }
    }

    $terminalClosed(id: string, exitStatus: theia.TerminalExitStatus | undefined): void {
        const terminal = this._terminals.get(id);
        if (terminal) {
            terminal.exitStatus = exitStatus ?? { code: undefined, reason: TerminalExitReason.Unknown };
            this.onDidCloseTerminalEmitter.fire(terminal);
            this._terminals.delete(id);
        }
        const pseudoTerminal = this._pseudoTerminals.get(id);
        if (pseudoTerminal) {
            pseudoTerminal.emitOnClose();
            this._pseudoTerminals.delete(id);
        }
    }

    private activeTerminalId: string | undefined;
    get activeTerminal(): TerminalExtImpl | undefined {
        return this.activeTerminalId && this._terminals.get(this.activeTerminalId) || undefined;
    }
    $currentTerminalChanged(id: string | undefined): void {
        this.activeTerminalId = id;
        this.onDidChangeActiveTerminalEmitter.fire(this.activeTerminal);
    }

    registerTerminalLinkProvider(provider: theia.TerminalLinkProvider): theia.Disposable {
        const providerId = (TerminalServiceExtImpl.nextProviderId++).toString();
        this.terminalLinkProviders.set(providerId, provider);
        this.proxy.$registerTerminalLinkProvider(providerId);
        return Disposable.create(() => {
            this.proxy.$unregisterTerminalLinkProvider(providerId);
            this.terminalLinkProviders.delete(providerId);
        });
    }

    registerTerminalProfileProvider(id: string, provider: theia.TerminalProfileProvider): theia.Disposable {
        this.terminalProfileProviders.set(id, provider);
        return Disposable.create(() => {
            this.terminalProfileProviders.delete(id);
        });
    }

    /** @stubbed */
    registerTerminalQuickFixProvider(id: string, provider: theia.TerminalQuickFixProvider): theia.Disposable {
        return Disposable.NULL;
    }

    registerTerminalObserver(observer: theia.TerminalObserver): theia.Disposable {
        const id = (TerminalServiceExtImpl.nextProviderId++).toString();
        this.terminalObservers.set(id, observer);
        this.proxy.$registerTerminalObserver(id, observer.nrOfLinesToMatch, observer.outputMatcherRegex);
        return Disposable.create(() => {
            this.proxy.$unregisterTerminalObserver(id);
            this.terminalObservers.delete(id);
        });
    }

    $reportOutputMatch(observerId: string, groups: string[]): void {
        const observer = this.terminalObservers.get(observerId);
        if (observer) {
            observer.matchOccurred(groups);
        } else {
            throw new Error(`reporting matches for unregistered observer: ${observerId} `);
        }
    }

    protected isExtensionTerminalOptions(options: theia.TerminalOptions | theia.ExtensionTerminalOptions): options is theia.ExtensionTerminalOptions {
        return 'pty' in options;
    }

    async $startProfile(profileId: string, cancellationToken: theia.CancellationToken): Promise<string> {
        const provider = this.terminalProfileProviders.get(profileId);
        if (!provider) {
            throw new Error(`No terminal profile provider with id '${profileId}'`);
        }
        const profile = await provider.provideTerminalProfile(cancellationToken);
        if (!profile) {
            throw new Error(`Profile with id ${profileId} could not be created`);
        }
        const id = `plugin-terminal-${UUID.uuid4()}`;
        const options = profile.options;
        if (this.isExtensionTerminalOptions(options)) {
            this._pseudoTerminals.set(id, new PseudoTerminal(id, this.proxy, options.pty));
            return this.proxy.$createTerminal(id, { name: options.name }, undefined, true);
        } else {
            return this.proxy.$createTerminal(id, profile.options);
        }
    }

    async $provideTerminalLinks(line: string, terminalId: string, token: theia.CancellationToken): Promise<ProvidedTerminalLink[]> {
        const links: ProvidedTerminalLink[] = [];
        const terminal = this._terminals.get(terminalId);
        if (terminal) {
            for (const [providerId, provider] of this.terminalLinkProviders) {
                const providedLinks = await provider.provideTerminalLinks({ line, terminal }, token);
                if (providedLinks) {
                    links.push(...providedLinks.map(link => ({ ...link, providerId })));
                }
            }
        }
        return links;
    }

    async $handleTerminalLink(link: ProvidedTerminalLink): Promise<void> {
        const provider = this.terminalLinkProviders.get(link.providerId);
        if (!provider) {
            throw Error('Terminal link provider not found');
        }
        await provider.handleTerminalLink(link);
    }

    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    // some code copied and modified from https://github.com/microsoft/vscode/blob/1.49.0/src/vs/workbench/api/common/extHostTerminalService.ts

    getEnvironmentVariableCollection(extensionIdentifier: string, rootUri: string = NO_ROOT_URI): theia.GlobalEnvironmentVariableCollection {
        const that = this;
        let collection = this.environmentVariableCollections.get([extensionIdentifier, rootUri]);
        if (!collection) {
            collection = new class extends EnvironmentVariableCollectionImpl {
                override getScoped(scope: theia.EnvironmentVariableScope): theia.EnvironmentVariableCollection {
                    return that.getEnvironmentVariableCollection(extensionIdentifier, scope.workspaceFolder?.uri.toString());
                }
            }(true);
            this.setEnvironmentVariableCollection(extensionIdentifier, rootUri, collection);
        }
        return collection;
    }

    private syncEnvironmentVariableCollection(extensionIdentifier: string, rootUri: string, collection: EnvironmentVariableCollectionImpl): void {
        const serialized = [...collection.map.entries()];
        this.proxy.$setEnvironmentVariableCollection(collection.persistent, extensionIdentifier,
            rootUri,
            {
                mutators: serialized,
                description: Converter.fromMarkdownOrString(collection.description)
            });
    }

    private setEnvironmentVariableCollection(pluginIdentifier: string, rootUri: string, collection: EnvironmentVariableCollectionImpl): void {
        this.environmentVariableCollections.set([pluginIdentifier, rootUri], collection);
        collection.onDidChangeCollection(() => {
            // When any collection value changes send this immediately, this is done to ensure
            // following calls to createTerminal will be created with the new environment. It will
            // result in more noise by sending multiple updates when called but collections are
            // expected to be small.
            this.syncEnvironmentVariableCollection(pluginIdentifier, rootUri, collection);
        });
    }

    $initEnvironmentVariableCollections(collections: [string, string, boolean, SerializableEnvironmentVariableCollection][]): void {
        collections.forEach(entry => {
            const extensionIdentifier = entry[0];
            const rootUri = entry[1];
            const collection = new EnvironmentVariableCollectionImpl(entry[2], entry[3]);
            this.setEnvironmentVariableCollection(extensionIdentifier, rootUri, collection);
        });
    }

}

export class EnvironmentVariableCollectionImpl implements theia.GlobalEnvironmentVariableCollection {
    readonly map: Map<string, theia.EnvironmentVariableMutator> = new Map();
    private _description?: string | theia.MarkdownString;
    private _persistent: boolean = true;

    public get description(): string | theia.MarkdownString | undefined { return this._description; }
    public set description(value: string | theia.MarkdownString | undefined) {
        this._description = value;
        this.onDidChangeCollectionEmitter.fire();
    }

    public get persistent(): boolean { return this._persistent; }
    public set persistent(value: boolean) {
        this._persistent = value;
        this.onDidChangeCollectionEmitter.fire();
    }

    protected readonly onDidChangeCollectionEmitter: Emitter<void> = new Emitter<void>();
    onDidChangeCollection: Event<void> = this.onDidChangeCollectionEmitter.event;

    constructor(
        persistent: boolean,
        serialized?: SerializableEnvironmentVariableCollection
    ) {
        this._persistent = persistent;
        this.map = new Map(serialized?.mutators);
    }

    getScoped(scope: theia.EnvironmentVariableScope): theia.EnvironmentVariableCollection {
        throw new Error('Cannot get scoped from a regular env var collection');
    }

    get size(): number {
        return this.map.size;
    }

    replace(variable: string, value: string, options?: theia.EnvironmentVariableMutatorOptions): void {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Replace, options: options ?? { applyAtProcessCreation: true } });
    }

    append(variable: string, value: string, options?: theia.EnvironmentVariableMutatorOptions): void {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Append, options: options ?? { applyAtProcessCreation: true } });
    }

    prepend(variable: string, value: string, options?: theia.EnvironmentVariableMutatorOptions): void {
        this._setIfDiffers(variable, { value, type: EnvironmentVariableMutatorType.Prepend, options: options ?? { applyAtProcessCreation: true } });
    }

    private _setIfDiffers(variable: string, mutator: theia.EnvironmentVariableMutator): void {
        const current = this.map.get(variable);
        if (!current || current.value !== mutator.value || current.type !== mutator.type) {
            this.map.set(variable, mutator);
            this.onDidChangeCollectionEmitter.fire();
        }
    }

    get(variable: string): theia.EnvironmentVariableMutator | undefined {
        return this.map.get(variable);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forEach(callback: (variable: string, mutator: theia.EnvironmentVariableMutator, collection: theia.EnvironmentVariableCollection) => any, thisArg?: any): void {
        this.map.forEach((value, key) => callback.call(thisArg, key, value, this));
    }

    delete(variable: string): void {
        this.map.delete(variable);
        this.onDidChangeCollectionEmitter.fire();
    }

    clear(): void {
        this.map.clear();
        this.onDidChangeCollectionEmitter.fire();
    }
}

export class TerminalExtImpl implements theia.Terminal {

    name: string;

    readonly id = new Deferred<string>();

    exitStatus: theia.TerminalExitStatus | undefined;

    deferredProcessId = new Deferred<number>();

    get processId(): Thenable<number> {
        return this.deferredProcessId.promise;
    }

    readonly creationOptions: Readonly<theia.TerminalOptions | theia.ExtensionTerminalOptions>;

    state: theia.TerminalState = { isInteractedWith: false };

    constructor(private readonly proxy: TerminalServiceMain, private readonly options: theia.TerminalOptions | theia.ExtensionTerminalOptions) {
        this.creationOptions = this.options;
    }

    /** @stubbed Terminal Shell Ingration */
    shellIntegration: theia.TerminalShellIntegration | undefined = undefined;

    sendText(text: string, shouldExecute: boolean = true): void {
        this.id.promise.then(id => this.proxy.$sendText(id, text, shouldExecute));
    }

    show(preserveFocus?: boolean): void {
        this.id.promise.then(id => this.proxy.$show(id, preserveFocus));
    }

    hide(): void {
        this.id.promise.then(id => this.proxy.$hide(id));
    }

    dispose(): void {
        this.id.promise.then(id => this.proxy.$dispose(id));
    }
}

export class PseudoTerminal {
    constructor(
        id: string | number,
        private readonly proxy: TerminalServiceMain,
        private readonly pseudoTerminal: theia.Pseudoterminal,
        waitOnExit?: boolean | string
    ) {

        pseudoTerminal.onDidWrite(data => {
            if (typeof id === 'string') {
                this.proxy.$write(id, data);
            } else {
                this.proxy.$writeByTerminalId(id, data);
            }
        });
        if (pseudoTerminal.onDidClose) {
            pseudoTerminal.onDidClose((e: number | void = undefined) => {
                if (typeof id === 'string') {
                    this.proxy.$dispose(id);
                } else {
                    this.proxy.$disposeByTerminalId(id, waitOnExit);
                }
            });
        }
        if (pseudoTerminal.onDidOverrideDimensions) {
            pseudoTerminal.onDidOverrideDimensions(e => {
                if (e) {
                    if (typeof id === 'string') {
                        this.proxy.$resize(id, e.columns, e.rows);
                    } else {
                        this.proxy.$resizeByTerminalId(id, e.columns, e.rows);
                    }
                }
            });
        }
        if (pseudoTerminal.onDidChangeName) {
            pseudoTerminal.onDidChangeName(name => {
                if (typeof id === 'string') {
                    this.proxy.$setName(id, name);
                } else {
                    this.proxy.$setNameByTerminalId(id, name);
                }
            });
        }
    }

    emitOnClose(): void {
        this.pseudoTerminal.close();
    }

    emitOnInput(data: string): void {
        if (this.pseudoTerminal.handleInput) {
            this.pseudoTerminal.handleInput(data);
        }
    }

    emitOnOpen(cols: number, rows: number): void {
        this.pseudoTerminal.open({
            rows,
            columns: cols,
        });
    }

    emitOnResize(cols: number, rows: number): void {
        if (this.pseudoTerminal.setDimensions) {
            this.pseudoTerminal.setDimensions({ columns: cols, rows });
        }
    }
}
