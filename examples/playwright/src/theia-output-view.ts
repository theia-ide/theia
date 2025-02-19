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

import { TheiaApp } from './theia-app';
import { TheiaOutputViewChannel } from './theia-output-channel';
import { TheiaView } from './theia-view';
import { normalizeId } from './util';

const TheiaOutputViewData = {
    tabSelector: '#shell-tab-outputView',
    viewSelector: '#outputView',
    viewName: 'Output'
};

export class TheiaOutputView extends TheiaView {
    constructor(app: TheiaApp) {
        super(TheiaOutputViewData, app);
    }

    async isOutputChannelSelected(outputChannelName: string): Promise<boolean> {
        await this.activate();
        const contentPanel = await this.page.$('#theia-bottom-content-panel');
        if (contentPanel && (await contentPanel.isVisible())) {
            const channelList = await contentPanel.$('#outputChannelList');
            const selectedChannel = await channelList?.$('div.theia-select-component-label');
            if (selectedChannel && (await selectedChannel.textContent()) === outputChannelName) {
                return true;
            }
        }
        return false;
    }

    async getOutputChannel(outputChannelName: string): Promise<TheiaOutputViewChannel | undefined> {
        await this.activate();
        const channel = new TheiaOutputViewChannel(
            {
                viewSelector: 'div.lm-Widget.theia-editor.lm-DockPanel-widget > div.monaco-editor',
                dataUri: normalizeId(`output:/${encodeURIComponent(outputChannelName)}`),
                channelName: outputChannelName
            },
            this
        );
        await channel.waitForVisible();
        if (await channel.isDisplayed()) {
            return channel;
        }
        return undefined;
    }

    async selectOutputChannel(outputChannelName: string): Promise<boolean> {
        await this.activate();
        const contentPanel = await this.page.$('#theia-bottom-content-panel');
        if (contentPanel && (await contentPanel.isVisible())) {
            const channelSelectComponent = await contentPanel.$('#outputChannelList');
            if (!channelSelectComponent) {
                throw Error('Output Channel List not visible.');
            }
            // open output channel list component
            await channelSelectComponent.click();
            const channelContainer = await this.page.waitForSelector('#select-component-container > div.theia-select-component-dropdown');
            if (!channelContainer) {
                throw Error('Output Channel List could not be opened.');
            }
            const channels = await channelContainer.$$('div.theia-select-component-option-value');
            for (const channel of channels) {
                if (await channel.textContent() === outputChannelName) {
                    await channel.click();
                }
            }
            return this.isOutputChannelSelected(outputChannelName);
        }
        return false;
    }
}
