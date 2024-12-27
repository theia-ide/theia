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
import { ChatAgent } from '@theia/ai-chat/lib/common';
import { Agent, ToolProvider } from '@theia/ai-core/lib/common';
import { WorkspaceAgent } from './workspace-agent';
import { CoderAgent } from './coder-agent';
import { FileContentFunction, GetWorkspaceDirectoryStructure, GetWorkspaceFileList, WorkspaceFunctionScope } from './workspace-functions';
import { PreferenceContribution } from '@theia/core/lib/browser';
import { WorkspacePreferencesSchema } from './workspace-preferences';

import {
    InitializeChangeSetProvider,
    RemoveFileChangeProvider,
    GetChangeSetProvider,
    ListChangedFilesProvider,
    GetFileChangesProvider,
    ApplyChangeSetProvider
} from './file-changeset-functions';
import { FileChangeSetService } from './file-changeset-service';
import { WriteToFileChangeProvider } from './replace-changeset-functions';
import { ContentChangeApplier, ContentChangeApplierService } from './content-change-applier-service';
import { bindContributionProvider } from '@theia/core';
import { ReplaceContentChangeApplier } from './replace-content-change-applier';

export default new ContainerModule(bind => {
    bind(PreferenceContribution).toConstantValue({ schema: WorkspacePreferencesSchema });
    bind(WorkspaceAgent).toSelf().inSingletonScope();
    bind(Agent).toService(WorkspaceAgent);
    bind(ChatAgent).toService(WorkspaceAgent);
    bind(CoderAgent).toSelf().inSingletonScope();
    bind(Agent).toService(CoderAgent);
    bind(ChatAgent).toService(CoderAgent);
    bind(ToolProvider).to(GetWorkspaceFileList);
    bind(ToolProvider).to(FileContentFunction);
    bind(ToolProvider).to(GetWorkspaceDirectoryStructure);
    bind(WorkspaceFunctionScope).toSelf().inSingletonScope();

    bindContributionProvider(bind, ContentChangeApplier);
    bind(ContentChangeApplier).to(ReplaceContentChangeApplier);
    bind(ContentChangeApplierService).toSelf().inSingletonScope();
    bind(FileChangeSetService).toSelf().inSingletonScope();
    bind(ToolProvider).to(InitializeChangeSetProvider);
    bind(ToolProvider).to(RemoveFileChangeProvider);
    bind(ToolProvider).to(GetChangeSetProvider);
    bind(ToolProvider).to(ListChangedFilesProvider);
    bind(ToolProvider).to(GetFileChangesProvider);
    bind(ToolProvider).to(ApplyChangeSetProvider);
    bind(ToolProvider).to(WriteToFileChangeProvider);
});
