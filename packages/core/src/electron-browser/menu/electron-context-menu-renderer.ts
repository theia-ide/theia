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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, injectable, postConstruct } from 'inversify';
import {
    ContextMenuRenderer, ContextMenuAccess, FrontendApplicationContribution, CommonCommands, coordinateFromAnchor, PreferenceService,
    Anchor
} from '../../browser';
import { ElectronMainMenuFactory } from './electron-main-menu-factory';
import { ContextMenuContext } from '../../browser/menu/context-menu-context';
import { BrowserContextMenuAccess, BrowserContextMenuRenderer } from '../../browser/menu/browser-context-menu-renderer';
import { MenuPath, MenuContribution, MenuModelRegistry, CompoundMenuNode } from '../../common/menu';
import { ContextKeyService, ContextMatcher } from '../../browser/context-key-service';

export class ElectronContextMenuAccess extends ContextMenuAccess {
    constructor(readonly menuHandle: Promise<number>) {
        super({
            dispose: () => menuHandle.then(handle => window.electronTheiaCore.closePopup(handle))
        });
    }
}

export namespace ElectronTextInputContextMenu {
    export const MENU_PATH: MenuPath = ['electron_text_input'];
    export const UNDO_REDO_EDIT_GROUP = [...MENU_PATH, '0_undo_redo_group'];
    export const EDIT_GROUP = [...MENU_PATH, '1_edit_group'];
    export const SELECT_GROUP = [...MENU_PATH, '2_select_group'];
}

@injectable()
export class ElectronTextInputContextMenuContribution implements FrontendApplicationContribution, MenuContribution {

    @inject(ContextMenuRenderer)
    protected readonly contextMenuRenderer: ContextMenuRenderer;

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;

    onStart(): void {
        window.document.addEventListener('contextmenu', event => {
            if (event.target instanceof HTMLElement) {
                const target = <HTMLElement>event.target;
                if (target.nodeName && (target.nodeName.toLowerCase() === 'input' || target.nodeName.toLowerCase() === 'textarea')) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.contextMenuRenderer.render({
                        anchor: event,
                        contextKeyService: this.contextKeyService,
                        menuPath: ElectronTextInputContextMenu.MENU_PATH,
                        onHide: () => target.focus()
                    });
                }
            }
        });
    }

    registerMenus(registry: MenuModelRegistry): void {
        registry.registerMenuAction(ElectronTextInputContextMenu.UNDO_REDO_EDIT_GROUP, { commandId: CommonCommands.UNDO.id });
        registry.registerMenuAction(ElectronTextInputContextMenu.UNDO_REDO_EDIT_GROUP, { commandId: CommonCommands.REDO.id });
        registry.registerMenuAction(ElectronTextInputContextMenu.EDIT_GROUP, { commandId: CommonCommands.CUT.id });
        registry.registerMenuAction(ElectronTextInputContextMenu.EDIT_GROUP, { commandId: CommonCommands.COPY.id });
        registry.registerMenuAction(ElectronTextInputContextMenu.EDIT_GROUP, { commandId: CommonCommands.PASTE.id });
        registry.registerMenuAction(ElectronTextInputContextMenu.SELECT_GROUP, { commandId: CommonCommands.SELECT_ALL.id });
    }

}

@injectable()
export class ElectronContextMenuRenderer extends BrowserContextMenuRenderer {

    @inject(ContextMenuContext)
    protected readonly context: ContextMenuContext;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    protected useNativeStyle: boolean = true;

    constructor(@inject(ElectronMainMenuFactory) private electronMenuFactory: ElectronMainMenuFactory) {
        super();
    }

    @postConstruct()
    protected init(): void {
        this.doInit();
    }

    protected async doInit(): Promise<void> {
        this.useNativeStyle = await window.electronTheiaCore.getTitleBarStyleAtStartup() === 'native';
    }

    protected override doRender(params: {
        menuPath: MenuPath,
        menu: CompoundMenuNode,
        anchor: Anchor,
        contextMatcher: ContextMatcher,
        args?: any,
        context?: HTMLElement,
        onHide?: () => void
    }): ContextMenuAccess {
        if (this.useNativeStyle) {
            const contextMenu = this.electronMenuFactory.createElectronContextMenu(params.menuPath, params.menu, params.contextMatcher, params.args, params.context);
            const { x, y } = coordinateFromAnchor(params.anchor);

            const windowName = params.context?.ownerDocument.defaultView?.Window.name;

            const menuHandle = window.electronTheiaCore.popup(contextMenu, x, y, () => {
                if (params.onHide) {
                    params.onHide();
                }
            }, windowName);
            // native context menu stops the event loop, so there is no keyboard events
            this.context.resetAltPressed();
            return new ElectronContextMenuAccess(menuHandle);
        } else {
            const menuAccess = super.doRender(params);
            const node = (menuAccess as BrowserContextMenuAccess).menu.node;
            const topPanelHeight = document.getElementById('theia-top-panel')?.clientHeight ?? 0;
            // ensure the context menu is not displayed outside of the main area
            if (node.style.top && parseInt(node.style.top.substring(0, node.style.top.length - 2)) < topPanelHeight) {
                node.style.top = `${topPanelHeight}px`;
                node.style.maxHeight = `calc(${node.style.maxHeight} - ${topPanelHeight}px)`;
            }
            return menuAccess;
        }
    }

}
