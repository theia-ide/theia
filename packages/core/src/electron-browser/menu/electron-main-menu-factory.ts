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

import { inject, injectable, postConstruct } from 'inversify';
import { isOSX, MAIN_MENU_BAR, MenuNode, CompoundMenuNode, Group, RenderedMenuNode, CommandMenu, AcceleratorSource, MenuPath } from '../../common';
import { PreferenceService, CommonCommands } from '../../browser';
import debounce = require('lodash.debounce');
import { MAXIMIZED_CLASS } from '../../browser/shell/theia-dock-panel';
import { BrowserMainMenuFactory } from '../../browser/menu/browser-menu-plugin';
import { ContextMatcher } from '../../browser/context-key-service';
import { MenuDto, MenuRole } from '../../electron-common/electron-api';

/**
 * Representation of possible electron menu options.
 */
export interface ElectronMenuOptions {
    /**
     * Controls whether to render disabled menu items.
     * Defaults to `true`.
     */
    readonly showDisabled?: boolean;

    /**
     * Controls whether to render disabled items as disabled
     * Defaults to `true`
     */
    readonly honorDisabled?: boolean;
    /**
     * A DOM context to use when evaluating any `when` clauses
     * of menu items registered for this item.
     */
    context?: HTMLElement;
    /**
     * A context key service to use when evaluating any `when` clauses.
     * If none is provided, the global context will be used.
     */
    contextKeyService?: ContextMatcher;
}

/**
 * Define the action of the menu item, when specified the `click` property will
 * be ignored. See [roles](https://www.electronjs.org/docs/api/menu-item#roles).
 */
export type ElectronMenuItemRole = ('undo' | 'redo' | 'cut' | 'copy' | 'paste' |
    'pasteAndMatchStyle' | 'delete' | 'selectAll' | 'reload' | 'forceReload' |
    'toggleDevTools' | 'resetZoom' | 'zoomIn' | 'zoomOut' | 'togglefullscreen' |
    'window' | 'minimize' | 'close' | 'help' | 'about' |
    'services' | 'hide' | 'hideOthers' | 'unhide' | 'quit' |
    'startSpeaking' | 'stopSpeaking' | 'zoom' | 'front' | 'appMenu' |
    'fileMenu' | 'editMenu' | 'viewMenu' | 'recentDocuments' | 'toggleTabBar' |
    'selectNextTab' | 'selectPreviousTab' | 'mergeAllWindows' | 'clearRecentDocuments' |
    'moveTabToNewWindow' | 'windowMenu');

function traverseMenuDto(items: MenuDto[], callback: (item: MenuDto) => void): void {
    for (const item of items) {
        callback(item);
        if (item.submenu) {
            traverseMenuDto(item.submenu, callback);
        }
    }
}

function traverseMenuModel(effectivePath: MenuPath, item: MenuNode, callback: (item: MenuNode, path: MenuPath) => void): void {
    callback(item, effectivePath);
    if (CompoundMenuNode.is(item)) {
        for (const child of item.children) {
            traverseMenuModel([...effectivePath, child.id], child, callback);
        }
    }
}

@injectable()
export class ElectronMainMenuFactory extends BrowserMainMenuFactory {

    protected menu?: MenuDto[];

    @inject(PreferenceService)
    protected preferencesService: PreferenceService;

    setMenuBar = debounce(() => this.doSetMenuBar(), 100);

    @postConstruct()
    postConstruct(): void {
        this.keybindingRegistry.onKeybindingsChanged(() => {
            this.setMenuBar();
        });
        this.menuProvider.onDidChange(() => {
            this.setMenuBar();
        });
        this.preferencesService.ready.then(() => {
            this.preferencesService.onPreferenceChanged(
                debounce(e => {
                    if (e.preferenceName === 'window.menuBarVisibility') {
                        this.setMenuBar();
                    }
                    if (this.menu) {
                        const menuModel = this.menuProvider.getMenu(MAIN_MENU_BAR)!;
                        const toggledMap = new Map<string, MenuDto>();
                        traverseMenuDto(this.menu, item => {
                            if (item.id) {
                                toggledMap.set(item.id, item);
                            }
                        });
                        let anyChanged = false;

                        traverseMenuModel(MAIN_MENU_BAR, menuModel, ((item, path) => {
                            if (CommandMenu.is(item)) {
                                const isToggled = item.isToggled(path);
                                const menuItem = toggledMap.get(item.id);
                                if (menuItem && isToggled !== menuItem.checked) {
                                    anyChanged = true;
                                    menuItem.type = isToggled ? 'checkbox' : 'normal';
                                    menuItem.checked = isToggled;
                                }
                            }
                        }));

                        if (anyChanged) {
                            window.electronTheiaCore.setMenu(this.menu);
                        }
                    }
                }, 10)
            );
        });
    }

    doSetMenuBar(): void {
        this.menu = this.createElectronMenuBar();
        window.electronTheiaCore.setMenu(this.menu);
    }

    createElectronMenuBar(): MenuDto[] | undefined {
        const preference = this.preferencesService.get<string>('window.menuBarVisibility') || 'classic';
        const maxWidget = document.getElementsByClassName(MAXIMIZED_CLASS);
        if (preference === 'visible' || (preference === 'classic' && maxWidget.length === 0)) {
            const menuModel = this.menuProvider.getMenu(MAIN_MENU_BAR)!;
            const menu = this.fillMenuTemplate([], MAIN_MENU_BAR, menuModel, [], this.contextKeyService, { honorDisabled: false }, false);
            if (isOSX) {
                menu.unshift(this.createOSXMenu());
            }
            return menu;
        }
        return undefined;
    }

    createElectronContextMenu(menuPath: MenuPath, menu: CompoundMenuNode, contextMatcher: ContextMatcher, args?: any[],
        context?: HTMLElement, skipSingleRootNode?: boolean): MenuDto[] {
        return this.fillMenuTemplate([], menuPath, menu, args, contextMatcher, { showDisabled: true, context }, true);
    }

    protected fillMenuTemplate(parentItems: MenuDto[],
        menuPath: MenuPath,
        menu: MenuNode,
        args: unknown[] = [],
        contextMatcher: ContextMatcher,
        options: ElectronMenuOptions,
        skipRoot: boolean
    ): MenuDto[] {
        const showDisabled = options?.showDisabled !== false;
        const honorDisabled = options?.honorDisabled !== false;

        if (CompoundMenuNode.is(menu) && menu.children.length && menu.isVisible(menuPath, contextMatcher, options.context, ...args)) {
            if (Group.is(menu) && menu.id === 'inline') {
                return parentItems;
            }

            if (menu.contextKeyOverlays) {
                const overlays = menu.contextKeyOverlays;
                contextMatcher = this.services.contextKeyService.createOverlay(Object.keys(overlays).map(key => [key, overlays[key]]));
            }
            const children = menu.children;
            const myItems: MenuDto[] = [];
            children.forEach(child => this.fillMenuTemplate(myItems, [...menuPath, child.id], child, args, contextMatcher, options, false));
            if (myItems.length === 0) {
                return parentItems;
            }
            if (!skipRoot && RenderedMenuNode.is(menu)) {
                parentItems.push({ label: menu.label, submenu: myItems });
            } else {
                if (parentItems.length && parentItems[parentItems.length - 1].type !== 'separator') {
                    parentItems.push({ type: 'separator' });
                }
                parentItems.push(...myItems);
                parentItems.push({ type: 'separator' });
            }
        } else if (CommandMenu.is(menu)) {
            if (!menu.isVisible(menuPath, contextMatcher, options.context, ...args)) {
                return parentItems;
            }

            // We should omit rendering context-menu items which are disabled.
            if (!showDisabled && !menu.isEnabled(menuPath, ...args)) {
                return parentItems;
            }

            const accelerator = AcceleratorSource.is(menu) ? menu.getAccelerator(options.context).join(' ') : undefined;

            const menuItem: MenuDto = {
                id: menu.id,
                label: menu.label,
                type: menu.isToggled(menuPath, ...args) ? 'checkbox' : 'normal',
                checked: menu.isToggled(menuPath, ...args),
                enabled: !honorDisabled || menu.isEnabled(menuPath, ...args), // see https://github.com/eclipse-theia/theia/issues/446
                visible: true,
                accelerator,
                execute: async () => {
                    const wasToggled = menuItem.checked;
                    await menu.run(menuPath, ...args);
                    const isToggled = menu.isToggled(menuPath, ...args);
                    if (isToggled !== wasToggled) {
                        menuItem.type = isToggled ? 'checkbox' : 'normal';
                        menuItem.checked = isToggled;
                        window.electronTheiaCore.setMenu(this.menu);
                    }
                }
            };

            if (isOSX) {
                const role = this.roleFor(menu.id);
                if (role) {
                    menuItem.role = role;
                    delete menuItem.execute;
                }
            }
            parentItems.push(menuItem);
        }
        return parentItems;
    }

    protected undefinedOrMatch(contextKeyService: ContextMatcher, expression?: string, context?: HTMLElement): boolean {
        if (expression) {
            return contextKeyService.match(expression, context);
        }
        return true;
    }

    protected roleFor(id: string): MenuRole | undefined {
        let role: MenuRole | undefined;
        switch (id) {
            case CommonCommands.UNDO.id:
                role = 'undo';
                break;
            case CommonCommands.REDO.id:
                role = 'redo';
                break;
            case CommonCommands.CUT.id:
                role = 'cut';
                break;
            case CommonCommands.COPY.id:
                role = 'copy';
                break;
            case CommonCommands.PASTE.id:
                role = 'paste';
                break;
            case CommonCommands.SELECT_ALL.id:
                role = 'selectAll';
                break;
            default:
                break;
        }
        return role;
    }

    protected createOSXMenu(): MenuDto {
        return {
            label: 'Theia',
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideOthers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        };
    }

}
