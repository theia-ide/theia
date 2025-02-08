// *****************************************************************************
// Copyright (C) 2024 STMicroelectronics and others.
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
import {
    ActionMenuNode, CommandMenu, CommandRegistry, Group, GroupImpl, MenuAction, MenuNode, MenuNodeFactory,
    MutableCompoundMenuNode, SubMenuLink, Submenu, SubmenuImpl
} from '../../common';
import { ContextKeyService } from '../context-key-service';
import { KeybindingRegistry } from '../keybinding';

@injectable()
export class BrowserMenuNodeFactory implements MenuNodeFactory {
    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;
    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;
    @inject(KeybindingRegistry)
    protected readonly keybindingRegistry: KeybindingRegistry;

    createGroup(id: string, orderString?: string, when?: string): Group & MutableCompoundMenuNode {
        return new GroupImpl(id, orderString, when);
    }

    createCommandMenu(item: MenuAction): CommandMenu {
        return new ActionMenuNode(item, this.commandRegistry, this.keybindingRegistry, this.contextKeyService);
    }
    createSubmenu(id: string, label: string, contextKeyOverlays: Record<string, string> | undefined, orderString?: string, icon?: string, when?: string):
        Submenu & MutableCompoundMenuNode {
        return new SubmenuImpl(id, label, contextKeyOverlays, orderString, icon, when);
    }
    createSubmenuLink(delegate: Submenu, sortString?: string, when?: string): MenuNode {
        return new SubMenuLink(delegate, sortString, when);
    }
}
