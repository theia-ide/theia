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

import * as React from '@theia/core/shared/react';
import { Container, inject, injectable, interfaces, postConstruct } from '@theia/core/shared/inversify';
import {
    codicon,
    CompositeTreeNode,
    createTreeContainer,
    Key,
    Message,
    NodeProps,
    SelectableTreeNode,
    TreeModel,
    TreeNode,
    TreeWidget,
    TREE_NODE_INDENT_GUIDE_CLASS,
} from '@theia/core/lib/browser';
import { CommandRegistry, CompoundMenuNode, Emitter, MenuAction, MenuModelRegistry } from '@theia/core';
import { TerminalManagerTreeModel } from './terminal-manager-tree-model';
import { ReactInteraction, TerminalManagerTreeTypes, TERMINAL_MANAGER_TREE_CONTEXT_MENU } from './terminal-manager-types';

/* eslint-disable no-param-reassign */
@injectable()
export class TerminalManagerTreeWidget extends TreeWidget {
    static ID = 'terminal-manager-tree-widget';

    protected onDidChangeEmitter = new Emitter();
    readonly onDidChange = this.onDidChangeEmitter.event;

    @inject(MenuModelRegistry) protected menuRegistry: MenuModelRegistry;
    @inject(TreeModel) override readonly model: TerminalManagerTreeModel;
    @inject(CommandRegistry) protected commandRegistry: CommandRegistry;

    static createContainer(parent: interfaces.Container): Container {
        const child = createTreeContainer(
            parent,
            {
                props: {
                    leftPadding: 8,
                    contextMenuPath: TERMINAL_MANAGER_TREE_CONTEXT_MENU,
                    expandOnlyOnExpansionToggleClick: true,
                },
            },
        );
        child.bind(TerminalManagerTreeModel).toSelf().inSingletonScope();
        child.rebind(TreeModel).to(TerminalManagerTreeModel);
        child.bind(TerminalManagerTreeWidget).toSelf().inSingletonScope();
        return child;
    }

    static createWidget(parent: interfaces.Container): TerminalManagerTreeWidget {
        return TerminalManagerTreeWidget.createContainer(parent).get(TerminalManagerTreeWidget);
    }

    @postConstruct()
    protected override init(): void {
        super.init();
        this.id = 'terminal-manager-tree-widget';
        this.addClass(TerminalManagerTreeWidget.ID);
        this.toDispose.push(this.onDidChangeEmitter);
    }

    protected override toContextMenuArgs(node: SelectableTreeNode): TerminalManagerTreeTypes.ContextMenuArgs | undefined {
        if (
            TerminalManagerTreeTypes.isPageNode(node)
            || TerminalManagerTreeTypes.isTerminalNode(node)
            || TerminalManagerTreeTypes.isGroupNode(node)
        ) {
            return TerminalManagerTreeTypes.toContextMenuArgs(this, node);
        }
        return undefined;
    }

    protected override renderCaption(node: TreeNode, props: NodeProps): React.ReactNode {
        if (TerminalManagerTreeTypes.isTerminalManagerTreeNode(node) && !!node.isEditing) {
            const label = this.toNodeName(node);
            // eslint-disable-next-line @typescript-eslint/ban-types
            const assignRef = (element: HTMLInputElement | null) => {
                if (element) {
                    element.selectionStart = 0;
                    element.selectionEnd = label.length;
                }
            };
            return (
                <input
                    spellCheck={false}
                    type='text'
                    className='theia-input rename-node-input'
                    defaultValue={label}
                    onBlur={this.handleRenameOnBlur}
                    data-id={node.id}
                    onKeyDown={this.handleRenameOnKeyDown}
                    autoFocus={true}
                    ref={assignRef}
                />
            );
        }
        return super.renderCaption(node, props);
    }

    protected handleRenameOnBlur = (e: React.FocusEvent<HTMLInputElement>): void => this.doHandleRenameOnBlur(e);
    protected doHandleRenameOnBlur(e: React.FocusEvent<HTMLInputElement>): void {
        const { value } = e.currentTarget;
        const id = e.currentTarget.getAttribute('data-id');
        if (id) {
            this.model.acceptRename(id, value);
        }
    }

    protected override renderExpansionToggle(node: TreeNode, props: NodeProps): React.ReactNode {
        return super.renderExpansionToggle(node, props);
    }

    protected handleRenameOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => this.doHandleRenameOnKeyDown(e);
    protected doHandleRenameOnKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
        const { value, defaultValue } = e.currentTarget;
        const id = e.currentTarget.getAttribute('data-id');
        e.stopPropagation();
        if (e.key === 'Escape') {
            e.preventDefault();
            if (value && id) {
                this.model.acceptRename(id, defaultValue);
            }
        } else if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            if (value && id) {
                this.model.acceptRename(id, value.trim());
            }
        }
    }

    // @ts-expect-error 2416 cf. https://github.com/eclipse-theia/theia/issues/11640
    protected override handleLeft(event: KeyboardEvent): boolean | Promise<void> {
        if ((event.target as HTMLElement).tagName === 'INPUT') { return false; };
        return super.handleLeft(event);
    }

    // @ts-expect-error 2416 cf. https://github.com/eclipse-theia/theia/issues/11640
    protected override handleRight(event: KeyboardEvent): boolean | Promise<void> {
        if ((event.target as HTMLElement).tagName === 'INPUT') { return false; };
        return super.handleRight(event);
    }

    // cf. https://github.com/eclipse-theia/theia/issues/11640
    protected override handleEscape(event: KeyboardEvent): boolean | void {
        if ((event.target as HTMLElement).tagName === 'INPUT') { return false; };
        return super.handleEscape(event);
    }

    // cf. https://github.com/eclipse-theia/theia/issues/11640
    protected override handleEnter(event: KeyboardEvent): boolean | void {
        if ((event.target as HTMLElement).tagName === 'INPUT') { return false; };
        return super.handleEnter(event);
    }

    // cf. https://github.com/eclipse-theia/theia/issues/11640
    protected override handleSpace(event: KeyboardEvent): boolean | void {
        if ((event.target as HTMLElement).tagName === 'INPUT') { return false; };
        return super.handleSpace(event);
    }

    protected override renderTailDecorations(node: TreeNode, _props: NodeProps): React.ReactNode {
        if (TerminalManagerTreeTypes.isTerminalManagerTreeNode(node)) {
            const inlineActionsForNode = this.resolveInlineActionForNode(node);
            return (
                <div className='terminal-manager-inline-actions-container'>
                    <div className='terminal-manager-inline-actions'>
                        {inlineActionsForNode.map(({ icon, commandId, label }) => (
                            <span
                                key={commandId}
                                data-command-id={commandId}
                                data-node-id={node.id}
                                className={icon}
                                onClick={this.handleActionItemOnClick}
                                onKeyDown={this.handleActionItemOnClick}
                                role='button'
                                tabIndex={0}
                                title={label}
                            />
                        ))}
                    </div>
                </div>
            );
        }
        return undefined;
    }

    protected handleActionItemOnClick = (e: ReactInteraction<HTMLSpanElement>): void => this.doHandleActionItemOnClick(e);
    protected doHandleActionItemOnClick(e: ReactInteraction<HTMLSpanElement>): void {
        if ('key' in e && e.key !== Key.ENTER.code) {
            return;
        }
        e.stopPropagation();
        const commandId = e.currentTarget.getAttribute('data-command-id');
        const nodeId = e.currentTarget.getAttribute('data-node-id');
        if (commandId && nodeId) {
            const node = this.model.getNode(nodeId);
            if (TerminalManagerTreeTypes.isTerminalManagerTreeNode(node)) {
                const args = TerminalManagerTreeTypes.toContextMenuArgs(this, node);
                this.commandRegistry.executeCommand(commandId, ...args);
            }
        }
    }

    protected resolveInlineActionForNode(node: TerminalManagerTreeTypes.TerminalManagerTreeNode): MenuAction[] {
        let menuNode: CompoundMenuNode | undefined = undefined;
        const inlineActionProps: MenuAction[] = [];
        if (TerminalManagerTreeTypes.isPageNode(node)) {
            menuNode = this.menuRegistry.getMenu(TerminalManagerTreeTypes.PAGE_NODE_MENU);
        } else if (TerminalManagerTreeTypes.isGroupNode(node)) {
            menuNode = this.menuRegistry.getMenu(TerminalManagerTreeTypes.GROUP_NODE_MENU);
        } else if (TerminalManagerTreeTypes.isTerminalNode(node)) {
            menuNode = this.menuRegistry.getMenu(TerminalManagerTreeTypes.TERMINAL_NODE_MENU);
        }
        if (!menuNode) {
            return [];
        }
        const menuItems = menuNode.children;
        menuItems.forEach(item => {
            const commandId = item.id;
            const args = TerminalManagerTreeTypes.toContextMenuArgs(this, node);
            const isVisible = this.commandRegistry.isVisible(commandId, ...args);
            if (isVisible) {
                const command = this.commandRegistry.getCommand(commandId);
                const icon = command?.iconClass ? command.iconClass : '';
                const label = command?.label ? command.label : '';
                inlineActionProps.push({ icon, label, commandId });
            }
        });
        return inlineActionProps;
    }

    protected override renderIcon(node: TreeNode, _props: NodeProps): React.ReactNode {
        if (TerminalManagerTreeTypes.isTerminalNode(node)) {
            return <span className={`${codicon('terminal')}`} />;
        } else if (TerminalManagerTreeTypes.isPageNode(node)) {
            return <span className={`${codicon('terminal-tmux')}`} />;
        } else if (TerminalManagerTreeTypes.isGroupNode(node)) {
            return <span className={`${codicon('split-horizontal')}`} />;
        }
        return undefined;
    }

    protected override toNodeName(node: TerminalManagerTreeTypes.TerminalManagerTreeNode): string {
        return node.label ?? 'node.id';
    }

    protected override onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        this.onDidChangeEmitter.fire(undefined);
    }

    protected override renderIndent(node: TreeNode, props: NodeProps): React.ReactNode {
        const renderIndentGuides = this.corePreferences['workbench.tree.renderIndentGuides'];
        if (renderIndentGuides === 'none') {
            return undefined;
        }

        const indentDivs: React.ReactNode[] = [];
        let current: TreeNode | undefined = node;
        let { depth } = props;
        while (current && depth) {
            const classNames: string[] = [TREE_NODE_INDENT_GUIDE_CLASS];
            if (this.needsActiveIndentGuideline(current)) {
                classNames.push('active');
            } else {
                classNames.push(renderIndentGuides === 'onHover' ? 'hover' : 'always');
            }
            const paddingLeft = this.props.leftPadding * depth;
            indentDivs.unshift(<div
                key={depth}
                className={classNames.join(' ')}
                style={{
                    paddingLeft: `${paddingLeft}px`,
                }}
            />);
            current = current.parent;
            depth -= 1;
        }
        return indentDivs;
    }

    protected override getDepthForNode(node: TreeNode, depths: Map<CompositeTreeNode | undefined, number>): number {
        const parentDepth = depths.get(node.parent);
        if (TerminalManagerTreeTypes.isTerminalNode(node) && parentDepth === undefined) {
            return 1;
        }
        return super.getDepthForNode(node, depths);
    }
}

