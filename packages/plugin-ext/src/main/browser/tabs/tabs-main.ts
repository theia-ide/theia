// *****************************************************************************
// Copyright (C) 2022 TypeFox and others.
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

import { interfaces } from '@theia/core/shared/inversify';
import { ApplicationShell, PINNED_CLASS, Saveable, TabBar, Title, ViewContainer, Widget } from '@theia/core/lib/browser';
import { AnyInputDto, MAIN_RPC_CONTEXT, TabDto, TabGroupDto, TabInputKind, TabModelOperationKind, TabsExt, TabsMain } from '../../../common/plugin-api-rpc';
import { RPCProtocol } from '../../../common/rpc-protocol';
import { EditorPreviewWidget } from '@theia/editor-preview/lib/browser/editor-preview-widget';
import { Disposable } from '@theia/core/shared/vscode-languageserver-protocol';
import { MonacoDiffEditor } from '@theia/monaco/lib/browser/monaco-diff-editor';
import { toUriComponents } from '../hierarchy/hierarchy-types-converters';
import { TerminalWidget } from '@theia/terminal/lib/browser/base/terminal-widget';
import { DisposableCollection } from '@theia/core';
import { NotebookEditorWidget } from '@theia/notebook/lib/browser';
import { Deferred } from '@theia/core/lib/common/promise-util';

interface TabInfo {
    tab: TabDto;
    tabIndex: number;
    group: TabGroupDto;
}

export class TabsMainImpl implements TabsMain, Disposable {

    private readonly proxy: TabsExt;
    private tabGroupModel = new Map<TabBar<Widget>, TabGroupDto>();
    private tabInfoLookup = new Map<Title<Widget>, TabInfo>();
    private waitQueue = new Map<Widget, Deferred>();

    private applicationShell: ApplicationShell;

    private disposableTabBarListeners: DisposableCollection = new DisposableCollection();
    private disposableTitleListeners: Map<string, DisposableCollection> = new Map();
    private toDisposeOnDestroy: DisposableCollection = new DisposableCollection();

    private groupIdCounter = 1;
    private currentActiveGroup: TabGroupDto;

    private tabGroupChanged: boolean = false;

    private readonly defaultTabGroup: TabGroupDto = {
        groupId: 0,
        tabs: [],
        isActive: true,
        viewColumn: 0
    };

    constructor(
        rpc: RPCProtocol,
        container: interfaces.Container
    ) {
        this.proxy = rpc.getProxy(MAIN_RPC_CONTEXT.TABS_EXT);

        this.applicationShell = container.get(ApplicationShell);
        this.createTabsModel();

        const tabBars = this.applicationShell.mainPanel.tabBars();
        for (const tabBar of tabBars) {
            this.attachListenersToTabBar(tabBar);
        }

        this.toDisposeOnDestroy.push(
            this.applicationShell.mainPanelRenderer.onDidCreateTabBar(tabBar => {
                this.attachListenersToTabBar(tabBar);
                this.onTabGroupCreated(tabBar);
            })
        );

        this.connectToSignal(this.toDisposeOnDestroy, this.applicationShell.mainPanel.widgetAdded, (mainPanel, widget) => {
            if (this.tabGroupChanged || this.tabGroupModel.size === 0) {
                this.tabGroupChanged = false;
                this.createTabsModel();
                // tab Open event is done in backend
            } else {
                const tabBar = mainPanel.findTabBar(widget.title)!;
                const oldTabInfo = this.tabInfoLookup.get(widget.title);
                const group = this.tabGroupModel.get(tabBar);
                if (group !== oldTabInfo?.group) {
                    if (oldTabInfo) {
                        this.onTabClosed(oldTabInfo, widget.title);
                    }

                    this.onTabCreated(tabBar, { index: tabBar.titles.indexOf(widget.title), title: widget.title });
                }
            }
        });

        this.connectToSignal(this.toDisposeOnDestroy, this.applicationShell.mainPanel.widgetRemoved, (mainPanel, widget) => {
            if (!(widget instanceof TabBar)) {
                const tabInfo = this.getOrRebuildModel(this.tabInfoLookup, widget.title)!;
                this.onTabClosed(tabInfo, widget.title);
                if (this.tabGroupChanged) {
                    this.tabGroupChanged = false;
                    this.createTabsModel();
                }
            }
        });
    }

    waitForWidget(widget: Widget): Promise<void> {
        const deferred = new Deferred<void>();
        this.waitQueue.set(widget, deferred);

        const timeout = setTimeout(() => {
            deferred.resolve(); // resolve to unblock the event
        }, 1000);

        deferred.promise.then(() => {
            clearTimeout(timeout);
        });

        return deferred.promise;
    }

    protected createTabsModel(): void {
        if (this.applicationShell.mainAreaTabBars.length === 0) {
            this.proxy.$acceptEditorTabModel([this.defaultTabGroup]);
            return;
        }
        const newTabGroupModel = new Map<TabBar<Widget>, TabGroupDto>();
        this.tabInfoLookup.clear();
        this.disposableTitleListeners.forEach(disposable => disposable.dispose());
        this.disposableTabBarListeners.dispose();
        this.applicationShell.mainAreaTabBars
            .forEach(tabBar => {
                this.attachListenersToTabBar(tabBar);
                const groupDto = this.createTabGroupDto(tabBar);
                tabBar.titles.forEach((title, index) => this.tabInfoLookup.set(title, { group: groupDto, tab: groupDto.tabs[index], tabIndex: index }));
                newTabGroupModel.set(tabBar, groupDto);
            });
        if (newTabGroupModel.size > 0 && Array.from(newTabGroupModel.values()).indexOf(this.currentActiveGroup) < 0) {
            this.currentActiveGroup = this.tabInfoLookup.get(this.applicationShell.mainPanel.currentTitle!)?.group ?? newTabGroupModel.values().next().value;
            this.currentActiveGroup.isActive = true;
        }
        this.tabGroupModel = newTabGroupModel;
        this.proxy.$acceptEditorTabModel(Array.from(this.tabGroupModel.values()));
        // Resolve all waiting widget promises
        this.waitQueue.forEach(deferred => deferred.resolve());
        this.waitQueue.clear();
    }

    protected createTabDto(tabTitle: Title<Widget>, groupId: number, newTab = false): TabDto {
        const widget = tabTitle.owner;
        const active = newTab || this.getTabBar(tabTitle)?.currentTitle === tabTitle;
        return {
            id: this.createTabId(tabTitle, groupId),
            label: tabTitle.label,
            input: this.evaluateTabDtoInput(widget),
            isActive: active,
            isPinned: tabTitle.className.includes(PINNED_CLASS),
            isDirty: Saveable.isDirty(widget),
            isPreview: widget instanceof EditorPreviewWidget && widget.isPreview
        };
    }

    protected getTabBar(tabTitle: Title<Widget>): TabBar<Widget> | undefined {
        return this.applicationShell.mainPanel.findTabBar(tabTitle);
    }

    protected createTabId(tabTitle: Title<Widget>, groupId: number): string {
        return `${groupId}~${tabTitle.owner.id}`;
    }

    protected createTabGroupDto(tabBar: TabBar<Widget>): TabGroupDto {
        const oldDto = this.tabGroupModel.get(tabBar);
        const groupId = oldDto?.groupId ?? this.groupIdCounter++;
        const tabs = tabBar.titles.map(title => this.createTabDto(title, groupId));
        const viewColumn = 0; // TODO: Implement correct viewColumn handling
        return {
            groupId,
            tabs,
            isActive: false,
            viewColumn
        };
    }

    protected getTitleDisposables(title: Title<Widget>): DisposableCollection {
        let disposable = this.disposableTitleListeners.get(title.owner.id);
        if (!disposable) {
            disposable = new DisposableCollection();
            this.disposableTitleListeners.set(title.owner.id, disposable);
        }
        return disposable;
    }

    protected attachListenersToTabBar(tabBar: TabBar<Widget> | undefined): void {
        if (!tabBar) {
            return;
        }
        tabBar.titles.forEach(title => {
            this.connectToSignal(this.getTitleDisposables(title), title.changed, this.onTabTitleChanged);
        });

        this.connectToSignal(this.disposableTabBarListeners, tabBar.tabMoved, this.onTabMoved);
        this.connectToSignal(this.disposableTabBarListeners, tabBar.disposed, this.onTabGroupClosed);
    }

    protected evaluateTabDtoInput(widget: Widget): AnyInputDto {
        if (widget instanceof EditorPreviewWidget) {
            if (widget.editor instanceof MonacoDiffEditor) {
                return {
                    kind: TabInputKind.TextDiffInput,
                    original: toUriComponents(widget.editor.originalModel.uri),
                    modified: toUriComponents(widget.editor.modifiedModel.uri)
                };
            } else {
                return {
                    kind: TabInputKind.TextInput,
                    uri: toUriComponents(widget.editor.uri.toString())
                };
            }
        } else if (widget instanceof ViewContainer) {
            return {
                kind: TabInputKind.WebviewEditorInput,
                viewType: widget.id
            };
        } else if (widget instanceof TerminalWidget) {
            return {
                kind: TabInputKind.TerminalEditorInput
            };
        } else if (widget instanceof NotebookEditorWidget) {
            return {
                kind: TabInputKind.NotebookInput,
                notebookType: widget.notebookType,
                uri: toUriComponents(widget.model?.uri.toString() ?? '')
            };
        }

        return { kind: TabInputKind.UnknownInput };
    }

    protected connectToSignal<T>(disposableList: DisposableCollection,
        signal: {
            connect(listener: T, context: unknown): void,
            disconnect(listener: T, context: unknown): void
        }, listener: T): void {
        signal.connect(listener, this);
        disposableList.push(Disposable.create(() => signal.disconnect(listener, this)));
    }

    protected tabDtosEqual(a: TabDto, b: TabDto): boolean {
        return a.isActive === b.isActive &&
            a.isDirty === b.isDirty &&
            a.isPinned === b.isPinned &&
            a.isPreview === b.isPreview &&
            a.id === b.id;
    }

    protected getOrRebuildModel<T, R>(map: Map<T, R>, key: T): R {
        // something broke so we rebuild the model
        let item = map.get(key);
        if (!item) {
            this.createTabsModel();
            item = map.get(key)!;
        }
        return item;
    }

    // #region event listeners
    private onTabCreated(tabBar: TabBar<Widget>, args: TabBar.ITabActivateRequestedArgs<Widget>): void {
        const group = this.getOrRebuildModel(this.tabGroupModel, tabBar);
        this.connectToSignal(this.getTitleDisposables(args.title), args.title.changed, this.onTabTitleChanged);
        const tabDto = this.createTabDto(args.title, group.groupId, true);
        this.tabInfoLookup.set(args.title, { group, tab: tabDto, tabIndex: args.index });
        group.tabs.splice(args.index, 0, tabDto);
        this.proxy.$acceptTabOperation({
            kind: TabModelOperationKind.TAB_OPEN,
            index: args.index,
            tabDto,
            groupId: group.groupId
        });
        this.waitQueue.get(args.title.owner)?.resolve();
        this.waitQueue.delete(args.title.owner);
    }

    private onTabTitleChanged(title: Title<Widget>): void {
        const tabInfo = this.getOrRebuildModel(this.tabInfoLookup, title);
        if (!tabInfo) {
            return;
        }
        const oldTabDto = tabInfo.tab;
        const newTabDto = this.createTabDto(title, tabInfo.group.groupId);
        if (!oldTabDto.isActive && newTabDto.isActive) {
            this.currentActiveGroup.tabs.filter(tab => tab.isActive).forEach(tab => tab.isActive = false);
        }
        if (newTabDto.isActive && !tabInfo.group.isActive) {
            tabInfo.group.isActive = true;
            this.currentActiveGroup.isActive = false;
            this.currentActiveGroup = tabInfo.group;
            this.proxy.$acceptTabGroupUpdate(tabInfo.group);
        }
        if (!this.tabDtosEqual(oldTabDto, newTabDto)) {
            tabInfo.group.tabs[tabInfo.tabIndex] = newTabDto;
            tabInfo.tab = newTabDto;
            this.proxy.$acceptTabOperation({
                kind: TabModelOperationKind.TAB_UPDATE,
                index: tabInfo.tabIndex,
                tabDto: newTabDto,
                groupId: tabInfo.group.groupId
            });
        }
        this.waitQueue.get(title.owner)?.resolve();
        this.waitQueue.delete(title.owner);
    }

    private onTabClosed(tabInfo: TabInfo, title: Title<Widget>): void {
        this.disposableTitleListeners.get(title.owner.id)?.dispose();
        this.disposableTitleListeners.delete(title.owner.id);
        tabInfo.group.tabs.splice(tabInfo.tabIndex, 1);
        this.tabInfoLookup.delete(title);
        this.updateTabIndices(tabInfo, tabInfo.tabIndex);
        this.proxy.$acceptTabOperation({
            kind: TabModelOperationKind.TAB_CLOSE,
            index: tabInfo.tabIndex,
            tabDto: this.createTabDto(title, tabInfo.group.groupId),
            groupId: tabInfo.group.groupId
        });
    }

    private onTabMoved(tabBar: TabBar<Widget>, args: TabBar.ITabMovedArgs<Widget>): void {
        const tabInfo = this.getOrRebuildModel(this.tabInfoLookup, args.title)!;
        tabInfo.tabIndex = args.toIndex;
        const tabDto = this.createTabDto(args.title, tabInfo.group.groupId);
        tabInfo.group.tabs.splice(args.fromIndex, 1);
        tabInfo.group.tabs.splice(args.toIndex, 0, tabDto);
        this.updateTabIndices(tabInfo, args.fromIndex);
        this.proxy.$acceptTabOperation({
            kind: TabModelOperationKind.TAB_MOVE,
            index: args.toIndex,
            tabDto,
            groupId: tabInfo.group.groupId,
            oldIndex: args.fromIndex
        });
    }

    private onTabGroupCreated(tabBar: TabBar<Widget>): void {
        this.tabGroupChanged = true;
    }

    private onTabGroupClosed(tabBar: TabBar<Widget>): void {
        this.tabGroupChanged = true;
    }
    // #endregion

    // #region Messages received from Ext Host
    $moveTab(tabId: string, index: number, viewColumn: number, preserveFocus?: boolean): void {
        return;
    }

    updateTabIndices(tabInfo: TabInfo, startIndex: number): void {
        for (const tab of this.tabInfoLookup.values()) {
            if (tab.group === tabInfo.group && tab.tabIndex >= startIndex) {
                tab.tabIndex = tab.group.tabs.indexOf(tab.tab);
            }
        }
    }

    async $closeTab(tabIds: string[], preserveFocus?: boolean): Promise<boolean> {
        const widgets: Widget[] = [];
        for (const tabId of tabIds) {
            const cleanedId = tabId.substring(tabId.indexOf('~') + 1);
            const widget = this.applicationShell.getWidgetById(cleanedId);
            if (widget) {
                widgets.push(widget);
            }
        }
        await this.applicationShell.closeMany(widgets);
        return true;
    }

    async $closeGroup(groupIds: number[], preserveFocus?: boolean): Promise<boolean> {
        for (const groupId of groupIds) {
            tabGroupModel: for (const [bar, groupDto] of this.tabGroupModel) {
                if (groupDto.groupId === groupId) {
                    this.applicationShell.closeTabs(bar);
                    break tabGroupModel;
                }
            }
        }
        return true;
    }
    // #endregion

    dispose(): void {
        this.toDisposeOnDestroy.dispose();
        this.disposableTabBarListeners.dispose();
        this.disposableTitleListeners.forEach(disposable => disposable.dispose());
        this.disposableTitleListeners.clear();
    }
}
