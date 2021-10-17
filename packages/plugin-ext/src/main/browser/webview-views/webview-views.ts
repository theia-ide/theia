/********************************************************************************
 * Copyright (C) 2021 SAP SE or an SAP affiliate company and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
// copied and modified from https://github.com/microsoft/vscode/blob/a4a4cf5ace4472bc4f5176396bb290cafa15c518/src/vs/workbench/contrib/webviewView/browser/webviewViewService.ts

import { CancellationToken, Emitter, Event } from '@theia/core/lib/common';
import { Disposable } from '@theia/core/lib/common';
import { injectable } from '@theia/core/shared/inversify';
import { WebviewWidget } from '../webview/webview';

export interface WebviewView {
    title?: string;
    description?: string;
    readonly webview: WebviewWidget;
    readonly onDidChangeVisibility: Event<boolean>;
    readonly onDidDispose: Event<void>;

    dispose(): void;
    show(preserveFocus: boolean): void;
}

export interface WebviewViewResolver {
    resolve(webviewView: WebviewView, cancellation: CancellationToken): Promise<void>;
}

@injectable()
export class WebviewViewService {

    private readonly resolvers = new Map<string, WebviewViewResolver>();
    private readonly awaitingRevival = new Map<string, { webview: WebviewView, resolve: () => void }>();

    protected readonly onDidRegisterResolverEmitter = new Emitter<{ readonly viewId: string }>();
    readonly onDidRegisterResolver = this.onDidRegisterResolverEmitter.event;

    register(viewId: string, resolver: WebviewViewResolver): Disposable {
        if (this.resolvers.has(viewId)) {
            throw new Error(`View resolver already registered for ${viewId}`);
        }

        this.resolvers.set(viewId, resolver);
        this.onDidRegisterResolverEmitter.fire({ viewId: viewId });

        const pending = this.awaitingRevival.get(viewId);
        if (pending) {
            resolver.resolve(pending.webview, CancellationToken.None).then(() => {
                this.awaitingRevival.delete(viewId);
                pending.resolve();
            });
        }

        return Disposable.create(() => {
            this.resolvers.delete(viewId);
        });
    }

    resolve(viewType: string, webview: WebviewView, cancellation: CancellationToken): Promise<void> {
        const resolver = this.resolvers.get(viewType);
        if (!resolver) {
            if (this.awaitingRevival.has(viewType)) {
                throw new Error('View already awaiting revival');
            }

            let resolve: () => void;
            const p = new Promise<void>(r => resolve = r);
            this.awaitingRevival.set(viewType, { webview, resolve: resolve! });
            return p;
        }

        return resolver.resolve(webview, cancellation);
    }
}

