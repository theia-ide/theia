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
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************
import { inject, injectable, postConstruct } from 'inversify';
import { SecondaryWindowService } from './secondary-window-service';
import { WindowService } from './window-service';
import { ExtractableWidget } from '../widgets';
import { ApplicationShell } from '../shell';
import { Saveable } from '../saveable';
import { PreferenceService } from '../preferences';
import { environment } from '../../common';
import { SaveableService } from '../saveable-service';

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

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    @inject(SaveableService)
    protected readonly saveResourceService: SaveableService;

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
        const [height, width, left, top] = this.findSecondaryWindowCoordinates(widget);
        let options = `popup=1,width=${width},height=${height},left=${left},top=${top}`;
        if (this.preferenceService.get('window.secondaryWindowAlwaysOnTop')) {
            options += ',alwaysOnTop=true';
        }
        const newWindow = window.open(DefaultSecondaryWindowService.SECONDARY_WINDOW_URL, this.nextWindowId(), options) ?? undefined;
        if (newWindow) {
            this.secondaryWindows.push(newWindow);
            newWindow.addEventListener('DOMContentLoaded', () => {
                newWindow.addEventListener('beforeunload', evt => {
                    const saveable = Saveable.get(widget);
                    const wouldLoseState = !!saveable && saveable.dirty && this.saveResourceService.autoSave === 'off';
                    if (wouldLoseState) {
                        evt.returnValue = '';
                        evt.preventDefault();
                        return 'non-empty';
                    }
                }, { capture: true });

                newWindow.addEventListener('unload', () => {
                    const saveable = Saveable.get(widget);
                    shell.closeWidget(widget.id, {
                        save: !!saveable && saveable.dirty && this.saveResourceService.autoSave !== 'off'
                    });

                    const extIndex = this.secondaryWindows.indexOf(newWindow);
                    if (extIndex > -1) {
                        this.secondaryWindows.splice(extIndex, 1);
                    };
                });
                this.windowCreated(newWindow, widget, shell);
            });
        }
        return newWindow;
    }

    protected windowCreated(newWindow: Window, widget: ExtractableWidget, shell: ApplicationShell): void {
        newWindow.addEventListener('unload', () => {
            shell.closeWidget(widget.id);
        });
    }

    protected findWindow<T>(windowName: string): Window | undefined {
        for (const w of this.secondaryWindows) {
            if (w.name === windowName) {
                return w;
            }
        }
        return undefined;
    }

    protected findSecondaryWindowCoordinates(widget: ExtractableWidget): (number | undefined)[] {
        const clientBounds = widget.node.getBoundingClientRect();
        const preference = this.preferenceService.get('window.secondaryWindowPlacement');

        let height; let width; let left; let top;
        const offsetY = 20; // Offset to avoid the window title bar

        switch (preference) {
            case 'originalSize': {
                height = widget.node.clientHeight;
                width = widget.node.clientWidth;
                left = window.screenLeft + clientBounds.x;
                top = window.screenTop + (window.outerHeight - window.innerHeight) + offsetY;
                if (environment.electron.is()) {
                    top = window.screenTop + clientBounds.y;
                }
                break;
            }
            case 'halfWidth': {
                height = window.innerHeight - (window.outerHeight - window.innerHeight);
                width = window.innerWidth / 2;
                left = window.screenLeft;
                top = window.screenTop;
                if (!environment.electron.is()) {
                    height = window.innerHeight + clientBounds.y - offsetY;
                }
                break;
            }
            case 'fullSize': {
                height = window.innerHeight - (window.outerHeight - window.innerHeight);
                width = window.innerWidth;
                left = window.screenLeft;
                top = window.screenTop;
                if (!environment.electron.is()) {
                    height = window.innerHeight + clientBounds.y - offsetY;
                }
                break;
            }
        }
        return [height, width, left, top];
    }

    focus(win: Window): void {
        win.focus();
    }

    protected nextWindowId(): string {
        return `${this.prefix}-secondaryWindow-${this.nextId++}`;
    }
}
