// *****************************************************************************
// Copyright (C) 2020 EclipseSource and others.
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
import { Disposable, SelectionService } from '@theia/core';
import { BaseWidget, codicon, MessageLoop, Widget } from '@theia/core/lib/browser/widgets/widget';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { PropertyViewContentWidget } from './property-view-content-widget';
import { PropertyViewService } from './property-view-service';
import { nls } from '@theia/core/lib/common/nls';

/**
 * The main container for the selection-specific property widgets.
 * Based on the given selection, the registered `PropertyViewWidgetProvider` provides the
 * content widget that displays the corresponding properties.
 */
@injectable()
export class PropertyViewWidget extends BaseWidget {

    static readonly ID = 'property-view';
    static readonly LABEL = nls.localize('theia/property-view/properties', 'Properties');

    protected contentWidget: PropertyViewContentWidget;

    protected override toDisposeOnDetach = new DisposableCollection();

    @inject(PropertyViewService) protected readonly propertyViewService: PropertyViewService;
    @inject(SelectionService) protected readonly selectionService: SelectionService;

    @postConstruct()
    init(): void {
        this.id = PropertyViewWidget.ID;
        this.title.label = PropertyViewWidget.LABEL;
        this.title.caption = PropertyViewWidget.LABEL;
        this.title.iconClass = codicon('table');
        this.title.closable = true;

        this.addClass('theia-property-view-widget');
        this.node.tabIndex = 0;

        let disposed = false;
        this.toDispose.push(Disposable.create(() => disposed = true));
        this.toDispose.push(this.selectionService.onSelectionChanged((selection: Object | undefined) => {
            this.propertyViewService.getProvider(selection).then(provider => {
                provider.provideWidget(selection).then(contentWidget => {
                    if (!disposed) {
                        this.replaceContentWidget(contentWidget);
                        provider.updateContentWidget(selection);
                    }
                });
            });
        }));
    }

    protected initializeContentWidget(selection: Object | undefined): void {
        this.propertyViewService.getProvider(selection).then(provider => {
            provider.provideWidget(selection).then(contentWidget => {
                this.attachContentWidget(contentWidget);
                provider.updateContentWidget(selection);
            });
        });
    }

    protected replaceContentWidget(newContentWidget: PropertyViewContentWidget): void {
        if (this.contentWidget.id !== newContentWidget.id) {
            if (this.contentWidget) {
                Widget.detach(this.contentWidget);
            }
            this.attachContentWidget(newContentWidget);
        }
    }

    protected attachContentWidget(newContentWidget: PropertyViewContentWidget): void {
        this.contentWidget = newContentWidget;
        Widget.attach(this.contentWidget, this.node);
        this.toDisposeOnDetach = new DisposableCollection();
        this.toDisposeOnDetach.push(Disposable.create(() => {
            if (this.contentWidget) {
                Widget.detach(this.contentWidget);
            }
        }));
        this.update();
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.initializeContentWidget(this.selectionService.selection);
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
        if (this.contentWidget) {
            this.contentWidget.activate();
        }
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        super.onResize(msg);
        if (this.contentWidget) {
            MessageLoop.sendMessage(this.contentWidget, msg);
        }
    }
}
