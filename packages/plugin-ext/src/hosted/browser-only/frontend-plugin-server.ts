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
import { injectable } from '@theia/core/shared/inversify';
import { PluginDeployOptions, PluginServer, PluginStorageKind, PluginType } from '../../common';
import { KeysToAnyValues, KeysToKeysToAnyValue } from '../../common/types';

@injectable()
export class FrontendPluginServer implements PluginServer {
    deploy(pluginEntry: string, type?: PluginType | undefined, options?: PluginDeployOptions | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }
    uninstall(pluginId: `${string}.${string}@${string}`): Promise<void> {
        throw new Error('Method not implemented.');
    }
    undeploy(pluginId: `${string}.${string}@${string}`): Promise<void> {
        throw new Error('Method not implemented.');
    }
    setStorageValue(key: string, value: KeysToAnyValues, kind: PluginStorageKind): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    getStorageValue(key: string, kind: PluginStorageKind): Promise<KeysToAnyValues> {
        throw new Error('Method not implemented.');
    }
    async getAllStorageValues(kind: PluginStorageKind): Promise<KeysToKeysToAnyValue> {
        return {};
    }

}
