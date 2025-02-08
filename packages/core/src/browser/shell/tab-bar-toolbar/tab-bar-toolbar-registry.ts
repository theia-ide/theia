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

import debounce = require('lodash.debounce');
import { inject, injectable, named } from 'inversify';
// eslint-disable-next-line max-len
import { CommandRegistry, ContributionProvider, Disposable, DisposableCollection, Emitter, Event, MenuModelRegistry, MenuPath } from '../../../common';
import { ContextKeyService } from '../../context-key-service';
import { FrontendApplicationContribution } from '../../frontend-application-contribution';
import { Widget } from '../../widgets';
import { ReactTabBarToolbarAction, RenderedToolbarAction } from './tab-bar-toolbar-types';
import { ToolbarMenuNodeWrapper, ToolbarSubmenuWrapper } from './tab-bar-toolbar-menu-adapters';
import { KeybindingRegistry } from '../../keybinding';
import { LabelParser } from '../../label-parser';
import { ContextMenuRenderer } from '../../context-menu-renderer';
import { CommandMenu, CompoundMenuNode, RenderedMenuNode } from '../../../common/menu';
import { ReactToolbarItemImpl, RenderedToolbarItemImpl, TabBarToolbarItem } from './tab-toolbar-item';

/**
 * Clients should implement this interface if they want to contribute to the tab-bar toolbar.
 */
export const TabBarToolbarContribution = Symbol('TabBarToolbarContribution');
/**
 * Representation of a tabbar toolbar contribution.
 */
export interface TabBarToolbarContribution {
    /**
     * Registers toolbar items.
     * @param registry the tabbar toolbar registry.
     */
    registerToolbarItems(registry: TabBarToolbarRegistry): void;
}

const menuDelegateSeparator = '=@=';
interface MenuDelegate {
    menuPath: MenuPath;
    isVisible(widget?: Widget): boolean;
}
/**
 * Main, shared registry for tab-bar toolbar items.
 */
@injectable()
export class TabBarToolbarRegistry implements FrontendApplicationContribution {

    protected items = new Map<string, TabBarToolbarItem>();
    protected menuDelegates = new Map<string, MenuDelegate>();

    @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry;
    @inject(ContextKeyService) protected readonly contextKeyService: ContextKeyService;
    @inject(MenuModelRegistry) protected readonly menuRegistry: MenuModelRegistry;
    @inject(KeybindingRegistry) protected readonly keybindingRegistry: KeybindingRegistry;
    @inject(LabelParser) protected readonly labelParser: LabelParser;
    @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(ContributionProvider) @named(TabBarToolbarContribution)
    protected readonly contributionProvider: ContributionProvider<TabBarToolbarContribution>;

    protected readonly onDidChangeEmitter = new Emitter<void>();
    readonly onDidChange: Event<void> = this.onDidChangeEmitter.event;
    // debounce in order to avoid to fire more than once in the same tick
    protected fireOnDidChange = debounce(() => this.onDidChangeEmitter.fire(undefined), 0);

    onStart(): void {
        const contributions = this.contributionProvider.getContributions();
        for (const contribution of contributions) {
            contribution.registerToolbarItems(this);
        }
    }

    /**
     * Registers the given item. Throws an error, if the corresponding command cannot be found or an item has been already registered for the desired command.
     *
     * @param item the item to register.
     */
    registerItem(item: RenderedToolbarAction | ReactTabBarToolbarAction): Disposable {
        if (ReactTabBarToolbarAction.is(item)) {
            return this.doRegisterItem(new ReactToolbarItemImpl(this.commandRegistry, this.contextKeyService, item));
        } else {
            if (item.menuPath) {
                return this.doRegisterItem(new ToolbarSubmenuWrapper(item.menuPath,
                    this.commandRegistry, this.menuRegistry, this.contextKeyService, this.contextMenuRenderer, item));
            } else {
                return this.doRegisterItem(new RenderedToolbarItemImpl(this.commandRegistry, this.contextKeyService, this.keybindingRegistry, this.labelParser, item));
            }
        }
    }

    doRegisterItem(item: TabBarToolbarItem): Disposable {
        if (this.items.has(item.id)) {
            throw new Error(`A toolbar item is already registered with the '${item.id}' ID.`);
        }
        this.items.set(item.id, item);
        this.fireOnDidChange();
        const toDispose = new DisposableCollection(
            Disposable.create(() => this.fireOnDidChange()),
            Disposable.create(() => {
                this.items.delete(item.id);
            })
        );
        if (item.onDidChange) {
            toDispose.push(item.onDidChange(() => this.fireOnDidChange()));
        }
        return toDispose;
    }

    /**
     * Returns an array of tab-bar toolbar items which are visible when the `widget` argument is the current one.
     *
     * By default returns with all items where the command is enabled and `item.isVisible` is `true`.
     */
    visibleItems(widget: Widget): Array<TabBarToolbarItem> {
        if (widget.isDisposed) {
            return [];
        }
        const result: Array<TabBarToolbarItem> = [];
        for (const item of this.items.values()) {
            if (item.isVisible(widget)) {
                result.push(item);
            }
        }

        for (const delegate of this.menuDelegates.values()) {
            if (delegate.isVisible(widget)) {
                const menu = this.menuRegistry.getMenu(delegate.menuPath)!;
                for (const child of menu.children) {
                    if (child.isVisible([...delegate.menuPath, child.id], this.contextKeyService, widget.node)) {
                        if (CompoundMenuNode.is(child)) {
                            for (const grandchild of child.children) {
                                if (grandchild.isVisible([...delegate.menuPath, child.id, grandchild.id], this.contextKeyService, widget.node) && RenderedMenuNode.is(grandchild)) {
                                    result.push(new ToolbarMenuNodeWrapper([...delegate.menuPath, child.id, grandchild.id], this.commandRegistry, this.menuRegistry,
                                        this.contextKeyService, this.contextMenuRenderer, grandchild, child.id, delegate.menuPath));
                                }
                            }
                        } else if (CommandMenu.is(child)) {
                            result.push(new ToolbarMenuNodeWrapper([...delegate.menuPath, child.id], this.commandRegistry, this.menuRegistry,
                                this.contextKeyService, this.contextMenuRenderer, child, undefined, delegate.menuPath));
                        }
                    }
                }
            }
        }
        return result;
    }

    unregisterItem(id: string): void {
        if (this.items.delete(id)) {
            this.fireOnDidChange();
        }
    }

    registerMenuDelegate(menuPath: MenuPath, when?: ((widget: Widget) => boolean)): Disposable {
        const id = this.toElementId(menuPath);
        if (!this.menuDelegates.has(id)) {

            this.menuDelegates.set(id, {
                menuPath, isVisible: (widget: Widget) => !when || when(widget)
            });
            this.fireOnDidChange();
            return { dispose: () => this.unregisterMenuDelegate(menuPath) };
        }
        console.warn('Unable to register menu delegate. Delegate has already been registered', menuPath);
        return Disposable.NULL;
    }

    unregisterMenuDelegate(menuPath: MenuPath): void {
        if (this.menuDelegates.delete(this.toElementId(menuPath))) {
            this.fireOnDidChange();
        }
    }

    /**
     * Generate a single ID string from a menu path that
     * is likely to be unique amongst the items in the toolbar.
     *
     * @param menuPath a menubar path
     * @returns a likely unique ID based on the path
     */
    toElementId(menuPath: MenuPath): string {
        return menuPath.join(menuDelegateSeparator);
    }

}
