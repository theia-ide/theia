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

import { RpcProxy, URI } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { RemoteFileSystemProvider, RemoteFileSystemServer } from '@theia/filesystem/lib/common/remote-file-system-provider';
import { FileService, FileServiceContribution } from '@theia/filesystem/lib/browser/file-service';

export const LocalEnvVariablesServer = Symbol('LocalEnviromentVariableServer');
export const LocalRemoteFileSytemServer = Symbol('LocalRemoteFileSytemServer');

export const LOCAL_FILE_SCHEME = 'localfile';
/**
 * provide file access to local files while connected to a remote workspace or dev container.
 */
@injectable()
export class LocalRemoteFileSystemProvider extends RemoteFileSystemProvider {
    @inject(LocalRemoteFileSytemServer)
    protected override readonly server: RpcProxy<RemoteFileSystemServer>;

}

@injectable()
export class LocalRemoteFileSystemContribution implements FileServiceContribution {
    @inject(LocalRemoteFileSystemProvider)
    protected readonly provider: LocalRemoteFileSystemProvider;

    registerFileSystemProviders(service: FileService): void {
        service.onWillActivateFileSystemProvider(event => {
            if (event.scheme === LOCAL_FILE_SCHEME) {
                service.registerProvider(LOCAL_FILE_SCHEME, new Proxy(this.provider, {
                    get(target, prop): unknown {
                        const member = target[prop as keyof LocalRemoteFileSystemProvider];

                        if (typeof member === 'function') {
                            return (...args: unknown[]) => {
                                const mappedArgs = args.map(arg => {
                                    if (arg instanceof URI && arg.scheme === LOCAL_FILE_SCHEME) {
                                        return arg.withScheme('file');
                                    }
                                    return arg;
                                });
                                return member.apply(target, mappedArgs);
                            };
                        }
                        return member;
                    }
                }));
            }
        });
    }

}
