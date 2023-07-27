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

import { nls } from '@theia/core';
import { PreferenceProxy, PreferenceSchema } from '@theia/core/lib/browser';

export const TerminalManagerPreferenceSchema: PreferenceSchema = {
    type: 'object',
    properties: {
        'terminalManager.treeViewLocation': {
            'type': 'string',
            'enum': ['left', 'right'],
            'description': nls.localize('theia/terminalManager/treeViewLocation', 'The location of the terminal manager\'s tree view'),
            'default': 'left',
        },
    },
};

export type TerminalManagerTreeViewLocation = 'left' | 'right';

export interface TerminalManagerConfiguration {
    'terminalManager.treeViewLocation': TerminalManagerTreeViewLocation;
}

export const TerminalManagerPreferences = Symbol('TerminalManagerPreferences');
export const TerminalManagerPreferenceContribution = Symbol('TerminalManagerPreferenceContribution');
export type TerminalManagerPreferences = PreferenceProxy<TerminalManagerConfiguration>;

