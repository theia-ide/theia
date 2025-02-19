// *****************************************************************************
// Copyright (C) 2019 Ericsson and others.
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

import { enableJSDOM } from '../test/jsdom';
let disableJSDOM = enableJSDOM();
import { expect } from 'chai';

import { Title, Widget } from '@lumino/widgets';
import { TabBarRenderer } from './tab-bars';

disableJSDOM();

describe('tab bar', () => {

    before(() => {
        disableJSDOM = enableJSDOM();
    });

    after(() => {
        disableJSDOM();
    });

    it('should disambiguate tabs that have identical names', () => {
        const tabBar = new TabBarRenderer();
        const owner = new Widget();

        const tabLabels: string[] = ['index.ts', 'index.ts', 'index.ts', 'main.ts', 'main.ts', 'main.ts', 'uniqueFile.ts'];
        const tabPaths: string[] = [
            'root1/src/foo/bar/index.ts',
            'root1/lib/foo/bar/index.ts',
            'root2/src/foo/goo/bar/index.ts',
            'root1/aaa/main.ts',
            'root1/aaa/bbb/main.ts',
            'root1/aaa/bbb/ccc/main.ts',
            'root1/src/foo/bar/uniqueFile.ts'
        ];
        const tabs: Title<Widget>[] = tabLabels.map((label, i) => new Title<Widget>({
            owner, label, caption: tabPaths[i]
        }));
        const pathMap = tabBar.findDuplicateLabels(tabs);

        expect(pathMap.get(tabPaths[0])).to.be.equal('.../src/...');
        expect(pathMap.get(tabPaths[1])).to.be.equal('.../lib/...');
        expect(pathMap.get(tabPaths[2])).to.be.equal('root2/...');
        expect(pathMap.get(tabPaths[3])).to.be.equal('root1/aaa');
        expect(pathMap.get(tabPaths[4])).to.be.equal('root1/aaa/bbb');
        expect(pathMap.get(tabPaths[5])).to.be.equal('.../ccc');
        expect(pathMap.get(tabPaths[6])).to.be.equal(undefined);
    });
});
