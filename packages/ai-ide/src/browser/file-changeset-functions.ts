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
import { injectable, inject } from '@theia/core/shared/inversify';
import { ToolProvider, ToolRequest, ToolRequestParameters, ToolRequestParametersProperties } from '@theia/ai-core';
import { WorkspaceFunctionScope } from './workspace-functions';
import { ChangeSetFileElementFactory } from '@theia/ai-chat/lib/browser/change-set-file-element';
import { ChangeSetImpl, MutableChatRequestModel } from '@theia/ai-chat';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { ContentReplacer, Replacement } from '@theia/core/lib/common/content-replacer';


@injectable()
export class WriteChangeToFileProvider implements ToolProvider {
    static ID = 'changeSet_writeChangeToFile';

    @inject(WorkspaceFunctionScope)
    protected readonly workspaceFunctionScope: WorkspaceFunctionScope;

    @inject(FileService)
    fileService: FileService;

    @inject(ChangeSetFileElementFactory)
    protected readonly fileChangeFactory: ChangeSetFileElementFactory;

    getTool(): ToolRequest {
        return {
            id: WriteChangeToFileProvider.ID,
            name: WriteChangeToFileProvider.ID,
            description: `Proposes writing content to a file. If the file exists, it will be overwritten with the provided content.\n
             If the file does not exist, it will be created. This tool will automatically create any directories needed to write the file.\n
             If the new content is empty, the file will be deleted. To move a file, delete it and re-create it at the new location.\n
             The proposed changes will be applied when the user accepts. If called again for the same file, previously proposed changes will be overridden.`,
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path of the file to write to.'
                    },
                    content: {
                        type: 'string',
                        description: `The content to write to the file. ALWAYS provide the COMPLETE intended content of the file, without any truncation or omissions.\n
                         You MUST include ALL parts of the file, even if they haven\'t been modified.`
                    }
                },
                required: ['path', 'content']
            },
            handler: async (args: string, ctx: MutableChatRequestModel): Promise<string> => {
                const { path, content } = JSON.parse(args);
                const chatSessionId = ctx.session.id;
                let changeSet = ctx.session.changeSet;
                if (!changeSet) {
                    changeSet = new ChangeSetImpl('Changes proposed by Coder');
                    ctx.session.setChangeSet(changeSet);
                }
                const uri = await this.workspaceFunctionScope.resolveRelativePath(path);
                let type = 'modify';
                if (content === '') {
                    type = 'delete';
                }
                if (!await this.fileService.exists(uri)) {
                    type = 'add';
                }
                changeSet.addElements(
                    this.fileChangeFactory({
                        uri: uri,
                        type: type as 'modify' | 'add' | 'delete',
                        state: 'pending',
                        targetState: content,
                        changeSet,
                        chatSessionId
                    })
                );
                return `Proposed writing to file ${path}. The user will review and potentially apply the changes`;
            }
        };
    }
}

@injectable()
export class ReplaceContentInFileFunctionHelper {
    @inject(WorkspaceFunctionScope)
    protected readonly workspaceFunctionScope: WorkspaceFunctionScope;

    @inject(FileService)
    fileService: FileService;

    @inject(ChangeSetFileElementFactory)
    protected readonly fileChangeFactory: ChangeSetFileElementFactory;

    private replacer: ContentReplacer;

    constructor() {
        this.replacer = new ContentReplacer();
    }

    getToolMetadata(supportMutipleReplace: boolean = false): { description: string, parameters: ToolRequestParameters } {
        const replacementProperties: ToolRequestParametersProperties = {
            oldContent: {
                type: 'string',
                description: 'The exact content to be replaced. Must match exactly, including whitespace, comments, etc.'
            },
            newContent: {
                type: 'string',
                description: 'The new content to insert in place of matched old content.'
            }
        };

        if (supportMutipleReplace) {
            replacementProperties.multiple = {
                type: 'boolean',
                description: 'Set to true if multiple occurrences of the oldContent are expected to be replaced.'
            };
        }
        const replacementParameters = {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'The path of the file where content will be replaced.'
                },
                replacements: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: replacementProperties,
                        required: ['oldContent', 'newContent']
                    },
                    description: 'An array of replacement objects, each containing oldContent and newContent strings.'
                }
            },
            required: ['path', 'replacements']
        } as ToolRequestParameters;

        const replacementSentence = supportMutipleReplace
            ? 'By default, a single occurrence of each old content in the tuples is expected to be replaced. If the optional \'multiple\' flag is set to true, all occurrences will\
             be replaced. In either case, if the number of occurrences in the file does not match the expectation the function will return an error. \
             In that case try a different approach.'
            : 'A single occurrence of each old content in the tuples is expected to be replaced. If the number of occurrences in the file does not match the expectation,\
              the function will return an error. In that case try a different approach.';

        const replacementDescription = `Request to replace sections of content in an existing file by providing a list of tuples with old content to be matched and replaced.
            ${replacementSentence}. For deletions, use an empty new content in the tuple.\
            Make sure you use the same line endings and whitespace as in the original file content. The proposed changes will be applied when the user accepts.\
            If called again for the same file, it will override previously proposed changes.`;

        return {
            description: replacementDescription,
            parameters: replacementParameters
        };

    }

    async createChangesetFromToolCall(toolCallString: string, ctx: MutableChatRequestModel): Promise<string> {
        try {
            const { path, replacements } = JSON.parse(toolCallString) as { path: string, replacements: Replacement[] };
            const fileUri = await this.workspaceFunctionScope.resolveRelativePath(path);
            const fileContent = (await this.fileService.read(fileUri)).value.toString();

            const { updatedContent, errors } = this.replacer.applyReplacements(fileContent, replacements);

            if (errors.length > 0) {
                return `Errors encountered: ${errors.join('; ')}`;
            }

            if (updatedContent !== fileContent) {
                let changeSet = ctx.session.changeSet;
                if (!changeSet) {
                    changeSet = new ChangeSetImpl('Changes proposed by Coder');
                    ctx.session.setChangeSet(changeSet);
                }

                changeSet.addElements(
                    this.fileChangeFactory({
                        uri: fileUri,
                        type: 'modify',
                        state: 'pending',
                        targetState: updatedContent,
                        changeSet,
                        chatSessionId: ctx.session.id
                    })
                );
            }
            return `Proposed replacements in file ${path}. The user will review and potentially apply the changes.`;
        } catch (error) {
            console.debug('Error processing replacements:', error.message);
            return JSON.stringify({ error: error.message });
        }
    }
}

@injectable()
export class SimpleReplaceContentInFileProvider implements ToolProvider {
    static ID = 'changeSet_replaceContentInFilev1';
    @inject(ReplaceContentInFileFunctionHelper)
    protected readonly replaceContentInFileFunctionHelper: ReplaceContentInFileFunctionHelper;

    getTool(): ToolRequest {
        const metadata = this.replaceContentInFileFunctionHelper.getToolMetadata();
        return {
            id: SimpleReplaceContentInFileProvider.ID,
            name: SimpleReplaceContentInFileProvider.ID,
            description: metadata.description,
            parameters: metadata.parameters,
            handler: async (args: string, ctx: MutableChatRequestModel): Promise<string> =>
                this.replaceContentInFileFunctionHelper.createChangesetFromToolCall(args, ctx)
        };
    }
}

@injectable()
export class ReplaceContentInFileProvider implements ToolProvider {
    static ID = 'changeSet_replaceContentInFile';
    @inject(ReplaceContentInFileFunctionHelper)
    protected readonly replaceContentInFileFunctionHelper: ReplaceContentInFileFunctionHelper;

    getTool(): ToolRequest {
        const metadata = this.replaceContentInFileFunctionHelper.getToolMetadata(true);
        return {
            id: ReplaceContentInFileProvider.ID,
            name: ReplaceContentInFileProvider.ID,
            description: metadata.description,
            parameters: metadata.parameters,
            handler: async (args: string, ctx: MutableChatRequestModel): Promise<string> =>
                this.replaceContentInFileFunctionHelper.createChangesetFromToolCall(args, ctx)
        };
    }
}
