// *****************************************************************************
// Copyright (C) 2018-2019 Red Hat, Inc. and others.
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
import { TreeViewsExt, TreeViewItemCollapsibleState, TreeViewItem, TreeViewItemReference, ThemeIcon, DataTransferFileDTO } from '../../../common/plugin-api-rpc';
import { Command } from '../../../common/plugin-api-rpc-model';
import {
    TreeNode,
    NodeProps,
    SelectableTreeNode,
    ExpandableTreeNode,
    CompositeTreeNode,
    TreeImpl,
    TREE_NODE_SEGMENT_CLASS,
    TREE_NODE_SEGMENT_GROW_CLASS,
    TREE_NODE_TAIL_CLASS,
    TreeModelImpl,
    TreeViewWelcomeWidget,
    TooltipAttributes,
    TreeSelection,
    HoverService,
    ApplicationShell,
    KeybindingRegistry
} from '@theia/core/lib/browser';
import { MenuPath, MenuModelRegistry, CommandMenu, AcceleratorSource } from '@theia/core/lib/common/menu';
import * as React from '@theia/core/shared/react';
import { PluginSharedStyle } from '../plugin-shared-style';
import { ACTION_ITEM, Widget } from '@theia/core/lib/browser/widgets/widget';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { MessageService } from '@theia/core/lib/common/message-service';
import { View } from '../../../common/plugin-protocol';
import { URI } from '@theia/core/lib/common/uri';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { MarkdownString } from '@theia/core/lib/common/markdown-rendering';
import { AccessibilityInformation } from '@theia/plugin';
import { ColorRegistry } from '@theia/core/lib/browser/color-registry';
import { DecoratedTreeNode } from '@theia/core/lib/browser/tree/tree-decorator';
import { WidgetDecoration } from '@theia/core/lib/browser/widget-decoration';
import { CancellationTokenSource, CancellationToken, Mutable } from '@theia/core/lib/common';
import { mixin } from '../../../common/types';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { DnDFileContentStore } from './dnd-file-content-store';

export const TREE_NODE_HYPERLINK = 'theia-TreeNodeHyperlink';
export const VIEW_ITEM_CONTEXT_MENU: MenuPath = ['view-item-context-menu'];
export const VIEW_ITEM_INLINE_MENU: MenuPath = ['view-item-context-menu', 'inline'];

export interface SelectionEventHandler {
    readonly node: SelectableTreeNode;
    readonly contextSelection: boolean;
}

export interface TreeViewNode extends SelectableTreeNode, DecoratedTreeNode {
    contextValue?: string;
    command?: Command;
    resourceUri?: string;
    themeIcon?: ThemeIcon;
    tooltip?: string | MarkdownString;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description?: string | boolean | any;
    accessibilityInformation?: AccessibilityInformation;
}
export namespace TreeViewNode {
    export function is(arg: TreeNode | undefined): arg is TreeViewNode {
        return !!arg && SelectableTreeNode.is(arg) && DecoratedTreeNode.is(arg);
    }
}

export class ResolvableTreeViewNode implements TreeViewNode {
    contextValue?: string;
    command?: Command;
    resourceUri?: string;
    themeIcon?: ThemeIcon;
    tooltip?: string | MarkdownString;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description?: string | boolean | any;
    accessibilityInformation?: AccessibilityInformation;
    selected: boolean;
    focus?: boolean;
    id: string;
    name?: string;
    icon?: string;
    visible?: boolean;
    parent: Readonly<CompositeTreeNode>;
    previousSibling?: TreeNode;
    nextSibling?: TreeNode;
    busy?: number;
    decorationData: WidgetDecoration.Data;

    resolve: ((token: CancellationToken) => Promise<void>);

    private _resolved = false;
    private resolving: Deferred<void> | undefined;

    constructor(treeViewNode: Partial<TreeViewNode>, resolve: (token: CancellationToken) => Promise<TreeViewItem | undefined>) {
        mixin(this, treeViewNode);
        this.resolve = async (token: CancellationToken) => {
            if (this.resolving) {
                return this.resolving.promise;
            }
            if (!this._resolved) {
                this.resolving = new Deferred();
                const resolvedTreeItem = await resolve(token);
                if (resolvedTreeItem) {
                    this.command = this.command ?? resolvedTreeItem.command;
                    this.tooltip = this.tooltip ?? resolvedTreeItem.tooltip;
                }
                this.resolving.resolve();
                this.resolving = undefined;
            }
            if (!token.isCancellationRequested) {
                this._resolved = true;
            }
        };
    }

    reset(): void {
        this._resolved = false;
        this.resolving = undefined;
        this.command = undefined;
        this.tooltip = undefined;
    }

    get resolved(): boolean {
        return this._resolved;
    }
}

export class ResolvableCompositeTreeViewNode extends ResolvableTreeViewNode implements CompositeTreeViewNode {
    expanded: boolean;
    children: readonly TreeNode[];
    constructor(
        treeViewNode: Pick<CompositeTreeViewNode, 'children' | 'expanded'> & Partial<TreeViewNode>,
        resolve: (token: CancellationToken) => Promise<TreeViewItem | undefined>) {
        super(treeViewNode, resolve);
        this.expanded = treeViewNode.expanded;
        this.children = treeViewNode.children;
    }
}

export interface CompositeTreeViewNode extends TreeViewNode, ExpandableTreeNode, CompositeTreeNode {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    description?: string | boolean | any;
}
export namespace CompositeTreeViewNode {
    export function is(arg: TreeNode | undefined): arg is CompositeTreeViewNode {
        return TreeViewNode.is(arg) && ExpandableTreeNode.is(arg) && CompositeTreeNode.is(arg);
    }
}

@injectable()
export class TreeViewWidgetOptions {
    id: string;
    manageCheckboxStateManually: boolean | undefined;
    showCollapseAll: boolean | undefined;
    multiSelect: boolean | undefined;
    dragMimeTypes: string[] | undefined;
    dropMimeTypes: string[] | undefined;
}

@injectable()
export class PluginTree extends TreeImpl {

    @inject(PluginSharedStyle)
    protected readonly sharedStyle: PluginSharedStyle;

    @inject(TreeViewWidgetOptions)
    protected readonly options: TreeViewWidgetOptions;

    @inject(MessageService)
    protected readonly notification: MessageService;

    protected readonly onDidChangeWelcomeStateEmitter: Emitter<void> = new Emitter<void>();
    readonly onDidChangeWelcomeState = this.onDidChangeWelcomeStateEmitter.event;

    private _proxy: TreeViewsExt | undefined;
    private _viewInfo: View | undefined;
    private _isEmpty: boolean;
    private _hasTreeItemResolve: Promise<boolean> = Promise.resolve(false);

    set proxy(proxy: TreeViewsExt | undefined) {
        this._proxy = proxy;
        if (proxy) {
            this._hasTreeItemResolve = proxy.$hasResolveTreeItem(this.options.id);
        } else {
            this._hasTreeItemResolve = Promise.resolve(false);
        }
    }
    get proxy(): TreeViewsExt | undefined {
        return this._proxy;
    }

    get hasTreeItemResolve(): Promise<boolean> {
        return this._hasTreeItemResolve;
    }

    set viewInfo(viewInfo: View) {
        this._viewInfo = viewInfo;
    }

    get isEmpty(): boolean {
        return this._isEmpty;
    }

    protected override async resolveChildren(parent: CompositeTreeNode): Promise<TreeNode[]> {
        if (!this._proxy) {
            return super.resolveChildren(parent);
        }
        const children = await this.fetchChildren(this._proxy, parent);
        const hasResolve = await this.hasTreeItemResolve;
        return children.map(value => hasResolve ? this.createResolvableTreeNode(value, parent) : this.createTreeNode(value, parent));
    }

    protected async fetchChildren(proxy: TreeViewsExt, parent: CompositeTreeNode): Promise<TreeViewItem[]> {
        try {
            const children = await proxy.$getChildren(this.options.id, parent.id);
            const oldEmpty = this._isEmpty;
            this._isEmpty = !parent.id && (!children || children.length === 0);
            if (oldEmpty !== this._isEmpty) {
                this.onDidChangeWelcomeStateEmitter.fire();
            }
            return children || [];
        } catch (e) {
            if (e) {
                console.error(`Failed to fetch children for '${this.options.id}'`, e);
                const label = this._viewInfo ? this._viewInfo.name : this.options.id;
                this.notification.error(`${label}: ${e.message}`);
            }
            return [];
        }
    }

    protected createTreeNode(item: TreeViewItem, parent: CompositeTreeNode): TreeNode {
        const update: Partial<TreeViewNode> = this.createTreeNodeUpdate(item);
        const node = this.getNode(item.id);
        if (item.collapsibleState !== undefined && item.collapsibleState !== TreeViewItemCollapsibleState.None) {
            if (CompositeTreeViewNode.is(node)) {
                return Object.assign(node, update);
            }
            return Object.assign({
                id: item.id,
                parent,
                visible: true,
                selected: false,
                expanded: TreeViewItemCollapsibleState.Expanded === item.collapsibleState,
                children: [],
                command: item.command
            }, update);
        }
        if (TreeViewNode.is(node) && !ExpandableTreeNode.is(node)) {
            return Object.assign(node, update, { command: item.command });
        }
        return Object.assign({
            id: item.id,
            parent,
            visible: true,
            selected: false,
            command: item.command,
        }, update);
    }

    override markAsChecked(node: Mutable<TreeNode>, checked: boolean): void {
        function findParentsToChange(child: TreeNode, nodes: TreeNode[]): void {
            if ((child.parent?.checkboxInfo !== undefined && child.parent.checkboxInfo.checked !== checked) &&
                (!checked || !child.parent.children.some(candidate => candidate !== child && candidate.checkboxInfo?.checked === false))) {
                nodes.push(child.parent);
                findParentsToChange(child.parent, nodes);
            }
        }

        function findChildrenToChange(parent: TreeNode, nodes: TreeNode[]): void {
            if (CompositeTreeNode.is(parent)) {
                parent.children.forEach(child => {
                    if (child.checkboxInfo !== undefined && child.checkboxInfo.checked !== checked) {
                        nodes.push(child);
                    }
                    findChildrenToChange(child, nodes);
                });
            }
        }

        const nodesToChange = [node];
        if (!this.options.manageCheckboxStateManually) {
            findParentsToChange(node, nodesToChange);
            findChildrenToChange(node, nodesToChange);

        }
        nodesToChange.forEach(n => n.checkboxInfo!.checked = checked);
        this.onDidUpdateEmitter.fire(nodesToChange);
        this.proxy?.$checkStateChanged(this.options.id, [{ id: node.id, checked: checked }]);
    }

    /** Creates a resolvable tree node. If a node already exists, reset it because the underlying TreeViewItem might have been disposed in the backend. */
    protected createResolvableTreeNode(item: TreeViewItem, parent: CompositeTreeNode): TreeNode {
        const update: Partial<TreeViewNode> = this.createTreeNodeUpdate(item);
        const node = this.getNode(item.id);

        // Node is a composite node that might contain children
        if (item.collapsibleState !== undefined && item.collapsibleState !== TreeViewItemCollapsibleState.None) {
            // Reuse existing composite node and reset it
            if (node instanceof ResolvableCompositeTreeViewNode) {
                node.reset();
                return Object.assign(node, update);
            }
            // Create new composite node
            const compositeNode = Object.assign({
                id: item.id,
                parent,
                visible: true,
                selected: false,
                expanded: TreeViewItemCollapsibleState.Expanded === item.collapsibleState,
                children: [],
                command: item.command
            }, update);
            return new ResolvableCompositeTreeViewNode(compositeNode, async (token: CancellationToken) => this._proxy?.$resolveTreeItem(this.options.id, item.id, token));
        }

        // Node is a leaf
        // Reuse existing node and reset it.
        if (node instanceof ResolvableTreeViewNode && !ExpandableTreeNode.is(node)) {
            node.reset();
            return Object.assign(node, update);
        }
        const treeNode = Object.assign({
            id: item.id,
            parent,
            visible: true,
            selected: false,
            command: item.command,
        }, update);
        return new ResolvableTreeViewNode(treeNode, async (token: CancellationToken) => this._proxy?.$resolveTreeItem(this.options.id, item.id, token));
    }

    protected createTreeNodeUpdate(item: TreeViewItem): Partial<TreeViewNode> {
        const decorationData = this.toDecorationData(item);
        const icon = this.toIconClass(item);
        const resourceUri = item.resourceUri && URI.fromComponents(item.resourceUri).toString();
        const themeIcon = item.themeIcon ? item.themeIcon : item.collapsibleState !== TreeViewItemCollapsibleState.None ? { id: 'folder' } : undefined;
        return {
            name: item.label,
            decorationData,
            icon,
            description: item.description,
            themeIcon,
            resourceUri,
            tooltip: item.tooltip,
            contextValue: item.contextValue,
            command: item.command,
            checkboxInfo: item.checkboxInfo,
            accessibilityInformation: item.accessibilityInformation,
        };
    }

    protected toDecorationData(item: TreeViewItem): WidgetDecoration.Data {
        let decoration: WidgetDecoration.Data = {};
        if (item.highlights) {
            const highlight = {
                ranges: item.highlights.map(h => ({ offset: h[0], length: h[1] - h[0] }))
            };
            decoration = { highlight };
        }
        return decoration;
    }

    protected toIconClass(item: TreeViewItem): string | undefined {
        if (item.icon) {
            return 'fa ' + item.icon;
        }
        if (item.iconUrl) {
            const reference = this.sharedStyle.toIconClass(item.iconUrl);
            this.toDispose.push(reference);
            return reference.object.iconClass;
        }
        return undefined;
    }

}

@injectable()
export class PluginTreeModel extends TreeModelImpl {

    @inject(PluginTree)
    protected override readonly tree: PluginTree;

    set proxy(proxy: TreeViewsExt | undefined) {
        this.tree.proxy = proxy;
    }
    get proxy(): TreeViewsExt | undefined {
        return this.tree.proxy;
    }

    get hasTreeItemResolve(): Promise<boolean> {
        return this.tree.hasTreeItemResolve;
    }

    set viewInfo(viewInfo: View) {
        this.tree.viewInfo = viewInfo;
    }

    get isTreeEmpty(): boolean {
        return this.tree.isEmpty;
    }

    get onDidChangeWelcomeState(): Event<void> {
        return this.tree.onDidChangeWelcomeState;
    }

    override doOpenNode(node: TreeNode): void {
        super.doOpenNode(node);
        if (node instanceof ResolvableTreeViewNode) {
            node.resolve(CancellationToken.None);
        }
    }
}

@injectable()
export class TreeViewWidget extends TreeViewWelcomeWidget {
    async refresh(items?: string[]): Promise<void> {
        if (items) {
            for (const id of items) {
                const node = this.model.getNode(id);
                if (CompositeTreeNode.is(node)) {
                    await this.model.refresh(node);
                }
            };
        } else {
            this.model.refresh();
        }
    }

    protected _contextSelection = false;

    @inject(ApplicationShell)
    protected readonly applicationShell: ApplicationShell;

    @inject(MenuModelRegistry)
    protected readonly menus: MenuModelRegistry;

    @inject(KeybindingRegistry)
    protected readonly keybindings: KeybindingRegistry;

    @inject(ContextKeyService)
    protected readonly contextKeys: ContextKeyService;

    @inject(TreeViewWidgetOptions)
    readonly options: TreeViewWidgetOptions;

    @inject(PluginTreeModel)
    override readonly model: PluginTreeModel;

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    @inject(HoverService)
    protected readonly hoverService: HoverService;

    @inject(ColorRegistry)
    protected readonly colorRegistry: ColorRegistry;

    @inject(DnDFileContentStore)
    protected readonly dndFileContentStore: DnDFileContentStore;

    protected treeDragType: string;
    protected readonly expansionTimeouts: Map<string, number> = new Map();

    @postConstruct()
    protected override init(): void {
        super.init();
        this.id = this.options.id;
        this.addClass('theia-tree-view');
        this.node.style.height = '100%';
        this.model.onDidChangeWelcomeState(this.update, this);
        this.toDispose.push(this.model.onDidChangeWelcomeState(this.update, this));
        this.toDispose.push(this.onDidChangeVisibilityEmitter);
        this.toDispose.push(this.contextKeyService.onDidChange(() => this.update()));
        this.toDispose.push(this.keybindings.onKeybindingsChanged(() => this.update()));
        this.treeDragType = `application/vnd.code.tree.${this.id.toLowerCase()}`;
    }

    get showCollapseAll(): boolean {
        return this.options.showCollapseAll || false;
    }

    protected override renderIcon(node: TreeNode, props: NodeProps): React.ReactNode {
        const icon = this.toNodeIcon(node);
        if (icon) {
            let style: React.CSSProperties | undefined;
            if (TreeViewNode.is(node) && node.themeIcon?.color) {
                const color = this.colorRegistry.getCurrentColor(node.themeIcon.color.id);
                if (color) {
                    style = { color };
                }
            }
            return <div className={icon + ' theia-tree-view-icon'} style={style}></div>;
        }
        return undefined;
    }

    protected override renderCaption(node: TreeViewNode, props: NodeProps): React.ReactNode {
        const classes = [TREE_NODE_SEGMENT_CLASS];
        if (!this.hasTrailingSuffixes(node)) {
            classes.push(TREE_NODE_SEGMENT_GROW_CLASS);
        }
        const className = classes.join(' ');

        let attrs: React.HTMLAttributes<HTMLElement> & Partial<TooltipAttributes> = {
            ...this.decorateCaption(node, {}),
            className,
            id: node.id
        };

        if (node.accessibilityInformation) {
            attrs = {
                ...attrs,
                'aria-label': node.accessibilityInformation.label,
                'role': node.accessibilityInformation.role
            };
        }

        if (!node.tooltip && node instanceof ResolvableTreeViewNode) {
            let configuredTip = false;
            let source: CancellationTokenSource | undefined;
            attrs = {
                ...attrs,
                onMouseLeave: () => source?.cancel(),
                onMouseEnter: async event => {
                    const target = event.currentTarget; // event.currentTarget will be null after awaiting node resolve()
                    if (configuredTip) {
                        if (MarkdownString.is(node.tooltip)) {
                            this.hoverService.requestHover({
                                content: node.tooltip,
                                target: event.target as HTMLElement,
                                position: 'right'
                            });
                        }
                        return;
                    }
                    if (!node.resolved) {
                        source = new CancellationTokenSource();
                        const token = source.token;
                        await node.resolve(token);
                        if (token.isCancellationRequested) {
                            return;
                        }
                    }
                    if (MarkdownString.is(node.tooltip)) {
                        this.hoverService.requestHover({
                            content: node.tooltip,
                            target: event.target as HTMLElement,
                            position: 'right'
                        });
                    } else {
                        const title = node.tooltip ||
                            (node.resourceUri && this.labelProvider.getLongName(new URI(node.resourceUri)))
                            || this.toNodeName(node);
                        target.title = title;
                    }
                    configuredTip = true;
                }
            };
        } else if (MarkdownString.is(node.tooltip)) {
            attrs = {
                ...attrs,
                onMouseEnter: event => {
                    this.hoverService.requestHover({
                        content: node.tooltip!,
                        target: event.target as HTMLElement,
                        position: 'right'
                    });
                }
            };
        } else {
            const title = node.tooltip ||
                (node.resourceUri && this.labelProvider.getLongName(new URI(node.resourceUri)))
                || this.toNodeName(node);

            attrs = {
                ...attrs,
                title
            };
        }

        const children: React.ReactNode[] = [];
        const caption = this.toNodeName(node);
        const highlight = this.getDecorationData(node, 'highlight')[0];
        if (highlight) {
            children.push(this.toReactNode(caption, highlight));
        }
        const searchHighlight = this.searchHighlights && this.searchHighlights.get(node.id);
        if (searchHighlight) {
            children.push(...this.toReactNode(caption, searchHighlight));
        } else if (!highlight) {
            children.push(caption);
        }
        const description = this.toNodeDescription(node);
        if (description) {
            children.push(<span className='theia-tree-view-description'>{description}</span>);
        }
        return <div {...attrs}>{...children}</div>;
    }

    protected override createNodeAttributes(node: TreeViewNode, props: NodeProps): React.Attributes & React.HTMLAttributes<HTMLElement> {
        const attrs = super.createNodeAttributes(node, props);

        if (this.options.dragMimeTypes) {
            attrs.onDragStart = event => this.handleDragStartEvent(node, event);
            attrs.onDragEnd = event => this.handleDragEnd(node, event);
            attrs.draggable = true;
        }

        if (this.options.dropMimeTypes) {
            attrs.onDrop = event => this.handleDropEvent(node, event);
            attrs.onDragEnter = event => this.handleDragEnter(node, event);
            attrs.onDragLeave = event => this.handleDragLeave(node, event);
            attrs.onDragOver = event => this.handleDragOver(event);
        }

        return attrs;
    }
    handleDragLeave(node: TreeViewNode, event: React.DragEvent<HTMLElement>): void {
        const timeout = this.expansionTimeouts.get(node.id);
        if (typeof timeout !== 'undefined') {
            console.debug(`dragleave ${node.id} canceling timeout`);
            clearTimeout(timeout);
            this.expansionTimeouts.delete(node.id);
        }
    }
    handleDragEnter(node: TreeViewNode, event: React.DragEvent<HTMLElement>): void {
        console.debug(`dragenter ${node.id}`);
        if (ExpandableTreeNode.is(node)) {
            console.debug(`dragenter ${node.id} starting timeout`);
            this.expansionTimeouts.set(node.id, window.setTimeout(() => {
                console.debug(`dragenter ${node.id} timeout reached`);
                this.model.expandNode(node);
            }, 500));
        }
    }

    protected override createContainerAttributes(): React.HTMLAttributes<HTMLElement> {
        const attrs = super.createContainerAttributes();
        if (this.options.dropMimeTypes) {
            attrs.onDrop = event => this.handleDropEvent(undefined, event);
            attrs.onDragOver = event => this.handleDragOver(event);
        }
        return attrs;
    }

    protected handleDragStartEvent(node: TreeViewNode, event: React.DragEvent<HTMLElement>): void {
        event.dataTransfer!.setData(this.treeDragType, '');
        let selectedNodes: TreeViewNode[] = [];
        if (this.model.selectedNodes.find(selected => TreeNode.equals(selected, node))) {
            selectedNodes = this.model.selectedNodes.filter(TreeViewNode.is);
        } else {
            selectedNodes = [node];
        }

        this.options.dragMimeTypes!.forEach(type => {
            if (type === 'text/uri-list') {
                ApplicationShell.setDraggedEditorUris(event.dataTransfer, selectedNodes.filter(n => n.resourceUri).map(n => new URI(n.resourceUri)));
            } else {
                event.dataTransfer.setData(type, '');
            }
        });

        this.model.proxy!.$dragStarted(this.options.id, selectedNodes.map(selected => selected.id), CancellationToken.None).then(maybeUris => {
            if (maybeUris) {
                this.applicationShell.addAdditionalDraggedEditorUris(maybeUris.map(uri => URI.fromComponents(uri)));
            }
        });
    }

    handleDragEnd(node: TreeViewNode, event: React.DragEvent<HTMLElement>): void {
        this.applicationShell.clearAdditionalDraggedEditorUris();
        this.model.proxy!.$dragEnd(this.id);
    }

    handleDragOver(event: React.DragEvent<HTMLElement>): void {
        const hasFiles = (items: DataTransferItemList) => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file') {
                    return true;
                }
            }
            return false;
        };

        if (event.dataTransfer) {
            const canDrop = event.dataTransfer.types.some(type => this.options.dropMimeTypes!.includes(type)) ||
                event.dataTransfer.types.includes(this.treeDragType) ||
                this.options.dropMimeTypes!.includes('files') && hasFiles(event.dataTransfer.items);
            if (canDrop) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            } else {
                event.dataTransfer.dropEffect = 'none';
            }
            event.stopPropagation();
        }
    }

    protected handleDropEvent(node: TreeViewNode | undefined, event: React.DragEvent<HTMLElement>): void {
        if (event.dataTransfer) {
            const items: [string, string | DataTransferFileDTO][] = [];
            let files: string[] = [];
            try {
                for (let i = 0; i < event.dataTransfer.items.length; i++) {
                    const transferItem = event.dataTransfer.items[i];
                    if (transferItem.type !== this.treeDragType) {
                        // do not pass the artificial drag data to the extension
                        const f = event.dataTransfer.items[i].getAsFile();
                        if (f) {
                            const fileId = this.dndFileContentStore.addFile(f);
                            files.push(fileId);
                            const uri = f.path ? {
                                scheme: 'file',
                                path: f.path,
                                authority: '',
                                query: '',
                                fragment: ''
                            } : undefined;
                            items.push([transferItem.type, new DataTransferFileDTO(f.name, fileId, uri)]);
                        } else {
                            const textData = event.dataTransfer.getData(transferItem.type);
                            if (textData) {
                                items.push([transferItem.type, textData]);
                            }
                        }
                    }
                }
                if (items.length > 0 || event.dataTransfer.types.includes(this.treeDragType)) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.model.proxy?.$drop(this.id, node?.id, items, CancellationToken.None).finally(() => {
                        for (const file of files) {
                            this.dndFileContentStore.removeFile(file);
                        }
                    });
                    files = [];
                }
            } catch (e) {
                for (const file of files) {
                    this.dndFileContentStore.removeFile(file);
                }
                throw e;
            }
        }
    }

    protected override renderTailDecorations(treeViewNode: TreeViewNode, props: NodeProps): React.ReactNode {
        return this.contextKeys.with({ view: this.id, viewItem: treeViewNode.contextValue }, () => {
            const menu = this.menus.getMenu(VIEW_ITEM_INLINE_MENU);
            const args = this.toContextMenuArgs(treeViewNode);
            const inlineCommands = menu.children.filter((item): item is CommandMenu => CommandMenu.is(item));
            const tailDecorations = super.renderTailDecorations(treeViewNode, props);
            return <React.Fragment>
                {inlineCommands.length > 0 && <div className={TREE_NODE_SEGMENT_CLASS + ' flex'}>
                    {inlineCommands.map((item, index) => this.renderInlineCommand(item, index, this.focusService.hasFocus(treeViewNode), args))}
                </div>}
                {tailDecorations !== undefined && <div className={TREE_NODE_SEGMENT_CLASS + ' flex'}>{tailDecorations}</div>}
            </React.Fragment>;
        });
    }

    toTreeViewItemReference(treeNode: TreeNode): TreeViewItemReference {
        return { viewId: this.id, itemId: treeNode.id };
    }

    protected resolveKeybindingForCommand(command: string | undefined): string {
        let result = '';
        if (command) {
            const bindings = this.keybindings.getKeybindingsForCommand(command);
            let found = false;
            if (bindings && bindings.length > 0) {
                bindings.forEach(binding => {
                    if (!found && this.keybindings.isEnabledInScope(binding, this.node)) {
                        found = true;
                        result = ` (${this.keybindings.acceleratorFor(binding, '+')})`;
                    }
                });
            }
        }
        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected renderInlineCommand(actionMenuNode: CommandMenu, index: number, tabbable: boolean, args: any[]): React.ReactNode {
        const nodePath = [...VIEW_ITEM_INLINE_MENU, actionMenuNode.id];
        if (!actionMenuNode.icon || !actionMenuNode.isVisible(nodePath, this.contextKeys, undefined)) {
            return false;
        }
        const className = [TREE_NODE_SEGMENT_CLASS, TREE_NODE_TAIL_CLASS, actionMenuNode.icon, ACTION_ITEM, 'theia-tree-view-inline-action'].join(' ');
        const tabIndex = tabbable ? 0 : undefined;
        const titleString = actionMenuNode.label + (AcceleratorSource.is(actionMenuNode) ? actionMenuNode.getAccelerator(undefined).join('+') : '');

        return <div key={index} className={className} title={titleString} tabIndex={tabIndex} onClick={e => {
            e.stopPropagation();
            actionMenuNode.run(nodePath, ...args);
        }} />;
    }

    protected override toContextMenuArgs(target: SelectableTreeNode): [TreeViewItemReference, TreeViewItemReference[]] | [TreeViewItemReference] {
        if (this.options.multiSelect) {
            return [this.toTreeViewItemReference(target), this.model.selectedNodes.map(node => this.toTreeViewItemReference(node))];
        } else {
            return [this.toTreeViewItemReference(target)];
        }
    }

    override setFlag(flag: Widget.Flag): void {
        super.setFlag(flag);
        if (flag === Widget.Flag.IsVisible) {
            this.onDidChangeVisibilityEmitter.fire(this.isVisible);
        }
    }

    override clearFlag(flag: Widget.Flag): void {
        super.clearFlag(flag);
        if (flag === Widget.Flag.IsVisible) {
            this.onDidChangeVisibilityEmitter.fire(this.isVisible);
        }
    }

    override handleEnter(event: KeyboardEvent): void {
        super.handleEnter(event);
        this.tryExecuteCommand();
    }

    protected override tapNode(node?: TreeNode): void {
        super.tapNode(node);
        this.findCommands(node).then(commandMap => {
            if (commandMap.size > 0) {
                this.tryExecuteCommandMap(commandMap);
            } else if (node && this.isExpandable(node)) {
                this.model.toggleNodeExpansion(node);
            }
        });
    }

    // execute TreeItem.command if present
    protected async tryExecuteCommand(node?: TreeNode): Promise<void> {
        this.tryExecuteCommandMap(await this.findCommands(node));
    }

    protected tryExecuteCommandMap(commandMap: Map<string, unknown[]>): void {
        commandMap.forEach((args, commandId) => {
            this.commands.executeCommand(commandId, ...args);
        });
    }

    protected async findCommands(node?: TreeNode): Promise<Map<string, unknown[]>> {
        const commandMap = new Map<string, unknown[]>();
        const treeNodes = (node ? [node] : this.model.selectedNodes) as TreeViewNode[];
        if (await this.model.hasTreeItemResolve) {
            const cancellationToken = new CancellationTokenSource().token;
            // Resolve all resolvable nodes that don't have a command and haven't been resolved.
            const allResolved = Promise.all(treeNodes.map(maybeNeedsResolve => {
                if (!maybeNeedsResolve.command && maybeNeedsResolve instanceof ResolvableTreeViewNode && !maybeNeedsResolve.resolved) {
                    return maybeNeedsResolve.resolve(cancellationToken).catch(err => {
                        console.error(`Failed to resolve tree item '${maybeNeedsResolve.id}'`, err);
                    });
                }
                return Promise.resolve(maybeNeedsResolve);
            }));
            // Only need to wait but don't need the values because tree items are resolved in place.
            await allResolved;
        }
        for (const treeNode of treeNodes) {
            if (treeNode && treeNode.command) {
                commandMap.set(treeNode.command.id, treeNode.command.arguments || []);
            }
        }
        return commandMap;
    }

    private _message: string | undefined;
    get message(): string | undefined {
        return this._message;
    }

    set message(message: string | undefined) {
        this._message = message;
        this.update();
    }

    protected override render(): React.ReactNode {
        return React.createElement('div', this.createContainerAttributes(), this.renderSearchInfo(), this.renderTree(this.model));
    }

    protected renderSearchInfo(): React.ReactNode {
        if (this._message) {
            return <div className='theia-TreeViewInfo'>{this._message}</div>;
        }
        return undefined;
    }

    override shouldShowWelcomeView(): boolean {
        return (this.model.proxy === undefined || this.model.isTreeEmpty) && this.message === undefined;
    }

    protected override handleContextMenuEvent(node: TreeNode | undefined, event: React.MouseEvent<HTMLElement, MouseEvent>): void {
        if (SelectableTreeNode.is(node)) {
            // Keep the selection for the context menu, if the widget support multi-selection and the right click happens on an already selected node.
            if (!this.props.multiSelect || !node.selected) {
                const type = !!this.props.multiSelect && this.hasCtrlCmdMask(event) ? TreeSelection.SelectionType.TOGGLE : TreeSelection.SelectionType.DEFAULT;
                this.model.addSelection({ node, type });
            }
            this.focusService.setFocus(node);
            const contextMenuPath = this.props.contextMenuPath;
            if (contextMenuPath) {
                const { x, y } = event.nativeEvent;
                const args = this.toContextMenuArgs(node);
                const contextKeyService = this.contextKeyService.createOverlay([
                    ['viewItem', (TreeViewNode.is(node) && node.contextValue) || undefined],
                    ['view', this.options.id]
                ]);
                setTimeout(() => this.contextMenuRenderer.render({
                    menuPath: contextMenuPath,
                    anchor: { x, y },
                    args,
                    contextKeyService
                }), 10);
            }
        }
        event.stopPropagation();
        event.preventDefault();
    }
}
