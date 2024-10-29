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
import { CommandContribution, CommandRegistry, CompoundMenuNode, MenuContribution, MenuModelRegistry, Submenu } from '../../common';
import { BrowserMenuNodeFactory } from './browser-menu-node-factory';

const expect = chai.expect;

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
            const all = service.getMenu([])!;
            const main = all.children[0] as CompoundMenuNode;
            expect(main.children.length).equals(1);
            expect(main.id, 'main');
            expect(all.children.length).equals(1);
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
                    // open menu should not be added to open menu
                    menuRegistry.linkCompoundMenuNode(fileOpenMenu, fileOpenMenu);
                    // close menu should be added
                    menuRegistry.linkCompoundMenuNode(fileOpenMenu, fileCloseMenu);
                }
            }, {
                registerCommands(reg: CommandRegistry): void { }
            });
            const all = service.getMenu([]) as CompoundMenuNode;
            expect(menuStructureToString(all.children[0] as CompoundMenuNode)).equals('File(0_open(1_close),1_close())');
        });
    });
});

function createMenuRegistry(menuContrib: MenuContribution, commandContrib: CommandContribution): MenuModelRegistry {
    const cmdReg = new CommandRegistry({ getContributions: () => [commandContrib] });
    cmdReg.onStart();
    const menuReg = new MenuModelRegistry({ getContributions: () => [menuContrib] }, cmdReg, new BrowserMenuNodeFactory());
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
