// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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

import { injectable, inject, interfaces, optional, unmanaged } from 'inversify';
import { Widget } from '@lumino/widgets';
import {
    MenuModelRegistry, Command, CommandContribution,
    MenuContribution, CommandRegistry, nls
} from '../../common';
import { KeybindingContribution, KeybindingRegistry } from '../keybinding';
import { WidgetManager } from '../widget-manager';
import { CommonMenus } from '../common-frontend-contribution';
import { ApplicationShell } from './application-shell';
import { QuickViewService } from '../quick-input';

export interface OpenViewArguments extends ApplicationShell.WidgetOptions {
    toggle?: boolean
    activate?: boolean;
    reveal?: boolean;
}

export interface ViewContributionOptions {
    widgetId: string;
    viewContainerId?: string;
    widgetName: string;
    defaultWidgetOptions: ApplicationShell.WidgetOptions;
    toggleCommandId?: string;
    toggleKeybinding?: string;
}

export function bindViewContribution<T extends AbstractViewContribution<Widget>>(bind: interfaces.Bind, identifier: interfaces.Newable<T>): interfaces.BindingWhenOnSyntax<T> {
    const syntax = bind<T>(identifier).toSelf().inSingletonScope();
    bind(CommandContribution).toService(identifier);
    bind(KeybindingContribution).toService(identifier);
    bind(MenuContribution).toService(identifier);
    return syntax;
}

/**
 * An abstract superclass for frontend contributions that add a view to the application shell.
 */
@injectable()
export abstract class AbstractViewContribution<T extends Widget> implements CommandContribution, MenuContribution, KeybindingContribution {

    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    @inject(ApplicationShell) protected readonly shell: ApplicationShell;

    @inject(QuickViewService) @optional()
    protected readonly quickView: QuickViewService;

    readonly toggleCommand?: Command;

    constructor(
        @unmanaged() protected readonly options: ViewContributionOptions
    ) {
        if (options.toggleCommandId) {
            this.toggleCommand = {
                id: options.toggleCommandId,
                category: nls.localizeByDefault('View'),
                label: nls.localizeByDefault('Toggle {0}', this.viewLabel)
            };
        }
    }

    get viewId(): string {
        return this.options.widgetId;
    }

    get viewLabel(): string {
        return this.options.widgetName;
    }

    get defaultViewOptions(): ApplicationShell.WidgetOptions {
        return this.options.defaultWidgetOptions;
    }

    get widget(): Promise<T> {
        return this.widgetManager.getOrCreateWidget(this.viewId);
    }

    tryGetWidget(): T | undefined {
        return this.widgetManager.tryGetWidget(this.viewId);
    }

    async openView(args: Partial<OpenViewArguments> = {}): Promise<T> {
        const shell = this.shell;
        const widget = await this.widgetManager.getOrCreateWidget(this.options.viewContainerId || this.viewId);
        const tabBar = shell.getTabBarFor(widget);
        const area = shell.getAreaFor(widget);
        if (!tabBar) {
            // The widget is not attached yet, so add it to the shell
            const widgetArgs: OpenViewArguments = {
                ...this.defaultViewOptions,
                ...args
            };
            await shell.addWidget(widget, widgetArgs);
        } else if (args.toggle && area && shell.isExpanded(area) && tabBar.currentTitle === widget.title) {
            // The widget is attached and visible, so collapse the containing panel (toggle)
            switch (area) {
                case 'left':
                case 'right':
                    await shell.collapsePanel(area);
                    break;
                case 'bottom':
                    // Don't collapse the bottom panel if it's currently split
                    if (shell.bottomAreaTabBars.length === 1) {
                        await shell.collapsePanel('bottom');
                    }
                    break;
                default:
                    // The main area cannot be collapsed, so close the widget
                    await this.closeView();
            }
            return this.widget;
        }
        if (widget.isAttached && args.activate) {
            await shell.activateWidget(this.viewId);
        } else if (widget.isAttached && args.reveal) {
            await shell.revealWidget(this.viewId);
        }
        return this.widget;
    }

    registerCommands(commands: CommandRegistry): void {
        if (this.toggleCommand) {
            commands.registerCommand(this.toggleCommand, {
                execute: () => this.toggleView()
            });
        }
        this.quickView?.registerItem({
            label: this.viewLabel,
            open: () => this.openView({ activate: true })
        });
    }

    async closeView(): Promise<T | undefined> {
        const widget = await this.shell.closeWidget(this.viewId);
        return widget as T | undefined;
    }

    toggleView(): Promise<T> {
        return this.openView({
            toggle: true,
            activate: true
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        if (this.toggleCommand) {
            menus.registerMenuAction(CommonMenus.VIEW_VIEWS, {
                commandId: this.toggleCommand.id,
                label: this.viewLabel
            });
        }
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        if (this.toggleCommand && this.options.toggleKeybinding) {
            keybindings.registerKeybinding({
                command: this.toggleCommand.id,
                keybinding: this.options.toggleKeybinding
            });
        }
    }
}
