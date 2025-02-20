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
import { ContextKeyService, ContextMatcher } from '../../context-key-service';
import { CommandRegistry, Disposable, DisposableCollection, MenuCommandExecutor, MenuModelRegistry, MenuPath, nls } from '../../../common';
import { Anchor, ContextMenuAccess, ContextMenuRenderer } from '../../context-menu-renderer';
import { LabelIcon, LabelParser } from '../../label-parser';
import { ACTION_ITEM, codicon, ReactWidget, Widget } from '../../widgets';
import { TabBarToolbarRegistry } from './tab-bar-toolbar-registry';
import { ReactTabBarToolbarItem, TabBarDelegator, TabBarToolbarItem, TAB_BAR_TOOLBAR_CONTEXT_MENU, RenderedToolbarItem } from './tab-bar-toolbar-types';
import { KeybindingRegistry } from '../..//keybinding';

/**
 * Factory for instantiating tab-bar toolbars.
 */
export const TabBarToolbarFactory = Symbol('TabBarToolbarFactory');
export interface TabBarToolbarFactory {
    (): TabBarToolbar;
}

/**
 * Class name indicating rendering of a toolbar item without an icon but instead with a text label.
 */
const NO_ICON_CLASS = 'no-icon';

/**
 * Tab-bar toolbar widget representing the active [tab-bar toolbar items](TabBarToolbarItem).
 */
@injectable()
export class TabBarToolbar extends ReactWidget {

    protected current: Widget | undefined;
    protected inline = new Map<string, TabBarToolbarItem | ReactTabBarToolbarItem>();
    protected more = new Map<string, TabBarToolbarItem>();

    protected contextKeyListener: Disposable | undefined;
    protected toDisposeOnUpdateItems: DisposableCollection = new DisposableCollection();

    protected keybindingContextKeys = new Set<string>();

    @inject(CommandRegistry) protected readonly commands: CommandRegistry;
    @inject(LabelParser) protected readonly labelParser: LabelParser;
    @inject(MenuModelRegistry) protected readonly menus: MenuModelRegistry;
    @inject(MenuCommandExecutor) protected readonly menuCommandExecutor: MenuCommandExecutor;
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

    updateItems(items: Array<TabBarToolbarItem | ReactTabBarToolbarItem>, current: Widget | undefined): void {
        this.toDisposeOnUpdateItems.dispose();
        this.toDisposeOnUpdateItems = new DisposableCollection();
        this.inline.clear();
        this.more.clear();

        const contextKeys = new Set<string>();
        for (const item of items.sort(TabBarToolbarItem.PRIORITY_COMPARATOR).reverse()) {
            if (item.command) {
                this.commands.getAllHandlers(item.command).forEach(handler => {
                    if (handler.onDidChangeEnabled) {
                        this.toDisposeOnUpdateItems.push(handler.onDidChangeEnabled(() => this.maybeUpdate()));
                    }
                });
            }
            if ('render' in item || item.group === undefined || item.group === 'navigation') {
                this.inline.set(item.id, item);
            } else {
                this.more.set(item.id, item);
            }

            if (item.when) {
                this.contextKeyService.parseKeys(item.when)?.forEach(key => contextKeys.add(key));
            }
        }

        this.updateContextKeyListener(contextKeys);

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

    protected updateContextKeyListener(contextKeys: Set<string>): void {
        this.contextKeyListener?.dispose();
        if (contextKeys.size > 0) {
            this.contextKeyListener = this.contextKeyService.onDidChange(event => {
                if (event.affects(contextKeys)) {
                    this.maybeUpdate();
                }
            });
        }
    }

    protected render(): React.ReactNode {
        this.keybindingContextKeys.clear();
        return <React.Fragment>
            {this.renderMore()}
            {[...this.inline.values()].map(item => {
                if (ReactTabBarToolbarItem.is(item)) {
                    return item.render(this.current);
                } else {
                    return (item.menuPath && this.toolbarRegistry.isNonEmptyMenu(item, this.current) ? this.renderMenuItem(item) : this.renderItem(item));
                }
            })}
        </React.Fragment>;
    }

    protected resolveKeybindingForCommand(command: string | undefined): string {
        let result = '';
        if (command) {
            const bindings = this.keybindings.getKeybindingsForCommand(command);
            let found = false;
            if (bindings && bindings.length > 0) {
                bindings.forEach(binding => {
                    if (binding.when) {
                        this.contextKeyService.parseKeys(binding.when)?.forEach(key => this.keybindingContextKeys.add(key));
                    }
                    if (!found && this.keybindings.isEnabledInScope(binding, this.current?.node)) {
                        found = true;
                        result = ` (${this.keybindings.acceleratorFor(binding, '+')})`;
                    }
                });
            }
        }
        return result;
    }

    protected renderItem(item: RenderedToolbarItem): React.ReactNode {
        let innerText = '';
        const classNames = [];
        const command = item.command ? this.commands.getCommand(item.command) : undefined;
        // Fall back to the item ID in extremis so there is _something_ to render in the
        // case that there is neither an icon nor a title
        const itemText = item.text || command?.label || command?.id || item.id;
        if (itemText) {
            for (const labelPart of this.labelParser.parse(itemText)) {
                if (LabelIcon.is(labelPart)) {
                    const className = `fa fa-${labelPart.name}${labelPart.animation ? ' fa-' + labelPart.animation : ''}`;
                    classNames.push(...className.split(' '));
                } else {
                    innerText = labelPart;
                }
            }
        }
        const iconClass = (typeof item.icon === 'function' && item.icon()) || item.icon as string || (command && command.iconClass);
        if (iconClass) {
            classNames.push(iconClass);
        }
        const tooltipText = item.tooltip || (command && command.label) || '';
        const tooltip = `${this.labelParser.stripIcons(tooltipText)}${this.resolveKeybindingForCommand(command?.id)}`;

        // Only present text if there is no icon
        if (classNames.length) {
            innerText = '';
        } else if (innerText) {
            // Make room for the label text
            classNames.push(NO_ICON_CLASS);
        }

        // In any case, this is an action item, with or without icon.
        classNames.push(ACTION_ITEM);

        const toolbarItemClassNames = this.getToolbarItemClassNames(item);
        return <div key={item.id}
            className={toolbarItemClassNames.join(' ')}
            onMouseDown={this.onMouseDownEvent}
            onMouseUp={this.onMouseUpEvent}
            onMouseOut={this.onMouseUpEvent} >
            <div id={item.id} className={classNames.join(' ')}
                onClick={e => this.executeCommand(e, item)}
                title={tooltip}>{innerText}
            </div>
        </div>;
    }

    protected isEnabled(item: TabBarToolbarItem): boolean {
        if (!!item.command) {
            return this.commandIsEnabled(item.command) && this.evaluateWhenClause(item.when);
        } else {
            return !!item.menuPath;
        }
    }

    protected getToolbarItemClassNames(item: TabBarToolbarItem): string[] {
        const classNames = [TabBarToolbar.Styles.TAB_BAR_TOOLBAR_ITEM];
        if (item.command) {
            if (this.isEnabled(item)) {
                classNames.push('enabled');
            }
            if (this.commandIsToggled(item.command)) {
                classNames.push('toggled');
            }
        } else {
            if (this.isEnabled(item)) {
                classNames.push('enabled');
            }
        }
        return classNames;
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
        const anchor = this.toAnchor(event);
        this.renderMoreContextMenu(anchor);
    };

    protected toAnchor(event: React.MouseEvent): Anchor {
        const itemBox = event.currentTarget.closest('.' + TabBarToolbar.Styles.TAB_BAR_TOOLBAR_ITEM)?.getBoundingClientRect();
        return itemBox ? { y: itemBox.bottom, x: itemBox.left } : event.nativeEvent;
    }

    renderMoreContextMenu(anchor: Anchor, subpath?: MenuPath): ContextMenuAccess {
        const toDisposeOnHide = new DisposableCollection();
        this.addClass('menu-open');
        toDisposeOnHide.push(Disposable.create(() => this.removeClass('menu-open')));
        if (subpath) {
            toDisposeOnHide.push(this.menus.linkSubmenu(TAB_BAR_TOOLBAR_CONTEXT_MENU, subpath));
        } else {
            for (const item of this.more.values()) {
                if (item.menuPath && !item.command) {
                    toDisposeOnHide.push(this.menus.linkSubmenu(TAB_BAR_TOOLBAR_CONTEXT_MENU, item.menuPath, undefined, item.group));
                } else if (item.command) {
                    // Register a submenu for the item, if the group is in format `<submenu group>/<submenu name>/.../<item group>`
                    if (item.group?.includes('/')) {
                        const split = item.group.split('/');
                        const paths: string[] = [];
                        for (let i = 0; i < split.length - 1; i += 2) {
                            paths.push(split[i], split[i + 1]);
                            toDisposeOnHide.push(this.menus.registerSubmenu([...TAB_BAR_TOOLBAR_CONTEXT_MENU, ...paths], split[i + 1], { order: item.order }));
                        }
                    }
                    toDisposeOnHide.push(this.menus.registerMenuAction([...TAB_BAR_TOOLBAR_CONTEXT_MENU, ...item.group!.split('/')], {
                        label: (item as RenderedToolbarItem).tooltip,
                        commandId: item.command,
                        when: item.when,
                        order: item.order
                    }));
                }
            }
        }
        return this.contextMenuRenderer.render({
            menuPath: TAB_BAR_TOOLBAR_CONTEXT_MENU,
            args: [this.current],
            anchor,
            context: this.current?.node || this.node,
            onHide: () => toDisposeOnHide.dispose(),
            skipSingleRootNode: true,
        });
    }

    /**
     * Renders a toolbar item that is a menu, presenting it as a button with a little
     * chevron decoration that pops up a floating menu when clicked.
     *
     * @param item a toolbar item that is a menu item
     * @returns the rendered toolbar item
     */
    protected renderMenuItem(item: RenderedToolbarItem): React.ReactNode {
        const command = item.command ? this.commands.getCommand(item.command) : undefined;
        const icon = (typeof item.icon === 'function' && item.icon()) || item.icon as string || (command && command.iconClass) || 'ellipsis';

        let contextMatcher: ContextMatcher = this.contextKeyService;
        if (item.contextKeyOverlays) {
            contextMatcher = this.contextKeyService.createOverlay(Object.keys(item.contextKeyOverlays).map(key => [key, item.contextKeyOverlays![key]]));
        }

        return <div key={item.id}
            className={TabBarToolbar.Styles.TAB_BAR_TOOLBAR_ITEM + ' enabled menu'}
        >
            <div className={codicon(icon, true)}
                title={item.text}
                onClick={e => this.executeCommand(e, item)}
            />
            <div className={ACTION_ITEM} onClick={event => this.showPopupMenu(item.menuPath!, event, contextMatcher)}>
                <div className={codicon('chevron-down') + ' chevron'} />
            </div>

        </div >;
    }

    /**
     * Presents the menu to popup on the `event` that is the clicking of
     * a menu toolbar item.
     *
     * @param menuPath the path of the registered menu to show
     * @param event the mouse event triggering the menu
     */
    protected showPopupMenu = (menuPath: MenuPath, event: React.MouseEvent, contextMatcher: ContextMatcher) => {
        event.stopPropagation();
        event.preventDefault();
        const anchor = this.toAnchor(event);
        this.renderPopupMenu(menuPath, anchor, contextMatcher);
    };

    /**
     * Renders the menu popped up on a menu toolbar item.
     *
     * @param menuPath the path of the registered menu to render
     * @param anchor a description of where to render the menu
     * @returns platform-specific access to the rendered context menu
     */
    protected renderPopupMenu(menuPath: MenuPath, anchor: Anchor, contextMatcher: ContextMatcher): ContextMenuAccess {
        const toDisposeOnHide = new DisposableCollection();
        this.addClass('menu-open');
        toDisposeOnHide.push(Disposable.create(() => this.removeClass('menu-open')));

        return this.contextMenuRenderer.render({
            menuPath,
            args: [this.current],
            anchor,
            context: this.current?.node || this.node,
            contextKeyService: contextMatcher,
            onHide: () => toDisposeOnHide.dispose()
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

    protected executeCommand(e: React.MouseEvent<HTMLElement>, item: TabBarToolbarItem): void {
        e.preventDefault();
        e.stopPropagation();

        if (!item || !this.isEnabled(item)) {
            return;
        }

        if (item.command && item.delegateMenuPath) {
            this.menuCommandExecutor.executeCommand(item.delegateMenuPath, item.command, this.current);
        } else if (item.command) {
            this.commands.executeCommand(item.command, this.current);
        } else if (item.menuPath) {
            this.renderMoreContextMenu(this.toAnchor(e), item.menuPath);
        }
        this.maybeUpdate();
    };

    protected maybeUpdate(): void {
        if (!this.isDisposed) {
            this.update();
        }
    }

    protected onMouseDownEvent = (e: React.MouseEvent<HTMLElement>) => {
        if (e.button === 0) {
            e.currentTarget.classList.add('active');
        }
    };

    protected onMouseUpEvent = (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.classList.remove('active');
    };
}

export namespace TabBarToolbar {

    export namespace Styles {

        export const TAB_BAR_TOOLBAR = 'p-TabBar-toolbar';
        export const TAB_BAR_TOOLBAR_ITEM = 'item';

    }
}
