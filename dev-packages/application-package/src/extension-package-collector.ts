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

import { readJsonFile } from './json-file';
import { NodePackage, PublishedNodePackage } from './npm-registry';
import { ExtensionPackage, ExtensionPackageOptions, RawExtensionPackage } from './extension-package';

export class ExtensionPackageCollector {

    protected readonly sorted: ExtensionPackage[] = [];
    protected readonly visited = new Set<string>();

    constructor(
        protected readonly extensionPackageFactory: (raw: PublishedNodePackage, options?: ExtensionPackageOptions) => ExtensionPackage,
        protected readonly resolveModule: (packagepath: string, modulePath: string) => string
    ) { }

    protected root: NodePackage;
    collect(packagePath: string, pck: NodePackage): ReadonlyArray<ExtensionPackage> {
        this.root = pck;
        this.collectPackages(packagePath, pck);
        return this.sorted;
    }

    protected collectPackages(packagePath: string, pck: NodePackage): void {
        for (const [dependency, versionRange] of [
            ...Object.entries(pck.dependencies ?? {}),
            ...Object.entries(pck.peerDependencies ?? {})
        ]) {
            const optional = pck.peerDependenciesMeta?.[dependency]?.optional || false;
            this.collectPackage(packagePath, dependency, versionRange!, optional);
        }
    }

    protected parent: ExtensionPackage | undefined;
    protected collectPackagesWithParent(packagePath: string, pck: NodePackage, parent: ExtensionPackage): void {
        const current = this.parent;
        this.parent = parent;
        this.collectPackages(packagePath, pck);
        this.parent = current;
    }

    protected collectPackage(parentPackagePath: string, name: string, versionRange: string, optional: boolean): void {
        if (this.visited.has(name)) {
            return;
        }
        this.visited.add(name);

        let packagePath: string | undefined;
        try {
            packagePath = this.resolveModule(parentPackagePath, name);
        } catch (err) {
            if (optional) {
                console.log(`Could not resolve optional peer dependency '${name}'. Skipping...`);
            } else {
                console.error(err.message);
            }
        }
        if (!packagePath) {
            return;
        }
        const pck: NodePackage = readJsonFile(packagePath);
        if (RawExtensionPackage.is(pck)) {
            const parent = this.parent;
            const version = pck.version;
            const transitive = !(name in this.root.dependencies!);
            pck.installed = { packagePath, version, parent, transitive };
            pck.version = versionRange;
            const extensionPackage = this.extensionPackageFactory(pck, { alias: name });
            this.collectPackagesWithParent(packagePath, pck, extensionPackage);
            this.sorted.push(extensionPackage);
        }
    }

}
