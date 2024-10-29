// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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

import '../../src/browser/style/index.css';

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { CommandContribution, MenuContribution, ResourceResolver } from '@theia/core/lib/common';
import {
    WebSocketConnectionProvider,
    FrontendApplicationContribution,
    } from '@theia/core/lib/browser';
import { TabBarToolbarContribution } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { Git, GitPath, GitWatcher, GitWatcherPath, GitWatcherServer, GitWatcherServerProxy, ReconnectingGitWatcherServer } from '../common';
import { GitContribution } from './git-contribution';
import { bindGitDiffModule } from './diff/git-diff-frontend-module';
import { bindGitHistoryModule } from './history/git-history-frontend-module';
import { GitResourceResolver } from './git-resource-resolver';
import { GitRepositoryProvider } from './git-repository-provider';
import { GitQuickOpenService } from './git-quick-open-service';
import { bindGitPreferences } from './git-preferences';
import { bindDirtyDiff } from './dirty-diff/dirty-diff-module';
import { bindBlame } from './blame/blame-module';
import { GitRepositoryTracker } from './git-repository-tracker';
import { GitCommitMessageValidator } from './git-commit-message-validator';
import { GitSyncService } from './git-sync-service';
import { GitErrorHandler } from './git-error-handler';
import { GitScmProvider, GitScmProviderOptions } from './git-scm-provider';
import { ColorContribution } from '@theia/core/lib/browser/color-application-contribution';
import { ScmHistorySupport } from '@theia/scm-extra/lib/browser/history/scm-history-widget';
import { ScmHistoryProvider } from '@theia/scm-extra/lib/browser/history';
import { GitHistorySupport } from './history/git-history-support';
import { GitDecorationProvider } from './git-decoration-provider';
import { GitFileSystemProvider } from './git-file-system-provider';
import { GitFileServiceContribution } from './git-file-service-contribution';
import { FileServiceContribution } from '@theia/filesystem/lib/browser/file-service';

export default new ContainerModule(bind => {
    bindGitPreferences(bind);
    bindGitDiffModule(bind);
    bindGitHistoryModule(bind);
    bindDirtyDiff(bind);
    bindBlame(bind);
    bind(GitRepositoryTracker).toSelf().inSingletonScope();
    bind(GitWatcherServerProxy).toDynamicValue(context => WebSocketConnectionProvider.createProxy(context.container, GitWatcherPath)).inSingletonScope();
    bind(GitWatcherServer).to(ReconnectingGitWatcherServer).inSingletonScope();
    bind(GitWatcher).toSelf().inSingletonScope();
    bind(Git).toDynamicValue(context => WebSocketConnectionProvider.createProxy(context.container, GitPath)).inSingletonScope();

    bind(GitContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(GitContribution);
    bind(MenuContribution).toService(GitContribution);
    bind(FrontendApplicationContribution).toService(GitContribution);
    bind(TabBarToolbarContribution).toService(GitContribution);
    bind(ColorContribution).toService(GitContribution);

    bind(GitResourceResolver).toSelf().inSingletonScope();
    bind(ResourceResolver).toService(GitResourceResolver);

    bind(GitScmProvider.Factory).toFactory(createGitScmProviderFactory);
    bind(GitRepositoryProvider).toSelf().inSingletonScope();
    bind(GitDecorationProvider).toSelf().inSingletonScope();
    bind(GitQuickOpenService).toSelf().inSingletonScope();

    bind(GitCommitMessageValidator).toSelf().inSingletonScope();

    bind(GitSyncService).toSelf().inSingletonScope();
    bind(GitErrorHandler).toSelf().inSingletonScope();

    bind(GitFileSystemProvider).toSelf().inSingletonScope();
    bind(GitFileServiceContribution).toDynamicValue(ctx => new GitFileServiceContribution(ctx.container)).inSingletonScope();
    bind(FileServiceContribution).toService(GitFileServiceContribution);
});

export function createGitScmProviderFactory(ctx: interfaces.Context): GitScmProvider.Factory {
    return (options: GitScmProviderOptions) => {
        const container = ctx.container.createChild();
        container.bind(GitScmProviderOptions).toConstantValue(options);
        container.bind(GitScmProvider).toSelf().inSingletonScope();
        container.bind(GitHistorySupport).toSelf().inSingletonScope();
        container.bind(ScmHistorySupport).toService(GitHistorySupport);
        const provider = container.get(GitScmProvider);
        const historySupport = container.get(GitHistorySupport);
        (provider as ScmHistoryProvider).historySupport = historySupport;
        return provider;
    };
}
