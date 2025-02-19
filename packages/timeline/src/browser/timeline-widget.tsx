// *****************************************************************************
// Copyright (C) 2020 RedHat and others.
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

import { Message } from '@theia/core/shared/@lumino/messaging';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import {
    ApplicationShell,
    BaseWidget,
    MessageLoop, Navigatable,
    NavigatableWidget,
    Panel,
    PanelLayout
} from '@theia/core/lib/browser';
import { TimelineTreeWidget } from './timeline-tree-widget';
import { TimelineService, TimelineAggregate } from './timeline-service';
import { CommandRegistry, SelectionService } from '@theia/core/lib/common';
import { TimelineEmptyWidget } from './timeline-empty-widget';
import { toArray } from '@theia/core/shared/@lumino/algorithm';
import URI from '@theia/core/lib/common/uri';
import { URI as CodeURI } from '@theia/core/shared/vscode-uri';
import { nls } from '@theia/core/lib/common/nls';

@injectable()
export class TimelineWidget extends BaseWidget {

    protected panel: Panel;
    static ID = 'timeline-view';

    private readonly timelinesBySource = new Map<string, TimelineAggregate>();

    @inject(TimelineTreeWidget) protected readonly resourceWidget: TimelineTreeWidget;
    @inject(TimelineService) protected readonly timelineService: TimelineService;
    @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry;
    @inject(ApplicationShell) protected readonly applicationShell: ApplicationShell;
    @inject(TimelineEmptyWidget) protected readonly timelineEmptyWidget: TimelineEmptyWidget;
    @inject(SelectionService) protected readonly selectionService: SelectionService;

    constructor() {
        super();
        this.id = TimelineWidget.ID;
        this.title.label = nls.localizeByDefault('Timeline');
        this.title.caption = this.title.label;
        this.addClass('theia-timeline');
    }

    @postConstruct()
    protected init(): void {
        const layout = new PanelLayout();
        this.layout = layout;
        this.panel = new Panel({ layout: new PanelLayout({}) });
        this.panel.node.tabIndex = -1;
        layout.addWidget(this.panel);
        this.containerLayout!.addWidget(this.resourceWidget);
        this.containerLayout!.addWidget(this.timelineEmptyWidget);

        this.refresh();
        this.toDispose.push(this.timelineService.onDidChangeTimeline(event => {
            const currentWidgetUri = this.getCurrentWidgetUri();
            if (currentWidgetUri) {
                this.loadTimeline(currentWidgetUri, event.reset);
            }
        })
        );
        this.toDispose.push(this.selectionService.onSelectionChanged(selection => {
            if (Array.isArray(selection) && !!selection[0] && 'uri' in selection[0]) {
                this.refresh(selection[0].uri);
            }
        }));
        this.toDispose.push(this.applicationShell.onDidChangeCurrentWidget(async e => {
            if ((e.newValue && Navigatable.is(e.newValue)) || !this.suitableWidgetsOpened()) {
                this.refresh();
            }
        }));
        this.toDispose.push(this.applicationShell.onDidRemoveWidget(widget => {
            if (NavigatableWidget.is(widget)) {
                this.refresh();
            }
        }));
        this.toDispose.push(this.timelineService.onDidChangeProviders(() => this.refresh()));
    }

    protected async loadTimelineForSource(source: string, uri: CodeURI, reset: boolean): Promise<void> {
        if (reset) {
            this.timelinesBySource.delete(source);
        }
        let timeline = this.timelinesBySource.get(source);
        const cursor = timeline?.cursor;
        const options = { cursor: reset ? undefined : cursor, limit: TimelineTreeWidget.PAGE_SIZE };
        const timelineResult = await this.timelineService.getTimeline(source, uri, options, { cacheResults: true, resetCache: reset });
        if (timelineResult) {
            const items = timelineResult.items;
            if (items) {
                if (timeline) {
                    timeline.add(items);
                    timeline.cursor = timelineResult.paging?.cursor;
                } else {
                    timeline = new TimelineAggregate(timelineResult);
                }
                this.timelinesBySource.set(source, timeline);
                this.resourceWidget.model.updateTree(timeline.items, !!timeline.cursor);
            }
        }
    }

    async loadTimeline(uri: URI, reset: boolean): Promise<void> {
        for (const source of this.timelineService.getSources().map(s => s.id)) {
            this.loadTimelineForSource(source, CodeURI.parse(uri.toString()), reset);
        }
    }

    refresh(uri?: URI): void {
        if (!uri) {
            uri = this.getCurrentWidgetUri();
        }
        if (uri) {
            this.timelineEmptyWidget.hide();
            this.resourceWidget.show();
            this.loadTimeline(uri, true);
        } else if (!this.suitableWidgetsOpened()) {
            this.timelineEmptyWidget.show();
            this.resourceWidget.hide();
        }
    }

    private suitableWidgetsOpened(): boolean {
        return !!toArray(this.applicationShell.mainPanel.widgets()).find(widget => {
            if (NavigatableWidget.is(widget)) {
                const uri = widget.getResourceUri();
                if (uri?.scheme && this.timelineService.getSchemas().indexOf(uri?.scheme) > -1) {
                    return true;
                }
            }
        });
    }

    private getCurrentWidgetUri(): URI | undefined {
        let current = this.applicationShell.currentWidget;
        if (!NavigatableWidget.is(current)) {
            current = toArray(this.applicationShell.mainPanel.widgets()).find(widget => {
                if (widget.isVisible && !widget.isHidden) {
                    return widget;
                }
            });
        }
        return NavigatableWidget.is(current) ? current.getResourceUri() : undefined;
    }

    protected get containerLayout(): PanelLayout | undefined {
        return this.panel.layout as PanelLayout;
    }

    protected override onUpdateRequest(msg: Message): void {
        MessageLoop.sendMessage(this.resourceWidget, msg);
        MessageLoop.sendMessage(this.timelineEmptyWidget, msg);
        this.refresh();
        super.onUpdateRequest(msg);
    }

    protected override onAfterAttach(msg: Message): void {
        this.node.appendChild(this.resourceWidget.node);
        this.node.appendChild(this.timelineEmptyWidget.node);
        super.onAfterAttach(msg);
        this.update();
    }

}
