// *****************************************************************************
// Copyright (C) 2023 STMicroelectronics and others.
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

import { EditorManager } from './editor-manager';
import { EditorMouseEvent, MouseTargetType, Position, TextEditor } from './editor';
import { injectable, inject } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution, ContextMenuRenderer } from '@theia/core/lib/browser';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { Disposable, DisposableCollection, MenuPath } from '@theia/core';
import { EditorWidget } from './editor-widget';

export const EDITOR_LINENUMBER_CONTEXT_MENU: MenuPath = ['editor_linenumber_context_menu'];

@injectable()
export class EditorLineNumberContribution implements FrontendApplicationContribution {

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;

    onStart(): void {
        this.editorManager.onCreated(editor => this.addLineNumberContextMenu(editor));
    }

    protected addLineNumberContextMenu(editorWidget: EditorWidget): void {
        const editor = editorWidget.editor;
        if (editor) {
            const disposables = new DisposableCollection();
            disposables.push(editor.onMouseDown(event => this.handleContextMenu(editor, event)));
            const dispose = () => disposables.dispose();
            editorWidget.disposed.connect(dispose);
            disposables.push(Disposable.create(() => editorWidget.disposed.disconnect(dispose)));
        }
    }

    protected handleContextMenu(editor: TextEditor, event: EditorMouseEvent): void {
        if (event.target && (event.target.type === MouseTargetType.GUTTER_LINE_NUMBERS || event.target.type === MouseTargetType.GUTTER_GLYPH_MARGIN)) {
            if (event.event.button === 2) {
                editor.focus();
                const lineNumber = lineNumberFromPosition(event.target.position);
                const contextKeyService = this.contextKeyService.createOverlay([['editorLineNumber', lineNumber]]);
                const uri = editor.getResourceUri()!;
                const args = [{
                    lineNumber: lineNumber,
                    column: 1, // Compatible with Monaco editor IPosition API
                    uri: uri['codeUri'],
                }];

                setTimeout(() => {
                    this.contextMenuRenderer.render({
                        menuPath: EDITOR_LINENUMBER_CONTEXT_MENU,
                        anchor: event.event,
                        context: editor.node,
                        args,
                        contextKeyService
                    });
                });
            }
        }
    }

}

function lineNumberFromPosition(position: Position | undefined): number | undefined {
    // position.line is 0-based line position, where the expected editor line number is 1-based.
    if (position) {
        return position.line + 1;
    }
    return undefined;
}

