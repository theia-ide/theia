// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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

import * as React from 'react';
import { injectable, unmanaged } from 'inversify';
import { Disposable } from '../../common';
import { BaseWidget, Message } from './widget';
import { Widget } from '@lumino/widgets';
import { createRoot, Root } from 'react-dom/client';

@injectable()
export abstract class ReactWidget extends BaseWidget {

    protected nodeRoot: Root;

    constructor(@unmanaged() options?: Widget.IOptions) {
        super(options);
        this.scrollOptions = {
            suppressScrollX: true,
            minScrollbarLength: 35,
        };
        this.nodeRoot = createRoot(this.node);
        this.toDispose.push(Disposable.create(() => this.nodeRoot.unmount()));
    }

    protected override onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        if (!this.isDisposed) {
            this.nodeRoot.render(<React.Fragment>{this.render()}</React.Fragment>);
        }
    }

    /**
     * Render the React widget in the DOM.
     * - If the widget has been previously rendered,
     * any subsequent calls will perform an update and only
     * change the DOM if absolutely necessary.
     */
    protected abstract render(): React.ReactNode;
}
