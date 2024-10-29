// *****************************************************************************
// Copyright (C) 2018-2019 TypeFox and others.
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

import { interfaces, injectable, inject, postConstruct } from 'inversify';
import { IIterator, toArray, find, some, every, map, ArrayExt } from '@phosphor/algorithm';
import {
    Widget, EXPANSION_TOGGLE_CLASS, COLLAPSED_CLASS, CODICON_TREE_ITEM_CLASSES, MessageLoop, Message, SplitPanel,
    BaseWidget, addEventListener, SplitLayout, LayoutItem, PanelLayout, addKeyListener, waitForRevealed, UnsafeWidgetUtilities, DockPanel, PINNED_CLASS
} from './widgets';
import { Event as CommonEvent, Emitter } from '../common/event';
import { Disposable, DisposableCollection } from '../common/disposable';
import { CommandRegistry } from '../common/command';
import { MenuModelRegistry, MenuPath, MenuAction, SubmenuImpl, ActionMenuNode, MenuNode, RenderedMenuNode } from '../common/menu';
import { ApplicationShell, StatefulWidget, SplitPositionHandler, SplitPositionOptions, SIDE_PANEL_TOOLBAR_CONTEXT_MENU } from './shell';
import { MAIN_AREA_ID, BOTTOM_AREA_ID } from './shell/theia-dock-panel';
import { FrontendApplicationStateService } from './frontend-application-state';
import { ContextMenuRenderer, Anchor } from './context-menu-renderer';
import { parseCssMagnitude } from './browser';
import { TabBarToolbarRegistry, TabBarToolbarFactory, TabBarToolbar, TabBarDelegator } from './shell/tab-bar-toolbar';
import { isEmpty, isObject, nls } from '../common';
import { WidgetManager } from './widget-manager';
import { Key } from './keys';
import { ProgressBarFactory } from './progress-bar-factory';
import { Drag, IDragEvent } from '@phosphor/dragdrop';
import { MimeData } from '@phosphor/coreutils';
import { ElementExt } from '@phosphor/domutils';
import { TabBarDecoratorService } from './shell/tab-bar-decorator';
import { ContextKeyService } from './context-key-service';
import { KeybindingRegistry } from './keybinding';
import { ToolbarMenuNodeWrapper } from './shell/tab-bar-toolbar/tab-bar-toolbar-menu-adapters';

export interface ViewContainerTitleOptions {
    label: string;
    caption?: string;
    iconClass?: string;
    closeable?: boolean;
}

@injectable()
export class ViewContainerIdentifier {
    id: string;
    progressLocationId?: string;
}

export interface DescriptionWidget {
    description: string;
    onDidChangeDescription: CommonEvent<void>;
}

export interface BadgeWidget {
    badge?: number;
    badgeTooltip?: string;
    onDidChangeBadge: CommonEvent<void>;
    onDidChangeBadgeTooltip: CommonEvent<void>;
}

export namespace DescriptionWidget {
    export function is(arg: unknown): arg is DescriptionWidget {
        return isObject(arg) && 'onDidChangeDescription' in arg;
    }
}

export namespace BadgeWidget {
    export function is(arg: unknown): arg is BadgeWidget {
        return isObject(arg) && 'onDidChangeBadge' in arg && 'onDidChangeBadgeTooltip' in arg;
    }
}

/**
 * A widget that may change it's internal structure dynamically.
 * Current use is to update the toolbar when a contributed view is constructed "lazily".
 */
export interface DynamicToolbarWidget {
    onDidChangeToolbarItems: CommonEvent<void>;
}

export namespace DynamicToolbarWidget {
    export function is(arg: unknown): arg is DynamicToolbarWidget {
        return isObject(arg) && 'onDidChangeToolbarItems' in arg;
    }
}

class PartsMenuToolbarItem extends ToolbarMenuNodeWrapper {
    constructor(
        protected readonly target: () => Widget | undefined,
        effectiveMenuPath: MenuPath,
        commandRegistry: CommandRegistry,
        menuRegistry: MenuModelRegistry,
        contextKeyService: ContextKeyService,
        contextMenuRenderer: ContextMenuRenderer,
        menuNode: MenuNode & RenderedMenuNode,
        group: string | undefined,
        menuPath?: MenuPath,
    ) {
        super(effectiveMenuPath, commandRegistry, menuRegistry, contextKeyService, contextMenuRenderer, menuNode, group, menuPath);
    }

    override isVisible(widget: Widget): boolean {
        return widget === this.target() && super.isVisible(widget);
    }
}

/**
 * A view container holds an arbitrary number of widgets inside a split panel.
 * Each widget is wrapped in a _part_ that displays the widget title and toolbar
 * and allows to collapse / expand the widget content.
 */
@injectable()
export class ViewContainer extends BaseWidget implements StatefulWidget, ApplicationShell.TrackableWidgetProvider, TabBarDelegator {

    protected panel: SplitPanel;

    protected currentPart: ViewContainerPart | undefined;

    /**
     * Disable dragging parts from/to this view container.
     */
    disableDNDBetweenContainers = false;

    @inject(FrontendApplicationStateService)
    protected readonly applicationStateService: FrontendApplicationStateService;

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    @inject(MenuModelRegistry)
    protected readonly menuRegistry: MenuModelRegistry;

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    @inject(SplitPositionHandler)
    protected readonly splitPositionHandler: SplitPositionHandler;

    @inject(ViewContainerIdentifier)
    readonly options: ViewContainerIdentifier;

    @inject(TabBarToolbarRegistry)
    protected readonly toolbarRegistry: TabBarToolbarRegistry;

    @inject(TabBarToolbarFactory)
    protected readonly toolbarFactory: TabBarToolbarFactory;

    protected readonly onDidChangeTrackableWidgetsEmitter = new Emitter<Widget[]>();
    readonly onDidChangeTrackableWidgets = this.onDidChangeTrackableWidgetsEmitter.event;

    @inject(ProgressBarFactory)
    protected readonly progressBarFactory: ProgressBarFactory;

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(TabBarDecoratorService)
    protected readonly decoratorService: TabBarDecoratorService;

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    @inject(KeybindingRegistry)
    protected readonly keybindingRegistry: KeybindingRegistry;

    @postConstruct()
    protected init(): void {
        this.toDispose.push(Disposable.create(() => { this.toDisposeOnUpdateTitle.dispose(); }));
        this.id = this.options.id;
        this.addClass('theia-view-container');
        const layout = new PanelLayout();
        this.layout = layout;
        this.panel = new SplitPanel({
            layout: new ViewContainerLayout({
                renderer: SplitPanel.defaultRenderer,
                orientation: this.orientation,
                spacing: 2,
                headerSize: ViewContainerPart.HEADER_HEIGHT,
                animationDuration: 200
            }, this.splitPositionHandler)
        });
        this.panel.node.tabIndex = -1;
        this.configureLayout(layout);

        const { commandRegistry, menuRegistry, contextMenuRenderer } = this;
        this.toDispose.pushAll([
            addEventListener(this.node, 'contextmenu', event => {
                if (event.button === 2 && every(this.containerLayout.iter(), part => !!part.isHidden)) {
                    event.stopPropagation();
                    event.preventDefault();
                    contextMenuRenderer.render({ menuPath: this.contextMenuPath, anchor: event });
                }
            }),
            commandRegistry.registerCommand({ id: this.globalHideCommandId }, {
                execute: (anchor: Anchor) => {
                    const toHide = this.findPartForAnchor(anchor);
                    if (toHide && toHide.canHide) {
                        toHide.hide();
                    }
                },
                isVisible: (anchor: Anchor) => {
                    const toHide = this.findPartForAnchor(anchor);
                    if (toHide) {
                        return toHide.canHide && !toHide.isHidden;
                    } else {
                        return some(this.containerLayout.iter(), part => !part.isHidden);
                    }
                }
            }),
            menuRegistry.registerMenuAction([...this.contextMenuPath, '0_global'], {
                commandId: this.globalHideCommandId,
                label: nls.localizeByDefault('Hide')
            }),
            this.onDidChangeTrackableWidgetsEmitter,
            this.onDidChangeTrackableWidgets(() => this.decoratorService.fireDidChangeDecorations())
        ]);
        if (this.options.progressLocationId) {
            this.toDispose.push(this.progressBarFactory({ container: this.node, insertMode: 'prepend', locationId: this.options.progressLocationId }));
        }
    }

    protected configureLayout(layout: PanelLayout): void {
        layout.addWidget(this.panel);
    }

    protected readonly toDisposeOnCurrentPart = new DisposableCollection();

    protected updateCurrentPart(part?: ViewContainerPart): void {
        if (part && this.getParts().indexOf(part) !== -1) {
            this.currentPart = part;
        }
        if (this.currentPart && !this.currentPart.isDisposed) {
            return;
        }
        const visibleParts = this.getParts().filter(p => !p.isHidden);
        const expandedParts = visibleParts.filter(p => !p.collapsed);
        this.currentPart = expandedParts[0] || visibleParts[0];
    }

    protected updateSplitterVisibility(): void {
        const className = 'p-first-visible';
        let firstFound = false;
        for (const part of this.getParts()) {
            if (!part.isHidden && !firstFound) {
                part.addClass(className);
                firstFound = true;
            } else {
                part.removeClass(className);
            }
        }
    }

    protected titleOptions: ViewContainerTitleOptions | undefined;

    setTitleOptions(titleOptions: ViewContainerTitleOptions | undefined): void {
        this.titleOptions = titleOptions;
        this.updateTitle();
    }

    protected toDisposeOnUpdateTitle = new DisposableCollection();

    protected _tabBarDelegate: Widget = this;
    updateTabBarDelegate(): void {
        const visibleParts = this.getParts().filter(part => !part.isHidden);
        if (visibleParts.length === 1) {
            this._tabBarDelegate = visibleParts[0].wrapped;
        } else {
            this._tabBarDelegate = this;
        }
    }

    getTabBarDelegate(): Widget | undefined {
        return this._tabBarDelegate;
    }

    protected updateTitle(): void {
        this.toDisposeOnUpdateTitle.dispose();
        this.toDisposeOnUpdateTitle = new DisposableCollection();
        this.updateTabBarDelegate();
        let title = Object.assign({}, this.titleOptions);
        if (isEmpty(title)) {
            return;
        }
        const allParts = this.getParts();
        const visibleParts = allParts.filter(part => !part.isHidden);
        this.title.label = title.label;
        // If there's only one visible part - inline it's title into the container title except in case the part
        // isn't originally belongs to this container but there are other **original** hidden parts.
        if (visibleParts.length === 1 && (visibleParts[0].originalContainerId === this.id || !this.findOriginalPart())) {
            const part = visibleParts[0];
            this.toDisposeOnUpdateTitle.push(part.onTitleChanged(() => this.updateTitle()));
            const partLabel = part.wrapped.title.label;
            // Change the container title if it contains only one part that originally belongs to another container.
            if (allParts.length === 1 && part.originalContainerId !== this.id && !this.isCurrentTitle(part.originalContainerTitle)) {
                title = Object.assign({}, part.originalContainerTitle);
                this.setTitleOptions(title);
                return;
            }
            if (partLabel) {
                if (this.title.label && this.title.label !== partLabel) {
                    this.title.label += ': ' + partLabel;
                } else {
                    this.title.label = partLabel;
                }
            }
            part.collapsed = false;
            part.hideTitle();
        } else {
            visibleParts.forEach(part => part.showTitle());
            // If at least one part originally belongs to this container the title should return to its original value.
            const originalPart = this.findOriginalPart();
            if (originalPart && !this.isCurrentTitle(originalPart.originalContainerTitle)) {
                title = Object.assign({}, originalPart.originalContainerTitle);
                this.setTitleOptions(title);
                return;
            }
        }
        this.updateToolbarItems(allParts);
        this.title.caption = title?.caption || title?.label;
        if (title.iconClass) {
            this.title.iconClass = title.iconClass;
        }
        if (this.title.className.includes(PINNED_CLASS)) {
            this.title.closable &&= false;
        } else if (title.closeable !== undefined) {
            this.title.closable = title.closeable;
        }
    }

    protected updateToolbarItems(allParts: ViewContainerPart[]): void {
        if (allParts.length > 1) {
            const group = new SubmenuImpl(this.contextKeyService, `toggleParts-${this.id}`, this.getToggleVisibilityGroupLabel(), undefined);
            for (const part of allParts) {
                const existingId = this.toggleVisibilityCommandId(part);
                const { label } = part.wrapped.title;
                group.addNode(new ActionMenuNode({
                    commandId: existingId,
                    label: label
                }, this.commandRegistry, this.keybindingRegistry, this.contextKeyService));
            }

            // widget === this.getTabBarDelegate()

            const toolbarItem = new PartsMenuToolbarItem(() => this.getTabBarDelegate(), [this.id], this.commandRegistry, this.menuRegistry,
                this.contextKeyService, this.contextMenuRenderer, group, 'view', [this.id]);
            this.toDisposeOnUpdateTitle.push(this.toolbarRegistry.doRegisterItem(toolbarItem));
        }
    }

    protected getToggleVisibilityGroupLabel(): string {
        return 'view';
    }

    protected findOriginalPart(): ViewContainerPart | undefined {
        return this.getParts().find(part => part.originalContainerId === this.id);
    }

    protected isCurrentTitle(titleOptions: ViewContainerTitleOptions | undefined): boolean {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (!!titleOptions && !!this.titleOptions && Object.keys(titleOptions).every(key => (titleOptions as any)[key] === (this.titleOptions as any)[key]))
            || (!titleOptions && !this.titleOptions);
    }

    protected findPartForAnchor(anchor: Anchor): ViewContainerPart | undefined {
        const element = document.elementFromPoint(anchor.x, anchor.y);
        if (element instanceof Element) {
            const closestPart = ViewContainerPart.closestPart(element);
            if (closestPart && closestPart.id) {
                return find(this.containerLayout.iter(), part => part.id === closestPart.id);
            }
        }
        return undefined;
    }

    protected readonly toRemoveWidgets = new Map<string, DisposableCollection>();

    protected createPartId(widget: Widget): string {
        const description = this.widgetManager.getDescription(widget);
        return widget.id || JSON.stringify(description);
    }

    addWidget(widget: Widget, options?: ViewContainer.Factory.WidgetOptions, originalContainerId?: string, originalContainerTitle?: ViewContainerTitleOptions): Disposable {
        const existing = this.toRemoveWidgets.get(widget.id);
        if (existing) {
            return existing;
        }
        const partId = this.createPartId(widget);
        const newPart = this.createPart(widget, partId, originalContainerId || this.id, originalContainerTitle || this.titleOptions, options);
        return this.attachNewPart(newPart);
    }

    protected attachNewPart(newPart: ViewContainerPart, insertIndex?: number): Disposable {
        const toRemoveWidget = new DisposableCollection();
        this.toDispose.push(toRemoveWidget);
        this.toRemoveWidgets.set(newPart.wrapped.id, toRemoveWidget);
        toRemoveWidget.push(Disposable.create(() => this.toRemoveWidgets.delete(newPart.wrapped.id)));
        this.registerPart(newPart);
        if (insertIndex !== undefined || (newPart.options && newPart.options.order !== undefined)) {
            const index = insertIndex ?? this.getParts().findIndex(part => part.options.order === undefined || part.options.order > newPart.options.order!);
            if (index >= 0) {
                this.containerLayout.insertWidget(index, newPart);
            } else {
                this.containerLayout.addWidget(newPart);
            }
        } else {
            this.containerLayout.addWidget(newPart);
        }
        this.refreshMenu(newPart);
        this.updateTitle();
        this.updateCurrentPart();
        this.updateSplitterVisibility();
        this.update();
        this.fireDidChangeTrackableWidgets();
        toRemoveWidget.pushAll([
            Disposable.create(() => {
                if (newPart.currentViewContainerId === this.id) {
                    newPart.dispose();
                }
                this.unregisterPart(newPart);
                if (!newPart.isDisposed && this.getPartIndex(newPart.id) > -1) {
                    this.containerLayout.removeWidget(newPart);
                }
                if (!this.isDisposed) {
                    this.update();
                    this.updateTitle();
                    this.updateCurrentPart();
                    this.updateSplitterVisibility();
                    this.fireDidChangeTrackableWidgets();
                }
            }),
            this.registerDND(newPart),
            newPart.onDidChangeVisibility(() => {
                this.updateTitle();
                this.updateCurrentPart();
                this.updateSplitterVisibility();
                this.containerLayout.updateSashes();
            }),
            newPart.onCollapsed(() => {
                this.containerLayout.updateCollapsed(newPart, this.enableAnimation);
                this.containerLayout.updateSashes();
                this.updateCurrentPart();
            }),
            newPart.onContextMenu(event => {
                if (event.button === 2) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.contextMenuRenderer.render({ menuPath: this.contextMenuPath, anchor: event });
                }
            }),
            newPart.onTitleChanged(() => this.refreshMenu(newPart)),
            newPart.onDidFocus(() => this.updateCurrentPart(newPart))
        ]);

        newPart.disposed.connect(() => toRemoveWidget.dispose());
        return toRemoveWidget;
    }

    protected createPart(widget: Widget, partId: string, originalContainerId: string, originalContainerTitle?: ViewContainerTitleOptions,
        options?: ViewContainer.Factory.WidgetOptions): ViewContainerPart {

        return new ViewContainerPart(widget, partId, this.id, originalContainerId, originalContainerTitle, this.toolbarRegistry, this.toolbarFactory, options);
    }

    removeWidget(widget: Widget): boolean {
        const disposable = this.toRemoveWidgets.get(widget.id);
        if (disposable) {
            disposable.dispose();
            return true;
        }
        return false;
    }

    getParts(): ViewContainerPart[] {
        return this.containerLayout.widgets;
    }

    protected getPartIndex(partId: string | undefined): number {
        if (partId) {
            return this.getParts().findIndex(part => part.id === partId);
        }
        return -1;
    }

    getPartFor(widget: Widget): ViewContainerPart | undefined {
        return this.getParts().find(p => p.wrapped.id === widget.id);
    }

    get containerLayout(): ViewContainerLayout {
        const layout = this.panel.layout;
        if (layout instanceof ViewContainerLayout) {
            return layout;
        }
        throw new Error('view container is disposed');
    }

    protected get orientation(): SplitLayout.Orientation {
        return ViewContainer.getOrientation(this.node);
    }

    protected get enableAnimation(): boolean {
        return this.applicationStateService.state === 'ready';
    }

    protected lastVisibleState: ViewContainer.State | undefined;

    storeState(): ViewContainer.State {
        if (!this.isVisible && this.lastVisibleState) {
            return this.lastVisibleState;
        }
        return this.doStoreState();
    }
    protected doStoreState(): ViewContainer.State {
        const parts = this.getParts();
        const availableSize = this.containerLayout.getAvailableSize();
        const orientation = this.orientation;
        const partStates = parts.map(part => {
            let size = this.containerLayout.getPartSize(part);
            if (size && size > ViewContainerPart.HEADER_HEIGHT && orientation === 'vertical') {
                size -= ViewContainerPart.HEADER_HEIGHT;
            }
            return <ViewContainerPart.State>{
                widget: part.wrapped,
                partId: part.partId,
                collapsed: part.collapsed,
                hidden: part.isHidden,
                relativeSize: size && availableSize ? size / availableSize : undefined,
                originalContainerId: part.originalContainerId,
                originalContainerTitle: part.originalContainerTitle
            };
        });
        return { parts: partStates, title: this.titleOptions };
    }

    restoreState(state: ViewContainer.State): void {
        this.lastVisibleState = state;
        this.doRestoreState(state);
    }
    protected doRestoreState(state: ViewContainer.State): void {
        this.setTitleOptions(state.title);
        // restore widgets
        for (const part of state.parts) {
            if (part.widget) {
                this.addWidget(part.widget, undefined, part.originalContainerId, part.originalContainerTitle || {} as ViewContainerTitleOptions);
            }
        }
        const partStates = state.parts.filter(partState => some(this.containerLayout.iter(), p => p.partId === partState.partId));

        // Reorder the parts according to the stored state
        for (let index = 0; index < partStates.length; index++) {
            const partState = partStates[index];
            const widget = this.getParts().find(part => part.partId === partState.partId);
            if (widget) {
                this.containerLayout.insertWidget(index, widget);
            }
        }

        // Restore visibility and collapsed state
        const parts = this.getParts();
        for (let index = 0; index < parts.length; index++) {
            const part = parts[index];
            const partState = partStates.find(s => part.partId === s.partId);
            if (partState) {
                part.setHidden(partState.hidden);
                part.collapsed = partState.collapsed || !partState.relativeSize;
            } else if (part.canHide) {
                part.hide();
            }
            this.refreshMenu(part);
        }

        // Restore part sizes
        waitForRevealed(this).then(() => {
            this.containerLayout.setPartSizes(partStates.map(partState => partState.relativeSize));
            this.updateSplitterVisibility();
        });
    }

    /**
     * Register a command to toggle the visibility of the new part.
     */
    protected registerPart(toRegister: ViewContainerPart): void {
        const commandId = this.toggleVisibilityCommandId(toRegister);
        this.commandRegistry.registerCommand({ id: commandId }, {
            execute: () => {
                const toHide = find(this.containerLayout.iter(), part => part.id === toRegister.id);
                if (toHide) {
                    toHide.setHidden(!toHide.isHidden);
                }
            },
            isToggled: () => {
                if (!toRegister.canHide) {
                    return true;
                }
                const widgetToToggle = find(this.containerLayout.iter(), part => part.id === toRegister.id);
                if (widgetToToggle) {
                    return !widgetToToggle.isHidden;
                }
                return false;
            },
            isEnabled: arg => toRegister.canHide && (!this.titleOptions || !(arg instanceof Widget) || (arg instanceof ViewContainer && arg.id === this.id)),
            isVisible: arg => !this.titleOptions || !(arg instanceof Widget) || (arg instanceof ViewContainer && arg.id === this.id)
        });
    }

    /**
     * Register a menu action to toggle the visibility of the new part.
     * The menu action is unregistered first to enable refreshing the order of menu actions.
     */
    protected refreshMenu(part: ViewContainerPart): void {
        const commandId = this.toggleVisibilityCommandId(part);
        this.menuRegistry.unregisterMenuAction(commandId);
        if (!part.wrapped.title.label) {
            return;
        }
        const { dataset: { visibilityCommandLabel }, caption, label } = part.wrapped.title;
        const action: MenuAction = {
            commandId: commandId,
            label: visibilityCommandLabel || caption || label,
            order: this.getParts().indexOf(part).toString()
        };
        this.menuRegistry.registerMenuAction([...this.contextMenuPath, '1_widgets'], action);
        if (this.titleOptions) {
            this.menuRegistry.registerMenuAction([...SIDE_PANEL_TOOLBAR_CONTEXT_MENU, 'navigation'], action);
        }
    }

    protected unregisterPart(part: ViewContainerPart): void {
        const commandId = this.toggleVisibilityCommandId(part);
        this.commandRegistry.unregisterCommand(commandId);
        this.menuRegistry.unregisterMenuAction(commandId);
    }

    protected get contextMenuPath(): MenuPath {
        return [`${this.id}-context-menu`];
    }

    protected toggleVisibilityCommandId(part: ViewContainerPart): string {
        return `${this.id}:toggle-visibility-${part.id}`;
    }

    protected get globalHideCommandId(): string {
        return `${this.id}:toggle-visibility`;
    }

    protected moveBefore(toMovedId: string, moveBeforeThisId: string): void {
        const parts = this.getParts();
        const indexToMove = parts.findIndex(part => part.id === toMovedId);
        const targetIndex = parts.findIndex(part => part.id === moveBeforeThisId);
        if (indexToMove >= 0 && targetIndex >= 0) {
            this.containerLayout.insertWidget(targetIndex, parts[indexToMove]);
            for (let index = Math.min(indexToMove, targetIndex); index < parts.length; index++) {
                this.refreshMenu(parts[index]);
                this.activate();
            }
        }
        this.updateSplitterVisibility();
    }

    getTrackableWidgets(): Widget[] {
        return this.getParts().map(w => w.wrapped);
    }

    protected fireDidChangeTrackableWidgets(): void {
        this.onDidChangeTrackableWidgetsEmitter.fire(this.getTrackableWidgets());
    }

    activateWidget(id: string): Widget | undefined {
        const part = this.revealPart(id);
        if (!part) {
            return undefined;
        }
        this.updateCurrentPart(part);
        part.collapsed = false;
        return part.wrapped;
    }

    revealWidget(id: string): Widget | undefined {
        const part = this.revealPart(id);
        return part && part.wrapped;
    }

    protected revealPart(id: string): ViewContainerPart | undefined {
        const part = this.getParts().find(p => p.wrapped.id === id);
        if (!part) {
            return undefined;
        }
        part.setHidden(false);
        return part;
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        if (this.currentPart) {
            this.currentPart.activate();
        } else {
            this.panel.node.focus({ preventScroll: true });
        }
    }

    protected override onAfterAttach(msg: Message): void {
        const orientation = this.orientation;
        this.containerLayout.orientation = orientation;
        if (orientation === 'horizontal') {
            for (const part of this.getParts()) {
                part.collapsed = false;
            }
        }
        super.onAfterAttach(msg);
    }

    protected override onBeforeHide(msg: Message): void {
        super.onBeforeHide(msg);
        this.lastVisibleState = this.storeState();
    }

    protected override onAfterShow(msg: Message): void {
        super.onAfterShow(msg);
        this.updateTitle();
        this.lastVisibleState = undefined;
    }

    protected override onBeforeAttach(msg: Message): void {
        super.onBeforeAttach(msg);
        this.node.addEventListener('p-dragenter', this, true);
        this.node.addEventListener('p-dragover', this, true);
        this.node.addEventListener('p-dragleave', this, true);
        this.node.addEventListener('p-drop', this, true);
    }

    protected override onAfterDetach(msg: Message): void {
        super.onAfterDetach(msg);
        this.node.removeEventListener('p-dragenter', this, true);
        this.node.removeEventListener('p-dragover', this, true);
        this.node.removeEventListener('p-dragleave', this, true);
        this.node.removeEventListener('p-drop', this, true);
    }

    handleEvent(event: Event): void {
        switch (event.type) {
            case 'p-dragenter':
                this.handleDragEnter(event as IDragEvent);
                break;
            case 'p-dragover':
                this.handleDragOver(event as IDragEvent);
                break;
            case 'p-dragleave':
                this.handleDragLeave(event as IDragEvent);
                break;
            case 'p-drop':
                this.handleDrop(event as IDragEvent);
                break;
        }
    }

    handleDragEnter(event: IDragEvent): void {
        if (event.mimeData.hasData('application/vnd.phosphor.view-container-factory')) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    toDisposeOnDragEnd = new DisposableCollection();
    handleDragOver(event: IDragEvent): void {
        const factory = event.mimeData.getData('application/vnd.phosphor.view-container-factory');
        const widget = factory && factory();
        if (!(widget instanceof ViewContainerPart)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();

        const sameContainers = this.id === widget.currentViewContainerId;
        const targetPart = ArrayExt.findFirstValue(this.getParts(), (p => ElementExt.hitTest(p.node, event.clientX, event.clientY)));
        if (!targetPart && sameContainers) {
            event.dropAction = 'none';
            return;
        }
        if (targetPart) {
            // add overlay class style to the `targetPart` node.
            targetPart.node.classList.add('drop-target');
            this.toDisposeOnDragEnd.push(Disposable.create(() => targetPart.node.classList.remove('drop-target')));
        } else {
            // show panel overlay.
            const dockPanel = this.getDockPanel();
            if (dockPanel) {
                dockPanel.overlay.show({ top: 0, bottom: 0, right: 0, left: 0 });
                this.toDisposeOnDragEnd.push(Disposable.create(() => dockPanel.overlay.hide(100)));
            }
        }

        const isDraggingOutsideDisabled = this.disableDNDBetweenContainers || widget.viewContainer?.disableDNDBetweenContainers
            || widget.options.disableDraggingToOtherContainers;
        if (isDraggingOutsideDisabled && !sameContainers) {
            const { target } = event;
            if (target instanceof HTMLElement) {
                target.classList.add('theia-cursor-no-drop');
                this.toDisposeOnDragEnd.push(Disposable.create(() => {
                    target.classList.remove('theia-cursor-no-drop');
                }));
            }
            event.dropAction = 'none';
            return;
        };

        event.dropAction = event.proposedAction;
    };

    handleDragLeave(event: IDragEvent): void {
        this.toDisposeOnDragEnd.dispose();
        if (event.mimeData.hasData('application/vnd.phosphor.view-container-factory')) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    handleDrop(event: IDragEvent): void {
        this.toDisposeOnDragEnd.dispose();
        const factory = event.mimeData.getData('application/vnd.phosphor.view-container-factory');
        const draggedPart = factory && factory();
        if (!(draggedPart instanceof ViewContainerPart)) {
            event.dropAction = 'none';
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const parts = this.getParts();
        const toIndex = ArrayExt.findFirstIndex(parts, part => ElementExt.hitTest(part.node, event.clientX, event.clientY));
        if (draggedPart.currentViewContainerId !== this.id) {
            this.attachNewPart(draggedPart, toIndex > -1 ? toIndex + 1 : toIndex);
            draggedPart.onPartMoved(this);
        } else {
            this.moveBefore(draggedPart.id, parts[toIndex].id);
        }
        event.dropAction = event.proposedAction;
    }

    protected registerDND(part: ViewContainerPart): Disposable {
        part.headerElement.draggable = true;

        return new DisposableCollection(
            addEventListener(part.headerElement, 'dragstart',
                event => {
                    event.preventDefault();
                    const mimeData = new MimeData();
                    mimeData.setData('application/vnd.phosphor.view-container-factory', () => part);
                    const clonedHeader = part.headerElement.cloneNode(true) as HTMLElement;
                    clonedHeader.style.width = part.node.style.width;
                    clonedHeader.style.opacity = '0.6';
                    const drag = new Drag({
                        mimeData,
                        dragImage: clonedHeader,
                        proposedAction: 'move',
                        supportedActions: 'move'
                    });
                    part.node.classList.add('p-mod-hidden');
                    drag.start(event.clientX, event.clientY).then(dropAction => {
                        // The promise is resolved when the drag has ended
                        if (dropAction === 'move' && part.currentViewContainerId !== this.id) {
                            this.removeWidget(part.wrapped);
                            this.lastVisibleState = this.doStoreState();
                        }
                    });
                    setTimeout(() => { part.node.classList.remove('p-mod-hidden'); }, 0);
                }, false));
    }

    protected getDockPanel(): DockPanel | undefined {
        let panel: DockPanel | undefined;
        let parent = this.parent;
        while (!panel && parent) {
            if (this.isSideDockPanel(parent)) {
                panel = parent as DockPanel;
            } else {
                parent = parent.parent;
            }
        }
        return panel;
    }

    protected isSideDockPanel(widget: Widget): boolean {
        const { leftPanelHandler, rightPanelHandler } = this.shell;
        if (widget instanceof DockPanel && (widget.id === rightPanelHandler.dockPanel.id || widget.id === leftPanelHandler.dockPanel.id)) {
            return true;
        }
        return false;
    }

}

export namespace ViewContainer {

    export const Factory = Symbol('ViewContainerFactory');
    export interface Factory {
        (options: ViewContainerIdentifier): ViewContainer;
    }

    export namespace Factory {

        export interface WidgetOptions {
            readonly order?: number;
            readonly weight?: number;
            readonly initiallyCollapsed?: boolean;
            readonly canHide?: boolean;
            readonly initiallyHidden?: boolean;
            /**
             * Disable dragging this part from its original container to other containers,
             * But allow dropping parts from other containers on it,
             * This option only applies to the `ViewContainerPart` and has no effect on the ViewContainer.
             */
            readonly disableDraggingToOtherContainers?: boolean;
        }

        export interface WidgetDescriptor {
            readonly widget: Widget | interfaces.ServiceIdentifier<Widget>;
            readonly options?: WidgetOptions;
        }

    }

    export interface State {
        title?: ViewContainerTitleOptions;
        parts: ViewContainerPart.State[]
    }

    export function getOrientation(node: HTMLElement): 'horizontal' | 'vertical' {
        if (node.closest(`#${MAIN_AREA_ID}`) || node.closest(`#${BOTTOM_AREA_ID}`)) {
            return 'horizontal';
        }
        return 'vertical';
    }
}

/**
 * Wrapper around a widget held by a view container. Adds a header to display the
 * title, toolbar, and collapse / expand handle.
 */
export class ViewContainerPart extends BaseWidget {

    protected readonly header: HTMLElement;
    protected readonly body: HTMLElement;
    protected readonly collapsedEmitter = new Emitter<boolean>();
    protected readonly contextMenuEmitter = new Emitter<MouseEvent>();

    protected readonly onTitleChangedEmitter = new Emitter<void>();
    readonly onTitleChanged = this.onTitleChangedEmitter.event;
    protected readonly onDidFocusEmitter = new Emitter<this>();
    readonly onDidFocus = this.onDidFocusEmitter.event;
    protected readonly onPartMovedEmitter = new Emitter<ViewContainer>();
    readonly onDidMove = this.onPartMovedEmitter.event;
    protected readonly onDidChangeDescriptionEmitter = new Emitter<void>();
    readonly onDidChangeDescription = this.onDidChangeDescriptionEmitter.event;
    protected readonly onDidChangeBadgeEmitter = new Emitter<void>();
    readonly onDidChangeBadge = this.onDidChangeBadgeEmitter.event;
    protected readonly onDidChangeBadgeTooltipEmitter = new Emitter<void>();
    readonly onDidChangeBadgeTooltip = this.onDidChangeBadgeTooltipEmitter.event;

    protected readonly toolbar: TabBarToolbar;

    protected _collapsed: boolean;

    uncollapsedSize: number | undefined;
    animatedSize: number | undefined;

    protected readonly toNoDisposeWrapped: Disposable;

    constructor(
        readonly wrapped: Widget,
        readonly partId: string,
        protected currentContainerId: string,
        readonly originalContainerId: string,
        readonly originalContainerTitle: ViewContainerTitleOptions | undefined,
        protected readonly toolbarRegistry: TabBarToolbarRegistry,
        protected readonly toolbarFactory: TabBarToolbarFactory,
        readonly options: ViewContainer.Factory.WidgetOptions = {}
    ) {
        super();
        wrapped.parent = this;
        wrapped.disposed.connect(() => this.dispose());
        this.id = `${originalContainerId}--${wrapped.id}`;
        this.addClass('part');

        const fireTitleChanged = () => this.onTitleChangedEmitter.fire(undefined);
        this.wrapped.title.changed.connect(fireTitleChanged);
        this.toDispose.push(Disposable.create(() => this.wrapped.title.changed.disconnect(fireTitleChanged)));

        if (DescriptionWidget.is(this.wrapped)) {
            this.wrapped?.onDidChangeDescription(() => this.onDidChangeDescriptionEmitter.fire(), undefined, this.toDispose);
        }

        if (BadgeWidget.is(this.wrapped)) {
            this.wrapped.onDidChangeBadge(() => this.onDidChangeBadgeEmitter.fire(), undefined, this.toDispose);
            this.wrapped.onDidChangeBadgeTooltip(() => this.onDidChangeBadgeTooltipEmitter.fire(), undefined, this.toDispose);
        }

        if (DynamicToolbarWidget.is(this.wrapped)) {
            this.wrapped.onDidChangeToolbarItems(() => {
                this.toolbar.updateTarget(this.wrapped);
                this.viewContainer?.update();
            });
        }

        const { header, body, disposable } = this.createContent();
        this.header = header;
        this.body = body;

        this.toNoDisposeWrapped = this.toDispose.push(wrapped);
        this.toolbar = this.toolbarFactory();
        this.toolbar.addClass('theia-view-container-part-title');

        this.toDispose.pushAll([
            disposable,
            this.toolbar,
            this.toolbarRegistry.onDidChange(() => this.toolbar.updateTarget(this.wrapped)),
            this.collapsedEmitter,
            this.contextMenuEmitter,
            this.onTitleChangedEmitter,
            this.onDidChangeDescriptionEmitter,
            this.onDidChangeBadgeEmitter,
            this.onDidChangeBadgeTooltipEmitter,
            this.registerContextMenu(),
            this.onDidFocusEmitter,
            // focus event does not bubble, capture it
            addEventListener(this.node, 'focus', () => this.onDidFocusEmitter.fire(this), true)
        ]);
        this.scrollOptions = {
            suppressScrollX: true,
            minScrollbarLength: 35
        };
        this.collapsed = !!options.initiallyCollapsed;
        if (options.initiallyHidden && this.canHide) {
            this.hide();
        }
    }

    get viewContainer(): ViewContainer | undefined {
        return this.parent ? this.parent.parent as ViewContainer : undefined;
    }

    get currentViewContainerId(): string {
        return this.currentContainerId;
    }

    get headerElement(): HTMLElement {
        return this.header;
    }

    get collapsed(): boolean {
        return this._collapsed;
    }

    set collapsed(collapsed: boolean) {
        // Cannot collapse/expand if the orientation of the container is `horizontal`.
        const orientation = ViewContainer.getOrientation(this.node);
        if (this._collapsed === collapsed || (orientation === 'horizontal' && collapsed)) {
            return;
        }
        this._collapsed = collapsed;
        this.node.classList.toggle('collapsed', collapsed);

        if (collapsed && this.wrapped.node.contains(document.activeElement)) {
            this.header.focus();
        }
        this.wrapped.setHidden(collapsed);
        const toggleIcon = this.header.querySelector(`span.${EXPANSION_TOGGLE_CLASS}`);
        if (toggleIcon) {
            if (collapsed) {
                toggleIcon.classList.add(COLLAPSED_CLASS);
            } else {
                toggleIcon.classList.remove(COLLAPSED_CLASS);
            }
        }
        this.update();
        this.collapsedEmitter.fire(collapsed);
    }

    onPartMoved(newContainer: ViewContainer): void {
        this.currentContainerId = newContainer.id;
        this.onPartMovedEmitter.fire(newContainer);
    }

    override setHidden(hidden: boolean): void {
        if (!this.canHide) {
            return;
        }
        super.setHidden(hidden);
    }

    get canHide(): boolean {
        return this.options.canHide === undefined || this.options.canHide;
    }

    get onCollapsed(): CommonEvent<boolean> {
        return this.collapsedEmitter.event;
    }

    get onContextMenu(): CommonEvent<MouseEvent> {
        return this.contextMenuEmitter.event;
    }

    get minSize(): number {
        const style = getComputedStyle(this.body);
        if (ViewContainer.getOrientation(this.node) === 'horizontal') {
            return parseCssMagnitude(style.minWidth, 0);
        } else {
            return parseCssMagnitude(style.minHeight, 0);
        }
    }

    protected readonly toShowHeader = new DisposableCollection();
    showTitle(): void {
        this.toShowHeader.dispose();
    }

    hideTitle(): void {
        if (this.titleHidden) {
            return;
        }
        const display = this.header.style.display;
        const height = this.body.style.height;
        this.body.style.height = '100%';
        this.header.style.display = 'none';
        this.toShowHeader.push(Disposable.create(() => {
            this.header.style.display = display;
            this.body.style.height = height;
        }));
    }

    get titleHidden(): boolean {
        return !this.toShowHeader.disposed || this.collapsed;
    }

    protected override getScrollContainer(): HTMLElement {
        return this.body;
    }

    protected registerContextMenu(): Disposable {
        return new DisposableCollection(
            addEventListener(this.header, 'contextmenu', event => {
                this.contextMenuEmitter.fire(event);
            })
        );
    }

    protected createContent(): { header: HTMLElement, body: HTMLElement, disposable: Disposable } {
        const disposable = new DisposableCollection();
        const { header, disposable: headerDisposable } = this.createHeader();
        const body = document.createElement('div');
        body.classList.add('body');
        this.node.appendChild(header);
        this.node.appendChild(body);
        disposable.push(headerDisposable);
        return {
            header,
            body,
            disposable,
        };
    }

    protected createHeader(): { header: HTMLElement, disposable: Disposable } {
        const disposable = new DisposableCollection();
        const header = document.createElement('div');
        header.tabIndex = 0;
        header.classList.add('theia-header', 'header', 'theia-view-container-part-header');
        disposable.push(addEventListener(header, 'click', event => {
            if (this.toolbar && this.toolbar.shouldHandleMouseEvent(event)) {
                return;
            }
            this.collapsed = !this.collapsed;
        }));
        disposable.push(addKeyListener(header, Key.ARROW_LEFT, () => this.collapsed = true));
        disposable.push(addKeyListener(header, Key.ARROW_RIGHT, () => this.collapsed = false));
        disposable.push(addKeyListener(header, Key.ENTER, () => this.collapsed = !this.collapsed));

        const toggleIcon = document.createElement('span');
        toggleIcon.classList.add(EXPANSION_TOGGLE_CLASS, ...CODICON_TREE_ITEM_CLASSES);
        if (this.collapsed) {
            toggleIcon.classList.add(COLLAPSED_CLASS);
        }
        header.appendChild(toggleIcon);

        const title = document.createElement('span');
        title.classList.add('label', 'noselect');

        const description = document.createElement('span');
        description.classList.add('description');

        const badgeSpan = document.createElement('span');
        badgeSpan.classList.add('notification-count');

        const badgeContainer = document.createElement('div');
        badgeContainer.classList.add('notification-count-container');
        badgeContainer.appendChild(badgeSpan);
        const badgeContainerDisplay = badgeContainer.style.display;

        const updateTitle = () => {
            if (this.currentContainerId !== this.originalContainerId && this.originalContainerTitle?.label) {
                // Creating a title in format: <original_container_title>: <part_title>.
                title.innerText = this.originalContainerTitle.label + ': ' + this.wrapped.title.label;
            } else {
                title.innerText = this.wrapped.title.label;
            }
        };
        const updateCaption = () => title.title = this.wrapped.title.caption || this.wrapped.title.label;
        const updateDescription = () => {
            description.innerText = DescriptionWidget.is(this.wrapped) && !this.collapsed && this.wrapped.description || '';
        };
        const updateBadge = () => {
            if (BadgeWidget.is(this.wrapped)) {
                const visibleToolBarItems = this.toolbarRegistry.visibleItems(this.wrapped).length > 0;
                const badge = this.wrapped.badge;
                if (badge && !visibleToolBarItems) {
                    badgeSpan.innerText = badge.toString();
                    badgeSpan.title = this.wrapped.badgeTooltip || '';
                    badgeContainer.style.display = badgeContainerDisplay;
                    return;
                }
            }
            badgeContainer.style.display = 'none';
        };

        updateTitle();
        updateCaption();
        updateDescription();
        updateBadge();

        disposable.pushAll([
            this.onTitleChanged(updateTitle),
            this.onTitleChanged(updateCaption),
            this.onDidMove(updateTitle),
            this.onDidChangeDescription(updateDescription),
            this.onDidChangeBadge(updateBadge),
            this.onDidChangeBadgeTooltip(updateBadge),
            this.onCollapsed(updateDescription)
        ]);
        header.appendChild(title);
        header.appendChild(description);
        header.appendChild(badgeContainer);

        return {
            header,
            disposable
        };
    }

    protected handleResize(): void {
        const handleMouseEnter = () => {
            this.node?.classList.add('no-pointer-events');
            setTimeout(() => {
                this.node?.classList.remove('no-pointer-events');
                this.node?.removeEventListener('mouseenter', handleMouseEnter);
            }, 100);
        };
        this.node?.addEventListener('mouseenter', handleMouseEnter);
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        this.handleResize();
        if (this.wrapped.isAttached && !this.collapsed) {
            MessageLoop.sendMessage(this.wrapped, Widget.ResizeMessage.UnknownSize);
        }
        super.onResize(msg);
    }

    protected override onUpdateRequest(msg: Message): void {
        if (this.wrapped.isAttached && !this.collapsed) {
            MessageLoop.sendMessage(this.wrapped, msg);
        }
        super.onUpdateRequest(msg);
    }

    protected override onAfterAttach(msg: Message): void {
        if (!this.wrapped.isAttached) {
            UnsafeWidgetUtilities.attach(this.wrapped, this.body);
        }
        UnsafeWidgetUtilities.attach(this.toolbar, this.header);
        super.onAfterAttach(msg);
    }

    protected override onBeforeDetach(msg: Message): void {
        super.onBeforeDetach(msg);
        if (this.toolbar.isAttached) {
            Widget.detach(this.toolbar);
        }
        if (this.wrapped.isAttached) {
            UnsafeWidgetUtilities.detach(this.wrapped);
        }
    }

    protected override onBeforeShow(msg: Message): void {
        if (this.wrapped.isAttached && !this.collapsed) {
            MessageLoop.sendMessage(this.wrapped, msg);
        }
        super.onBeforeShow(msg);
    }

    protected override onAfterShow(msg: Message): void {
        super.onAfterShow(msg);
        if (this.wrapped.isAttached && !this.collapsed) {
            MessageLoop.sendMessage(this.wrapped, msg);
        }
    }

    protected override onBeforeHide(msg: Message): void {
        if (this.wrapped.isAttached && !this.collapsed) {
            MessageLoop.sendMessage(this.wrapped, msg);
        }
        super.onBeforeShow(msg);
    }

    protected override onAfterHide(msg: Message): void {
        super.onAfterHide(msg);
        if (this.wrapped.isAttached && !this.collapsed) {
            MessageLoop.sendMessage(this.wrapped, msg);
        }
    }

    protected override onChildRemoved(msg: Widget.ChildMessage): void {
        super.onChildRemoved(msg);
        // if wrapped is not disposed, but detached then we should not dispose it, but only get rid of this part
        this.toNoDisposeWrapped.dispose();
        this.dispose();
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        if (this.collapsed) {
            this.header.focus();
        } else {
            this.wrapped.activate();
        }
    }
}

export namespace ViewContainerPart {

    /**
     * Make sure to adjust the `line-height` of the `.theia-view-container .part > .header` CSS class when modifying this, and vice versa.
     */
    export const HEADER_HEIGHT = 22;

    export interface State {
        widget?: Widget
        partId: string;
        collapsed: boolean;
        hidden: boolean;
        relativeSize?: number;
        description?: string;
        /** The original container to which this part belongs */
        originalContainerId: string;
        originalContainerTitle?: ViewContainerTitleOptions;
    }

    export function closestPart(element: Element | EventTarget | null, selector: string = 'div.part'): Element | undefined {
        if (element instanceof Element) {
            const part = element.closest(selector);
            if (part instanceof Element) {
                return part;
            }
        }
        return undefined;
    }
}

export class ViewContainerLayout extends SplitLayout {

    constructor(protected options: ViewContainerLayout.Options, protected readonly splitPositionHandler: SplitPositionHandler) {
        super(options);
    }

    protected get items(): ReadonlyArray<LayoutItem & ViewContainerLayout.Item> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this as any)._items as Array<LayoutItem & ViewContainerLayout.Item>;
    }

    override iter(): IIterator<ViewContainerPart> {
        return map(this.items, item => item.widget);
    }

    // @ts-expect-error TS2611 `SplitLayout.widgets` is declared as `readonly widgets` but is implemented as a getter.
    get widgets(): ViewContainerPart[] {
        return toArray(this.iter());
    }

    override attachWidget(index: number, widget: ViewContainerPart): void {
        super.attachWidget(index, widget);
        if (index > -1 && this.parent && this.parent.node.contains(this.widgets[index + 1]?.node)) {
            // Set the correct attach index to the DOM elements.
            const ref = this.widgets[index + 1].node;
            this.parent.node.insertBefore(widget.node, ref);
            this.parent.node.insertBefore(this.handles[index], ref);
            this.parent.fit();
        }
    }

    getPartSize(part: ViewContainerPart): number | undefined {
        if (part.collapsed || part.isHidden) {
            return part.uncollapsedSize;
        }
        if (this.orientation === 'horizontal') {
            return part.node.offsetWidth;
        } else {
            return part.node.offsetHeight;
        }
    }

    /**
     * Set the sizes of the view container parts according to the given weights
     * by moving the split handles. This is similar to `setRelativeSizes` defined
     * in `SplitLayout`, but here we properly consider the collapsed / expanded state.
     */
    setPartSizes(weights: (number | undefined)[]): void {
        const parts = this.widgets;
        const availableSize = this.getAvailableSize();

        // Sum up the weights of visible parts
        let totalWeight = 0;
        let weightCount = 0;
        for (let index = 0; index < weights.length && index < parts.length; index++) {
            const part = parts[index];
            const weight = weights[index];
            if (weight && !part.isHidden && !part.collapsed) {
                totalWeight += weight;
                weightCount++;
            }
        }
        if (weightCount === 0 || availableSize === 0) {
            return;
        }

        // Add the average weight for visible parts without weight
        const averageWeight = totalWeight / weightCount;
        for (let index = 0; index < weights.length && index < parts.length; index++) {
            const part = parts[index];
            const weight = weights[index];
            if (!weight && !part.isHidden && !part.collapsed) {
                totalWeight += averageWeight;
            }
        }

        // Apply the weights to compute actual sizes
        let position = 0;
        for (let index = 0; index < weights.length && index < parts.length - 1; index++) {
            const part = parts[index];
            if (!part.isHidden) {
                if (this.orientation === 'vertical') {
                    position += this.options.headerSize;
                }
                const weight = weights[index];
                if (part.collapsed) {
                    if (weight) {
                        part.uncollapsedSize = weight / totalWeight * availableSize;
                    }
                } else {
                    let contentSize = (weight || averageWeight) / totalWeight * availableSize;
                    const minSize = part.minSize;
                    if (contentSize < minSize) {
                        contentSize = minSize;
                    }
                    position += contentSize;
                }
                this.setHandlePosition(index, position);
                position += this.spacing;
            }
        }
    }

    /**
     * Determine the size of the split panel area that is available for widget content,
     * i.e. excluding part headers and split handles.
     */
    getAvailableSize(): number {
        if (!this.parent || !this.parent.isAttached) {
            return 0;
        }
        const parts = this.widgets;
        const visiblePartCount = parts.filter(part => !part.isHidden).length;
        let availableSize: number;
        if (this.orientation === 'horizontal') {
            availableSize = this.parent.node.offsetWidth;
        } else {
            availableSize = this.parent.node.offsetHeight;
            availableSize -= visiblePartCount * this.options.headerSize;
        }
        availableSize -= (visiblePartCount - 1) * this.spacing;
        if (availableSize < 0) {
            return 0;
        }
        return availableSize;
    }

    /**
     * Update a view container part that has been collapsed or expanded. The transition
     * to the new state is animated.
     */
    updateCollapsed(part: ViewContainerPart, enableAnimation: boolean): void {
        const index = this.items.findIndex(item => item.widget === part);
        if (index < 0 || !this.parent || part.isHidden) {
            return;
        }
        // Do not store the height of the "stretched item". Otherwise, we mess up the "hint height".
        // Store the height only if there are other expanded items.
        const currentSize = this.orientation === 'horizontal' ? part.node.offsetWidth : part.node.offsetHeight;
        if (part.collapsed && this.items.some(item => !item.widget.collapsed && !item.widget.isHidden)) {
            part.uncollapsedSize = currentSize;
        }

        if (!enableAnimation || this.options.animationDuration <= 0) {
            MessageLoop.postMessage(this.parent, Widget.Msg.FitRequest);
            return;
        }
        let startTime: number | undefined = undefined;
        const duration = this.options.animationDuration;
        const direction = part.collapsed ? 'collapse' : 'expand';
        let fullSize: number;
        if (direction === 'collapse') {
            fullSize = currentSize - this.options.headerSize;
        } else {
            fullSize = Math.max((part.uncollapsedSize || 0) - this.options.headerSize, part.minSize);
            if (this.items.filter(item => !item.widget.collapsed && !item.widget.isHidden).length === 1) {
                // Expand to full available size
                fullSize = Math.max(fullSize, this.getAvailableSize());
            }
        }

        // The update function is called on every animation frame until the predefined duration has elapsed.
        const updateFunc = (time: number) => {
            if (!this.parent) {
                part.animatedSize = undefined;
                return;
            }
            if (startTime === undefined) {
                startTime = time;
            }
            if (time - startTime < duration) {
                // Render an intermediate state for the animation
                const t = this.tween((time - startTime) / duration);
                if (direction === 'collapse') {
                    part.animatedSize = (1 - t) * fullSize;
                } else {
                    part.animatedSize = t * fullSize;
                }
                requestAnimationFrame(updateFunc);
            } else {
                // The animation is finished
                if (direction === 'collapse') {
                    part.animatedSize = undefined;
                } else {
                    part.animatedSize = fullSize;
                    // Request another frame to reset the part to variable size
                    requestAnimationFrame(() => {
                        part.animatedSize = undefined;
                        if (this.parent) {
                            MessageLoop.sendMessage(this.parent, Widget.Msg.FitRequest);
                        }
                    });
                }
            }
            MessageLoop.sendMessage(this.parent, Widget.Msg.FitRequest);
        };
        requestAnimationFrame(updateFunc);
    }

    updateSashes(): void {
        const { widgets, handles } = this;
        if (widgets.length !== handles.length) {
            console.warn('Unexpected mismatch between number of widgets and number of handles.');
            return;
        }
        const firstUncollapsed = this.getFirstUncollapsedWidgetIndex();
        const lastUncollapsed = firstUncollapsed === undefined ? undefined : this.getLastUncollapsedWidgetIndex();
        const allHidden = firstUncollapsed === lastUncollapsed;
        for (const [index, handle] of this.handles.entries()) {
            // The or clauses are added for type checking. If they're true, allHidden will also have been true.
            if (allHidden || firstUncollapsed === undefined || lastUncollapsed === undefined) {
                handle.classList.add('sash-hidden');
            } else if (index < lastUncollapsed && index >= firstUncollapsed) {
                handle.classList.remove('sash-hidden');
            } else {
                handle.classList.add('sash-hidden');
            }
        }
    }

    protected getFirstUncollapsedWidgetIndex(): number | undefined {
        const index = this.widgets.findIndex(widget => !widget.collapsed && !widget.isHidden);
        return index === -1 ? undefined : index;
    }

    protected getLastUncollapsedWidgetIndex(): number | undefined {
        for (let i = this.widgets.length - 1; i >= 0; i--) {
            if (!this.widgets[i].collapsed && !this.widgets[i].isHidden) {
                return i;
            }
        }
    }

    protected override onFitRequest(msg: Message): void {
        for (const part of this.widgets) {
            const style = part.node.style;
            if (part.animatedSize !== undefined) {
                // The part size has been fixed for animating the transition to collapsed / expanded state
                const fixedSize = `${this.options.headerSize + part.animatedSize}px`;
                style.minHeight = fixedSize;
                style.maxHeight = fixedSize;
            } else if (part.collapsed) {
                // The part size is fixed to the header size
                const fixedSize = `${this.options.headerSize}px`;
                style.minHeight = fixedSize;
                style.maxHeight = fixedSize;
            } else {
                const minSize = `${this.options.headerSize + part.minSize}px`;
                style.minHeight = minSize;
                style.maxHeight = '';
            }
        }
        super.onFitRequest(msg);
    }

    /**
     * Sinusoidal tween function for smooth animation.
     */
    protected tween(t: number): number {
        return 0.5 * (1 - Math.cos(Math.PI * t));
    }

    setHandlePosition(index: number, position: number): Promise<void> {
        const options: SplitPositionOptions = {
            referenceWidget: this.widgets[index],
            duration: 0
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.splitPositionHandler.setSplitHandlePosition(this.parent as SplitPanel, index, position, options) as Promise<any>;
    }

}

export namespace ViewContainerLayout {

    export interface Options extends SplitLayout.IOptions {
        headerSize: number;
        animationDuration: number;
    }

    export interface Item {
        readonly widget: ViewContainerPart;
    }

}
