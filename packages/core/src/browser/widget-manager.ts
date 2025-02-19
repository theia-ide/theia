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

import { inject, named, injectable } from 'inversify';
import { Widget } from '@lumino/widgets';
import { ILogger, Emitter, Event, ContributionProvider, MaybePromise, WaitUntilEvent } from '../common';
import stableJsonStringify = require('fast-json-stable-stringify');

/* eslint-disable @typescript-eslint/no-explicit-any */
export const WidgetFactory = Symbol('WidgetFactory');

/**
 * A {@link WidgetFactory} is used to create new widgets. Factory-specific information (options) can be passed as serializable JSON data.
 * The common {@link WidgetManager} collects  `WidgetFactory` contributions and delegates to the corresponding factory when
 * a widget should be created or restored. To identify widgets the `WidgetManager` uses a description composed of the factory id and the options.
 * The `WidgetFactory` does support both, synchronous and asynchronous widget creation.
 *
 * ### Example usage
 *
 * ```typescript
 * export class MyWidget extends BaseWidget {
 * }
 *
 * @injectable()
 * export class MyWidgetFactory implements WidgetFactory {
 *     id = 'myWidgetFactory';
 *
 *     createWidget(): MaybePromise<Widget> {
 *         return new MyWidget();
 *    }
 * }
 * ```
 */
export interface WidgetFactory {

    /**
     * The factory id.
     */
    readonly id: string;

    /**
     * Creates a widget using the given options.
     * @param options factory specific information as serializable JSON data.
     *
     * @returns the newly created widget or a promise of the widget
     */
    createWidget(options?: any): MaybePromise<Widget>;
}

/**
 * Representation of the `WidgetConstructionOptions`.
 * Defines a serializable description to create widgets.
 */
export interface WidgetConstructionOptions {
    /**
     * The id of the widget factory to use.
     */
    factoryId: string,

    /**
     * The widget factory specific information.
     */
    options?: any
}

/**
 * Representation of a `willCreateWidgetEvent`.
 */
export interface WillCreateWidgetEvent extends WaitUntilEvent {
    /**
     * The widget which will be created.
     */
    readonly widget: Widget;
    /**
     * The widget factory id.
     */
    readonly factoryId: string;
}

/**
 * Representation of a `didCreateWidgetEvent`.
 */
export interface DidCreateWidgetEvent {
    /**
     * The widget which was created.
     */
    readonly widget: Widget;
    /**
     * The widget factory id.
     */
    readonly factoryId: string;
}

/**
 * The {@link WidgetManager} is the common component responsible for creating and managing widgets. Additional widget factories
 * can be registered by using the {@link WidgetFactory} contribution point. To identify a widget, created by a factory, the factory id and
 * the creation options are used. This key is commonly referred to as `description` of the widget.
 */
@injectable()
export class WidgetManager {

    protected _cachedFactories: Map<string, WidgetFactory>;
    protected readonly widgets = new Map<string, Widget>();
    protected readonly pendingWidgetPromises = new Map<string, Promise<Widget>>();

    @inject(ContributionProvider) @named(WidgetFactory)
    protected readonly factoryProvider: ContributionProvider<WidgetFactory>;

    @inject(ILogger)
    protected readonly logger: ILogger;

    protected readonly onWillCreateWidgetEmitter = new Emitter<WillCreateWidgetEvent>();
    /**
     * An event can be used to participate in the widget creation.
     * Listeners may not dispose the given widget.
     */
    readonly onWillCreateWidget: Event<WillCreateWidgetEvent> = this.onWillCreateWidgetEmitter.event;

    protected readonly onDidCreateWidgetEmitter = new Emitter<DidCreateWidgetEvent>();

    readonly onDidCreateWidget: Event<DidCreateWidgetEvent> = this.onDidCreateWidgetEmitter.event;

    /**
     * Get the list of widgets created by the given widget factory.
     * @param factoryId the widget factory id.
     *
     * @returns the list of widgets created by the factory with the given id.
     */
    getWidgets(factoryId: string): Widget[] {
        const result: Widget[] = [];
        for (const [key, widget] of this.widgets.entries()) {
            if (this.fromKey(key).factoryId === factoryId) {
                result.push(widget);
            }
        }
        return result;
    }

    /**
     * Try to get the existing widget for the given description.
     * @param factoryId The widget factory id.
     * @param options The widget factory specific information.
     *
     * @returns the widget if available, else `undefined`.
     *
     * The widget is 'available' if it has been created with the same {@link factoryId} and {@link options} by the {@link WidgetManager}.
     * If the widget's creation is asynchronous, it is only available when the associated `Promise` is resolved.
     */
    tryGetWidget<T extends Widget>(factoryId: string, options?: any): T | undefined {
        const key = this.toKey({ factoryId, options });
        const existing = this.widgets.get(key);
        if (existing instanceof Widget) {
            return existing as T;
        }
        return undefined;
    }

    /**
     * Try to get the existing widget for the given description.
     * @param factoryId The widget factory id.
     * @param options The widget factory specific information.
     *
     * @returns A promise that resolves to the widget, if any exists. The promise may be pending, so be cautious when assuming that it will not reject.
     */
    tryGetPendingWidget<T extends Widget>(factoryId: string, options?: any): MaybePromise<T> | undefined {
        const key = this.toKey({ factoryId, options });
        return this.doGetWidget(key);
    }

    /**
     * Get the widget for the given description.
     * @param factoryId The widget factory id.
     * @param options The widget factory specific information.
     *
     * @returns a promise resolving to the widget if available, else `undefined`.
     */
    async getWidget<T extends Widget>(factoryId: string, options?: any): Promise<T | undefined> {
        const key = this.toKey({ factoryId, options });
        const pendingWidget = this.doGetWidget<T>(key);
        const widget = pendingWidget && await pendingWidget;
        return widget;
    }

    /**
     * Finds a widget that matches the given test predicate.
     * @param factoryId The widget factory id.
     * @param predicate The test predicate.
     *
     * @returns a promise resolving to the widget if available, else `undefined`.
     */
    async findWidget<T extends Widget>(factoryId: string, predicate: (options?: any) => boolean): Promise<T | undefined> {
        for (const [key, widget] of this.widgets.entries()) {
            if (this.testPredicate(key, factoryId, predicate)) {
                return widget as T;
            }
        }
        for (const [key, widgetPromise] of this.pendingWidgetPromises.entries()) {
            if (this.testPredicate(key, factoryId, predicate)) {
                return widgetPromise as Promise<T>;
            }
        }
    }

    protected testPredicate(key: string, factoryId: string, predicate: (options?: any) => boolean): boolean {
        const constructionOptions = this.fromKey(key);
        return constructionOptions.factoryId === factoryId && predicate(constructionOptions.options);
    }

    protected doGetWidget<T extends Widget>(key: string): MaybePromise<T> | undefined {
        const pendingWidget = this.widgets.get(key) ?? this.pendingWidgetPromises.get(key);
        if (pendingWidget) {
            return pendingWidget as MaybePromise<T>;
        }
        return undefined;
    }

    /**
     * Creates a new widget or returns the existing widget for the given description.
     * @param factoryId the widget factory id.
     * @param options the widget factory specific information.
     *
     * @returns a promise resolving to the widget.
     */
    async getOrCreateWidget<T extends Widget>(factoryId: string, options?: any): Promise<T> {
        const key = this.toKey({ factoryId, options });
        const existingWidget = this.doGetWidget<T>(key);
        if (existingWidget) {
            return existingWidget;
        }
        const factory = this.factories.get(factoryId);
        if (!factory) {
            throw Error("No widget factory '" + factoryId + "' has been registered.");
        }
        const widgetPromise = this.doCreateWidget<T>(factory, options).then(widget => {
            this.widgets.set(key, widget);
            widget.disposed.connect(() => this.widgets.delete(key));
            this.onDidCreateWidgetEmitter.fire({ factoryId, widget });
            return widget;
        }).finally(() => this.pendingWidgetPromises.delete(key));
        this.pendingWidgetPromises.set(key, widgetPromise);
        return widgetPromise;
    }

    protected async doCreateWidget<T extends Widget>(factory: WidgetFactory, options?: any): Promise<T> {
        const widget = await factory.createWidget(options);
        // Note: the widget creation process also includes the 'onWillCreateWidget' part, which can potentially fail
        try {
            await WaitUntilEvent.fire(this.onWillCreateWidgetEmitter, { factoryId: factory.id, widget });
        } catch (e) {
            widget.dispose();
            throw e;
        }
        return widget as T;
    }

    /**
     * Get the widget construction options.
     * @param widget the widget.
     *
     * @returns the widget construction options if the widget was created through the manager, else `undefined`.
     */
    getDescription(widget: Widget): WidgetConstructionOptions | undefined {
        for (const [key, aWidget] of this.widgets.entries()) {
            if (aWidget === widget) {
                return this.fromKey(key);
            }
        }
        return undefined;
    }

    /**
     * Convert the widget construction options to string.
     * @param options the widget construction options.
     *
     * @returns the widget construction options represented as a string.
     */
    protected toKey(options: WidgetConstructionOptions): string {
        return stableJsonStringify(options);
    }

    /**
     * Convert the key into the widget construction options object.
     * @param key the key.
     *
     * @returns the widget construction options object.
     */
    protected fromKey(key: string): WidgetConstructionOptions {
        return JSON.parse(key);
    }

    protected get factories(): Map<string, WidgetFactory> {
        if (!this._cachedFactories) {
            this._cachedFactories = new Map();
            for (const factory of this.factoryProvider.getContributions()) {
                if (factory.id) {
                    this._cachedFactories.set(factory.id, factory);
                } else {
                    this.logger.error('Invalid ID for factory: ' + factory + ". ID was: '" + factory.id + "'.");
                }
            }
        }
        return this._cachedFactories;
    }

}
