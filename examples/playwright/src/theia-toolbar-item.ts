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
import { TheiaApp } from './theia-app';
import { TheiaPageObject } from './theia-page-object';

export class TheiaToolbarItem extends TheiaPageObject {
    constructor(app: TheiaApp, protected element: ElementHandle<SVGElement | HTMLElement>) {
        super(app);
    }

    async commandId(): Promise<string | null> {
        return this.element.getAttribute('id');
    }

    async isEnabled(): Promise<boolean> {
        const child = await this.element.$(':first-child');
        const classAttribute = child && await child.getAttribute('class');
        if (classAttribute === undefined || classAttribute === null) {
            return false;
        }
        return classAttribute.includes('enabled');
    }

    async trigger(): Promise<void> {
        await this.element.click();
    }
}
