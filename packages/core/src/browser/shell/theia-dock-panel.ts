// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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

import { find, toArray } from '@lumino/algorithm';
import { TabBar, Widget, DockPanel, Title, DockLayout } from '@lumino/widgets';
import { Signal } from '@lumino/signaling';
import { Disposable, DisposableCollection } from '../../common/disposable';
import { UnsafeWidgetUtilities } from '../widgets';
import { CorePreferences } from '../core-preferences';
import { Emitter, Event, environment } from '../../common';

export const MAXIMIZED_CLASS = 'theia-maximized';
export const ACTIVE_TABBAR_CLASS = 'theia-tabBar-active';
const VISIBLE_MENU_MAXIMIZED_CLASS = 'theia-visible-menu-maximized';

export const MAIN_AREA_ID = 'theia-main-content-panel';
export const BOTTOM_AREA_ID = 'theia-bottom-content-panel';

/**
 * This specialization of DockPanel adds various events that are used for implementing the
 * side panels of the application shell.
 */
export class TheiaDockPanel extends DockPanel {

    /**
     * Emitted when a widget is added to the panel.
     */
    readonly widgetAdded = new Signal<this, Widget>(this);
    /**
     * Emitted when a widget is activated by calling `activateWidget`.
     */
    readonly widgetActivated = new Signal<this, Widget>(this);
    /**
     * Emitted when a widget is removed from the panel.
     */
    readonly widgetRemoved = new Signal<this, Widget>(this);

    protected readonly onDidToggleMaximizedEmitter = new Emitter<Widget>();
    readonly onDidToggleMaximized = this.onDidToggleMaximizedEmitter.event;
    protected readonly onDidChangeCurrentEmitter = new Emitter<Title<Widget> | undefined>();
    get onDidChangeCurrent(): Event<Title<Widget> | undefined> {
        return this.onDidChangeCurrentEmitter.event;
    }

    constructor(options?: DockPanel.IOptions,
        protected readonly preferences?: CorePreferences
    ) {
        super(options);
        this['_onCurrentChanged'] = (sender: TabBar<Widget>, args: TabBar.ICurrentChangedArgs<Widget>) => {
            this.markAsCurrent(args.currentTitle || undefined);
            super['_onCurrentChanged'](sender, args);
        };
        this['_onTabActivateRequested'] = (sender: TabBar<Widget>, args: TabBar.ITabActivateRequestedArgs<Widget>) => {
            this.markAsCurrent(args.title);
            super['_onTabActivateRequested'](sender, args);
        };
        if (preferences) {
            preferences.onPreferenceChanged(preference => {
                if (!this.isElectron() && preference.preferenceName === 'window.menuBarVisibility' && (preference.newValue === 'visible' || preference.oldValue === 'visible')) {
                    this.handleMenuBarVisibility(preference.newValue);
                }
            });
        }
    }

    isElectron(): boolean {
        return environment.electron.is();
    }

    protected handleMenuBarVisibility(newValue: string): void {
        const areaContainer = this.node.parentElement;
        const maximizedElement = this.getMaximizedElement();

        if (areaContainer === maximizedElement) {
            if (newValue === 'visible') {
                this.addClass(VISIBLE_MENU_MAXIMIZED_CLASS);
            } else {
                this.removeClass(VISIBLE_MENU_MAXIMIZED_CLASS);
            }
        }
    }

    protected _currentTitle: Title<Widget> | undefined;
    get currentTitle(): Title<Widget> | undefined {
        return this._currentTitle;
    }

    get currentTabBar(): TabBar<Widget> | undefined {
        return this._currentTitle && this.findTabBar(this._currentTitle);
    }

    findTabBar(title: Title<Widget>): TabBar<Widget> | undefined {
        return find(this.tabBars(), bar => bar.titles.includes(title));
    }

    protected readonly toDisposeOnMarkAsCurrent = new DisposableCollection();
    markAsCurrent(title: Title<Widget> | undefined): void {
        this.toDisposeOnMarkAsCurrent.dispose();
        this._currentTitle = title;
        this.markActiveTabBar(title);
        if (title) {
            const resetCurrent = () => this.markAsCurrent(undefined);
            title.owner.disposed.connect(resetCurrent);
            this.toDisposeOnMarkAsCurrent.push(Disposable.create(() =>
                title.owner.disposed.disconnect(resetCurrent)
            ));
        }
        this.onDidChangeCurrentEmitter.fire(title);
    }

    markActiveTabBar(title?: Title<Widget>): void {
        const tabBars = toArray(this.tabBars());
        tabBars.forEach(tabBar => tabBar.removeClass(ACTIVE_TABBAR_CLASS));
        const activeTabBar = title && this.findTabBar(title);
        if (activeTabBar) {
            activeTabBar.addClass(ACTIVE_TABBAR_CLASS);
        } else if (tabBars.length > 0) {
            // At least one tabbar needs to be active
            tabBars[0].addClass(ACTIVE_TABBAR_CLASS);
        }
    }

    override addWidget(widget: Widget, options?: TheiaDockPanel.AddOptions): void {
        if (this.mode === 'single-document' && widget.parent === this) {
            return;
        }
        super.addWidget(widget, options);
        if (options?.closeRef) {
            options.ref?.close();
        }
        this.widgetAdded.emit(widget);
        this.markActiveTabBar(widget.title);
    }

    override activateWidget(widget: Widget): void {
        super.activateWidget(widget);
        this.widgetActivated.emit(widget);
        this.markActiveTabBar(widget.title);
    }

    protected override onChildRemoved(msg: Widget.ChildMessage): void {
        super.onChildRemoved(msg);
        this.widgetRemoved.emit(msg.child);
    }

    nextTabBarWidget(widget: Widget): Widget | undefined {
        const current = this.findTabBar(widget.title);
        const next = current && this.nextTabBarInPanel(current);
        return next && next.currentTitle && next.currentTitle.owner || undefined;
    }

    nextTabBarInPanel(tabBar: TabBar<Widget>): TabBar<Widget> | undefined {
        const tabBars = toArray(this.tabBars());
        const index = tabBars.indexOf(tabBar);
        if (index !== -1) {
            return tabBars[index + 1];
        }
        return undefined;
    }

    previousTabBarWidget(widget: Widget): Widget | undefined {
        const current = this.findTabBar(widget.title);
        const previous = current && this.previousTabBarInPanel(current);
        return previous && previous.currentTitle && previous.currentTitle.owner || undefined;
    }

    previousTabBarInPanel(tabBar: TabBar<Widget>): TabBar<Widget> | undefined {
        const tabBars = toArray(this.tabBars());
        const index = tabBars.indexOf(tabBar);
        if (index !== -1) {
            return tabBars[index - 1];
        }
        return undefined;
    }

    protected readonly toDisposeOnToggleMaximized = new DisposableCollection();
    toggleMaximized(): void {
        const areaContainer = this.node.parentElement;
        if (!areaContainer) {
            return;
        }
        const maximizedElement = this.getMaximizedElement();
        if (areaContainer === maximizedElement) {
            this.toDisposeOnToggleMaximized.dispose();
            return;
        }
        if (this.isAttached) {
            UnsafeWidgetUtilities.detach(this);
        }
        maximizedElement.style.display = 'block';
        this.addClass(MAXIMIZED_CLASS);
        const preference = this.preferences?.get('window.menuBarVisibility');
        if (!this.isElectron() && preference === 'visible') {
            this.addClass(VISIBLE_MENU_MAXIMIZED_CLASS);
        }
        UnsafeWidgetUtilities.attach(this, maximizedElement);
        this.fit();
        this.onDidToggleMaximizedEmitter.fire(this);
        this.toDisposeOnToggleMaximized.push(Disposable.create(() => {
            maximizedElement.style.display = 'none';
            this.removeClass(MAXIMIZED_CLASS);
            this.onDidToggleMaximizedEmitter.fire(this);
            if (!this.isElectron()) {
                this.removeClass(VISIBLE_MENU_MAXIMIZED_CLASS);
            }
            if (this.isAttached) {
                UnsafeWidgetUtilities.detach(this);
            }
            UnsafeWidgetUtilities.attach(this, areaContainer);
            this.fit();
        }));

        const layout = this.layout;
        if (layout instanceof DockLayout) {
            const onResize = layout['onResize'];
            layout['onResize'] = () => onResize.bind(layout)(Widget.ResizeMessage.UnknownSize);
            this.toDisposeOnToggleMaximized.push(Disposable.create(() => layout['onResize'] = onResize));
        }

        const removedListener = () => {
            if (!this.widgets().next()) {
                this.toDisposeOnToggleMaximized.dispose();
            }
        };
        this.widgetRemoved.connect(removedListener);
        this.toDisposeOnToggleMaximized.push(Disposable.create(() => this.widgetRemoved.disconnect(removedListener)));
    }

    protected maximizedElement: HTMLElement | undefined;
    protected getMaximizedElement(): HTMLElement {
        if (!this.maximizedElement) {
            this.maximizedElement = document.createElement('div');
            this.maximizedElement.style.display = 'none';
            document.body.appendChild(this.maximizedElement);
        }
        return this.maximizedElement;
    }

}
export namespace TheiaDockPanel {
    export const Factory = Symbol('TheiaDockPanel#Factory');
    export interface Factory {
        (options?: DockPanel.IOptions): TheiaDockPanel;
    }

    export interface AddOptions extends DockPanel.IAddOptions {
        /**
         * Whether to also close the widget referenced by `ref`.
         */
        closeRef?: boolean
    }
}
