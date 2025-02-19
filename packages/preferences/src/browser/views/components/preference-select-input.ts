// *****************************************************************************
// Copyright (C) 2021 Ericsson and others.
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

import { PreferenceLeafNodeRenderer, PreferenceNodeRenderer } from './preference-node-renderer';
import { injectable, interfaces } from '@theia/core/shared/inversify';
import { JSONValue } from '@theia/core/shared/@lumino/coreutils';
import { PreferenceProvider } from '@theia/core/lib/browser/preferences/preference-provider';
import { SelectComponent, SelectOption } from '@theia/core/lib/browser/widgets/select-component';
import { Preference } from '../../util/preference-types';
import { PreferenceLeafNodeRendererContribution } from './preference-node-renderer-creator';
import * as React from '@theia/core/shared/react';
import { createRoot } from '@theia/core/shared/react-dom/client';
import { escapeInvisibleChars } from '@theia/core/lib/common/strings';

@injectable()
export class PreferenceSelectInputRenderer extends PreferenceLeafNodeRenderer<JSONValue, HTMLDivElement> {

    protected readonly selectComponent = React.createRef<SelectComponent>();

    protected selectOptions: SelectOption[] = [];

    protected get enumValues(): JSONValue[] {
        return this.preferenceNode.preference.data.enum!;
    }

    protected updateSelectOptions(): void {
        const updatedSelectOptions: SelectOption[] = [];
        const values = this.enumValues;
        const preferenceData = this.preferenceNode.preference.data;
        const defaultValue = preferenceData.default;
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const stringValue = `${value}`;
            const label = escapeInvisibleChars(preferenceData.enumItemLabels?.[i] ?? stringValue);
            const detail = PreferenceProvider.deepEqual(defaultValue, value) ? 'default' : undefined;
            let enumDescription = preferenceData.enumDescriptions?.[i];
            let markdown = false;
            const markdownEnumDescription = preferenceData.markdownEnumDescriptions?.[i];
            if (markdownEnumDescription) {
                enumDescription = this.markdownRenderer.renderInline(markdownEnumDescription);
                markdown = true;
            }
            updatedSelectOptions.push({
                label,
                value: stringValue,
                detail,
                description: enumDescription,
                markdown
            });
        }
        this.selectOptions = updatedSelectOptions;
    }

    protected createInteractable(parent: HTMLElement): void {
        this.updateSelectOptions();
        const interactable = document.createElement('div');
        const selectComponent = React.createElement(SelectComponent, {
            options: this.selectOptions,
            defaultValue: this.getDataValue(),
            onChange: (_, index) => this.handleUserInteraction(index),
            ref: this.selectComponent
        });
        this.interactable = interactable;
        const root = createRoot(interactable);
        root.render(selectComponent);
        parent.appendChild(interactable);
    }

    protected getFallbackValue(): JSONValue {
        const { default: schemaDefault, defaultValue, enum: enumValues } = this.preferenceNode.preference.data;
        return schemaDefault !== undefined
            ? schemaDefault : defaultValue !== undefined
                ? defaultValue
                : enumValues![0];
    }

    protected doHandleValueChange(): void {
        this.updateInspection();
        this.updateSelectOptions();
        const newValue = this.getDataValue();
        this.updateModificationStatus(this.getValue());
        if (document.activeElement !== this.interactable && this.selectComponent.current) {
            this.selectComponent.current.value = newValue;
        }
    }

    /**
     * Returns the stringified index corresponding to the currently selected value.
     */
    protected getDataValue(): number {
        const currentValue = this.getValue();
        let selected = this.enumValues.findIndex(value => PreferenceProvider.deepEqual(value, currentValue));
        if (selected === -1) {
            const fallback = this.getFallbackValue();
            selected = this.enumValues.findIndex(value => PreferenceProvider.deepEqual(value, fallback));
        }
        return Math.max(selected, 0);
    }

    protected handleUserInteraction(selected: number): void {
        const value = this.enumValues[selected];
        this.setPreferenceImmediately(value);
    }
}

@injectable()
export class PreferenceSelectInputRendererContribution extends PreferenceLeafNodeRendererContribution {
    static ID = 'preference-select-input-renderer';
    id = PreferenceSelectInputRendererContribution.ID;

    canHandleLeafNode(node: Preference.LeafNode): number {
        return node.preference.data.enum ? 3 : 0;
    }

    createLeafNodeRenderer(container: interfaces.Container): PreferenceNodeRenderer {
        return container.get(PreferenceSelectInputRenderer);
    }
}
