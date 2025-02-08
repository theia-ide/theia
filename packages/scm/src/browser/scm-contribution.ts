// *****************************************************************************
// Copyright (C) 2019 Red Hat, Inc. and others.
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
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { Emitter } from '@theia/core/lib/common/event';
import {
    AbstractViewContribution,
    FrontendApplicationContribution, LabelProvider,
    StatusBar,
    StatusBarAlignment,
    StatusBarEntry,
    KeybindingRegistry,
    ViewContainerTitleOptions,
    codicon,
    StylingParticipant,
    ColorTheme,
    CssStyleCollector
} from '@theia/core/lib/browser';
import { TabBarToolbarContribution, TabBarToolbarRegistry, TabBarToolbarAction } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { CommandRegistry, Command, Disposable, DisposableCollection, CommandService, MenuModelRegistry } from '@theia/core/lib/common';
import { ContextKeyService, ContextKey } from '@theia/core/lib/browser/context-key-service';
import { ScmService } from './scm-service';
import { ScmWidget } from '../browser/scm-widget';
import URI from '@theia/core/lib/common/uri';
import { ScmQuickOpenService } from './scm-quick-open-service';
import { ColorContribution } from '@theia/core/lib/browser/color-application-contribution';
import { ColorRegistry } from '@theia/core/lib/browser/color-registry';
import { Color } from '@theia/core/lib/common/color';
import { ScmColors } from './scm-colors';
import { ScmCommand } from './scm-provider';
import { ScmDecorationsService } from '../browser/decorations/scm-decorations-service';
import { nls } from '@theia/core/lib/common/nls';
import { isHighContrast } from '@theia/core/lib/common/theme';
import { EditorMainMenu } from '@theia/editor/lib/browser';
import { DirtyDiffNavigator } from './dirty-diff/dirty-diff-navigator';

export const SCM_WIDGET_FACTORY_ID = ScmWidget.ID;
export const SCM_VIEW_CONTAINER_ID = 'scm-view-container';
export const SCM_VIEW_CONTAINER_TITLE_OPTIONS: ViewContainerTitleOptions = {
    label: nls.localizeByDefault('Source Control'),
    iconClass: codicon('source-control'),
    closeable: true
};

export namespace ScmMenus {
    export const CHANGES_GROUP = [...EditorMainMenu.GO, '6_changes_group'];
}

export namespace SCM_COMMANDS {
    export const CHANGE_REPOSITORY = {
        id: 'scm.change.repository',
        category: nls.localizeByDefault('Source Control'),
        originalCategory: 'Source Control',
        label: nls.localize('theia/scm/changeRepository', 'Change Repository...'),
        originalLabel: 'Change Repository...'
    };
    export const ACCEPT_INPUT = {
        id: 'scm.acceptInput'
    };
    export const TREE_VIEW_MODE = {
        id: 'scm.viewmode.tree',
        tooltip: nls.localizeByDefault('View as Tree'),
        iconClass: codicon('list-tree'),
        originalLabel: 'View as Tree',
        label: nls.localizeByDefault('View as Tree')
    };
    export const LIST_VIEW_MODE = {
        id: 'scm.viewmode.list',
        tooltip: nls.localizeByDefault('View as List'),
        iconClass: codicon('list-flat'),
        originalLabel: 'View as List',
        label: nls.localizeByDefault('View as List')
    };
    export const COLLAPSE_ALL = {
        id: 'scm.collapseAll',
        category: nls.localizeByDefault('Source Control'),
        originalCategory: 'Source Control',
        tooltip: nls.localizeByDefault('Collapse All'),
        iconClass: codicon('collapse-all'),
        label: nls.localizeByDefault('Collapse All'),
        originalLabel: 'Collapse All'
    };
    export const GOTO_NEXT_CHANGE = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.editor.nextChange',
        category: 'Source Control',
        label: 'Go to Next Change'
    });
    export const GOTO_PREVIOUS_CHANGE = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.editor.previousChange',
        category: 'Source Control',
        label: 'Go to Previous Change'
    });
    export const SHOW_NEXT_CHANGE = Command.toDefaultLocalizedCommand({
        id: 'editor.action.dirtydiff.next',
        category: 'Source Control',
        label: 'Show Next Change'
    });
    export const SHOW_PREVIOUS_CHANGE = Command.toDefaultLocalizedCommand({
        id: 'editor.action.dirtydiff.previous',
        category: 'Source Control',
        label: 'Show Previous Change'
    });
    export const CLOSE_CHANGE_PEEK_VIEW = {
        id: 'editor.action.dirtydiff.close',
        category: nls.localizeByDefault('Source Control'),
        originalCategory: 'Source Control',
        label: nls.localize('theia/scm/dirtyDiff/close', 'Close Change Peek View'),
        originalLabel: 'Close Change Peek View'
    };
}

export { ScmColors };

@injectable()
export class ScmContribution extends AbstractViewContribution<ScmWidget> implements
    FrontendApplicationContribution,
    TabBarToolbarContribution,
    ColorContribution,
    StylingParticipant {

    @inject(StatusBar) protected readonly statusBar: StatusBar;
    @inject(ScmService) protected readonly scmService: ScmService;
    @inject(ScmQuickOpenService) protected readonly scmQuickOpenService: ScmQuickOpenService;
    @inject(LabelProvider) protected readonly labelProvider: LabelProvider;
    @inject(CommandService) protected readonly commands: CommandService;
    @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry;
    @inject(ContextKeyService) protected readonly contextKeys: ContextKeyService;
    @inject(ScmDecorationsService) protected readonly scmDecorationsService: ScmDecorationsService;
    @inject(DirtyDiffNavigator) protected readonly dirtyDiffNavigator: DirtyDiffNavigator;

    protected scmFocus: ContextKey<boolean>;

    constructor() {
        super({
            viewContainerId: SCM_VIEW_CONTAINER_ID,
            widgetId: SCM_WIDGET_FACTORY_ID,
            widgetName: SCM_VIEW_CONTAINER_TITLE_OPTIONS.label,
            defaultWidgetOptions: {
                area: 'left',
                rank: 300
            },
            toggleCommandId: 'scmView:toggle',
            toggleKeybinding: 'ctrlcmd+shift+g'
        });
    }

    @postConstruct()
    protected init(): void {
        this.scmFocus = this.contextKeys.createKey('scmFocus', false);
    }

    async initializeLayout(): Promise<void> {
        await this.openView();
    }

    onStart(): void {
        this.updateStatusBar();
        this.scmService.onDidAddRepository(() => this.updateStatusBar());
        this.scmService.onDidRemoveRepository(() => this.updateStatusBar());
        this.scmService.onDidChangeSelectedRepository(() => this.updateStatusBar());
        this.scmService.onDidChangeStatusBarCommands(() => this.updateStatusBar());
        this.labelProvider.onDidChange(() => this.updateStatusBar());

        this.updateContextKeys();
        this.shell.onDidChangeCurrentWidget(() => this.updateContextKeys());

        this.scmDecorationsService.onDirtyDiffUpdate(update => this.dirtyDiffNavigator.handleDirtyDiffUpdate(update));
    }

    protected updateContextKeys(): void {
        this.scmFocus.set(this.shell.currentWidget instanceof ScmWidget);
    }

    override registerCommands(commandRegistry: CommandRegistry): void {
        super.registerCommands(commandRegistry);
        commandRegistry.registerCommand(SCM_COMMANDS.CHANGE_REPOSITORY, {
            execute: () => this.scmQuickOpenService.changeRepository(),
            isEnabled: () => this.scmService.repositories.length > 1
        });
        commandRegistry.registerCommand(SCM_COMMANDS.ACCEPT_INPUT, {
            execute: () => this.acceptInput(),
            isEnabled: () => !!this.scmFocus.get() && !!this.acceptInputCommand()
        });

        // Note that commands for dirty diff navigation need to be always available.
        // This is consistent with behavior in VS Code, and also with other similar commands (such as `Next Problem/Previous Problem`) in Theia.
        // See https://github.com/eclipse-theia/theia/pull/13104#discussion_r1497316614 for a detailed discussion.
        commandRegistry.registerCommand(SCM_COMMANDS.GOTO_NEXT_CHANGE, {
            execute: () => this.dirtyDiffNavigator.gotoNextChange()
        });
        commandRegistry.registerCommand(SCM_COMMANDS.GOTO_PREVIOUS_CHANGE, {
            execute: () => this.dirtyDiffNavigator.gotoPreviousChange()
        });
        commandRegistry.registerCommand(SCM_COMMANDS.SHOW_NEXT_CHANGE, {
            execute: () => this.dirtyDiffNavigator.showNextChange()
        });
        commandRegistry.registerCommand(SCM_COMMANDS.SHOW_PREVIOUS_CHANGE, {
            execute: () => this.dirtyDiffNavigator.showPreviousChange()
        });
        commandRegistry.registerCommand(SCM_COMMANDS.CLOSE_CHANGE_PEEK_VIEW, {
            execute: () => this.dirtyDiffNavigator.closeChangePeekView()
        });
    }

    override registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
        menus.registerMenuAction(ScmMenus.CHANGES_GROUP, {
            commandId: SCM_COMMANDS.SHOW_NEXT_CHANGE.id,
            label: nls.localizeByDefault('Next Change'),
            order: '1'
        });
        menus.registerMenuAction(ScmMenus.CHANGES_GROUP, {
            commandId: SCM_COMMANDS.SHOW_PREVIOUS_CHANGE.id,
            label: nls.localizeByDefault('Previous Change'),
            order: '2'
        });
    }

    registerToolbarItems(registry: TabBarToolbarRegistry): void {
        const viewModeEmitter = new Emitter<void>();
        const registerToggleViewItem = (command: Command, mode: 'tree' | 'list') => {
            const id = command.id;
            const item: TabBarToolbarAction = {
                id,
                command: id,
                tooltip: command.label,
                onDidChange: viewModeEmitter.event
            };
            this.commandRegistry.registerCommand({ id, iconClass: command && command.iconClass }, {
                execute: widget => {
                    if (widget instanceof ScmWidget) {
                        widget.viewMode = mode;
                        viewModeEmitter.fire();
                    }
                },
                isVisible: widget => {
                    if (widget instanceof ScmWidget) {
                        return !!this.scmService.selectedRepository
                            && widget.viewMode !== mode;
                    }
                    return false;
                },
            });
            registry.registerItem(item);
        };
        registerToggleViewItem(SCM_COMMANDS.TREE_VIEW_MODE, 'tree');
        registerToggleViewItem(SCM_COMMANDS.LIST_VIEW_MODE, 'list');

        this.commandRegistry.registerCommand(SCM_COMMANDS.COLLAPSE_ALL, {
            execute: widget => {
                if (widget instanceof ScmWidget && widget.viewMode === 'tree') {
                    widget.collapseScmTree();
                }
            },
            isVisible: widget => {
                if (widget instanceof ScmWidget) {
                    return !!this.scmService.selectedRepository && widget.viewMode === 'tree';
                }
                return false;
            }
        });

        registry.registerItem({
            ...SCM_COMMANDS.COLLAPSE_ALL,
            command: SCM_COMMANDS.COLLAPSE_ALL.id
        });
    }

    override registerKeybindings(keybindings: KeybindingRegistry): void {
        super.registerKeybindings(keybindings);
        keybindings.registerKeybinding({
            command: SCM_COMMANDS.ACCEPT_INPUT.id,
            keybinding: 'ctrlcmd+enter',
            when: 'scmFocus'
        });
        keybindings.registerKeybinding({
            command: SCM_COMMANDS.GOTO_NEXT_CHANGE.id,
            keybinding: 'alt+f5',
            when: 'editorTextFocus'
        });
        keybindings.registerKeybinding({
            command: SCM_COMMANDS.GOTO_PREVIOUS_CHANGE.id,
            keybinding: 'shift+alt+f5',
            when: 'editorTextFocus'
        });
        keybindings.registerKeybinding({
            command: SCM_COMMANDS.SHOW_NEXT_CHANGE.id,
            keybinding: 'alt+f3',
            when: 'editorTextFocus'
        });
        keybindings.registerKeybinding({
            command: SCM_COMMANDS.SHOW_PREVIOUS_CHANGE.id,
            keybinding: 'shift+alt+f3',
            when: 'editorTextFocus'
        });
        keybindings.registerKeybinding({
            command: SCM_COMMANDS.CLOSE_CHANGE_PEEK_VIEW.id,
            keybinding: 'esc',
            when: 'dirtyDiffVisible'
        });
    }

    protected async acceptInput(): Promise<void> {
        const command = this.acceptInputCommand();
        if (command && command.command) {
            await this.commands.executeCommand(command.command, ...command.arguments ? command.arguments : []);
        }
    }
    protected acceptInputCommand(): ScmCommand | undefined {
        const repository = this.scmService.selectedRepository;
        if (!repository) {
            return undefined;
        }
        return repository.provider.acceptInputCommand;
    }

    protected readonly statusBarDisposable = new DisposableCollection();
    protected updateStatusBar(): void {
        this.statusBarDisposable.dispose();
        const repository = this.scmService.selectedRepository;
        if (!repository) {
            return;
        }
        const name = this.labelProvider.getName(new URI(repository.provider.rootUri));
        if (this.scmService.repositories.length > 1) {
            this.setStatusBarEntry(SCM_COMMANDS.CHANGE_REPOSITORY.id, {
                text: `$(database) ${name}`,
                tooltip: name.toString(),
                command: SCM_COMMANDS.CHANGE_REPOSITORY.id,
                alignment: StatusBarAlignment.LEFT,
                priority: 100
            });
        }
        const label = repository.provider.rootUri ? `${name} (${repository.provider.label})` : repository.provider.label;
        this.scmService.statusBarCommands.forEach((value, index) => this.setStatusBarEntry(`scm.status.${index}`, {
            text: value.title,
            tooltip: label + (value.tooltip ? ` - ${value.tooltip}` : ''),
            command: value.command,
            arguments: value.arguments,
            alignment: StatusBarAlignment.LEFT,
            priority: 100
        }));
    }
    protected setStatusBarEntry(id: string, entry: StatusBarEntry): void {
        this.statusBar.setElement(id, entry);
        this.statusBarDisposable.push(Disposable.create(() => this.statusBar.removeElement(id)));
    }

    /**
     * It should be aligned with https://github.com/microsoft/vscode/blob/0dfa355b3ad185a6289ba28a99c141ab9e72d2be/src/vs/workbench/contrib/scm/browser/dirtydiffDecorator.ts#L808
     */
    registerColors(colors: ColorRegistry): void {
        colors.register(
            {
                id: ScmColors.editorGutterModifiedBackground, defaults: {
                    dark: '#1B81A8',
                    light: '#2090D3',
                    hcDark: '#1B81A8',
                    hcLight: '#2090D3'
                }, description: 'Editor gutter background color for lines that are modified.'
            },
            {
                id: ScmColors.editorGutterAddedBackground, defaults: {
                    dark: '#487E02',
                    light: '#48985D',
                    hcDark: '#487E02',
                    hcLight: '#48985D'
                }, description: 'Editor gutter background color for lines that are added.'
            },
            {
                id: ScmColors.editorGutterDeletedBackground, defaults: {
                    dark: 'editorError.foreground',
                    light: 'editorError.foreground',
                    hcDark: 'editorError.foreground',
                    hcLight: 'editorError.foreground'
                }, description: 'Editor gutter background color for lines that are deleted.'
            },
            {
                id: 'minimapGutter.modifiedBackground', defaults: {
                    dark: 'editorGutter.modifiedBackground',
                    light: 'editorGutter.modifiedBackground',
                    hcDark: 'editorGutter.modifiedBackground',
                    hcLight: 'editorGutter.modifiedBackground'
                }, description: 'Minimap gutter background color for lines that are modified.'
            },
            {
                id: 'minimapGutter.addedBackground', defaults: {
                    dark: 'editorGutter.addedBackground',
                    light: 'editorGutter.addedBackground',
                    hcDark: 'editorGutter.modifiedBackground',
                    hcLight: 'editorGutter.modifiedBackground'
                }, description: 'Minimap gutter background color for lines that are added.'
            },
            {
                id: 'minimapGutter.deletedBackground', defaults: {
                    dark: 'editorGutter.deletedBackground',
                    light: 'editorGutter.deletedBackground',
                    hcDark: 'editorGutter.deletedBackground',
                    hcLight: 'editorGutter.deletedBackground'
                }, description: 'Minimap gutter background color for lines that are deleted.'
            },
            {
                id: 'editorOverviewRuler.modifiedForeground', defaults: {
                    dark: Color.transparent(ScmColors.editorGutterModifiedBackground, 0.6),
                    light: Color.transparent(ScmColors.editorGutterModifiedBackground, 0.6),
                    hcDark: Color.transparent(ScmColors.editorGutterModifiedBackground, 0.6),
                    hcLight: Color.transparent(ScmColors.editorGutterModifiedBackground, 0.6)
                }, description: 'Overview ruler marker color for modified content.'
            },
            {
                id: 'editorOverviewRuler.addedForeground', defaults: {
                    dark: Color.transparent(ScmColors.editorGutterAddedBackground, 0.6),
                    light: Color.transparent(ScmColors.editorGutterAddedBackground, 0.6),
                    hcDark: Color.transparent(ScmColors.editorGutterAddedBackground, 0.6),
                    hcLight: Color.transparent(ScmColors.editorGutterAddedBackground, 0.6)
                }, description: 'Overview ruler marker color for added content.'
            },
            {
                id: 'editorOverviewRuler.deletedForeground', defaults: {
                    dark: Color.transparent(ScmColors.editorGutterDeletedBackground, 0.6),
                    light: Color.transparent(ScmColors.editorGutterDeletedBackground, 0.6),
                    hcDark: Color.transparent(ScmColors.editorGutterDeletedBackground, 0.6),
                    hcLight: Color.transparent(ScmColors.editorGutterDeletedBackground, 0.6)
                }, description: 'Overview ruler marker color for deleted content.'
            }
        );
    }

    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const contrastBorder = theme.getColor('contrastBorder');
        if (contrastBorder && isHighContrast(theme.type)) {
            collector.addRule(`
                .theia-scm-input-message-container textarea {
                    outline: var(--theia-border-width) solid ${contrastBorder};
                    outline-offset: -1px;
                }
            `);
        }
    }
}
