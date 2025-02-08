// *****************************************************************************
// Copyright (C) 2024 TypeFox GmbH and others.
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

import { Locator } from '@playwright/test';
import { join } from 'path';
import { TheiaApp } from './theia-app';
import { TheiaEditor } from './theia-editor';
import { TheiaNotebookCell } from './theia-notebook-cell';
import { TheiaNotebookToolbar } from './theia-notebook-toolbar';
import { TheiaQuickCommandPalette } from './theia-quick-command-palette';
import { TheiaToolbarItem } from './theia-toolbar-item';
import { OSUtil, normalizeId, urlEncodePath } from './util';

export namespace NotebookCommands {
    export const SELECT_KERNEL_COMMAND = 'notebook.selectKernel';
    export const ADD_NEW_CELL_COMMAND = 'notebook.add-new-code-cell';
    export const ADD_NEW_MARKDOWN_CELL_COMMAND = 'notebook.add-new-markdown-cell';
    export const EXECUTE_NOTEBOOK_COMMAND = 'notebook.execute';
    export const CLEAR_ALL_OUTPUTS_COMMAND = 'notebook.clear-all-outputs';
    export const EXPORT_COMMAND = 'jupyter.notebookeditor.export';
}

export class TheiaNotebookEditor extends TheiaEditor {

    constructor(filePath: string, app: TheiaApp) {
        // shell-tab-notebook::file://<path>
        // notebook:file://<path>
        super({
            tabSelector: normalizeId(`#shell-tab-notebook:file://${urlEncodePath(join(app.workspace.escapedPath, OSUtil.fileSeparator, filePath))}`),
            viewSelector: normalizeId(`#notebook:file://${urlEncodePath(join(app.workspace.escapedPath, OSUtil.fileSeparator, filePath))}`)
        }, app);
    }

    protected viewLocator(): Locator {
        return this.page.locator(this.data.viewSelector);
    }

    tabLocator(): Locator {
        return this.page.locator(this.data.tabSelector);
    }

    override async waitForVisible(): Promise<void> {
        await super.waitForVisible();
        // wait for toolbar being rendered as it takes some time to load the kernel data.
        await this.notebookToolbar().waitForVisible();
    }

    /**
     * @returns The main toolbar of the notebook editor.
     */
    notebookToolbar(): TheiaNotebookToolbar {
        return new TheiaNotebookToolbar(this.viewLocator(), this.app);
    }

    /**
     * @returns The name of the selected kernel.
     */
    async selectedKernel(): Promise<string | undefined | null> {
        const kernelItem = await this.toolbarItem(NotebookCommands.SELECT_KERNEL_COMMAND);
        if (!kernelItem) {
            throw new Error('Select kernel toolbar item not found.');
        }
        return this.notebookToolbar().locator.locator('#kernel-text').innerText();
    }

    /**
     *  Allows to select a kernel using toolbar item.
     * @param kernelName  The name of the kernel to select.
     */
    async selectKernel(kernelName: string): Promise<void> {
        await this.triggerToolbarItem(NotebookCommands.SELECT_KERNEL_COMMAND);
        const qInput = new TheiaQuickCommandPalette(this.app);
        const widget = await this.page.waitForSelector(qInput.selector, { timeout: 5000 });
        if (widget && !await qInput.isOpen()) {
            throw new Error('Failed to trigger kernel selection');
        }
        await qInput.type(kernelName, true);
        await qInput.hide();
    }

    async availableKernels(): Promise<string[]> {
        await this.triggerToolbarItem(NotebookCommands.SELECT_KERNEL_COMMAND);
        const qInput = new TheiaQuickCommandPalette(this.app);
        const widget = await this.page.waitForSelector(qInput.selector, { timeout: 5000 });
        if (widget && !await qInput.isOpen()) {
            throw new Error('Failed to trigger kernel selection');
        }
        await qInput.type('Python', false);
        try {
            const listItems = await Promise.all((await qInput.visibleItems()).map(async item => item.textContent()));
            await this.page.keyboard.press('Enter');
            await qInput.hide();
            return listItems.filter(item => item !== null) as string[];
        } finally {
            await qInput.hide();
        }
    }

    /**
     * Adds a new code cell to the notebook.
     */
    async addCodeCell(): Promise<void> {
        const currentCellsCount = (await this.cells()).length;
        await this.triggerToolbarItem(NotebookCommands.ADD_NEW_CELL_COMMAND);
        await this.waitForCellCountChanged(currentCellsCount);
    }

    /**
     * Adds a new markdown cell to the notebook.
     */
    async addMarkdownCell(): Promise<void> {
        const currentCellsCount = (await this.cells()).length;
        await this.triggerToolbarItem(NotebookCommands.ADD_NEW_MARKDOWN_CELL_COMMAND);
        await this.waitForCellCountChanged(currentCellsCount);
    }

    async waitForCellCountChanged(prevCount: number): Promise<void> {
        await this.viewLocator().locator('li.theia-notebook-cell').evaluateAll(
            (elements, currentCount) => elements.length !== currentCount, prevCount
        );
    }

    async executeAllCells(): Promise<void> {
        await this.triggerToolbarItem(NotebookCommands.EXECUTE_NOTEBOOK_COMMAND);
    }

    async clearAllOutputs(): Promise<void> {
        await this.triggerToolbarItem(NotebookCommands.CLEAR_ALL_OUTPUTS_COMMAND);
    }

    async exportAs(): Promise<void> {
        await this.triggerToolbarItem(NotebookCommands.EXPORT_COMMAND);
    }

    async cells(): Promise<TheiaNotebookCell[]> {
        const cellsLocator = this.viewLocator().locator('li.theia-notebook-cell');
        const cells: Array<TheiaNotebookCell> = [];
        for (const cellLocator of await cellsLocator.all()) {
            await cellLocator.waitFor({ state: 'visible' });
            cells.push(new TheiaNotebookCell(cellLocator, this.viewLocator(), this.app));
        }
        return cells;
    }

    protected async triggerToolbarItem(id: string): Promise<void> {
        const item = await this.toolbarItem(id);
        if (!item) {
            throw new Error(`Toolbar item with id ${id} not found`);
        }
        await item.trigger();
    }

    protected async toolbarItem(id: string): Promise<TheiaToolbarItem | undefined> {
        const toolBar = this.notebookToolbar();
        await toolBar.waitForVisible();
        return toolBar.toolBarItem(id);
    }
}
