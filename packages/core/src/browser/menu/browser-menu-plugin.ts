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

import { injectable, inject } from 'inversify';
import { MenuBar, Menu as MenuWidget, Widget } from '@phosphor/widgets';
import { CommandRegistry as PhosphorCommandRegistry } from '@phosphor/commands';
import {
    environment, DisposableCollection,
    AcceleratorSource
} from '../../common';
import { KeybindingRegistry } from '../keybinding';
import { FrontendApplication } from '../frontend-application';
import { FrontendApplicationContribution } from '../frontend-application-contribution';
import { ContextKeyService, ContextMatcher } from '../context-key-service';
import { ContextMenuContext } from './context-menu-context';
import { waitForRevealed } from '../widgets';
import { ApplicationShell } from '../shell';
import { CorePreferences } from '../core-preferences';
import { PreferenceService } from '../preferences/preference-service';
import { CommandMenu, CompoundMenuNode, MAIN_MENU_BAR, MenuNode, MenuPath, RenderedMenuNode, Submenu } from '../../common/menu/menu-types';
import { MenuModelRegistry } from '../../common/menu/menu-model-registry';

export abstract class MenuBarWidget extends MenuBar {
    abstract activateMenu(label: string, ...labels: string[]): Promise<MenuWidget>;
    abstract triggerMenuItem(label: string, ...labels: string[]): Promise<MenuWidget.IItem>;
}

export interface BrowserMenuOptions extends MenuWidget.IOptions {
    context?: HTMLElement,
};

@injectable()
export class BrowserMainMenuFactory implements MenuWidgetFactory {

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    @inject(ContextMenuContext)
    protected readonly context: ContextMenuContext;

    @inject(CorePreferences)
    protected readonly corePreferences: CorePreferences;

    @inject(KeybindingRegistry)
    protected readonly keybindingRegistry: KeybindingRegistry;

    @inject(MenuModelRegistry)
    protected readonly menuProvider: MenuModelRegistry;

    createMenuBar(): MenuBarWidget {
        const menuBar = new DynamicMenuBarWidget();
        menuBar.id = 'theia:menubar';
        this.corePreferences.ready.then(() => {
            this.showMenuBar(menuBar);
        });
        const disposable = new DisposableCollection(
            this.corePreferences.onPreferenceChanged(change => {
                if (change.preferenceName === 'window.menuBarVisibility') {
                    this.showMenuBar(menuBar, change.newValue);
                }
            }),
            this.keybindingRegistry.onKeybindingsChanged(() => {
                this.showMenuBar(menuBar);
            }),
            this.menuProvider.onDidChange(() => {
                this.showMenuBar(menuBar);
            })
        );
        menuBar.disposed.connect(() => disposable.dispose());
        return menuBar;
    }

    protected getMenuBarVisibility(): string {
        return this.corePreferences.get('window.menuBarVisibility', 'classic');
    }

    protected showMenuBar(menuBar: DynamicMenuBarWidget, preference = this.getMenuBarVisibility()): void {
        if (preference && ['classic', 'visible'].includes(preference)) {
            menuBar.clearMenus();
            this.fillMenuBar(menuBar);
        } else {
            menuBar.clearMenus();
        }
    }

    protected fillMenuBar(menuBar: MenuBarWidget): void {
        const menuModel = this.menuProvider.getMenuNode(MAIN_MENU_BAR) as Submenu;
        const menuCommandRegistry = new PhosphorCommandRegistry();
        for (const menu of menuModel.children) {
            if (CompoundMenuNode.is(menu) && RenderedMenuNode.is(menu)) {
                const menuWidget = this.createMenuWidget(MAIN_MENU_BAR, menu, this.contextKeyService, { commands: menuCommandRegistry });
                menuBar.addMenu(menuWidget);
            }
        }
    }

    createContextMenu(effectiveMenuPath: MenuPath, menuModel: CompoundMenuNode, contextMatcher: ContextMatcher, args?: unknown[], context?: HTMLElement): MenuWidget {
        const menuCommandRegistry = new PhosphorCommandRegistry();
        const contextMenu = this.createMenuWidget(effectiveMenuPath, menuModel, contextMatcher, { commands: menuCommandRegistry, context }, args);
        return contextMenu;
    }

    createMenuWidget(parentPath: MenuPath, menu: CompoundMenuNode, contextMatcher: ContextMatcher, options: BrowserMenuOptions, args?: unknown[]): DynamicMenuWidget {
        return new DynamicMenuWidget(parentPath, menu, options, contextMatcher, this.services, args);
    }

    protected get services(): MenuServices {
        return {
            contextKeyService: this.contextKeyService,
            context: this.context,
            menuWidgetFactory: this,
        };
    }

}

export class DynamicMenuBarWidget extends MenuBarWidget {

    /**
     * We want to restore the focus after the menu closes.
     */
    protected previousFocusedElement: HTMLElement | undefined;

    constructor() {
        super();
        // HACK we need to hook in on private method _openChildMenu. Don't do this at home!
        DynamicMenuBarWidget.prototype['_openChildMenu'] = () => {
            if (this.activeMenu instanceof DynamicMenuWidget) {
                // `childMenu` is `null` if we open the menu. For example, menu is not shown and you click on `Edit`.
                // However, the `childMenu` is set, when `Edit` was already open and you move the mouse over `Select`.
                // We want to save the focus object for the former case only.
                if (!this.childMenu) {
                    const { activeElement } = document;
                    if (activeElement instanceof HTMLElement) {
                        this.previousFocusedElement = activeElement;
                    }
                }
                this.activeMenu.aboutToShow({ previousFocusedElement: this.previousFocusedElement });
            }
            super['_openChildMenu']();
        };
    }

    async activateMenu(label: string, ...labels: string[]): Promise<MenuWidget> {
        const menu = this.menus.find(m => m.title.label === label);
        if (!menu) {
            throw new Error(`could not find '${label}' menu`);
        }
        this.activeMenu = menu;
        this.openActiveMenu();
        await waitForRevealed(menu);

        const menuPath = [label, ...labels];

        let current = menu;
        for (const itemLabel of labels) {
            const item = current.items.find(i => i.label === itemLabel);
            if (!item || !item.submenu) {
                throw new Error(`could not find '${itemLabel}' submenu in ${menuPath.map(l => "'" + l + "'").join(' -> ')} menu`);
            }
            current.activeItem = item;
            current.triggerActiveItem();
            current = item.submenu;
            await waitForRevealed(current);
        }
        return current;
    }

    async triggerMenuItem(label: string, ...labels: string[]): Promise<MenuWidget.IItem> {
        if (!labels.length) {
            throw new Error('menu item label is not specified');
        }
        const menuPath = [label, ...labels.slice(0, labels.length - 1)];
        const menu = await this.activateMenu(menuPath[0], ...menuPath.slice(1));
        const item = menu.items.find(i => i.label === labels[labels.length - 1]);
        if (!item) {
            throw new Error(`could not find '${labels[labels.length - 1]}' item in ${menuPath.map(l => "'" + l + "'").join(' -> ')} menu`);
        }
        menu.activeItem = item;
        menu.triggerActiveItem();
        return item;
    }

}

export class MenuServices {
    readonly contextKeyService: ContextKeyService;
    readonly context: ContextMenuContext;
    readonly menuWidgetFactory: MenuWidgetFactory;
}

export interface MenuWidgetFactory {
    createMenuWidget(effectiveMenuPath: MenuPath, menu: Submenu, contextMatcher: ContextMatcher, options: BrowserMenuOptions): MenuWidget;
}

/**
 * A menu widget that would recompute its items on update.
 */
export class DynamicMenuWidget extends MenuWidget {
    private static nextCommmandId = 0;
    /**
     * We want to restore the focus after the menu closes.
     */
    protected previousFocusedElement: HTMLElement | undefined;

    constructor(
        protected readonly effectiveMenuPath: MenuPath,
        protected menu: CompoundMenuNode,
        protected options: BrowserMenuOptions,
        protected contextMatcher: ContextMatcher,
        protected services: MenuServices,
        protected args?: unknown[]
    ) {
        super(options);
        if (RenderedMenuNode.is(this.menu)) {
            if (this.menu.label) {
                this.title.label = this.menu.label;
            }
            if (this.menu.icon) {
                this.title.iconClass = this.menu.icon;
            }
        }
        this.updateSubMenus(this.effectiveMenuPath, this, this.menu, this.options.commands, this.contextMatcher, this.options.context);
    }

    public aboutToShow({ previousFocusedElement }: { previousFocusedElement: HTMLElement | undefined }): void {
        this.preserveFocusedElement(previousFocusedElement);
        this.clearItems();
        this.runWithPreservedFocusContext(() => {
            this.updateSubMenus(this.effectiveMenuPath, this, this.menu, this.options.commands, this.contextMatcher, this.options.context);
        });
    }

    public override open(x: number, y: number, options?: MenuWidget.IOpenOptions, anchor?: HTMLElement): void {
        const cb = () => {
            this.restoreFocusedElement();
            this.aboutToClose.disconnect(cb);
        };
        this.aboutToClose.connect(cb);
        this.preserveFocusedElement();
        super.open(x, y, options, anchor);
    }

    protected updateSubMenus(parentPath: MenuPath, parent: MenuWidget, menu: CompoundMenuNode, commands: PhosphorCommandRegistry,
        contextMatcher: ContextMatcher, context?: HTMLElement | undefined): void {
        const items = this.createItems(parentPath, menu.children, commands, contextMatcher, context);
        while (items[items.length - 1]?.type === 'separator') {
            items.pop();
        }
        for (const item of items) {
            parent.addItem(item);
        }
    }

    protected createItems(parentPath: MenuPath, nodes: MenuNode[], phCommandRegistry: PhosphorCommandRegistry,
        contextMatcher: ContextMatcher, context?: HTMLElement): MenuWidget.IItemOptions[] {
        const result: MenuWidget.IItemOptions[] = [];

        for (const node of nodes) {
            const nodePath = [...parentPath, node.id];
            if (node.isVisible(nodePath, contextMatcher, context, ...(this.args || []))) {
                if (CompoundMenuNode.is(node)) {
                    if (RenderedMenuNode.is(node)) {
                        const submenu = this.services.menuWidgetFactory.createMenuWidget(nodePath, node, this.contextMatcher, this.options);
                        if (submenu.items.length > 0) {
                            result.push({ type: 'submenu', submenu });
                        }
                    } else {
                        const items = this.createItems(nodePath, node.children, phCommandRegistry, contextMatcher, context);
                        if (items.length > 0) {
                            if (node.id !== 'inline') {
                                result.push({ type: 'separator' });
                            }
                            result.push(...items);
                            if (node.id !== 'inline') {
                                result.push({ type: 'separator' });
                            }
                        }
                    }
                } else if (CommandMenu.is(node)) {
                    const id = !phCommandRegistry.hasCommand(node.id) ? node.id : `${node.id}:${DynamicMenuWidget.nextCommmandId++}`;
                    phCommandRegistry.addCommand(id, {
                        execute: () => { node.run(nodePath, ...(this.args || [])); },
                        isEnabled: () => node.isEnabled(nodePath, ...(this.args || [])),
                        isToggled: () => node.isToggled ? !!node.isToggled(nodePath, ...(this.args || [])) : false,
                        isVisible: () => true,
                        label: node.label,
                        icon: node.icon,
                    });

                    const accelerator = (AcceleratorSource.is(node) ? node.getAccelerator(this.options.context) : []);
                    if (accelerator.length > 0) {
                        phCommandRegistry.addKeyBinding({
                            command: id,
                            keys: accelerator,
                            selector: '.p-Widget' // We have the PhosphorJS dependency anyway.
                        });
                    }
                    result.push({
                        command: id,
                        type: 'command'
                    });
                }
            }
        }
        return result;
    }

    protected preserveFocusedElement(previousFocusedElement: Element | null = document.activeElement): boolean {
        if (!this.previousFocusedElement && previousFocusedElement instanceof HTMLElement) {
            this.previousFocusedElement = previousFocusedElement;
            return true;
        }
        return false;
    }

    protected restoreFocusedElement(): boolean {
        if (this.previousFocusedElement) {
            this.previousFocusedElement.focus({ preventScroll: true });
            this.previousFocusedElement = undefined;
            return true;
        }
        return false;
    }

    protected runWithPreservedFocusContext(what: () => void): void {
        let focusToRestore: HTMLElement | undefined = undefined;
        const { activeElement } = document;
        if (this.previousFocusedElement && activeElement instanceof HTMLElement && this.previousFocusedElement !== activeElement) {
            focusToRestore = activeElement;
            this.previousFocusedElement.focus({ preventScroll: true });
        }
        try {
            what();
        } finally {
            if (focusToRestore) {
                focusToRestore.focus({ preventScroll: true });
            }
        }
    }

}

@injectable()
export class BrowserMenuBarContribution implements FrontendApplicationContribution {

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    constructor(
        @inject(BrowserMainMenuFactory) protected readonly factory: BrowserMainMenuFactory
    ) { }

    onStart(app: FrontendApplication): void {
        this.appendMenu(app.shell);
    }

    get menuBar(): MenuBarWidget | undefined {
        return this.shell.topPanel.widgets.find(w => w instanceof MenuBarWidget) as MenuBarWidget | undefined;
    }

    protected appendMenu(shell: ApplicationShell): void {
        const logo = this.createLogo();
        shell.addWidget(logo, { area: 'top' });
        const menu = this.factory.createMenuBar();
        shell.addWidget(menu, { area: 'top' });
        // Hiding the menu is only necessary in electron
        // In the browser we hide the whole top panel
        if (environment.electron.is()) {
            this.preferenceService.ready.then(() => {
                menu.setHidden(['compact', 'hidden'].includes(this.preferenceService.get('window.menuBarVisibility', '')));
            });
            this.preferenceService.onPreferenceChanged(change => {
                if (change.preferenceName === 'window.menuBarVisibility') {
                    menu.setHidden(['compact', 'hidden'].includes(change.newValue));
                }
            });
        }
    }

    protected createLogo(): Widget {
        const logo = new Widget();
        logo.id = 'theia:icon';
        logo.addClass('theia-icon');
        return logo;
    }
}
