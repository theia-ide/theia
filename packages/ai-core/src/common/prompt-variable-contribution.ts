// *****************************************************************************
// Copyright (C) 2025 EclipseSource GmbH.
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
import { injectable, inject, optional } from '@theia/core/shared/inversify';
import * as monaco from '@theia/monaco-editor-core';
import {
    AIVariable,
    ResolvedAIVariable,
    AIVariableContribution,
    AIVariableResolver,
    AIVariableService,
    AIVariableResolutionRequest,
    AIVariableContext
} from './variable-service';
import { PromptCustomizationService, PromptService } from './prompt-service';
import { PromptText } from './prompt-text';

export const PROMPT_VARIABLE: AIVariable = {
    id: 'prompt-provider',
    description: 'Resolves prompt templates via the prompt service',
    name: 'prompt',
    args: [
        { name: 'id', description: 'The prompt template id to resolve' }
    ],
};

@injectable()
export class PromptVariableContribution implements AIVariableContribution, AIVariableResolver {

    @inject(PromptService)
    protected readonly promptService: PromptService;

    @inject(PromptCustomizationService) @optional()
    protected readonly promptCustomizationService: PromptCustomizationService;

    registerVariables(service: AIVariableService): void {
        service.registerResolver(PROMPT_VARIABLE, this);
        service.registerArgumentCompletionProvider(PROMPT_VARIABLE, this.provideArgumentCompletionItems.bind(this));
    }

    canResolve(request: AIVariableResolutionRequest, context: AIVariableContext): number {
        if (request.variable.name === PROMPT_VARIABLE.name) {
            return 1;
        }
        return -1;
    }

    async resolve(request: AIVariableResolutionRequest, context: AIVariableContext): Promise<ResolvedAIVariable | undefined> {
        if (request.variable.name === PROMPT_VARIABLE.name) {
            return this.resolvePromptVariable(request);
        }
        return undefined;
    }

    private async resolvePromptVariable(request: AIVariableResolutionRequest): Promise<ResolvedAIVariable | undefined> {
        const promptId = request.arg?.trim();
        if (promptId) {
            const resolvedPrompt = await this.promptService.getPrompt(promptId);
            if (resolvedPrompt) {
                return { variable: request.variable, value: resolvedPrompt.text };
            }
        }
        return undefined;
    }

    protected async provideArgumentCompletionItems(
        model: monaco.editor.ITextModel,
        position: monaco.Position
    ): Promise<monaco.languages.CompletionItem[] | undefined> {
        const lineContent = model.getLineContent(position.lineNumber);

        // Only provide completions once the variable argument separator is typed
        const triggerCharIndex = lineContent.lastIndexOf(PromptText.VARIABLE_ARG_SEPARATOR, position.column - 1);
        if (triggerCharIndex === -1) {
            return undefined;
        }

        // Check if the text immediately before the trigger is the prompt variable, i.e #prompt
        const requiredVariable = `${PromptText.VARIABLE_CHAR}${PROMPT_VARIABLE.name}`;
        if (triggerCharIndex < requiredVariable.length ||
            lineContent.substring(triggerCharIndex - requiredVariable.length, triggerCharIndex) !== requiredVariable) {
            return undefined;
        }

        const range = new monaco.Range(position.lineNumber, triggerCharIndex + 2, position.lineNumber, position.column);

        // TODO consider all prompts or only custom prompts? If only custom, we might also consider this during variable resolution.
        const prompts = this.promptService.getAllPrompts();
        if (this.promptCustomizationService) {
            this.promptCustomizationService.getCustomPromptTemplateIDs();
        }
        const allPromptIds = [...Object.keys(prompts), ...(this.promptCustomizationService?.getCustomPromptTemplateIDs() || [])];
        allPromptIds.sort();

        return allPromptIds.map(promptId => ({
            filterText: PromptText.VARIABLE_ARG_SEPARATOR,
            label: promptId,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: promptId,
            range
        }));
    }
}
