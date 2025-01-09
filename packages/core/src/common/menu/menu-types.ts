// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
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

import { Event } from '../event';
import { isObject } from '../types';

export const MAIN_MENU_BAR: MenuPath = ['menubar'];
export type MenuPath = string[];
export const MANAGE_MENU: MenuPath = ['manage_menu'];
export const ACCOUNTS_MENU: MenuPath = ['accounts_menu'];
export const ACCOUNTS_SUBMENU = [...ACCOUNTS_MENU, '1_accounts_submenu'];

export interface ContextExpressionMatcher<T> {
    match(whenExpression: string, context: T | undefined): boolean;
}

/**
 * @internal For most use cases, refer to {@link MenuAction} or {@link MenuNode}
 */
export interface MenuNode {
    /**
     * technical identifier.
     */
    readonly id: string;
    /**
     * Menu nodes are sorted in ascending order based on their `sortString`.
     */
    readonly sortString: string;
    isVisible<T>(effectiveMenuPath: MenuPath, contextMatcher: ContextExpressionMatcher<T>, context: T | undefined, ...args: unknown[]): boolean;
    onDidChange?: Event<void>;
}

export interface Action {
    isEnabled(effectiveMenuPath: MenuPath, ...args: unknown[]): boolean;
    isToggled(effectiveMenuPath: MenuPath, ...args: unknown[]): boolean;
    run(effectiveMenuPath: MenuPath, ...args: unknown[]): Promise<void>;
}

export namespace Action {
    export function is(node: object): node is Action {
        return isObject<Action>(node) && typeof node.run === 'function' && typeof node.isEnabled === 'function';
    }
}

export interface MenuAction {
    /**
     * The command to execute.
     */
    readonly commandId: string;
    /**
     * Menu entries are sorted in ascending order based on their `order` strings. If omitted the determined
     * label will be used instead.
     */
    readonly order?: string;

    readonly label?: string;
    /**
     * Icon classes for the menu node. If present, these will produce an icon to the left of the label in browser-style menus.
     */
    readonly icon?: string;

    readonly when?: string;
}

export namespace MenuAction {
    export function is(obj: unknown): obj is MenuAction {
        return isObject<MenuAction>(obj) && typeof obj.commandId === 'string';
    }
}

/**
 * Metadata for the visual presentation of a node.
 * @internal For most uses cases, refer to {@link MenuNode}, {@link CommandMenuNode}, or {@link CompoundMenuNode}
 */
export interface RenderedMenuNode extends MenuNode {
    /**
     * Optional label. Will be rendered as text of the menu item.
     */
    readonly label: string;
    /**
     * Icon classes for the menu node. If present, these will produce an icon to the left of the label in browser-style menus.
     */
    readonly icon?: string;
}

export namespace RenderedMenuNode {
    export function is(node: object): node is RenderedMenuNode {
        return isObject<RenderedMenuNode>(node) && typeof node.label === 'string';
    }
}

export type CommandMenu = MenuNode & RenderedMenuNode & Action;

export namespace CommandMenu {
    export function is(node: MenuNode): node is CommandMenu {
        return RenderedMenuNode.is(node) && Action.is(node);
    }
}

export type Group = CompoundMenuNode;
export namespace Group {
    export function is(obj: unknown): obj is Group {
        return CompoundMenuNode.is(obj) && !RenderedMenuNode.is(obj);
    }
}

export type Submenu = CompoundMenuNode & RenderedMenuNode;

export interface CompoundMenuNode extends MenuNode {
    children: MenuNode[];
    contextKeyOverlays?: Record<string, string>;
    /**
     * Whether the group or submenu contains any visible children
     *
     * @param effectiveMenuPath The menu path where visibility is checked
     * @param contextMatcher The context matcher to use
     * @param context the context to use
     * @param args the command arguments, if applicable
     */
    isEmpty<T>(effectiveMenuPath: MenuPath, contextMatcher: ContextExpressionMatcher<T>, context: T | undefined, ...args: unknown[]): boolean;
};

export namespace CompoundMenuNode {
    export function is(node?: unknown): node is CompoundMenuNode { return isObject<CompoundMenuNode>(node) && Array.isArray(node.children); }

    export function sortChildren(m1: MenuNode, m2: MenuNode): number {
        // The navigation group is special as it will always be sorted to the top/beginning of a menu.
        if (isNavigationGroup(m1)) {
            return -1;
        }
        if (isNavigationGroup(m2)) {
            return 1;
        }
        return m1.sortString.localeCompare(m2.sortString);
    }

    /**
     * Indicates whether the given node is the special `navigation` menu.
     *
     * @param node the menu node to check.
     * @returns `true` when the given node is a {@link CompoundMenuNode} with id `navigation`,
     * `false` otherwise.
     */
    export function isNavigationGroup(node: MenuNode): node is CompoundMenuNode {
        return is(node) && node.id === 'navigation';
    }
}

export interface MutableCompoundMenuNode {
    addNode(...node: MenuNode[]): void;
    removeNode(node: MenuNode): void;
    getOrCreate(menuPath: MenuPath, pathIndex: number, endIndex: number): CompoundMenuNode & MutableCompoundMenuNode;
};

export namespace MutableCompoundMenuNode {
    export function is(node: unknown): node is MutableCompoundMenuNode {
        return isObject<MutableCompoundMenuNode>(node)
            && typeof node.addNode === 'function'
            && typeof node.removeNode === 'function'
            && typeof node.getOrCreate === 'function';
    }
}
