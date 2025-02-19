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
import { ToolProvider, ToolRequest } from '@theia/ai-core';
import { URI } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileStat } from '@theia/filesystem/lib/common/files';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { FILE_CONTENT_FUNCTION_ID, GET_FILE_DIAGNOSTICS_ID, GET_WORKSPACE_DIRECTORY_STRUCTURE_FUNCTION_ID, GET_WORKSPACE_FILE_LIST_FUNCTION_ID } from '../common/workspace-functions';
import ignore from 'ignore';
import { Minimatch } from 'minimatch';
import { PreferenceService } from '@theia/core/lib/browser';
import { CONSIDER_GITIGNORE_PREF, USER_EXCLUDE_PATTERN_PREF } from './workspace-preferences';
import { MonacoWorkspace } from '@theia/monaco/lib/browser/monaco-workspace';
import { MonacoTextModelService } from '@theia/monaco/lib/browser/monaco-text-model-service';
import { ProblemManager } from '@theia/markers/lib/browser';
import { DiagnosticSeverity, Range } from '@theia/core/shared/vscode-languageserver-protocol';

@injectable()
export class WorkspaceFunctionScope {
    protected readonly GITIGNORE_FILE_NAME = '.gitignore';

    @inject(WorkspaceService)
    protected workspaceService: WorkspaceService;

    @inject(FileService)
    protected fileService: FileService;

    @inject(PreferenceService)
    protected preferences: PreferenceService;

    private gitignoreMatcher: ReturnType<typeof ignore> | undefined;
    private gitignoreWatcherInitialized = false;

    async getWorkspaceRoot(): Promise<URI> {
        const wsRoots = await this.workspaceService.roots;
        if (wsRoots.length === 0) {
            throw new Error('No workspace has been opened yet');
        }
        return wsRoots[0].resource;
    }

    ensureWithinWorkspace(targetUri: URI, workspaceRootUri: URI): void {
        if (!targetUri.toString().startsWith(workspaceRootUri.toString())) {
            throw new Error('Access outside of the workspace is not allowed');
        }
    }

    async resolveRelativePath(relativePath: string): Promise<URI> {
        const workspaceRoot = await this.getWorkspaceRoot();
        return workspaceRoot.resolve(relativePath);
    }

    private async initializeGitignoreWatcher(workspaceRoot: URI): Promise<void> {
        if (this.gitignoreWatcherInitialized) {
            return;
        }

        const gitignoreUri = workspaceRoot.resolve(this.GITIGNORE_FILE_NAME);
        this.fileService.watch(gitignoreUri);

        this.fileService.onDidFilesChange(async event => {
            if (event.contains(gitignoreUri)) {
                this.gitignoreMatcher = undefined;
            }
        });

        this.gitignoreWatcherInitialized = true;
    }

    async shouldExclude(stat: FileStat): Promise<boolean> {
        const shouldConsiderGitIgnore = this.preferences.get(CONSIDER_GITIGNORE_PREF, false);
        const userExcludePatterns = this.preferences.get<string[]>(USER_EXCLUDE_PATTERN_PREF, []);

        if (this.isUserExcluded(stat.resource.path.base, userExcludePatterns)) {
            return true;
        }
        const workspaceRoot = await this.getWorkspaceRoot();
        if (shouldConsiderGitIgnore && await this.isGitIgnored(stat, workspaceRoot)) {
            return true;
        }

        return false;
    }

    protected isUserExcluded(fileName: string, userExcludePatterns: string[]): boolean {
        return userExcludePatterns.some(pattern => new Minimatch(pattern, { dot: true }).match(fileName));
    }

    protected async isGitIgnored(stat: FileStat, workspaceRoot: URI): Promise<boolean> {
        await this.initializeGitignoreWatcher(workspaceRoot);

        const gitignoreUri = workspaceRoot.resolve(this.GITIGNORE_FILE_NAME);

        try {
            const fileStat = await this.fileService.resolve(gitignoreUri);
            if (fileStat) {
                if (!this.gitignoreMatcher) {
                    const gitignoreContent = await this.fileService.read(gitignoreUri);
                    this.gitignoreMatcher = ignore().add(gitignoreContent.value);
                }
                const relativePath = workspaceRoot.relative(stat.resource);
                if (relativePath) {
                    const relativePathStr = relativePath.toString() + (stat.isDirectory ? '/' : '');
                    if (this.gitignoreMatcher.ignores(relativePathStr)) {
                        return true;
                    }
                }
            }
        } catch {
            // If .gitignore does not exist or cannot be read, continue without error
        }

        return false;
    }

}

@injectable()
export class GetWorkspaceDirectoryStructure implements ToolProvider {
    static ID = GET_WORKSPACE_DIRECTORY_STRUCTURE_FUNCTION_ID;

    getTool(): ToolRequest {
        return {
            id: GetWorkspaceDirectoryStructure.ID,
            name: GetWorkspaceDirectoryStructure.ID,
            description: `Retrieve the complete directory structure of the workspace, listing only directories (no file contents). This structure excludes specific directories,
            such as node_modules and hidden files, ensuring paths are within workspace boundaries.`,
            handler: () => this.getDirectoryStructure()
        };
    }

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(WorkspaceFunctionScope)
    protected workspaceScope: WorkspaceFunctionScope;

    private async getDirectoryStructure(): Promise<string[]> {
        let workspaceRoot;
        try {
            workspaceRoot = await this.workspaceScope.getWorkspaceRoot();
        } catch (error) {
            return [`Error: ${error.message}`];
        }

        return this.buildDirectoryStructure(workspaceRoot);
    }

    private async buildDirectoryStructure(uri: URI, prefix: string = ''): Promise<string[]> {
        const stat = await this.fileService.resolve(uri);
        const result: string[] = [];

        if (stat && stat.isDirectory && stat.children) {
            for (const child of stat.children) {
                if (!child.isDirectory || await this.workspaceScope.shouldExclude(child)) { continue; };
                const path = `${prefix}${child.resource.path.base}/`;
                result.push(path);
                result.push(...await this.buildDirectoryStructure(child.resource, `${path}`));
            }
        }

        return result;
    }
}

@injectable()
export class FileContentFunction implements ToolProvider {
    static ID = FILE_CONTENT_FUNCTION_ID;

    getTool(): ToolRequest {
        return {
            id: FileContentFunction.ID,
            name: FileContentFunction.ID,
            description: `Return the content of a specified file within the workspace. The file path must be provided relative to the workspace root. Only files within
                workspace boundaries are accessible; attempting to access files outside the workspace will return an error.`,
            parameters: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        description: `The relative path to the target file within the workspace. This path is resolved from the workspace root, and only files within the workspace 
                            boundaries are accessible. Attempting to access paths outside the workspace will result in an error.`,
                    }
                },
                required: ['file']
            },
            handler: (arg_string: string) => {
                const file = this.parseArg(arg_string);
                return this.getFileContent(file);
            }
        };
    }

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(WorkspaceFunctionScope)
    protected readonly workspaceScope: WorkspaceFunctionScope;

    @inject(MonacoWorkspace)
    protected readonly monacoWorkspace: MonacoWorkspace;

    private parseArg(arg_string: string): string {
        const result = JSON.parse(arg_string);
        return result.file;
    }

    private async getFileContent(file: string): Promise<string> {
        let workspaceRoot;
        try {
            workspaceRoot = await this.workspaceScope.getWorkspaceRoot();
        } catch (error) {
            return JSON.stringify({ error: error.message });
        }

        const targetUri = workspaceRoot.resolve(file);
        this.workspaceScope.ensureWithinWorkspace(targetUri, workspaceRoot);

        try {
            const openEditorValue = this.monacoWorkspace.getTextDocument(targetUri.toString())?.getText();
            if (openEditorValue !== undefined) {
                return openEditorValue;
            }

            const fileContent = await this.fileService.read(targetUri);
            return fileContent.value;

        } catch (error) {
            return JSON.stringify({ error: 'File not found' });
        }
    }
}

@injectable()
export class GetWorkspaceFileList implements ToolProvider {
    static ID = GET_WORKSPACE_FILE_LIST_FUNCTION_ID;

    getTool(): ToolRequest {
        return {
            id: GetWorkspaceFileList.ID,
            name: GetWorkspaceFileList.ID,
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: `Optional relative path to a directory within the workspace. If no path is specified, the function lists contents directly in the workspace
                         root. Paths are resolved within workspace boundaries only; paths outside the workspace or unvalidated paths will result in an error.`
                    }
                },
                required: ['path']
            },
            description: `List files and directories within a specified workspace directory. Paths are relative to the workspace root, and only workspace-contained paths are
             allowed. If no path is provided, the root contents are listed. Paths outside the workspace will result in an error.`,
            handler: (arg_string: string) => {
                const args = JSON.parse(arg_string);
                return this.getProjectFileList(args.path);
            }
        };
    }

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(WorkspaceFunctionScope)
    protected workspaceScope: WorkspaceFunctionScope;

    async getProjectFileList(path?: string): Promise<string[]> {
        let workspaceRoot;
        try {
            workspaceRoot = await this.workspaceScope.getWorkspaceRoot();
        } catch (error) {
            return [`Error: ${error.message}`];
        }

        const targetUri = path ? workspaceRoot.resolve(path) : workspaceRoot;
        this.workspaceScope.ensureWithinWorkspace(targetUri, workspaceRoot);

        try {
            const stat = await this.fileService.resolve(targetUri);
            if (!stat || !stat.isDirectory) {
                return ['Error: Directory not found'];
            }
            return await this.listFilesDirectly(targetUri, workspaceRoot);

        } catch (error) {
            return ['Error: Directory not found'];
        }
    }

    private async listFilesDirectly(uri: URI, workspaceRootUri: URI): Promise<string[]> {
        const stat = await this.fileService.resolve(uri);
        const result: string[] = [];

        if (stat && stat.isDirectory) {
            if (await this.workspaceScope.shouldExclude(stat)) {
                return result;
            }
            const children = await this.fileService.resolve(uri);
            if (children.children) {
                for (const child of children.children) {
                    if (await this.workspaceScope.shouldExclude(child)) {
                        continue;
                    };
                    const relativePath = workspaceRootUri.relative(child.resource);
                    if (relativePath) {
                        result.push(relativePath.toString());
                    }
                }
            }
        }

        return result;
    }
}

@injectable()
export class FileDiagonsticProvider implements ToolProvider {
    static ID = GET_FILE_DIAGNOSTICS_ID;

    @inject(WorkspaceFunctionScope)
    protected workspaceScope: WorkspaceFunctionScope;

    @inject(ProblemManager)
    protected readonly problemManager: ProblemManager;

    @inject(MonacoTextModelService)
    protected readonly modelService: MonacoTextModelService;

    getTool(): ToolRequest {
        return {
            id: FileDiagonsticProvider.ID,
            name: FileDiagonsticProvider.ID,
            description:
                `A function to retrieve diagnostics associated with a specific file in the workspace. It will return a list of problems that includes the surrounding text \
            a message describing the problem, and optionally a code and a codeDescription field describing that code.`,
            parameters: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        description: `The relative path to the target file within the workspace. This path is resolved from the workspace root, and only files within the workspace 
                        boundaries are accessible. Attempting to access paths outside the workspace will result in an error.`,
                    }
                },
                required: ['file']
            },
            handler: async (arg) => {
                const { file } = JSON.parse(arg);
                let workspaceRoot;
                try {
                    workspaceRoot = await this.workspaceScope.getWorkspaceRoot();
                } catch (error) {
                    return JSON.stringify({ error: error.message });
                }

                const targetUri = workspaceRoot.resolve(file);
                this.workspaceScope.ensureWithinWorkspace(targetUri, workspaceRoot);
                return this.getDiagnosticsForFile(targetUri);
            }
        }
    }

    protected async getDiagnosticsForFile(uri: URI): Promise<string> {
        const markers = this.problemManager.findMarkers({ uri });
        const editor = await this.modelService.createModelReference(uri);
        const report = markers
            .filter(marker => marker.data.severity !== DiagnosticSeverity.Information && marker.data.severity !== DiagnosticSeverity.Hint)
            .map(marker => {
                const contextRange = this.atLeastThreeLines(marker.data.range, editor.object.lineCount)
                const text = editor.object.getText(contextRange);
                const message = marker.data.message;
                const code = marker.data.code;
                const codeDescription = marker.data.codeDescription;
                return { text, message, code, codeDescription };
            });
        editor.dispose();
        return JSON.stringify(report);
    }

    protected atLeastThreeLines(range: Range, lineCount: number): Range {
        let startLine = range.start.line;
        let endLine = range.end.line;

        while (endLine - startLine < 2 && (startLine > 0 || endLine < lineCount - 1)) {
            if (startLine > 0) {
                startLine--
            } else if (endLine < lineCount - 1) {
                endLine++;
            }
            if (endLine < lineCount - 1) {
                endLine++
            } else if (startLine > 0) {
                startLine
            }
        }
        return { end: { character: Number.MAX_SAFE_INTEGER, line: endLine }, start: { character: 0, line: startLine } };
    }
}
