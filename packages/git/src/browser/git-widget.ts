/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/


import { injectable, inject } from 'inversify';
import { Git } from '../common/git';
import { GIT_CONTEXT_MENU } from './git-context-menu';
import { GitFileChange, GitFileStatus, Repository, WorkingDirectoryStatus } from '../common/model';
import { GitWatcher } from '../common/git-watcher';
import { GIT_RESOURCE_SCHEME } from './git-resource';
import { GitRepositoryProvider } from './git-repository-provider';
import { MessageService, ResourceProvider } from '@theia/core';
import URI from '@theia/core/lib/common/uri';
import { VirtualRenderer, VirtualWidget, ContextMenuRenderer, OpenerService, open } from '@theia/core/lib/browser';
import { h } from '@phosphor/virtualdom/lib';
import { DiffUriHelper } from '@theia/editor/lib/browser/editor-utility';

@injectable()
export class GitWidget extends VirtualWidget {

    protected repository: Repository;

    protected repositories: Repository[] = [];
    protected stagedChanges: GitFileChange[] = [];
    protected unstagedChanges: GitFileChange[] = [];
    protected mergeChanges: GitFileChange[] = [];
    protected message: string = '';
    protected additionalMessage: string = '';
    protected status: WorkingDirectoryStatus;

    constructor(
        @inject(Git) protected readonly git: Git,
        @inject(GitRepositoryProvider) protected readonly gitRepositoryProvider: GitRepositoryProvider,
        @inject(GitWatcher) protected readonly gitWatcher: GitWatcher,
        @inject(OpenerService) protected readonly openerService: OpenerService,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(ResourceProvider) protected readonly resourceProvider: ResourceProvider,
        @inject(MessageService) protected readonly messageService: MessageService) {
        super();
        this.id = 'theia-gitContainer';
        this.title.label = 'Git';
        this.addClass('theia-git');
        this.update();
    }

    protected onActivateRequest() {
        this.initialize();
    }

    async initialize(): Promise<void> {
        this.message = '';
        this.additionalMessage = '';
        this.repositories = await this.git.repositories();
        this.repository = await this.gitRepositoryProvider.getSelected();
        this.status = await this.git.status(this.repository);
        this.stagedChanges = [];
        this.unstagedChanges = [];
        this.mergeChanges = [];
        this.status.changes.forEach(change => {
            if (GitFileStatus[GitFileStatus.Conflicted.valueOf()] !== GitFileStatus[change.status]) {
                if (change.staged) {
                    this.stagedChanges.push(change);
                } else {
                    this.unstagedChanges.push(change);
                }
            } else {
                if (!change.staged) {
                    this.mergeChanges.push(change);
                }
            }
        });
        this.update();
    }

    protected render(): h.Child {
        const commandBar = this.renderCommandBar();
        const messageInput = this.renderMessageInput();
        const messageTextarea = this.renderMessageTextarea();
        const mergeChanges = this.renderMergeChanges() || '';
        const stagedChanges = this.renderStagedChanges() || '';
        const unstagedChanges = this.renderUnstagedChanges() || '';

        return h.div({ id: 'gitContainer' }, commandBar, messageInput, messageTextarea, mergeChanges, stagedChanges, unstagedChanges);
    }

    protected renderRepoList(): h.Child {
        const repoOptionElements: h.Child[] = [];
        this.repositories.forEach(repo => {
            const uri = new URI(repo.localUri);
            repoOptionElements.push(h.option({ value: uri.toString() }, uri.displayName));
        });

        return h.select({
            id: 'repositoryList',
            onchange: event => {
                this.gitRepositoryProvider.select((event.target as HTMLSelectElement).value);
                this.initialize();
            }
        }, VirtualRenderer.flatten(repoOptionElements));
    }

    protected renderCommandBar(): h.Child {
        const commit = h.div({
            className: 'button',
            onclick: async event => {
                if (this.message !== '') {
                    const repo = await this.gitRepositoryProvider.getSelected();
                    this.git.commit(repo, this.message + "\n\n" + this.additionalMessage)
                        .then(() => {
                            this.initialize();
                        });
                } else {
                    const messageInput = document.getElementById('messageInput');
                    if (messageInput) {
                        messageInput.className += ' warn';
                        messageInput.focus();
                    }
                    this.messageService.error('Please provide a commit message!');
                }
            }
        }, h.i({ className: 'fa fa-check' }));
        const refresh = h.div({
            className: 'button',
            onclick: e => {
                this.initialize();
            }
        }, h.i({ className: 'fa fa-refresh' }));
        const commands = h.div({
            className: 'button',
            onclick: event => {
                const el = (event.target as HTMLElement).parentElement;
                if (el) {
                    this.contextMenuRenderer.render(GIT_CONTEXT_MENU, {
                        x: el.getBoundingClientRect().left,
                        y: el.getBoundingClientRect().top + el.offsetHeight
                    });
                }
            }
        }, h.i({ className: 'fa fa-ellipsis-h' }));
        const btnContainer = h.div({ className: 'flexcontainer buttons' }, commit, refresh, commands);
        const repositoryListContainer = h.div({ id: 'repositoryListContainer' }, this.renderRepoList());
        return h.div({ id: 'commandBar', className: 'flexcontainer evenlySpreaded' }, repositoryListContainer, btnContainer);
    }

    protected renderMessageInput(): h.Child {
        const input = h.input({
            id: 'messageInput',
            oninput: event => {
                const inputElement = (event.target as HTMLInputElement);
                if (inputElement.value !== '') {
                    inputElement.className = '';
                }
                this.message = (event.target as HTMLInputElement).value;
            },
            placeholder: 'Commit message',
            value: this.message
        });
        return h.div({ id: 'messageInputContainer', className: 'flexcontainer row' }, input);
    }

    protected renderMessageTextarea(): h.Child {
        const textarea = h.textarea({
            placeholder: 'Extended commit text',
            oninput: event => {
                this.additionalMessage = (event.target as HTMLTextAreaElement).value;
            },
            value: this.additionalMessage
        });
        return h.div({ id: 'messageTextareaContainer', className: 'flexcontainer row' }, textarea);
    }

    protected renderGitItemButtons(change: GitFileChange): h.Child {
        const btns: h.Child[] = [];
        if (change.staged) {
            btns.push(h.a({
                className: 'button',
                title: 'Unstage Changes',
                onclick: async event => {
                    const repo = await this.gitRepositoryProvider.getSelected();
                    this.git.rm(repo, change.uri)
                        .then(() => {
                            this.initialize();
                        });
                }
            }, h.i({ className: 'fa fa-minus' })));
        } else {
            btns.push(h.a({
                className: 'button',
                title: 'Discard Changes',
                onclick: async event => {
                    const repo = await this.gitRepositoryProvider.getSelected();
                    this.git.checkout(repo, {
                        branch: this.status.branch,
                        paths: change.uri
                    });
                }
            }, h.i({ className: 'fa fa-undo' })));
            btns.push(h.a({
                className: 'button',
                title: 'Stage Changes',
                onclick: async event => {
                    const repo = await this.gitRepositoryProvider.getSelected();
                    this.git.add(repo, change.uri)
                        .then(() => {
                            this.initialize();
                        });
                }
            }, h.i({ className: 'fa fa-plus' })));
        }
        return h.div({ className: 'buttons' }, VirtualRenderer.flatten(btns));
    }

    protected getStatusChar(status: GitFileStatus, staged: boolean): string {
        switch (status) {
            case 0:
            case 3:
            case 5: return staged ? 'A' : 'U';
            case 1: return 'M';
            case 2: return 'D';
            case 4: return 'C';
        }
        return '';
    }

    protected getRepositoryRelativePath(absPath: string) {
        return absPath.replace(new URI(this.repository.localUri).withoutScheme() + '/', '');
    }

    protected renderGitItem(change: GitFileChange): h.Child {
        const changeUri: URI = new URI(change.uri);
        const nameSpan = h.span({ className: 'name' }, changeUri.displayName + ' ');
        const pathSpan = h.span({ className: 'path' }, this.getRepositoryRelativePath(changeUri.path.dir.toString()));
        const nameAndPathDiv = h.div({
            className: 'noWrapInfo',
            onclick: () => {
                let uri: URI;
                if (change.status !== GitFileStatus.New) {
                    if (change.staged) {
                        uri = DiffUriHelper.encode(
                            changeUri.withScheme(GIT_RESOURCE_SCHEME).withQuery('HEAD'),
                            changeUri.withScheme(GIT_RESOURCE_SCHEME),
                            changeUri.displayName + ' (Index)');
                    } else if (this.stagedChanges.find(c => c.uri === change.uri)) {
                        uri = DiffUriHelper.encode(
                            changeUri.withScheme(GIT_RESOURCE_SCHEME),
                            changeUri,
                            changeUri.displayName + ' (Working tree)');
                    } else {
                        uri = DiffUriHelper.encode(
                            changeUri.withScheme(GIT_RESOURCE_SCHEME).withQuery('HEAD'),
                            changeUri,
                            changeUri.displayName + ' (Working tree)');
                    }
                } else if (change.staged) {
                    uri = changeUri.withScheme(GIT_RESOURCE_SCHEME);
                } else if (this.stagedChanges.find(c => c.uri === change.uri)) {
                    uri = DiffUriHelper.encode(
                        changeUri.withScheme(GIT_RESOURCE_SCHEME),
                        changeUri,
                        changeUri.displayName + ' (Working tree)');
                } else {
                    uri = changeUri;
                }
                open(this.openerService, uri);
            }
        }, nameSpan, pathSpan);
        const buttonsDiv = this.renderGitItemButtons(change);
        const staged = change.staged ? 'staged ' : '';
        const statusDiv = h.div({ className: 'status ' + staged + GitFileStatus[change.status].toLowerCase() }, this.getStatusChar(change.status, change.staged));
        const itemBtnsAndStatusDiv = h.div({ className: 'itemButtonsContainer' }, buttonsDiv, statusDiv);
        return h.div({ className: 'gitItem noselect' }, nameAndPathDiv, itemBtnsAndStatusDiv);
    }

    protected renderChangesHeader(title: string): h.Child {
        const stagedChangesHeaderDiv = h.div({ className: 'header' }, title);
        return stagedChangesHeaderDiv;
    }

    protected renderMergeChanges(): h.Child | undefined {
        const mergeChangeDivs: h.Child[] = [];
        if (this.mergeChanges.length > 0) {
            this.mergeChanges.forEach(change => {
                mergeChangeDivs.push(this.renderGitItem(change));
            });
            return h.div({
                id: 'mergeChanges',
                className: 'changesContainer'
            }, h.div({ className: 'theia-header' }, 'Merge Changes'), VirtualRenderer.flatten(mergeChangeDivs));
        } else {
            return undefined;
        }
    }

    protected renderStagedChanges(): h.Child | undefined {
        const stagedChangeDivs: h.Child[] = [];
        if (this.stagedChanges.length > 0) {
            this.stagedChanges.forEach(change => {
                stagedChangeDivs.push(this.renderGitItem(change));
            });
            return h.div({
                id: 'stagedChanges',
                className: 'changesContainer'
            }, h.div({ className: 'theia-header' }, 'Staged Changes'), VirtualRenderer.flatten(stagedChangeDivs));
        } else {
            return undefined;
        }
    }

    protected renderUnstagedChanges(): h.Child {
        const unstagedChangeDivs: h.Child[] = [];
        if (this.unstagedChanges.length > 0) {
            this.unstagedChanges.forEach(change => {
                unstagedChangeDivs.push(this.renderGitItem(change));
            });
            return h.div({
                id: 'unstagedChanges',
                className: 'changesContainer'
            }, h.div({ className: 'theia-header' }, 'Changed'), VirtualRenderer.flatten(unstagedChangeDivs));
        }

        return '';
    }
}
