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

import { inject, injectable } from 'inversify';
import { Menu } from '../widgets';
import { Anchor, ContextMenuAccess, ContextMenuRenderer, coordinateFromAnchor } from '../context-menu-renderer';
import { BrowserMainMenuFactory } from './browser-menu-plugin';
import { ContextMatcher } from '../context-key-service';
import { CompoundMenuNode, MenuPath } from '../../common';

export class BrowserContextMenuAccess extends ContextMenuAccess {
    constructor(
        public readonly menu: Menu
    ) {
        super(menu);
    }
}

@injectable()
export class BrowserContextMenuRenderer extends ContextMenuRenderer {
    @inject(BrowserMainMenuFactory) private menuFactory: BrowserMainMenuFactory;

    protected doRender(menuPath: MenuPath,
        menu: CompoundMenuNode,
        anchor: Anchor,
        contextMatcher: ContextMatcher,
        args?: unknown[],
        context?: HTMLElement,
        onHide?: () => void
    ): ContextMenuAccess {
        const contextMenu = this.menuFactory.createContextMenu(menuPath, menu, contextMatcher, args, context);
        const { x, y } = coordinateFromAnchor(anchor);
        if (onHide) {
            contextMenu.aboutToClose.connect(() => onHide!());
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contextMenu.open(x, y, undefined, context);
        return new BrowserContextMenuAccess(contextMenu);
    }

}
