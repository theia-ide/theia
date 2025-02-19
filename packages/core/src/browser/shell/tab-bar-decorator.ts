// *****************************************************************************
// Copyright (C) 2019 Ericsson and others.
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

import debounce = require('lodash.debounce');
import { Title, Widget } from '@lumino/widgets';
import { inject, injectable, named } from 'inversify';
import { ContributionProvider, Emitter, Event } from '../../common';
import { ColorRegistry } from '../color-registry';
import { Decoration, DecorationsService, DecorationsServiceImpl } from '../decorations-service';
import { FrontendApplicationContribution } from '../frontend-application-contribution';
import { Navigatable } from '../navigatable-types';
import { WidgetDecoration } from '../widget-decoration';

export const TabBarDecorator = Symbol('TabBarDecorator');

export interface TabBarDecorator {

    /**
     * The unique identifier of the tab bar decorator.
     */
    readonly id: string;

    /**
     * Event that is fired when any of the available tab bar decorators has changes.
     */
    readonly onDidChangeDecorations: Event<void>;

    /**
     * Decorate title.
     * @param {Title<Widget>} title the title
     * @returns decoration data.
     */
    decorate(title: Title<Widget>): WidgetDecoration.Data[];
}

@injectable()
export class TabBarDecoratorService implements FrontendApplicationContribution {

    protected readonly onDidChangeDecorationsEmitter = new Emitter<void>();

    readonly onDidChangeDecorations = this.onDidChangeDecorationsEmitter.event;

    @inject(ContributionProvider) @named(TabBarDecorator)
    protected readonly contributions: ContributionProvider<TabBarDecorator>;

    @inject(DecorationsService)
    protected readonly decorationsService: DecorationsServiceImpl;

    @inject(ColorRegistry)
    protected readonly colors: ColorRegistry;

    initialize(): void {
        this.contributions.getContributions().map(decorator => decorator.onDidChangeDecorations(this.fireDidChangeDecorations));
    }

    fireDidChangeDecorations = debounce(() => this.onDidChangeDecorationsEmitter.fire(undefined), 150);

    /**
     * Assign tabs the decorators provided by all the contributions.
     * @param {Title<Widget>} title the title
     * @returns an array of its decoration data.
     */
    getDecorations(title: Title<Widget>): WidgetDecoration.Data[] {
        const decorators = this.contributions.getContributions();
        const decorations: WidgetDecoration.Data[] = [];
        for (const decorator of decorators) {
            decorations.push(...decorator.decorate(title));
        }
        if (Navigatable.is(title.owner)) {
            const resourceUri = title.owner.getResourceUri();
            if (resourceUri) {
                const serviceDecorations = this.decorationsService.getDecoration(resourceUri, false);
                decorations.push(...serviceDecorations.map(d => this.fromDecoration(d)));
            }
        }
        return decorations;
    }

    protected fromDecoration(decoration: Decoration): WidgetDecoration.Data {
        const colorVariable = decoration.colorId && this.colors.toCssVariableName(decoration.colorId);
        return {
            tailDecorations: [
                {
                    data: decoration.letter ? decoration.letter : '',
                    fontData: {
                        color: colorVariable && `var(${colorVariable})`
                    },
                    tooltip: decoration.tooltip ? decoration.tooltip : ''
                }
            ]
        };
    }
}
