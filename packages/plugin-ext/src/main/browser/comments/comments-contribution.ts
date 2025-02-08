// *****************************************************************************
// Copyright (C) 2020 Red Hat, Inc. and others.
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
import * as monaco from '@theia/monaco-editor-core';
import { CommentingRangeDecorator } from './comments-decorator';
import { EditorManager, EditorMouseEvent, EditorWidget } from '@theia/editor/lib/browser';
import { MonacoDiffEditor } from '@theia/monaco/lib/browser/monaco-diff-editor';
import { CommentThreadWidget } from './comment-thread-widget';
import { CommentsService, CommentInfoMain } from './comments-service';
import { CommentThread } from '../../../common/plugin-api-rpc-model';
import { CommandRegistry, DisposableCollection, MenuModelRegistry } from '@theia/core/lib/common';
import { URI } from '@theia/core/shared/vscode-uri';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { Uri } from '@theia/plugin';
import { CommentsContext } from './comments-context';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// some code copied and modified from https://github.com/microsoft/vscode/blob/1.49.3/src/vs/workbench/contrib/comments/browser/comments.contribution.ts

@injectable()
export class CommentsContribution {

    private addInProgress!: boolean;
    private commentWidgets: CommentThreadWidget[];
    private commentInfos: CommentInfoMain[];
    private emptyThreadsToAddQueue: [number, EditorMouseEvent | undefined][] = [];

    @inject(MenuModelRegistry) protected readonly menus: MenuModelRegistry;
    @inject(CommentsContext) protected readonly commentsContext: CommentsContext;
    @inject(ContextKeyService) protected readonly contextKeyService: ContextKeyService;
    @inject(CommandRegistry) protected readonly commands: CommandRegistry;

    constructor(@inject(CommentingRangeDecorator) protected readonly rangeDecorator: CommentingRangeDecorator,
        @inject(CommentsService) protected readonly commentService: CommentsService,
        @inject(EditorManager) protected readonly editorManager: EditorManager) {
        this.commentWidgets = [];
        this.commentInfos = [];
        this.commentService.onDidSetResourceCommentInfos(e => {
            const editor = this.getCurrentEditor();
            const editorURI = editor && editor.editor instanceof MonacoDiffEditor && editor.editor.diffEditor.getModifiedEditor().getModel();
            if (editorURI && editorURI.toString() === e.resource.toString()) {
                this.setComments(e.commentInfos.filter(commentInfo => commentInfo !== null));
            }
        });
        this.editorManager.onCreated(async widget => {
            const disposables = new DisposableCollection();
            const editor = widget.editor;
            if (editor instanceof MonacoDiffEditor) {
                const originalEditorModel = editor.diffEditor.getOriginalEditor().getModel();
                if (originalEditorModel) {
                    // need to cast because of vscode issue https://github.com/microsoft/vscode/issues/190584
                    const originalComments = await this.commentService.getComments(originalEditorModel.uri as Uri);
                    if (originalComments) {
                        this.rangeDecorator.update(editor.diffEditor.getOriginalEditor(), <CommentInfoMain[]>originalComments.filter(c => !!c));
                    }
                }
                const modifiedEditorModel = editor.diffEditor.getModifiedEditor().getModel();
                if (modifiedEditorModel) {
                    // need to cast because of vscode issue https://github.com/microsoft/vscode/issues/190584
                    const modifiedComments = await this.commentService.getComments(modifiedEditorModel.uri as Uri);
                    if (modifiedComments) {
                        this.rangeDecorator.update(editor.diffEditor.getModifiedEditor(), <CommentInfoMain[]>modifiedComments.filter(c => !!c));
                    }
                }
                disposables.push(editor.onMouseDown(e => this.onEditorMouseDown(e)));
                disposables.push(this.commentService.onDidUpdateCommentThreads(async e => {
                    const editorURI = editor.document.uri;
                    const commentInfo = this.commentInfos.filter(info => info.owner === e.owner);
                    if (!commentInfo || !commentInfo.length) {
                        return;
                    }

                    const added = e.added.filter(thread => thread.resource && thread.resource.toString() === editorURI.toString());
                    const removed = e.removed.filter(thread => thread.resource && thread.resource.toString() === editorURI.toString());
                    const changed = e.changed.filter(thread => thread.resource && thread.resource.toString() === editorURI.toString());

                    removed.forEach(thread => {
                        const matchedZones = this.commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner
                            && zoneWidget.commentThread.threadId === thread.threadId && zoneWidget.commentThread.threadId !== '');
                        if (matchedZones.length) {
                            const matchedZone = matchedZones[0];
                            const index = this.commentWidgets.indexOf(matchedZone);
                            this.commentWidgets.splice(index, 1);
                            matchedZone.dispose();
                        }
                    });

                    changed.forEach(thread => {
                        const matchedZones = this.commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner
                            && zoneWidget.commentThread.threadId === thread.threadId);
                        if (matchedZones.length) {
                            const matchedZone = matchedZones[0];
                            matchedZone.update();
                        }
                    });
                    added.forEach(thread => {
                        this.displayCommentThread(e.owner, thread);
                        this.commentInfos.filter(info => info.owner === e.owner)[0].threads.push(thread);
                    });
                })
                );
                editor.onDispose(() => {
                    disposables.dispose();
                });
                this.beginCompute();
            }
        });
    }

    private onEditorMouseDown(e: EditorMouseEvent): void {
        let mouseDownInfo = null;

        const range = e.target.range;

        if (!range) {
            return;
        }

        if (e.target.type !== monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS) {
            return;
        }

        const data = e.target.detail;
        const gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth - data.glyphMarginLeft;

        // don't collide with folding and git decorations
        if (gutterOffsetX > 14) {
            return;
        }

        mouseDownInfo = { lineNumber: range.start };

        const { lineNumber } = mouseDownInfo;
        mouseDownInfo = null;

        if (!range || range.start !== lineNumber) {
            return;
        }

        if (!e.target.element) {
            return;
        }

        if (e.target.element.className.indexOf('comment-diff-added') >= 0) {
            this.addOrToggleCommentAtLine(e.target.position!.line + 1, e);
        }
    }

    private async beginCompute(): Promise<void> {
        const editorModel = this.editor && this.editor.getModel();
        const editorURI = this.editor && editorModel && editorModel.uri;
        if (editorURI) {
            // need to cast because of vscode issue https://github.com/microsoft/vscode/issues/190584
            const comments = await this.commentService.getComments(editorURI as Uri);
            this.setComments(<CommentInfoMain[]>comments.filter(c => !!c));
        }
    }

    private setComments(commentInfos: CommentInfoMain[]): void {
        if (!this.editor) {
            return;
        }

        this.commentInfos = commentInfos;
    }

    get editor(): monaco.editor.IStandaloneCodeEditor | undefined {
        const editor = this.getCurrentEditor();
        if (editor && editor.editor instanceof MonacoDiffEditor) {
            return editor.editor.diffEditor.getModifiedEditor();
        }
    }

    private displayCommentThread(owner: string, thread: CommentThread): void {
        const editor = this.editor;
        if (editor) {
            const provider = this.commentService.getCommentController(owner);
            if (provider) {
                this.commentsContext.commentController.set(provider.id);
            }
            const zoneWidget = new CommentThreadWidget(editor, owner, thread, this.commentService, this.menus, this.commentsContext, this.contextKeyService, this.commands);
            zoneWidget.display({ afterLineNumber: thread.range.startLineNumber, heightInLines: 5 });
            const currentEditor = this.getCurrentEditor();
            if (currentEditor) {
                currentEditor.onDispose(() => zoneWidget.dispose());
            }
            this.commentWidgets.push(zoneWidget);
        }
    }

    public async addOrToggleCommentAtLine(lineNumber: number, e: EditorMouseEvent | undefined): Promise<void> {
        // If an add is already in progress, queue the next add and process it after the current one finishes to
        // prevent empty comment threads from being added to the same line.
        if (!this.addInProgress) {
            this.addInProgress = true;
            // The widget's position is undefined until the widget has been displayed, so rely on the glyph position instead
            const existingCommentsAtLine = this.commentWidgets.filter(widget => widget.getGlyphPosition() === lineNumber);
            if (existingCommentsAtLine.length) {
                existingCommentsAtLine.forEach(widget => widget.toggleExpand(lineNumber));
                this.processNextThreadToAdd();
                return;
            } else {
                this.addCommentAtLine(lineNumber, e);
            }
        } else {
            this.emptyThreadsToAddQueue.push([lineNumber, e]);
        }
    }

    private processNextThreadToAdd(): void {
        this.addInProgress = false;
        const info = this.emptyThreadsToAddQueue.shift();
        if (info) {
            this.addOrToggleCommentAtLine(info[0], info[1]);
        }
    }

    private getCurrentEditor(): EditorWidget | undefined {
        return this.editorManager.currentEditor;
    }

    public addCommentAtLine(lineNumber: number, e: EditorMouseEvent | undefined): Promise<void> {
        const newCommentInfos = this.rangeDecorator.getMatchedCommentAction(lineNumber);
        const editor = this.getCurrentEditor();
        if (!editor) {
            return Promise.resolve();
        }
        if (!newCommentInfos.length) {
            return Promise.resolve();
        }

        const { ownerId } = newCommentInfos[0]!;
        this.addCommentAtLine2(lineNumber, ownerId);

        return Promise.resolve();
    }

    public addCommentAtLine2(lineNumber: number, ownerId: string): void {
        const editorModel = this.editor && this.editor.getModel();
        const editorURI = this.editor && editorModel && editorModel.uri;
        if (editorURI) {
            this.commentService.createCommentThreadTemplate(ownerId, URI.parse(editorURI.toString()), {
                startLineNumber: lineNumber,
                endLineNumber: lineNumber,
                startColumn: 1,
                endColumn: 1
            });
            this.processNextThreadToAdd();
        }
    }
}
