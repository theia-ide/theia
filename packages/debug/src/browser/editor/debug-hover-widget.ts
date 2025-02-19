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

import debounce = require('@theia/core/shared/lodash.debounce');

import { Widget } from '@theia/core/shared/@lumino/widgets';
import { Message } from '@theia/core/shared/@lumino/messaging';
import { injectable, postConstruct, inject, Container, interfaces } from '@theia/core/shared/inversify';
import { Key } from '@theia/core/lib/browser';
import { SourceTreeWidget } from '@theia/core/lib/browser/source-tree';
import { Disposable, DisposableCollection } from '@theia/core/lib/common/disposable';
import { DebugSessionManager } from '../debug-session-manager';
import { DebugEditor } from './debug-editor';
import { DebugExpressionProvider } from './debug-expression-provider';
import { DebugHoverSource } from './debug-hover-source';
import { DebugVariable } from '../console/debug-console-items';
import * as monaco from '@theia/monaco-editor-core';
import { StandaloneServices } from '@theia/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices';
import { ILanguageFeaturesService } from '@theia/monaco-editor-core/esm/vs/editor/common/services/languageFeatures';
import { CancellationTokenSource } from '@theia/monaco-editor-core/esm/vs/base/common/cancellation';
import { Position } from '@theia/monaco-editor-core/esm/vs/editor/common/core/position';
import { ArrayUtils } from '@theia/core';

export interface ShowDebugHoverOptions {
    selection: monaco.Range
    /** default: false */
    focus?: boolean
    /** default: true */
    immediate?: boolean
}

export interface HideDebugHoverOptions {
    /** default: true */
    immediate?: boolean
}

export function createDebugHoverWidgetContainer(parent: interfaces.Container, editor: DebugEditor): Container {
    const child = SourceTreeWidget.createContainer(parent, {
        virtualized: false
    });
    child.bind(DebugEditor).toConstantValue(editor);
    child.bind(DebugHoverSource).toSelf();
    child.unbind(SourceTreeWidget);
    child.bind(DebugExpressionProvider).toSelf();
    child.bind(DebugHoverWidget).toSelf();
    return child;
}

@injectable()
export class DebugHoverWidget extends SourceTreeWidget implements monaco.editor.IContentWidget {

    @inject(DebugEditor)
    protected readonly editor: DebugEditor;

    @inject(DebugSessionManager)
    protected readonly sessions: DebugSessionManager;

    @inject(DebugHoverSource)
    protected readonly hoverSource: DebugHoverSource;

    @inject(DebugExpressionProvider)
    protected readonly expressionProvider: DebugExpressionProvider;

    allowEditorOverflow = true;

    static ID = 'debug.editor.hover';
    getId(): string {
        return DebugHoverWidget.ID;
    }

    protected readonly domNode = document.createElement('div');
    protected readonly titleNode = document.createElement('div');
    protected readonly contentNode = document.createElement('div');
    getDomNode(): HTMLElement {
        return this.domNode;
    }

    @postConstruct()
    protected override init(): void {
        super.init();
        this.domNode.className = 'theia-debug-hover';
        this.titleNode.className = 'theia-debug-hover-title';
        this.domNode.appendChild(this.titleNode);
        this.contentNode.className = 'theia-debug-hover-content';
        this.domNode.appendChild(this.contentNode);

        // for stopping scroll events from contentNode going to the editor
        this.contentNode.addEventListener('wheel', e => e.stopPropagation());

        this.editor.getControl().addContentWidget(this);
        this.source = this.hoverSource;
        this.toDispose.pushAll([
            this.hoverSource,
            Disposable.create(() => this.editor.getControl().removeContentWidget(this)),
            Disposable.create(() => this.hide()),
            this.sessions.onDidChange(() => {
                if (!this.isEditorFrame()) {
                    this.hide();
                }
            })
        ]);
    }

    override dispose(): void {
        this.toDispose.dispose();
    }

    override show(options?: ShowDebugHoverOptions): void {
        this.schedule(() => this.doShow(options), options && options.immediate);
    }

    override hide(options?: HideDebugHoverOptions): void {
        this.schedule(() => this.doHide(), options && options.immediate);
    }

    protected readonly doSchedule = debounce((fn: () => void) => fn(), 300);
    protected schedule(fn: () => void, immediate: boolean = true): void {
        if (immediate) {
            this.doSchedule.cancel();
            fn();
        } else {
            this.doSchedule(fn);
        }
    }

    protected options: ShowDebugHoverOptions | undefined;
    protected doHide(): void {
        if (!this.isVisible) {
            return;
        }
        if (this.domNode.contains(document.activeElement)) {
            this.editor.getControl().focus();
        }
        if (this.isAttached) {
            Widget.detach(this);
        }
        this.hoverSource.reset();
        super.hide();
        this.options = undefined;
        this.editor.getControl().layoutContentWidget(this);
    }

    protected async doShow(options: ShowDebugHoverOptions | undefined = this.options): Promise<void> {
        const cancellationSource = new CancellationTokenSource();

        if (!this.isEditorFrame()) {
            this.hide();
            return;
        }
        if (!options) {
            this.hide();
            return;
        }
        if (this.options && this.options.selection.equalsRange(options.selection)) {
            return;
        }
        if (!this.isAttached) {
            Widget.attach(this, this.contentNode);
        }

        this.options = options;
        let matchingExpression: string | undefined;

        const pluginExpressionProvider = StandaloneServices.get(ILanguageFeaturesService).evaluatableExpressionProvider;
        const textEditorModel = this.editor.document.textEditorModel;

        if (pluginExpressionProvider && pluginExpressionProvider.has(textEditorModel)) {
            const registeredProviders = pluginExpressionProvider.ordered(textEditorModel);
            const position = new Position(this.options!.selection.startLineNumber, this.options!.selection.startColumn);

            const promises = registeredProviders.map(support =>
                Promise.resolve(support.provideEvaluatableExpression(textEditorModel, position, cancellationSource.token))
            );

            const results = await Promise.all(promises).then(ArrayUtils.coalesce);
            if (results.length > 0) {
                matchingExpression = results[0].expression;
                const range = results[0].range;

                if (!matchingExpression) {
                    const lineContent = textEditorModel.getLineContent(position.lineNumber);
                    matchingExpression = lineContent.substring(range.startColumn - 1, range.endColumn - 1);
                }
            }
        } else { // use fallback if no provider was registered
            matchingExpression = this.expressionProvider.get(this.editor.getControl().getModel()!, options.selection);
            if (matchingExpression) {
                const expressionLineContent = this.editor
                    .getControl()
                    .getModel()!
                    .getLineContent(this.options.selection.startLineNumber);
                const startColumn =
                    expressionLineContent.indexOf(
                        matchingExpression,
                        this.options.selection.startColumn - matchingExpression.length
                    ) + 1;
                const endColumn = startColumn + matchingExpression.length;
                this.options.selection = new monaco.Range(
                    this.options.selection.startLineNumber,
                    startColumn,
                    this.options.selection.startLineNumber,
                    endColumn
                );
            }
        }

        if (!matchingExpression) {
            this.hide();
            return;
        }
        const toFocus = new DisposableCollection();
        if (this.options.focus === true) {
            toFocus.push(this.model.onNodeRefreshed(() => {
                toFocus.dispose();
                this.activate();
            }));
        }
        const expression = await this.hoverSource.evaluate(matchingExpression);
        if (!expression) {
            toFocus.dispose();
            this.hide();
            return;
        }

        this.contentNode.hidden = false;
        ['number', 'boolean', 'string'].forEach(token => this.titleNode.classList.remove(token));
        this.domNode.classList.remove('complex-value');
        if (expression.hasElements) {
            this.domNode.classList.add('complex-value');
        } else {
            this.contentNode.hidden = true;
            if (expression.type === 'number' || expression.type === 'boolean' || expression.type === 'string') {
                this.titleNode.classList.add(expression.type);
            } else if (!isNaN(+expression.value)) {
                this.titleNode.classList.add('number');
            } else if (DebugVariable.booleanRegex.test(expression.value)) {
                this.titleNode.classList.add('boolean');
            } else if (DebugVariable.stringRegex.test(expression.value)) {
                this.titleNode.classList.add('string');
            }
        }

        super.show();
        await new Promise<void>(resolve => {
            setTimeout(() => window.requestAnimationFrame(() => {
                this.editor.getControl().layoutContentWidget(this);
                resolve();
            }), 0);
        });
    }

    protected isEditorFrame(): boolean {
        return this.sessions.isCurrentEditorFrame(this.editor.getControl().getModel()!.uri);
    }

    getPosition(): monaco.editor.IContentWidgetPosition {
        if (!this.isVisible) {
            return undefined!;
        }
        const position = this.options && this.options.selection.getStartPosition();
        return position
            ? {
                position: new monaco.Position(position.lineNumber, position.column),
                preference: [
                    monaco.editor.ContentWidgetPositionPreference.ABOVE,
                    monaco.editor.ContentWidgetPositionPreference.BELOW,
                ],
            }
            : undefined!;
    }

    protected override onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        const { expression } = this.hoverSource;
        const value = expression && expression.value || '';
        this.titleNode.textContent = value;
        this.titleNode.title = value;
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.addKeyListener(this.domNode, Key.ESCAPE, () => this.hide());
    }

}
