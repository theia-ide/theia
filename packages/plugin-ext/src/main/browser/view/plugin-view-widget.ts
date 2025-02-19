// *****************************************************************************
// Copyright (C) 2019 TypeFox and others.
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

import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { Panel, Widget } from '@theia/core/shared/@lumino/widgets';
import { MenuModelRegistry } from '@theia/core/lib/common/menu';
import { CommandRegistry } from '@theia/core/lib/common/command';
import { StatefulWidget } from '@theia/core/lib/browser/shell/shell-layout-restorer';
import { Message } from '@theia/core/shared/@lumino/messaging';
import { TreeViewWidget } from './tree-view-widget';
import { BadgeWidget, DescriptionWidget, DynamicToolbarWidget } from '@theia/core/lib/browser/view-container';
import { DisposableCollection, Emitter, Event } from '@theia/core/lib/common';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';

@injectable()
export class PluginViewWidgetIdentifier {
    id: string;
    viewId: string;
}

@injectable()
export class PluginViewWidget extends Panel implements StatefulWidget, DescriptionWidget, BadgeWidget, DynamicToolbarWidget {

    currentViewContainerId?: string;

    protected _message?: string;
    protected _description: string = '';
    protected _badge?: number | undefined;
    protected _badgeTooltip?: string | undefined;
    protected _suppressUpdateViewVisibility = false;
    protected updatingViewVisibility = false;
    protected onDidChangeDescriptionEmitter = new Emitter<void>();
    protected onDidChangeBadgeEmitter = new Emitter<void>();
    protected onDidChangeBadgeTooltipEmitter = new Emitter<void>();
    protected toDispose = new DisposableCollection(this.onDidChangeDescriptionEmitter, this.onDidChangeBadgeEmitter, this.onDidChangeBadgeTooltipEmitter);
    protected readonly onDidChangeToolbarItemsEmitter = new Emitter<void>();

    get onDidChangeToolbarItems(): Event<void> {
        return this.onDidChangeToolbarItemsEmitter.event;
    }

    @inject(MenuModelRegistry)
    protected readonly menus: MenuModelRegistry;

    @inject(CommandRegistry)
    protected readonly commands: CommandRegistry;

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    @inject(PluginViewWidgetIdentifier)
    readonly options: PluginViewWidgetIdentifier;

    constructor() {
        super();
        this.node.tabIndex = -1;
        this.node.style.height = '100%';
    }

    @postConstruct()
    protected init(): void {
        this.id = this.options.id;
        const localContext = this.contextKeyService.createScoped(this.node);
        localContext.setContext('view', this.options.viewId);
    }

    get onDidChangeDescription(): Event<void> {
        return this.onDidChangeDescriptionEmitter.event;
    }

    get onDidChangeBadge(): Event<void> {
        return this.onDidChangeBadgeEmitter.event;
    }

    get onDidChangeBadgeTooltip(): Event<void> {
        return this.onDidChangeBadgeTooltipEmitter.event;
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const widget = this.widgets[0];
        if (widget) {
            widget.activate();
            this.updateWidgetMessage();
        } else {
            this.node.focus();
        }
    }

    storeState(): PluginViewWidget.State {
        return {
            label: this.title.label,
            message: this.message,
            widgets: this.widgets,
            suppressUpdateViewVisibility: this._suppressUpdateViewVisibility,
            currentViewContainerId: this.currentViewContainerId
        };
    }

    restoreState(state: PluginViewWidget.State): void {
        this.title.label = state.label;
        this.message = state.message;
        this.suppressUpdateViewVisibility = state.suppressUpdateViewVisibility;
        this.currentViewContainerId = state.currentViewContainerId;
        for (const widget of state.widgets) {
            this.addWidget(widget);
        }
    }

    set suppressUpdateViewVisibility(suppressUpdateViewVisibility: boolean) {
        this._suppressUpdateViewVisibility = !this.updatingViewVisibility && suppressUpdateViewVisibility;
    }

    updateViewVisibility(cb: () => void): void {
        if (this._suppressUpdateViewVisibility) {
            return;
        }
        try {
            this.updatingViewVisibility = true;
            cb();
        } finally {
            this.updatingViewVisibility = false;
        }
    }

    get message(): string | undefined {
        return this._message;
    }

    set message(message: string | undefined) {
        this._message = message;
        this.updateWidgetMessage();
    }

    get description(): string {
        return this._description;
    }

    set description(description: string) {
        this._description = description;
        this.onDidChangeDescriptionEmitter.fire();
    }

    get badge(): number | undefined {
        const widget = this.widgets[0];
        if (BadgeWidget.is(widget)) {
            return widget.badge;
        }
        return this._badge;
    }

    set badge(badge: number | undefined) {
        this._badge = badge;
        this.onDidChangeBadgeEmitter.fire();
    }

    get badgeTooltip(): string | undefined {
        const widget = this.widgets[0];
        if (BadgeWidget.is(widget)) {
            return widget.badgeTooltip;
        }
        return this._badgeTooltip;
    }

    set badgeTooltip(badgeTooltip: string | undefined) {
        this._badgeTooltip = badgeTooltip;
        this.onDidChangeBadgeTooltipEmitter.fire();
    }

    private updateWidgetMessage(): void {
        const widget = this.widgets[0];
        if (widget) {
            if (widget instanceof TreeViewWidget) {
                widget.message = this._message;
            }
        }
    }

    override addWidget(widget: Widget): void {
        super.addWidget(widget);
        if (BadgeWidget.is(widget)) {
            widget.onDidChangeBadge(() => this.onDidChangeBadgeEmitter.fire());
            widget.onDidChangeBadgeTooltip(() => this.onDidChangeBadgeTooltipEmitter.fire());
        }
        this.updateWidgetMessage();
        this.onDidChangeToolbarItemsEmitter.fire();
    }

    override insertWidget(index: number, widget: Widget): void {
        super.insertWidget(index, widget);
        this.updateWidgetMessage();
        this.onDidChangeToolbarItemsEmitter.fire();
    }

    override dispose(): void {
        this.toDispose.dispose();
        super.dispose();
    }
}
export namespace PluginViewWidget {
    export interface State {
        label: string,
        message?: string,
        widgets: ReadonlyArray<Widget>,
        suppressUpdateViewVisibility: boolean;
        currentViewContainerId: string | undefined;
    }
}
