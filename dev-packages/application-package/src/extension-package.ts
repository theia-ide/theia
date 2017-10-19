/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as fs from 'fs-extra';
import * as paths from 'path';
import * as semver from 'semver';
import { NpmRegistry, PublishedNodePackage, NodePackage } from './npm-registry';

export interface Extension {
    frontend?: string;
    frontendElectron?: string;
    backend?: string;
    backendElectron?: string;
}

export class ExtensionPackage {
    constructor(
        protected readonly raw: PublishedNodePackage & Partial<RawExtensionPackage>,
        protected readonly registry: NpmRegistry
    ) {
        this.raw = raw;
    }

    get name(): string {
        return this.raw.name;
    }

    get version(): string {
        if (this.raw.installed) {
            return this.raw.installed.version;
        }
        return this.raw.version;
    }

    get description(): string {
        return this.raw.description || '';
    }

    get theiaExtensions(): Extension[] {
        return this.raw.theiaExtensions || [];
    }

    get installed(): boolean {
        return !!this.raw.installed;
    }

    get dependent(): string | undefined {
        if (!this.transitive) {
            return undefined;
        }
        let current = this.parent!;
        let parent = current.parent;
        while (parent !== undefined) {
            current = parent;
            parent = current.parent;
        }
        return current.name;
    }

    get transitive(): boolean {
        return !!this.raw.installed && this.raw.installed.transitive;
    }

    get parent(): ExtensionPackage | undefined {
        if (this.raw.installed) {
            return this.raw.installed.parent;
        }
        return undefined;
    }

    protected async view(): Promise<RawExtensionPackage.ViewState> {
        if (this.raw.view === undefined) {
            const raw = await RawExtensionPackage.view(this.registry, this.name, this.version);
            this.raw.view = raw ? raw.view : {};
        }
        return this.raw.view!;
    }

    protected readme?: string;
    async getReadme(): Promise<string> {
        if (this.readme === undefined) {
            this.readme = await this.resolveReadme();
        }
        return this.readme;
    }
    protected async resolveReadme(): Promise<string> {
        const raw = await this.view();
        if (raw && raw.readme) {
            return raw.readme;
        }
        if (this.raw.installed) {
            const readmePath = paths.resolve(this.raw.installed.packagePath, '..', 'README.md');
            if (await fs.pathExists(readmePath)) {
                return fs.readFile(readmePath, { encoding: 'utf8' });
            }
            return '';
        }
        return '';
    }

    async getLatestVersion(): Promise<string | undefined> {
        const raw = await this.view();
        return raw.tags ? raw.tags['latest'] : undefined;
    }

    protected versionRange?: string;
    async getVersionRange(): Promise<string | undefined> {
        if (this.versionRange === undefined) {
            this.versionRange = await this.resolveVersionRange();
        }
        return this.versionRange;
    }
    protected async resolveVersionRange(): Promise<string | undefined> {
        const version = this.raw.version;
        const validVersion = semver.valid(version);
        if (validVersion) {
            return validVersion;
        }
        const validRange = semver.validRange(version);
        if (validRange) {
            return validRange;
        }
        const raw = await this.view();
        return raw.tags ? raw.tags[version] : undefined;
    }

    getAuthor(): string {
        if (this.raw.publisher) {
            return this.raw.publisher.username;
        }
        if (typeof this.raw.author === 'string') {
            return this.raw.author;
        }
        if (this.raw.author && this.raw.author.name) {
            return this.raw.author.name;
        }
        if (!!this.raw.maintainers && this.raw.maintainers.length > 0) {
            return this.raw.maintainers[0].username;
        }
        return '';
    }

    async isOutdated(): Promise<boolean> {
        const latestVersion = await this.getLatestVersion();
        if (!latestVersion) {
            return false;
        }
        const versionRange = await this.getVersionRange();
        if (versionRange && semver.gtr(latestVersion, versionRange)) {
            return true;
        }
        if (this.raw.installed) {
            return semver.gt(latestVersion, this.raw.installed.version);
        }
        return false;
    }
}

export interface RawExtensionPackage extends PublishedNodePackage {
    installed?: RawExtensionPackage.InstalledState
    view?: RawExtensionPackage.ViewState
    theiaExtensions: Extension[];
}
export namespace RawExtensionPackage {
    export interface InstalledState {
        version: string;
        packagePath: string;
        transitive: boolean;
        parent?: ExtensionPackage;
    }
    export interface ViewState {
        readme?: string
        tags?: {
            [tag: string]: string
        }
    }
    export function is(pck: NodePackage | undefined): pck is RawExtensionPackage {
        return PublishedNodePackage.is(pck) && !!pck.theiaExtensions;
    }
    export async function view(registry: NpmRegistry, name: string, version?: string): Promise<RawExtensionPackage | undefined> {
        const result = await registry.view({ name, abbreviated: false }).catch(() => undefined);
        if (!result) {
            return undefined;
        }
        const tags = result['dist-tags'];
        const versions = [tags['latest']];
        if (version) {
            versions.push(tags[version], version);
        }
        for (const current of versions.reverse()) {
            const raw = result.versions[current];
            if (is(raw)) {
                raw.view = {
                    readme: result.readme,
                    tags
                };
                return raw;
            }
        }
        return undefined;
    }
}
