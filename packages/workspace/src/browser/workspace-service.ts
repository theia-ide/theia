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

import { injectable, inject, postConstruct, named } from '@theia/core/shared/inversify';
import URI from '@theia/core/lib/common/uri';
import { WorkspaceServer, UntitledWorkspaceService, WorkspaceFileService } from '../common';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { DEFAULT_WINDOW_HASH } from '@theia/core/lib/common/window';
import {
    FrontendApplicationContribution, PreferenceServiceImpl, PreferenceScope, PreferenceSchemaProvider, LabelProvider
} from '@theia/core/lib/browser';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import { ILogger, Disposable, DisposableCollection, Emitter, Event, MaybePromise, MessageService, nls, ContributionProvider } from '@theia/core';
import { WorkspacePreferences } from './workspace-preferences';
import * as jsoncparser from 'jsonc-parser';
import * as Ajv from '@theia/core/shared/ajv';
import { FileStat, BaseStat } from '@theia/filesystem/lib/common/files';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { WindowTitleService } from '@theia/core/lib/browser/window/window-title-service';
import { FileSystemPreferences } from '@theia/filesystem/lib/browser';
import { workspaceSchema, WorkspaceSchemaUpdater } from './workspace-schema-updater';
import { IJSONSchema } from '@theia/core/lib/common/json-schema';
import { StopReason } from '@theia/core/lib/common/frontend-application-state';

export const WorkspaceOpenHandlerContribution = Symbol('WorkspaceOpenHandlerContribution');

export interface WorkspaceOpenHandlerContribution {
    canHandle(uri: URI): MaybePromise<boolean>;
    openWorkspace(uri: URI, options?: WorkspaceInput): MaybePromise<void>;
    getWorkspaceLabel?(uri: URI): MaybePromise<string | undefined>;
}

export interface WorkspaceHandlingContribution {
    modifyRecentWorksapces?(workspaces: string[]): MaybePromise<string[]>;

}

/**
 * The workspace service.
 */
@injectable()
export class WorkspaceService implements FrontendApplicationContribution, WorkspaceOpenHandlerContribution {

    protected _workspace: FileStat | undefined;

    protected _roots: FileStat[] = [];
    protected deferredRoots = new Deferred<FileStat[]>();

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(WorkspaceServer)
    protected readonly server: WorkspaceServer;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @inject(ILogger)
    protected logger: ILogger;

    @inject(WorkspacePreferences)
    protected preferences: WorkspacePreferences;

    @inject(PreferenceServiceImpl)
    protected readonly preferenceImpl: PreferenceServiceImpl;

    @inject(PreferenceSchemaProvider)
    protected readonly schemaProvider: PreferenceSchemaProvider;

    @inject(EnvVariablesServer)
    protected readonly envVariableServer: EnvVariablesServer;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(LabelProvider)
    protected readonly labelProvider: LabelProvider;

    @inject(FileSystemPreferences)
    protected readonly fsPreferences: FileSystemPreferences;

    @inject(WorkspaceSchemaUpdater)
    protected readonly schemaUpdater: WorkspaceSchemaUpdater;

    @inject(UntitledWorkspaceService)
    protected readonly untitledWorkspaceService: UntitledWorkspaceService;

    @inject(WorkspaceFileService)
    protected readonly workspaceFileService: WorkspaceFileService;

    @inject(WindowTitleService)
    protected readonly windowTitleService: WindowTitleService;

    @inject(ContributionProvider) @named(WorkspaceOpenHandlerContribution)
    protected readonly openHandlerContribution: ContributionProvider<WorkspaceOpenHandlerContribution>;

    protected _ready = new Deferred<void>();
    get ready(): Promise<void> {
        return this._ready.promise;
    }

    @postConstruct()
    protected init(): void {
        this.doInit();
    }

    protected async doInit(): Promise<void> {
        const wsUriString = await this.getDefaultWorkspaceUri();
        const wsStat = await this.toFileStat(wsUriString);
        await this.setWorkspace(wsStat);

        this.fileService.onDidFilesChange(event => {
            if (this._workspace && this._workspace.isFile && event.contains(this._workspace.resource)) {
                this.updateWorkspace();
            }
        });
        this.fsPreferences.onPreferenceChanged(event => {
            if (event.preferenceName === 'files.watcherExclude') {
                this.refreshRootWatchers();
            }
        });
        this._ready.resolve();
    }

    /**
     * Resolves to the default workspace URI as string.
     *
     * The default implementation tries to extract the default workspace location
     * from the `window.location.hash`, then falls-back to the most recently
     * used workspace root from the server.
     *
     * It is not ensured that the resolved workspace URI is valid, it can point
     * to a non-existing location.
     */
    protected getDefaultWorkspaceUri(): MaybePromise<string | undefined> {
        return this.doGetDefaultWorkspaceUri();
    }

    protected async doGetDefaultWorkspaceUri(): Promise<string | undefined> {

        // If an empty window is explicitly requested do not restore a previous workspace.
        // Note: `window.location.hash` includes leading "#" if non-empty.
        if (window.location.hash === `#${DEFAULT_WINDOW_HASH}`) {
            window.location.hash = '';
            return undefined;
        }

        // Prefer the workspace path specified as the URL fragment, if present.
        if (window.location.hash.length > 1) {
            // Remove the leading # and decode the URI.
            const wpPath = decodeURI(window.location.hash.substring(1));
            const workspaceUri = new URI().withPath(wpPath).withScheme('file');
            let workspaceStat: FileStat | undefined;
            try {
                workspaceStat = await this.fileService.resolve(workspaceUri);
            } catch { }
            if (workspaceStat && !workspaceStat.isDirectory && !this.isWorkspaceFile(workspaceStat)) {
                this.messageService.error(`Not a valid workspace file: ${workspaceUri}`);
                return undefined;
            }
            return workspaceUri.toString();
        } else {
            // Else, ask the server for its suggested workspace (usually the one
            // specified on the CLI, or the most recent).
            return this.server.getMostRecentlyUsedWorkspace();
        }
    }

    /**
     * Set the URL fragment to the given workspace path.
     */
    protected setURLFragment(workspacePath: string): void {
        window.location.hash = encodeURI(workspacePath);
    }

    get roots(): Promise<FileStat[]> {
        return this.deferredRoots.promise;
    }
    tryGetRoots(): FileStat[] {
        return this._roots;
    }
    get workspace(): FileStat | undefined {
        return this._workspace;
    }

    protected readonly onWorkspaceChangeEmitter = new Emitter<FileStat[]>();
    get onWorkspaceChanged(): Event<FileStat[]> {
        return this.onWorkspaceChangeEmitter.event;
    }

    protected readonly onWorkspaceLocationChangedEmitter = new Emitter<FileStat | undefined>();
    get onWorkspaceLocationChanged(): Event<FileStat | undefined> {
        return this.onWorkspaceLocationChangedEmitter.event;
    }

    protected readonly toDisposeOnWorkspace = new DisposableCollection();
    protected async setWorkspace(workspaceStat: FileStat | undefined): Promise<void> {
        if (this._workspace && workspaceStat &&
            this._workspace.resource === workspaceStat.resource &&
            this._workspace.mtime === workspaceStat.mtime &&
            this._workspace.etag === workspaceStat.etag &&
            this._workspace.size === workspaceStat.size) {
            return;
        }
        this.toDisposeOnWorkspace.dispose();
        this._workspace = workspaceStat;
        if (this._workspace) {
            const uri = this._workspace.resource;
            if (this._workspace.isFile) {
                this.toDisposeOnWorkspace.push(this.fileService.watch(uri));
                this.onWorkspaceLocationChangedEmitter.fire(this._workspace);
            }
            this.setURLFragment(uri.path.toString());
        } else {
            this.setURLFragment('');
        }
        this.updateTitle();
        await this.server.setMostRecentlyUsedWorkspace(this._workspace ? this._workspace.resource.toString() : '');
        await this.updateWorkspace();
    }

    protected async updateWorkspace(): Promise<void> {
        await this.updateRoots();
        this.watchRoots();
    }

    protected async updateRoots(): Promise<void> {
        const newRoots = await this.computeRoots();
        let rootsChanged = false;
        if (newRoots.length !== this._roots.length || newRoots.length === 0) {
            rootsChanged = true;
        } else {
            for (const newRoot of newRoots) {
                if (!this._roots.some(r => r.resource.toString() === newRoot.resource.toString())) {
                    rootsChanged = true;
                    break;
                }
            }
        }
        if (rootsChanged) {
            this._roots = newRoots;
            this.deferredRoots.resolve(this._roots); // in order to resolve first
            this.deferredRoots = new Deferred<FileStat[]>();
            this.deferredRoots.resolve(this._roots);
            this.onWorkspaceChangeEmitter.fire(this._roots);
        }
    }

    protected async computeRoots(): Promise<FileStat[]> {
        const roots: FileStat[] = [];
        if (this._workspace) {
            if (this._workspace.isDirectory) {
                return [this._workspace];
            }

            const workspaceData = await this.getWorkspaceDataFromFile();
            if (workspaceData) {
                for (const { path } of workspaceData.folders) {
                    const valid = await this.toValidRoot(path);
                    if (valid) {
                        roots.push(valid);
                    } else {
                        roots.push(FileStat.dir(path));
                    }
                }
            }
        }
        return roots;
    }

    protected async getWorkspaceDataFromFile(): Promise<WorkspaceData | undefined> {
        if (this._workspace && await this.fileService.exists(this._workspace.resource)) {
            if (this._workspace.isDirectory) {
                return {
                    folders: [{ path: this._workspace.resource.toString() }]
                };
            } else if (this.isWorkspaceFile(this._workspace)) {
                const stat = await this.fileService.read(this._workspace.resource);
                const strippedContent = jsoncparser.stripComments(stat.value);
                const data = jsoncparser.parse(strippedContent);
                if (data && WorkspaceData.is(data)) {
                    return WorkspaceData.transformToAbsolute(data, stat);
                }
                this.logger.error(`Unable to retrieve workspace data from the file: '${this.labelProvider.getLongName(this._workspace)}'. Please check if the file is corrupted.`);
            } else {
                this.logger.warn(`Not a valid workspace file: ${this.labelProvider.getLongName(this._workspace)}`);
            }
        }
    }

    protected updateTitle(): void {
        let rootName: string | undefined;
        let rootPath: string | undefined;
        if (this._workspace) {
            const displayName = this._workspace.name;
            const fullName = this._workspace.resource.path.toString();
            if (this.isWorkspaceFile(this._workspace)) {
                if (this.isUntitledWorkspace(this._workspace.resource)) {
                    const untitled = nls.localizeByDefault('Untitled (Workspace)');
                    rootName = untitled;
                    rootPath = untitled;
                } else {
                    rootName = displayName.slice(0, displayName.lastIndexOf('.'));
                    rootPath = fullName.slice(0, fullName.lastIndexOf('.'));
                }
            } else {
                rootName = displayName;
                rootPath = fullName;
            }
        }
        this.windowTitleService.update({
            rootName,
            rootPath
        });
    }

    /**
     * on unload, we set our workspace root as the last recently used on the backend.
     */
    onStop(): void {
        this.server.setMostRecentlyUsedWorkspace(this._workspace ? this._workspace.resource.toString() : '');
    }

    async recentWorkspaces(): Promise<string[]> {
        return this.server.getRecentWorkspaces();
    }

    async removeRecentWorkspace(uri: string): Promise<void> {
        return this.server.removeRecentWorkspace(uri);
    }

    /**
     * Returns `true` if theia has an opened workspace or folder
     * @returns {boolean}
     */
    get opened(): boolean {
        return !!this._workspace;
    }

    /**
     * Returns `true` if a multiple-root workspace is currently open.
     * @returns {boolean}
     */
    get isMultiRootWorkspaceOpened(): boolean {
        return !!this.workspace && !this.workspace.isDirectory;
    }

    /**
     * Opens directory, or recreates a workspace from the file that `uri` points to.
     */
    open(uri: URI, options?: WorkspaceInput): void {
        this.doOpen(uri, options);
    }

    protected async doOpen(uri: URI, options?: WorkspaceInput): Promise<void> {
        for (const handler of [...this.openHandlerContribution.getContributions(), this]) {
            if (await handler.canHandle(uri)) {
                handler.openWorkspace(uri, options);
                return;
            }
        }
        throw new Error(`Could not find a handler to open the workspace with uri ${uri.toString()}.`);
    }

    canHandle(uri: URI): boolean {
        return uri.scheme === 'file';
    }

    async openWorkspace(uri: URI, options?: WorkspaceInput): Promise<void> {
        const stat = await this.toFileStat(uri);
        if (stat) {
            if (!stat.isDirectory && !this.isWorkspaceFile(stat)) {
                const message = `Not a valid workspace: ${uri.path.toString()}`;
                this.messageService.error(message);
                throw new Error(message);
            }
            // The same window has to be preserved too (instead of opening a new one), if the workspace root is not yet available and we are setting it for the first time.
            // Option passed as parameter has the highest priority (for api developers), then the preference, then the default.
            await this.roots;
            const { preserveWindow } = {
                preserveWindow: this.preferences['workspace.preserveWindow'] || !this.opened,
                ...options
            };
            await this.server.setMostRecentlyUsedWorkspace(uri.toString());
            if (preserveWindow) {
                this._workspace = stat;
            }
            this.openWindow(stat, Object.assign(options ?? {}, { preserveWindow }));
            return;
        }
        throw new Error('Invalid workspace root URI. Expected an existing directory or workspace file.');
    }

    /**
     * Adds root folder(s) to the workspace
     * @param uris URI or URIs of the root folder(s) to add
     */
    async addRoot(uris: URI[] | URI): Promise<void> {
        const toAdd = Array.isArray(uris) ? uris : [uris];
        await this.spliceRoots(this._roots.length, 0, ...toAdd);
    }

    /**
     * Removes root folder(s) from workspace.
     */
    async removeRoots(uris: URI[]): Promise<void> {
        if (!this.opened) {
            throw new Error('Folder cannot be removed as there is no active folder in the current workspace.');
        }
        if (this._workspace) {
            const workspaceData = await this.getWorkspaceDataFromFile();
            this._workspace = await this.writeWorkspaceFile(this._workspace,
                WorkspaceData.buildWorkspaceData(
                    this._roots.filter(root => uris.findIndex(u => u.toString() === root.resource.toString()) < 0),
                    workspaceData
                )
            );
            await this.updateWorkspace();
        }
    }

    async spliceRoots(start: number, deleteCount?: number, ...rootsToAdd: URI[]): Promise<URI[]> {
        if (!this._workspace || this._workspace.isDirectory) {
            const untitledWorkspace = await this.getUntitledWorkspace();
            await this.save(untitledWorkspace);
            if (!this._workspace) {
                throw new Error('Could not create new untitled workspace');
            }
        }
        const dedup = new Set<string>();
        const roots = this._roots.map(root => (dedup.add(root.resource.toString()), root.resource.toString()));
        const toAdd: string[] = [];
        for (const root of rootsToAdd) {
            const uri = root.toString();
            if (!dedup.has(uri)) {
                dedup.add(uri);
                toAdd.push(uri);
            }
        }
        const toRemove = roots.splice(start, deleteCount || 0, ...toAdd);
        if (!toRemove.length && !toAdd.length) {
            return [];
        }

        const currentData = await this.getWorkspaceDataFromFile();
        const newData = WorkspaceData.buildWorkspaceData(roots, currentData);
        await this.writeWorkspaceFile(this._workspace, newData);
        await this.updateWorkspace();
        return toRemove.map(root => new URI(root));
    }

    async getUntitledWorkspace(): Promise<URI> {
        const configDirURI = new URI(await this.envVariableServer.getConfigDirUri());
        return this.untitledWorkspaceService.getUntitledWorkspaceUri(
            configDirURI,
            uri => this.fileService.exists(uri).then(exists => !exists),
            () => this.messageService.warn(nls.localize(
                'theia/workspace/untitled-cleanup',
                'There appear to be many untitled workspace files. Please check {0} and remove any unused files.',
                configDirURI.resolve('workspaces').path.fsPath())
            ),
        );
    }

    protected async writeWorkspaceFile(workspaceFile: FileStat | undefined, workspaceData: WorkspaceData): Promise<FileStat | undefined> {
        if (workspaceFile) {
            const data = JSON.stringify(WorkspaceData.transformToRelative(workspaceData, workspaceFile));
            const edits = jsoncparser.format(data, undefined, { tabSize: 2, insertSpaces: true, eol: '' });
            const result = jsoncparser.applyEdits(data, edits);
            await this.fileService.write(workspaceFile.resource, result);
            return this.fileService.resolve(workspaceFile.resource);
        }
    }

    /**
     * Clears current workspace root.
     */
    async close(): Promise<void> {
        if (await this.windowService.isSafeToShutDown(StopReason.Reload)) {
            this.windowService.setSafeToShutDown();
            this._workspace = undefined;
            this._roots.length = 0;

            await this.server.setMostRecentlyUsedWorkspace('');
            this.reloadWindow();
        }
    }

    /**
     * returns a FileStat if the argument URI points to an existing directory. Otherwise, `undefined`.
     */
    protected async toValidRoot(uri: URI | string | undefined): Promise<FileStat | undefined> {
        const fileStat = await this.toFileStat(uri);
        if (fileStat && fileStat.isDirectory) {
            return fileStat;
        }
        return undefined;
    }

    /**
     * returns a FileStat if the argument URI points to a file or directory. Otherwise, `undefined`.
     */
    protected async toFileStat(uri: URI | string | undefined): Promise<FileStat | undefined> {
        if (!uri) {
            return undefined;
        }
        let uriStr = uri.toString();
        try {
            if (uriStr.endsWith('/')) {
                uriStr = uriStr.slice(0, -1);
            }
            const normalizedUri = new URI(uriStr).normalizePath();
            return await this.fileService.resolve(normalizedUri);
        } catch (error) {
            return undefined;
        }
    }

    protected openWindow(uri: FileStat, options?: WorkspaceInput): void {
        const workspacePath = uri.resource.path.toString();

        if (this.shouldPreserveWindow(options)) {
            this.reloadWindow(options);
        } else {
            try {
                this.openNewWindow(workspacePath, options);
            } catch (error) {
                // Fall back to reloading the current window in case the browser has blocked the new window
                this._workspace = uri;
                this.logger.error(error.toString()).then(() => this.reloadWindow());
            }
        }
    }

    protected reloadWindow(options?: WorkspaceInput): void {
        // Set the new workspace path as the URL fragment.
        if (this._workspace !== undefined) {
            this.setURLFragment(this._workspace.resource.path.toString());
        } else {
            this.setURLFragment('');
        }

        this.windowService.reload();
    }

    protected openNewWindow(workspacePath: string, options?: WorkspaceInput): void {
        const url = new URL(window.location.href);
        url.hash = encodeURI(workspacePath);
        this.windowService.openNewWindow(url.toString());
    }

    protected shouldPreserveWindow(options?: WorkspaceInput): boolean {
        return options !== undefined && !!options.preserveWindow;
    }

    /**
     * Return true if one of the paths in paths array is present in the workspace
     * NOTE: You should always explicitly use `/` as the separator between the path segments.
     */
    async containsSome(paths: string[]): Promise<boolean> {
        await this.roots;
        if (this.opened) {
            for (const root of this._roots) {
                const uri = root.resource;
                for (const path of paths) {
                    const fileUri = uri.resolve(path);
                    const exists = await this.fileService.exists(fileUri);
                    if (exists) {
                        return exists;
                    }
                }
            }
        }
        return false;
    }

    /**
     * `true` if the current workspace is configured using a configuration file.
     *
     * `false` if there is no workspace or the workspace is simply a folder.
     */
    get saved(): boolean {
        return !!this._workspace && !this._workspace.isDirectory;
    }

    /**
     * Save workspace data into a file
     * @param uri URI or FileStat of the workspace file
     */
    async save(uri: URI | FileStat): Promise<void> {
        const resource = uri instanceof URI ? uri : uri.resource;
        if (!await this.fileService.exists(resource)) {
            await this.fileService.create(resource);
        }
        const workspaceData: WorkspaceData = { folders: [], settings: {} };
        if (!this.saved) {
            for (const p of Object.keys(this.schemaProvider.getCombinedSchema().properties)) {
                if (this.schemaProvider.isValidInScope(p, PreferenceScope.Folder)) {
                    continue;
                }
                const preferences = this.preferenceImpl.inspect(p);
                if (preferences && preferences.workspaceValue) {
                    workspaceData.settings![p] = preferences.workspaceValue;
                }
            }
        }
        let stat = await this.toFileStat(resource);
        Object.assign(workspaceData, await this.getWorkspaceDataFromFile());
        stat = await this.writeWorkspaceFile(stat, WorkspaceData.buildWorkspaceData(this._roots, workspaceData));
        await this.server.setMostRecentlyUsedWorkspace(resource.toString());
        // If saving a workspace based on an untitled workspace, delete the old file.
        const toDelete = this.isUntitledWorkspace(this.workspace?.resource) && this.workspace!.resource;
        await this.setWorkspace(stat);
        if (toDelete && stat && !toDelete.isEqual(stat.resource)) {
            await this.fileService.delete(toDelete).catch(() => { });
        }
        this.onWorkspaceLocationChangedEmitter.fire(stat);
    }

    protected readonly rootWatchers = new Map<string, Disposable>();

    protected async watchRoots(): Promise<void> {
        const rootUris = new Set(this._roots.map(r => r.resource.toString()));
        for (const [uri, watcher] of this.rootWatchers.entries()) {
            if (!rootUris.has(uri)) {
                watcher.dispose();
            }
        }
        for (const root of this._roots) {
            this.watchRoot(root);
        }
    }

    protected async refreshRootWatchers(): Promise<void> {
        for (const watcher of this.rootWatchers.values()) {
            watcher.dispose();
        }
        await this.watchRoots();
    }

    protected async watchRoot(root: FileStat): Promise<void> {
        const uriStr = root.resource.toString();
        if (this.rootWatchers.has(uriStr)) {
            return;
        }
        const excludes = this.getExcludes(uriStr);
        const watcher = this.fileService.watch(new URI(uriStr), {
            recursive: true,
            excludes
        });
        this.rootWatchers.set(uriStr, new DisposableCollection(
            watcher,
            Disposable.create(() => this.rootWatchers.delete(uriStr))
        ));
    }

    protected getExcludes(uri: string): string[] {
        const patterns = this.fsPreferences.get('files.watcherExclude', undefined, uri);
        return Object.keys(patterns).filter(pattern => patterns[pattern]);
    }

    /**
     * Returns the workspace root uri that the given file belongs to.
     * In case that the file is found in more than one workspace roots, returns the root that is closest to the file.
     * If the file is not from the current workspace, returns `undefined`.
     * @param uri URI of the file
     */
    getWorkspaceRootUri(uri: URI | undefined): URI | undefined {
        if (!uri) {
            const root = this.tryGetRoots()[0];
            if (root) {
                return root.resource;
            }
            return undefined;
        }
        const rootUris: URI[] = [];
        for (const root of this.tryGetRoots()) {
            const rootUri = root.resource;
            if (rootUri && rootUri.scheme === uri.scheme && rootUri.isEqualOrParent(uri)) {
                rootUris.push(rootUri);
            }
        }
        return rootUris.sort((r1, r2) => r2.toString().length - r1.toString().length)[0];
    }

    /**
     * Returns the relative path of the given file to the workspace root.
     * @param uri URI of the file
     * @see getWorkspaceRootUri(uri)
     */
    async getWorkspaceRelativePath(uri: URI): Promise<string> {
        const wsUri = this.getWorkspaceRootUri(uri);
        if (wsUri) {
            const wsRelative = wsUri.relative(uri);
            if (wsRelative) {
                return wsRelative.toString();
            }
        }
        return uri.path.fsPath();
    }

    areWorkspaceRoots(uris: URI[]): boolean {
        if (!uris.length) {
            return false;
        }
        const rootUris = new Set(this.tryGetRoots().map(root => root.resource.toString()));
        return uris.every(uri => rootUris.has(uri.toString()));
    }

    /**
     * Check if the file should be considered as a workspace file.
     *
     * Example: We should not try to read the contents of an .exe file.
     */
    protected isWorkspaceFile(candidate: FileStat | URI): boolean {
        return this.workspaceFileService.isWorkspaceFile(candidate);
    }

    isUntitledWorkspace(candidate?: URI): boolean {
        return this.untitledWorkspaceService.isUntitledWorkspace(candidate);
    }

    async isSafeToReload(withURI?: URI): Promise<boolean> {
        return !withURI || !this.untitledWorkspaceService.isUntitledWorkspace(withURI) || new URI(await this.getDefaultWorkspaceUri()).isEqual(withURI);
    }

    /**
     *
     * @param key the property key under which to store the schema (e.g. tasks, launch)
     * @param schema the schema for the property. If none is supplied, the update is treated as a deletion.
     */
    async updateSchema(key: string, schema?: IJSONSchema): Promise<boolean> {
        return this.schemaUpdater.updateSchema({ key, schema });
    }
}

export interface WorkspaceInput {

    /**
     * Tests whether the same window should be used or a new one has to be opened after setting the workspace root. By default it is `false`.
     */
    preserveWindow?: boolean;

}

export interface WorkspaceData {
    folders: Array<{ path: string, name?: string }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: { [id: string]: any };
}

export namespace WorkspaceData {
    const validateSchema = new Ajv().compile(workspaceSchema);

    export function is(data: unknown): data is WorkspaceData {
        return !!validateSchema(data);
    }

    export function buildWorkspaceData(folders: string[] | FileStat[], additionalFields?: Partial<WorkspaceData>): WorkspaceData {
        const roots = new Set<string>();
        if (folders.length > 0) {
            if (typeof folders[0] !== 'string') {
                (<FileStat[]>folders).forEach(folder => roots.add(folder.resource.toString()));
            } else {
                (<string[]>folders).forEach(folder => roots.add(folder));
            }
        }
        const data: WorkspaceData = {
            folders: Array.from(roots, folder => ({ path: folder }))
        };
        if (additionalFields) {
            delete additionalFields.folders;
            Object.assign(data, additionalFields);
        }
        return data;
    }

    export function transformToRelative(data: WorkspaceData, workspaceFile?: FileStat): WorkspaceData {
        const folderUris: string[] = [];
        const workspaceFileUri = new URI(workspaceFile ? workspaceFile.resource.toString() : '').withScheme('file');
        for (const { path } of data.folders) {
            const folderUri = new URI(path).withScheme('file');
            const rel = workspaceFileUri.parent.relative(folderUri);
            if (rel) {
                folderUris.push(rel.toString());
            } else {
                folderUris.push(folderUri.toString());
            }
        }
        return buildWorkspaceData(folderUris, data);
    }

    export function transformToAbsolute(data: WorkspaceData, workspaceFile?: BaseStat): WorkspaceData {
        if (workspaceFile) {
            const folders: string[] = [];
            for (const folder of data.folders) {
                const path = folder.path;
                if (path.startsWith('file:///')) {
                    folders.push(path);
                } else {
                    const absolutePath = workspaceFile.resource.withScheme('file').parent.resolveToAbsolute(path)?.toString();
                    if (absolutePath) {
                        folders.push(absolutePath.toString());
                    }
                }

            }
            return Object.assign(data, buildWorkspaceData(folders, data));
        }
        return data;
    }
}
