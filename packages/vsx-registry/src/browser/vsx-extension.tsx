// *****************************************************************************
// Copyright (C) 2020 TypeFox and others.
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
import * as DOMPurify from '@theia/core/shared/dompurify';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import URI from '@theia/core/lib/common/uri';
import { TreeElement, TreeElementNode } from '@theia/core/lib/browser/source-tree';
import { OpenerService, open, OpenerOptions } from '@theia/core/lib/browser/opener-service';
import { HostedPluginSupport } from '@theia/plugin-ext/lib/hosted/browser/hosted-plugin';
import { PluginServer, DeployedPlugin, PluginType, PluginIdentifiers, PluginDeployOptions } from '@theia/plugin-ext/lib/common/plugin-protocol';
import { VSCodeExtensionUri } from '@theia/plugin-ext-vscode/lib/common/plugin-vscode-uri';
import { ProgressService } from '@theia/core/lib/common/progress-service';
import { Endpoint } from '@theia/core/lib/browser/endpoint';
import { VSXEnvironment } from '../common/vsx-environment';
import { VSXExtensionsSearchModel } from './vsx-extensions-search-model';
import { CommandRegistry, MenuPath, nls } from '@theia/core/lib/common';
import { codicon, ConfirmDialog, ContextMenuRenderer, HoverService, TreeWidget } from '@theia/core/lib/browser';
import { VSXExtensionNamespaceAccess, VSXUser } from '@theia/ovsx-client/lib/ovsx-types';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { MarkdownStringImpl } from '@theia/core/lib/common/markdown-rendering';

export const EXTENSIONS_CONTEXT_MENU: MenuPath = ['extensions_context_menu'];

export namespace VSXExtensionsContextMenu {
    export const INSTALL = [...EXTENSIONS_CONTEXT_MENU, '1_install'];
    export const COPY = [...EXTENSIONS_CONTEXT_MENU, '2_copy'];
    export const CONTRIBUTION = [...EXTENSIONS_CONTEXT_MENU, '3_contribution'];
}

@injectable()
export class VSXExtensionData {
    readonly version?: string;
    readonly iconUrl?: string;
    readonly publisher?: string;
    readonly name?: string;
    readonly displayName?: string;
    readonly description?: string;
    readonly averageRating?: number;
    readonly downloadCount?: number;
    readonly downloadUrl?: string;
    readonly readmeUrl?: string;
    readonly licenseUrl?: string;
    readonly repository?: string;
    readonly license?: string;
    readonly readme?: string;
    readonly preview?: boolean;
    readonly verified?: boolean;
    readonly namespaceAccess?: VSXExtensionNamespaceAccess;
    readonly publishedBy?: VSXUser;
    static KEYS: Set<(keyof VSXExtensionData)> = new Set([
        'version',
        'iconUrl',
        'publisher',
        'name',
        'displayName',
        'description',
        'averageRating',
        'downloadCount',
        'downloadUrl',
        'readmeUrl',
        'licenseUrl',
        'repository',
        'license',
        'readme',
        'preview',
        'verified',
        'namespaceAccess',
        'publishedBy'
    ]);
}

@injectable()
export class VSXExtensionOptions {
    readonly id: string;
}

export const VSXExtensionFactory = Symbol('VSXExtensionFactory');
export type VSXExtensionFactory = (options: VSXExtensionOptions) => VSXExtension;

@injectable()
export class VSXExtension implements VSXExtensionData, TreeElement {
    /**
     * Ensure the version string begins with `'v'`.
     */
    static formatVersion(version: string | undefined): string | undefined {
        if (version && !version.startsWith('v')) {
            return `v${version}`;
        }
        return version;
    }

    @inject(VSXExtensionOptions)
    protected readonly options: VSXExtensionOptions;

    @inject(OpenerService)
    protected readonly openerService: OpenerService;

    @inject(HostedPluginSupport)
    protected readonly pluginSupport: HostedPluginSupport;

    @inject(PluginServer)
    protected readonly pluginServer: PluginServer;

    @inject(ProgressService)
    protected readonly progressService: ProgressService;

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(VSXEnvironment)
    readonly environment: VSXEnvironment;

    @inject(VSXExtensionsSearchModel)
    readonly search: VSXExtensionsSearchModel;

    @inject(HoverService)
    protected readonly hoverService: HoverService;

    @inject(WindowService)
    readonly windowService: WindowService;

    @inject(CommandRegistry)
    readonly commandRegistry: CommandRegistry;

    protected readonly data: Partial<VSXExtensionData> = {};

    protected registryUri: Promise<string>;

    @postConstruct()
    protected postConstruct(): void {
        this.registryUri = this.environment.getRegistryUri();
    }

    get uri(): URI {
        return VSCodeExtensionUri.fromId(this.id);
    }

    get id(): string {
        return this.options.id;
    }

    get visible(): boolean {
        return !!this.name;
    }

    get plugin(): DeployedPlugin | undefined {
        return this.pluginSupport.getPlugin(this.id as PluginIdentifiers.UnversionedId);
    }

    get installed(): boolean {
        return !!this.plugin;
    }

    get builtin(): boolean {
        return this.plugin?.type === PluginType.System;
    }

    update(data: Partial<VSXExtensionData>): void {
        for (const key of VSXExtensionData.KEYS) {
            if (key in data) {
                Object.assign(this.data, { [key]: data[key] });
            }
        }
    }

    reloadWindow(): void {
        this.windowService.reload();
    }

    protected getData<K extends keyof VSXExtensionData>(key: K): VSXExtensionData[K] {
        const model = this.plugin?.metadata.model;
        if (model && key in model) {
            return model[key as keyof typeof model] as VSXExtensionData[K];
        }
        return this.data[key];
    }

    get iconUrl(): string | undefined {
        const plugin = this.plugin;
        const iconUrl = plugin && plugin.metadata.model.iconUrl;
        if (iconUrl) {
            return new Endpoint({ path: iconUrl }).getRestUrl().toString();
        }
        return this.data['iconUrl'];
    }

    get publisher(): string | undefined {
        return this.getData('publisher');
    }

    get name(): string | undefined {
        return this.getData('name');
    }

    get displayName(): string | undefined {
        return this.getData('displayName') || this.name;
    }

    get description(): string | undefined {
        return this.getData('description');
    }

    get version(): string | undefined {
        return this.getData('version');
    }

    get averageRating(): number | undefined {
        return this.getData('averageRating');
    }

    get downloadCount(): number | undefined {
        return this.getData('downloadCount');
    }

    get downloadUrl(): string | undefined {
        return this.getData('downloadUrl');
    }

    get readmeUrl(): string | undefined {
        const plugin = this.plugin;
        const readmeUrl = plugin && plugin.metadata.model.readmeUrl;
        if (readmeUrl) {
            return new Endpoint({ path: readmeUrl }).getRestUrl().toString();
        }
        return this.data['readmeUrl'];
    }

    get licenseUrl(): string | undefined {
        let licenseUrl = this.data['licenseUrl'];
        if (licenseUrl) {
            return licenseUrl;
        } else {
            const plugin = this.plugin;
            licenseUrl = plugin && plugin.metadata.model.licenseUrl;
            if (licenseUrl) {
                return new Endpoint({ path: licenseUrl }).getRestUrl().toString();
            }
        }
    }

    get repository(): string | undefined {
        return this.getData('repository');
    }

    get license(): string | undefined {
        return this.getData('license');
    }

    get readme(): string | undefined {
        return this.getData('readme');
    }

    get preview(): boolean | undefined {
        return this.getData('preview');
    }

    get verified(): boolean | undefined {
        return this.getData('verified');
    }

    get namespaceAccess(): VSXExtensionNamespaceAccess | undefined {
        return this.getData('namespaceAccess');
    }

    get publishedBy(): VSXUser | undefined {
        return this.getData('publishedBy');
    }

    get tooltip(): string {
        let md = `__${this.displayName}__ ${VSXExtension.formatVersion(this.version)}\n\n${this.description}\n_____\n\n${nls.localizeByDefault('Publisher: {0}', this.publisher)}`;

        if (this.license) {
            md += `  \r${nls.localize('theia/vsx-registry/license', 'License: {0}', this.license)}`;
        }

        if (this.downloadCount) {
            md += `  \r${nls.localize('theia/vsx-registry/downloadCount', 'Download count: {0}', downloadCompactFormatter.format(this.downloadCount))}`;
        }

        if (this.averageRating) {
            md += `  \r${getAverageRatingTitle(this.averageRating)}`;
        }

        return md;
    }

    protected _busy = 0;
    get busy(): boolean {
        return !!this._busy;
    }

    async install(options?: PluginDeployOptions): Promise<void> {
        if (!this.verified) {
            const choice = await new ConfirmDialog({
                title: nls.localize('theia/vsx-registry/confirmDialogTitle', 'Are you sure you want to proceed with the installation?'),
                msg: nls.localize('theia/vsx-registry/confirmDialogMessage', 'The extension "{0}" is unverified and might pose a security risk.', this.displayName)
            }).open();
            if (choice) {
                this.doInstall(options);
            }
        } else {
            this.doInstall(options);
        }
    }

    async uninstall(): Promise<void> {
        this._busy++;
        try {
            const { plugin } = this;
            if (plugin) {
                await this.progressService.withProgress(
                    nls.localizeByDefault('Uninstalling {0}...', this.id), 'extensions',
                    () => this.pluginServer.uninstall(PluginIdentifiers.componentsToVersionedId(plugin.metadata.model))
                );
            }
        } finally {
            this._busy--;
        }
    }

    protected async doInstall(options?: PluginDeployOptions): Promise<void> {
        this._busy++;
        try {
            await this.progressService.withProgress(nls.localizeByDefault("Installing extension '{0}' v{1}...", this.id, this.version ?? 0), 'extensions', () =>
                this.pluginServer.deploy(this.uri.toString(), undefined, options)
            );
        } finally {
            this._busy--;
        }
    }

    handleContextMenu(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
        e.preventDefault();
        this.contextMenuRenderer.render({
            menuPath: EXTENSIONS_CONTEXT_MENU,
            anchor: {
                x: e.clientX,
                y: e.clientY,
            },
            args: [this],
            context: e.currentTarget
        });
    }

    /**
     * Get the registry link for the given extension.
     * @param path the url path.
     * @returns the registry link for the given extension at the path.
     */
    async getRegistryLink(path = ''): Promise<URI> {
        const registryUri = new URI(await this.registryUri);
        if (this.downloadUrl) {
            const downloadUri = new URI(this.downloadUrl);
            if (downloadUri.authority !== registryUri.authority) {
                throw new Error('cannot generate a valid URL');
            }
        }
        return registryUri.resolve('extension/' + this.id.replace('.', '/')).resolve(path);
    }

    async serialize(): Promise<string> {
        const serializedExtension: string[] = [];
        serializedExtension.push(`Name: ${this.displayName}`);
        serializedExtension.push(`Id: ${this.id}`);
        serializedExtension.push(`Description: ${this.description}`);
        serializedExtension.push(`Version: ${this.version}`);
        serializedExtension.push(`Publisher: ${this.publisher}`);
        if (this.downloadUrl !== undefined) {
            const registryLink = await this.getRegistryLink();
            serializedExtension.push(`Open VSX Link: ${registryLink.toString()}`);
        };
        return serializedExtension.join('\n');
    }

    async open(options: OpenerOptions = { mode: 'reveal' }): Promise<void> {
        await this.doOpen(this.uri, options);
    }

    async doOpen(uri: URI, options?: OpenerOptions): Promise<void> {
        await open(this.openerService, uri, options);
    }

    render(host: TreeWidget): React.ReactNode {
        return <VSXExtensionComponent extension={this} host={host} hoverService={this.hoverService} />;
    }
}

export abstract class AbstractVSXExtensionComponent<Props extends AbstractVSXExtensionComponent.Props = AbstractVSXExtensionComponent.Props> extends React.Component<Props> {

    readonly install = async (event?: React.MouseEvent) => {
        event?.stopPropagation();
        this.forceUpdate();
        try {
            const pending = this.props.extension.install();
            this.forceUpdate();
            await pending;
        } finally {
            this.forceUpdate();
        }
    };

    readonly uninstall = async (event?: React.MouseEvent) => {
        event?.stopPropagation();
        try {
            const pending = this.props.extension.uninstall();
            this.forceUpdate();
            await pending;
        } finally {
            this.forceUpdate();
        }
    };

    readonly reloadWindow = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        this.props.extension.reloadWindow();
    };

    protected readonly manage = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.extension.handleContextMenu(e);
    };

    protected renderAction(host?: TreeWidget): React.ReactNode {
        const { builtin, busy, plugin } = this.props.extension;
        const isFocused = (host?.model.getFocusedNode() as TreeElementNode)?.element === this.props.extension;
        const tabIndex = (!host || isFocused) ? 0 : undefined;
        const installed = !!plugin;
        const outOfSynch = plugin?.metadata.outOfSync;
        if (builtin) {
            return <div className="codicon codicon-settings-gear action" tabIndex={tabIndex} onClick={this.manage}></div>;
        }
        if (busy) {
            if (installed) {
                return <button className="theia-button action theia-mod-disabled">{nls.localizeByDefault('Uninstalling')}</button>;
            }
            return <button className="theia-button action prominent theia-mod-disabled">{nls.localizeByDefault('Installing')}</button>;
        }
        if (installed) {
            return <div>
                {
                    outOfSynch
                        ? <button className="theia-button action" onClick={this.reloadWindow}>{nls.localizeByDefault('Reload Window')}</button>
                        : <button className="theia-button action" onClick={this.uninstall}>{nls.localizeByDefault('Uninstall')}</button>
                }

                <div className="codicon codicon-settings-gear action" onClick={this.manage}></div>
            </div>;
        }
        return <button className="theia-button prominent action" onClick={this.install}>{nls.localizeByDefault('Install')}</button>;
    }

}
export namespace AbstractVSXExtensionComponent {
    export interface Props {
        extension: VSXExtension;
    }
}

const downloadFormatter = new Intl.NumberFormat();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const downloadCompactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' } as any);
const averageRatingFormatter = (averageRating: number): number => Math.round(averageRating * 2) / 2;
const getAverageRatingTitle = (averageRating: number): string =>
    nls.localizeByDefault('Average rating: {0} out of 5', averageRatingFormatter(averageRating));

export namespace VSXExtensionComponent {
    export interface Props extends AbstractVSXExtensionComponent.Props {
        host: TreeWidget;
        hoverService: HoverService;
    }
}

export class VSXExtensionComponent<Props extends VSXExtensionComponent.Props = VSXExtensionComponent.Props> extends AbstractVSXExtensionComponent<Props> {
    override render(): React.ReactNode {
        const { iconUrl, publisher, displayName, description, version, downloadCount, averageRating, tooltip, verified } = this.props.extension;

        return <div
            className='theia-vsx-extension noselect'
            onMouseEnter={event => {
                this.props.hoverService.requestHover({
                    content: new MarkdownStringImpl(tooltip),
                    target: event.currentTarget,
                    position: 'right'
                });
            }}
            onMouseUp={event => {
                if (event.button === 2) {
                    this.manage(event);
                }
            }}
        >
            {iconUrl ?
                <img className='theia-vsx-extension-icon' src={iconUrl} /> :
                <div className='theia-vsx-extension-icon placeholder' />}
            <div className='theia-vsx-extension-content'>
                <div className='title'>
                    <div className='noWrapInfo'>
                        <span className='name'>{displayName}</span> <span className='version'>{VSXExtension.formatVersion(version)}</span>
                    </div>
                    <div className='stat'>
                        {!!downloadCount && <span className='download-count'><i className={codicon('cloud-download')} />{downloadCompactFormatter.format(downloadCount)}</span>}
                        {!!averageRating && <span className='average-rating'><i className={codicon('star-full')} />{averageRatingFormatter(averageRating)}</span>}
                    </div>
                </div>
                <div className='noWrapInfo theia-vsx-extension-description'>{description}</div>
                <div className='theia-vsx-extension-action-bar'>
                    <div className='theia-vsx-extension-publisher-container'>
                        {verified === true ? (
                            <i className={codicon('verified-filled')} />
                        ) : verified === false ? (
                            <i className={codicon('verified')} />
                        ) : (
                            <i className={codicon('question')} />
                        )}
                        <span className='noWrapInfo theia-vsx-extension-publisher'>{publisher}</span>
                    </div>
                    {this.renderAction(this.props.host)}
                </div>
            </div>
        </div >;
    }
}

export class VSXExtensionEditorComponent extends AbstractVSXExtensionComponent {
    protected header: HTMLElement | undefined;
    protected body: HTMLElement | undefined;
    protected _scrollContainer: HTMLElement | undefined;

    get scrollContainer(): HTMLElement | undefined {
        return this._scrollContainer;
    }

    override render(): React.ReactNode {
        const {
            builtin, preview, id, iconUrl, publisher, displayName, description, version,
            averageRating, downloadCount, repository, license, readme
        } = this.props.extension;

        const sanitizedReadme = !!readme ? DOMPurify.sanitize(readme) : undefined;

        return <React.Fragment>
            <div className='header' ref={ref => this.header = (ref || undefined)}>
                {iconUrl ?
                    <img className='icon-container' src={iconUrl} /> :
                    <div className='icon-container placeholder' />}
                <div className='details'>
                    <div className='title'>
                        <span title='Extension name' className='name' onClick={this.openExtension}>{displayName}</span>
                        <span title='Extension identifier' className='identifier'>{id}</span>
                        {preview && <span className='preview'>Preview</span>}
                        {builtin && <span className='builtin'>Built-in</span>}
                    </div>
                    <div className='subtitle'>
                        <span title='Publisher name' className='publisher' onClick={this.searchPublisher}>
                            {this.renderNamespaceAccess()}
                            {publisher}
                        </span>
                        {!!downloadCount && <span className='download-count' onClick={this.openExtension}>
                            <i className={codicon('cloud-download')} />{downloadFormatter.format(downloadCount)}</span>}
                        {
                            averageRating !== undefined &&
                            <span className='average-rating' title={getAverageRatingTitle(averageRating)} onClick={this.openAverageRating}>{this.renderStars()}</span>
                        }
                        {repository && <span className='repository' onClick={this.openRepository}>Repository</span>}
                        {license && <span className='license' onClick={this.openLicense}>{license}</span>}
                        {version && <span className='version'>{VSXExtension.formatVersion(version)}</span>}
                    </div>
                    <div className='description noWrapInfo'>{description}</div>
                    {this.renderAction()}
                </div>
            </div>
            {
                sanitizedReadme &&
                <div className='scroll-container'
                    ref={ref => this._scrollContainer = (ref || undefined)}>
                    <div className='body'
                        ref={ref => this.body = (ref || undefined)}
                        onClick={this.openLink}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: sanitizedReadme }}
                    />
                </div>
            }
        </React.Fragment >;
    }

    protected renderNamespaceAccess(): React.ReactNode {
        const { publisher, namespaceAccess, publishedBy } = this.props.extension;
        if (namespaceAccess === undefined) {
            return undefined;
        }
        let tooltip = publishedBy ? ` Published by "${publishedBy.loginName}".` : '';
        let icon;
        if (namespaceAccess === 'public') {
            icon = 'globe';
            tooltip = `Everyone can publish to "${publisher}" namespace.` + tooltip;
        } else {
            icon = 'shield';
            tooltip = `Only verified owners can publish to "${publisher}" namespace.` + tooltip;
        }
        return <i className={`${codicon(icon)} namespace-access`} title={tooltip} onClick={this.openPublishedBy} />;
    }

    protected renderStars(): React.ReactNode {
        const rating = this.props.extension.averageRating || 0;

        const renderStarAt = (position: number) => position <= rating ?
            <i className={codicon('star-full')} /> :
            position > rating && position - rating < 1 ?
                <i className={codicon('star-half')} /> :
                <i className={codicon('star-empty')} />;
        return <React.Fragment>
            {renderStarAt(1)}{renderStarAt(2)}{renderStarAt(3)}{renderStarAt(4)}{renderStarAt(5)}
        </React.Fragment>;
    }

    // TODO replace with webview
    readonly openLink = (event: React.MouseEvent) => {
        if (!this.body) {
            return;
        }
        const target = event.nativeEvent.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        let node = target;
        while (node.tagName.toLowerCase() !== 'a') {
            if (node === this.body) {
                return;
            }
            if (!(node.parentElement instanceof HTMLElement)) {
                return;
            }
            node = node.parentElement;
        }
        const href = node.getAttribute('href');
        if (href && !href.startsWith('#')) {
            event.preventDefault();
            this.props.extension.doOpen(new URI(href));
        }
    };

    readonly openExtension = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const extension = this.props.extension;
        const uri = await extension.getRegistryLink();
        extension.doOpen(uri);
    };
    readonly searchPublisher = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const extension = this.props.extension;
        if (extension.publisher) {
            extension.search.query = extension.publisher;
        }
    };
    readonly openPublishedBy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const extension = this.props.extension;
        const homepage = extension.publishedBy && extension.publishedBy.homepage;
        if (homepage) {
            extension.doOpen(new URI(homepage));
        }
    };
    readonly openAverageRating = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const extension = this.props.extension;
        const uri = await extension.getRegistryLink('reviews');
        extension.doOpen(uri);
    };
    readonly openRepository = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const extension = this.props.extension;
        if (extension.repository) {
            extension.doOpen(new URI(extension.repository));
        }
    };
    readonly openLicense = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const extension = this.props.extension;
        const licenseUrl = extension.licenseUrl;
        if (licenseUrl) {
            extension.doOpen(new URI(licenseUrl));
        }
    };
}
