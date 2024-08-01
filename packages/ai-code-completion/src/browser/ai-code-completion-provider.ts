// *****************************************************************************
// Copyright (C) 2024 EclipseSource GmbH.
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

import * as monaco from '@theia/monaco-editor-core';

import { CodeCompletionAgent } from '../common/code-completion-agent';
import { injectable, inject } from '@theia/core/shared/inversify';
import { PreferenceService } from '@theia/core/lib/browser';
import { CancellationTokenSource } from '@theia/core';

@injectable()
export class AICodeCompletionProvider implements monaco.languages.CompletionItemProvider {

    @inject(CodeCompletionAgent)
    protected readonly agent: CodeCompletionAgent;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    async provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.CompletionContext, token: monaco.CancellationToken): Promise<monaco.languages.CompletionList | undefined> {
        if (!this.preferenceService.get('ai-code-completion.precompute', false)) {
            const result = {
                suggestions: [{
                    label: 'AI Code Completion',
                    detail: 'computes after trigger',
                    kind: monaco.languages.CompletionItemKind.Text,
                    insertText: '',
                    range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column
                    }
                }]
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result as any).suggestions[0].args = [...arguments];
            return result;
        }
        const cancellationTokenSource = new CancellationTokenSource();
        token.onCancellationRequested(() => { cancellationTokenSource.cancel(); });
        return this.agent.provideCompletionItems(model, position, context, cancellationTokenSource.token);
    }

    async resolveCompletionItem(item: monaco.languages.CompletionItem, token: monaco.CancellationToken): Promise<monaco.languages.CompletionItem> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(item as any).args) {
            return item;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args: Parameters<CodeCompletionAgent['provideCompletionItems']> = (item as any).args;
        const cancellationTokenSource = new CancellationTokenSource();
        token.onCancellationRequested(() => { cancellationTokenSource.cancel(); });
        const resolvedItems = await this.agent.provideCompletionItems(args[0], args[1], args[2], cancellationTokenSource.token);
        item.insertText = resolvedItems?.suggestions[0].insertText ?? '';
        item.additionalTextEdits = [{
            range: {
                startLineNumber: args[1].lineNumber,
                startColumn: args[1].column,
                endLineNumber: args[1].lineNumber,
                endColumn: args[1].column
            }, text: resolvedItems?.suggestions[0].insertText ?? ''
        }];
        return item;
    }
}
