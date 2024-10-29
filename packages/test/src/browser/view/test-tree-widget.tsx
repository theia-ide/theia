// *****************************************************************************
// Copyright (C) 2023 STMicroelectronics and others.
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
    TreeWidget, TreeModel, TreeProps, CompositeTreeNode, ExpandableTreeNode, TreeNode, TreeImpl, NodeProps,
    TREE_NODE_SEGMENT_CLASS, TREE_NODE_TAIL_CLASS, SelectableTreeNode
} from '@theia/core/lib/browser/tree';
import { ACTION_ITEM, ContextMenuRenderer, KeybindingRegistry, codicon } from '@theia/core/lib/browser';
import { IconThemeService } from '@theia/core/lib/browser/icon-theme-service';
import { ThemeService } from '@theia/core/lib/browser/theming';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { TestController, TestExecutionState, TestItem, TestService } from '../test-service';
import * as React from '@theia/core/shared/react';
import { DeltaKind, TreeDelta } from '../../common/tree-delta';
import { AcceleratorSource, CommandMenu, CommandRegistry, Disposable, DisposableCollection, Event, MenuModelRegistry, nls } from '@theia/core';
import { TestExecutionStateManager } from './test-execution-state-manager';
import { TestOutputUIModel } from './test-output-ui-model';
import { TEST_VIEW_INLINE_MENU } from './test-view-contribution';

const ROOT_ID = 'TestTree';

export interface TestRoot extends CompositeTreeNode {
    children: TestControllerNode[];
}
export namespace TestRoot {
    export function is(node: unknown): node is TestRoot {
        return CompositeTreeNode.is(node) && node.id === ROOT_ID;
    }
}
export interface TestControllerNode extends ExpandableTreeNode {
    controller: TestController;
}

export namespace TestControllerNode {
    export function is(node: unknown): node is TestControllerNode {
        return ExpandableTreeNode.is(node) && 'controller' in node;
    }
}

export interface TestItemNode extends TreeNode {
    controller: TestController;
    testItem: TestItem;
}

export namespace TestItemNode {
    export function is(node: unknown): node is TestItemNode {
        return TreeNode.is(node) && 'testItem' in node;
    }
}

@injectable()
export class TestTree extends TreeImpl {
    @inject(TestService) protected readonly testService: TestService;

    private controllerListeners = new Map<string, Disposable>();

    @postConstruct()
    init(): void {
        this.testService.getControllers().forEach(controller => this.addController(controller));
        this.testService.onControllersChanged(e => {
            e.removed?.forEach(controller => {
                this.controllerListeners.get(controller)?.dispose();
            });

            e.added?.forEach(controller => this.addController(controller));

            this.refresh(this.root as CompositeTreeNode);
        });
    }

    protected addController(controller: TestController): void {
        const listeners = new DisposableCollection();
        this.controllerListeners.set(controller.id, listeners);
        listeners.push(controller.onItemsChanged(delta => {
            this.processDeltas(controller, controller, delta);
        }));
    }

    protected override async resolveChildren(parent: CompositeTreeNode): Promise<TreeNode[]> {
        if (TestItemNode.is(parent)) {
            parent.testItem.resolveChildren();
            return Promise.resolve(parent.testItem.tests.map(test => this.createTestNode(parent.controller, parent, test)));
        } else if (TestControllerNode.is(parent)) {
            return Promise.resolve(parent.controller.tests.map(test => this.createTestNode(parent.controller, parent, test)));
        } else if (TestRoot.is(parent)) {
            return Promise.resolve(this.testService.getControllers().map(controller => this.createControllerNode(parent, controller)));
        } else {
            return Promise.resolve([]);
        }
    }

    createControllerNode(parent: CompositeTreeNode, controller: TestController): TestControllerNode {
        const node: TestControllerNode = {
            id: controller.id,
            name: controller.label,
            controller: controller,
            expanded: false,
            children: [],
            parent: parent
        };

        return node;
    }

    protected processDeltas(controller: TestController, parent: TestItem | TestController, deltas: TreeDelta<string, TestItem>[]): void {
        deltas.forEach(delta => this.processDelta(controller, parent, delta));
    }

    protected processDelta(controller: TestController, parent: TestItem | TestController, delta: TreeDelta<string, TestItem>): void {
        if (delta.type === DeltaKind.ADDED || delta.type === DeltaKind.REMOVED) {
            let node;
            if (parent === controller && delta.path.length === 1) {
                node = this.getNode(this.computeId([controller.id]));
            } else {
                const item = this.findInParent(parent, delta.path.slice(0, delta.path.length - 1), 0);
                if (item) {
                    node = this.getNode(this.computeId(this.computePath(controller, item as TestItem)));
                }
            }
            if (node) {
                this.refresh(node as CompositeTreeNode); // we only have composite tree nodes in this tree
            } else {
                console.warn('delta for unknown test item');
            }
        } else {
            const item = this.findInParent(parent, delta.path, 0);
            if (item) {
                if (delta.type === DeltaKind.CHANGED) {
                    this.fireChanged();
                }
                if (delta.childDeltas) {
                    this.processDeltas(controller, item, delta.childDeltas);
                }
            } else {
                console.warn('delta for unknown test item');
            }
        }
    }

    protected findInParent(root: TestItem | TestController, path: string[], startIndex: number): TestItem | TestController | undefined {
        if (startIndex >= path.length) {
            return root;
        }
        const child = root.tests.find(candidate => candidate.id === path[startIndex]);
        if (!child) {
            return undefined;
        }
        return this.findInParent(child, path, startIndex + 1);
    }

    protected computePath(controller: TestController, item: TestItem): string[] {
        const result: string[] = [controller.id];
        let current: TestItem | undefined = item;
        while (current) {
            result.unshift(current.id);
            current = current.parent;
        }
        return result;
    }

    protected computeId(path: string[]): string {
        return path.map(id => id.replace('/', '//')).join('/');
    }

    createTestNode(controller: TestController, parent: CompositeTreeNode, test: TestItem): TestItemNode {
        const previous = this.getNode(test.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = {
            id: this.computeId(this.computePath(controller, test)),
            name: test.label,
            controller: controller,
            testItem: test,
            expanded: ExpandableTreeNode.is(previous) ? previous.expanded : undefined,
            selected: false,
            children: [] as TestItemNode[],
            parent: parent
        };
        result.children = test.tests.map(t => this.createTestNode(controller, result, t));
        if (result.children.length === 0 && !test.canResolveChildren) {
            delete result.expanded;
        }
        return result;
    }
}

@injectable()
export class TestTreeWidget extends TreeWidget {

    static ID = 'test-tree-widget';

    static TEST_CONTEXT_MENU = ['RESOURCE_CONTEXT_MENU'];

    @inject(IconThemeService) protected readonly iconThemeService: IconThemeService;
    @inject(ContextKeyService) protected readonly contextKeys: ContextKeyService;
    @inject(ThemeService) protected readonly themeService: ThemeService;
    @inject(TestExecutionStateManager) protected readonly stateManager: TestExecutionStateManager;
    @inject(TestOutputUIModel) protected uiModel: TestOutputUIModel;
    @inject(MenuModelRegistry) protected readonly menus: MenuModelRegistry;
    @inject(CommandRegistry) readonly commands: CommandRegistry;
    @inject(KeybindingRegistry) protected readonly keybindings: KeybindingRegistry;

    constructor(
        @inject(TreeProps) props: TreeProps,
        @inject(TreeModel) model: TreeModel,
        @inject(ContextMenuRenderer) contextMenuRenderer: ContextMenuRenderer,
    ) {
        super(props, model, contextMenuRenderer);
        this.id = TestTreeWidget.ID;
        this.title.label = nls.localizeByDefault('Test Explorer');
        this.title.caption = nls.localizeByDefault('Test Explorer');
        this.title.iconClass = codicon('beaker');
        this.title.closable = true;
    }

    @postConstruct()
    protected override init(): void {
        super.init();
        this.addClass('theia-test-view');
        this.model.root = {
            id: ROOT_ID,
            parent: undefined,
            visible: false,
            children: []
        } as TestRoot;

        this.uiModel.onDidChangeActiveTestRun(e => this.update());
        this.uiModel.onDidChangeActiveTestState(() => this.update());

        this.model.onSelectionChanged(() => {
            const that = this;
            const node = this.model.selectedNodes[0];
            if (TestItemNode.is(node)) {
                const run = that.uiModel.getActiveTestRun(node.controller);
                if (run) {
                    const output = run?.getOutput(node.testItem);
                    if (output) {
                        this.uiModel.selectedOutputSource = {
                            output: output,
                            onDidAddTestOutput: Event.map(run.onDidChangeTestOutput, evt => evt.filter(item => item[0] === node.testItem).map(item => item[1]))
                        };
                    }
                    this.uiModel.selectedTestState = run.getTestState(node.testItem);
                }
            }
        });
    }

    protected override renderTree(model: TreeModel): React.ReactNode {
        if (TestRoot.is(model.root) && model.root.children.length > 0) {
            return super.renderTree(model);
        }
        return <div className='theia-widget-noInfo noMarkers'>{nls.localizeByDefault('No tests have been found in this workspace yet.')}</div>;
    }

    protected getTestStateClass(state: TestExecutionState | undefined): string {
        switch (state) {
            case TestExecutionState.Queued: return `${codicon('history')} queued`;
            case TestExecutionState.Running: return `${codicon('sync')} codicon-modifier-spin running`;
            case TestExecutionState.Skipped: return `${codicon('debug-step-over')} skipped`;
            case TestExecutionState.Failed: return `${codicon('error')} failed`;
            case TestExecutionState.Errored: return `${codicon('issues')} errored`;
            case TestExecutionState.Passed: return `${codicon('pass')} passed`;
            case TestExecutionState.Running: return `${codicon('sync-spin')} running`;
            default: return codicon('circle');
        }
    }

    protected override renderIcon(node: TreeNode, props: NodeProps): React.ReactNode {
        if (TestItemNode.is(node)) {
            const currentRun = this.uiModel.getActiveTestRun(node.controller);
            let state;
            if (currentRun) {
                state = currentRun.getTestState(node.testItem)?.state;
                if (!state) {
                    state = this.stateManager.getComputedState(currentRun, node.testItem);
                }
            }
            return <div className={this.getTestStateClass(state)}></div >;
        } else {
            return super.renderIcon(node, props);
        }
    }

    protected override renderTailDecorations(node: TreeNode, props: NodeProps): React.ReactNode {
        if (TestItemNode.is(node)) {
            const testItem = node.testItem;
            return this.contextKeys.with({ view: this.id, controllerId: node.controller.id, testId: testItem.id, testItemHasUri: !!testItem.uri }, () => {
                const menu = this.menus.getMenu(TEST_VIEW_INLINE_MENU);
                const args = [node.testItem];
                const inlineCommands = menu.children.filter((item): item is CommandMenu => CommandMenu.is(item));
                const tailDecorations = super.renderTailDecorations(node, props);
                return <React.Fragment>
                    {inlineCommands.length > 0 && <div className={TREE_NODE_SEGMENT_CLASS + ' flex'}>
                        {inlineCommands.map((item, index) => this.renderInlineCommand(item, index, this.focusService.hasFocus(node), args))}
                    </div>}
                    {tailDecorations !== undefined && <div className={TREE_NODE_SEGMENT_CLASS + ' flex'}>{tailDecorations}</div>}
                </React.Fragment>;
            });
        } else {
            return super.renderTailDecorations(node, props);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected renderInlineCommand(actionMenuNode: CommandMenu, index: number, tabbable: boolean, args: any[]): React.ReactNode {
        if (!actionMenuNode.icon || !actionMenuNode.isVisible(TEST_VIEW_INLINE_MENU, this.contextKeys, this.node, ...args)) {
            return false;
        }
        const className = [TREE_NODE_SEGMENT_CLASS, TREE_NODE_TAIL_CLASS, actionMenuNode.icon, ACTION_ITEM, 'theia-test-tree-inline-action'].join(' ');
        const tabIndex = tabbable ? 0 : undefined;
        const titleString = actionMenuNode.label + (AcceleratorSource.is(actionMenuNode) ? actionMenuNode.getAccelerator(undefined).join(' ') : '');

        return <div key={index} className={className} title={titleString} tabIndex={tabIndex} onClick={e => {
            e.stopPropagation();
            actionMenuNode.run(TEST_VIEW_INLINE_MENU, ...args);
        }} />;
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

    protected override toContextMenuArgs(node: SelectableTreeNode): (TestItem)[] {
        if (TestItemNode.is(node)) {
            return [node.testItem];
        }
        return [];
    }

    override storeState(): object {
        return {}; // don't store any state for now
    }
}
