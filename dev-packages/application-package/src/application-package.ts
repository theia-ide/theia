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

import * as paths from 'path';
import { readJsonFile, writeJsonFile } from './json-file';
import { NpmRegistry, NodePackage, PublishedNodePackage, sortByKey } from './npm-registry';
import { Extension, ExtensionPackage, ExtensionPackageOptions, RawExtensionPackage } from './extension-package';
import { ExtensionPackageCollector } from './extension-package-collector';
import { ApplicationProps } from './application-props';
import deepmerge = require('deepmerge');
import resolvePackagePath = require('resolve-package-path');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApplicationLog = (message?: any, ...optionalParams: any[]) => void;
export class ApplicationPackageOptions {
    readonly projectPath: string;
    readonly log?: ApplicationLog;
    readonly error?: ApplicationLog;
    readonly registry?: NpmRegistry;
    readonly appTarget?: ApplicationProps.Target;
}

export type ApplicationModuleResolver = (parentPackagePath: string, modulePath: string) => string;

export class ApplicationPackage {
    readonly projectPath: string;
    readonly log: ApplicationLog;
    readonly error: ApplicationLog;

    constructor(
        protected readonly options: ApplicationPackageOptions
    ) {
        this.projectPath = options.projectPath;
        this.log = options.log || console.log.bind(console);
        this.error = options.error || console.error.bind(console);
    }

    protected _registry: NpmRegistry | undefined;
    get registry(): NpmRegistry {
        if (this._registry) {
            return this._registry;
        }
        this._registry = this.options.registry || new NpmRegistry();
        this._registry.updateProps(this.props);
        return this._registry;
    }

    get target(): ApplicationProps.Target {
        return this.props.target;
    }

    protected _props: ApplicationProps | undefined;
    get props(): ApplicationProps {
        if (this._props) {
            return this._props;
        }
        const theia = this.pck.theia || {};

        if (this.options.appTarget) {
            theia.target = this.options.appTarget;
        }

        if (theia.target && !(Object.values(ApplicationProps.ApplicationTarget).includes(theia.target))) {
            const defaultTarget = ApplicationProps.ApplicationTarget.browser;
            console.warn(`Unknown application target '${theia.target}', '${defaultTarget}' to be used instead`);
            theia.target = defaultTarget;
        }

        return this._props = deepmerge(ApplicationProps.DEFAULT, theia);
    }

    protected _pck: NodePackage | undefined;
    get pck(): NodePackage {
        if (this._pck) {
            return this._pck;
        }
        return this._pck = readJsonFile(this.packagePath);
    }

    protected _frontendModules: Map<string, string> | undefined;
    protected _frontendPreloadModules: Map<string, string> | undefined;
    protected _frontendElectronModules: Map<string, string> | undefined;
    protected _secondaryWindowModules: Map<string, string> | undefined;
    protected _backendModules: Map<string, string> | undefined;
    protected _backendElectronModules: Map<string, string> | undefined;
    protected _electronMainModules: Map<string, string> | undefined;
    protected _preloadModules: Map<string, string> | undefined;
    protected _extensionPackages: ReadonlyArray<ExtensionPackage> | undefined;

    /**
     * Extension packages in the topological order.
     */
    get extensionPackages(): ReadonlyArray<ExtensionPackage> {
        if (!this._extensionPackages) {
            const collector = new ExtensionPackageCollector(
                (raw: PublishedNodePackage, options: ExtensionPackageOptions = {}) => this.newExtensionPackage(raw, options),
                this.resolveModule
            );
            this._extensionPackages = collector.collect(this.packagePath, this.pck);
        }
        return this._extensionPackages;
    }

    getExtensionPackage(extension: string): ExtensionPackage | undefined {
        return this.extensionPackages.find(pck => pck.name === extension);
    }

    async findExtensionPackage(extension: string): Promise<ExtensionPackage | undefined> {
        return this.getExtensionPackage(extension) || this.resolveExtensionPackage(extension);
    }

    /**
     * Resolve an extension name to its associated package
     * @param extension the name of the extension's package as defined in "dependencies" (might be aliased)
     * @returns the extension package
     */
    async resolveExtensionPackage(extension: string): Promise<ExtensionPackage | undefined> {
        const raw = await RawExtensionPackage.view(this.registry, extension);
        return raw ? this.newExtensionPackage(raw, { alias: extension }) : undefined;
    }

    protected newExtensionPackage(raw: PublishedNodePackage, options: ExtensionPackageOptions = {}): ExtensionPackage {
        return new ExtensionPackage(raw, this.registry, options);
    }

    get frontendPreloadModules(): Map<string, string> {
        return this._frontendPreloadModules ??= this.computeModules('frontendPreload');
    }

    get frontendOnlyPreloadModules(): Map<string, string> {
        if (!this._frontendPreloadModules) {
            this._frontendPreloadModules = this.computeModules('frontendOnlyPreload', 'frontendPreload');
        }
        return this._frontendPreloadModules;
    }

    get frontendModules(): Map<string, string> {
        return this._frontendModules ??= this.computeModules('frontend');
    }

    get frontendOnlyModules(): Map<string, string> {
        if (!this._frontendModules) {
            this._frontendModules = this.computeModules('frontendOnly', 'frontend');
        }
        return this._frontendModules;
    }

    get frontendElectronModules(): Map<string, string> {
        return this._frontendElectronModules ??= this.computeModules('frontendElectron', 'frontend');
    }

    get secondaryWindowModules(): Map<string, string> {
        return this._secondaryWindowModules ??= this.computeModules('secondaryWindow');
    }

    get backendModules(): Map<string, string> {
        return this._backendModules ??= this.computeModules('backend');
    }

    get backendElectronModules(): Map<string, string> {
        return this._backendElectronModules ??= this.computeModules('backendElectron', 'backend');
    }

    get electronMainModules(): Map<string, string> {
        return this._electronMainModules ??= this.computeModules('electronMain');
    }

    get preloadModules(): Map<string, string> {
        return this._preloadModules ??= this.computeModules('preload');
    }

    protected computeModules<P extends keyof Extension, S extends keyof Extension = P>(primary: P, secondary?: S): Map<string, string> {
        const result = new Map<string, string>();
        let moduleIndex = 1;
        for (const extensionPackage of this.extensionPackages) {
            const extensions = extensionPackage.theiaExtensions;
            if (extensions) {
                for (const extension of extensions) {
                    const modulePath = extension[primary] || (secondary && extension[secondary]);
                    if (typeof modulePath === 'string') {
                        const extensionPath = paths.join(extensionPackage.name, modulePath).split(paths.sep).join('/');
                        result.set(`${primary}_${moduleIndex}`, extensionPath);
                        moduleIndex = moduleIndex + 1;
                    }
                }
            }
        }
        return result;
    }

    relative(path: string): string {
        return paths.relative(this.projectPath, path);
    }

    path(...segments: string[]): string {
        return paths.resolve(this.projectPath, ...segments);
    }

    get packagePath(): string {
        return this.path('package.json');
    }

    lib(...segments: string[]): string {
        return this.path('lib', ...segments);
    }

    srcGen(...segments: string[]): string {
        return this.path('src-gen', ...segments);
    }

    backend(...segments: string[]): string {
        return this.srcGen('backend', ...segments);
    }

    bundledBackend(...segments: string[]): string {
        return this.path('backend', 'bundle', ...segments);
    }

    frontend(...segments: string[]): string {
        return this.srcGen('frontend', ...segments);
    }

    isBrowser(): boolean {
        return this.target === ApplicationProps.ApplicationTarget.browser;
    }

    isElectron(): boolean {
        return this.target === ApplicationProps.ApplicationTarget.electron;
    }

    isBrowserOnly(): boolean {
        return this.target === ApplicationProps.ApplicationTarget.browserOnly;
    }

    ifBrowser<T>(value: T): T | undefined;
    ifBrowser<T>(value: T, defaultValue: T): T;
    ifBrowser<T>(value: T, defaultValue?: T): T | undefined {
        return this.isBrowser() ? value : defaultValue;
    }

    ifElectron<T>(value: T): T | undefined;
    ifElectron<T>(value: T, defaultValue: T): T;
    ifElectron<T>(value: T, defaultValue?: T): T | undefined {
        return this.isElectron() ? value : defaultValue;
    }

    ifBrowserOnly<T>(value: T): T | undefined;
    ifBrowserOnly<T>(value: T, defaultValue: T): T;
    ifBrowserOnly<T>(value: T, defaultValue?: T): T | undefined {
        return this.isBrowserOnly() ? value : defaultValue;
    }

    get targetBackendModules(): Map<string, string> {
        if (this.isBrowserOnly()) {
            return new Map();
        }
        return this.ifBrowser(this.backendModules, this.backendElectronModules);
    }

    get targetFrontendModules(): Map<string, string> {
        if (this.isBrowserOnly()) {
            return this.frontendOnlyModules;
        }
        return this.ifBrowser(this.frontendModules, this.frontendElectronModules);
    }

    get targetFrontendPreloadModules(): Map<string, string> {
        if (this.isBrowserOnly()) {
            return this.frontendOnlyPreloadModules;
        }
        return this.frontendPreloadModules;
    }

    get targetElectronMainModules(): Map<string, string> {
        return this.ifElectron(this.electronMainModules, new Map());
    }

    setDependency(name: string, version: string | undefined): boolean {
        const dependencies = this.pck.dependencies || {};
        const currentVersion = dependencies[name];
        if (currentVersion === version) {
            return false;
        }
        if (version) {
            dependencies[name] = version;
        } else {
            delete dependencies[name];
        }
        this.pck.dependencies = sortByKey(dependencies);
        return true;
    }

    save(): Promise<void> {
        return writeJsonFile(this.packagePath, this.pck, {
            detectIndent: true
        });
    }

    protected _moduleResolver: undefined | ApplicationModuleResolver;
    /**
     * A node module resolver in the context of the application package.
     */
    get resolveModule(): ApplicationModuleResolver {
        if (!this._moduleResolver) {
            this._moduleResolver = (parentPackagePath, modulePath) => {
                const resolved = resolvePackagePath(modulePath, parentPackagePath);
                if (!resolved) {
                    throw new Error(`Cannot resolve package ${modulePath} relative to ${parentPackagePath}`);
                }
                return resolved;
            };
        }
        return this._moduleResolver!;
    }
}
