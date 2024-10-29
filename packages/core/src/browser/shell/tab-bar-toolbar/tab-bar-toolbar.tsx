// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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

import { inject, injectable, postConstruct } from 'inversify';
import * as React from 'react';
import { ContextKeyService } from '../../context-key-service';
import { CommandRegistry, Disposable, DisposableCollection, nls } from '../../../common';
import { Anchor, ContextMenuAccess, ContextMenuRenderer } from '../../context-menu-renderer';
import { LabelParser } from '../../label-parser';
import { codicon, ReactWidget, Widget } from '../../widgets';
import { TabBarToolbarRegistry } from './tab-bar-toolbar-registry';
import { TabBarDelegator, TabBarToolbarAction } from './tab-bar-toolbar-types';
import { KeybindingRegistry } from '../..//keybinding';
import { TabBarToolbarItem } from './tab-toolbar-item';
import { GroupImpl, MenuModelRegistry } from '../../../common/menu';

/**
 * Factory for instantiating tab-bar toolbars.
 */
export const TabBarToolbarFactory = Symbol('TabBarToolbarFactory');
export interface TabBarToolbarFactory {
    (): TabBarToolbar;
}

export function toAnchor(event: React.MouseEvent): Anchor {
    const itemBox = event.currentTarget.closest('.' + TabBarToolbar.Styles.TAB_BAR_TOOLBAR_ITEM)?.getBoundingClientRect();
    return itemBox ? { y: itemBox.bottom, x: itemBox.left } : event.nativeEvent;
}

/**
 * Tab-bar toolbar widget representing the active [tab-bar toolbar items](TabBarToolbarItem).
 */
@injectable()
export class TabBarToolbar extends ReactWidget {

    protected current: Widget | undefined;
    protected inline = new Map<string, TabBarToolbarItem>();
    protected more = new Map<string, TabBarToolbarItem>();

    protected contextKeyListener: Disposable | undefined;
    protected toDisposeOnUpdateItems: DisposableCollection = new DisposableCollection();

    protected keybindingContextKeys = new Set<string>();

    @inject(CommandRegistry) protected readonly commands: CommandRegistry;
    @inject(LabelParser) protected readonly labelParser: LabelParser;
    @inject(MenuModelRegistry) protected readonly menus: MenuModelRegistry;
    @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer;
    @inject(TabBarToolbarRegistry) protected readonly toolbarRegistry: TabBarToolbarRegistry;
    @inject(ContextKeyService) protected readonly contextKeyService: ContextKeyService;
    @inject(KeybindingRegistry) protected readonly keybindings: KeybindingRegistry;

    constructor() {
        super();
        this.addClass(TabBarToolbar.Styles.TAB_BAR_TOOLBAR);
        this.hide();
    }

    @postConstruct()
    protected init(): void {
        this.toDispose.push(this.keybindings.onKeybindingsChanged(() => this.maybeUpdate()));

        this.toDispose.push(this.contextKeyService.onDidChange(e => {
            if (e.affects(this.keybindingContextKeys)) {
                this.maybeUpdate();
            }
        }));
    }

    updateItems(items: Array<TabBarToolbarItem>, current: Widget | undefined): void {
        this.toDisposeOnUpdateItems.dispose();
        this.toDisposeOnUpdateItems = new DisposableCollection();
        this.inline.clear();
        this.more.clear();

        for (const item of items.sort(TabBarToolbarAction.PRIORITY_COMPARATOR).reverse()) {

            if (!('toMenuNode' in item) || item.group === undefined || item.group === 'navigation') {
                this.inline.set(item.id, item);
            } else {
                this.more.set(item.id, item);
            }

            if (item.onDidChange) {
                this.toDisposeOnUpdateItems.push(item.onDidChange(() => this.maybeUpdate()));
            }
        }

        this.setCurrent(current);
        if (items.length) {
            this.show();
        } else {
            this.hide();
        }
        this.maybeUpdate();
    }

    updateTarget(current?: Widget): void {
        const operativeWidget = TabBarDelegator.is(current) ? current.getTabBarDelegate() : current;
        const items = operativeWidget ? this.toolbarRegistry.visibleItems(operativeWidget) : [];
        this.updateItems(items, operativeWidget);
    }

    protected readonly toDisposeOnSetCurrent = new DisposableCollection();
    protected setCurrent(current: Widget | undefined): void {
        this.toDisposeOnSetCurrent.dispose();
        this.toDispose.push(this.toDisposeOnSetCurrent);
        this.current = current;
        if (current) {
            const resetCurrent = () => {
                this.setCurrent(undefined);
                this.maybeUpdate();
            };
            current.disposed.connect(resetCurrent);
            this.toDisposeOnSetCurrent.push(Disposable.create(() =>
                current.disposed.disconnect(resetCurrent)
            ));
        }
    }

    protected render(): React.ReactNode {
        this.keybindingContextKeys.clear();
        return <React.Fragment>
            {this.renderMore()}
            {[...this.inline.values()].map(item => item.render(this.current))}
        </React.Fragment>;
    }

    protected renderMore(): React.ReactNode {
        return !!this.more.size && <div key='__more__' className={TabBarToolbar.Styles.TAB_BAR_TOOLBAR_ITEM + ' enabled'}>
            <div id='__more__' className={codicon('ellipsis', true)} onClick={this.showMoreContextMenu}
                title={nls.localizeByDefault('More Actions...')} />
        </div>;
    }

    protected showMoreContextMenu = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        const anchor = toAnchor(event);
        this.renderMoreContextMenu(anchor);
    };

    renderMoreContextMenu(anchor: Anchor): ContextMenuAccess {
        const toDisposeOnHide = new DisposableCollection();
        this.addClass('menu-open');
        toDisposeOnHide.push(Disposable.create(() => this.removeClass('menu-open')));

        const menu = new GroupImpl(this.contextKeyService, 'contextMenu');
        for (const item of this.more.values()) {
            if (item.toMenuNode) {
                const node = item.toMenuNode();
                if (node) {
                    menu.addNode(node);
                }
            }
        }
        return this.contextMenuRenderer.render({
            menu: menu!,
            menuPath: ['contextMenu'],
            args: [this.current],
            anchor,
            contextKeyService: this.contextKeyService,
            context: this.current?.node,
            onHide: () => toDisposeOnHide.dispose(),
            skipSingleRootNode: true,
        });
    }

    shouldHandleMouseEvent(event: MouseEvent): boolean {
        return event.target instanceof Element && this.node.contains(event.target);
    }

    protected commandIsEnabled(command: string): boolean {
        return this.commands.isEnabled(command, this.current);
    }

    protected commandIsToggled(command: string): boolean {
        return this.commands.isToggled(command, this.current);
    }

    protected evaluateWhenClause(whenClause: string | undefined): boolean {
        return whenClause ? this.contextKeyService.match(whenClause, this.current?.node) : true;
    }

    protected maybeUpdate(): void {
        if (!this.isDisposed) {
            this.update();
        }
    }
}

export namespace TabBarToolbar {

    export namespace Styles {

        export const TAB_BAR_TOOLBAR = 'p-TabBar-toolbar';
        export const TAB_BAR_TOOLBAR_ITEM = 'item';

    }
}
