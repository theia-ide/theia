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
import { Command, CommandRegistry } from '../command';
import { ContributionProvider } from '../contribution-provider';
import { Disposable } from '../disposable';
import { Emitter, Event } from '../event';
import { ActionMenuNode } from './action-menu-node';
import { CompositeMenuNode, CompositeMenuNodeWrapper } from './composite-menu-node';
import { CompoundMenuNode, MenuAction, MenuNode, MenuNodeMetadata, MenuPath, MutableCompoundMenuNode, SubMenuOptions } from './menu-types';

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

export enum ChangeKind {
    ADDED,
    REMOVED,
    CHANGED,
    LINKED
}

export interface MenuChangedEvent {
    kind: ChangeKind;
    path: MenuPath
}

export interface StructuralMenuChange extends MenuChangedEvent {
    kind: ChangeKind.ADDED | ChangeKind.REMOVED | ChangeKind.LINKED;
    affectedChildId: string
}

export namespace StructuralMenuChange {
    export function is(evt: MenuChangedEvent): evt is StructuralMenuChange {
        return evt.kind !== ChangeKind.CHANGED;
    }
}

/**
 * The MenuModelRegistry allows to register and unregister menus, submenus and actions
 * via strings and {@link MenuAction}s without the need to access the underlying UI
 * representation.
 */
@injectable()
export class MenuModelRegistry {
    protected readonly root = new CompositeMenuNode('');
    protected readonly independentSubmenus = new Map<string, MutableCompoundMenuNode>();

    protected readonly onDidChangeEmitter = new Emitter<MenuChangedEvent>();

    get onDidChange(): Event<MenuChangedEvent> {
        return this.onDidChangeEmitter.event;
    }

    protected isReady = false;

    constructor(
        @inject(ContributionProvider) @named(MenuContribution)
        protected readonly contributions: ContributionProvider<MenuContribution>,
        @inject(CommandRegistry) protected readonly commands: CommandRegistry
    ) { }

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
    registerMenuAction(menuPath: MenuPath, item: MenuAction): Disposable {
        const menuNode = new ActionMenuNode(item, this.commands);
        return this.registerMenuNode(menuPath, menuNode);
    }

    /**
     * Adds the given menu node to the menu denoted by the given path.
     *
     * @returns a disposable which, when called, will remove the menu node again.
     */
    registerMenuNode(menuPath: MenuPath | string, menuNode: MenuNode, group?: string): Disposable {
        const parent = this.getMenuNode(menuPath, group);
        const disposable = parent.addNode(menuNode);
        const parentPath = this.getParentPath(menuPath, group);
        this.fireChangeEvent({
            kind: ChangeKind.ADDED,
            path: parentPath,
            affectedChildId: menuNode.id
        });
        return this.changeEventOnDispose(parentPath, menuNode.id, disposable);
    }

    protected getParentPath(menuPath: MenuPath | string, group?: string): string[] {
        if (typeof menuPath === 'string') {
            return group ? [menuPath, group] : [menuPath];
        } else {
            return group ? menuPath.concat(group) : menuPath;
        }
    }

    getMenuNode(menuPath: MenuPath | string, group?: string): MutableCompoundMenuNode {
        if (typeof menuPath === 'string') {
            const target = this.independentSubmenus.get(menuPath);
            if (!target) { throw new Error(`Could not find submenu with id ${menuPath}`); }
            if (group) {
                return this.findSubMenu(target, group);
            }
            return target;
        } else {
            return this.findGroup(group ? menuPath.concat(group) : menuPath);
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
    registerSubmenu(menuPath: MenuPath, label: string, options?: SubMenuOptions): Disposable {
        if (menuPath.length === 0) {
            throw new Error('The sub menu path cannot be empty.');
        }
        const index = menuPath.length - 1;
        const menuId = menuPath[index];
        const groupPath = index === 0 ? [] : menuPath.slice(0, index);
        const parent = this.findGroup(groupPath, options);
        let groupNode = this.findSubMenu(parent, menuId, options);
        let disposable = Disposable.NULL;
        if (!groupNode) {
            groupNode = new CompositeMenuNode(menuId, label, options, parent);
            disposable = this.changeEventOnDispose(groupPath, menuId, parent.addNode(groupNode));
            this.fireChangeEvent({
                kind: ChangeKind.ADDED,
                path: groupPath,
                affectedChildId: menuId
            });
        } else {
            this.fireChangeEvent({
                kind: ChangeKind.CHANGED,
                path: groupPath,
            });
            groupNode.updateOptions({ ...options, label });
        }
        return disposable;
    }

    registerIndependentSubmenu(id: string, label: string, options?: SubMenuOptions): Disposable {
        if (this.independentSubmenus.has(id)) {
            console.debug(`Independent submenu with path ${id} registered, but given ID already exists.`);
        }
        this.independentSubmenus.set(id, new CompositeMenuNode(id, label, options));
        return this.changeEventOnDispose([], id, Disposable.create(() => this.independentSubmenus.delete(id)));
    }

    linkSubmenu(parentPath: MenuPath | string, childId: string | MenuPath, options?: SubMenuOptions, group?: string): Disposable {
        const child = this.getMenuNode(childId);
        const parent = this.getMenuNode(parentPath, group);
        const affectedPath = this.getParentPath(parentPath, group);

        const isRecursive = (node: MenuNodeMetadata, childNode: MenuNodeMetadata): boolean => {
            if (node.id === childNode.id) {
                return true;
            }
            if (node.parent) {
                return isRecursive(node.parent, childNode);
            }
            return false;
        };

        // check for menu contribution recursion
        if (isRecursive(parent, child)) {
            console.warn(`Recursive menu contribution detected: ${child.id} is already in hierarchy of ${parent.id}.`);
            return Disposable.NULL;
        }

        const wrapper = new CompositeMenuNodeWrapper(child, parent, options);
        const disposable = parent.addNode(wrapper);
        this.fireChangeEvent({
            kind: ChangeKind.LINKED,
            path: affectedPath,
            affectedChildId: child.id

        });
        return this.changeEventOnDispose(affectedPath, child.id, disposable);
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
    unregisterMenuAction(itemOrCommandOrId: MenuAction | Command | string, menuPath?: MenuPath): void {
        const id = MenuAction.is(itemOrCommandOrId) ? itemOrCommandOrId.commandId
            : Command.is(itemOrCommandOrId) ? itemOrCommandOrId.id
                : itemOrCommandOrId;

        if (menuPath) {
            const parent = this.findGroup(menuPath);
            parent.removeNode(id);
            this.fireChangeEvent({
                kind: ChangeKind.REMOVED,
                path: menuPath,
                affectedChildId: id
            });
        } else {
            this.unregisterMenuNode(id);
        }
    }

    /**
     * Recurse all menus, removing any menus matching the `id`.
     *
     * @param id technical identifier of the `MenuNode`.
     */
    unregisterMenuNode(id: string): void {
        const parentPath: string[] = [];
        const recurse = (root: MutableCompoundMenuNode) => {
            root.children.forEach(node => {
                if (CompoundMenuNode.isMutable(node)) {
                    if (node.removeNode(id)) {
                        this.fireChangeEvent({
                            kind: ChangeKind.REMOVED,
                            path: parentPath,
                            affectedChildId: id
                        });
                    }
                    parentPath.push(node.id);
                    recurse(node);
                    parentPath.pop();
                }
            });
        };
        recurse(this.root);
    }

    /**
     * Finds a submenu as a descendant of the `root` node.
     * See {@link MenuModelRegistry.findSubMenu findSubMenu}.
     */
    protected findGroup(menuPath: MenuPath, options?: SubMenuOptions): MutableCompoundMenuNode {
        let currentMenu: MutableCompoundMenuNode = this.root;
        for (const segment of menuPath) {
            currentMenu = this.findSubMenu(currentMenu, segment, options);
        }
        return currentMenu;
    }

    /**
     * Finds or creates a submenu as an immediate child of `current`.
     * @throws if a node with the given `menuId` exists but is not a {@link MutableCompoundMenuNode}.
     */
    protected findSubMenu(current: MutableCompoundMenuNode, menuId: string, options?: SubMenuOptions): MutableCompoundMenuNode {
        const sub = current.children.find(e => e.id === menuId);
        if (CompoundMenuNode.isMutable(sub)) {
            return sub;
        }
        if (sub) {
            throw new Error(`'${menuId}' is not a menu group.`);
        }
        const newSub = new CompositeMenuNode(menuId, undefined, options, current);
        current.addNode(newSub);
        return newSub;
    }

    /**
     * Returns the menu at the given path.
     *
     * @param menuPath the path specifying the menu to return. If not given the empty path will be used.
     *
     * @returns the root menu when `menuPath` is empty. If `menuPath` is not empty the specified menu is
     * returned if it exists, otherwise an error is thrown.
     */
    getMenu(menuPath: MenuPath = []): MutableCompoundMenuNode {
        return this.findGroup(menuPath);
    }

    /**
     * Checks the given menu model whether it will show a menu with a single submenu.
     *
     * @param fullMenuModel the menu model to analyze
     * @param menuPath the menu's path
     * @returns if the menu will show a single submenu this returns a menu that will show the child elements of the submenu,
     * otherwise the given `fullMenuModel` is return
     */
    removeSingleRootNode(fullMenuModel: MutableCompoundMenuNode, menuPath: MenuPath): CompoundMenuNode {
        // check whether all children are compound menus and that there is only one child that has further children
        if (!this.allChildrenCompound(fullMenuModel.children)) {
            return fullMenuModel;
        }
        let nonEmptyNode = undefined;
        for (const child of fullMenuModel.children) {
            if (!this.isEmpty(child.children || [])) {
                if (nonEmptyNode === undefined) {
                    nonEmptyNode = child;
                } else {
                    return fullMenuModel;
                }
            }
        }

        if (CompoundMenuNode.is(nonEmptyNode) && nonEmptyNode.children.length === 1 && CompoundMenuNode.is(nonEmptyNode.children[0])) {
            nonEmptyNode = nonEmptyNode.children[0];
        }

        return CompoundMenuNode.is(nonEmptyNode) ? nonEmptyNode : fullMenuModel;
    }

    protected allChildrenCompound(children: ReadonlyArray<MenuNode>): boolean {
        return children.every(CompoundMenuNode.is);
    }

    protected isEmpty(children: ReadonlyArray<MenuNode>): boolean {
        if (children.length === 0) {
            return true;
        }
        if (!this.allChildrenCompound(children)) {
            return false;
        }
        for (const child of children) {
            if (!this.isEmpty(child.children || [])) {
                return false;
            }
        }
        return true;
    }

    protected changeEventOnDispose(path: MenuPath, id: string, disposable: Disposable): Disposable {
        return Disposable.create(() => {
            disposable.dispose();
            this.fireChangeEvent({
                path,
                affectedChildId: id,
                kind: ChangeKind.REMOVED
            });
        });
    }

    protected fireChangeEvent<T extends MenuChangedEvent>(evt: T): void {
        if (this.isReady) {
            this.onDidChangeEmitter.fire(evt);
        }
    }

    /**
     * Returns the {@link MenuPath path} at which a given menu node can be accessed from this registry, if it can be determined.
     * Returns `undefined` if the `parent` of any node in the chain is unknown.
     */
    getPath(node: MenuNode): MenuPath | undefined {
        const identifiers = [];
        const visited: MenuNode[] = [];
        let next: MenuNode | undefined = node;

        while (next && !visited.includes(next)) {
            if (next === this.root) {
                return identifiers.reverse();
            }
            visited.push(next);
            identifiers.push(next.id);
            next = next.parent;
        }
        return undefined;
    }
}
