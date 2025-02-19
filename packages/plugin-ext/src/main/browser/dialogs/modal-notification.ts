// *****************************************************************************
// Copyright (C) 2018 Red Hat, Inc. and others.
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
import { Message } from '@theia/core/shared/@lumino/messaging';
import { codiconArray, Key } from '@theia/core/lib/browser';
import { AbstractDialog } from '@theia/core/lib/browser/dialogs';
import '../../../../src/main/browser/dialogs/style/modal-notification.css';
import { MainMessageItem, MainMessageOptions } from '../../../common/plugin-api-rpc';
import { FrontendApplicationConfigProvider } from '@theia/core/lib/browser/frontend-application-config-provider';
import { nls } from '@theia/core/lib/common/nls';

export enum MessageType {
    Error = 'error',
    Warning = 'warning',
    Info = 'info'
}

const NOTIFICATION = 'modal-Notification';
const ICON = 'icon';
const TEXT = 'text';
const DETAIL = 'detail';

@injectable()
export class ModalNotification extends AbstractDialog<string | undefined> {

    protected actionTitle: string | undefined;

    constructor() {
        super({ title: FrontendApplicationConfigProvider.get().applicationName });
    }

    protected override onCloseRequest(msg: Message): void {
        this.actionTitle = undefined;
        this.accept();
    }

    get value(): string | undefined {
        return this.actionTitle;
    }

    showDialog(messageType: MessageType, text: string, options: MainMessageOptions, actions: MainMessageItem[]): Promise<string | undefined> {
        this.contentNode.appendChild(this.createMessageNode(messageType, text, options, actions));
        return this.open();
    }

    protected createMessageNode(messageType: MessageType, text: string, options: MainMessageOptions, actions: MainMessageItem[]): HTMLElement {
        const messageNode = document.createElement('div');
        messageNode.classList.add(NOTIFICATION);

        const iconContainer = messageNode.appendChild(document.createElement('div'));
        iconContainer.classList.add(ICON);
        const iconElement = iconContainer.appendChild(document.createElement('i'));
        iconElement.classList.add(...this.toIconClass(messageType), messageType.toString());

        const textContainer = messageNode.appendChild(document.createElement('div'));
        textContainer.classList.add(TEXT);
        const textElement = textContainer.appendChild(document.createElement('p'));
        textElement.textContent = text;

        if (options.detail) {
            const detailContainer = textContainer.appendChild(document.createElement('div'));
            detailContainer.classList.add(DETAIL);
            const detailElement = detailContainer.appendChild(document.createElement('p'));
            detailElement.textContent = options.detail;
        }

        actions.forEach((action: MainMessageItem, index: number) => {
            const button = index === 0
                ? this.appendAcceptButton(action.title)
                : this.createButton(action.title);
            button.classList.add('main');
            this.controlPanel.appendChild(button);
            this.addKeyListener(button,
                Key.ENTER,
                () => {
                    this.actionTitle = action.title;
                    this.accept();
                },
                'click');
        });
        if (actions.length <= 0) {
            this.appendAcceptButton();
        } else if (!actions.some(action => action.isCloseAffordance === true)) {
            this.appendCloseButton(nls.localizeByDefault('Close'));
        }

        return messageNode;
    }

    protected toIconClass(icon: MessageType): string[] {
        if (icon === MessageType.Error) {
            return codiconArray('error');
        }
        if (icon === MessageType.Warning) {
            return codiconArray('warning');
        }
        return codiconArray('info');
    }
}
