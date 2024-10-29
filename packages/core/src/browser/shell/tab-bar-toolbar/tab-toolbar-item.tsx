// *****************************************************************************
// Copyright (C) 2024 STMicroelectronics and others.
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

import { ContextKeyService } from '../../context-key-service';
import { ReactTabBarToolbarAction, RenderedToolbarAction, TabBarToolbarActionBase } from './tab-bar-toolbar-types';
import { Widget } from '@phosphor/widgets';
import { LabelIcon, LabelParser } from '../../label-parser';
import { CommandRegistry, Event, Disposable, Emitter } from '../../../common';
import { KeybindingRegistry } from '../../keybinding';
import { ACTION_ITEM } from '../../widgets';
import { TabBarToolbar } from './tab-bar-toolbar';
import * as React from 'react';
import { ActionMenuNode, GroupImpl, MenuNode } from '../../../common/menu';

export interface TabBarToolbarItem {
    id: string;
    isVisible(widget: Widget): boolean;
    isEnabled(widget?: Widget): boolean;
    isToggled(): boolean;
    render(widget?: Widget): React.ReactNode;
    onDidChange?: Event<void>;
    group?: string;
    priority?: number;
    toMenuNode?(): MenuNode;
}

/**
 * Class name indicating rendering of a toolbar item without an icon but instead with a text label.
 */
const NO_ICON_CLASS = 'no-icon';

class AbstractToolbarItemImpl<T extends TabBarToolbarActionBase> {
    constructor(
        protected readonly commandRegistry: CommandRegistry,
        protected readonly contextKeyService: ContextKeyService,
        protected readonly action: T) {

    }

    get id(): string {
        return this.action.id;
    }
    get group(): string | undefined {
        return this.action.group;
    }
    get priority(): number | undefined {
        return this.action.priority;
    }

    isVisible(widget: Widget): boolean {
        if (this.action.isVisible) {
            return this.action.isVisible(widget);
        }
        const actionVisible = !this.action.command || this.commandRegistry.isVisible(this.action.command, widget);
        const contextMatches = !this.action.when || this.contextKeyService.match(this.action.when);

        return actionVisible && contextMatches;
    }

    isEnabled(widget?: Widget): boolean {
        return this.action.command ? this.commandRegistry.isEnabled(this.action.command, widget) : !!this.action.menuPath;
    }
    isToggled(): boolean {
        return this.action.command ? this.commandRegistry.isToggled(this.action.command) : true;
    }
}

export class RenderedToolbarItemImpl extends AbstractToolbarItemImpl<RenderedToolbarAction> implements TabBarToolbarItem {
    protected contextKeyListener: Disposable | undefined;

    constructor(
        commandRegistry: CommandRegistry,
        contextKeyService: ContextKeyService,
        protected readonly keybindingRegistry: KeybindingRegistry,
        protected readonly labelParser: LabelParser,
        action: RenderedToolbarAction) {
        super(commandRegistry, contextKeyService, action);
    }

    updateContextKeyListener(when: string): void {
        const contextKeys = new Set<string>();
        this.contextKeyService.parseKeys(when)?.forEach(key => contextKeys.add(key));
        if (contextKeys.size > 0) {
            this.contextKeyListener = this.contextKeyService.onDidChange(change => {
                if (change.affects(contextKeys)) {
                    this.onDidChangeEmitter.fire();
                }
            });
        }
    }

    render(widget?: Widget | undefined): React.ReactNode {
        return this.renderItem(widget);
    }

    protected getToolbarItemClassNames(widget?: Widget): string[] {
        const classNames = [TabBarToolbar.Styles.TAB_BAR_TOOLBAR_ITEM];
        if (this.isEnabled(widget)) {
            classNames.push('enabled');
        }
        if (this.isToggled()) {
            classNames.push('toggled');
        }
        return classNames;
    }

    protected resolveKeybindingForCommand(widget: Widget | undefined, command: string | undefined): string {
        let result = '';
        if (this.action.command) {
            const bindings = this.keybindingRegistry.getKeybindingsForCommand(this.action.command);
            let found = false;
            if (bindings && bindings.length > 0) {
                bindings.forEach(binding => {
                    if (binding.when) {
                        this.updateContextKeyListener(binding.when);
                    }
                    if (!found && this.keybindingRegistry.isEnabledInScope(binding, widget?.node)) {
                        found = true;
                        result = ` (${this.keybindingRegistry.acceleratorFor(binding, '+')})`;
                    }
                });
            }
        }
        return result;
    }

    protected readonly onDidChangeEmitter = new Emitter<void>;
    onDidChange: Event<void> = this.onDidChangeEmitter.event;

    toMenuNode?(): MenuNode {
        const action = new ActionMenuNode({
            label: this.action.tooltip,
            commandId: this.action.command!,
            when: this.action.when,
            order: this.action.order
        }, this.commandRegistry, this.keybindingRegistry, this.contextKeyService);

        // Register a submenu for the item, if the group is in format `<submenu group>/<submenu name>/.../<item group>`
        const menuPath = this.action.group?.split('/') || [];
        if (menuPath.length > 1) {
            let menu = new GroupImpl(this.contextKeyService, menuPath[0], this.action.order);
            menu = menu.getOrCreate(menuPath, 1, menuPath.length);
            menu.addNode(action);
            return menu;
        }
        return action;
    }

    protected onMouseDownEvent = (e: React.MouseEvent<HTMLElement>) => {
        if (e.button === 0) {
            e.currentTarget.classList.add('active');
        }
    };

    protected onMouseUpEvent = (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.classList.remove('active');
    };

    protected executeCommand(e: React.MouseEvent<HTMLElement>, widget?: Widget): void {
        e.preventDefault();
        e.stopPropagation();

        if (!this.isEnabled(widget)) {
            return;
        }

        if (this.action.command) {
            this.commandRegistry.executeCommand(this.action.command, widget);
        }
    };

    protected renderItem(widget?: Widget): React.ReactNode {
        let innerText = '';
        const classNames = [];
        const command = this.action.command ? this.commandRegistry.getCommand(this.action.command) : undefined;
        // Fall back to the item ID in extremis so there is _something_ to render in the
        // case that there is neither an icon nor a title
        const itemText = this.action.text || command?.label || command?.id || this.action.id;
        if (itemText) {
            for (const labelPart of this.labelParser.parse(itemText)) {
                if (LabelIcon.is(labelPart)) {
                    const className = `fa fa-${labelPart.name}${labelPart.animation ? ' fa-' + labelPart.animation : ''}`;
                    classNames.push(...className.split(' '));
                } else {
                    innerText = labelPart;
                }
            }
        }
        const iconClass = (typeof this.action.icon === 'function' && this.action.icon()) || this.action.icon as string || (command && command.iconClass);
        if (iconClass) {
            classNames.push(iconClass);
        }
        const tooltipText = this.action.tooltip || (command && command.label) || '';
        const tooltip = `${this.labelParser.stripIcons(tooltipText)}${this.resolveKeybindingForCommand(widget, command?.id)}`;

        // Only present text if there is no icon
        if (classNames.length) {
            innerText = '';
        } else if (innerText) {
            // Make room for the label text
            classNames.push(NO_ICON_CLASS);
        }

        // In any case, this is an action item, with or without icon.
        classNames.push(ACTION_ITEM);

        const toolbarItemClassNames = this.getToolbarItemClassNames(widget);
        return <div key={this.action.id}
            className={toolbarItemClassNames.join(' ')}
            onMouseDown={this.onMouseDownEvent}
            onMouseUp={this.onMouseUpEvent}
            onMouseOut={this.onMouseUpEvent} >
            <div id={this.action.id} className={classNames.join(' ')}
                onClick={e => this.executeCommand(e, widget)}
                title={tooltip} > {innerText}
            </div>
        </div>;
    }
}

export class ReactToolbarItemImpl extends AbstractToolbarItemImpl<ReactTabBarToolbarAction> implements TabBarToolbarItem {
    render(widget?: Widget | undefined): React.ReactNode {
        return this.action.render(widget);
    }
}
