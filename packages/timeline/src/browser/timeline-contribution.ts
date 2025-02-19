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

import { injectable, inject } from '@theia/core/shared/inversify';
import {
    ViewContainer,
    WidgetManager,
    Widget,
    ApplicationShell,
    Navigatable,
    codicon
} from '@theia/core/lib/browser';
import { EXPLORER_VIEW_CONTAINER_ID } from '@theia/navigator/lib/browser';
import { TimelineWidget } from './timeline-widget';
import { TimelineService } from './timeline-service';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { TabBarToolbarContribution, TabBarToolbarRegistry } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { toArray } from '@theia/core/shared/@lumino/algorithm';
import { LOAD_MORE_COMMAND } from './timeline-tree-model';

@injectable()
export class TimelineContribution implements CommandContribution, TabBarToolbarContribution {

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;
    @inject(TimelineService)
    protected readonly timelineService: TimelineService;
    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;
    @inject(TabBarToolbarRegistry)
    protected readonly tabBarToolbar: TabBarToolbarRegistry;
    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    /** @deprecated @since 1.28.0. Import from timeline-tree-model instead */
    public static readonly LOAD_MORE_COMMAND = LOAD_MORE_COMMAND;
    private readonly toolbarItem = {
        id: 'timeline-refresh-toolbar-item',
        command: 'timeline-refresh',
        tooltip: 'Refresh',
        icon: codicon('refresh')
    };
    registerToolbarItems(registry: TabBarToolbarRegistry): void {
        registry.registerItem(this.toolbarItem);
    }
    registerCommands(commands: CommandRegistry): void {
        const attachTimeline = async (explorer: Widget) => {
            const timeline = await this.widgetManager.getOrCreateWidget(TimelineWidget.ID);
            if (explorer instanceof ViewContainer && explorer.getTrackableWidgets().indexOf(timeline) === -1) {
                explorer.addWidget(timeline, { initiallyCollapsed: true });
            }
        };
        this.widgetManager.onWillCreateWidget(async event => {
            if (event.widget.id === EXPLORER_VIEW_CONTAINER_ID && this.timelineService.getSources().length > 0) {
                event.waitUntil(attachTimeline(event.widget));
            }
        });
        this.timelineService.onDidChangeProviders(async event => {
            const explorer = await this.widgetManager.getWidget(EXPLORER_VIEW_CONTAINER_ID);
            if (explorer && event.added && event.added.length > 0) {
                attachTimeline(explorer);
            } else if (event.removed && this.timelineService.getSources().length === 0) {
                const timeline = await this.widgetManager.getWidget(TimelineWidget.ID);
                if (timeline) {
                    timeline.close();
                }
            }
        });
        commands.registerCommand(LOAD_MORE_COMMAND, {
            execute: async () => {
                const widget = toArray(this.shell.mainPanel.widgets()).find(w => Navigatable.is(w) && w.isVisible && !w.isHidden);
                if (Navigatable.is(widget)) {
                    const uri = widget.getResourceUri();
                    const timeline = await this.widgetManager.getWidget<TimelineWidget>(TimelineWidget.ID);
                    if (uri && timeline) {
                        timeline.loadTimeline(uri, false);
                    }
                }
            }
        });
        commands.registerCommand({ id: this.toolbarItem.command }, {
            execute: widget => this.checkWidget(widget, async () => {
                const timeline = await this.widgetManager.getWidget(TimelineWidget.ID);
                if (timeline) {
                    timeline.update();
                }
            }),
            isEnabled: widget => this.checkWidget(widget, () => true),
            isVisible: widget => this.checkWidget(widget, () => true)
        });
    }

    private checkWidget<T>(widget: Widget, cb: () => T): T | false {
        if (widget instanceof TimelineWidget && widget.id === TimelineWidget.ID) {
            return cb();
        }
        return false;
    }
}
