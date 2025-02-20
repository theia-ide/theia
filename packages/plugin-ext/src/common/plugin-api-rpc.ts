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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createProxyIdentifier, ProxyIdentifier, RPCProtocol } from './rpc-protocol';
import * as theia from '@theia/plugin';
import { PluginLifecycle, PluginModel, PluginMetadata, PluginPackage, IconUrl, PluginJsonValidationContribution } from './plugin-protocol';
import { QueryParameters } from './env';
import { TextEditorCursorStyle } from './editor-options';
import {
    ConfigurationTarget,
    TextEditorLineNumbersStyle,
    EndOfLine,
    OverviewRulerLane,
    FileOperationOptions,
    TextDocumentChangeReason,
    IndentAction,
    NotebookRendererScript,
} from '../plugin/types-impl';
import { UriComponents } from './uri-components';
import {
    SerializedDocumentFilter,
    CompletionContext,
    MarkdownString,
    Range,
    Completion,
    CompletionResultDto,
    MarkerData,
    SignatureHelp,
    Hover,
    EvaluatableExpression,
    InlineValue,
    InlineValueContext,
    DocumentHighlight,
    FormattingOptions,
    ChainedCacheId,
    Definition,
    DocumentLink,
    CodeLensSymbol,
    Command,
    TextEdit,
    DocumentSymbol,
    ReferenceContext,
    TextDocumentShowOptions,
    WorkspaceRootsChangeEvent,
    Location,
    Breakpoint,
    ColorPresentation,
    RenameLocation,
    SignatureHelpContext,
    CodeAction,
    CodeActionContext,
    FoldingContext,
    FoldingRange,
    SelectionRange,
    SearchInWorkspaceResult,
    CallHierarchyItem,
    CallHierarchyIncomingCall,
    CallHierarchyOutgoingCall,
    Comment,
    CommentOptions,
    CommentThreadState,
    CommentThreadCollapsibleState,
    CommentThread,
    CommentThreadChangedEvent,
    CodeActionProviderDocumentation,
    LinkedEditingRanges,
    ProvidedTerminalLink,
    InlayHint,
    CachedSession,
    CachedSessionItem,
    TypeHierarchyItem,
    InlineCompletion,
    InlineCompletions,
    InlineCompletionContext,
    DocumentDropEdit,
    DataTransferDTO,
    DocumentDropEditProviderMetadata,
    DebugStackFrameDTO,
    DebugThreadDTO
} from './plugin-api-rpc-model';
import { ExtPluginApi } from './plugin-ext-api-contribution';
import { KeysToAnyValues, KeysToKeysToAnyValue } from './types';
import {
    AuthenticationProviderAuthenticationSessionsChangeEvent,
    CancellationToken,
    Progress,
    ProgressOptions,
} from '@theia/plugin';
import { DebuggerDescription } from '@theia/debug/lib/common/debug-service';
import { DebugProtocol } from '@vscode/debugprotocol';
import { SymbolInformation } from '@theia/core/shared/vscode-languageserver-protocol';
import * as files from '@theia/filesystem/lib/common/files';
import { BinaryBuffer } from '@theia/core/lib/common/buffer';
import { ResourceLabelFormatter } from '@theia/core/lib/common/label-protocol';
import type {
    InternalTimelineOptions,
    Timeline,
    TimelineChangeEvent,
    TimelineProviderDescriptor
} from '@theia/timeline/lib/common/timeline-model';
import { SerializableEnvironmentVariableCollection } from '@theia/terminal/lib/common/shell-terminal-protocol';
import { ThemeType } from '@theia/core/lib/common/theme';
import { Disposable } from '@theia/core/lib/common/disposable';
import { isString, isObject, QuickInputButtonHandle } from '@theia/core/lib/common';
import { Severity } from '@theia/core/lib/common/severity';
import { DebugConfiguration, DebugSessionOptions } from '@theia/debug/lib/common/debug-configuration';
import * as notebookCommon from '@theia/notebook/lib/common';
import { CellExecutionUpdateType, CellRange, NotebookCellExecutionState } from '@theia/notebook/lib/common';
import { LanguagePackBundle } from './language-pack-service';
import { AccessibilityInformation } from '@theia/core/lib/common/accessibility';

import { TreeDelta } from '@theia/test/lib/common/tree-delta';
import { TestItemDTO, TestOutputDTO, TestRunDTO, TestRunProfileDTO, TestRunRequestDTO, TestStateChangeDTO } from './test-types';
import { ArgumentProcessor } from './commands';

export interface PreferenceData {
    [scope: number]: any;
}

export interface Plugin {
    pluginPath: string | undefined;
    pluginFolder: string;
    pluginUri: string;
    model: PluginModel;
    rawModel: PluginPackage;
    lifecycle: PluginLifecycle;
    isUnderDevelopment: boolean;
}

export interface ConfigStorage {
    hostLogPath: string;
    hostStoragePath?: string;
    hostGlobalStoragePath: string;
}

export enum UIKind {

    /**
     * Extensions are accessed from a desktop application.
     */
    Desktop = 1,

    /**
     * Extensions are accessed from a web browser.
     */
    Web = 2
}

export enum ExtensionKind {
    /**
     * Extension runs where the UI runs.
     */
    UI = 1,

    /**
     * Extension runs where the remote extension host runs.
     */
    Workspace = 2
}

export interface EnvInit {
    queryParams: QueryParameters;
    language: string;
    shell: string;
    uiKind: UIKind;
    appName: string;
    appHost: string;
    appRoot: string;
    appUriScheme: string;
}

export interface PluginAPI {

}

export const PluginManager = Symbol.for('PluginManager');
export interface PluginManager {
    getAllPlugins(): Plugin[];
    getPluginById(pluginId: string): Plugin | undefined;
    getPluginExport(pluginId: string): PluginAPI | undefined;
    getPluginKind(): theia.ExtensionKind;
    isRunning(pluginId: string): boolean;
    isActive(pluginId: string): boolean;
    activatePlugin(pluginId: string): PromiseLike<void>;
    onDidChange: theia.Event<void>;
}

export interface PluginAPIFactory {
    (plugin: Plugin): typeof theia;
}

export const emptyPlugin: Plugin = {
    lifecycle: {
        startMethod: 'empty',
        stopMethod: 'empty'
    },
    model: {
        id: 'emptyPlugin',
        name: 'emptyPlugin',
        publisher: 'Theia',
        version: 'empty',
        displayName: 'empty',
        description: 'empty',
        engine: {
            type: 'empty',
            version: 'empty'
        },
        packagePath: 'empty',
        packageUri: 'empty',
        entryPoint: {

        }
    },
    pluginPath: 'empty',
    pluginFolder: 'empty',
    pluginUri: 'empty',
    rawModel: {
        name: 'emptyPlugin',
        publisher: 'Theia',
        version: 'empty',
        displayName: 'empty',
        description: 'empty',
        engines: {
            type: 'empty',
            version: 'empty'
        },
        packagePath: 'empty'
    },
    isUnderDevelopment: false
};

export interface PluginManagerInitializeParams {
    preferences: PreferenceData
    globalState: KeysToKeysToAnyValue
    workspaceState: KeysToKeysToAnyValue
    env: EnvInit
    pluginKind: ExtensionKind
    extApi?: ExtPluginApi[]
    webview: WebviewInitData
    jsonValidation: PluginJsonValidationContribution[]
    supportedActivationEvents?: string[]
}

export interface PluginManagerStartParams {
    plugins: PluginMetadata[]
    configStorage: ConfigStorage
    activationEvents: string[]
}

export interface AbstractPluginManagerExt<P extends Record<string, any>> {
    /** initialize the manager, should be called only once */
    $init(params: P): Promise<void>;

    /** load and activate plugins */
    $start(params: PluginManagerStartParams): Promise<void>;

    /** deactivate the plugin */
    $stop(pluginId: string): Promise<void>;

    /** deactivate all plugins */
    $stop(): Promise<void>;

    $updateStoragePath(path: string | undefined): Promise<void>;

    $activateByEvent(event: string): Promise<void>;

    $activatePlugin(id: string): Promise<void>;
}

export interface PluginManagerExt extends AbstractPluginManagerExt<PluginManagerInitializeParams> { }

export interface CommandRegistryMain {
    $registerCommand(command: theia.CommandDescription): void;
    $unregisterCommand(id: string): void;

    $registerHandler(id: string): void;
    $unregisterHandler(id: string): void;

    $executeCommand<T>(id: string, ...args: any[]): PromiseLike<T | undefined>;
    $getCommands(): PromiseLike<string[]>;
    $getKeyBinding(commandId: string): PromiseLike<theia.CommandKeyBinding[] | undefined>;

    registerArgumentProcessor(processor: ArgumentProcessor): void;
}

export interface CommandRegistryExt {
    $executeCommand<T>(id: string, ...ars: any[]): PromiseLike<T | undefined>;
    registerArgumentProcessor(processor: ArgumentProcessor): void;
}

export interface TerminalServiceExt {
    $startProfile(providerId: string, cancellationToken: theia.CancellationToken): Promise<string>;
    $terminalCreated(id: string, name: string): void;
    $terminalNameChanged(id: string, name: string): void;
    $terminalOpened(id: string, processId: number, terminalId: number, cols: number, rows: number): void;
    $terminalClosed(id: string, exitStatus: theia.TerminalExitStatus | undefined): void;
    $terminalOnInput(id: string, data: string): void;
    $terminalSizeChanged(id: string, cols: number, rows: number): void;
    $currentTerminalChanged(id: string | undefined): void;
    $terminalStateChanged(id: string): void;
    $initEnvironmentVariableCollections(collections: [string, string, boolean, SerializableEnvironmentVariableCollection][]): void;
    $provideTerminalLinks(line: string, terminalId: string, token: theia.CancellationToken): Promise<ProvidedTerminalLink[]>;
    $handleTerminalLink(link: ProvidedTerminalLink): Promise<void>;
    getEnvironmentVariableCollection(extensionIdentifier: string): theia.GlobalEnvironmentVariableCollection;
    $setShell(shell: string): void;
    $reportOutputMatch(observerId: string, groups: string[]): void;
}
export interface OutputChannelRegistryExt {
    createOutputChannel(name: string, pluginInfo: PluginInfo): theia.OutputChannel,
    createOutputChannel(name: string, pluginInfo: PluginInfo, options: { log: true }): theia.LogOutputChannel
}

export interface ConnectionMain {
    $createConnection(id: string): Promise<void>;
    $deleteConnection(id: string): Promise<void>;
    $sendMessage(id: string, message: string): void;
}

export interface ConnectionExt {
    $createConnection(id: string): Promise<void>;
    $deleteConnection(id: string): Promise<void>
    $sendMessage(id: string, message: string): void;
}

export interface TerminalServiceMain {
    /**
     * Create new Terminal with Terminal options.
     * @param options - object with parameters to create new terminal.
     */
    $createTerminal(id: string, options: TerminalOptions, parentId?: string, isPseudoTerminal?: boolean): Promise<string>;

    /**
     * Send text to the terminal by id.
     * @param id - terminal widget id.
     * @param text - text content.
     * @param shouldExecute - in case true - Indicates that the text being sent should be executed rather than just inserted in the terminal.
     */
    $sendText(id: string, text: string, shouldExecute?: boolean): void;

    /**
     * Write data to the terminal by id.
     * @param id - terminal widget id.
     * @param data - data.
     */
    $write(id: string, data: string): void;

    /**
     * Resize the terminal by id.
     * @param id - terminal widget id.
     * @param cols - columns.
     * @param rows - rows.
     */
    $resize(id: string, cols: number, rows: number): void;

    /**
     * Show terminal on the UI panel.
     * @param id - terminal widget id.
     * @param preserveFocus - set terminal focus in case true value, and don't set focus otherwise.
     */
    $show(id: string, preserveFocus?: boolean): void;

    /**
     * Hide UI panel where is located terminal widget.
     * @param id - terminal widget id.
     */
    $hide(id: string): void;

    /**
     * Destroy terminal.
     * @param id - terminal widget id.
     */
    $dispose(id: string): void;

    /**
     * Set the terminal widget name.
     * @param id terminal widget id.
     * @param name new terminal widget name.
     */
    $setName(id: string, name: string): void;

    /**
     * Send text to the terminal by id.
     * @param id - terminal id.
     * @param text - text content.
     * @param addNewLine - in case true - add new line after the text, otherwise - don't apply new line.
     */
    $sendTextByTerminalId(id: number, text: string, addNewLine?: boolean): void;

    /**
     * Write data to the terminal by id.
     * @param id - terminal id.
     * @param data - data.
     */
    $writeByTerminalId(id: number, data: string): void;

    /**
     * Resize the terminal by id.
     * @param id - terminal id.
     * @param cols - columns.
     * @param rows - rows.
     */
    $resizeByTerminalId(id: number, cols: number, rows: number): void;

    /**
     * Show terminal on the UI panel.
     * @param id - terminal id.
     * @param preserveFocus - set terminal focus in case true value, and don't set focus otherwise.
     */
    $showByTerminalId(id: number, preserveFocus?: boolean): void;

    /**
     * Hide UI panel where is located terminal widget.
     * @param id - terminal id.
     */
    $hideByTerminalId(id: number): void;

    /**
     * Destroy terminal.
     * @param id - terminal id.
     * @param waitOnExit - Whether to wait for a key press before closing the terminal.
     */
    $disposeByTerminalId(id: number, waitOnExit?: boolean | string): void;

    $setEnvironmentVariableCollection(persistent: boolean, extensionIdentifier: string, rootUri: string, collection: SerializableEnvironmentVariableCollection): void;

    /**
     * Set the terminal widget name.
     * @param id terminal id.
     * @param name new terminal widget name.
     */
    $setNameByTerminalId(id: number, name: string): void;

    /**
     * Register a new terminal link provider.
     * @param providerId id of the terminal link provider to be registered.
     */
    $registerTerminalLinkProvider(providerId: string): Promise<void>;

    /**
     * Unregister the terminal link provider with the specified id.
     * @param providerId id of the terminal link provider to be unregistered.
     */
    $unregisterTerminalLinkProvider(providerId: string): Promise<void>;

    /**
     * Register a new terminal observer.
     * @param providerId id of the terminal link provider to be registered.
     * @param nrOfLinesToMatch the number of lines to match the outputMatcherRegex against
     * @param outputMatcherRegex the regex to match the output to
     */
    $registerTerminalObserver(id: string, nrOfLinesToMatch: number, outputMatcherRegex: string): unknown;

    /**
     * Unregister the terminal observer with the specified id.
     * @param providerId id of the terminal observer to be unregistered.
     */
    $unregisterTerminalObserver(id: string): unknown;
}

export interface TerminalOptions extends theia.TerminalOptions {
    iconUrl?: string | { light: string; dark: string } | ThemeIcon;
}

export interface AutoFocus {
    autoFocusFirstEntry?: boolean;
    // TODO
}

export enum MainMessageType {
    Error,
    Warning,
    Info
}

export interface MainMessageOptions {
    detail?: string;
    modal?: boolean
    onCloseActionHandle?: number
}

export interface MainMessageItem {
    title: string,
    isCloseAffordance?: boolean;
    handle?: number
}

export interface MessageRegistryMain {
    $showMessage(type: MainMessageType, message: string, options: MainMessageOptions, actions: MainMessageItem[]): PromiseLike<number | undefined>;
}

export interface StatusBarMessageRegistryMain {
    $setMessage(id: string,
        name: string | undefined,
        text: string | undefined,
        priority: number,
        alignment: theia.StatusBarAlignment,
        color: string | undefined,
        backgroundColor: string | undefined,
        tooltip: string | theia.MarkdownString | undefined,
        command: string | undefined,
        accessibilityInformation: theia.AccessibilityInformation,
        args: any[] | undefined): PromiseLike<void>;
    $dispose(id: string): void;
}

export interface QuickOpenExt {
    $onItemSelected(handle: number): void;
    $validateInput(input: string): Promise<string | { content: string; severity: Severity; } | null | undefined>;

    $acceptOnDidAccept(sessionId: number): Promise<void>;
    $acceptDidChangeValue(sessionId: number, changedValue: string): Promise<void>;
    $acceptOnDidHide(sessionId: number): Promise<void>;
    $acceptOnDidTriggerButton(sessionId: number, btn: QuickInputButtonHandle): Promise<void>;
    $onDidTriggerItemButton(sessionId: number, itemHandle: number, buttonHandle: number): void;
    $onDidChangeActive(sessionId: number, handles: number[]): void;
    $onDidChangeSelection(sessionId: number, handles: number[]): void;

    /* eslint-disable max-len */
    showQuickPick(plugin: Plugin, itemsOrItemsPromise: Array<theia.QuickPickItem> | Promise<Array<theia.QuickPickItem>>, options: theia.QuickPickOptions & { canPickMany: true; },
        token?: theia.CancellationToken): Promise<Array<theia.QuickPickItem> | undefined>;
    showQuickPick(plugin: Plugin, itemsOrItemsPromise: string[] | Promise<string[]>, options?: theia.QuickPickOptions, token?: theia.CancellationToken): Promise<string | undefined>;
    showQuickPick(plugin: Plugin, itemsOrItemsPromise: Array<theia.QuickPickItem> | Promise<Array<theia.QuickPickItem>>, options?: theia.QuickPickOptions, token?: theia.CancellationToken): Promise<theia.QuickPickItem | undefined>;

    showInput(options?: theia.InputBoxOptions, token?: theia.CancellationToken): PromiseLike<string | undefined>;
    // showWorkspaceFolderPick(options?: theia.WorkspaceFolderPickOptions, token?: theia.CancellationToken): Promise<theia.WorkspaceFolder | undefined>
    createQuickPick<T extends theia.QuickPickItem>(plugin: Plugin): theia.QuickPick<T>;
    createInputBox(plugin: Plugin): theia.InputBox;
}

/**
 * Options to configure the behaviour of a file open dialog.
 */
export interface OpenDialogOptionsMain {

    /**
     * Dialog title.
     * This parameter might be ignored, as not all operating systems display a title on open dialogs.
     */
    title?: string;

    /**
     * The resource the dialog shows when opened.
     */
    defaultUri?: string;

    /**
     * A human-readable string for the open button.
     */
    openLabel?: string;

    /**
     * Allow to select files, defaults to `true`.
     */
    canSelectFiles?: boolean;

    /**
     * Allow to select folders, defaults to `false`.
     */
    canSelectFolders?: boolean;

    /**
     * Allow to select many files or folders.
     */
    canSelectMany?: boolean;

    /**
     * A set of file filters that are used by the dialog. Each entry is a human readable label,
     * like "TypeScript", and an array of extensions, e.g.
     * ```ts
     * {
     *  'Images': ['png', 'jpg']
     *  'TypeScript': ['ts', 'tsx']
     * }
     * ```
     */
    filters?: { [name: string]: string[] };
}

/**
 * Options to configure the behaviour of a file save dialog.
 */
export interface SaveDialogOptionsMain {

    /**
     * Dialog title.
     * This parameter might be ignored, as not all operating systems display a title on save dialogs.
     */
    title?: string;

    /**
     * The resource the dialog shows when opened.
     */
    defaultUri?: string;

    /**
     * A human-readable string for the save button.
     */
    saveLabel?: string;

    /**
     * A set of file filters that are used by the dialog. Each entry is a human readable label,
     * like "TypeScript", and an array of extensions, e.g.
     * ```ts
     * {
     *  'Images': ['png', 'jpg']
     *  'TypeScript': ['ts', 'tsx']
     * }
     * ```
     */
    filters?: { [name: string]: string[] };
}

/**
 * Options to configure the behaviour of a file upload dialog.
 */
export interface UploadDialogOptionsMain {
    /**
     * The resource, where files should be uploaded.
     */
    defaultUri?: string;
}

export interface FileUploadResultMain {
    uploaded: string[]
}

/**
 * Options to configure the behaviour of the [workspace folder](#WorkspaceFolder) pick UI.
 */
export interface WorkspaceFolderPickOptionsMain {
    /**
     * An optional string to show as place holder in the input box to guide the user what to pick on.
     */
    placeHolder?: string;

    /**
     * Set to `true` to keep the picker open when focus moves to another part of the editor or to another window.
     */
    ignoreFocusOut?: boolean;
}

export interface TransferQuickPickItem {
    handle: number;
    kind: 'item' | 'separator',
    label: string;
    iconUrl?: string | { light: string; dark: string } | ThemeIcon;
    description?: string;
    detail?: string;
    picked?: boolean;
    alwaysShow?: boolean;
    buttons?: readonly TransferQuickInputButton[];
}

export interface TransferQuickPickOptions<T extends TransferQuickPickItem> {
    title?: string;
    placeHolder?: string;
    matchOnDescription?: boolean;
    matchOnDetail?: boolean;
    matchOnLabel?: boolean;
    autoFocusOnList?: boolean;
    ignoreFocusLost?: boolean;
    canPickMany?: boolean;
    contextKey?: string;
    activeItem?: Promise<T> | T;
    onDidFocus?: (entry: T) => void;
}

export interface TransferQuickInputButton {
    handle?: number;
    readonly iconUrl?: string | { light: string; dark: string } | ThemeIcon;
    readonly tooltip?: string | undefined;
}

export type TransferQuickInput = TransferQuickPick | TransferInputBox;

export interface BaseTransferQuickInput {
    [key: string]: any;
    id: number;
    type?: 'quickPick' | 'inputBox';
    enabled?: boolean;
    busy?: boolean;
    visible?: boolean;
}

export interface TransferQuickPick extends BaseTransferQuickInput {
    type?: 'quickPick';
    value?: string;
    placeholder?: string;
    buttons?: TransferQuickInputButton[];
    items?: TransferQuickPickItem[];
    activeItems?: ReadonlyArray<theia.QuickPickItem>;
    selectedItems?: ReadonlyArray<theia.QuickPickItem>;
    canSelectMany?: boolean;
    ignoreFocusOut?: boolean;
    matchOnDescription?: boolean;
    matchOnDetail?: boolean;
    sortByLabel?: boolean;
}

export interface TransferInputBox extends BaseTransferQuickInput {
    type?: 'inputBox';
    value?: string;
    placeholder?: string;
    password?: boolean;
    buttons?: TransferQuickInputButton[];
    prompt?: string;
    validationMessage?: string;
}

export interface IInputBoxOptions {
    value?: string;
    valueSelection?: [number, number];
    prompt?: string;
    placeHolder?: string;
    password?: boolean;
    ignoreFocusOut?: boolean;
}

export interface QuickOpenMain {
    $show(instance: number, options: TransferQuickPickOptions<TransferQuickPickItem>, token: CancellationToken): Promise<number | number[] | undefined>;
    $setItems(instance: number, items: TransferQuickPickItem[]): Promise<any>;
    $setError(instance: number, error: Error): Promise<void>;
    $input(options: theia.InputBoxOptions, validateInput: boolean, token: CancellationToken): Promise<string | undefined>;
    $createOrUpdate<T extends theia.QuickPickItem>(params: TransferQuickInput): Promise<void>;
    $dispose(id: number): Promise<void>;

    $hide(): void;
    $showInputBox(options: TransferInputBox, validateInput: boolean): Promise<string | undefined>;
}

export interface FindFilesOptions {
    exclude?: string;
    useDefaultExcludes?: boolean;
    useDefaultSearchExcludes?: boolean;
    maxResults?: number;
    useIgnoreFiles?: boolean;
    fuzzy?: boolean;
}

export interface WorkspaceMain {
    $pickWorkspaceFolder(options: WorkspaceFolderPickOptionsMain): Promise<theia.WorkspaceFolder | undefined>;
    $startFileSearch(includePattern: string, includeFolder: string | undefined, options: FindFilesOptions, token: theia.CancellationToken): PromiseLike<UriComponents[]>;
    $findTextInFiles(query: theia.TextSearchQuery, options: theia.FindTextInFilesOptions, searchRequestId: number,
        token?: theia.CancellationToken): Promise<theia.TextSearchComplete>
    $registerTextDocumentContentProvider(scheme: string): Promise<void>;
    $unregisterTextDocumentContentProvider(scheme: string): void;
    $onTextDocumentContentChange(uri: string, content: string): void;
    $updateWorkspaceFolders(start: number, deleteCount?: number, ...rootsToAdd: string[]): Promise<void>;
    $getWorkspace(): Promise<files.FileStat | undefined>;
    $requestWorkspaceTrust(options?: theia.WorkspaceTrustRequestOptions): Promise<boolean | undefined>;
    $resolveProxy(url: string): Promise<string | undefined>;
    $registerCanonicalUriProvider(scheme: string): Promise<void | undefined>;
    $unregisterCanonicalUriProvider(scheme: string): void;
    $getCanonicalUri(uri: string, targetScheme: string, token: theia.CancellationToken): Promise<string | undefined>;
}

export interface WorkspaceExt {
    $onWorkspaceFoldersChanged(event: WorkspaceRootsChangeEvent): void;
    $onWorkspaceLocationChanged(event: files.FileStat | undefined): void;
    $provideTextDocumentContent(uri: string): Promise<string | undefined | null>;
    $onTextSearchResult(searchRequestId: number, done: boolean, result?: SearchInWorkspaceResult): void;
    $onWorkspaceTrustChanged(trust: boolean | undefined): void;
    $registerEditSessionIdentityProvider(scheme: string, provider: theia.EditSessionIdentityProvider): theia.Disposable;
    registerCanonicalUriProvider(scheme: string, provider: theia.CanonicalUriProvider): theia.Disposable;
    $disposeCanonicalUriProvider(scheme: string): void;
    getCanonicalUri(uri: theia.Uri, options: theia.CanonicalUriRequestOptions, token: CancellationToken): theia.ProviderResult<theia.Uri>;
    $provideCanonicalUri(uri: string, targetScheme: string, token: CancellationToken): Promise<string | undefined>;
}

export interface TimelineExt {
    $getTimeline(source: string, uri: UriComponents, options: theia.TimelineOptions, internalOptions?: InternalTimelineOptions): Promise<Timeline | undefined>;
}

export interface TimelineMain {
    $registerTimelineProvider(provider: TimelineProviderDescriptor): Promise<void>;
    $fireTimelineChanged(e: TimelineChangeEvent): Promise<void>;
    $unregisterTimelineProvider(source: string): Promise<void>;
}

export interface ThemingExt {
    $onColorThemeChange(type: ThemeType): void;
}
export interface ThemingMain extends Disposable {
}

export interface DialogsMain {
    $showOpenDialog(options: OpenDialogOptionsMain): Promise<string[] | undefined>;
    $showSaveDialog(options: SaveDialogOptionsMain): Promise<string | undefined>;
    $showUploadDialog(options: UploadDialogOptionsMain): Promise<string[] | undefined>;
}

export interface RegisterTreeDataProviderOptions {
    manageCheckboxStateManually?: boolean;
    showCollapseAll?: boolean
    canSelectMany?: boolean
    dragMimeTypes?: string[]
    dropMimeTypes?: string[]
}

export interface TreeViewRevealOptions {
    readonly select: boolean
    readonly focus: boolean
    readonly expand: boolean | number
}

export interface TreeViewsMain {
    $registerTreeDataProvider(treeViewId: string, options?: RegisterTreeDataProviderOptions): void;
    $readDroppedFile(contentId: string): Promise<BinaryBuffer>;
    $unregisterTreeDataProvider(treeViewId: string): void;
    $refresh(treeViewId: string, itemIds?: string[]): Promise<void>;
    $reveal(treeViewId: string, elementParentChain: string[], options: TreeViewRevealOptions): Promise<any>;
    $setMessage(treeViewId: string, message: string): void;
    $setTitle(treeViewId: string, title: string): void;
    $setDescription(treeViewId: string, description: string): void;
    $setBadge(treeViewId: string, badge: theia.ViewBadge | undefined): void;
}
export class DataTransferFileDTO {
    constructor(readonly name: string, readonly contentId: string, readonly uri?: UriComponents) { }

    static is(value: string | DataTransferFileDTO): value is DataTransferFileDTO {
        return !(typeof value === 'string');
    }
}

export interface TreeViewsExt {
    $checkStateChanged(treeViewId: string, itemIds: { id: string, checked: boolean }[]): Promise<void>;
    $dragStarted(treeViewId: string, treeItemIds: string[], token: CancellationToken): Promise<UriComponents[] | undefined>;
    $dragEnd(treeViewId: string): Promise<void>;
    $drop(treeViewId: string, treeItemId: string | undefined, dataTransferItems: [string, string | DataTransferFileDTO][], token: CancellationToken): Promise<void>;
    $getChildren(treeViewId: string, treeItemId: string | undefined): Promise<TreeViewItem[] | undefined>;
    $hasResolveTreeItem(treeViewId: string): Promise<boolean>;
    $resolveTreeItem(treeViewId: string, treeItemId: string, token: CancellationToken): Promise<TreeViewItem | undefined>;
    $setExpanded(treeViewId: string, treeItemId: string, expanded: boolean): Promise<any>;
    $setSelection(treeViewId: string, treeItemIds: string[]): Promise<void>;
    $setVisible(treeViewId: string, visible: boolean): Promise<void>;
}

export interface TreeViewItemCheckboxInfo {
    checked: boolean;
    tooltip?: string;
    accessibilityInformation?: AccessibilityInformation
}

export interface TreeViewItem {

    id: string;

    label: string;
    /** Label highlights given as tuples of inclusive start index and exclusive end index. */
    highlights?: [number, number][];

    description?: string | boolean;

    /* font-awesome icon for compatibility */
    icon?: string;
    iconUrl?: IconUrl;

    themeIcon?: ThemeIcon;

    resourceUri?: UriComponents;

    tooltip?: string | MarkdownString;

    collapsibleState?: TreeViewItemCollapsibleState;

    checkboxInfo?: TreeViewItemCheckboxInfo;

    contextValue?: string;

    command?: Command;

    accessibilityInformation?: theia.AccessibilityInformation;

}

export interface TreeViewItemReference {
    viewId: string
    itemId: string
}
export namespace TreeViewItemReference {
    export function is(arg: unknown): arg is TreeViewItemReference {
        return isObject(arg) && isString(arg.viewId) && isString(arg.itemId);
    }
}

/**
 * Collapsible state of the tree item
 */
export enum TreeViewItemCollapsibleState {
    /**
     * Determines an item can be neither collapsed nor expanded. Implies it has no children.
     */
    None = 0,
    /**
     * Determines an item is collapsed
     */
    Collapsed = 1,
    /**
     * Determines an item is expanded
     */
    Expanded = 2
}

export interface WindowMain {
    $openUri(uri: UriComponents): Promise<boolean>;
    $asExternalUri(uri: UriComponents): Promise<UriComponents>;
}

export interface WindowStateExt {
    $onDidChangeWindowFocus(focused: boolean): void;
    $onDidChangeWindowActive(active: boolean): void;
}

export interface NotificationExt {
    withProgress<R>(
        options: ProgressOptions,
        task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => PromiseLike<R>
    ): PromiseLike<R>;
    $acceptProgressCanceled(progressId: string): void;
}

export interface ScmCommandArg {
    sourceControlHandle: number
    resourceGroupHandle?: number
    resourceStateHandle?: number
}
export namespace ScmCommandArg {
    export function is(arg: unknown): arg is ScmCommandArg {
        return isObject(arg) && 'sourceControlHandle' in arg;
    }
}

export interface ScmExt {
    createSourceControl(plugin: Plugin, id: string, label: string, rootUri?: theia.Uri): theia.SourceControl;
    getLastInputBox(plugin: Plugin): theia.SourceControlInputBox | undefined;
    $onInputBoxValueChange(sourceControlHandle: number, message: string): Promise<void>;
    $executeResourceCommand(sourceControlHandle: number, groupHandle: number, resourceHandle: number): Promise<void>;
    $validateInput(sourceControlHandle: number, value: string, cursorPosition: number): Promise<[string, number] | undefined>;
    $setSelectedSourceControl(selectedSourceControlHandle: number | undefined): Promise<void>;
    $provideOriginalResource(sourceControlHandle: number, uri: string, token: theia.CancellationToken): Promise<UriComponents | undefined>;
}

export namespace TimelineCommandArg {
    export function is(arg: unknown): arg is TimelineCommandArg {
        return isObject(arg) && 'timelineHandle' in arg;
    }
}
export interface TimelineCommandArg {
    timelineHandle: string;
    source: string;
    uri: string;
}

export interface DecorationRequest {
    readonly id: number;
    readonly uri: UriComponents;
}

export type DecorationData = [boolean, string, string, ThemeColor];
export interface DecorationReply { [id: number]: DecorationData; }

export namespace CommentsCommandArg {
    export function is(arg: unknown): arg is CommentsCommandArg {
        return isObject(arg) && 'commentControlHandle' in arg && 'commentThreadHandle' in arg && 'text' in arg && !('commentUniqueId' in arg);
    }
}
export interface CommentsCommandArg {
    commentControlHandle: number;
    commentThreadHandle: number;
    text: string
}

export namespace CommentsContextCommandArg {
    export function is(arg: unknown): arg is CommentsContextCommandArg {
        return isObject(arg) && 'commentControlHandle' in arg && 'commentThreadHandle' in arg && 'commentUniqueId' in arg && !('text' in arg);
    }
}
export interface CommentsContextCommandArg {
    commentControlHandle: number;
    commentThreadHandle: number;
    commentUniqueId: number
}

export namespace CommentsEditCommandArg {
    export function is(arg: unknown): arg is CommentsEditCommandArg {
        return isObject(arg) && 'commentControlHandle' in arg && 'commentThreadHandle' in arg && 'commentUniqueId' in arg && 'text' in arg;
    }
}
export interface CommentsEditCommandArg {
    commentControlHandle: number;
    commentThreadHandle: number;
    commentUniqueId: number
    text: string
}

export interface DecorationsExt {
    registerFileDecorationProvider(provider: theia.FileDecorationProvider, pluginInfo: PluginInfo): theia.Disposable
    $provideDecorations(handle: number, requests: DecorationRequest[], token: CancellationToken): Promise<DecorationReply>;
}

export interface DecorationsMain {
    $registerDecorationProvider(handle: number): Promise<void>;
    $unregisterDecorationProvider(handle: number): void;
    $onDidChange(handle: number, resources: UriComponents[] | null): void;
}

export interface ScmMain {
    $registerSourceControl(sourceControlHandle: number, id: string, label: string, rootUri?: UriComponents): Promise<void>;
    $updateSourceControl(sourceControlHandle: number, features: SourceControlProviderFeatures): Promise<void>;
    $unregisterSourceControl(sourceControlHandle: number): Promise<void>;

    $registerGroups(sourceControlHandle: number, groups: ScmRawResourceGroup[], splices: ScmRawResourceSplices[]): void;
    $updateGroup(sourceControlHandle: number, groupHandle: number, features: SourceControlGroupFeatures): void;
    $updateGroupLabel(sourceControlHandle: number, groupHandle: number, label: string): void;
    $unregisterGroup(sourceControlHandle: number, groupHandle: number): void;

    $spliceResourceStates(sourceControlHandle: number, splices: ScmRawResourceSplices[]): void;

    $setInputBoxValue(sourceControlHandle: number, value: string): void;
    $setInputBoxPlaceholder(sourceControlHandle: number, placeholder: string): void;
    $setInputBoxVisible(sourceControlHandle: number, visible: boolean): void;
    $setInputBoxEnabled(sourceControlHandle: number, enabled: boolean): void;
}

export interface SourceControlProviderFeatures {
    hasQuickDiffProvider?: boolean;
    count?: number;
    commitTemplate?: string;
    acceptInputCommand?: Command;
    statusBarCommands?: Command[];
}

export interface SourceControlGroupFeatures {
    hideWhenEmpty: boolean | undefined;
}

export interface ScmRawResource {
    handle: number,
    sourceUri: UriComponents,
    icons: (IconUrl | ThemeIcon | undefined)[], /* icons: light, dark */
    tooltip: string,
    strikeThrough: boolean,
    faded: boolean,
    contextValue: string,
    command: Command | undefined
}

export interface ScmRawResourceGroup {
    handle: number,
    id: string,
    label: string,
    features: SourceControlGroupFeatures
}

export interface ScmRawResourceSplice {
    start: number,
    deleteCount: number,
    rawResources: ScmRawResource[]
}

export interface ScmRawResourceSplices {
    handle: number,
    splices: ScmRawResourceSplice[]
}

export interface SourceControlResourceState {
    readonly handle: number
    /**
     * The uri of the underlying resource inside the workspace.
     */
    readonly resourceUri: string;

    /**
     * The command which should be run when the resource
     * state is open in the Source Control viewlet.
     */
    readonly command?: Command;

    /**
     * The decorations for this source control
     * resource state.
     */
    readonly decorations?: SourceControlResourceDecorations;

    readonly letter?: string;

    readonly colorId?: string
}

/**
 * The decorations for a [source control resource state](#SourceControlResourceState).
 * Can be independently specified for light and dark themes.
 */
export interface SourceControlResourceDecorations {

    /**
     * Whether the source control resource state should be striked-through in the UI.
     */
    readonly strikeThrough?: boolean;

    /**
     * Whether the source control resource state should be faded in the UI.
     */
    readonly faded?: boolean;

    /**
     * The title for a specific source control resource state.
     */
    readonly tooltip?: string;

    /**
     * The icon path for a specific source control resource state.
     */
    readonly iconPath?: string;
}

export interface NotificationMain {
    $startProgress(options: NotificationMain.StartProgressOptions): Promise<string>;
    $stopProgress(id: string): void;
    $updateProgress(id: string, report: NotificationMain.ProgressReport): void;
}
export namespace NotificationMain {
    export interface StartProgressOptions {
        title: string;
        location?: string;
        cancellable?: boolean;
    }
    export interface ProgressReport {
        message?: string;
        increment?: number;
        total?: number;
    }
}

export enum EditorPosition {
    ONE = 0,
    TWO = 1,
    THREE = 2,
    FOUR = 3,
    FIVE = 4,
    SIX = 5,
    SEVEN = 6,
    EIGHT = 7,
    NINE = 8
}

export interface Position {
    readonly lineNumber: number;
    readonly column: number;
}

export interface Selection {
    /**
     * The line number on which the selection has started.
     */
    readonly selectionStartLineNumber: number;
    /**
     * The column on `selectionStartLineNumber` where the selection has started.
     */
    readonly selectionStartColumn: number;
    /**
     * The line number on which the selection has ended.
     */
    readonly positionLineNumber: number;
    /**
     * The column on `positionLineNumber` where the selection has ended.
     */
    readonly positionColumn: number;
}

export interface TextEditorConfiguration {
    tabSize: number;
    indentSize: number;
    insertSpaces: boolean;
    cursorStyle: TextEditorCursorStyle;
    lineNumbers: TextEditorLineNumbersStyle;
}

export interface TextEditorConfigurationUpdate {
    tabSize?: number | 'auto';
    indentSize?: number | 'tabSize';
    insertSpaces?: boolean | 'auto';
    cursorStyle?: TextEditorCursorStyle;
    lineNumbers?: TextEditorLineNumbersStyle;
}

export enum TextEditorRevealType {
    Default = 0,
    InCenter = 1,
    InCenterIfOutsideViewport = 2,
    AtTop = 3
}

export interface SelectionChangeEvent {
    selections: Selection[];
    source?: string;
}

export interface EditorChangedPropertiesData {
    options?: TextEditorConfiguration;
    selections?: SelectionChangeEvent;
    visibleRanges?: Range[];
}

export interface TextEditorPositionData {
    [id: string]: EditorPosition;
}

export interface TextEditorsExt {
    $acceptEditorPropertiesChanged(id: string, props: EditorChangedPropertiesData): void;
    $acceptEditorPositionData(data: TextEditorPositionData): void;
}

export interface SingleEditOperation {
    range?: Range;
    text?: string;
    forceMoveMarkers?: boolean;
}

export interface UndoStopOptions {
    undoStopBefore: boolean;
    undoStopAfter: boolean;
}

export interface ApplyEditsOptions extends UndoStopOptions {
    setEndOfLine: EndOfLine | undefined;
}

export interface ThemeColor {
    id: string;
}

export interface ThemeIcon {
    id: string;
    color?: ThemeColor;
}

/**
 * Describes the behavior of decorations when typing/editing near their edges.
 */
export enum TrackedRangeStickiness {
    AlwaysGrowsWhenTypingAtEdges = 0,
    NeverGrowsWhenTypingAtEdges = 1,
    GrowsOnlyWhenTypingBefore = 2,
    GrowsOnlyWhenTypingAfter = 3,
}
export interface ContentDecorationRenderOptions {
    contentText?: string;
    contentIconPath?: UriComponents;

    border?: string;
    borderColor?: string | ThemeColor;
    fontStyle?: string;
    fontWeight?: string;
    textDecoration?: string;
    color?: string | ThemeColor;
    backgroundColor?: string | ThemeColor;

    margin?: string;
    width?: string;
    height?: string;
}

export interface ThemeDecorationRenderOptions {
    backgroundColor?: string | ThemeColor;

    outline?: string;
    outlineColor?: string | ThemeColor;
    outlineStyle?: string;
    outlineWidth?: string;

    border?: string;
    borderColor?: string | ThemeColor;
    borderRadius?: string;
    borderSpacing?: string;
    borderStyle?: string;
    borderWidth?: string;

    fontStyle?: string;
    fontWeight?: string;
    textDecoration?: string;
    cursor?: string;
    color?: string | ThemeColor;
    opacity?: string;
    letterSpacing?: string;

    gutterIconPath?: UriComponents;
    gutterIconSize?: string;

    overviewRulerColor?: string | ThemeColor;

    before?: ContentDecorationRenderOptions;
    after?: ContentDecorationRenderOptions;
}

export interface DecorationRenderOptions extends ThemeDecorationRenderOptions {
    isWholeLine?: boolean;
    rangeBehavior?: TrackedRangeStickiness;
    overviewRulerLane?: OverviewRulerLane;

    light?: ThemeDecorationRenderOptions;
    dark?: ThemeDecorationRenderOptions;
}

export interface ThemeDecorationInstanceRenderOptions {
    before?: ContentDecorationRenderOptions;
    after?: ContentDecorationRenderOptions;
}

export interface DecorationInstanceRenderOptions extends ThemeDecorationInstanceRenderOptions {
    light?: ThemeDecorationInstanceRenderOptions;
    dark?: ThemeDecorationInstanceRenderOptions;
}

export interface DecorationOptions {
    range: Range;
    hoverMessage?: MarkdownString | MarkdownString[];
    renderOptions?: DecorationInstanceRenderOptions;
}

export interface TextEditorsMain {
    $tryShowTextDocument(uri: UriComponents, options?: TextDocumentShowOptions): Promise<void>;
    $registerTextEditorDecorationType(key: string, options: DecorationRenderOptions): void;
    $removeTextEditorDecorationType(key: string): void;
    $tryHideEditor(id: string): Promise<void>;
    $trySetOptions(id: string, options: TextEditorConfigurationUpdate): Promise<void>;
    $trySetDecorations(id: string, key: string, ranges: DecorationOptions[]): Promise<void>;
    $trySetDecorationsFast(id: string, key: string, ranges: number[]): Promise<void>;
    $tryRevealRange(id: string, range: Range, revealType: TextEditorRevealType): Promise<void>;
    $trySetSelections(id: string, selections: Selection[]): Promise<void>;
    $tryApplyEdits(id: string, modelVersionId: number, edits: SingleEditOperation[], opts: ApplyEditsOptions): Promise<boolean>;
    $tryApplyWorkspaceEdit(workspaceEditDto: WorkspaceEditDto, metadata?: WorkspaceEditMetadataDto): Promise<boolean>;
    $tryInsertSnippet(id: string, template: string, selections: Range[], opts: UndoStopOptions): Promise<boolean>;
    $save(uri: UriComponents): PromiseLike<UriComponents | undefined>;
    $saveAs(uri: UriComponents): PromiseLike<UriComponents | undefined>;
    $saveAll(includeUntitled?: boolean): Promise<boolean>;
    // $getDiffInformation(id: string): Promise<editorCommon.ILineChange[]>;
}

export interface ModelAddedData {
    uri: UriComponents;
    versionId: number;
    lines: string[];
    languageId?: string;
    EOL: string;
    modeId: string;
    isDirty: boolean;
}

export interface TextEditorAddData {
    id: string;
    documentUri: UriComponents;
    options: TextEditorConfiguration;
    selections: Selection[];
    visibleRanges: Range[];
    editorPosition?: EditorPosition;
}

export interface EditorsAndDocumentsDelta {
    removedDocuments?: UriComponents[];
    addedDocuments?: ModelAddedData[];
    removedEditors?: string[];
    addedEditors?: TextEditorAddData[];
    /**
     * undefined means no changes
     * null means no active
     * string means id of active
     */
    newActiveEditor?: string | null;
}

export interface EditorsAndDocumentsExt {
    $acceptEditorsAndDocumentsDelta(delta: EditorsAndDocumentsDelta): void;
}

export interface ModelContentChange {
    readonly range: Range;
    readonly rangeOffset: number;
    readonly rangeLength: number;
    readonly text: string;
}
export interface ModelChangedEvent {
    readonly changes: ModelContentChange[];

    readonly eol: string;

    readonly versionId: number;

    readonly reason: TextDocumentChangeReason | undefined;
}

export interface DocumentsExt {
    $acceptModelModeChanged(startUrl: UriComponents, oldModeId: string, newModeId: string): void;
    $acceptModelSaved(strUrl: UriComponents): void;
    $acceptModelWillSave(strUrl: UriComponents, reason: theia.TextDocumentSaveReason, saveTimeout: number): Promise<SingleEditOperation[]>;
    $acceptDirtyStateChanged(strUrl: UriComponents, isDirty: boolean): void;
    $acceptModelChanged(strUrl: UriComponents, e: ModelChangedEvent, isDirty: boolean): void;
}

export interface DocumentsMain {
    $tryCreateDocument(options?: { language?: string; content?: string; }): Promise<UriComponents>;
    $tryShowDocument(uri: UriComponents, options?: TextDocumentShowOptions): Promise<void>;
    $tryOpenDocument(uri: UriComponents): Promise<boolean>;
    $trySaveDocument(uri: UriComponents): Promise<boolean>;
}

export interface EnvMain {
    $getEnvVariable(envVarName: string): Promise<string | undefined>;
    $getClientOperatingSystem(): Promise<theia.OperatingSystem>;
}

export interface PreferenceRegistryMain {
    $updateConfigurationOption(
        target: boolean | ConfigurationTarget | undefined,
        key: string,
        value: any,
        resource?: string,
        withLanguageOverride?: boolean
    ): PromiseLike<void>;
    $removeConfigurationOption(
        target: boolean | ConfigurationTarget | undefined,
        key: string,
        resource?: string,
        withLanguageOverride?: boolean,
    ): PromiseLike<void>;
}

export interface PreferenceChangeExt {
    preferenceName: string,
    newValue: any,
    /**
     * The URI the folder affected, or undefined if User scope.
     */
    scope?: string;
}

export interface TerminalOptionsExt {
    attributes?: {
        [key: string]: string;
    }
}

export interface PreferenceRegistryExt {
    $acceptConfigurationChanged(data: { [key: string]: any }, eventData: PreferenceChangeExt[]): void;
}

export interface OutputChannelRegistryMain {
    $append(channelName: string, value: string, pluginInfo: PluginInfo): PromiseLike<void>;
    $clear(channelName: string): PromiseLike<void>;
    $dispose(channelName: string): PromiseLike<void>;
    $reveal(channelName: string, preserveFocus: boolean): PromiseLike<void>;
    $close(channelName: string): PromiseLike<void>;
}

export type CharacterPair = [string, string];

export interface CommentRule {
    lineComment?: string;
    blockComment?: CharacterPair;
}

export interface SerializedRegExp {
    pattern: string;
    flags?: string;
}

export interface SerializedIndentationRule {
    decreaseIndentPattern?: SerializedRegExp;
    increaseIndentPattern?: SerializedRegExp;
    indentNextLinePattern?: SerializedRegExp;
    unIndentedLinePattern?: SerializedRegExp;
}

export interface SerializedOnEnterRule {
    beforeText: SerializedRegExp;
    afterText?: SerializedRegExp;
    previousLineText?: SerializedRegExp;
    action: SerializedEnterAction;
}

export interface SerializedEnterAction {
    indentAction: IndentAction;
    outdentCurrentLine?: boolean;
    appendText?: string;
    removeText?: number;
}

export interface SerializedAutoClosingPair {
    open: string;
    close: string;
    notIn?: string[];
}

export interface SerializedLanguageConfiguration {
    comments?: CommentRule;
    brackets?: CharacterPair[];
    wordPattern?: SerializedRegExp;
    indentationRules?: SerializedIndentationRule;
    onEnterRules?: SerializedOnEnterRule[];
    autoClosingPairs?: SerializedAutoClosingPair[]
}

export interface CodeActionDto {
    title: string;
    edit?: WorkspaceEditDto;
    diagnostics?: MarkerData[];
    command?: Command;
    kind?: string;
    isPreferred?: boolean;
    disabled?: string;
}

export interface WorkspaceEditEntryMetadataDto {
    needsConfirmation: boolean;
    label: string;
    description?: string;
    iconPath?: ThemeIcon | {
        light: UriComponents;
        dark: UriComponents;
    };
}

export interface WorkspaceFileEditDto {
    oldResource?: UriComponents;
    newResource?: UriComponents;
    options?: FileOperationOptions;
    metadata?: WorkspaceEditEntryMetadataDto;
}

export interface WorkspaceTextEditDto {
    resource: UriComponents;
    modelVersionId?: number;
    textEdit: TextEdit & { insertAsSnippet?: boolean };
    metadata?: WorkspaceEditEntryMetadataDto;
}
export namespace WorkspaceTextEditDto {
    export function is(arg: WorkspaceTextEditDto | WorkspaceFileEditDto): arg is WorkspaceTextEditDto {
        return !!arg
            && 'resource' in arg
            && 'textEdit' in arg
            && arg.textEdit !== null
            && typeof arg.textEdit === 'object';
    }
}
export interface WorkspaceEditMetadataDto {
    isRefactoring?: boolean;
}

export type CellEditOperationDto =
    {
        editType: notebookCommon.CellEditType.Metadata;
        index: number;
        metadata: Record<string, unknown>;
    } |
    {
        editType: notebookCommon.CellEditType.DocumentMetadata;
        metadata: Record<string, unknown>;
    } |
    {
        editType: notebookCommon.CellEditType.Replace;
        index: number;
        count: number;
        cells: NotebookCellDataDto[];
    };

export interface NotebookWorkspaceEditMetadataDto {
    needsConfirmation: boolean;
    label: string;
    description?: string;
}

export interface WorkspaceNotebookCellEditDto {
    metadata?: NotebookWorkspaceEditMetadataDto;
    resource: UriComponents;
    cellEdit: CellEditOperationDto;
}

export namespace WorkspaceNotebookCellEditDto {
    export function is(arg: WorkspaceNotebookCellEditDto | WorkspaceFileEditDto | WorkspaceTextEditDto): arg is WorkspaceNotebookCellEditDto {
        return !!arg
            && 'resource' in arg
            && 'cellEdit' in arg
            && arg.cellEdit !== null
            && typeof arg.cellEdit === 'object';
    }
}

export interface WorkspaceEditDto {
    edits: Array<WorkspaceTextEditDto | WorkspaceFileEditDto | WorkspaceNotebookCellEditDto>;
}

export interface CommandProperties {
    command: string;
    args?: string[];
    options?: {
        cwd?: string;
        [key: string]: any
    };
}

export type TaskGroupKind = 'build' | 'test' | 'rebuild' | 'clean';
export interface TaskDto {
    type: string;
    taskType?: 'shell' | 'process' | 'customExecution'; // the task execution type
    executionId?: string,
    label: string;
    source?: string;
    scope: string | number;
    // Provide a more specific type when necessary (see ProblemMatcherContribution)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    problemMatcher?: any;
    group?: {
        kind: TaskGroupKind;
        isDefault: boolean;
    }
    detail?: string;
    presentation?: TaskPresentationOptionsDTO;
    runOptions?: RunOptionsDTO;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface RunOptionsDTO {
    reevaluateOnRerun?: boolean;
}

export interface TaskPresentationOptionsDTO {
    reveal?: number;
    focus?: boolean;
    echo?: boolean;
    panel?: number;
    showReuseMessage?: boolean;
    clear?: boolean;
    close?: boolean;
}

export interface TaskExecutionDto {
    id: number;
    task: TaskDto;
}

export interface ProcessTaskDto extends TaskDto, CommandProperties {
    windows?: CommandProperties;
}

export interface PluginInfo {
    id: string;
    name: string;
    displayName?: string;
}

export interface LanguageStatus {
    readonly id: string;
    readonly name: string;
    readonly selector: SerializedDocumentFilter[];
    readonly severity: Severity;
    readonly label: string;
    readonly detail: string;
    readonly busy: boolean;
    readonly source: string;
    readonly command: Command | undefined;
    readonly accessibilityInfo: theia.AccessibilityInformation | undefined;
}

export interface LanguagesExt {
    $provideCompletionItems(handle: number, resource: UriComponents, position: Position,
        context: CompletionContext, token: CancellationToken): Promise<CompletionResultDto | undefined>;
    $resolveCompletionItem(handle: number, chainedId: ChainedCacheId, token: CancellationToken): Promise<Completion | undefined>;
    $releaseCompletionItems(handle: number, id: number): void;
    $provideImplementation(handle: number, resource: UriComponents, position: Position, token: CancellationToken): Promise<Definition | undefined>;
    $provideTypeDefinition(handle: number, resource: UriComponents, position: Position, token: CancellationToken): Promise<Definition | undefined>;
    $provideDefinition(handle: number, resource: UriComponents, position: Position, token: CancellationToken): Promise<Definition | undefined>;
    $provideDeclaration(handle: number, resource: UriComponents, position: Position, token: CancellationToken): Promise<Definition | undefined>;
    $provideReferences(handle: number, resource: UriComponents, position: Position, context: ReferenceContext, token: CancellationToken): Promise<Location[] | undefined>;
    $provideSignatureHelp(
        handle: number, resource: UriComponents, position: Position, context: SignatureHelpContext, token: CancellationToken
    ): Promise<SignatureHelp | undefined>;
    $releaseSignatureHelp(handle: number, id: number): void;
    $provideHover(handle: number, resource: UriComponents, position: Position, token: CancellationToken): Promise<Hover | undefined>;
    $provideEvaluatableExpression(handle: number, resource: UriComponents, position: Position, token: CancellationToken): Promise<EvaluatableExpression | undefined>;
    $provideInlineValues(handle: number, resource: UriComponents, range: Range, context: InlineValueContext, token: CancellationToken): Promise<InlineValue[] | undefined>;
    $provideDocumentHighlights(handle: number, resource: UriComponents, position: Position, token: CancellationToken): Promise<DocumentHighlight[] | undefined>;
    $provideDocumentFormattingEdits(handle: number, resource: UriComponents,
        options: FormattingOptions, token: CancellationToken): Promise<TextEdit[] | undefined>;
    $provideDocumentRangeFormattingEdits(handle: number, resource: UriComponents, range: Range,
        options: FormattingOptions, token: CancellationToken): Promise<TextEdit[] | undefined>;
    $provideOnTypeFormattingEdits(
        handle: number,
        resource: UriComponents,
        position: Position,
        ch: string,
        options: FormattingOptions,
        token: CancellationToken
    ): Promise<TextEdit[] | undefined>;
    $provideDocumentDropEdits(
        handle: number,
        resource: UriComponents,
        position: Position,
        dataTransfer: DataTransferDTO,
        token: CancellationToken
    ): Promise<DocumentDropEdit | undefined>;
    $provideDocumentLinks(handle: number, resource: UriComponents, token: CancellationToken): Promise<DocumentLink[] | undefined>;
    $resolveDocumentLink(handle: number, link: DocumentLink, token: CancellationToken): Promise<DocumentLink | undefined>;
    $releaseDocumentLinks(handle: number, ids: number[]): void;
    $provideCodeLenses(handle: number, resource: UriComponents, token: CancellationToken): Promise<CodeLensSymbol[] | undefined>;
    $resolveCodeLens(handle: number, resource: UriComponents, symbol: CodeLensSymbol, token: CancellationToken): Promise<CodeLensSymbol | undefined>;
    $releaseCodeLenses(handle: number, ids: number[]): void;
    $provideCodeActions(
        handle: number,
        resource: UriComponents,
        rangeOrSelection: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken
    ): Promise<CodeAction[] | undefined>;
    $releaseCodeActions(handle: number, cacheIds: number[]): void;
    $resolveCodeAction(handle: number, cacheId: number, token: CancellationToken): Promise<WorkspaceEditDto | undefined>;
    $provideDocumentSymbols(handle: number, resource: UriComponents, token: CancellationToken): Promise<DocumentSymbol[] | undefined>;
    $provideWorkspaceSymbols(handle: number, query: string, token: CancellationToken): PromiseLike<SymbolInformation[]>;
    $resolveWorkspaceSymbol(handle: number, symbol: SymbolInformation, token: CancellationToken): PromiseLike<SymbolInformation | undefined>;
    $provideFoldingRange(
        handle: number,
        resource: UriComponents,
        context: FoldingContext,
        token: CancellationToken
    ): PromiseLike<FoldingRange[] | undefined>;
    $provideSelectionRanges(handle: number, resource: UriComponents, positions: Position[], token: CancellationToken): PromiseLike<SelectionRange[][]>;
    $provideDocumentColors(handle: number, resource: UriComponents, token: CancellationToken): PromiseLike<RawColorInfo[]>;
    $provideColorPresentations(handle: number, resource: UriComponents, colorInfo: RawColorInfo, token: CancellationToken): PromiseLike<ColorPresentation[]>;
    $provideInlayHints(handle: number, resource: UriComponents, range: Range, token: CancellationToken): Promise<InlayHintsDto | undefined>;
    $resolveInlayHint(handle: number, id: ChainedCacheId, token: CancellationToken): Promise<InlayHintDto | undefined>;
    $releaseInlayHints(handle: number, id: number): void;
    $provideRenameEdits(handle: number, resource: UriComponents, position: Position, newName: string, token: CancellationToken): PromiseLike<WorkspaceEditDto | undefined>;
    $resolveRenameLocation(handle: number, resource: UriComponents, position: Position, token: CancellationToken): PromiseLike<RenameLocation | undefined>;
    $provideDocumentSemanticTokens(handle: number, resource: UriComponents, previousResultId: number, token: CancellationToken): Promise<BinaryBuffer | null>;
    $releaseDocumentSemanticTokens(handle: number, semanticColoringResultId: number): void;
    $provideDocumentRangeSemanticTokens(handle: number, resource: UriComponents, range: Range, token: CancellationToken): Promise<BinaryBuffer | null>;
    $provideRootDefinition(handle: number, resource: UriComponents, location: Position, token: CancellationToken): Promise<CallHierarchyItem[] | undefined>;
    $provideCallers(handle: number, definition: CallHierarchyItem, token: CancellationToken): Promise<CallHierarchyIncomingCall[] | undefined>;
    $provideCallees(handle: number, definition: CallHierarchyItem, token: CancellationToken): Promise<CallHierarchyOutgoingCall[] | undefined>;
    $provideLinkedEditingRanges(handle: number, resource: UriComponents, position: Position, token: CancellationToken): Promise<LinkedEditingRanges | undefined>;
    $releaseCallHierarchy(handle: number, session?: string): Promise<boolean>;
    $prepareTypeHierarchy(handle: number, resource: UriComponents, location: Position, token: theia.CancellationToken): Promise<TypeHierarchyItem[] | undefined>
    $provideSuperTypes(handle: number, sessionId: string, itemId: string, token: theia.CancellationToken): Promise<TypeHierarchyItem[] | undefined>
    $provideSubTypes(handle: number, sessionId: string, itemId: string, token: theia.CancellationToken): Promise<TypeHierarchyItem[] | undefined>;
    $releaseTypeHierarchy(handle: number, session?: string): Promise<boolean>;
    $provideInlineCompletions(handle: number, resource: UriComponents, position: Position, context: InlineCompletionContext, token: CancellationToken): Promise<IdentifiableInlineCompletions | undefined>;
    $freeInlineCompletionsList(handle: number, pid: number): void;
}

export const LanguagesMainFactory = Symbol('LanguagesMainFactory');
export interface LanguagesMainFactory {
    (proxy: RPCProtocol): LanguagesMain;
}

export const OutputChannelRegistryFactory = Symbol('OutputChannelRegistryFactory');
export interface OutputChannelRegistryFactory {
    (): OutputChannelRegistryMain;
}

export interface LanguagesMain {
    $getLanguages(): Promise<string[]>;
    $changeLanguage(resource: UriComponents, languageId: string): Promise<void>;
    $setLanguageConfiguration(handle: number, languageId: string, configuration: SerializedLanguageConfiguration): void;
    $unregister(handle: number): void;
    $registerCompletionSupport(handle: number, pluginInfo: PluginInfo,
        selector: SerializedDocumentFilter[], triggerCharacters: string[], supportsResolveDetails: boolean): void;
    $registerImplementationProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerTypeDefinitionProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerDefinitionProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerDeclarationProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerReferenceProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerSignatureHelpProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], metadata: theia.SignatureHelpProviderMetadata): void;
    $registerHoverProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerEvaluatableExpressionProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerInlineValuesProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $emitInlineValuesEvent(eventHandle: number, event?: any): void;
    $registerDocumentHighlightProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerQuickFixProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], codeActionKinds?: string[], documentation?: CodeActionProviderDocumentation): void;
    $clearDiagnostics(id: string): void;
    $changeDiagnostics(id: string, delta: [string, MarkerData[]][]): void;
    $registerDocumentFormattingSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerDocumentDropEditProvider(handle: number, selector: SerializedDocumentFilter[], metadata?: DocumentDropEditProviderMetadata): void
    $registerRangeFormattingSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerOnTypeFormattingProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], autoFormatTriggerCharacters: string[]): void;
    $registerDocumentLinkProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerCodeLensSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], eventHandle?: number): void;
    $emitCodeLensEvent(eventHandle: number, event?: any): void;
    $registerOutlineSupport(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], displayName?: string): void;
    $registerWorkspaceSymbolProvider(handle: number, pluginInfo: PluginInfo): void;
    $registerFoldingRangeProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], eventHandle?: number): void;
    $emitFoldingRangeEvent(handle: number, event?: any): void;
    $registerSelectionRangeProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerDocumentColorProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[]): void;
    $registerInlayHintsProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], displayName?: string, eventHandle?: number): void;
    $emitInlayHintsEvent(eventHandle: number, event?: any): void;
    $registerRenameProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], supportsResolveInitialValues: boolean): void;
    $registerDocumentSemanticTokensProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[],
        legend: theia.SemanticTokensLegend, eventHandle: number | undefined): void;
    $emitDocumentSemanticTokensEvent(eventHandle: number): void;
    $registerDocumentRangeSemanticTokensProvider(handle: number, pluginInfo: PluginInfo, selector: SerializedDocumentFilter[], legend: theia.SemanticTokensLegend): void;
    $registerCallHierarchyProvider(handle: number, selector: SerializedDocumentFilter[]): void;
    $registerLinkedEditingRangeProvider(handle: number, selector: SerializedDocumentFilter[]): void;
    $registerTypeHierarchyProvider(handle: number, selector: SerializedDocumentFilter[]): void;
    $setLanguageStatus(handle: number, status: LanguageStatus): void;
    $removeLanguageStatus(handle: number): void;
    $registerInlineCompletionsSupport(handle: number, selector: SerializedDocumentFilter[]): void;
}

export interface WebviewInitData {
    webviewResourceRoot: string
    webviewCspSource: string
}

export interface WebviewPanelViewState {
    readonly active: boolean;
    readonly visible: boolean;
    readonly position: number;
}

export interface WebviewsExt {
    $onMessage(handle: string, message: any): void;
    $onDidChangeWebviewPanelViewState(handle: string, newState: WebviewPanelViewState): void;
    $onDidDisposeWebviewPanel(handle: string): PromiseLike<void>;
    $deserializeWebviewPanel(newWebviewHandle: string,
        viewType: string,
        title: string,
        state: any,
        viewState: WebviewPanelViewState,
        options: theia.WebviewOptions & theia.WebviewPanelOptions): PromiseLike<void>;
}

export interface WebviewsMain {
    $createWebviewPanel(handle: string,
        viewType: string,
        title: string,
        showOptions: theia.WebviewPanelShowOptions,
        options: theia.WebviewPanelOptions & theia.WebviewOptions): void;
    $disposeWebview(handle: string): void;
    $reveal(handle: string, showOptions: theia.WebviewPanelShowOptions): void;
    $setTitle(handle: string, value: string): void;
    $setIconPath(handle: string, value: IconUrl | undefined): void;
    $setBadge(handle: string, badge: theia.ViewBadge | undefined): void;
    $setHtml(handle: string, value: string): void;
    $setOptions(handle: string, options: theia.WebviewOptions): void;
    $postMessage(handle: string, value: any): Thenable<boolean>;

    $registerSerializer(viewType: string): void;
    $unregisterSerializer(viewType: string): void;
}

export interface WebviewViewsExt {
    $resolveWebviewView(handle: string,
        viewType: string,
        title: string | undefined,
        state: any,
        cancellation: CancellationToken): Promise<void>;
    $onDidChangeWebviewViewVisibility(handle: string, visible: boolean): void;
    $disposeWebviewView(handle: string): void;
}

export interface WebviewViewsMain extends Disposable {
    $registerWebviewViewProvider(viewType: string,
        options: { retainContextWhenHidden?: boolean, serializeBuffersForPostMessage: boolean }): void;
    $unregisterWebviewViewProvider(viewType: string): void;

    $setWebviewViewTitle(handle: string, value: string | undefined): void;
    $setWebviewViewDescription(handle: string, value: string | undefined): void;
    $setBadge(handle: string, badge: theia.ViewBadge | undefined): void;

    $show(handle: string, preserveFocus: boolean): void;
}

export interface CustomEditorsExt {
    $resolveWebviewEditor(
        resource: UriComponents,
        newWebviewHandle: string,
        viewType: string,
        title: string,
        position: number,
        options: theia.WebviewPanelOptions,
        cancellation: CancellationToken): Promise<void>;
    $createCustomDocument(resource: UriComponents, viewType: string, openContext: theia.CustomDocumentOpenContext, cancellation: CancellationToken): Promise<{ editable: boolean }>;
    $disposeCustomDocument(resource: UriComponents, viewType: string): Promise<void>;
    $undo(resource: UriComponents, viewType: string, editId: number, isDirty: boolean): Promise<void>;
    $redo(resource: UriComponents, viewType: string, editId: number, isDirty: boolean): Promise<void>;
    $revert(resource: UriComponents, viewType: string, cancellation: CancellationToken): Promise<void>;
    $disposeEdits(resourceComponents: UriComponents, viewType: string, editIds: number[]): void;
    $save(resource: UriComponents, viewType: string, cancellation: CancellationToken): Promise<void>;
    $saveAs(resource: UriComponents, viewType: string, targetResource: UriComponents, cancellation: CancellationToken): Promise<void>;
    // $backup(resource: UriComponents, viewType: string, cancellation: CancellationToken): Promise<string>;
    $onMoveCustomEditor(handle: string, newResource: UriComponents, viewType: string): Promise<void>;
}

export interface CustomTextEditorCapabilities {
    readonly supportsMove?: boolean;
}

export interface CustomEditorsMain {
    $registerTextEditorProvider(viewType: string, options: theia.WebviewPanelOptions, capabilities: CustomTextEditorCapabilities): void;
    $registerCustomEditorProvider(viewType: string, options: theia.WebviewPanelOptions, supportsMultipleEditorsPerDocument: boolean): void;
    $unregisterEditorProvider(viewType: string): void;
    $onDidEdit(resource: UriComponents, viewType: string, editId: number, label: string | undefined): void;
    $onContentChange(resource: UriComponents, viewType: string): void;
}

export interface StorageMain {
    $set(key: string, value: KeysToAnyValues, isGlobal: boolean): Promise<boolean>;
    $get(key: string, isGlobal: boolean): Promise<KeysToAnyValues>;
    $getAll(isGlobal: boolean): Promise<KeysToKeysToAnyValue>;
}

export interface StorageExt {
    $updatePluginsWorkspaceData(data: KeysToKeysToAnyValue): void;
}

/**
 * A DebugConfigurationProviderTriggerKind specifies when the `provideDebugConfigurations` method of a `DebugConfigurationProvider` should be called.
 * Currently there are two situations:
 *  (1) providing debug configurations to populate a newly created `launch.json`
 *  (2) providing dynamically generated configurations when the user asks for them through the UI (e.g. via the "Select and Start Debugging" command).
 * A trigger kind is used when registering a `DebugConfigurationProvider` with {@link debug.registerDebugConfigurationProvider}.
 */
export enum DebugConfigurationProviderTriggerKind {
    /**
     * `DebugConfigurationProvider.provideDebugConfigurations` is called to provide the initial debug
     * configurations for a newly created launch.json.
     */
    Initial = 1,
    /**
     * `DebugConfigurationProvider.provideDebugConfigurations` is called to provide dynamically generated debug configurations when the user asks for them through the UI
     * (e.g. via the "Select and Start Debugging" command).
     */
    Dynamic = 2
}

export interface DebugConfigurationProvider {
    readonly handle: number;
    readonly type: string;
    readonly triggerKind: DebugConfigurationProviderTriggerKind;
    provideDebugConfigurations?(folder: string | undefined): Promise<theia.DebugConfiguration[]>;
    resolveDebugConfiguration?(
        folder: string | undefined,
        debugConfiguration: theia.DebugConfiguration
    ): Promise<theia.DebugConfiguration | undefined | null>;
    resolveDebugConfigurationWithSubstitutedVariables?(
        folder: string | undefined,
        debugConfiguration: theia.DebugConfiguration
    ): Promise<theia.DebugConfiguration | undefined | null>;
}

export interface DebugConfigurationProviderDescriptor {
    readonly handle: number,
    readonly type: string,
    readonly trigger: DebugConfigurationProviderTriggerKind,
    readonly provideDebugConfiguration: boolean,
    readonly resolveDebugConfigurations: boolean,
    readonly resolveDebugConfigurationWithSubstitutedVariables: boolean
}

export interface DebugExt {
    $onSessionCustomEvent(sessionId: string, event: string, body?: any): void;
    $breakpointsDidChange(added: Breakpoint[], removed: string[], changed: Breakpoint[]): void;
    $sessionDidCreate(sessionId: string): void;
    $sessionDidStart(sessionId: string): void;
    $sessionDidDestroy(sessionId: string): void;
    $sessionDidChange(sessionId: string | undefined): void;
    $provideDebugConfigurationsByHandle(handle: number, workspaceFolder: string | undefined): Promise<theia.DebugConfiguration[]>;
    $resolveDebugConfigurationByHandle(
        handle: number,
        workspaceFolder: string | undefined,
        debugConfiguration: theia.DebugConfiguration
    ): Promise<theia.DebugConfiguration | undefined | null>;
    $resolveDebugConfigurationWithSubstitutedVariablesByHandle(
        handle: number,
        workspaceFolder: string | undefined,
        debugConfiguration: DebugConfiguration
    ): Promise<theia.DebugConfiguration | undefined | null>;

    $onDidChangeActiveFrame(frame: DebugStackFrameDTO | undefined): void;
    $onDidChangeActiveThread(thread: DebugThreadDTO | undefined): void;
    $createDebugSession(debugConfiguration: DebugConfiguration, workspaceFolder: string | undefined): Promise<string>;
    $terminateDebugSession(sessionId: string): Promise<void>;
    $getTerminalCreationOptions(debugType: string): Promise<TerminalOptionsExt | undefined>;
}

export interface DebugMain {
    $appendToDebugConsole(value: string): Promise<void>;
    $appendLineToDebugConsole(value: string): Promise<void>;
    $registerDebuggerContribution(description: DebuggerDescription): Promise<void>;
    $unregisterDebuggerConfiguration(debugType: string): Promise<void>;
    $registerDebugConfigurationProvider(description: DebugConfigurationProviderDescriptor): void;
    $unregisterDebugConfigurationProvider(handle: number): Promise<void>;
    $addBreakpoints(breakpoints: Breakpoint[]): Promise<void>;
    $removeBreakpoints(breakpoints: string[]): Promise<void>;
    $startDebugging(folder: theia.WorkspaceFolder | undefined, nameOrConfiguration: string | theia.DebugConfiguration, options: DebugSessionOptions): Promise<boolean>;
    $stopDebugging(sessionId?: string): Promise<void>;
    $customRequest(sessionId: string, command: string, args?: any): Promise<DebugProtocol.Response>;
    $getDebugProtocolBreakpoint(sessionId: string, breakpointId: string): Promise<theia.DebugProtocolBreakpoint | undefined>;
}

export interface FileSystemExt {
    $acceptProviderInfos(scheme: string, capabilities?: files.FileSystemProviderCapabilities): void;
    $stat(handle: number, resource: UriComponents): Promise<files.Stat>;
    $readdir(handle: number, resource: UriComponents): Promise<[string, files.FileType][]>;
    $readFile(handle: number, resource: UriComponents): Promise<BinaryBuffer>;
    $writeFile(handle: number, resource: UriComponents, content: BinaryBuffer, opts: files.FileWriteOptions): Promise<void>;
    $rename(handle: number, resource: UriComponents, target: UriComponents, opts: files.FileOverwriteOptions): Promise<void>;
    $copy(handle: number, resource: UriComponents, target: UriComponents, opts: files.FileOverwriteOptions): Promise<void>;
    $mkdir(handle: number, resource: UriComponents): Promise<void>;
    $delete(handle: number, resource: UriComponents, opts: files.FileDeleteOptions): Promise<void>;
    $watch(handle: number, session: number, resource: UriComponents, opts: files.WatchOptions): void;
    $unwatch(handle: number, session: number): void;
    $open(handle: number, resource: UriComponents, opts: files.FileOpenOptions): Promise<number>;
    $close(handle: number, fd: number): Promise<void>;
    $read(handle: number, fd: number, pos: number, length: number): Promise<BinaryBuffer>;
    $write(handle: number, fd: number, pos: number, data: BinaryBuffer): Promise<number>;
}

export interface IFileChangeDto {
    resource: UriComponents;
    type: files.FileChangeType;
}

export interface FileSystemMain {
    $registerFileSystemProvider(handle: number, scheme: string, capabilities: files.FileSystemProviderCapabilities, readonlyMessage?: MarkdownString): void;
    $unregisterProvider(handle: number): void;
    $onFileSystemChange(handle: number, resource: IFileChangeDto[]): void;

    $stat(uri: UriComponents): Promise<files.Stat>;
    $readdir(resource: UriComponents): Promise<[string, files.FileType][]>;
    $readFile(resource: UriComponents): Promise<BinaryBuffer>;
    $writeFile(resource: UriComponents, content: BinaryBuffer): Promise<void>;
    $rename(resource: UriComponents, target: UriComponents, opts: files.FileOverwriteOptions): Promise<void>;
    $copy(resource: UriComponents, target: UriComponents, opts: files.FileOverwriteOptions): Promise<void>;
    $mkdir(resource: UriComponents): Promise<void>;
    $delete(resource: UriComponents, opts: files.FileDeleteOptions): Promise<void>;
}

export interface FileSystemEvents {
    created: UriComponents[];
    changed: UriComponents[];
    deleted: UriComponents[];
}

export interface ExtHostFileSystemEventServiceShape {
    $onFileEvent(events: FileSystemEvents): void;
    $onWillRunFileOperation(operation: files.FileOperation, target: UriComponents, source: UriComponents | undefined, timeout: number, token: CancellationToken): Promise<any>;
    $onDidRunFileOperation(operation: files.FileOperation, target: UriComponents, source: UriComponents | undefined): void;
}

export interface ClipboardMain {
    $readText(): Promise<string>;
    $writeText(value: string): Promise<void>;
}

export interface CommentsExt {
    $createCommentThreadTemplate(commentControllerHandle: number, uriComponents: UriComponents, range: Range): void;
    $updateCommentThreadTemplate(commentControllerHandle: number, threadHandle: number, range: Range): Promise<void>;
    $deleteCommentThread(commentControllerHandle: number, commentThreadHandle: number): Promise<void>;
    $provideCommentingRanges(commentControllerHandle: number, uriComponents: UriComponents, token: CancellationToken): Promise<Range[] | undefined>;
}

export interface CommentProviderFeatures {
    options?: CommentOptions;
}

export type CommentThreadChanges = Partial<{
    range: Range,
    label: string,
    contextValue: string,
    comments: Comment[],
    collapseState: CommentThreadCollapsibleState;
    state: CommentThreadState;
    canReply: boolean;
}>;

export interface CommentsMain {
    $registerCommentController(handle: number, id: string, label: string): void;
    $unregisterCommentController(handle: number): void;
    $updateCommentControllerFeatures(handle: number, features: CommentProviderFeatures): void;
    $createCommentThread(handle: number, commentThreadHandle: number, threadId: string, resource: UriComponents, range: Range, extensionId: string): CommentThread | undefined;
    $updateCommentThread(handle: number, commentThreadHandle: number, threadId: string, resource: UriComponents, changes: CommentThreadChanges): void;
    $deleteCommentThread(handle: number, commentThreadHandle: number): void;
    $onDidCommentThreadsChange(handle: number, event: CommentThreadChangedEvent): void;
}

// #region

export const enum TabInputKind {
    UnknownInput,
    TextInput,
    TextDiffInput,
    TextMergeInput,
    NotebookInput,
    NotebookDiffInput,
    CustomEditorInput,
    WebviewEditorInput,
    TerminalEditorInput,
    InteractiveEditorInput,
}

export interface UnknownInputDto {
    kind: TabInputKind.UnknownInput;
}

export interface TextInputDto {
    kind: TabInputKind.TextInput;
    uri: UriComponents;
}

export interface TextDiffInputDto {
    kind: TabInputKind.TextDiffInput;
    original: UriComponents;
    modified: UriComponents;
}

export interface TextMergeInputDto {
    kind: TabInputKind.TextMergeInput;
    base: UriComponents;
    input1: UriComponents;
    input2: UriComponents;
    result: UriComponents;
}

export interface NotebookInputDto {
    kind: TabInputKind.NotebookInput;
    notebookType: string;
    uri: UriComponents;
}

export interface NotebookDiffInputDto {
    kind: TabInputKind.NotebookDiffInput;
    notebookType: string;
    original: UriComponents;
    modified: UriComponents;
}

export interface CustomInputDto {
    kind: TabInputKind.CustomEditorInput;
    viewType: string;
    uri: UriComponents;
}

export interface WebviewInputDto {
    kind: TabInputKind.WebviewEditorInput;
    viewType: string;
}

export interface InteractiveEditorInputDto {
    kind: TabInputKind.InteractiveEditorInput;
    uri: UriComponents;
    inputBoxUri: UriComponents;
}

export interface TabInputDto {
    kind: TabInputKind.TerminalEditorInput;
}

export type EditorGroupColumn = number;
export type AnyInputDto = UnknownInputDto | TextInputDto | TextDiffInputDto | TextMergeInputDto | NotebookInputDto | NotebookDiffInputDto | CustomInputDto | WebviewInputDto | InteractiveEditorInputDto | TabInputDto;

export interface TabGroupDto {
    isActive: boolean;
    viewColumn: EditorGroupColumn;
    tabs: TabDto[];
    groupId: number;
}

export const enum TabModelOperationKind {
    TAB_OPEN,
    TAB_CLOSE,
    TAB_UPDATE,
    TAB_MOVE
}

export interface TabOperation {
    readonly kind: TabModelOperationKind.TAB_OPEN | TabModelOperationKind.TAB_CLOSE | TabModelOperationKind.TAB_UPDATE | TabModelOperationKind.TAB_MOVE;
    readonly index: number;
    readonly tabDto: TabDto;
    readonly groupId: number;
    readonly oldIndex?: number;
}

export interface TabDto {
    id: string;
    label: string;
    input: AnyInputDto;
    editorId?: string;
    isActive: boolean;
    isPinned: boolean;
    isPreview: boolean;
    isDirty: boolean;
}

export interface TabsExt {
    $acceptEditorTabModel(tabGroups: TabGroupDto[]): void;
    $acceptTabGroupUpdate(groupDto: TabGroupDto): void;
    $acceptTabOperation(operation: TabOperation): void;
}

export interface TabsMain {
    $moveTab(tabId: string, index: number, viewColumn: EditorGroupColumn, preserveFocus?: boolean): void;
    $closeTab(tabIds: string[], preserveFocus?: boolean): Promise<boolean>;
    $closeGroup(groupIds: number[], preserveFocus?: boolean): Promise<boolean>;
}

export interface TelemetryMain {
}

export interface TelemetryExt {
}

// endregion

// based from https://github.com/microsoft/vscode/blob/1.72.2/src/vs/workbench/api/common/extHostTesting.ts
export const enum TestingResourceExt {
    Workspace,
    TextDocument
}

// based from https://github.com/microsoft/vscode/blob/1.72.2/src/vs/workbench/api/common/extHostTesting.ts
export interface TestingExt {
    $onCancelTestRun(controllerId: string, runId: string): void;
    /** Configures a test run config. */
    $onConfigureRunProfile(controllerId: string, profileId: string): void;

    /** Sets the default on a given run profile */
    $onDidChangeDefault(controllerId: string, profileId: string, isDefault: boolean): void;

    $onRunControllerTests(reqs: TestRunRequestDTO[]): void;

    /** Asks the controller to refresh its tests */
    $refreshTests(controllerId: string, token: CancellationToken): Promise<void>;

    $onResolveChildren(controllerId: string, path: string[]): void;
}

// based from https://github.com/microsoft/vscode/blob/1.85.1/src/vs/workbench/api/common/extHostUrls.ts
export interface UriExt {
    registerUriHandler(handler: theia.UriHandler, plugin: PluginInfo): theia.Disposable;
    $handleExternalUri(uri: UriComponents): Promise<void>;
}

export interface UriMain {
    $registerUriHandler(extensionId: string, extensionName: string): void;
    $unregisterUriHandler(extensionId: string): void;
}

export interface TestControllerUpdate {
    label: string;
    canRefresh: boolean;
    canResolve: boolean;
}

// based from https://github.com/microsoft/vscode/blob/1.72.2/src/vs/workbench/api/common/extHostTesting.ts
export interface TestingMain {
    // --- test lifecycle:

    /** Registers that there's a test controller with the given ID */
    $registerTestController(controllerId: string, label: string): void;
    /** Updates the label of an existing test controller. */
    $updateController(controllerId: string, patch: Partial<TestControllerUpdate>): void;
    /** Disposes of the test controller with the given ID */
    $unregisterTestController(controllerId: string): void;
    $notifyDelta(controllerId: string, diff: TreeDelta<string, TestItemDTO>[]): void;

    // --- test run configurations:

    /** Called when a new test run profile is available */
    $notifyTestRunProfileCreated(controllerId: string, profile: TestRunProfileDTO): void;
    /** Updates an existing test run profile */
    $updateTestRunProfile(controllerId: string, profileId: string, update: Partial<TestRunProfileDTO>): void;
    /** Removes a previously-published test run profile */
    $removeTestRunProfile(controllerId: string, profileId: string): void;

    // Test runs

    $notifyTestRunCreated(controllerId: string, run: TestRunDTO, preserveFocus: boolean): void;
    $notifyTestStateChanged(controllerId: string, runId: string, stateChanges: TestStateChangeDTO[], outputChanges: TestOutputDTO[]): void;
    $notifyTestRunEnded(controllerId: string, runId: string): void;
}

export const PLUGIN_RPC_CONTEXT = {
    LOGGER_MAIN: createProxyIdentifier<LoggerMain>('LoggerMain'),
    AUTHENTICATION_MAIN: createProxyIdentifier<AuthenticationMain>('AuthenticationMain'),
    COMMAND_REGISTRY_MAIN: createProxyIdentifier<CommandRegistryMain>('CommandRegistryMain'),
    QUICK_OPEN_MAIN: createProxyIdentifier<QuickOpenMain>('QuickOpenMain'),
    DIALOGS_MAIN: createProxyIdentifier<DialogsMain>('DialogsMain'),
    WORKSPACE_MAIN: createProxyIdentifier<WorkspaceMain>('WorkspaceMain'),
    MESSAGE_REGISTRY_MAIN: <ProxyIdentifier<MessageRegistryMain>>createProxyIdentifier<MessageRegistryMain>('MessageRegistryMain'),
    TEXT_EDITORS_MAIN: createProxyIdentifier<TextEditorsMain>('TextEditorsMain'),
    DOCUMENTS_MAIN: createProxyIdentifier<DocumentsMain>('DocumentsMain'),
    NOTEBOOKS_MAIN: createProxyIdentifier<NotebooksMain>('NotebooksMain'),
    NOTEBOOK_DOCUMENTS_MAIN: createProxyIdentifier<NotebookDocumentsMain>('NotebookDocumentsMain'),
    NOTEBOOK_EDITORS_MAIN: createProxyIdentifier<NotebookEditorsMain>('NotebookEditorsMain'),
    NOTEBOOK_DOCUMENTS_AND_EDITORS_MAIN: createProxyIdentifier<NotebookDocumentsAndEditorsMain>('NotebooksAndEditorsMain'),
    NOTEBOOK_RENDERERS_MAIN: createProxyIdentifier<NotebookRenderersMain>('NotebookRenderersMain'),
    NOTEBOOK_KERNELS_MAIN: createProxyIdentifier<NotebookKernelsMain>('NotebookKernelsMain'),
    STATUS_BAR_MESSAGE_REGISTRY_MAIN: <ProxyIdentifier<StatusBarMessageRegistryMain>>createProxyIdentifier<StatusBarMessageRegistryMain>('StatusBarMessageRegistryMain'),
    ENV_MAIN: createProxyIdentifier<EnvMain>('EnvMain'),
    NOTIFICATION_MAIN: createProxyIdentifier<NotificationMain>('NotificationMain'),
    TERMINAL_MAIN: createProxyIdentifier<TerminalServiceMain>('TerminalServiceMain'),
    TREE_VIEWS_MAIN: createProxyIdentifier<TreeViewsMain>('TreeViewsMain'),
    PREFERENCE_REGISTRY_MAIN: createProxyIdentifier<PreferenceRegistryMain>('PreferenceRegistryMain'),
    OUTPUT_CHANNEL_REGISTRY_MAIN: <ProxyIdentifier<OutputChannelRegistryMain>>createProxyIdentifier<OutputChannelRegistryMain>('OutputChannelRegistryMain'),
    LANGUAGES_MAIN: createProxyIdentifier<LanguagesMain>('LanguagesMain'),
    CONNECTION_MAIN: createProxyIdentifier<ConnectionMain>('ConnectionMain'),
    WEBVIEWS_MAIN: createProxyIdentifier<WebviewsMain>('WebviewsMain'),
    CUSTOM_EDITORS_MAIN: createProxyIdentifier<CustomEditorsMain>('CustomEditorsMain'),
    WEBVIEW_VIEWS_MAIN: createProxyIdentifier<WebviewViewsMain>('WebviewViewsMain'),
    STORAGE_MAIN: createProxyIdentifier<StorageMain>('StorageMain'),
    TASKS_MAIN: createProxyIdentifier<TasksMain>('TasksMain'),
    DEBUG_MAIN: createProxyIdentifier<DebugMain>('DebugMain'),
    FILE_SYSTEM_MAIN: createProxyIdentifier<FileSystemMain>('FileSystemMain'),
    SCM_MAIN: createProxyIdentifier<ScmMain>('ScmMain'),
    SECRETS_MAIN: createProxyIdentifier<SecretsMain>('SecretsMain'),
    DECORATIONS_MAIN: createProxyIdentifier<DecorationsMain>('DecorationsMain'),
    WINDOW_MAIN: createProxyIdentifier<WindowMain>('WindowMain'),
    CLIPBOARD_MAIN: createProxyIdentifier<ClipboardMain>('ClipboardMain'),
    LABEL_SERVICE_MAIN: createProxyIdentifier<LabelServiceMain>('LabelServiceMain'),
    TIMELINE_MAIN: createProxyIdentifier<TimelineMain>('TimelineMain'),
    THEMING_MAIN: createProxyIdentifier<ThemingMain>('ThemingMain'),
    COMMENTS_MAIN: createProxyIdentifier<CommentsMain>('CommentsMain'),
    TABS_MAIN: createProxyIdentifier<TabsMain>('TabsMain'),
    TELEMETRY_MAIN: createProxyIdentifier<TelemetryMain>('TelemetryMain'),
    LOCALIZATION_MAIN: createProxyIdentifier<LocalizationMain>('LocalizationMain'),
    TESTING_MAIN: createProxyIdentifier<TestingMain>('TestingMain'),
    URI_MAIN: createProxyIdentifier<UriMain>('UriMain')
};

export const MAIN_RPC_CONTEXT = {
    AUTHENTICATION_EXT: createProxyIdentifier<AuthenticationExt>('AuthenticationExt'),
    HOSTED_PLUGIN_MANAGER_EXT: createProxyIdentifier<PluginManagerExt>('PluginManagerExt'),
    COMMAND_REGISTRY_EXT: createProxyIdentifier<CommandRegistryExt>('CommandRegistryExt'),
    QUICK_OPEN_EXT: createProxyIdentifier<QuickOpenExt>('QuickOpenExt'),
    WINDOW_STATE_EXT: createProxyIdentifier<WindowStateExt>('WindowStateExt'),
    NOTIFICATION_EXT: createProxyIdentifier<NotificationExt>('NotificationExt'),
    WORKSPACE_EXT: createProxyIdentifier<WorkspaceExt>('WorkspaceExt'),
    TEXT_EDITORS_EXT: createProxyIdentifier<TextEditorsExt>('TextEditorsExt'),
    EDITORS_AND_DOCUMENTS_EXT: createProxyIdentifier<EditorsAndDocumentsExt>('EditorsAndDocumentsExt'),
    DOCUMENTS_EXT: createProxyIdentifier<DocumentsExt>('DocumentsExt'),
    NOTEBOOKS_EXT: createProxyIdentifier<NotebooksExt>('NotebooksExt'),
    NOTEBOOK_DOCUMENTS_EXT: createProxyIdentifier<NotebookDocumentsExt>('NotebookDocumentsExt'),
    NOTEBOOK_EDITORS_EXT: createProxyIdentifier<NotebookEditorsExt>('NotebookEditorsExt'),
    NOTEBOOK_RENDERERS_EXT: createProxyIdentifier<NotebookRenderersExt>('NotebooksRenderersExt'),
    NOTEBOOK_KERNELS_EXT: createProxyIdentifier<NotebookKernelsExt>('NotebookKernelsExt'),
    TERMINAL_EXT: createProxyIdentifier<TerminalServiceExt>('TerminalServiceExt'),
    OUTPUT_CHANNEL_REGISTRY_EXT: createProxyIdentifier<OutputChannelRegistryExt>('OutputChannelRegistryExt'),
    TREE_VIEWS_EXT: createProxyIdentifier<TreeViewsExt>('TreeViewsExt'),
    PREFERENCE_REGISTRY_EXT: createProxyIdentifier<PreferenceRegistryExt>('PreferenceRegistryExt'),
    LANGUAGES_EXT: createProxyIdentifier<LanguagesExt>('LanguagesExt'),
    CONNECTION_EXT: createProxyIdentifier<ConnectionExt>('ConnectionExt'),
    WEBVIEWS_EXT: createProxyIdentifier<WebviewsExt>('WebviewsExt'),
    CUSTOM_EDITORS_EXT: createProxyIdentifier<CustomEditorsExt>('CustomEditorsExt'),
    WEBVIEW_VIEWS_EXT: createProxyIdentifier<WebviewViewsExt>('WebviewViewsExt'),
    STORAGE_EXT: createProxyIdentifier<StorageExt>('StorageExt'),
    TASKS_EXT: createProxyIdentifier<TasksExt>('TasksExt'),
    DEBUG_EXT: createProxyIdentifier<DebugExt>('DebugExt'),
    FILE_SYSTEM_EXT: createProxyIdentifier<FileSystemExt>('FileSystemExt'),
    ExtHostFileSystemEventService: createProxyIdentifier<ExtHostFileSystemEventServiceShape>('ExtHostFileSystemEventService'),
    SCM_EXT: createProxyIdentifier<ScmExt>('ScmExt'),
    SECRETS_EXT: createProxyIdentifier<SecretsExt>('SecretsExt'),
    DECORATIONS_EXT: createProxyIdentifier<DecorationsExt>('DecorationsExt'),
    LABEL_SERVICE_EXT: createProxyIdentifier<LabelServiceExt>('LabelServiceExt'),
    TIMELINE_EXT: createProxyIdentifier<TimelineExt>('TimeLineExt'),
    THEMING_EXT: createProxyIdentifier<ThemingExt>('ThemingExt'),
    COMMENTS_EXT: createProxyIdentifier<CommentsExt>('CommentsExt'),
    TABS_EXT: createProxyIdentifier<TabsExt>('TabsExt'),
    TELEMETRY_EXT: createProxyIdentifier<TelemetryExt>('TelemetryExt)'),
    TESTING_EXT: createProxyIdentifier<TestingExt>('TestingExt'),
    URI_EXT: createProxyIdentifier<UriExt>('UriExt')
};

export interface TasksExt {
    $initLoadedTasks(executions: TaskExecutionDto[]): Promise<void>;
    $provideTasks(handle: number): Promise<TaskDto[]>;
    $resolveTask(handle: number, task: TaskDto, token?: CancellationToken): Promise<TaskDto>;
    $onDidStartTask(execution: TaskExecutionDto, terminalId: number): void;
    $onDidEndTask(id: number): void;
    $onDidStartTaskProcess(processId: number | undefined, execution: TaskExecutionDto): void;
    $onDidEndTaskProcess(exitCode: number | undefined, taskId: number): void;
}

export interface TasksMain {
    $registerTaskProvider(handle: number, type: string): void;
    $fetchTasks(taskVersion: string | undefined, taskType: string | undefined): Promise<TaskDto[]>;
    $executeTask(taskDto: TaskDto): Promise<TaskExecutionDto | undefined>;
    $taskExecutions(): Promise<TaskExecutionDto[]>;
    $unregister(handle: number): void;
    $terminateTask(id: number): void;
    $customExecutionComplete(id: number, exitCode: number | undefined): void;
}

export interface AuthenticationExt {
    $getSessions(providerId: string, scopes: string[] | undefined, options: theia.AuthenticationProviderSessionOptions): Promise<ReadonlyArray<theia.AuthenticationSession>>;
    $createSession(id: string, scopes: string[], options: theia.AuthenticationProviderSessionOptions): Promise<theia.AuthenticationSession>;
    $removeSession(id: string, sessionId: string): Promise<void>;
    $onDidChangeAuthenticationSessions(provider: theia.AuthenticationProviderInformation): Promise<void>;
}

export interface AuthenticationMain {
    $getAccounts(providerId: string): Thenable<readonly theia.AuthenticationSessionAccountInformation[]>;
    $registerAuthenticationProvider(id: string, label: string, supportsMultipleAccounts: boolean): void;
    $unregisterAuthenticationProvider(id: string): void;
    $onDidChangeSessions(providerId: string, event: AuthenticationProviderAuthenticationSessionsChangeEvent): void;
    $getSession(providerId: string, scopes: readonly string[], extensionId: string, extensionName: string,
        options: theia.AuthenticationGetSessionOptions): Promise<theia.AuthenticationSession | undefined>;
}

export interface NotebookOutputItemDto {
    readonly mime: string;
    readonly valueBytes: BinaryBuffer;
}

export interface NotebookOutputDto {
    outputId: string;
    items: NotebookOutputItemDto[];
    metadata?: Record<string, unknown>;
}

export interface NotebookCellDataDto {
    source: string;
    language: string;
    cellKind: notebookCommon.CellKind;
    outputs: NotebookOutputDto[];
    metadata?: notebookCommon.NotebookCellMetadata;
    internalMetadata?: notebookCommon.NotebookCellInternalMetadata;
}

export interface NotebookDataDto {
    readonly cells: NotebookCellDataDto[];
    readonly metadata: notebookCommon.NotebookDocumentMetadata;
}

export interface NotebookCellDto {
    handle: number;
    uri: UriComponents;
    eol: string;
    source: string[];
    language: string;
    mime?: string;
    cellKind: notebookCommon.CellKind;
    outputs: NotebookOutputDto[];
    metadata?: notebookCommon.NotebookCellMetadata;
    internalMetadata?: notebookCommon.NotebookCellInternalMetadata;
}

export interface NotebookModelAddedData {
    uri: UriComponents;
    versionId: number;
    cells: NotebookCellDto[];
    viewType: string;
    metadata?: notebookCommon.NotebookDocumentMetadata;
}

export interface NotebookEditorAddData {
    id: string;
    documentUri: UriComponents;
    selections: CellRange[];
    visibleRanges: CellRange[];
    viewColumn?: number;
}

export interface NotebookDocumentsAndEditorsDelta {
    removedDocuments?: UriComponents[];
    addedDocuments?: NotebookModelAddedData[];
    removedEditors?: string[];
    addedEditors?: NotebookEditorAddData[];
    newActiveEditor?: string | null;
    visibleEditors?: string[];
}

export type NotebookCellStatusBarEntryDto = notebookCommon.NotebookCellStatusBarItem;

export interface NotebookCellStatusBarListDto {
    items: NotebookCellStatusBarEntryDto[];
    cacheId: number;
}

export type NotebookRawContentEventDto =
    // notebookCommon.NotebookCellsInitializeEvent<NotebookCellDto>
    | {

        readonly kind: notebookCommon.NotebookCellsChangeType.ModelChange;
        readonly changes: notebookCommon.NotebookCellTextModelSplice<NotebookCellDto>[];
    }
    | {
        readonly kind: notebookCommon.NotebookCellsChangeType.Move;
        readonly index: number;
        readonly length: number;
        readonly newIdx: number;
    }
    | {
        readonly kind: notebookCommon.NotebookCellsChangeType.Output;
        readonly index: number;
        readonly outputs: NotebookOutputDto[];
    }
    | {
        readonly kind: notebookCommon.NotebookCellsChangeType.OutputItem;
        readonly index: number;
        readonly outputId: string;
        readonly outputItems: NotebookOutputItemDto[];
        readonly append: boolean;
    }
    | {
        readonly kind: notebookCommon.NotebookCellsChangeType.ChangeDocumentMetadata
        readonly metadata: notebookCommon.NotebookDocumentMetadata;
    }
    | notebookCommon.NotebookCellsChangeLanguageEvent
    | notebookCommon.NotebookCellsChangeMetadataEvent
    | notebookCommon.NotebookCellsChangeInternalMetadataEvent
    | notebookCommon.NotebookCellContentChangeEvent
    ;

export interface NotebookCellsChangedEventDto {
    readonly rawEvents: NotebookRawContentEventDto[];
    readonly versionId: number;
};

export interface NotebookSelectionChangeEvent {
    selections: CellRange[];
}

export interface NotebookVisibleRangesEvent {
    ranges: CellRange[];
}

export interface NotebookEditorPropertiesChangeData {
    visibleRanges?: NotebookVisibleRangesEvent;
    selections?: NotebookSelectionChangeEvent;
}

export enum NotebookEditorRevealType {
    Default = 0,
    InCenter = 1,
    InCenterIfOutsideViewport = 2,
    AtTop = 3
}

export interface NotebookDocumentShowOptions {
    position?: EditorGroupColumn;
    preserveFocus?: boolean;
    pinned?: boolean;
    selections?: CellRange[];
}

export interface NotebookKernelDto {
    id: string;
    notebookType: string;
    extensionId: string;
    extensionLocation: UriComponents;
    label: string;
    detail?: string;
    description?: string;
    supportedLanguages?: string[];
    supportsInterrupt?: boolean;
    supportsExecutionOrder?: boolean;
    preloads?: { uri: UriComponents; provides: readonly string[] }[];
    rendererScripts?: NotebookRendererScript[];
}

export type CellExecuteUpdateDto = CellExecuteOutputEditDto | CellExecuteOutputItemEditDto | CellExecutionStateUpdateDto;

export interface CellExecuteOutputEditDto {
    editType: CellExecutionUpdateType.Output;
    cellHandle: number;
    append?: boolean;
    outputs: NotebookOutputDto[];
}

export interface CellExecuteOutputItemEditDto {
    editType: CellExecutionUpdateType.OutputItems;
    append?: boolean;
    outputId: string;
    items: NotebookOutputItemDto[];
}

export interface CellExecutionStateUpdateDto {
    editType: CellExecutionUpdateType.ExecutionState;
    executionOrder?: number;
    runStartTime?: number;
    didPause?: boolean;
    isPaused?: boolean;
}

export interface CellExecutionCompleteDto {
    runEndTime?: number;
    lastRunSuccess?: boolean;
}

export interface NotebookKernelSourceActionDto {
    readonly label: string;
    readonly description?: string;
    readonly detail?: string;
    readonly command?: string | Command;
    readonly documentation?: UriComponents | string;
}

export interface NotebookEditorAddData {
    id: string;
    documentUri: UriComponents;
    selections: CellRange[];
    visibleRanges: CellRange[];
    viewColumn?: number;
}

export interface NotebooksExt extends NotebookDocumentsAndEditorsExt {
    $provideNotebookCellStatusBarItems(handle: number, uri: UriComponents, index: number, token: CancellationToken): Promise<NotebookCellStatusBarListDto | undefined>;
    $releaseNotebookCellStatusBarItems(id: number): void;

    $dataToNotebook(handle: number, data: BinaryBuffer, token: CancellationToken): Promise<NotebookDataDto>;
    $notebookToData(handle: number, data: NotebookDataDto, token: CancellationToken): Promise<BinaryBuffer>;
}

export interface NotebooksMain extends Disposable {
    $registerNotebookSerializer(handle: number, viewType: string, options: notebookCommon.TransientOptions): void;
    $unregisterNotebookSerializer(handle: number): void;

    $registerNotebookCellStatusBarItemProvider(handle: number, eventHandle: number | undefined, viewType: string): Promise<void>;
    $unregisterNotebookCellStatusBarItemProvider(handle: number, eventHandle: number | undefined): Promise<void>;
    $emitCellStatusBarEvent(eventHandle: number): void;
}

export interface NotebookKernelsExt {
    $acceptNotebookAssociation(handle: number, uri: UriComponents, value: boolean): void;
    $executeCells(handle: number, uri: UriComponents, handles: number[]): Promise<void>;
    $cancelCells(handle: number, uri: UriComponents, handles: number[]): Promise<void>;
    $acceptKernelMessageFromRenderer(handle: number, editorId: string, message: any): void;
    $cellExecutionChanged(uri: UriComponents, cellHandle: number, state: NotebookCellExecutionState | undefined): void;
    $provideKernelSourceActions(handle: number, token: CancellationToken): Promise<NotebookKernelSourceActionDto[]>;
}

export interface NotebookKernelsMain extends Disposable {
    $postMessage(handle: number, editorId: string | undefined, message: any): Promise<boolean>;
    $addKernel(handle: number, data: NotebookKernelDto): Promise<void>;
    $updateKernel(handle: number, data: Partial<NotebookKernelDto>): void;
    $removeKernel(handle: number): void;
    $updateNotebookPriority(handle: number, uri: UriComponents, value: number | undefined): void;

    $createExecution(handle: number, controllerId: string, uri: UriComponents, cellHandle: number): void;
    $updateExecution(handle: number, data: CellExecuteUpdateDto[]): void;
    $completeExecution(handle: number, data: CellExecutionCompleteDto): void;

    $createNotebookExecution(handle: number, controllerId: string, uri: UriComponents): void;
    $beginNotebookExecution(handle: number): void;
    $completeNotebookExecution(handle: number): void;

    $addKernelDetectionTask(handle: number, notebookType: string): Promise<void>;
    $removeKernelDetectionTask(handle: number): void;

    $addKernelSourceActionProvider(handle: number, eventHandle: number, notebookType: string): Promise<void>;
    $removeKernelSourceActionProvider(handle: number, eventHandle: number): void;
    $emitNotebookKernelSourceActionsChangeEvent(eventHandle: number): void;
}

export interface NotebookDocumentsMain extends Disposable {
    $tryCreateNotebook(options: { viewType: string; content?: NotebookDataDto }): Promise<UriComponents>;
    $tryOpenNotebook(uriComponents: UriComponents): Promise<UriComponents>;
    $trySaveNotebook(uri: UriComponents): Promise<boolean>;
}

export interface NotebookDocumentsExt {
    $acceptModelChanged(uriComponents: UriComponents, event: NotebookCellsChangedEventDto, isDirty: boolean, newMetadata?: notebookCommon.NotebookDocumentMetadata): void;
    $acceptDirtyStateChanged(uriComponents: UriComponents, isDirty: boolean): void;
    $acceptModelSaved(uriComponents: UriComponents): void;
}

export interface NotebookDocumentsAndEditorsExt {
    $acceptDocumentsAndEditorsDelta(delta: NotebookDocumentsAndEditorsDelta): Promise<void>;
    $acceptActiveCellEditorChange(newActiveEditor: string | null): void;
}

export interface NotebookDocumentsAndEditorsMain extends Disposable {
}

export type NotebookEditorViewColumnInfo = Record<string, number>;

export interface NotebookEditorsExt {
    $acceptEditorPropertiesChanged(id: string, data: NotebookEditorPropertiesChangeData): void;
    $acceptEditorViewColumns(data: NotebookEditorViewColumnInfo): void;
}

export interface NotebookEditorsMain extends Disposable {
    $tryShowNotebookDocument(uriComponents: UriComponents, viewType: string, options: NotebookDocumentShowOptions): Promise<string>;
    $tryRevealRange(id: string, range: CellRange, revealType: NotebookEditorRevealType): Promise<void>;
    $trySetSelections(id: string, range: CellRange[]): void;
}
export interface NotebookRenderersExt {
    $postRendererMessage(editorId: string, rendererId: string, message: unknown): void;
}

export interface NotebookRenderersMain extends Disposable {
    $postMessage(editorId: string | undefined, rendererId: string, message: unknown): Promise<boolean>;
}

export interface RawColorInfo {
    color: [number, number, number, number];
    range: Range;
}

export interface LabelServiceExt {
    $registerResourceLabelFormatter(formatter: ResourceLabelFormatter): theia.Disposable;
}

export interface LabelServiceMain {
    $registerResourceLabelFormatter(handle: number, formatter: ResourceLabelFormatter): void;
    $unregisterResourceLabelFormatter(handle: number): void;
}

export interface SecretsExt {
    $onDidChangePassword(e: { extensionId: string, key: string }): Promise<void>;
}

export interface SecretsMain {
    $getPassword(extensionId: string, key: string): Promise<string | undefined>;
    $setPassword(extensionId: string, key: string, value: string): Promise<void>;
    $deletePassword(extensionId: string, key: string): Promise<void>;
}

export type InlayHintDto = CachedSessionItem<InlayHint>;
export type InlayHintsDto = CachedSession<{ hints: InlayHint[] }>;

export interface IdentifiableInlineCompletions extends InlineCompletions<IdentifiableInlineCompletion> {
    pid: number;
}

export interface IdentifiableInlineCompletion extends InlineCompletion {
    idx: number;
}

export const LocalizationExt = Symbol('LocalizationExt');
export interface LocalizationExt {
    translateMessage(pluginId: string, details: StringDetails): string;
    getBundle(pluginId: string): Record<string, string> | undefined;
    getBundleUri(pluginId: string): theia.Uri | undefined;
    initializeLocalizedMessages(plugin: Plugin, currentLanguage: string): Promise<void>;
}

export interface StringDetails {
    message: string;
    args?: Record<string | number, any>;
    comment?: string | string[];
}

export interface LocalizationMain {
    $fetchBundle(id: string): Promise<LanguagePackBundle | undefined>;
}

export enum LogLevel {
    Trace = 1,
    Debug = 2,
    Info = 3,
    Warn = 4,
    Error = 5
}

export interface LoggerMain {
    $log(level: LogLevel, name: string | undefined, message: string, params: any[]): void;
}
