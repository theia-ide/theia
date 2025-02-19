// *****************************************************************************
// Copyright (C) 2018 Red Hat, Inc. and others.
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

import debounce = require('@theia/core/shared/lodash.debounce');
import { URI } from '@theia/core/shared/vscode-uri';
import { interfaces } from '@theia/core/shared/inversify';
import { WebviewsMain, MAIN_RPC_CONTEXT, WebviewsExt, WebviewPanelViewState } from '../../common/plugin-api-rpc';
import { RPCProtocol } from '../../common/rpc-protocol';
import { ViewBadge, WebviewOptions, WebviewPanelOptions, WebviewPanelShowOptions } from '@theia/plugin';
import { ApplicationShell } from '@theia/core/lib/browser/shell/application-shell';
import { WebviewWidget, WebviewWidgetIdentifier } from './webview/webview';
import { Disposable, DisposableCollection } from '@theia/core/lib/common/disposable';
import { ViewColumnService } from '@theia/core/lib/browser/shell/view-column-service';
import { WidgetManager } from '@theia/core/lib/browser/widget-manager';
import { JSONExt } from '@theia/core/shared/@lumino/coreutils';
import { Mutable } from '@theia/core/lib/common/types';
import { HostedPluginSupport } from '../../hosted/browser/hosted-plugin';
import { IconUrl } from '../../common/plugin-protocol';
import { CustomEditorWidget } from './custom-editors/custom-editor-widget';
import { ViewColumn, WebviewPanelTargetArea } from '../../plugin/types-impl';

export class WebviewsMainImpl implements WebviewsMain, Disposable {

    private readonly proxy: WebviewsExt;
    protected readonly shell: ApplicationShell;
    protected readonly widgetManager: WidgetManager;
    protected readonly pluginService: HostedPluginSupport;
    protected readonly viewColumnService: ViewColumnService;
    private readonly toDispose = new DisposableCollection();

    constructor(rpc: RPCProtocol, container: interfaces.Container) {
        this.proxy = rpc.getProxy(MAIN_RPC_CONTEXT.WEBVIEWS_EXT);
        this.shell = container.get(ApplicationShell);
        this.viewColumnService = container.get(ViewColumnService);
        this.widgetManager = container.get(WidgetManager);
        this.pluginService = container.get(HostedPluginSupport);
        this.toDispose.push(this.shell.onDidChangeActiveWidget(() => this.updateViewStates()));
        this.toDispose.push(this.shell.onDidChangeCurrentWidget(() => this.updateViewStates()));
        this.toDispose.push(this.viewColumnService.onViewColumnChanged(() => this.updateViewStates()));
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    async $createWebviewPanel(
        panelId: string,
        viewType: string,
        title: string,
        showOptions: WebviewPanelShowOptions,
        options: WebviewPanelOptions & WebviewOptions
    ): Promise<void> {
        const view = await this.widgetManager.getOrCreateWidget<WebviewWidget>(WebviewWidget.FACTORY_ID, <WebviewWidgetIdentifier>{ id: panelId, viewId: viewType });
        this.hookWebview(view);
        view.viewType = viewType;
        view.title.label = title;
        const { enableFindWidget, retainContextWhenHidden, enableScripts, enableForms, localResourceRoots, ...contentOptions } = options;
        view.options = { enableFindWidget, retainContextWhenHidden };
        view.setContentOptions({
            allowScripts: enableScripts,
            allowForms: enableForms,
            localResourceRoots: localResourceRoots && localResourceRoots.map(root => root.toString()),
            ...contentOptions
        });
        this.addOrReattachWidget(view, showOptions);
    }

    hookWebview(view: WebviewWidget): void {
        const handle = view.identifier.id;
        this.toDispose.push(view.onDidChangeVisibility(() => this.updateViewState(view)));
        this.toDispose.push(view.onMessage(data => this.proxy.$onMessage(handle, data)));
        view.disposed.connect(() => {
            if (this.toDispose.disposed) {
                return;
            }
            this.proxy.$onDidDisposeWebviewPanel(handle);
        });
    }

    addOrReattachWidget(widget: WebviewWidget, showOptions: WebviewPanelShowOptions): void {
        const area = showOptions.area ? showOptions.area : WebviewPanelTargetArea.Main;
        const widgetOptions: ApplicationShell.WidgetOptions = { area };
        let mode = 'open-to-right';
        const canOpenBeside = showOptions.viewColumn === ViewColumn.Beside && (area === WebviewPanelTargetArea.Main || area === WebviewPanelTargetArea.Bottom);
        if (canOpenBeside) {
            const activeOrRightmostTabbar = this.shell.getTabBarFor(area);
            const ref = activeOrRightmostTabbar?.currentTitle?.owner;
            if (ref) {
                Object.assign(widgetOptions, { ref, mode });
            }
        } else if (widgetOptions.area === 'main' && showOptions.viewColumn !== undefined) {
            this.viewColumnService.updateViewColumns();
            let widgetIds = this.viewColumnService.getViewColumnIds(showOptions.viewColumn);
            if (widgetIds.length > 0) {
                mode = 'tab-after';
            } else if (showOptions.viewColumn >= 0) {
                const columnsSize = this.viewColumnService.viewColumnsSize();
                if (columnsSize) {
                    showOptions.viewColumn = columnsSize - 1;
                    widgetIds = this.viewColumnService.getViewColumnIds(showOptions.viewColumn);
                }
            }
            const ref = this.shell.getWidgets(widgetOptions.area).find(w => !w.isHidden && widgetIds.indexOf(w.id) !== -1);
            if (ref) {
                Object.assign(widgetOptions, { ref, mode });
            }
        }

        this.shell.addWidget(widget, widgetOptions);
        if (showOptions.preserveFocus) {
            this.shell.revealWidget(widget.id);
        } else {
            this.shell.activateWidget(widget.id);
        }
    }

    async $disposeWebview(handle: string): Promise<void> {
        const view = await this.tryGetWebview(handle);
        if (view) {
            view.dispose();
        }
    }

    async $reveal(handle: string, showOptions: WebviewPanelShowOptions): Promise<void> {
        const widget = await this.getWebview(handle);
        if (widget.isDisposed) {
            return;
        }
        if ((showOptions.viewColumn !== undefined && showOptions.viewColumn !== widget.viewState.position) || showOptions.area !== undefined) {
            this.viewColumnService.updateViewColumns();
            const columnIds = showOptions.viewColumn ? this.viewColumnService.getViewColumnIds(showOptions.viewColumn) : [];
            const area = this.shell.getAreaFor(widget);
            if (columnIds.indexOf(widget.id) === -1 || area !== showOptions.area) {
                this.addOrReattachWidget(widget, showOptions);
                return;
            }
        }
        if (showOptions.preserveFocus) {
            this.shell.revealWidget(widget.id);
        } else {
            this.shell.activateWidget(widget.id);
        }
    }

    async $setTitle(handle: string, value: string): Promise<void> {
        const webview = await this.getWebview(handle);
        webview.title.label = value;
    }

    async $setBadge(handle: string, badge: ViewBadge | undefined): Promise<void> {
        const webview = await this.getWebview(handle);
        if (webview) {
            webview.badge = badge?.value;
            webview.badgeTooltip = badge?.tooltip;
        }
    }

    async $setIconPath(handle: string, iconUrl: IconUrl | undefined): Promise<void> {
        const webview = await this.getWebview(handle);
        webview.setIconUrl(iconUrl);
    }

    async $setHtml(handle: string, value: string): Promise<void> {
        const webview = await this.getWebview(handle);
        webview.setHTML(value);
    }

    async $setOptions(handle: string, options: WebviewOptions): Promise<void> {
        const webview = await this.getWebview(handle);
        const { enableScripts, enableForms, localResourceRoots, ...contentOptions } = options;
        webview.setContentOptions({
            allowScripts: enableScripts,
            allowForms: enableForms,
            localResourceRoots: localResourceRoots && localResourceRoots.map(root => root.toString()),
            ...contentOptions
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async $postMessage(handle: string, value: any): Promise<boolean> {
        // Due to async nature of $postMessage, the webview may have been disposed in the meantime.
        // Therefore, don't throw an error if the webview is not found, but return false in this case.
        const webview = await this.tryGetWebview(handle);
        if (!webview) {
            return false;
        }
        webview.sendMessage(value);
        return true;
    }

    $registerSerializer(viewType: string): void {
        this.pluginService.registerWebviewReviver(viewType, widget => this.restoreWidget(widget));
        this.toDispose.push(Disposable.create(() => this.$unregisterSerializer(viewType)));
    }

    $unregisterSerializer(viewType: string): void {
        this.pluginService.unregisterWebviewReviver(viewType);
    }

    protected async restoreWidget(widget: WebviewWidget): Promise<void> {
        this.hookWebview(widget);
        const handle = widget.identifier.id;
        const title = widget.title.label;

        let state = undefined;
        if (widget.state) {
            try {
                state = JSON.parse(widget.state);
            } catch {
                // noop
            }
        }

        const options = widget.options;
        const { allowScripts, allowForms, localResourceRoots, ...contentOptions } = widget.contentOptions;
        this.updateViewState(widget);
        await this.proxy.$deserializeWebviewPanel(handle, widget.viewType, title, state, widget.viewState, {
            enableScripts: allowScripts,
            enableForms: allowForms,
            localResourceRoots: localResourceRoots && localResourceRoots.map(root => URI.parse(root)),
            ...contentOptions,
            ...options
        });
    }

    protected readonly updateViewStates = debounce(() => {
        const widgets = this.widgetManager.getWidgets(WebviewWidget.FACTORY_ID);
        const customEditors = this.widgetManager.getWidgets(CustomEditorWidget.FACTORY_ID);

        for (const widget of widgets.concat(customEditors)) {
            if (widget instanceof WebviewWidget) {
                this.updateViewState(widget);
            }
        }
    }, 100);

    private updateViewState(widget: WebviewWidget, viewColumn?: number | undefined): void {
        const viewState: Mutable<WebviewPanelViewState> = {
            active: this.shell.activeWidget === widget,
            visible: !widget.isHidden,
            position: viewColumn || 0
        };
        if (typeof viewColumn !== 'number') {
            this.viewColumnService.updateViewColumns();
            viewState.position = this.viewColumnService.getViewColumn(widget.id) || 0;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (JSONExt.deepEqual(<any>viewState, <any>widget.viewState)) {
            return;
        }
        widget.viewState = viewState;
        this.proxy.$onDidChangeWebviewPanelViewState(widget.identifier.id, widget.viewState);
    }

    private async getWebview(viewId: string): Promise<WebviewWidget> {
        const webview = await this.tryGetWebview(viewId);
        if (!webview) {
            throw new Error(`Unknown Webview: ${viewId}`);
        }
        return webview;
    }

    private async tryGetWebview(id: string): Promise<WebviewWidget | undefined> {
        const webview = await this.widgetManager.findWidget<WebviewWidget>(WebviewWidget.FACTORY_ID, options => {
            if (options) {
                return options.id === id;
            }
            return false;
        })
            || await this.widgetManager.getWidget<CustomEditorWidget>(CustomEditorWidget.FACTORY_ID, <WebviewWidgetIdentifier>{ id });
        return webview;
    }

}
