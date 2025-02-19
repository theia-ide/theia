// *****************************************************************************
// Copyright (C) 2017 TypeFox and others.
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
import { Command, CommandContribution, CommandRegistry, isOSX, isWindows, MenuModelRegistry, MenuContribution, Disposable, nls } from '../../common';
import {
    codicon, ConfirmDialog, KeybindingContribution, KeybindingRegistry, PreferenceScope, Widget,
    FrontendApplication, FrontendApplicationContribution, CommonMenus, CommonCommands, Dialog, Message, ApplicationShell, PreferenceService, animationFrame,
} from '../../browser';
import { ElectronMainMenuFactory } from './electron-main-menu-factory';
import { FrontendApplicationStateService, FrontendApplicationState } from '../../browser/frontend-application-state';
import { FrontendApplicationConfigProvider } from '../../browser/frontend-application-config-provider';
import { ZoomLevel } from '../window/electron-window-preferences';
import { BrowserMenuBarContribution } from '../../browser/menu/browser-menu-plugin';
import { WindowService } from '../../browser/window/window-service';
import { WindowTitleService } from '../../browser/window/window-title-service';

import '../../../src/electron-browser/menu/electron-menu-style.css';
import { ThemeService } from '../../browser/theming';
import { ThemeChangeEvent } from '../../common/theme';

export namespace ElectronCommands {
    export const TOGGLE_DEVELOPER_TOOLS = Command.toDefaultLocalizedCommand({
        id: 'theia.toggleDevTools',
        label: 'Toggle Developer Tools'
    });
    export const RELOAD = Command.toDefaultLocalizedCommand({
        id: 'view.reload',
        label: 'Reload Window'
    });
    export const ZOOM_IN = Command.toDefaultLocalizedCommand({
        id: 'view.zoomIn',
        label: 'Zoom In'
    });
    export const ZOOM_OUT = Command.toDefaultLocalizedCommand({
        id: 'view.zoomOut',
        label: 'Zoom Out'
    });
    export const RESET_ZOOM = Command.toDefaultLocalizedCommand({
        id: 'view.resetZoom',
        label: 'Reset Zoom'
    });
    export const CLOSE_WINDOW = Command.toDefaultLocalizedCommand({
        id: 'close.window',
        label: 'Close Window'
    });
    export const TOGGLE_FULL_SCREEN = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.toggleFullScreen',
        category: CommonCommands.VIEW_CATEGORY,
        label: 'Toggle Full Screen'
    });
}

export namespace ElectronMenus {
    export const VIEW_WINDOW = [...CommonMenus.VIEW, 'window'];
    export const VIEW_ZOOM = [...CommonMenus.VIEW_APPEARANCE_SUBMENU, '4_appearance_submenu_zoom'];
}

export namespace ElectronMenus {
    export const HELP_TOGGLE = [...CommonMenus.HELP, 'z_toggle'];
}

export namespace ElectronMenus {
    export const FILE_CLOSE = [...CommonMenus.FILE_CLOSE, 'window-close'];
}

export const CustomTitleWidgetFactory = Symbol('CustomTitleWidgetFactory');
export type CustomTitleWidgetFactory = () => Widget | undefined;

@injectable()
export class ElectronMenuContribution extends BrowserMenuBarContribution implements FrontendApplicationContribution, CommandContribution, MenuContribution, KeybindingContribution {

    @inject(FrontendApplicationStateService)
    protected readonly stateService: FrontendApplicationStateService;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @inject(ThemeService)
    protected readonly themeService: ThemeService;

    @inject(CustomTitleWidgetFactory)
    protected readonly customTitleWidgetFactory: CustomTitleWidgetFactory;

    protected titleBarStyleChangeFlag = false;
    protected titleBarStyle?: string;

    constructor(
        @inject(ElectronMainMenuFactory) protected override readonly factory: ElectronMainMenuFactory
    ) {
        super(factory);
    }

    override onStart(app: FrontendApplication): void {
        this.handleTitleBarStyling(app);
        if (isOSX) {
            this.attachWindowFocusListener(app);
        }
        // Make sure the application menu is complete, once the frontend application is ready.
        // https://github.com/theia-ide/theia/issues/5100
        let onStateChange: Disposable | undefined = undefined;
        const stateServiceListener = (state: FrontendApplicationState) => {
            if (state === 'closing_window') {
                if (!!onStateChange) {
                    onStateChange.dispose();
                }
            }
        };
        onStateChange = this.stateService.onStateChanged(stateServiceListener);
        this.shell.mainPanel.onDidToggleMaximized(() => {
            this.handleToggleMaximized();
        });
        this.shell.bottomPanel.onDidToggleMaximized(() => {
            this.handleToggleMaximized();
        });
        this.attachMenuBarVisibilityListener();
        this.themeService.onDidColorThemeChange(e => {
            this.handleThemeChange(e);
        });
    }

    protected attachWindowFocusListener(app: FrontendApplication): void {
        // OSX: Recreate the menus when changing windows.
        // OSX only has one menu bar for all windows, so we need to swap
        // between them as the user switches windows.
        const disposeHandler = window.electronTheiaCore.onWindowEvent('focus', () => {
            this.setMenu(app);
        });
        window.addEventListener('unload', () => disposeHandler.dispose());
    }

    protected attachMenuBarVisibilityListener(): void {
        this.preferenceService.onPreferenceChanged(e => {
            if (e.preferenceName === 'window.menuBarVisibility') {
                this.handleFullScreen(e.newValue);
            }
        });
    }

    handleTitleBarStyling(app: FrontendApplication): void {
        this.hideTopPanel(app);
        window.electronTheiaCore.getTitleBarStyleAtStartup().then(style => {
            this.titleBarStyle = style;
            this.setMenu(app);
            this.preferenceService.ready.then(() => {
                this.preferenceService.set('window.titleBarStyle', this.titleBarStyle, PreferenceScope.User);
            });
        });

        this.preferenceService.ready.then(() => {
            window.electronTheiaCore.setMenuBarVisible(['classic', 'visible'].includes(this.preferenceService.get('window.menuBarVisibility', 'classic')));
        });

        this.preferenceService.onPreferenceChanged(change => {
            if (change.preferenceName === 'window.titleBarStyle') {
                if (this.titleBarStyleChangeFlag && this.titleBarStyle !== change.newValue) {
                    window.electronTheiaCore.setTitleBarStyle(change.newValue);
                    this.handleRequiredRestart();
                }
                this.titleBarStyleChangeFlag = true;
            }
        });
    }

    handleToggleMaximized(): void {
        const preference = this.preferenceService.get('window.menuBarVisibility');
        if (preference === 'classic') {
            this.factory.setMenuBar();
        }
    }

    /**
     * Hides the `theia-top-panel` depending on the selected `titleBarStyle`.
     * The `theia-top-panel` is used as the container of the main, application menu-bar for the
     * browser. Native Electron has its own.
     * By default, this method is called on application `onStart`.
     */
    protected hideTopPanel(app: FrontendApplication): void {
        const itr = app.shell.children();
        let child = itr.next();
        while (!child.done) {
            // Top panel for the menu contribution is not required for native Electron title bar.
            if (child.value.id === 'theia-top-panel') {
                child.value.setHidden(this.titleBarStyle !== 'custom');
                break;
            } else {
                child = itr.next();
            }
        }
    }

    protected setMenu(app: FrontendApplication): void {
        if (!isOSX) {
            this.hideTopPanel(app);
            if (this.titleBarStyle === 'custom' && !this.menuBar) {
                this.createCustomTitleBar(app);
                return;
            }
        }
        this.factory.setMenuBar();
    }

    protected createCustomTitleBar(app: FrontendApplication): void {
        const dragPanel = new Widget();
        dragPanel.id = 'theia-drag-panel';
        app.shell.addWidget(dragPanel, { area: 'top' });
        this.appendMenu(app.shell);
        this.createCustomTitleWidget(app);
        const controls = document.createElement('div');
        controls.id = 'window-controls';
        controls.append(
            this.createControlButton('minimize', () => window.electronTheiaCore.minimize()),
            this.createControlButton('maximize', () => window.electronTheiaCore.maximize()),
            this.createControlButton('restore', () => window.electronTheiaCore.unMaximize()),
            this.createControlButton('close', () => window.electronTheiaCore.close())
        );
        app.shell.topPanel.node.append(controls);
        this.handleWindowControls();
    }

    protected createCustomTitleWidget(app: FrontendApplication): void {
        const titleWidget = this.customTitleWidgetFactory();
        if (titleWidget) {
            app.shell.addWidget(titleWidget, { area: 'top' });
        }
    }

    protected handleWindowControls(): void {
        toggleControlButtons();
        window.electronTheiaCore.onWindowEvent('maximize', toggleControlButtons);
        window.electronTheiaCore.onWindowEvent('unmaximize', toggleControlButtons);

        function toggleControlButtons(): void {
            if (window.electronTheiaCore.isMaximized()) {
                document.body.classList.add('maximized');
            } else {
                document.body.classList.remove('maximized');
            }
        }
    }

    protected createControlButton(id: string, handler: () => void): HTMLElement {
        const button = document.createElement('div');
        button.id = `${id}-button`;
        button.className = `control-button ${codicon(`chrome-${id}`)}`;
        button.addEventListener('click', handler);
        return button;
    }

    protected async handleRequiredRestart(): Promise<void> {
        const msgNode = document.createElement('div');
        const message = document.createElement('p');
        message.textContent = nls.localizeByDefault('A setting has changed that requires a restart to take effect.');
        const detail = document.createElement('p');
        detail.textContent = nls.localizeByDefault(
            'Press the restart button to restart {0} and enable the setting.', FrontendApplicationConfigProvider.get().applicationName);
        msgNode.append(message, detail);
        const restart = nls.localizeByDefault('Restart');
        const dialog = new ConfirmDialog({
            title: restart,
            msg: msgNode,
            ok: restart,
            cancel: Dialog.CANCEL
        });
        if (await dialog.open()) {
            this.windowService.setSafeToShutDown();
            window.electronTheiaCore.restart();
        }
    }

    registerCommands(registry: CommandRegistry): void {

        registry.registerCommand(ElectronCommands.TOGGLE_DEVELOPER_TOOLS, {
            execute: () => {
                window.electronTheiaCore.toggleDevTools();
            }
        });

        registry.registerCommand(ElectronCommands.RELOAD, {
            execute: () => this.windowService.reload()
        });
        registry.registerCommand(ElectronCommands.CLOSE_WINDOW, {
            execute: () => window.electronTheiaCore.close()
        });

        registry.registerCommand(ElectronCommands.ZOOM_IN, {
            execute: async () => {
                const currentLevel = await window.electronTheiaCore.getZoomLevel();
                // When starting at a level that is not a multiple of 0.5, increment by at most 0.5 to reach the next highest multiple of 0.5.
                let zoomLevel = (Math.floor(currentLevel / ZoomLevel.VARIATION) * ZoomLevel.VARIATION) + ZoomLevel.VARIATION;
                if (zoomLevel > ZoomLevel.MAX) {
                    zoomLevel = ZoomLevel.MAX;
                    return;
                };
                this.preferenceService.set('window.zoomLevel', zoomLevel, PreferenceScope.User);
            }
        });
        registry.registerCommand(ElectronCommands.ZOOM_OUT, {
            execute: async () => {
                const currentLevel = await window.electronTheiaCore.getZoomLevel();
                // When starting at a level that is not a multiple of 0.5, decrement by at most 0.5 to reach the next lowest multiple of 0.5.
                let zoomLevel = (Math.ceil(currentLevel / ZoomLevel.VARIATION) * ZoomLevel.VARIATION) - ZoomLevel.VARIATION;
                if (zoomLevel < ZoomLevel.MIN) {
                    zoomLevel = ZoomLevel.MIN;
                    return;
                };
                this.preferenceService.set('window.zoomLevel', zoomLevel, PreferenceScope.User);
            }
        });
        registry.registerCommand(ElectronCommands.RESET_ZOOM, {
            execute: () => this.preferenceService.set('window.zoomLevel', ZoomLevel.DEFAULT, PreferenceScope.User)
        });

        registry.registerCommand(ElectronCommands.TOGGLE_FULL_SCREEN, {
            isEnabled: () => window.electronTheiaCore.isFullScreenable(),
            isVisible: () => window.electronTheiaCore.isFullScreenable(),
            execute: () => this.toggleFullScreen()
        });
    }

    registerKeybindings(registry: KeybindingRegistry): void {
        registry.registerKeybindings(
            {
                command: ElectronCommands.TOGGLE_DEVELOPER_TOOLS.id,
                keybinding: 'ctrlcmd+alt+i'
            },
            {
                command: ElectronCommands.RELOAD.id,
                keybinding: 'ctrlcmd+r'
            },
            {
                command: ElectronCommands.ZOOM_IN.id,
                keybinding: 'ctrlcmd+='
            },
            {
                command: ElectronCommands.ZOOM_IN.id,
                keybinding: 'ctrlcmd+add'
            },
            {
                command: ElectronCommands.ZOOM_OUT.id,
                keybinding: 'ctrlcmd+subtract'
            },
            {
                command: ElectronCommands.ZOOM_OUT.id,
                keybinding: 'ctrlcmd+-'
            },
            {
                command: ElectronCommands.RESET_ZOOM.id,
                keybinding: 'ctrlcmd+0'
            },
            {
                command: ElectronCommands.CLOSE_WINDOW.id,
                keybinding: (isOSX ? 'cmd+shift+w' : (isWindows ? 'ctrl+w' : /* Linux */ 'ctrl+q'))
            },
            {
                command: ElectronCommands.TOGGLE_FULL_SCREEN.id,
                keybinding: isOSX ? 'ctrl+ctrlcmd+f' : 'f11'
            }
        );
    }

    registerMenus(registry: MenuModelRegistry): void {
        registry.registerMenuAction(ElectronMenus.HELP_TOGGLE, {
            commandId: ElectronCommands.TOGGLE_DEVELOPER_TOOLS.id
        });

        registry.registerMenuAction(ElectronMenus.VIEW_WINDOW, {
            commandId: ElectronCommands.RELOAD.id,
            order: 'z0'
        });

        registry.registerMenuAction(ElectronMenus.VIEW_ZOOM, {
            commandId: ElectronCommands.ZOOM_IN.id,
            order: 'z1'
        });
        registry.registerMenuAction(ElectronMenus.VIEW_ZOOM, {
            commandId: ElectronCommands.ZOOM_OUT.id,
            order: 'z2'
        });
        registry.registerMenuAction(ElectronMenus.VIEW_ZOOM, {
            commandId: ElectronCommands.RESET_ZOOM.id,
            order: 'z3'
        });
        registry.registerMenuAction(ElectronMenus.FILE_CLOSE, {
            commandId: ElectronCommands.CLOSE_WINDOW.id,
        });
        registry.registerMenuAction(CommonMenus.VIEW_APPEARANCE_SUBMENU_SCREEN, {
            commandId: ElectronCommands.TOGGLE_FULL_SCREEN.id,
            label: nls.localizeByDefault('Full Screen'),
            order: '0'
        });
    }

    protected toggleFullScreen(): void {
        window.electronTheiaCore.toggleFullScreen();
        const menuBarVisibility = this.preferenceService.get('window.menuBarVisibility', 'classic');
        this.handleFullScreen(menuBarVisibility);
    }

    protected handleFullScreen(menuBarVisibility: string): void {
        const shouldShowTop = !window.electronTheiaCore.isFullScreen() || menuBarVisibility === 'visible';
        if (this.titleBarStyle === 'native') {
            window.electronTheiaCore.setMenuBarVisible(shouldShowTop);
        } else if (shouldShowTop) {
            this.shell.topPanel.show();
        } else {
            this.shell.topPanel.hide();
        }
    }

    protected handleThemeChange(e: ThemeChangeEvent): void {
        const backgroundColor = window.getComputedStyle(document.body).backgroundColor;
        window.electronTheiaCore.setBackgroundColor(backgroundColor);
    }

}

@injectable()
export class CustomTitleWidget extends Widget {

    @inject(ElectronMenuContribution)
    protected readonly electronMenuContribution: ElectronMenuContribution;

    @inject(WindowTitleService)
    protected readonly windowTitleService: WindowTitleService;

    @inject(ApplicationShell)
    protected readonly applicationShell: ApplicationShell;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    constructor() {
        super();
        this.id = 'theia-custom-title';
    }

    @postConstruct()
    protected init(): void {
        this.updateTitle(this.windowTitleService.title);
        this.windowTitleService.onDidChangeTitle(title => {
            this.updateTitle(title);
        });
        this.preferenceService.onPreferenceChanged(e => {
            if (e.preferenceName === 'window.menuBarVisibility') {
                animationFrame().then(() => this.adjustTitleToCenter());
            }
        });
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        this.adjustTitleToCenter();
        super.onResize(msg);
    }

    protected override onAfterShow(msg: Message): void {
        this.adjustTitleToCenter();
        super.onAfterShow(msg);
    }

    protected updateTitle(title: string): void {
        this.node.textContent = title;
        this.adjustTitleToCenter();
    }

    protected adjustTitleToCenter(): void {
        const menubar = this.electronMenuContribution.menuBar;
        if (menubar) {
            const titleWidth = this.node.clientWidth;
            const margin = 16;
            const leftMarker = menubar.node.offsetLeft + menubar.node.clientWidth + margin;
            const panelWidth = this.applicationShell.topPanel.node.clientWidth;
            const controlsWidth = 48 * 3; // Each window button has a width of 48px
            const rightMarker = panelWidth - controlsWidth - margin;

            let hidden = false;
            let relative = false;
            this.node.style.left = '50%';
            // The title has not enough space between the menu and the window controls
            // So we simply hide it
            if (rightMarker - leftMarker < titleWidth) {
                hidden = true;
            } else if ((panelWidth - titleWidth) / 2 < leftMarker || (panelWidth + titleWidth) / 2 > rightMarker) {
                // This indicates that the title has either hit the left (menu) or right (window controls) marker
                relative = true;
                this.node.style.left = `${leftMarker + (rightMarker - leftMarker - titleWidth) / 2}px`;
            }
            this.node.classList.toggle('hidden', hidden);
            this.node.classList.toggle('relative', relative);
        }
    }
}
