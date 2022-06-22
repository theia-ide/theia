// *****************************************************************************
// Copyright (C) 2020 Ericsson and others.
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

import { IpcMainEvent, ipcMain, WebContents } from '@theia/electron/shared/electron';
import { inject, injectable, named, postConstruct } from 'inversify';
import { ContributionProvider } from '../../common/contribution-provider';
import { MessagingContribution } from '../../node/messaging/messaging-contribution';
import { ElectronConnectionHandler, THEIA_ELECTRON_IPC_CHANNEL_NAME } from '../../electron-common/messaging/electron-connection-handler';
import { ElectronMainApplicationContribution } from '../electron-main-application';
import { ElectronMessagingService } from './electron-messaging-service';
import { AbstractChannel, Channel, ChannelMultiplexer, MessageCodec, } from '../../common/';
import { BinaryMessageCodec } from '../../common/messaging/message-codec';

/**
 * This component replicates the role filled by `MessagingContribution` but for Electron.
 * Unlike the WebSocket based implementation, we do not expect to receive
 * connection events. Instead, we'll create channels based on incoming `open`
 * events on the `ipcMain` channel.
 * This component allows communication between renderer process (frontend) and electron main process.
 */

@injectable()
export class ElectronMessagingContribution implements ElectronMainApplicationContribution, ElectronMessagingService {

    @inject(ContributionProvider) @named(ElectronMessagingService.Contribution)
    protected readonly messagingContributions: ContributionProvider<ElectronMessagingService.Contribution>;

    @inject(ContributionProvider) @named(ElectronConnectionHandler)
    protected readonly connectionHandlers: ContributionProvider<ElectronConnectionHandler>;

    protected readonly channelHandlers = new MessagingContribution.ConnectionHandlers<Channel>();
    /**
     * Each electron window has a main chanel and its own multiplexer to route multiple client messages the same IPC connection.
     */
    protected readonly windowChannelMultiplexer = new Map<number, { channel: ElectronWebContentChannel, multiPlexer: ChannelMultiplexer }>();

    @postConstruct()
    protected init(): void {
        ipcMain.on(THEIA_ELECTRON_IPC_CHANNEL_NAME, (event: IpcMainEvent, message: unknown) => {
            this.handleIpcEvent(event, message);
        });
    }

    protected handleIpcEvent(event: IpcMainEvent, message: unknown): void {
        const sender = event.sender;
        // Get the multiplexer for a given window id
        try {
            const windowChannelData = this.windowChannelMultiplexer.get(sender.id) ?? this.createWindowChannelData(sender);
            windowChannelData!.channel.handleMessage(message);
        } catch (error) {
            console.error('IPC: Failed to handle message', { error, message });
        }
    }

    // Creates a new multiplexer for a given sender/window
    protected createWindowChannelData(sender: Electron.WebContents): { channel: ElectronWebContentChannel, multiPlexer: ChannelMultiplexer } {
        const mainChannel = this.createWindowMainChannel(sender);
        const multiPlexer = new ChannelMultiplexer(mainChannel);
        multiPlexer.onDidOpenChannel(openEvent => {
            const { channel, id } = openEvent;
            if (this.channelHandlers.route(id, channel)) {
                console.debug(`Opening channel for service path '${id}'.`);
                channel.onClose(() => console.debug(`Closing channel on service path '${id}'.`));
            }
        });

        sender.once('did-navigate', () => multiPlexer.handleMainChannelClose({ reason: 'Window was refreshed' })); // When refreshing the browser window.
        sender.once('destroyed', () => multiPlexer.handleMainChannelClose({ reason: 'Window was closed' })); // When closing the browser window.
        const data = { channel: mainChannel, multiPlexer };
        this.windowChannelMultiplexer.set(sender.id, data);
        return data;
    }

    /**
     * Creates the main channel to a window.
     * @param sender The window that the channel should be established to.
     */
    protected createWindowMainChannel(sender: WebContents): ElectronWebContentChannel {
        return new ElectronWebContentChannel(sender);
    }

    onStart(): void {
        for (const contribution of this.messagingContributions.getContributions()) {
            contribution.configure(this);
        }
        for (const connectionHandler of this.connectionHandlers.getContributions()) {
            this.channelHandlers.push(connectionHandler.path, (params, channel) => {
                connectionHandler.onConnection(channel);
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipcChannel(spec: string, callback: (params: any, channel: Channel) => void): void {
        this.channelHandlers.push(spec, callback);
    }
}

/**
 * Used to establish a connection between the ipcMain and the Electron frontend (window).
 * Messages a transferred via electron IPC.
 */
export class ElectronWebContentChannel extends AbstractChannel {

    protected messageCodec: MessageCodec<unknown, Uint8Array> = new BinaryMessageCodec();

    constructor(protected readonly sender: Electron.WebContents) {
        super();
    }

    handleMessage(message: unknown): void {
        if (message instanceof Uint8Array) {
            const decoded = this.messageCodec.decode(message);
            this.onMessageEmitter.fire(decoded);
        }
    }

    send(message: unknown): void {
        if (!this.sender.isDestroyed()) {
            const encoded = this.messageCodec.encode(message);
            this.sender.send(THEIA_ELECTRON_IPC_CHANNEL_NAME, encoded);
        }
    }
}
