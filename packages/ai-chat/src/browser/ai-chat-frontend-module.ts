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

import { Agent, AgentService, AIVariableContribution } from '@theia/ai-core/lib/common';
import { bindContributionProvider, ResourceResolver } from '@theia/core';
import { FrontendApplicationContribution, LabelProviderContribution, PreferenceContribution } from '@theia/core/lib/browser';
import { ContainerModule } from '@theia/core/shared/inversify';
import {
    ChatAgent,
    ChatAgentService,
    ChatAgentServiceImpl,
    ChatRequestParser,
    ChatRequestParserImpl,
    ChatService,
    ToolCallChatResponseContentFactory,
    PinChatAgent
} from '../common';
import { ChatAgentsVariableContribution } from '../common/chat-agents-variable-contribution';
import { CustomChatAgent } from '../common/custom-chat-agent';
import { DefaultResponseContentFactory, DefaultResponseContentMatcherProvider, ResponseContentMatcherProvider } from '../common/response-content-matcher';
import { aiChatPreferences } from './ai-chat-preferences';
import { ChangeSetElementArgs, ChangeSetFileElement, ChangeSetFileElementFactory } from './change-set-file-element';
import { AICustomAgentsFrontendApplicationContribution } from './custom-agent-frontend-application-contribution';
import { FrontendChatServiceImpl } from './frontend-chat-service';
import { CustomAgentFactory } from './custom-agent-factory';
import { ChatToolRequestService } from '../common/chat-tool-request-service';
import { ChangeSetFileResourceResolver } from './change-set-file-resource';
import { ChangeSetFileService } from './change-set-file-service';
import { ContextVariableLabelProvider } from './context-variable-label-provider';
import { ContextFileVariableLabelProvider } from './context-file-variable-label-provider';
import { FileChatVariableContribution } from './file-chat-variable-contribution';
import { ContextSummaryVariableContribution } from '../common/context-summary-variable';

export default new ContainerModule(bind => {
    bindContributionProvider(bind, Agent);
    bindContributionProvider(bind, ChatAgent);

    bind(ChatToolRequestService).toSelf().inSingletonScope();

    bind(ChatAgentServiceImpl).toSelf().inSingletonScope();
    bind(ChatAgentService).toService(ChatAgentServiceImpl);
    bind(PinChatAgent).toConstantValue(true);

    bindContributionProvider(bind, ResponseContentMatcherProvider);
    bind(DefaultResponseContentMatcherProvider).toSelf().inSingletonScope();
    bind(ResponseContentMatcherProvider).toService(DefaultResponseContentMatcherProvider);
    bind(DefaultResponseContentFactory).toSelf().inSingletonScope();

    bind(AIVariableContribution).to(ChatAgentsVariableContribution).inSingletonScope();

    bind(ChatRequestParserImpl).toSelf().inSingletonScope();
    bind(ChatRequestParser).toService(ChatRequestParserImpl);

    bind(FrontendChatServiceImpl).toSelf().inSingletonScope();
    bind(ChatService).toService(FrontendChatServiceImpl);

    bind(PreferenceContribution).toConstantValue({ schema: aiChatPreferences });

    bind(CustomChatAgent).toSelf();
    bind(CustomAgentFactory).toFactory<CustomChatAgent, [string, string, string, string, string]>(
        ctx => (id: string, name: string, description: string, prompt: string, defaultLLM: string) => {
            const agent = ctx.container.get<CustomChatAgent>(CustomChatAgent);
            agent.id = id;
            agent.name = name;
            agent.description = description;
            agent.prompt = prompt;
            agent.languageModelRequirements = [{
                purpose: 'chat',
                identifier: defaultLLM,
            }];
            ctx.container.get<ChatAgentService>(ChatAgentService).registerChatAgent(agent);
            ctx.container.get<AgentService>(AgentService).registerAgent(agent);
            return agent;
        });
    bind(FrontendApplicationContribution).to(AICustomAgentsFrontendApplicationContribution).inSingletonScope();

    bind(ContextVariableLabelProvider).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(ContextVariableLabelProvider);
    bind(ContextFileVariableLabelProvider).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(ContextFileVariableLabelProvider);

    bind(ChangeSetFileService).toSelf().inSingletonScope();
    bind(ChangeSetFileElementFactory).toFactory(ctx => (args: ChangeSetElementArgs) => {
        const container = ctx.container.createChild();
        container.bind(ChangeSetElementArgs).toConstantValue(args);
        container.bind(ChangeSetFileElement).toSelf().inSingletonScope();
        return container.get(ChangeSetFileElement);
    });
    bind(ChangeSetFileResourceResolver).toSelf().inSingletonScope();
    bind(ResourceResolver).toService(ChangeSetFileResourceResolver);
    bind(ToolCallChatResponseContentFactory).toSelf().inSingletonScope();
    bind(AIVariableContribution).to(FileChatVariableContribution).inSingletonScope();
    bind(AIVariableContribution).to(ContextSummaryVariableContribution).inSingletonScope();
});
