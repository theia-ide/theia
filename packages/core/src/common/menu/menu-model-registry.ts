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

import { inject, injectable, named } from 'inversify';
import { CommandMenu, CompoundMenuNode, Group, MAIN_MENU_BAR, MenuAction, MenuNode, MenuPath, MutableCompoundMenuNode, Submenu } from './menu-types';
import { Event } from 'vscode-languageserver-protocol';
import { ContributionProvider } from '../contribution-provider';
import { Command, CommandRegistry } from '../command';
import { Emitter } from '../event';
import { Disposable } from '../disposable';

export const MenuContribution = Symbol('MenuContribution');

/**
 * Representation of a menu contribution.
 *
 * Note that there are also convenience classes which combine multiple contributions into one.
 * For example to register a view together with a menu and keybinding you could use
 * {@link AbstractViewContribution} instead.
 *
 * ### Example usage
 *
 * ```ts
 * import { MenuContribution, MenuModelRegistry, MAIN_MENU_BAR } from '@theia/core';
 *
 * @injectable()
 * export class NewMenuContribution implements MenuContribution {
 *    registerMenus(menus: MenuModelRegistry): void {
 *         const menuPath = [...MAIN_MENU_BAR, '99_mymenu'];
 *         menus.registerSubmenu(menuPath, 'My Menu');
 *
 *         menus.registerMenuAction(menuPath, {
 *            commandId: MyCommand.id,
 *            label: 'My Action'
 *         });
 *     }
 * }
 * ```
 */
export interface MenuContribution {
    /**
     * Registers menus.
     * @param menus the menu model registry.
     */
    registerMenus(menus: MenuModelRegistry): void;
}

export const MenuNodeFactory = Symbol('MenuNodeFactory');

export interface MenuNodeFactory {
    createGroup(id: string, orderString?: string, when?: string): Group & MutableCompoundMenuNode;
    createCommandMenu(item: MenuAction): CommandMenu;
    createSubmenu(id: string, label: string, contextKeyOverlays: Record<string, string> | undefined,
        orderString?: string, icon?: string, when?: string): Submenu & MutableCompoundMenuNode
    createSubmenuLink(delegate: Submenu, sortString?: string, when?: string): MenuNode;
}

/**
 * The MenuModelRegistry allows to register and unregister menus, submenus and actions
 * via strings and {@link MenuAction}s without the need to access the underlying UI
 * representation.
 */
@injectable()
export class MenuModelRegistry {
    protected root: Group & MutableCompoundMenuNode;

    protected readonly onDidChangeEmitter = new Emitter<void>();

    constructor(
        @inject(ContributionProvider) @named(MenuContribution)
        protected readonly contributions: ContributionProvider<MenuContribution>,
        @inject(CommandRegistry)
        protected readonly commands: CommandRegistry,
        @inject(MenuNodeFactory)
        protected readonly menuNodeFactory: MenuNodeFactory) {
        this.root = this.menuNodeFactory.createGroup('root', 'root');
        this.root.addNode(this.menuNodeFactory.createGroup(MAIN_MENU_BAR[0]));
    }

    get onDidChange(): Event<void> {
        return this.onDidChangeEmitter.event;
    }

    protected isReady = false;

    onStart(): void {
        for (const contrib of this.contributions.getContributions()) {
            contrib.registerMenus(this);
        }
        this.isReady = true;
    }

    /**
     * Adds the given menu action to the menu denoted by the given path.
     *
     * @returns a disposable which, when called, will remove the menu action again.
     */
    registerCommandMenu(menuPath: MenuPath, item: CommandMenu): Disposable {
        const parent = this.root.getOrCreate(menuPath, 0, menuPath.length);
        const existing = parent.children.find(node => node.id === menuPath[menuPath.length - 1]);
        if (existing) {
            throw new Error(`A menu node with path ${JSON.stringify(menuPath)} already exists`);
        } else {
            parent.addNode(item);
            return Disposable.create(() => {
                parent.removeNode(item);
                this.fireChangeEvent();
            });
        }

    }

    /**
     * Adds the given menu action to the menu denoted by the given path.
     *
     * @returns a disposable which, when called, will remove the menu action again.
     */
    registerMenuAction(menuPath: MenuPath, item: MenuAction): Disposable {
        const parent = this.root.getOrCreate(menuPath, 0, menuPath.length);
        const existing = parent.children.find(node => node.id === item.commandId);
        if (existing) {
            throw new Error(`A menu node with id ${item.commandId} in path ${JSON.stringify(menuPath)} already exists`);
        } else {
            const node = this.menuNodeFactory.createCommandMenu(item);
            parent.addNode(node);
            return Disposable.create(() => {
                parent.removeNode(node);
                this.fireChangeEvent();
            });
        }

    }

    /**
     * Register a new menu at the given path with the given label.
     * (If the menu already exists without a label, iconClass or order this method can be used to set them.)
     *
     * @param menuPath the path for which a new submenu shall be registered.
     * @param label the label to be used for the new submenu.
     * @param options optionally allows to set an icon class and specify the order of the new menu.
     *
     * @returns if the menu was successfully created a disposable will be returned which,
     * when called, will remove the menu again. If the menu already existed a no-op disposable
     * will be returned.
     *
     * Note that if the menu already existed and was registered with a different label an error
     * will be thrown.
     */
    registerSubmenu(menuPath: MenuPath, label: string,
        options: { sortString?: string, icon?: string, when?: string, contextKeyOverlay?: Record<string, string> } = {}): Disposable {
        const { contextKeyOverlay, sortString, icon, when } = options;

        const parent = this.root.getOrCreate(menuPath, 0, menuPath.length - 1);
        const existing = parent.children.find(node => node.id === menuPath[menuPath.length - 1]);
        if (Group.is(existing)) {
            parent.removeNode(existing);
            const newMenu = this.menuNodeFactory.createSubmenu(menuPath[menuPath.length - 1], label, contextKeyOverlay, sortString, icon, when);
            newMenu.addNode(...existing.children);
            parent.addNode(newMenu);
            return Disposable.create(() => {
                parent.removeNode(newMenu);
                this.fireChangeEvent();
            });
        } else {
            const newMenu = this.menuNodeFactory.createSubmenu(menuPath[menuPath.length - 1], label, contextKeyOverlay, sortString, icon, when);
            parent.addNode(newMenu);
            return Disposable.create(() => {
                parent.removeNode(newMenu);
                this.fireChangeEvent();
            });
        }
    }

    linkCompoundMenuNode(params: { newParentPath: MenuPath, submenuPath: MenuPath, order?: string, when?: string }): Disposable {
        const { newParentPath, submenuPath, order, when } = params;
        // add a wrapper here
        let i = 0;
        while (i < newParentPath.length && i < submenuPath.length && newParentPath[i] === submenuPath[i]) {
            i++;
        }

        if (i === newParentPath.length || i === submenuPath.length) {
            throw new Error(`trying to recursively link ${JSON.stringify(submenuPath)} into ${JSON.stringify(newParentPath)}`);
        }

        const child = this.getMenu(submenuPath) as Submenu;
        if (!child) {
            throw new Error(`Not a menu node: ${JSON.stringify(submenuPath)}`);
        }
        const newParent = this.root.getOrCreate(newParentPath, 0, newParentPath.length);
        if (MutableCompoundMenuNode.is(newParent)) {
            const link = this.menuNodeFactory.createSubmenuLink(child, order, when);
            newParent.addNode(link);
            this.fireChangeEvent();
            return Disposable.create(() => {
                newParent.removeNode(link);
                this.fireChangeEvent();
            });
        } else {
            throw new Error(`Not a compound menu node: ${JSON.stringify(newParentPath)}`);
        }
    }

    /**
     * Unregister all menu nodes with the same id as the given menu action.
     *
     * @param item the item whose id will be used.
     * @param menuPath if specified only nodes within the path will be unregistered.
     */
    unregisterMenuAction(item: MenuAction, menuPath?: MenuPath): void;
    /**
     * Unregister all menu nodes with the same id as the given command.
     *
     * @param command the command whose id will be used.
     * @param menuPath if specified only nodes within the path will be unregistered.
     */
    unregisterMenuAction(command: Command, menuPath?: MenuPath): void;
    /**
     * Unregister all menu nodes with the given id.
     *
     * @param id the id which shall be removed.
     * @param menuPath if specified only nodes within the path will be unregistered.
     */
    unregisterMenuAction(id: string, menuPath?: MenuPath): void;
    unregisterMenuAction(itemOrCommandOrId: MenuAction | Command | string, menuPath: MenuPath = []): void {
        const id = MenuAction.is(itemOrCommandOrId) ? itemOrCommandOrId.commandId
            : Command.is(itemOrCommandOrId) ? itemOrCommandOrId.id
                : itemOrCommandOrId;

        const parent = this.findInNode(this.root, menuPath, 0);
        if (parent) {
            this.removeActionInSubtree(parent, id);
        }
    }

    protected removeActionInSubtree(parent: MenuNode, id: string): void {
        if (MutableCompoundMenuNode.is(parent) && CompoundMenuNode.is(parent)) {
            const action = parent.children.find(child => child.id === id);
            if (action) {
                parent.removeNode(action);
            }
            parent.children.forEach(child => this.removeActionInSubtree(child, id));
        }
    }

    protected findInNode(root: CompoundMenuNode, menuPath: MenuPath, pathIndex: number): MenuNode | undefined {
        if (pathIndex === menuPath.length) {
            return root;
        }
        const child = root.children.find(c => c.id === menuPath[pathIndex]);
        if (CompoundMenuNode.is(child)) {
            return this.findInNode(child, menuPath, pathIndex + 1);
        }
        return undefined;
    }

    getMenuNode(menuPath: string[]): MenuNode | undefined {
        return this.findInNode(this.root, menuPath, 0);
    }

    getMenu(menuPath: MenuPath): CompoundMenuNode {
        const node = this.getMenuNode(menuPath);
        if (!CompoundMenuNode.is(node)) {
            throw new Error(`not a compound menu node: ${JSON.stringify(menuPath)}`);
        }
        return node;
    }

    protected fireChangeEvent(): void {
        if (this.isReady) {
            this.onDidChangeEmitter.fire();
        }
    }

    /**
     * Checks the given menu model whether it will show a menu with a single submenu.
     *
     * @param fullMenuModel the menu model to analyze
     * @param menuPath the menu's path
     * @returns if the menu will show a single submenu this returns a menu that will show the child elements of the submenu,
     * otherwise the given `fullMenuModel` is return
     */
    static removeSingleRootNode(fullMenuModel: CompoundMenuNode): CompoundMenuNode {

        let singleChild = undefined;

        for (const child of fullMenuModel.children) {
            if (CompoundMenuNode.is(child)) {
                if (!MenuModelRegistry.isEmpty(child)) {
                    if (singleChild) {
                        return fullMenuModel;
                    } else {
                        singleChild = child;
                    }
                }
            } else {
                return fullMenuModel;
            }
        }
        return singleChild || fullMenuModel;
    }

    static isEmpty(node: MenuNode): boolean {
        if (CompoundMenuNode.is(node)) {
            if (node.children.length === 0) {
                return true;
            }
            for (const child of node.children) {
                if (!MenuModelRegistry.isEmpty(child)) {
                    return false;
                }
            }
        } else {
            return false;
        }
        return true;
    }

}
