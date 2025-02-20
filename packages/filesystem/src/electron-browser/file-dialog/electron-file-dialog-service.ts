// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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
import URI from '@theia/core/lib/common/uri';
import { MaybeArray } from '@theia/core/lib/common/types';
import { MessageService } from '@theia/core/lib/common/message-service';
import { FileStat } from '../../common/files';
import { FileAccess } from '../../common/filesystem';
import { DefaultFileDialogService, OpenFileDialogProps, SaveFileDialogProps } from '../../browser/file-dialog';
//
// We are OK to use this here because the electron backend and frontend are on the same host.
// If required, we can move this single service (and its module) to a dedicated Theia extension,
// and at packaging time, clients can decide whether they need the native or the browser-based
// solution.
//
// eslint-disable-next-line @theia/runtime-import-check
import { FileUri } from '@theia/core/lib/common/file-uri';
import { OpenDialogOptions, SaveDialogOptions } from '../../electron-common/electron-api';

import '@theia/core/lib/electron-common/electron-api';

@injectable()
export class ElectronFileDialogService extends DefaultFileDialogService {

    @inject(MessageService) protected readonly messageService: MessageService;

    override async showOpenDialog(props: OpenFileDialogProps & { canSelectMany: true }, folder?: FileStat): Promise<MaybeArray<URI> | undefined>;
    override async showOpenDialog(props: OpenFileDialogProps, folder?: FileStat): Promise<URI | undefined>;
    override async showOpenDialog(props: OpenFileDialogProps, folder?: FileStat): Promise<MaybeArray<URI> | undefined> {
        if (window.electronTheiaCore.useNativeElements) {
            const rootNode = await this.getRootNode(folder);
            if (rootNode) {
                const filePaths = await window.electronTheiaFilesystem.showOpenDialog(this.toOpenDialogOptions(rootNode.uri, props));
                if (!filePaths || filePaths.length === 0) {
                    return undefined;
                }

                const uris = filePaths.map(path => {
                    let uri = FileUri.create(path);
                    if (props.fileScheme) {
                        uri = uri.withScheme(props.fileScheme);
                    }
                    return uri;
                });
                const canAccess = await this.canRead(uris);
                const result = canAccess ? uris.length === 1 ? uris[0] : uris : undefined;
                return result;
            }
            return undefined;
        }
        return super.showOpenDialog(props, folder);
    }

    override async showSaveDialog(props: SaveFileDialogProps, folder?: FileStat): Promise<URI | undefined> {
        if (window.electronTheiaCore.useNativeElements) {
            const rootNode = await this.getRootNode(folder);
            if (rootNode) {
                const filePath = await window.electronTheiaFilesystem.showSaveDialog(this.toSaveDialogOptions(rootNode.uri, props));

                if (!filePath) {
                    return undefined;
                }

                const uri = FileUri.create(filePath);
                if (props.fileScheme) {
                    uri.withScheme(props.fileScheme);
                }
                const exists = await this.fileService.exists(uri);
                if (!exists) {
                    return uri;
                }

                const canWrite = await this.canReadWrite(uri);
                return canWrite ? uri : undefined;
            }
            return undefined;
        }
        return super.showSaveDialog(props, folder);
    }

    protected async canReadWrite(uris: MaybeArray<URI>): Promise<boolean> {
        for (const uri of Array.isArray(uris) ? uris : [uris]) {
            if (!(await this.fileService.access(uri, FileAccess.Constants.R_OK | FileAccess.Constants.W_OK))) {
                this.messageService.error(`Cannot access resource at ${uri.path}.`);
                return false;
            }
        }
        return true;
    }

    protected async canRead(uris: MaybeArray<URI>): Promise<boolean> {
        const resources = Array.isArray(uris) ? uris : [uris];
        const unreadableResourcePaths: string[] = [];
        await Promise.all(resources.map(async resource => {
            if (!await this.fileService.access(resource, FileAccess.Constants.R_OK)) {
                unreadableResourcePaths.push(resource.path.toString());
            }
        }));
        if (unreadableResourcePaths.length > 0) {
            this.messageService.error(`Cannot read ${unreadableResourcePaths.length} resource(s): ${unreadableResourcePaths.join(', ')}`);
        }
        return unreadableResourcePaths.length === 0;
    }

    protected toOpenDialogOptions(uri: URI, props: OpenFileDialogProps): OpenDialogOptions {
        const result: OpenDialogOptions = {
            path: FileUri.fsPath(uri)
        };

        result.title = props.title;
        result.buttonLabel = props.openLabel;
        result.maxWidth = props.maxWidth;
        result.modal = props.modal ?? true;
        result.openFiles = props.canSelectFiles;
        result.openFolders = props.canSelectFolders;
        result.selectMany = props.canSelectMany;

        if (props.filters) {
            result.filters = [];
            const filters = Object.entries(props.filters);
            for (const [label, extensions] of filters) {
                result.filters.push({ name: label, extensions: extensions });
            }

            if (props.canSelectFiles) {
                if (filters.length > 0) {
                    result.filters.push({ name: 'All Files', extensions: ['*'] });
                }
            }
        }

        return result;
    }

    protected toSaveDialogOptions(uri: URI, props: SaveFileDialogProps): SaveDialogOptions {
        if (props.inputValue) {
            uri = uri.resolve(props.inputValue);
        }

        const result: SaveDialogOptions = {
            path: FileUri.fsPath(uri)
        };

        result.title = props.title;
        result.buttonLabel = props.saveLabel;
        result.maxWidth = props.maxWidth;
        result.modal = props.modal ?? true;

        if (props.filters) {
            result.filters = [];
            const filters = Object.entries(props.filters);
            for (const [label, extensions] of filters) {
                result.filters.push({ name: label, extensions: extensions });
            }
        }

        return result;
    }

}
