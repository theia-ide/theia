// *****************************************************************************
// Copyright (C) 2020 Arm and others.
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

import { inject, injectable } from '@theia/core/shared/inversify';
import { Widget } from '@theia/core/shared/@lumino/widgets';
import { EditorManager } from '@theia/editor/lib/browser/editor-manager';
import { GitResourceOpener } from '../diff/git-resource-opener';
import URI from '@theia/core/lib/common/uri';

@injectable()
export class GitOpenerInSecondaryArea implements GitResourceOpener {
    @inject(EditorManager) protected readonly editorManager: EditorManager;

    protected refWidget: Widget;
    setRefWidget(refWidget: Widget): void {
        this.refWidget = refWidget;
    }

    protected ref: Widget | undefined;
    async open(changeUri: URI): Promise<void> {
        const ref = this.ref;
        const widget = await this.editorManager.open(changeUri, {
            mode: 'reveal',
            widgetOptions: ref ?
                { area: 'main', mode: 'tab-after', ref } :
                { area: 'main', mode: 'split-right', ref: this.refWidget }
        });
        this.ref = widget instanceof Widget ? widget : undefined;
        if (this.ref) {
            this.ref.disposed.connect(() => {
                if (this.ref === widget) {
                    this.ref = undefined;
                }
            });
        }
    }

}
