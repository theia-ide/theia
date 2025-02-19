// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
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
import { PreferenceSchema } from '../../common/preferences/preference-schema';
import { Disposable, DisposableCollection, Emitter, Event, isObject, MaybePromise } from '../../common';
import { PreferenceChangeEvent, PreferenceEventEmitter, PreferenceProxy, PreferenceProxyOptions, PreferenceRetrieval } from './preference-proxy';
import { PreferenceChange, PreferenceChangeImpl, PreferenceChanges, PreferenceScope, PreferenceService } from './preference-service';
import { JSONValue } from '@lumino/coreutils';
import { PreferenceProviderDataChange } from './preference-provider';
import { OverridePreferenceName } from './preference-language-override-service';

export const PreferenceProxySchema = Symbol('PreferenceProxySchema');
export interface PreferenceProxyFactory {
    <T>(schema: MaybePromise<PreferenceSchema>, options?: PreferenceProxyOptions): PreferenceProxy<T>;
}
export const PreferenceProxyFactory = Symbol('PreferenceProxyFactory');

export class PreferenceProxyChange extends PreferenceChangeImpl {
    constructor(change: PreferenceProviderDataChange, protected readonly overrideIdentifier?: string) {
        super(change);
    }

    override affects(resourceUri?: string, overrideIdentifier?: string): boolean {
        if (overrideIdentifier !== this.overrideIdentifier) {
            return false;
        }
        return super.affects(resourceUri);
    }
}

@injectable()
export class InjectablePreferenceProxy<T extends Record<string, JSONValue>> implements
    ProxyHandler<T>, ProxyHandler<Disposable>, ProxyHandler<PreferenceEventEmitter<T>>, ProxyHandler<PreferenceRetrieval<T>> {

    @inject(PreferenceProxyOptions) protected readonly options: PreferenceProxyOptions;
    @inject(PreferenceService) protected readonly preferences: PreferenceService;
    @inject(PreferenceProxySchema) protected readonly promisedSchema: () => PreferenceSchema | Promise<PreferenceSchema>;
    @inject(PreferenceProxyFactory) protected readonly factory: PreferenceProxyFactory;
    protected toDispose = new DisposableCollection();
    protected _onPreferenceChangedEmitter: Emitter<PreferenceChangeEvent<T>> | undefined;
    protected schema: PreferenceSchema | undefined;

    protected get prefix(): string {
        return this.options.prefix ?? '';
    }

    protected get style(): Required<PreferenceProxyOptions>['style'] {
        return this.options.style ?? 'flat';
    }

    protected get resourceUri(): PreferenceProxyOptions['resourceUri'] {
        return this.options.resourceUri;
    }

    protected get overrideIdentifier(): PreferenceProxyOptions['overrideIdentifier'] {
        return this.options.overrideIdentifier;
    }

    protected get isDeep(): boolean {
        const { style } = this;
        return style === 'deep' || style === 'both';
    }

    protected get isFlat(): boolean {
        const { style } = this;
        return style === 'flat' || style === 'both';
    }

    protected get onPreferenceChangedEmitter(): Emitter<PreferenceChangeEvent<T>> {
        if (!this._onPreferenceChangedEmitter) {
            this._onPreferenceChangedEmitter = new Emitter();
            this.subscribeToChangeEvents();
            this.toDispose.push(this._onPreferenceChangedEmitter);
        }
        return this._onPreferenceChangedEmitter;
    }

    get onPreferenceChanged(): Event<PreferenceChangeEvent<T>> {
        return this.onPreferenceChangedEmitter.event;
    }

    @postConstruct()
    protected init(): void {
        const schema = this.promisedSchema();
        if (schema instanceof Promise) {
            schema.then(resolvedSchema => this.schema = resolvedSchema);
        } else {
            this.schema = schema;
        }
    }

    get(target: unknown, property: string, receiver: unknown): unknown {
        if (typeof property !== 'string') {
            throw new Error(`Unexpected property: ${String(property)}`);
        }
        const preferenceName = this.prefix + property;
        if (this.schema && (this.isFlat || !property.includes('.')) && this.schema.properties[preferenceName]) {
            const { overrideIdentifier } = this;
            const toGet = overrideIdentifier ? this.preferences.overridePreferenceName({ overrideIdentifier, preferenceName }) : preferenceName;
            return this.getValue(toGet as keyof T & string, undefined!);
        }
        switch (property) {
            case 'onPreferenceChanged':
                return this.onPreferenceChanged;
            case 'dispose':
                return this.dispose.bind(this);
            case 'ready':
                return Promise.all([this.preferences.ready, this.promisedSchema]).then(() => undefined);
            case 'get':
                return this.getValue.bind(this);
            case 'toJSON':
                return this.toJSON.bind(this);
            case 'ownKeys':
                return this.ownKeys.bind(this);
        }
        if (this.schema && this.isDeep) {
            const prefix = `${preferenceName}.`;
            if (Object.keys(this.schema.properties).some(key => key.startsWith(prefix))) {
                const { style, resourceUri, overrideIdentifier } = this;
                return this.factory(this.schema, { prefix, resourceUri, style, overrideIdentifier });
            }
            let value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
            let parentSegment = preferenceName;
            const segments = [];
            do {
                const index = parentSegment.lastIndexOf('.');
                segments.push(parentSegment.substring(index + 1));
                parentSegment = parentSegment.substring(0, index);
                if (parentSegment in this.schema.properties) {
                    value = this.get(target, parentSegment, receiver);
                }
            } while (parentSegment && value === undefined);

            let segment;
            while (isObject(value) && (segment = segments.pop())) {
                value = value[segment];
            }
            return segments.length ? undefined : value;
        }
    }

    set(target: unknown, property: string, value: unknown, receiver: unknown): boolean {
        if (typeof property !== 'string') {
            throw new Error(`Unexpected property: ${String(property)}`);
        }
        const { style, schema, prefix, resourceUri, overrideIdentifier } = this;
        if (style === 'deep' && property.indexOf('.') !== -1) {
            return false;
        }
        if (schema) {
            const fullProperty = prefix ? prefix + property : property;
            if (schema.properties[fullProperty]) {
                this.preferences.set(fullProperty, value, PreferenceScope.Default);
                return true;
            }
            const newPrefix = fullProperty + '.';
            for (const p of Object.keys(schema.properties)) {
                if (p.startsWith(newPrefix)) {
                    const subProxy = this.factory<T>(schema, {
                        prefix: newPrefix,
                        resourceUri,
                        overrideIdentifier,
                        style
                    }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                    const valueAsContainer = value as T;
                    for (const k of Object.keys(valueAsContainer)) {
                        subProxy[k as keyof T] = valueAsContainer[k as keyof T];
                    }
                }
            }
        }
        return false;
    }

    ownKeys(): string[] {
        const properties = [];
        if (this.schema) {
            const { isDeep, isFlat, prefix } = this;
            for (const property of Object.keys(this.schema.properties)) {
                if (property.startsWith(prefix)) {
                    const idx = property.indexOf('.', prefix.length);
                    if (idx !== -1 && isDeep) {
                        const pre = property.substring(prefix.length, idx);
                        if (properties.indexOf(pre) === -1) {
                            properties.push(pre);
                        }
                    }
                    const prop = property.substring(prefix.length);
                    if (isFlat || prop.indexOf('.') === -1) {
                        properties.push(prop);
                    }
                }
            }
        }
        return properties;
    }

    getOwnPropertyDescriptor(target: unknown, property: string): PropertyDescriptor {
        if (this.ownKeys().includes(property)) {
            return {
                enumerable: true,
                configurable: true
            };
        }
        return {};
    }

    deleteProperty(): never {
        throw new Error('Unsupported operation');
    }

    defineProperty(): never {
        throw new Error('Unsupported operation');
    }

    toJSON(): JSONValue {
        const result: JSONValue = {};
        for (const key of this.ownKeys()) {
            result[key] = this.get(undefined, key, undefined) as JSONValue;
        }
        return result;
    };

    protected subscribeToChangeEvents(): void {
        this.toDispose.push(this.preferences.onPreferencesChanged(changes => this.handlePreferenceChanges(changes)));
    }

    protected handlePreferenceChanges(changes: PreferenceChanges): void {
        if (this.schema) {
            for (const change of Object.values(changes)) {
                const overrideInfo = this.preferences.overriddenPreferenceName(change.preferenceName);
                if (this.isRelevantChange(change, overrideInfo)) {
                    this.fireChangeEvent(this.buildNewChangeEvent(change, overrideInfo));
                }
            }
        }
    }

    protected isRelevantChange(change: PreferenceChange, overrideInfo?: OverridePreferenceName): boolean {
        const preferenceName = overrideInfo?.preferenceName ?? change.preferenceName;
        return preferenceName.startsWith(this.prefix)
            && (!this.overrideIdentifier || overrideInfo?.overrideIdentifier === this.overrideIdentifier)
            && Boolean(this.schema?.properties[preferenceName]);
    }

    protected fireChangeEvent(change: PreferenceChangeEvent<T>): void {
        this.onPreferenceChangedEmitter.fire(change);
    }

    protected buildNewChangeEvent(change: PreferenceProviderDataChange, overrideInfo?: OverridePreferenceName): PreferenceChangeEvent<T> {
        const preferenceName = (overrideInfo?.preferenceName ?? change.preferenceName) as keyof T & string;
        const { newValue, oldValue, scope, domain } = change;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new PreferenceProxyChange({ newValue, oldValue, preferenceName, scope, domain }, overrideInfo?.overrideIdentifier) as any;
    }

    protected getValue<K extends keyof T & string>(
        preferenceIdentifier: K | OverridePreferenceName & { preferenceName: K }, defaultValue: T[K], resourceUri = this.resourceUri
    ): T[K] {
        const preferenceName = OverridePreferenceName.is(preferenceIdentifier) ? this.preferences.overridePreferenceName(preferenceIdentifier) : preferenceIdentifier as string;
        return this.preferences.get(preferenceName, defaultValue, resourceUri);
    }

    dispose(): void {
        if (this.options.isDisposable) {
            this.toDispose.dispose();
        }
    }
}
