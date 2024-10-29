// *****************************************************************************
// Copyright (C) 2023 1C-Soft LLC and others.
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

import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { Position, Range } from '@theia/core/shared/vscode-languageserver-protocol';
import { CommandMenu, Disposable, Emitter, Event, MenuModelRegistry, MenuPath, URI, nls } from '@theia/core';
import { codicon } from '@theia/core/lib/browser';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { MonacoEditor } from '@theia/monaco/lib/browser/monaco-editor';
import { MonacoDiffEditor } from '@theia/monaco/lib/browser/monaco-diff-editor';
import { MonacoEditorProvider } from '@theia/monaco/lib/browser/monaco-editor-provider';
import { MonacoEditorPeekViewWidget, peekViewBorder, peekViewTitleBackground, peekViewTitleForeground, peekViewTitleInfoForeground }
    from '@theia/monaco/lib/browser/monaco-editor-peek-view-widget';
import { Change, LineRange } from './diff-computer';
import { ScmColors } from '../scm-colors';
import * as monaco from '@theia/monaco-editor-core';

export const SCM_CHANGE_TITLE_MENU: MenuPath = ['scm-change-title-menu'];
/** Reserved for plugin contributions, corresponds to contribution point 'scm/change/title'. */
export const PLUGIN_SCM_CHANGE_TITLE_MENU: MenuPath = ['plugin-scm-change-title-menu'];

export const DirtyDiffWidgetProps = Symbol('DirtyDiffWidgetProps');
export interface DirtyDiffWidgetProps {
    readonly editor: MonacoEditor;
    readonly previousRevisionUri: URI;
    readonly changes: readonly Change[];
}

export const DirtyDiffWidgetFactory = Symbol('DirtyDiffWidgetFactory');
export type DirtyDiffWidgetFactory = (props: DirtyDiffWidgetProps) => DirtyDiffWidget;

@injectable()
export class DirtyDiffWidget implements Disposable {

    private readonly onDidCloseEmitter = new Emitter<unknown>();
    readonly onDidClose: Event<unknown> = this.onDidCloseEmitter.event;
    protected index: number = -1;
    private peekView?: DirtyDiffPeekView;
    private diffEditorPromise?: Promise<MonacoDiffEditor>;

    constructor(
        @inject(DirtyDiffWidgetProps) protected readonly props: DirtyDiffWidgetProps,
        @inject(MonacoEditorProvider) readonly editorProvider: MonacoEditorProvider,
        @inject(ContextKeyService) readonly contextKeyService: ContextKeyService,
        @inject(MenuModelRegistry) readonly menuModelRegistry: MenuModelRegistry,
    ) { }

    @postConstruct()
    create(): void {
        this.peekView = new DirtyDiffPeekView(this);
        this.peekView.onDidClose(e => this.onDidCloseEmitter.fire(e));
        this.diffEditorPromise = this.peekView.create();
    }

    get editor(): MonacoEditor {
        return this.props.editor;
    }

    get uri(): URI {
        return this.editor.uri;
    }

    get previousRevisionUri(): URI {
        return this.props.previousRevisionUri;
    }

    get changes(): readonly Change[] {
        return this.props.changes;
    }

    get currentChange(): Change | undefined {
        return this.changes[this.index];
    }

    get currentChangeIndex(): number {
        return this.index;
    }

    showChange(index: number): void {
        this.checkCreated();
        if (index >= 0 && index < this.changes.length) {
            this.index = index;
            this.showCurrentChange();
        }
    }

    showNextChange(): void {
        this.checkCreated();
        const index = this.index;
        const length = this.changes.length;
        if (length > 0 && (index < 0 || length > 1)) {
            this.index = index < 0 ? 0 : cycle(index, 1, length);
            this.showCurrentChange();
        }
    }

    showPreviousChange(): void {
        this.checkCreated();
        const index = this.index;
        const length = this.changes.length;
        if (length > 0 && (index < 0 || length > 1)) {
            this.index = index < 0 ? length - 1 : cycle(index, -1, length);
            this.showCurrentChange();
        }
    }

    async getContentWithSelectedChanges(predicate: (change: Change, index: number, changes: readonly Change[]) => boolean): Promise<string> {
        this.checkCreated();
        const changes = this.changes.filter(predicate);
        const { diffEditor } = await this.diffEditorPromise!;
        const diffEditorModel = diffEditor.getModel()!;
        return applyChanges(changes, diffEditorModel.original, diffEditorModel.modified);
    }

    dispose(): void {
        this.peekView?.dispose();
        this.onDidCloseEmitter.dispose();
    }

    protected showCurrentChange(): void {
        this.peekView!.setTitle(this.computePrimaryHeading(), this.computeSecondaryHeading());
        const { previousRange, currentRange } = this.changes[this.index];
        this.peekView!.show(Position.create(LineRange.getEndPosition(currentRange).line, 0),
            this.computeHeightInLines());
        this.diffEditorPromise!.then(({ diffEditor }) => {
            let startLine = LineRange.getStartPosition(currentRange).line;
            let endLine = LineRange.getEndPosition(currentRange).line;
            if (LineRange.isEmpty(currentRange)) { // the change is a removal
                ++endLine;
            } else if (!LineRange.isEmpty(previousRange)) { // the change is a modification
                --startLine;
                ++endLine;
            }
            diffEditor.revealLinesInCenter(startLine + 1, endLine + 1, // monaco line numbers are 1-based
                monaco.editor.ScrollType.Immediate);
        });
        this.editor.focus();
    }

    protected computePrimaryHeading(): string {
        return this.uri.path.base;
    }

    protected computeSecondaryHeading(): string {
        const index = this.index + 1;
        const length = this.changes.length;
        return length > 1 ? nls.localizeByDefault('{0} of {1} changes', index, length) :
            nls.localizeByDefault('{0} of {1} change', index, length);
    }

    protected computeHeightInLines(): number {
        const editor = this.editor.getControl();
        const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
        const editorHeight = editor.getLayoutInfo().height;
        const editorHeightInLines = Math.floor(editorHeight / lineHeight);

        const { previousRange, currentRange } = this.changes[this.index];
        const changeHeightInLines = LineRange.getLineCount(currentRange) + LineRange.getLineCount(previousRange);

        return Math.min(changeHeightInLines + /* padding */ 8, Math.floor(editorHeightInLines / 3));
    }

    protected checkCreated(): void {
        if (!this.peekView) {
            throw new Error('create() method needs to be called first.');
        }
    }
}

function cycle(index: number, offset: -1 | 1, length: number): number {
    return (index + offset + length) % length;
}

// adapted from https://github.com/microsoft/vscode/blob/823d54f86ee13eb357bc6e8e562e89d793f3c43b/extensions/git/src/staging.ts
function applyChanges(changes: readonly Change[], original: monaco.editor.ITextModel, modified: monaco.editor.ITextModel): string {
    const result: string[] = [];
    let currentLine = 1;

    for (const change of changes) {
        const { previousRange, currentRange } = change;

        const isInsertion = LineRange.isEmpty(previousRange);
        const isDeletion = LineRange.isEmpty(currentRange);

        const convert = (range: LineRange): [number, number] => {
            let startLineNumber;
            let endLineNumber;
            if (!LineRange.isEmpty(range)) {
                startLineNumber = range.start + 1;
                endLineNumber = range.end;
            } else {
                startLineNumber = range.start;
                endLineNumber = 0;
            }
            return [startLineNumber, endLineNumber];
        };

        const [originalStartLineNumber, originalEndLineNumber] = convert(previousRange);
        const [modifiedStartLineNumber, modifiedEndLineNumber] = convert(currentRange);

        let toLine = isInsertion ? originalStartLineNumber + 1 : originalStartLineNumber;
        let toCharacter = 1;

        // if this is a deletion at the very end of the document,
        // we need to account for a newline at the end of the last line,
        // which may have been deleted
        if (isDeletion && originalEndLineNumber === original.getLineCount()) {
            toLine--;
            toCharacter = original.getLineMaxColumn(toLine);
        }

        result.push(original.getValueInRange(new monaco.Range(currentLine, 1, toLine, toCharacter)));

        if (!isDeletion) {
            let fromLine = modifiedStartLineNumber;
            let fromCharacter = 1;

            // if this is an insertion at the very end of the document,
            // we must start the next range after the last character of the previous line,
            // in order to take the correct eol
            if (isInsertion && originalStartLineNumber === original.getLineCount()) {
                fromLine--;
                fromCharacter = modified.getLineMaxColumn(fromLine);
            }

            result.push(modified.getValueInRange(new monaco.Range(fromLine, fromCharacter, modifiedEndLineNumber + 1, 1)));
        }

        currentLine = isInsertion ? originalStartLineNumber + 1 : originalEndLineNumber + 1;
    }

    result.push(original.getValueInRange(new monaco.Range(currentLine, 1, original.getLineCount() + 1, 1)));

    return result.join('');
}

class DirtyDiffPeekView extends MonacoEditorPeekViewWidget {

    private diffEditorPromise?: Promise<MonacoDiffEditor>;
    private height?: number;

    constructor(readonly widget: DirtyDiffWidget) {
        super(widget.editor, { isResizeable: true, showArrow: true, frameWidth: 1, keepEditorSelection: true, className: 'dirty-diff' });
    }

    override async create(): Promise<MonacoDiffEditor> {
        try {
            super.create();
            const diffEditor = await this.diffEditorPromise!;
            return new Promise(resolve => {
                // setTimeout is needed here because the non-side-by-side diff editor might still not have created the view zones;
                // otherwise, the first change shown might not be properly revealed in the diff editor.
                // see also https://github.com/microsoft/vscode/blob/b30900b56c4b3ca6c65d7ab92032651f4cb23f15/src/vs/workbench/contrib/scm/browser/dirtydiffDecorator.ts#L248
                const disposable = diffEditor.diffEditor.onDidUpdateDiff(() => setTimeout(() => {
                    resolve(diffEditor);
                    disposable.dispose();
                }));
            });
        } catch (e) {
            this.dispose();
            throw e;
        }
    }

    override show(rangeOrPos: Range | Position, heightInLines: number): void {
        const borderColor = this.getBorderColor();
        this.style({
            arrowColor: borderColor,
            frameColor: borderColor,
            headerBackgroundColor: peekViewTitleBackground,
            primaryHeadingColor: peekViewTitleForeground,
            secondaryHeadingColor: peekViewTitleInfoForeground
        });
        this.updateActions();
        super.show(rangeOrPos, heightInLines);
    }

    private getBorderColor(): string {
        const { currentChange } = this.widget;
        if (!currentChange) {
            return peekViewBorder;
        }
        if (Change.isAddition(currentChange)) {
            return ScmColors.editorGutterAddedBackground;
        } else if (Change.isRemoval(currentChange)) {
            return ScmColors.editorGutterDeletedBackground;
        } else {
            return ScmColors.editorGutterModifiedBackground;
        }
    }

    private updateActions(): void {
        this.clearActions();
        const { contextKeyService, menuModelRegistry } = this.widget;
        contextKeyService.with({ originalResourceScheme: this.widget.previousRevisionUri.scheme }, () => {
            for (const menuPath of [SCM_CHANGE_TITLE_MENU, PLUGIN_SCM_CHANGE_TITLE_MENU]) {
                const menu = menuModelRegistry.getMenu(menuPath);
                for (const item of menu.children) {
                    if (CommandMenu.is(item)) {
                        const { id, label, icon } = item;
                        const itemPath = [...menuPath, id];
                        if (icon && item.isVisible(itemPath, contextKeyService, undefined)) {
                            this.addAction(id, label, icon, item.isEnabled(itemPath), () => {
                                item.run(itemPath, this.widget);
                            });
                        }
                    }
                }
            }
        });
        this.addAction('dirtydiff.next', nls.localizeByDefault('Show Next Change'), codicon('arrow-down'), true,
            () => this.widget.showNextChange());
        this.addAction('dirtydiff.previous', nls.localizeByDefault('Show Previous Change'), codicon('arrow-up'), true,
            () => this.widget.showPreviousChange());
        this.addAction('peekview.close', nls.localizeByDefault('Close'), codicon('close'), true,
            () => this.dispose());
    }

    protected override fillHead(container: HTMLElement): void {
        super.fillHead(container, true);
    }

    protected override fillBody(container: HTMLElement): void {
        this.diffEditorPromise = this.widget.editorProvider.createEmbeddedDiffEditor(this.editor, container, this.widget.previousRevisionUri).then(diffEditor => {
            this.toDispose.push(diffEditor);
            return diffEditor;
        });
    }

    protected override doLayoutBody(height: number, width: number): void {
        super.doLayoutBody(height, width);
        this.layout(height, width);
        this.height = height;
    }

    protected override onWidth(width: number): void {
        super.onWidth(width);
        const { height } = this;
        if (height !== undefined) {
            this.layout(height, width);
        }
    }

    private layout(height: number, width: number): void {
        this.diffEditorPromise?.then(({ diffEditor }) => diffEditor.layout({ height, width }));
    }

    protected override doRevealRange(range: Range): void {
        this.editor.revealPosition(Position.create(range.end.line, 0), { vertical: 'centerIfOutsideViewport' });
    }
}
