// *****************************************************************************
// Copyright (C) 2025 EclipseSource GmbH and others.
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

export const CHANGE_SET_SUMMARY_VARIABLE: AIVariable = {
    id: 'changeSetSummary',
    description: nls.localize('theia/ai/core/changeSetSummaryVariable/description', 'Provides a summary of the files in a change set and their contents.'),

    name: 'changeSetSummary',
};

@injectable()
export class ContextSummaryVariableContribution implements AIVariableContribution, AIVariableResolver {

    registerVariables(service: AIVariableService): void {
        service.registerResolver(CHANGE_SET_SUMMARY_VARIABLE, this);
    }

    canResolve(request: AIVariableResolutionRequest, context: AIVariableContext): MaybePromise<number> {
        return request.variable.name === CHANGE_SET_SUMMARY_VARIABLE.name ? 50 : 0;
    }

    async resolve(request: AIVariableResolutionRequest, context: AIVariableContext): Promise<ResolvedAIVariable | undefined> {
        if (!ChatSessionContext.is(context) || request.variable.name !== CHANGE_SET_SUMMARY_VARIABLE.name || !context.session.changeSet?.getElements().length) { return undefined; }
        return {
            variable: CHANGE_SET_SUMMARY_VARIABLE,
            value: context.session.changeSet.getElements().map(element => `- file: ${element.uri.toString()}, status: ${element.state}`).join('\n-')
        };
    }
}

