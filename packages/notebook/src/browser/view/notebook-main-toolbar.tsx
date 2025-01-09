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
import { ArrayUtils, CommandMenu, CommandRegistry, DisposableCollection, Group, GroupImpl, MenuModelRegistry, MenuNode, MenuPath, nls } from '@theia/core';
import * as React from '@theia/core/shared/react';
import { codicon, ContextMenuRenderer } from '@theia/core/lib/browser';
import { NotebookCommands, NotebookMenus } from '../contributions/notebook-actions-contribution';
import { NotebookModel } from '../view-model/notebook-model';
import { NotebookKernelService } from '../service/notebook-kernel-service';
import { inject, injectable } from '@theia/core/shared/inversify';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { NotebookContextManager } from '../service/notebook-context-manager';

export interface NotebookMainToolbarProps {
    notebookModel: NotebookModel
    menuRegistry: MenuModelRegistry;
    notebookKernelService: NotebookKernelService;
    commandRegistry: CommandRegistry;
    contextKeyService: ContextKeyService;
    editorNode: HTMLElement;
    notebookContextManager: NotebookContextManager;
    contextMenuRenderer: ContextMenuRenderer;
}

@injectable()
export class NotebookMainToolbarRenderer {
    @inject(NotebookKernelService) protected readonly notebookKernelService: NotebookKernelService;
    @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry;
    @inject(MenuModelRegistry) protected readonly menuRegistry: MenuModelRegistry;
    @inject(ContextKeyService) protected readonly contextKeyService: ContextKeyService;
    @inject(NotebookContextManager) protected readonly notebookContextManager: NotebookContextManager;
    @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer;

    render(notebookModel: NotebookModel, editorNode: HTMLElement): React.ReactNode {
        return <NotebookMainToolbar notebookModel={notebookModel}
            menuRegistry={this.menuRegistry}
            notebookKernelService={this.notebookKernelService}
            commandRegistry={this.commandRegistry}
            contextKeyService={this.contextKeyService}
            editorNode={editorNode}
            notebookContextManager={this.notebookContextManager}
            contextMenuRenderer={this.contextMenuRenderer} />;
    }
}

interface NotebookMainToolbarState {
    selectedKernelLabel?: string;
    numberOfHiddenItems: number;
}

export class NotebookMainToolbar extends React.Component<NotebookMainToolbarProps, NotebookMainToolbarState> {

    // The minimum area between items and kernel select before hiding items in a context menu
    static readonly MIN_FREE_AREA = 10;

    protected toDispose = new DisposableCollection();

    protected nativeSubmenus = [
        NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_CELL_ADD_GROUP[NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_CELL_ADD_GROUP.length - 1],
        NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_EXECUTION_GROUP[NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_EXECUTION_GROUP.length - 1]];

    protected gapElement: HTMLDivElement | undefined;
    protected lastGapElementWidth: number = 0;

    protected resizeObserver: ResizeObserver = new ResizeObserver(() => this.calculateItemsToHide());

    constructor(props: NotebookMainToolbarProps) {
        super(props);

        this.state = {
            selectedKernelLabel: props.notebookKernelService.getSelectedOrSuggestedKernel(props.notebookModel)?.label,
            numberOfHiddenItems: 0,
        };
        this.toDispose.push(props.notebookKernelService.onDidChangeSelectedKernel(event => {
            if (props.notebookModel.uri.isEqual(event.notebook)) {
                this.setState({ selectedKernelLabel: props.notebookKernelService.getKernel(event.newKernel ?? '')?.label });
            }
        }));
        // in case the selected kernel is added after the notebook is loaded
        this.toDispose.push(props.notebookKernelService.onDidAddKernel(() => {
            if (!this.state.selectedKernelLabel) {
                this.setState({ selectedKernelLabel: props.notebookKernelService.getSelectedOrSuggestedKernel(props.notebookModel)?.label });
            }
        }));

        // TODO maybe we need a mechanism to check for changes in the menu to update this toolbar
        const menuItems = this.getMenuItems();
        for (const item of menuItems) {
            if (item.onDidChange) {
                item.onDidChange(() => this.forceUpdate());
            }
        }
    }

    override componentWillUnmount(): void {
        this.toDispose.dispose();
    }

    override componentDidUpdate(): void {
        this.calculateItemsToHide();
    }

    override componentDidMount(): void {
        this.calculateItemsToHide();
    }

    protected calculateItemsToHide(): void {
        const numberOfMenuItems = this.getMenuItems().length;
        if (this.gapElement && this.gapElement.getBoundingClientRect().width < NotebookMainToolbar.MIN_FREE_AREA && this.state.numberOfHiddenItems < numberOfMenuItems) {
            this.setState({ ...this.state, numberOfHiddenItems: this.state.numberOfHiddenItems + 1 });
            this.lastGapElementWidth = this.gapElement.getBoundingClientRect().width;
        } else if (this.gapElement && this.gapElement.getBoundingClientRect().width > this.lastGapElementWidth && this.state.numberOfHiddenItems > 0) {
            this.setState({ ...this.state, numberOfHiddenItems: 0 });
            this.lastGapElementWidth = this.gapElement.getBoundingClientRect().width;
        }
    }

    protected renderContextMenu(event: MouseEvent, menuItems: readonly MenuNode[]): void {
        const hiddenItems = menuItems.slice(menuItems.length - this.calculateNumberOfHiddenItems(menuItems));

        const menu = new GroupImpl(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_HIDDEN_ITEMS_CONTEXT_MENU[0]);

        hiddenItems.forEach(item => menu.addNode(item));

        this.props.contextMenuRenderer.render({
            anchor: event,
            menuPath: NotebookMenus.NOTEBOOK_MAIN_TOOLBAR_HIDDEN_ITEMS_CONTEXT_MENU,
            menu: menu,
            contextKeyService: this.props.contextKeyService,
            context: this.props.editorNode,
            args: [this.props.notebookModel.uri]
        });
    }

    override render(): React.ReactNode {
        const menuItems = this.getMenuItems();
        return <div className='theia-notebook-main-toolbar' id='notebook-main-toolbar'>
            {menuItems.slice(0, menuItems.length - this.calculateNumberOfHiddenItems(menuItems)).map(item => this.renderMenuItem(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR, item))}
            {
                this.state.numberOfHiddenItems > 0 &&
                <span className={`${codicon('ellipsis')} action-label theia-notebook-main-toolbar-item`} onClick={e => this.renderContextMenu(e.nativeEvent, menuItems)} />
            }
            <div ref={element => this.gapElementChanged(element)} style={{ flexGrow: 1 }}></div>
            <div className='theia-notebook-main-toolbar-item action-label' id={NotebookCommands.SELECT_KERNEL_COMMAND.id}
                onClick={() => this.props.commandRegistry.executeCommand(NotebookCommands.SELECT_KERNEL_COMMAND.id, this.props.notebookModel)}>
                <span className={codicon('server-environment')} />
                <span className=' theia-notebook-main-toolbar-item-text' id='kernel-text'>
                    {this.state.selectedKernelLabel ?? nls.localizeByDefault('Select Kernel')}
                </span>
            </div>
        </div >;
    }

    protected gapElementChanged(element: HTMLDivElement | null): void {
        if (this.gapElement) {
            this.resizeObserver.unobserve(this.gapElement);
        }
        this.gapElement = element ?? undefined;
        if (this.gapElement) {
            this.lastGapElementWidth = this.gapElement.getBoundingClientRect().width;
            this.resizeObserver.observe(this.gapElement);
        }
    }

    protected renderMenuItem<T>(itemPath: MenuPath, item: MenuNode, submenu?: string): React.ReactNode {
        if (Group.is(item)) {
            const itemNodes = ArrayUtils.coalesce(item.children?.map(child => this.renderMenuItem([...itemPath, child.id], child, item.id)) ?? []);
            return <React.Fragment key={item.id}>
                {itemNodes}
                {itemNodes && itemNodes.length > 0 && <span key={`${item.id}-separator`} className='theia-notebook-toolbar-separator'></span>}
            </React.Fragment>;
        } else if (CommandMenu.is(item) && ((this.nativeSubmenus.includes(submenu ?? '')) || item.isVisible(itemPath, this.props.contextKeyService, this.props.editorNode))) {
            return <div key={item.id} id={item.id} title={item.label} className={`theia-notebook-main-toolbar-item action-label${this.getAdditionalClasses(itemPath, item)}`}
                onClick={() => {
                    item.run(itemPath, this.props.notebookModel.uri);
                }}>
                <span className={item.icon} />
                <span className='theia-notebook-main-toolbar-item-text'>{item.label}</span>
            </div>;
        }
        return undefined;
    }

    protected getMenuItems(): readonly MenuNode[] {
        return this.props.menuRegistry.getMenu(NotebookMenus.NOTEBOOK_MAIN_TOOLBAR).children;
    }

    protected getAdditionalClasses(itemPath: MenuPath, item: CommandMenu): string {
        return item.isEnabled(itemPath, this.props.editorNode) ? '' : ' theia-mod-disabled';
    }

    protected calculateNumberOfHiddenItems(allMenuItems: readonly MenuNode[]): number {
        return this.state.numberOfHiddenItems >= allMenuItems.length ?
            allMenuItems.length :
            this.state.numberOfHiddenItems % allMenuItems.length;
    }
}
