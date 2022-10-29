// *****************************************************************************
// Copyright (C) 2021 Red Hat, Inc. and others.
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

import { injectable } from '../../../shared/inversify';
import { Disposable, DisposableCollection } from '../disposable';
import { Emitter, Event } from '../event';
import { ReadBuffer, WriteBuffer } from './message-buffer';

/**
 * A channel is a bidirectional communications channel with lifecycle and
 * error signalling. Note that creation of channels is specific to particular
 * implementations and thus not part of the protocol.
 */
export interface Channel {

    /**
     * The remote side has closed the channel
     */
    onClose: Event<ChannelCloseEvent>;

    /**
     * An error has occurred while writing to or reading from the channel
     */
    onError: Event<unknown>;

    /**
     * A message has arrived and can be read  by listeners using a {@link MessageProvider}.
     */
    onMessage: Event<MessageProvider>;

    /**
     * Obtain a {@link WriteBuffer} to write a message to the channel.
     */
    getWriteBuffer(): WriteBuffer;

    /**
     * Close this channel. No {@link onClose} event should be sent
     */
    close(): void;
}

/**
 * The event that is emitted when a channel is closed from the remote side.
 */
export interface ChannelCloseEvent {
    reason: string,
    code?: number
};

/**
 * The `MessageProvider` is emitted when a channel receives a new message.
 * Listeners can invoke the provider to obtain a new {@link ReadBuffer} for the received message.
 * This ensures that each listener has its own isolated {@link ReadBuffer} instance.
 *
 */
export type MessageProvider = () => ReadBuffer;

/**
 *  Reusable abstract {@link Channel} implementation that sets up
 *  the basic channel event listeners and offers a generic close method.
 */
@injectable()
export abstract class AbstractChannel implements Channel {

    onCloseEmitter: Emitter<ChannelCloseEvent> = new Emitter();
    get onClose(): Event<ChannelCloseEvent> {
        return this.onCloseEmitter.event;
    };

    onErrorEmitter: Emitter<unknown> = new Emitter();
    get onError(): Event<unknown> {
        return this.onErrorEmitter.event;
    };

    onMessageEmitter: Emitter<MessageProvider> = new Emitter();
    get onMessage(): Event<MessageProvider> {
        return this.onMessageEmitter.event;
    };

    protected toDispose: DisposableCollection = new DisposableCollection();

    constructor() {
        this.toDispose.pushAll([this.onCloseEmitter, this.onErrorEmitter, this.onMessageEmitter]);
    }

    close(): void {
        this.toDispose.dispose();
    }

    abstract getWriteBuffer(): WriteBuffer;

}

/**
 * Helper class to implement the single channels on a {@link ChannelMultiplexer}. Simply forwards write requests to
 * the given write buffer source i.e. the main channel of the {@link ChannelMultiplexer}.
 */
export class ForwardingChannel extends AbstractChannel {

    constructor(readonly id: string, protected readonly closeHandler: () => void, protected readonly writeBufferSource: () => WriteBuffer) {
        super();
    }

    getWriteBuffer(): WriteBuffer {
        return this.writeBufferSource();
    }

    override close(): void {
        super.close();
        this.closeHandler();
    }
}

/**
 * The different message types used in the messaging protocol of the {@link ChannelMultiplexer}
 */
export enum MessageTypes {
    Open = 1,
    Close = 2,
    AckOpen = 3,
    Data = 4
}

/**
 * The write buffers in this implementation immediately write to the underlying
 * channel, so we rely on writers to the multiplexed channels to always commit their
 * messages and always in one go.
 */
export class ChannelMultiplexer implements Disposable {
    protected openChannels: Map<string, ForwardingChannel> = new Map();

    protected readonly onOpenChannelEmitter = new Emitter<{ id: string, channel: Channel }>();
    get onDidOpenChannel(): Event<{ id: string, channel: Channel }> {
        return this.onOpenChannelEmitter.event;
    }

    protected toDispose = new DisposableCollection();

    constructor(protected readonly underlyingChannel: Channel) {
        this.toDispose.pushAll([
            this.underlyingChannel.onMessage(buffer => this.handleMessage(buffer())),
            this.underlyingChannel.onClose(event => this.onUnderlyingChannelClose(event)),
            this.underlyingChannel.onError(error => this.handleError(error)),
            this.onOpenChannelEmitter
        ]);
    }

    protected handleError(error: unknown): void {
        this.openChannels.forEach(channel => {
            channel.onErrorEmitter.fire(error);
        });
    }

    onUnderlyingChannelClose(event?: ChannelCloseEvent): void {
        if (!this.toDispose.disposed) {
            this.toDispose.push(Disposable.create(() => {
                this.openChannels.forEach(channel => {
                    channel.onCloseEmitter.fire(event ?? { reason: 'Multiplexer main channel has been closed from the remote side!' });
                });

                this.openChannels.clear();
            }));
            this.dispose();
        }

    }

    protected handleMessage(buffer: ReadBuffer): void {
        const type = buffer.readUint8();
        const id = buffer.readString();
        switch (type) {
            case MessageTypes.AckOpen: {
                break;
            }
            case MessageTypes.Open: {
                return this.handleOpen(id);
            }
            case MessageTypes.Close: {
                return this.handleClose(id);
            }
            case MessageTypes.Data: {
                return this.handleData(id, buffer.sliceAtReadPosition());
            }
        }
    }

    protected handleOpen(id: string): void {
        if (!this.openChannels.has(id)) {
            const channel = this.createChannel(id);
            this.openChannels.set(id, channel);
            this.onOpenChannelEmitter.fire({ id, channel });
        }
    }

    protected handleClose(id: string): void {
        const channel = this.openChannels.get(id);
        if (channel) {
            channel.onCloseEmitter.fire({ reason: 'Channel has been closed from the remote side' });
            this.openChannels.delete(id);
        }
    }

    protected handleData(id: string, data: ReadBuffer): void {
        const channel = this.openChannels.get(id);
        if (channel) {
            channel.onMessageEmitter.fire(() => data);
        } else {
            const newChannel = this.createChannel(id);
            this.openChannels.set(id, newChannel);
            this.onOpenChannelEmitter.fire({ id, channel: newChannel });
            setTimeout(() => {
                newChannel.onMessageEmitter.fire(() => data);
            });
        }
    }

    protected createChannel(id: string): ForwardingChannel {
        return new ForwardingChannel(id, () => this.closeChannel(id), () => this.prepareWriteBuffer(id));
    }

    // Prepare the write buffer for the channel with the give, id. The channel id has to be encoded
    // and written to the buffer before the actual message.
    protected prepareWriteBuffer(id: string): WriteBuffer {
        const underlying = this.underlyingChannel.getWriteBuffer();
        underlying.writeUint8(MessageTypes.Data);
        underlying.writeString(id);
        return underlying;
    }

    protected closeChannel(id: string): void {
        this.underlyingChannel.getWriteBuffer()
            .writeUint8(MessageTypes.Close)
            .writeString(id)
            .commit();

        this.openChannels.delete(id);
    }

    open(id: string): Promise<Channel> {
        const channel = this.openChannels.get(id) || this.createChannel(id);
        this.openChannels.set(id, channel);
        this.underlyingChannel
            .getWriteBuffer()
            .writeUint8(MessageTypes.Open)
            .writeString(id)
            .commit();
        this.onOpenChannelEmitter.fire({ id, channel });
        return Promise.resolve(channel);
    }

    getOpenChannel(id: string): Channel | undefined {
        return this.openChannels.get(id);
    }

    dispose(): void {
        this.toDispose.dispose();
    }
}

