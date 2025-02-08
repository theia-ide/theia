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

import { CommandRegistry, Command, MenuModelRegistry, SelectionService, MessageService } from '@theia/core/lib/common';
import { FrontendApplication, AbstractViewContribution, codicon, open, OpenerService } from '@theia/core/lib/browser';
import { WidgetManager } from '@theia/core/lib/browser/widget-manager';
import { EditorManager } from '@theia/editor/lib/browser';
import { injectable, inject } from '@theia/core/shared/inversify';
import { GitDiffWidget, GIT_DIFF } from './git-diff-widget';
import { GitCommitDetailWidget } from '../history/git-commit-detail-widget';
import { GitDiffTreeModel } from './git-diff-tree-model';
import { ScmService } from '@theia/scm/lib/browser/scm-service';
import { NavigatorContextMenu, FileNavigatorContribution } from '@theia/navigator/lib/browser/navigator-contribution';
import { UriCommandHandler } from '@theia/core/lib/common/uri-command-handler';
import { GitQuickOpenService } from '../git-quick-open-service';
import { DiffUris } from '@theia/core/lib/browser/diff-uris';
import URI from '@theia/core/lib/common/uri';
import { GIT_RESOURCE_SCHEME } from '../git-resource';
import { Git, Repository } from '../../common';
import { WorkspaceRootUriAwareCommandHandler } from '@theia/workspace/lib/browser/workspace-commands';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { TabBarToolbarAction, TabBarToolbarContribution, TabBarToolbarRegistry } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { Emitter } from '@theia/core/lib/common/event';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { nls } from '@theia/core/lib/common/nls';

export namespace GitDiffCommands {
    export const OPEN_FILE_DIFF = Command.toLocalizedCommand({
        id: 'git-diff:open-file-diff',
        category: 'Git Diff',
        label: 'Compare With...'
    }, 'theia/git/compareWith');
    export const TREE_VIEW_MODE = {
        id: 'git.viewmode.tree',
        tooltip: nls.localizeByDefault('View as Tree'),
        iconClass: codicon('list-tree'),
        originalLabel: 'View as Tree',
        label: nls.localizeByDefault('View as Tree')
    };
    export const LIST_VIEW_MODE = {
        id: 'git.viewmode.list',
        tooltip: nls.localizeByDefault('View as List'),
        iconClass: codicon('list-flat'),
        originalLabel: 'View as List',
        label: nls.localizeByDefault('View as List')
    };
    export const PREVIOUS_CHANGE = {
        id: 'git.navigate-changes.previous',
        tooltip: nls.localizeByDefault('Previous Change'),
        iconClass: codicon('arrow-left'),
        originalLabel: 'Previous Change',
        label: nls.localizeByDefault('Previous Change')
    };
    export const NEXT_CHANGE = {
        id: 'git.navigate-changes.next',
        tooltip: nls.localizeByDefault('Next Change'),
        iconClass: codicon('arrow-right'),
        originalLabel: 'Next Change',
        label: nls.localizeByDefault('Next Change')
    };
}

export namespace ScmNavigatorMoreToolbarGroups {
    export const SCM = '3_navigator_scm';
}

@injectable()
export class GitDiffContribution extends AbstractViewContribution<GitDiffWidget> implements TabBarToolbarContribution {

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    @inject(FileNavigatorContribution)
    protected readonly fileNavigatorContribution: FileNavigatorContribution;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    constructor(
        @inject(SelectionService) protected readonly selectionService: SelectionService,
        @inject(WidgetManager) protected override readonly widgetManager: WidgetManager,
        @inject(FrontendApplication) protected readonly app: FrontendApplication,
        @inject(GitQuickOpenService) protected readonly quickOpenService: GitQuickOpenService,
        @inject(FileService) protected readonly fileService: FileService,
        @inject(OpenerService) protected openerService: OpenerService,
        @inject(MessageService) protected readonly notifications: MessageService,
        @inject(ScmService) protected readonly scmService: ScmService
    ) {
        super({
            widgetId: GIT_DIFF,
            widgetName: 'Git diff',
            defaultWidgetOptions: {
                area: 'left',
                rank: 500
            }
        });
    }

    override registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(NavigatorContextMenu.COMPARE, {
            commandId: GitDiffCommands.OPEN_FILE_DIFF.id
        });
    }

    override registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(GitDiffCommands.OPEN_FILE_DIFF, this.newWorkspaceRootUriAwareCommandHandler({
            isVisible: uri => !!this.findGitRepository(uri),
            isEnabled: uri => !!this.findGitRepository(uri),
            execute: async fileUri => {
                const repository = this.findGitRepository(fileUri);
                if (repository) {
                    await this.quickOpenService.chooseTagsAndBranches(
                        async (fromRevision, toRevision) => {
                            const uri = fileUri.toString();
                            const fileStat = await this.fileService.resolve(fileUri);
                            const diffOptions: Git.Options.Diff = {
                                uri,
                                range: {
                                    fromRevision
                                }
                            };
                            if (fileStat.isDirectory) {
                                this.showWidget({ rootUri: repository.localUri, diffOptions });
                            } else {
                                const fromURI = fileUri.withScheme(GIT_RESOURCE_SCHEME).withQuery(fromRevision);
                                const toURI = fileUri;
                                const diffUri = DiffUris.encode(fromURI, toURI);
                                if (diffUri) {
                                    open(this.openerService, diffUri).catch(e => {
                                        this.notifications.error(e.message);
                                    });
                                }
                            }
                        }, repository);
                }
            }
        }));
        commands.registerCommand(GitDiffCommands.PREVIOUS_CHANGE, {
            execute: widget => {
                if (widget instanceof GitDiffWidget) {
                    widget.goToPreviousChange();
                }
            },
            isVisible: widget => widget instanceof GitDiffWidget,
        });
        commands.registerCommand(GitDiffCommands.NEXT_CHANGE, {
            execute: widget => {
                if (widget instanceof GitDiffWidget) {
                    widget.goToNextChange();
                }
            },
            isVisible: widget => widget instanceof GitDiffWidget,
        });
    }

    registerToolbarItems(registry: TabBarToolbarRegistry): void {
        this.fileNavigatorContribution.registerMoreToolbarItem({
            id: GitDiffCommands.OPEN_FILE_DIFF.id,
            command: GitDiffCommands.OPEN_FILE_DIFF.id,
            tooltip: GitDiffCommands.OPEN_FILE_DIFF.label,
            group: ScmNavigatorMoreToolbarGroups.SCM,
        });

        const viewModeEmitter = new Emitter<void>();
        const extractDiffWidget = (widget: unknown) => {
            if (widget instanceof GitDiffWidget) {
                return widget;
            }
        };
        const extractCommitDetailWidget = (widget: unknown) => {
            const ref = widget ? widget : this.editorManager.currentEditor;
            if (ref instanceof GitCommitDetailWidget) {
                return ref;
            }
            return undefined;
        };
        const registerToggleViewItem = (command: Command, mode: 'tree' | 'list') => {
            const id = command.id;
            const item: TabBarToolbarAction = {
                id,
                command: id,
                tooltip: command.label,
                onDidChange: viewModeEmitter.event
            };

            this.commandRegistry.registerCommand({ id, iconClass: command && command.iconClass }, {
                execute: widget => {
                    const widgetWithChanges = extractDiffWidget(widget) || extractCommitDetailWidget(widget);
                    if (widgetWithChanges) {
                        widgetWithChanges.viewMode = mode;
                        viewModeEmitter.fire();
                    }
                },
                isVisible: widget => {
                    const widgetWithChanges = extractDiffWidget(widget) || extractCommitDetailWidget(widget);
                    if (widgetWithChanges) {
                        return widgetWithChanges.viewMode !== mode;
                    }
                    return false;
                },
            });
            registry.registerItem(item);
        };
        registerToggleViewItem(GitDiffCommands.TREE_VIEW_MODE, 'tree');
        registerToggleViewItem(GitDiffCommands.LIST_VIEW_MODE, 'list');

        registry.registerItem({
            id: GitDiffCommands.PREVIOUS_CHANGE.id,
            command: GitDiffCommands.PREVIOUS_CHANGE.id,
            tooltip: GitDiffCommands.PREVIOUS_CHANGE.label,
        });
        registry.registerItem({
            id: GitDiffCommands.NEXT_CHANGE.id,
            command: GitDiffCommands.NEXT_CHANGE.id,
            tooltip: GitDiffCommands.NEXT_CHANGE.label,
        });
    }

    protected findGitRepository(uri: URI): Repository | undefined {
        const repo = this.scmService.findRepository(uri);
        if (repo && repo.provider.id === 'git') {
            return { localUri: repo.provider.rootUri };
        }
        return undefined;
    }

    async showWidget(options: GitDiffTreeModel.Options): Promise<GitDiffWidget> {
        const widget = await this.widget;
        await widget.setContent(options);
        return this.openView({
            activate: true
        });
    }

    protected newWorkspaceRootUriAwareCommandHandler(handler: UriCommandHandler<URI>): WorkspaceRootUriAwareCommandHandler {
        return new WorkspaceRootUriAwareCommandHandler(this.workspaceService, this.selectionService, handler);
    }
}
