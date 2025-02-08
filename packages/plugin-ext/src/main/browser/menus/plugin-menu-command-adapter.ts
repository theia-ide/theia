// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
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

import { SelectionService, UriSelection } from '@theia/core';
import { ResourceContextKey } from '@theia/core/lib/browser/resource-context-key';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { URI as CodeUri } from '@theia/core/shared/vscode-uri';
import { TreeWidgetSelection } from '@theia/core/lib/browser/tree/tree-widget-selection';
import { ScmRepository } from '@theia/scm/lib/browser/scm-repository';
import { ScmService } from '@theia/scm/lib/browser/scm-service';
import { DirtyDiffWidget } from '@theia/scm/lib/browser/dirty-diff/dirty-diff-widget';
import { Change, LineRange } from '@theia/scm/lib/browser/dirty-diff/diff-computer';
import { IChange } from '@theia/monaco-editor-core/esm/vs/editor/common/diff/legacyLinesDiffComputer';
import { TimelineItem } from '@theia/timeline/lib/common/timeline-model';
import { ScmCommandArg, TimelineCommandArg, TreeViewItemReference } from '../../../common';
import { TestItemReference, TestMessageArg } from '../../../common/test-types';
import { PluginScmProvider, PluginScmResource, PluginScmResourceGroup } from '../scm-main';
import { TreeViewWidget } from '../view/tree-view-widget';
import { CodeEditorWidgetUtil, ContributionPoint } from './vscode-theia-menu-mappings';
import { TestItem, TestMessage } from '@theia/test/lib/browser/test-service';

export type ArgumentAdapter = (...args: unknown[]) => unknown[];
function identity(...args: unknown[]): unknown[] {
    return args;
}
@injectable()
export class PluginMenuCommandAdapter {
    @inject(ScmService) private readonly scmService: ScmService;
    @inject(SelectionService) private readonly selectionService: SelectionService;
    @inject(ResourceContextKey) private readonly resourceContextKey: ResourceContextKey;

    protected readonly argumentAdapters = new Map<string, ArgumentAdapter>();

    @postConstruct()
    protected init(): void {
        const toCommentArgs: ArgumentAdapter = (...args) => this.toCommentArgs(...args);
        const toTestMessageArgs: ArgumentAdapter = (...args) => this.toTestMessageArgs(...args);
        const firstArgOnly: ArgumentAdapter = (...args) => [args[0]];
        const noArgs: ArgumentAdapter = () => [];
        const toScmArgs: ArgumentAdapter = (...args) => this.toScmArgs(...args);
        const selectedResource = () => this.getSelectedResources();
        const widgetURI: ArgumentAdapter = widget => CodeEditorWidgetUtil.is(widget) ? [CodeEditorWidgetUtil.getResourceUri(widget)] : [];
        (<Array<[ContributionPoint, ArgumentAdapter]>>[
            ['comments/comment/context', toCommentArgs],
            ['comments/comment/title', toCommentArgs],
            ['comments/commentThread/context', toCommentArgs],
            ['debug/callstack/context', firstArgOnly],
            ['debug/variables/context', firstArgOnly],
            ['debug/toolBar', noArgs],
            ['editor/context', selectedResource],
            ['editor/title', widgetURI],
            ['editor/title/context', selectedResource],
            ['editor/title/run', widgetURI],
            ['explorer/context', selectedResource],
            ['scm/resourceFolder/context', toScmArgs],
            ['scm/resourceGroup/context', toScmArgs],
            ['scm/resourceState/context', toScmArgs],
            ['scm/title', () => [this.toScmArg(this.scmService.selectedRepository)]],
            ['testing/message/context', toTestMessageArgs],
            ['testing/profiles/context', noArgs],
            ['scm/change/title', (...args) => this.toScmChangeArgs(...args)],
            ['timeline/item/context', (...args) => this.toTimelineArgs(...args)],
            ['view/item/context', (...args) => this.toTreeArgs(...args)],
            ['view/title', noArgs],
            ['webview/context', firstArgOnly],
            ['extension/context', noArgs],
            ['terminal/context', noArgs],
            ['terminal/title/context', noArgs],
        ]).forEach(([contributionPoint, adapter]) => {
            this.argumentAdapters.set(contributionPoint, adapter);
        });
    }

    getArgumentAdapter(contributionPoint: string): ArgumentAdapter {
        return this.argumentAdapters.get(contributionPoint) || identity;
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */

    protected toCommentArgs(...args: any[]): any[] {
        const arg = args[0];
        if ('text' in arg) {
            if ('commentUniqueId' in arg) {
                return [{
                    commentControlHandle: arg.thread.controllerHandle,
                    commentThreadHandle: arg.thread.commentThreadHandle,
                    text: arg.text,
                    commentUniqueId: arg.commentUniqueId
                }];
            }
            return [{
                commentControlHandle: arg.thread.controllerHandle,
                commentThreadHandle: arg.thread.commentThreadHandle,
                text: arg.text
            }];
        }
        return [{
            commentControlHandle: arg.thread.controllerHandle,
            commentThreadHandle: arg.thread.commentThreadHandle,
            commentUniqueId: arg.commentUniqueId
        }];
    }

    protected toScmArgs(...args: any[]): any[] {
        const scmArgs: any[] = [];
        for (const arg of args) {
            const scmArg = this.toScmArg(arg);
            if (scmArg) {
                scmArgs.push(scmArg);
            }
        }
        return scmArgs;
    }

    protected toScmArg(arg: any): ScmCommandArg | undefined {
        if (arg instanceof ScmRepository && arg.provider instanceof PluginScmProvider) {
            return {
                sourceControlHandle: arg.provider.handle
            };
        }
        if (arg instanceof PluginScmResourceGroup) {
            return {
                sourceControlHandle: arg.provider.handle,
                resourceGroupHandle: arg.handle
            };
        }
        if (arg instanceof PluginScmResource) {
            return {
                sourceControlHandle: arg.group.provider.handle,
                resourceGroupHandle: arg.group.handle,
                resourceStateHandle: arg.handle
            };
        }
    }

    protected toScmChangeArgs(...args: any[]): any[] {
        const arg = args[0];
        if (arg instanceof DirtyDiffWidget) {
            const toIChange = (change: Change): IChange => {
                const convert = (range: LineRange): [number, number] => {
                    let startLineNumber;
                    let endLineNumber;
                    if (!LineRange.isEmpty(range)) {
                        startLineNumber = range.start + 1;
                        endLineNumber = range.end;
                    } else {
                        startLineNumber = range.start;
                        endLineNumber = 0;
                    }
                    return [startLineNumber, endLineNumber];
                };
                const { previousRange, currentRange } = change;
                const [originalStartLineNumber, originalEndLineNumber] = convert(previousRange);
                const [modifiedStartLineNumber, modifiedEndLineNumber] = convert(currentRange);
                return {
                    originalStartLineNumber,
                    originalEndLineNumber,
                    modifiedStartLineNumber,
                    modifiedEndLineNumber
                };
            };
            return [
                arg.uri['codeUri'],
                arg.changes.map(toIChange),
                arg.currentChangeIndex
            ];
        }
        return [];
    }

    protected toTimelineArgs(...args: any[]): any[] {
        const timelineArgs: any[] = [];
        const arg = args[0];
        timelineArgs.push(this.toTimelineArg(arg));
        timelineArgs.push(CodeUri.parse(arg.uri));
        timelineArgs.push(arg.source ?? '');
        return timelineArgs;
    }

    protected toTestMessageArgs(...args: any[]): any[] {
        let testItem: TestItem | undefined;
        let testMessage: TestMessage | undefined;
        for (const arg of args) {
            if (TestItem.is(arg)) {
                testItem = arg;
            } else if (Array.isArray(arg) && TestMessage.is(arg[0])) {
                testMessage = arg[0];
            }
        }
        if (testMessage) {
            const testItemReference = (testItem && testItem.controller) ? TestItemReference.create(testItem.controller.id, testItem.path) : undefined;
            const testMessageDTO = {
                message: testMessage.message,
                actual: testMessage.actual,
                expected: testMessage.expected,
                contextValue: testMessage.contextValue,
                location: testMessage.location,
                stackTrace: testMessage.stackTrace
            };
            return [TestMessageArg.create(testItemReference, testMessageDTO)];
        }
        return [];
    }

    protected toTimelineArg(arg: TimelineItem): TimelineCommandArg {
        return {
            timelineHandle: arg.handle,
            source: arg.source,
            uri: arg.uri
        };
    }

    protected toTreeArgs(...args: any[]): any[] {
        const treeArgs: any[] = [];
        for (const arg of args) {
            if (TreeViewItemReference.is(arg)) {
                treeArgs.push(arg);
            } else if (Array.isArray(arg)) {
                treeArgs.push(arg.filter(TreeViewItemReference.is));
            }
        }
        return treeArgs;
    }

    protected getSelectedResources(): [CodeUri | TreeViewItemReference | undefined, CodeUri[] | undefined] {
        const selection = this.selectionService.selection;
        const resourceKey = this.resourceContextKey.get();
        const resourceUri = resourceKey ? CodeUri.parse(resourceKey) : undefined;
        const firstMember = TreeWidgetSelection.is(selection) && selection.source instanceof TreeViewWidget && selection[0]
            ? selection.source.toTreeViewItemReference(selection[0])
            : UriSelection.getUri(selection)?.['codeUri'] ?? resourceUri;
        const secondMember = TreeWidgetSelection.is(selection)
            ? UriSelection.getUris(selection).map(uri => uri['codeUri'])
            : undefined;
        return [firstMember, secondMember];
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
}
