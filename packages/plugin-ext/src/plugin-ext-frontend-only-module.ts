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

import { ContainerModule } from '@theia/core/shared/inversify';
import { HostedPluginServer, PluginServer } from './common/plugin-protocol';
import { FrontendHostedPluginServer } from './hosted/browser-only/frontend-hosted-plugin-server';
import { PluginPathsService } from './main/common/plugin-paths-protocol';
import { FrontendPluginPathService } from './hosted/browser-only/frontend-plugin-path-service';
import { FrontendPluginServer } from './hosted/browser-only/frontend-plugin-server';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(HostedPluginServer).to(FrontendHostedPluginServer).inSingletonScope();
    rebind(PluginServer).to(FrontendPluginServer).inSingletonScope();
    rebind(PluginPathsService).to(FrontendPluginPathService).inSingletonScope();
});
