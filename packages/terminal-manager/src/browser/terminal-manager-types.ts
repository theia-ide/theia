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

import { Command, MenuPath } from '@theia/core';
import {
    SelectableTreeNode,
    CompositeTreeNode,
    SplitPanel,
    codicon,
    ExpandableTreeNode,
    Widget,
} from '@theia/core/lib/browser';
import { TerminalWidgetFactoryOptions, TerminalWidgetImpl } from '@theia/terminal/lib/browser/terminal-widget-impl';

export namespace TerminalManagerCommands {
    export const MANAGER_NEW_TERMINAL_GROUP = Command.toDefaultLocalizedCommand({
        id: 'terminal:new-in-manager-toolbar',
        category: 'Terminal Manager',
        label: 'Create New Terminal Group',
        iconClass: codicon('split-horizontal'),
    });
    export const MANAGER_DELETE_TERMINAL = Command.toDefaultLocalizedCommand({
        id: 'terminal:delete-terminal',
        category: 'Terminal Manager',
        label: 'Delete Terminal',
        iconClass: codicon('trash'),
    });
    export const MANAGER_RENAME_TERMINAL = Command.toDefaultLocalizedCommand({
        id: 'terminal: rename-terminal',
        category: 'Terminal Manager',
        label: 'Rename...',
        iconClass: codicon('edit'),
    });
    export const MANAGER_NEW_PAGE_BOTTOM_TOOLBAR = Command.toDefaultLocalizedCommand({
        id: 'terminal:new-manager-page',
        category: 'Terminal Manager',
        label: 'Create New Terminal Page',
        iconClass: codicon('new-file'),
    });
    export const MANAGER_DELETE_PAGE = Command.toDefaultLocalizedCommand({
        id: 'terminal:delete-page',
        category: 'Terminal Manager',
        label: 'Delete Page',
        iconClass: codicon('trash'),
    });
    export const MANAGER_ADD_TERMINAL_TO_GROUP = Command.toDefaultLocalizedCommand({
        id: 'terminal:manager-split-horizontal',
        category: 'Terminal Manager',
        label: 'Add terminal to group',
        iconClass: codicon('split-vertical'),
    });
    export const MANAGER_DELETE_GROUP = Command.toDefaultLocalizedCommand({
        id: 'terminal:manager-delete-group',
        category: 'Terminal Manager',
        label: 'Delete Group...',
        iconClass: codicon('trash'),
    });
    export const MANAGER_SHOW_TREE_TOOLBAR = Command.toDefaultLocalizedCommand({
        id: 'terminal:manager-toggle-tree',
        category: 'Terminal Manager',
        label: 'Toggle Tree View',
        iconClass: codicon('list-tree'),
    });

    export const MANAGER_MAXIMIZE_BOTTOM_PANEL_TOOLBAR = Command.toDefaultLocalizedCommand({
        id: 'terminal:manager-maximize-bottom-panel',
        category: 'Terminal Manager',
        label: 'Maximize Bottom Panel',
    });
    export const MANAGER_MINIMIZE_BOTTOM_PANEL_TOOLBAR = Command.toDefaultLocalizedCommand({
        id: 'terminal:manager-minimize-bottom-panel',
        category: 'Terminal Manager',
        label: 'Minimize Bottom Panel',
    });
    export const MANAGER_CLEAR_ALL = Command.toDefaultLocalizedCommand({
        id: 'terminal:manager-clear-all',
        category: 'Terminal Manager',
        label: 'Reset Terminal Manager layout',
        iconClass: codicon('trash'),
    });
    export const MANAGER_OPEN_VIEW: Command = {
        id: 'terminal:open-manager',
        category: 'View',
        label: 'Open Terminal Manager',
    };
    export const MANAGER_CLOSE_VIEW: Command = {
        id: 'terminal:close-manager',
        category: 'View',
        label: 'Close Terminal Manager',
    };
}

export const TERMINAL_MANAGER_TREE_CONTEXT_MENU = ['terminal-manager-tree-context-menu'];
export namespace TerminalManagerTreeTypes {
    export type TerminalKey = `terminal-${string}`;
    export const generateTerminalKey = (widget: TerminalWidgetImpl): TerminalKey => {
        const { created } = widget.options as TerminalWidgetFactoryOptions;
        return `terminal-${created}`;
    };
    export const isTerminalKey = (obj: unknown): obj is TerminalKey => typeof obj === 'string' && obj.startsWith('terminal-');
    export interface TerminalNode extends SelectableTreeNode, CompositeTreeNode {
        terminal: true;
        isEditing: boolean;
        label: string;
        id: TerminalKey;
        parentGroupId: GroupId;
    }

    export type GroupId = `group-${string}`;
    export const isGroupId = (obj: unknown): obj is GroupId => typeof obj === 'string' && obj.startsWith('group-');
    export interface GroupSplitPanel extends SplitPanel {
        id: GroupId;
    }
    export interface TerminalGroupNode extends SelectableTreeNode, ExpandableTreeNode {
        terminalGroup: true;
        isEditing: boolean;
        label: string;
        id: GroupId;
        parentPageId: PageId;
        counter: number;
        children: readonly TerminalNode[]
    }

    export type PageId = `page-${string}`;
    export const isPageId = (obj: unknown): obj is PageId => typeof obj === 'string' && obj.startsWith('page-');
    export interface PageSplitPanel extends SplitPanel {
        id: PageId;
    }
    export interface PageNode extends SelectableTreeNode, ExpandableTreeNode {
        page: true;
        children: TerminalGroupNode[];
        isEditing: boolean;
        label: string;
        id: PageId;
        counter: number;
    }

    export type TerminalManagerTreeNode = PageNode | TerminalNode | TerminalGroupNode;
    export type TerminalManagerValidId = PageId | TerminalKey | GroupId;
    export const isPageNode = (obj: unknown): obj is PageNode => !!obj && typeof obj === 'object' && 'page' in obj;
    export const isTerminalNode = (obj: unknown): obj is TerminalNode => !!obj && typeof obj === 'object' && 'terminal' in obj;
    export const isGroupNode = (obj: unknown): obj is TerminalGroupNode => !!obj && typeof obj === 'object' && 'terminalGroup' in obj;
    export const isTerminalManagerTreeNode = (
        obj: unknown,
    ): obj is PageNode | TerminalNode => isPageNode(obj) || isTerminalNode(obj) || isGroupNode(obj);
    export interface SelectionChangedEvent {
        activePageId: PageId | undefined;
        activeTerminalId: TerminalKey | undefined;
        activeGroupId: GroupId | undefined;
    }

    export type ContextMenuArgs = [Widget, TerminalManagerValidId];
    export const toContextMenuArgs = (widget: Widget, node: TerminalManagerTreeNode): ContextMenuArgs => [widget, node.id as TerminalManagerValidId];

    export const PAGE_NODE_MENU: MenuPath = ['terminal-manager-page-node'];
    export const GROUP_NODE_MENU: MenuPath = ['terminal-manager-group-node'];
    export const TERMINAL_NODE_MENU: MenuPath = ['terminal-manager-terminal-node'];
}

export type ReactInteraction<T = Element, U = MouseEvent> = React.MouseEvent<T, U> | React.KeyboardEvent<T>;
