// *****************************************************************************
// Copyright (C) 2017-2018 TypeFox and others.
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
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    CommonCommands,
    CompositeTreeNode,
    FrontendApplication,
    FrontendApplicationContribution,
    KeybindingRegistry,
    OpenerService,
    PreferenceScope,
    PreferenceService,
    SelectableTreeNode,
    Widget,
    NavigatableWidget,
    ApplicationShell,
    TabBar,
    Title,
    SHELL_TABBAR_CONTEXT_MENU,
    OpenWithService
} from '@theia/core/lib/browser';
import { FileDownloadCommands } from '@theia/filesystem/lib/browser/download/file-download-command-contribution';
import {
    CommandRegistry,
    isOSX,
    MenuModelRegistry,
    MenuPath,
    Mutable,
    QuickInputService,
} from '@theia/core/lib/common';
import {
    DidCreateNewResourceEvent,
    WorkspaceCommandContribution,
    WorkspaceCommands,
    WorkspacePreferences,
    WorkspaceService
} from '@theia/workspace/lib/browser';
import { EXPLORER_VIEW_CONTAINER_ID, EXPLORER_VIEW_CONTAINER_TITLE_OPTIONS } from './navigator-widget-factory';
import { FILE_NAVIGATOR_ID, FileNavigatorWidget } from './navigator-widget';
import { FileNavigatorPreferences } from './navigator-preferences';
import { FileNavigatorFilter } from './navigator-filter';
import { WorkspaceNode } from './navigator-tree';
import { NavigatorContextKeyService } from './navigator-context-key-service';
import {
    RenderedToolbarAction,
    TabBarToolbarContribution,
    TabBarToolbarRegistry
} from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { FileSystemCommands } from '@theia/filesystem/lib/browser/filesystem-frontend-contribution';
import { NavigatorDiff, NavigatorDiffCommands } from './navigator-diff';
import { DirNode, FileNode } from '@theia/filesystem/lib/browser';
import { FileNavigatorModel } from './navigator-model';
import { ClipboardService } from '@theia/core/lib/browser/clipboard-service';
import { SelectionService } from '@theia/core/lib/common/selection-service';
import { OpenEditorsWidget } from './open-editors-widget/navigator-open-editors-widget';
import { OpenEditorsContextMenu } from './open-editors-widget/navigator-open-editors-menus';
import { OpenEditorsCommands } from './open-editors-widget/navigator-open-editors-commands';
import { nls } from '@theia/core/lib/common/nls';
import URI from '@theia/core/lib/common/uri';
import { UriAwareCommandHandler } from '@theia/core/lib/common/uri-command-handler';
import { FileNavigatorCommands } from './file-navigator-commands';
export { FileNavigatorCommands };

/**
 * Navigator `More Actions...` toolbar item groups.
 * Used in order to group items present in the toolbar.
 */
export namespace NavigatorMoreToolbarGroups {
    export const NEW_OPEN = '1_navigator_new_open';
    export const TOOLS = '2_navigator_tools';
    export const WORKSPACE = '3_navigator_workspace';
}

export const NAVIGATOR_CONTEXT_MENU: MenuPath = ['navigator-context-menu'];
export const SHELL_TABBAR_CONTEXT_REVEAL: MenuPath = [...SHELL_TABBAR_CONTEXT_MENU, '2_reveal'];

/**
 * Navigator context menu default groups should be aligned
 * with VS Code default groups: https://code.visualstudio.com/api/references/contribution-points#contributes.menus
 */
export namespace NavigatorContextMenu {
    export const NAVIGATION = [...NAVIGATOR_CONTEXT_MENU, 'navigation'];
    /** @deprecated use NAVIGATION */
    export const OPEN = NAVIGATION;
    /** @deprecated use NAVIGATION */
    export const NEW = NAVIGATION;

    export const WORKSPACE = [...NAVIGATOR_CONTEXT_MENU, '2_workspace'];

    export const COMPARE = [...NAVIGATOR_CONTEXT_MENU, '3_compare'];
    /** @deprecated use COMPARE */
    export const DIFF = COMPARE;

    export const SEARCH = [...NAVIGATOR_CONTEXT_MENU, '4_search'];
    export const CLIPBOARD = [...NAVIGATOR_CONTEXT_MENU, '5_cutcopypaste'];

    export const MODIFICATION = [...NAVIGATOR_CONTEXT_MENU, '7_modification'];
    /** @deprecated use MODIFICATION */
    export const MOVE = MODIFICATION;
    /** @deprecated use MODIFICATION */
    export const ACTIONS = MODIFICATION;

    /** @deprecated use the `FileNavigatorCommands.OPEN_WITH` command */
    export const OPEN_WITH = [...NAVIGATION, 'open_with'];
}

export const FILE_NAVIGATOR_TOGGLE_COMMAND_ID = 'fileNavigator:toggle';

@injectable()
export class FileNavigatorContribution extends AbstractViewContribution<FileNavigatorWidget> implements FrontendApplicationContribution, TabBarToolbarContribution {

    @inject(ClipboardService)
    protected readonly clipboardService: ClipboardService;

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    @inject(TabBarToolbarRegistry)
    protected readonly tabbarToolbarRegistry: TabBarToolbarRegistry;

    @inject(NavigatorContextKeyService)
    protected readonly contextKeyService: NavigatorContextKeyService;

    @inject(MenuModelRegistry)
    protected readonly menuRegistry: MenuModelRegistry;

    @inject(NavigatorDiff)
    protected readonly navigatorDiff: NavigatorDiff;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    @inject(SelectionService)
    protected readonly selectionService: SelectionService;

    @inject(WorkspaceCommandContribution)
    protected readonly workspaceCommandContribution: WorkspaceCommandContribution;

    @inject(OpenWithService)
    protected readonly openWithService: OpenWithService;

    @inject(QuickInputService) @optional()
    protected readonly quickInputService: QuickInputService;

    constructor(
        @inject(FileNavigatorPreferences) protected readonly fileNavigatorPreferences: FileNavigatorPreferences,
        @inject(OpenerService) protected readonly openerService: OpenerService,
        @inject(FileNavigatorFilter) protected readonly fileNavigatorFilter: FileNavigatorFilter,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(WorkspacePreferences) protected readonly workspacePreferences: WorkspacePreferences
    ) {
        super({
            viewContainerId: EXPLORER_VIEW_CONTAINER_ID,
            widgetId: FILE_NAVIGATOR_ID,
            widgetName: EXPLORER_VIEW_CONTAINER_TITLE_OPTIONS.label,
            defaultWidgetOptions: {
                area: 'left',
                rank: 100
            },
            toggleCommandId: FILE_NAVIGATOR_TOGGLE_COMMAND_ID,
            toggleKeybinding: 'ctrlcmd+shift+e'
        });
    }

    @postConstruct()
    protected init(): void {
        this.doInit();
    }

    protected async doInit(): Promise<void> {
        await this.fileNavigatorPreferences.ready;
        this.shell.onDidChangeCurrentWidget(() => this.onCurrentWidgetChangedHandler());

        const updateFocusContextKeys = () => {
            const hasFocus = this.shell.activeWidget instanceof FileNavigatorWidget;
            this.contextKeyService.explorerViewletFocus.set(hasFocus);
            this.contextKeyService.filesExplorerFocus.set(hasFocus);
        };
        updateFocusContextKeys();
        this.shell.onDidChangeActiveWidget(updateFocusContextKeys);
        this.workspaceCommandContribution.onDidCreateNewFile(async event => this.onDidCreateNewResource(event));
        this.workspaceCommandContribution.onDidCreateNewFolder(async event => this.onDidCreateNewResource(event));
    }

    private async onDidCreateNewResource(event: DidCreateNewResourceEvent): Promise<void> {
        const navigator = this.tryGetWidget();
        if (!navigator || !navigator.isVisible) {
            return;
        }
        const model: FileNavigatorModel = navigator.model;
        const parent = await model.revealFile(event.parent);
        if (DirNode.is(parent)) {
            await model.refresh(parent);
        }
        const node = await model.revealFile(event.uri);
        if (SelectableTreeNode.is(node)) {
            model.selectNode(node);
            if (DirNode.is(node)) {
                this.openView({ activate: true });
            }
        }
    }

    async initializeLayout(app: FrontendApplication): Promise<void> {
        await this.openView();
    }

    override registerCommands(registry: CommandRegistry): void {
        super.registerCommands(registry);
        registry.registerCommand(FileNavigatorCommands.FOCUS, {
            execute: () => this.openView({ activate: true })
        });
        registry.registerCommand(FileNavigatorCommands.REVEAL_IN_NAVIGATOR, UriAwareCommandHandler.MonoSelect(this.selectionService, {
            execute: async uri => {
                if (await this.selectFileNode(uri)) {
                    this.openView({ activate: false, reveal: true });
                }
            },
            isEnabled: uri => !!this.workspaceService.getWorkspaceRootUri(uri),
            isVisible: uri => !!this.workspaceService.getWorkspaceRootUri(uri),
        }));
        registry.registerCommand(FileNavigatorCommands.TOGGLE_HIDDEN_FILES, {
            execute: () => {
                this.fileNavigatorFilter.toggleHiddenFiles();
            },
            isEnabled: () => true,
            isVisible: () => true
        });
        registry.registerCommand(FileNavigatorCommands.TOGGLE_AUTO_REVEAL, {
            isEnabled: widget => this.withWidget(widget, () => this.workspaceService.opened),
            isVisible: widget => this.withWidget(widget, () => this.workspaceService.opened),
            execute: () => {
                const autoReveal = !this.fileNavigatorPreferences['explorer.autoReveal'];
                this.preferenceService.set('explorer.autoReveal', autoReveal, PreferenceScope.User);
                if (autoReveal) {
                    this.selectWidgetFileNode(this.shell.currentWidget);
                }
            },
            isToggled: () => this.fileNavigatorPreferences['explorer.autoReveal']
        });
        registry.registerCommand(FileNavigatorCommands.COLLAPSE_ALL, {
            execute: widget => this.withWidget(widget, () => this.collapseFileNavigatorTree()),
            isEnabled: widget => this.withWidget(widget, () => this.workspaceService.opened),
            isVisible: widget => this.withWidget(widget, () => this.workspaceService.opened)
        });
        registry.registerCommand(FileNavigatorCommands.REFRESH_NAVIGATOR, {
            execute: widget => this.withWidget(widget, () => this.refreshWorkspace()),
            isEnabled: widget => this.withWidget(widget, () => this.workspaceService.opened),
            isVisible: widget => this.withWidget(widget, () => this.workspaceService.opened)
        });
        registry.registerCommand(FileNavigatorCommands.ADD_ROOT_FOLDER, {
            execute: (...args) => registry.executeCommand(WorkspaceCommands.ADD_FOLDER.id, ...args),
            isEnabled: (...args) => registry.isEnabled(WorkspaceCommands.ADD_FOLDER.id, ...args),
            isVisible: (...args) => {
                if (!registry.isVisible(WorkspaceCommands.ADD_FOLDER.id, ...args)) {
                    return false;
                }
                const navigator = this.tryGetWidget();
                const selection = navigator?.model.getFocusedNode();
                // The node that is selected when the user clicks in empty space.
                const root = navigator?.getContainerTreeNode();
                return selection === root;
            }
        });

        registry.registerCommand(NavigatorDiffCommands.COMPARE_FIRST, {
            execute: () => {
                this.navigatorDiff.addFirstComparisonFile();
            },
            isEnabled: () => true,
            isVisible: () => true
        });
        registry.registerCommand(NavigatorDiffCommands.COMPARE_SECOND, {
            execute: () => {
                this.navigatorDiff.compareFiles();
            },
            isEnabled: () => this.navigatorDiff.isFirstFileSelected,
            isVisible: () => this.navigatorDiff.isFirstFileSelected
        });
        registry.registerCommand(FileNavigatorCommands.OPEN, {
            isEnabled: () => this.getSelectedFileNodes().length > 0,
            isVisible: () => this.getSelectedFileNodes().length > 0,
            execute: () => {
                this.getSelectedFileNodes().forEach(async node => {
                    const opener = await this.openerService.getOpener(node.uri);
                    opener.open(node.uri);
                });
            }
        });
        registry.registerCommand(FileNavigatorCommands.OPEN_WITH, UriAwareCommandHandler.MonoSelect(this.selectionService, {
            isEnabled: uri => this.openWithService.getHandlers(uri).length > 0,
            isVisible: uri => this.openWithService.getHandlers(uri).length > 0,
            execute: uri => this.openWithService.openWith(uri)
        }));
        registry.registerCommand(OpenEditorsCommands.CLOSE_ALL_TABS_FROM_TOOLBAR, {
            execute: widget => this.withOpenEditorsWidget(widget, () => this.shell.closeMany(this.editorWidgets)),
            isEnabled: widget => this.withOpenEditorsWidget(widget, () => true),
            isVisible: widget => this.withOpenEditorsWidget(widget, () => true)
        });
        registry.registerCommand(OpenEditorsCommands.SAVE_ALL_TABS_FROM_TOOLBAR, {
            execute: widget => this.withOpenEditorsWidget(widget, () => registry.executeCommand(CommonCommands.SAVE_ALL.id)),
            isEnabled: widget => this.withOpenEditorsWidget(widget, () => true),
            isVisible: widget => this.withOpenEditorsWidget(widget, () => true)
        });

        const filterEditorWidgets = (title: Title<Widget>) => {
            const { owner } = title;
            return NavigatableWidget.is(owner);
        };
        registry.registerCommand(OpenEditorsCommands.CLOSE_ALL_EDITORS_IN_GROUP_FROM_ICON, {
            execute: (tabBarOrArea: ApplicationShell.Area | TabBar<Widget>): void => {
                this.shell.closeTabs(tabBarOrArea, filterEditorWidgets);
            },
            isVisible: () => false
        });
        registry.registerCommand(OpenEditorsCommands.SAVE_ALL_IN_GROUP_FROM_ICON, {
            execute: (tabBarOrArea: ApplicationShell.Area | TabBar<Widget>) => {
                this.shell.saveTabs(tabBarOrArea, filterEditorWidgets);
            },
            isVisible: () => false
        });

        registry.registerCommand(FileNavigatorCommands.NEW_FILE_TOOLBAR, {
            execute: (...args) => registry.executeCommand(WorkspaceCommands.NEW_FILE.id, ...args),
            isEnabled: widget => this.withWidget(widget, () => this.workspaceService.opened),
            isVisible: widget => this.withWidget(widget, () => this.workspaceService.opened)
        });
        registry.registerCommand(FileNavigatorCommands.NEW_FOLDER_TOOLBAR, {
            execute: (...args) => registry.executeCommand(WorkspaceCommands.NEW_FOLDER.id, ...args),
            isEnabled: widget => this.withWidget(widget, () => this.workspaceService.opened),
            isVisible: widget => this.withWidget(widget, () => this.workspaceService.opened)
        });
    }

    protected get editorWidgets(): NavigatableWidget[] {
        const openEditorsWidget = this.widgetManager.tryGetWidget<OpenEditorsWidget>(OpenEditorsWidget.ID);
        return openEditorsWidget?.editorWidgets ?? [];
    }

    protected getSelectedFileNodes(): FileNode[] {
        return this.tryGetWidget()?.model.selectedNodes.filter(FileNode.is) || [];
    }

    protected withWidget<T>(widget: Widget | undefined = this.tryGetWidget(), cb: (navigator: FileNavigatorWidget) => T): T | false {
        if (widget instanceof FileNavigatorWidget && widget.id === FILE_NAVIGATOR_ID) {
            return cb(widget);
        }
        return false;
    }

    protected withOpenEditorsWidget<T>(widget: Widget, cb: (navigator: OpenEditorsWidget) => T): T | false {
        if (widget instanceof OpenEditorsWidget && widget.id === OpenEditorsWidget.ID) {
            return cb(widget);
        }
        return false;
    }

    override registerMenus(registry: MenuModelRegistry): void {
        super.registerMenus(registry);
        registry.registerMenuAction(SHELL_TABBAR_CONTEXT_REVEAL, {
            commandId: FileNavigatorCommands.REVEAL_IN_NAVIGATOR.id,
            label: FileNavigatorCommands.REVEAL_IN_NAVIGATOR.label,
            order: '5'
        });

        registry.registerMenuAction(NavigatorContextMenu.NAVIGATION, {
            commandId: FileNavigatorCommands.OPEN.id,
            label: nls.localizeByDefault('Open')
        });
        registry.registerMenuAction(NavigatorContextMenu.NAVIGATION, {
            commandId: FileNavigatorCommands.OPEN_WITH.id,
            when: '!explorerResourceIsFolder',
            label: nls.localizeByDefault('Open With...')
        });

        registry.registerMenuAction(NavigatorContextMenu.CLIPBOARD, {
            commandId: CommonCommands.COPY.id,
            order: 'a'
        });
        registry.registerMenuAction(NavigatorContextMenu.CLIPBOARD, {
            commandId: CommonCommands.PASTE.id,
            order: 'b'
        });
        registry.registerMenuAction(NavigatorContextMenu.CLIPBOARD, {
            commandId: CommonCommands.COPY_PATH.id,
            order: 'c'
        });
        registry.registerMenuAction(NavigatorContextMenu.CLIPBOARD, {
            commandId: WorkspaceCommands.COPY_RELATIVE_FILE_PATH.id,
            label: WorkspaceCommands.COPY_RELATIVE_FILE_PATH.label,
            order: 'd'
        });
        registry.registerMenuAction(NavigatorContextMenu.CLIPBOARD, {
            commandId: FileDownloadCommands.COPY_DOWNLOAD_LINK.id,
            order: 'z'
        });

        registry.registerMenuAction(NavigatorContextMenu.MODIFICATION, {
            commandId: WorkspaceCommands.FILE_RENAME.id
        });
        registry.registerMenuAction(NavigatorContextMenu.MODIFICATION, {
            commandId: WorkspaceCommands.FILE_DELETE.id
        });
        registry.registerMenuAction(NavigatorContextMenu.MODIFICATION, {
            commandId: WorkspaceCommands.FILE_DUPLICATE.id
        });

        const downloadUploadMenu = [...NAVIGATOR_CONTEXT_MENU, '6_downloadupload'];
        registry.registerMenuAction(downloadUploadMenu, {
            commandId: FileSystemCommands.UPLOAD.id,
            order: 'a'
        });
        registry.registerMenuAction(downloadUploadMenu, {
            commandId: FileDownloadCommands.DOWNLOAD.id,
            order: 'b'
        });

        registry.registerMenuAction(NavigatorContextMenu.NAVIGATION, {
            commandId: WorkspaceCommands.NEW_FILE.id,
            when: 'explorerResourceIsFolder'
        });
        registry.registerMenuAction(NavigatorContextMenu.NAVIGATION, {
            commandId: WorkspaceCommands.NEW_FOLDER.id,
            when: 'explorerResourceIsFolder'
        });
        registry.registerMenuAction(NavigatorContextMenu.COMPARE, {
            commandId: WorkspaceCommands.FILE_COMPARE.id
        });
        registry.registerMenuAction(NavigatorContextMenu.MODIFICATION, {
            commandId: FileNavigatorCommands.COLLAPSE_ALL.id,
            label: nls.localizeByDefault('Collapse All'),
            order: 'z2'
        });

        registry.registerMenuAction(NavigatorContextMenu.COMPARE, {
            commandId: NavigatorDiffCommands.COMPARE_FIRST.id,
            order: 'za'
        });
        registry.registerMenuAction(NavigatorContextMenu.COMPARE, {
            commandId: NavigatorDiffCommands.COMPARE_SECOND.id,
            order: 'zb'
        });

        // Open Editors Widget Menu Items
        registry.registerMenuAction(OpenEditorsContextMenu.CLIPBOARD, {
            commandId: CommonCommands.COPY_PATH.id,
            order: 'a'
        });
        registry.registerMenuAction(OpenEditorsContextMenu.CLIPBOARD, {
            commandId: WorkspaceCommands.COPY_RELATIVE_FILE_PATH.id,
            order: 'b'
        });
        registry.registerMenuAction(OpenEditorsContextMenu.SAVE, {
            commandId: CommonCommands.SAVE.id,
            order: 'a'
        });

        registry.registerMenuAction(OpenEditorsContextMenu.COMPARE, {
            commandId: NavigatorDiffCommands.COMPARE_FIRST.id,
            order: 'a'
        });
        registry.registerMenuAction(OpenEditorsContextMenu.COMPARE, {
            commandId: NavigatorDiffCommands.COMPARE_SECOND.id,
            order: 'b'
        });

        registry.registerMenuAction(OpenEditorsContextMenu.MODIFICATION, {
            commandId: CommonCommands.CLOSE_TAB.id,
            label: nls.localizeByDefault('Close'),
            order: 'a'
        });
        registry.registerMenuAction(OpenEditorsContextMenu.MODIFICATION, {
            commandId: CommonCommands.CLOSE_OTHER_TABS.id,
            label: nls.localizeByDefault('Close Others'),
            order: 'b'
        });
        registry.registerMenuAction(OpenEditorsContextMenu.MODIFICATION, {
            commandId: CommonCommands.CLOSE_ALL_MAIN_TABS.id,
            label: nls.localizeByDefault('Close All'),
            order: 'c'
        });

        registry.registerMenuAction(NavigatorContextMenu.WORKSPACE, {
            commandId: FileNavigatorCommands.ADD_ROOT_FOLDER.id,
            label: WorkspaceCommands.ADD_FOLDER.label
        });
        registry.registerMenuAction(NavigatorContextMenu.WORKSPACE, {
            commandId: WorkspaceCommands.REMOVE_FOLDER.id
        });
    }

    override registerKeybindings(registry: KeybindingRegistry): void {
        super.registerKeybindings(registry);
        registry.registerKeybinding({
            command: FileNavigatorCommands.REVEAL_IN_NAVIGATOR.id,
            keybinding: 'alt+r'
        });

        registry.registerKeybinding({
            command: WorkspaceCommands.FILE_DELETE.id,
            keybinding: isOSX ? 'cmd+backspace' : 'del',
            when: 'filesExplorerFocus'
        });

        registry.registerKeybinding({
            command: WorkspaceCommands.FILE_RENAME.id,
            keybinding: 'f2',
            when: 'filesExplorerFocus'
        });

        registry.registerKeybinding({
            command: FileNavigatorCommands.TOGGLE_HIDDEN_FILES.id,
            keybinding: 'ctrlcmd+i',
            when: 'filesExplorerFocus'
        });
    }

    async registerToolbarItems(toolbarRegistry: TabBarToolbarRegistry): Promise<void> {
        toolbarRegistry.registerItem({
            id: FileNavigatorCommands.NEW_FILE_TOOLBAR.id,
            command: FileNavigatorCommands.NEW_FILE_TOOLBAR.id,
            tooltip: nls.localizeByDefault('New File...'),
            priority: 0,
        });
        toolbarRegistry.registerItem({
            id: FileNavigatorCommands.NEW_FOLDER_TOOLBAR.id,
            command: FileNavigatorCommands.NEW_FOLDER_TOOLBAR.id,
            tooltip: nls.localizeByDefault('New Folder...'),
            priority: 1,
        });
        toolbarRegistry.registerItem({
            id: FileNavigatorCommands.REFRESH_NAVIGATOR.id,
            command: FileNavigatorCommands.REFRESH_NAVIGATOR.id,
            tooltip: nls.localizeByDefault('Refresh Explorer'),
            priority: 2,
        });
        toolbarRegistry.registerItem({
            id: FileNavigatorCommands.COLLAPSE_ALL.id,
            command: FileNavigatorCommands.COLLAPSE_ALL.id,
            tooltip: nls.localizeByDefault('Collapse All'),
            priority: 3,
        });

        // More (...) toolbar items.
        this.registerMoreToolbarItem({
            id: FileNavigatorCommands.TOGGLE_AUTO_REVEAL.id,
            command: FileNavigatorCommands.TOGGLE_AUTO_REVEAL.id,
            tooltip: FileNavigatorCommands.TOGGLE_AUTO_REVEAL.label,
            group: NavigatorMoreToolbarGroups.TOOLS,
        });
        this.registerMoreToolbarItem({
            id: WorkspaceCommands.ADD_FOLDER.id,
            command: WorkspaceCommands.ADD_FOLDER.id,
            tooltip: WorkspaceCommands.ADD_FOLDER.label,
            group: NavigatorMoreToolbarGroups.WORKSPACE,
        });

        // Open Editors toolbar items.
        toolbarRegistry.registerItem({
            id: OpenEditorsCommands.SAVE_ALL_TABS_FROM_TOOLBAR.id,
            command: OpenEditorsCommands.SAVE_ALL_TABS_FROM_TOOLBAR.id,
            tooltip: OpenEditorsCommands.SAVE_ALL_TABS_FROM_TOOLBAR.label,
            priority: 0,
        });
        toolbarRegistry.registerItem({
            id: OpenEditorsCommands.CLOSE_ALL_TABS_FROM_TOOLBAR.id,
            command: OpenEditorsCommands.CLOSE_ALL_TABS_FROM_TOOLBAR.id,
            tooltip: OpenEditorsCommands.CLOSE_ALL_TABS_FROM_TOOLBAR.label,
            priority: 1,
        });
    }

    /**
     * Register commands to the `More Actions...` navigator toolbar item.
     */
    public registerMoreToolbarItem = (item: Mutable<RenderedToolbarAction> & { command: string }) => {
        const commandId = item.command;
        const id = 'navigator.tabbar.toolbar.' + commandId;
        const command = this.commandRegistry.getCommand(commandId);
        this.commandRegistry.registerCommand({ id, iconClass: command && command.iconClass }, {
            execute: (w, ...args) => w instanceof FileNavigatorWidget
                && this.commandRegistry.executeCommand(commandId, ...args),
            isEnabled: (w, ...args) => w instanceof FileNavigatorWidget
                && this.commandRegistry.isEnabled(commandId, ...args),
            isVisible: (w, ...args) => w instanceof FileNavigatorWidget
                && this.commandRegistry.isVisible(commandId, ...args),
            isToggled: (w, ...args) => w instanceof FileNavigatorWidget
                && this.commandRegistry.isToggled(commandId, ...args),
        });
        item.command = id;
        this.tabbarToolbarRegistry.registerItem(item);
    };

    /**
     * Reveals and selects node in the file navigator to which given widget is related.
     * Does nothing if given widget undefined or doesn't have related resource.
     *
     * @param widget widget file resource of which should be revealed and selected
     */
    async selectWidgetFileNode(widget: Widget | undefined): Promise<boolean> {
        return this.selectFileNode(NavigatableWidget.getUri(widget));
    }

    async selectFileNode(uri?: URI): Promise<boolean> {
        if (uri) {
            const { model } = await this.widget;
            const node = await model.revealFile(uri);
            if (SelectableTreeNode.is(node)) {
                model.selectNode(node);
                return true;
            }
        }
        return false;
    }

    protected onCurrentWidgetChangedHandler(): void {
        if (this.fileNavigatorPreferences['explorer.autoReveal']) {
            this.selectWidgetFileNode(this.shell.currentWidget);
        }
    }

    /**
     * Collapse file navigator nodes and set focus on first visible node
     * - single root workspace: collapse all nodes except root
     * - multiple root workspace: collapse all nodes, even roots
     */
    async collapseFileNavigatorTree(): Promise<void> {
        const { model } = await this.widget;

        // collapse all child nodes which are not the root (single root workspace)
        // collapse all root nodes (multiple root workspace)
        let root = model.root as CompositeTreeNode;
        if (WorkspaceNode.is(root) && root.children.length === 1) {
            root = root.children[0];
        }
        root.children.forEach(child => CompositeTreeNode.is(child) && model.collapseAll(child));

        // select first visible node
        const firstChild = WorkspaceNode.is(root) ? root.children[0] : root;
        if (SelectableTreeNode.is(firstChild)) {
            model.selectNode(firstChild);
        }
    }

    /**
     * force refresh workspace in navigator
     */
    async refreshWorkspace(): Promise<void> {
        const { model } = await this.widget;
        await model.refresh();
    }

}
