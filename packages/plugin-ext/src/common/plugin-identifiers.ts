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

export namespace PluginIdentifiers {
    export interface Components {
        publisher?: string;
        name: string;
        version: string;
    }

    export interface IdAndVersion {
        id: UnversionedId;
        version: string;
    }

    export type VersionedId = `${string}.${string}@${string}`;
    export type UnversionedId = `${string}.${string}`;
    /** Unpublished plugins (not from Open VSX or VSCode plugin store) may not have a `publisher` field. */
    export const UNPUBLISHED = '<unpublished>';

    /**
     * @returns a string in the format `<publisher>.<name>`
     */
    export function componentsToUnversionedId({ publisher = UNPUBLISHED, name }: Components): UnversionedId {
        return `${publisher.toLowerCase()}.${name.toLowerCase()}`;
    }
    /**
     * @returns a string in the format `<publisher>.<name>@<version>`.
     */
    export function componentsToVersionedId({ publisher = UNPUBLISHED, name, version }: Components): VersionedId {
        return `${publisher.toLowerCase()}.${name.toLowerCase()}@${version}`;
    }
    export function componentsToVersionWithId(components: Components): IdAndVersion {
        return { id: componentsToUnversionedId(components), version: components.version };
    }
    /**
     * @returns a string in the format `<id>@<version>`.
     */
    export function idAndVersionToVersionedId({ id, version }: IdAndVersion): VersionedId {
        return `${id}@${version}`;
    }
    /**
     * @returns a string in the format `<publisher>.<name>`.
     */
    export function unversionedFromVersioned(id: VersionedId): UnversionedId {
        const endOfId = id.indexOf('@');
        return id.slice(0, endOfId) as UnversionedId;
    }
    /**
     * @returns `undefined` if it looks like the string passed in does not have the format of {@link PluginIdentifiers.VersionedId}.
     */
    export function identifiersFromVersionedId(probablyId: string): Components | undefined {
        const endOfPublisher = probablyId.indexOf('.');
        const endOfName = probablyId.indexOf('@', endOfPublisher);
        if (endOfPublisher === -1 || endOfName === -1) {
            return undefined;
        }
        return { publisher: probablyId.slice(0, endOfPublisher), name: probablyId.slice(endOfPublisher + 1, endOfName), version: probablyId.slice(endOfName + 1) };
    }
    /**
     * @returns `undefined` if it looks like the string passed in does not have the format of {@link PluginIdentifiers.VersionedId}.
     */
    export function idAndVersionFromVersionedId(probablyId: string): IdAndVersion | undefined {
        const endOfPublisher = probablyId.indexOf('.');
        const endOfName = probablyId.indexOf('@', endOfPublisher);
        if (endOfPublisher === -1 || endOfName === -1) {
            return undefined;
        }
        return { id: probablyId.slice(0, endOfName) as UnversionedId, version: probablyId.slice(endOfName + 1) };
    }

    /**
     * Regular expression to match plugin identifiers.
     *
     * The pattern matches strings in the format: `vendor.name@version`.
     *
     * Expected matching strings examples:
     * - `vendor.name@prerelease`
     * - `vendor.name@1.0.0`
     * - `vendor.name@1.0.0-beta`
     */
    const EXTENSION_IDENTIFIER_WITH_VERSION_REGEX = /^([^.]+\..+)@((prerelease)|(\d+\.\d+\.\d+(-.*)?))$/;

    /**
     * Extracts the extension identifier and version from a string.
     * @param id  The extension identifier
     * @returns  A tuple of the extension identifier and the version, if present.
     */
    export function getIdAndVersion(id: string): [string, string | undefined] {
        const matches = EXTENSION_IDENTIFIER_WITH_VERSION_REGEX.exec(id);
        if (matches && matches[1]) {
            return [matches[1], matches[2]];
        }
        return [id, undefined];
    }

    /**
     *  Checks if the extension identifier is in the format `<publisher>.<name>@<version>`.
     * @param id  The extension identifier
     * @returns  `true` if the extension identifier is in the format `<publisher>.<name>@<version>`.
     */
    export function isVersionedId(id: string): boolean {
        const matches = EXTENSION_IDENTIFIER_WITH_VERSION_REGEX.exec(id);
        // eslint-disable-next-line no-null/no-null
        return matches !== null && matches.length > 2;
    }

}
