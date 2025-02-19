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

import { TheiaApp } from './theia-app';
import { TheiaContextMenu } from './theia-context-menu';
import { TheiaMenu } from './theia-menu';
import { TheiaPageObject } from './theia-page-object';
import { containsClass, isElementVisible, textContent } from './util';

export interface TheiaViewData {
    tabSelector: string;
    viewSelector: string;
    viewName?: string;
}

export class TheiaView extends TheiaPageObject {

    constructor(protected readonly data: TheiaViewData, app: TheiaApp) {
        super(app);
    }

    get tabSelector(): string {
        return this.data.tabSelector;
    }

    get viewSelector(): string {
        return this.data.viewSelector;
    }

    get name(): string | undefined {
        return this.data.viewName;
    }

    async open(): Promise<TheiaView> {
        if (!this.data.viewName) {
            throw new Error('View name must be specified to open via command palette');
        }
        await this.app.quickCommandPalette.type('View: Open View');
        await this.app.quickCommandPalette.trigger('View: Open View...', this.data.viewName);
        await this.waitForVisible();
        return this;
    }

    async focus(): Promise<void> {
        await this.activate();
        const view = await this.viewElement();
        await view?.click();
    }

    async activate(): Promise<void> {
        await this.page.waitForSelector(this.tabSelector, { state: 'visible' });
        if (!await this.isActive()) {
            const tab = await this.tabElement();
            await tab?.click();
        }
        return this.waitForVisible();
    }

    async waitForVisible(): Promise<void> {
        await this.page.waitForSelector(this.viewSelector, { state: 'visible' });
    }

    async isTabVisible(): Promise<boolean> {
        return isElementVisible(this.tabElement());
    }

    async isDisplayed(): Promise<boolean> {
        return isElementVisible(this.viewElement());
    }

    async isActive(): Promise<boolean> {
        return await this.isTabVisible() && containsClass(this.tabElement(), 'lm-mod-current');
    }

    async isClosable(): Promise<boolean> {
        return await this.isTabVisible() && containsClass(this.tabElement(), 'lm-mod-closable');
    }

    async close(waitForClosed = true): Promise<void> {
        if (!(await this.isTabVisible())) {
            return;
        }
        if (!(await this.isClosable())) {
            throw Error(`View ${this.tabSelector} is not closable`);
        }
        const tab = await this.tabElement();
        const side = await this.side();
        if (side === 'main' || side === 'bottom') {
            const closeIcon = await tab?.waitForSelector('div.lm-TabBar-tabCloseIcon');
            await closeIcon?.click();
        } else {
            const menu = await this.openContextMenuOnTab();
            const closeItem = await menu.menuItemByName('Close');
            await closeItem?.click();
        }
        if (waitForClosed) {
            await this.waitUntilClosed();
        }
    }

    protected async waitUntilClosed(): Promise<void> {
        await this.page.waitForSelector(this.tabSelector, { state: 'detached' });
    }

    async title(): Promise<string | undefined> {
        if ((await this.isInSidePanel()) && !(await this.isActive())) {
            // we can only determine the label of a side-panel view, if it is active
            await this.activate();
        }
        switch (await this.side()) {
            case 'left':
                return textContent(this.page.waitForSelector('div.theia-left-side-panel > div.theia-sidepanel-title'));
            case 'right':
                return textContent(this.page.waitForSelector('div.theia-right-side-panel > div.theia-sidepanel-title'));
        }
        const tab = await this.tabElement();
        if (tab) {
            return textContent(tab.waitForSelector('div.theia-tab-icon-label > div.lm-TabBar-tabLabel'));
        }
        return undefined;
    }

    async isInSidePanel(): Promise<boolean> {
        return (await this.side() === 'left') || (await this.side() === 'right');
    }

    async side(): Promise<'left' | 'right' | 'bottom' | 'main'> {
        if (!await this.isTabVisible()) {
            throw Error(`Unable to determine side of invisible view tab '${this.tabSelector}'`);
        }
        const tab = await this.tabElement();
        const appAreaElement = tab?.$('xpath=../../../..');
        if (await containsClass(appAreaElement, 'theia-app-left')) {
            return 'left';
        }
        if (await containsClass(appAreaElement, 'theia-app-right')) {
            return 'right';
        }

        if (await containsClass(appAreaElement, 'theia-app-bottom')) {
            return 'bottom';
        }
        if (await containsClass(appAreaElement, 'theia-app-main')) {
            return 'main';
        }
        throw Error(`Unable to determine side of view tab '${this.tabSelector}'`);
    }

    async openContextMenuOnTab(): Promise<TheiaMenu> {
        await this.activate();
        return TheiaContextMenu.open(this.app, () => this.page.waitForSelector(this.tabSelector));
    }

    protected viewElement(): Promise<ElementHandle<SVGElement | HTMLElement> | null> {
        return this.page.$(this.viewSelector);
    }

    protected tabElement(): Promise<ElementHandle<SVGElement | HTMLElement> | null> {
        return this.page.$(this.tabSelector);
    }

}
