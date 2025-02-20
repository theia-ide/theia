// *****************************************************************************
// Copyright (C) 2024 EclipseSource GmbH.
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
// Partially copied from https://github.com/microsoft/vscode/blob/a2cab7255c0df424027be05d58e1b7b941f4ea60/src/vs/workbench/contrib/chat/common/chatModel.ts

import { CancellationToken, CancellationTokenSource, Command, Disposable, Emitter, Event, generateUuid, URI } from '@theia/core';
import { MarkdownString, MarkdownStringImpl } from '@theia/core/lib/common/markdown-rendering';
import { Position } from '@theia/core/shared/vscode-languageserver-protocol';
import { ChatAgentLocation } from './chat-agents';
import { ParsedChatRequest } from './parsed-chat-request';
import { ResolvedAIContextVariable } from '@theia/ai-core';

/**********************
 * INTERFACES AND TYPE GUARDS
 **********************/

export type ChatChangeEvent =
    | ChatAddRequestEvent
    | ChatAddResponseEvent
    | ChatRemoveRequestEvent
    | ChatSetChangeSetEvent
    | ChatUpdateChangeSetEvent
    | ChatRemoveChangeSetEvent;

export interface ChatAddRequestEvent {
    kind: 'addRequest';
    request: ChatRequestModel;
}

export interface ChatAddResponseEvent {
    kind: 'addResponse';
    response: ChatResponseModel;
}

export interface ChatSetChangeSetEvent {
    kind: 'setChangeSet';
    changeSet: ChangeSet;
    oldChangeSet?: ChangeSet;
}

export interface ChatUpdateChangeSetEvent {
    kind: 'updateChangeSet';
    changeSet: ChangeSet;
}

export interface ChatRemoveChangeSetEvent {
    kind: 'removeChangeSet';
    changeSet: ChangeSet;
}

export namespace ChatChangeEvent {
    export function isChangeSetEvent(event: ChatChangeEvent): event is ChatSetChangeSetEvent | ChatUpdateChangeSetEvent | ChatRemoveChangeSetEvent {
        return event.kind === 'setChangeSet' || event.kind === 'removeChangeSet' || event.kind === 'updateChangeSet';
    }
}

export type ChatRequestRemovalReason = 'removal' | 'resend' | 'adoption';

export interface ChatRemoveRequestEvent {
    kind: 'removeRequest';
    requestId: string;
    responseId?: string;
    reason: ChatRequestRemovalReason;
}

export interface ChatModel {
    readonly onDidChange: Event<ChatChangeEvent>;
    readonly id: string;
    readonly location: ChatAgentLocation;
    readonly changeSet?: ChangeSet;
    getRequests(): ChatRequestModel[];
    isEmpty(): boolean;
}

export interface ChangeSet extends Disposable {
    onDidChange: Event<ChangeSetChangeEvent>;
    readonly title: string;
    getElements(): ChangeSetElement[];
    dispose(): void;
}

export interface ChangeSetElement {
    readonly uri: URI;

    onDidChange?: Event<void>
    readonly name?: string;
    readonly icon?: string;
    readonly additionalInfo?: string;

    readonly state?: 'pending' | 'applied' | 'stale';
    readonly type?: 'add' | 'modify' | 'delete';
    readonly data?: { [key: string]: unknown };

    open?(): Promise<void>;
    openChange?(): Promise<void>;
    apply?(): Promise<void>;
    revert?(): Promise<void>;
    dispose?(): void;
}

export interface ChatRequest {
    readonly text: string;
    readonly displayText?: string;
}

export interface ChatContext {
    variables: ResolvedAIContextVariable[];
}

export interface ChatRequestModel {
    readonly id: string;
    readonly session: ChatModel;
    readonly request: ChatRequest;
    readonly response: ChatResponseModel;
    readonly message: ParsedChatRequest;
    readonly context: ChatContext;
    readonly agentId?: string;
    readonly data?: { [key: string]: unknown };
}

export namespace ChatRequestModel {
    export function is(request: unknown): request is ChatRequestModel {
        return !!(
            request &&
            typeof request === 'object' &&
            'id' in request &&
            typeof (request as { id: unknown }).id === 'string' &&
            'session' in request &&
            'request' in request &&
            'response' in request &&
            'message' in request
        );
    }
    export function isInProgress(request: ChatRequestModel | undefined): boolean {
        if (!request) {
            return false;
        }
        const response = request.response;
        return !(
            response.isComplete ||
            response.isCanceled ||
            response.isError
        );
    }
}

export interface ChatProgressMessage {
    kind: 'progressMessage';
    id: string;
    status: 'inProgress' | 'completed' | 'failed';
    show: 'untilFirstContent' | 'whileIncomplete' | 'forever';
    content: string;
}

export interface ChatResponseContent {
    kind: string;
    /**
     * Represents the content as a string. Returns `undefined` if the content
     * is purely informational and/or visual and should not be included in the overall
     * representation of the response.
     */
    asString?(): string | undefined;
    asDisplayString?(): string | undefined;
    merge?(nextChatResponseContent: ChatResponseContent): boolean;
}

export namespace ChatResponseContent {
    export function is(obj: unknown): obj is ChatResponseContent {
        return !!(
            obj &&
            typeof obj === 'object' &&
            'kind' in obj &&
            typeof (obj as { kind: unknown }).kind === 'string'
        );
    }
    export function hasAsString(
        obj: ChatResponseContent
    ): obj is Required<Pick<ChatResponseContent, 'asString'>> & ChatResponseContent {
        return typeof obj.asString === 'function';
    }
    export function hasDisplayString(
        obj: ChatResponseContent
    ): obj is Required<Pick<ChatResponseContent, 'asDisplayString'>> & ChatResponseContent {
        return typeof obj.asDisplayString === 'function';
    }
    export function hasMerge(
        obj: ChatResponseContent
    ): obj is Required<Pick<ChatResponseContent, 'merge'>> & ChatResponseContent {
        return typeof obj.merge === 'function';
    }
}

export interface TextChatResponseContent
    extends Required<ChatResponseContent> {
    kind: 'text';
    content: string;
}

export interface ErrorChatResponseContent extends ChatResponseContent {
    kind: 'error';
    error: Error;
}

export interface MarkdownChatResponseContent
    extends Required<ChatResponseContent> {
    kind: 'markdownContent';
    content: MarkdownString;
}

export interface CodeChatResponseContent
    extends ChatResponseContent {
    kind: 'code';
    code: string;
    language?: string;
    location?: Location;
}

export interface HorizontalLayoutChatResponseContent extends Required<ChatResponseContent> {
    kind: 'horizontal';
    content: ChatResponseContent[];
}

export interface ToolCallChatResponseContent extends Required<ChatResponseContent> {
    kind: 'toolCall';
    id?: string;
    name?: string;
    arguments?: string;
    finished: boolean;
    result?: string;
}

export interface Location {
    uri: URI;
    position: Position;
}
export namespace Location {
    export function is(obj: unknown): obj is Location {
        return !!obj && typeof obj === 'object' &&
            'uri' in obj && (obj as { uri: unknown }).uri instanceof URI &&
            'position' in obj && Position.is((obj as { position: unknown }).position);
    }
}

export interface CustomCallback {
    label: string;
    callback: () => Promise<void>;
}

/**
 * A command chat response content represents a command that is offered to the user for execution.
 * It either refers to an already registered Theia command or provides a custom callback.
 * If both are given, the custom callback will be preferred.
 */
export interface CommandChatResponseContent extends ChatResponseContent {
    kind: 'command';
    command?: Command;
    customCallback?: CustomCallback;
    arguments?: unknown[];
}

/**
 * An informational chat response content represents a message that is purely informational and should not be included in the overall representation of the response.
 */
export interface InformationalChatResponseContent extends ChatResponseContent {
    kind: 'informational';
    content: MarkdownString;
}

export namespace TextChatResponseContent {
    export function is(obj: unknown): obj is TextChatResponseContent {
        return (
            ChatResponseContent.is(obj) &&
            obj.kind === 'text' &&
            'content' in obj &&
            typeof (obj as { content: unknown }).content === 'string'
        );
    }
}

export namespace MarkdownChatResponseContent {
    export function is(obj: unknown): obj is MarkdownChatResponseContent {
        return (
            ChatResponseContent.is(obj) &&
            obj.kind === 'markdownContent' &&
            'content' in obj &&
            MarkdownString.is((obj as { content: unknown }).content)
        );
    }
}

export namespace InformationalChatResponseContent {
    export function is(obj: unknown): obj is InformationalChatResponseContent {
        return (
            ChatResponseContent.is(obj) &&
            obj.kind === 'informational' &&
            'content' in obj &&
            MarkdownString.is((obj as { content: unknown }).content)
        );
    }
}

export namespace CommandChatResponseContent {
    export function is(obj: unknown): obj is CommandChatResponseContent {
        return (
            ChatResponseContent.is(obj) &&
            obj.kind === 'command' &&
            'command' in obj &&
            Command.is((obj as { command: unknown }).command)
        );
    }
}

export namespace CodeChatResponseContent {
    export function is(obj: unknown): obj is CodeChatResponseContent {
        return (
            ChatResponseContent.is(obj) &&
            obj.kind === 'code' &&
            'code' in obj &&
            typeof (obj as { code: unknown }).code === 'string'
        );
    }
}

export namespace HorizontalLayoutChatResponseContent {
    export function is(
        obj: unknown
    ): obj is HorizontalLayoutChatResponseContent {
        return (
            ChatResponseContent.is(obj) &&
            obj.kind === 'horizontal' &&
            'content' in obj &&
            Array.isArray((obj as { content: unknown }).content) &&
            (obj as { content: unknown[] }).content.every(
                ChatResponseContent.is
            )
        );
    }
}

export namespace ToolCallChatResponseContent {
    export function is(obj: unknown): obj is ToolCallChatResponseContent {
        return ChatResponseContent.is(obj) && obj.kind === 'toolCall';
    }
}

export namespace ErrorChatResponseContent {
    export function is(obj: unknown): obj is ErrorChatResponseContent {
        return (
            ChatResponseContent.is(obj) &&
            obj.kind === 'error' &&
            'error' in obj &&
            obj.error instanceof Error
        );
    }
}

export type QuestionResponseHandler = (
    selectedOption: { text: string, value?: string },
) => void;

export interface QuestionResponseContent extends ChatResponseContent {
    kind: 'question';
    question: string;
    options: { text: string, value?: string }[];
    selectedOption?: { text: string, value?: string };
    handler: QuestionResponseHandler;
    request: MutableChatRequestModel;
}

export namespace QuestionResponseContent {
    export function is(obj: unknown): obj is QuestionResponseContent {
        return (
            ChatResponseContent.is(obj) &&
            obj.kind === 'question' &&
            'question' in obj &&
            typeof (obj as { question: unknown }).question === 'string' &&
            'options' in obj &&
            Array.isArray((obj as { options: unknown }).options) &&
            (obj as { options: unknown[] }).options.every(option =>
                typeof option === 'object' &&
                option && 'text' in option &&
                typeof (option as { text: unknown }).text === 'string' &&
                ('value' in option ? typeof (option as { value: unknown }).value === 'string' || typeof (option as { value: unknown }).value === 'undefined' : true)
            ) &&
            'handler' in obj &&
            typeof (obj as { handler: unknown }).handler === 'function' &&
            'request' in obj &&
            obj.request instanceof MutableChatRequestModel
        );
    }
}

export interface ChatResponse {
    readonly content: ChatResponseContent[];
    asString(): string;
    asDisplayString(): string;
}

/**
 * The ChatResponseModel wraps the actual ChatResponse with additional information like the current state, progress messages, a unique id etc.
 */
export interface ChatResponseModel {
    /**
     * Use this to be notified for any change in the response model
     */
    readonly onDidChange: Event<void>;
    /**
     * The unique identifier of the response model
     */
    readonly id: string;
    /**
     * The unique identifier of the request model this response is associated with
     */
    readonly requestId: string;
    /**
     * In case there are progress messages, then they will be stored here
     */
    readonly progressMessages: ChatProgressMessage[];
    /**
     * The actual response content
     */
    readonly response: ChatResponse;
    /**
     * Indicates whether this response is complete. No further changes are expected if 'true'.
     */
    readonly isComplete: boolean;
    /**
     * Indicates whether this response is canceled. No further changes are expected if 'true'.
     */
    readonly isCanceled: boolean;
    /**
     * Some agents might need to wait for user input to continue. This flag indicates that.
     */
    readonly isWaitingForInput: boolean;
    /**
     * Indicates whether an error occurred when processing the response. No further changes are expected if 'true'.
     */
    readonly isError: boolean;
    /**
     * The agent who produced the response content, if there is one.
     */
    readonly agentId?: string
    /**
     * An optional error object that caused the response to be in an error state.
     */
    readonly errorObject?: Error;
    /**
     * Some functionality might want to store some data associated with the response.
     * This can be used to store and retrieve such data.
     */
    readonly data: { [key: string]: unknown };
}

/**********************
 * Implementations
 **********************/

export class MutableChatModel implements ChatModel, Disposable {
    protected readonly _onDidChangeEmitter = new Emitter<ChatChangeEvent>();
    onDidChange: Event<ChatChangeEvent> = this._onDidChangeEmitter.event;

    protected _requests: MutableChatRequestModel[];
    protected _id: string;
    protected _changeSet?: ChangeSetImpl;

    constructor(public readonly location = ChatAgentLocation.Panel) {
        // TODO accept serialized data as a parameter to restore a previously saved ChatModel
        this._requests = [];
        this._id = generateUuid();
    }

    getRequests(): MutableChatRequestModel[] {
        return this._requests;
    }

    getRequest(id: string): MutableChatRequestModel | undefined {
        return this._requests.find(request => request.id === id);
    }

    get id(): string {
        return this._id;
    }

    get changeSet(): ChangeSetImpl | undefined {
        return this._changeSet;
    }

    setChangeSet(changeSet: ChangeSetImpl | undefined): void {
        if (!changeSet) {
            return this.removeChangeSet();
        }
        const oldChangeSet = this._changeSet;
        oldChangeSet?.dispose();
        this._changeSet = changeSet;
        this._onDidChangeEmitter.fire({
            kind: 'setChangeSet',
            changeSet,
            oldChangeSet,
        });
        changeSet.onDidChange(() => {
            this._onDidChangeEmitter.fire({
                kind: 'updateChangeSet',
                changeSet,
            });
        });
    }

    removeChangeSet(): void {
        if (this._changeSet) {
            const oldChangeSet = this._changeSet;
            this._changeSet = undefined;
            oldChangeSet.dispose();
            this._onDidChangeEmitter.fire({
                kind: 'removeChangeSet',
                changeSet: oldChangeSet,
            });
        }
    }

    addRequest(parsedChatRequest: ParsedChatRequest, agentId?: string, context: ChatContext = { variables: [] }): MutableChatRequestModel {
        const requestModel = new MutableChatRequestModel(this, parsedChatRequest, agentId, context);
        this._requests.push(requestModel);
        this._onDidChangeEmitter.fire({
            kind: 'addRequest',
            request: requestModel,
        });
        return requestModel;
    }

    isEmpty(): boolean {
        return this._requests.length === 0;
    }

    dispose(): void {
        this.removeChangeSet(); // Signal disposal of last change set.
        this._onDidChangeEmitter.dispose();
    }
}

interface ChangeSetChangeEvent {
    added?: URI[],
    removed?: URI[],
    modified?: URI[],
    /** Fired when only the state of a given element changes, not its contents */
    state?: URI[],
}

export class ChangeSetImpl implements ChangeSet {
    protected readonly _onDidChangeEmitter = new Emitter<ChangeSetChangeEvent>();
    onDidChange: Event<ChangeSetChangeEvent> = this._onDidChangeEmitter.event;

    protected _elements: ChangeSetElement[] = [];

    constructor(public readonly title: string, elements: ChangeSetElement[] = []) {
        this.addElements(...elements);
    }

    getElements(): ChangeSetElement[] {
        return this._elements;
    }

    /** Will replace any element that is already present, using URI as identity criterion. */
    addElements(...elements: ChangeSetElement[]): void {
        const added: URI[] = [];
        const modified: URI[] = [];
        const toDispose: ChangeSetElement[] = [];
        const current = new Map(this.getElements().map((element, index) => [element.uri.toString(), index]));
        elements.forEach(element => {
            const existingIndex = current.get(element.uri.toString());
            if (existingIndex !== undefined) {
                modified.push(element.uri);
                toDispose.push(this._elements[existingIndex]);
                this._elements[existingIndex] = element;
            } else {
                added.push(element.uri);
                this._elements.push(element);
            }
            element.onDidChange?.(() => this.notifyChange({ state: [element.uri] }));
        });
        toDispose.forEach(element => element.dispose?.());
        this.notifyChange({ added, modified });
    }

    removeElements(...indices: number[]): void {
        // From highest to lowest so that we don't affect lower indices with our splicing.
        const sorted = indices.slice().sort((left, right) => left - right);
        const deletions = sorted.flatMap(index => this._elements.splice(index, 1));
        deletions.forEach(deleted => deleted.dispose?.());
        this.notifyChange({ removed: deletions.map(element => element.uri) });
    }

    protected notifyChange(change: ChangeSetChangeEvent): void {
        this._onDidChangeEmitter.fire(change);
    }

    dispose(): void {
        this._onDidChangeEmitter.dispose();
        this._elements.forEach(element => element.dispose?.());
    }
}

export class MutableChatRequestModel implements ChatRequestModel {
    protected readonly _id: string;
    protected _session: MutableChatModel;
    protected _request: ChatRequest;
    protected _response: MutableChatResponseModel;
    protected _context: ChatContext;
    protected _agentId?: string;
    protected _data: { [key: string]: unknown };

    constructor(session: MutableChatModel, public readonly message: ParsedChatRequest, agentId?: string,
        context: ChatContext = { variables: [] }, data: { [key: string]: unknown } = {}) {
        // TODO accept serialized data as a parameter to restore a previously saved ChatRequestModel
        this._request = message.request;
        this._id = generateUuid();
        this._session = session;
        this._response = new MutableChatResponseModel(this._id, agentId);
        this._context = context;
        this._agentId = agentId;
        this._data = data;
    }

    get data(): { [key: string]: unknown } | undefined {
        return this._data;
    }

    addData(key: string, value: unknown): void {
        this._data[key] = value;
    }

    getDataByKey(key: string): unknown {
        return this._data[key];
    }

    get id(): string {
        return this._id;
    }

    get session(): MutableChatModel {
        return this._session;
    }

    get request(): ChatRequest {
        return this._request;
    }

    get response(): MutableChatResponseModel {
        return this._response;
    }

    get context(): ChatContext {
        return this._context;
    }

    get agentId(): string | undefined {
        return this._agentId;
    }

    cancel(): void {
        this.response.cancel();
    }
}

export class ErrorChatResponseContentImpl implements ErrorChatResponseContent {
    readonly kind = 'error';
    protected _error: Error;
    constructor(error: Error) {
        this._error = error;
    }
    get error(): Error {
        return this._error;
    }
    asString(): string | undefined {
        return undefined;
    }
}

export class TextChatResponseContentImpl implements TextChatResponseContent {
    readonly kind = 'text';
    protected _content: string;

    constructor(content: string) {
        this._content = content;
    }

    get content(): string {
        return this._content;
    }

    asString(): string {
        return this._content;
    }

    asDisplayString(): string | undefined {
        return this.asString();
    }

    merge(nextChatResponseContent: TextChatResponseContent): boolean {
        this._content += nextChatResponseContent.content;
        return true;
    }
}

export class MarkdownChatResponseContentImpl implements MarkdownChatResponseContent {
    readonly kind = 'markdownContent';
    protected _content: MarkdownStringImpl = new MarkdownStringImpl();

    constructor(content: string) {
        this._content.appendMarkdown(content);
    }

    get content(): MarkdownString {
        return this._content;
    }

    asString(): string {
        return this._content.value;
    }

    asDisplayString(): string | undefined {
        return this.asString();
    }

    merge(nextChatResponseContent: MarkdownChatResponseContent): boolean {
        this._content.appendMarkdown(nextChatResponseContent.content.value);
        return true;
    }
}

export class InformationalChatResponseContentImpl implements InformationalChatResponseContent {
    readonly kind = 'informational';
    protected _content: MarkdownStringImpl;

    constructor(content: string) {
        this._content = new MarkdownStringImpl(content);
    }

    get content(): MarkdownString {
        return this._content;
    }

    asString(): string | undefined {
        return undefined;
    }

    merge(nextChatResponseContent: InformationalChatResponseContent): boolean {
        this._content.appendMarkdown(nextChatResponseContent.content.value);
        return true;
    }
}

export class CodeChatResponseContentImpl implements CodeChatResponseContent {
    readonly kind = 'code';
    protected _code: string;
    protected _language?: string;
    protected _location?: Location;

    constructor(code: string, language?: string, location?: Location) {
        this._code = code;
        this._language = language;
        this._location = location;
    }

    get code(): string {
        return this._code;
    }

    get language(): string | undefined {
        return this._language;
    }

    get location(): Location | undefined {
        return this._location;
    }

    asString(): string {
        return `\`\`\`${this._language ?? ''}\n${this._code}\n\`\`\``;
    }

    merge(nextChatResponseContent: CodeChatResponseContent): boolean {
        this._code += `${nextChatResponseContent.code}`;
        return true;
    }
}

export class ToolCallChatResponseContentImpl implements ToolCallChatResponseContent {
    readonly kind = 'toolCall';
    protected _id?: string;
    protected _name?: string;
    protected _arguments?: string;
    protected _finished?: boolean;
    protected _result?: string;

    constructor(id?: string, name?: string, arg_string?: string, finished?: boolean, result?: string) {
        this._id = id;
        this._name = name;
        this._arguments = arg_string;
        this._finished = finished;
        this._result = result;
    }

    get id(): string | undefined {
        return this._id;
    }

    get name(): string | undefined {
        return this._name;
    }

    get arguments(): string | undefined {
        return this._arguments;
    }

    get finished(): boolean {
        return this._finished === undefined ? false : this._finished;
    }
    get result(): string | undefined {
        return this._result;
    }

    asString(): string {
        return '';
    }

    asDisplayString(): string {
        return `Tool call: ${this._name}(${this._arguments ?? ''})`;
    }
    merge(nextChatResponseContent: ToolCallChatResponseContent): boolean {
        if (nextChatResponseContent.id === this.id) {
            this._finished = nextChatResponseContent.finished;
            this._result = nextChatResponseContent.result;
            return true;
        }
        if (nextChatResponseContent.name !== undefined) {
            return false;
        }
        if (nextChatResponseContent.arguments === undefined) {
            return false;
        }
        this._arguments += `${nextChatResponseContent.arguments}`;
        return true;
    }
}

export const COMMAND_CHAT_RESPONSE_COMMAND: Command = {
    id: 'ai-chat.command-chat-response.generic'
};
export class CommandChatResponseContentImpl implements CommandChatResponseContent {
    readonly kind = 'command';

    constructor(public command?: Command, public customCallback?: CustomCallback, protected args?: unknown[]) {
    }

    get arguments(): unknown[] {
        return this.args ?? [];
    }

    asString(): string {
        return this.command?.id || this.customCallback?.label || 'command';
    }
}

export class HorizontalLayoutChatResponseContentImpl implements HorizontalLayoutChatResponseContent {
    readonly kind = 'horizontal';
    protected _content: ChatResponseContent[];

    constructor(content: ChatResponseContent[] = []) {
        this._content = content;
    }

    get content(): ChatResponseContent[] {
        return this._content;
    }

    asString(): string {
        return this._content.map(child => child.asString && child.asString()).join(' ');
    }

    asDisplayString(): string | undefined {
        return this.asString();
    }

    merge(nextChatResponseContent: ChatResponseContent): boolean {
        if (HorizontalLayoutChatResponseContent.is(nextChatResponseContent)) {
            this._content.push(...nextChatResponseContent.content);
        } else {
            this._content.push(nextChatResponseContent);
        }
        return true;
    }
}

/**
 * Default implementation for the QuestionResponseContent.
 */
export class QuestionResponseContentImpl implements QuestionResponseContent {
    readonly kind = 'question';
    protected _selectedOption: { text: string; value?: string } | undefined;
    constructor(public question: string, public options: { text: string, value?: string }[],
        public request: MutableChatRequestModel, public handler: QuestionResponseHandler) {
    }
    set selectedOption(option: { text: string; value?: string; } | undefined) {
        this._selectedOption = option;
        this.request.response.response.responseContentChanged();
    }
    get selectedOption(): { text: string; value?: string; } | undefined {
        return this._selectedOption;
    }
    asString?(): string | undefined {
        return `Question: ${this.question}
${this.selectedOption ? `Answer: ${this.selectedOption?.text}` : 'No answer'}`;
    }
    merge?(): boolean {
        return false;
    }
}

class ChatResponseImpl implements ChatResponse {
    protected readonly _onDidChangeEmitter = new Emitter<void>();
    onDidChange: Event<void> = this._onDidChangeEmitter.event;
    protected _content: ChatResponseContent[];
    protected _responseRepresentation: string;
    protected _responseRepresentationForDisplay: string;

    constructor() {
        // TODO accept serialized data as a parameter to restore a previously saved ChatResponse
        this._content = [];
    }

    get content(): ChatResponseContent[] {
        return this._content;
    }

    addContents(contents: ChatResponseContent[]): void {
        contents.forEach(c => this.doAddContent(c));
        this._onDidChangeEmitter.fire();
    }

    addContent(nextContent: ChatResponseContent): void {
        // TODO: Support more complex merges affecting different content than the last, e.g. via some kind of ProcessorRegistry
        // TODO: Support more of the built-in VS Code behavior, see
        //   https://github.com/microsoft/vscode/blob/a2cab7255c0df424027be05d58e1b7b941f4ea60/src/vs/workbench/contrib/chat/common/chatModel.ts#L188-L244
        this.doAddContent(nextContent);
        this._onDidChangeEmitter.fire();
    }

    protected doAddContent(nextContent: ChatResponseContent): void {
        if (ToolCallChatResponseContent.is(nextContent) && nextContent.id !== undefined) {
            const fittingTool = this._content.find(c => ToolCallChatResponseContent.is(c) && c.id === nextContent.id);
            if (fittingTool !== undefined) {
                fittingTool.merge?.(nextContent);
            } else {
                this._content.push(nextContent);
            }
        } else {
            const lastElement = this._content.length > 0
                ? this._content[this._content.length - 1]
                : undefined;
            if (lastElement?.kind === nextContent.kind && ChatResponseContent.hasMerge(lastElement)) {
                const mergeSuccess = lastElement.merge(nextContent);
                if (!mergeSuccess) {
                    this._content.push(nextContent);
                }
            } else {
                this._content.push(nextContent);
            }
        }
        this._updateResponseRepresentation();
    }

    responseContentChanged(): void {
        this._updateResponseRepresentation();
        this._onDidChangeEmitter.fire();
    }

    protected _updateResponseRepresentation(): void {
        this._responseRepresentation = this.responseRepresentationsToString(this._content, 'asString');
        this._responseRepresentationForDisplay = this.responseRepresentationsToString(this.content, 'asDisplayString');
    }

    protected responseRepresentationsToString(content: ChatResponseContent[], collect: 'asString' | 'asDisplayString'): string {
        return content
            .map(responseContent => {
                if (collect === 'asDisplayString') {
                    if (ChatResponseContent.hasDisplayString(responseContent)) {
                        return responseContent.asDisplayString();
                    }
                }
                if (ChatResponseContent.hasAsString(responseContent)) {
                    return responseContent.asString();
                }
                if (TextChatResponseContent.is(responseContent)) {
                    return responseContent.content;
                }
                console.warn(
                    'Was not able to map responseContent to a string',
                    responseContent
                );
                return undefined;
            })
            .filter(text => (text !== undefined && text !== ''))
            .join('\n\n');
    }

    asString(): string {
        return this._responseRepresentation;
    }

    asDisplayString(): string {
        return this._responseRepresentationForDisplay;
    }
}

class MutableChatResponseModel implements ChatResponseModel {
    protected readonly _onDidChangeEmitter = new Emitter<void>();
    onDidChange: Event<void> = this._onDidChangeEmitter.event;

    data = {};

    protected _id: string;
    protected _requestId: string;
    protected _progressMessages: ChatProgressMessage[];
    protected _response: ChatResponseImpl;
    protected _isComplete: boolean;
    protected _isWaitingForInput: boolean;
    protected _agentId?: string;
    protected _isError: boolean;
    protected _errorObject: Error | undefined;
    protected _cancellationToken: CancellationTokenSource;

    constructor(requestId: string, agentId?: string) {
        // TODO accept serialized data as a parameter to restore a previously saved ChatResponseModel
        this._requestId = requestId;
        this._id = generateUuid();
        this._progressMessages = [];
        const response = new ChatResponseImpl();
        response.onDidChange(() => this._onDidChangeEmitter.fire());
        this._response = response;
        this._isComplete = false;
        this._isWaitingForInput = false;
        this._agentId = agentId;
        this._cancellationToken = new CancellationTokenSource();
    }

    get id(): string {
        return this._id;
    }

    get requestId(): string {
        return this._requestId;
    }

    get progressMessages(): ChatProgressMessage[] {
        return this._progressMessages;
    }

    addProgressMessage(message: { content: string } & Partial<Omit<ChatProgressMessage, 'kind'>>): ChatProgressMessage {
        const id = message.id ?? generateUuid();
        const existingMessage = this.getProgressMessage(id);
        if (existingMessage) {
            this.updateProgressMessage({ id, ...message });
            return existingMessage;
        }
        const newMessage: ChatProgressMessage = {
            kind: 'progressMessage',
            id,
            status: message.status ?? 'inProgress',
            show: message.show ?? 'untilFirstContent',
            ...message,
        };
        this._progressMessages.push(newMessage);
        this._onDidChangeEmitter.fire();
        return newMessage;
    }

    getProgressMessage(id: string): ChatProgressMessage | undefined {
        return this._progressMessages.find(message => message.id === id);
    }

    updateProgressMessage(message: { id: string } & Partial<Omit<ChatProgressMessage, 'kind'>>): void {
        const progressMessage = this.getProgressMessage(message.id);
        if (progressMessage) {
            Object.assign(progressMessage, message);
            this._onDidChangeEmitter.fire();
        }
    }

    get response(): ChatResponseImpl {
        return this._response;
    }

    get isComplete(): boolean {
        return this._isComplete;
    }

    get isCanceled(): boolean {
        return this._cancellationToken.token.isCancellationRequested;
    }

    get isWaitingForInput(): boolean {
        return this._isWaitingForInput;
    }

    get agentId(): string | undefined {
        return this._agentId;
    }

    overrideAgentId(agentId: string): void {
        this._agentId = agentId;
    }

    complete(): void {
        this._isComplete = true;
        this._isWaitingForInput = false;
        this._onDidChangeEmitter.fire();
    }

    cancel(): void {
        this._cancellationToken.cancel();
        this._isComplete = true;
        this._isWaitingForInput = false;
        this._onDidChangeEmitter.fire();
    }

    get cancellationToken(): CancellationToken {
        return this._cancellationToken.token;
    }

    waitForInput(): void {
        this._isWaitingForInput = true;
        this._onDidChangeEmitter.fire();
    }

    stopWaitingForInput(): void {
        this._isWaitingForInput = false;
        this._onDidChangeEmitter.fire();
    }

    error(error: Error): void {
        this._isComplete = true;
        this._isWaitingForInput = false;
        this._isError = true;
        this._errorObject = error;
        this._onDidChangeEmitter.fire();
    }
    get errorObject(): Error | undefined {
        return this._errorObject;
    }
    get isError(): boolean {
        return this._isError;
    }
}

export class ErrorChatResponseModel extends MutableChatResponseModel {
    constructor(requestId: string, error: Error, agentId?: string) {
        super(requestId, agentId);
        this.error(error);
    }
}
