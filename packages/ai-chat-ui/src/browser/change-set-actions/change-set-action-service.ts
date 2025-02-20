// *****************************************************************************
// Copyright (C) 2025 EclipseSource GmbH.
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

import { ContributionProvider, Event, Emitter } from '@theia/core';
import { ChangeSet } from '@theia/ai-chat';
import { inject, injectable, named, postConstruct } from '@theia/core/shared/inversify';

export const ChangeSetActionRenderer = Symbol('ChangeSetActionRenderer');
/**
 * The CodePartRenderer offers to contribute arbitrary React nodes to the rendered code part.
 * Technically anything can be rendered, however it is intended to be used for actions, like
 * "Copy to Clipboard" or "Insert at Cursor".
 */
export interface ChangeSetActionRenderer {
    readonly id: string;
    onDidChange?: Event<void>;
    render(changeSet: ChangeSet): React.ReactNode;
    /**
     * Determines if the action should be rendered for the given response.
     */
    canRender?(changeSet: ChangeSet): boolean;
    /**
     *  Actions are ordered by descending priority. (Highest on left).
     */
    readonly priority?: number;
}

@injectable()
export class ChangeSetActionService {
    protected readonly onDidChangeEmitter = new Emitter<void>();
    get onDidChange(): Event<void> {
        return this.onDidChangeEmitter.event;
    }

    @inject(ContributionProvider) @named(ChangeSetActionRenderer)
    protected readonly contributions: ContributionProvider<ChangeSetActionRenderer>;

    @postConstruct()
    protected init(): void {
        const actions = this.contributions.getContributions();
        actions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
        actions.forEach(contribution => contribution.onDidChange?.(this.onDidChangeEmitter.fire, this.onDidChangeEmitter));
    }

    getActions(): readonly ChangeSetActionRenderer[] {
        return this.contributions.getContributions();
    }

    getActionsForChangeset(changeSet: ChangeSet): ChangeSetActionRenderer[] {
        return this.getActions().filter(candidate => !candidate.canRender || candidate.canRender(changeSet));
    }
}
