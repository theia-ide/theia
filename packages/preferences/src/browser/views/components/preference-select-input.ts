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
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

import { PreferenceLeafNodeRenderer, PreferenceNodeRenderer } from './preference-node-renderer';
import { injectable, interfaces } from '@theia/core/shared/inversify';
import { JSONValue } from '@theia/core/shared/@phosphor/coreutils';
import { Preference } from '../../util/preference-types';
import { PreferenceLeafNodeRendererContribution } from './preference-node-renderer-creator';

@injectable()
export class PreferenceSelectInputRenderer extends PreferenceLeafNodeRenderer<JSONValue, HTMLSelectElement> {

    protected get enumValues(): JSONValue[] {
        return this.preferenceNode.preference.data.enum!;
    }

    protected createInteractable(parent: HTMLElement): void {
        const { enumValues } = this;
        const interactable = document.createElement('select');
        this.interactable = interactable;
        interactable.classList.add('theia-select');
        interactable.onchange = this.handleUserInteraction.bind(this);
        for (const [index, value] of enumValues.entries()) {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = `${value}`;
            interactable.appendChild(option);
        }
        interactable.value = this.getDataValue();
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
        const currentValue = this.interactable.value || undefined;
        this.updateInspection();
        const newValue = this.getDataValue();
        this.updateModificationStatus(this.getValue());
        if (newValue !== currentValue && document.activeElement !== this.interactable) {
            this.interactable.value = newValue;
        }
    }

    /**
     * Returns the stringified index corresponding to the currently selected value.
     */
    protected getDataValue(): string {
        const currentValue = this.getValue();
        const selected = this.enumValues.findIndex(value => value === currentValue);
        return selected > -1 ? selected.toString() : '0';
    }

    protected handleUserInteraction(): void {
        const value = this.enumValues[Number(this.interactable.value)];
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
