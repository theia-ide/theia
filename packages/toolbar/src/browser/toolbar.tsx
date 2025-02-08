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

import * as React from '@theia/core/shared/react';
import { Anchor, ContextMenuAccess, KeybindingRegistry, PreferenceService, Widget, WidgetManager } from '@theia/core/lib/browser';
import { TabBarToolbar, TabBarToolbarFactory } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { DisposableCollection, MenuPath, ProgressService } from '@theia/core';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { ProgressBarFactory } from '@theia/core/lib/browser/progress-bar-factory';
import { Deferred } from '@theia/core/lib/common/promise-util';
import {
    ToolbarAlignment,
    ToolbarAlignmentString,
    ToolbarItemPosition,
} from './toolbar-interfaces';
import { ToolbarController } from './toolbar-controller';
import { ToolbarMenus } from './toolbar-constants';
import { TabBarToolbarItem } from '@theia/core/lib/browser/shell/tab-bar-toolbar/tab-toolbar-item';

const TOOLBAR_BACKGROUND_DATA_ID = 'toolbar-wrapper';
export const TOOLBAR_PROGRESSBAR_ID = 'main-toolbar-progress';
@injectable()
export class ToolbarImpl extends TabBarToolbar {
    @inject(TabBarToolbarFactory) protected readonly tabbarToolbarFactory: TabBarToolbarFactory;
    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    @inject(FrontendApplicationStateService) protected readonly appState: FrontendApplicationStateService;
    @inject(ToolbarController) protected readonly model: ToolbarController;
    @inject(PreferenceService) protected readonly preferenceService: PreferenceService;
    @inject(KeybindingRegistry) protected readonly keybindingRegistry: KeybindingRegistry;
    @inject(ProgressBarFactory) protected readonly progressFactory: ProgressBarFactory;
    @inject(ProgressService) protected readonly progressService: ProgressService;

    protected currentlyDraggedItem: HTMLDivElement | undefined;
    protected draggedStartingPosition: ToolbarItemPosition | undefined;
    protected deferredRef = new Deferred<HTMLDivElement>();
    protected isBusyDeferred = new Deferred<void>();

    @postConstruct()
    protected override init(): void {
        super.init();
        this.doInit();
    }

    protected async doInit(): Promise<void> {
        this.hide();
        await this.model.ready.promise;

        this.updateInlineItems();
        this.update();
        this.model.onToolbarModelDidUpdate(() => {
            this.updateInlineItems();
            this.update();
        });
        this.model.onToolbarDidChangeBusyState(isBusy => {
            if (isBusy) {
                this.isBusyDeferred = new Deferred<void>();
                this.progressService.withProgress('', TOOLBAR_PROGRESSBAR_ID, async () => this.isBusyDeferred.promise);
            } else {
                this.isBusyDeferred.resolve();
            }
        });

        await this.deferredRef.promise;
        this.progressFactory({ container: this.node, insertMode: 'append', locationId: TOOLBAR_PROGRESSBAR_ID });
    }

    protected updateInlineItems(): void {
        this.toDisposeOnUpdateItems.dispose();
        this.toDisposeOnUpdateItems = new DisposableCollection();
        this.inline.clear();
        const { items } = this.model.toolbarItems;

        for (const column of Object.keys(items)) {
            for (const group of items[column as ToolbarAlignment]) {
                for (const item of group) {
                    this.inline.set(item.id, item);
                    if (item.onDidChange) {
                        this.toDisposeOnUpdateItems.push(item.onDidChange(() => this.maybeUpdate()));
                    }
                }
            }
        }
    }

    protected handleContextMenu = (e: React.MouseEvent<HTMLDivElement>): ContextMenuAccess => this.doHandleContextMenu(e);
    protected doHandleContextMenu(event: React.MouseEvent<HTMLDivElement>): ContextMenuAccess {
        event.preventDefault();
        event.stopPropagation();
        const contextMenuArgs = this.getContextMenuArgs(event);
        const { menuPath, anchor } = this.getMenuDetailsForClick(event);
        return this.contextMenuRenderer.render({
            args: contextMenuArgs,
            menuPath: menuPath,
            anchor,
        });
    }

    protected getMenuDetailsForClick(event: React.MouseEvent<HTMLDivElement>): { menuPath: MenuPath; anchor: Anchor } {
        const clickId = event.currentTarget.getAttribute('data-id');
        let menuPath: MenuPath;
        let anchor: Anchor;
        if (clickId === TOOLBAR_BACKGROUND_DATA_ID) {
            menuPath = ToolbarMenus.TOOLBAR_BACKGROUND_CONTEXT_MENU;
            const { clientX, clientY } = event;
            anchor = { x: clientX, y: clientY };
        } else {
            menuPath = ToolbarMenus.TOOLBAR_ITEM_CONTEXT_MENU;
            const { left, bottom } = event.currentTarget.getBoundingClientRect();
            anchor = { x: left, y: bottom };
        }
        return { menuPath, anchor };
    }

    protected getContextMenuArgs(event: React.MouseEvent): Array<string | Widget> {
        const args: Array<string | Widget> = [this];
        // data-position is the stringified position of a given toolbar item, this allows
        // the model to be aware of start/stop positions during drag & drop and CRUD operations
        const position = event.currentTarget.getAttribute('data-position');
        const id = event.currentTarget.getAttribute('data-id');
        if (position) {
            args.push(JSON.parse(position));
        } else if (id) {
            args.push(id);
        }
        return args;
    }

    protected renderGroupsInColumn(groups: TabBarToolbarItem[][], alignment: ToolbarAlignment): React.ReactNode[] {
        const nodes: React.ReactNode[] = [];
        groups.forEach((group, groupIndex) => {
            if (nodes.length && group.length) {
                nodes.push(<div key={`toolbar-separator-${groupIndex}`} className='separator' />);
            }
            group.forEach((item, itemIndex) => {
                const position = { alignment, groupIndex, itemIndex };
                nodes.push(this.renderItemWithDraggableWrapper(item, position));
            });
        });
        return nodes;
    }

    protected assignRef = (element: HTMLDivElement): void => this.doAssignRef(element);
    protected doAssignRef(element: HTMLDivElement): void {
        this.deferredRef.resolve(element);
    }

    protected override render(): React.ReactNode {
        const leftGroups = this.model.toolbarItems?.items[ToolbarAlignment.LEFT];
        const centerGroups = this.model.toolbarItems?.items[ToolbarAlignment.CENTER];
        const rightGroups = this.model.toolbarItems?.items[ToolbarAlignment.RIGHT];
        return (
            <div
                className='toolbar-wrapper'
                onContextMenu={this.handleContextMenu}
                data-id={TOOLBAR_BACKGROUND_DATA_ID}
                role='menu'
                tabIndex={0}
                ref={this.assignRef}
            >
                {leftGroups ? this.renderColumnWrapper(ToolbarAlignment.LEFT, leftGroups) : <></>}
                {centerGroups ? this.renderColumnWrapper(ToolbarAlignment.CENTER, centerGroups) : <></>}
                {rightGroups ? this.renderColumnWrapper(ToolbarAlignment.RIGHT, rightGroups) : <></>}
            </div>
        );
    }

    protected renderColumnWrapper(alignment: ToolbarAlignment, columnGroup: TabBarToolbarItem[][]): React.ReactNode {
        let children: React.ReactNode;
        if (alignment === ToolbarAlignment.LEFT) {
            children = (
                <>
                    {this.renderGroupsInColumn(columnGroup, alignment)}
                    {this.renderColumnSpace(alignment)}
                </>
            );
        } else if (alignment === ToolbarAlignment.CENTER) {
            const isCenterColumnEmpty = !columnGroup.length;
            if (isCenterColumnEmpty) {
                children = this.renderColumnSpace(alignment, 'left');
            } else {
                children = (
                    <>
                        {this.renderColumnSpace(alignment, 'left')}
                        {this.renderGroupsInColumn(columnGroup, alignment)}
                        {this.renderColumnSpace(alignment, 'right')}
                    </>
                );
            }
        } else if (alignment === ToolbarAlignment.RIGHT) {
            children = (
                <>
                    {this.renderColumnSpace(alignment)}
                    {this.renderGroupsInColumn(columnGroup, alignment)}
                </>
            );
        }
        return (
            <div
                role='group'
                className={`toolbar-column ${alignment}`}
            >
                {children}
            </div>);
    }

    protected renderColumnSpace(alignment: ToolbarAlignment, position?: 'left' | 'right'): React.ReactNode {
        return (
            <div
                className='empty-column-space'
                data-column={`${alignment}`}
                data-center-position={position}
                onDrop={this.handleOnDrop}
                onDragOver={this.handleOnDragEnter}
                onDragEnter={this.handleOnDragEnter}
                onDragLeave={this.handleOnDragLeave}
                key={`column-space-${alignment}-${position}`}
            />
        );
    }

    protected renderItemWithDraggableWrapper(item: TabBarToolbarItem, position: ToolbarItemPosition): React.ReactNode {
        const stringifiedPosition = JSON.stringify(position);
        const toolbarItemClassNames = '';
        const renderBody = item.render(this);

        return (
            <div
                role='button'
                tabIndex={0}
                data-id={item.id}
                id={item.id}
                data-position={stringifiedPosition}
                key={`${item.id}-${stringifiedPosition}`}
                className={`${toolbarItemClassNames} toolbar-item action-label`}
                draggable={true}
                onDragStart={this.handleOnDragStart}
                onDragOver={this.handleOnDragEnter}
                onDragLeave={this.handleOnDragLeave}
                onContextMenu={this.handleContextMenu}
                onDragEnd={this.handleOnDragEnd}
                onDrop={this.handleOnDrop}
            >
                {renderBody}
                <div className='hover-overlay' />
            </div>
        );
    }

    protected handleOnDragStart = (e: React.DragEvent<HTMLDivElement>): void => this.doHandleOnDragStart(e);
    protected doHandleOnDragStart(e: React.DragEvent<HTMLDivElement>): void {
        const draggedElement = e.currentTarget;
        draggedElement.classList.add('dragging');
        e.dataTransfer.setDragImage(draggedElement, 0, 0);
        const position = JSON.parse(e.currentTarget.getAttribute('data-position') ?? '');
        this.currentlyDraggedItem = e.currentTarget;
        this.draggedStartingPosition = position;
    }

    protected handleOnDragEnter = (e: React.DragEvent<HTMLDivElement>): void => this.doHandleItemOnDragEnter(e);
    protected doHandleItemOnDragEnter(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        e.stopPropagation();
        const targetItemDOMElement = e.currentTarget;
        const targetItemHoverOverlay = targetItemDOMElement.querySelector('.hover-overlay');
        const targetItemId = e.currentTarget.getAttribute('data-id');
        if (targetItemDOMElement.classList.contains('empty-column-space')) {
            targetItemDOMElement.classList.add('drag-over');
        } else if (targetItemDOMElement.classList.contains('toolbar-item') && targetItemHoverOverlay) {
            const { clientX } = e;
            const { left, right } = e.currentTarget.getBoundingClientRect();
            const targetMiddleX = (left + right) / 2;
            if (targetItemId !== this.currentlyDraggedItem?.getAttribute('data-id')) {
                targetItemHoverOverlay.classList.add('drag-over');
                if (clientX <= targetMiddleX) {
                    targetItemHoverOverlay.classList.add('location-left');
                    targetItemHoverOverlay.classList.remove('location-right');
                } else {
                    targetItemHoverOverlay.classList.add('location-right');
                    targetItemHoverOverlay.classList.remove('location-left');
                }
            }
        }
    }

    protected handleOnDragLeave = (e: React.DragEvent<HTMLDivElement>): void => this.doHandleOnDragLeave(e);
    protected doHandleOnDragLeave(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        e.stopPropagation();
        const targetItemDOMElement = e.currentTarget;
        const targetItemHoverOverlay = targetItemDOMElement.querySelector('.hover-overlay');
        if (targetItemDOMElement.classList.contains('empty-column-space')) {
            targetItemDOMElement.classList.remove('drag-over');
        } else if (targetItemHoverOverlay && targetItemDOMElement.classList.contains('toolbar-item')) {
            targetItemHoverOverlay?.classList.remove('drag-over', 'location-left', 'location-right');
        }
    }

    protected handleOnDrop = (e: React.DragEvent<HTMLDivElement>): void => this.doHandleOnDrop(e);
    protected doHandleOnDrop(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        e.stopPropagation();
        const targetItemDOMElement = e.currentTarget;
        const targetItemHoverOverlay = targetItemDOMElement.querySelector('.hover-overlay');
        if (targetItemDOMElement.classList.contains('empty-column-space')) {
            this.handleDropInEmptySpace(targetItemDOMElement);
            targetItemDOMElement.classList.remove('drag-over');
        } else if (targetItemHoverOverlay && targetItemDOMElement.classList.contains('toolbar-item')) {
            this.handleDropInExistingGroup(targetItemDOMElement);
            targetItemHoverOverlay.classList.remove('drag-over', 'location-left', 'location-right');
        }
        this.currentlyDraggedItem = undefined;
        this.draggedStartingPosition = undefined;
    }

    protected handleDropInExistingGroup(element: EventTarget & HTMLDivElement): void {
        const position = element.getAttribute('data-position');
        const targetDirection = element.querySelector('.hover-overlay')?.classList.toString()
            .split(' ')
            .find(className => className.includes('location'));
        const dropPosition = JSON.parse(position ?? '');
        if (this.currentlyDraggedItem && targetDirection
            && this.draggedStartingPosition && !this.arePositionsEquivalent(this.draggedStartingPosition, dropPosition)) {
            this.model.swapValues(
                this.draggedStartingPosition,
                dropPosition,
                targetDirection as 'location-left' | 'location-right',
            );
        }
    }

    protected handleDropInEmptySpace(element: EventTarget & HTMLDivElement): void {
        const column = element.getAttribute('data-column');
        if (ToolbarAlignmentString.is(column) && this.draggedStartingPosition) {
            if (column === ToolbarAlignment.CENTER) {
                const centerPosition = element.getAttribute('data-center-position');
                this.model.moveItemToEmptySpace(this.draggedStartingPosition, column, centerPosition as 'left' | 'right');
            } else {
                this.model.moveItemToEmptySpace(this.draggedStartingPosition, column);
            }
        }
    }

    protected arePositionsEquivalent(start: ToolbarItemPosition, end: ToolbarItemPosition): boolean {
        return start.alignment === end.alignment
            && start.groupIndex === end.groupIndex
            && start.itemIndex === end.itemIndex;
    }

    protected handleOnDragEnd = (e: React.DragEvent<HTMLDivElement>): void => this.doHandleOnDragEnd(e);
    protected doHandleOnDragEnd(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        e.stopPropagation();
        this.currentlyDraggedItem = undefined;
        this.draggedStartingPosition = undefined;
        e.currentTarget.classList.remove('dragging');
    }
}
