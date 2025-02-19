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

import { ContainerModule } from '@theia/core/shared/inversify';
import { ChatAgent, DefaultChatAgentId, FallbackChatAgentId } from '@theia/ai-chat/lib/common';
import { Agent, ToolProvider } from '@theia/ai-core/lib/common';
import { WorkspaceAgent } from './workspace-agent';
import { CoderAgent } from './coder-agent';
import { FileContentFunction, FileDiagonsticProvider, GetWorkspaceDirectoryStructure, GetWorkspaceFileList, WorkspaceFunctionScope } from './workspace-functions';
import { PreferenceContribution } from '@theia/core/lib/browser';
import { WorkspacePreferencesSchema } from './workspace-preferences';
import {
    ReplaceContentInFileProvider,
    WriteChangeToFileProvider
} from './file-changeset-functions';
import { OrchestratorChatAgent, OrchestratorChatAgentId } from '../common/orchestrator-chat-agent';
import { UniversalChatAgent, UniversalChatAgentId } from '../common/universal-chat-agent';
import { CommandChatAgent } from '../common/command-chat-agents';
import { ListChatContext, ResolveChatContext } from './context-functions';

export default new ContainerModule(bind => {
    bind(PreferenceContribution).toConstantValue({ schema: WorkspacePreferencesSchema });

    bind(WorkspaceAgent).toSelf().inSingletonScope();
    bind(Agent).toService(WorkspaceAgent);
    bind(ChatAgent).toService(WorkspaceAgent);

    bind(CoderAgent).toSelf().inSingletonScope();
    bind(Agent).toService(CoderAgent);
    bind(ChatAgent).toService(CoderAgent);

    bind(OrchestratorChatAgent).toSelf().inSingletonScope();
    bind(Agent).toService(OrchestratorChatAgent);
    bind(ChatAgent).toService(OrchestratorChatAgent);

    bind(UniversalChatAgent).toSelf().inSingletonScope();
    bind(Agent).toService(UniversalChatAgent);
    bind(ChatAgent).toService(UniversalChatAgent);

    bind(CommandChatAgent).toSelf().inSingletonScope();
    bind(Agent).toService(CommandChatAgent);
    bind(ChatAgent).toService(CommandChatAgent);

    bind(DefaultChatAgentId).toConstantValue({ id: OrchestratorChatAgentId });
    bind(FallbackChatAgentId).toConstantValue({ id: UniversalChatAgentId });

    bind(ToolProvider).to(GetWorkspaceFileList);
    bind(ToolProvider).to(FileContentFunction);
    bind(ToolProvider).to(GetWorkspaceDirectoryStructure);
    bind(ToolProvider).to(FileDiagonsticProvider);
    bind(WorkspaceFunctionScope).toSelf().inSingletonScope();

    bind(ToolProvider).to(WriteChangeToFileProvider);
    bind(ToolProvider).to(ReplaceContentInFileProvider);

    bind(ToolProvider).to(ListChatContext);
    bind(ToolProvider).to(ResolveChatContext);
});
