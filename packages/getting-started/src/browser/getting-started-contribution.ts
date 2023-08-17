// *****************************************************************************
// Copyright (C) 2018 Ericsson and others.
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
import { ArrayUtils, CommandRegistry, MenuModelRegistry, UntitledResourceResolver } from '@theia/core/lib/common';
import { CommonMenus, AbstractViewContribution, FrontendApplicationContribution, FrontendApplication, PreferenceService } from '@theia/core/lib/browser';
import { EditorManager } from '@theia/editor/lib/browser/editor-manager';
import { GettingStartedWidget } from './getting-started-widget';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { OpenerService, open } from '@theia/core/lib/browser/opener-service';
import { PreviewContribution } from '@theia/preview/lib/browser/preview-contribution';
import { UserWorkingDirectoryProvider } from '@theia/core/lib/browser/user-working-directory-provider';
import { WorkspaceService } from '@theia/workspace/lib/browser';

/**
 * Triggers opening the `GettingStartedWidget`.
 */
export const GettingStartedCommand = {
    id: GettingStartedWidget.ID,
    label: GettingStartedWidget.LABEL
};

@injectable()
export class GettingStartedContribution extends AbstractViewContribution<GettingStartedWidget> implements FrontendApplicationContribution {

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(OpenerService)
    protected readonly openerService: OpenerService;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    @inject(PreviewContribution)
    protected readonly previewContributon: PreviewContribution;

    @inject(FrontendApplicationStateService)
    protected readonly stateService: FrontendApplicationStateService;

    @inject(UntitledResourceResolver)
    protected readonly untitledResourceResolver: UntitledResourceResolver;

    @inject(UserWorkingDirectoryProvider)
    protected readonly workingDirProvider: UserWorkingDirectoryProvider;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    constructor() {
        super({
            widgetId: GettingStartedWidget.ID,
            widgetName: GettingStartedWidget.LABEL,
            defaultWidgetOptions: {
                area: 'main',
            }
        });
    }

    async onStart(app: FrontendApplication): Promise<void> {
        this.stateService.reachedState('ready').then(async () => {
            if (this.editorManager.all.length === 0) {
                await this.preferenceService.ready;
                const startupEditor = this.preferenceService.get('workbench.startupEditor');
                switch (startupEditor) {
                    case 'welcomePage':
                        this.openWelcomePage();
                        break;
                    case 'welcomePageInEmptyWorkbench':
                        if (!this.workspaceService.opened) {
                            this.openWelcomePage();
                        }
                        break;
                    case 'newUntitledFile':
                        const untitledUri = this.untitledResourceResolver.createUntitledURI('', await this.workingDirProvider.getUserWorkingDir());
                        this.untitledResourceResolver.resolve(untitledUri);
                        await open(this.openerService, untitledUri);
                        break;
                    case 'readme':
                        await this.openReadme();
                        break;
                }
            }
        });
    }

    protected openWelcomePage(): void {
        const showWelcomePage: boolean = this.preferenceService.get('welcome.alwaysShowWelcomePage', true);
        if (showWelcomePage) {
            this.openView({ reveal: true, activate: true });
        }
    }

    protected async openReadme(): Promise<void> {
        const roots = await this.workspaceService.roots;
        const readmes = await Promise.all(roots.map(async folder => {
            const folderStat = await this.fileService.resolve(folder.resource);
            const fileArr = folderStat?.children?.sort((a, b) => a.name.localeCompare(b.name)) || [];
            const filePath = fileArr.find(file => file.name.toLowerCase() === 'readme.md') || fileArr.find(file => file.name.toLowerCase().startsWith('readme'));
            return filePath?.resource;
        }));
        const validReadmes = ArrayUtils.coalesce(readmes);
        if (validReadmes.length) {
            for (const readme of validReadmes) {
                await this.previewContributon.open(readme);
            }
        } else {
            // If no readme is found, show the welcome page.
            this.openWelcomePage();
        }
    }

    override registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(GettingStartedCommand, {
            execute: () => this.openView({ reveal: true, activate: true }),
        });
    }

    override registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.HELP, {
            commandId: GettingStartedCommand.id,
            label: GettingStartedCommand.label,
            order: 'a10'
        });
    }
}
