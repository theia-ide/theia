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

import { TheiaMenuItem } from './theia-menu-item';
import { TheiaPageObject } from './theia-page-object';
import { isDefined } from './util';

export class TheiaMenu extends TheiaPageObject {

    selector = '.lm-Menu';

    protected async menuElementHandle(): Promise<ElementHandle<SVGElement | HTMLElement> | null> {
        return this.page.$(this.selector);
    }

    async waitForVisible(): Promise<void> {
        await this.page.waitForSelector(this.selector, { state: 'visible' });
    }

    async isOpen(): Promise<boolean> {
        const menu = await this.menuElementHandle();
        return !!menu && menu.isVisible();
    }

    async close(): Promise<void> {
        if (!await this.isOpen()) {
            return;
        }
        await this.page.mouse.click(0, 0);
        await this.page.waitForSelector(this.selector, { state: 'detached' });
    }

    async menuItems(): Promise<TheiaMenuItem[]> {
        const menuHandle = await this.menuElementHandle();
        if (!menuHandle) {
            return [];
        }
        const items = await menuHandle.$$('.lm-Menu-content .lm-Menu-item');
        return items.map(element => new TheiaMenuItem(element));
    }

    async clickMenuItem(name: string): Promise<void> {
        return (await this.page.waitForSelector(this.menuItemSelector(name))).click();
    }

    async menuItemByName(name: string): Promise<TheiaMenuItem | undefined> {
        const menuItems = await this.menuItems();
        for (const item of menuItems) {
            const label = await item.label();
            if (label === name) {
                return item;
            }
        }
        return undefined;
    }

    async menuItemByNamePath(...names: string[]): Promise<TheiaMenuItem | undefined> {
        let item;
        for (let index = 0; index < names.length; index++) {
            item = await this.page.waitForSelector(this.menuItemSelector(names[index]), { state: 'visible' });
            await item.hover();
        }

        const menuItemHandle = await item?.$('xpath=..');
        if (menuItemHandle) {
            return new TheiaMenuItem(menuItemHandle);
        }
        return undefined;
    }

    protected menuItemSelector(label = ''): string {
        return `.lm-Menu-content .lm-Menu-itemLabel >> text=${label}`;
    }

    async visibleMenuItems(): Promise<string[]> {
        const menuItems = await this.menuItems();
        const labels = await Promise.all(menuItems.map(item => item.label()));
        return labels.filter(isDefined);
    }

}
