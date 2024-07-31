// *****************************************************************************
// Copyright (C) 2024 EclipseSource GmbH.
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

import { Command, CommandContribution, CommandRegistry } from '@theia/core';
import { RagService } from '../common';
import { inject, injectable } from '@theia/core/shared/inversify';

export const TriggerRagServiceCommand: Command = {
    id: 'ai-rag-provider.triggerRagService',
    label: 'Trigger RAG Service'
};

@injectable()
export class TriggerRagCommandContribution implements CommandContribution {
    @inject(RagService) ragService: RagService;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(TriggerRagServiceCommand, {
            execute: () => {
                console.log('nothing');
            }
        });
    }
}
