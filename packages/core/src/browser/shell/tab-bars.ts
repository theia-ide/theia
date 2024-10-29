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

import PerfectScrollbar from 'perfect-scrollbar';
import { TabBar, Title, Widget } from '@phosphor/widgets';
import { VirtualElement, h, VirtualDOM, ElementInlineStyle } from '@phosphor/virtualdom';
import { Disposable, DisposableCollection, MenuPath, notEmpty, SelectionService, CommandService, nls, ArrayUtils } from '../../common';
import { ContextMenuRenderer } from '../context-menu-renderer';
import { Signal, Slot } from '@phosphor/signaling';
import { Message, MessageLoop } from '@phosphor/messaging';
import { ArrayExt } from '@phosphor/algorithm';
import { ElementExt } from '@phosphor/domutils';
import { TabBarToolbarRegistry, TabBarToolbar } from './tab-bar-toolbar';
import { TheiaDockPanel, MAIN_AREA_ID, BOTTOM_AREA_ID } from './theia-dock-panel';
import { WidgetDecoration } from '../widget-decoration';
import { TabBarDecoratorService } from './tab-bar-decorator';
import { IconThemeService } from '../icon-theme-service';
import { BreadcrumbsRenderer, BreadcrumbsRendererFactory } from '../breadcrumbs/breadcrumbs-renderer';
import { NavigatableWidget } from '../navigatable-types';
import { IDragEvent } from '@phosphor/dragdrop';
import { LOCKED_CLASS, PINNED_CLASS } from '../widgets/widget';
import { CorePreferences } from '../core-preferences';
import { HoverService } from '../hover-service';
import { Root, createRoot } from 'react-dom/client';
import { SelectComponent } from '../widgets/select-component';
import { createElement } from 'react';
import { PreviewableWidget } from '../widgets/previewable-widget';
import { EnhancedPreviewWidget } from '../widgets/enhanced-preview-widget';
import { ContextKeyService } from '../context-key-service';

/** The class name added to hidden content nodes, which are required to render vertical side bars. */
const HIDDEN_CONTENT_CLASS = 'theia-TabBar-hidden-content';

/** Menu path for tab bars used throughout the application shell. */
export const SHELL_TABBAR_CONTEXT_MENU: MenuPath = ['shell-tabbar-context-menu'];
export const SHELL_TABBAR_CONTEXT_CLOSE: MenuPath = [...SHELL_TABBAR_CONTEXT_MENU, '0_close'];
export const SHELL_TABBAR_CONTEXT_COPY: MenuPath = [...SHELL_TABBAR_CONTEXT_MENU, '1_copy'];
// Kept here in anticipation of tab pinning behavior implemented in tab-bars.ts
export const SHELL_TABBAR_CONTEXT_PIN: MenuPath = [...SHELL_TABBAR_CONTEXT_MENU, '4_pin'];
export const SHELL_TABBAR_CONTEXT_SPLIT: MenuPath = [...SHELL_TABBAR_CONTEXT_MENU, '5_split'];

export const TabBarRendererFactory = Symbol('TabBarRendererFactory');
export type TabBarRendererFactory = () => TabBarRenderer;

/**
 * Size information of DOM elements used for rendering tabs in side bars.
 */
export interface SizeData {
    width: number;
    height: number;
}

/**
 * Extension of the rendering data used for tabs in side bars of the application shell.
 */
export interface SideBarRenderData extends TabBar.IRenderData<Widget> {
    labelSize?: SizeData;
    iconSize?: SizeData;
    paddingTop?: number;
    paddingBottom?: number;
    visible?: boolean
}

export interface ScrollableRenderData extends TabBar.IRenderData<Widget> {
    tabWidth?: number;
}

/**
 * A tab bar renderer that offers a context menu. In addition, this renderer is able to
 * set an explicit position and size on the icon and label of each tab in a side bar.
 * This is necessary because the elements of side bar tabs are rotated using the CSS
 * `transform` property, disrupting the browser's ability to arrange those elements
 * automatically.
 */
export class TabBarRenderer extends TabBar.Renderer {
    /**
     * The menu path used to render the context menu.
     */
    contextMenuPath?: MenuPath;

    protected readonly toDispose = new DisposableCollection();

    // TODO refactor shell, rendered should only receive props with event handlers
    // events should be handled by clients, like ApplicationShell
    // right now it is mess: (1) client logic belong to renderer, (2) cyclic dependencies between renderers and clients
    constructor(
        protected readonly contextMenuRenderer?: ContextMenuRenderer,
        protected readonly decoratorService?: TabBarDecoratorService,
        protected readonly iconThemeService?: IconThemeService,
        protected readonly selectionService?: SelectionService,
        protected readonly commandService?: CommandService,
        protected readonly corePreferences?: CorePreferences,
        protected readonly hoverService?: HoverService,
        protected readonly contextKeyService?: ContextKeyService,
    ) {
        super();
        if (this.decoratorService) {
            this.toDispose.push(Disposable.create(() => this.resetDecorations()));
            this.toDispose.push(this.decoratorService.onDidChangeDecorations(() => this.resetDecorations()));
        }
        if (this.iconThemeService) {
            this.toDispose.push(this.iconThemeService.onDidChangeCurrent(() => {
                if (this._tabBar) {
                    this._tabBar.update();
                }
            }));
        }
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    protected _tabBar?: TabBar<Widget>;
    protected readonly toDisposeOnTabBar = new DisposableCollection();
    /**
     * A reference to the tab bar is required in order to activate it when a context menu
     * is requested.
     */
    set tabBar(tabBar: TabBar<Widget> | undefined) {
        if (this.toDispose.disposed) {
            throw new Error('disposed');
        }
        if (this._tabBar === tabBar) {
            return;
        }
        this.toDisposeOnTabBar.dispose();
        this.toDispose.push(this.toDisposeOnTabBar);
        this._tabBar = tabBar;
        if (tabBar) {
            const listener: Slot<Widget, TabBar.ITabCloseRequestedArgs<Widget>> = (_, { title }) => this.resetDecorations(title);
            tabBar.tabCloseRequested.connect(listener);
            this.toDisposeOnTabBar.push(Disposable.create(() => tabBar.tabCloseRequested.disconnect(listener)));
        }
        this.resetDecorations();
    }
    get tabBar(): TabBar<Widget> | undefined {
        return this._tabBar;
    }

    /**
     * Render tabs with the default DOM structure, but additionally register a context menu listener.
     * @param {SideBarRenderData} data Data used to render the tab.
     * @param {boolean} isInSidePanel An optional check which determines if the tab is in the side-panel.
     * @param {boolean} isPartOfHiddenTabBar An optional check which determines if the tab is in the hidden horizontal tab bar.
     * @returns {VirtualElement} The virtual element of the rendered tab.
     */
    override renderTab(data: SideBarRenderData, isInSidePanel?: boolean, isPartOfHiddenTabBar?: boolean): VirtualElement {
        const title = data.title;
        const id = this.createTabId(title, isPartOfHiddenTabBar);
        const key = this.createTabKey(data);
        const style = this.createTabStyle(data);
        const className = this.createTabClass(data);
        const dataset = this.createTabDataset(data);
        const closeIconTitle = data.title.className.includes(PINNED_CLASS)
            ? nls.localizeByDefault('Unpin')
            : nls.localizeByDefault('Close');

        const hover = this.tabBar && (this.tabBar.orientation === 'horizontal' && this.corePreferences?.['window.tabbar.enhancedPreview'] === 'classic')
            ? { title: title.caption }
            : {
                onmouseenter: this.handleMouseEnterEvent
            };

        return h.li(
            {
                ...hover,
                key, className, id, style, dataset,
                oncontextmenu: this.handleContextMenuEvent,
                ondblclick: this.handleDblClickEvent,
                onauxclick: (e: MouseEvent) => {
                    // If user closes the tab using mouse wheel, nothing should be pasted to an active editor
                    e.preventDefault();
                }
            },
            h.div(
                { className: 'theia-tab-icon-label' },
                this.renderIcon(data, isInSidePanel),
                this.renderLabel(data, isInSidePanel),
                this.renderTailDecorations(data, isInSidePanel),
                this.renderBadge(data, isInSidePanel),
                this.renderLock(data, isInSidePanel)
            ),
            h.div({
                className: 'p-TabBar-tabCloseIcon action-label',
                title: closeIconTitle,
                onclick: this.handleCloseClickEvent
            })
        );
    }

    override createTabClass(data: SideBarRenderData): string {
        let tabClass = super.createTabClass(data);
        if (!(data.visible ?? true)) {
            tabClass += ' p-mod-invisible';
        }
        return tabClass;
    }

    /**
     * Generate ID for an entry in the tab bar
     * @param {Title<Widget>} title Title of the widget controlled by this tab bar
     * @param {boolean} isPartOfHiddenTabBar Tells us if this entry is part of the hidden horizontal tab bar.
     *      If yes, add a suffix to differentiate it's ID from the entry in the visible tab bar
     * @returns {string} DOM element ID
     */
    createTabId(title: Title<Widget>, isPartOfHiddenTabBar = false): string {
        return 'shell-tab-' + title.owner.id + (isPartOfHiddenTabBar ? '-hidden' : '');
    }

    /**
     * If size information is available for the label and icon, set an explicit height on the tab.
     * The height value also considers padding, which should be derived from CSS settings.
     */
    override createTabStyle(data: SideBarRenderData & ScrollableRenderData): ElementInlineStyle {
        const zIndex = `${data.zIndex}`;
        const labelSize = data.labelSize;
        const iconSize = data.iconSize;
        let height: string | undefined;
        let width: string | undefined;
        if (labelSize || iconSize) {
            const labelHeight = labelSize ? (this.tabBar && this.tabBar.orientation === 'horizontal' ? labelSize.height : labelSize.width) : 0;
            const iconHeight = iconSize ? iconSize.height : 0;
            let paddingTop = data.paddingTop || 0;
            if (labelHeight > 0 && iconHeight > 0) {
                // Leave some extra space between icon and label
                paddingTop = paddingTop * 1.5;
            }
            const paddingBottom = data.paddingBottom || 0;
            height = `${labelHeight + iconHeight + paddingTop + paddingBottom}px`;
        }
        if (data.tabWidth) {
            width = `${data.tabWidth}px`;
        } else {
            width = '';
        }
        return { zIndex, height, minWidth: width, maxWidth: width };
    }

    /**
     * If size information is available for the label, set it as inline style.
     * Tab padding and icon size are also considered in the `top` position.
     * @param {SideBarRenderData} data Data used to render the tab.
     * @param {boolean} isInSidePanel An optional check which determines if the tab is in the side-panel.
     * @returns {VirtualElement} The virtual element of the rendered label.
     */
    override renderLabel(data: SideBarRenderData, isInSidePanel?: boolean): VirtualElement {
        const labelSize = data.labelSize;
        const iconSize = data.iconSize;
        let width: string | undefined;
        let height: string | undefined;
        let top: string | undefined;
        if (labelSize) {
            width = `${labelSize.width}px`;
            height = `${labelSize.height}px`;
        }
        if (data.paddingTop || iconSize) {
            const iconHeight = iconSize ? iconSize.height : 0;
            let paddingTop = data.paddingTop || 0;
            if (iconHeight > 0) {
                // Leave some extra space between icon and label
                paddingTop = paddingTop * 1.5;
            }
            top = `${paddingTop + iconHeight}px`;
        }
        const style: ElementInlineStyle = { width, height, top };
        // No need to check for duplicate labels if the tab is rendered in the side panel (title is not displayed),
        // or if there are less than two files in the tab bar.
        if (isInSidePanel || (this.tabBar && this.tabBar.titles.length < 2)) {
            return h.div({ className: 'p-TabBar-tabLabel', style }, data.title.label);
        }
        const originalToDisplayedMap = this.findDuplicateLabels([...this.tabBar!.titles]);
        const labelDetails: string | undefined = originalToDisplayedMap.get(data.title.caption);
        if (labelDetails) {
            return h.div({ className: 'p-TabBar-tabLabelWrapper' },
                h.div({ className: 'p-TabBar-tabLabel', style }, data.title.label),
                h.div({ className: 'p-TabBar-tabLabelDetails', style }, labelDetails));
        }
        return h.div({ className: 'p-TabBar-tabLabel', style }, data.title.label);
    }

    protected renderTailDecorations(renderData: SideBarRenderData, isInSidePanel?: boolean): VirtualElement[] {
        if (!this.corePreferences?.get('workbench.editor.decorations.badges')) {
            return [];
        }
        const tailDecorations = ArrayUtils.coalesce(this.getDecorationData(renderData.title, 'tailDecorations')).flat();
        if (tailDecorations === undefined || tailDecorations.length === 0) {
            return [];
        }
        let dotDecoration: WidgetDecoration.TailDecoration.AnyPartial | undefined;
        const otherDecorations: WidgetDecoration.TailDecoration.AnyPartial[] = [];
        tailDecorations.reverse().forEach(decoration => {
            const partial = decoration as WidgetDecoration.TailDecoration.AnyPartial;
            if (WidgetDecoration.TailDecoration.isDotDecoration(partial)) {
                dotDecoration ||= partial;
            } else if (partial.data || partial.icon || partial.iconClass) {
                otherDecorations.push(partial);
            }
        });
        const decorationsToRender = dotDecoration ? [dotDecoration, ...otherDecorations] : otherDecorations;
        return decorationsToRender.map((decoration, index) => {
            const { tooltip, data, fontData, color, icon, iconClass } = decoration;
            const iconToRender = icon ?? iconClass;
            const className = ['p-TabBar-tail', 'flex'].join(' ');
            const style = fontData ? fontData : color ? { color } : undefined;
            const content = (data ? data : iconToRender
                ? h.span({ className: this.getIconClass(iconToRender, iconToRender === 'circle' ? [WidgetDecoration.Styles.DECORATOR_SIZE_CLASS] : []) })
                : '') + (index !== decorationsToRender.length - 1 ? ',' : '');
            return h.span({ key: ('tailDecoration_' + index), className, style, title: tooltip ?? content }, content);
        });
    }

    renderBadge(data: SideBarRenderData, isInSidePanel?: boolean): VirtualElement {
        const totalBadge = this.getDecorationData(data.title, 'badge').reduce((sum, badge) => sum! + badge!, 0);
        if (!totalBadge) {
            return h.div({});
        }
        const limitedBadge = totalBadge >= 100 ? '99+' : totalBadge;
        return isInSidePanel
            ? h.div({ className: 'theia-badge-decorator-sidebar' }, `${limitedBadge}`)
            : h.div({ className: 'theia-badge-decorator-horizontal' }, `${limitedBadge}`);
    }

    renderLock(data: SideBarRenderData, isInSidePanel?: boolean): VirtualElement {
        return !isInSidePanel && data.title.className.includes(LOCKED_CLASS)
            ? h.div({ className: 'p-TabBar-tabLock' })
            : h.div({});
    }

    protected readonly decorations = new Map<Title<Widget>, WidgetDecoration.Data[]>();

    protected resetDecorations(title?: Title<Widget>): void {
        if (title) {
            this.decorations.delete(title);
        } else {
            this.decorations.clear();
        }
        if (this.tabBar) {
            this.tabBar.update();
        }
    }

    /**
     * Get all available decorations of a given tab.
     * @param {string} title The widget title.
     */
    protected getDecorations(title: Title<Widget>): WidgetDecoration.Data[] {
        if (this.tabBar && this.decoratorService) {
            const owner: { resetTabBarDecorations?: () => void; } & Widget = title.owner;
            if (!owner.resetTabBarDecorations) {
                owner.resetTabBarDecorations = () => this.decorations.delete(title);
                title.owner.disposed.connect(owner.resetTabBarDecorations);
            }

            const decorations = this.decorations.get(title) || this.decoratorService.getDecorations(title);
            this.decorations.set(title, decorations);
            return decorations;
        }
        return [];
    }

    /**
     * Get the decoration data given the tab URI and the decoration data type.
     * @param {string} title The title.
     * @param {K} key The type of the decoration data.
     */
    protected getDecorationData<K extends keyof WidgetDecoration.Data>(title: Title<Widget>, key: K): WidgetDecoration.Data[K][] {
        return this.getDecorations(title).filter(data => data[key] !== undefined).map(data => data[key]);
    }

    /**
     * Get the class of an icon.
     * @param {string | string[]} iconName The name of the icon.
     * @param {string[]} additionalClasses Additional classes of the icon.
     */
    protected getIconClass(iconName: string | string[], additionalClasses: string[] = []): string {
        const iconClass = (typeof iconName === 'string') ? ['a', 'fa', `fa-${iconName}`] : ['a'].concat(iconName);
        return iconClass.concat(additionalClasses).join(' ');
    }

    /**
     * Find duplicate labels from the currently opened tabs in the tab bar.
     * Return the appropriate partial paths that can distinguish the identical labels.
     *
     * E.g., a/p/index.ts => a/..., b/p/index.ts => b/...
     *
     * To prevent excessively long path displayed, show at maximum three levels from the end by default.
     * @param {Title<Widget>[]} titles Array of titles in the current tab bar.
     * @returns {Map<string, string>} A map from each tab's original path to its displayed partial path.
     */
    findDuplicateLabels(titles: Title<Widget>[]): Map<string, string> {
        // Filter from all tabs to group them by the distinct label (file name).
        // E.g., 'foo.js' => {0 (index) => 'a/b/foo.js', '2 => a/c/foo.js' },
        //       'bar.js' => {1 => 'a/d/bar.js', ...}
        const labelGroups = new Map<string, Map<number, string>>();
        titles.forEach((title, index) => {
            if (!labelGroups.has(title.label)) {
                labelGroups.set(title.label, new Map<number, string>());
            }
            labelGroups.get(title.label)!.set(index, title.caption);
        });

        const originalToDisplayedMap = new Map<string, string>();
        // Parse each group of editors with the same label.
        labelGroups.forEach(labelGroup => {
            // Filter to get groups that have duplicates.
            if (labelGroup.size > 1) {
                const paths: string[][] = [];
                let maxPathLength = 0;
                labelGroup.forEach((pathStr, index) => {
                    const steps = pathStr.split('/');
                    maxPathLength = Math.max(maxPathLength, steps.length);
                    paths[index] = (steps.slice(0, steps.length - 1));
                    // By default, show at maximum three levels from the end.
                    let defaultDisplayedPath = steps.slice(-4, -1).join('/');
                    if (steps.length > 4) {
                        defaultDisplayedPath = '.../' + defaultDisplayedPath;
                    }
                    originalToDisplayedMap.set(pathStr, defaultDisplayedPath);
                });

                // Iterate through the steps of the path from the left to find the step that can distinguish it.
                // E.g., ['root', 'foo', 'c'], ['root', 'bar', 'd'] => 'foo', 'bar'
                let i = 0;
                while (i < maxPathLength - 1) {
                    // Store indexes of all paths that have the identical element in each step.
                    const stepOccurrences = new Map<string, number[]>();
                    // Compare the current step of all paths
                    paths.forEach((path, index) => {
                        const step = path[i];
                        if (path.length > 0) {
                            if (i > path.length - 1) {
                                paths[index] = [];
                            } else if (!stepOccurrences.has(step)) {
                                stepOccurrences.set(step, [index]);
                            } else {
                                stepOccurrences.get(step)!.push(index);
                            }
                        }
                    });
                    // Set the displayed path for each tab.
                    stepOccurrences.forEach((indexArr, displayedPath) => {
                        if (indexArr.length === 1) {
                            const originalPath = labelGroup.get(indexArr[0]);
                            if (originalPath) {
                                const originalElements = originalPath.split('/');
                                const displayedElements = displayedPath.split('/');
                                if (originalElements.slice(-2)[0] !== displayedElements.slice(-1)[0]) {
                                    displayedPath += '/...';
                                }
                                if (originalElements[0] !== displayedElements[0]) {
                                    displayedPath = '.../' + displayedPath;
                                }
                                originalToDisplayedMap.set(originalPath, displayedPath);
                                paths[indexArr[0]] = [];
                            }
                        }
                    });
                    i++;
                }
            }
        });
        return originalToDisplayedMap;
    }

    /**
     * If size information is available for the icon, set it as inline style. Tab padding
     * is also considered in the `top` position.
     * @param {SideBarRenderData} data Data used to render the tab icon.
     * @param {boolean} isInSidePanel An optional check which determines if the tab is in the side-panel.
     */
    override renderIcon(data: SideBarRenderData, isInSidePanel?: boolean): VirtualElement {
        if (!isInSidePanel && this.iconThemeService && this.iconThemeService.current === 'none') {
            return h.div();
        }
        let top: string | undefined;
        if (data.paddingTop) {
            top = `${data.paddingTop || 0}px`;
        }
        const style: ElementInlineStyle = { top };
        const baseClassName = this.createIconClass(data);

        const overlayIcons: VirtualElement[] = [];
        const decorationData = this.getDecorationData(data.title, 'iconOverlay');

        // Check if the tab has decoration markers to be rendered on top.
        if (decorationData.length > 0) {
            const baseIcon: VirtualElement = h.div({ className: baseClassName, style }, data.title.iconLabel);
            const wrapperClassName: string = WidgetDecoration.Styles.ICON_WRAPPER_CLASS;
            const decoratorSizeClassName: string = isInSidePanel ? WidgetDecoration.Styles.DECORATOR_SIDEBAR_SIZE_CLASS : WidgetDecoration.Styles.DECORATOR_SIZE_CLASS;

            decorationData
                .filter(notEmpty)
                .map(overlay => [overlay.position, overlay] as [WidgetDecoration.IconOverlayPosition, WidgetDecoration.IconOverlay | WidgetDecoration.IconClassOverlay])
                .forEach(([position, overlay]) => {
                    const iconAdditionalClasses: string[] = [decoratorSizeClassName, WidgetDecoration.IconOverlayPosition.getStyle(position, isInSidePanel)];
                    const overlayIconStyle = (color?: string) => {
                        if (color === undefined) {
                            return {};
                        }
                        return { color };
                    };
                    // Parse the optional background (if it exists) of the overlay icon.
                    if (overlay.background) {
                        const backgroundIconClassName = this.getIconClass(overlay.background.shape, iconAdditionalClasses);
                        overlayIcons.push(
                            h.div({ key: data.title.label + '-background', className: backgroundIconClassName, style: overlayIconStyle(overlay.background.color) })
                        );
                    }
                    // Parse the overlay icon.
                    const overlayIcon = (overlay as WidgetDecoration.IconOverlay).icon || (overlay as WidgetDecoration.IconClassOverlay).iconClass;
                    const overlayIconClassName = this.getIconClass(overlayIcon, iconAdditionalClasses);
                    overlayIcons.push(
                        h.span({ key: data.title.label, className: overlayIconClassName, style: overlayIconStyle(overlay.color) })
                    );
                });
            return h.div({ className: wrapperClassName, style }, [baseIcon, ...overlayIcons]);
        }
        return h.div({ className: baseClassName, style }, data.title.iconLabel);
    }

    protected renderEnhancedPreview = (title: Title<Widget>) => {
        const hoverBox = document.createElement('div');
        hoverBox.classList.add('theia-horizontal-tabBar-hover-div');
        const labelElement = document.createElement('p');
        labelElement.classList.add('theia-horizontal-tabBar-hover-title');
        labelElement.textContent = title.label;
        hoverBox.append(labelElement);
        const widget = title.owner;
        if (EnhancedPreviewWidget.is(widget)) {
            const enhancedPreviewNode = widget.getEnhancedPreviewNode();
            if (enhancedPreviewNode) {
                hoverBox.appendChild(enhancedPreviewNode);
            }
        } else if (title.caption) {
            const captionElement = document.createElement('p');
            captionElement.classList.add('theia-horizontal-tabBar-hover-caption');
            captionElement.textContent = title.caption;
            hoverBox.appendChild(captionElement);
        }
        return hoverBox;
    };

    protected renderVisualPreview(desiredWidth: number, title: Title<Widget>): HTMLElement | undefined {
        const widget = title.owner;
        // Check that the widget is not currently shown, is a PreviewableWidget and it was already loaded before
        if (this.tabBar && this.tabBar.currentTitle !== title && PreviewableWidget.isPreviewable(widget)) {
            const html = document.getElementById(widget.id);
            if (html) {
                const previewNode: Node | undefined = widget.getPreviewNode();
                if (previewNode) {
                    const clonedNode = previewNode.cloneNode(true);
                    const visualPreviewDiv = document.createElement('div');
                    visualPreviewDiv.classList.add('enhanced-preview-container');
                    // Add the clonedNode and get it from the children to have a HTMLElement instead of a Node
                    visualPreviewDiv.append(clonedNode);
                    const visualPreview = visualPreviewDiv.children.item(visualPreviewDiv.children.length - 1);
                    if (visualPreview instanceof HTMLElement) {
                        visualPreview.classList.remove('p-mod-hidden');
                        visualPreview.classList.add('enhanced-preview');
                        visualPreview.id = `preview:${widget.id}`;

                        // Use the current visible editor as a fallback if not available
                        const height: number = visualPreview.style.height === '' ? this.tabBar.currentTitle!.owner.node.offsetHeight : parseFloat(visualPreview.style.height);
                        const width: number = visualPreview.style.width === '' ? this.tabBar.currentTitle!.owner.node.offsetWidth : parseFloat(visualPreview.style.width);
                        const desiredRatio = 9 / 16;
                        const desiredHeight = desiredWidth * desiredRatio;
                        const ratio = height / width;
                        visualPreviewDiv.style.width = `${desiredWidth}px`;
                        visualPreviewDiv.style.height = `${desiredHeight}px`;

                        // If the view is wider than the desiredRatio scale the width and crop the height. If the view is longer its the other way around.
                        const scale = ratio < desiredRatio ? (desiredHeight / height) : (desiredWidth / width);
                        visualPreview.style.transform = `scale(${scale},${scale})`;
                        visualPreview.style.removeProperty('top');
                        visualPreview.style.removeProperty('left');

                        // Copy canvases (They are cloned empty)
                        const originalCanvases = html.getElementsByTagName('canvas');
                        const previewCanvases = visualPreview.getElementsByTagName('canvas');
                        // If this is not given, something went wrong during the cloning
                        if (originalCanvases.length === previewCanvases.length) {
                            for (let i = 0; i < originalCanvases.length; i++) {
                                previewCanvases[i].getContext('2d')?.drawImage(originalCanvases[i], 0, 0);
                            }
                        }

                        return visualPreviewDiv;
                    }
                }
            }
        }
        return undefined;
    }

    protected handleMouseEnterEvent = (event: MouseEvent) => {
        if (this.tabBar && this.hoverService && event.currentTarget instanceof HTMLElement) {
            const id = event.currentTarget.id;
            const title = this.tabBar.titles.find(t => this.createTabId(t) === id);
            if (title) {
                if (this.tabBar.orientation === 'horizontal') {
                    this.hoverService.requestHover({
                        content: this.renderEnhancedPreview(title),
                        target: event.currentTarget,
                        position: 'bottom',
                        cssClasses: ['extended-tab-preview'],
                        visualPreview: this.corePreferences?.['window.tabbar.enhancedPreview'] === 'visual' ? width => this.renderVisualPreview(width, title) : undefined
                    });
                } else if (title.caption) {
                    this.hoverService.requestHover({
                        content: title.caption,
                        target: event.currentTarget,
                        position: 'right'
                    });
                }
            }
        }
    };

    protected handleContextMenuEvent = (event: MouseEvent) => {
        if (this.contextMenuRenderer && this.contextMenuPath && event.currentTarget instanceof HTMLElement) {
            event.stopPropagation();
            event.preventDefault();
            let widget: Widget | undefined = undefined;
            if (this.tabBar) {
                const titleIndex = Array.from(this.tabBar.contentNode.getElementsByClassName('p-TabBar-tab'))
                    .findIndex(node => node.contains(event.currentTarget as HTMLElement));
                if (titleIndex !== -1) {
                    widget = this.tabBar.titles[titleIndex].owner;
                }
            }

            const oldSelection = this.selectionService?.selection;
            if (widget && this.selectionService) {
                this.selectionService.selection = NavigatableWidget.is(widget) ? { uri: widget.getResourceUri() } : widget;
            }

            const contextKeyServiceOverlay = this.contextKeyService?.createOverlay([['isTerminalTab', widget && 'terminalId' in widget]]);
            this.contextMenuRenderer.render({
                menuPath: this.contextMenuPath!,
                anchor: event,
                args: [event],
                contextKeyService: contextKeyServiceOverlay!,
                // We'd like to wait until the command triggered by the context menu has been run, but this should let it get through the preamble, at least.
                onHide: () => setTimeout(() => { if (this.selectionService) { this.selectionService.selection = oldSelection; } })
            });
        }
    };

    protected handleCloseClickEvent = (event: MouseEvent) => {
        if (this.tabBar && event.currentTarget instanceof HTMLElement) {
            const id = event.currentTarget.parentElement!.id;
            const title = this.tabBar.titles.find(t => this.createTabId(t) === id);
            if (title?.closable === false && title?.className.includes(PINNED_CLASS) && this.commandService) {
                this.commandService.executeCommand('workbench.action.unpinEditor', event);
            }
        }
    };

    protected handleDblClickEvent = (event: MouseEvent) => {
        if (!this.corePreferences?.get('workbench.tab.maximize')) {
            return;
        }
        if (this.tabBar && event.currentTarget instanceof HTMLElement) {
            const id = event.currentTarget.id;
            const title = this.tabBar.titles.find(t => this.createTabId(t) === id);
            const area = title?.owner.parent;
            if (area instanceof TheiaDockPanel && (area.id === BOTTOM_AREA_ID || area.id === MAIN_AREA_ID)) {
                area.toggleMaximized();
            }
        }
    };

}

/**
 * A specialized tab bar for the main and bottom areas.
 */
export class ScrollableTabBar extends TabBar<Widget> {

    protected scrollBar?: PerfectScrollbar;

    protected scrollBarFactory: () => PerfectScrollbar;
    protected pendingReveal?: Promise<void>;
    protected isMouseOver = false;
    protected needsRecompute = false;
    protected tabSize = 0;
    protected _dynamicTabOptions?: ScrollableTabBar.Options;
    protected contentContainer: HTMLElement;
    protected topRow: HTMLElement;

    protected readonly toDispose = new DisposableCollection();
    protected openTabsContainer: HTMLDivElement;
    protected openTabsRoot: Root;

    constructor(options?: TabBar.IOptions<Widget> & PerfectScrollbar.Options, dynamicTabOptions?: ScrollableTabBar.Options) {
        super(options);
        this.scrollBarFactory = () => new PerfectScrollbar(this.scrollbarHost, options);
        this._dynamicTabOptions = dynamicTabOptions;
        this.rewireDOM();
    }

    set dynamicTabOptions(options: ScrollableTabBar.Options | undefined) {
        this._dynamicTabOptions = options;
        this.updateTabs();
    }

    get dynamicTabOptions(): ScrollableTabBar.Options | undefined {
        return this._dynamicTabOptions;
    }

    override dispose(): void {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        this.toDispose.dispose();
    }

    /**
     * Restructures the DOM defined in PhosphorJS.
     *
     * By default the tabs (`li`) are contained in the `this.contentNode` (`ul`) which is wrapped in a `div` (`this.node`).
     * Instead of this structure, we add a container for the `this.contentNode` and for the toolbar.
     * The scrollbar will only work for the `ul` part but it does not affect the toolbar, so it can be on the right hand-side.
     */
    protected rewireDOM(): void {
        const contentNode = this.node.getElementsByClassName(ScrollableTabBar.Styles.TAB_BAR_CONTENT)[0];
        if (!contentNode) {
            throw new Error("'this.node' does not have the content as a direct child with class name 'p-TabBar-content'.");
        }
        this.node.removeChild(contentNode);
        this.contentContainer = document.createElement('div');
        this.contentContainer.classList.add(ScrollableTabBar.Styles.TAB_BAR_CONTENT_CONTAINER);
        this.contentContainer.appendChild(contentNode);

        this.topRow = document.createElement('div');
        this.topRow.classList.add('theia-tabBar-tab-row');
        this.topRow.appendChild(this.contentContainer);

        this.openTabsContainer = document.createElement('div');
        this.openTabsContainer.classList.add('theia-tabBar-open-tabs');
        this.openTabsRoot = createRoot(this.openTabsContainer);
        this.topRow.appendChild(this.openTabsContainer);

        this.node.appendChild(this.topRow);
    }

    protected override onAfterAttach(msg: Message): void {
        if (!this.scrollBar) {
            this.scrollBar = this.scrollBarFactory();
        }
        this.node.addEventListener('mouseenter', () => { this.isMouseOver = true; });
        this.node.addEventListener('mouseleave', () => {
            this.isMouseOver = false;
            if (this.needsRecompute) {
                this.updateTabs();
            }
        });

        super.onAfterAttach(msg);
    }

    protected override onBeforeDetach(msg: Message): void {
        super.onBeforeDetach(msg);
        if (this.scrollBar) {
            this.scrollBar.destroy();
            this.scrollBar = undefined;
        }
    }

    protected override onUpdateRequest(msg: Message): void {
        this.updateTabs();
    }

    protected updateTabs(): void {
        const content = [];
        if (this.dynamicTabOptions) {

            this.openTabsRoot.render(createElement(SelectComponent, {
                options: this.titles,
                onChange: (option, index) => {
                    this.currentIndex = index;
                },
                alignment: 'right'
            }));

            if (this.isMouseOver) {
                this.needsRecompute = true;
            } else {
                this.needsRecompute = false;
                if (this.orientation === 'horizontal') {
                    let availableWidth = this.scrollbarHost.clientWidth;
                    let effectiveWidth = availableWidth;
                    if (!this.openTabsContainer.classList.contains('p-mod-hidden')) {
                        availableWidth += this.openTabsContainer.getBoundingClientRect().width;
                    }
                    if (this.dynamicTabOptions.minimumTabSize * this.titles.length <= availableWidth) {
                        effectiveWidth += this.openTabsContainer.getBoundingClientRect().width;
                        this.openTabsContainer.classList.add('p-mod-hidden');
                    } else {
                        this.openTabsContainer.classList.remove('p-mod-hidden');
                    }
                    this.tabSize = Math.max(Math.min(effectiveWidth / this.titles.length,
                        this.dynamicTabOptions.defaultTabSize), this.dynamicTabOptions.minimumTabSize);
                }
            }
            this.node.classList.add('dynamic-tabs');
        } else {
            this.openTabsContainer.classList.add('p-mod-hidden');
            this.node.classList.remove('dynamic-tabs');
        }
        for (let i = 0, n = this.titles.length; i < n; ++i) {
            const title = this.titles[i];
            const current = title === this.currentTitle;
            const zIndex = current ? n : n - i - 1;
            const renderData: ScrollableRenderData = { title: title, current: current, zIndex: zIndex };
            if (this.dynamicTabOptions && this.orientation === 'horizontal') {
                renderData.tabWidth = this.tabSize;
            }
            content[i] = this.renderer.renderTab(renderData);
        }
        VirtualDOM.render(content, this.contentNode);
        if (this.scrollBar) {
            if (!(this.dynamicTabOptions && this.isMouseOver)) {
                this.scrollBar.update();
            }
        }
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        super.onResize(msg);
        if (this.dynamicTabOptions) {
            this.updateTabs();
        }
        if (this.scrollBar) {
            if (this.currentIndex >= 0) {
                this.revealTab(this.currentIndex);
            }
            this.scrollBar.update();
        }
    }

    /**
     * Reveal the tab with the given index by moving the scroll bar if necessary.
     */
    revealTab(index: number): Promise<void> {
        if (this.pendingReveal) {
            // A reveal has already been scheduled
            return this.pendingReveal;
        }
        const result = new Promise<void>((resolve, reject) => {
            // The tab might not have been created yet, so wait until the next frame
            window.requestAnimationFrame(() => {
                const tab = this.contentNode.children[index] as HTMLElement;
                if (tab && this.isVisible) {
                    const parent = this.scrollbarHost;
                    if (this.orientation === 'horizontal') {
                        const scroll = parent.scrollLeft;
                        const left = tab.offsetLeft;
                        if (scroll > left) {
                            parent.scrollLeft = left;
                        } else {
                            const right = left + tab.clientWidth - parent.clientWidth;
                            if (scroll < right && tab.clientWidth < parent.clientWidth) {
                                parent.scrollLeft = right;
                            }
                        }
                    } else {
                        const scroll = parent.scrollTop;
                        const top = tab.offsetTop;
                        if (scroll > top) {
                            parent.scrollTop = top;
                        } else {
                            const bottom = top + tab.clientHeight - parent.clientHeight;
                            if (scroll < bottom && tab.clientHeight < parent.clientHeight) {
                                parent.scrollTop = bottom;
                            }
                        }
                    }
                }
                if (this.pendingReveal === result) {
                    this.pendingReveal = undefined;
                }
                resolve();
            });
        });
        this.pendingReveal = result;
        return result;
    }

    /**
     * Overrides the `contentNode` property getter in PhosphorJS' TabBar.
     */
    // @ts-expect-error TS2611 `TabBar<T>.contentNode` is declared as `readonly contentNode` but is implemented as a getter.
    get contentNode(): HTMLUListElement {
        return this.tabBarContainer.getElementsByClassName(ToolbarAwareTabBar.Styles.TAB_BAR_CONTENT)[0] as HTMLUListElement;
    }

    /**
     * Overrides the scrollable host from the parent class.
     */
    protected get scrollbarHost(): HTMLElement {
        return this.tabBarContainer;
    }

    protected get tabBarContainer(): HTMLElement {
        return this.node.getElementsByClassName(ToolbarAwareTabBar.Styles.TAB_BAR_CONTENT_CONTAINER)[0] as HTMLElement;
    }
}

export namespace ScrollableTabBar {

    export interface Options {
        minimumTabSize: number;
        defaultTabSize: number;
    }
    export namespace Styles {

        export const TAB_BAR_CONTENT = 'p-TabBar-content';
        export const TAB_BAR_CONTENT_CONTAINER = 'p-TabBar-content-container';

    }
}

/**
 * Specialized scrollable tab-bar which comes with toolbar support.
 * Instead of the following DOM structure.
 *
 * +-------------------------+
 * |[TAB_0][TAB_1][TAB_2][TAB|
 * +-------------Scrollable--+
 *
 * There is a dedicated HTML element for toolbar which does **not** contained in the scrollable element.
 *
 * +-------------------------+-----------------+
 * |[TAB_0][TAB_1][TAB_2][TAB|         Toolbar |
 * +-------------Scrollable--+-Non-Scrollable-+
 *
 */
export class ToolbarAwareTabBar extends ScrollableTabBar {
    protected toolbar: TabBarToolbar | undefined;
    protected breadcrumbsContainer: HTMLElement;
    protected readonly breadcrumbsRenderer: BreadcrumbsRenderer;

    constructor(
        protected readonly tabBarToolbarRegistry: TabBarToolbarRegistry,
        protected readonly tabBarToolbarFactory: () => TabBarToolbar,
        protected readonly breadcrumbsRendererFactory: BreadcrumbsRendererFactory,
        options?: TabBar.IOptions<Widget> & PerfectScrollbar.Options,
        dynamicTabOptions?: ScrollableTabBar.Options
    ) {
        super(options, dynamicTabOptions);
        this.breadcrumbsRenderer = this.breadcrumbsRendererFactory();
        this.addBreadcrumbs();
        this.toolbar = this.tabBarToolbarFactory();
        this.toDispose.push(this.tabBarToolbarRegistry.onDidChange(() => this.update()));
        this.toDispose.push(this.breadcrumbsRenderer);
        this.toDispose.push(this.breadcrumbsRenderer.onDidChangeActiveState(active => {
            this.node.classList.toggle('theia-tabBar-multirow', active);
            if (this.parent) {
                MessageLoop.sendMessage(this.parent, new Message('fit-request'));
            }
        }));
        this.node.classList.toggle('theia-tabBar-multirow', this.breadcrumbsRenderer.active);
        const handler = () => this.updateBreadcrumbs();
        this.currentChanged.connect(handler);
        this.toDispose.push(Disposable.create(() => this.currentChanged.disconnect(handler)));
    }

    protected async updateBreadcrumbs(): Promise<void> {
        const current = this.currentTitle?.owner;
        const uri = NavigatableWidget.is(current) ? current.getResourceUri() : undefined;
        await this.breadcrumbsRenderer.refresh(uri);
    }

    protected override onAfterAttach(msg: Message): void {
        if (this.toolbar) {
            if (this.toolbar.isAttached) {
                Widget.detach(this.toolbar);
            }
            Widget.attach(this.toolbar, this.topRow);
            if (this.breadcrumbsContainer) {
                this.node.appendChild(this.breadcrumbsContainer);
            }
            this.updateBreadcrumbs();
        }
        super.onAfterAttach(msg);
    }

    protected override onBeforeDetach(msg: Message): void {
        if (this.toolbar && this.toolbar.isAttached) {
            this.toolbar.dispose();
        }
        super.onBeforeDetach(msg);
    }

    protected override onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        this.updateToolbar();
    }

    protected updateToolbar(): void {
        if (!this.toolbar) {
            return;
        }
        const widget = this.currentTitle?.owner ?? undefined;
        this.toolbar.updateTarget(widget);
        this.updateTabs();
    }

    override handleEvent(event: Event): void {
        if (event instanceof MouseEvent) {
            if (this.toolbar && this.toolbar.shouldHandleMouseEvent(event) || this.isOver(event, this.openTabsContainer)) {
                // if the mouse event is over the toolbar part don't handle it.
                return;
            }
        }
        super.handleEvent(event);
    }

    protected isOver(event: Event, element: Element): boolean {
        return element && event.target instanceof Element && element.contains(event.target);
    }

    /**
     * Restructures the DOM defined in PhosphorJS.
     *
     * By default the tabs (`li`) are contained in the `this.contentNode` (`ul`) which is wrapped in a `div` (`this.node`).
     * Instead of this structure, we add a container for the `this.contentNode` and for the toolbar.
     * The scrollbar will only work for the `ul` part but it does not affect the toolbar, so it can be on the right hand-side.
     */
    protected addBreadcrumbs(): void {
        this.breadcrumbsContainer = document.createElement('div');
        this.breadcrumbsContainer.classList.add('theia-tabBar-breadcrumb-row');
        this.breadcrumbsContainer.appendChild(this.breadcrumbsRenderer.host);
        this.node.appendChild(this.breadcrumbsContainer);
    }
}

/**
 * A specialized tab bar for side areas.
 */
export class SideTabBar extends ScrollableTabBar {

    protected static readonly DRAG_THRESHOLD = 5;

    /**
     * Emitted when a tab is added to the tab bar.
     */
    readonly tabAdded = new Signal<this, { title: Title<Widget> }>(this);
    /**
     * Side panels can be collapsed by clicking on the currently selected tab. This signal is
     * emitted when the mouse is released on the selected tab without initiating a drag.
     */
    readonly collapseRequested = new Signal<this, Title<Widget>>(this);

    /**
     * Emitted when the set of overflowing/hidden tabs changes.
     */
    readonly tabsOverflowChanged = new Signal<this, { titles: Title<Widget>[], startIndex: number }>(this);

    protected mouseData?: {
        pressX: number,
        pressY: number,
        mouseDownTabIndex: number
    };

    protected tabsOverflowData?: {
        titles: Title<Widget>[],
        startIndex: number
    };

    constructor(options?: TabBar.IOptions<Widget> & PerfectScrollbar.Options) {
        super(options);

        // Create the hidden content node (see `hiddenContentNode` for explanation)
        const hiddenContent = document.createElement('ul');
        hiddenContent.className = HIDDEN_CONTENT_CLASS;
        this.node.appendChild(hiddenContent);
    }

    /**
     * Tab bars of the left and right side panel are arranged vertically by rotating their labels.
     * Rotation is realized with the CSS `transform` property, which disrupts the browser's ability
     * to arrange the involved elements automatically. Therefore the elements are arranged explicitly
     * by the TabBarRenderer using inline `height` and `top` styles. However, the size of labels
     * must still be computed by the browser, so the rendering is performed in two steps: first the
     * tab bar is rendered horizontally inside a _hidden content node_, then it is rendered again
     * vertically inside the proper content node. After the first step, size information is gathered
     * from all labels so it can be applied during the second step.
     */
    get hiddenContentNode(): HTMLUListElement {
        return this.node.getElementsByClassName(HIDDEN_CONTENT_CLASS)[0] as HTMLUListElement;
    }

    override insertTab(index: number, value: Title<Widget> | Title.IOptions<Widget>): Title<Widget> {
        const result = super.insertTab(index, value);
        this.tabAdded.emit({ title: result });
        return result;
    }

    protected override onAfterAttach(msg: Message): void {
        this.updateTabs();
        this.node.addEventListener('p-dragenter', this);
        this.node.addEventListener('p-dragover', this);
        this.node.addEventListener('p-dragleave', this);
        document.addEventListener('p-drop', this);
    }

    protected override onAfterDetach(msg: Message): void {
        super.onAfterDetach(msg);
        this.node.removeEventListener('p-dragenter', this);
        this.node.removeEventListener('p-dragover', this);
        this.node.removeEventListener('p-dragleave', this);
        document.removeEventListener('p-drop', this);
    }

    protected override onUpdateRequest(msg: Message): void {
        this.updateTabs();
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        // Tabs need to be updated if there are already overflowing tabs or the current tabs don't fit
        if (this.tabsOverflowData || this.node.clientHeight < this.contentNode.clientHeight) {
            this.updateTabs();
        }
    }

    /**
     * Reveal the tab with the given index by moving it into the non-overflowing tabBar section
     * if necessary.
     */
    override revealTab(index: number): Promise<void> {
        if (this.pendingReveal) {
            // A reveal has already been scheduled
            return this.pendingReveal;
        }
        const result = new Promise<void>(resolve => {
            // The tab might not have been created yet, so wait until the next frame
            window.requestAnimationFrame(() => {
                if (this.tabsOverflowData && index >= this.tabsOverflowData.startIndex) {
                    const title = this.titles[index];
                    this.insertTab(this.tabsOverflowData.startIndex - 1, title);
                }

                if (this.pendingReveal === result) {
                    this.pendingReveal = undefined;
                }
                resolve();
            });
        });
        this.pendingReveal = result;
        return result;
    }

    /**
     * Render the tab bar in the _hidden content node_ (see `hiddenContentNode` for explanation),
     * then gather size information for labels and render it again in the proper content node.
     */
    protected override updateTabs(): void {
        if (this.isAttached) {
            // Render into the invisible node
            this.renderTabs(this.hiddenContentNode);
            // Await a rendering frame
            window.requestAnimationFrame(() => {
                const hiddenContent = this.hiddenContentNode;
                const n = hiddenContent.children.length;
                const renderData = new Array<Partial<SideBarRenderData>>(n);
                for (let i = 0; i < n; i++) {
                    const hiddenTab = hiddenContent.children[i];
                    // Extract tab padding, and margin from the computed style
                    const tabStyle = window.getComputedStyle(hiddenTab);
                    const rd: Partial<SideBarRenderData> = {
                        paddingTop: parseFloat(tabStyle.paddingTop!),
                        paddingBottom: parseFloat(tabStyle.paddingBottom!)
                    };
                    // Extract label size from the DOM
                    const labelElements = hiddenTab.getElementsByClassName('p-TabBar-tabLabel');
                    if (labelElements.length === 1) {
                        const label = labelElements[0];
                        rd.labelSize = { width: label.clientWidth, height: label.clientHeight };
                    }
                    // Extract icon size from the DOM
                    const iconElements = hiddenTab.getElementsByClassName('p-TabBar-tabIcon');
                    if (iconElements.length === 1) {
                        const icon = iconElements[0];
                        rd.iconSize = { width: icon.clientWidth, height: icon.clientHeight };
                    }

                    renderData[i] = rd;
                }
                // Render into the visible node
                this.renderTabs(this.contentNode, renderData);
                this.computeOverflowingTabsData();
            });
        }
    }

    protected computeOverflowingTabsData(): void {
        // ensure that render tabs has completed
        window.requestAnimationFrame(() => {
            const startIndex = this.hideOverflowingTabs();
            if (startIndex === -1) {
                if (this.tabsOverflowData) {
                    this.tabsOverflowData = undefined;
                    this.tabsOverflowChanged.emit({ titles: [], startIndex });
                }
                return;
            }
            const newOverflowingTabs = this.titles.slice(startIndex);

            if (!this.tabsOverflowData) {
                this.tabsOverflowData = { titles: newOverflowingTabs, startIndex };
                this.tabsOverflowChanged.emit(this.tabsOverflowData);
                return;
            }

            if ((newOverflowingTabs.length !== this.tabsOverflowData?.titles.length ?? 0) ||
                newOverflowingTabs.find((newTitle, i) => newTitle !== this.tabsOverflowData?.titles[i]) !== undefined) {
                this.tabsOverflowData = { titles: newOverflowingTabs, startIndex };
                this.tabsOverflowChanged.emit(this.tabsOverflowData);
            }
        });
    }

    /**
     * Hide overflowing tabs and return the index of the first hidden tab.
     */
    protected hideOverflowingTabs(): number {
        const availableHeight = this.node.clientHeight;
        const invisibleClass = 'p-mod-invisible';
        let startIndex = -1;
        const n = this.contentNode.children.length;
        for (let i = 0; i < n; i++) {
            const tab = this.contentNode.children[i] as HTMLLIElement;
            if (tab.offsetTop + tab.offsetHeight >= availableHeight) {
                tab.classList.add(invisibleClass);
                if (startIndex === -1) {
                    startIndex = i;
                    /* If only one element is overflowing and the additional menu widget is visible (i.e. this.tabsOverflowData is set)
                     * there might already be enough space to show the last tab. In this case, we need to include the size of the
                     * additional menu widget and recheck if the last tab is visible */
                    if (startIndex === n - 1 && this.tabsOverflowData) {
                        const additionalViewsMenu = this.node.parentElement?.querySelector('.theia-additional-views-menu') as HTMLDivElement;
                        if (tab.offsetTop + tab.offsetHeight < availableHeight + additionalViewsMenu.offsetHeight) {
                            tab.classList.remove(invisibleClass);
                            startIndex = -1;
                        }
                    }
                }
            } else {
                tab.classList.remove(invisibleClass);
            }
        }
        return startIndex;
    }

    /**
     * Render the tab bar using the given DOM element as host. The optional `renderData` is forwarded
     * to the TabBarRenderer.
     */
    protected renderTabs(host: HTMLElement, renderData?: Partial<SideBarRenderData>[]): void {
        const titles = this.titles;
        const n = titles.length;
        const renderer = this.renderer as TabBarRenderer;
        const currentTitle = this.currentTitle;
        const content = new Array<VirtualElement>(n);
        for (let i = 0; i < n; i++) {
            const title = titles[i];
            const current = title === currentTitle;
            const zIndex = current ? n : n - i - 1;
            let rd: SideBarRenderData;
            if (renderData && i < renderData.length) {
                rd = { title, current, zIndex, ...renderData[i] };
            } else {
                rd = { title, current, zIndex };
            }
            // Based on how renderTabs() is called, assume renderData will be undefined when invoked for this.hiddenContentNode
            content[i] = renderer.renderTab(rd, true, renderData === undefined);
        }
        VirtualDOM.render(content, host);
    }

    /**
     * The following event processing is used to generate `collapseRequested` signals
     * when the mouse goes up on the currently selected tab without too much movement
     * between `mousedown` and `mouseup`. The movement threshold is the same that
     * is used by the superclass to detect a drag event. The `allowDeselect` option
     * of the TabBar constructor cannot be used here because it is triggered when the
     * mouse goes down, and thus collides with dragging.
     */
    override handleEvent(event: Event): void {
        switch (event.type) {
            case 'mousedown':
                this.onMouseDown(event as MouseEvent);
                super.handleEvent(event);
                break;
            case 'mouseup':
                super.handleEvent(event);
                this.onMouseUp(event as MouseEvent);
                break;
            case 'mousemove':
                this.onMouseMove(event as MouseEvent);
                super.handleEvent(event);
                break;
            case 'p-dragenter':
                this.onDragEnter(event as IDragEvent);
                break;
            case 'p-dragover':
                this.onDragOver(event as IDragEvent);
                break;
            case 'p-dragleave': case 'p-drop':
                this.cancelViewContainerDND();
                break;
            default:
                super.handleEvent(event);
        }
    }

    protected onMouseDown(event: MouseEvent): void {
        // Check for left mouse button and current mouse status
        if (event.button !== 0 || this.mouseData) {
            return;
        }

        // Check whether the mouse went down on the current tab
        const tabs = this.contentNode.children;
        const index = ArrayExt.findFirstIndex(tabs, tab => ElementExt.hitTest(tab, event.clientX, event.clientY));
        if (index < 0 || index !== this.currentIndex) {
            return;
        }

        // Check whether the close button was clicked
        const icon = tabs[index].querySelector(this.renderer.closeIconSelector);
        if (icon && icon.contains(event.target as HTMLElement)) {
            return;
        }

        this.mouseData = {
            pressX: event.clientX,
            pressY: event.clientY,
            mouseDownTabIndex: index
        };
    }

    protected onMouseUp(event: MouseEvent): void {
        // Check for left mouse button and current mouse status
        if (event.button !== 0 || !this.mouseData) {
            return;
        }

        // Check whether the mouse went up on the current tab
        const mouseDownTabIndex = this.mouseData.mouseDownTabIndex;
        this.mouseData = undefined;
        const tabs = this.contentNode.children;
        const index = ArrayExt.findFirstIndex(tabs, tab => ElementExt.hitTest(tab, event.clientX, event.clientY));
        if (index < 0 || index !== mouseDownTabIndex) {
            return;
        }

        // Collapse the side bar
        this.collapseRequested.emit(this.titles[index]);
    }

    protected onMouseMove(event: MouseEvent): void {
        // Check for left mouse button and current mouse status
        if (event.button !== 0 || !this.mouseData) {
            return;
        }

        const data = this.mouseData;
        const dx = Math.abs(event.clientX - data.pressX);
        const dy = Math.abs(event.clientY - data.pressY);
        const threshold = SideTabBar.DRAG_THRESHOLD;
        if (dx >= threshold || dy >= threshold) {
            this.mouseData = undefined;
        }
    }

    toCancelViewContainerDND = new DisposableCollection();
    protected cancelViewContainerDND = () => {
        this.toCancelViewContainerDND.dispose();
    };

    /**
     * Handles `viewContainerPart` drag enter.
     */
    protected onDragEnter = (event: IDragEvent) => {
        this.cancelViewContainerDND();
        if (event.mimeData.getData('application/vnd.phosphor.view-container-factory')) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    /**
     * Handle `viewContainerPart` drag over,
     * Defines the appropriate `dropAction` and opens the tab on which the mouse stands on for more than 800 ms.
     */
    protected onDragOver = (event: IDragEvent) => {
        const factory = event.mimeData.getData('application/vnd.phosphor.view-container-factory');
        const widget = factory && factory();
        if (!widget) {
            event.dropAction = 'none';
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (!this.toCancelViewContainerDND.disposed) {
            event.dropAction = event.proposedAction;
            return;
        }

        const { target, clientX, clientY } = event;
        if (target instanceof HTMLElement) {
            if (widget.options.disableDraggingToOtherContainers || widget.viewContainer.disableDNDBetweenContainers) {
                event.dropAction = 'none';
                target.classList.add('theia-cursor-no-drop');
                this.toCancelViewContainerDND.push(Disposable.create(() => {
                    target.classList.remove('theia-cursor-no-drop');
                }));
            } else {
                event.dropAction = event.proposedAction;
            }
            const { top, bottom, left, right, height } = target.getBoundingClientRect();
            const mouseOnTop = (clientY - top) < (height / 2);
            const dropTargetClass = `drop-target-${mouseOnTop ? 'top' : 'bottom'}`;
            const tabs = this.contentNode.children;
            const targetTab = ArrayExt.findFirstValue(tabs, t => ElementExt.hitTest(t, clientX, clientY));
            if (!targetTab) {
                return;
            }
            targetTab.classList.add(dropTargetClass);
            this.toCancelViewContainerDND.push(Disposable.create(() => {
                if (targetTab) {
                    targetTab.classList.remove(dropTargetClass);
                }
            }));
            const openTabTimer = setTimeout(() => {
                const title = this.titles.find(t => (this.renderer as TabBarRenderer).createTabId(t) === targetTab.id);
                if (title) {
                    const mouseStillOnTab = clientX >= left && clientX <= right && clientY >= top && clientY <= bottom;
                    if (mouseStillOnTab) {
                        this.currentTitle = title;
                    }
                }
            }, 800);
            this.toCancelViewContainerDND.push(Disposable.create(() => {
                clearTimeout(openTabTimer);
            }));
        }
    };

}
