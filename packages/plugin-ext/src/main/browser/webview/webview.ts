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
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
// copied and modified from https://github.com/microsoft/vscode/blob/ba40bd16433d5a817bfae15f3b4350e18f144af4/src/vs/workbench/contrib/webview/browser/baseWebviewElement.ts
// copied and modified from https://github.com/microsoft/vscode/blob/ba40bd16433d5a817bfae15f3b4350e18f144af4/src/vs/workbench/contrib/webview/browser/webviewElement.ts#

import * as mime from 'mime';
import { JSONExt } from '@theia/core/shared/@lumino/coreutils';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { WebviewPanelOptions, WebviewPortMapping } from '@theia/plugin';
import { BaseWidget, Message } from '@theia/core/lib/browser/widgets/widget';
import { Disposable, DisposableCollection } from '@theia/core/lib/common/disposable';
import { ApplicationShellMouseTracker } from '@theia/core/lib/browser/shell/application-shell-mouse-tracker';
import { StatefulWidget } from '@theia/core/lib/browser/shell/shell-layout-restorer';
import { WebviewPanelViewState } from '../../../common/plugin-api-rpc';
import { IconUrl } from '../../../common/plugin-protocol';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { WebviewEnvironment } from './webview-environment';
import URI from '@theia/core/lib/common/uri';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { open, OpenerService } from '@theia/core/lib/browser/opener-service';
import { KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { Schemes } from '../../../common/uri-components';
import { PluginSharedStyle } from '../plugin-shared-style';
import { WebviewThemeDataProvider } from './webview-theme-data-provider';
import { ExternalUriService } from '@theia/core/lib/browser/external-uri-service';
import { OutputChannelManager } from '@theia/output/lib/browser/output-channel';
import { WebviewPreferences } from './webview-preferences';
import { WebviewResourceCache } from './webview-resource-cache';
import { Endpoint } from '@theia/core/lib/browser/endpoint';
import { isFirefox } from '@theia/core/lib/browser/browser';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileOperationError, FileOperationResult } from '@theia/filesystem/lib/common/files';
import { BinaryBufferReadableStream } from '@theia/core/lib/common/buffer';
import { ExtractableWidget } from '@theia/core/lib/browser/widgets/extractable-widget';
import { BadgeWidget } from '@theia/core/lib/browser/view-container';
import { MenuPath } from '@theia/core';
import { ContextMenuRenderer } from '@theia/core/lib/browser';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { PluginViewWidget } from '../view/plugin-view-widget';

// Style from core
const TRANSPARENT_OVERLAY_STYLE = 'theia-transparent-overlay';

export const WEBVIEW_CONTEXT_MENU: MenuPath = ['webview-context-menu'];

/* eslint-disable @typescript-eslint/no-explicit-any */

export const enum WebviewMessageChannels {
    onmessage = 'onmessage',
    didClickLink = 'did-click-link',
    didFocus = 'did-focus',
    didBlur = 'did-blur',
    doUpdateState = 'do-update-state',
    doReload = 'do-reload',
    loadResource = 'load-resource',
    loadLocalhost = 'load-localhost',
    webviewReady = 'webview-ready',
    didKeydown = 'did-keydown',
    didMouseDown = 'did-mousedown',
    didMouseUp = 'did-mouseup',
    onconsole = 'onconsole',
    didcontextmenu = 'did-context-menu'
}

export interface WebviewContentOptions {
    readonly allowScripts?: boolean;
    readonly allowForms?: boolean;
    readonly localResourceRoots?: ReadonlyArray<string>;
    readonly portMapping?: ReadonlyArray<WebviewPortMapping>;
    readonly enableCommandUris?: boolean | readonly string[];
}

export interface WebviewConsoleLog {
    level: Extract<keyof typeof console, 'log' | 'info' | 'warn' | 'error' | 'trace' | 'debug'>;
    message?: string;
    optionalParams?: string;
}

@injectable()
export class WebviewWidgetIdentifier {
    id: string;
    viewId?: string;
}

export const WebviewWidgetExternalEndpoint = Symbol('WebviewWidgetExternalEndpoint');

@injectable()
export class WebviewWidget extends BaseWidget implements StatefulWidget, ExtractableWidget, BadgeWidget {

    private static readonly standardSupportedLinkSchemes = new Set([
        Schemes.http,
        Schemes.https,
        Schemes.mailto,
        Schemes.vscode
    ]);

    static FACTORY_ID = 'plugin-webview';

    protected element: HTMLIFrameElement | undefined;

    // eslint-disable-next-line max-len
    // XXX This is a hack to be able to tack the mouse events when drag and dropping the widgets.
    // On `mousedown` we put a transparent div over the `iframe` to avoid losing the mouse tacking.
    protected transparentOverlay: HTMLElement;

    @inject(WebviewWidgetIdentifier)
    readonly identifier: WebviewWidgetIdentifier;

    @inject(WebviewWidgetExternalEndpoint)
    readonly externalEndpoint: string;

    @inject(ApplicationShellMouseTracker)
    protected readonly mouseTracker: ApplicationShellMouseTracker;

    @inject(WebviewEnvironment)
    protected readonly environment: WebviewEnvironment;

    @inject(OpenerService)
    protected readonly openerService: OpenerService;

    @inject(KeybindingRegistry)
    protected readonly keybindings: KeybindingRegistry;

    @inject(PluginSharedStyle)
    protected readonly sharedStyle: PluginSharedStyle;

    @inject(WebviewThemeDataProvider)
    protected readonly themeDataProvider: WebviewThemeDataProvider;

    @inject(ExternalUriService)
    protected readonly externalUriService: ExternalUriService;

    @inject(OutputChannelManager)
    protected readonly outputManager: OutputChannelManager;

    @inject(WebviewPreferences)
    protected readonly preferences: WebviewPreferences;

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(WebviewResourceCache)
    protected readonly resourceCache: WebviewResourceCache;

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    viewState: WebviewPanelViewState = {
        visible: false,
        active: false,
        position: 0
    };

    protected html = '';

    protected _contentOptions: WebviewContentOptions = {};
    get contentOptions(): WebviewContentOptions {
        return this._contentOptions;
    }

    protected _state: string | undefined;
    get state(): string | undefined {
        return this._state;
    }

    viewType: string;
    options: WebviewPanelOptions = {};

    protected ready = new Deferred<void>();

    protected readonly onMessageEmitter = new Emitter<any>();
    readonly onMessage = this.onMessageEmitter.event;
    protected readonly pendingMessages: any[] = [];

    protected readonly toHide = new DisposableCollection();
    protected hideTimeout: any | number | undefined;

    isExtractable: boolean = true;
    secondaryWindow: Window | undefined = undefined;

    protected _badge?: number | undefined;
    protected _badgeTooltip?: string | undefined;
    protected onDidChangeBadgeEmitter = new Emitter<void>();
    protected onDidChangeBadgeTooltipEmitter = new Emitter<void>();

    @postConstruct()
    protected init(): void {
        this.node.tabIndex = 0;
        this.id = WebviewWidget.FACTORY_ID + ':' + this.identifier.id;
        this.title.closable = true;
        this.addClass(WebviewWidget.Styles.WEBVIEW);

        this.toDispose.push(this.onMessageEmitter);
        this.toDispose.push(this.onDidChangeBadgeEmitter);
        this.toDispose.push(this.onDidChangeBadgeTooltipEmitter);

        this.transparentOverlay = document.createElement('div');
        this.transparentOverlay.classList.add(TRANSPARENT_OVERLAY_STYLE);
        this.transparentOverlay.style.display = 'none';
        this.node.appendChild(this.transparentOverlay);

        this.toDispose.push(this.mouseTracker.onMousedown(() => {
            if (this.element && this.element.style.display !== 'none') {
                this.transparentOverlay.style.display = 'block';
            }
        }));
        this.toDispose.push(this.mouseTracker.onMouseup(() => {
            if (this.element && this.element.style.display !== 'none') {
                this.transparentOverlay.style.display = 'none';
            }
        }));
    }

    get onDidChangeBadge(): Event<void> {
        return this.onDidChangeBadgeEmitter.event;
    }

    get onDidChangeBadgeTooltip(): Event<void> {
        return this.onDidChangeBadgeTooltipEmitter.event;
    }

    get badge(): number | undefined {
        return this._badge;
    }

    set badge(badge: number | undefined) {
        this._badge = badge;
        this.onDidChangeBadgeEmitter.fire();
    }

    get badgeTooltip(): string | undefined {
        return this._badgeTooltip;
    }

    set badgeTooltip(badgeTooltip: string | undefined) {
        this._badgeTooltip = badgeTooltip;
        this.onDidChangeBadgeTooltipEmitter.fire();
    }

    protected override onBeforeAttach(msg: Message): void {
        super.onBeforeAttach(msg);
        this.doShow();
        // iframe has to be reloaded when moved to another DOM element
        this.toDisposeOnDetach.push(Disposable.create(() => this.forceHide()));
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.addEventListener(this.node, 'focus', () => {
            if (this.element) {
                this.doSend('focus');
            }
        });
    }

    protected override onBeforeShow(msg: Message): void {
        super.onBeforeShow(msg);
        this.doShow();
    }

    protected override onAfterHide(msg: Message): void {
        super.onAfterHide(msg);
        this.doHide();
    }

    protected doHide(): void {
        if (this.options.retainContextWhenHidden !== true) {
            if (this.hideTimeout === undefined) {
                // avoid removing iframe if a widget moved quickly
                this.hideTimeout = setTimeout(() => this.forceHide(), 50);
            }
        }
    }

    protected forceHide(): void {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = undefined;
        this.toHide.dispose();
    }

    protected doShow(): void {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = undefined;
        if (!this.toHide.disposed) {
            return;
        }
        this.toDispose.push(this.toHide);

        const element = document.createElement('iframe');
        element.className = 'webview';
        element.sandbox.add('allow-scripts', 'allow-forms', 'allow-same-origin', 'allow-downloads');
        if (!isFirefox) {
            element.setAttribute('allow', 'clipboard-read; clipboard-write; usb; serial; hid;');
        }
        element.setAttribute('src', `${this.externalEndpoint}/index.html?id=${this.identifier.id}`);
        element.style.border = 'none';
        element.style.width = '100%';
        element.style.height = '100%';
        this.element = element;
        this.node.appendChild(this.element);
        this.toHide.push(Disposable.create(() => {
            if (this.element) {
                this.element.remove();
                this.element = undefined;
            }
        }));

        const oldReady = this.ready;
        const ready = new Deferred<void>();
        ready.promise.then(() => oldReady.resolve());
        this.ready = ready;
        this.toHide.push(Disposable.create(() => this.ready = new Deferred<void>()));
        const subscription = this.on(WebviewMessageChannels.webviewReady, () => {
            subscription.dispose();
            ready.resolve();
        });
        this.toHide.push(subscription);

        this.toHide.push(this.on(WebviewMessageChannels.onmessage, (data: any) => this.onMessageEmitter.fire(data)));
        this.toHide.push(this.on(WebviewMessageChannels.onconsole, (data: WebviewConsoleLog) => this.forwardConsoleLog(data)));
        this.toHide.push(this.on(WebviewMessageChannels.didClickLink, (uri: string) => this.openLink(new URI(uri))));
        this.toHide.push(this.on(WebviewMessageChannels.doUpdateState, (state: any) => {
            this._state = state;
        }));
        this.toHide.push(this.on(WebviewMessageChannels.didFocus, () =>
            // emulate the webview focus without actually changing focus
            this.node.dispatchEvent(new FocusEvent('focus'))
        ));
        this.toHide.push(this.on(WebviewMessageChannels.didBlur, () => {
            /* no-op: webview loses focus only if another element gains focus in the main window */
        }));
        this.toHide.push(this.on(WebviewMessageChannels.doReload, () => this.reload()));
        this.toHide.push(this.on(WebviewMessageChannels.loadResource, (entry: any) => this.loadResource(entry.path, entry.query)));
        this.toHide.push(this.on(WebviewMessageChannels.loadLocalhost, (entry: any) =>
            this.loadLocalhost(entry.origin)
        ));
        this.toHide.push(this.on(WebviewMessageChannels.didKeydown, (data: KeyboardEvent) => {
            // Electron: workaround for https://github.com/electron/electron/issues/14258
            // We have to detect keyboard events in the <webview> and dispatch them to our
            // keybinding service because these events do not bubble to the parent window anymore.
            this.keybindings.dispatchKeyDown(data, this.element);
        }));
        this.toHide.push(this.on(WebviewMessageChannels.didMouseDown, (data: MouseEvent) => {
            // We have to dispatch mousedown events so menus will be closed when clicking inside webviews.
            // See: https://github.com/eclipse-theia/theia/issues/7752
            this.dispatchMouseEvent('mousedown', data);
        }));
        this.toHide.push(this.on(WebviewMessageChannels.didMouseUp, (data: MouseEvent) => {
            this.dispatchMouseEvent('mouseup', data);
        }));

        this.toHide.push(this.on(WebviewMessageChannels.didcontextmenu, (event: { clientX: number, clientY: number, context: any }) => {
            this.handleContextMenu(event);
        }));

        this.style();
        this.toHide.push(this.themeDataProvider.onDidChangeThemeData(() => this.style()));

        this.doUpdateContent();
        while (this.pendingMessages.length) {
            this.sendMessage(this.pendingMessages.shift());
        }
    }

    protected async loadLocalhost(origin: string): Promise<void> {
        const redirect = await this.getRedirect(origin);
        return this.doSend('did-load-localhost', { origin, location: redirect });
    }

    protected dispatchMouseEvent(type: string, data: MouseEvent): void {
        const domRect = this.node.getBoundingClientRect();
        document.dispatchEvent(new MouseEvent(type, {
            ...data,
            clientX: domRect.x + data.clientX,
            clientY: domRect.y + data.clientY
        }));
    }

    handleContextMenu(event: { clientX: number, clientY: number, context: any }): void {
        const domRect = this.node.getBoundingClientRect();
        this.contextKeyService.with(this.parent instanceof PluginViewWidget ?
            { webviewId: this.parent.options.viewId, ...event.context } : {},
            () => {
                this.contextMenuRenderer.render({
                    menuPath: WEBVIEW_CONTEXT_MENU,
                    args: [event.context],
                    anchor: {
                        x: domRect.x + event.clientX, y: domRect.y + event.clientY
                    },
                    context: this.node
                });
            });
    }

    protected async getRedirect(url: string): Promise<string | undefined> {
        const uri = new URI(url);
        const localhost = this.externalUriService.parseLocalhost(uri);
        if (!localhost) {
            return undefined;
        }

        if (this._contentOptions.portMapping) {
            for (const mapping of this._contentOptions.portMapping) {
                if (mapping.webviewPort === localhost.port) {
                    if (mapping.webviewPort !== mapping.extensionHostPort) {
                        return this.toRemoteUrl(
                            uri.withAuthority(`${localhost.address}:${mapping.extensionHostPort}`)
                        );
                    }
                }
            }
        }

        return this.toRemoteUrl(uri);
    }

    protected async toRemoteUrl(localUri: URI): Promise<string> {
        const remoteUri = await this.externalUriService.resolve(localUri);
        const remoteUrl = remoteUri.toString();
        if (remoteUrl[remoteUrl.length - 1] === '/') {
            return remoteUrl.slice(0, remoteUrl.length - 1);
        }
        return remoteUrl;
    }

    setContentOptions(contentOptions: WebviewContentOptions): void {
        if (JSONExt.deepEqual(<any>this.contentOptions, <any>contentOptions)) {
            return;
        }
        this._contentOptions = contentOptions;
        this.doUpdateContent();
    }

    protected iconUrl: IconUrl | undefined;
    protected readonly toDisposeOnIcon = new DisposableCollection();
    setIconUrl(iconUrl: IconUrl | undefined): void {
        if ((this.iconUrl && iconUrl && JSONExt.deepEqual(this.iconUrl, iconUrl)) || (this.iconUrl === iconUrl)) {
            return;
        }
        this.toDisposeOnIcon.dispose();
        this.toDispose.push(this.toDisposeOnIcon);
        this.iconUrl = iconUrl;
        if (iconUrl) {
            const darkIconUrl = typeof iconUrl === 'object' ? iconUrl.dark : iconUrl;
            const lightIconUrl = typeof iconUrl === 'object' ? iconUrl.light : iconUrl;
            const iconClass = `webview-${this.identifier.id}-file-icon`;
            this.toDisposeOnIcon.push(this.sharedStyle.insertRule(
                `.theia-webview-icon.${iconClass}::before`,
                theme => `background-image: url(${this.toEndpoint(theme.type === 'light' ? lightIconUrl : darkIconUrl)});`
            ));
            this.title.iconClass = `theia-webview-icon ${iconClass}`;
        } else {
            this.title.iconClass = '';
        }
    }

    protected toEndpoint(pathname: string): string {
        return new Endpoint({ path: pathname }).getRestUrl().toString();
    }

    setHTML(value: string): void {
        this.html = this.preprocessHtml(value);
        this.doUpdateContent();
    }

    protected preprocessHtml(value: string): string {
        return value
            .replace(/(["'])(?:vscode|theia)-resource:(\/\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (_, startQuote, _1, scheme, path, endQuote) => {
                if (scheme) {
                    return `${startQuote}${this.externalEndpoint}/theia-resource/${scheme}${path}${endQuote}`;
                }
                return `${startQuote}${this.externalEndpoint}/theia-resource/file${path}${endQuote}`;
            });
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
    }

    reload(): void {
        this.doUpdateContent();
    }

    protected forwardConsoleLog(log: WebviewConsoleLog): void {
        const message = `[webview: ${this.identifier.id}] ${log.message ? JSON.parse(log.message) : undefined}`;
        if (log.optionalParams !== undefined) {
            console[log.level](message, JSON.parse(log.optionalParams));
        } else {
            console[log.level](message);
        }
    }

    protected style(): void {
        const { styles, activeThemeType, activeThemeName } = this.themeDataProvider.getThemeData();
        this.doSend('styles', { styles, activeThemeType, activeThemeName });
    }

    protected openLink(link: URI): void {
        const supported = this.toSupportedLink(link);
        if (supported) {
            open(this.openerService, supported);
        }
    }

    protected toSupportedLink(link: URI): URI | undefined {
        if (WebviewWidget.standardSupportedLinkSchemes.has(link.scheme)) {
            const linkAsString = link.toString();
            for (const resourceRoot of [this.externalEndpoint + '/theia-resource', this.externalEndpoint + '/vscode-resource']) {
                if (linkAsString.startsWith(resourceRoot + '/')) {
                    return this.normalizeRequestUri(linkAsString.substring(resourceRoot.length));
                }
            }
            return link;
        }
        if (link.scheme === Schemes.command) {
            if (Array.isArray(this.contentOptions.enableCommandUris) && this.contentOptions.enableCommandUris.some(value => value === link.path.toString())) {
                return link;
            } else if (this.contentOptions.enableCommandUris === true) {
                return link;
            }
        }
        return undefined;
    }

    protected async loadResource(requestPath: string, requestQuery: string = ''): Promise<void> {
        const normalizedUri = this.normalizeRequestUri(requestPath).withQuery(decodeURIComponent(requestQuery));
        // browser cache does not support file scheme, normalize to current endpoint scheme and host
        // use requestPath rather than normalizedUri.path to preserve the scheme of the requested resource as a path segment
        const cacheUrl = new Endpoint({ path: requestPath }).getRestUrl().withQuery(decodeURIComponent(requestQuery)).toString();

        try {
            if (this.contentOptions.localResourceRoots) {
                for (const root of this.contentOptions.localResourceRoots) {
                    if (!new URI(root).path.isEqualOrParent(normalizedUri.path)) {
                        continue;
                    }
                    let cached = await this.resourceCache.match(cacheUrl);
                    try {
                        const result = await this.fileService.readFileStream(normalizedUri, { etag: cached?.eTag });
                        const { buffer } = await BinaryBufferReadableStream.toBuffer(result.value);
                        cached = { body: () => buffer, eTag: result.etag };
                        this.resourceCache.put(cacheUrl, cached);
                    } catch (e) {
                        if (!(e instanceof FileOperationError && e.fileOperationResult === FileOperationResult.FILE_NOT_MODIFIED_SINCE)) {
                            throw e;
                        }
                    }
                    if (cached) {
                        const data = await cached.body();
                        return this.doSend('did-load-resource', {
                            status: 200,
                            path: requestPath,
                            mime: mime.getType(normalizedUri.path.toString()) || 'application/octet-stream',
                            data
                        });
                    }
                }
            }
        } catch {
            // no-op
        }

        this.resourceCache.delete(cacheUrl);
        return this.doSend('did-load-resource', {
            status: 404,
            path: requestPath
        });
    }

    protected normalizeRequestUri(requestPath: string): URI {
        const normalizedPath = decodeURIComponent(requestPath);
        const requestUri = new URI(normalizedPath.replace(/^\/([a-zA-Z0-9.\-+]+)\/(.+)$/, (_, scheme, path) => scheme + ':/' + path));
        if (requestUri.scheme !== 'theia-resource' && requestUri.scheme !== 'vscode-resource') {
            return requestUri;
        }

        // Modern vscode-resources uris put the scheme of the requested resource as the authority
        if (requestUri.authority) {
            return new URI(requestUri.authority + ':' + requestUri.path);
        }

        // Old style vscode-resource uris lose the scheme of the resource which means they are unable to
        // load a mix of local and remote content properly.
        return requestUri.withScheme('file');
    }

    sendMessage(data: any): void {
        if (this.element) {
            this.doSend('message', data);
        } else {
            this.pendingMessages.push(data);
        }
    }

    protected doUpdateContent(): void {
        this.doSend('content', {
            contents: this.html,
            options: this.contentOptions,
            state: this.state
        });
    }

    storeState(): WebviewWidget.State {
        return {
            viewType: this.viewType,
            title: this.title.label,
            iconUrl: this.iconUrl,
            options: this.options,
            contentOptions: this.contentOptions,
            state: this.state
        };
    }

    restoreState(oldState: WebviewWidget.State): void {
        const { viewType, title, iconUrl, options, contentOptions, state } = oldState;
        this.viewType = viewType;
        this.title.label = title;
        this.setIconUrl(iconUrl);
        this.options = options;
        this._contentOptions = contentOptions;
        this._state = state;
    }

    setIframeHeight(height: number): void {
        if (this.element) {
            this.element.style.height = `${height}px`;
        }
    }

    protected async doSend(channel: string, data?: any): Promise<void> {
        if (!this.element) {
            return;
        }
        try {
            await this.ready.promise;
            this.postMessage(channel, data);
        } catch (e) {
            console.error(e);
        }
    }

    protected postMessage(channel: string, data?: any): void {
        if (this.element) {
            this.trace('out', channel, data);
            if (this.secondaryWindow) {
                this.secondaryWindow.postMessage({ channel, args: data }, '*');
            } else {
                this.element.contentWindow!.postMessage({ channel, args: data }, '*');
            }
        }
    }

    protected on<T = unknown>(channel: WebviewMessageChannels, handler: (data: T) => void): Disposable {
        const listener = (e: any) => {
            if (!e || !e.data || e.data.target !== this.identifier.id) {
                return;
            }
            if (e.data.channel === channel) {
                this.trace('in', e.data.channel, e.data.data);
                handler(e.data.data);
            }
        };
        window.addEventListener('message', listener);
        return Disposable.create(() =>
            window.removeEventListener('message', listener)
        );
    }

    protected trace(kind: 'in' | 'out', channel: string, data?: any): void {
        const value = this.preferences['webview.trace'];
        if (value === 'off') {
            return;
        }
        const output = this.outputManager.getChannel('webviews');
        output.append('\n' + this.identifier.id);
        output.append(kind === 'out' ? ' => ' : ' <= ');
        output.append(channel);
        if (value === 'verbose') {
            if (data) {
                output.append('\n' + JSON.stringify(data, undefined, 2));
            }
        }
    }

}
export namespace WebviewWidget {
    export namespace Styles {
        export const WEBVIEW = 'theia-webview';
    }
    export interface State {
        viewType: string
        title: string
        iconUrl?: IconUrl
        options: WebviewPanelOptions
        contentOptions: WebviewContentOptions
        state?: string
    }
}
