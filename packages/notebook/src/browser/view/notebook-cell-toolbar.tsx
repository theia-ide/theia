// *****************************************************************************
// Copyright (C) 2023 TypeFox and others.
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
import * as React from '@theia/core/shared/react';
import { ACTION_ITEM } from '@theia/core/lib/browser';
import { NotebookCellToolbarItem } from './notebook-cell-toolbar-factory';
import { DisposableCollection, Event } from '@theia/core';

export interface NotebookCellToolbarProps {
    getMenuItems: () => NotebookCellToolbarItem[];
    onContextChanged: Event<void>;
}

interface NotebookCellToolbarState {
    inlineItems: NotebookCellToolbarItem[];
}

abstract class NotebookCellActionBar extends React.Component<NotebookCellToolbarProps, NotebookCellToolbarState> {

    protected toDispose = new DisposableCollection();

    constructor(props: NotebookCellToolbarProps) {
        super(props);
        this.toDispose.push(props.onContextChanged(e => {
            const menuItems = this.props.getMenuItems();
            this.setState({ inlineItems: menuItems });
        }));
        this.state = { inlineItems: this.props.getMenuItems() };
    }

    override componentWillUnmount(): void {
        this.toDispose.dispose();
    }

    protected renderItem(item: NotebookCellToolbarItem): React.ReactNode {
        return <div key={item.id} id={item.id} title={item.label} onClick={item.onClick} className={`${item.icon} ${ACTION_ITEM} theia-notebook-cell-toolbar-item`} />;
    }

}

export class NotebookCellToolbar extends NotebookCellActionBar {

    override render(): React.ReactNode {
        return <div className='theia-notebook-cell-toolbar'>
            {this.state.inlineItems.filter(e => e.isVisible()).map(item => this.renderItem(item))}
        </div>;
    }

}

export class NotebookCellSidebar extends NotebookCellActionBar {

    override render(): React.ReactNode {
        return <div className='theia-notebook-cell-sidebar-toolbar'>
            {this.state.inlineItems.filter(e => e.isVisible()).map(item => this.renderItem(item))}
        </div>;
    }
}

