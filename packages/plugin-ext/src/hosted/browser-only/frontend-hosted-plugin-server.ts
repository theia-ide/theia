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
// ****************************************************************************

import { injectable, inject } from '@theia/core/shared/inversify';
import { DeployedPlugin, ExtPluginApi, GetDeployedPluginsParams, HostedPluginClient, HostedPluginServer, PluginIdentifiers } from '../../common';
import { Event, RpcConnectionEventEmitter } from '@theia/core';

export const PluginLocalOptions = Symbol('PluginLocalOptions');
export interface PluginLocalOptions {
    pluginMetadata: DeployedPlugin[];
}

@injectable()
export class FrontendHostedPluginServer implements HostedPluginServer, RpcConnectionEventEmitter {
    readonly onDidOpenConnection: Event<void> = Event.None;
    readonly onDidCloseConnection: Event<void> = Event.None;

    @inject(PluginLocalOptions)
    protected readonly options: PluginLocalOptions;

    async getDeployedPluginIds(): Promise<PluginIdentifiers.VersionedId[]> {
        // Use the plugin metadata to build the correct plugin id
        return this.options.pluginMetadata.map(p => PluginIdentifiers.componentsToVersionedId(p.metadata.model));
    }
    async getUninstalledPluginIds(): Promise<readonly PluginIdentifiers.VersionedId[]> {
        return [];

    }
    async getDeployedPlugins(params: GetDeployedPluginsParams): Promise<DeployedPlugin[]> {
        return this.options.pluginMetadata.filter(p => params.pluginIds.includes(PluginIdentifiers.componentsToVersionedId(p.metadata.model)));
    }

    async getExtPluginAPI(): Promise<ExtPluginApi[]> {
        return [];
    }
    onMessage(targetHost: string, message: Uint8Array): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dispose(): void {
        throw new Error('Method not implemented.');
    }
    setClient(client: HostedPluginClient | undefined): void {
        throw new Error('Method not implemented.');
    }
    getClient?(): HostedPluginClient | undefined {
        throw new Error('Method not implemented.');
    }
}
