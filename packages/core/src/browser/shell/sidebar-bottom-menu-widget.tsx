// *****************************************************************************
// Copyright (C) 2020 Alibaba Inc. and others.
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

import { SidebarMenuWidget } from './sidebar-menu-widget';
import { MenuPath } from '../../common/menu';
import { injectable } from 'inversify';

/**
 * The menu widget placed on the bottom of the sidebar.
 */
@injectable()
export class SidebarBottomMenuWidget extends SidebarMenuWidget {

    protected override onClick(e: React.MouseEvent<HTMLElement, MouseEvent>, menuPath: MenuPath): void {
        const button = e.currentTarget.getBoundingClientRect();
        this.contextMenuRenderer.render({
            menuPath,
            includeAnchorArg: false,
            anchor: {
                x: button.left + button.width,
                y: button.top + button.height,
            },
            context: e.currentTarget
        });
    }

}
