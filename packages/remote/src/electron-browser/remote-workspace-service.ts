// *****************************************************************************
// Copyright (C) 2024 TypeFox and others.
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

import { URI } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { WorkspaceInput, WorkspaceService } from '@theia/workspace/lib/browser';
import { LOCAL_FILE_SCHEME } from './local-backend-services';
import { CURRENT_PORT_PARAM, LOCAL_PORT_PARAM, getCurrentPort, getLocalPort } from '@theia/core/lib/electron-browser/messaging/electron-local-ws-connection-source';
import { RemoteStatusService } from '../electron-common/remote-status-service';

@injectable()
export class RemoteWorkspaceService extends WorkspaceService {

    @inject(RemoteStatusService)
    protected readonly remoteStatusService: RemoteStatusService;

    override canHandle(uri: URI): boolean {
        return super.canHandle(uri) || uri.scheme === LOCAL_FILE_SCHEME;
    }

    override async recentWorkspaces(): Promise<string[]> {
        const workspaces = await super.recentWorkspaces();
        return workspaces.map(workspace => {
            const uri = new URI(workspace);
            if (uri.scheme === 'file') {
                return uri.withScheme(LOCAL_FILE_SCHEME).toString();
            }
            // possible check as well if a remote/dev-container worksace is from the connected remote and therefore change it to the 'file' scheme
            return workspace;
        });
    }

    protected override reloadWindow(options?: WorkspaceInput): void {
        const currentPort = getCurrentPort();
        const url = this.getModifiedUrl();
        history.replaceState(undefined, '', url.toString());
        this.remoteStatusService.connectionClosed(parseInt(currentPort ?? '0'));
        super.reloadWindow(options);
    }

    protected override openNewWindow(workspacePath: string, options?: WorkspaceInput): void {
        const url = this.getModifiedUrl();
        url.hash = encodeURI(workspacePath);
        this.windowService.openNewWindow(url.toString());
    }

    protected getModifiedUrl(): URL {
        const url = new URL(window.location.href);
        url.searchParams.set(CURRENT_PORT_PARAM, getLocalPort() ?? '');
        url.searchParams.delete(LOCAL_PORT_PARAM);
        return url;
    }
}
