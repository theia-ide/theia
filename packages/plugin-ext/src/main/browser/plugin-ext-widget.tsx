// *****************************************************************************
// Copyright (C) 2018 Red Hat, Inc. and others.
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

import * as React from '@theia/core/shared/react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { Message } from '@theia/core/shared/@lumino/messaging';
import { PluginMetadata } from '../../common/plugin-protocol';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { HostedPluginSupport, PluginProgressLocation } from '../../hosted/browser/hosted-plugin';
import { ProgressBarFactory } from '@theia/core/lib/browser/progress-bar-factory';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { codicon } from '@theia/core/lib/browser';
import { nls } from '@theia/core/lib/common';

export const PLUGINS_LABEL = nls.localize('theia/plugin-ext/plugins', 'Plugins');

@injectable()
export class PluginWidget extends ReactWidget {

    @inject(HostedPluginSupport)
    protected readonly pluginService: HostedPluginSupport;

    @inject(ProgressBarFactory)
    protected readonly progressBarFactory: ProgressBarFactory;

    constructor() {
        super();
        this.id = 'plugins';
        this.title.label = PLUGINS_LABEL;
        this.title.caption = PLUGINS_LABEL;
        this.title.iconClass = codicon('diff-added');
        this.title.closable = true;
        this.node.tabIndex = 0;
        this.addClass('theia-plugins');

        this.update();
    }

    @postConstruct()
    protected init(): void {
        this.toDispose.push(this.pluginService.onDidChangePlugins(() => this.update()));
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
    }

    protected readonly toDisposeProgress = new DisposableCollection();

    protected render(): React.ReactNode {
        return <div ref={ref => {
            this.toDisposeProgress.dispose();
            this.toDispose.push(this.toDisposeProgress);
            if (ref) {
                this.toDispose.push(this.progressBarFactory({ container: this.node, insertMode: 'prepend', locationId: PluginProgressLocation }));
            }
        }}>{this.doRender()}</div>;
    }

    protected doRender(): React.ReactNode {
        const plugins = this.pluginService.plugins;
        if (!plugins.length) {
            return <AlertMessage type='INFO' header='No plugins currently available.' />;
        }
        return <React.Fragment>{this.renderPlugins(plugins)}</React.Fragment>;
    }

    protected renderPlugins(plugins: PluginMetadata[]): React.ReactNode {
        return <div id='pluginListContainer'>
            {plugins.sort((a, b) => this.compareMetadata(a, b)).map(plugin => this.renderPlugin(plugin))}
        </div>;
    }

    private renderPlugin(plugin: PluginMetadata): JSX.Element {
        return <div key={plugin.model.name} className={this.createPluginClassName(plugin)}>
            <div className='column flexcontainer pluginInformationContainer'>
                <div className='row flexcontainer'>
                    <div className={codicon('list-selection')}></div>
                    <div title={plugin.model.name} className='pluginName noWrapInfo'>{plugin.model.name}</div>
                </div>
                <div className='row flexcontainer'>
                    <div className='pluginVersion'>{plugin.model.version}</div>
                </div>
                <div className='row flexcontainer'>
                    <div className='pluginDescription noWrapInfo'>{plugin.model.description}</div>
                </div>
                <div className='row flexcontainer'>
                    <div className='pluginPublisher noWrapInfo flexcontainer'>{plugin.model.publisher}</div>
                </div>
            </div>
        </div>;
    }

    protected createPluginClassName(plugin: PluginMetadata): string {
        const classNames = ['pluginHeaderContainer'];
        return classNames.join(' ');
    }

    /**
     * Compare two plugins based on their names, and publishers.
     * @param a the first plugin metadata.
     * @param b the second plugin metadata.
     */
    protected compareMetadata(a: PluginMetadata, b: PluginMetadata): number {
        // Determine the name of the plugins.
        const nameA = a.model.name.toLowerCase();
        const nameB = b.model.name.toLowerCase();

        // Determine the publisher of the plugin (when names are equal).
        const publisherA = a.model.publisher.toLowerCase();
        const publisherB = b.model.publisher.toLowerCase();

        return (nameA === nameA)
            ? nameA.localeCompare(nameB)
            : publisherA.localeCompare(publisherB);
    }
}
