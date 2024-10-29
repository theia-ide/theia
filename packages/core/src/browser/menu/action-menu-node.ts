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

import { KeybindingRegistry } from '../keybinding';
import { ContextKeyService } from '../context-key-service';
import { DisposableCollection, isObject, CommandRegistry, Emitter } from '../../common';
import { CommandMenu, ContextExpressionMatcher, MenuAction, MenuPath } from '../../common/menu/menu-types';

export interface AcceleratorSource {
    getAccelerator(context: HTMLElement | undefined): string[];
}

export namespace AcceleratorSource {
    export function is(node: unknown): node is AcceleratorSource {
        return isObject<AcceleratorSource>(node) && typeof node.getAccelerator === 'function';
    }
}

/**
 * Node representing an action in the menu tree structure.
 * It's based on {@link MenuAction} for which it tries to determine the
 * best label, icon and sortString with the given data.
 */
export class ActionMenuNode implements CommandMenu {

    protected readonly disposables = new DisposableCollection();
    protected readonly onDidChangeEmitter = new Emitter<void>();

    onDidChange = this.onDidChangeEmitter.event;

    constructor(
        protected readonly action: MenuAction,
        protected readonly commands: CommandRegistry,
        protected readonly keybindingRegistry: KeybindingRegistry,
        protected readonly contextKeyService: ContextKeyService
    ) {
        this.commands.getAllHandlers(action.commandId).forEach(handler => {
            if (handler.onDidChangeEnabled) {
                this.disposables.push(handler.onDidChangeEnabled(() => this.onDidChangeEmitter.fire()));
            }
        });

        if (action.when) {
            const contextKeys = new Set<string>();
            this.contextKeyService.parseKeys(action.when)?.forEach(key => contextKeys.add(key));
            if (contextKeys.size > 0) {
                this.disposables.push(this.contextKeyService.onDidChange(change => {
                    if (change.affects(contextKeys)) {
                        this.onDidChangeEmitter.fire();
                    }
                }));
            }
        }
    }

    dispose(): void {
        this.disposables.dispose();
    }

    isVisible<T>(effeciveMenuPath: MenuPath, contextMatcher: ContextExpressionMatcher<T>, context: T | undefined, ...args: unknown[]): boolean {
        if (!this.commands.isVisible(this.action.commandId, ...args)) {
            return false;
        }
        if (this.action.when) {
            return contextMatcher.match(this.action.when, context);
        }
        return true;
    }

    getAccelerator(context: HTMLElement | undefined): string[] {
        const bindings = this.keybindingRegistry.getKeybindingsForCommand(this.action.commandId);
        // Only consider the first active keybinding.
        if (bindings.length) {
            const binding = bindings.find(b => this.keybindingRegistry.isEnabledInScope(b, context));
            if (binding) {
                return this.keybindingRegistry.acceleratorFor(binding, '+', true);
            }
        }
        return [];
    }

    isEnabled(effeciveMenuPath: MenuPath, ...args: unknown[]): boolean {
        return this.commands.isEnabled(this.action.commandId, ...args);
    }
    isToggled(effeciveMenuPath: MenuPath, ...args: unknown[]): boolean {
        return this.commands.isToggled(this.action.commandId, ...args);
    }
    async run(effeciveMenuPath: MenuPath, ...args: unknown[]): Promise<void> {
        return this.commands.executeCommand(this.action.commandId, ...args);
    }

    get id(): string { return this.action.commandId; }

    get label(): string {
        if (this.action.label) {
            return this.action.label;
        }
        const cmd = this.commands.getCommand(this.action.commandId);
        if (!cmd) {
            console.debug(`No label for action menu node: No command "${this.action.commandId}" exists.`);
            return '';
        }
        return cmd.label || cmd.id;
    }

    get icon(): string | undefined {
        if (this.action.icon) {
            return this.action.icon;
        }
        const command = this.commands.getCommand(this.action.commandId);
        return command && command.iconClass;
    }

    get sortString(): string { return this.action.order || this.label; }
}
