// *****************************************************************************
// Copyright (C) 2021 SAP SE or an SAP affiliate company and others.
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
import URI from '@theia/core/lib/common/uri';
import { FileOperation } from '@theia/filesystem/lib/common/files';
import { ApplicationShell, DelegatingSaveable, NavigatableWidget, Saveable, SaveableSource } from '@theia/core/lib/browser';
import { SaveableService } from '@theia/core/lib/browser/saveable-service';
import { Reference } from '@theia/core/lib/common/reference';
import { WebviewWidget } from '../webview/webview';
import { CustomEditorModel } from './custom-editors-main';
import { CustomEditorWidget as CustomEditorWidgetShape } from '@theia/editor/lib/browser';

@injectable()
export class CustomEditorWidget extends WebviewWidget implements CustomEditorWidgetShape, SaveableSource, NavigatableWidget {
    static override FACTORY_ID = 'plugin-custom-editor';
    static readonly SIDE_BY_SIDE_FACTORY_ID = CustomEditorWidget.FACTORY_ID + '.side-by-side';

    override id: string;
    resource: URI;

    protected _modelRef: Reference<CustomEditorModel | undefined> = { object: undefined, dispose: () => { } };
    get modelRef(): Reference<CustomEditorModel | undefined> {
        return this._modelRef;
    }
    set modelRef(modelRef: Reference<CustomEditorModel>) {
        this._modelRef.dispose();
        this._modelRef = modelRef;
        this.delegatingSaveable.delegate = modelRef.object;
        this.doUpdateContent();
    }

    // ensures that saveable is available even if modelRef.object is undefined
    protected readonly delegatingSaveable = new DelegatingSaveable();
    get saveable(): Saveable {
        return this.delegatingSaveable;
    }

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(SaveableService)
    protected readonly saveService: SaveableService;

    @postConstruct()
    protected override init(): void {
        super.init();
        this.id = CustomEditorWidget.FACTORY_ID + ':' + this.identifier.id;
        this.toDispose.push(this.fileService.onDidRunOperation(e => {
            if (e.isOperation(FileOperation.MOVE)) {
                this.doMove(e.target.resource);
            }
        }));
    }

    undo(): void {
        this._modelRef.object?.undo();
    }

    redo(): void {
        this._modelRef.object?.redo();
    }

    getResourceUri(): URI | undefined {
        return this.resource;
    }

    createMoveToUri(resourceUri: URI): URI | undefined {
        return this.resource.withPath(resourceUri.path);
    }

    override storeState(): CustomEditorWidget.State {
        return {
            ...super.storeState(),
            strResource: this.resource.toString(),
        };
    }

    override restoreState(oldState: CustomEditorWidget.State): void {
        const { strResource } = oldState;
        this.resource = new URI(strResource);
        super.restoreState(oldState);
    }

    onMove(handler: (newResource: URI) => Promise<void>): void {
        this._moveHandler = handler;
    }

    private _moveHandler?: (newResource: URI) => void;

    private doMove(target: URI): void {
        if (this._moveHandler) {
            this._moveHandler(target);
        }
    }
}

export namespace CustomEditorWidget {
    export interface State extends WebviewWidget.State {
        strResource: string
    }
}
