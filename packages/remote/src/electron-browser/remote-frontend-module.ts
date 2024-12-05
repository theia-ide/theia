// *****************************************************************************
// Copyright (C) 2023 TypeFox and others.
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

import { bindContributionProvider, CommandContribution } from '@theia/core';
import { ContainerModule } from '@theia/core/shared/inversify';
import { bindViewContribution, FrontendApplicationContribution, isRemote, WidgetFactory } from '@theia/core/lib/browser';
import { RemoteSSHContribution } from './remote-ssh-contribution';
import { RemoteSSHConnectionProvider, RemoteSSHConnectionProviderPath } from '../electron-common/remote-ssh-connection-provider';
import { RemoteFrontendContribution } from './remote-frontend-contribution';
import { RemoteRegistryContribution } from './remote-registry-contribution';
import { RemoteService } from './remote-service';
import { RemoteStatusService, RemoteStatusServicePath } from '../electron-common/remote-status-service';
import { ElectronFileDialogService } from '@theia/filesystem/lib/electron-browser/file-dialog/electron-file-dialog-service';
import { RemoteElectronFileDialogService } from './remote-electron-file-dialog-service';
import { bindRemotePreferences } from './remote-preferences';
import { PortForwardingWidget, PORT_FORWARDING_WIDGET_ID } from './port-forwarding/port-forwarding-widget';
import { PortForwardingContribution } from './port-forwarding/port-forwading-contribution';
import { PortForwardingService } from './port-forwarding/port-forwarding-service';
import { RemotePortForwardingProvider, RemoteRemotePortForwardingProviderPath } from '../electron-common/remote-port-forwarding-provider';
import { ServiceConnectionProvider } from '@theia/core/lib/browser/messaging/service-connection-provider';
import '../../src/electron-browser/style/port-forwarding-widget.css';
import { UserStorageContribution } from '@theia/userstorage/lib/browser/user-storage-contribution';
import { RemoteUserStorageContribution } from './remote-user-storage-provider';
import { remoteFileSystemPath, RemoteFileSystemProxyFactory, RemoteFileSystemServer } from '@theia/filesystem/lib/common/remote-file-system-provider';
import { LocalEnvVariablesServer, LocalRemoteFileSystemContribution, LocalRemoteFileSystemProvider, LocalRemoteFileSytemServer } from './local-backend-services';
import { envVariablesPath, EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { RemoteWorkspaceService } from './remote-workspace-service';
import { FileServiceContribution } from '@theia/filesystem/lib/browser/file-service';

export default new ContainerModule((bind, _, __, rebind) => {
    bind(RemoteFrontendContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(RemoteFrontendContribution);
    bind(CommandContribution).toService(RemoteFrontendContribution);

    bindContributionProvider(bind, RemoteRegistryContribution);
    bind(RemoteSSHContribution).toSelf().inSingletonScope();
    bind(RemoteRegistryContribution).toService(RemoteSSHContribution);

    bindRemotePreferences(bind);

    rebind(ElectronFileDialogService).to(RemoteElectronFileDialogService).inSingletonScope();

    bind(RemoteService).toSelf().inSingletonScope();

    bind(PortForwardingWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: PORT_FORWARDING_WIDGET_ID,
        createWidget: () => context.container.get<PortForwardingWidget>(PortForwardingWidget)
    }));

    bindViewContribution(bind, PortForwardingContribution);
    bind(PortForwardingService).toSelf().inSingletonScope();

    bind(RemoteSSHConnectionProvider).toDynamicValue(ctx =>
        ServiceConnectionProvider.createLocalProxy<RemoteSSHConnectionProvider>(ctx.container, RemoteSSHConnectionProviderPath)).inSingletonScope();
    bind(RemoteStatusService).toDynamicValue(ctx =>
        ServiceConnectionProvider.createLocalProxy<RemoteStatusService>(ctx.container, RemoteStatusServicePath)).inSingletonScope();

    bind(RemotePortForwardingProvider).toDynamicValue(ctx =>
        ServiceConnectionProvider.createLocalProxy<RemotePortForwardingProvider>(ctx.container, RemoteRemotePortForwardingProviderPath)).inSingletonScope();

    bind(LocalRemoteFileSytemServer).toDynamicValue(ctx =>
        isRemote ?
            ServiceConnectionProvider.createLocalProxy(ctx.container, remoteFileSystemPath, new RemoteFileSystemProxyFactory()) :
            ctx.container.get(RemoteFileSystemServer));
    bind(LocalEnvVariablesServer).toDynamicValue(ctx =>
        isRemote ?
            ServiceConnectionProvider.createLocalProxy<EnvVariablesServer>(ctx.container, envVariablesPath) :
            ctx.container.get(EnvVariablesServer));
    bind(LocalRemoteFileSystemProvider).toSelf().inSingletonScope();
    rebind(UserStorageContribution).to(RemoteUserStorageContribution);

    if (isRemote) {
        rebind(WorkspaceService).to(RemoteWorkspaceService).inSingletonScope();
        bind(LocalRemoteFileSystemContribution).toSelf().inSingletonScope();
        bind(FileServiceContribution).toService(LocalRemoteFileSystemContribution);
    }

});

