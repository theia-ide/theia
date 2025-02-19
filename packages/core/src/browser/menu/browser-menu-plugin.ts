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
import { Menu, MenuBar, Menu as MenuWidget, Widget } from '@lumino/widgets';
import { CommandRegistry as LuminoCommandRegistry } from '@lumino/commands';
import {
    CommandRegistry, environment, DisposableCollection, Disposable,
    MenuModelRegistry, MAIN_MENU_BAR, MenuPath, MenuNode, MenuCommandExecutor, CompoundMenuNode, CompoundMenuNodeRole, CommandMenuNode,
    ArrayUtils
} from '../../common';
import { KeybindingRegistry } from '../keybinding';
import { FrontendApplication } from '../frontend-application';
import { FrontendApplicationContribution } from '../frontend-application-contribution';
import { ContextKeyService, ContextMatcher } from '../context-key-service';
import { ContextMenuContext } from './context-menu-context';
import { Message, waitForRevealed } from '../widgets';
import { ApplicationShell } from '../shell';
import { CorePreferences } from '../core-preferences';
import { PreferenceService } from '../preferences/preference-service';
import { ElementExt } from '@lumino/domutils';

export abstract class MenuBarWidget extends MenuBar {
    abstract activateMenu(label: string, ...labels: string[]): Promise<MenuWidget>;
    abstract triggerMenuItem(label: string, ...labels: string[]): Promise<MenuWidget.IItem>;
}

export interface BrowserMenuOptions extends MenuWidget.IOptions {
    commands: MenuCommandRegistry,
    context?: HTMLElement,
    contextKeyService?: ContextMatcher;
    rootMenuPath: MenuPath
};

@injectable()
export class BrowserMainMenuFactory implements MenuWidgetFactory {

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    @inject(ContextMenuContext)
    protected readonly context: ContextMenuContext;

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    @inject(MenuCommandExecutor)
    protected readonly menuCommandExecutor: MenuCommandExecutor;

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
            this.menuProvider.onDidChange(evt => {
                if (ArrayUtils.startsWith(evt.path, MAIN_MENU_BAR)) {
                    this.showMenuBar(menuBar);
                }
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
        const menuModel = this.menuProvider.getMenu(MAIN_MENU_BAR);
        const menuCommandRegistry = this.createMenuCommandRegistry(menuModel);
        for (const menu of menuModel.children) {
            if (CompoundMenuNode.is(menu)) {
                const menuWidget = this.createMenuWidget(menu, { commands: menuCommandRegistry, rootMenuPath: MAIN_MENU_BAR });
                menuBar.addMenu(menuWidget);
            }
        }
    }

    createContextMenu(path: MenuPath, args?: unknown[], context?: HTMLElement, contextKeyService?: ContextMatcher, skipSingleRootNode?: boolean): MenuWidget {
        const menuModel = skipSingleRootNode ? this.menuProvider.removeSingleRootNode(this.menuProvider.getMenu(path), path) : this.menuProvider.getMenu(path);
        const menuCommandRegistry = this.createMenuCommandRegistry(menuModel, args).snapshot(path);
        const contextMenu = this.createMenuWidget(menuModel, { commands: menuCommandRegistry, context, rootMenuPath: path, contextKeyService });
        return contextMenu;
    }

    createMenuWidget(menu: CompoundMenuNode, options: BrowserMenuOptions): DynamicMenuWidget {
        return new DynamicMenuWidget(menu, options, this.services);
    }

    protected createMenuCommandRegistry(menu: CompoundMenuNode, args: unknown[] = []): MenuCommandRegistry {
        const menuCommandRegistry = new MenuCommandRegistry(this.services);
        this.registerMenu(menuCommandRegistry, menu, args);
        return menuCommandRegistry;
    }

    protected registerMenu(menuCommandRegistry: MenuCommandRegistry, menu: MenuNode, args: unknown[]): void {
        if (CompoundMenuNode.is(menu)) {
            menu.children.forEach(child => this.registerMenu(menuCommandRegistry, child, args));
        } else if (CommandMenuNode.is(menu)) {
            menuCommandRegistry.registerActionMenu(menu, args);
            if (CommandMenuNode.hasAltHandler(menu)) {
                menuCommandRegistry.registerActionMenu(menu.altNode, args);
            }

        }
    }

    protected get services(): MenuServices {
        return {
            context: this.context,
            contextKeyService: this.contextKeyService,
            commandRegistry: this.commandRegistry,
            keybindingRegistry: this.keybindingRegistry,
            menuWidgetFactory: this,
            commandExecutor: this.menuCommandExecutor,
        };
    }

}

export function isMenuElement(element: HTMLElement | null): boolean {
    return !!element && element.className.includes('lm-Menu');
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
                    // we do not want to restore focus to menus
                    if (activeElement instanceof HTMLElement && !isMenuElement(activeElement)) {
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
    readonly commandRegistry: CommandRegistry;
    readonly keybindingRegistry: KeybindingRegistry;
    readonly contextKeyService: ContextKeyService;
    readonly context: ContextMenuContext;
    readonly menuWidgetFactory: MenuWidgetFactory;
    readonly commandExecutor: MenuCommandExecutor;
}

export interface MenuWidgetFactory {
    createMenuWidget(menu: MenuNode & Required<Pick<MenuNode, 'children'>>, options: BrowserMenuOptions): MenuWidget;
}

/**
 * A menu widget that would recompute its items on update.
 */
export class DynamicMenuWidget extends MenuWidget {

    /**
     * We want to restore the focus after the menu closes.
     */
    protected previousFocusedElement: HTMLElement | undefined;

    constructor(
        protected menu: CompoundMenuNode,
        protected options: BrowserMenuOptions,
        protected services: MenuServices
    ) {
        super(options);
        if (menu.label) {
            this.title.label = menu.label;
        }
        if (menu.icon) {
            this.title.iconClass = menu.icon;
        }
        this.updateSubMenus(this, this.menu, this.options.commands);
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.node.ownerDocument.addEventListener('pointerdown', this, true);
    }

    protected override onBeforeDetach(msg: Message): void {
        this.node.ownerDocument.removeEventListener('pointerdown', this);
        super.onAfterDetach(msg);
    }

    override handleEvent(event: Event): void {
        if (event.type === 'pointerdown') {
            this.handlePointerDown(event as PointerEvent);
        }
        super.handleEvent(event);
    }

    handlePointerDown(event: PointerEvent): void {
        // this code is copied from the superclass because we cannot use the hit
        // test from the "Private" implementation namespace
        if (this['_parentMenu']) {
            return;
        }

        // The mouse button which is pressed is irrelevant. If the press
        // is not on a menu, the entire hierarchy is closed and the event
        // is allowed to propagate. This allows other code to act on the
        // event, such as focusing the clicked element.
        if (!this.hitTestMenus(this, event.clientX, event.clientY)) {
            this.close();
        }
    }

    private hitTestMenus(menu: Menu, x: number, y: number): boolean {
        for (let temp: Menu | null = menu; temp; temp = temp.childMenu) {
            if (ElementExt.hitTest(temp.node, x, y)) {
                return true;
            }
        }
        return false;
    }

    public aboutToShow({ previousFocusedElement }: { previousFocusedElement: HTMLElement | undefined }): void {
        this.preserveFocusedElement(previousFocusedElement);
        this.clearItems();
        this.runWithPreservedFocusContext(() => {
            this.options.commands.snapshot(this.options.rootMenuPath);
            this.updateSubMenus(this, this.menu, this.options.commands);
        });
    }

    public override open(x: number, y: number, options?: MenuWidget.IOpenOptions): void {
        const cb = () => {
            this.restoreFocusedElement();
            this.aboutToClose.disconnect(cb);
        };
        this.aboutToClose.connect(cb);
        this.preserveFocusedElement();
        super.open(x, y, options);
    }

    protected updateSubMenus(parent: MenuWidget, menu: CompoundMenuNode, commands: MenuCommandRegistry): void {
        const items = this.buildSubMenus([], menu, commands);
        while (items[items.length - 1]?.type === 'separator') {
            items.pop();
        }
        // Add at least one entry to avoid empty menus.
        // This is needed as Lumino does all kind of checks whether a menu is empty and for example prevents activating it
        // This item will be cleared once the menu is opened via the next update as we don't have empty main menus
        // See https://github.com/jupyterlab/lumino/issues/729
        if (items.length === 0) {
            items.push({ type: 'separator' });
        }
        for (const item of items) {
            parent.addItem(item);
        }
    }

    protected buildSubMenus(parentItems: MenuWidget.IItemOptions[], menu: MenuNode, commands: MenuCommandRegistry): MenuWidget.IItemOptions[] {
        if (CompoundMenuNode.is(menu)
            && menu.children.length
            && this.undefinedOrMatch(this.options.contextKeyService ?? this.services.contextKeyService, menu.when, this.options.context)) {
            const role = menu === this.menu ? CompoundMenuNodeRole.Group : CompoundMenuNode.getRole(menu);
            if (role === CompoundMenuNodeRole.Submenu) {
                const submenu = this.services.menuWidgetFactory.createMenuWidget(menu, this.options);
                if (submenu.items.length > 0) {
                    parentItems.push({ type: 'submenu', submenu });
                }
            } else if (role === CompoundMenuNodeRole.Group && menu.id !== 'inline') {
                const children = CompoundMenuNode.getFlatChildren(menu.children);
                const myItems: MenuWidget.IItemOptions[] = [];
                children.forEach(child => this.buildSubMenus(myItems, child, commands));
                if (myItems.length) {
                    if (parentItems.length && parentItems[parentItems.length - 1].type !== 'separator') {
                        parentItems.push({ type: 'separator' });
                    }
                    parentItems.push(...myItems);
                    parentItems.push({ type: 'separator' });
                }
            }
        } else if (menu.command) {
            const node = menu.altNode && this.services.context.altPressed ? menu.altNode : (menu as MenuNode & CommandMenuNode);
            if (commands.isVisible(node.command) && this.undefinedOrMatch(this.options.contextKeyService ?? this.services.contextKeyService, node.when, this.options.context)) {
                parentItems.push({
                    command: node.command,
                    type: 'command'
                });
            }
        }
        return parentItems;
    }

    protected undefinedOrMatch(contextKeyService: ContextMatcher, expression?: string, context?: HTMLElement): boolean {
        if (expression) { return contextKeyService.match(expression, context); }
        return true;
    }

    protected preserveFocusedElement(previousFocusedElement: Element | null = document.activeElement): boolean {
        if (!this.previousFocusedElement && previousFocusedElement instanceof HTMLElement && !isMenuElement(previousFocusedElement)) {
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
        if (this.previousFocusedElement &&
            activeElement instanceof HTMLElement &&
            this.previousFocusedElement !== activeElement) {
            focusToRestore = activeElement;
            this.previousFocusedElement.focus({ preventScroll: true });
        }
        try {
            what();
        } finally {
            if (focusToRestore && !isMenuElement(focusToRestore)) {
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

/**
 * Stores Theia-specific action menu nodes instead of Lumino commands with their handlers.
 */
export class MenuCommandRegistry extends LuminoCommandRegistry {

    protected actions = new Map<string, [MenuNode & CommandMenuNode, unknown[]]>();
    protected toDispose = new DisposableCollection();

    constructor(protected services: MenuServices) {
        super();
    }

    registerActionMenu(menu: MenuNode & CommandMenuNode, args: unknown[]): void {
        const { commandRegistry } = this.services;
        const command = commandRegistry.getCommand(menu.command);
        if (!command) {
            return;
        }
        const { id } = command;
        if (this.actions.has(id)) {
            return;
        }
        this.actions.set(id, [menu, args]);
    }

    snapshot(menuPath: MenuPath): this {
        this.toDispose.dispose();
        for (const [menu, args] of this.actions.values()) {
            this.toDispose.push(this.registerCommand(menu, args, menuPath));
        }
        return this;
    }

    protected registerCommand(menu: MenuNode & CommandMenuNode, args: unknown[], menuPath: MenuPath): Disposable {
        const { commandRegistry, keybindingRegistry, commandExecutor } = this.services;
        const command = commandRegistry.getCommand(menu.command);
        if (!command) {
            return Disposable.NULL;
        }
        const { id } = command;
        if (this.hasCommand(id)) {
            // several menu items can be registered for the same command in different contexts
            return Disposable.NULL;
        }

        // We freeze the `isEnabled`, `isVisible`, and `isToggled` states so they won't change.
        const enabled = commandExecutor.isEnabled(menuPath, id, ...args);
        const visible = commandExecutor.isVisible(menuPath, id, ...args);
        const toggled = commandExecutor.isToggled(menuPath, id, ...args);
        const unregisterCommand = this.addCommand(id, {
            execute: () => commandExecutor.executeCommand(menuPath, id, ...args),
            label: menu.label,
            iconClass: menu.icon,
            isEnabled: () => enabled,
            isVisible: () => visible,
            isToggled: () => toggled
        });

        const bindings = keybindingRegistry.getKeybindingsForCommand(id);
        // Only consider the first active keybinding.
        if (bindings.length) {
            const binding = bindings.length > 1 ?
                bindings.find(b => !b.when || this.services.contextKeyService.match(b.when)) ?? bindings[0] :
                bindings[0];
            const keys = keybindingRegistry.acceleratorFor(binding, ' ', true);
            this.addKeyBinding({
                command: id,
                keys,
                selector: '.lm-Widget' // We have the Lumino dependency anyway.
            });
        }
        return Disposable.create(() => unregisterCommand.dispose());
    }

}
