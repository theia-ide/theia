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

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { CommandContribution, MenuContribution, bindContributionProvider } from '@theia/core/lib/common';
import { FrontendApplicationContribution, KeybindingContribution, ServiceConnectionProvider } from '@theia/core/lib/browser';
import {
    OpenFileDialogFactory,
    SaveFileDialogFactory,
    OpenFileDialogProps,
    SaveFileDialogProps,
    createOpenFileDialogContainer,
    createSaveFileDialogContainer,
    OpenFileDialog,
    SaveFileDialog,
} from '@theia/filesystem/lib/browser';
import { StorageService } from '@theia/core/lib/browser/storage-service';
import { LabelProviderContribution } from '@theia/core/lib/browser/label-provider';
import { VariableContribution } from '@theia/variable-resolver/lib/browser';
import { WorkspaceServer, workspacePath, UntitledWorkspaceService, WorkspaceFileService } from '../common';
import { WorkspaceFrontendContribution } from './workspace-frontend-contribution';
import { WorkspaceOpenHandlerContribution, WorkspaceService } from './workspace-service';
import { WorkspaceCommandContribution, FileMenuContribution, EditMenuContribution } from './workspace-commands';
import { WorkspaceVariableContribution } from './workspace-variable-contribution';
import { WorkspaceStorageService } from './workspace-storage-service';
import { WorkspaceUriLabelProviderContribution } from './workspace-uri-contribution';
import { bindWorkspacePreferences } from './workspace-preferences';
import { QuickOpenWorkspace } from './quick-open-workspace';
import { WorkspaceDeleteHandler } from './workspace-delete-handler';
import { WorkspaceDuplicateHandler } from './workspace-duplicate-handler';
import { WorkspaceUtils } from './workspace-utils';
import { WorkspaceCompareHandler } from './workspace-compare-handler';
import { DiffService } from './diff-service';
import { JsonSchemaContribution } from '@theia/core/lib/browser/json-schema-store';
import { WorkspaceSchemaUpdater } from './workspace-schema-updater';
import { WorkspaceBreadcrumbsContribution } from './workspace-breadcrumbs-contribution';
import { FilepathBreadcrumbsContribution } from '@theia/filesystem/lib/browser/breadcrumbs/filepath-breadcrumbs-contribution';
import { WorkspaceTrustService } from './workspace-trust-service';
import { bindWorkspaceTrustPreferences } from './workspace-trust-preferences';
import { UserWorkingDirectoryProvider } from '@theia/core/lib/browser/user-working-directory-provider';
import { WorkspaceUserWorkingDirectoryProvider } from './workspace-user-working-directory-provider';
import { WindowTitleUpdater } from '@theia/core/lib/browser/window/window-title-updater';
import { WorkspaceWindowTitleUpdater } from './workspace-window-title-updater';
import { CanonicalUriService } from './canonical-uri-service';

export default new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound, rebind: interfaces.Rebind) => {
    bindWorkspacePreferences(bind);
    bindWorkspaceTrustPreferences(bind);
    bindContributionProvider(bind, WorkspaceOpenHandlerContribution);

    bind(WorkspaceService).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(WorkspaceService);

    bind(CanonicalUriService).toSelf().inSingletonScope();
    bind(WorkspaceServer).toDynamicValue(ctx =>
        ServiceConnectionProvider.createLocalProxy<WorkspaceServer>(ctx.container, workspacePath)
    ).inSingletonScope();

    bind(WorkspaceFrontendContribution).toSelf().inSingletonScope();
    for (const identifier of [FrontendApplicationContribution, CommandContribution, KeybindingContribution, MenuContribution]) {
        bind(identifier).toService(WorkspaceFrontendContribution);
    }

    bind(OpenFileDialogFactory).toFactory(ctx =>
        (props: OpenFileDialogProps) =>
            createOpenFileDialogContainer(ctx.container, props).get(OpenFileDialog)
    );

    bind(SaveFileDialogFactory).toFactory(ctx =>
        (props: SaveFileDialogProps) =>
            createSaveFileDialogContainer(ctx.container, props).get(SaveFileDialog)
    );

    bind(WorkspaceCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(WorkspaceCommandContribution);
    bind(FileMenuContribution).toSelf().inSingletonScope();
    bind(MenuContribution).toService(FileMenuContribution);
    bind(EditMenuContribution).toSelf().inSingletonScope();
    bind(MenuContribution).toService(EditMenuContribution);
    bind(WorkspaceDeleteHandler).toSelf().inSingletonScope();
    bind(WorkspaceDuplicateHandler).toSelf().inSingletonScope();
    bind(WorkspaceCompareHandler).toSelf().inSingletonScope();
    bind(DiffService).toSelf().inSingletonScope();

    bind(WorkspaceStorageService).toSelf().inSingletonScope();
    rebind(StorageService).toService(WorkspaceStorageService);

    bind(LabelProviderContribution).to(WorkspaceUriLabelProviderContribution).inSingletonScope();
    bind(WorkspaceVariableContribution).toSelf().inSingletonScope();
    bind(VariableContribution).toService(WorkspaceVariableContribution);

    bind(QuickOpenWorkspace).toSelf().inSingletonScope();

    bind(WorkspaceUtils).toSelf().inSingletonScope();
    bind(WorkspaceFileService).toSelf().inSingletonScope();
    bind(UntitledWorkspaceService).toSelf().inSingletonScope();

    bind(WorkspaceSchemaUpdater).toSelf().inSingletonScope();
    bind(JsonSchemaContribution).toService(WorkspaceSchemaUpdater);
    rebind(FilepathBreadcrumbsContribution).to(WorkspaceBreadcrumbsContribution).inSingletonScope();

    bind(WorkspaceTrustService).toSelf().inSingletonScope();
    rebind(UserWorkingDirectoryProvider).to(WorkspaceUserWorkingDirectoryProvider).inSingletonScope();

    rebind(WindowTitleUpdater).to(WorkspaceWindowTitleUpdater).inSingletonScope();
});
