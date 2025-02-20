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
    ChatResponseContent,
    CodeChatResponseContent,
} from '@theia/ai-chat/lib/common';
import { ContributionProvider, UntitledResourceResolver, URI } from '@theia/core';
import { ContextMenuRenderer, TreeNode } from '@theia/core/lib/browser';
import { ClipboardService } from '@theia/core/lib/browser/clipboard-service';
import { inject, injectable, named } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { ReactNode } from '@theia/core/shared/react';
import { nls } from '@theia/core/lib/common/nls';
import { Position } from '@theia/core/shared/vscode-languageserver-protocol';
import { EditorManager, EditorWidget } from '@theia/editor/lib/browser';
import { MonacoEditor } from '@theia/monaco/lib/browser/monaco-editor';
import { MonacoEditorProvider } from '@theia/monaco/lib/browser/monaco-editor-provider';
import { MonacoLanguages } from '@theia/monaco/lib/browser/monaco-languages';
import { ChatResponsePartRenderer } from '../chat-response-part-renderer';
import { ChatViewTreeWidget, ResponseNode } from '../chat-tree-view/chat-view-tree-widget';
import { IMouseEvent } from '@theia/monaco-editor-core';

export const CodePartRendererAction = Symbol('CodePartRendererAction');
/**
 * The CodePartRenderer offers to contribute arbitrary React nodes to the rendered code part.
 * Technically anything can be rendered, however it is intended to be used for actions, like
 * "Copy to Clipboard" or "Insert at Cursor".
 */
export interface CodePartRendererAction {
    render(response: CodeChatResponseContent, parentNode: ResponseNode): ReactNode;
    /**
     * Determines if the action should be rendered for the given response.
     */
    canRender?(response: CodeChatResponseContent, parentNode: ResponseNode): boolean;
    /**
     *  The priority determines the order in which the actions are rendered.
     *  The default priorities are 10 and 20.
     */
    priority: number;
}

@injectable()
export class CodePartRenderer
    implements ChatResponsePartRenderer<CodeChatResponseContent> {

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;
    @inject(UntitledResourceResolver)
    protected readonly untitledResourceResolver: UntitledResourceResolver;
    @inject(MonacoEditorProvider)
    protected readonly editorProvider: MonacoEditorProvider;
    @inject(MonacoLanguages)
    protected readonly languageService: MonacoLanguages;
    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;
    @inject(ContributionProvider) @named(CodePartRendererAction)
    protected readonly codePartRendererActions: ContributionProvider<CodePartRendererAction>;

    canHandle(response: ChatResponseContent): number {
        if (CodeChatResponseContent.is(response)) {
            return 10;
        }
        return -1;
    }

    render(response: CodeChatResponseContent, parentNode: ResponseNode): ReactNode {
        const language = response.language ? this.languageService.getExtension(response.language) : undefined;
        return (
            <div className="theia-CodePartRenderer-root">
                <div className="theia-CodePartRenderer-top">
                    <div className="theia-CodePartRenderer-left">{this.renderTitle(response)}</div>
                    <div className="theia-CodePartRenderer-right theia-CodePartRenderer-actions">
                        {this.codePartRendererActions.getContributions()
                            .filter(action => action.canRender ? action.canRender(response, parentNode) : true)
                            .sort((a, b) => a.priority - b.priority)
                            .map(action => action.render(response, parentNode))}
                    </div>
                </div>
                <div className="theia-CodePartRenderer-separator"></div>
                <div className="theia-CodePartRenderer-bottom">
                    <CodeWrapper
                        content={response.code}
                        language={language}
                        editorProvider={this.editorProvider}
                        untitledResourceResolver={this.untitledResourceResolver}
                        contextMenuCallback={e => this.handleContextMenuEvent(parentNode, e, response.code)}></CodeWrapper>
                </div>
            </div>
        );
    }

    protected renderTitle(response: CodeChatResponseContent): ReactNode {
        const uri = response.location?.uri;
        const position = response.location?.position;
        if (uri && position) {
            return <a onClick={this.openFileAtPosition.bind(this, uri, position)}>{this.getTitle(response.location?.uri, response.language)}</a>;
        }
        return this.getTitle(response.location?.uri, response.language);
    }

    private getTitle(uri: URI | undefined, language: string | undefined): string {
        // If there is a URI, use the file name as the title. Otherwise, use the language as the title.
        // If there is no language, use a generic fallback title.
        return uri?.path?.toString().split('/').pop() ?? language ?? nls.localize('theia/ai/chat-ui/code-part-renderer/generatedCode', 'Generated Code');
    }

    /**
     * Opens a file and moves the cursor to the specified position.
     *
     * @param uri - The URI of the file to open.
     * @param position - The position to move the cursor to, specified as {line, character}.
     */
    async openFileAtPosition(uri: URI, position: Position): Promise<void> {
        const editorWidget = await this.editorManager.open(uri) as EditorWidget;
        if (editorWidget) {
            const editor = editorWidget.editor;
            editor.revealPosition(position);
            editor.focus();
            editor.cursor = position;
        }
    }

    protected handleContextMenuEvent(node: TreeNode | undefined, event: IMouseEvent, code: string): void {
        this.contextMenuRenderer.render({
            menuPath: ChatViewTreeWidget.CONTEXT_MENU,
            anchor: { x: event.posx, y: event.posy },
            args: [node, { code }],
            context: event.target
        });
        event.preventDefault();
    }
}

@injectable()
export class CopyToClipboardButtonAction implements CodePartRendererAction {
    @inject(ClipboardService)
    protected readonly clipboardService: ClipboardService;
    priority = 10;
    render(response: CodeChatResponseContent): ReactNode {
        return <CopyToClipboardButton key='copyToClipBoard' code={response.code} clipboardService={this.clipboardService} />;
    }
}

const CopyToClipboardButton = (props: { code: string, clipboardService: ClipboardService }) => {
    const { code, clipboardService } = props;
    const copyCodeToClipboard = React.useCallback(() => {
        clipboardService.writeText(code);
    }, [code, clipboardService]);
    return <div className='button codicon codicon-copy' title={nls.localizeByDefault('Copy')} role='button' onClick={copyCodeToClipboard}></div>;
};

@injectable()
export class InsertCodeAtCursorButtonAction implements CodePartRendererAction {
    @inject(EditorManager)
    protected readonly editorManager: EditorManager;
    priority = 20;
    render(response: CodeChatResponseContent): ReactNode {
        return <InsertCodeAtCursorButton key='insertCodeAtCursor' code={response.code} editorManager={this.editorManager} />;
    }
}

const InsertCodeAtCursorButton = (props: { code: string, editorManager: EditorManager }) => {
    const { code, editorManager } = props;
    const insertCode = React.useCallback(() => {
        const editor = editorManager.currentEditor;
        if (editor) {
            const currentEditor = editor.editor;
            const selection = currentEditor.selection;

            // Insert the text at the current cursor position
            // If there is a selection, replace the selection with the text
            currentEditor.executeEdits([{
                range: {
                    start: selection.start,
                    end: selection.end
                },
                newText: code
            }]);
        }
    }, [code, editorManager]);
    return <div className='button codicon codicon-insert' title={nls.localizeByDefault('Insert at Cursor')} role='button' onClick={insertCode}></div>;
};

/**
 * Renders the given code within a Monaco Editor
 */
export const CodeWrapper = (props: {
    content: string,
    language?: string,
    untitledResourceResolver: UntitledResourceResolver,
    editorProvider: MonacoEditorProvider,
    contextMenuCallback: (e: IMouseEvent) => void
}) => {
    // eslint-disable-next-line no-null/no-null
    const ref = React.useRef<HTMLDivElement | null>(null);
    const editorRef = React.useRef<MonacoEditor | undefined>(undefined);

    const createInputElement = async () => {
        const resource = await props.untitledResourceResolver.createUntitledResource(undefined, props.language);
        const editor = await props.editorProvider.createInline(resource.uri, ref.current!, {
            readOnly: true,
            autoSizing: true,
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 0,
            renderFinalNewline: 'off',
            maxHeight: -1,
            scrollbar: {
                vertical: 'hidden',
                alwaysConsumeMouseWheel: false
            },
            wordWrap: 'off',
            codeLens: false,
            inlayHints: { enabled: 'off' },
            hover: { enabled: false }
        });
        editor.document.textEditorModel.setValue(props.content);
        editor.getControl().onContextMenu(e => props.contextMenuCallback(e.event));
        editorRef.current = editor;
    };

    React.useEffect(() => {
        createInputElement();
        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
            }
        };
    }, []);

    React.useEffect(() => {
        if (editorRef.current) {
            editorRef.current.document.textEditorModel.setValue(props.content);
        }
    }, [props.content]);

    editorRef.current?.resizeToFit();

    return <div className='theia-CodeWrapper' ref={ref}></div>;
};
