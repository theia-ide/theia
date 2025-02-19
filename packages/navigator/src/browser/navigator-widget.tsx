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

import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { Message } from '@theia/core/shared/@lumino/messaging';
import URI from '@theia/core/lib/common/uri';
import { CommandService } from '@theia/core/lib/common';
import { Key, TreeModel, ContextMenuRenderer, ExpandableTreeNode, TreeProps, TreeNode } from '@theia/core/lib/browser';
import { DirNode, FileStatNodeData } from '@theia/filesystem/lib/browser';
import { WorkspaceService, WorkspaceCommands } from '@theia/workspace/lib/browser';
import { WorkspaceNode, WorkspaceRootNode } from './navigator-tree';
import { FileNavigatorModel } from './navigator-model';
import { isOSX, environment } from '@theia/core';
import * as React from '@theia/core/shared/react';
import { NavigatorContextKeyService } from './navigator-context-key-service';
import { nls } from '@theia/core/lib/common/nls';
import { AbstractNavigatorTreeWidget } from './abstract-navigator-tree-widget';

export const FILE_NAVIGATOR_ID = 'files';
export const LABEL = nls.localizeByDefault('No Folder Opened');
export const CLASS = 'theia-Files';

@injectable()
export class FileNavigatorWidget extends AbstractNavigatorTreeWidget {

    @inject(CommandService) protected readonly commandService: CommandService;
    @inject(NavigatorContextKeyService) protected readonly contextKeyService: NavigatorContextKeyService;
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;

    constructor(
        @inject(TreeProps) props: TreeProps,
        @inject(FileNavigatorModel) override readonly model: FileNavigatorModel,
        @inject(ContextMenuRenderer) contextMenuRenderer: ContextMenuRenderer,
    ) {
        super(props, model, contextMenuRenderer);
        this.id = FILE_NAVIGATOR_ID;
        this.addClass(CLASS);
    }

    @postConstruct()
    protected override init(): void {
        super.init();
        // This ensures that the context menu command to hide this widget receives the label 'Folders'
        // regardless of the name of workspace. See ViewContainer.updateToolbarItems.
        const dataset = { ...this.title.dataset, visibilityCommandLabel: nls.localizeByDefault('Folders') };
        this.title.dataset = dataset;
        this.updateSelectionContextKeys();
        this.toDispose.pushAll([
            this.model.onSelectionChanged(() =>
                this.updateSelectionContextKeys()
            ),
            this.model.onExpansionChanged(node => {
                if (node.expanded && node.children.length === 1) {
                    const child = node.children[0];
                    if (ExpandableTreeNode.is(child) && !child.expanded) {
                        this.model.expandNode(child);
                    }
                }

            })
        ]);
    }

    protected override doUpdateRows(): void {
        super.doUpdateRows();
        this.title.label = LABEL;
        if (WorkspaceNode.is(this.model.root)) {
            if (this.model.root.name === WorkspaceNode.name) {
                const rootNode = this.model.root.children[0];
                if (WorkspaceRootNode.is(rootNode)) {
                    this.title.label = this.toNodeName(rootNode);
                    this.title.caption = this.labelProvider.getLongName(rootNode.uri);
                }
            } else {
                this.title.label = this.toNodeName(this.model.root);
                this.title.caption = this.title.label;
            }
        } else {
            this.title.caption = this.title.label;
        }
    }

    override getContainerTreeNode(): TreeNode | undefined {
        const root = this.model.root;
        if (this.workspaceService.isMultiRootWorkspaceOpened) {
            return root;
        }
        if (WorkspaceNode.is(root)) {
            return root.children[0];
        }
        return undefined;
    }

    protected override renderTree(model: TreeModel): React.ReactNode {
        if (this.model.root && this.isEmptyMultiRootWorkspace(model)) {
            return this.renderEmptyMultiRootWorkspace();
        }
        return super.renderTree(model);
    }

    protected override shouldShowWelcomeView(): boolean {
        return this.model.root === undefined;
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.addClipboardListener(this.node, 'copy', e => this.handleCopy(e));
        this.addClipboardListener(this.node, 'paste', e => this.handlePaste(e));
    }

    protected handleCopy(event: ClipboardEvent): void {
        const uris = this.model.selectedFileStatNodes.map(node => node.uri.toString());
        if (uris.length > 0 && event.clipboardData) {
            event.clipboardData.setData('text/plain', uris.join('\n'));
            event.preventDefault();
        }
    }

    protected handlePaste(event: ClipboardEvent): void {
        if (event.clipboardData) {
            const raw = event.clipboardData.getData('text/plain');
            if (!raw) {
                return;
            }
            const target = this.model.selectedFileStatNodes[0];
            if (!target) {
                return;
            }
            for (const file of raw.split('\n')) {
                event.preventDefault();
                const source = new URI(file);
                this.model.copy(source, target);
            }
        }
    }

    protected canOpenWorkspaceFileAndFolder: boolean = isOSX || !environment.electron.is();

    protected readonly openWorkspace = () => this.doOpenWorkspace();
    protected doOpenWorkspace(): void {
        this.commandService.executeCommand(WorkspaceCommands.OPEN_WORKSPACE.id);
    }

    protected readonly openFolder = () => this.doOpenFolder();
    protected doOpenFolder(): void {
        this.commandService.executeCommand(WorkspaceCommands.OPEN_FOLDER.id);
    }

    protected readonly addFolder = () => this.doAddFolder();
    protected doAddFolder(): void {
        this.commandService.executeCommand(WorkspaceCommands.ADD_FOLDER.id);
    }

    protected readonly keyUpHandler = (e: React.KeyboardEvent) => {
        if (Key.ENTER.keyCode === e.keyCode) {
            (e.target as HTMLElement).click();
        }
    };

    /**
     * When a multi-root workspace is opened, a user can remove all the folders from it.
     * Instead of displaying an empty navigator tree, this will show a button to add more folders.
     */
    protected renderEmptyMultiRootWorkspace(): React.ReactNode {
        return <div className='theia-navigator-container'>
            <div className='center'>{nls.localizeByDefault('You have not yet added a folder to the workspace.\n{0}', '')}</div>
            <div className='open-workspace-button-container'>
                <button className='theia-button open-workspace-button' title={nls.localizeByDefault('Add Folder to Workspace')}
                    onClick={this.addFolder}
                    onKeyUp={this.keyUpHandler}>
                    {nls.localizeByDefault('Open Folder')}
                </button>
            </div>
        </div>;
    }

    protected isEmptyMultiRootWorkspace(model: TreeModel): boolean {
        return WorkspaceNode.is(model.root) && model.root.children.length === 0;
    }

    protected override tapNode(node?: TreeNode): void {
        if (node && this.corePreferences['workbench.list.openMode'] === 'singleClick') {
            this.model.previewNode(node);
        }
        super.tapNode(node);
    }

    protected override onAfterShow(msg: Message): void {
        super.onAfterShow(msg);
        this.contextKeyService.explorerViewletVisible.set(true);
    }

    protected override onAfterHide(msg: Message): void {
        super.onAfterHide(msg);
        this.contextKeyService.explorerViewletVisible.set(false);
    }

    protected updateSelectionContextKeys(): void {
        this.contextKeyService.explorerResourceIsFolder.set(DirNode.is(this.model.selectedNodes[0]));
        // As `FileStatNode` only created if `FileService.resolve` was successful, we can safely assume that
        // a valid `FileSystemProvider` is available for the selected node. So we skip an additional check
        // for provider availability here and check the node type.
        this.contextKeyService.isFileSystemResource.set(FileStatNodeData.is(this.model.selectedNodes[0]));
    }

}
