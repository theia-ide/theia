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
// Partially copied from https://github.com/microsoft/vscode/blob/a2cab7255c0df424027be05d58e1b7b941f4ea60/src/vs/workbench/contrib/chat/common/chatService.ts

import { AIVariableContext, AIVariableResolutionRequest, AIVariableService, ResolvedAIContextVariable } from '@theia/ai-core';
import { Emitter, ILogger, generateUuid } from '@theia/core';
import { inject, injectable, optional } from '@theia/core/shared/inversify';
import { Event } from '@theia/core/shared/vscode-languageserver-protocol';
import { ChatAgentService } from './chat-agent-service';
import { ChatAgent, ChatAgentLocation } from './chat-agents';
import {
    ChatModel,
    MutableChatModel,
    ChatRequest,
    ChatRequestModel,
    ChatResponseModel,
    ErrorChatResponseModel,
    ChatContext,
} from './chat-model';
import { ChatRequestParser } from './chat-request-parser';
import { ParsedChatRequest, ParsedChatRequestAgentPart, ParsedChatRequestVariablePart } from './parsed-chat-request';

export interface ChatRequestInvocation {
    /**
     * Promise which completes once the request preprocessing is complete.
     */
    requestCompleted: Promise<ChatRequestModel>;
    /**
     * Promise which completes once a response is expected to arrive.
     */
    responseCreated: Promise<ChatResponseModel>;
    /**
     * Promise which completes once the response is complete.
     */
    responseCompleted: Promise<ChatResponseModel>;
}

export interface ChatSession {
    id: string;
    title?: string;
    model: ChatModel;
    isActive: boolean;
    pinnedAgent?: ChatAgent;
}

export interface ChatSessionContext extends AIVariableContext {
    request: ChatRequestModel;
    session: ChatModel;
}

export namespace ChatSessionContext {
    export function is(candidate: unknown): candidate is ChatSessionContext {
        return typeof candidate === 'object' && !!candidate && 'session' in candidate && 'request' in candidate;
    }
}

export interface ChatContextRequest {
    variableRequests: AIVariableResolutionRequest[]
}

export interface ActiveSessionChangedEvent {
    sessionId: string | undefined;
    focus?: boolean;
}

export interface SessionOptions {
    focus?: boolean;
}

/**
 * The default chat agent to invoke
 */
export const DefaultChatAgentId = Symbol('DefaultChatAgentId');
export interface DefaultChatAgentId {
    id: string;
}

/**
 * In case no fitting chat agent is available, this one will be used (if it is itself available)
 */
export const FallbackChatAgentId = Symbol('FallbackChatAgentId');
export interface FallbackChatAgentId {
    id: string;
}

export const PinChatAgent = Symbol('PinChatAgent');
export type PinChatAgent = boolean;

export const ChatService = Symbol('ChatService');
export interface ChatService {
    onActiveSessionChanged: Event<ActiveSessionChangedEvent>

    getSession(id: string): ChatSession | undefined;
    getSessions(): ChatSession[];
    createSession(location?: ChatAgentLocation, options?: SessionOptions, pinnedAgent?: ChatAgent): ChatSession;
    deleteSession(sessionId: string): void;
    setActiveSession(sessionId: string, options?: SessionOptions): void;

    sendRequest(
        sessionId: string,
        request: ChatRequest,
        requestedContext?: ChatContextRequest
    ): Promise<ChatRequestInvocation | undefined>;

    deleteChangeSet(sessionId: string): void;
    deleteChangeSetElement(sessionId: string, index: number): void;

    cancelRequest(sessionId: string, requestId: string): Promise<void>;
}

interface ChatSessionInternal extends ChatSession {
    model: MutableChatModel;
}

@injectable()
export class ChatServiceImpl implements ChatService {
    protected readonly onActiveSessionChangedEmitter = new Emitter<ActiveSessionChangedEvent>();
    onActiveSessionChanged = this.onActiveSessionChangedEmitter.event;

    @inject(ChatAgentService)
    protected chatAgentService: ChatAgentService;

    @inject(DefaultChatAgentId) @optional()
    protected defaultChatAgentId: DefaultChatAgentId | undefined;

    @inject(FallbackChatAgentId) @optional()
    protected fallbackChatAgentId: FallbackChatAgentId | undefined;

    @inject(PinChatAgent) @optional()
    protected pinChatAgent: boolean | undefined;

    @inject(ChatRequestParser)
    protected chatRequestParser: ChatRequestParser;

    @inject(AIVariableService)
    protected variableService: AIVariableService;

    @inject(ILogger)
    protected logger: ILogger;

    protected _sessions: ChatSessionInternal[] = [];

    getSessions(): ChatSessionInternal[] {
        return [...this._sessions];
    }

    getSession(id: string): ChatSessionInternal | undefined {
        return this._sessions.find(session => session.id === id);
    }

    createSession(location = ChatAgentLocation.Panel, options?: SessionOptions, pinnedAgent?: ChatAgent): ChatSession {
        const model = new MutableChatModel(location);
        const session: ChatSessionInternal = {
            id: model.id,
            model,
            isActive: true,
            pinnedAgent
        };
        this._sessions.push(session);
        this.setActiveSession(session.id, options);
        return session;
    }

    deleteSession(sessionId: string): void {
        const sessionIndex = this._sessions.findIndex(candidate => candidate.id === sessionId);
        if (~sessionIndex) { return; }
        const session = this._sessions[sessionIndex];
        // If the removed session is the active one, set the newest one as active
        if (session.isActive) {
            this.setActiveSession(this._sessions[this._sessions.length - 1]?.id);
        }
        session.model.dispose();
        this._sessions.splice(sessionIndex, 1);
    }

    setActiveSession(sessionId: string | undefined, options?: SessionOptions): void {
        this._sessions.forEach(session => {
            session.isActive = session.id === sessionId;
        });
        this.onActiveSessionChangedEmitter.fire({ sessionId: sessionId, ...options });
    }

    async sendRequest(
        sessionId: string,
        request: ChatRequest,
        requestedContext: ChatContextRequest = { variableRequests: [] }
    ): Promise<ChatRequestInvocation | undefined> {
        const session = this.getSession(sessionId);
        if (!session) {
            return undefined;
        }
        session.title = request.text;

        const parsedRequest = this.chatRequestParser.parseChatRequest(request, session.model.location);
        const agent = this.getAgent(parsedRequest, session);

        if (agent === undefined) {
            const error = 'No ChatAgents available to handle request!';
            this.logger.error(error);
            const chatResponseModel = new ErrorChatResponseModel(generateUuid(), new Error(error));
            return {
                requestCompleted: Promise.reject(error),
                responseCreated: Promise.reject(error),
                responseCompleted: Promise.resolve(chatResponseModel),
            };
        }

        const resolvedContext = await this.resolveChatContext(requestedContext, request, session);
        const requestModel = session.model.addRequest(parsedRequest, agent?.id, resolvedContext);

        for (const part of parsedRequest.parts) {
            if (part instanceof ParsedChatRequestVariablePart) {
                const resolvedVariable = await this.variableService.resolveVariable(
                    { variable: part.variableName, arg: part.variableArg },
                    { request, model: session }
                );
                if (resolvedVariable) {
                    part.resolution = resolvedVariable;
                } else {
                    this.logger.warn(`Failed to resolve variable ${part.variableName} for ${session.model.location}`);
                }
            }
        }

        let resolveResponseCreated: (responseModel: ChatResponseModel) => void;
        let resolveResponseCompleted: (responseModel: ChatResponseModel) => void;
        const invocation: ChatRequestInvocation = {
            requestCompleted: Promise.resolve(requestModel),
            responseCreated: new Promise(resolve => {
                resolveResponseCreated = resolve;
            }),
            responseCompleted: new Promise(resolve => {
                resolveResponseCompleted = resolve;
            }),
        };

        resolveResponseCreated!(requestModel.response);
        requestModel.response.onDidChange(() => {
            if (requestModel.response.isComplete) {
                resolveResponseCompleted!(requestModel.response);
            }
            if (requestModel.response.isError) {
                resolveResponseCompleted!(requestModel.response);
            }
        });

        if (agent) {
            agent.invoke(requestModel).catch(error => requestModel.response.error(error));
        } else {
            this.logger.error('No ChatAgents available to handle request!', requestModel);
        }

        return invocation;
    }

    protected async resolveChatContext(
        requestedContext: ChatContextRequest,
        request: ChatRequest,
        session: ChatSessionInternal
    ): Promise<ChatContext> {
        const resolvedVariables = await Promise.all(
            requestedContext.variableRequests.map(async contextVariable => {
                const resolvedVariable = await this.variableService.resolveVariable(contextVariable, { request, model: session });
                if (ResolvedAIContextVariable.is(resolvedVariable)) {
                    return resolvedVariable;
                }
                return undefined;
            })
        ).then(results => results.filter((result): result is ResolvedAIContextVariable => result !== undefined));
        return { variables: resolvedVariables };
    }

    async cancelRequest(sessionId: string, requestId: string): Promise<void> {
        return this.getSession(sessionId)?.model.getRequest(requestId)?.response.cancel();
    }

    protected getAgent(parsedRequest: ParsedChatRequest, session: ChatSession): ChatAgent | undefined {
        let agent = this.initialAgentSelection(parsedRequest);
        if (this.pinChatAgent === false) {
            return agent;
        }
        if (!session.pinnedAgent && agent && agent.id !== this.defaultChatAgentId?.id) {
            session.pinnedAgent = agent;
        } else if (session.pinnedAgent && this.getMentionedAgent(parsedRequest) === undefined) {
            agent = session.pinnedAgent;
        }
        return agent;
    }

    protected initialAgentSelection(parsedRequest: ParsedChatRequest): ChatAgent | undefined {
        const agentPart = this.getMentionedAgent(parsedRequest);
        if (agentPart) {
            return this.chatAgentService.getAgent(agentPart.agentId);
        }
        let chatAgent = undefined;
        if (this.defaultChatAgentId) {
            chatAgent = this.chatAgentService.getAgent(this.defaultChatAgentId.id);
        }
        if (!chatAgent && this.fallbackChatAgentId) {
            chatAgent = this.chatAgentService.getAgent(this.fallbackChatAgentId.id);
        }
        if (chatAgent) {
            return chatAgent;
        }
        this.logger.warn('Neither the default chat agent nor the fallback chat agent are configured or available. Falling back to the first registered agent');
        return this.chatAgentService.getAgents()[0] ?? undefined;
    }

    protected getMentionedAgent(parsedRequest: ParsedChatRequest): ParsedChatRequestAgentPart | undefined {
        return parsedRequest.parts.find(p => p instanceof ParsedChatRequestAgentPart) as ParsedChatRequestAgentPart | undefined;
    }

    deleteChangeSet(sessionId: string): void {
        this.getSession(sessionId)?.model.setChangeSet(undefined);
    }

    deleteChangeSetElement(sessionId: string, index: number): void {
        this.getSession(sessionId)?.model.changeSet?.removeElements(index);
    }
}
