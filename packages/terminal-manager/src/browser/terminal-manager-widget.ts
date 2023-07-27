// *****************************************************************************
// Copyright (C) 2023 Ericsson and others.
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

import { inject, injectable, interfaces, postConstruct } from '@theia/core/shared/inversify';
import {
    ApplicationShell,
    BaseWidget,
    codicon,
    CompositeTreeNode,
    Message,
    Panel,
    PanelLayout,
    SplitLayout,
    SplitPanel,
    SplitPositionHandler,
    StatefulWidget,
    StorageService,
    ViewContainerLayout,
    Widget,
    WidgetManager,
} from '@theia/core/lib/browser';
import { CommandService, Emitter } from '@theia/core';
import { UUID } from '@theia/core/shared/@phosphor/coreutils';
import { TerminalWidget, TerminalWidgetOptions } from '@theia/terminal/lib/browser/base/terminal-widget';
import { TerminalWidgetImpl } from '@theia/terminal/lib/browser/terminal-widget-impl';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { TerminalFrontendContribution } from '@theia/terminal/lib/browser/terminal-frontend-contribution';
import { TerminalManagerPreferences } from './terminal-manager-preferences';
import { TerminalManagerTreeTypes } from './terminal-manager-types';
import { TerminalManagerTreeWidget } from './terminal-manager-tree-widget';

/* eslint-disable max-lines-per-function, @typescript-eslint/no-magic-numbers, @typescript-eslint/ban-types, max-lines, max-depth, max-len */

export namespace TerminalManagerWidgetState {
    export interface BaseLayoutData<ID> {
        id: ID,
        childLayouts: unknown[];
    }
    export interface TerminalWidgetLayoutData {
        widget: TerminalWidget | undefined;
    }

    export interface TerminalGroupLayoutData extends BaseLayoutData<TerminalManagerTreeTypes.GroupId> {
        childLayouts: TerminalWidgetLayoutData[];
        widgetRelativeHeights: number[] | undefined;
    }

    export interface PageLayoutData extends BaseLayoutData<TerminalManagerTreeTypes.PageId> {
        childLayouts: TerminalGroupLayoutData[];
        groupRelativeWidths: number[] | undefined;
    }
    export interface TerminalManagerLayoutData extends BaseLayoutData<'ParentPanel'> {
        childLayouts: PageLayoutData[];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const isLayoutData = (obj: any): obj is LayoutData => typeof obj === 'object' && !!obj && 'type' in obj && obj.type === 'terminal-manager';
    export interface PanelRelativeSizes {
        terminal: number;
        tree: number;
    }
    export interface LayoutData {
        items?: TerminalManagerLayoutData;
        widget: TerminalManagerTreeWidget;
        terminalAndTreeRelativeSizes: PanelRelativeSizes | undefined;
    }

}

@injectable()
export class TerminalManagerWidget extends BaseWidget implements StatefulWidget, ApplicationShell.TrackableWidgetProvider {
    static ID = 'terminal-manager-widget';
    static LABEL = 'Terminal Manager';

    override layout: PanelLayout;
    protected panel: SplitPanel;

    protected pageAndTreeLayout: SplitLayout | undefined;
    protected stateIsSet = false;

    pagePanels = new Map<TerminalManagerTreeTypes.PageId, TerminalManagerTreeTypes.PageSplitPanel>();
    groupPanels = new Map<TerminalManagerTreeTypes.GroupId, TerminalManagerTreeTypes.GroupSplitPanel>();
    terminalWidgets = new Map<TerminalManagerTreeTypes.TerminalKey, TerminalWidget>();

    protected readonly onDidChangeTrackableWidgetsEmitter = new Emitter<Widget[]>();
    readonly onDidChangeTrackableWidgets = this.onDidChangeTrackableWidgetsEmitter.event;

    // serves as an empty container so that different view containers can be swapped out
    protected terminalPanelWrapper = new Panel({
        layout: new PanelLayout(),
    });

    @inject(TerminalFrontendContribution) protected terminalFrontendContribution: TerminalFrontendContribution;
    @inject(TerminalManagerTreeWidget) readonly treeWidget: TerminalManagerTreeWidget;
    @inject(SplitPositionHandler) protected readonly splitPositionHandler: SplitPositionHandler;

    @inject(ApplicationShell) protected readonly shell: ApplicationShell;
    @inject(CommandService) protected readonly commandService: CommandService;
    @inject(TerminalManagerPreferences) protected readonly terminalManagerPreferences: TerminalManagerPreferences;
    @inject(FrontendApplicationStateService) protected readonly applicationStateService: FrontendApplicationStateService;
    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    @inject(StorageService) protected readonly storageService: StorageService;

    static createRestoreError = (
        nodeId: string,
    ): Error => new Error(`Terminal manager widget state could not be restored, mismatch in restored data for ${nodeId}`);

    static createContainer(parent: interfaces.Container): interfaces.Container {
        const child = parent.createChild();
        child.bind(TerminalManagerWidget).toSelf().inSingletonScope();
        return child;
    }

    static createWidget(parent: interfaces.Container): Promise<TerminalManagerWidget> {
        return TerminalManagerWidget.createContainer(parent).getAsync(TerminalManagerWidget);
    }

    @postConstruct()
    protected async init(): Promise<void> {
        this.title.iconClass = codicon('terminal-tmux');
        this.id = TerminalManagerWidget.ID;
        this.title.closable = false;
        this.title.label = TerminalManagerWidget.LABEL;
        this.node.tabIndex = 0;
        await this.terminalManagerPreferences.ready;
        this.registerListeners();
        this.createPageAndTreeLayout();
    }

    async populateLayout(force?: boolean): Promise<void> {
        if (!this.stateIsSet || force) {
            const terminalWidget = await this.createTerminalWidget();
            this.addTerminalPage(terminalWidget);
            this.onDidChangeTrackableWidgetsEmitter.fire(this.getTrackableWidgets());
            this.stateIsSet = true;
        }
    }

    async createTerminalWidget(): Promise<TerminalWidget> {
        const terminalWidget = await this.terminalFrontendContribution.newTerminal({
            // passing 'created' here as a millisecond value rather than the default `new Date().toString()` that Theia uses in
            // its factory (resolves to something like 'Tue Aug 09 2022 13:21:26 GMT-0500 (Central Daylight Time)').
            // The state restoration system relies on identifying terminals by their unique options, using an ms value ensures we don't
            // get a duplication since the original date method is only accurate to within 1s.
            created: new Date().getTime().toString(),
        } as TerminalWidgetOptions);
        terminalWidget.start();
        return terminalWidget;
    }

    protected registerListeners(): void {
        this.toDispose.push(this.treeWidget);
        this.toDispose.push(this.treeWidget.model.onTreeSelectionChanged(changeEvent => this.handleSelectionChange(changeEvent)));

        this.toDispose.push(this.treeWidget.model.onPageAdded(({ pageId }) => this.handlePageAdded(pageId)));
        this.toDispose.push(this.treeWidget.model.onPageDeleted(pageId => this.handlePageDeleted(pageId)));

        this.toDispose.push(this.treeWidget.model.onTerminalGroupAdded(({
            groupId, pageId,
        }) => this.handleTerminalGroupAdded(groupId, pageId)));
        this.toDispose.push(this.treeWidget.model.onTerminalGroupDeleted(groupId => this.handleTerminalGroupDeleted(groupId)));

        this.toDispose.push(this.treeWidget.model.onTerminalAddedToGroup(({
            terminalId, groupId,
        }) => this.handleWidgetAddedToTerminalGroup(terminalId, groupId)));
        this.toDispose.push(this.treeWidget.model.onTerminalDeletedFromGroup(({
            terminalId,
        }) => this.handleTerminalDeleted(terminalId)));
        this.toDispose.push(this.treeWidget.model.onNodeRenamed(() => this.handlePageRenamed()));

        this.toDispose.push(this.shell.onDidChangeActiveWidget(({ newValue }) => this.handleOnDidChangeActiveWidget(newValue)));

        this.toDispose.push(this.terminalManagerPreferences.onPreferenceChanged(() => this.resolveMainLayout()));
    }

    protected handlePageRenamed(): void {
        this.title.label = this.treeWidget.model.getName();
        this.update();
    }

    setPanelSizes({ terminal, tree } = { terminal: .6, tree: .2 } as TerminalManagerWidgetState.PanelRelativeSizes): void {
        const treeViewLocation = this.terminalManagerPreferences.get('terminalManager.treeViewLocation');
        const panelSizes = treeViewLocation === 'left' ? [tree, terminal] : [terminal, tree];
        requestAnimationFrame(() => this.pageAndTreeLayout?.setRelativeSizes(panelSizes));
    }

    getTrackableWidgets(): Widget[] {
        return [this.treeWidget, ...this.terminalWidgets.values()];
    }

    toggleTreeVisibility(): void {
        if (this.treeWidget.isHidden) {
            this.treeWidget.show();
            this.setPanelSizes();
        } else {
            this.treeWidget.hide();
        }
    }

    protected createPageAndTreeLayout(relativeSizes?: TerminalManagerWidgetState.PanelRelativeSizes): void {
        this.layout = new PanelLayout();
        this.pageAndTreeLayout = new SplitLayout({
            renderer: SplitPanel.defaultRenderer,
            orientation: 'horizontal',
            spacing: 2,
        });
        this.panel ??= new SplitPanel({
            layout: this.pageAndTreeLayout,
        });

        this.layout.addWidget(this.panel);
        this.resolveMainLayout(relativeSizes);
        this.update();
    }

    protected resolveMainLayout(relativeSizes?: TerminalManagerWidgetState.PanelRelativeSizes): void {
        if (!this.pageAndTreeLayout) {
            return;
        }
        const treeViewLocation = this.terminalManagerPreferences.get('terminalManager.treeViewLocation');
        const widgetsInDesiredOrder = treeViewLocation === 'left' ? [this.treeWidget, this.terminalPanelWrapper] : [this.terminalPanelWrapper, this.treeWidget];
        widgetsInDesiredOrder.forEach((widget, index) => {
            this.pageAndTreeLayout?.insertWidget(index, widget);
        });
        this.setPanelSizes(relativeSizes);
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.populateLayout();
    }

    addTerminalPage(widget: Widget): void {
        if (widget instanceof TerminalWidgetImpl) {
            const terminalKey = TerminalManagerTreeTypes.generateTerminalKey(widget);
            this.terminalWidgets.set(terminalKey, widget);
            this.onDidChangeTrackableWidgetsEmitter.fire(this.getTrackableWidgets());
            const groupPanel = this.createTerminalGroupPanel();
            groupPanel.addWidget(widget);
            const pagePanel = this.createPagePanel();
            pagePanel.addWidget(groupPanel);
            this.treeWidget.model.addTerminalPage(terminalKey, groupPanel.id, pagePanel.id);
        }
    }

    protected createPagePanel(pageId?: TerminalManagerTreeTypes.PageId): TerminalManagerTreeTypes.PageSplitPanel {
        const newPageLayout = new ViewContainerLayout({
            renderer: SplitPanel.defaultRenderer,
            orientation: 'horizontal',
            spacing: 2,
            headerSize: 0,
            animationDuration: 200,
        }, this.splitPositionHandler);
        const pagePanel = new SplitPanel({
            layout: newPageLayout,
        }) as TerminalManagerTreeTypes.PageSplitPanel;
        const idPrefix = 'page-';
        const uuid = this.generateUUIDAvoidDuplicatesFromStorage(idPrefix);
        pagePanel.node.tabIndex = -1;
        pagePanel.id = pageId ?? `${idPrefix}${uuid}`;
        this.pagePanels.set(pagePanel.id, pagePanel);

        return pagePanel;
    }

    protected generateUUIDAvoidDuplicatesFromStorage(idPrefix: 'group-' | 'page-'): string {
        // highly unlikely there would ever be a duplicate, but just to be safe :)
        let didNotGenerateValidId = true;
        let uuid = '';
        while (didNotGenerateValidId) {
            uuid = UUID.uuid4();
            if (idPrefix === 'group-') {
                didNotGenerateValidId = this.groupPanels.has(`group-${uuid}`);
            } else if (idPrefix === 'page-') {
                didNotGenerateValidId = this.pagePanels.has(`page-${uuid}`);
            }
        }
        return uuid;
    }

    protected handlePageAdded(pageId: TerminalManagerTreeTypes.PageId): void {
        const pagePanel = this.pagePanels.get(pageId);
        if (pagePanel) {
            this.terminalPanelWrapper.addWidget(pagePanel);
            this.update();
        }
    }

    protected handlePageDeleted(pagePanelId: TerminalManagerTreeTypes.PageId): void {
        this.pagePanels.get(pagePanelId)?.dispose();
        this.pagePanels.delete(pagePanelId);
        if (this.pagePanels.size === 0) {
            this.populateLayout(true);
        }
    }

    addTerminalGroupToPage(widget: Widget, pageId: TerminalManagerTreeTypes.PageId): void {
        if (!this.treeWidget) {
            return;
        }
        if (widget instanceof TerminalWidgetImpl) {
            const terminalId = TerminalManagerTreeTypes.generateTerminalKey(widget);
            this.terminalWidgets.set(terminalId, widget);
            this.onDidChangeTrackableWidgetsEmitter.fire(this.getTrackableWidgets());
            const groupPanel = this.createTerminalGroupPanel();
            groupPanel.addWidget(widget);
            this.treeWidget.model.addTerminalGroup(terminalId, groupPanel.id, pageId);
        }
    }

    protected createTerminalGroupPanel(groupId?: TerminalManagerTreeTypes.GroupId): TerminalManagerTreeTypes.GroupSplitPanel {
        const terminalColumnLayout = new ViewContainerLayout({
            renderer: SplitPanel.defaultRenderer,
            orientation: 'vertical',
            spacing: 0,
            headerSize: 0,
            animationDuration: 200,
            alignment: 'end',
        }, this.splitPositionHandler);
        const groupPanel = new SplitPanel({
            layout: terminalColumnLayout,
        }) as TerminalManagerTreeTypes.GroupSplitPanel;
        const idPrefix = 'group-';
        const uuid = this.generateUUIDAvoidDuplicatesFromStorage(idPrefix);
        groupPanel.node.tabIndex = -1;
        groupPanel.id = groupId ?? `${idPrefix}${uuid}`;
        this.groupPanels.set(groupPanel.id, groupPanel);
        return groupPanel;
    }

    protected handleTerminalGroupAdded(
        groupId: TerminalManagerTreeTypes.GroupId,
        pageId: TerminalManagerTreeTypes.PageId,
    ): void {
        if (!this.treeWidget) {
            return;
        }
        const groupPanel = this.groupPanels.get(groupId);
        if (!groupPanel) {
            return;
        }
        const activePage = this.pagePanels.get(pageId);
        if (activePage) {
            activePage.addWidget(groupPanel);
            this.update();
        }
    }

    protected async activateTerminalWidget(terminalKey: TerminalManagerTreeTypes.TerminalKey): Promise<Widget | undefined> {
        const terminalWidgetToActivate = this.terminalWidgets.get(terminalKey)?.id;
        if (terminalWidgetToActivate) {
            const activeWidgetFound = await this.shell.activateWidget(terminalWidgetToActivate);
            return activeWidgetFound;
        }
        return undefined;
    }

    activateWidget(id: string): Widget | undefined {
        const widget = Array.from(this.terminalWidgets.values()).find(terminalWidget => terminalWidget.id === id);
        if (widget instanceof TerminalWidgetImpl) {
            widget.activate();
        }
        return widget;
    }

    protected handleTerminalGroupDeleted(groupPanelId: TerminalManagerTreeTypes.GroupId): void {
        this.groupPanels.get(groupPanelId)?.dispose();
        this.groupPanels.delete(groupPanelId);
    }

    addWidgetToTerminalGroup(widget: Widget, groupId: TerminalManagerTreeTypes.GroupId): void {
        if (widget instanceof TerminalWidgetImpl) {
            const newTerminalId = TerminalManagerTreeTypes.generateTerminalKey(widget);
            this.terminalWidgets.set(newTerminalId, widget);
            this.onDidChangeTrackableWidgetsEmitter.fire(this.getTrackableWidgets());
            this.treeWidget.model.addTerminal(newTerminalId, groupId);
        }
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const activeTerminalId = this.treeWidget.model.activeTerminalNode?.id;
        if (activeTerminalId) {
            const activeTerminalWidget = this.terminalWidgets.get(activeTerminalId);
            if (activeTerminalWidget) {
                return activeTerminalWidget.node.focus();
            }
        }
        return this.node.focus();
    }

    protected handleWidgetAddedToTerminalGroup(terminalKey: TerminalManagerTreeTypes.TerminalKey, groupId: TerminalManagerTreeTypes.GroupId): void {
        const terminalWidget = this.terminalWidgets.get(terminalKey);
        const group = this.groupPanels.get(groupId);
        if (terminalWidget && group) {
            const groupPanel = this.groupPanels.get(groupId);
            groupPanel?.addWidget(terminalWidget);
            this.update();
        }
    }

    protected handleTerminalDeleted(terminalId: TerminalManagerTreeTypes.TerminalKey): void {
        const terminalWidget = this.terminalWidgets.get(terminalId);
        terminalWidget?.dispose();
        this.terminalWidgets.delete(terminalId);
    }

    protected handleOnDidChangeActiveWidget(widget: Widget | null): void {
        if (!(widget instanceof TerminalWidgetImpl)) {
            return;
        }
        const terminalKey = TerminalManagerTreeTypes.generateTerminalKey(widget);
        this.selectTerminalNode(terminalKey);
    }

    protected selectTerminalNode(terminalKey: TerminalManagerTreeTypes.TerminalKey): void {
        const node = this.treeWidget.model.getNode(terminalKey);
        if (node && TerminalManagerTreeTypes.isTerminalNode(node)) {
            this.treeWidget.model.selectNode(node);
        }
    }

    protected handleSelectionChange(changeEvent: TerminalManagerTreeTypes.SelectionChangedEvent): void {
        const { activePageId, activeTerminalId } = changeEvent;
        if (activePageId && activePageId) {
            const pageNode = this.treeWidget.model.getNode(activePageId);
            if (!TerminalManagerTreeTypes.isPageNode(pageNode)) {
                return;
            }
            this.title.label = this.treeWidget.model.getName();
            this.updateViewPage(activePageId);
        }
        if (activeTerminalId && activeTerminalId) {
            this.flashActiveTerminal(activeTerminalId);
        }
        this.update();
    }

    protected flashActiveTerminal(terminalId: TerminalManagerTreeTypes.TerminalKey): void {
        const terminal = this.terminalWidgets.get(terminalId);
        if (terminal) {
            terminal.addClass('attention');
            if (this.shell.activeWidget !== terminal) {
                terminal.activate();
            }
        }
        const FLASH_TIMEOUT = 250;
        setTimeout(() => terminal?.removeClass('attention'), FLASH_TIMEOUT);
    }

    protected updateViewPage(activePageId: TerminalManagerTreeTypes.PageId): void {
        const activePagePanel = this.pagePanels.get(activePageId);
        if (activePagePanel) {
            this.terminalPanelWrapper.widgets
                .forEach(widget => widget !== activePagePanel && widget.hide());
            activePagePanel.show();
            this.update();
        }
    }

    deleteTerminal(terminalId: TerminalManagerTreeTypes.TerminalKey): void {
        this.treeWidget.model.deleteTerminalNode(terminalId);
    }

    deleteGroup(groupId: TerminalManagerTreeTypes.GroupId): void {
        this.treeWidget.model.deleteTerminalGroup(groupId);
    }

    deletePage(pageNode: TerminalManagerTreeTypes.PageId): void {
        this.treeWidget.model.deleteTerminalPage(pageNode);
    }

    toggleRenameTerminal(entityId: TerminalManagerTreeTypes.TerminalManagerValidId): void {
        this.treeWidget.model.toggleRenameTerminal(entityId);
    }

    storeState(): TerminalManagerWidgetState.LayoutData {
        return this.getLayoutData();
    }

    restoreState(oldState: TerminalManagerWidgetState.LayoutData): void {
        const { items, widget, terminalAndTreeRelativeSizes } = oldState;
        if (widget && terminalAndTreeRelativeSizes && items) {
            this.setPanelSizes(terminalAndTreeRelativeSizes);
            try {
                this.restoreLayoutData(items, widget);
            } catch (e) {
                console.error(e);
                this.resetLayout();
                this.populateLayout(true);
            } finally {
                this.stateIsSet = true;
                const { activeTerminalNode } = this.treeWidget.model;
                setTimeout(() => {
                    this.selectTerminalNode(activeTerminalNode?.id ?? Array.from(this.terminalWidgets.keys())[0]);
                });
            }
        }
    }

    protected resetLayout(): void {
        this.pagePanels = new Map();
        this.groupPanels = new Map();
        this.terminalWidgets = new Map();
    }

    protected iterateAndRestoreLayoutTree(pageLayouts: TerminalManagerWidgetState.PageLayoutData[], treeWidget: TerminalManagerTreeWidget): void {
        for (const pageLayout of pageLayouts) {
            const pageId = pageLayout.id;

            const pagePanel = this.createPagePanel(pageId);
            const pageNode = treeWidget.model.getNode(pageId);
            if (!TerminalManagerTreeTypes.isPageNode(pageNode)) {
                throw TerminalManagerWidget.createRestoreError(pageId);
            }
            this.pagePanels.set(pageId, pagePanel);
            this.terminalPanelWrapper.addWidget(pagePanel);
            const { childLayouts: groupLayouts } = pageLayout;
            for (const groupLayout of groupLayouts) {
                const groupId = groupLayout.id;
                const groupPanel = this.createTerminalGroupPanel(groupId);
                const groupNode = treeWidget.model.getNode(groupId);
                if (!TerminalManagerTreeTypes.isGroupNode(groupNode)) {
                    throw TerminalManagerWidget.createRestoreError(groupId);
                }
                this.groupPanels.set(groupId, groupPanel);
                pagePanel.insertWidget(0, groupPanel);
                const { childLayouts: widgetLayouts } = groupLayout;
                for (const widgetLayout of widgetLayouts) {
                    const { widget } = widgetLayout;
                    if (widget instanceof TerminalWidgetImpl) {
                        const widgetId = TerminalManagerTreeTypes.generateTerminalKey(widget);
                        const widgetNode = treeWidget.model.getNode(widgetId);
                        if (!TerminalManagerTreeTypes.isTerminalNode(widgetNode)) {
                            throw TerminalManagerWidget.createRestoreError(widgetId);
                        }
                        this.terminalWidgets.set(widgetId, widget);
                        this.onDidChangeTrackableWidgetsEmitter.fire(this.getTrackableWidgets());
                        groupPanel.addWidget(widget);
                    }
                }
                const { widgetRelativeHeights } = groupLayout;
                if (widgetRelativeHeights) {
                    requestAnimationFrame(() => groupPanel.setRelativeSizes(widgetRelativeHeights));
                }
            }
            const { groupRelativeWidths } = pageLayout;
            if (groupRelativeWidths) {
                requestAnimationFrame(() => pagePanel.setRelativeSizes(groupRelativeWidths));
            }
        }
    }

    restoreLayoutData(items: TerminalManagerWidgetState.TerminalManagerLayoutData, treeWidget: TerminalManagerTreeWidget): void {
        const { childLayouts: pageLayouts } = items;
        Array.from(this.pagePanels.keys()).forEach(pageId => this.deletePage(pageId));
        this.iterateAndRestoreLayoutTree(pageLayouts, treeWidget);
        this.onDidChangeTrackableWidgetsEmitter.fire(this.getTrackableWidgets());
        this.update();
    }

    getLayoutData(): TerminalManagerWidgetState.LayoutData {
        const pageItems: TerminalManagerWidgetState.TerminalManagerLayoutData = { childLayouts: [], id: 'ParentPanel' };
        const treeViewLocation = this.terminalManagerPreferences.get('terminalManager.treeViewLocation');
        let terminalAndTreeRelativeSizes: TerminalManagerWidgetState.PanelRelativeSizes | undefined = undefined;
        const sizeArray = this.pageAndTreeLayout?.relativeSizes();
        if (sizeArray && treeViewLocation === 'right') {
            terminalAndTreeRelativeSizes = { tree: sizeArray[1], terminal: sizeArray[0] };
        } else if (sizeArray && treeViewLocation === 'left') {
            terminalAndTreeRelativeSizes = { tree: sizeArray[0], terminal: sizeArray[1] };
        }
        const fullLayoutData: TerminalManagerWidgetState.LayoutData = {
            widget: this.treeWidget,
            items: pageItems,
            terminalAndTreeRelativeSizes,
        };
        const treeRoot = this.treeWidget.model.root;
        if (treeRoot && CompositeTreeNode.is(treeRoot)) {
            const pageNodes = treeRoot.children;
            for (const pageNode of pageNodes) {
                if (TerminalManagerTreeTypes.isPageNode(pageNode)) {
                    const groupNodes = pageNode.children;
                    const pagePanel = this.pagePanels.get(pageNode.id);
                    const pageLayoutData: TerminalManagerWidgetState.PageLayoutData = {
                        childLayouts: [],
                        id: pageNode.id,
                        groupRelativeWidths: pagePanel?.relativeSizes(),
                    };
                    for (const groupNode of groupNodes) {
                        const groupPanel = this.groupPanels.get(groupNode.id);
                        if (TerminalManagerTreeTypes.isGroupNode(groupNode)) {
                            const groupLayoutData: TerminalManagerWidgetState.TerminalGroupLayoutData = {
                                id: groupNode.id,
                                childLayouts: [],
                                widgetRelativeHeights: groupPanel?.relativeSizes(),
                            };
                            const widgetNodes = groupNode.children;
                            for (const widgetNode of widgetNodes) {
                                if (TerminalManagerTreeTypes.isTerminalNode(widgetNode)) {
                                    const widget = this.terminalWidgets.get(widgetNode.id);
                                    const terminalLayoutData: TerminalManagerWidgetState.TerminalWidgetLayoutData = {
                                        widget,
                                    };
                                    groupLayoutData.childLayouts.push(terminalLayoutData);
                                }
                            }
                            pageLayoutData.childLayouts.unshift(groupLayoutData);
                        }
                    }
                    pageItems.childLayouts.push(pageLayoutData);
                }
            }
        }
        return fullLayoutData;
    }
}
