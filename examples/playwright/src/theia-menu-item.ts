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

import { elementContainsClass, textContent } from './util';

export class TheiaMenuItem {

    constructor(protected element: ElementHandle<SVGElement | HTMLElement>) { }

    protected labelElementHandle(): Promise<ElementHandle<SVGElement | HTMLElement>> {
        return this.element.waitForSelector('.lm-Menu-itemLabel');
    }

    protected shortCutElementHandle(): Promise<ElementHandle<SVGElement | HTMLElement>> {
        return this.element.waitForSelector('.lm-Menu-itemShortcut');
    }

    protected isHidden(): Promise<boolean> {
        return elementContainsClass(this.element, 'lm-mod-collapsed');
    }

    async label(): Promise<string | undefined> {
        if (await this.isHidden()) {
            return undefined;
        }
        return textContent(this.labelElementHandle());
    }

    async shortCut(): Promise<string | undefined> {
        if (await this.isHidden()) {
            return undefined;
        }
        return textContent(this.shortCutElementHandle());
    }

    async hasSubmenu(): Promise<boolean> {
        if (await this.isHidden()) {
            return false;
        }
        return (await this.element.getAttribute('data-type')) === 'submenu';
    }

    async isEnabled(): Promise<boolean> {
        const classAttribute = (await this.element.getAttribute('class'));
        if (classAttribute === undefined || classAttribute === null) {
            return false;
        }
        return !classAttribute.includes('lm-mod-disabled') && !classAttribute.includes('lm-mod-collapsed');
    }

    async click(): Promise<void> {
        return this.element.waitForSelector('.lm-Menu-itemLabel')
            .then(labelElement => labelElement.click({ position: { x: 10, y: 10 } }));
    }

    async hover(): Promise<void> {
        return this.element.hover();
    }

}
