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
import { CommandRegistry, CompoundMenuNodeRole, MenuModelRegistry, MenuNode } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { NotebookCellSidebar, NotebookCellToolbar } from './notebook-cell-toolbar';
import { ContextMenuRenderer } from '@theia/core/lib/browser';
import { NotebookCellModel } from '../view-model/notebook-cell-model';
import { NotebookContextManager } from '../service/notebook-context-manager';

export interface NotebookCellToolbarItem {
    id: string;
    icon?: string;
    label?: string;
    onClick: (e: React.MouseEvent) => void;
    isVisible: () => boolean;
    contextKeys?: Set<string>
}

export interface toolbarItemOptions {
    contextMenuArgs?: () => unknown[];
    commandArgs?: () => unknown[];
}

@injectable()
export class NotebookCellToolbarFactory {

    @inject(MenuModelRegistry)
    protected menuRegistry: MenuModelRegistry;

    @inject(ContextKeyService)
    protected contextKeyService: ContextKeyService;

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    @inject(NotebookContextManager)
    protected readonly notebookContextManager: NotebookContextManager;

    renderCellToolbar(menuPath: string[], cell: NotebookCellModel, itemOptions: toolbarItemOptions): React.ReactNode {
        return <NotebookCellToolbar getMenuItems={() => this.getMenuItems(menuPath, cell, itemOptions)}
            onContextKeysChanged={this.notebookContextManager.onDidChangeContext} />;
    }

    renderSidebar(menuPath: string[], cell: NotebookCellModel, itemOptions: toolbarItemOptions): React.ReactNode {
        return <NotebookCellSidebar getMenuItems={() => this.getMenuItems(menuPath, cell, itemOptions)}
            onContextKeysChanged={this.notebookContextManager.onDidChangeContext} />;
    }

    private getMenuItems(menuItemPath: string[], cell: NotebookCellModel, itemOptions: toolbarItemOptions): NotebookCellToolbarItem[] {
        const inlineItems: NotebookCellToolbarItem[] = [];
        for (const menuNode of this.menuRegistry.getMenu(menuItemPath).children) {
            if (!menuNode.when || this.notebookContextManager.getCellContext(cell.handle).match(menuNode.when, this.notebookContextManager.context)) {
                if (menuNode.role === CompoundMenuNodeRole.Flat) {
                    inlineItems.push(...menuNode.children?.map(child => this.createToolbarItem(child, itemOptions)) ?? []);
                } else {
                    inlineItems.push(this.createToolbarItem(menuNode, itemOptions));
                }
            }
        }
        return inlineItems;
    }

    private createToolbarItem(menuNode: MenuNode, itemOptions: toolbarItemOptions): NotebookCellToolbarItem {
        const menuPath = menuNode.role === CompoundMenuNodeRole.Submenu ? this.menuRegistry.getPath(menuNode) : undefined;
        return {
            id: menuNode.id,
            icon: menuNode.icon,
            label: menuNode.label,
            onClick: menuPath ?
                e => this.contextMenuRenderer.render(
                    {
                        anchor: e.nativeEvent,
                        menuPath,
                        includeAnchorArg: false,
                        args: itemOptions.contextMenuArgs?.(),
                        context: this.notebookContextManager.context || (e.currentTarget as HTMLElement)
                    }) :
                () => this.commandRegistry.executeCommand(menuNode.command!, ...(itemOptions.commandArgs?.() ?? [])),
            isVisible: () => menuPath ? true : Boolean(this.commandRegistry.getVisibleHandler(menuNode.command!, ...(itemOptions.commandArgs?.() ?? []))),
            contextKeys: menuNode.when ? this.contextKeyService.parseKeys(menuNode.when) : undefined
        };
    }
}
