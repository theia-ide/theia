// *****************************************************************************
// Copyright (C) 2020 TypeFox and others.
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

import { injectable, ContainerModule } from '@theia/core/shared/inversify';
import { Menu as MenuWidget } from '@theia/core/shared/@lumino/widgets';
import { Disposable } from '@theia/core/lib/common/disposable';
import { MenuNode, CompoundMenuNode, MenuPath } from '@theia/core/lib/common/menu';
import { BrowserMainMenuFactory, MenuCommandRegistry, DynamicMenuWidget, BrowserMenuOptions } from '@theia/core/lib/browser/menu/browser-menu-plugin';
import { PlaceholderMenuNode } from './sample-menu-contribution';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(BrowserMainMenuFactory).to(SampleBrowserMainMenuFactory).inSingletonScope();
});

@injectable()
class SampleBrowserMainMenuFactory extends BrowserMainMenuFactory {

    protected override registerMenu(menuCommandRegistry: MenuCommandRegistry, menu: MenuNode, args: unknown[]): void {
        if (menu instanceof PlaceholderMenuNode && menuCommandRegistry instanceof SampleMenuCommandRegistry) {
            menuCommandRegistry.registerPlaceholderMenu(menu);
        } else {
            super.registerMenu(menuCommandRegistry, menu, args);
        }
    }

    protected override createMenuCommandRegistry(menu: CompoundMenuNode, args: unknown[] = []): MenuCommandRegistry {
        const menuCommandRegistry = new SampleMenuCommandRegistry(this.services);
        this.registerMenu(menuCommandRegistry, menu, args);
        return menuCommandRegistry;
    }

    override createMenuWidget(menu: CompoundMenuNode, options: BrowserMenuOptions): DynamicMenuWidget {
        return new SampleDynamicMenuWidget(menu, options, this.services);
    }

}

class SampleMenuCommandRegistry extends MenuCommandRegistry {

    protected placeholders = new Map<string, PlaceholderMenuNode>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerPlaceholderMenu(menu: PlaceholderMenuNode): void {
        const { id } = menu;
        if (this.placeholders.has(id)) {
            return;
        }
        this.placeholders.set(id, menu);
    }

    override snapshot(menuPath: MenuPath): this {
        super.snapshot(menuPath);
        for (const menu of this.placeholders.values()) {
            this.toDispose.push(this.registerPlaceholder(menu));
        }
        return this;
    }

    protected registerPlaceholder(menu: PlaceholderMenuNode): Disposable {
        const { id } = menu;
        return this.addCommand(id, {
            execute: () => { /* NOOP */ },
            label: menu.label,
            iconClass: menu.icon,
            isEnabled: () => false,
            isVisible: () => true
        });
    }

}

class SampleDynamicMenuWidget extends DynamicMenuWidget {

    protected override buildSubMenus(parentItems: MenuWidget.IItemOptions[], menu: MenuNode, commands: MenuCommandRegistry): MenuWidget.IItemOptions[] {
        if (menu instanceof PlaceholderMenuNode) {
            parentItems.push({
                command: menu.id,
                type: 'command',
            });
        } else {
            super.buildSubMenus(parentItems, menu, commands);
        }
        return parentItems;
    }
}
