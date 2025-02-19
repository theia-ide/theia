// *****************************************************************************
// Copyright (C) 2017 TypeFox and others.
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nano from 'nano';
import { RequestContext } from '@theia/request';
import { NodeRequestService } from '@theia/request/lib/node-request-service';
import { NpmRegistryProps } from './application-props';

export interface IChangeStream {
    on(event: 'data', cb: (change: { id: string }) => void): void;
    destroy(): void;
}

export interface Author {
    name: string;
    email: string;
}

export interface Maintainer {
    username: string;
    email: string;
}

export interface Dependencies {
    [name: string]: string | undefined;
}

export interface PeerDependenciesMeta {
    [name: string]: { optional: boolean } | undefined;
}

export interface NodePackage {
    name?: string;
    version?: string;
    description?: string;
    publisher?: Maintainer;
    author?: string | Author;
    maintainers?: Maintainer[];
    keywords?: string[];
    dependencies?: Dependencies;
    peerDependencies?: Dependencies;
    peerDependenciesMeta?: PeerDependenciesMeta;
    [property: string]: any;
}

export interface PublishedNodePackage extends NodePackage {
    name: string;
    version: string;
}
export namespace PublishedNodePackage {
    export function is(pck: NodePackage | undefined): pck is PublishedNodePackage {
        return !!pck && !!pck.name && !!pck.version;
    }
}

export interface ViewResult {
    'dist-tags': {
        [tag: string]: string
    }
    'versions': {
        [version: string]: NodePackage
    },
    'readme': string;
    [key: string]: any
}

export function sortByKey(object: { [key: string]: any }): {
    [key: string]: any;
} {
    return Object.keys(object).sort().reduce((sorted, key) => {
        sorted[key] = object[key];
        return sorted;
    }, {} as { [key: string]: any });
}

export class NpmRegistryOptions {
    /**
     * Default: false.
     */
    readonly watchChanges: boolean;
}

export class NpmRegistry {

    readonly props: NpmRegistryProps = { ...NpmRegistryProps.DEFAULT };
    protected readonly options: NpmRegistryOptions;

    protected changes?: nano.ChangesReaderScope;
    protected readonly index = new Map<string, Promise<ViewResult>>();

    protected request: NodeRequestService;

    constructor(options?: Partial<NpmRegistryOptions>) {
        this.options = {
            watchChanges: false,
            ...options
        };
        this.resetIndex();
        this.request = new NodeRequestService();
    }

    updateProps(props?: Partial<NpmRegistryProps>): void {
        const oldRegistry = this.props.registry;
        Object.assign(this.props, props);
        const newRegistry = this.props.registry;
        if (oldRegistry !== newRegistry) {
            this.resetIndex();
        }
    }
    protected resetIndex(): void {
        this.index.clear();
        if (this.options.watchChanges && this.props.registry === NpmRegistryProps.DEFAULT.registry) {
            if (this.changes) {
                this.changes.stop();
            }
            // Invalidate index with NPM registry web hooks
            this.changes = nano('https://replicate.npmjs.com').use('registry').changesReader;
            this.changes.get({}).on('change', change => this.invalidate(change.id));
        }
    }
    protected invalidate(name: string): void {
        if (this.index.delete(name)) {
            this.view(name);
        }
    }

    view(name: string): Promise<ViewResult> {
        const indexed = this.index.get(name);
        if (indexed) {
            return indexed;
        }
        const result = this.doView(name);
        this.index.set(name, result);
        result.catch(() => this.index.delete(name));
        return result;
    }

    protected async doView(name: string): Promise<ViewResult> {
        let url = this.props.registry;
        if (name[0] === '@') {
            url += '@' + encodeURIComponent(name.substring(1));
        } else {
            url += encodeURIComponent(name);
        }
        const response = await this.request.request({ url });
        if (response.res.statusCode !== 200) {
            throw new Error(`HTTP ${response.res.statusCode}: for ${url}`);
        }
        return RequestContext.asJson<ViewResult>(response);
    }

}
