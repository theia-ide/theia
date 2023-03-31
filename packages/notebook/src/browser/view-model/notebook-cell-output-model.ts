// *****************************************************************************
// Copyright (C) 2023 Red Hat, Inc. and others.
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
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

import { Disposable, Emitter } from '@theia/core';
import { CellOutput, OutputDto, OutputItemDto } from '../../common';

export class NotebookCellOutputModel implements Disposable, CellOutput {

    private didChangeDataEmitter = new Emitter<void>();
    onDidChangeData = this.didChangeDataEmitter.event;

    get outputs(): OutputItemDto[] {
        return this.rawOutput.outputs || [];
    }

    get metadata(): Record<string, unknown> | undefined {
        return this.rawOutput.metadata;
    }

    constructor(private rawOutput: OutputDto) { }

    replaceData(rawData: OutputDto): void {
        this.rawOutput = rawData;
        this.didChangeDataEmitter.fire();
    }

    appendData(items: OutputItemDto[]): void {
        this.rawOutput.outputs.push(...items);
        this.didChangeDataEmitter.fire();
    }

    dispose(): void {
        this.didChangeDataEmitter.dispose();
    }

}
