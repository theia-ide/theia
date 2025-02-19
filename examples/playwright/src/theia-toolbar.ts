// *****************************************************************************
// Copyright (C) 2023 EclipseSource and others.
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
import { TheiaPageObject } from './theia-page-object';
import { TheiaToolbarItem } from './theia-toolbar-item';

export class TheiaToolbar extends TheiaPageObject {
    selector = 'div#main-toolbar.lm-TabBar-toolbar';

    protected async toolbarElementHandle(): Promise<ElementHandle<SVGElement | HTMLElement> | null> {
        return this.page.$(this.selector);
    }

    async waitForVisible(): Promise<void> {
        await this.page.waitForSelector(this.selector, { state: 'visible' });
    }

    async isShown(): Promise<boolean> {
        const statusBar = await this.toolbarElementHandle();
        return !!statusBar && statusBar.isVisible();
    }

    async show(): Promise<void> {
        if (!await this.isShown()) {
            await this.toggle();
        }
    }

    async hide(): Promise<void> {
        if (await this.isShown()) {
            await this.toggle();
        }
    }

    async toggle(): Promise<void> {
        const isShown = await this.isShown();
        const viewMenu = await this.app.menuBar.openMenu('View');
        await viewMenu.clickMenuItem('Toggle Toolbar');
        isShown ? await this.waitUntilHidden() : await this.waitUntilShown();
    }

    async waitUntilHidden(): Promise<void> {
        await this.page.waitForSelector(this.selector, { state: 'hidden' });
    }

    async waitUntilShown(): Promise<void> {
        await this.page.waitForSelector(this.selector, { state: 'visible' });
    }

    async toolbarItems(): Promise<TheiaToolbarItem[]> {
        const toolbarHandle = await this.toolbarElementHandle();
        if (!toolbarHandle) {
            return [];
        }
        const items = await toolbarHandle.$$(this.toolBarItemSelector());
        return items.map(element => new TheiaToolbarItem(this.app, element));
    }

    async toolbarItemIds(): Promise<string[]> {
        const items = await this.toolbarItems();
        return this.toCommandIdArray(items);
    }

    async toolBarItem(commandId: string): Promise<TheiaToolbarItem | undefined> {
        const toolbarHandle = await this.toolbarElementHandle();
        if (!toolbarHandle) {
            return undefined;
        }
        const item = await toolbarHandle.$(this.toolBarItemSelector(commandId));
        if (item) {
            return new TheiaToolbarItem(this.app, item);
        }
        return undefined;
    }

    protected toolBarItemSelector(toolbarItemId = ''): string {
        return `div.toolbar-item${toolbarItemId ? `[id="${toolbarItemId}"]` : ''}`;
    }

    protected async toCommandIdArray(items: TheiaToolbarItem[]): Promise<string[]> {
        const contents = items.map(item => item.commandId());
        const resolvedContents = await Promise.all(contents);
        return resolvedContents.filter(id => id !== undefined) as string[];
    }
}
