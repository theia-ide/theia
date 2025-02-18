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
// Partially copied from https://github.com/microsoft/vscode/blob/a2cab7255c0df424027be05d58e1b7b941f4ea60/src/vs/workbench/contrib/chat/common/chatAgents.ts

import {
    AgentSpecificVariables,
    AIVariableContext,
    CommunicationRecordingService,
    getTextOfResponse,
    LanguageModel,
    LanguageModelRequirement,
    LanguageModelResponse,
    LanguageModelStreamResponse,
    PromptService,
    PromptTemplate,
    ResolvedPromptTemplate,
    ToolCall,
    ToolRequest,
} from '@theia/ai-core';
import {
    Agent,
    isLanguageModelStreamResponse,
    isLanguageModelTextResponse,
    LanguageModelRegistry,
    LanguageModelStreamResponsePart,
    MessageActor,
} from '@theia/ai-core/lib/common';
import { CancellationToken, ContributionProvider, ILogger, isArray } from '@theia/core';
import { inject, injectable, named, postConstruct } from '@theia/core/shared/inversify';
import { ChatAgentService } from './chat-agent-service';
import {
    ChatModel,
    MutableChatRequestModel,
    ChatResponseContent,
    ErrorChatResponseContentImpl,
    MarkdownChatResponseContentImpl,
    ToolCallChatResponseContentImpl
} from './chat-model';
import { findFirstMatch, parseContents } from './parse-contents';
import { DefaultResponseContentFactory, ResponseContentMatcher, ResponseContentMatcherProvider } from './response-content-matcher';
import { ChatHistoryEntry } from './chat-history-entry';
import { ChatToolRequestService } from './chat-tool-request-service';

/**
 * A conversation consists of a sequence of ChatMessages.
 * Each ChatMessage is either a user message, AI message or a system message.
 *
 * For now we only support text based messages.
 */
export interface ChatMessage {
    actor: MessageActor;
    type: 'text';
    query: string;
}

/**
 * System message content, enriched with function descriptions.
 */
export interface SystemMessageDescription {
    text: string;
    /** All functions references in the system message. */
    functionDescriptions?: Map<string, ToolRequest>;
}
export namespace SystemMessageDescription {
    export function fromResolvedPromptTemplate(resolvedPrompt: ResolvedPromptTemplate): SystemMessageDescription {
        return {
            text: resolvedPrompt.text,
            functionDescriptions: resolvedPrompt.functionDescriptions
        };
    }
}

/**
 * The location from where an chat agent may be invoked.
 * Based on the location, a different context may be available.
 */
export enum ChatAgentLocation {
    Panel = 'panel',
    Terminal = 'terminal',
    Notebook = 'notebook',
    Editor = 'editor'
}

export namespace ChatAgentLocation {
    export const ALL: ChatAgentLocation[] = [ChatAgentLocation.Panel, ChatAgentLocation.Terminal, ChatAgentLocation.Notebook, ChatAgentLocation.Editor];

    export function fromRaw(value: string): ChatAgentLocation {
        switch (value) {
            case 'panel': return ChatAgentLocation.Panel;
            case 'terminal': return ChatAgentLocation.Terminal;
            case 'notebook': return ChatAgentLocation.Notebook;
            case 'editor': return ChatAgentLocation.Editor;
        }
        return ChatAgentLocation.Panel;
    }
}

export const ChatAgent = Symbol('ChatAgent');
/**
 * A chat agent is a specialized agent with a common interface for its invocation.
 */
export interface ChatAgent extends Agent {
    locations: ChatAgentLocation[];
    iconClass?: string;
    invoke(request: MutableChatRequestModel, chatAgentService?: ChatAgentService): Promise<void>;
}

@injectable()
export abstract class AbstractChatAgent implements ChatAgent {
    @inject(LanguageModelRegistry) protected languageModelRegistry: LanguageModelRegistry;
    @inject(ILogger) protected logger: ILogger;
    @inject(CommunicationRecordingService) protected recordingService: CommunicationRecordingService;
    @inject(ChatToolRequestService) protected chatToolRequestService: ChatToolRequestService;
    @inject(PromptService) protected promptService: PromptService;

    @inject(ContributionProvider) @named(ResponseContentMatcherProvider)
    protected contentMatcherProviders: ContributionProvider<ResponseContentMatcherProvider>;

    @inject(DefaultResponseContentFactory)
    protected defaultContentFactory: DefaultResponseContentFactory;

    readonly abstract id: string;
    readonly abstract name: string;
    readonly abstract languageModelRequirements: LanguageModelRequirement[];
    iconClass: string = 'codicon codicon-copilot';
    locations: ChatAgentLocation[] = ChatAgentLocation.ALL;
    tags: string[] = ['Chat'];
    description: string = '';
    variables: string[] = [];
    promptTemplates: PromptTemplate[] = [];
    agentSpecificVariables: AgentSpecificVariables[] = [];
    functions: string[] = [];
    protected readonly abstract defaultLanguageModelPurpose: string;
    protected defaultLogging: boolean = true;
    protected systemPromptId: string | undefined = undefined;
    protected additionalToolRequests: ToolRequest[] = [];
    protected contentMatchers: ResponseContentMatcher[] = [];

    @postConstruct()
    init(): void {
        this.initializeContentMatchers();
    }

    protected initializeContentMatchers(): void {
        const contributedContentMatchers = this.contentMatcherProviders.getContributions().flatMap(provider => provider.matchers);
        this.contentMatchers.push(...contributedContentMatchers);
    }

    async invoke(request: MutableChatRequestModel): Promise<void> {
        try {
            const languageModel = await this.getLanguageModel(this.defaultLanguageModelPurpose);
            if (!languageModel) {
                throw new Error('Couldn\'t find a matching language model. Please check your setup!');
            }

            const systemMessageDescription = await this.getSystemMessageDescription({ request, session: request.session });
            const messages = await this.getMessages(request.session);
            if (this.defaultLogging) {
                this.recordingService.recordRequest(
                    ChatHistoryEntry.fromRequest(
                        this.id, request, {
                        messages,
                        systemMessage: systemMessageDescription?.text
                    })
                );
            }

            if (systemMessageDescription) {
                const systemMsg: ChatMessage = {
                    actor: 'system',
                    type: 'text',
                    query: systemMessageDescription.text
                };
                // insert system message at the beginning of the request messages
                messages.unshift(systemMsg);
            }

            const systemMessageToolRequests = systemMessageDescription?.functionDescriptions?.values();
            const tools = [
                ...this.chatToolRequestService.getChatToolRequests(request),
                ...this.chatToolRequestService.toChatToolRequests(systemMessageToolRequests ? Array.from(systemMessageToolRequests) : [], request),
                ...this.chatToolRequestService.toChatToolRequests(this.additionalToolRequests, request)
            ];

            const languageModelResponse = await this.callLlm(
                languageModel,
                messages,
                tools.length > 0 ? tools : undefined,
                request.response.cancellationToken
            );
            await this.addContentsToResponse(languageModelResponse, request);
            await this.onResponseComplete(request);
            if (this.defaultLogging) {
                this.recordingService.recordResponse(ChatHistoryEntry.fromResponse(this.id, request));
            }
        } catch (e) {
            this.handleError(request, e);
        }
    }

    protected parseContents(text: string, request: MutableChatRequestModel): ChatResponseContent[] {
        return parseContents(
            text,
            request,
            this.contentMatchers,
            this.defaultContentFactory?.create.bind(this.defaultContentFactory)
        );
    };

    protected handleError(request: MutableChatRequestModel, error: Error): void {
        request.response.response.addContent(new ErrorChatResponseContentImpl(error));
        request.response.error(error);
    }

    protected getLanguageModelSelector(languageModelPurpose: string): LanguageModelRequirement {
        return this.languageModelRequirements.find(req => req.purpose === languageModelPurpose)!;
    }

    protected async getLanguageModel(languageModelPurpose: string): Promise<LanguageModel> {
        return this.selectLanguageModel(this.getLanguageModelSelector(languageModelPurpose));
    }

    protected async selectLanguageModel(selector: LanguageModelRequirement): Promise<LanguageModel> {
        const languageModel = await this.languageModelRegistry.selectLanguageModel({ agent: this.id, ...selector });
        if (!languageModel) {
            throw new Error('Couldn\'t find a language model. Please check your setup!');
        }
        return languageModel;
    }

    protected async getSystemMessageDescription(context: AIVariableContext): Promise<SystemMessageDescription | undefined> {
        if (this.systemPromptId === undefined) {
            return undefined;
        }
        const resolvedPrompt = await this.promptService.getPrompt(this.systemPromptId, undefined, context);
        return resolvedPrompt ? SystemMessageDescription.fromResolvedPromptTemplate(resolvedPrompt) : undefined;
    }

    protected async getMessages(
        model: ChatModel, includeResponseInProgress = false
    ): Promise<ChatMessage[]> {
        const requestMessages = model.getRequests().flatMap(request => {
            const messages: ChatMessage[] = [];
            const text = request.message.parts.map(part => part.promptText).join('');
            messages.push({
                actor: 'user',
                type: 'text',
                query: text,
            });
            if (request.response.isComplete || includeResponseInProgress) {
                messages.push({
                    actor: 'ai',
                    type: 'text',
                    query: request.response.response.asString(),
                });
            }
            return messages;
        });

        return requestMessages;
    }

    protected async callLlm(
        languageModel: LanguageModel,
        messages: ChatMessage[],
        tools: ToolRequest[] | undefined,
        token: CancellationToken
    ): Promise<LanguageModelResponse> {
        const settings = this.getLlmSettings();
        const languageModelResponse = languageModel.request({
            messages,
            tools,
            settings,
        }, token);
        return languageModelResponse;
    }

    /**
     * @returns the settings, such as `temperature`, to be used in all language model requests. Returns `undefined` by default.
     */
    protected getLlmSettings(): { [key: string]: unknown; } | undefined {
        return undefined;
    }

    /**
     * Invoked after the response by the LLM completed successfully.
     *
     * The default implementation sets the state of the response to `complete`.
     * Subclasses may override this method to perform additional actions or keep the response open for processing further requests.
     */
    protected async onResponseComplete(request: MutableChatRequestModel): Promise<void> {
        return request.response.complete();
    }

    protected abstract addContentsToResponse(languageModelResponse: LanguageModelResponse, request: MutableChatRequestModel): Promise<void>;
}

@injectable()
export abstract class AbstractTextToModelParsingChatAgent<T> extends AbstractChatAgent {

    protected async addContentsToResponse(languageModelResponse: LanguageModelResponse, request: MutableChatRequestModel): Promise<void> {
        const responseAsText = await getTextOfResponse(languageModelResponse);
        const parsedCommand = await this.parseTextResponse(responseAsText);
        const content = this.createResponseContent(parsedCommand, request);
        request.response.response.addContent(content);
    }

    protected abstract parseTextResponse(text: string): Promise<T>;

    protected abstract createResponseContent(parsedModel: T, request: MutableChatRequestModel): ChatResponseContent;
}

/**
 * Factory for creating ToolCallChatResponseContent instances.
 */
@injectable()
export class ToolCallChatResponseContentFactory {
    create(toolCall: ToolCall): ChatResponseContent {
        return new ToolCallChatResponseContentImpl(
            toolCall.id,
            toolCall.function?.name,
            toolCall.function?.arguments,
            toolCall.finished,
            toolCall.result
        );
    }
}

@injectable()
export abstract class AbstractStreamParsingChatAgent extends AbstractChatAgent {
    @inject(ToolCallChatResponseContentFactory)
    protected toolCallResponseContentFactory: ToolCallChatResponseContentFactory;

    protected override async addContentsToResponse(languageModelResponse: LanguageModelResponse, request: MutableChatRequestModel): Promise<void> {
        if (isLanguageModelTextResponse(languageModelResponse)) {
            const contents = this.parseContents(languageModelResponse.text, request);
            request.response.response.addContents(contents);
            return;
        }
        if (isLanguageModelStreamResponse(languageModelResponse)) {
            await this.addStreamResponse(languageModelResponse, request);
            return;
        }
        this.logger.error(
            'Received unknown response in agent. Return response as text'
        );
        request.response.response.addContent(
            new MarkdownChatResponseContentImpl(
                JSON.stringify(languageModelResponse)
            )
        );
    }

    protected async addStreamResponse(languageModelResponse: LanguageModelStreamResponse, request: MutableChatRequestModel): Promise<void> {
        for await (const token of languageModelResponse.stream) {
            const newContents = this.parse(token, request);
            if (isArray(newContents)) {
                request.response.response.addContents(newContents);
            } else {
                request.response.response.addContent(newContents);
            }

            const lastContent = request.response.response.content.pop();
            if (lastContent === undefined) {
                return;
            }
            const text = lastContent.asString?.();
            if (text === undefined) {
                return;
            }

            const result: ChatResponseContent[] = findFirstMatch(this.contentMatchers, text) ? this.parseContents(text, request) : [];
            if (result.length > 0) {
                request.response.response.addContents(result);
            } else {
                request.response.response.addContent(lastContent);
            }
        }
    }

    protected parse(token: LanguageModelStreamResponsePart, request: MutableChatRequestModel): ChatResponseContent | ChatResponseContent[] {
        const content = token.content;
        // eslint-disable-next-line no-null/no-null
        if (content !== undefined && content !== null) {
            return this.defaultContentFactory.create(content, request);
        }
        const toolCalls = token.tool_calls;
        if (toolCalls !== undefined) {
            const toolCallContents = toolCalls.map(toolCall =>
                this.createToolCallResponseContent(toolCall)
            );
            return toolCallContents;
        }
        return this.defaultContentFactory.create('', request);
    }

    /**
     * Creates a ToolCallChatResponseContent instance from the provided tool call data.
     *
     * This method is called when parsing stream response tokens that contain tool call data.
     * Subclasses can override this method to customize the creation of tool call response contents.
     *
     * @param toolCall The ToolCall.
     * @returns A ChatResponseContent representing the tool call.
     */
    protected createToolCallResponseContent(toolCall: ToolCall): ChatResponseContent {
        return this.toolCallResponseContentFactory.create(toolCall);
    }
}
