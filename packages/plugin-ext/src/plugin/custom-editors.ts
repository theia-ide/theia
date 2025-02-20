// *****************************************************************************
// Copyright (C) 2021 SAP SE or an SAP affiliate company and others.
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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// copied and modified from https://github.com/microsoft/vscode/blob/53eac52308c4611000a171cc7bf1214293473c78/src/vs/workbench/api/common/extHostCustomEditors.ts

import { CustomEditorsExt, CustomEditorsMain, Plugin, PLUGIN_RPC_CONTEXT } from '../common/plugin-api-rpc';
import * as theia from '@theia/plugin';
import { RPCProtocol } from '../common/rpc-protocol';
import { Disposable, URI } from './types-impl';
import { UriComponents } from '../common/uri-components';
import { DocumentsExtImpl } from './documents';
import { WebviewsExtImpl } from './webviews';
import { CancellationToken, CancellationTokenSource } from '@theia/core/lib/common/cancellation';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { Cache } from '../common/cache';
import * as Converters from './type-converters';

export class CustomEditorsExtImpl implements CustomEditorsExt {
    private readonly proxy: CustomEditorsMain;
    private readonly editorProviders = new EditorProviderStore();
    private readonly documents = new CustomDocumentStore();

    constructor(rpc: RPCProtocol,
        private readonly documentExt: DocumentsExtImpl,
        private readonly webviewExt: WebviewsExtImpl) {
        this.proxy = rpc.getProxy(PLUGIN_RPC_CONTEXT.CUSTOM_EDITORS_MAIN);
    }

    registerCustomEditorProvider(
        viewType: string,
        provider: theia.CustomReadonlyEditorProvider | theia.CustomTextEditorProvider,
        options: { webviewOptions?: theia.WebviewPanelOptions, supportsMultipleEditorsPerDocument?: boolean },
        plugin: Plugin
    ): theia.Disposable {
        const disposables = new DisposableCollection();
        if ('resolveCustomTextEditor' in provider) {
            disposables.push(this.editorProviders.addTextProvider(viewType, plugin, provider));
            this.proxy.$registerTextEditorProvider(viewType, options.webviewOptions || {}, {
                supportsMove: !!provider.moveCustomTextEditor,
            });
        } else {
            disposables.push(this.editorProviders.addCustomProvider(viewType, plugin, provider));

            if (this.supportEditing(provider)) {
                disposables.push(provider.onDidChangeCustomDocument((e: theia.CustomDocumentEditEvent | theia.CustomDocumentContentChangeEvent) => {
                    const entry = this.getCustomDocumentEntry(viewType, e.document.uri);
                    if (isEditEvent(e)) {
                        const editId = entry.addEdit(e);
                        this.proxy.$onDidEdit(e.document.uri, viewType, editId, e.label);
                    } else {
                        this.proxy.$onContentChange(e.document.uri, viewType);
                    }
                }));
            }

            this.proxy.$registerCustomEditorProvider(viewType, options.webviewOptions || {}, !!options.supportsMultipleEditorsPerDocument);
        }

        return Disposable.from(
            disposables,
            Disposable.create(() => {
                this.proxy.$unregisterEditorProvider(viewType);
            })
        );
    }

    async $createCustomDocument(resource: UriComponents, viewType: string, openContext: theia.CustomDocumentOpenContext, cancellation: CancellationToken): Promise<{
        editable: boolean;
    }> {
        const entry = this.editorProviders.get(viewType);
        if (!entry) {
            throw new Error(`No provider found for '${viewType}'`);
        }

        if (entry.type !== CustomEditorType.Custom) {
            throw new Error(`Invalid provide type for '${viewType}'`);
        }

        const revivedResource = URI.revive(resource);
        const document = await entry.provider.openCustomDocument(revivedResource, openContext, cancellation);
        this.documents.add(viewType, document);

        return { editable: this.supportEditing(entry.provider) };
    }

    async $disposeCustomDocument(resource: UriComponents, viewType: string): Promise<void> {
        const entry = this.editorProviders.get(viewType);
        if (!entry) {
            throw new Error(`No provider found for '${viewType}'`);
        }

        if (entry.type !== CustomEditorType.Custom) {
            throw new Error(`Invalid provider type for '${viewType}'`);
        }

        const revivedResource = URI.revive(resource);
        const { document } = this.getCustomDocumentEntry(viewType, revivedResource);
        this.documents.delete(viewType, document);
        document.dispose();
    }

    async $resolveWebviewEditor(
        resource: UriComponents,
        handler: string,
        viewType: string,
        title: string,
        position: number,
        options: theia.WebviewPanelOptions,
        cancellation: CancellationToken
    ): Promise<void> {
        const entry = this.editorProviders.get(viewType);
        if (!entry) {
            throw new Error(`No provider found for '${viewType}'`);
        }
        const viewColumn = Converters.toViewColumn(position);
        const panel = this.webviewExt.createWebviewPanel(viewType, title, { viewColumn }, options, entry.plugin, handler, false);

        const revivedResource = URI.revive(resource);

        switch (entry.type) {
            case CustomEditorType.Custom: {
                const { document } = this.getCustomDocumentEntry(viewType, revivedResource);
                return entry.provider.resolveCustomEditor(document, panel, cancellation);
            }
            case CustomEditorType.Text: {
                const document = this.documentExt.getDocument(revivedResource);
                return entry.provider.resolveCustomTextEditor(document, panel, cancellation);
            }
            default: {
                throw new Error('Unknown webview provider type');
            }
        }
    }

    getCustomDocumentEntry(viewType: string, resource: UriComponents): CustomDocumentStoreEntry {
        const entry = this.documents.get(viewType, URI.revive(resource));
        if (!entry) {
            throw new Error('No custom document found');
        }
        return entry;
    }

    $disposeEdits(resourceComponents: UriComponents, viewType: string, editIds: number[]): void {
        const document = this.getCustomDocumentEntry(viewType, resourceComponents);
        document.disposeEdits(editIds);
    }

    async $onMoveCustomEditor(handle: string, newResourceComponents: UriComponents, viewType: string): Promise<void> {
        const entry = this.editorProviders.get(viewType);
        if (!entry) {
            throw new Error(`No provider found for '${viewType}'`);
        }

        if (!(entry.provider as theia.CustomTextEditorProvider).moveCustomTextEditor) {
            throw new Error(`Provider does not implement move '${viewType}'`);
        }

        const webview = this.webviewExt.getWebviewPanel(handle);
        if (!webview) {
            throw new Error('No webview found');
        }

        const resource = URI.revive(newResourceComponents);
        const document = this.documentExt.getDocument(resource);
        const cancellationSource = new CancellationTokenSource();
        await (entry.provider as theia.CustomTextEditorProvider).moveCustomTextEditor!(document, webview, cancellationSource.token);
    }

    async $undo(resourceComponents: UriComponents, viewType: string, editId: number, isDirty: boolean): Promise<void> {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        await entry.undo(editId, isDirty);
    }

    async $redo(resourceComponents: UriComponents, viewType: string, editId: number, isDirty: boolean): Promise<void> {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        await entry.redo(editId, isDirty);
    }

    async $revert(resourceComponents: UriComponents, viewType: string, cancellation: CancellationToken): Promise<void> {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        const provider = this.getCustomEditorProvider(viewType);
        await provider.revertCustomDocument(entry.document, cancellation);
    }

    async $save(resourceComponents: UriComponents, viewType: string, cancellation: CancellationToken): Promise<void> {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        const provider = this.getCustomEditorProvider(viewType);
        await provider.saveCustomDocument(entry.document, cancellation);
    }

    async $saveAs(resourceComponents: UriComponents, viewType: string, targetResource: UriComponents, cancellation: CancellationToken): Promise<void> {
        const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
        const provider = this.getCustomEditorProvider(viewType);
        await provider.saveCustomDocumentAs(entry.document, URI.revive(targetResource), cancellation);
    }

    private getCustomEditorProvider(viewType: string): theia.CustomEditorProvider {
        const entry = this.editorProviders.get(viewType);
        const provider = entry?.provider;
        if (!provider || !this.supportEditing(provider)) {
            throw new Error('Custom document is not editable');
        }
        return provider;
    }

    private supportEditing(
        provider: theia.CustomTextEditorProvider | theia.CustomEditorProvider | theia.CustomReadonlyEditorProvider
    ): provider is theia.CustomEditorProvider {
        return !!(provider as theia.CustomEditorProvider).onDidChangeCustomDocument;
    }
}

function isEditEvent(e: theia.CustomDocumentContentChangeEvent | theia.CustomDocumentEditEvent): e is theia.CustomDocumentEditEvent {
    return typeof (e as theia.CustomDocumentEditEvent).undo === 'function'
        && typeof (e as theia.CustomDocumentEditEvent).redo === 'function';
}

class CustomDocumentStoreEntry {
    constructor(
        readonly document: theia.CustomDocument,
    ) { }

    private readonly edits = new Cache<theia.CustomDocumentEditEvent>('custom documents');

    addEdit(item: theia.CustomDocumentEditEvent): number {
        return this.edits.add([item]);
    }

    async undo(editId: number, isDirty: boolean): Promise<void> {
        await this.getEdit(editId).undo();
    }

    async redo(editId: number, isDirty: boolean): Promise<void> {
        await this.getEdit(editId).redo();
    }

    disposeEdits(editIds: number[]): void {
        for (const id of editIds) {
            this.edits.delete(id);
        }
    }

    private getEdit(editId: number): theia.CustomDocumentEditEvent {
        const edit = this.edits.get(editId, 0);
        if (!edit) {
            throw new Error('No edit found');
        }
        return edit;
    }
}

const enum CustomEditorType {
    Text,
    Custom
}

type ProviderEntry = {
    readonly plugin: Plugin;
    readonly type: CustomEditorType.Text;
    readonly provider: theia.CustomTextEditorProvider;
} | {
    readonly plugin: Plugin;
    readonly type: CustomEditorType.Custom;
    readonly provider: theia.CustomReadonlyEditorProvider;
};

class EditorProviderStore {
    private readonly providers = new Map<string, ProviderEntry>();

    addTextProvider(viewType: string, plugin: Plugin, provider: theia.CustomTextEditorProvider): theia.Disposable {
        return this.add(CustomEditorType.Text, viewType, plugin, provider);
    }

    addCustomProvider(viewType: string, plugin: Plugin, provider: theia.CustomReadonlyEditorProvider): theia.Disposable {
        return this.add(CustomEditorType.Custom, viewType, plugin, provider);
    }

    get(viewType: string): ProviderEntry | undefined {
        return this.providers.get(viewType);
    }

    private add(type: CustomEditorType, viewType: string,
        plugin: Plugin, provider: theia.CustomTextEditorProvider | theia.CustomReadonlyEditorProvider): theia.Disposable {
        if (this.providers.has(viewType)) {
            throw new Error(`Provider for viewType:${viewType} already registered`);
        }
        this.providers.set(viewType, { type, plugin: plugin, provider } as ProviderEntry);
        return new Disposable(() => this.providers.delete(viewType));
    }
}

class CustomDocumentStore {
    private readonly documents = new Map<string, CustomDocumentStoreEntry>();

    get(viewType: string, resource: theia.Uri): CustomDocumentStoreEntry | undefined {
        return this.documents.get(this.key(viewType, resource));
    }

    add(viewType: string, document: theia.CustomDocument): CustomDocumentStoreEntry {
        const key = this.key(viewType, document.uri);
        if (this.documents.has(key)) {
            throw new Error(`Document already exists for viewType:${viewType} resource:${document.uri}`);
        }
        const entry = new CustomDocumentStoreEntry(document);
        this.documents.set(key, entry);
        return entry;
    }

    delete(viewType: string, document: theia.CustomDocument): void {
        const key = this.key(viewType, document.uri);
        this.documents.delete(key);
    }

    private key(viewType: string, resource: theia.Uri): string {
        return `${viewType}@@@${resource}`;
    }
}

