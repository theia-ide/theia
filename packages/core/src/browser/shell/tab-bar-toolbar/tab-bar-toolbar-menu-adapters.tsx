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

import { Widget } from '@phosphor/widgets';
import * as React from 'react';
import { CommandRegistry, DisposableCollection, Event } from '../../../common';
import { NAVIGATION, RenderedToolbarAction } from './tab-bar-toolbar-types';
import { TabBarToolbar, toAnchor } from './tab-bar-toolbar';
import { ACTION_ITEM, codicon } from '../../widgets';
import { Anchor, ContextMenuAccess, ContextMenuRenderer } from '../../context-menu-renderer';
import { TabBarToolbarItem } from './tab-toolbar-item';
import { ContextKeyService, ContextMatcher } from '../../context-key-service';
import { CommandMenu, CompoundMenuNode, MenuModelRegistry, MenuNode, MenuPath, RenderedMenuNode } from '../../../common/menu';

export const TOOLBAR_WRAPPER_ID_SUFFIX = '-as-tabbar-toolbar-item';

abstract class AbstractToolbarMenuWrapper {

    constructor(
        protected readonly effectiveMenuPath: MenuPath,
        protected readonly commandRegistry: CommandRegistry,
        protected readonly menuRegistry: MenuModelRegistry,
        protected readonly contextKeyService: ContextKeyService,
        protected readonly contextMenuRenderer: ContextMenuRenderer) {
    }

    protected abstract menuPath?: MenuPath;
    protected abstract menuNode: MenuNode;
    protected abstract id: string;
    protected abstract icon: string | undefined;
    protected abstract tooltip: string | undefined;
    protected abstract text: string | undefined;
    protected abstract executeCommand(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;

    isEnabled(): boolean {
        if (CommandMenu.is(this.menuNode)) {
            return this.menuNode.isEnabled(this.effectiveMenuPath);
        }
        return true;
    }
    isToggled(): boolean {
        if (CommandMenu.is(this.menuNode) && this.menuNode.isToggled) {
            return !!this.menuNode.isToggled(this.effectiveMenuPath);
        }
        return false;
    }
    render(widget: Widget): React.ReactNode {
        return this.renderMenuItem(widget);
    }

    toMenuNode?(): MenuNode {
        return this.menuNode;
    }

    /**
     * Presents the menu to popup on the `event` that is the clicking of
     * a menu toolbar item.
     *
     * @param menuPath the path of the registered menu to show
     * @param event the mouse event triggering the menu
     */
    showPopupMenu(widget: Widget | undefined, menuPath: MenuPath, event: React.MouseEvent, contextMatcher: ContextMatcher): void {
        event.stopPropagation();
        event.preventDefault();
        const anchor = toAnchor(event);
        this.renderPopupMenu(widget, menuPath, this.menuNode as CompoundMenuNode, anchor, contextMatcher);
    }

    /**
     * Renders the menu popped up on a menu toolbar item.
     *
     * @param menuPath the path of the registered menu to render
     * @param anchor a description of where to render the menu
     * @returns platform-specific access to the rendered context menu
     */
    protected renderPopupMenu(widget: Widget | undefined, menuPath: MenuPath, menu: CompoundMenuNode, anchor: Anchor, contextMatcher: ContextMatcher): ContextMenuAccess {
        const toDisposeOnHide = new DisposableCollection();

        return this.contextMenuRenderer.render({
            menuPath: menuPath,
            menu: menu,
            args: [widget],
            anchor,
            context: widget?.node,
            contextKeyService: contextMatcher,
            onHide: () => toDisposeOnHide.dispose()
        });
    }

    /**
     * Renders a toolbar item that is a menu, presenting it as a button with a little
     * chevron decoration that pops up a floating menu when clicked.
     *
     * @param item a toolbar item that is a menu item
     * @returns the rendered toolbar item
     */
    protected renderMenuItem(widget: Widget): React.ReactNode {
        const icon = this.icon || 'ellipsis';
        const contextMatcher: ContextMatcher = this.contextKeyService;
        if (CompoundMenuNode.is(this.menuNode) && !this.menuNode.isEmpty(this.effectiveMenuPath, this.contextKeyService, widget.node)) {

            return <div key={this.id} className={TabBarToolbar.Styles.TAB_BAR_TOOLBAR_ITEM + ' enabled menu'}>
                <div className={codicon(icon, true)}
                    title={this.text}
                    onClick={e => this.executeCommand(e)}
                />
                <div className={ACTION_ITEM} onClick={event => this.showPopupMenu(widget, this.menuPath!, event, contextMatcher)} >
                    <div className={codicon('chevron-down') + ' chevron'} />
                </div>
            </div>;
        } else {
            return <div key={this.id} className={TabBarToolbar.Styles.TAB_BAR_TOOLBAR_ITEM + ' enabled menu'}>
                <div className={codicon(icon, true)}
                    title={this.text}
                    onClick={e => this.executeCommand(e)}
                />
            </div>;
        }
    }
}

export class ToolbarMenuNodeWrapper extends AbstractToolbarMenuWrapper implements TabBarToolbarItem {
    constructor(
        effectiveMenuPath: MenuPath,
        commandRegistry: CommandRegistry,
        menuRegistry: MenuModelRegistry,
        contextKeyService: ContextKeyService,
        contextMenuRenderer: ContextMenuRenderer,
        protected readonly menuNode: MenuNode & RenderedMenuNode,
        readonly group: string | undefined,
        readonly menuPath?: MenuPath) {
        super(effectiveMenuPath, commandRegistry, menuRegistry, contextKeyService, contextMenuRenderer);
    }

    executeCommand(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        if (CommandMenu.is(this.menuNode)) {
            this.menuNode.run(this.effectiveMenuPath);
        }
    }

    isVisible(widget: Widget): boolean {
        const menuNodeVisible = this.menuNode.isVisible(this.effectiveMenuPath, this.contextKeyService, widget.node);
        if (CommandMenu.is(this.menuNode)) {
            return menuNodeVisible;
        } else if (CompoundMenuNode.is(this.menuNode)) {
            return menuNodeVisible && !MenuModelRegistry.isEmpty(this.menuNode);
        } else {
            return menuNodeVisible;
        }
    }

    get id(): string { return this.menuNode.id + TOOLBAR_WRAPPER_ID_SUFFIX; }
    get icon(): string | undefined { return this.menuNode.icon; }
    get tooltip(): string | undefined { return this.menuNode.label; }
    get text(): string | undefined {
        return (this.group === NAVIGATION || this.group === undefined) ? undefined : this.menuNode.label;
    }
    get onDidChange(): Event<void> | undefined {
        return this.menuNode.onDidChange;
    }
}

export class ToolbarSubmenuWrapper extends AbstractToolbarMenuWrapper implements TabBarToolbarItem {
    constructor(
        effectiveMenuPath: MenuPath,
        commandRegistry: CommandRegistry,
        menuRegistry: MenuModelRegistry,
        contextKeyService: ContextKeyService,
        contextMenuRenderer: ContextMenuRenderer,
        protected readonly toolbarItem: RenderedToolbarAction
    ) {
        super(effectiveMenuPath, commandRegistry, menuRegistry, contextKeyService, contextMenuRenderer);
    }

    override isEnabled(widget?: Widget): boolean {
        return this.toolbarItem.command ? this.commandRegistry.isEnabled(this.toolbarItem.command, widget) : !!this.toolbarItem.menuPath;
    }

    protected executeCommand(e: React.MouseEvent<HTMLElement>, widget?: Widget): void {
        e.preventDefault();
        e.stopPropagation();

        if (!this.isEnabled(widget)) {
            return;
        }

        if (this.toolbarItem.command) {
            this.commandRegistry.executeCommand(this.toolbarItem.command, widget);
        }
    };

    isVisible(widget: Widget): boolean {
        const menuNode = this.menuNode;
        if (this.toolbarItem.isVisible && !this.toolbarItem.isVisible(widget)) {
            return false;
        }
        if (!menuNode.isVisible(this.effectiveMenuPath, this.contextKeyService, widget.node, widget)) {
            return false;
        }
        if (this.toolbarItem.command) {
            return true;
        }
        if (CompoundMenuNode.is(menuNode)) {
            return !menuNode.isEmpty(this.effectiveMenuPath, this.contextKeyService, widget.node, widget);
        }
        return true;
    }
    group?: string | undefined;
    priority?: number | undefined;

    get id(): string { return this.toolbarItem.id; }
    get icon(): string | undefined {
        if (typeof this.toolbarItem.icon === 'function') {
            return this.toolbarItem.icon();
        }
        if (this.toolbarItem.icon) {
            return this.toolbarItem.icon;
        }
        if (this.toolbarItem.command) {
            const command = this.commandRegistry.getCommand(this.toolbarItem.command);
            return command?.iconClass;
        }
        return undefined;
    }
    get tooltip(): string | undefined { return this.toolbarItem.tooltip; }
    get text(): string | undefined { return (this.toolbarItem.group === NAVIGATION || this.toolbarItem.group === undefined) ? undefined : this.toolbarItem.text; }
    get onDidChange(): Event<void> | undefined {
        return this.menuNode.onDidChange;
    }

    get menuPath(): MenuPath {
        return this.toolbarItem.menuPath!;
    }

    get menuNode(): MenuNode {
        return this.menuRegistry.getMenu(this.menuPath);
    }
}

