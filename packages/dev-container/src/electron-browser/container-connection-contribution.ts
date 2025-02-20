// *****************************************************************************
// Copyright (C) 2024 Typefox and others.
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

import { inject, injectable } from '@theia/core/shared/inversify';
import { AbstractRemoteRegistryContribution, RemoteRegistry } from '@theia/remote/lib/electron-browser/remote-registry-contribution';
import { DevContainerFile, LastContainerInfo, RemoteContainerConnectionProvider } from '../electron-common/remote-container-connection-provider';
import { RemotePreferences } from '@theia/remote/lib/electron-browser/remote-preferences';
import { Command, MaybePromise, QuickInputService, URI } from '@theia/core';
import { WorkspaceInput, WorkspaceOpenHandlerContribution, WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { ContainerOutputProvider } from './container-output-provider';
import { WorkspaceServer } from '@theia/workspace/lib/common';
import { DEV_CONTAINER_PATH_QUERY, DEV_CONTAINER_WORKSPACE_SCHEME } from '../electron-common/dev-container-workspaces';
import { LocalStorageService, StorageService } from '@theia/core/lib/browser';

export namespace RemoteContainerCommands {
    export const REOPEN_IN_CONTAINER = Command.toLocalizedCommand({
        id: 'dev-container:reopen-in-container',
        label: 'Reopen in Container',
        category: 'Dev Container'
    }, 'theia/dev-container/connect');
}

const LAST_USED_CONTAINER = 'lastUsedContainer';
@injectable()
export class ContainerConnectionContribution extends AbstractRemoteRegistryContribution implements WorkspaceOpenHandlerContribution {

    @inject(RemoteContainerConnectionProvider)
    protected readonly connectionProvider: RemoteContainerConnectionProvider;

    @inject(RemotePreferences)
    protected readonly remotePreferences: RemotePreferences;

    @inject(LocalStorageService)
    protected readonly storageService: StorageService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(WorkspaceServer)
    protected readonly workspaceServer: WorkspaceServer;

    @inject(QuickInputService)
    protected readonly quickInputService: QuickInputService;

    @inject(ContainerOutputProvider)
    protected readonly containerOutputProvider: ContainerOutputProvider;

    registerRemoteCommands(registry: RemoteRegistry): void {
        registry.registerCommand(RemoteContainerCommands.REOPEN_IN_CONTAINER, {
            execute: () => this.openInContainer()
        });
    }

    canHandle(uri: URI): MaybePromise<boolean> {
        return uri.scheme === DEV_CONTAINER_WORKSPACE_SCHEME;
    }

    async openWorkspace(uri: URI, options?: WorkspaceInput | undefined): Promise<void> {
        const filePath = new URLSearchParams(uri.query).get(DEV_CONTAINER_PATH_QUERY);

        if (!filePath) {
            throw new Error('No devcontainer file specified for workspace');
        }

        const devcontainerFiles = await this.connectionProvider.getDevContainerFiles(uri.path.toString());
        const devcontainerFile = devcontainerFiles.find(file => file.path === filePath);

        if (!devcontainerFile) {
            throw new Error(`Devcontainer file at ${filePath} not found in workspace`);
        }

        return this.doOpenInContainer(devcontainerFile, uri.path.toString());
    }

    async getWorkspaceLabel(uri: URI): Promise<string | undefined> {
        const containerFilePath = new URLSearchParams(uri.query).get(DEV_CONTAINER_PATH_QUERY);
        if (!containerFilePath) {
            return;
        };
        const files = await this.connectionProvider.getDevContainerFiles(uri.path.toString());
        const devcontainerFile = files.find(file => file.path === containerFilePath);
        return `${uri.path.base} [Dev Container: ${devcontainerFile?.name}]`;
    }

    async openInContainer(): Promise<void> {
        const devcontainerFile = await this.getOrSelectDevcontainerFile();
        if (!devcontainerFile) {
            return;
        }
        this.doOpenInContainer(devcontainerFile);
    }

    async doOpenInContainer(devcontainerFile: DevContainerFile, workspacePath?: string): Promise<void> {
        const lastContainerInfoKey = `${LAST_USED_CONTAINER}:${devcontainerFile.path}`;
        const lastContainerInfo = await this.storageService.getData<LastContainerInfo | undefined>(lastContainerInfoKey);

        this.containerOutputProvider.openChannel();

        const connectionResult = await this.connectionProvider.connectToContainer({
            nodeDownloadTemplate: this.remotePreferences['remote.nodeDownloadTemplate'],
            lastContainerInfo,
            devcontainerFile: devcontainerFile.path,
            workspacePath: workspacePath
        });

        this.storageService.setData<LastContainerInfo>(lastContainerInfoKey, {
            id: connectionResult.containerId,
            lastUsed: Date.now()
        });

        this.workspaceServer.setMostRecentlyUsedWorkspace(
            `${DEV_CONTAINER_WORKSPACE_SCHEME}:${workspacePath ?? this.workspaceService.workspace?.resource.path}?${DEV_CONTAINER_PATH_QUERY}=${devcontainerFile.path}`);

        this.openRemote(connectionResult.port, false, connectionResult.workspacePath);
    }

    async getOrSelectDevcontainerFile(): Promise<DevContainerFile | undefined> {
        const workspace = this.workspaceService.workspace;
        if (!workspace) {
            return;
        }
        const devcontainerFiles = await this.connectionProvider.getDevContainerFiles(workspace.resource.path.toString());

        if (devcontainerFiles.length === 1) {
            return devcontainerFiles[0];
        }

        return (await this.quickInputService.pick(devcontainerFiles.map(file => ({
            type: 'item',
            label: file.name,
            description: file.path,
            file: file,
        })), {
            title: 'Select a devcontainer.json file'
        }))?.file;
    }

}
