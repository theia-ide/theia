// *****************************************************************************
// Copyright (C) 2024 robertjndw
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

import { injectable } from '@theia/core/shared/inversify';
import { TerminalService } from '../browser/base/terminal-service';
import { Event, Emitter } from '@theia/core';
import { WidgetOpenerOptions } from '@theia/core/lib/browser';
import { TerminalWidgetOptions, TerminalWidget } from '../browser/base/terminal-widget';

@injectable()
export class TerminalFrontendOnlyContribution implements TerminalService {
    protected readonly onDidCreateTerminalEmitter = new Emitter<TerminalWidget>();
    protected readonly onDidChangeCurrentTerminalEmitter = new Emitter<TerminalWidget | undefined>();

    get onDidCreateTerminal(): Event<TerminalWidget> {
        return this.onDidCreateTerminalEmitter.event;
    }

    get onDidChangeCurrentTerminal(): Event<TerminalWidget | undefined> {
        return this.onDidChangeCurrentTerminalEmitter.event;
    }

    get currentTerminal(): TerminalWidget | undefined {
        return undefined;
    }

    get lastUsedTerminal(): TerminalWidget | undefined {
        return undefined;
    }

    async newTerminal(options: TerminalWidgetOptions): Promise<TerminalWidget> {
        throw new Error('Method not implemented.');
    }

    open(terminal: TerminalWidget, options?: WidgetOpenerOptions): void { }

    get all(): TerminalWidget[] {
        return [];
    }

    getById(id: string): TerminalWidget | undefined {
        return undefined;
    }

    getByTerminalId(terminalId: number): TerminalWidget | undefined {
        return undefined;
    }

    async getDefaultShell(): Promise<string> {
        return '';
    }
}
