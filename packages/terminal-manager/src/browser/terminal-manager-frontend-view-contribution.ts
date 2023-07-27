// *****************************************************************************
// Copyright (C) 2023 Ericsson and others.
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

import { inject, injectable } from '@theia/core/shared/inversify';
import {
    AbstractViewContribution,
    codicon,
    KeybindingContribution,
    KeybindingRegistry,
    Widget,
} from '@theia/core/lib/browser';
import { CommandRegistry, Emitter, MenuModelRegistry } from '@theia/core';
import { TabBarToolbarContribution, TabBarToolbarRegistry } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { BOTTOM_AREA_ID, MAXIMIZED_CLASS } from '@theia/core/lib/browser/shell/theia-dock-panel';
import { TerminalManagerCommands, TerminalManagerTreeTypes, TERMINAL_MANAGER_TREE_CONTEXT_MENU } from './terminal-manager-types';
import { TerminalManagerWidget } from './terminal-manager-widget';
import { TerminalManagerTreeWidget } from './terminal-manager-tree-widget';
import { AlertDialogFactory } from './terminal-manager-alert-dialog';

/* eslint-disable max-lines-per-function */
@injectable()
export class TerminalManagerFrontendViewContribution extends AbstractViewContribution<TerminalManagerWidget>
    implements TabBarToolbarContribution, KeybindingContribution {
    protected onBottomPanelMaximizeDidChangeEmitter = new Emitter<void>();
    protected onBottomPanelMaximizeDidChange = this.onBottomPanelMaximizeDidChangeEmitter.event;

    @inject(AlertDialogFactory) protected readonly alertDialogFactory: AlertDialogFactory;

    constructor() {
        super({
            widgetId: TerminalManagerWidget.ID,
            widgetName: 'Terminal Manager',
            defaultWidgetOptions: {
                area: 'bottom',
            },
        });
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(TerminalManagerCommands.MANAGER_NEW_TERMINAL_GROUP, {
            execute: (
                ...args: TerminalManagerTreeTypes.ContextMenuArgs
            ) => {
                const nodeId = args[1];
                if (TerminalManagerTreeTypes.isPageId(nodeId)) {
                    this.createNewTerminalGroup(nodeId);
                }
            },
            isVisible: (
                ...args: TerminalManagerTreeTypes.ContextMenuArgs
            ) => args[0] instanceof TerminalManagerTreeWidget && TerminalManagerTreeTypes.isPageId(args[1]),
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_SHOW_TREE_TOOLBAR, {
            execute: () => this.handleToggleTree(),
            isVisible: widget => widget instanceof TerminalManagerWidget,
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_NEW_PAGE_BOTTOM_TOOLBAR, {
            execute: () => this.createNewTerminalPage(),
            isVisible: (
                ...args: TerminalManagerTreeTypes.ContextMenuArgs
                // eslint-disable-next-line max-len
            ) => args[0] instanceof TerminalManagerWidget,
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_DELETE_TERMINAL, {
            execute: (
                ...args: TerminalManagerTreeTypes.ContextMenuArgs
            ) => TerminalManagerTreeTypes.isTerminalKey(args[1]) && this.deleteTerminalFromManager(args[1]),
            isVisible: (...args: TerminalManagerTreeTypes.ContextMenuArgs) => {
                const treeWidget = args[0];
                const nodeId = args[1];
                if (treeWidget instanceof TerminalManagerTreeWidget && TerminalManagerTreeTypes.isTerminalKey(nodeId)) {
                    const { model } = treeWidget;
                    const terminalNode = model.getNode(nodeId);
                    return TerminalManagerTreeTypes.isTerminalNode(terminalNode);
                }
                return false;
            },
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_DELETE_PAGE, {
            execute: (
                ...args: TerminalManagerTreeTypes.ContextMenuArgs
            ) => TerminalManagerTreeTypes.isPageId(args[1]) && this.deletePageFromManager(args[1]),
            isVisible: (...args: TerminalManagerTreeTypes.ContextMenuArgs) => {
                const widget = args[0];
                return widget instanceof TerminalManagerTreeWidget && TerminalManagerTreeTypes.isPageId(args[1]) && widget.model.pages.size >= 1;
            },
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_RENAME_TERMINAL, {
            execute: (...args: TerminalManagerTreeTypes.ContextMenuArgs) => this.toggleRenameTerminalFromManager(args[1]),
            isVisible: (...args: TerminalManagerTreeTypes.ContextMenuArgs) => args[0] instanceof TerminalManagerTreeWidget,
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_ADD_TERMINAL_TO_GROUP, {
            execute: (
                ...args: TerminalManagerTreeTypes.ContextMenuArgs
            ) => {
                const nodeId = args[1];
                if (TerminalManagerTreeTypes.isGroupId(nodeId)) {
                    this.addTerminalToGroup(nodeId);
                }
            },
            isVisible: (
                ...args: TerminalManagerTreeTypes.ContextMenuArgs
            ) => args[0] instanceof TerminalManagerTreeWidget && TerminalManagerTreeTypes.isGroupId(args[1]),
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_DELETE_GROUP, {
            execute: (
                ...args: TerminalManagerTreeTypes.ContextMenuArgs
            ) => TerminalManagerTreeTypes.isGroupId(args[1]) && this.deleteGroupFromManager(args[1]),
            isVisible: (...args: TerminalManagerTreeTypes.ContextMenuArgs) => {
                const treeWidget = args[0];
                const groupId = args[1];
                if (treeWidget instanceof TerminalManagerTreeWidget && TerminalManagerTreeTypes.isGroupId(groupId)) {
                    const { model } = treeWidget;
                    const groupNode = model.getNode(groupId);
                    return TerminalManagerTreeTypes.isGroupNode(groupNode);
                }
                return false;
            },
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_MAXIMIZE_BOTTOM_PANEL_TOOLBAR, {
            execute: () => this.maximizeBottomPanel(),
            isVisible: widget => widget instanceof Widget
                && widget.parent?.id === BOTTOM_AREA_ID
                && !this.shell.bottomPanel.hasClass(MAXIMIZED_CLASS),
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_MINIMIZE_BOTTOM_PANEL_TOOLBAR, {
            execute: () => this.maximizeBottomPanel(),
            isVisible: widget => widget instanceof Widget
                && widget.parent?.id === BOTTOM_AREA_ID
                && this.shell.bottomPanel.hasClass(MAXIMIZED_CLASS),
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_CLEAR_ALL, {
            isVisible: widget => widget instanceof TerminalManagerWidget,
            execute: async widget => {
                if (widget instanceof TerminalManagerWidget) {
                    const PRIMARY_BUTTON = 'Reset Layout';
                    const dialogResponse = await this.confirmUserAction({
                        title: 'Do you want to reset the terminal manager layout?',
                        message: 'Once the layout is reset, it cannot be restored. Are you sure you would like to clear the layout?',
                        primaryButtonText: PRIMARY_BUTTON,
                    });
                    if (dialogResponse === PRIMARY_BUTTON) {
                        for (const id of widget.pagePanels.keys()) {
                            widget.deletePage(id);
                        }
                    }
                }
            },
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_OPEN_VIEW, {
            execute: () => this.openView({ activate: true }),
        });
        commands.registerCommand(TerminalManagerCommands.MANAGER_CLOSE_VIEW, {
            isVisible: () => Boolean(this.tryGetWidget()),
            isEnabled: () => Boolean(this.tryGetWidget()),
            execute: () => this.closeView(),
        });
    }

    protected async confirmUserAction(options: { title: string, message: string, primaryButtonText: string }): Promise<string | undefined> {
        const dialog = this.alertDialogFactory({
            title: options.title,
            message: options.message,
            type: 'info',
            className: 'terminal-manager-close-alert',
            primaryButtons: [options.primaryButtonText],
            secondaryButton: 'Cancel',
        });
        const dialogResponse = await dialog.open();
        dialog.dispose();
        return dialogResponse;
    }

    override async closeView(): Promise<TerminalManagerWidget | undefined> {
        const CLOSE = 'Close';
        const userResponse = await this.confirmUserAction({
            title: 'Do you want to close the terminal manager?',
            message: 'Once the Terminal Manager is closed, its layout cannot be restored. Are you sure you want to close the Terminal Manager?',
            primaryButtonText: CLOSE,
        });
        if (userResponse === CLOSE) {
            return super.closeView();
        }
        return undefined;
    }

    protected maximizeBottomPanel(): void {
        this.shell.bottomPanel.toggleMaximized();
        this.onBottomPanelMaximizeDidChangeEmitter.fire();
    }

    protected async createNewTerminalPage(): Promise<void> {
        const terminalManagerWidget = await this.widget;
        const terminalWidget = await terminalManagerWidget.createTerminalWidget();
        terminalManagerWidget.addTerminalPage(terminalWidget);
    }

    protected async createNewTerminalGroup(pageId: TerminalManagerTreeTypes.PageId): Promise<void> {
        const terminalManagerWidget = await this.widget;
        const terminalWidget = await terminalManagerWidget.createTerminalWidget();
        terminalManagerWidget.addTerminalGroupToPage(terminalWidget, pageId);
    }

    protected async addTerminalToGroup(groupId: TerminalManagerTreeTypes.GroupId): Promise<void> {
        const terminalManagerWidget = await this.widget;
        const terminalWidget = await terminalManagerWidget.createTerminalWidget();
        terminalManagerWidget.addWidgetToTerminalGroup(terminalWidget, groupId);
    }

    protected async handleToggleTree(): Promise<void> {
        const terminalManagerWidget = await this.widget;
        terminalManagerWidget.toggleTreeVisibility();
    }

    protected async deleteTerminalFromManager(terminalId: TerminalManagerTreeTypes.TerminalKey): Promise<void> {
        const terminalManagerWidget = await this.widget;
        terminalManagerWidget?.deleteTerminal(terminalId);
    }

    protected async deleteGroupFromManager(groupId: TerminalManagerTreeTypes.GroupId): Promise<void> {
        const widget = await this.widget;
        widget.deleteGroup(groupId);
    }

    protected async deletePageFromManager(pageId: TerminalManagerTreeTypes.PageId): Promise<void> {
        const widget = await this.widget;
        widget.deletePage(pageId);
    }

    protected async toggleRenameTerminalFromManager(entityId: TerminalManagerTreeTypes.TerminalManagerValidId): Promise<void> {
        const widget = await this.widget;
        widget.toggleRenameTerminal(entityId);
    }

    override registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
        menus.registerMenuAction(TERMINAL_MANAGER_TREE_CONTEXT_MENU, {
            commandId: TerminalManagerCommands.MANAGER_ADD_TERMINAL_TO_GROUP.id,
            order: 'a',
        });
        menus.registerMenuAction(TERMINAL_MANAGER_TREE_CONTEXT_MENU, {
            commandId: TerminalManagerCommands.MANAGER_RENAME_TERMINAL.id,
            order: 'b',
        });
        menus.registerMenuAction(TERMINAL_MANAGER_TREE_CONTEXT_MENU, {
            commandId: TerminalManagerCommands.MANAGER_DELETE_TERMINAL.id,
            order: 'c',
        });
        menus.registerMenuAction(TERMINAL_MANAGER_TREE_CONTEXT_MENU, {
            commandId: TerminalManagerCommands.MANAGER_DELETE_PAGE.id,
            order: 'c',
        });
        menus.registerMenuAction(TERMINAL_MANAGER_TREE_CONTEXT_MENU, {
            commandId: TerminalManagerCommands.MANAGER_DELETE_GROUP.id,
            order: 'c',
        });

        menus.registerMenuAction(TerminalManagerTreeTypes.PAGE_NODE_MENU, {
            commandId: TerminalManagerCommands.MANAGER_NEW_TERMINAL_GROUP.id,
            order: 'a',
        });
        menus.registerMenuAction(TerminalManagerTreeTypes.PAGE_NODE_MENU, {
            commandId: TerminalManagerCommands.MANAGER_DELETE_PAGE.id,
            order: 'b',
        });

        menus.registerMenuAction(TerminalManagerTreeTypes.TERMINAL_NODE_MENU, {
            commandId: TerminalManagerCommands.MANAGER_DELETE_TERMINAL.id,
            order: 'c',
        });

        menus.registerMenuAction(TerminalManagerTreeTypes.GROUP_NODE_MENU, {
            commandId: TerminalManagerCommands.MANAGER_ADD_TERMINAL_TO_GROUP.id,
            order: 'a',
        });
        menus.registerMenuAction(TerminalManagerTreeTypes.GROUP_NODE_MENU, {
            commandId: TerminalManagerCommands.MANAGER_DELETE_GROUP.id,
            order: 'c',
        });
    }

    registerToolbarItems(toolbar: TabBarToolbarRegistry): void {
        toolbar.registerItem({
            id: TerminalManagerCommands.MANAGER_NEW_PAGE_BOTTOM_TOOLBAR.id,
            command: TerminalManagerCommands.MANAGER_NEW_PAGE_BOTTOM_TOOLBAR.id,
        });
        toolbar.registerItem({
            id: TerminalManagerCommands.MANAGER_SHOW_TREE_TOOLBAR.id,
            command: TerminalManagerCommands.MANAGER_SHOW_TREE_TOOLBAR.id,
        });
        toolbar.registerItem({
            id: TerminalManagerCommands.MANAGER_CLEAR_ALL.id,
            command: TerminalManagerCommands.MANAGER_CLEAR_ALL.id,
        });
        toolbar.registerItem({
            id: TerminalManagerCommands.MANAGER_MAXIMIZE_BOTTOM_PANEL_TOOLBAR.id,
            command: TerminalManagerCommands.MANAGER_MAXIMIZE_BOTTOM_PANEL_TOOLBAR.id,
            icon: codicon('chevron-up'),
            onDidChange: this.onBottomPanelMaximizeDidChange,
        });
        toolbar.registerItem({
            id: TerminalManagerCommands.MANAGER_MINIMIZE_BOTTOM_PANEL_TOOLBAR.id,
            command: TerminalManagerCommands.MANAGER_MINIMIZE_BOTTOM_PANEL_TOOLBAR.id,
            icon: codicon('chevron-down'),
            onDidChange: this.onBottomPanelMaximizeDidChange,
        });
    }

    override registerKeybindings(registry: KeybindingRegistry): void {
        registry.registerKeybinding({
            command: TerminalManagerCommands.MANAGER_MINIMIZE_BOTTOM_PANEL_TOOLBAR.id,
            keybinding: 'alt+q',
        });
    }
}
