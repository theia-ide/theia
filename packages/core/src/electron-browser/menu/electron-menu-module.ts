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

import { ContainerModule } from 'inversify';
import { CommandContribution, MenuContribution, MenuNodeFactory } from '../../common';
import { FrontendApplicationContribution, ContextMenuRenderer, KeybindingContribution, KeybindingContext } from '../../browser';
import { ElectronMainMenuFactory } from './electron-main-menu-factory';
import { ElectronContextMenuRenderer, ElectronTextInputContextMenuContribution } from './electron-context-menu-renderer';
import { CustomTitleWidget, CustomTitleWidgetFactory, ElectronMenuContribution } from './electron-menu-contribution';
import { BrowserMenuNodeFactory } from '../../browser/menu/browser-menu-node-factory';
import { BrowserMainMenuFactory } from '../../browser/menu/browser-menu-plugin';

export default new ContainerModule(bind => {
    bind(ElectronMainMenuFactory).toSelf().inSingletonScope();
    bind(BrowserMainMenuFactory).toService(ElectronMainMenuFactory);
    bind(ContextMenuRenderer).to(ElectronContextMenuRenderer).inSingletonScope();
    bind(KeybindingContext).toConstantValue({
        id: 'theia.context',
        isEnabled: true
    });

    bind(ElectronMenuContribution).toSelf().inSingletonScope();
    for (const serviceIdentifier of [FrontendApplicationContribution, KeybindingContribution, CommandContribution, MenuContribution]) {
        bind(serviceIdentifier).toService(ElectronMenuContribution);
    }
    bind(CustomTitleWidget).toSelf().inSingletonScope();
    bind(CustomTitleWidgetFactory).toFactory(context => () => context.container.get(CustomTitleWidget));
    bind(FrontendApplicationContribution).to(ElectronTextInputContextMenuContribution).inSingletonScope();
    bind(MenuContribution).to(ElectronTextInputContextMenuContribution).inSingletonScope();
    bind(BrowserMenuNodeFactory).toSelf().inSingletonScope();
    bind(MenuNodeFactory).toService(BrowserMenuNodeFactory);
});
