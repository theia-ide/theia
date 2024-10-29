// *****************************************************************************
// Copyright (C) 2020 Red Hat, Inc. and others.
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

import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ContextKeyService, ContextKey } from '@theia/core/lib/browser/context-key-service';

@injectable()
export class CommentsContext {

    @inject(ContextKeyService)
    protected readonly contextKeyService: ContextKeyService;
    protected readonly contextKeys: Set<string> = new Set();
    protected _commentIsEmpty: ContextKey<boolean>;
    protected _commentController: ContextKey<string | undefined>;
    protected _comment: ContextKey<string | undefined>;

    get commentController(): ContextKey<string | undefined> {
        return this._commentController;
    }

    get comment(): ContextKey<string | undefined> {
        return this._comment;
    }

    get commentIsEmpty(): ContextKey<boolean> {
        return this._commentIsEmpty;
    }

    @postConstruct()
    protected init(): void {
        this.contextKeys.add('commentIsEmpty');
        this._commentController = this.contextKeyService.createKey<string | undefined>('commentController', undefined);
        this._comment = this.contextKeyService.createKey<string | undefined>('comment', undefined);
        this._commentIsEmpty = this.contextKeyService.createKey<boolean>('commentIsEmpty', true);
    }
}
