// *****************************************************************************
// Copyright (C) 2022 STMicroelectronics, Ericsson, ARM, EclipseSource and others.
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
import { inject, injectable, postConstruct } from 'inversify';
import { SecondaryWindowService } from './secondary-window-service';
import { WindowService } from './window-service';
import { ExtractableWidget } from '../widgets';
import { ApplicationShell } from '../shell';
import { Saveable } from '../saveable';

@injectable()
export class DefaultSecondaryWindowService implements SecondaryWindowService {
    // secondary-window.html is part of Theia's generated code. It is generated by dev-packages/application-manager/src/generator/frontend-generator.ts
    protected static SECONDARY_WINDOW_URL = 'secondary-window.html';

    /**
     * Randomized prefix to be included in opened windows' ids.
     * This avoids conflicts when creating sub-windows from multiple theia instances (e.g. by opening Theia multiple times in the same browser)
     */
    protected readonly prefix = crypto.getRandomValues(new Uint32Array(1))[0];
    /** Unique id. Increase after every access. */
    private nextId = 0;

    protected secondaryWindows: Window[] = [];

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @postConstruct()
    init(): void {
        // Set up messaging with secondary windows
        window.addEventListener('message', (event: MessageEvent) => {
            console.trace('Message on main window', event);
            if (event.data.fromSecondary) {
                console.trace('Message comes from secondary window');
                return;
            }
            if (event.data.fromMain) {
                console.trace('Message has mainWindow marker, therefore ignore it');
                return;
            }

            // Filter setImmediate messages. Do not forward because these come in with very high frequency.
            // They are not needed in secondary windows because these messages are just a work around
            // to make setImmediate work in the main window: https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
            if (typeof event.data === 'string' && event.data.startsWith('setImmediate')) {
                return;
            }

            console.trace('Delegate main window message to secondary windows', event);
            this.secondaryWindows.forEach(secondaryWindow => {
                if (!secondaryWindow.window.closed) {
                    secondaryWindow.window.postMessage({ ...event.data, fromMain: true }, '*');
                }
            });
        });

        // Close all open windows when the main window is closed.
        this.windowService.onUnload(() => {
            // Iterate backwards because calling window.close might remove the window from the array
            for (let i = this.secondaryWindows.length - 1; i >= 0; i--) {
                this.secondaryWindows[i].close();
            }
        });
    }

    createSecondaryWindow(widget: ExtractableWidget, shell: ApplicationShell): Window | undefined {
        const win = this.doCreateSecondaryWindow(widget, shell);
        if (win) {
            this.secondaryWindows.push(win);
            win.addEventListener('close', () => {
                const extIndex = this.secondaryWindows.indexOf(win);
                if (extIndex > -1) {
                    this.secondaryWindows.splice(extIndex, 1);
                };
            });
        }
        return win;
    }

    protected findWindow<T>(windowName: string): Window | undefined {
        for (const w of this.secondaryWindows) {
            if (w.name === windowName) {
                return w;
            }
        }
        return undefined;
    }

    protected doCreateSecondaryWindow(widget: ExtractableWidget, shell: ApplicationShell): Window | undefined {
        // const options = 'popup';
        // const options = 'popup,width=500,height=500,left=500,top=500';
        console.log('**** widget: ' + widget);
        console.log('**** widget.id: ' + widget.id);

        // console.log('**** widget.node.parentNode?.textContent: ' + widget.node?.parentNode?.textContent);

        // const options = 'popup,width=600,height=200,left=2800,top=150';
        // const options = 'popup,innerWidth=600,innerHeight=200,left=2800,top=150';
        let options;
        if (widget.node) {
            const clientBounds = widget.node.getBoundingClientRect();

            // shift a bit right and down (enough to clear the editor's preview button)
            const offsetX = 0; // 50 + widget.node.clientWidth;
            const offsetY = 0;
            const offsetHeigth = 0;
            const offsetWidth = 0;

            // try to place secondary window left of the main window
            // const offsetX = widget.node.clientWidth;
            // const offsetY = 0;

            const h = widget.node.clientHeight + offsetHeigth;
            const w = widget.node.clientWidth + offsetWidth;
            // window.screenLeft: horizontal offset of main window (top left corner) vs desktop
            // window.screenTop: vertical offset of main window vs desktop
            const l = widget.node.clientLeft + window.screenLeft + clientBounds.x + offsetX;
            const t = widget.node.clientTop + window.screenTop + clientBounds.y + offsetY;

            options = `popup=1,width=${w},height=${h},left=${l},top=${t}`;
            // TODO: add a preference?
            options += ',alwaysOnTop=true';
            console.log('*** creating secondary window with options: ' + options);
        }

        const newWindow = window.open(DefaultSecondaryWindowService.SECONDARY_WINDOW_URL, this.nextWindowId(), options) ?? undefined;
        if (newWindow) {
            newWindow.addEventListener('DOMContentLoaded', () => {
                newWindow.addEventListener('beforeunload', evt => {
                    const saveable = Saveable.get(widget);
                    const wouldLoseState = !!saveable && saveable.dirty && saveable.autoSave === 'off';
                    if (wouldLoseState) {
                        evt.returnValue = '';
                        evt.preventDefault();
                        return 'non-empty';
                    }
                }, { capture: true });

                newWindow.addEventListener('close', () => {
                    const saveable = Saveable.get(widget);
                    shell.closeWidget(widget.id, {
                        save: !!saveable && saveable.dirty && saveable.autoSave !== 'off'
                    });
                });
            });
        }
        return newWindow;
    }

    focus(win: Window): void {
        win.focus();
    }

    protected nextWindowId(): string {
        return `${this.prefix}-secondaryWindow-${this.nextId++}`;
    }
}
