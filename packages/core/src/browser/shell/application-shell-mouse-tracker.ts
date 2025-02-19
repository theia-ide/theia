// *****************************************************************************
// Copyright (C) 2019 TypeFox and others.
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

import { FrontendApplicationContribution } from '../frontend-application-contribution';
import { ApplicationShell } from './application-shell';
import { injectable, inject } from 'inversify';
import { DisposableCollection, Disposable } from '../../common/disposable';
import { Emitter, Event } from '../../common/event';
import { FocusTracker, PanelLayout, SplitPanel } from '@lumino/widgets';
import { addEventListener, Widget } from '../widgets';
/**
 * Contribution that tracks `mouseup` and `mousedown` events.
 *
 * This is required to be able to track the `TabBar`, `DockPanel`, and `SidePanel` resizing and drag and drop events correctly
 * all over the application. By default, when the mouse is over an `iframe` we lose the mouse tracking ability, so whenever
 * we click (`mousedown`), we overlay a transparent `div` over the `iframe` in the Mini Browser, then we set the `display` of
 * the transparent `div` to `none` on `mouseup` events.
 */
@injectable()
export class ApplicationShellMouseTracker implements FrontendApplicationContribution {

    @inject(ApplicationShell)
    protected readonly applicationShell: ApplicationShell;

    protected readonly toDispose = new DisposableCollection();
    protected readonly toDisposeOnActiveChange = new DisposableCollection();

    protected readonly mouseupEmitter = new Emitter<MouseEvent>();
    protected readonly mousedownEmitter = new Emitter<MouseEvent>();
    protected readonly mouseupListener: (e: MouseEvent) => void = e => this.mouseupEmitter.fire(e);
    protected readonly mousedownListener: (e: MouseEvent) => void = e => this.mousedownEmitter.fire(e);

    onStart(): void {
        // Here we need to attach a `mousedown` listener to the `TabBar`s, `DockPanel`s and the `SidePanel`s. Otherwise, Lumino handles the event and stops the propagation.
        // Track the `mousedown` on the `TabBar` for the currently active widget.
        this.applicationShell.onDidChangeActiveWidget((args: FocusTracker.IChangedArgs<Widget>) => {
            this.toDisposeOnActiveChange.dispose();
            if (args.newValue) {
                const tabBar = this.applicationShell.getTabBarFor(args.newValue);
                if (tabBar) {
                    this.toDisposeOnActiveChange.push(addEventListener(tabBar.node, 'mousedown', this.mousedownListener, true));
                }
            }
        });

        // Track the `mousedown` events for the `SplitPanel`s, if any.
        const { layout } = this.applicationShell;
        if (layout instanceof PanelLayout) {
            this.toDispose.pushAll(
                layout.widgets.filter(ApplicationShellMouseTracker.isSplitPanel).map(splitPanel => addEventListener(splitPanel.node, 'mousedown', this.mousedownListener, true))
            );
        }
        // Track the `mousedown` on each `DockPanel`.
        const { mainPanel, bottomPanel, leftPanelHandler, rightPanelHandler } = this.applicationShell;
        this.toDispose.pushAll([mainPanel, bottomPanel, leftPanelHandler.dockPanel, rightPanelHandler.dockPanel]
            .map(panel => addEventListener(panel.node, 'mousedown', this.mousedownListener, true)));

        // The `mouseup` event has to be tracked on the `document`. Lumino attaches to there.
        document.addEventListener('mouseup', this.mouseupListener, true);

        // Make sure it is disposed in the end.
        this.toDispose.pushAll([
            this.mousedownEmitter,
            this.mouseupEmitter,
            Disposable.create(() => document.removeEventListener('mouseup', this.mouseupListener, true))
        ]);
    }

    onStop(): void {
        this.toDispose.dispose();
        this.toDisposeOnActiveChange.dispose();
    }

    get onMouseup(): Event<MouseEvent> {
        return this.mouseupEmitter.event;
    }

    get onMousedown(): Event<MouseEvent> {
        return this.mousedownEmitter.event;
    }

}

export namespace ApplicationShellMouseTracker {

    export function isSplitPanel(arg: Widget): arg is SplitPanel {
        return arg instanceof SplitPanel;
    }

}
