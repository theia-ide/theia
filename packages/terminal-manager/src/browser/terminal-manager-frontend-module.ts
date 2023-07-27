// *****************************************************************************
// Copyright (C) 2023 Ericsson and others.
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

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import {
    bindViewContribution,
    PreferenceContribution,
    WidgetFactory,
    WidgetManager,
} from '@theia/core/lib/browser';
import { TabBarToolbarContribution } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { PreferenceProxyFactory } from '@theia/core/lib/browser/preferences/injectable-preference-proxy';
import { TerminalManagerWidget } from './terminal-manager-widget';
import { TerminalManagerFrontendViewContribution } from './terminal-manager-frontend-view-contribution';
import { TerminalManagerPreferenceContribution, TerminalManagerPreferences, TerminalManagerPreferenceSchema } from './terminal-manager-preferences';
import { TerminalManagerTreeWidget } from './terminal-manager-tree-widget';
import { bindGenericErrorDialogFactory } from './terminal-manager-alert-dialog';
import '../../src/browser/terminal-manager.css';

export default new ContainerModule((bind: interfaces.Bind) => {
    bindViewContribution(bind, TerminalManagerFrontendViewContribution);
    bind(TabBarToolbarContribution).toService(TerminalManagerFrontendViewContribution);

    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: TerminalManagerTreeWidget.ID,
        createWidget: () => TerminalManagerTreeWidget.createWidget(container),
    })).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: TerminalManagerWidget.ID,
        createWidget: async () => {
            const child = container.createChild();
            const widgetManager = container.get(WidgetManager);
            const terminalManagerTreeWidget = await widgetManager.getOrCreateWidget<TerminalManagerTreeWidget>(TerminalManagerTreeWidget.ID);
            child.bind(TerminalManagerTreeWidget).toConstantValue(terminalManagerTreeWidget);
            return TerminalManagerWidget.createWidget(child);
        },
    }));

    bindGenericErrorDialogFactory(bind);

    bind(TerminalManagerPreferences).toDynamicValue(ctx => {
        const factory = ctx.container.get<PreferenceProxyFactory>(PreferenceProxyFactory);
        return factory(TerminalManagerPreferenceSchema);
    }).inSingletonScope();
    bind(TerminalManagerPreferenceContribution).toConstantValue({ schema: TerminalManagerPreferenceSchema });
    bind(PreferenceContribution).toService(TerminalManagerPreferenceContribution);
});

