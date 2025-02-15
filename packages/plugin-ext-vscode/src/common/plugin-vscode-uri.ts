// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
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

import URI from '@theia/core/lib/common/uri';
import { PluginIdentifiers } from '@theia/plugin-ext';

/**
 * Static methods for identifying a plugin as the target of the VSCode deployment system.
 * In practice, this means that it will be resolved and deployed by the Open-VSX system.
 */
export namespace VSCodeExtensionUri {
    export const SCHEME = 'vscode-extension';

    export function fromId(id: string, version?: string): URI {
        if (typeof version === 'string') {
            return new URI().withScheme(VSCodeExtensionUri.SCHEME).withAuthority(id).withPath(`/${version}`);
        } else {
            return new URI().withScheme(VSCodeExtensionUri.SCHEME).withAuthority(id);
        }
    }

    export function fromVersionedId(versionedId: string): URI {
        const versionAndId = PluginIdentifiers.getIdAndVersion(versionedId);
        return fromId(versionAndId[0], versionAndId[1]);
    }

    export function toId(uri: URI): { id: string, version?: string } | undefined {
        if (uri.scheme === VSCodeExtensionUri.SCHEME) {
            return { id: uri.authority, version: uri.path.isRoot ? undefined : uri.path.base };
        }
        return undefined;
    }
}
