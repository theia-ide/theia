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
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as electron from '../../../electron-shared/electron';
import { inject, injectable, postConstruct } from 'inversify';
import {
    isOSX, ActionMenuNode, CompositeMenuNode, MAIN_MENU_BAR, MenuPath, MenuNode
} from '../../common';
import { Keybinding } from '../../common/keybinding';
import { PreferenceService, CommonCommands } from '../../browser';
import debounce = require('lodash.debounce');
import { MAXIMIZED_CLASS } from '../../browser/shell/theia-dock-panel';
import { BrowserMainMenuFactory } from '../../browser/menu/browser-menu-plugin';
import { MenuItemConstructorOptions } from '../../electron-common/menu';
import { MenuItemDidClick, SetMenu, UpdateMenuItems } from '../../electron-common/messaging/electron-messages';

/**
 * Representation of possible electron menu options.
 */
export interface ElectronMenuOptions {
    /**
     * Controls whether to render disabled menu items.
     * Defaults to `true`.
     */
    readonly showDisabled?: boolean;
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

@injectable()
export class ElectronMainMenuFactory extends BrowserMainMenuFactory {

    protected _template?: MenuItemConstructorOptions[];
    protected _toggledCommands: Set<string> = new Set();

    @inject(PreferenceService)
    protected preferencesService: PreferenceService;

    @postConstruct()
    postConstruct(): void {
        this.preferencesService.onPreferenceChanged(
            debounce(e => {
                if (e.preferenceName === 'window.menuBarVisibility') {
                    this.setMenuBar();
                }
                if (this._template) {
                    const menuItems = Array.from(this._toggledCommands)
                        .map(commandId => ({ id: commandId, checked: this.commandRegistry.isToggled(commandId) }));
                    electron.ipcRenderer.send(UpdateMenuItems.Signal, { menuItems });
                }
            }, 10)
        );
        this.keybindingRegistry.onKeybindingsChanged(() => {
            this.setMenuBar();
        });
        electron.ipcRenderer.on(MenuItemDidClick.Signal, (_event, params: MenuItemDidClick.Params) => {
            const { commandId, args = [] } = params;
            this.execute(commandId, args);
        });
    }

    async setMenuBar(): Promise<void> {
        await this.preferencesService.ready;
        if (isOSX) {
            const template = this.createElectronMenuBar();
            electron.ipcRenderer.send(SetMenu.Signal, { template });
        } else if (this.preferencesService.get('window.titleBarStyle') === 'native') {
            const template = this.createElectronMenuBar();
            electron.ipcRenderer.send(SetMenu.Signal, { template });
        }
    }

    createElectronMenuBar(): MenuItemConstructorOptions[] | null {
        const preference = this.preferencesService.get<string>('window.menuBarVisibility') || 'classic';
        const maxWidget = document.getElementsByClassName(MAXIMIZED_CLASS);
        if (preference === 'visible' || (preference === 'classic' && maxWidget.length === 0)) {
            const menuModel = this.menuProvider.getMenu(MAIN_MENU_BAR);
            const template = this.fillMenuTemplate([], menuModel);
            if (isOSX) {
                template.unshift(this.createOSXMenu());
            }
            this._template = template;
            return this._template;
        }
        this._template = undefined;
        // eslint-disable-next-line no-null/no-null
        return null;
    }

    createElectronContextMenu(menuPath: MenuPath, args?: any[]): MenuItemConstructorOptions[] {
        const menuModel = this.menuProvider.getMenu(menuPath);
        return this.fillMenuTemplate([], menuModel, args, { showDisabled: false });
    }

    protected fillMenuTemplate(items: MenuItemConstructorOptions[],
        menuModel: CompositeMenuNode,
        args: any[] = [],
        options?: ElectronMenuOptions
    ): MenuItemConstructorOptions[] {
        const showDisabled = (options?.showDisabled === undefined) ? true : options?.showDisabled;
        for (const menu of menuModel.children) {
            if (menu instanceof CompositeMenuNode) {
                if (menu.children.length > 0) {
                    // do not render empty nodes

                    if (menu.isSubmenu) { // submenu node

                        const submenu = this.fillMenuTemplate([], menu, args, options);
                        if (submenu.length === 0) {
                            continue;
                        }

                        items.push({
                            label: menu.label,
                            submenu
                        });

                    } else { // group node

                        // process children
                        const submenu = this.fillMenuTemplate([], menu, args, options);
                        if (submenu.length === 0) {
                            continue;
                        }

                        if (items.length > 0) {
                            // do not put a separator above the first group

                            items.push({
                                type: 'separator'
                            });
                        }

                        // render children
                        items.push(...submenu);
                    }
                }
            } else if (menu instanceof ActionMenuNode) {
                const node = menu.altNode && this.context.altPressed ? menu.altNode : menu;
                const commandId = node.action.commandId;

                // That is only a sanity check at application startup.
                if (!this.commandRegistry.getCommand(commandId)) {
                    console.debug(`Skipping menu item with missing command: "${commandId}".`);
                    continue;
                }

                if (!this.commandRegistry.isVisible(commandId, ...args)
                    || (!!node.action.when && !this.contextKeyService.match(node.action.when))) {
                    continue;
                }

                // We should omit rendering context-menu items which are disabled.
                if (!showDisabled && !this.commandRegistry.isEnabled(commandId, ...args)) {
                    continue;
                }

                const bindings = this.keybindingRegistry.getKeybindingsForCommand(commandId);

                const accelerator = bindings[0] && this.acceleratorFor(bindings[0]);

                const menuItem: MenuItemConstructorOptions = {
                    id: node.id,
                    label: node.label,
                    type: this.commandRegistry.getToggledHandler(commandId, ...args) ? 'checkbox' : 'normal',
                    checked: this.commandRegistry.isToggled(commandId, ...args),
                    enabled: true, // https://github.com/eclipse-theia/theia/issues/446
                    visible: true,
                    accelerator,
                    click: { commandId, args }
                };

                if (isOSX) {
                    const role = this.roleFor(node.id);
                    if (role) {
                        menuItem.role = role;
                        delete menuItem.click;
                    }
                }
                items.push(menuItem);

                if (this.commandRegistry.getToggledHandler(commandId, ...args)) {
                    this._toggledCommands.add(commandId);
                }
            } else {
                items.push(...this.handleElectronDefault(menu, args, options));
            }
        }
        return items;
    }

    protected handleElectronDefault(menuNode: MenuNode, args: any[] = [], options?: ElectronMenuOptions): MenuItemConstructorOptions[] {
        return [];
    }

    /**
     * Return a user visible representation of a keybinding.
     */
    protected acceleratorFor(keybinding: Keybinding): string {
        const bindingKeySequence = this.keybindingRegistry.resolveKeybinding(keybinding);
        // FIXME see https://github.com/electron/electron/issues/11740
        // Key Sequences can't be represented properly in the electron menu.
        //
        // We can do what VS Code does, and append the chords as a suffix to the menu label.
        // https://github.com/eclipse-theia/theia/issues/1199#issuecomment-430909480
        if (bindingKeySequence.length > 1) {
            return '';
        }

        const keyCode = bindingKeySequence[0];
        return this.keybindingRegistry.acceleratorForKeyCode(keyCode, '+', true);
    }

    protected roleFor(id: string): ElectronMenuItemRole | undefined {
        let role: ElectronMenuItemRole | undefined;
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

    protected async execute(command: string, args: any[]): Promise<void> {
        try {
            // This is workaround for https://github.com/eclipse-theia/theia/issues/446.
            // Electron menus do not update based on the `isEnabled`, `isVisible` property of the command.
            // We need to check if we can execute it.
            if (this.commandRegistry.isEnabled(command, ...args)) {
                await this.commandRegistry.executeCommand(command, ...args);
                if (this.commandRegistry.isVisible(command, ...args)) {
                    const menuItems = [{
                        id: command,
                        checked: this.commandRegistry.isToggled(command, ...args)
                    }];
                    electron.ipcRenderer.send(UpdateMenuItems.Signal, { menuItems });
                }
            }
        } catch {
            // no-op
        }
    }

    protected createOSXMenu(): MenuItemConstructorOptions {
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
