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

import { Disposable } from '../disposable';
import { CompoundMenuNode, CompoundMenuNodeRole, MenuNode, MutableCompoundMenuNode, SubMenuOptions } from './menu-types';

/**
 * Node representing a (sub)menu in the menu tree structure.
 */
export class CompositeMenuNode implements MutableCompoundMenuNode {
    protected readonly _children: MenuNode[] = [];
    public iconClass?: string;
    public order?: string;
    protected _when?: string;
    protected _role?: CompoundMenuNodeRole;

    constructor(
        public readonly id: string,
        public label?: string,
        options?: SubMenuOptions,
        readonly parent?: MenuNode & CompoundMenuNode,
    ) {
        this.updateOptions(options);
    }

    get when(): string | undefined { return this._when; }
    get icon(): string | undefined { return this.iconClass; }
    get children(): ReadonlyArray<MenuNode> { return this._children; }
    get role(): CompoundMenuNodeRole { return this._role ?? (this.label ? CompoundMenuNodeRole.Submenu : CompoundMenuNodeRole.Group); }

    addNode(node: MenuNode): Disposable {
        this._children.push(node);
        this._children.sort(CompoundMenuNode.sortChildren);
        return {
            dispose: () => {
                const idx = this._children.indexOf(node);
                if (idx >= 0) {
                    this._children.splice(idx, 1);
                }
            }
        };
    }

    removeNode(id: string): boolean {
        const idx = this._children.findIndex(n => n.id === id);
        if (idx >= 0) {
            this._children.splice(idx, 1);
            return true;
        }
        return false;
    }

    updateOptions(options?: SubMenuOptions): void {
        if (options) {
            this.iconClass = options.icon ?? options.iconClass ?? this.iconClass;
            this.label = options.label ?? this.label;
            this.order = options.order ?? this.order;
            this._role = options.role ?? this._role;
            this._when = options.when ?? this._when;
        }
    }

    get sortString(): string {
        return this.order || this.id;
    }

    get isSubmenu(): boolean {
        return Boolean(this.label);
    }

    /** @deprecated @since 1.28 use CompoundMenuNode.isNavigationGroup instead */
    static isNavigationGroup = CompoundMenuNode.isNavigationGroup;
}

export class CompositeMenuNodeWrapper implements MutableCompoundMenuNode {
    constructor(protected readonly wrapped: Readonly<MutableCompoundMenuNode>, readonly parent: CompoundMenuNode, protected readonly options?: SubMenuOptions) { }

    get id(): string { return this.wrapped.id; }

    get label(): string | undefined { return this.wrapped.label; }

    get sortString(): string { return this.options?.order || this.wrapped.sortString; }

    get isSubmenu(): boolean { return Boolean(this.label); }

    get role(): CompoundMenuNodeRole { return this.options?.role ?? this.wrapped.role; }

    get icon(): string | undefined { return this.iconClass; }

    get iconClass(): string | undefined { return this.options?.iconClass ?? this.wrapped.icon; }

    get order(): string | undefined { return this.sortString; }

    get when(): string | undefined { return this.options?.when ?? this.wrapped.when; }

    get children(): ReadonlyArray<MenuNode> { return this.wrapped.children; }

    addNode(node: MenuNode): Disposable { return this.wrapped.addNode(node); }

    removeNode(id: string): boolean { return this.wrapped.removeNode(id); }

    updateOptions(options: SubMenuOptions): void { return this.wrapped.updateOptions(options); }
}
