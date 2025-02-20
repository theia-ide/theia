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

import { MaybePromise, nls } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { AIVariable, ResolvedAIVariable, AIVariableContribution, AIVariableResolver, AIVariableService, AIVariableResolutionRequest, AIVariableContext } from '@theia/ai-core';
import { ChatSessionContext } from './chat-service';

export const CONTEXT_DETAILS_VARIABLE: AIVariable = {
    id: 'contextDetails',
    description: nls.localize('theia/ai/core/contextDetailsVariable/description', 'Provides full text values and descriptions for all context variables.'),
    name: 'contextDetails',
};

@injectable()
export class ContextSummaryVariableContribution implements AIVariableContribution, AIVariableResolver {
    protected variableService: AIVariableService | undefined;

    registerVariables(service: AIVariableService): void {
        this.variableService = service;
        service.registerResolver(CONTEXT_DETAILS_VARIABLE, this);
    }

    canResolve(request: AIVariableResolutionRequest, context: AIVariableContext): MaybePromise<number> {
        return request.variable.name === CONTEXT_DETAILS_VARIABLE.name ? 50 : 0;
    }

    async resolve(request: AIVariableResolutionRequest, context: AIVariableContext): Promise<ResolvedAIVariable | undefined> {
        if (!ChatSessionContext.is(context) || request.variable.name !== CONTEXT_DETAILS_VARIABLE.name || !this.variableService) { return undefined; }
        return {
            variable: CONTEXT_DETAILS_VARIABLE,
            value: await this.resolveAllContextVariables(context)
        };
    }

    protected async resolveAllContextVariables(context: ChatSessionContext): Promise<string> {
        const values = await Promise.all(context.session.context.getVariables().map(variable => this.variableService?.resolveVariable(variable, context)));
        const data = values.filter((candidate): candidate is ResolvedAIVariable => !!candidate)
            .map(resolved => ({
                variableKind: resolved.variable.name,
                variableKindDescription: resolved.variable.description,
                variableInstanceData: resolved.arg,
                value: resolved.value
            }));
        return `\`\`\`json\n${JSON.stringify(data)}\n\`\`\``;
    }
}

