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

import { injectable } from '@theia/core/shared/inversify';
import {LanguageModelProvider, LanguageModelChatMessage, LanguageModelChatResponse} from '@theia/ai-chat/lib/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

@injectable()
export class OpenAIModelProvider implements LanguageModelProvider {
    private openai = new OpenAI();

    async sendRequest(messages: LanguageModelChatMessage[]): Promise<LanguageModelChatResponse> {
        const stream = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages.map(this.toOpenAIMessage),
            stream: true,
        });

        const [stream1] = stream.tee();
        return {
            stream: {
                [Symbol.asyncIterator](): AsyncIterator<string> {
                return {
                    next(): Promise<IteratorResult<string>> {
                        return stream1[Symbol.asyncIterator]().next().then(chunk => chunk.done ? chunk : {value: chunk.value.choices[0]?.delta?.content ?? '', done: false});
                    }
                };
            }
        }
        };

    }

    private toOpenAIMessage(message: LanguageModelChatMessage): ChatCompletionMessageParam {
        if (message.actor === 'ai') {
            return {role: 'assistant', content: message.message};
        }
        if (message.actor === 'user') {
            return {role: 'user', content: message.message};
        }
        return {role: 'system', content: ''};
    }

}
