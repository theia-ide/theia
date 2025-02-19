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

import { enableJSDOM } from './test/jsdom';

let disableJsDom = enableJSDOM();
import { Container, ContainerModule } from 'inversify';
import { expect } from 'chai';
import { WidgetManager, WidgetFactory } from './widget-manager';
import { Widget } from '@lumino/widgets';
import { ILogger } from '../common/logger';
import { MockLogger } from '../common/test/mock-logger';
import { bindContributionProvider } from '../common';

disableJsDom();

class TestWidgetFactory implements WidgetFactory {

    invocations = 0;
    id = 'test';

    async createWidget(name: string): Promise<Widget> {
        this.invocations++;
        const result = new Widget;
        result.id = name;
        return result;
    }
}

describe('widget-manager', () => {
    let widgetManager: WidgetManager;
    before(() => {
        disableJsDom = enableJSDOM();
    });

    beforeEach(() => {
        const testContainer = new Container();

        const module = new ContainerModule(bind => {
            bind(ILogger).to(MockLogger);
            bindContributionProvider(bind, WidgetFactory);
            bind(WidgetFactory).toConstantValue(new TestWidgetFactory());
            bind(WidgetManager).toSelf().inSingletonScope();
        });
        testContainer.load(module);

        widgetManager = testContainer.get(WidgetManager);
    });

    after(() => {
        disableJsDom();
    });

    it('creates and caches widgets', async () => {
        const wA = await widgetManager.getOrCreateWidget('test', 'widgetA');
        const wB = await widgetManager.getOrCreateWidget('test', 'widgetB');
        expect(wA).not.equals(wB);
        expect(wA).equals(await widgetManager.getOrCreateWidget('test', 'widgetA'));
    });

    describe('tryGetWidget', () => {
        it('Returns undefined if the widget has not been created', () => {
            expect(widgetManager.tryGetWidget('test', 'widgetA')).to.be.undefined;
        });
        it('Returns undefined if the widget is created asynchronously and has not finished being created', () => {
            widgetManager.getOrCreateWidget('test', 'widgetA');
            expect(widgetManager.tryGetWidget('test', 'widgetA')).to.be.undefined;
        });
        it('Returns the widget if the widget is created asynchronously and has finished being created', async () => {
            await widgetManager.getOrCreateWidget('test', 'widgetA');
            expect(widgetManager.tryGetWidget('test', 'widgetA')).not.to.be.undefined;
        });
    });

    it('produces the same widget key regardless of object key order', () => {
        const options1 = {
            factoryId: 'a',
            key1: 1,
            key2: 2,
        };
        const options2 = {
            key2: 2,
            key1: 1,
            factoryId: 'a',
        };
        expect(widgetManager['toKey'](options1)).equals(widgetManager['toKey'](options2));
    });

});
