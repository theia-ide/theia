// *****************************************************************************
// Copyright (C) 2021 logi.cals GmbH, EclipseSource and others.
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

import { ElementHandle } from '@playwright/test';
import { TheiaApp } from './theia-app';
import { TheiaView } from './theia-view';

const TheiaSettingsViewData = {
    tabSelector: '#shell-tab-settings_widget',
    viewSelector: '#settings_widget'
};

export const PreferenceIds = {
    Editor: {
        AutoSave: 'files.autoSave',
        RenderWhitespace: 'editor.renderWhitespace'
    },
    Explorer: {
        AutoReveal: 'explorer.autoReveal'
    },
    DiffEditor: {
        MaxComputationTime: 'diffEditor.maxComputationTime'
    },
    Files: {
        EnableTrash: 'files.enableTrash'
    }
};

export const DefaultPreferences = {
    Editor: {
        AutoSave: {
            Off: 'off',
            AfterDelay: 'afterDelay',
            OnFocusChange: 'onFocusChange',
            OnWindowChange: 'onWindowChange'
        },
        RenderWhitespace: {
            None: 'none',
            Boundary: 'boundary',
            Selection: 'selection',
            Trailing: 'trailing',
            All: 'all'
        }
    },
    Explorer: {
        AutoReveal: {
            Enabled: true
        }
    },
    DiffEditor: {
        MaxComputationTime: '5000'
    },
    Files: {
        EnableTrash: {
            Enabled: true
        }
    }
};

export enum TheiaPreferenceScope {
    User = 'User',
    Workspace = 'Workspace'
}

export class TheiaPreferenceView extends TheiaView {
    public customTimeout?: number;
    protected modificationIndicator = '.theia-mod-item-modified';
    protected optionSelectLabel = '.theia-select-component-label';
    protected optionSelectDropdown = '.theia-select-component-dropdown';
    protected optionSelectDropdownValue = '.theia-select-component-option-value';

    constructor(app: TheiaApp) {
        super(TheiaSettingsViewData, app);
    }

    /**
     * @param preferenceScope The preference scope (Workspace or User) to open the view for. Default is Workspace.
     * @param useMenu  If true, the view will be opened via the main menu. If false,
     *  the view will be opened via the quick command palette. Default is using the main menu.
     * @returns  The TheiaPreferenceView page object instance.
     */
    override async open(preferenceScope = TheiaPreferenceScope.Workspace, useMenu: boolean = true): Promise<TheiaView> {
        if (useMenu) {
            const mainMenu = await this.app.menuBar.openMenu('File');
            await (await mainMenu.menuItemByNamePath('Preferences', 'Settings'))?.click();
        } else {
            await this.app.quickCommandPalette.type('Preferences:');
            await this.app.quickCommandPalette.trigger('Preferences: Open Settings (UI)');
        }
        await this.waitForVisible();
        await this.openPreferenceScope(preferenceScope);
        return this;
    }

    protected getScopeSelector(scope: TheiaPreferenceScope): string {
        return `li.preferences-scope-tab div.lm-TabBar-tabLabel:has-text("${scope}")`;
    }

    async openPreferenceScope(scope: TheiaPreferenceScope): Promise<void> {
        await this.activate();
        const scopeTab = await this.page.waitForSelector(this.getScopeSelector(scope));
        await scopeTab.click();
    }

    async getBooleanPreferenceByPath(sectionTitle: string, name: string): Promise<boolean> {
        const preferenceId = await this.findPreferenceId(sectionTitle, name);
        return this.getBooleanPreferenceById(preferenceId);
    }

    async getBooleanPreferenceById(preferenceId: string): Promise<boolean> {
        const element = await this.findPreferenceEditorById(preferenceId);
        return element.isChecked();
    }

    async setBooleanPreferenceByPath(sectionTitle: string, name: string, value: boolean): Promise<void> {
        const preferenceId = await this.findPreferenceId(sectionTitle, name);
        return this.setBooleanPreferenceById(preferenceId, value);
    }

    async setBooleanPreferenceById(preferenceId: string, value: boolean): Promise<void> {
        const element = await this.findPreferenceEditorById(preferenceId);
        return value ? element.check() : element.uncheck();
    }

    async getStringPreferenceByPath(sectionTitle: string, name: string): Promise<string> {
        const preferenceId = await this.findPreferenceId(sectionTitle, name);
        return this.getStringPreferenceById(preferenceId);
    }

    async getStringPreferenceById(preferenceId: string): Promise<string> {
        const element = await this.findPreferenceEditorById(preferenceId);
        return element.evaluate(e => (e as HTMLInputElement).value);
    }

    async setStringPreferenceByPath(sectionTitle: string, name: string, value: string): Promise<void> {
        const preferenceId = await this.findPreferenceId(sectionTitle, name);
        return this.setStringPreferenceById(preferenceId, value);
    }

    async setStringPreferenceById(preferenceId: string, value: string): Promise<void> {
        const element = await this.findPreferenceEditorById(preferenceId);
        return element.fill(value);
    }

    async getOptionsPreferenceByPath(sectionTitle: string, name: string): Promise<string> {
        const preferenceId = await this.findPreferenceId(sectionTitle, name);
        return this.getOptionsPreferenceById(preferenceId);
    }

    async getOptionsPreferenceById(preferenceId: string): Promise<string> {
        const element = await this.findPreferenceEditorById(preferenceId, this.optionSelectLabel);
        return element.evaluate(e => e.textContent ?? '');
    }

    async setOptionsPreferenceByPath(sectionTitle: string, name: string, value: string): Promise<void> {
        const preferenceId = await this.findPreferenceId(sectionTitle, name);
        return this.setOptionsPreferenceById(preferenceId, value);
    }

    async setOptionsPreferenceById(preferenceId: string, value: string): Promise<void> {
        const element = await this.findPreferenceEditorById(preferenceId, this.optionSelectLabel);
        await element.click();
        const option = await this.page.waitForSelector(`${this.optionSelectDropdown} ${this.optionSelectDropdownValue}:has-text("${value}")`);
        await option.click();
    }

    async resetPreferenceByPath(sectionTitle: string, name: string): Promise<void> {
        const preferenceId = await this.findPreferenceId(sectionTitle, name);
        return this.resetPreferenceById(preferenceId);
    }

    async resetPreferenceById(preferenceId: string): Promise<void> {
        // this is just to fail if the preference doesn't exist at all
        await this.findPreferenceEditorById(preferenceId, '');
        const resetPreferenceButton = await this.findPreferenceResetButton(preferenceId);
        await resetPreferenceButton.click();
        await this.waitForUnmodified(preferenceId);
    }

    private async findPreferenceId(sectionTitle: string, name: string): Promise<string> {
        const viewElement = await this.viewElement();
        const sectionElement = await viewElement?.$(`xpath=//li[contains(@class, 'settings-section-title') and text() = '${sectionTitle}']/..`);

        const firstPreferenceAfterSection = await sectionElement?.$(`xpath=following-sibling::li[div/text() = '${name}'][1]`);
        const preferenceId = await firstPreferenceAfterSection?.getAttribute('data-pref-id');
        if (!preferenceId) {
            throw new Error(`Could not find preference id for "${sectionTitle}" > (...) > "${name}"`);
        }
        return preferenceId;
    }

    private async findPreferenceEditorById(preferenceId: string, elementType: string = 'input'): Promise<ElementHandle<SVGElement | HTMLElement>> {
        const viewElement = await this.viewElement();
        const element = await viewElement?.waitForSelector(this.getPreferenceEditorSelector(preferenceId, elementType), { timeout: this.customTimeout });
        if (!element) {
            throw new Error(`Could not find element with preference id "${preferenceId}"`);
        }
        return element;
    }

    private getPreferenceSelector(preferenceId: string): string {
        return `li[data-pref-id="${preferenceId}"]`;
    }

    private getPreferenceEditorSelector(preferenceId: string, elementType: string): string {
        return `${this.getPreferenceSelector(preferenceId)} ${elementType}`;
    }

    private async findPreferenceResetButton(preferenceId: string): Promise<ElementHandle<SVGElement | HTMLElement>> {
        await this.activate();
        const viewElement = await this.viewElement();
        const settingsContextMenuBtn = await viewElement?.waitForSelector(`${this.getPreferenceSelector(preferenceId)} .settings-context-menu-btn`);
        if (!settingsContextMenuBtn) {
            throw new Error(`Could not find context menu button for element with preference id "${preferenceId}"`);
        }
        await settingsContextMenuBtn.click();
        const resetPreferenceButton = await this.page.waitForSelector('li[data-command="preferences:reset"]');
        if (!resetPreferenceButton) {
            throw new Error(`Could not find menu entry to reset preference with id "${preferenceId}"`);
        }
        return resetPreferenceButton;
    }

    async waitForModified(preferenceId: string): Promise<void> {
        await this.activate();
        const viewElement = await this.viewElement();
        await viewElement?.waitForSelector(`${this.getPreferenceGutterSelector(preferenceId)}${this.modificationIndicator}`, { timeout: this.customTimeout });
    }

    async waitForUnmodified(preferenceId: string): Promise<void> {
        await this.activate();
        const viewElement = await this.viewElement();
        await viewElement?.waitForSelector(`${this.getPreferenceGutterSelector(preferenceId)}${this.modificationIndicator}`, { state: 'detached', timeout: this.customTimeout });
    }

    private getPreferenceGutterSelector(preferenceId: string): string {
        return `${this.getPreferenceSelector(preferenceId)} .pref-context-gutter`;
    }
}
