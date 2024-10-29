// *****************************************************************************
// Copyright (C) 2017 TypeFox and others.
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

import { inject, injectable, optional, postConstruct } from '@theia/core/shared/inversify';
import {
    CommandContribution,
    Command,
    CommandRegistry,
    DisposableCollection,
    MenuContribution,
    MenuModelRegistry,
    isOSX,
    SelectionService,
    Emitter,
    Event,
    ViewColumn,
    OS,
    MAIN_MENU_BAR
} from '@theia/core/lib/common';
import {
    ApplicationShell, KeybindingContribution, KeyCode, Key, WidgetManager, PreferenceService,
    KeybindingRegistry, LabelProvider, WidgetOpenerOptions, StorageService, QuickInputService,
    codicon, CommonCommands, FrontendApplicationContribution, OnWillStopAction, Dialog, ConfirmDialog, FrontendApplication, PreferenceScope, Widget, SHELL_TABBAR_CONTEXT_MENU
} from '@theia/core/lib/browser';
import { TabBarToolbarContribution, TabBarToolbarRegistry } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { TERMINAL_WIDGET_FACTORY_ID, TerminalWidgetFactoryOptions, TerminalWidgetImpl } from './terminal-widget-impl';
import { TerminalService } from './base/terminal-service';
import { TerminalWidgetOptions, TerminalWidget, TerminalLocation } from './base/terminal-widget';
import { ContributedTerminalProfileStore, NULL_PROFILE, TerminalProfile, TerminalProfileService, TerminalProfileStore, UserTerminalProfileStore } from './terminal-profile-service';
import { UriAwareCommandHandler } from '@theia/core/lib/common/uri-command-handler';
import { ShellTerminalServerProxy } from '../common/shell-terminal-protocol';
import URI from '@theia/core/lib/common/uri';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { ColorContribution } from '@theia/core/lib/browser/color-application-contribution';
import { ColorRegistry } from '@theia/core/lib/browser/color-registry';
import { terminalAnsiColorMap } from './terminal-theme-service';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileStat } from '@theia/filesystem/lib/common/files';
import { TerminalWatcher } from '../common/terminal-watcher';
import { nls } from '@theia/core/lib/common/nls';
import { Profiles, TerminalPreferences } from './terminal-preferences';
import { ShellTerminalProfile } from './shell-terminal-profile';
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { Color } from '@theia/core/lib/common/color';

export namespace TerminalMenus {
    export const TERMINAL = [...MAIN_MENU_BAR, '7_terminal'];
    export const TERMINAL_NEW = [...TERMINAL, '1_terminal'];

    export const TERMINAL_TASKS = [...TERMINAL, '2_terminal'];
    export const TERMINAL_TASKS_INFO = [...TERMINAL_TASKS, '3_terminal'];
    export const TERMINAL_TASKS_CONFIG = [...TERMINAL_TASKS, '4_terminal'];
    export const TERMINAL_NAVIGATOR_CONTEXT_MENU = ['navigator-context-menu', 'navigation'];
    export const TERMINAL_OPEN_EDITORS_CONTEXT_MENU = ['open-editors-context-menu', 'navigation'];

    export const TERMINAL_CONTEXT_MENU = ['terminal-context-menu'];
    export const TERMINAL_CONTRIBUTIONS = [...TERMINAL_CONTEXT_MENU, '5_terminal_contributions'];

    export const TERMINAL_TITLE_CONTRIBUTIONS = [...SHELL_TABBAR_CONTEXT_MENU, 'terminal_title_contributions'];
}

export namespace TerminalCommands {
    const TERMINAL_CATEGORY = 'Terminal';
    export const NEW = Command.toDefaultLocalizedCommand({
        id: 'terminal:new',
        category: TERMINAL_CATEGORY,
        label: 'Create New Terminal'
    });
    export const PROFILE_NEW = Command.toLocalizedCommand({
        id: 'terminal:new:profile',
        category: TERMINAL_CATEGORY,
        label: 'Create New Integrated Terminal from a Profile'
    });
    export const PROFILE_DEFAULT = Command.toLocalizedCommand({
        id: 'terminal:profile:default',
        category: TERMINAL_CATEGORY,
        label: 'Choose the default Terminal Profile'
    });
    export const NEW_ACTIVE_WORKSPACE = Command.toDefaultLocalizedCommand({
        id: 'terminal:new:active:workspace',
        category: TERMINAL_CATEGORY,
        label: 'Create New Terminal (In Active Workspace)'
    });
    export const TERMINAL_CLEAR = Command.toDefaultLocalizedCommand({
        id: 'terminal:clear',
        category: TERMINAL_CATEGORY,
        label: 'Clear'
    });
    export const TERMINAL_CONTEXT = Command.toDefaultLocalizedCommand({
        id: 'terminal:context',
        category: TERMINAL_CATEGORY,
        label: 'Open in Integrated Terminal'
    });
    export const SPLIT = Command.toDefaultLocalizedCommand({
        id: 'terminal:split',
        category: TERMINAL_CATEGORY,
        label: 'Split Terminal'
    });
    export const TERMINAL_FIND_TEXT = Command.toDefaultLocalizedCommand({
        id: 'terminal:find',
        category: TERMINAL_CATEGORY,
        label: 'Find'
    });
    export const TERMINAL_FIND_TEXT_CANCEL = Command.toDefaultLocalizedCommand({
        id: 'terminal:find:cancel',
        category: TERMINAL_CATEGORY,
        label: 'Hide Find'
    });

    export const SCROLL_LINE_UP = Command.toDefaultLocalizedCommand({
        id: 'terminal:scroll:line:up',
        category: TERMINAL_CATEGORY,
        label: 'Scroll Up (Line)'
    });
    export const SCROLL_LINE_DOWN = Command.toDefaultLocalizedCommand({
        id: 'terminal:scroll:line:down',
        category: TERMINAL_CATEGORY,
        label: 'Scroll Down (Line)'
    });
    export const SCROLL_TO_TOP = Command.toDefaultLocalizedCommand({
        id: 'terminal:scroll:top',
        category: TERMINAL_CATEGORY,
        label: 'Scroll to Top'
    });
    export const SCROLL_PAGE_UP = Command.toDefaultLocalizedCommand({
        id: 'terminal:scroll:page:up',
        category: TERMINAL_CATEGORY,
        label: 'Scroll Up (Page)'
    });
    export const SCROLL_PAGE_DOWN = Command.toDefaultLocalizedCommand({
        id: 'terminal:scroll:page:down',
        category: TERMINAL_CATEGORY,
        label: 'Scroll Down (Page)'
    });
    export const TOGGLE_TERMINAL = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.terminal.toggleTerminal',
        category: TERMINAL_CATEGORY,
        label: 'Toggle Terminal'
    });
    export const KILL_TERMINAL = Command.toDefaultLocalizedCommand({
        id: 'terminal:kill',
        category: TERMINAL_CATEGORY,
        label: 'Kill Terminal'
    });
    export const SELECT_ALL: Command = {
        id: 'terminal:select:all',
        label: CommonCommands.SELECT_ALL.label,
        category: TERMINAL_CATEGORY,
    };

    /**
     * Command that displays all terminals that are currently opened
     */
    export const SHOW_ALL_OPENED_TERMINALS = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.showAllTerminals',
        category: CommonCommands.VIEW_CATEGORY,
        label: 'Show All Opened Terminals'
    });
}

const ENVIRONMENT_VARIABLE_COLLECTIONS_KEY = 'terminal.integrated.environmentVariableCollections';
@injectable()
export class TerminalFrontendContribution implements FrontendApplicationContribution, TerminalService, CommandContribution, MenuContribution,
    KeybindingContribution, TabBarToolbarContribution, ColorContribution {

    @inject(ApplicationShell) protected readonly shell: ApplicationShell;
    @inject(ShellTerminalServerProxy) protected readonly shellTerminalServer: ShellTerminalServerProxy;
    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    @inject(FileService) protected readonly fileService: FileService;
    @inject(SelectionService) protected readonly selectionService: SelectionService;

    @inject(LabelProvider)
    protected readonly labelProvider: LabelProvider;

    @inject(QuickInputService) @optional()
    protected readonly quickInputService: QuickInputService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(TerminalProfileService)
    protected readonly profileService: TerminalProfileService;

    @inject(UserTerminalProfileStore)
    protected readonly userProfileStore: TerminalProfileStore;

    @inject(ContributedTerminalProfileStore)
    protected readonly contributedProfileStore: TerminalProfileStore;

    @inject(TerminalWatcher)
    protected readonly terminalWatcher: TerminalWatcher;

    @inject(VariableResolverService)
    protected readonly variableResolver: VariableResolverService;

    @inject(StorageService)
    protected readonly storageService: StorageService;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    @inject(TerminalPreferences)
    protected terminalPreferences: TerminalPreferences;

    protected mergePreferencesPromise: Promise<void> = Promise.resolve();

    protected readonly onDidCreateTerminalEmitter = new Emitter<TerminalWidget>();
    readonly onDidCreateTerminal: Event<TerminalWidget> = this.onDidCreateTerminalEmitter.event;

    protected readonly onDidChangeCurrentTerminalEmitter = new Emitter<TerminalWidget | undefined>();
    readonly onDidChangeCurrentTerminal: Event<TerminalWidget | undefined> = this.onDidChangeCurrentTerminalEmitter.event;

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    @postConstruct()
    protected init(): void {
        this.shell.onDidChangeCurrentWidget(() => this.updateCurrentTerminal());
        this.widgetManager.onDidCreateWidget(({ widget }) => {
            if (widget instanceof TerminalWidget) {
                this.updateCurrentTerminal();
                this.onDidCreateTerminalEmitter.fire(widget);
                this.setLastUsedTerminal(widget);
            }
        });

        const terminalFocusKey = this.contextKeyService.createKey<boolean>('terminalFocus', false);
        const terminalSearchToggle = this.contextKeyService.createKey<boolean>('terminalHideSearch', false);
        const updateFocusKey = () => {
            terminalFocusKey.set(this.shell.activeWidget instanceof TerminalWidget);
            terminalSearchToggle.set(this.terminalHideSearch);
        };
        updateFocusKey();
        this.shell.onDidChangeActiveWidget(updateFocusKey);

        this.terminalWatcher.onStoreTerminalEnvVariablesRequested(data => {
            this.storageService.setData(ENVIRONMENT_VARIABLE_COLLECTIONS_KEY, data);
        });
        this.terminalWatcher.onUpdateTerminalEnvVariablesRequested(() => {
            this.storageService.getData<string>(ENVIRONMENT_VARIABLE_COLLECTIONS_KEY).then(data => {
                if (data) {
                    this.shellTerminalServer.restorePersisted(data);
                }
            });
        });
    }

    get terminalHideSearch(): boolean {
        if (!(this.shell.activeWidget instanceof TerminalWidget)) {
            return false;
        }
        const searchWidget = this.shell.activeWidget.getSearchBox();
        return searchWidget.isVisible;
    }

    async onStart(app: FrontendApplication): Promise<void> {
        this.contributeDefaultProfiles();

        this.terminalPreferences.onPreferenceChanged(e => {
            if (e.preferenceName.startsWith('terminal.integrated.')) {
                this.mergePreferencesPromise = this.mergePreferencesPromise.finally(() => this.mergePreferences());
            }
        });
        this.mergePreferencesPromise = this.mergePreferencesPromise.finally(() => this.mergePreferences());

        // extension contributions get read after this point: need to set the default profile if necessary
        this.profileService.onAdded(id => {
            let defaultProfileId: string | undefined;
            switch (OS.backend.type()) {
                case OS.Type.Windows: {
                    defaultProfileId = this.terminalPreferences['terminal.integrated.defaultProfile.windows'];
                    break;
                }
                case OS.Type.Linux: {
                    defaultProfileId = this.terminalPreferences['terminal.integrated.defaultProfile.linux'];
                    break;
                }
                case OS.Type.OSX: {
                    defaultProfileId = this.terminalPreferences['terminal.integrated.defaultProfile.osx'];
                    break;
                }
            }
            if (defaultProfileId) {
                this.profileService.setDefaultProfile(defaultProfileId);
            }
        });
    }

    async contributeDefaultProfiles(): Promise<void> {
        if (OS.backend.isWindows) {
            this.contributedProfileStore.registerTerminalProfile('cmd', new ShellTerminalProfile(this, {
                shellPath: await this.resolveShellPath([
                    '${env:windir}\\Sysnative\\cmd.exe',
                    '${env:windir}\\System32\\cmd.exe'
                ])!
            }));
        } else {
            this.contributedProfileStore.registerTerminalProfile('SHELL', new ShellTerminalProfile(this, {
                shellPath: await this.resolveShellPath('${SHELL}')!,
                shellArgs: ['-l'],
                iconClass: 'codicon codicon-terminal'
            }));
        }

        // contribute default profiles based on legacy preferences
    }

    protected async mergePreferences(): Promise<void> {
        let profiles: Profiles;
        let defaultProfile: string;
        let legacyShellPath: string | undefined;
        let legacyShellArgs: string[] | undefined;
        const removed = new Set(this.userProfileStore.all.map(([id, profile]) => id));
        switch (OS.backend.type()) {
            case OS.Type.Windows: {
                profiles = this.terminalPreferences['terminal.integrated.profiles.windows'];
                defaultProfile = this.terminalPreferences['terminal.integrated.defaultProfile.windows'];
                legacyShellPath = this.terminalPreferences['terminal.integrated.shell.windows'] ?? undefined;
                legacyShellArgs = this.terminalPreferences['terminal.integrated.shellArgs.windows'];
                break;
            }
            case OS.Type.Linux: {
                profiles = this.terminalPreferences['terminal.integrated.profiles.linux'];
                defaultProfile = this.terminalPreferences['terminal.integrated.defaultProfile.linux'];
                legacyShellPath = this.terminalPreferences['terminal.integrated.shell.linux'] ?? undefined;
                legacyShellArgs = this.terminalPreferences['terminal.integrated.shellArgs.linux'];
                break;
            }
            case OS.Type.OSX: {
                profiles = this.terminalPreferences['terminal.integrated.profiles.osx'];
                defaultProfile = this.terminalPreferences['terminal.integrated.defaultProfile.osx'];
                legacyShellPath = this.terminalPreferences['terminal.integrated.shell.osx'] ?? undefined;
                legacyShellArgs = this.terminalPreferences['terminal.integrated.shellArgs.osx'];
                break;
            }
        }
        if (profiles) {
            for (const id of Object.getOwnPropertyNames(profiles)) {
                const profile = profiles[id];
                removed.delete(id);
                if (profile) {
                    const shellPath = await this.resolveShellPath(profile.path);

                    if (shellPath) {
                        const options: TerminalWidgetOptions = {
                            shellPath: shellPath,
                            shellArgs: profile.args ? await this.variableResolver.resolve(profile.args) : undefined,
                            useServerTitle: profile.overrideName ? false : undefined,
                            env: profile.env ? await this.variableResolver.resolve(profile.env) : undefined,
                            title: profile.overrideName ? id : undefined
                        };

                        this.userProfileStore.registerTerminalProfile(id, new ShellTerminalProfile(this, options));
                    }
                } else {
                    this.userProfileStore.registerTerminalProfile(id, NULL_PROFILE);
                }
            }
        }

        if (legacyShellPath) {
            this.userProfileStore.registerTerminalProfile('Legacy Shell Preferences', new ShellTerminalProfile(this, {
                shellPath: legacyShellPath!,
                shellArgs: legacyShellArgs
            }));
            // if no other default is set, use the legacy preferences as default if they exist
            this.profileService.setDefaultProfile('Legacy Shell Preferences');
        }

        if (defaultProfile && this.profileService.getProfile(defaultProfile)) {
            this.profileService.setDefaultProfile(defaultProfile);
        }

        for (const id of removed) {
            this.userProfileStore.unregisterTerminalProfile(id);
        }
    }

    protected async resolveShellPath(path: string | string[] | undefined): Promise<string | undefined> {
        if (!path) {
            return undefined;
        }
        if (typeof path === 'string') {
            path = [path];
        }
        for (const p of path) {
            const resolved = await this.variableResolver.resolve(p);
            if (resolved) {
                const resolvedURI = URI.fromFilePath(resolved);
                if (await this.fileService.exists(resolvedURI)) {
                    return resolved;
                }
            }
        }
        return undefined;
    }

    onWillStop(): OnWillStopAction<number> | undefined {
        const preferenceValue = this.terminalPreferences['terminal.integrated.confirmOnExit'];
        if (preferenceValue !== 'never') {
            const allTerminals = this.widgetManager.getWidgets(TERMINAL_WIDGET_FACTORY_ID) as TerminalWidget[];
            if (allTerminals.length) {
                return {
                    prepare: async () => {
                        if (preferenceValue === 'always') {
                            return allTerminals.length;
                        } else {
                            const activeTerminals = await Promise.all(allTerminals.map(widget => widget.hasChildProcesses()))
                                .then(hasChildProcesses => hasChildProcesses.filter(hasChild => hasChild));
                            return activeTerminals.length;
                        }
                    },
                    action: async activeTerminalCount => activeTerminalCount === 0 || this.confirmExitWithActiveTerminals(activeTerminalCount),
                    reason: 'Active integrated terminal',
                };
            }
        }
    }

    protected async confirmExitWithActiveTerminals(activeTerminalCount: number): Promise<boolean> {
        const msg = activeTerminalCount === 1
            ? nls.localizeByDefault('Do you want to terminate the active terminal session?')
            : nls.localizeByDefault('Do you want to terminate the {0} active terminal sessions?', activeTerminalCount);
        const safeToExit = await new ConfirmDialog({
            title: '',
            msg,
            ok: nls.localizeByDefault('Terminate'),
            cancel: Dialog.CANCEL,
        }).open();
        return safeToExit === true;
    }

    protected _currentTerminal: TerminalWidget | undefined;
    get currentTerminal(): TerminalWidget | undefined {
        return this._currentTerminal;
    }
    protected setCurrentTerminal(current: TerminalWidget | undefined): void {
        if (this._currentTerminal !== current) {
            this._currentTerminal = current;
            this.onDidChangeCurrentTerminalEmitter.fire(this._currentTerminal);
        }
    }
    protected updateCurrentTerminal(): void {
        const widget = this.shell.currentWidget;
        if (widget instanceof TerminalWidget) {
            this.setCurrentTerminal(widget);
        } else if (!this._currentTerminal || !this._currentTerminal.isVisible) {
            this.setCurrentTerminal(undefined);
        }
    }

    // IDs of the most recently used terminals
    protected mostRecentlyUsedTerminalEntries: { id: string, disposables: DisposableCollection }[] = [];

    protected getLastUsedTerminalId(): string | undefined {
        const mostRecent = this.mostRecentlyUsedTerminalEntries[this.mostRecentlyUsedTerminalEntries.length - 1];
        if (mostRecent) {
            return mostRecent.id;
        }
    }

    get lastUsedTerminal(): TerminalWidget | undefined {
        const id = this.getLastUsedTerminalId();
        if (id) {
            return this.getById(id);
        }
    }

    protected setLastUsedTerminal(lastUsedTerminal: TerminalWidget): void {
        const lastUsedTerminalId = lastUsedTerminal.id;
        const entryIndex = this.mostRecentlyUsedTerminalEntries.findIndex(entry => entry.id === lastUsedTerminalId);
        let toDispose: DisposableCollection | undefined;
        if (entryIndex >= 0) {
            toDispose = this.mostRecentlyUsedTerminalEntries[entryIndex].disposables;
            this.mostRecentlyUsedTerminalEntries.splice(entryIndex, 1);
        } else {
            toDispose = new DisposableCollection();
            toDispose.push(
                lastUsedTerminal.onDidChangeVisibility((isVisible: boolean) => {
                    if (isVisible) {
                        this.setLastUsedTerminal(lastUsedTerminal);
                    }
                })
            );
            toDispose.push(
                lastUsedTerminal.onDidDispose(() => {
                    const index = this.mostRecentlyUsedTerminalEntries.findIndex(entry => entry.id === lastUsedTerminalId);
                    if (index >= 0) {
                        this.mostRecentlyUsedTerminalEntries[index].disposables.dispose();
                        this.mostRecentlyUsedTerminalEntries.splice(index, 1);
                    }
                })
            );
        }

        const newEntry = { id: lastUsedTerminalId, disposables: toDispose };
        if (lastUsedTerminal.isVisible) {
            this.mostRecentlyUsedTerminalEntries.push(newEntry);
        } else {
            this.mostRecentlyUsedTerminalEntries = [newEntry, ...this.mostRecentlyUsedTerminalEntries];
        }
    }

    get all(): TerminalWidget[] {
        return this.widgetManager.getWidgets(TERMINAL_WIDGET_FACTORY_ID) as TerminalWidget[];
    }

    getById(id: string): TerminalWidget | undefined {
        return this.all.find(terminal => terminal.id === id);
    }

    getByTerminalId(terminalId: number): TerminalWidget | undefined {
        return this.all.find(terminal => terminal.terminalId === terminalId);
    }

    getDefaultShell(): Promise<string> {
        return this.shellTerminalServer.getDefaultShell();
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(TerminalCommands.NEW, {
            execute: () => this.openTerminal()
        });

        commands.registerCommand(TerminalCommands.PROFILE_NEW, {
            execute: async () => {
                const profile = await this.selectTerminalProfile(nls.localize('theia/terminal/selectProfile', 'Select a profile for the new terminal'));
                if (!profile) {
                    return;
                }
                this.openTerminal(undefined, profile[1]);
            }
        });

        commands.registerCommand(TerminalCommands.PROFILE_DEFAULT, {
            execute: () => this.chooseDefaultProfile()
        });

        commands.registerCommand(TerminalCommands.NEW_ACTIVE_WORKSPACE, {
            execute: () => this.openActiveWorkspaceTerminal()
        });
        commands.registerCommand(TerminalCommands.SPLIT, {
            execute: () => this.splitTerminal(),
            isEnabled: w => this.withWidget(w, () => true),
            isVisible: w => this.withWidget(w, () => true),
        });
        commands.registerCommand(TerminalCommands.TERMINAL_CLEAR);
        commands.registerHandler(TerminalCommands.TERMINAL_CLEAR.id, {
            execute: () => this.currentTerminal?.clearOutput()
        });
        commands.registerCommand(TerminalCommands.TERMINAL_CONTEXT, UriAwareCommandHandler.MonoSelect(this.selectionService, {
            execute: uri => this.openInTerminal(uri)
        }));
        commands.registerCommand(TerminalCommands.TERMINAL_FIND_TEXT);
        commands.registerHandler(TerminalCommands.TERMINAL_FIND_TEXT.id, {
            isEnabled: () => {
                if (this.shell.activeWidget instanceof TerminalWidget) {
                    return !this.shell.activeWidget.getSearchBox().isVisible;
                }
                return false;
            },
            execute: () => {
                const termWidget = (this.shell.activeWidget as TerminalWidget);
                const terminalSearchBox = termWidget.getSearchBox();
                terminalSearchBox.show();
            }
        });
        commands.registerCommand(TerminalCommands.TERMINAL_FIND_TEXT_CANCEL);
        commands.registerHandler(TerminalCommands.TERMINAL_FIND_TEXT_CANCEL.id, {
            isEnabled: () => {
                if (this.shell.activeWidget instanceof TerminalWidget) {
                    return this.shell.activeWidget.getSearchBox().isVisible;
                }
                return false;
            },
            execute: () => {
                const termWidget = (this.shell.activeWidget as TerminalWidget);
                const terminalSearchBox = termWidget.getSearchBox();
                terminalSearchBox.hide();
            }
        });
        commands.registerCommand(TerminalCommands.SCROLL_LINE_UP, {
            isEnabled: () => this.shell.activeWidget instanceof TerminalWidget,
            isVisible: () => false,
            execute: () => {
                (this.shell.activeWidget as TerminalWidget).scrollLineUp();
            }
        });
        commands.registerCommand(TerminalCommands.SCROLL_LINE_DOWN, {
            isEnabled: () => this.shell.activeWidget instanceof TerminalWidget,
            isVisible: () => false,
            execute: () => {
                (this.shell.activeWidget as TerminalWidget).scrollLineDown();
            }
        });
        commands.registerCommand(TerminalCommands.SCROLL_TO_TOP, {
            isEnabled: () => this.shell.activeWidget instanceof TerminalWidget,
            isVisible: () => false,
            execute: () => {
                (this.shell.activeWidget as TerminalWidget).scrollToTop();
            }
        });
        commands.registerCommand(TerminalCommands.SCROLL_PAGE_UP, {
            isEnabled: () => this.shell.activeWidget instanceof TerminalWidget,
            isVisible: () => false,
            execute: () => {
                (this.shell.activeWidget as TerminalWidget).scrollPageUp();
            }
        });
        commands.registerCommand(TerminalCommands.SCROLL_PAGE_DOWN, {
            isEnabled: () => this.shell.activeWidget instanceof TerminalWidget,
            isVisible: () => false,
            execute: () => {
                (this.shell.activeWidget as TerminalWidget).scrollPageDown();
            }
        });
        commands.registerCommand(TerminalCommands.TOGGLE_TERMINAL, {
            execute: () => this.toggleTerminal()
        });
        commands.registerCommand(TerminalCommands.KILL_TERMINAL, {
            isEnabled: () => !!this.currentTerminal,
            execute: () => this.currentTerminal?.close()
        });
        commands.registerCommand(TerminalCommands.SELECT_ALL, {
            isEnabled: () => !!this.currentTerminal,
            execute: () => this.currentTerminal?.selectAll()
        });
    }

    protected toggleTerminal(): void {
        const terminals = this.shell.getWidgets('bottom').filter(w => w instanceof TerminalWidget);

        if (terminals.length === 0) {
            this.openTerminal();
            return;
        }

        if (!this.shell.isExpanded('bottom')) {
            this.shell.expandPanel('bottom');
            terminals[0].activate();
        } else {
            const visibleTerminal = terminals.find(t => t.isVisible);
            if (!visibleTerminal) {
                this.shell.bottomPanel.activateWidget(terminals[0]);
            } else if (this.shell.activeWidget !== visibleTerminal) {
                this.shell.bottomPanel.activateWidget(visibleTerminal);
            } else {
                this.shell.collapsePanel('bottom');
            }
        }

    }

    async openInTerminal(uri: URI): Promise<void> {
        // Determine folder path of URI
        let stat: FileStat;
        try {
            stat = await this.fileService.resolve(uri);
        } catch {
            return;
        }

        // Use folder if a file was selected
        const cwd = (stat.isDirectory) ? uri.toString() : uri.parent.toString();

        // Open terminal
        const termWidget = await this.newTerminal({ cwd });
        termWidget.start();
        this.open(termWidget);
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerSubmenu(TerminalMenus.TERMINAL, TerminalWidgetImpl.LABEL);
        menus.registerMenuAction(TerminalMenus.TERMINAL_NEW, {
            commandId: TerminalCommands.NEW.id,
            label: nls.localizeByDefault('New Terminal'),
            order: '0'
        });
        menus.registerMenuAction(TerminalMenus.TERMINAL_NEW, {
            commandId: TerminalCommands.PROFILE_NEW.id,
            label: nls.localize('theia/terminal/profileNew', 'New Terminal (With Profile)...'),
            order: '1'
        });

        menus.registerMenuAction(TerminalMenus.TERMINAL_NEW, {
            commandId: TerminalCommands.PROFILE_DEFAULT.id,
            label: nls.localize('theia/terminal/profileDefault', 'Choose Default Profile...'),
            order: '3'
        });
        menus.registerMenuAction(TerminalMenus.TERMINAL_NEW, {
            commandId: TerminalCommands.SPLIT.id,
            order: '3'
        });
        menus.registerMenuAction(TerminalMenus.TERMINAL_NAVIGATOR_CONTEXT_MENU, {
            commandId: TerminalCommands.TERMINAL_CONTEXT.id,
            order: 'z'
        });
        menus.registerMenuAction(TerminalMenus.TERMINAL_OPEN_EDITORS_CONTEXT_MENU, {
            commandId: TerminalCommands.TERMINAL_CONTEXT.id,
            order: 'z'
        });

        menus.registerMenuAction([...TerminalMenus.TERMINAL_CONTEXT_MENU, '_1'], {
            commandId: TerminalCommands.NEW_ACTIVE_WORKSPACE.id,
            label: nls.localizeByDefault('New Terminal')
        });
        menus.registerMenuAction([...TerminalMenus.TERMINAL_CONTEXT_MENU, '_1'], {
            commandId: TerminalCommands.SPLIT.id
        });
        menus.registerMenuAction([...TerminalMenus.TERMINAL_CONTEXT_MENU, '_2'], {
            commandId: CommonCommands.COPY.id
        });
        menus.registerMenuAction([...TerminalMenus.TERMINAL_CONTEXT_MENU, '_2'], {
            commandId: CommonCommands.PASTE.id
        });
        menus.registerMenuAction([...TerminalMenus.TERMINAL_CONTEXT_MENU, '_2'], {
            commandId: TerminalCommands.SELECT_ALL.id
        });
        menus.registerMenuAction([...TerminalMenus.TERMINAL_CONTEXT_MENU, '_3'], {
            commandId: TerminalCommands.TERMINAL_CLEAR.id
        });
        menus.registerMenuAction([...TerminalMenus.TERMINAL_CONTEXT_MENU, '_4'], {
            commandId: TerminalCommands.KILL_TERMINAL.id
        });

        menus.registerSubmenu(TerminalMenus.TERMINAL_CONTRIBUTIONS, '');

        menus.registerSubmenu(TerminalMenus.TERMINAL_TITLE_CONTRIBUTIONS, '', undefined, undefined, 'isTerminalTab');
    }

    registerToolbarItems(toolbar: TabBarToolbarRegistry): void {
        toolbar.registerItem({
            id: TerminalCommands.SPLIT.id,
            command: TerminalCommands.SPLIT.id,
            icon: codicon('split-horizontal'),
            tooltip: TerminalCommands.SPLIT.label
        });
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        /* Register passthrough keybindings for combinations recognized by
           xterm.js and converted to control characters.
             See: https://github.com/xtermjs/xterm.js/blob/v3/src/Terminal.ts#L1684 */

        /* Register ctrl + k (the passed Key) as a passthrough command in the
           context of the terminal.  */
        const regCtrl = (k: { keyCode: number, code: string }) => {
            keybindings.registerKeybinding({
                command: KeybindingRegistry.PASSTHROUGH_PSEUDO_COMMAND,
                keybinding: KeyCode.createKeyCode({ key: k, ctrl: true }).toString(),
                when: 'terminalFocus',
            });
        };

        /* Register alt + k (the passed Key) as a passthrough command in the
           context of the terminal.  */
        const regAlt = (k: { keyCode: number, code: string }) => {
            keybindings.registerKeybinding({
                command: KeybindingRegistry.PASSTHROUGH_PSEUDO_COMMAND,
                keybinding: KeyCode.createKeyCode({ key: k, alt: true }).toString(),
                when: 'terminalFocus'
            });
        };

        /* ctrl-space (000 - NUL).  */
        regCtrl(Key.SPACE);

        /* ctrl-A (001/1/0x1) through ctrl-Z (032/26/0x1A).  */
        for (let i = 0; i < 26; i++) {
            regCtrl({
                keyCode: Key.KEY_A.keyCode + i,
                code: 'Key' + String.fromCharCode('A'.charCodeAt(0) + i)
            });
        }

        /* ctrl-[ or ctrl-3 (033/27/0x1B - ESC).  */
        regCtrl(Key.BRACKET_LEFT);
        regCtrl(Key.DIGIT3);

        /* ctrl-\ or ctrl-4 (034/28/0x1C - FS).  */
        regCtrl(Key.BACKSLASH);
        regCtrl(Key.DIGIT4);

        /* ctrl-] or ctrl-5 (035/29/0x1D - GS).  */
        regCtrl(Key.BRACKET_RIGHT);
        regCtrl(Key.DIGIT5);

        /* ctrl-6 (036/30/0x1E - RS).  */
        regCtrl(Key.DIGIT6);

        /* ctrl-7 (037/31/0x1F - US).  */
        regCtrl(Key.DIGIT7);

        /* ctrl-8 (177/127/0x7F - DEL).  */
        regCtrl(Key.DIGIT8);

        /* alt-A (0x1B 0x62) through alt-Z (0x1B 0x7A).  */
        for (let i = 0; i < 26; i++) {
            regAlt({
                keyCode: Key.KEY_A.keyCode + i,
                code: 'Key' + String.fromCharCode('A'.charCodeAt(0) + i)
            });
        }

        /* alt-` (0x1B 0x60).  */
        regAlt(Key.BACKQUOTE);

        /* alt-0 (0x1B 0x30) through alt-9 (0x1B 0x39).  */
        for (let i = 0; i < 10; i++) {
            regAlt({
                keyCode: Key.DIGIT0.keyCode + i,
                code: 'Digit' + String.fromCharCode('0'.charCodeAt(0) + i)
            });
        }
        if (isOSX) {
            // selectAll on OSX
            keybindings.registerKeybinding({
                command: KeybindingRegistry.PASSTHROUGH_PSEUDO_COMMAND,
                keybinding: 'ctrlcmd+a',
                when: 'terminalFocus'
            });
        }

        keybindings.registerKeybinding({
            command: TerminalCommands.NEW.id,
            keybinding: 'ctrl+shift+`'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.NEW_ACTIVE_WORKSPACE.id,
            keybinding: 'ctrl+`'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.TERMINAL_CLEAR.id,
            keybinding: 'ctrlcmd+k',
            when: 'terminalFocus'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.TERMINAL_FIND_TEXT.id,
            keybinding: 'ctrlcmd+f',
            when: 'terminalFocus'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.TERMINAL_FIND_TEXT_CANCEL.id,
            keybinding: 'esc',
            when: 'terminalHideSearch'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.SCROLL_LINE_UP.id,
            keybinding: 'ctrl+shift+up',
            when: 'terminalFocus'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.SCROLL_LINE_DOWN.id,
            keybinding: 'ctrl+shift+down',
            when: 'terminalFocus'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.SCROLL_TO_TOP.id,
            keybinding: 'shift-home',
            when: 'terminalFocus'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.SCROLL_PAGE_UP.id,
            keybinding: 'shift-pageUp',
            when: 'terminalFocus'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.SCROLL_PAGE_DOWN.id,
            keybinding: 'shift-pageDown',
            when: 'terminalFocus'
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.TOGGLE_TERMINAL.id,
            keybinding: 'ctrl+`',
        });
        keybindings.registerKeybinding({
            command: TerminalCommands.SELECT_ALL.id,
            keybinding: 'ctrlcmd+a',
            when: 'terminalFocus'
        });
    }

    async newTerminal(options: TerminalWidgetOptions): Promise<TerminalWidget> {
        const widget = <TerminalWidget>await this.widgetManager.getOrCreateWidget(TERMINAL_WIDGET_FACTORY_ID, <TerminalWidgetFactoryOptions>{
            created: new Date().toISOString(),
            ...options
        });
        return widget;
    }

    // TODO: reuse WidgetOpenHandler.open
    open(widget: TerminalWidget, options?: WidgetOpenerOptions): void {
        const area = widget.location === TerminalLocation.Editor ? 'main' : 'bottom';
        const widgetOptions: ApplicationShell.WidgetOptions = { area: area, ...options?.widgetOptions };
        let preserveFocus = false;

        if (typeof widget.location === 'object') {
            if ('parentTerminal' in widget.location) {
                widgetOptions.ref = this.getById(widget.location.parentTerminal);
                widgetOptions.mode = 'split-right';
            } else if ('viewColumn' in widget.location) {
                preserveFocus = widget.location.preserveFocus ?? false;
                switch (widget.location.viewColumn) {
                    case ViewColumn.Active:
                        widgetOptions.ref = this.shell.currentWidget;
                        widgetOptions.mode = 'tab-after';
                        break;
                    case ViewColumn.Beside:
                        widgetOptions.ref = this.shell.currentWidget;
                        widgetOptions.mode = 'split-right';
                        break;
                    default:
                        widgetOptions.area = 'main';
                        const mainAreaTerminals = this.shell.getWidgets('main').filter(w => w instanceof TerminalWidget && w.isVisible);
                        const column = Math.min(widget.location.viewColumn, mainAreaTerminals.length);
                        widgetOptions.mode = widget.location.viewColumn <= mainAreaTerminals.length ? 'split-left' : 'split-right';
                        widgetOptions.ref = mainAreaTerminals[column - 1];
                }
            }
        }

        const op: WidgetOpenerOptions = {
            mode: 'activate',
            ...options,
            widgetOptions: widgetOptions
        };
        if (!widget.isAttached) {
            this.shell.addWidget(widget, op.widgetOptions);
        }
        if (op.mode === 'activate' && !preserveFocus) {
            this.shell.activateWidget(widget.id);
        } else if (op.mode === 'reveal' || preserveFocus) {
            this.shell.revealWidget(widget.id);
        }
    }

    protected async selectTerminalCwd(): Promise<string | undefined> {
        return new Promise(async resolve => {
            const roots = this.workspaceService.tryGetRoots();
            if (roots.length === 0) {
                resolve(undefined);
            } else if (roots.length === 1) {
                resolve(roots[0].resource.toString());
            } else {
                const items = roots.map(({ resource }) => ({
                    label: this.labelProvider.getName(resource),
                    description: this.labelProvider.getLongName(resource),
                    resource
                }));
                const selectedItem = await this.quickInputService?.showQuickPick(items, {
                    placeholder: nls.localizeByDefault('Select current working directory for new terminal')
                });
                resolve(selectedItem?.resource?.toString());
            }
        });
    }

    protected async selectTerminalProfile(placeholder: string): Promise<[string, TerminalProfile] | undefined> {
        return new Promise(async resolve => {
            const profiles = this.profileService.all;
            if (profiles.length === 0) {
                resolve(undefined);
            } else {
                const items = profiles.map(([id, profile]) => ({
                    label: id,
                    profile
                }));
                const selectedItem = await this.quickInputService?.showQuickPick(items, {
                    placeholder
                });
                resolve(selectedItem ? [selectedItem.label, selectedItem.profile] : undefined);
            }
        });
    }

    protected async splitTerminal(referenceTerminal?: TerminalWidget): Promise<void> {
        if (referenceTerminal || this.currentTerminal) {
            const ref = referenceTerminal ?? this.currentTerminal;
            await this.openTerminal({ ref, mode: 'split-right' });
        }
    }

    protected async openTerminal(options?: ApplicationShell.WidgetOptions, terminalProfile?: TerminalProfile): Promise<void> {
        let profile = terminalProfile;
        if (!terminalProfile) {
            profile = this.profileService.defaultProfile;
            if (!profile) {
                throw new Error('There are no profiles registered');
            }
        }

        if (profile instanceof ShellTerminalProfile) {
            if (this.workspaceService.workspace) {
                const cwd = await this.selectTerminalCwd();
                if (!cwd) {
                    return;
                }
                profile = profile.modify({ cwd });
            }
        }

        const termWidget = await profile?.start();
        if (!!termWidget) {
            this.open(termWidget, { widgetOptions: options });
        }
    }

    protected async chooseDefaultProfile(): Promise<void> {
        const result = await this.selectTerminalProfile(nls.localizeByDefault('Select your default terminal profile'));
        if (!result) {
            return;
        }

        this.preferenceService.set(`terminal.integrated.defaultProfile.${OS.backend.type().toLowerCase()}`, result[0], PreferenceScope.User);
    }

    protected async openActiveWorkspaceTerminal(options?: ApplicationShell.WidgetOptions): Promise<void> {
        const termWidget = await this.newTerminal({});
        termWidget.start();
        this.open(termWidget, { widgetOptions: options });
    }

    protected withWidget<T>(widget: Widget | undefined, fn: (widget: TerminalWidget) => T): T | false {
        if (widget instanceof TerminalWidget) {
            return fn(widget);
        }
        return false;
    }

    /**
     * It should be aligned with https://code.visualstudio.com/api/references/theme-color#integrated-terminal-colors
     */
    registerColors(colors: ColorRegistry): void {
        colors.register({
            id: 'terminal.background',
            defaults: {
                dark: 'panel.background',
                light: 'panel.background',
                hcDark: 'panel.background',
                hcLight: 'panel.background'
            },
            description: 'The background color of the terminal, this allows coloring the terminal differently to the panel.'
        });
        colors.register({
            id: 'terminal.foreground',
            defaults: {
                light: '#333333',
                dark: '#CCCCCC',
                hcDark: '#FFFFFF',
                hcLight: '#292929'
            },
            description: 'The foreground color of the terminal.'
        });
        colors.register({
            id: 'terminalCursor.foreground',
            description: 'The foreground color of the terminal cursor.'
        });
        colors.register({
            id: 'terminalCursor.background',
            description: 'The background color of the terminal cursor. Allows customizing the color of a character overlapped by a block cursor.'
        });
        colors.register({
            id: 'terminal.selectionBackground',
            defaults: {
                light: 'editor.selectionBackground',
                dark: 'editor.selectionBackground',
                hcDark: 'editor.selectionBackground',
                hcLight: 'editor.selectionBackground'
            },
            description: 'The selection background color of the terminal.'
        });
        colors.register({
            id: 'terminal.inactiveSelectionBackground',
            defaults: {
                light: Color.transparent('terminal.selectionBackground', 0.5),
                dark: Color.transparent('terminal.selectionBackground', 0.5),
                hcDark: Color.transparent('terminal.selectionBackground', 0.7),
                hcLight: Color.transparent('terminal.selectionBackground', 0.5),
            },
            description: 'The selection background color of the terminal when it does not have focus.'
        });
        colors.register({
            id: 'terminal.selectionForeground',
            defaults: {
                light: undefined,
                dark: undefined,
                hcDark: '#000000',
                hcLight: '#ffffff'
            },
            // eslint-disable-next-line max-len
            description: 'The selection foreground color of the terminal. When this is null the selection foreground will be retained and have the minimum contrast ratio feature applied.'
        });
        colors.register({
            id: 'terminal.border',
            defaults: {
                light: 'panel.border',
                dark: 'panel.border',
                hcDark: 'panel.border',
                hcLight: 'panel.border'
            },
            description: 'The color of the border that separates split panes within the terminal. This defaults to panel.border.'
        });
        // eslint-disable-next-line guard-for-in
        for (const id in terminalAnsiColorMap) {
            const entry = terminalAnsiColorMap[id];
            const colorName = id.substring(13);
            colors.register({
                id,
                defaults: entry.defaults,
                description: `'${colorName}'  ANSI color in the terminal.`
            });
        }
    }
}
