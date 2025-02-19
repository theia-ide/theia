// *****************************************************************************
// Copyright (C) 2023 TypeFox and others.
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

import { EditorServiceOverrides, MonacoEditor, MonacoEditorServices } from './monaco-editor';

import { CodeEditorWidget, ICodeEditorWidgetOptions } from '@theia/monaco-editor-core/esm/vs/editor/browser/widget/codeEditor/codeEditorWidget';
import { IInstantiationService } from '@theia/monaco-editor-core/esm/vs/platform/instantiation/common/instantiation';
import { StandaloneServices } from '@theia/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices';
import { ServiceCollection } from '@theia/monaco-editor-core/esm/vs/platform/instantiation/common/serviceCollection';
import { Disposable, DisposableCollection, Emitter, TextDocumentContentChangeDelta, URI } from '@theia/core';
import { MonacoEditorModel } from './monaco-editor-model';
import { Dimension, EditorMouseEvent, MouseTarget, Position, TextDocumentChangeEvent } from '@theia/editor/lib/browser';
import * as monaco from '@theia/monaco-editor-core';
import { ElementExt } from '@theia/core/shared/@lumino/domutils';
import { Selection } from '@theia/editor/lib/browser/editor';
import { SelectionDirection } from '@theia/monaco-editor-core/esm/vs/editor/common/core/selection';
import { ShowLightbulbIconMode } from '@theia/monaco-editor-core/esm/vs/editor/common/config/editorOptions';

export class SimpleMonacoEditor extends MonacoEditorServices implements Disposable {

    protected editor: CodeEditorWidget;
    protected readonly toDispose = new DisposableCollection();

    protected readonly onCursorPositionChangedEmitter = new Emitter<Position>();
    protected readonly onFocusChangedEmitter = new Emitter<boolean>();
    protected readonly onDocumentContentChangedEmitter = new Emitter<TextDocumentChangeEvent>();
    readonly onDocumentContentChanged = this.onDocumentContentChangedEmitter.event;
    protected readonly onMouseDownEmitter = new Emitter<EditorMouseEvent>();
    protected readonly onLanguageChangedEmitter = new Emitter<string>();
    readonly onLanguageChanged = this.onLanguageChangedEmitter.event;
    protected readonly onScrollChangedEmitter = new Emitter<void>();
    readonly onEncodingChanged = this.document.onDidChangeEncoding;
    protected readonly onResizeEmitter = new Emitter<Dimension | null>();
    readonly onDidResize = this.onResizeEmitter.event;
    readonly onDidChangeReadOnly = this.document.onDidChangeReadOnly;

    constructor(
        readonly uri: URI,
        readonly document: MonacoEditorModel,
        readonly node: HTMLElement,
        services: MonacoEditorServices,
        options?: MonacoEditor.IOptions,
        override?: EditorServiceOverrides,
        widgetOptions?: ICodeEditorWidgetOptions
    ) {
        super(services);
        this.toDispose.pushAll([
            this.onCursorPositionChangedEmitter,
            this.onFocusChangedEmitter,
            this.onDocumentContentChangedEmitter,
            this.onMouseDownEmitter,
            this.onLanguageChangedEmitter,
            this.onScrollChangedEmitter
        ]);
        this.toDispose.push(this.create({
            ...MonacoEditor.createReadOnlyOptions(document.readOnly),
            ...options
        }, override, widgetOptions));
        this.addHandlers(this.editor);
        this.editor.setModel(document.textEditorModel);
    }

    getControl(): CodeEditorWidget {
        return this.editor;
    }

    onSelectionChanged(listener: (range: Selection) => void): Disposable {
        return this.editor.onDidChangeCursorSelection(event =>
            listener({
                ...this.m2p.asRange(event.selection),
                direction: event.selection.getDirection() === SelectionDirection.LTR ? 'ltr' : 'rtl'
            }));
    }

    protected create(options?: MonacoEditor.IOptions, override?: EditorServiceOverrides, widgetOptions?: ICodeEditorWidgetOptions): Disposable {
        const combinedOptions = {
            ...options,
            lightbulb: { enabled: ShowLightbulbIconMode.On },
            fixedOverflowWidgets: false,
            automaticLayout: true,
            scrollbar: {
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                ...options?.scrollbar,
            }
        };
        const instantiator = this.getInstantiatorWithOverrides(override);
        return this.editor = instantiator.createInstance(CodeEditorWidget, this.node, {
            ...combinedOptions,
            dimension: {
                width: 0,
                height: 0
            },
        }, widgetOptions ?? {});
    }

    protected addHandlers(codeEditor: CodeEditorWidget): void {
        this.toDispose.push(codeEditor.onDidChangeModelLanguage(e =>
            this.fireLanguageChanged(e.newLanguage)
        ));
        this.toDispose.push(codeEditor.onDidChangeConfiguration(() => this.refresh()));
        this.toDispose.push(codeEditor.onDidChangeModel(() => this.refresh()));
        this.toDispose.push(codeEditor.onDidChangeModelContent(e => {
            this.refresh();
            this.onDocumentContentChangedEmitter.fire({ document: this.document, contentChanges: e.changes.map(this.mapModelContentChange.bind(this)) });
        }));
        this.toDispose.push(codeEditor.onMouseDown(e => {
            const { element, position, range } = e.target;
            this.onMouseDownEmitter.fire({
                target: {
                    ...(e.target as unknown as MouseTarget),
                    element: element || undefined,
                    mouseColumn: this.m2p.asPosition(undefined, e.target.mouseColumn).character,
                    range: range && this.m2p.asRange(range) || undefined,
                    position: position && this.m2p.asPosition(position.lineNumber, position.column) || undefined,
                    detail: undefined
                },
                event: e.event.browserEvent
            });
        }));
        this.toDispose.push(codeEditor.onDidScrollChange(e => {
            this.onScrollChangedEmitter.fire(undefined);
        }));
        this.toDispose.push(this.onDidChangeReadOnly(readOnly => {
            codeEditor.updateOptions(MonacoEditor.createReadOnlyOptions(readOnly));
        }));
    }

    setLanguage(languageId: string): void {
        monaco.editor.setModelLanguage(this.document.textEditorModel, languageId);
    }

    protected fireLanguageChanged(languageId: string): void {
        this.onLanguageChangedEmitter.fire(languageId);
    }

    protected getInstantiatorWithOverrides(override?: EditorServiceOverrides): IInstantiationService {
        const instantiator = StandaloneServices.get(IInstantiationService);
        if (override) {
            const overrideServices = new ServiceCollection(...override);
            return instantiator.createChild(overrideServices);
        }
        return instantiator;
    }

    protected mapModelContentChange(change: monaco.editor.IModelContentChange): TextDocumentContentChangeDelta {
        return {
            range: this.m2p.asRange(change.range),
            rangeLength: change.rangeLength,
            text: change.text
        };
    }

    focus(): void {
        this.editor.focus();
    }

    refresh(): void {
        this.autoresize();
    }

    resizeToFit(): void {
        this.autoresize();
        // eslint-disable-next-line no-null/no-null
        this.onResizeEmitter.fire(null);
    }

    setSize(dimension: Dimension): void {
        this.resize(dimension);
        this.onResizeEmitter.fire(dimension);
    }

    protected autoresize(): void {
        this.resize();
    }

    protected resize(dimension?: Dimension): void {
        if (this.node) {
            const layoutSize = this.computeLayoutSize(this.node, dimension);
            this.editor.layout(layoutSize);
        }
    }

    protected computeLayoutSize(hostNode: HTMLElement, dimension: monaco.editor.IDimension | undefined): monaco.editor.IDimension {
        if (dimension && dimension.width >= 0 && dimension.height >= 0) {
            return dimension;
        }
        const boxSizing = ElementExt.boxSizing(hostNode);

        const width = (!dimension || dimension.width < 0) ?
            this.getWidth(hostNode, boxSizing) :
            dimension.width;

        const height = (!dimension || dimension.height < 0) ?
            this.getHeight(hostNode, boxSizing) :
            dimension.height;

        return { width, height };
    }

    protected getWidth(hostNode: HTMLElement, boxSizing: ElementExt.IBoxSizing): number {
        return hostNode.offsetWidth - boxSizing.horizontalSum;
    }

    protected getHeight(hostNode: HTMLElement, boxSizing: ElementExt.IBoxSizing): number {
        return this.editor.getContentHeight();
    }

    dispose(): void {
        this.toDispose.dispose();
    }

}
