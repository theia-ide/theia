// *****************************************************************************
// Copyright (C) 2019 Red Hat, Inc. and others.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as debounce from 'p-debounce';
import { Disposable, DisposableCollection, Emitter } from '@theia/core/lib/common';
import { JSONExt, JSONObject } from '@theia/core/shared/@lumino/coreutils';

export interface ScmInputIssue {
    message: string;
    type: ScmInputIssueType;
}

export enum ScmInputIssueType {
    Error = 0,
    Warning = 1,
    Information = 2
}

export interface ScmInputValidator {
    (value: string): Promise<ScmInputIssue | undefined>;
}

export interface ScmInputOptions {
    placeholder?: string;
    validator?: ScmInputValidator;
    visible?: boolean;
    enabled?: boolean;
}

export interface ScmInputData {
    value?: string;
    issue?: ScmInputIssue;
}

export class ScmInput implements Disposable {

    protected readonly onDidChangeEmitter = new Emitter<void>();
    readonly onDidChange = this.onDidChangeEmitter.event;
    protected fireDidChange(): void {
        this.onDidChangeEmitter.fire(undefined);
    }

    protected readonly onDidFocusEmitter = new Emitter<void>();
    readonly onDidFocus = this.onDidFocusEmitter.event;

    protected readonly toDispose = new DisposableCollection(
        this.onDidChangeEmitter,
        this.onDidFocusEmitter
    );

    constructor(
        protected readonly options: ScmInputOptions = {}
    ) { }

    dispose(): void {
        this.toDispose.dispose();
    }

    protected _placeholder = this.options.placeholder;
    get placeholder(): string | undefined {
        return this._placeholder;
    }
    set placeholder(placeholder: string | undefined) {
        if (this._placeholder === placeholder) {
            return;
        }
        this._placeholder = placeholder;
        this.fireDidChange();
    }

    protected _value: string | undefined;
    get value(): string {
        return this._value || '';
    }
    set value(value: string) {
        if (this.value === value) {
            return;
        }
        this._value = value;
        this.fireDidChange();
        this.validate();
    }

    protected _visible = this.options.visible;
    get visible(): boolean {
        return this._visible ?? true;
    }
    set visible(visible: boolean) {
        if (this.visible === visible) {
            return;
        }
        this._visible = visible;
        this.fireDidChange();
        this.validate();
    }

    protected _enabled = this.options.enabled ?? true;
    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(enabled: boolean) {
        if (this._enabled === enabled) {
            return;
        }
        this._enabled = enabled;
        this.fireDidChange();
        this.validate();
    }

    protected _issue: ScmInputIssue | undefined;
    get issue(): ScmInputIssue | undefined {
        return this._issue;
    }
    set issue(issue: ScmInputIssue | undefined) {
        if (JSONExt.deepEqual(<JSONObject>(this._issue || {}), <JSONObject>(issue || {}))) {
            return;
        }
        this._issue = issue;
        this.fireDidChange();
    }

    validate = debounce(async (): Promise<void> => {
        if (this.options.validator) {
            this.issue = await this.options.validator(this.value);
        }
    }, 200);

    focus(): void {
        this.onDidFocusEmitter.fire(undefined);
    }

    toJSON(): ScmInputData {
        return {
            value: this._value,
            issue: this._issue
        };
    }

    fromJSON(data: ScmInputData | any): void {
        if (this._value !== undefined) {
            return;
        }
        if ('value' in data) {
            this._value = data.value;
            this._issue = data.issue;
            this.fireDidChange();
        }
    }
}
