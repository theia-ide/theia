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

import { interfaces } from '@theia/core/shared/inversify';
import { ReactTabBarToolbarAction, RenderedToolbarAction, TabBarToolbar } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { TabBarToolbarItem } from '@theia/core/lib/browser/shell/tab-bar-toolbar/tab-toolbar-item';

export enum ToolbarAlignment {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right'
}

export interface ToolbarTreeSchema {
    items: {
        [key in ToolbarAlignment]: TabBarToolbarItem[][];
    };
}

export interface DeflatedToolbarTree {
    items: {
        [key in ToolbarAlignment]: ToolbarItemDeflated[][];
    };
}
export namespace ToolbarAlignmentString {
    export const is = (obj: unknown): obj is ToolbarAlignment => obj === ToolbarAlignment.LEFT
        || obj === ToolbarAlignment.CENTER
        || obj === ToolbarAlignment.RIGHT;
}

export interface ToolbarContributionProperties {
    toJSON(): DeflatedContributedToolbarItem;
}

export type ToolbarContribution = ReactTabBarToolbarAction & ToolbarContributionProperties;

export const ToolbarContribution = Symbol('ToolbarContribution');

export const Toolbar = Symbol('Toolbar');
export const ToolbarFactory = Symbol('ToolbarFactory');
export type Toolbar = TabBarToolbar;

export type ToolbarItem = ToolbarContribution | RenderedToolbarAction;
export interface DeflatedContributedToolbarItem { id: string; group: 'contributed' };
export type ToolbarItemDeflated = DeflatedContributedToolbarItem | RenderedToolbarAction;

export const LateInjector = Symbol('LateInjector');

export const lateInjector = <T>(
    context: interfaces.Container,
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
): T => context.get<T>(serviceIdentifier);

export interface ToolbarItemPosition {
    alignment: ToolbarAlignment;
    groupIndex: number;
    itemIndex: number;
}

export enum IconSet {
    FA = 'fa',
    CODICON = 'codicon'
}

