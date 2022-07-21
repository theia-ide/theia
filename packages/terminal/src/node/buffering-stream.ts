// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
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

import { Emitter, Event } from '@theia/core/lib/common/event';

export interface BufferingStreamOptions {
    /**
     * Max size of the chunks being emitted.
     */
    maxChunkSize?: number
    /**
     * Amount of time to wait between the moment we start buffering data
     * and when we emit the buffered chunk.
     */
    emitInterval?: number
}

/**
 * This component will buffer whatever is pushed to it and emit chunks back
 * every {@link BufferingStreamOptions.emitInterval}. It will also ensure that
 * the emitted chunks never exceed {@link BufferingStreamOptions.maxChunkSize}.
 */
export class BufferingStream {

    protected buffer?: Buffer;
    protected timeout?: NodeJS.Timeout;
    protected maxChunkSize: number;
    protected emitInterval: number;

    protected onDataEmitter = new Emitter<Buffer>();

    constructor(options?: BufferingStreamOptions) {
        this.emitInterval = options?.emitInterval ?? 16; // ms
        this.maxChunkSize = options?.maxChunkSize ?? 16384; // bytes
    }

    get onData(): Event<Buffer> {
        return this.onDataEmitter.event;
    }

    push(chunk: Buffer): void {
        if (this.buffer) {
            this.buffer = Buffer.concat([this.buffer, chunk]);
        } else {
            this.buffer = chunk;
            this.timeout = setTimeout(() => this.emitBufferedChunk(), this.emitInterval);
        }
    }

    dispose(): void {
        clearTimeout(this.timeout);
        this.buffer = undefined;
    }

    protected emitBufferedChunk(): void {
        this.onDataEmitter.fire(this.buffer!.slice(0, this.maxChunkSize));
        if (this.buffer!.byteLength <= this.maxChunkSize) {
            this.buffer = undefined;
        } else {
            this.buffer = this.buffer!.slice(this.maxChunkSize);
            this.timeout = setTimeout(() => this.emitBufferedChunk(), this.emitInterval);
        }
    }
}
