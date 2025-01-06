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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { injectable, inject } from 'inversify';
import { CompoundMenuNode, MenuModelRegistry, MenuPath } from '../common/menu';
import { Disposable, DisposableCollection } from '../common/disposable';
import { ContextKeyService, ContextMatcher } from './context-key-service';

export interface Coordinate { x: number; y: number; }
export const Coordinate = Symbol('Coordinate');

export type Anchor = MouseEvent | Coordinate;

export function coordinateFromAnchor(anchor: Anchor): Coordinate {
    const { x, y } = anchor instanceof MouseEvent ? { x: anchor.clientX, y: anchor.clientY } : anchor;
    return { x, y };
}

export abstract class ContextMenuAccess implements Disposable {

    protected readonly toDispose = new DisposableCollection();
    readonly onDispose = this.toDispose.onDispose;

    constructor(toClose: Disposable) {
        this.toDispose.push(toClose);
    }

    get disposed(): boolean {
        return this.toDispose.disposed;
    }

    dispose(): void {
        this.toDispose.dispose();
    }

}

@injectable()
export abstract class ContextMenuRenderer {

    @inject(MenuModelRegistry) menuRegistry: MenuModelRegistry;
    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    protected _current: ContextMenuAccess | undefined;
    protected readonly toDisposeOnSetCurrent = new DisposableCollection();
    /**
     * Currently opened context menu.
     * Rendering a new context menu will close the current.
     */
    get current(): ContextMenuAccess | undefined {
        return this._current;
    }
    protected setCurrent(current: ContextMenuAccess | undefined): void {
        if (this._current === current) {
            return;
        }
        this.toDisposeOnSetCurrent.dispose();
        this._current = current;
        if (current) {
            this.toDisposeOnSetCurrent.push(current.onDispose(() => {
                this._current = undefined;
            }));
            this.toDisposeOnSetCurrent.push(current);
        }
    }

    render(options: RenderContextMenuOptions): ContextMenuAccess {
        let menu = CompoundMenuNode.is(options.menu) ? options.menu : this.menuRegistry.getMenu(options.menuPath);

        const resolvedOptions = this.resolve(options);

        if (resolvedOptions.skipSingleRootNode) {
            menu = MenuModelRegistry.removeSingleRootNode(menu);
        }

        const access = this.doRender(options.menuPath, menu, resolvedOptions.anchor, options.contextKeyService || this.contextKeyService, resolvedOptions.args,
            resolvedOptions.context, resolvedOptions.onHide);
        this.setCurrent(access);
        return access;
    }

    protected abstract doRender(
        menuPath: MenuPath,
        menu: CompoundMenuNode,
        anchor: Anchor,
        contextMatcher: ContextMatcher,
        args?: any[],
        context?: HTMLElement,
        onHide?: () => void
    ): ContextMenuAccess;

    protected resolve(options: RenderContextMenuOptions): RenderContextMenuOptions {
        const args: any[] = options.args ? options.args.slice() : [];
        if (options.includeAnchorArg !== false) {
            args.push(options.anchor);
        }
        return {
            ...options,
            args
        };
    }

}

export interface RenderContextMenuOptions {
    menu?: CompoundMenuNode,
    menuPath: MenuPath;
    anchor: Anchor;
    args?: any[];
    /**
     * Whether the anchor should be passed as an argument to the handlers of commands for this context menu.
     * If true, the anchor will be appended to the list of arguments or passed as the only argument if no other
     * arguments are supplied.
     * Default is `true`.
     */
    includeAnchorArg?: boolean;
    /**
     * A DOM context to use when evaluating any `when` clauses
     * of menu items registered for this item.
     */
    context?: HTMLElement;
    contextKeyService?: ContextMatcher;
    onHide?: () => void;
    /**
     * If true a single submenu in the context menu is not rendered but its children are rendered on the top level.
     * Default is `false`.
     */
    skipSingleRootNode?: boolean;
}
