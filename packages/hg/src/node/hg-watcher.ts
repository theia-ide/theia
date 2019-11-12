/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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

import { injectable, inject } from 'inversify';
import { DisposableCollection, Disposable } from '@theia/core';
import { Repository } from '../common';
import { HgWatcherServer, HgWatcherClient } from '../common/hg-watcher';
import { HgRepositoryManager } from './hg-repository-manager';

@injectable()
export class HgWatcherServerImpl implements HgWatcherServer {

    protected client: HgWatcherClient | undefined;

    protected watcherSequence = 1;
    protected readonly watchers = new Map<number, Disposable>();
    protected readonly subscriptions = new Map<string, DisposableCollection>();

    constructor(
        @inject(HgRepositoryManager) protected readonly manager: HgRepositoryManager
    ) { }

    dispose(): void {
        for (const watcher of this.watchers.values()) {
            watcher.dispose();
        }
        this.watchers.clear();
        this.subscriptions.clear();
    }

    async watchHgChanges(repository: Repository): Promise<number> {
        const reference = await this.manager.getWatcher(repository);
        const watcher = reference.object;

        const repositoryUri = repository.localUri;
        let subscriptions = this.subscriptions.get(repositoryUri);
        if (subscriptions === undefined) {
            const unsubscribe = watcher.onStatusChanged(e => {
                if (this.client) {
                    this.client.onHgChanged(e);
                }
            });
            subscriptions = new DisposableCollection();
            subscriptions.onDispose(() => {
                unsubscribe.dispose();
                this.subscriptions.delete(repositoryUri);
            });
            this.subscriptions.set(repositoryUri, subscriptions);
        }

        watcher.watch();
        subscriptions.push(reference);
        const watcherId = this.watcherSequence++;
        this.watchers.set(watcherId, reference);
        return watcherId;
    }

    async unwatchHgChanges(watcher: number): Promise<void> {
        const disposable = this.watchers.get(watcher);
        if (disposable) {
            disposable.dispose();
            this.watchers.delete(watcher);
        } else {
            throw new Error(`No Hg watchers were registered with ID: ${watcher}.`);
        }
    }

    setClient(client?: HgWatcherClient): void {
        this.client = client;
    }

}
