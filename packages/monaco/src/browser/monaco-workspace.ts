/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

/* eslint-disable no-null/no-null */

import { URI as Uri } from '@theia/core/shared/vscode-uri';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import URI from '@theia/core/lib/common/uri';
import { Emitter } from '@theia/core/lib/common/event';
import { FileSystemPreferences } from '@theia/filesystem/lib/browser';
import { EditorManager } from '@theia/editor/lib/browser';
import { MonacoTextModelService } from './monaco-text-model-service';
import { WillSaveMonacoModelEvent, MonacoEditorModel, MonacoModelContentChangedEvent } from './monaco-editor-model';
import { MonacoEditor } from './monaco-editor';
import { ProblemManager } from '@theia/markers/lib/browser';
import { MaybePromise } from '@theia/core/lib/common/types';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileSystemProviderCapabilities } from '@theia/filesystem/lib/common/files';
import * as Monaco from 'monaco-editor-core';
import {
    IBulkEditResult, ResourceEdit, ResourceFileEdit as MonacoResourceFileEdit,
    ResourceTextEdit as MonacoResourceTextEdit
} from 'monaco-editor-core/esm/vs/editor/browser/services/bulkEditService';
import { IEditorWorkerService } from 'monaco-editor-core/esm/vs/editor/common/services/editorWorker';
import { StandaloneServices } from 'monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices';
import { EndOfLineSequence } from 'monaco-editor-core/esm/vs/editor/common/model';

export namespace WorkspaceFileEdit {
    export function is(arg: Edit): arg is Monaco.languages.WorkspaceFileEdit {
        return ('oldUri' in arg && Monaco.Uri.isUri(arg.oldUri)) ||
            ('newUri' in arg && Monaco.Uri.isUri(arg.newUri));
    }
}

export namespace WorkspaceTextEdit {
    export function is(arg: Edit): arg is Monaco.languages.WorkspaceTextEdit {
        return !!arg && typeof arg === 'object'
            && 'resource' in arg
            && Monaco.Uri.isUri(arg.resource)
            && 'edit' in arg
            && arg.edit !== null
            && typeof arg.edit === 'object';
    }
}

export type Edit = Monaco.languages.WorkspaceFileEdit | Monaco.languages.WorkspaceTextEdit;

export namespace ResourceFileEdit {
    export function is(arg: ResourceEdit): arg is MonacoResourceFileEdit {
        return typeof arg === 'object' && (('oldResource' in arg) && Monaco.Uri.isUri((arg as MonacoResourceFileEdit).oldResource)) ||
            ('newResource' in arg && Monaco.Uri.isUri((arg as MonacoResourceFileEdit).newResource));
    }
}

export namespace ResourceTextEdit {
    export function is(arg: ResourceEdit): arg is MonacoResourceTextEdit {
        return ('resource' in arg && Monaco.Uri.isUri((arg as MonacoResourceTextEdit).resource));
    }
}

export interface WorkspaceFoldersChangeEvent {
    readonly added: WorkspaceFolder[];
    readonly removed: WorkspaceFolder[];
}

export interface WorkspaceFolder {
    readonly uri: Uri;
    readonly name: string;
    readonly index: number;
}

@injectable()
export class MonacoWorkspace {

    protected resolveReady: () => void;
    readonly ready = new Promise<void>(resolve => {
        this.resolveReady = resolve;
    });

    protected readonly onDidOpenTextDocumentEmitter = new Emitter<MonacoEditorModel>();
    readonly onDidOpenTextDocument = this.onDidOpenTextDocumentEmitter.event;

    protected readonly onDidCloseTextDocumentEmitter = new Emitter<MonacoEditorModel>();
    readonly onDidCloseTextDocument = this.onDidCloseTextDocumentEmitter.event;

    protected readonly onDidChangeTextDocumentEmitter = new Emitter<MonacoModelContentChangedEvent>();
    readonly onDidChangeTextDocument = this.onDidChangeTextDocumentEmitter.event;

    protected readonly onWillSaveTextDocumentEmitter = new Emitter<WillSaveMonacoModelEvent>();
    readonly onWillSaveTextDocument = this.onWillSaveTextDocumentEmitter.event;

    protected readonly onDidSaveTextDocumentEmitter = new Emitter<MonacoEditorModel>();
    readonly onDidSaveTextDocument = this.onDidSaveTextDocumentEmitter.event;

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(FileSystemPreferences)
    protected readonly filePreferences: FileSystemPreferences;

    @inject(MonacoTextModelService)
    protected readonly textModelService: MonacoTextModelService;

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;

    @inject(ProblemManager)
    protected readonly problems: ProblemManager;

    @postConstruct()
    protected init(): void {
        this.resolveReady();

        for (const model of this.textModelService.models) {
            this.fireDidOpen(model);
        }
        this.textModelService.onDidCreate(model => this.fireDidOpen(model));
    }

    get textDocuments(): MonacoEditorModel[] {
        return this.textModelService.models;
    }

    getTextDocument(uri: string): MonacoEditorModel | undefined {
        return this.textModelService.get(uri);
    }

    protected fireDidOpen(model: MonacoEditorModel): void {
        this.doFireDidOpen(model);
        model.textEditorModel.onDidChangeLanguage(e => {
            this.problems.cleanAllMarkers(new URI(model.uri));
            model.setLanguageId(e.oldLanguage);
            try {
                this.fireDidClose(model);
            } finally {
                model.setLanguageId(undefined);
            }
            this.doFireDidOpen(model);
        });
        model.onDidChangeContent(event => this.fireDidChangeContent(event));
        model.onDidSaveModel(() => this.fireDidSave(model));
        model.onWillSaveModel(event => this.fireWillSave(event));
        model.onDirtyChanged(() => this.openEditorIfDirty(model));
        model.onDispose(() => this.fireDidClose(model));
    }

    protected doFireDidOpen(model: MonacoEditorModel): void {
        this.onDidOpenTextDocumentEmitter.fire(model);
    }

    protected fireDidClose(model: MonacoEditorModel): void {
        this.onDidCloseTextDocumentEmitter.fire(model);
    }

    protected fireDidChangeContent(event: MonacoModelContentChangedEvent): void {
        this.onDidChangeTextDocumentEmitter.fire(event);
    }

    protected fireWillSave(event: WillSaveMonacoModelEvent): void {
        this.onWillSaveTextDocumentEmitter.fire(event);
    }

    protected fireDidSave(model: MonacoEditorModel): void {
        this.onDidSaveTextDocumentEmitter.fire(model);
    }

    protected readonly suppressedOpenIfDirty: MonacoEditorModel[] = [];

    protected openEditorIfDirty(model: MonacoEditorModel): void {
        if (model.suppressOpenEditorWhenDirty || this.suppressedOpenIfDirty.indexOf(model) !== -1) {
            return;
        }
        if (model.dirty && MonacoEditor.findByDocument(this.editorManager, model).length === 0) {
            // create a new reference to make sure the model is not disposed before it is
            // acquired by the editor, thus losing the changes that made it dirty.
            this.textModelService.createModelReference(model.textEditorModel.uri).then(ref => {
                (
                    model.autoSave === 'on' ? new Promise(resolve => model.onDidSaveModel(resolve)) :
                        this.editorManager.open(new URI(model.uri), { mode: 'open' })
                ).then(
                    () => ref.dispose()
                );
            });
        }
    }

    protected async suppressOpenIfDirty(model: MonacoEditorModel, cb: () => MaybePromise<void>): Promise<void> {
        this.suppressedOpenIfDirty.push(model);
        try {
            await cb();
        } finally {
            const i = this.suppressedOpenIfDirty.indexOf(model);
            if (i !== -1) {
                this.suppressedOpenIfDirty.splice(i, 1);
            }
        }
    }

    /**
     * Applies given edits to the given model.
     * The model is saved if no editors is opened for it.
     */
    applyBackgroundEdit(model: MonacoEditorModel, editOperations: Monaco.editor.IIdentifiedSingleEditOperation[], shouldSave = true): Promise<void> {
        return this.suppressOpenIfDirty(model, async () => {
            const editor = MonacoEditor.findByDocument(this.editorManager, model)[0];
            const cursorState = editor && editor.getControl().getSelections() || [];
            model.textEditorModel.pushStackElement();
            model.textEditorModel.pushEditOperations(cursorState, editOperations, () => cursorState);
            model.textEditorModel.pushStackElement();
            if (!editor && shouldSave) {
                await model.save();
            }
        });
    }

    async applyBulkEdit(edits: ResourceEdit[]): Promise<IBulkEditResult & { success: boolean }> {
        try {
            let totalEdits = 0;
            let totalFiles = 0;
            const fileEdits = edits.filter(edit => edit instanceof MonacoResourceFileEdit);
            const textEdits = edits.filter(edit => edit instanceof MonacoResourceTextEdit);

            if (fileEdits.length > 0) {
                await this.performFileEdits(<MonacoResourceFileEdit[]>fileEdits);
            }

            if (textEdits.length > 0) {
                const result = await this.performTextEdits(<MonacoResourceTextEdit[]>textEdits);
                totalEdits += result.totalEdits;
                totalFiles += result.totalFiles;
            }

            const ariaSummary = this.getAriaSummary(totalEdits, totalFiles);
            return { ariaSummary, success: true };
        } catch (e) {
            console.error('Failed to apply Resource edits:', e);
            return {
                ariaSummary: `Error applying Resource edits: ${e.toString()}`,
                success: false
            };
        }
    }

    protected getAriaSummary(totalEdits: number, totalFiles: number): string {
        if (totalEdits === 0) {
            return 'Made no edits';
        }
        if (totalEdits > 1 && totalFiles > 1) {
            return `Made ${totalEdits} text edits in ${totalFiles} files`;
        }
        return `Made ${totalEdits} text edits in one file`;
    }

    protected async performTextEdits(edits: MonacoResourceTextEdit[]): Promise<{
        totalEdits: number,
        totalFiles: number
    }> {
        let totalEdits = 0;
        let totalFiles = 0;
        const resourceEdits = new Map<string, MonacoResourceTextEdit[]>();
        for (const edit of edits) {
            if (typeof edit.versionId === 'number') {
                const model = this.textModelService.get(edit.resource.toString());
                if (model && model.textEditorModel.getVersionId() !== edit.versionId) {
                    throw new Error(`${model.uri} has changed in the meantime`);
                }
            }
            const key = edit.resource.toString();
            let array = resourceEdits.get(key);
            if (!array) {
                array = [];
                resourceEdits.set(key, array);
            }
            array.push(edit);
        }
        const pending: Promise<void>[] = [];
        for (const [key, value] of resourceEdits) {
            pending.push((async () => {
                const uri = Monaco.Uri.parse(key);
                let eol: EndOfLineSequence | undefined;
                const editOperations: Monaco.editor.IIdentifiedSingleEditOperation[] = [];
                const minimalEdits = await StandaloneServices.get(IEditorWorkerService).computeMoreMinimalEdits(uri, value.map(v => v.textEdit));
                if (minimalEdits) {
                    for (const textEdit of minimalEdits) {
                        if (typeof textEdit.eol === 'number') {
                            eol = textEdit.eol;
                        }
                        if (Monaco.Range.isEmpty(textEdit.range) && !textEdit.text) {
                            // skip no-op
                            continue;
                        }
                        editOperations.push({
                            forceMoveMarkers: false,
                            range: Monaco.Range.lift(textEdit.range),
                            text: textEdit.text
                        });
                    }
                }
                if (!editOperations.length && eol === undefined) {
                    return;
                }
                const reference = await this.textModelService.createModelReference(uri);
                try {
                    const model = reference.object.textEditorModel;
                    const editor = MonacoEditor.findByDocument(this.editorManager, reference.object)[0];
                    const cursorState = editor?.getControl().getSelections() || [];
                    // start a fresh operation
                    model.pushStackElement();
                    if (editOperations.length) {
                        model.pushEditOperations(cursorState, editOperations, () => cursorState);
                    }
                    if (eol !== undefined) {
                        model.pushEOL(eol);
                    }
                    // push again to make this change an undoable operation
                    model.pushStackElement();
                    totalFiles += 1;
                    totalEdits += editOperations.length;
                } finally {
                    reference.dispose();
                }
            })());
        }
        await Promise.all(pending);
        return { totalEdits, totalFiles };
    }

    protected async performFileEdits(edits: MonacoResourceFileEdit[]): Promise<void> {
        for (const edit of edits) {
            const options = edit.options || {};
            if (edit.newResource && edit.oldResource) {
                // rename
                if (options.overwrite === undefined && options.ignoreIfExists && await this.fileService.exists(new URI(edit.newResource))) {
                    return; // not overwriting, but ignoring, and the target file exists
                }
                await this.fileService.move(new URI(edit.oldResource), new URI(edit.newResource), { overwrite: options.overwrite });
            } else if (!edit.newResource && edit.oldResource) {
                // delete file
                if (await this.fileService.exists(new URI(edit.oldResource))) {
                    let useTrash = this.filePreferences['files.enableTrash'];
                    if (useTrash && !(this.fileService.hasCapability(new URI(edit.oldResource), FileSystemProviderCapabilities.Trash))) {
                        useTrash = false; // not supported by provider
                    }
                    await this.fileService.delete(new URI(edit.oldResource), { useTrash, recursive: options.recursive });
                } else if (!options.ignoreIfNotExists) {
                    throw new Error(`${edit.oldResource} does not exist and can not be deleted`);
                }
            } else if (edit.newResource && !edit.oldResource) {
                // create file
                if (options.overwrite === undefined && options.ignoreIfExists && await this.fileService.exists(new URI(edit.newResource))) {
                    return; // not overwriting, but ignoring, and the target file exists
                }
                await this.fileService.create(new URI(edit.newResource), undefined, { overwrite: options.overwrite });
            }
        }
    }
}
