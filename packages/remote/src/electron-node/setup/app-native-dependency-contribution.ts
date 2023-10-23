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

import { injectable } from '@theia/core/shared/inversify';
import { RemoteNativeDependencyContribution, DownloadOptions, DependencyDownload } from './remote-native-dependency-contribution';
import { RemotePlatform } from '../remote-types';

@injectable()
export class AppNativeDependencyContribution implements RemoteNativeDependencyContribution {

    // TODO: Points for testing purposes to a non-theia repo
    // Should be replaced with:
    // 'https://github.com/eclipse-theia/theia/releases/download'
    appDownloadUrlBase = 'https://github.com/msujew/theia/releases/download';

    protected getDefaultURLForFile(remotePlatform: RemotePlatform, theiaVersion: string): string {
        if (remotePlatform.arch !== 'x64') {
            throw new Error(`Unsupported remote architecture '${remotePlatform.arch}'. Remote support is only available for x64 architectures.`);
        }
        return `${this.appDownloadUrlBase}/v${theiaVersion}/native-dependencies-${remotePlatform.os}-${remotePlatform.arch}.zip`;
    }

    async download(options: DownloadOptions): Promise<DependencyDownload> {
        return {
            buffer: await options.download(this.getDefaultURLForFile(options.remotePlatform, options.theiaVersion)),
            archive: 'zip'
        };
    }
}
