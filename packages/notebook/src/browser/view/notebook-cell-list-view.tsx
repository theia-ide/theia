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
import * as React from '@theia/core/shared/react';
import { CellEditType, CellKind, NotebookCellsChangeType } from '../../common';
import { NotebookCellModel } from '../view-model/notebook-cell-model';
import { NotebookModel } from '../view-model/notebook-model';
import { NotebookCellToolbarFactory } from './notebook-cell-toolbar-factory';
import { animationFrame, onDomEvent } from '@theia/core/lib/browser';
import { CommandMenu, CommandRegistry, DisposableCollection, MenuModelRegistry, nls } from '@theia/core';
import { NotebookCommands, NotebookMenus } from '../contributions/notebook-actions-contribution';
import { NotebookCellActionContribution } from '../contributions/notebook-cell-actions-contribution';
import { NotebookContextManager } from '../service/notebook-context-manager';

export interface CellRenderer {
    render(notebookData: NotebookModel, cell: NotebookCellModel, index: number): React.ReactNode
    renderSidebar(notebookModel: NotebookModel, cell: NotebookCellModel): React.ReactNode
    renderDragImage(cell: NotebookCellModel): HTMLElement
}

export function observeCellHeight(ref: HTMLDivElement | null, cell: NotebookCellModel): void {
    if (ref) {
        cell.cellHeight = ref?.getBoundingClientRect().height ?? 0;
        new ResizeObserver(entries =>
            cell.cellHeight = ref?.getBoundingClientRect().height ?? 0
        ).observe(ref);
    }
}

interface CellListProps {
    renderers: Map<CellKind, CellRenderer>;
    notebookModel: NotebookModel;
    notebookContext: NotebookContextManager;
    toolbarRenderer: NotebookCellToolbarFactory;
    commandRegistry: CommandRegistry;
    menuRegistry: MenuModelRegistry;
}

interface NotebookCellListState {
    selectedCell?: NotebookCellModel;
    scrollIntoView: boolean;
    dragOverIndicator: { cell: NotebookCellModel, position: 'top' | 'bottom' } | undefined;
}

export class NotebookCellListView extends React.Component<CellListProps, NotebookCellListState> {

    protected toDispose = new DisposableCollection();

    protected static dragGhost: HTMLElement | undefined;
    protected cellListRef: React.RefObject<HTMLUListElement> = React.createRef();

    constructor(props: CellListProps) {
        super(props);
        this.state = { selectedCell: props.notebookModel.selectedCell, dragOverIndicator: undefined, scrollIntoView: true };
        this.toDispose.push(props.notebookModel.onDidAddOrRemoveCell(e => {
            if (e.newCellIds && e.newCellIds.length > 0) {
                this.setState({
                    ...this.state,
                    selectedCell: this.props.notebookModel.cells.find(model => model.handle === e.newCellIds![e.newCellIds!.length - 1]),
                    scrollIntoView: true
                });
            } else {
                this.setState({
                    ...this.state,
                    selectedCell: this.props.notebookModel.cells.find(cell => cell === this.state.selectedCell),
                    scrollIntoView: false
                });
            }
        }));

        this.toDispose.push(props.notebookModel.onDidChangeContent(events => {
            if (events.some(e => e.kind === NotebookCellsChangeType.Move)) {
                // When a cell has been moved, we need to rerender the whole component
                this.forceUpdate();
            }
        }));

        this.toDispose.push(props.notebookModel.onDidChangeSelectedCell(e => {
            this.setState({
                ...this.state,
                selectedCell: e.cell,
                scrollIntoView: e.scrollIntoView
            });
        }));

        this.toDispose.push(onDomEvent(document, 'focusin', () => {
            animationFrame().then(() => {
                if (!this.cellListRef.current) {
                    return;
                }
                let hasCellFocus = false;
                let hasFocus = false;
                if (this.cellListRef.current.contains(document.activeElement)) {
                    if (this.props.notebookModel.selectedCell) {
                        hasCellFocus = true;
                    }
                    hasFocus = true;
                }
                this.props.notebookContext.changeCellFocus(hasCellFocus);
                this.props.notebookContext.changeCellListFocus(hasFocus);
            });
        }));
    }

    override componentWillUnmount(): void {
        this.toDispose.dispose();
    }

    override render(): React.ReactNode {
        return <ul className='theia-notebook-cell-list' ref={this.cellListRef} onDragStart={e => this.onDragStart(e)}>
            {this.props.notebookModel.getVisibleCells()
                .map((cell, index) =>
                    <React.Fragment key={'cell-' + cell.handle}>
                        <NotebookCellDivider
                            menuRegistry={this.props.menuRegistry}
                            isVisible={() => this.isEnabled()}
                            onAddNewCell={handler => this.onAddNewCell(handler, index)}
                            onDrop={e => this.onDrop(e, index)}
                            onDragOver={e => this.onDragOver(e, cell, 'top')} />
                        <CellDropIndicator visible={this.shouldRenderDragOverIndicator(cell, 'top')} />
                        <li className={'theia-notebook-cell' + (this.state.selectedCell === cell ? ' focused' : '') + (this.isEnabled() ? ' draggable' : '')}
                            onDragEnd={e => {
                                NotebookCellListView.dragGhost?.remove();
                                this.setState({ ...this.state, dragOverIndicator: undefined });
                            }}
                            onDragOver={e => this.onDragOver(e, cell)}
                            onDrop={e => this.onDrop(e, index)}
                            draggable={true}
                            tabIndex={-1}
                            data-cell-handle={cell.handle}
                            ref={ref => {
                                if (ref && cell === this.state.selectedCell && this.state.scrollIntoView) {
                                    ref.scrollIntoView({ block: 'nearest' });
                                    if (cell.cellKind === CellKind.Markup && !cell.editing) {
                                        ref.focus();
                                    }
                                }
                            }}
                            onClick={e => {
                                this.setState({ ...this.state, selectedCell: cell });
                                this.props.notebookModel.setSelectedCell(cell, false);
                            }}
                        >
                            <div className='theia-notebook-cell-sidebar'>
                                <div className={'theia-notebook-cell-marker' + (this.state.selectedCell === cell ? ' theia-notebook-cell-marker-selected' : '')}></div>
                                {this.renderCellSidebar(cell)}
                            </div>
                            <div className='theia-notebook-cell-content'>
                                {this.renderCellContent(cell, index)}
                            </div>
                            {this.state.selectedCell === cell &&
                                this.props.toolbarRenderer.renderCellToolbar(NotebookCellActionContribution.ACTION_MENU, cell, {
                                    contextMenuArgs: () => [cell], commandArgs: () => [this.props.notebookModel]
                                })
                            }
                        </li>
                        <CellDropIndicator visible={this.shouldRenderDragOverIndicator(cell, 'bottom')} />
                    </React.Fragment>
                )
            }
            <NotebookCellDivider
                menuRegistry={this.props.menuRegistry}
                isVisible={() => this.isEnabled()}
                onAddNewCell={handler => this.onAddNewCell(handler, this.props.notebookModel.cells.length)}
                onDrop={e => this.onDrop(e, this.props.notebookModel.cells.length - 1)}
                onDragOver={e => this.onDragOver(e, this.props.notebookModel.cells[this.props.notebookModel.cells.length - 1], 'bottom')} />
        </ul>;
    }

    renderCellContent(cell: NotebookCellModel, index: number): React.ReactNode {
        const renderer = this.props.renderers.get(cell.cellKind);
        if (!renderer) {
            throw new Error(`No renderer found for cell type ${cell.cellKind}`);
        }
        return renderer.render(this.props.notebookModel, cell, index);
    }

    renderCellSidebar(cell: NotebookCellModel): React.ReactNode {
        const renderer = this.props.renderers.get(cell.cellKind);
        if (!renderer) {
            throw new Error(`No renderer found for cell type ${cell.cellKind}`);
        }
        return renderer.renderSidebar(this.props.notebookModel, cell);
    }

    protected onDragStart(event: React.DragEvent<HTMLElement>): void {
        event.stopPropagation();
        if (!this.isEnabled()) {
            event.preventDefault();
            return;
        }

        const cellHandle = (event.target as HTMLLIElement).getAttribute('data-cell-handle');

        if (!cellHandle) {
            throw new Error('Cell handle not found in element for cell drag event');
        }

        const index = this.props.notebookModel.getCellIndexByHandle(parseInt(cellHandle));
        const cell = this.props.notebookModel.cells[index];

        NotebookCellListView.dragGhost = document.createElement('div');
        NotebookCellListView.dragGhost.classList.add('theia-notebook-drag-ghost-image');
        NotebookCellListView.dragGhost.appendChild(this.props.renderers.get(cell.cellKind)?.renderDragImage(cell) ?? document.createElement('div'));
        document.body.appendChild(NotebookCellListView.dragGhost);
        event.dataTransfer.setDragImage(NotebookCellListView.dragGhost, -10, 0);

        event.dataTransfer.setData('text/theia-notebook-cell-index', index.toString());
        event.dataTransfer.setData('text/plain', this.props.notebookModel.cells[index].source);
    }

    protected onDragOver(event: React.DragEvent<HTMLLIElement>, cell: NotebookCellModel, position?: 'top' | 'bottom'): void {
        if (!this.isEnabled()) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        // show indicator
        this.setState({ ...this.state, dragOverIndicator: { cell, position: position ?? event.nativeEvent.offsetY < event.currentTarget.clientHeight / 2 ? 'top' : 'bottom' } });
    }

    protected isEnabled(): boolean {
        return !Boolean(this.props.notebookModel.readOnly);
    }

    protected onDrop(event: React.DragEvent<HTMLLIElement>, dropElementIndex: number): void {
        if (!this.isEnabled()) {
            this.setState({ dragOverIndicator: undefined });
            return;
        }
        const index = parseInt(event.dataTransfer.getData('text/theia-notebook-cell-index'));
        const isTargetBelow = index < dropElementIndex;
        let newIdx = this.state.dragOverIndicator?.position === 'top' ? dropElementIndex : dropElementIndex + 1;
        newIdx = isTargetBelow ? newIdx - 1 : newIdx;
        if (index !== undefined && index !== dropElementIndex) {
            this.props.notebookModel.applyEdits([{
                editType: CellEditType.Move,
                length: 1,
                index,
                newIdx
            }], true);
        }
        this.setState({ ...this.state, dragOverIndicator: undefined });
    }

    protected onAddNewCell(handler: (...args: any[]) => void, index: number): void {
        if (this.isEnabled()) {
            this.props.commandRegistry.executeCommand(NotebookCommands.CHANGE_SELECTED_CELL.id, index - 1);
            handler(
                this.props.notebookModel,
                index
            );
        }
    }

    protected shouldRenderDragOverIndicator(cell: NotebookCellModel, position: 'top' | 'bottom'): boolean {
        return this.isEnabled() &&
            this.state.dragOverIndicator !== undefined &&
            this.state.dragOverIndicator.cell === cell &&
            this.state.dragOverIndicator.position === position;
    }

}

export interface NotebookCellDividerProps {
    isVisible: () => boolean;
    onAddNewCell: (createCommand: (...args: any[]) => void) => void;
    onDrop: (event: React.DragEvent<HTMLLIElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLLIElement>) => void;
    menuRegistry: MenuModelRegistry;
}

export function NotebookCellDivider({ isVisible, onAddNewCell, onDrop, onDragOver, menuRegistry }: NotebookCellDividerProps): React.JSX.Element {
    const [hover, setHover] = React.useState(false);

    const menuPath = NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_CELL_ADD_GROUP;
    const menuItems: CommandMenu[] = menuRegistry.getMenu(menuPath).children.filter(item => CommandMenu.is(item)).map(item => item as CommandMenu);

    const renderItem = (item: CommandMenu): React.ReactNode => {
        const execute = (...args: any[]) => {
            if (CommandMenu.is(item)) {
                item.run([...menuPath, item.id], ...args);
            }
        };
        return <button
            key={item.id}
            className='theia-notebook-add-cell-button'
            onClick={() => onAddNewCell(execute)}
            title={nls.localizeByDefault(`Add ${item.label} Cell`)}
        >
            <div className={item.icon + ' theia-notebook-add-cell-button-icon'} />
            <div className='theia-notebook-add-cell-button-text'>{item.label}</div>
        </button>
    };

    return <li className='theia-notebook-cell-divider' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onDrop={onDrop} onDragOver={onDragOver}>
        {hover && isVisible() && <div className='theia-notebook-add-cell-buttons'>
            {menuItems.map((item: CommandMenu) => renderItem(item))}
        </div>}
    </li>;
}

function CellDropIndicator(props: { visible: boolean }): React.JSX.Element {
    return <div className='theia-notebook-cell-drop-indicator' style={{ visibility: props.visible ? 'visible' : 'hidden' }} />;
}
