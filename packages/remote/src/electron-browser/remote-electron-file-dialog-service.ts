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

import { MaybeArray, URI, nls } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { OpenFileDialogProps, SaveFileDialogProps } from '@theia/filesystem/lib/browser/file-dialog';
import { FileStat } from '@theia/filesystem/lib/common/files';
import { DefaultFileDialogService } from '@theia/filesystem/lib/browser/file-dialog/file-dialog-service';
import { ElectronFileDialogService } from '@theia/filesystem/lib/electron-browser/file-dialog/electron-file-dialog-service';
import { RemoteService } from './remote-service';
import { LOCAL_FILE_SCHEME } from './local-backend-services';

@injectable()
export class RemoteElectronFileDialogService extends ElectronFileDialogService {

    @inject(RemoteService) protected readonly remoteService: RemoteService;

    override showOpenDialog(props: OpenFileDialogProps & { canSelectMany: true; }, folder?: FileStat | undefined): Promise<MaybeArray<URI> | undefined>;
    override showOpenDialog(props: OpenFileDialogProps, folder?: FileStat | undefined): Promise<URI | undefined>;
    override showOpenDialog(props: OpenFileDialogProps, folder?: FileStat): Promise<MaybeArray<URI> | undefined> | Promise<URI | undefined> {
        if (this.remoteService.isConnected()) {
            this.addLocalFilesButton(props);
            return DefaultFileDialogService.prototype.showOpenDialog.call(this, props, folder);
        } else {
            return super.showOpenDialog(props, folder);
        }
    }

    override showSaveDialog(props: SaveFileDialogProps, folder?: FileStat | undefined): Promise<URI | undefined> {
        if (this.remoteService.isConnected()) {
            return DefaultFileDialogService.prototype.showSaveDialog.call(this, props, folder);
        } else {
            return super.showSaveDialog(props, folder);
        }
    }

    protected addLocalFilesButton(props: OpenFileDialogProps): void {
        const localFilesButton: [string, (res: typeof Promise.resolve) => void] = ['Show Local Files', async resolve => {
            const localFile = await super.showOpenDialog({ ...props, title: nls.localizeByDefault('Show Local'), fileScheme: LOCAL_FILE_SCHEME });
            if (localFile) {
                resolve({ uri: localFile });
            } else {
                resolve(undefined);
            }
        }];
        if (props.additionalButtons) {
            props.additionalButtons.push(localFilesButton);
        } else {
            props.additionalButtons = [localFilesButton];
        }
    }
}
