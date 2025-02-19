// *****************************************************************************
// Copyright (C) 2021 logi.cals GmbH, EclipseSource and others.
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

import { ElementHandle } from '@playwright/test';

import { TheiaMenu } from './theia-menu';
import { TheiaPageObject } from './theia-page-object';
import { normalizeId, toTextContentArray } from './util';

export class TheiaMainMenu extends TheiaMenu {
    override selector = '.lm-Menu.lm-MenuBar-menu';
}

export class TheiaMenuBar extends TheiaPageObject {

    async openMenu(menuName: string): Promise<TheiaMainMenu> {
        const menuBarItem = await this.menuBarItem(menuName);
        const mainMenu = new TheiaMainMenu(this.app);
        if (await mainMenu.isOpen()) {
            await menuBarItem?.hover();
        } else {
            await menuBarItem?.click();
        }
        mainMenu.waitForVisible();
        return mainMenu;
    }

    async visibleMenuBarItems(): Promise<string[]> {
        const items = await this.page.$$(this.menuBarItemSelector());
        return toTextContentArray(items);
    }

    protected menuBarItem(label = ''): Promise<ElementHandle<SVGElement | HTMLElement> | null> {
        return this.page.waitForSelector(this.menuBarItemSelector(label));
    }

    protected menuBarItemSelector(label = ''): string {
        return `${normalizeId('#theia:menubar')} .lm-MenuBar-itemLabel >> text=${label}`;
    }

}
