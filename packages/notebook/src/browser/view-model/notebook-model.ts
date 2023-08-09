// *****************************************************************************
// Copyright (C) 20023 Typefox and others.
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

import { Disposable, Emitter, URI } from '@theia/core';
import { Saveable, SaveOptions } from '@theia/core/lib/browser';
import {
    CellData,
    CellEditOperation, CellEditType, CellUri, NotebookCellInternalMetadata,
    NotebookCellsChangeType, NotebookCellTextModelSplice, NotebookData,
    NotebookDocumentMetadata, NotebookModelWillAddRemoveEvent,
    NotebookTextModelChangedEvent, NullablePartialNotebookCellInternalMetadata
} from '../../common';
import { NotebookSerializer } from '../service/notebook-service';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { NotebookCellModel, NotebookCellModelFactory, NotebookCellModelProps } from './notebook-cell-model';
import { MonacoTextModelService } from '@theia/monaco/lib/browser/monaco-text-model-service';
import { inject, injectable, interfaces } from '@theia/core/shared/inversify';
import { NotebookKernel } from '../service/notebook-kernel-service';
import { UndoRedoService } from '@theia/editor/lib/browser/undo-redo-service';

export const NotebookModelFactory = Symbol('NotebookModelFactory');

export function createNotebookModelContainer(parent: interfaces.Container, props: NotebookModelProps): interfaces.Container {
    const child = parent.createChild();

    child.bind(NotebookModelProps).toConstantValue(props);
    child.bind(NotebookModel).toSelf();

    return child;
}

const NotebookModelProps = Symbol('NotebookModelProps');
export interface NotebookModelProps {
    data: NotebookData,
    uri: URI,
    viewType: string,
    serializer: NotebookSerializer,
}

@injectable()
export class NotebookModel implements Saveable, Disposable {

    private readonly dirtyChangedEmitter = new Emitter<void>();
    readonly onDirtyChanged = this.dirtyChangedEmitter.event;

    private readonly saveEmitter = new Emitter<void>();
    readonly onDidSaveNotebook = this.saveEmitter.event;

    private readonly didAddRemoveCellEmitter = new Emitter<NotebookModelWillAddRemoveEvent>();
    readonly onDidAddOrRemoveCell = this.didAddRemoveCellEmitter.event;

    private readonly onDidChangeContentEmitter = new Emitter<NotebookTextModelChangedEvent>();
    readonly onDidChangeContent = this.onDidChangeContentEmitter.event;

    @inject(FileService)
    private readonly fileService: FileService;

    @inject(UndoRedoService)
    private readonly undoRedoService: UndoRedoService;

    readonly autoSave: 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';

    nextHandle: number = 0;

    kernel?: NotebookKernel;

    dirty: boolean;
    selectedCell?: NotebookCellModel;
    private dirtyCells: NotebookCellModel[] = [];

    private cellListeners: Map<string, Disposable> = new Map();

    cells: NotebookCellModel[];

    get uri(): URI {
        return this.props.uri;
    }

    get viewType(): string {
        return this.props.viewType;
    }

    metadata: NotebookDocumentMetadata = {};

    constructor(@inject(NotebookModelProps) private props: NotebookModelProps,
        @inject(MonacoTextModelService) modelService: MonacoTextModelService,
        @inject(NotebookCellModelFactory) private cellModelFactory: (props: NotebookCellModelProps) => NotebookCellModel) {
        this.dirty = false;

        this.cells = props.data.cells.map((cell, index) => cellModelFactory({
            uri: CellUri.generate(props.uri, index),
            handle: index,
            source: cell.source,
            language: cell.language,
            cellKind: cell.cellKind,
            outputs: cell.outputs,
            metadata: cell.metadata,
            internalMetadata: cell.internalMetadata,
            collapseState: cell.collapseState
        }));

        this.addCellOutputListeners(this.cells);

        this.metadata = this.metadata;

        modelService.onDidCreate(editorModel => {
            const modelUri = new URI(editorModel.uri);
            if (modelUri.scheme === CellUri.scheme) {
                const cellUri = CellUri.parse(modelUri);
                if (cellUri && cellUri.notebook.isEqual(this.uri)) {
                    const cell = this.cells.find(c => c.handle === cellUri.handle);
                    if (cell) {
                        cell.textModel = editorModel;
                    }
                }
            }
        });
        this.nextHandle = this.cells.length;
    }

    dispose(): void {
        this.dirtyChangedEmitter.dispose();
        this.saveEmitter.dispose();
        this.didAddRemoveCellEmitter.dispose();
        this.cellListeners.forEach(listener => listener.dispose());
    }

    async save(options: SaveOptions): Promise<void> {
        this.dirtyCells = [];
        this.dirty = false;
        this.dirtyChangedEmitter.fire();

        const serializedNotebook = await this.props.serializer.notebookToData({
            cells: this.cells.map(cell => cell.getData()),
            metadata: this.metadata
        });
        this.fileService.writeFile(this.uri, serializedNotebook);

        this.saveEmitter.fire();
    }

    isDirty(): boolean {
        return this.dirty;
    }

    cellDirtyChanged(cell: NotebookCellModel, dirtyState: boolean): void {
        if (dirtyState) {
            this.dirtyCells.push(cell);
        } else {
            this.dirtyCells.splice(this.dirtyCells.indexOf(cell), 1);
        }

        const oldDirtyState = this.dirty;
        this.dirty = this.dirtyCells.length > 0;
        if (this.dirty !== oldDirtyState) {
            this.dirtyChangedEmitter.fire();
        }
    }

    undo(): void {
        // TODO we probably need to check if a monaco editor is focused and if so, not undo
        this.undoRedoService.undo(this.uri);
    }

    redo(): void {
        // TODO see undo
        this.undoRedoService.redo(this.uri);
    }

    setSelectedCell(cell: NotebookCellModel): void {
        this.selectedCell = cell;
    }

    private addCellOutputListeners(cells: NotebookCellModel[]): void {
        cells.forEach(cell => {
            const listener = cell.onDidChangeOutputs(() => {
                this.dirty = true;
                this.dirtyChangedEmitter.fire();
            });
            this.cellListeners.set(cell.uri.toString(), listener);
        });
    }

    applyEdits(rawEdits: CellEditOperation[], computeUndoRedo: boolean): void {
        const editsWithDetails = rawEdits.map((edit, index) => {
            let cellIndex: number = -1;
            if ('index' in edit) {
                cellIndex = edit.index;
            } else if ('handle' in edit) {
                cellIndex = this.getCellIndexByHandle(edit.handle);
            }

            return {
                edit,
                cellIndex,
                end: edit.editType === CellEditType.Replace ? edit.index + edit.count : cellIndex,
                originalIndex: index
            };
        }).filter(edit => !!edit);

        for (const { edit, cellIndex } of editsWithDetails) {
            switch (edit.editType) {
                case CellEditType.Replace:
                    this.replaceCells(edit.index, edit.count, edit.cells, computeUndoRedo);
                    break;
                case CellEditType.Output: {
                    const cell = this.cells[cellIndex];
                    if (edit.append) {
                        cell.spliceNotebookCellOutputs({ deleteCount: 0, newOutputs: edit.outputs, start: cell.outputs.length });
                    } else {
                        // could definitely be more efficient. See vscode __spliceNotebookCellOutputs2
                        for (const output of edit.outputs) {
                            cell.spliceNotebookCellOutputs({
                                deleteCount: 1,
                                newOutputs: [output],
                                start: cell.outputs.findIndex(outputModel => outputModel.outputId === output.outputId)
                            });
                        }
                    }

                    break;
                }
                case CellEditType.OutputItems:
                    break;
                case CellEditType.Metadata:
                    this.updateNotebookMetadata(edit.metadata, computeUndoRedo);
                    break;
                case CellEditType.PartialInternalMetadata:
                    this.changeCellInternalMetadataPartial(this.cells[cellIndex], edit.internalMetadata);
                    break;
                case CellEditType.CellLanguage:
                    this.changeCellLanguage(this.cells[cellIndex], edit.language, computeUndoRedo);
                    break;
                case CellEditType.DocumentMetadata:
                    break;
                case CellEditType.Move:
                    this.moveCellToIndex(cellIndex, edit.length, edit.index, computeUndoRedo);
                    break;

            }
        }
    }

    private replaceCells(start: number, deleteCount: number, newCells: CellData[], computeUndoRedo: boolean): void {
        const cells = newCells.map(cell => {
            const handle = this.nextHandle++;
            return this.cellModelFactory({
                uri: CellUri.generate(this.uri, handle),
                handle: handle,
                source: cell.source,
                language: cell.language,
                cellKind: cell.cellKind,
                outputs: cell.outputs,
                metadata: cell.metadata,
                internalMetadata: cell.internalMetadata,
                collapseState: cell.collapseState
            });
        });
        this.addCellOutputListeners(cells);

        const changes: NotebookCellTextModelSplice<NotebookCellModel>[] = [[start, deleteCount, cells]];

        const deletedCells = this.cells.splice(start, deleteCount, ...cells);

        deletedCells.forEach(cell => {
            this.cellListeners.get(cell.uri.toString())?.dispose();
            this.cellListeners.delete(cell.uri.toString());

        });

        if (computeUndoRedo) {
            this.undoRedoService.pushElement(this.uri,
                async () => this.replaceCells(start, newCells.length, deletedCells.map(cell => cell.getData()), false),
                async () => this.replaceCells(start, deleteCount, newCells, false));
        }

        this.didAddRemoveCellEmitter.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes } });
        this.onDidChangeContentEmitter.fire({ rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes }] });
    }

    private changeCellInternalMetadataPartial(cell: NotebookCellModel, internalMetadata: NullablePartialNotebookCellInternalMetadata): void {
        const newInternalMetadata: NotebookCellInternalMetadata = {
            ...cell.internalMetadata
        };
        let k: keyof NotebookCellInternalMetadata;
        // eslint-disable-next-line guard-for-in
        for (k in internalMetadata) {
            newInternalMetadata[k] = (internalMetadata[k] ?? undefined) as never;
        }

        cell.internalMetadata = newInternalMetadata;
        this.onDidChangeContentEmitter.fire({
            rawEvents: [
                { kind: NotebookCellsChangeType.ChangeCellInternalMetadata, index: this.cells.indexOf(cell), internalMetadata: newInternalMetadata }
            ]
        });
    }

    private updateNotebookMetadata(metadata: NotebookDocumentMetadata, computeUndoRedo: boolean): void {
        const oldMetadata = this.metadata;
        if (computeUndoRedo) {
            this.undoRedoService.pushElement(this.uri,
                async () => { this.updateNotebookMetadata(oldMetadata, false); },
                async () => { this.updateNotebookMetadata(metadata, false); }
            );
        }

        this.metadata = metadata;
        this.onDidChangeContentEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ChangeDocumentMetadata, metadata: this.metadata }],
            synchronous: true,
        });
    }

    private changeCellLanguage(cell: NotebookCellModel, languageId: string, computeUndoRedo: boolean): void {
        if (cell.language === languageId) {
            return;
        }

        cell.language = languageId;

        this.onDidChangeContentEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellLanguage, index: this.cells.indexOf(cell), language: languageId }],
            synchronous: true,
        });
    }

    private moveCellToIndex(fromIndex: number, length: number, toIndex: number, computeUndoRedo: boolean): boolean {
        if (computeUndoRedo) {
            this.undoRedoService.pushElement(this.uri,
                async () => { this.moveCellToIndex(toIndex, length, fromIndex, false); },
                async () => { this.moveCellToIndex(fromIndex, length, toIndex, false); }
            );
        }

        const cells = this.cells.splice(fromIndex, length);
        this.cells.splice(toIndex, 0, ...cells);
        this.onDidChangeContentEmitter.fire({
            rawEvents: [{ kind: NotebookCellsChangeType.Move, index: fromIndex, length, newIdx: toIndex, cells }],
        });

        return true;
    }

    private getCellIndexByHandle(handle: number): number {
        return this.cells.findIndex(c => c.handle === handle);
    }
}
