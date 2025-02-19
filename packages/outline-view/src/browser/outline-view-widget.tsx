// *****************************************************************************
// Copyright (C) 2017-2018 TypeFox and others.
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
import {
    TreeWidget,
    TreeNode,
    NodeProps,
    SelectableTreeNode,
    CompositeTreeNode,
    TreeProps,
    ContextMenuRenderer,
    TreeModel,
    ExpandableTreeNode,
    codicon
} from '@theia/core/lib/browser';
import { OutlineViewTreeModel } from './outline-view-tree-model';
import { Message } from '@theia/core/shared/@lumino/messaging';
import { Emitter, Event, isObject, Mutable, UriSelection } from '@theia/core';
import * as React from '@theia/core/shared/react';
import { Range } from '@theia/core/shared/vscode-languageserver-protocol';
import URI from '@theia/core/lib/common/uri';
import { nls } from '@theia/core/lib/common/nls';

/**
 * Representation of an outline symbol information node.
 */
export interface OutlineSymbolInformationNode extends CompositeTreeNode, SelectableTreeNode, ExpandableTreeNode {
    /**
     * The `iconClass` for the given tree node.
     */
    iconClass: string;
}

/**
 * Collection of outline symbol information node functions.
 */
export namespace OutlineSymbolInformationNode {
    /**
     * Determine if the given tree node is an `OutlineSymbolInformationNode`.
     * - The tree node is an `OutlineSymbolInformationNode` if:
     *  - The node exists.
     *  - The node is selectable.
     *  - The node contains a defined `iconClass` property.
     * @param node the tree node.
     *
     * @returns `true` if the given node is an `OutlineSymbolInformationNode`.
     */
    export function is(node: TreeNode): node is OutlineSymbolInformationNode {
        return !!node && SelectableTreeNode.is(node) && 'iconClass' in node;
    }

    export function hasRange(node: unknown): node is { range: Range } {
        return isObject<{ range: Range }>(node) && Range.is(node.range);
    }
}

export type OutlineViewWidgetFactory = () => OutlineViewWidget;
export const OutlineViewWidgetFactory = Symbol('OutlineViewWidgetFactory');

@injectable()
export class OutlineViewWidget extends TreeWidget {

    static LABEL = nls.localizeByDefault('Outline');

    readonly onDidChangeOpenStateEmitter = new Emitter<boolean>();

    protected readonly onDidUpdateEmitter = new Emitter<void>();
    readonly onDidUpdate: Event<void> = this.onDidUpdateEmitter.event;

    constructor(
        @inject(TreeProps) treeProps: TreeProps,
        @inject(OutlineViewTreeModel) override readonly model: OutlineViewTreeModel,
        @inject(ContextMenuRenderer) contextMenuRenderer: ContextMenuRenderer
    ) {
        super(treeProps, model, contextMenuRenderer);

        this.id = 'outline-view';
        this.title.label = OutlineViewWidget.LABEL;
        this.title.caption = OutlineViewWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = codicon('symbol-class');
        this.addClass('theia-outline-view');
    }

    @postConstruct()
    protected override init(): void {
        super.init();
        this.toDispose.push(this.model.onExpansionChanged(() => this.onDidUpdateEmitter.fire()));
    }

    /**
     * Set the outline tree with the list of `OutlineSymbolInformationNode`.
     * @param roots the list of `OutlineSymbolInformationNode`.
     */
    public setOutlineTree(roots: OutlineSymbolInformationNode[]): void {
        // Gather the list of available nodes.
        const nodes = this.reconcileTreeState(roots);
        // Update the model root node, appending the outline symbol information nodes as children.
        this.model.root = this.getRoot(nodes);
    }

    protected getRoot(children: TreeNode[]): CompositeTreeNode {
        return {
            id: 'outline-view-root',
            name: OutlineViewWidget.LABEL,
            visible: false,
            children,
            parent: undefined
        };
    }

    /**
     * Reconcile the outline tree state, gathering all available nodes.
     * @param nodes the list of `TreeNode`.
     *
     * @returns the list of tree nodes.
     */
    protected reconcileTreeState(nodes: TreeNode[]): TreeNode[] {
        nodes.forEach(node => {
            if (OutlineSymbolInformationNode.is(node)) {
                const treeNode = this.model.getNode(node.id);
                if (treeNode && OutlineSymbolInformationNode.is(treeNode)) {
                    treeNode.expanded = node.expanded;
                    treeNode.selected = node.selected;
                }
                this.reconcileTreeState(Array.from(node.children));
            }
        });
        return nodes;
    }

    protected override onAfterHide(msg: Message): void {
        super.onAfterHide(msg);
        this.onDidChangeOpenStateEmitter.fire(false);
    }

    protected override onAfterShow(msg: Message): void {
        super.onAfterShow(msg);
        this.onDidChangeOpenStateEmitter.fire(true);
    }

    override renderIcon(node: TreeNode, props: NodeProps): React.ReactNode {
        if (OutlineSymbolInformationNode.is(node)) {
            return <div className={'symbol-icon-center codicon codicon-symbol-' + node.iconClass}></div>;
        }
        return undefined;
    }

    protected override createNodeAttributes(node: TreeNode, props: NodeProps): React.Attributes & React.HTMLAttributes<HTMLElement> {
        const elementAttrs = super.createNodeAttributes(node, props);
        return {
            ...elementAttrs,
            title: this.getNodeTooltip(node)
        };
    }

    /**
     * Get the tooltip for the given tree node.
     * - The tooltip is discovered when hovering over a tree node.
     * - If available, the tooltip is the concatenation of the node name, and it's type.
     * @param node the tree node.
     *
     * @returns the tooltip for the tree node if available, else `undefined`.
     */
    protected getNodeTooltip(node: TreeNode): string | undefined {
        if (OutlineSymbolInformationNode.is(node)) {
            return node.name + ` (${node.iconClass})`;
        }
        return undefined;
    }

    protected override isExpandable(node: TreeNode): node is ExpandableTreeNode {
        return OutlineSymbolInformationNode.is(node) && node.children.length > 0;
    }

    protected override renderTree(model: TreeModel): React.ReactNode {
        if (CompositeTreeNode.is(this.model.root) && !this.model.root.children.length) {
            return <div className='theia-widget-noInfo no-outline'>{nls.localizeByDefault('The active editor cannot provide outline information.')}</div>;
        }
        return super.renderTree(model);
    }

    protected override deflateForStorage(node: TreeNode): object {
        const deflated = super.deflateForStorage(node) as { uri: string };
        if (UriSelection.is(node)) {
            deflated.uri = node.uri.toString();
        }
        return deflated;
    }

    protected override inflateFromStorage(node: any, parent?: TreeNode): TreeNode { /* eslint-disable-line @typescript-eslint/no-explicit-any */
        const inflated = super.inflateFromStorage(node, parent) as Mutable<TreeNode & UriSelection>;
        if (node && 'uri' in node && typeof node.uri === 'string') {
            inflated.uri = new URI(node.uri);
        }
        return inflated;
    }
}
