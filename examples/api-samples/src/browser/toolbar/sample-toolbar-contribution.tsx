// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
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

import { CommandContribution, CommandRegistry, CommandService, MenuContribution, MenuModelRegistry } from '@theia/core';
import { LabelProvider, quickCommand, QuickInputService, QuickPickItem } from '@theia/core/lib/browser';
import { inject, injectable, interfaces } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { quickFileOpen } from '@theia/file-search/lib/browser/quick-file-open';
import { SearchInWorkspaceCommands } from '@theia/search-in-workspace/lib/browser/search-in-workspace-frontend-contribution';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { AbstractToolbarContribution } from '@theia/toolbar/lib/browser/abstract-toolbar-contribution';
import { ToolbarMenus, ReactInteraction } from '@theia/toolbar/lib/browser/toolbar-constants';
import { ToolbarContribution } from '@theia/toolbar/lib/browser/toolbar-interfaces';
import { ToolbarDefaultsFactory } from '@theia/toolbar/lib/browser/toolbar-defaults';
import { SampleToolbarDefaultsOverride } from './sample-toolbar-defaults-override';
import '../../../src/browser/toolbar/sample-toolbar-contribution.css';

export const bindSampleToolbarContribution = (bind: interfaces.Bind, rebind: interfaces.Rebind) => {
    bind(SampleToolbarContribution).toSelf().inSingletonScope();
    bind(ToolbarContribution).to(SampleToolbarContribution);
    bind(CommandContribution).to(SampleToolbarContribution);
    bind(MenuContribution).to(SampleToolbarContribution);
    bind(SearchInWorkspaceQuickInputService).toSelf().inSingletonScope();
    rebind(ToolbarDefaultsFactory).toConstantValue(SampleToolbarDefaultsOverride);
};

export const FIND_IN_WORKSPACE_ROOT = {
    id: 'easy.search.find.in.workspace.root',
    category: 'Search',
    label: 'Search Workspace Root for Text',
};

@injectable()
export class SearchInWorkspaceQuickInputService {
    @inject(QuickInputService) protected readonly quickInputService: QuickInputService;
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;
    @inject(LabelProvider) protected readonly labelProvider: LabelProvider;
    @inject(CommandService) protected readonly commandService: CommandService;
    protected quickPickItems: QuickPickItem[] = [];

    open(): void {
        this.quickPickItems = this.createWorkspaceList();
        this.quickInputService.showQuickPick(this.quickPickItems, {
            placeholder: 'Workspace root to search',
        });
    }

    protected createWorkspaceList(): QuickPickItem[] {
        const roots = this.workspaceService.tryGetRoots();
        return roots.map(root => {
            const uri = root.resource;
            return {
                label: this.labelProvider.getName(uri),
                execute: (): Promise<void> => this.commandService.executeCommand(SearchInWorkspaceCommands.FIND_IN_FOLDER.id, [uri]),
            };
        });
    }
}

@injectable()
export class SampleToolbarContribution extends AbstractToolbarContribution
    implements CommandContribution,
    MenuContribution {
    @inject(SearchInWorkspaceQuickInputService) protected readonly searchPickService: SearchInWorkspaceQuickInputService;
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;

    static ID = 'theia-sample-toolbar-contribution';
    id = SampleToolbarContribution.ID;

    protected handleOnClick = (e: ReactInteraction<HTMLSpanElement>): void => this.doHandleOnClick(e);
    protected doHandleOnClick(e: ReactInteraction<HTMLSpanElement>): void {
        e.stopPropagation();
        const toolbar = document.querySelector<HTMLDivElement>('#main-toolbar');
        if (toolbar) {
            const { bottom } = toolbar.getBoundingClientRect();
            const { left } = e.currentTarget.getBoundingClientRect();
            this.contextMenuRenderer.render({
                includeAnchorArg: false,
                menuPath: ToolbarMenus.SEARCH_WIDGET_DROPDOWN_MENU,
                anchor: { x: left, y: bottom },
                context: e.currentTarget
            });
        }
    }

    render(): React.ReactNode {
        return (
            <div
                role='button'
                tabIndex={0}
                className='icon-wrapper action-label item enabled codicon codicon-search'
                id='easy-search-item-icon'
                onClick={this.handleOnClick}
                title='Search for files, text, commands, and more...'
            >
                <div className='codicon codicon-triangle-down' />
            </div>);
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(FIND_IN_WORKSPACE_ROOT, {
            execute: async () => {
                const wsRoots = await this.workspaceService.roots;
                if (!wsRoots.length) {
                    await this.commandService.executeCommand(SearchInWorkspaceCommands.FIND_IN_FOLDER.id);
                } else if (wsRoots.length === 1) {
                    const { resource } = wsRoots[0];
                    await this.commandService.executeCommand(SearchInWorkspaceCommands.FIND_IN_FOLDER.id, [resource]);
                } else {
                    this.searchPickService.open();
                }
            },
        });
    }

    registerMenus(registry: MenuModelRegistry): void {
        registry.registerMenuAction(ToolbarMenus.SEARCH_WIDGET_DROPDOWN_MENU, {
            commandId: quickCommand.id,
            label: 'Find a Command',
            order: 'a',
        });
        registry.registerMenuAction(ToolbarMenus.SEARCH_WIDGET_DROPDOWN_MENU, {
            commandId: quickFileOpen.id,
            order: 'b',
            label: 'Search for a file'
        });
        registry.registerMenuAction(ToolbarMenus.SEARCH_WIDGET_DROPDOWN_MENU, {
            commandId: SearchInWorkspaceCommands.OPEN_SIW_WIDGET.id,
            label: 'Search Entire Workspace for Text',
            order: 'c',
        });
        registry.registerMenuAction(ToolbarMenus.SEARCH_WIDGET_DROPDOWN_MENU, {
            commandId: FIND_IN_WORKSPACE_ROOT.id,
            order: 'd',
        });
    }
}

