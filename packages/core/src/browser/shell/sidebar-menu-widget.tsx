// *****************************************************************************
// Copyright (C) 2020 Alibaba Inc. and others.
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

import { injectable, inject } from 'inversify';
import * as React from 'react';
import { ReactWidget } from '../widgets';
import { ContextMenuRenderer } from '../context-menu-renderer';
import { CompoundMenuNode, MenuModelRegistry, MenuPath } from '../../common/menu';
import { HoverService } from '../hover-service';
import { Event, Disposable, Emitter, DisposableCollection } from '../../common';
import { ContextKeyService } from '../context-key-service';

export const SidebarTopMenuWidgetFactory = Symbol('SidebarTopMenuWidgetFactory');
export const SidebarBottomMenuWidgetFactory = Symbol('SidebarBottomMenuWidgetFactory');

export interface SidebarMenu {
    id: string;
    iconClass: string;
    title: string;
    menuPath: MenuPath;
    onDidBadgeChange?: Event<number>;
    /*
     * Used to sort menus. The lower the value the lower they are placed in the sidebar.
     */
    order: number;
}

export class SidebarMenuItem implements Disposable {

    readonly menu: SidebarMenu;
    get badge(): string {
        if (this._badge <= 0) {
            return '';
        } else if (this._badge > 99) {
            return '99+';
        } else {
            return this._badge.toString();
        }
    };
    protected readonly onDidBadgeChangeEmitter = new Emitter<number>();
    readonly onDidBadgeChange: Event<number> = this.onDidBadgeChangeEmitter.event;
    protected _badge = 0;

    protected readonly toDispose = new DisposableCollection();

    constructor(menu: SidebarMenu) {
        this.menu = menu;
        if (menu.onDidBadgeChange) {
            this.toDispose.push(menu.onDidBadgeChange(value => {
                this._badge = value;
                this.onDidBadgeChangeEmitter.fire(value);
            }));
        }
    }

    dispose(): void {
        this.toDispose.dispose();
        this.onDidBadgeChangeEmitter.dispose();
    }

}

/**
 * The menu widget placed on the sidebar.
 */
@injectable()
export class SidebarMenuWidget extends ReactWidget {
    protected readonly items: SidebarMenuItem[];
    /**
     * The element that had focus when a menu rendered by this widget was activated.
     */
    protected preservedContext: HTMLElement | undefined;
    /**
     * Flag indicating whether a context menu is open. While a context menu is open, the `preservedContext` should not be cleared.
     */
    protected preservingContext = false;

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(MenuModelRegistry)
    protected readonly menuRegistry: MenuModelRegistry;

    @inject(HoverService)
    protected readonly hoverService: HoverService;

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    constructor() {
        super();
        this.items = [];
    }

    addMenu(menu: SidebarMenu): void {
        const exists = this.items.find(item => item.menu.id === menu.id);
        if (exists) {
            return;
        }
        const newItem = new SidebarMenuItem(menu);
        newItem.onDidBadgeChange(() => this.update());
        this.items.push(newItem);
        this.items.sort((a, b) => a.menu.order - b.menu.order);
        this.update();
    }

    removeMenu(menuId: string): void {
        const index = this.items.findIndex(m => m.menu.id === menuId);
        if (index !== -1) {
            this.items[index].dispose();
            this.items.splice(index, 1);
            this.update();
        }
    }

    protected readonly onMouseDown = () => {
        const { activeElement } = document;
        if (activeElement instanceof HTMLElement && !this.node.contains(activeElement)) {
            this.preservedContext = activeElement;
        }
    };

    protected readonly onMouseOut = () => {
        if (!this.preservingContext) {
            this.preservedContext = undefined;
        }
    };

    protected readonly onMouseEnter = (event: React.MouseEvent<HTMLElement, MouseEvent>, title: string) => {
        if (title && event.nativeEvent.currentTarget) {
            this.hoverService.requestHover({
                content: title,
                target: event.currentTarget,
                position: 'right'
            });
        }
    };

    protected onClick(e: React.MouseEvent<HTMLElement, MouseEvent>, menuPath: MenuPath): void {
        this.preservingContext = true;
        const button = e.currentTarget.getBoundingClientRect();
        const menu = this.menuRegistry.getMenuNode(menuPath) as CompoundMenuNode;
        this.contextMenuRenderer.render({
            menuPath: menuPath,
            menu: menu,
            includeAnchorArg: false,
            anchor: {
                x: button.left + button.width,
                y: button.top,
            },
            contextKeyService: this.contextKeyService,
            onHide: () => {
                this.preservingContext = false;
                if (this.preservedContext) {
                    this.preservedContext.focus({ preventScroll: true });
                    this.preservedContext = undefined;
                }
            }
        });
    }

    protected render(): React.ReactNode {
        return <React.Fragment>
            {this.items.map(item => this.renderItem(item))}
        </React.Fragment>;
    }

    protected renderItem(item: SidebarMenuItem): React.ReactNode {
        return <div
            key={item.menu.id}
            className='theia-sidebar-menu-item'
            onClick={e => this.onClick(e, item.menu.menuPath)}
            onMouseDown={this.onMouseDown}
            onMouseEnter={e => this.onMouseEnter(e, item.menu.title)}
            onMouseLeave={this.onMouseOut}>
            <i className={item.menu.iconClass} />
            {item.badge && <div className='theia-badge-decorator-sidebar'>{item.badge}</div>}
        </div>;
    }
}
