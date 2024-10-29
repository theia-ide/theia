// *****************************************************************************
// Copyright (C) 2023 TypeFox and others.
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

import { Command, CommandContribution, CommandHandler, CommandRegistry, MenuContribution, MenuModelRegistry, nls, URI } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { ApplicationShell, codicon, KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser';
import { NotebookModel } from '../view-model/notebook-model';
import { NotebookService } from '../service/notebook-service';
import { CellEditType, CellKind, NotebookCommand } from '../../common';
import { NotebookKernelQuickPickService } from '../service/notebook-kernel-quick-pick-service';
import { NotebookExecutionService } from '../service/notebook-execution-service';
import { NotebookEditorWidgetService } from '../service/notebook-editor-widget-service';
import { NOTEBOOK_CELL_CURSOR_FIRST_LINE, NOTEBOOK_CELL_CURSOR_LAST_LINE, NOTEBOOK_CELL_FOCUSED, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_HAS_OUTPUTS } from './notebook-context-keys';
import { NotebookClipboardService } from '../service/notebook-clipboard-service';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { NotebookEditorWidget } from '../notebook-editor-widget';

export namespace NotebookCommands {
    export const ADD_NEW_CELL_COMMAND = Command.toDefaultLocalizedCommand({
        id: 'notebook.add-new-cell',
        iconClass: codicon('add')
    });

    export const ADD_NEW_MARKDOWN_CELL_COMMAND = Command.toDefaultLocalizedCommand({
        id: 'notebook.add-new-markdown-cell',
        iconClass: codicon('add'),
        tooltip: nls.localizeByDefault('Add Markdown Cell')
    } as NotebookCommand);

    export const ADD_NEW_CODE_CELL_COMMAND = Command.toDefaultLocalizedCommand({
        id: 'notebook.add-new-code-cell',
        iconClass: codicon('add'),
        tooltip: nls.localizeByDefault('Add Code Cell')
    } as NotebookCommand);

    export const SELECT_KERNEL_COMMAND = Command.toDefaultLocalizedCommand({
        id: 'notebook.selectKernel',
        category: 'Notebook',
        iconClass: codicon('server-environment')
    });

    export const EXECUTE_NOTEBOOK_COMMAND = Command.toDefaultLocalizedCommand({
        id: 'notebook.execute',
        category: 'Notebook',
        iconClass: codicon('run-all')
    });

    export const CLEAR_ALL_OUTPUTS_COMMAND = Command.toDefaultLocalizedCommand({
        id: 'notebook.clear-all-outputs',
        category: 'Notebook',
        iconClass: codicon('clear-all')
    });

    export const CHANGE_SELECTED_CELL = Command.toDefaultLocalizedCommand({
        id: 'notebook.change-selected-cell',
        category: 'Notebook',
    });

    export const CUT_SELECTED_CELL = Command.toDefaultLocalizedCommand({
        id: 'notebook.cell.cut',
        category: 'Notebook',
    });

    export const COPY_SELECTED_CELL = Command.toDefaultLocalizedCommand({
        id: 'notebook.cell.copy',
        category: 'Notebook',
    });

    export const PASTE_CELL = Command.toDefaultLocalizedCommand({
        id: 'notebook.cell.paste',
        category: 'Notebook',
    });

    export const NOTEBOOK_FIND = Command.toDefaultLocalizedCommand({
        id: 'notebook.find',
        category: 'Notebook',
    });

    export const CENTER_ACTIVE_CELL = Command.toDefaultLocalizedCommand({
        id: 'notebook.centerActiveCell',
        category: 'Notebook',
    });
}

export enum CellChangeDirection {
    Up = 'up',
    Down = 'down'
}

@injectable()
export class NotebookActionsContribution implements CommandContribution, MenuContribution, KeybindingContribution {

    @inject(NotebookService)
    protected notebookService: NotebookService;

    @inject(NotebookKernelQuickPickService)
    protected notebookKernelQuickPickService: NotebookKernelQuickPickService;

    @inject(NotebookExecutionService)
    protected notebookExecutionService: NotebookExecutionService;

    @inject(ApplicationShell)
    protected shell: ApplicationShell;

    @inject(NotebookEditorWidgetService)
    protected notebookEditorWidgetService: NotebookEditorWidgetService;

    @inject(NotebookClipboardService)
    protected notebookClipboardService: NotebookClipboardService;

    @inject(ContextKeyService)
    protected contextKeyService: ContextKeyService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(NotebookCommands.ADD_NEW_CELL_COMMAND, {
            execute: (notebookModel: NotebookModel, cellKind: CellKind = CellKind.Markup, index?: number | 'above' | 'below', focusContainer?: boolean) => {
                notebookModel = notebookModel ?? this.notebookEditorWidgetService.focusedEditor?.model;

                let insertIndex: number = 0;
                if (typeof index === 'number' && index >= 0) {
                    insertIndex = index;
                } else if (notebookModel.selectedCell && typeof index === 'string') {
                    // if index is -1 insert below otherwise at the index of the selected cell which is above the selected.
                    insertIndex = notebookModel.cells.indexOf(notebookModel.selectedCell) + (index === 'below' ? 1 : 0);
                }

                let cellLanguage: string = 'markdown';
                if (cellKind === CellKind.Code) {
                    cellLanguage = this.notebookService.getCodeCellLanguage(notebookModel);
                }

                notebookModel.applyEdits([{
                    editType: CellEditType.Replace,
                    index: insertIndex,
                    count: 0,
                    cells: [{
                        cellKind,
                        language: cellLanguage,
                        source: '',
                        outputs: [],
                        metadata: {},
                    }]
                }], true);
                if (focusContainer) {
                    notebookModel.selectedCell?.requestBlurEditor();
                }
            }
        });

        commands.registerCommand(NotebookCommands.ADD_NEW_MARKDOWN_CELL_COMMAND, this.editableCommandHandler(
            notebookModel => commands.executeCommand(NotebookCommands.ADD_NEW_CELL_COMMAND.id, notebookModel, CellKind.Markup, 'below')
        ));

        commands.registerCommand(NotebookCommands.ADD_NEW_CODE_CELL_COMMAND, this.editableCommandHandler(
            notebookModel => commands.executeCommand(NotebookCommands.ADD_NEW_CELL_COMMAND.id, notebookModel, CellKind.Code, 'below')
        ));

        commands.registerCommand(NotebookCommands.SELECT_KERNEL_COMMAND, this.editableCommandHandler(
            notebookModel => this.notebookKernelQuickPickService.showQuickPick(notebookModel)
        ));

        commands.registerCommand(NotebookCommands.EXECUTE_NOTEBOOK_COMMAND, this.editableCommandHandler(
            notebookModel => this.notebookExecutionService.executeNotebookCells(notebookModel, notebookModel.cells)
        ));

        commands.registerCommand(NotebookCommands.CLEAR_ALL_OUTPUTS_COMMAND, this.editableCommandHandler(
            notebookModel => notebookModel.applyEdits(notebookModel.cells.map(cell => ({
                editType: CellEditType.Output,
                handle: cell.handle, deleteCount: cell.outputs.length, outputs: []
            })), false)
        ));

        commands.registerCommand(NotebookCommands.CHANGE_SELECTED_CELL,
            {
                execute: (change: number | CellChangeDirection) => {
                    const focusedEditor = this.notebookEditorWidgetService.focusedEditor;
                    const model = focusedEditor?.model;
                    if (model && typeof change === 'number') {
                        model.setSelectedCell(model.cells[change]);
                    } else if (model && model.selectedCell) {
                        const currentIndex = model.cells.indexOf(model.selectedCell);
                        const shouldFocusEditor = this.contextKeyService.match('editorTextFocus');

                        if (change === CellChangeDirection.Up && currentIndex > 0) {
                            model.setSelectedCell(model.cells[currentIndex - 1]);
                            if ((model.selectedCell?.cellKind === CellKind.Code
                                || (model.selectedCell?.cellKind === CellKind.Markup && model.selectedCell?.editing)) && shouldFocusEditor) {
                                model.selectedCell.requestFocusEditor('lastLine');
                            }
                        } else if (change === CellChangeDirection.Down && currentIndex < model.cells.length - 1) {
                            model.setSelectedCell(model.cells[currentIndex + 1]);
                            if ((model.selectedCell?.cellKind === CellKind.Code
                                || (model.selectedCell?.cellKind === CellKind.Markup && model.selectedCell?.editing)) && shouldFocusEditor) {
                                model.selectedCell.requestFocusEditor();
                            }
                        }

                        if (model.selectedCell.cellKind === CellKind.Markup) {
                            // since were losing focus from the cell editor, we need to focus the notebook editor again
                            focusedEditor?.node.focus();
                        }
                    }
                }
            }
        );
        commands.registerCommand({ id: 'list.focusUp' }, {
            execute: () => commands.executeCommand(NotebookCommands.CHANGE_SELECTED_CELL.id, CellChangeDirection.Up)
        });
        commands.registerCommand({ id: 'list.focusDown' }, {
            execute: () => commands.executeCommand(NotebookCommands.CHANGE_SELECTED_CELL.id, CellChangeDirection.Down)
        });

        commands.registerCommand(NotebookCommands.CUT_SELECTED_CELL, this.editableCommandHandler(
            () => {
                const model = this.notebookEditorWidgetService.focusedEditor?.model;
                const selectedCell = model?.selectedCell;
                if (selectedCell) {
                    model.applyEdits([{ editType: CellEditType.Replace, index: model.cells.indexOf(selectedCell), count: 1, cells: [] }], true);
                    this.notebookClipboardService.copyCell(selectedCell);
                }
            }));

        commands.registerCommand(NotebookCommands.COPY_SELECTED_CELL, {
            execute: () => {
                const model = this.notebookEditorWidgetService.focusedEditor?.model;
                const selectedCell = model?.selectedCell;
                if (selectedCell) {
                    this.notebookClipboardService.copyCell(selectedCell);
                }
            }
        });

        commands.registerCommand(NotebookCommands.PASTE_CELL, {
            isEnabled: () => !Boolean(this.notebookEditorWidgetService.focusedEditor?.model?.readOnly),
            isVisible: () => !Boolean(this.notebookEditorWidgetService.focusedEditor?.model?.readOnly),
            execute: (position?: 'above') => {
                const copiedCell = this.notebookClipboardService.getCell();
                if (copiedCell) {
                    const model = this.notebookEditorWidgetService.focusedEditor?.model;
                    const insertIndex = model?.selectedCell ? model.cells.indexOf(model.selectedCell) + (position === 'above' ? 0 : 1) : 0;
                    model?.applyEdits([{ editType: CellEditType.Replace, index: insertIndex, count: 0, cells: [copiedCell] }], true);
                }
            }
        });

        commands.registerCommand(NotebookCommands.NOTEBOOK_FIND, {
            execute: () => {
                this.notebookEditorWidgetService.focusedEditor?.showFindWidget();
            }
        });

        commands.registerCommand(NotebookCommands.CENTER_ACTIVE_CELL, {
            execute: (editor?: NotebookEditorWidget) => {
                const model = editor ? editor.model : this.notebookEditorWidgetService.focusedEditor?.model;
                model?.selectedCell?.requestCenterEditor();
            }
        });

    }

    protected editableCommandHandler(execute: (notebookModel: NotebookModel) => void): CommandHandler {
        return {
            isEnabled: (item: URI | NotebookModel) => this.withModel(item, model => !Boolean(model?.readOnly), false),
            isVisible: (item: URI | NotebookModel) => this.withModel(item, model => !Boolean(model?.readOnly), false),
            execute: (uri: URI | NotebookModel) => {
                this.withModel(uri, execute, undefined);
            }
        };
    }

    protected withModel<T>(item: URI | NotebookModel, execute: (notebookModel: NotebookModel) => T, defaultValue: T): T {
        if (item instanceof URI) {
            const model = this.notebookService.getNotebookEditorModel(item);
            if (!model) {
                return defaultValue;
            }
            item = model;
        }
        return execute(item);
    }

    registerMenus(menus: MenuModelRegistry): void {
        // independent submenu for plugins to add commands
        menus.registerSubmenu(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR, 'Notebook Main Toolbar');
        // Add Notebook Cell items
        menus.registerMenuAction(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_CELL_ADD_GROUP, {
            commandId: NotebookCommands.ADD_NEW_CODE_CELL_COMMAND.id,
            label: nls.localizeByDefault('Code'),
            icon: codicon('add'),
        });
        menus.registerMenuAction(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_CELL_ADD_GROUP, {
            commandId: NotebookCommands.ADD_NEW_MARKDOWN_CELL_COMMAND.id,
            label: nls.localizeByDefault('Markdown'),
            icon: codicon('add'),
        });

        // Execution related items
        menus.registerMenuAction(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_EXECUTION_GROUP, {
            commandId: NotebookCommands.EXECUTE_NOTEBOOK_COMMAND.id,
            label: nls.localizeByDefault('Run All'),
            icon: codicon('run-all'),
            order: '10'
        });
        menus.registerMenuAction(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_EXECUTION_GROUP, {
            commandId: NotebookCommands.CLEAR_ALL_OUTPUTS_COMMAND.id,
            label: nls.localizeByDefault('Clear All Outputs'),
            icon: codicon('clear-all'),
            order: '30',
            when: NOTEBOOK_HAS_OUTPUTS
        });

        menus.registerSubmenu(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_HIDDEN_ITEMS_CONTEXT_MENU, '');
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        keybindings.registerKeybindings(
            {
                command: NotebookCommands.CHANGE_SELECTED_CELL.id,
                keybinding: 'up',
                args: CellChangeDirection.Up,
                when: `(!editorTextFocus || ${NOTEBOOK_CELL_CURSOR_FIRST_LINE}) && !suggestWidgetVisible && ${NOTEBOOK_EDITOR_FOCUSED} && ${NOTEBOOK_CELL_FOCUSED}`
            },
            {
                command: NotebookCommands.CHANGE_SELECTED_CELL.id,
                keybinding: 'down',
                args: CellChangeDirection.Down,
                when: `(!editorTextFocus || ${NOTEBOOK_CELL_CURSOR_LAST_LINE}) && !suggestWidgetVisible && ${NOTEBOOK_EDITOR_FOCUSED} && ${NOTEBOOK_CELL_FOCUSED}`
            },
            {
                command: NotebookCommands.CUT_SELECTED_CELL.id,
                keybinding: 'ctrlcmd+x',
                when: `${NOTEBOOK_EDITOR_FOCUSED} && !inputFocus`
            },
            {
                command: NotebookCommands.COPY_SELECTED_CELL.id,
                keybinding: 'ctrlcmd+c',
                when: `${NOTEBOOK_EDITOR_FOCUSED} && !inputFocus`
            },
            {
                command: NotebookCommands.PASTE_CELL.id,
                keybinding: 'ctrlcmd+v',
                when: `${NOTEBOOK_EDITOR_FOCUSED} && !inputFocus`
            },
            {
                command: NotebookCommands.NOTEBOOK_FIND.id,
                keybinding: 'ctrlcmd+f',
                when: `${NOTEBOOK_EDITOR_FOCUSED}`
            },
            {
                command: NotebookCommands.CENTER_ACTIVE_CELL.id,
                keybinding: 'ctrlcmd+l',
                when: `${NOTEBOOK_EDITOR_FOCUSED}`
            }
        );
    }

}

export namespace NotebookMenus {
    export const NOTEBOOK_MAIN_TOOLBAR = ['notebook', 'toolbar'];
    export const NOTEBOOK_MAIN_TOOLBAR_CELL_ADD_GROUP = [...NOTEBOOK_MAIN_TOOLBAR, 'cell-add-group'];
    export const NOTEBOOK_MAIN_TOOLBAR_EXECUTION_GROUP = [...NOTEBOOK_MAIN_TOOLBAR, 'cell-execution-group'];
    export const NOTEBOOK_MAIN_TOOLBAR_HIDDEN_ITEMS_CONTEXT_MENU = ['notebook-main-toolbar-hidden-items-context-menu'];
}
