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
import { inject, injectable } from '@theia/core/shared/inversify';
import URI from '@theia/core/lib/common/uri';
import {
    Command,
    CommandContribution,
    CommandRegistry,
    DisposableCollection,
    MenuAction,
    MenuContribution,
    MenuModelRegistry,
    MessageService,
    Mutable
} from '@theia/core';
import { codicon, DiffUris, Widget, open, OpenerService } from '@theia/core/lib/browser';
import {
    TabBarToolbarAction,
    TabBarToolbarContribution,
    TabBarToolbarRegistry
} from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { EditorContextMenu, EditorManager, EditorOpenerOptions, EditorWidget } from '@theia/editor/lib/browser';
import { Git, GitFileChange, GitFileStatus, GitWatcher, Repository } from '../common';
import { GitRepositoryTracker } from './git-repository-tracker';
import { GitAction, GitQuickOpenService } from './git-quick-open-service';
import { GitSyncService } from './git-sync-service';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { GitRepositoryProvider } from './git-repository-provider';
import { GitErrorHandler } from '../browser/git-error-handler';
import { ScmWidget } from '@theia/scm/lib/browser/scm-widget';
import { ScmTreeWidget } from '@theia/scm/lib/browser/scm-tree-widget';
import { ScmCommand, ScmResource } from '@theia/scm/lib/browser/scm-provider';
import { LineRange } from '@theia/scm/lib/browser/dirty-diff/diff-computer';
import { DirtyDiffWidget, SCM_CHANGE_TITLE_MENU } from '@theia/scm/lib/browser/dirty-diff/dirty-diff-widget';
import { ProgressService } from '@theia/core/lib/common/progress-service';
import { GitPreferences } from './git-preferences';
import { ColorContribution } from '@theia/core/lib/browser/color-application-contribution';
import { ColorRegistry } from '@theia/core/lib/browser/color-registry';
import { ScmInputIssueType } from '@theia/scm/lib/browser/scm-input';
import { DecorationsService } from '@theia/core/lib/browser/decorations-service';
import { GitDecorationProvider } from './git-decoration-provider';
import { nls } from '@theia/core/lib/common/nls';

export namespace GIT_COMMANDS {

    const GIT_CATEGORY_KEY = 'vscode.git/package/displayName';
    const GIT_CATEGORY = 'Git';

    export const CLONE = Command.toLocalizedCommand({
        id: 'git.clone',
        category: GIT_CATEGORY,
        label: 'Clone...'
    }, 'vscode.git/package/command.clone', GIT_CATEGORY_KEY);
    export const FETCH = Command.toLocalizedCommand({
        id: 'git.fetch',
        category: GIT_CATEGORY,
        label: 'Fetch...'
    }, 'vscode.git/package/command.fetch', GIT_CATEGORY_KEY);
    export const PULL_DEFAULT = Command.toLocalizedCommand({
        id: 'git.pull.default',
        category: GIT_CATEGORY,
        label: 'Pull'
    }, 'vscode.git/package/command.pull', GIT_CATEGORY_KEY);
    export const PULL_DEFAULT_FAVORITE: Command = {
        id: PULL_DEFAULT.id + '.favorite',
        label: PULL_DEFAULT.label,
        originalLabel: PULL_DEFAULT.originalLabel
    };
    export const PULL = Command.toLocalizedCommand({
        id: 'git.pull',
        category: GIT_CATEGORY,
        label: 'Pull from...'
    }, 'vscode.git/package/command.pullFrom', GIT_CATEGORY_KEY);
    export const PUSH_DEFAULT = Command.toLocalizedCommand({
        id: 'git.push.default',
        category: GIT_CATEGORY,
        label: 'Push'
    }, 'vscode.git/package/command.push', GIT_CATEGORY_KEY);
    export const PUSH_DEFAULT_FAVORITE: Command = {
        id: PUSH_DEFAULT.id + '.favorite',
        label: PUSH_DEFAULT.label,
        originalLabel: PUSH_DEFAULT.originalLabel
    };
    export const PUSH = Command.toLocalizedCommand({
        id: 'git.push',
        category: GIT_CATEGORY,
        label: 'Push to...'
    }, 'vscode.git/package/command.pushTo', GIT_CATEGORY_KEY);
    export const MERGE = Command.toLocalizedCommand({
        id: 'git.merge',
        category: GIT_CATEGORY,
        label: 'Merge...'
    }, 'vscode.git/package/command.merge', GIT_CATEGORY_KEY);
    export const CHECKOUT = Command.toLocalizedCommand({
        id: 'git.checkout',
        category: GIT_CATEGORY,
        label: 'Checkout'
    }, 'vscode.git/package/command.checkout', GIT_CATEGORY_KEY);
    export const COMMIT = {
        ...Command.toLocalizedCommand({
            id: 'git.commit.all',
            label: 'Commit',
            iconClass: codicon('check')
        }, 'vscode.git/package/command.commit'),
        tooltip: 'Commit all the staged changes',
    };
    export const COMMIT_ADD_SIGN_OFF = Command.toLocalizedCommand({
        id: 'git-commit-add-sign-off',
        label: 'Add Signed-off-by',
        category: GIT_CATEGORY,
        iconClass: codicon('edit')
    }, 'theia/git/addSignedOff', GIT_CATEGORY_KEY);
    export const COMMIT_AMEND = {
        id: 'git.commit.amend'
    };
    export const COMMIT_SIGN_OFF = {
        id: 'git.commit.signOff'
    };
    export const OPEN_FILE = Command.toLocalizedCommand({
        id: 'git.open.file',
        category: GIT_CATEGORY,
        label: 'Open File',
        iconClass: codicon('go-to-file')
    }, 'vscode.git/package/command.openFile', GIT_CATEGORY_KEY);
    export const OPEN_CHANGED_FILE = Command.toLocalizedCommand({
        id: 'git.open.changed.file',
        category: GIT_CATEGORY,
        label: 'Open File',
        iconClass: codicon('go-to-file')
    }, 'vscode.git/package/command.openFile', GIT_CATEGORY_KEY);
    export const OPEN_CHANGES = Command.toLocalizedCommand({
        id: 'git.open.changes',
        category: GIT_CATEGORY,
        label: 'Open Changes',
        iconClass: codicon('git-compare')
    }, 'vscode.git/package/command.openChange', GIT_CATEGORY_KEY);
    export const SYNC = Command.toLocalizedCommand({
        id: 'git.sync',
        category: GIT_CATEGORY,
        label: 'Sync'
    }, 'vscode.git/package/command.sync', GIT_CATEGORY_KEY);
    export const PUBLISH = Command.toLocalizedCommand({
        id: 'git.publish',
        category: GIT_CATEGORY,
        label: 'Publish Branch'
    }, 'vscode.git/package/command.publish', GIT_CATEGORY_KEY);
    export const STAGE = Command.toLocalizedCommand({
        id: 'git.stage',
        category: GIT_CATEGORY,
        label: 'Stage Changes',
        iconClass: codicon('add')
    }, 'vscode.git/package/command.stage', GIT_CATEGORY_KEY);
    export const STAGE_ALL = Command.toLocalizedCommand({
        id: 'git.stage.all',
        category: GIT_CATEGORY,
        label: 'Stage All Changes',
        iconClass: codicon('add')
    }, 'vscode.git/package/command.stageAll', GIT_CATEGORY_KEY);
    export const STAGE_CHANGE = Command.toLocalizedCommand({
        id: 'git.stage.change',
        category: GIT_CATEGORY,
        label: 'Stage Change',
        iconClass: codicon('add')
    }, 'vscode.git/package/command.stageChange', GIT_CATEGORY_KEY);
    export const REVERT_CHANGE = Command.toLocalizedCommand({
        id: 'git.revert.change',
        category: GIT_CATEGORY,
        label: 'Revert Change',
        iconClass: codicon('discard')
    }, 'vscode.git/package/command.revertChange', GIT_CATEGORY_KEY);
    export const UNSTAGE = Command.toLocalizedCommand({
        id: 'git.unstage',
        category: GIT_CATEGORY,
        label: 'Unstage Changes',
        iconClass: codicon('dash')
    }, 'vscode.git/package/command.unstage', GIT_CATEGORY_KEY);
    export const UNSTAGE_ALL = Command.toLocalizedCommand({
        id: 'git.unstage.all',
        category: GIT_CATEGORY,
        label: 'Unstage All',
        iconClass: codicon('dash')
    }, 'vscode.git/package/command.unstageAll', GIT_CATEGORY_KEY);
    export const DISCARD = Command.toLocalizedCommand({
        id: 'git.discard',
        iconClass: codicon('discard'),
        category: GIT_CATEGORY,
        label: 'Discard Changes'
    }, 'vscode.git/package/command.clean', GIT_CATEGORY_KEY);
    export const DISCARD_ALL = Command.toLocalizedCommand({
        id: 'git.discard.all',
        category: GIT_CATEGORY,
        label: 'Discard All Changes',
        iconClass: codicon('discard')
    }, 'vscode.git/package/command.cleanAll', GIT_CATEGORY_KEY);
    export const STASH = Command.toLocalizedCommand({
        id: 'git.stash',
        category: GIT_CATEGORY,
        label: 'Stash...'
    }, 'vscode.git/package/command.stash', GIT_CATEGORY_KEY);
    export const APPLY_STASH = Command.toLocalizedCommand({
        id: 'git.stash.apply',
        category: GIT_CATEGORY,
        label: 'Apply Stash...'
    }, 'vscode.git/package/command.stashApply', GIT_CATEGORY_KEY);
    export const APPLY_LATEST_STASH = Command.toLocalizedCommand({
        id: 'git.stash.apply.latest',
        category: GIT_CATEGORY,
        label: 'Apply Latest Stash'
    }, 'vscode.git/package/command.stashApplyLatest', GIT_CATEGORY_KEY);
    export const POP_STASH = Command.toLocalizedCommand({
        id: 'git.stash.pop',
        category: GIT_CATEGORY,
        label: 'Pop Stash...'
    }, 'vscode.git/package/command.stashPop', GIT_CATEGORY_KEY);
    export const POP_LATEST_STASH = Command.toLocalizedCommand({
        id: 'git.stash.pop.latest',
        category: GIT_CATEGORY,
        label: 'Pop Latest Stash'
    }, 'vscode.git/package/command.stashPopLatest', GIT_CATEGORY_KEY);
    export const DROP_STASH = Command.toLocalizedCommand({
        id: 'git.stash.drop',
        category: GIT_CATEGORY,
        label: 'Drop Stash...'
    }, 'vscode.git/package/command.stashDrop', GIT_CATEGORY_KEY);
    export const REFRESH = Command.toLocalizedCommand({
        id: 'git-refresh',
        label: 'Refresh',
        category: GIT_CATEGORY,
        iconClass: codicon('refresh')
    }, 'vscode.git/package/command.refresh', GIT_CATEGORY_KEY);
    export const INIT_REPOSITORY = Command.toLocalizedCommand({
        id: 'git-init',
        label: 'Initialize Repository',
        category: GIT_CATEGORY,
        iconClass: codicon('add')
    }, 'vscode.git/package/command.init', GIT_CATEGORY_KEY);
}
export namespace GIT_MENUS {
    // Top level Groups
    export const FAV_GROUP = '2_favorites';
    export const COMMANDS_GROUP = '3_commands';

    export const SUBMENU_COMMIT = {
        group: COMMANDS_GROUP,
        label: nls.localize('vscode.git/package/submenu.commit', 'Commit'),
        menuGroups: ['1_commit'],
    };
    export const SUBMENU_CHANGES = {
        group: COMMANDS_GROUP,
        label: nls.localize('vscode.git/package/submenu.changes', 'Changes'),
        menuGroups: ['1_changes']
    };
    export const SUBMENU_PULL_PUSH = {
        group: COMMANDS_GROUP,
        label: nls.localize('vscode.git/package/submenu.pullpush', 'Pull, Push'),
        menuGroups: ['2_pull', '3_push', '4_fetch']
    };
    export const SUBMENU_STASH = {
        group: COMMANDS_GROUP,
        label: nls.localize('vscode.git/package/submenu.stash', 'Stash'),
        menuGroups: ['1_stash']
    };
}
@injectable()
export class GitContribution implements CommandContribution, MenuContribution, TabBarToolbarContribution, ColorContribution {

    static GIT_CHECKOUT = 'git.checkout';
    static GIT_SYNC_STATUS = 'git-sync-status';

    protected toDispose = new DisposableCollection();

    @inject(OpenerService) protected openerService: OpenerService;
    @inject(MessageService) protected messageService: MessageService;
    @inject(EditorManager) protected readonly editorManager: EditorManager;
    @inject(GitQuickOpenService) protected readonly quickOpenService: GitQuickOpenService;
    @inject(GitRepositoryTracker) protected readonly repositoryTracker: GitRepositoryTracker;
    @inject(GitSyncService) protected readonly syncService: GitSyncService;
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;
    @inject(GitRepositoryProvider) protected readonly repositoryProvider: GitRepositoryProvider;
    @inject(Git) protected readonly git: Git;
    @inject(GitErrorHandler) protected readonly gitErrorHandler: GitErrorHandler;
    @inject(CommandRegistry) protected readonly commands: CommandRegistry;
    @inject(ProgressService) protected readonly progressService: ProgressService;
    @inject(GitPreferences) protected readonly gitPreferences: GitPreferences;
    @inject(DecorationsService) protected readonly decorationsService: DecorationsService;
    @inject(GitDecorationProvider) protected readonly gitDecorationProvider: GitDecorationProvider;
    @inject(GitWatcher) protected readonly gitWatcher: GitWatcher;

    onStart(): void {
        this.updateStatusBar();
        this.repositoryTracker.onGitEvent(() => this.updateStatusBar());
        this.syncService.onDidChange(() => this.updateStatusBar());
        this.decorationsService.registerDecorationsProvider(this.gitDecorationProvider);
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(EditorContextMenu.NAVIGATION, {
            commandId: GIT_COMMANDS.OPEN_FILE.id
        });
        menus.registerMenuAction(EditorContextMenu.NAVIGATION, {
            commandId: GIT_COMMANDS.OPEN_CHANGES.id
        });

        const registerResourceAction = (group: string, action: MenuAction) => {
            menus.registerMenuAction(ScmTreeWidget.RESOURCE_INLINE_MENU, action);
            menus.registerMenuAction([...ScmTreeWidget.RESOURCE_CONTEXT_MENU, group], action);
        };

        registerResourceAction('navigation', {
            commandId: GIT_COMMANDS.OPEN_CHANGED_FILE.id,
            when: 'scmProvider == git && scmResourceGroup == workingTree || scmProvider == git && scmResourceGroup == untrackedChanges'
        });
        registerResourceAction('1_modification', {
            commandId: GIT_COMMANDS.DISCARD.id,
            when: 'scmProvider == git && scmResourceGroup == workingTree || scmProvider == git && scmResourceGroup == untrackedChanges'
        });
        registerResourceAction('1_modification', {
            commandId: GIT_COMMANDS.STAGE.id,
            when: 'scmProvider == git && scmResourceGroup == workingTree || scmProvider == git && scmResourceGroup == untrackedChanges'
        });

        registerResourceAction('navigation', {
            commandId: GIT_COMMANDS.OPEN_CHANGED_FILE.id,
            when: 'scmProvider == git && scmResourceGroup == index'
        });
        registerResourceAction('1_modification', {
            commandId: GIT_COMMANDS.UNSTAGE.id,
            when: 'scmProvider == git && scmResourceGroup == index'
        });

        registerResourceAction('navigation', {
            commandId: GIT_COMMANDS.OPEN_CHANGED_FILE.id,
            when: 'scmProvider == git && scmResourceGroup == merge'
        });
        registerResourceAction('1_modification', {
            commandId: GIT_COMMANDS.DISCARD.id,
            when: 'scmProvider == git && scmResourceGroup == merge'
        });
        registerResourceAction('1_modification', {
            commandId: GIT_COMMANDS.STAGE.id,
            when: 'scmProvider == git && scmResourceGroup == merge'
        });

        const registerResourceFolderAction = (group: string, action: MenuAction) => {
            menus.registerMenuAction(ScmTreeWidget.RESOURCE_FOLDER_INLINE_MENU, action);
            menus.registerMenuAction([...ScmTreeWidget.RESOURCE_FOLDER_CONTEXT_MENU, group], action);
        };

        registerResourceFolderAction('1_modification', {
            commandId: GIT_COMMANDS.DISCARD.id,
            when: 'scmProvider == git && scmResourceGroup == workingTree || scmProvider == git && scmResourceGroup == untrackedChanges'
        });
        registerResourceFolderAction('1_modification', {
            commandId: GIT_COMMANDS.STAGE.id,
            when: 'scmProvider == git && scmResourceGroup == workingTree || scmProvider == git && scmResourceGroup == untrackedChanges'
        });

        registerResourceFolderAction('1_modification', {
            commandId: GIT_COMMANDS.UNSTAGE.id,
            when: 'scmProvider == git && scmResourceGroup == index'
        });

        registerResourceFolderAction('1_modification', {
            commandId: GIT_COMMANDS.DISCARD.id,
            when: 'scmProvider == git && scmResourceGroup == merge'
        });
        registerResourceFolderAction('1_modification', {
            commandId: GIT_COMMANDS.STAGE.id,
            when: 'scmProvider == git && scmResourceGroup == merge'
        });

        const registerResourceGroupAction = (group: string, action: MenuAction) => {
            menus.registerMenuAction(ScmTreeWidget.RESOURCE_GROUP_INLINE_MENU, action);
            menus.registerMenuAction([...ScmTreeWidget.RESOURCE_GROUP_CONTEXT_MENU, group], action);
        };

        registerResourceGroupAction('1_modification', {
            commandId: GIT_COMMANDS.STAGE_ALL.id,
            when: 'scmProvider == git && scmResourceGroup == merge',
        });
        registerResourceGroupAction('1_modification', {
            commandId: GIT_COMMANDS.UNSTAGE_ALL.id,
            when: 'scmProvider == git && scmResourceGroup == index',
        });
        registerResourceGroupAction('1_modification', {
            commandId: GIT_COMMANDS.STAGE_ALL.id,
            when: 'scmProvider == git && scmResourceGroup == workingTree || scmProvider == git && scmResourceGroup == untrackedChanges',
        });
        registerResourceGroupAction('1_modification', {
            commandId: GIT_COMMANDS.DISCARD_ALL.id,
            when: 'scmProvider == git && scmResourceGroup == workingTree || scmProvider == git && scmResourceGroup == untrackedChanges',
        });

        menus.registerMenuAction(SCM_CHANGE_TITLE_MENU, {
            commandId: GIT_COMMANDS.STAGE_CHANGE.id,
            when: 'scmProvider == git'
        });
        menus.registerMenuAction(SCM_CHANGE_TITLE_MENU, {
            commandId: GIT_COMMANDS.REVERT_CHANGE.id,
            when: 'scmProvider == git'
        });
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(GIT_COMMANDS.FETCH, {
            execute: () => this.withProgress(() => this.quickOpenService.fetch()),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.PULL_DEFAULT, {
            execute: () => this.withProgress(() => this.quickOpenService.performDefaultGitAction(GitAction.PULL)),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.PULL_DEFAULT_FAVORITE, {
            execute: () => registry.executeCommand(GIT_COMMANDS.PULL_DEFAULT.id),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.PULL, {
            execute: () => this.withProgress(() => this.quickOpenService.pull()),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.PUSH_DEFAULT, {
            execute: () => this.withProgress(() => this.quickOpenService.performDefaultGitAction(GitAction.PUSH)),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.PUSH_DEFAULT_FAVORITE, {
            execute: () => registry.executeCommand(GIT_COMMANDS.PUSH_DEFAULT.id),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.PUSH, {
            execute: () => this.withProgress(() => this.quickOpenService.push()),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.MERGE, {
            execute: () => this.withProgress(() => this.quickOpenService.merge()),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.CHECKOUT, {
            execute: () => this.withProgress(() => this.quickOpenService.checkout()),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.COMMIT_SIGN_OFF, {
            execute: () => this.withProgress(() => this.commit({ signOff: true })),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.COMMIT_AMEND, {
            execute: () => this.withProgress(async () => this.amend()),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.STAGE_ALL, {
            execute: () => {
                const provider = this.repositoryProvider.selectedScmProvider;
                if (provider) {
                    if (this.gitPreferences['git.untrackedChanges'] === 'mixed') {
                        return this.withProgress(() => provider.stageAll());
                    } else {
                        const toStage = provider.unstagedChanges.concat(provider.mergeChanges)
                            .filter(change => change.status !== GitFileStatus.New)
                            .map(change => change.uri.toString());
                        return this.withProgress(() => provider.stage(toStage));
                    }
                }

            },
            isEnabled: () => {
                const provider = this.repositoryProvider.selectedScmProvider;
                if (!provider) { return false; }
                if (this.gitPreferences['git.untrackedChanges'] === 'mixed') {
                    return Boolean(provider.unstagedChanges.length || provider.mergeChanges.length);
                } else {
                    const isNotUntracked = (change: GitFileChange) => change.status !== GitFileStatus.New;
                    return Boolean(provider.unstagedChanges.filter(isNotUntracked).length || provider.mergeChanges.filter(isNotUntracked).length);
                }
            }
        });
        registry.registerCommand(GIT_COMMANDS.UNSTAGE_ALL, {
            execute: () => {
                const provider = this.repositoryProvider.selectedScmProvider;
                return provider && this.withProgress(() => provider.unstageAll());
            },
            isEnabled: () => !!this.repositoryProvider.selectedScmProvider
        });
        registry.registerCommand(GIT_COMMANDS.DISCARD_ALL, {
            execute: () => {
                const provider = this.repositoryProvider.selectedScmProvider;
                return provider && this.withProgress(() => provider.discardAll());
            },
            isEnabled: () => !!this.repositoryProvider.selectedScmProvider
        });
        registry.registerCommand(GIT_COMMANDS.OPEN_FILE, {
            execute: widget => this.openFile(widget),
            isEnabled: widget => !!this.getOpenFileOptions(widget),
            isVisible: widget => !!this.getOpenFileOptions(widget)
        });
        registry.registerCommand(GIT_COMMANDS.OPEN_CHANGES, {
            execute: widget => this.openChanges(widget),
            isEnabled: widget => !!this.getOpenChangesOptions(widget),
            isVisible: widget => !!this.getOpenChangesOptions(widget)
        });
        registry.registerCommand(GIT_COMMANDS.SYNC, {
            execute: () => this.withProgress(() => this.syncService.sync()),
            isEnabled: () => this.syncService.canSync(),
            isVisible: () => this.syncService.canSync()
        });
        registry.registerCommand(GIT_COMMANDS.PUBLISH, {
            execute: () => this.withProgress(() => this.syncService.publish()),
            isEnabled: () => this.syncService.canPublish(),
            isVisible: () => this.syncService.canPublish()
        });
        registry.registerCommand(GIT_COMMANDS.CLONE, {
            isEnabled: () => this.workspaceService.opened,
            execute: (url?: string, folder?: string, branch?: string) =>
                this.quickOpenService.clone(url, folder, branch)
        });
        registry.registerCommand(GIT_COMMANDS.COMMIT, {
            execute: () => this.withProgress(() => this.commit()),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.REFRESH, {
            execute: () => this.withProgress(() => this.repositoryProvider.refresh())
        });
        registry.registerCommand(GIT_COMMANDS.COMMIT_ADD_SIGN_OFF, {
            execute: async () => this.withProgress(() => this.addSignOff()),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.UNSTAGE, {
            execute: (...arg: ScmResource[]) => {
                const resources = arg.filter(r => r.sourceUri).map(r => r.sourceUri.toString());
                const provider = this.repositoryProvider.selectedScmProvider;
                return provider && this.withProgress(() => provider.unstage(resources));
            },
            isEnabled: (...arg: ScmResource[]) => !!this.repositoryProvider.selectedScmProvider
                && arg.some(r => r.sourceUri)
        });
        registry.registerCommand(GIT_COMMANDS.STAGE, {
            execute: (...arg: ScmResource[]) => {
                const resources = arg.filter(r => r.sourceUri).map(r => r.sourceUri.toString());
                const provider = this.repositoryProvider.selectedScmProvider;
                return provider && this.withProgress(() => provider.stage(resources));
            },
            isEnabled: (...arg: ScmResource[]) => !!this.repositoryProvider.selectedScmProvider
                && arg.some(r => r.sourceUri)
        });
        registry.registerCommand(GIT_COMMANDS.DISCARD, {
            execute: (...arg: ScmResource[]) => {
                const resources = arg.filter(r => r.sourceUri).map(r => r.sourceUri.toString());
                const provider = this.repositoryProvider.selectedScmProvider;
                return provider && this.withProgress(() => provider.discard(resources));
            },
            isEnabled: (...arg: ScmResource[]) => !!this.repositoryProvider.selectedScmProvider
                && arg.some(r => r.sourceUri)
        });
        registry.registerCommand(GIT_COMMANDS.OPEN_CHANGED_FILE, {
            execute: (...arg: ScmResource[]) => {
                for (const resource of arg) {
                    open(this.openerService, resource.sourceUri, { mode: 'reveal' }).catch(e => {
                        this.messageService.error(e.message);
                    });
                }
            }
        });
        registry.registerCommand(GIT_COMMANDS.STASH, {
            execute: () => this.quickOpenService.stash(),
            isEnabled: () => !!this.repositoryTracker.selectedRepository &&
                !!this.repositoryTracker.selectedRepositoryStatus &&
                this.repositoryTracker.selectedRepositoryStatus.changes.length > 0
        });
        registry.registerCommand(GIT_COMMANDS.APPLY_STASH, {
            execute: () => this.quickOpenService.applyStash(),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.APPLY_LATEST_STASH, {
            execute: () => this.quickOpenService.applyLatestStash(),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.POP_STASH, {
            execute: () => this.quickOpenService.popStash(),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.POP_LATEST_STASH, {
            execute: () => this.quickOpenService.popLatestStash(),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.DROP_STASH, {
            execute: () => this.quickOpenService.dropStash(),
            isEnabled: () => !!this.repositoryTracker.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.INIT_REPOSITORY, {
            execute: () => this.quickOpenService.initRepository(),
            isEnabled: widget => this.workspaceService.opened && (!widget || widget instanceof ScmWidget) && !this.repositoryProvider.selectedRepository,
            isVisible: widget => this.workspaceService.opened && (!widget || widget instanceof ScmWidget) && !this.repositoryProvider.selectedRepository
        });
        registry.registerCommand(GIT_COMMANDS.STAGE_CHANGE, {
            execute: (widget: DirtyDiffWidget) => this.withProgress(() => this.stageChange(widget)),
            isEnabled: widget => widget instanceof DirtyDiffWidget
        });
        registry.registerCommand(GIT_COMMANDS.REVERT_CHANGE, {
            execute: (widget: DirtyDiffWidget) => this.withProgress(() => this.revertChange(widget)),
            isEnabled: widget => widget instanceof DirtyDiffWidget
        });
    }
    async amend(): Promise<void> {
        {
            const scmRepository = this.repositoryProvider.selectedScmRepository;
            if (!scmRepository) {
                return;
            }

            try {
                const lastCommit = await scmRepository.provider.amendSupport.getLastCommit();
                if (lastCommit === undefined) {
                    scmRepository.input.issue = {
                        type: ScmInputIssueType.Error,
                        message: nls.localize('theia/git/noPreviousCommit', 'No previous commit to amend')
                    };
                    scmRepository.input.focus();
                    return;
                }
                const message = await this.quickOpenService.commitMessageForAmend();
                await this.commit({ message, amend: true });
            } catch (e) {
                if (!(e instanceof Error) || e.message !== 'User abort.') {
                    throw e;
                }
            }
        }
    }

    protected withProgress<T>(task: () => Promise<T>): Promise<T> {
        return this.progressService.withProgress('', 'scm', task);
    }

    registerToolbarItems(registry: TabBarToolbarRegistry): void {
        registry.registerItem({
            id: GIT_COMMANDS.OPEN_FILE.id,
            command: GIT_COMMANDS.OPEN_FILE.id,
            tooltip: GIT_COMMANDS.OPEN_FILE.label
        });
        registry.registerItem({
            id: GIT_COMMANDS.OPEN_CHANGES.id,
            command: GIT_COMMANDS.OPEN_CHANGES.id,
            tooltip: GIT_COMMANDS.OPEN_CHANGES.label
        });
        registry.registerItem({
            id: GIT_COMMANDS.INIT_REPOSITORY.id,
            command: GIT_COMMANDS.INIT_REPOSITORY.id,
            tooltip: GIT_COMMANDS.INIT_REPOSITORY.label
        });

        const registerItem = (item: Mutable<TabBarToolbarAction & { command: string }>) => {
            const commandId = item.command;
            const id = '__git.tabbar.toolbar.' + commandId;
            const command = this.commands.getCommand(commandId);
            this.commands.registerCommand({ id, iconClass: command && command.iconClass }, {
                execute: (widget, ...args) => widget instanceof ScmWidget && this.commands.executeCommand(commandId, ...args),
                isEnabled: (widget, ...args) => widget instanceof ScmWidget && this.commands.isEnabled(commandId, ...args),
                isVisible: (widget, ...args) =>
                    widget instanceof ScmWidget &&
                    this.commands.isVisible(commandId, ...args) &&
                    !!this.repositoryProvider.selectedRepository
            });
            item.command = id;
            registry.registerItem(item);
        };
        registerItem({
            id: GIT_COMMANDS.COMMIT.id,
            command: GIT_COMMANDS.COMMIT.id,
            tooltip: GIT_COMMANDS.COMMIT.label
        });
        registerItem({
            id: GIT_COMMANDS.REFRESH.id,
            command: GIT_COMMANDS.REFRESH.id,
            tooltip: GIT_COMMANDS.REFRESH.label
        });
        registerItem({
            id: GIT_COMMANDS.COMMIT_ADD_SIGN_OFF.id,
            command: GIT_COMMANDS.COMMIT_ADD_SIGN_OFF.id,
            tooltip: GIT_COMMANDS.COMMIT_ADD_SIGN_OFF.label
        });

        // Favorites menu group
        [GIT_COMMANDS.PULL_DEFAULT_FAVORITE, GIT_COMMANDS.PUSH_DEFAULT_FAVORITE].forEach((command, index) =>
            registerItem({
                id: command.id + '_fav',
                command: command.id,
                tooltip: command.label,
                group: GIT_MENUS.FAV_GROUP,
                priority: 100 - index
            })
        );

        registerItem({
            id: GIT_COMMANDS.COMMIT_AMEND.id,
            command: GIT_COMMANDS.COMMIT_AMEND.id,
            tooltip: nls.localize('vscode.git/package/command.commitStagedAmend', 'Commit (Amend)'),
            group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_COMMIT)
        });
        registerItem({
            id: GIT_COMMANDS.COMMIT_SIGN_OFF.id,
            command: GIT_COMMANDS.COMMIT_SIGN_OFF.id,
            tooltip: nls.localize('vscode.git/package/command.commitStagedSigned', 'Commit (Signed Off)'),
            group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_COMMIT)
        });
        [GIT_COMMANDS.PULL_DEFAULT, GIT_COMMANDS.PULL].forEach(command =>
            registerItem({
                id: command.id,
                command: command.id,
                tooltip: command.label,
                group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_PULL_PUSH)
            })
        );
        [GIT_COMMANDS.PUSH_DEFAULT, GIT_COMMANDS.PUSH].forEach(command =>
            registerItem({
                id: command.id,
                command: command.id,
                tooltip: command.label,
                group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_PULL_PUSH, 1)
            })
        );
        registerItem({
            id: GIT_COMMANDS.FETCH.id,
            command: GIT_COMMANDS.FETCH.id,
            tooltip: GIT_COMMANDS.FETCH.label,
            group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_PULL_PUSH, 2)
        });

        [
            GIT_COMMANDS.STASH, GIT_COMMANDS.APPLY_STASH,
            GIT_COMMANDS.APPLY_LATEST_STASH, GIT_COMMANDS.POP_STASH,
            GIT_COMMANDS.POP_LATEST_STASH, GIT_COMMANDS.DROP_STASH
        ].forEach((command, index) =>
            registerItem({
                id: command.id,
                command: command.id,
                tooltip: command.label,
                group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_STASH),
                priority: 100 - index
            })
        );
        registerItem({
            id: GIT_COMMANDS.STAGE_ALL.id,
            command: GIT_COMMANDS.STAGE_ALL.id,
            tooltip: GIT_COMMANDS.STAGE_ALL.label,
            group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_CHANGES),
            priority: 30
        });
        registerItem({
            id: GIT_COMMANDS.UNSTAGE_ALL.id,
            command: GIT_COMMANDS.UNSTAGE_ALL.id,
            tooltip: GIT_COMMANDS.UNSTAGE_ALL.label,
            group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_CHANGES),
            priority: 20
        });
        registerItem({
            id: GIT_COMMANDS.DISCARD_ALL.id,
            command: GIT_COMMANDS.DISCARD_ALL.id,
            tooltip: GIT_COMMANDS.DISCARD_ALL.label,
            group: this.asSubMenuItemOf(GIT_MENUS.SUBMENU_CHANGES),
            priority: 10
        });
        registerItem({
            id: GIT_COMMANDS.MERGE.id,
            command: GIT_COMMANDS.MERGE.id,
            tooltip: GIT_COMMANDS.MERGE.label,
            group: GIT_MENUS.COMMANDS_GROUP
        });
    }

    protected asSubMenuItemOf(submenu: { group: string; label: string; menuGroups: string[]; }, groupIdx: number = 0): string {
        return submenu.group + '/' + submenu.label + '/' + submenu.menuGroups[groupIdx];
    }

    protected hasConflicts(changes: GitFileChange[]): boolean {
        return changes.some(c => c.status === GitFileStatus.Conflicted);
    }

    protected allStaged(changes: GitFileChange[]): boolean {
        return !changes.some(c => !c.staged);
    }

    protected async openFile(widget?: Widget): Promise<EditorWidget | undefined> {
        const options = this.getOpenFileOptions(widget);
        return options && this.editorManager.open(options.uri, options.options);
    }

    protected getOpenFileOptions(widget?: Widget): GitOpenFileOptions | undefined {
        const ref = widget ? widget : this.editorManager.currentEditor;
        if (ref instanceof EditorWidget && DiffUris.isDiffUri(ref.editor.uri)) {
            const [, right] = DiffUris.decode(ref.editor.uri);
            const uri = right.withScheme('file');
            const selection = ref.editor.selection;
            return { uri, options: { selection, widgetOptions: { ref } } };
        }
        return undefined;
    }

    async openChanges(widget?: Widget): Promise<EditorWidget | undefined> {
        const options = this.getOpenChangesOptions(widget);
        if (options) {
            const provider = this.repositoryProvider.selectedScmProvider;
            return provider && provider.openChange(options.change, options.options);
        }
        return undefined;
    }

    protected getOpenChangesOptions(widget?: Widget): GitOpenChangesOptions | undefined {
        const provider = this.repositoryProvider.selectedScmProvider;
        if (!provider) {
            return undefined;
        }
        const ref = widget ? widget : this.editorManager.currentEditor;
        if (ref instanceof EditorWidget && !DiffUris.isDiffUri(ref.editor.uri)) {
            const uri = ref.editor.uri;
            const change = provider.findChange(uri);
            if (change && provider.getUriToOpen(change).toString() !== uri.toString()) {
                const selection = ref.editor.selection;
                return { change, options: { selection, widgetOptions: { ref } } };
            }
        }
        return undefined;
    }

    protected updateStatusBar(): void {
        const scmProvider = this.repositoryProvider.selectedScmProvider;
        if (!scmProvider) {
            return;
        }
        const statusBarCommands: ScmCommand[] = [];

        const checkoutCommand = this.getCheckoutStatusBarCommand();
        if (checkoutCommand) {
            statusBarCommands.push(checkoutCommand);
        }

        const syncCommand = this.getSyncStatusBarCommand();
        if (syncCommand) {
            statusBarCommands.push(syncCommand);
        }
        scmProvider.statusBarCommands = statusBarCommands;
    }
    protected getCheckoutStatusBarCommand(): ScmCommand | undefined {
        const scmProvider = this.repositoryProvider.selectedScmProvider;
        if (!scmProvider) {
            return undefined;
        }
        const status = scmProvider.getStatus();
        if (!status) {
            return undefined;
        }
        const branch = status.branch ? status.branch : status.currentHead ? status.currentHead.substring(0, 8) : 'NO-HEAD';
        const changes = (scmProvider.unstagedChanges.length > 0 ? '*' : '')
            + (scmProvider.stagedChanges.length > 0 ? '+' : '')
            + (scmProvider.mergeChanges.length > 0 ? '!' : '');
        return {
            command: GIT_COMMANDS.CHECKOUT.id,
            title: `$(codicon-source-control) ${branch}${changes}`,
            tooltip: `${branch}${changes}`
        };
    }
    protected getSyncStatusBarCommand(): ScmCommand | undefined {
        const status = this.repositoryTracker.selectedRepositoryStatus;
        if (!status || !status.branch) {
            return undefined;
        }
        if (this.syncService.isSyncing()) {
            return {
                title: '$(codicon-sync~spin)',
                tooltip: nls.localize('vscode.git/statusbar/syncing changes', 'Synchronizing Changes...')
            };
        }
        const { upstreamBranch, aheadBehind } = status;
        if (upstreamBranch) {
            return {
                title: '$(codicon-sync)' + (aheadBehind && (aheadBehind.ahead + aheadBehind.behind) > 0 ? ` ${aheadBehind.behind}↓ ${aheadBehind.ahead}↑` : ''),
                command: GIT_COMMANDS.SYNC.id,
                tooltip: nls.localize('vscode.git/repository/sync changes', 'Synchronize Changes')
            };
        }
        return {
            title: '$(codicon-cloud-upload)',
            command: GIT_COMMANDS.PUBLISH.id,
            tooltip: nls.localize('vscode.git/statusbar/publish changes', 'Publish Changes')
        };
    }

    async commit(options: Git.Options.Commit & { message?: string } = {}): Promise<void> {
        const scmRepository = this.repositoryProvider.selectedScmRepository;
        if (!scmRepository) {
            return;
        }
        const message = options.message || scmRepository.input.value;
        if (!message.trim()) {
            scmRepository.input.issue = {
                type: ScmInputIssueType.Error,
                message: nls.localize('vscode.git/repository/commitMessageWhitespacesOnlyWarning', 'Please provide a commit message')
            };
            scmRepository.input.focus();
            return;
        }
        if (!scmRepository.provider.stagedChanges.length) {
            scmRepository.input.issue = {
                type: ScmInputIssueType.Error,
                message: nls.localize('vscode.git/commands/no changes', 'No changes added to commit')
            };
            scmRepository.input.focus();
            return;
        }
        scmRepository.input.issue = undefined;
        try {
            // We can make sure, repository exists, otherwise we would not have this button.
            const amend = options.amend;
            const signOff = options.signOff || this.gitPreferences['git.alwaysSignOff'];
            const repository = scmRepository.provider.repository;
            await this.git.commit(repository, message, { signOff, amend });
            scmRepository.input.value = '';
        } catch (error) {
            this.gitErrorHandler.handleError(error);
        }
    }

    async addSignOff(): Promise<void> {
        const scmRepository = this.repositoryProvider.selectedScmRepository;
        if (!scmRepository) {
            return;
        }
        try {
            const repository = scmRepository.provider.repository;
            const [username, email] = (await Promise.all([
                this.git.exec(repository, ['config', 'user.name']),
                this.git.exec(repository, ['config', 'user.email'])
            ])).map(result => result.stdout.trim());

            const signOff = `\n\nSigned-off-by: ${username} <${email}>`;
            const value = scmRepository.input.value;
            if (value.endsWith(signOff)) {
                scmRepository.input.value = value.substring(0, value.length - signOff.length);
            } else {
                scmRepository.input.value = `${value}${signOff}`;
            }
            scmRepository.input.focus();
        } catch (e) {
            scmRepository.input.issue = {
                type: ScmInputIssueType.Warning,
                message: nls.localize('theia/git/missingUserInfo', 'Make sure you configure your \'user.name\' and \'user.email\' in git.')
            };
        }

    }

    async stageChange(widget: DirtyDiffWidget): Promise<void> {
        const scmRepository = this.repositoryProvider.selectedScmRepository;
        if (!scmRepository) {
            return;
        }

        const repository = scmRepository.provider.repository;

        const path = Repository.relativePath(repository, widget.uri)?.toString();
        if (!path) {
            return;
        }

        const { currentChange } = widget;
        if (!currentChange) {
            return;
        }

        const dataToStage = await widget.getContentWithSelectedChanges(change => change === currentChange);

        try {
            const hash = (await this.git.exec(repository, ['hash-object', '--stdin', '-w', '--path', path], { stdin: dataToStage, stdinEncoding: 'utf8' })).stdout.trim();

            let mode = (await this.git.exec(repository, ['ls-files', '--format=%(objectmode)', '--', path])).stdout.split('\n').filter(line => !!line.trim())[0];
            if (!mode) {
                mode = '100644'; // regular non-executable file
            }

            await this.git.exec(repository, ['update-index', '--add', '--cacheinfo', mode, hash, path]);

            // enforce a notification as there would be no status update if the file had been staged already
            this.gitWatcher.onGitChanged({ source: repository, status: await this.git.status(repository) });
        } catch (error) {
            this.gitErrorHandler.handleError(error);
        }

        widget.editor.cursor = LineRange.getStartPosition(currentChange.currentRange);
    }

    async revertChange(widget: DirtyDiffWidget): Promise<void> {
        const { currentChange } = widget;
        if (!currentChange) {
            return;
        }

        const editor = widget.editor.getControl();
        editor.pushUndoStop();
        editor.executeEdits('Revert Change', [{
            range: editor.getModel()!.getFullModelRange(),
            text: await widget.getContentWithSelectedChanges(change => change !== currentChange)
        }]);
        editor.pushUndoStop();

        widget.editor.cursor = LineRange.getStartPosition(currentChange.currentRange);
    }

    /**
     * It should be aligned with https://code.visualstudio.com/api/references/theme-color#git-colors
     */
    registerColors(colors: ColorRegistry): void {
        colors.register({
            id: 'gitDecoration.addedResourceForeground',
            description: 'Color for added resources.',
            defaults: {
                light: '#587c0c',
                dark: '#81b88b',
                hcDark: '#a1e3ad',
                hcLight: '#374e06'
            }
        }, {
            id: 'gitDecoration.modifiedResourceForeground',
            description: 'Color for modified resources.',
            defaults: {
                light: '#895503',
                dark: '#E2C08D',
                hcDark: '#E2C08D',
                hcLight: '#895503'
            }
        }, {
            id: 'gitDecoration.deletedResourceForeground',
            description: 'Color for deleted resources.',
            defaults: {
                light: '#ad0707',
                dark: '#c74e39',
                hcDark: '#c74e39',
                hcLight: '#ad0707'
            }
        }, {
            id: 'gitDecoration.untrackedResourceForeground',
            description: 'Color for untracked resources.',
            defaults: {
                light: '#007100',
                dark: '#73C991',
                hcDark: '#73C991',
                hcLight: '#007100'
            }
        }, {
            id: 'gitDecoration.conflictingResourceForeground',
            description: 'Color for resources with conflicts.',
            defaults: {
                light: '#6c6cc4',
                dark: '#6c6cc4',
                hcDark: '#c74e39',
                hcLight: '#ad0707'
            }
        }, {
            id: 'gitlens.gutterBackgroundColor',
            description: 'Specifies the background color of the gutter blame annotations',
            defaults: {
                dark: '#FFFFFF13',
                light: '#0000000C',
                hcDark: '#FFFFFF13'
            }
        }, {
            id: 'gitlens.gutterForegroundColor',
            description: 'Specifies the foreground color of the gutter blame annotations',
            defaults: {
                dark: '#BEBEBE',
                light: '#747474',
                hcDark: '#BEBEBE'
            }
        }, {
            id: 'gitlens.lineHighlightBackgroundColor',
            description: 'Specifies the background color of the associated line highlights in blame annotations',
            defaults: {
                dark: '#00BCF233',
                light: '#00BCF233',
                hcDark: '#00BCF233'
            }
        });
    }

}
export interface GitOpenFileOptions {
    readonly uri: URI
    readonly options?: EditorOpenerOptions
}
export interface GitOpenChangesOptions {
    readonly change: GitFileChange
    readonly options?: EditorOpenerOptions
}
