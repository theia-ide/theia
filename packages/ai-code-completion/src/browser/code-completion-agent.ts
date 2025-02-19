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

import {
    Agent, AgentSpecificVariables, CommunicationRecordingService, getTextOfResponse,
    LanguageModelRegistry, LanguageModelRequest, LanguageModelRequirement, PromptService, PromptTemplate
} from '@theia/ai-core/lib/common';
import { generateUuid, ILogger, nls, ProgressService } from '@theia/core';
import { inject, injectable, named } from '@theia/core/shared/inversify';
import * as monaco from '@theia/monaco-editor-core';
import { PREF_AI_INLINE_COMPLETION_MAX_CONTEXT_LINES } from './ai-code-completion-preference';
import { PreferenceService } from '@theia/core/lib/browser';
import { CodeCompletionPostProcessor } from './code-completion-postprocessor';

export const CodeCompletionAgent = Symbol('CodeCompletionAgent');
export interface CodeCompletionAgent extends Agent {
    provideInlineCompletions(model: monaco.editor.ITextModel, position: monaco.Position,
        context: monaco.languages.InlineCompletionContext, token: monaco.CancellationToken): Promise<monaco.languages.InlineCompletions | undefined>
}

@injectable()
export class CodeCompletionAgentImpl implements CodeCompletionAgent {
    async provideInlineCompletions(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        context: monaco.languages.InlineCompletionContext,
        token: monaco.CancellationToken
    ): Promise<monaco.languages.InlineCompletions | undefined> {
        const progress = await this.progressService.showProgress(
            { text: nls.localize('theia/ai/code-completion/progressText', 'Calculating AI code completion...'), options: { location: 'window' } }
        );
        try {
            const languageModel =
                await this.languageModelRegistry.selectLanguageModel({
                    agent: this.id,
                    ...this.languageModelRequirements[0],
                });
            if (!languageModel) {
                this.logger.error(
                    'No language model found for code-completion-agent'
                );
                return undefined;
            }

            const maxContextLines = this.preferences.get<number>(PREF_AI_INLINE_COMPLETION_MAX_CONTEXT_LINES, -1);

            let prefixStartLine = 1;
            let suffixEndLine = model.getLineCount();
            // if maxContextLines is -1, use the full file as context without any line limit

            if (maxContextLines === 0) {
                // Only the cursor line
                prefixStartLine = position.lineNumber;
                suffixEndLine = position.lineNumber;
            } else if (maxContextLines > 0) {
                const linesBeforeCursor = position.lineNumber - 1;
                const linesAfterCursor = model.getLineCount() - position.lineNumber;

                // Allocate one more line to the prefix in case of an odd maxContextLines
                const prefixLines = Math.min(
                    Math.ceil(maxContextLines / 2),
                    linesBeforeCursor
                );
                const suffixLines = Math.min(
                    Math.floor(maxContextLines / 2),
                    linesAfterCursor
                );

                prefixStartLine = Math.max(1, position.lineNumber - prefixLines);
                suffixEndLine = Math.min(model.getLineCount(), position.lineNumber + suffixLines);
            }

            const prefix = model.getValueInRange({
                startLineNumber: prefixStartLine,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
            });

            const suffix = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: suffixEndLine,
                endColumn: model.getLineMaxColumn(suffixEndLine),
            });

            const file = model.uri.toString(false);
            const language = model.getLanguageId();

            if (token.isCancellationRequested) {
                return undefined;
            }
            const prompt = await this.promptService
                .getPrompt('code-completion-prompt', { prefix, suffix, file, language })
                .then(p => p?.text);
            if (!prompt) {
                this.logger.error('No prompt found for code-completion-agent');
                return undefined;
            }
            // since we do not actually hold complete conversions, the request/response pair is considered a session
            const sessionId = generateUuid();
            const requestId = generateUuid();
            const request: LanguageModelRequest = {
                messages: [{ type: 'text', actor: 'user', query: prompt }],
                settings: {
                    stream: false
                }
            };
            if (token.isCancellationRequested) {
                return undefined;
            }
            this.recordingService.recordRequest({
                agentId: this.id,
                sessionId,
                requestId,
                request: prompt,
            });
            const response = await languageModel.request(request, token);
            if (token.isCancellationRequested) {
                return undefined;
            }
            const completionText = await getTextOfResponse(response);
            if (token.isCancellationRequested) {
                return undefined;
            }
            this.recordingService.recordResponse({
                agentId: this.id,
                sessionId,
                requestId,
                response: completionText,
            });

            const postProcessedCompletionText = this.postProcessor.postProcess(completionText);

            return {
                items: [{ insertText: postProcessedCompletionText }],
                enableForwardStability: true,
            };
        } catch (e) {
            if (!token.isCancellationRequested) {
                console.error(e.message, e);
            }
        }
        finally {
            progress.cancel();
        }
    }

    @inject(ILogger)
    @named('code-completion-agent')
    protected logger: ILogger;

    @inject(LanguageModelRegistry)
    protected languageModelRegistry: LanguageModelRegistry;

    @inject(PromptService)
    protected promptService: PromptService;

    @inject(CommunicationRecordingService)
    protected recordingService: CommunicationRecordingService;

    @inject(ProgressService)
    protected progressService: ProgressService;

    @inject(PreferenceService)
    protected preferences: PreferenceService;

    @inject(CodeCompletionPostProcessor)
    protected postProcessor: CodeCompletionPostProcessor;

    id = 'Code Completion';
    name = 'Code Completion';
    description =
        nls.localize('theia/ai/completion/agent/description', 'This agent provides inline code completion in the code editor in the Theia IDE.');
    promptTemplates: PromptTemplate[] = [
        {
            id: 'code-completion-prompt-previous',
            variantOf: 'code-completion-prompt',
            template: `{{!-- Made improvements or adaptations to this prompt template? We’d love for you to share it with the community! Contribute back here:
https://github.com/eclipse-theia/theia/discussions/new?category=prompt-template-contribution --}}
You are a code completion agent. The current file you have to complete is named {{file}}.
The language of the file is {{language}}. Return your result as plain text without markdown formatting.
Finish the following code snippet.

{{prefix}}[[MARKER]]{{suffix}}

Only return the exact replacement for [[MARKER]] to complete the snippet.`
        },
        {
            id: 'code-completion-prompt',
            template: `{{!-- Made improvements or adaptations to this prompt template? We’d love for you to share it with the community! Contribute back here:
https://github.com/eclipse-theia/theia/discussions/new?category=prompt-template-contribution --}}
## Code snippet
\`\`\`
{{ prefix }}[[MARKER]]{{ suffix }}
\`\`\`

## Meta Data
- File: {{file}}
- Language: {{language}}

Replace [[MARKER]] with the exact code to complete the code snippet. Return only the replacement of [[MAKRER]] as plain text.`,
        },
    ];
    languageModelRequirements: LanguageModelRequirement[] = [
        {
            purpose: 'code-completion',
            identifier: 'openai/gpt-4o',
        },
    ];
    readonly variables: string[] = [];
    readonly functions: string[] = [];
    readonly agentSpecificVariables: AgentSpecificVariables[] = [
        { name: 'file', usedInPrompt: true, description: 'The uri of the file being edited.' },
        { name: 'language', usedInPrompt: true, description: 'The languageId of the file being edited.' },
        { name: 'prefix', usedInPrompt: true, description: 'The code before the current position of the cursor.' },
        { name: 'suffix', usedInPrompt: true, description: 'The code after the current position of the cursor.' }
    ];
    readonly tags?: string[] | undefined;
}
