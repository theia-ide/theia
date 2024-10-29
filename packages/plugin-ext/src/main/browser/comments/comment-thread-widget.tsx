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
import { MonacoEditorZoneWidget } from '@theia/monaco/lib/browser/monaco-editor-zone-widget';
import {
    Comment,
    CommentMode,
    CommentThread,
    CommentThreadState,
    CommentThreadCollapsibleState
} from '../../../common/plugin-api-rpc-model';
import { CommentGlyphWidget } from './comment-glyph-widget';
import { BaseWidget, DISABLED_CLASS } from '@theia/core/lib/browser';
import * as React from '@theia/core/shared/react';
import { MouseTargetType } from '@theia/editor/lib/browser';
import { CommentsService } from './comments-service';
import {
    CommandMenu,
    CommandRegistry,
    CompoundMenuNode,
    DisposableCollection,
    MenuModelRegistry,
    MenuPath
} from '@theia/core/lib/common';
import { CommentsContext } from './comments-context';
import { RefObject } from '@theia/core/shared/react';
import * as monaco from '@theia/monaco-editor-core';
import { createRoot, Root } from '@theia/core/shared/react-dom/client';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// some code copied and modified from https://github.com/microsoft/vscode/blob/1.49.3/src/vs/workbench/contrib/comments/browser/commentThreadWidget.ts

export const COMMENT_THREAD_CONTEXT: MenuPath = ['comment_thread-context-menu'];
export const COMMENT_CONTEXT: MenuPath = ['comment-context-menu'];
export const COMMENT_TITLE: MenuPath = ['comment-title-menu'];

export class CommentThreadWidget extends BaseWidget {

    protected readonly zoneWidget: MonacoEditorZoneWidget;
    protected readonly containerNodeRoot: Root;
    protected readonly commentGlyphWidget: CommentGlyphWidget;
    protected readonly contextMenu: CompoundMenuNode;
    protected readonly commentFormRef: RefObject<CommentForm> = React.createRef<CommentForm>();

    protected isExpanded?: boolean;

    constructor(
        editor: monaco.editor.IStandaloneCodeEditor,
        private _owner: string,
        private _commentThread: CommentThread,
        private commentService: CommentsService,
        protected readonly menus: MenuModelRegistry,
        protected readonly commentsContext: CommentsContext,
        protected readonly contextKeyService: ContextKeyService,
        protected readonly commands: CommandRegistry
    ) {
        super();
        this.toDispose.push(this.zoneWidget = new MonacoEditorZoneWidget(editor));
        this.containerNodeRoot = createRoot(this.zoneWidget.containerNode);
        this.toDispose.push(this.commentGlyphWidget = new CommentGlyphWidget(editor));
        this.toDispose.push(this._commentThread.onDidChangeCollapsibleState(state => {
            if (state === CommentThreadCollapsibleState.Expanded && !this.isExpanded) {
                const lineNumber = this._commentThread.range.startLineNumber;

                this.display({ afterLineNumber: lineNumber, afterColumn: 1, heightInLines: 2 });
                return;
            }

            if (state === CommentThreadCollapsibleState.Collapsed && this.isExpanded) {
                this.hide();
                return;
            }
        }));
        this.commentsContext.commentIsEmpty.set(true);
        this.toDispose.push(this.zoneWidget.editor.onMouseDown(e => this.onEditorMouseDown(e)));

        this.toDispose.push(this._commentThread.onDidChangeCanReply(_canReply => {
            const commentForm = this.commentFormRef.current;
            if (commentForm) {
                commentForm.update();
            }
        }));
        this.toDispose.push(this._commentThread.onDidChangeState(_state => {
            this.update();
        }));
        this.contextMenu = this.menus.getMenu(COMMENT_THREAD_CONTEXT);
        this.contextMenu.children.forEach(node => {
            if (node.onDidChange) {
                this.toDispose.push(node.onDidChange(() => {
                    const commentForm = this.commentFormRef.current;
                    if (commentForm) {
                        commentForm.update();
                    }
                }));
            }
        });
    }

    public getGlyphPosition(): number {
        return this.commentGlyphWidget.getPosition();
    }

    public collapse(): void {
        this._commentThread.collapsibleState = CommentThreadCollapsibleState.Collapsed;
        if (this._commentThread.comments && this._commentThread.comments.length === 0) {
            this.deleteCommentThread();
        }

        this.hide();
    }

    private deleteCommentThread(): void {
        this.dispose();
        this.commentService.disposeCommentThread(this.owner, this._commentThread.threadId);
    }

    override dispose(): void {
        super.dispose();
        if (this.commentGlyphWidget) {
            this.commentGlyphWidget.dispose();
        }
    }

    toggleExpand(lineNumber: number): void {
        if (this.isExpanded) {
            this._commentThread.collapsibleState = CommentThreadCollapsibleState.Collapsed;
            this.hide();
            if (!this._commentThread.comments || !this._commentThread.comments.length) {
                this.deleteCommentThread();
            }
        } else {
            this._commentThread.collapsibleState = CommentThreadCollapsibleState.Expanded;
            this.display({ afterLineNumber: lineNumber, afterColumn: 1, heightInLines: 2 });
        }
    }

    override hide(): void {
        this.zoneWidget.hide();
        this.isExpanded = false;
        super.hide();
    }

    display(options: MonacoEditorZoneWidget.Options): void {
        this.isExpanded = true;
        if (this._commentThread.collapsibleState && this._commentThread.collapsibleState !== CommentThreadCollapsibleState.Expanded) {
            return;
        }
        this.commentGlyphWidget.setLineNumber(options.afterLineNumber);
        this._commentThread.collapsibleState = CommentThreadCollapsibleState.Expanded;
        this.zoneWidget.show(options);
        this.update();
    }

    private onEditorMouseDown(e: monaco.editor.IEditorMouseEvent): void {
        const range = e.target.range;

        if (!range) {
            return;
        }

        if (!e.event.leftButton) {
            return;
        }

        if (e.target.type !== MouseTargetType.GUTTER_LINE_DECORATIONS) {
            return;
        }

        const data = e.target.detail;
        const gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth - data.glyphMarginLeft;

        // don't collide with folding and git decorations
        if (gutterOffsetX > 14) {
            return;
        }

        const mouseDownInfo = { lineNumber: range.startLineNumber };

        const { lineNumber } = mouseDownInfo;

        if (!range || range.startLineNumber !== lineNumber) {
            return;
        }

        if (e.target.type !== MouseTargetType.GUTTER_LINE_DECORATIONS) {
            return;
        }

        if (!e.target.element) {
            return;
        }

        if (this.commentGlyphWidget && this.commentGlyphWidget.getPosition() !== lineNumber) {
            return;
        }

        if (e.target.element.className.indexOf('comment-thread') >= 0) {
            this.toggleExpand(lineNumber);
            return;
        }

        if (this._commentThread.collapsibleState === CommentThreadCollapsibleState.Collapsed) {
            this.display({ afterLineNumber: mouseDownInfo.lineNumber, heightInLines: 2 });
        } else {
            this.hide();
        }
    }

    public get owner(): string {
        return this._owner;
    }

    public get commentThread(): CommentThread {
        return this._commentThread;
    }

    private getThreadLabel(): string {
        let label: string | undefined;
        label = this._commentThread.label;

        if (label === undefined) {
            if (this._commentThread.comments && this._commentThread.comments.length) {
                const onlyUnique = (value: Comment, index: number, self: Comment[]) => self.indexOf(value) === index;
                const participantsList = this._commentThread.comments.filter(onlyUnique).map(comment => `@${comment.userName}`).join(', ');
                const resolutionState = this._commentThread.state === CommentThreadState.Resolved ? '(Resolved)' : '(Unresolved)';
                label = `Participants: ${participantsList} ${resolutionState}`;
            } else {
                label = 'Start discussion';
            }
        }

        return label;
    }

    override update(): void {
        if (!this.isExpanded) {
            return;
        }
        this.render();
        const headHeight = Math.ceil(this.zoneWidget.editor.getOption(monaco.editor.EditorOption.lineHeight) * 1.2);
        const lineHeight = this.zoneWidget.editor.getOption(monaco.editor.EditorOption.lineHeight);
        const arrowHeight = Math.round(lineHeight / 3);
        const frameThickness = Math.round(lineHeight / 9) * 2;
        const body = this.zoneWidget.containerNode.getElementsByClassName('body')[0];

        const computedLinesNumber = Math.ceil((headHeight + body.clientHeight + arrowHeight + frameThickness + 8 /** margin bottom to avoid margin collapse */) / lineHeight);
        this.zoneWidget.show({ afterLineNumber: this._commentThread.range.startLineNumber, heightInLines: computedLinesNumber });
    }

    protected render(): void {
        const headHeight = Math.ceil(this.zoneWidget.editor.getOption(monaco.editor.EditorOption.lineHeight) * 1.2);
        this.containerNodeRoot.render(<div className={'review-widget'}>
            <div className={'head'} style={{ height: headHeight, lineHeight: `${headHeight}px` }}>
                <div className={'review-title'}>
                    <span className={'filename'}>{this.getThreadLabel()}</span>
                </div>
                <div className={'review-actions'}>
                    <div className={'monaco-action-bar animated'}>
                        <ul className={'actions-container'} role={'toolbar'}>
                            <li className={'action-item'} role={'presentation'}>
                                <a className={'action-label codicon expand-review-action codicon-chevron-up'}
                                    role={'button'}
                                    tabIndex={0}
                                    title={'Collapse'}
                                    onClick={() => this.collapse()}
                                />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className={'body'}>
                <div className={'comments-container'} role={'presentation'} tabIndex={0}>
                    {this._commentThread.comments?.map((comment, index) => <ReviewComment
                        key={index}
                        contextKeyService={this.contextKeyService}
                        commentsContext={this.commentsContext}
                        menus={this.menus}
                        comment={comment}
                        commentForm={this.commentFormRef}
                        commands={this.commands}
                        commentThread={this._commentThread}
                    />)}
                </div>
                <CommentForm contextKeyService={this.contextKeyService}
                    commentsContext={this.commentsContext}
                    commands={this.commands}
                    commentThread={this._commentThread}
                    menus={this.menus}
                    widget={this}
                    ref={this.commentFormRef}
                />
            </div>
        </div>);
    }
}

namespace CommentForm {
    export interface Props {
        menus: MenuModelRegistry,
        commentThread: CommentThread;
        commands: CommandRegistry;
        contextKeyService: ContextKeyService;
        commentsContext: CommentsContext;
        widget: CommentThreadWidget;
    }

    export interface State {
        expanded: boolean
    }
}

export class CommentForm<P extends CommentForm.Props = CommentForm.Props> extends React.Component<P, CommentForm.State> {
    private readonly menu: CompoundMenuNode;
    private inputRef: RefObject<HTMLTextAreaElement> = React.createRef<HTMLTextAreaElement>();
    private inputValue: string = '';
    private readonly getInput = () => this.inputValue;
    private toDisposeOnUnmount = new DisposableCollection();
    private readonly clearInput: () => void = () => {
        const input = this.inputRef.current;
        if (input) {
            this.inputValue = '';
            input.value = this.inputValue;
            this.props.commentsContext.commentIsEmpty.set(true);
        }
    };

    update(): void {
        this.setState(this.state);
    }

    protected expand = () => {
        this.setState({ expanded: true });
        // Wait for the widget to be rendered.
        setTimeout(() => {
            // Update the widget's height.
            this.props.widget.update();
            this.inputRef.current?.focus();
        }, 100);
    };
    protected collapse = () => {
        this.setState({ expanded: false });
        // Wait for the widget to be rendered.
        setTimeout(() => {
            // Update the widget's height.
            this.props.widget.update();
        }, 100);
    };

    override componentDidMount(): void {
        // Wait for the widget to be rendered.
        setTimeout(() => {
            this.inputRef.current?.focus();
        }, 100);
    }

    override componentWillUnmount(): void {
        this.toDisposeOnUnmount.dispose();
    }

    private readonly onInput: (event: React.FormEvent) => void = (event: React.FormEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (event.target as any).value;
        if (this.inputValue.length === 0 || value.length === 0) {
            this.props.commentsContext.commentIsEmpty.set(value.length === 0);
        }
        this.inputValue = value;
    };

    constructor(props: P) {
        super(props);
        this.state = {
            expanded: false
        };

        const setState = this.setState.bind(this);
        this.setState = newState => {
            setState(newState);
        };
    }

    override render(): React.ReactNode {
        const { commentThread, commentsContext, contextKeyService } = this.props;
        const hasExistingComments = commentThread.comments && commentThread.comments.length > 0;
        return commentThread.canReply ? <div className={'comment-form' + (this.state.expanded || commentThread.comments && commentThread.comments.length === 0 ? ' expand' : '')}>
            <div className={'theia-comments-input-message-container'}>
                <textarea className={'theia-comments-input-message theia-input'}
                    spellCheck={false}
                    placeholder={hasExistingComments ? 'Reply...' : 'Type a new comment'}
                    onInput={this.onInput}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onBlur={(event: any) => {
                        if (event.target.value.length > 0) {
                            return;
                        }
                        if (event.relatedTarget && event.relatedTarget.className === 'comments-button comments-text-button theia-button') {
                            this.state = { expanded: false };
                            return;
                        }
                        this.collapse();
                    }}
                    ref={this.inputRef}>
                </textarea>
            </div>
            <CommentActions menu={this.menu}
                menuPath={[]}
                contextKeyService={contextKeyService}
                commentsContext={commentsContext}
                commentThread={commentThread}
                getInput={this.getInput}
                clearInput={this.clearInput}
            />
            <button className={'review-thread-reply-button'} title={'Reply...'} onClick={this.expand}>Reply...</button>
        </div> : null;
    }
}

namespace ReviewComment {
    export interface Props {
        menus: MenuModelRegistry,
        comment: Comment;
        commentThread: CommentThread;
        contextKeyService: ContextKeyService;
        commentsContext: CommentsContext;
        commands: CommandRegistry;
        commentForm: RefObject<CommentForm>;
    }

    export interface State {
        hover: boolean
    }
}

export class ReviewComment<P extends ReviewComment.Props = ReviewComment.Props> extends React.Component<P, ReviewComment.State> {

    constructor(props: P) {
        super(props);
        this.state = {
            hover: false
        };

        const setState = this.setState.bind(this);
        this.setState = newState => {
            setState(newState);
        };
    }

    protected detectHover = (element: HTMLElement | null) => {
        if (element) {
            window.requestAnimationFrame(() => {
                const hover = element.matches(':hover');
                this.setState({ hover });
            });
        }
    };

    protected showHover = () => this.setState({ hover: true });
    protected hideHover = () => this.setState({ hover: false });

    override render(): React.ReactNode {
        const { comment, commentForm, contextKeyService, commentsContext, menus, commands, commentThread } = this.props;
        const commentUniqueId = comment.uniqueIdInThread;
        const { hover } = this.state;
        commentsContext.comment.set(comment.contextValue);
        return <div className={'review-comment'}
            tabIndex={-1}
            aria-label={`${comment.userName}, ${comment.body.value}`}
            ref={this.detectHover}
            onMouseEnter={this.showHover}
            onMouseLeave={this.hideHover}>
            <div className={'avatar-container'}>
                <img className={'avatar'} src={comment.userIconPath} />
            </div>
            <div className={'review-comment-contents'}>
                <div className={'comment-title monaco-mouse-cursor-text'}>
                    <strong className={'author'}>{comment.userName}</strong>
                    <small className={'timestamp'}>{this.localeDate(comment.timestamp)}</small>
                    <span className={'isPending'}>{comment.label}</span>
                    <div className={'theia-comments-inline-actions-container'}>
                        <div className={'theia-comments-inline-actions'} role={'toolbar'}>
                            {hover && menus.getMenu(COMMENT_TITLE).children.map((node, index): React.ReactNode => CommandMenu.is(node) &&
                                <CommentsInlineAction key={index} {...{ node, nodePath: [...COMMENT_TITLE, node.id], commands, commentThread, commentUniqueId, contextKeyService, commentsContext }} />)}
                        </div>
                    </div>
                </div>
                <CommentBody value={comment.body.value}
                    isVisible={comment.mode === undefined || comment.mode === CommentMode.Preview} />
                <CommentEditContainer contextKeyService={contextKeyService}
                    commentsContext={commentsContext}
                    menus={menus}
                    comment={comment}
                    commentThread={commentThread}
                    commentForm={commentForm}
                    commands={commands} />
            </div>
        </div>;
    }
    protected localeDate(timestamp: string | undefined): string {
        if (timestamp === undefined) {
            return '';
        }
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date.toLocaleString();
        }
        return '';
    }
}

namespace CommentBody {
    export interface Props {
        value: string
        isVisible: boolean
    }
}

export class CommentBody extends React.Component<CommentBody.Props> {
    override render(): React.ReactNode {
        const { value, isVisible } = this.props;
        if (!isVisible) {
            return false;
        }
        return <div className={'comment-body monaco-mouse-cursor-text'}>
            <div>
                <p>{value}</p>
            </div>
        </div>;
    }
}

namespace CommentEditContainer {
    export interface Props {
        contextKeyService: ContextKeyService;
        commentsContext: CommentsContext;
        menus: MenuModelRegistry,
        comment: Comment;
        commentThread: CommentThread;
        commentForm: RefObject<CommentForm>;
        commands: CommandRegistry;
    }
}

export class CommentEditContainer extends React.Component<CommentEditContainer.Props> {
    private readonly inputRef: RefObject<HTMLTextAreaElement> = React.createRef<HTMLTextAreaElement>();
    private dirtyCommentMode: CommentMode | undefined;
    private dirtyCommentFormState: boolean | undefined;

    override componentDidUpdate(prevProps: Readonly<CommentEditContainer.Props>, prevState: Readonly<{}>): void {
        const commentFormState = this.props.commentForm.current?.state;
        const mode = this.props.comment.mode;
        if (this.dirtyCommentMode !== mode || (this.dirtyCommentFormState !== commentFormState?.expanded && !commentFormState?.expanded)) {
            const currentInput = this.inputRef.current;
            if (currentInput) {
                // Wait for the widget to be rendered.
                setTimeout(() => {
                    currentInput.focus();
                    currentInput.setSelectionRange(currentInput.value.length, currentInput.value.length);
                }, 50);
            }
        }
        this.dirtyCommentMode = mode;
        this.dirtyCommentFormState = commentFormState?.expanded;
    }

    override render(): React.ReactNode {
        const { menus, comment, commands, commentThread, contextKeyService, commentsContext } = this.props;
        if (!(comment.mode === CommentMode.Editing)) {
            return false;
        }
        return <div className={'edit-container'}>
            <div className={'edit-textarea'}>
                <div className={'theia-comments-input-message-container'}>
                    <textarea className={'theia-comments-input-message theia-input'}
                        spellCheck={false}
                        defaultValue={comment.body.value}
                        ref={this.inputRef} />
                </div>
            </div>
            <div className={'form-actions'}>
                {menus.getMenu(COMMENT_CONTEXT).children.map((node, index): React.ReactNode => {
                    const onClick = () => {
                        commands.executeCommand(node.id, {
                            thread: commentThread,
                            commentUniqueId: comment.uniqueIdInThread,
                            text: this.inputRef.current ? this.inputRef.current.value : ''
                        });
                    };
                    return CommandMenu.is(node) &&
                        <CommentAction key={index} {...{ node, nodePath: [...COMMENT_CONTEXT, node.id], commands, onClick, contextKeyService, commentsContext }} />;
                }
                )}
            </div>
        </div>;
    }
}

namespace CommentsInlineAction {
    export interface Props {
        nodePath: MenuPath,
        node: CommandMenu;
        commentThread: CommentThread;
        commentUniqueId: number;
        commands: CommandRegistry;
        contextKeyService: ContextKeyService;
        commentsContext: CommentsContext;
    }
}

export class CommentsInlineAction extends React.Component<CommentsInlineAction.Props> {
    override render(): React.ReactNode {
        const { node, nodePath, commands, contextKeyService, commentThread, commentUniqueId } = this.props;
        if (node.isVisible(nodePath, contextKeyService, undefined)) {
            return false;
        }
        return <div className='theia-comments-inline-action'>
            <a className={node.icon}
                title={node.label}
                onClick={() => {
                    commands.executeCommand(node.id, {
                        thread: commentThread,
                        commentUniqueId
                    });
                }} />
        </div>;
    }
}

namespace CommentActions {
    export interface Props {
        contextKeyService: ContextKeyService;
        commentsContext: CommentsContext;
        menuPath: MenuPath,
        menu: CompoundMenuNode;
        commentThread: CommentThread;
        getInput: () => string;
        clearInput: () => void;
    }
}

export class CommentActions extends React.Component<CommentActions.Props> {
    override render(): React.ReactNode {
        const { contextKeyService, commentsContext, menuPath, menu, commentThread, getInput, clearInput } = this.props;
        return <div className={'form-actions'}>
            {menu.children.map((node, index) => CommandMenu.is(node) &&
                <CommentAction key={index}
                    nodePath={menuPath}
                    node={node}
                    onClick={() => {
                        node.run(
                            [...menuPath, menu.id], {
                            thread: commentThread,
                            text: getInput()
                        });
                        clearInput();
                    }}
                    contextKeyService={contextKeyService}
                    commentsContext={commentsContext}
                />)}
        </div>;
    }
}
namespace CommentAction {
    export interface Props {
        contextKeyService: ContextKeyService;
        commentsContext: CommentsContext;
        nodePath: MenuPath,
        node: CommandMenu;
        onClick: () => void;
    }
}

export class CommentAction extends React.Component<CommentAction.Props> {
    override render(): React.ReactNode {
        const classNames = ['comments-button', 'comments-text-button', 'theia-button'];
        const { node, nodePath, contextKeyService, onClick } = this.props;
        if (!node.isVisible(nodePath, contextKeyService, undefined)) {
            return false;
        }
        const isEnabled = node.isEnabled(nodePath);
        if (!isEnabled) {
            classNames.push(DISABLED_CLASS);
        }
        return <button
            className={classNames.join(' ')}
            tabIndex={0}
            role={'button'}
            onClick={() => {
                if (isEnabled) {
                    onClick();
                }
            }}>{node.label}
        </button>;
    }
}
