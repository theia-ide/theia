// *****************************************************************************
// Copyright (C) 2024 TypeFox and others.
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
import { ContextKeyChangeEvent, ContextKeyService, ContextMatcher, ScopedValueStore } from '@theia/core/lib/browser/context-key-service';
import { DisposableCollection } from '@theia/core';
import { NotebookKernelService } from './notebook-kernel-service';
import {
    NOTEBOOK_CELL_EDITABLE,
    NOTEBOOK_CELL_EXECUTING, NOTEBOOK_CELL_EXECUTION_STATE,
    NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_MARKDOWN_EDIT_MODE,
    NOTEBOOK_CELL_TYPE, NOTEBOOK_HAS_OUTPUTS, NOTEBOOK_KERNEL, NOTEBOOK_KERNEL_SELECTED,
    NOTEBOOK_OUTPUT_INPUT_FOCUSED,
    NOTEBOOK_VIEW_TYPE
} from '../contributions/notebook-context-keys';
import { NotebookEditorWidget } from '../notebook-editor-widget';
import { NotebookCellModel } from '../view-model/notebook-cell-model';
import { CellKind, NotebookCellsChangeType } from '../../common';
import { NotebookExecutionStateService } from './notebook-execution-state-service';

@injectable()
export class NotebookContextManager {
    @inject(ContextKeyService) protected contextKeyService: ContextKeyService;

    @inject(NotebookKernelService)
    protected readonly notebookKernelService: NotebookKernelService;

    @inject(NotebookExecutionStateService)
    protected readonly executionStateService: NotebookExecutionStateService;

    protected readonly toDispose = new DisposableCollection();

    protected _context?: HTMLElement;

    scopedStore: ScopedValueStore;

    get context(): HTMLElement | undefined {
        return this._context;
    }

    protected cellContexts: Map<number, Record<string, unknown>> = new Map();

    init(widget: NotebookEditorWidget): void {
        this._context = widget.node;
        this.scopedStore = this.contextKeyService.createScoped(widget.node);

        this.toDispose.dispose();

        this.scopedStore.setContext(NOTEBOOK_VIEW_TYPE, widget?.notebookType);

        // Kernel related keys
        const kernel = widget?.model ? this.notebookKernelService.getSelectedNotebookKernel(widget.model) : undefined;
        this.scopedStore.setContext(NOTEBOOK_KERNEL_SELECTED, !!kernel);
        this.scopedStore.setContext(NOTEBOOK_KERNEL, kernel?.id);
        this.toDispose.push(this.notebookKernelService.onDidChangeSelectedKernel(e => {
            if (e.notebook.toString() === widget?.getResourceUri()?.toString()) {
                this.scopedStore.setContext(NOTEBOOK_KERNEL_SELECTED, !!e.newKernel);
                this.scopedStore.setContext(NOTEBOOK_KERNEL, e.newKernel);
            }
        }));

        widget.model?.onDidChangeContent(events => {
            if (events.some(e => e.kind === NotebookCellsChangeType.ModelChange || e.kind === NotebookCellsChangeType.Output)) {
                this.scopedStore.setContext(NOTEBOOK_HAS_OUTPUTS, widget.model?.cells.some(cell => cell.outputs.length > 0));
            }
        });

        this.scopedStore.setContext(NOTEBOOK_HAS_OUTPUTS, !!widget.model?.cells.find(cell => cell.outputs.length > 0));

        // Cell Selection related keys
        this.scopedStore.setContext(NOTEBOOK_CELL_FOCUSED, !!widget.model?.selectedCell);
        widget.model?.onDidChangeSelectedCell(e => {
            this.selectedCellChanged(e.cell);
            this.scopedStore.setContext(NOTEBOOK_CELL_FOCUSED, !!e);
        });

        this.toDispose.push(this.executionStateService.onDidChangeExecution(e => {
            if (e.notebook.toString() === widget.model?.uri.toString()) {
                this.setCellContext(e.cellHandle, NOTEBOOK_CELL_EXECUTING, !!e.changed);
                this.setCellContext(e.cellHandle, NOTEBOOK_CELL_EXECUTION_STATE, e.changed?.state ?? 'idle');
            }
        }));

        widget.onDidChangeOutputInputFocus(focus => {
            this.scopedStore.setContext(NOTEBOOK_OUTPUT_INPUT_FOCUSED, focus);
        });
    }

    protected cellDisposables = new DisposableCollection();

    selectedCellChanged(cell: NotebookCellModel | undefined): void {
        this.cellDisposables.dispose();

        this.scopedStore.setContext(NOTEBOOK_CELL_TYPE, cell ? cell.cellKind === CellKind.Code ? 'code' : 'markdown' : undefined);

        if (cell) {
            this.scopedStore.setContext(NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, cell.editing);
            this.scopedStore.setContext(NOTEBOOK_CELL_EDITABLE, cell.cellKind === CellKind.Markup && !cell.editing);
            this.cellDisposables.push(cell.onDidRequestCellEditChange(cellEdit => {
                this.scopedStore.setContext(NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, cellEdit);
                this.scopedStore.setContext(NOTEBOOK_CELL_EDITABLE, cell.cellKind === CellKind.Markup && !cellEdit);
            }));
        }
    }

    protected setCellContext(cellHandle: number, key: string, value: unknown): void {
        let cellContext = this.cellContexts.get(cellHandle);
        if (!cellContext) {
            cellContext = {};
            this.cellContexts.set(cellHandle, cellContext);
        }

        cellContext[key] = value;
    }

    getCellContext(cellHandle: number): ContextMatcher {
        return this.contextKeyService.createOverlay(Object.entries(this.cellContexts.get(cellHandle) ?? {}));
    }

    changeCellFocus(focus: boolean): void {
        this.scopedStore.setContext(NOTEBOOK_CELL_FOCUSED, focus);
    }

    changeCellListFocus(focus: boolean): void {
        this.scopedStore.setContext(NOTEBOOK_CELL_LIST_FOCUSED, focus);
    }

    createContextKeyChangedEvent(affectedKeys: string[]): ContextKeyChangeEvent {
        return { affects: keys => affectedKeys.some(key => keys.has(key)) };
    }

    dispose(): void {
        this.toDispose.dispose();
    }
}
