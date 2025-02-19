// *****************************************************************************
// Copyright (C) 2017 TypeFox and others.
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
import { MenuPath } from '@theia/core/lib/common/menu';
import { EDITOR_CONTEXT_MENU } from '@theia/editor/lib/browser';
import { Anchor, ContextMenuRenderer, Coordinate } from '@theia/core/lib/browser';
import { Menu } from '@theia/core/shared/@lumino/widgets';
import { CommandRegistry } from '@theia/core/shared/@lumino/commands';
import { IContextMenuService } from '@theia/monaco-editor-core/esm/vs/platform/contextview/browser/contextView';
import { IContextMenuDelegate } from '@theia/monaco-editor-core/esm/vs/base/browser/contextmenu';
import { MenuItemAction } from '@theia/monaco-editor-core/esm/vs/platform/actions/common/actions';
import { Event, Emitter } from '@theia/monaco-editor-core/esm/vs/base/common/event';
import { StandardMouseEvent } from '@theia/monaco-editor-core/esm/vs/base/browser/mouseEvent';

@injectable()
export class MonacoContextMenuService implements IContextMenuService {
    declare readonly _serviceBrand: undefined;

    protected readonly onDidShowContextMenuEmitter = new Emitter<void>();
    get onDidShowContextMenu(): Event<void> {
        return this.onDidShowContextMenuEmitter.event;
    };
    protected readonly onDidHideContextMenuEmitter = new Emitter<void>();
    get onDidHideContextMenu(): Event<void> {
        return this.onDidShowContextMenuEmitter.event;
    };

    @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer;

    toAnchor(anchor: HTMLElement | Coordinate | StandardMouseEvent): Anchor {
        if (anchor instanceof HTMLElement) {
            return { x: anchor.offsetLeft, y: anchor.offsetTop };
        } else if (anchor instanceof StandardMouseEvent) {
            return { x: anchor.posx, y: anchor.posy };
        } else {
            return anchor;
        }
    }

    private getContext(delegate: IContextMenuDelegate): HTMLElement | undefined {
        const anchor = delegate.getAnchor();
        if (anchor instanceof HTMLElement) {
            return anchor;
        } else if (anchor instanceof StandardMouseEvent) {
            return anchor.target;
        } else {
            return undefined;
        }
    }
    showContextMenu(delegate: IContextMenuDelegate): void {
        const anchor = this.toAnchor(delegate.getAnchor());
        const actions = delegate.getActions();
        const context = this.getContext(delegate);
        const onHide = () => {
            delegate.onHide?.(false);
            this.onDidHideContextMenuEmitter.fire();
        };

        // Actions for editor context menu come as 'MenuItemAction' items
        // In case of 'Quick Fix' actions come as 'CodeActionAction' items
        if (actions.length > 0 && actions[0] instanceof MenuItemAction) {
            this.contextMenuRenderer.render({
                context: context,
                menuPath: this.menuPath(),
                anchor,
                onHide
            });
        } else {
            const commands = new CommandRegistry();
            const menu = new Menu({
                commands
            });

            for (const action of actions) {
                const commandId = 'quickfix_' + actions.indexOf(action);
                commands.addCommand(commandId, {
                    label: action.label,
                    className: action.class,
                    isToggled: () => Boolean(action.checked),
                    isEnabled: () => action.enabled,
                    execute: () => action.run()
                });
                menu.addItem({
                    type: 'command',
                    command: commandId
                });
            }
            menu.aboutToClose.connect(() => onHide());
            menu.open(anchor.x, anchor.y);
        }
        this.onDidShowContextMenuEmitter.fire();
    }

    protected menuPath(): MenuPath {
        return EDITOR_CONTEXT_MENU;
    }

}
