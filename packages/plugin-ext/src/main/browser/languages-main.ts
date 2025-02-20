// *****************************************************************************
// Copyright (C) 2018 Red Hat, Inc. and others.
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

// Method `$changeLanguage` copied and modified
// from https://github.com/microsoft/vscode/blob/e9c50663154c369a06355ce752b447af5b580dc3/src/vs/workbench/api/browser/mainThreadLanguages.ts#L30-L42

import {
    LanguagesMain,
    SerializedLanguageConfiguration,
    SerializedRegExp,
    SerializedIndentationRule,
    SerializedOnEnterRule,
    MAIN_RPC_CONTEXT,
    LanguagesExt,
    WorkspaceEditDto,
    WorkspaceTextEditDto,
    WorkspaceFileEditDto,
    PluginInfo,
    LanguageStatus as LanguageStatusDTO,
    InlayHintDto,
    IdentifiableInlineCompletions
} from '../../common/plugin-api-rpc';
import { injectable, inject } from '@theia/core/shared/inversify';
import {
    SerializedDocumentFilter, MarkerData, Range, RelatedInformation,
    MarkerSeverity, DocumentLink, WorkspaceSymbolParams, CodeAction, CompletionDto,
    CodeActionProviderDocumentation, InlayHint, InlayHintLabelPart, CodeActionContext, DocumentDropEditProviderMetadata, SignatureHelpContext
} from '../../common/plugin-api-rpc-model';
import { RPCProtocol } from '../../common/rpc-protocol';
import { MonacoLanguages, WorkspaceSymbolProvider } from '@theia/monaco/lib/browser/monaco-languages';
import { URI } from '@theia/core/lib/common/uri';
import { Disposable, DisposableCollection } from '@theia/core/lib/common/disposable';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { ProblemManager } from '@theia/markers/lib/browser';
import * as vst from '@theia/core/shared/vscode-languageserver-protocol';
import * as theia from '@theia/plugin';
import { UriComponents } from '../../common/uri-components';
import { CancellationToken } from '@theia/core/lib/common';
import { CallHierarchyService, CallHierarchyServiceProvider, CallHierarchyItem } from '@theia/callhierarchy/lib/browser';
import { toItemHierarchyDefinition, toUriComponents, fromItemHierarchyDefinition, fromPosition, toCaller, toCallee } from './hierarchy/hierarchy-types-converters';
import { TypeHierarchyService, TypeHierarchyServiceProvider } from '@theia/typehierarchy/lib/browser';
import { Position, DocumentUri, DiagnosticTag } from '@theia/core/shared/vscode-languageserver-protocol';
import { ObjectIdentifier } from '../../common/object-identifier';
import { mixin } from '../../common/types';
import { relative } from '../../common/paths-util';
import { decodeSemanticTokensDto } from '../../common/semantic-tokens-dto';
import * as monaco from '@theia/monaco-editor-core';
import { ExtensionIdentifier } from '@theia/monaco-editor-core/esm/vs/platform/extensions/common/extensions';
import { StandaloneServices } from '@theia/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices';
import { IMarkerService } from '@theia/monaco-editor-core/esm/vs/platform/markers/common/markers';
import * as MonacoLanguageSelector from '@theia/monaco-editor-core/esm/vs/editor/common/languageSelector';
import * as MonacoPath from '@theia/monaco-editor-core/esm/vs/base/common/path';
import { IRelativePattern } from '@theia/monaco-editor-core/esm/vs/base/common/glob';
import { EditorLanguageStatusService, LanguageStatus as EditorLanguageStatus } from '@theia/editor/lib/browser/language-status/editor-language-status-service';
import { LanguageSelector, RelativePattern } from '@theia/editor/lib/common/language-selector';
import { ILanguageFeaturesService } from '@theia/monaco-editor-core/esm/vs/editor/common/services/languageFeatures';
import {
    DocumentDropEditProvider,
    DocumentDropEditsSession,
    EvaluatableExpression,
    EvaluatableExpressionProvider,
    InlineValue,
    InlineValueContext,
    InlineValuesProvider
} from '@theia/monaco-editor-core/esm/vs/editor/common/languages';
import { ITextModel } from '@theia/monaco-editor-core/esm/vs/editor/common/model';
import { CodeActionTriggerKind } from '../../plugin/types-impl';
import { IReadonlyVSDataTransfer } from '@theia/monaco-editor-core/esm/vs/base/common/dataTransfer';
import { FileUploadService } from '@theia/filesystem/lib/browser/file-upload-service';

/**
 * @monaco-uplift The public API declares these functions as (languageId: string, service).
 * Confirm that the functions delegate to a handler that accepts a LanguageSelector rather than just a string.
 * Relevant code in node_modules/@theia/monaco-editor-core/src/vs/editor/standalone/browser/standaloneLanguages.ts
 */
interface RegistrationFunction<T> {
    (languageId: MonacoLanguageSelector.LanguageSelector, service: T): Disposable;
}

@injectable()
export class LanguagesMainImpl implements LanguagesMain, Disposable {

    @inject(MonacoLanguages)
    private readonly monacoLanguages: MonacoLanguages;

    @inject(ProblemManager)
    private readonly problemManager: ProblemManager;

    @inject(CallHierarchyServiceProvider)
    private readonly callHierarchyServiceContributionRegistry: CallHierarchyServiceProvider;

    @inject(TypeHierarchyServiceProvider)
    private readonly typeHierarchyServiceContributionRegistry: TypeHierarchyServiceProvider;

    @inject(EditorLanguageStatusService)
    protected readonly languageStatusService: EditorLanguageStatusService;

    @inject(FileUploadService)
    protected readonly fileUploadService: FileUploadService;

    private readonly proxy: LanguagesExt;
    private readonly services = new Map<number, Disposable>();
    private readonly toDispose = new DisposableCollection();

    constructor(@inject(RPCProtocol) rpc: RPCProtocol) {
        this.proxy = rpc.getProxy(MAIN_RPC_CONTEXT.LANGUAGES_EXT);
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    $getLanguages(): Promise<string[]> {
        return Promise.resolve(monaco.languages.getLanguages().map(l => l.id));
    }

    $changeLanguage(resource: UriComponents, languageId: string): Promise<void> {
        const uri = monaco.Uri.revive(resource);
        const model = monaco.editor.getModel(uri);
        if (!model) {
            return Promise.reject(new Error('Invalid uri'));
        }
        const langId = monaco.languages.getEncodedLanguageId(languageId);
        if (!langId) {
            return Promise.reject(new Error(`Unknown language ID: ${languageId}`));
        }
        monaco.editor.setModelLanguage(model, languageId);
        return Promise.resolve(undefined);
    }

    protected register(handle: number, service: Disposable): void {
        this.services.set(handle, service);
        this.toDispose.push(Disposable.create(() => this.$unregister(handle)));
    }

    $unregister(handle: number): void {
        const disposable = this.services.get(handle);
        if (disposable) {
            this.services.delete(handle);
            disposable.dispose();
        }
    }

    $setLanguageConfiguration(handle: number, languageId: string, configuration: SerializedLanguageConfiguration): void {
        const config: monaco.languages.LanguageConfiguration = {
            comments: configuration.comments,
            brackets: configuration.brackets,
            wordPattern: reviveRegExp(configuration.wordPattern),
            indentationRules: reviveIndentationRule(configuration.indentationRules),
            onEnterRules: reviveOnEnterRules(configuration.onEnterRules),
            autoClosingPairs: configuration.autoClosingPairs
        };

        this.register(handle, monaco.languages.setLanguageConfiguration(languageId, config));
    }

    $registerCompletionSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], triggerCharacters: string[], supportsResolveDetails: boolean): void {
        this.register(handle,
            (monaco.languages.registerCompletionItemProvider as RegistrationFunction<monaco.languages.CompletionItemProvider>)(this.toLanguageSelector(selector), {
                triggerCharacters,
                provideCompletionItems: (model, position, context, token) => this.provideCompletionItems(handle, model, position, context, token),
                resolveCompletionItem: supportsResolveDetails
                    ? (suggestion, token) => Promise.resolve(this.resolveCompletionItem(handle, suggestion, token))
                    : undefined
            }));
    }

    protected provideCompletionItems(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.CompletionContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
        return this.proxy.$provideCompletionItems(handle, model.uri, position, context, token).then(result => {
            if (!result) {
                return undefined;
            }
            return {
                suggestions: result.completions.map(c => Object.assign(c, {
                    range: c.range || result.defaultRange
                })),
                incomplete: result.incomplete,
                dispose: () => this.proxy.$releaseCompletionItems(handle, result.id)
            };
        });
    }

    protected resolveCompletionItem(handle: number,
        item: monaco.languages.CompletionItem, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CompletionItem> {
        const { parentId, id } = item as CompletionDto;
        return this.proxy.$resolveCompletionItem(handle, [parentId, id], token).then(resolved => {
            if (resolved) {
                mixin(item, resolved, true);
            }
            return item;
        });
    }

    $registerDefinitionProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const definitionProvider = this.createDefinitionProvider(handle);
        this.register(handle, (monaco.languages.registerDefinitionProvider as RegistrationFunction<monaco.languages.DefinitionProvider>)(languageSelector, definitionProvider));
    }

    $registerDeclarationProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const declarationProvider = this.createDeclarationProvider(handle);
        this.register(handle, (monaco.languages.registerDeclarationProvider as RegistrationFunction<monaco.languages.DeclarationProvider>)(languageSelector, declarationProvider));
    }

    $registerReferenceProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const referenceProvider = this.createReferenceProvider(handle);
        this.register(handle, (monaco.languages.registerReferenceProvider as RegistrationFunction<monaco.languages.ReferenceProvider>)(languageSelector, referenceProvider));
    }

    protected createReferenceProvider(handle: number): monaco.languages.ReferenceProvider {
        return {
            provideReferences: (model, position, context, token) => this.provideReferences(handle, model, position, context, token)
        };
    }

    protected provideReferences(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.ReferenceContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Location[]> {
        return this.proxy.$provideReferences(handle, model.uri, position, context, token).then(result => {
            if (!result) {
                return undefined;
            }

            if (Array.isArray(result)) {
                const references: monaco.languages.Location[] = [];
                for (const item of result) {
                    references.push({ ...item, uri: monaco.Uri.revive(item.uri) });
                }
                return references;
            }

            return undefined;
        });
    }

    $registerSignatureHelpProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], metadata: theia.SignatureHelpProviderMetadata): void {
        const languageSelector = this.toLanguageSelector(selector);
        const signatureHelpProvider = this.createSignatureHelpProvider(handle, metadata);
        this.register(handle, (monaco.languages.registerSignatureHelpProvider as RegistrationFunction<monaco.languages.SignatureHelpProvider>)
            (languageSelector, signatureHelpProvider));
    }

    $clearDiagnostics(id: string): void {
        for (const uri of this.problemManager.getUris()) {
            this.problemManager.setMarkers(new URI(uri), id, []);
        }
    }

    $changeDiagnostics(id: string, delta: [string, MarkerData[]][]): void {
        for (const [uriString, markers] of delta) {
            const uri = new URI(uriString);
            this.problemManager.setMarkers(uri, id, markers.map(reviveMarker));
        }
    }

    $registerImplementationProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const implementationProvider = this.createImplementationProvider(handle);
        this.register(handle, (monaco.languages.registerImplementationProvider as RegistrationFunction<monaco.languages.ImplementationProvider>)
            (languageSelector, implementationProvider));
    }

    protected createImplementationProvider(handle: number): monaco.languages.ImplementationProvider {
        return {
            provideImplementation: (model, position, token) => this.provideImplementation(handle, model, position, token)
        };
    }

    protected provideImplementation(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return this.proxy.$provideImplementation(handle, model.uri, position, token).then(result => {
            if (!result) {
                return undefined;
            }

            if (Array.isArray(result)) {
                // using DefinitionLink because Location is mandatory part of DefinitionLink
                const definitionLinks: monaco.languages.LocationLink[] = [];
                for (const item of result) {
                    definitionLinks.push({ ...item, uri: monaco.Uri.revive(item.uri) });
                }
                return definitionLinks;
            } else {
                // single Location
                return <monaco.languages.Location>{
                    uri: monaco.Uri.revive(result.uri),
                    range: result.range
                };
            }
        });
    }

    $registerTypeDefinitionProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const typeDefinitionProvider = this.createTypeDefinitionProvider(handle);
        this.register(handle, (monaco.languages.registerTypeDefinitionProvider as RegistrationFunction<monaco.languages.TypeDefinitionProvider>)
            (languageSelector, typeDefinitionProvider));
    }

    protected createTypeDefinitionProvider(handle: number): monaco.languages.TypeDefinitionProvider {
        return {
            provideTypeDefinition: (model, position, token) => this.provideTypeDefinition(handle, model, position, token)
        };
    }

    protected provideTypeDefinition(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return this.proxy.$provideTypeDefinition(handle, model.uri, position, token).then(result => {
            if (!result) {
                return undefined;
            }

            if (Array.isArray(result)) {
                // using DefinitionLink because Location is mandatory part of DefinitionLink
                const definitionLinks: monaco.languages.LocationLink[] = [];
                for (const item of result) {
                    definitionLinks.push({ ...item, uri: monaco.Uri.revive(item.uri) });
                }
                return definitionLinks;
            } else {
                // single Location
                return <monaco.languages.Location>{
                    uri: monaco.Uri.revive(result.uri),
                    range: result.range
                };
            }
        });
    }

    $registerHoverProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const hoverProvider = this.createHoverProvider(handle);
        this.register(handle, (monaco.languages.registerHoverProvider as RegistrationFunction<monaco.languages.HoverProvider>)(languageSelector, hoverProvider));
    }

    protected createHoverProvider(handle: number): monaco.languages.HoverProvider {
        return {
            provideHover: (model, position, token) => this.provideHover(handle, model, position, token)
        };
    }

    protected provideHover(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Hover> {
        return this.proxy.$provideHover(handle, model.uri, position, token);
    }

    $registerEvaluatableExpressionProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const evaluatableExpressionProvider = this.createEvaluatableExpressionProvider(handle);
        this.register(handle,
            (StandaloneServices.get(ILanguageFeaturesService).evaluatableExpressionProvider.register as RegistrationFunction<EvaluatableExpressionProvider>)
                (languageSelector, evaluatableExpressionProvider));
    }

    protected createEvaluatableExpressionProvider(handle: number): EvaluatableExpressionProvider {
        return {
            provideEvaluatableExpression: (model, position, token) => this.provideEvaluatableExpression(handle, model, position, token)
        };
    }

    protected provideEvaluatableExpression(handle: number, model: ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<EvaluatableExpression | undefined> {
        return this.proxy.$provideEvaluatableExpression(handle, model.uri, position, token);
    }

    $registerInlineValuesProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const inlineValuesProvider = this.createInlineValuesProvider(handle);
        this.register(handle,
            (StandaloneServices.get(ILanguageFeaturesService).inlineValuesProvider.register as RegistrationFunction<InlineValuesProvider>)
                (languageSelector, inlineValuesProvider));
    }

    protected createInlineValuesProvider(handle: number): InlineValuesProvider {
        return {
            provideInlineValues: (model, range, context, token) => this.provideInlineValues(handle, model, range, context, token)
        };
    }

    protected provideInlineValues(handle: number, model: ITextModel, range: Range,
        context: InlineValueContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<InlineValue[] | undefined> {
        return this.proxy.$provideInlineValues(handle, model.uri, range, context, token);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $emitInlineValuesEvent(eventHandle: number, event?: any): void {
        const obj = this.services.get(eventHandle);
        if (obj instanceof Emitter) {
            obj.fire(event);
        }
    }

    $registerDocumentHighlightProvider(handle: number, _pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const documentHighlightProvider = this.createDocumentHighlightProvider(handle);
        this.register(handle, (monaco.languages.registerDocumentHighlightProvider as RegistrationFunction<monaco.languages.DocumentHighlightProvider>)
            (languageSelector, documentHighlightProvider));
    }

    protected createDocumentHighlightProvider(handle: number): monaco.languages.DocumentHighlightProvider {
        return {
            provideDocumentHighlights: (model, position, token) => this.provideDocumentHighlights(handle, model, position, token)
        };
    }

    protected provideDocumentHighlights(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentHighlight[]> {
        return this.proxy.$provideDocumentHighlights(handle, model.uri, position, token).then(result => {
            if (!result) {
                return undefined;
            }

            if (Array.isArray(result)) {
                const highlights: monaco.languages.DocumentHighlight[] = [];
                for (const item of result) {
                    highlights.push(
                        {
                            ...item,
                            kind: (item.kind ? item.kind : monaco.languages.DocumentHighlightKind.Text)
                        });
                }
                return highlights;
            }

            return undefined;
        });
    }

    $registerWorkspaceSymbolProvider(handle: number, pluginInfo: PluginInfo): void {
        const workspaceSymbolProvider = this.createWorkspaceSymbolProvider(handle);
        this.register(handle, this.monacoLanguages.registerWorkspaceSymbolProvider(workspaceSymbolProvider));
    }

    protected createWorkspaceSymbolProvider(handle: number): WorkspaceSymbolProvider {
        return {
            provideWorkspaceSymbols: (params, token) => this.provideWorkspaceSymbols(handle, params, token),
            resolveWorkspaceSymbol: (symbol, token) => this.resolveWorkspaceSymbol(handle, symbol, token)
        };
    }

    protected provideWorkspaceSymbols(handle: number, params: WorkspaceSymbolParams, token: monaco.CancellationToken): Thenable<vst.SymbolInformation[]> {
        return this.proxy.$provideWorkspaceSymbols(handle, params.query, token);
    }

    protected resolveWorkspaceSymbol(handle: number, symbol: vst.SymbolInformation, token: monaco.CancellationToken): Thenable<vst.SymbolInformation | undefined> {
        return this.proxy.$resolveWorkspaceSymbol(handle, symbol, token);
    }

    $registerDocumentLinkProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const linkProvider = this.createLinkProvider(handle);
        this.register(handle, (monaco.languages.registerLinkProvider as RegistrationFunction<monaco.languages.LinkProvider>)(languageSelector, linkProvider));
    }

    protected createLinkProvider(handle: number): monaco.languages.LinkProvider {
        return {
            provideLinks: async (model, token) => this.provideLinks(handle, model, token),
            resolveLink: async (link, token) => this.resolveLink(handle, link, token)
        };
    }

    protected async provideLinks(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): Promise<monaco.languages.ProviderResult<monaco.languages.ILinksList>> {
        const links = await this.proxy.$provideDocumentLinks(handle, model.uri, token);
        if (!links) {
            return undefined;
        }
        return {
            links: links.map(link => this.toMonacoLink(link)),
            dispose: () => {
                if (links && Array.isArray(links)) {
                    this.proxy.$releaseDocumentLinks(handle, links.map(link => ObjectIdentifier.of(link)));
                }
            }
        };
    }

    protected async resolveLink(handle: number, link: monaco.languages.ILink,
        token: monaco.CancellationToken): Promise<monaco.languages.ProviderResult<monaco.languages.ILink>> {
        const resolved = await this.proxy.$resolveDocumentLink(handle, link, token);
        return resolved && this.toMonacoLink(resolved);
    }

    protected toMonacoLink(link: DocumentLink): monaco.languages.ILink {
        return {
            ...link,
            url: !!link.url && typeof link.url !== 'string' ? monaco.Uri.revive(link.url) : link.url
        };
    }

    $registerCodeLensSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], eventHandle: number): void {
        const languageSelector = this.toLanguageSelector(selector);
        const lensProvider = this.createCodeLensProvider(handle);

        if (typeof eventHandle === 'number') {
            const emitter = new Emitter<monaco.languages.CodeLensProvider>();
            this.register(eventHandle, emitter);
            lensProvider.onDidChange = emitter.event;
        }

        this.register(handle, (monaco.languages.registerCodeLensProvider as RegistrationFunction<monaco.languages.CodeLensProvider>)(languageSelector, lensProvider));
    }

    protected createCodeLensProvider(handle: number): monaco.languages.CodeLensProvider {
        return {
            provideCodeLenses: async (model, token) => this.provideCodeLenses(handle, model, token),
            resolveCodeLens: (model, codeLens, token) => this.resolveCodeLens(handle, model, codeLens, token)
        };
    }

    protected async provideCodeLenses(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): Promise<monaco.languages.ProviderResult<monaco.languages.CodeLensList>> {
        const lenses = await this.proxy.$provideCodeLenses(handle, model.uri, token);
        if (!lenses) {
            return undefined;
        }
        return {
            lenses,
            dispose: () => {
                if (lenses && Array.isArray(lenses)) {
                    this.proxy.$releaseCodeLenses(handle, lenses.map(symbol => ObjectIdentifier.of(symbol)));
                }
            }
        };
    }

    protected resolveCodeLens(handle: number, model: monaco.editor.ITextModel,
        codeLens: monaco.languages.CodeLens, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CodeLens> {
        return this.proxy.$resolveCodeLens(handle, model.uri, codeLens, token);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $emitCodeLensEvent(eventHandle: number, event?: any): void {
        const obj = this.services.get(eventHandle);
        if (obj instanceof Emitter) {
            obj.fire(event);
        }
    }

    $registerOutlineSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], displayName?: string): void {
        const languageSelector = this.toLanguageSelector(selector);
        const symbolProvider = this.createDocumentSymbolProvider(handle, displayName);
        this.register(handle, (monaco.languages.registerDocumentSymbolProvider as RegistrationFunction<monaco.languages.DocumentSymbolProvider>)(languageSelector, symbolProvider));
    }

    protected createDocumentSymbolProvider(handle: number, displayName?: string): monaco.languages.DocumentSymbolProvider {
        return {
            displayName,
            provideDocumentSymbols: (model, token) => this.provideDocumentSymbols(handle, model, token)
        };
    }

    protected provideDocumentSymbols(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentSymbol[]> {
        return this.proxy.$provideDocumentSymbols(handle, model.uri, token);
    }

    protected createDefinitionProvider(handle: number): monaco.languages.DefinitionProvider {
        return {
            provideDefinition: (model, position, token) => this.provideDefinition(handle, model, position, token)
        };
    }

    protected createDeclarationProvider(handle: number): monaco.languages.DeclarationProvider {
        return {
            provideDeclaration: (model, position, token) => this.provideDeclaration(handle, model, position, token)
        };
    }

    protected provideDeclaration(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return this.proxy.$provideDeclaration(handle, model.uri, position, token).then(result => {
            if (!result) {
                return undefined;
            }

            if (Array.isArray(result)) {
                // using DefinitionLink because Location is mandatory part of DefinitionLink
                const definitionLinks: monaco.languages.LocationLink[] = [];
                for (const item of result) {
                    definitionLinks.push({ ...item, uri: monaco.Uri.revive(item.uri) });
                }
                return definitionLinks;
            } else {
                // single Location
                return <monaco.languages.Location>{
                    uri: monaco.Uri.revive(result.uri),
                    range: result.range
                };
            }
        });
    }

    protected provideDefinition(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {
        return this.proxy.$provideDefinition(handle, model.uri, position, token).then(result => {
            if (!result) {
                return undefined;
            }

            if (Array.isArray(result)) {
                // using DefinitionLink because Location is mandatory part of DefinitionLink
                const definitionLinks: monaco.languages.LocationLink[] = [];
                for (const item of result) {
                    definitionLinks.push({ ...item, uri: monaco.Uri.revive(item.uri) });
                }
                return definitionLinks;
            } else {
                // single Location
                return <monaco.languages.Location>{
                    uri: monaco.Uri.revive(result.uri),
                    range: result.range
                };
            }
        });
    }

    protected createSignatureHelpProvider(handle: number, metadata: theia.SignatureHelpProviderMetadata): monaco.languages.SignatureHelpProvider {
        return {
            signatureHelpTriggerCharacters: metadata.triggerCharacters,
            signatureHelpRetriggerCharacters: metadata.retriggerCharacters,
            provideSignatureHelp: async (model, position, token, context) => this.provideSignatureHelp(handle, model, position, token, context)
        };
    }

    protected async provideSignatureHelp(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken,
        context: monaco.languages.SignatureHelpContext): Promise<monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult>> {

        // need to cast because of vscode issue https://github.com/microsoft/vscode/issues/190584
        const value = await this.proxy.$provideSignatureHelp(handle, model.uri, position, context as SignatureHelpContext, token);
        if (!value) {
            return undefined;
        }
        return {
            value,
            dispose: () => {
                if (typeof value.id === 'number') {
                    this.proxy.$releaseSignatureHelp(handle, value.id);
                }
            }
        };
    }

    $registerDocumentFormattingSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const documentFormattingEditSupport = this.createDocumentFormattingSupport(handle, pluginInfo);
        this.register(handle, (monaco.languages.registerDocumentFormattingEditProvider as RegistrationFunction<monaco.languages.DocumentFormattingEditProvider>)
            (languageSelector, documentFormattingEditSupport));
    }

    createDocumentFormattingSupport(handle: number, pluginInfo: PluginInfo): monaco.languages.DocumentFormattingEditProvider {
        const provider: monaco.languages.DocumentFormattingEditProvider & { extensionId: ExtensionIdentifier } = {
            extensionId: new ExtensionIdentifier(pluginInfo.id),
            displayName: pluginInfo.name,
            provideDocumentFormattingEdits: (model, options, token) =>
                this.provideDocumentFormattingEdits(handle, model, options, token)
        };

        return provider;
    }

    protected provideDocumentFormattingEdits(handle: number, model: monaco.editor.ITextModel,
        options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return this.proxy.$provideDocumentFormattingEdits(handle, model.uri, options, token);
    }

    $registerRangeFormattingSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const rangeFormattingEditProvider = this.createRangeFormattingSupport(handle, pluginInfo);
        this.register(handle, (monaco.languages.registerDocumentRangeFormattingEditProvider as RegistrationFunction<monaco.languages.DocumentRangeFormattingEditProvider>)
            (languageSelector, rangeFormattingEditProvider));
    }

    createRangeFormattingSupport(handle: number, pluginInfo: PluginInfo): monaco.languages.DocumentRangeFormattingEditProvider {
        const provider: monaco.languages.DocumentRangeFormattingEditProvider & { extensionId: ExtensionIdentifier } = {
            extensionId: new ExtensionIdentifier(pluginInfo.id),
            displayName: pluginInfo.name,
            provideDocumentRangeFormattingEdits: (model, range: Range, options, token) =>
                this.provideDocumentRangeFormattingEdits(handle, model, range, options, token)
        };

        return provider;
    }

    protected provideDocumentRangeFormattingEdits(handle: number, model: monaco.editor.ITextModel,
        range: Range, options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return this.proxy.$provideDocumentRangeFormattingEdits(handle, model.uri, range, options, token);
    }

    $registerOnTypeFormattingProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], autoFormatTriggerCharacters: string[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const onTypeFormattingProvider = this.createOnTypeFormattingProvider(handle, autoFormatTriggerCharacters);
        this.register(handle, (monaco.languages.registerOnTypeFormattingEditProvider as RegistrationFunction<monaco.languages.OnTypeFormattingEditProvider>)
            (languageSelector, onTypeFormattingProvider));
    }

    protected createOnTypeFormattingProvider(
        handle: number,
        autoFormatTriggerCharacters: string[]
    ): monaco.languages.OnTypeFormattingEditProvider {
        return {
            autoFormatTriggerCharacters,
            provideOnTypeFormattingEdits: (model, position, ch, options, token) => this.provideOnTypeFormattingEdits(handle, model, position, ch, options, token)
        };
    }

    protected provideOnTypeFormattingEdits(handle: number, model: monaco.editor.ITextModel, position: monaco.Position,
        ch: string, options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        return this.proxy.$provideOnTypeFormattingEdits(handle, model.uri, position, ch, options, token);
    }

    $registerDocumentDropEditProvider(handle: number, selector: SerializedDocumentFilter[], metadata?: DocumentDropEditProviderMetadata): void {
        this.register(
            handle,
            StandaloneServices
                .get(ILanguageFeaturesService)
                .documentDropEditProvider
                .register(selector, this.createDocumentDropEditProvider(handle, metadata))
        );
    }

    createDocumentDropEditProvider(handle: number, _metadata?: DocumentDropEditProviderMetadata): DocumentDropEditProvider {
        return {
            // @monaco-uplift id and dropMimeTypes should be supported by the monaco drop editor provider after 1.82.0
            // id?: string;
            // dropMimeTypes: metadata?.dropMimeTypes ?? ['*/*'],
            provideDocumentDropEdits: async (model, position, dataTransfer, token) => this.provideDocumentDropEdits(handle, model, position, dataTransfer, token)
        };
    }

    protected async provideDocumentDropEdits(handle: number, model: ITextModel, position: monaco.IPosition,
        dataTransfer: IReadonlyVSDataTransfer, token: CancellationToken): Promise<DocumentDropEditsSession | undefined> {
        await this.fileUploadService.upload(new URI(), { source: dataTransfer, leaveInTemp: true });
        return undefined;
    }

    $registerFoldingRangeProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], eventHandle: number | undefined): void {
        const languageSelector = this.toLanguageSelector(selector);
        const provider = this.createFoldingRangeProvider(handle);

        if (typeof eventHandle === 'number') {
            const emitter = new Emitter<monaco.languages.FoldingRangeProvider>();
            this.services.set(eventHandle, emitter);
            provider.onDidChange = emitter.event;
        }

        this.register(handle, (monaco.languages.registerFoldingRangeProvider as RegistrationFunction<monaco.languages.FoldingRangeProvider>)(languageSelector, provider));
    }

    createFoldingRangeProvider(handle: number): monaco.languages.FoldingRangeProvider {
        return {
            provideFoldingRanges: (model, context, token) => this.provideFoldingRanges(handle, model, context, token)
        };
    }

    $emitFoldingRangeEvent(eventHandle: number, event?: unknown): void {
        const obj = this.services.get(eventHandle);
        if (obj instanceof Emitter) {
            obj.fire(event);
        }
    }

    protected provideFoldingRanges(handle: number, model: monaco.editor.ITextModel,
        context: monaco.languages.FoldingContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.FoldingRange[]> {
        return this.proxy.$provideFoldingRange(handle, model.uri, context, token);
    }

    $registerSelectionRangeProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const provider = this.createSelectionRangeProvider(handle);
        this.register(handle, (monaco.languages.registerSelectionRangeProvider as RegistrationFunction<monaco.languages.SelectionRangeProvider>)(languageSelector, provider));
    }

    protected createSelectionRangeProvider(handle: number): monaco.languages.SelectionRangeProvider {
        return {
            provideSelectionRanges: (model, positions, token) => this.provideSelectionRanges(handle, model, positions, token)
        };
    }

    protected provideSelectionRanges(handle: number, model: monaco.editor.ITextModel,
        positions: monaco.Position[], token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.SelectionRange[][]> {
        return this.proxy.$provideSelectionRanges(handle, model.uri, positions, token);
    }

    $registerDocumentColorProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const colorProvider = this.createColorProvider(handle);
        this.register(handle, (monaco.languages.registerColorProvider as RegistrationFunction<monaco.languages.DocumentColorProvider>)(languageSelector, colorProvider));
    }

    createColorProvider(handle: number): monaco.languages.DocumentColorProvider {
        return {
            provideDocumentColors: (model, token) => this.provideDocumentColors(handle, model, token),
            provideColorPresentations: (model, colorInfo, token) => this.provideColorPresentations(handle, model, colorInfo, token)
        };
    }

    protected provideDocumentColors(handle: number, model: monaco.editor.ITextModel,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.IColorInformation[]> {
        return this.proxy.$provideDocumentColors(handle, model.uri, token).then(documentColors =>
            documentColors.map(documentColor => {
                const [red, green, blue, alpha] = documentColor.color;
                const color = {
                    red: red,
                    green: green,
                    blue: blue,
                    alpha: alpha
                };

                return {
                    color,
                    range: documentColor.range
                };
            })
        );
    }

    protected provideColorPresentations(handle: number, model: monaco.editor.ITextModel,
        colorInfo: monaco.languages.IColorInformation, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.IColorPresentation[]> {
        return this.proxy.$provideColorPresentations(handle, model.uri, {
            color: [
                colorInfo.color.red,
                colorInfo.color.green,
                colorInfo.color.blue,
                colorInfo.color.alpha
            ],
            range: colorInfo.range
        }, token);
    }

    $registerInlayHintsProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], displayName?: string, eventHandle?: number): void {
        const languageSelector = this.toLanguageSelector(selector);
        const inlayHintsProvider = this.createInlayHintsProvider(handle);
        if (typeof eventHandle === 'number') {
            const emitter = new Emitter<void>();
            this.register(eventHandle, emitter);
            inlayHintsProvider.onDidChangeInlayHints = emitter.event;
        }
        this.register(handle, (monaco.languages.registerInlayHintsProvider as RegistrationFunction<monaco.languages.InlayHintsProvider>)(languageSelector, inlayHintsProvider));

    }

    createInlayHintsProvider(handle: number): monaco.languages.InlayHintsProvider {
        return {
            provideInlayHints: async (model: monaco.editor.ITextModel, range: Range, token: monaco.CancellationToken): Promise<monaco.languages.InlayHintList | undefined> => {
                const result = await this.proxy.$provideInlayHints(handle, model.uri, range, token);
                if (!result) {
                    return;
                }
                return {
                    hints: result.hints.map(hint => reviveHint(hint)),
                    dispose: () => {
                        if (typeof result.cacheId === 'number') {
                            this.proxy.$releaseInlayHints(handle, result.cacheId);
                        }
                    }
                };
            },
            resolveInlayHint: async (hint, token): Promise<monaco.languages.InlayHint | undefined> => {
                // need to cast because of vscode issue https://github.com/microsoft/vscode/issues/190584
                const dto: InlayHintDto = hint as InlayHintDto;
                if (typeof dto.cacheId !== 'number') {
                    return hint;
                }
                const result = await this.proxy.$resolveInlayHint(handle, dto.cacheId, token);
                if (token.isCancellationRequested) {
                    return undefined;
                }
                if (!result) {
                    return hint;
                }
                return {
                    ...hint,
                    tooltip: result.tooltip,
                    label: reviveInlayLabel(result.label)
                };
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $emitInlayHintsEvent(eventHandle: number, event?: any): void {
        const obj = this.services.get(eventHandle);
        if (obj instanceof Emitter) {
            obj.fire(event);
        }
    }

    $registerInlineCompletionsSupport(handle: number, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const provider: monaco.languages.InlineCompletionsProvider<IdentifiableInlineCompletions> = {
            provideInlineCompletions: async (
                model: monaco.editor.ITextModel,
                position: monaco.Position,
                context: monaco.languages.InlineCompletionContext,
                token: CancellationToken
            ): Promise<IdentifiableInlineCompletions | undefined> => this.proxy.$provideInlineCompletions(handle, model.uri, position, context, token),
            freeInlineCompletions: (completions: IdentifiableInlineCompletions): void => {
                this.proxy.$freeInlineCompletionsList(handle, completions.pid);
            }
        };
        this.register(handle, (monaco.languages.registerInlineCompletionsProvider as RegistrationFunction<monaco.languages.InlineCompletionsProvider>)(languageSelector, provider));
    }

    $registerQuickFixProvider(
        handle: number,
        pluginInfo: PluginInfo,
        selector: SerializedDocumentFilter[],
        providedCodeActionKinds?: string[],
        documentation?: CodeActionProviderDocumentation
    ): void {
        const languageSelector = this.toLanguageSelector(selector);
        const quickFixProvider: monaco.languages.CodeActionProvider = {
            provideCodeActions: (model, range, context, token) => {
                const markers = StandaloneServices.get(IMarkerService)
                    .read({ resource: model.uri })
                    .filter(m => monaco.Range.areIntersectingOrTouching(m, range)) as monaco.editor.IMarkerData[];
                return this.provideCodeActions(handle, model, range, { ...context, markers }, token);
            },
            resolveCodeAction: (codeAction, token) => this.resolveCodeAction(handle, codeAction, token)
        };
        this.register(handle,
            monaco.languages.registerCodeActionProvider(languageSelector, quickFixProvider, {
                documentation: documentation,
                providedCodeActionKinds
            }));
    }

    protected async provideCodeActions(
        handle: number,
        model: monaco.editor.ITextModel,
        rangeOrSelection: Range,
        context: monaco.languages.CodeActionContext,
        token: monaco.CancellationToken
    ): Promise<monaco.languages.CodeActionList | undefined> {
        try {
            const actions = await this.proxy.$provideCodeActions(handle, model.uri, rangeOrSelection, this.toModelCodeActionContext(context), token);
            if (!actions) {
                return undefined;
            }
            return {
                actions: actions.map(a => toMonacoAction(a)),
                dispose: () => this.proxy.$releaseCodeActions(handle, actions.map(a => a.cacheId))
            };
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    protected toModelCodeActionContext(context: monaco.languages.CodeActionContext): CodeActionContext {
        return {
            ...context,
            trigger: this.toCodeActionTriggerKind(context.trigger)
        };
    }

    toCodeActionTriggerKind(type: monaco.languages.CodeActionTriggerType): CodeActionTriggerKind {
        switch (type) {
            case monaco.languages.CodeActionTriggerType.Auto:
                return CodeActionTriggerKind.Automatic;
            case monaco.languages.CodeActionTriggerType.Invoke:
                return CodeActionTriggerKind.Invoke;
        }
    }

    protected async resolveCodeAction(handle: number, codeAction: monaco.languages.CodeAction, token: monaco.CancellationToken): Promise<monaco.languages.CodeAction> {
        // The cacheId is kept in toMonacoAction when converting a received CodeAction DTO to a monaco code action
        const cacheId = (codeAction as CodeAction).cacheId;
        if (cacheId !== undefined) {
            const resolvedEdit = await this.proxy.$resolveCodeAction(handle, cacheId, token);
            codeAction.edit = resolvedEdit && toMonacoWorkspaceEdit(resolvedEdit);
        }
        return codeAction;
    }

    $registerRenameProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], supportsResolveLocation: boolean): void {
        const languageSelector = this.toLanguageSelector(selector);
        const renameProvider = this.createRenameProvider(handle, supportsResolveLocation);
        this.register(handle, (monaco.languages.registerRenameProvider as RegistrationFunction<monaco.languages.RenameProvider>)(languageSelector, renameProvider));
    }

    protected createRenameProvider(handle: number, supportsResolveLocation: boolean): monaco.languages.RenameProvider {
        return {
            provideRenameEdits: (model, position, newName, token) => this.provideRenameEdits(handle, model, position, newName, token)
            ,
            resolveRenameLocation: supportsResolveLocation
                ? (model, position, token) =>
                    this.resolveRenameLocation(handle, model, position, token)
                : undefined
        };
    }

    protected provideRenameEdits(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, newName: string, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.WorkspaceEdit & monaco.languages.Rejection> {
        return this.proxy.$provideRenameEdits(handle, model.uri, position, newName, token).then(toMonacoWorkspaceEdit);
    }

    $registerCallHierarchyProvider(handle: number, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const callHierarchyService = this.createCallHierarchyService(handle, languageSelector);
        this.register(handle, this.callHierarchyServiceContributionRegistry.add(callHierarchyService));
    }

    protected createCallHierarchyService(handle: number, language: LanguageSelector): CallHierarchyService {
        return {
            selector: language,
            getRootDefinition: (uri: DocumentUri, position: Position, cancellationToken: CancellationToken) =>
                this.proxy.$provideRootDefinition(handle, toUriComponents(uri), fromPosition(position), cancellationToken)
                    .then(def => {
                        if (!def) { return undefined; }
                        const defs = Array.isArray(def) ? def : [def];
                        return { dispose: () => this.proxy.$releaseCallHierarchy(handle, defs[0]?._sessionId), items: defs.map(item => toItemHierarchyDefinition(item)) };
                    }),
            getCallers:
                (
                    definition: CallHierarchyItem,
                    cancellationToken: CancellationToken
                ) => this.proxy.$provideCallers(handle, fromItemHierarchyDefinition(definition), cancellationToken)
                    .then(result => {
                        if (!result) {
                            return undefined!;
                        }

                        if (Array.isArray(result)) {
                            return result.map(toCaller);
                        }

                        return undefined!;
                    }),

            getCallees:
                (
                    definition: CallHierarchyItem,
                    cancellationToken: CancellationToken
                ) => this.proxy.$provideCallees(handle, fromItemHierarchyDefinition(definition), cancellationToken)
                    .then(result => {
                        if (!result) {
                            return undefined;
                        }
                        if (Array.isArray(result)) {
                            return result.map(toCallee);
                        }

                        return undefined;
                    })
        };
    }

    protected resolveRenameLocation(handle: number, model: monaco.editor.ITextModel,
        position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.RenameLocation> {
        return this.proxy.$resolveRenameLocation(handle, model.uri, position, token);
    }

    // --- type hierarchy
    $registerTypeHierarchyProvider(handle: number, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const typeHierarchyService = this.createTypeHierarchyService(handle, languageSelector);
        this.register(handle, this.typeHierarchyServiceContributionRegistry.add(typeHierarchyService));
    }

    protected createTypeHierarchyService(handle: number, language: LanguageSelector): TypeHierarchyService {
        return {
            selector: language,
            prepareSession: (uri: DocumentUri, position: Position, cancellationToken: CancellationToken) =>
                this.proxy.$prepareTypeHierarchy(handle, toUriComponents(uri), fromPosition(position), cancellationToken)
                    .then(result => {
                        if (!result) {
                            return undefined;
                        }
                        const items = Array.isArray(result) ? result : [result];
                        return {
                            dispose: () => this.proxy.$releaseTypeHierarchy(handle, items[0]?._sessionId),
                            items: items.map(item => toItemHierarchyDefinition(item))
                        };
                    }),
            provideSuperTypes: (sessionId, itemId, cancellationToken: CancellationToken) => this.proxy.$provideSuperTypes(handle, sessionId, itemId, cancellationToken)
                .then(results => {
                    if (!results) {
                        return undefined;
                    }

                    if (Array.isArray(results)) {
                        return results.map(toItemHierarchyDefinition);
                    }

                    return undefined;
                }),
            provideSubTypes: async (sessionId, itemId, cancellationToken: CancellationToken) => this.proxy.$provideSubTypes(handle, sessionId, itemId, cancellationToken)
                .then(results => {
                    if (!results) {
                        return undefined;
                    }

                    if (Array.isArray(results)) {
                        return results.map(toItemHierarchyDefinition);
                    }

                    return undefined;
                })
        };
    }

    // --- semantic tokens
    $registerDocumentSemanticTokensProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], legend: theia.SemanticTokensLegend,
        eventHandle: number | undefined): void {
        const languageSelector = this.toLanguageSelector(selector);
        let event: Event<void> | undefined = undefined;
        if (typeof eventHandle === 'number') {
            const emitter = new Emitter<void>();
            this.register(eventHandle, emitter);
            event = emitter.event;
        }
        const provider = this.createDocumentSemanticTokensProvider(handle, legend, event);
        this.register(handle, (monaco.languages.registerDocumentSemanticTokensProvider as RegistrationFunction<monaco.languages.DocumentSemanticTokensProvider>)
            (languageSelector, provider));
    }

    protected createDocumentSemanticTokensProvider(handle: number, legend: theia.SemanticTokensLegend, event?: Event<void>): monaco.languages.DocumentSemanticTokensProvider {
        return {
            releaseDocumentSemanticTokens: resultId => {
                if (resultId) {
                    this.proxy.$releaseDocumentSemanticTokens(handle, parseInt(resultId, 10));
                }
            },
            getLegend: () => legend,
            provideDocumentSemanticTokens: async (model, lastResultId, token) => {
                const nLastResultId = lastResultId ? parseInt(lastResultId, 10) : 0;
                const encodedDto = await this.proxy.$provideDocumentSemanticTokens(handle, model.uri, nLastResultId, token);
                if (!encodedDto) {
                    return null;
                }
                if (token.isCancellationRequested) {
                    return null;
                }
                const dto = decodeSemanticTokensDto(encodedDto);
                if (dto.type === 'full') {
                    return {
                        resultId: String(dto.id),
                        data: dto.data
                    };
                }
                return {
                    resultId: String(dto.id),
                    edits: dto.deltas
                };
            }
        };
    }

    $emitDocumentSemanticTokensEvent(eventHandle: number): void {
        const obj = this.services.get(eventHandle);
        if (obj instanceof Emitter) {
            obj.fire(undefined);
        }
    }

    $registerDocumentRangeSemanticTokensProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], legend: theia.SemanticTokensLegend): void {
        const languageSelector = this.toLanguageSelector(selector);
        const provider = this.createDocumentRangeSemanticTokensProvider(handle, legend);
        this.register(handle, (monaco.languages.registerDocumentRangeSemanticTokensProvider as RegistrationFunction<monaco.languages.DocumentRangeSemanticTokensProvider>)
            (languageSelector, provider));
    }

    protected createDocumentRangeSemanticTokensProvider(handle: number, legend: theia.SemanticTokensLegend): monaco.languages.DocumentRangeSemanticTokensProvider {
        return {
            getLegend: () => legend,
            provideDocumentRangeSemanticTokens: async (model, range, token) => {
                const encodedDto = await this.proxy.$provideDocumentRangeSemanticTokens(handle, model.uri, range, token);
                if (!encodedDto) {
                    return null;
                }
                if (token.isCancellationRequested) {
                    return null;
                }
                const dto = decodeSemanticTokensDto(encodedDto);
                if (dto.type === 'full') {
                    return {
                        resultId: String(dto.id),
                        data: dto.data
                    };
                }
                throw new Error('Unexpected');
            }
        };
    }

    // --- suggest

    protected toLanguageSelector(filters: SerializedDocumentFilter[]): MonacoLanguageSelector.LanguageSelector & LanguageSelector {
        return filters.map(filter => {
            let pattern: string | (IRelativePattern & RelativePattern) | undefined;
            if (typeof filter.pattern === 'string') {
                pattern = filter.pattern;
            } else if (filter.pattern) {
                pattern = {
                    base: MonacoPath.normalize(filter.pattern.baseUri.toString()),
                    pattern: filter.pattern.pattern,
                    pathToRelative: relative
                };
            }
            return {
                language: filter.language,
                scheme: filter.scheme,
                pattern
            };
        });
    }

    // --- linked editing range

    $registerLinkedEditingRangeProvider(handle: number, selector: SerializedDocumentFilter[]): void {
        const languageSelector = this.toLanguageSelector(selector);
        const linkedEditingRangeProvider = this.createLinkedEditingRangeProvider(handle);
        this.register(handle,
            (monaco.languages.registerLinkedEditingRangeProvider as RegistrationFunction<monaco.languages.LinkedEditingRangeProvider>)(languageSelector, linkedEditingRangeProvider)
        );
    }

    protected createLinkedEditingRangeProvider(handle: number): monaco.languages.LinkedEditingRangeProvider {
        return {
            provideLinkedEditingRanges: async (model: monaco.editor.ITextModel, position: monaco.Position, token: CancellationToken):
                Promise<monaco.languages.LinkedEditingRanges | undefined> => {
                const res = await this.proxy.$provideLinkedEditingRanges(handle, model.uri, position, token);
                if (res) {
                    return {
                        ranges: res.ranges,
                        wordPattern: reviveRegExp(res.wordPattern)
                    };
                }
                return undefined;
            }
        };
    };

    // -- Language status

    $setLanguageStatus(handle: number, status: LanguageStatusDTO): void {
        const internal: EditorLanguageStatus = { ...status, selector: this.toLanguageSelector(status.selector) };
        this.languageStatusService.setLanguageStatusItem(handle, internal);
    };

    $removeLanguageStatus(handle: number): void {
        this.languageStatusService.removeLanguageStatusItem(handle);
    };
}

function reviveMarker(marker: MarkerData): vst.Diagnostic {
    const monacoMarker: vst.Diagnostic = {
        code: marker.code,
        severity: reviveSeverity(marker.severity),
        range: reviveRange(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn),
        message: marker.message,
        source: marker.source,
        relatedInformation: undefined
    };

    if (marker.relatedInformation) {
        monacoMarker.relatedInformation = marker.relatedInformation.map(reviveRelated);
    }

    if (marker.tags) {
        monacoMarker.tags = marker.tags.map(reviveTag);
    }

    return monacoMarker;
}

function reviveSeverity(severity: MarkerSeverity): vst.DiagnosticSeverity {
    switch (severity) {
        case MarkerSeverity.Error: return vst.DiagnosticSeverity.Error;
        case MarkerSeverity.Warning: return vst.DiagnosticSeverity.Warning;
        case MarkerSeverity.Info: return vst.DiagnosticSeverity.Information;
        case MarkerSeverity.Hint: return vst.DiagnosticSeverity.Hint;
    }
}

function reviveRange(startLine: number, startColumn: number, endLine: number, endColumn: number): vst.Range {
    // note: language server range is 0-based, marker is 1-based, so need to deduct 1 here
    return {
        start: {
            line: startLine - 1,
            character: startColumn - 1
        },
        end: {
            line: endLine - 1,
            character: endColumn - 1
        }
    };
}

function reviveRelated(related: RelatedInformation): vst.DiagnosticRelatedInformation {
    return {
        message: related.message,
        location: {
            uri: related.resource,
            range: reviveRange(related.startLineNumber, related.startColumn, related.endLineNumber, related.endColumn)
        }
    };
}

function reviveTag(tag: DiagnosticTag): vst.DiagnosticTag {
    switch (tag) {
        case 1: return DiagnosticTag.Unnecessary;
        case 2: return DiagnosticTag.Deprecated;
    }
}

function reviveRegExp(regExp?: SerializedRegExp): RegExp | undefined {
    if (typeof regExp === 'undefined' || regExp === null) {
        return undefined;
    }
    return new RegExp(regExp.pattern, regExp.flags);
}

function reviveIndentationRule(indentationRule?: SerializedIndentationRule): monaco.languages.IndentationRule | undefined {
    if (typeof indentationRule === 'undefined' || indentationRule === null) {
        return undefined;
    }
    return {
        increaseIndentPattern: reviveRegExp(indentationRule.increaseIndentPattern)!,
        decreaseIndentPattern: reviveRegExp(indentationRule.decreaseIndentPattern)!,
        indentNextLinePattern: reviveRegExp(indentationRule.indentNextLinePattern),
        unIndentedLinePattern: reviveRegExp(indentationRule.unIndentedLinePattern),
    };
}

function reviveOnEnterRule(onEnterRule: SerializedOnEnterRule): monaco.languages.OnEnterRule {
    return {
        beforeText: reviveRegExp(onEnterRule.beforeText)!,
        afterText: reviveRegExp(onEnterRule.afterText),
        previousLineText: reviveRegExp(onEnterRule.previousLineText),
        action: onEnterRule.action,
    };
}

function reviveOnEnterRules(onEnterRules?: SerializedOnEnterRule[]): monaco.languages.OnEnterRule[] | undefined {
    if (typeof onEnterRules === 'undefined' || onEnterRules === null) {
        return undefined;
    }
    return onEnterRules.map(reviveOnEnterRule);
}

function reviveInlayLabel(label: string | InlayHintLabelPart[]): string | monaco.languages.InlayHintLabelPart[] {
    let monacoLabel: string | monaco.languages.InlayHintLabelPart[];
    if (typeof label === 'string') {
        monacoLabel = label;
    } else {
        const parts: monaco.languages.InlayHintLabelPart[] = [];
        for (const part of label) {
            const result: monaco.languages.InlayHintLabelPart = {
                ...part,
                location: !!part.location ? { range: part.location?.range, uri: monaco.Uri.revive(part.location.uri) } : undefined
            };
            parts.push(result);
        }
        monacoLabel = parts;
    }
    return monacoLabel;
}

function reviveHint(hint: InlayHint): monaco.languages.InlayHint {
    return {
        ...hint,
        label: reviveInlayLabel(hint.label)
    };
}

function toMonacoAction(action: CodeAction): monaco.languages.CodeAction {
    return {
        ...action,
        diagnostics: action.diagnostics ? action.diagnostics.map(m => toMonacoMarkerData(m)) : undefined,
        disabled: action.disabled?.reason,
        edit: action.edit ? toMonacoWorkspaceEdit(action.edit) : undefined
    };
}

function toMonacoMarkerData(marker: MarkerData): monaco.editor.IMarkerData {
    return {
        ...marker,
        relatedInformation: marker.relatedInformation
            ? marker.relatedInformation.map(i => toMonacoRelatedInformation(i))
            : undefined
    };
}

function toMonacoRelatedInformation(relatedInfo: RelatedInformation): monaco.editor.IRelatedInformation {
    return {
        ...relatedInfo,
        resource: monaco.Uri.parse(relatedInfo.resource)
    };
}

export function toMonacoWorkspaceEdit(data: WorkspaceEditDto | undefined): monaco.languages.WorkspaceEdit {
    return {
        edits: (data && data.edits || []).map(edit => {
            if (WorkspaceTextEditDto.is(edit)) {
                return <monaco.languages.IWorkspaceTextEdit>{
                    resource: monaco.Uri.revive(edit.resource),
                    textEdit: edit.textEdit,
                    metadata: edit.metadata
                };
            } else {
                const fileEdit = edit as WorkspaceFileEditDto;
                return <monaco.languages.IWorkspaceFileEdit>{
                    newResource: monaco.Uri.revive(fileEdit.newResource),
                    oldResource: monaco.Uri.revive(fileEdit.oldResource),
                    options: fileEdit.options,
                    metadata: fileEdit.metadata
                };
            }
        })
    };
}
