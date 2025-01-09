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

import * as chai from 'chai';
import {
    CommandContribution, CommandMenu, CommandRegistry, CompoundMenuNode, Group, GroupImpl, MenuAction, MenuContribution,
    MenuModelRegistry, MenuNode, MenuNodeFactory, MutableCompoundMenuNode, Submenu,
    SubmenuImpl,
    SubMenuLink
} from '../../common';

const expect = chai.expect;

class TestMenuNodeFactory implements MenuNodeFactory {
    createGroup(id: string, orderString?: string, when?: string): Group & MutableCompoundMenuNode {
        return new GroupImpl(id, orderString, when);
    }
    createSubmenu(id: string, label: string, contextKeyOverlays: Record<string, string> | undefined, orderString?: string, icon?: string, when?: string):
        Submenu & MutableCompoundMenuNode {
        return new SubmenuImpl(id, label, contextKeyOverlays, orderString, icon, when);
    }
    createSubmenuLink(delegate: Submenu, sortString?: string, when?: string): MenuNode {
        return new SubMenuLink(delegate, sortString, when);
    }

    createCommandMenu(item: MenuAction): CommandMenu {
        return {
            isVisible: () => true,
            isEnabled: () => true,
            isToggled: () => false,
            id: item.commandId,
            label: item.label || '',
            sortString: item.order || '',
            run: () => Promise.resolve()
        };
    }
}

describe('menu-model-registry', () => {

    describe('01 #register', () => {
        it('Should allow to register menu actions.', () => {
            const fileMenu = ['main', 'File'];
            const fileOpenMenu = [...fileMenu, '0_open'];
            const service = createMenuRegistry({
                registerMenus(menuRegistry: MenuModelRegistry): void {
                    menuRegistry.registerSubmenu(fileMenu, 'File');
                    menuRegistry.registerMenuAction(fileOpenMenu, {
                        commandId: 'open'
                    });
                    menuRegistry.registerMenuAction(fileOpenMenu, {
                        commandId: 'open.with'
                    });
                }
            }, {
                registerCommands(reg: CommandRegistry): void {
                    reg.registerCommand({
                        id: 'open',
                        label: 'A'
                    });
                    reg.registerCommand({
                        id: 'open.with',
                        label: 'B'
                    });
                }
            });
            const main = service.getMenu(['main'])!;
            expect(main.children.length).equals(1);
            expect(main.id, 'main');
            const file = main.children[0] as Submenu;
            expect(file.children.length).equals(1);
            expect(file.label, 'File');
            const openGroup = file.children[0] as Submenu;
            expect(openGroup.children.length).equals(2);
            expect(openGroup.label).undefined;
        });

        it('Should not allow to register cyclic menus.', () => {
            const fileMenu = ['main', 'File'];
            const fileOpenMenu = [...fileMenu, '0_open'];
            const fileCloseMenu = [...fileMenu, '1_close'];
            const service = createMenuRegistry({
                registerMenus(menuRegistry: MenuModelRegistry): void {
                    menuRegistry.registerSubmenu(fileMenu, 'File');
                    menuRegistry.registerSubmenu(fileOpenMenu, 'Open');
                    menuRegistry.registerSubmenu(fileCloseMenu, 'Close');
                    // open menu should not be added to open menu
                    try {
                        menuRegistry.linkCompoundMenuNode({ newParentPath: fileOpenMenu, submenuPath: fileOpenMenu });
                    } catch (e) {
                        // expected
                    }
                    // close menu should be added
                    menuRegistry.linkCompoundMenuNode({ newParentPath: fileOpenMenu, submenuPath: fileCloseMenu });
                }
            }, {
                registerCommands(reg: CommandRegistry): void { }
            });
            const main = service.getMenu(['main']) as CompoundMenuNode;
            expect(menuStructureToString(main)).equals('File(0_open(1_close()),1_close())');
        });
    });
});

function createMenuRegistry(menuContrib: MenuContribution, commandContrib: CommandContribution): MenuModelRegistry {
    const cmdReg = new CommandRegistry({ getContributions: () => [commandContrib] });
    cmdReg.onStart();
    const menuReg = new MenuModelRegistry({ getContributions: () => [menuContrib] }, cmdReg, new TestMenuNodeFactory());
    menuReg.onStart();
    return menuReg;
}

function menuStructureToString(node: CompoundMenuNode): string {
    return node.children.map(c => {
        if (CompoundMenuNode.is(c)) {
            return `${c.id}(${menuStructureToString(c)})`;
        }
        return c.id;
    }).join(',');
}
