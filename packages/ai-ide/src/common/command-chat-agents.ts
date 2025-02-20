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

import { inject, injectable } from '@theia/core/shared/inversify';
import { AbstractTextToModelParsingChatAgent, SystemMessageDescription } from '@theia/ai-chat/lib/common/chat-agents';
import { AIVariableContext, LanguageModelRequirement, PromptTemplate } from '@theia/ai-core';
import {
    MutableChatRequestModel,
    ChatResponseContent,
    CommandChatResponseContentImpl,
    CustomCallback,
    HorizontalLayoutChatResponseContentImpl,
    MarkdownChatResponseContentImpl,
} from '@theia/ai-chat/lib/common/chat-model';
import {
    CommandRegistry,
    MessageService,
    generateUuid,
} from '@theia/core';

export const commandTemplate: PromptTemplate = {
    id: 'command-system',
    template: `{{!-- Made improvements or adaptations to this prompt template? We’d love for you to share it with the community! Contribute back here:
https://github.com/eclipse-theia/theia/discussions/new?category=prompt-template-contribution --}}
# System Prompt

You are a service that helps users find commands to execute in an IDE.
You reply with stringified JSON Objects that tell the user which command to execute and its arguments, if any. 

# Examples

The examples start with a short explanation of the return object. 
The response can be found within the markdown \`\`\`json and \`\`\` markers.
Please include these markers in the reply.

Never under any circumstances may you reply with just the command-id!

## Example 1

This reply is to tell the user to execute the \`theia-ai-prompt-template:show-prompts-command\` command that is available in the Theia command registry.

\`\`\`json
{
    "type": "theia-command",
    "commandId": "theia-ai-prompt-template:show-prompts-command"
}
\`\`\`

## Example 2

This reply is to tell the user to execute the \`theia-ai-prompt-template:show-prompts-command\` command that is available in the theia command registry, 
when the user want to pass arguments to the command.

\`\`\`json
{
    "type": "theia-command",
    "commandId": "theia-ai-prompt-template:show-prompts-command",
    "arguments": ["foo"]
}
\`\`\`

## Example 3

This reply is for custom commands that are not registered in the Theia command registry. 
These commands always have the command id \`ai-chat.command-chat-response.generic\`.
The arguments are an array and may differ, depending on the user's instructions. 

\`\`\`json
{
    "type": "custom-handler",
    "commandId": "ai-chat.command-chat-response.generic",
    "arguments": ["foo", "bar"]
}
\`\`\`

## Example 4

This reply of type no-command is for cases where you can't find a proper command. 
You may use the message to explain the situation to the user.

\`\`\`json
{
    "type": "no-command",
    "message": "a message explaining what is wrong"
}
\`\`\`

# Rules

## Theia Commands

If a user asks for a Theia command, or the context implies it is about a command in Theia, return a response with \`"type": "theia-command"\`.
You need to exchange the "commandId". 
The available command ids in Theia are in the list below. The list of commands is formatted like this:

command-id1: Label1
command-id2: Label2
command-id3: 
command-id4: Label4

The Labels may be empty, but there is always a command-id.

Suggest a command that probably fits the user's message based on the label and the command ids you know. 
If you have multiple commands that fit, return the one that fits best. We only want a single command in the reply.
If the user says that the last command was not right, try to return the next best fit based on the conversation history with the user.

If there are no more command ids that seem to fit, return a response of \`"type": "no-command"\` explaining the situation.

Here are the known Theia commands:

Begin List:
{{command-ids}}
End List

You may only use commands from this list when responding with \`"type": "theia-command"\`.
Do not come up with command ids that are not in this list.
If you need to do this, use the \`"type": "no-command"\`. instead

## Custom Handlers

If the user asks for a command that is not a Theia command, return a response with \`"type": "custom-handler"\`.

## Other Cases

In all other cases, return a reply of \`"type": "no-command"\`.

# Examples of Invalid Responses

## Invalid Response Example 1

This example is invalid because it returns text and two commands. 
Only one command should be replied, and it must be parseable JSON.

### The Example

Yes, there are a few more theme-related commands. Here is another one:

\`\`\`json
{
    "type": "theia-command",
    "commandId": "workbench.action.selectIconTheme"
}
\`\`\`

And another one:

\`\`\`json
{
    "type": "theia-command",
    "commandId": "core.close.right.tabs"
}
\`\`\`

## Invalid Response Example 2

The following example is invalid because it only returns the command id and is not parseable JSON:

### The Example

workbench.action.selectIconTheme

## Invalid Response Example 3

The following example is invalid because it returns a message with the command id. We need JSON objects based on the above rules.
Do not respond like this in any case! We need a command of \`"type": "theia-command"\`.

The expected response would be:
\`\`\`json
{
    "type": "theia-command",
    "commandId": "core.close.right.tabs"
}
\`\`\`

### The Example

I found this command that might help you: core.close.right.tabs

## Invalid Response Example 4

The following example is invalid because it has an explanation string before the JSON. 
We only want the JSON!

### The Example

You can toggle high contrast mode with this command:

\`\`\`json
{
    "type": "theia-command",
    "commandId": "editor.action.toggleHighContrast"
}
\`\`\`

## Invalid Response Example 5

The following example is invalid because it explains that no command was found. 
We want a response of \`"type": "no-command"\` and have the message there.

### The Example

There is no specific command available to "open the windows" in the provided Theia command list.

## Invalid Response Example 6

In this example we were using the following theia id command list:

Begin List:
container--theia-open-editors-widget: Hello
foo:toggle-visibility-explorer-view-container--files: Label 1
foo:toggle-visibility-explorer-view-container--plugin-view: Label 2
End List

The problem is that workbench.action.toggleHighContrast is not in this list. 
theia-command types may only use commandIds from this list. 
This should have been of \`"type": "no-command"\`.

### The Example

\`\`\`json
{
    "type": "theia-command",
    "commandId": "workbench.action.toggleHighContrast"
}
\`\`\`

`};

interface ParsedCommand {
    type: 'theia-command' | 'custom-handler' | 'no-command'
    commandId: string;
    arguments?: string[];
    message?: string;
}

@injectable()
export class CommandChatAgent extends AbstractTextToModelParsingChatAgent<ParsedCommand> {
    @inject(CommandRegistry)
    protected commandRegistry: CommandRegistry;
    @inject(MessageService)
    protected messageService: MessageService;

    id: string = 'Command';
    name = 'Command';
    languageModelRequirements: LanguageModelRequirement[] = [{
        purpose: 'command',
        identifier: 'openai/gpt-4o',
    }];
    protected defaultLanguageModelPurpose: string = 'command';

    override description = 'This agent is aware of all commands that the user can execute within the Theia IDE, the tool that the user is currently working with. \
    Based on the user request, it can find the right command and then let the user execute it.';
    override promptTemplates = [commandTemplate];
    override agentSpecificVariables = [{
        name: 'command-ids',
        description: 'The list of available commands in Theia.',
        usedInPrompt: true
    }];

    protected override async getSystemMessageDescription(context: AIVariableContext): Promise<SystemMessageDescription | undefined> {
        const knownCommands: string[] = [];
        for (const command of this.commandRegistry.getAllCommands()) {
            knownCommands.push(`${command.id}: ${command.label}`);
        }
        const systemPrompt = await this.promptService.getPrompt(commandTemplate.id, {
            'command-ids': knownCommands.join('\n')
        }, context);
        if (systemPrompt === undefined) {
            throw new Error('Couldn\'t get system prompt ');
        }
        return SystemMessageDescription.fromResolvedPromptTemplate(systemPrompt);
    }

    /**
     * @param text the text received from the language model
     * @returns the parsed command if the text contained a valid command.
     * If there was no json in the text, return a no-command response.
     */
    protected async parseTextResponse(text: string): Promise<ParsedCommand> {
        const jsonMatch = text.match(/(\{[\s\S]*\})/);
        const jsonString = jsonMatch ? jsonMatch[1] : `{
    "type": "no-command",
    "message": "Please try again."
}`;
        const parsedCommand = JSON.parse(jsonString) as ParsedCommand;
        return parsedCommand;
    }

    protected createResponseContent(parsedCommand: ParsedCommand, request: MutableChatRequestModel): ChatResponseContent {
        if (parsedCommand.type === 'theia-command') {
            const theiaCommand = this.commandRegistry.getCommand(parsedCommand.commandId);
            if (theiaCommand === undefined) {
                console.error(`No Theia Command with id ${parsedCommand.commandId}`);
                request.cancel();
            }
            const args = parsedCommand.arguments !== undefined &&
                parsedCommand.arguments.length > 0
                ? parsedCommand.arguments
                : undefined;

            return new HorizontalLayoutChatResponseContentImpl([
                new MarkdownChatResponseContentImpl(
                    'I found this command that might help you:'
                ),
                new CommandChatResponseContentImpl(theiaCommand, undefined, args),
            ]);
        } else if (parsedCommand.type === 'custom-handler') {
            const id = `ai-command-${generateUuid()}`;
            const commandArgs = parsedCommand.arguments !== undefined && parsedCommand.arguments.length > 0 ? parsedCommand.arguments : [];
            const args = [id, ...commandArgs];
            const customCallback: CustomCallback = {
                label: 'AI command',
                callback: () => this.commandCallback(...args),
            };
            return new HorizontalLayoutChatResponseContentImpl([
                new MarkdownChatResponseContentImpl(
                    'Try executing this:'
                ),
                new CommandChatResponseContentImpl(undefined, customCallback, args),
            ]);
        } else {
            return new MarkdownChatResponseContentImpl(parsedCommand.message ?? 'Sorry, I can\'t find such a command');
        }
    }

    protected async commandCallback(...commandArgs: unknown[]): Promise<void> {
        this.messageService.info(`Executing callback with args ${commandArgs.join(', ')}. The first arg is the command id registered for the dynamically registered command. 
        The other args are the actual args for the handler.`, 'Got it');
    }
}
