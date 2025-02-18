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
import { AbstractStreamParsingChatAgent } from '@theia/ai-chat/lib/common';
import { injectable } from '@theia/core/shared/inversify';
import { FILE_CONTENT_FUNCTION_ID, GET_WORKSPACE_FILE_LIST_FUNCTION_ID, GET_WORKSPACE_DIRECTORY_STRUCTURE_FUNCTION_ID } from '../common/workspace-functions';
import { CODER_REPLACE_PROMPT_TEMPLATE_ID, getCoderReplacePromptTemplate } from '../common/coder-replace-prompt-template';
import { WriteChangeToFileProvider } from './file-changeset-functions';
import { LanguageModelRequirement } from '@theia/ai-core';
import { nls } from '@theia/core';

@injectable()
export class CoderAgent extends AbstractStreamParsingChatAgent {
    id: string = 'Coder';
    name = 'Coder';
    languageModelRequirements: LanguageModelRequirement[] = [{
        purpose: 'chat',
        identifier: 'openai/gpt-4o',
    }];
    protected defaultLanguageModelPurpose: string = 'chat';

    override description = nls.localize('theia/ai/workspace/coderAgent/description',
        'An AI assistant integrated into Theia IDE, designed to assist software developers. This agent can access the users workspace, it can get a list of all available files \
        and folders and retrieve their content. Futhermore, it can suggest modifications of files to the user. It can therefore assist the user with coding tasks or other \
        tasks involving file changes.');
    override promptTemplates = [getCoderReplacePromptTemplate(true), getCoderReplacePromptTemplate(false)];
    override functions = [GET_WORKSPACE_DIRECTORY_STRUCTURE_FUNCTION_ID, GET_WORKSPACE_FILE_LIST_FUNCTION_ID, FILE_CONTENT_FUNCTION_ID, WriteChangeToFileProvider.ID];
    protected override systemPromptId: string | undefined = CODER_REPLACE_PROMPT_TEMPLATE_ID;
}
