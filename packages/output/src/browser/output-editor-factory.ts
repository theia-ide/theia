// *****************************************************************************
// Copyright (C) 2020 TypeFox and others.
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
import URI from '@theia/core/lib/common/uri';
import { MonacoEditorModel } from '@theia/monaco/lib/browser/monaco-editor-model';
import { MonacoEditorFactory } from '@theia/monaco/lib/browser/monaco-editor-provider';
import { MonacoContextMenuService } from '@theia/monaco/lib/browser/monaco-context-menu';
import { EditorServiceOverrides, MonacoEditor, MonacoEditorServices } from '@theia/monaco/lib/browser/monaco-editor';
import { OutputUri } from '../common/output-uri';
import { OutputContextMenuService } from './output-context-menu';
import { IContextMenuService } from '@theia/monaco-editor-core/esm/vs/platform/contextview/browser/contextView';

@injectable()
export class OutputEditorFactory implements MonacoEditorFactory {

    @inject(MonacoEditorServices)
    protected readonly services: MonacoEditorServices;

    @inject(OutputContextMenuService)
    protected readonly contextMenuService: MonacoContextMenuService;

    readonly scheme: string = OutputUri.SCHEME;

    create(model: MonacoEditorModel, defaultsOptions: MonacoEditor.IOptions): Promise<MonacoEditor> {
        const uri = new URI(model.uri);
        const options = this.createOptions(model, defaultsOptions);
        const overrides = this.createOverrides(model);
        return MonacoEditor.create(uri, model, document.createElement('div'), this.services, options, overrides);
    }

    protected createOptions(model: MonacoEditorModel, defaultOptions: MonacoEditor.IOptions): MonacoEditor.IOptions {
        return {
            ...defaultOptions,
            overviewRulerLanes: 3,
            lineNumbersMinChars: 3,
            fixedOverflowWidgets: false,
            wordWrap: 'off',
            lineNumbers: 'off',
            glyphMargin: false,
            lineDecorationsWidth: 20,
            rulers: [],
            folding: false,
            scrollBeyondLastLine: false,
            readOnly: true,
            renderLineHighlight: 'none',
            minimap: { enabled: false },
            matchBrackets: 'never'
        };
    }

    protected *createOverrides(model: MonacoEditorModel): EditorServiceOverrides {
        yield [IContextMenuService, this.contextMenuService];
    }
}
