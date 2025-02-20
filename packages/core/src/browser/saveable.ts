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

import { Widget } from '@phosphor/widgets';
import { Message } from '@phosphor/messaging';
import { Emitter, Event } from '../common/event';
import { MaybePromise } from '../common/types';
import { Key } from './keyboard/keys';
import { AbstractDialog } from './dialogs';
import { nls } from '../common/nls';
import { Disposable, DisposableCollection, isObject, URI } from '../common';
import { BinaryBuffer } from '../common/buffer';

export type AutoSaveMode = 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';

export interface Saveable {
    readonly dirty: boolean;
    /** If false, the saveable will not participate in autosaving. */
    readonly autosaveable?: boolean;
    /**
     * This event is fired when the content of the `dirty` variable changes.
     */
    readonly onDirtyChanged: Event<void>;
    /**
     * This event is fired when the content of the saveable changes.
     * While `onDirtyChanged` is fired to notify the UI that the widget is dirty,
     * `onContentChanged` is used for the auto save throttling.
     */
    readonly onContentChanged: Event<void>;
    /**
     * Saves dirty changes.
     */
    save(options?: SaveOptions): MaybePromise<void>;
    /**
     * Performs the save operation with a new file name.
     */
    saveAs?(options: SaveAsOptions): MaybePromise<void>;
    /**
     * Reverts dirty changes.
     */
    revert?(options?: Saveable.RevertOptions): Promise<void>;
    /**
     * Creates a snapshot of the dirty state. See also {@link Saveable.Snapshot}.
     */
    createSnapshot?(): Saveable.Snapshot;
    /**
     * Applies the given snapshot to the dirty state.
     */
    applySnapshot?(snapshot: object): void;
    /**
     * Serializes the full state of the saveable item to a binary buffer.
     */
    serialize?(): Promise<BinaryBuffer>;
}

export interface SaveableSource {
    readonly saveable: Saveable;
}

export class DelegatingSaveable implements Saveable {
    dirty = false;
    protected readonly onDirtyChangedEmitter = new Emitter<void>();
    protected readonly onContentChangedEmitter = new Emitter<void>();

    get onDirtyChanged(): Event<void> {
        return this.onDirtyChangedEmitter.event;
    }

    get onContentChanged(): Event<void> {
        return this.onContentChangedEmitter.event;
    }

    async save(options?: SaveOptions): Promise<void> {
        await this._delegate?.save(options);
    }

    revert?(options?: Saveable.RevertOptions): Promise<void>;
    createSnapshot?(): Saveable.Snapshot;
    applySnapshot?(snapshot: object): void;
    serialize?(): Promise<BinaryBuffer>;
    saveAs?(options: SaveAsOptions): MaybePromise<void>;

    protected _delegate?: Saveable;
    protected toDispose = new DisposableCollection();

    set delegate(delegate: Saveable) {
        this.toDispose.dispose();
        this.toDispose = new DisposableCollection();
        this._delegate = delegate;
        this.toDispose.push(delegate.onDirtyChanged(() => {
            this.dirty = delegate.dirty;
            this.onDirtyChangedEmitter.fire();
        }));
        this.toDispose.push(delegate.onContentChanged(() => {
            this.onContentChangedEmitter.fire();
        }));
        if (this.dirty !== delegate.dirty) {
            this.dirty = delegate.dirty;
            this.onDirtyChangedEmitter.fire();
        }
        this.revert = delegate.revert?.bind(delegate);
        this.createSnapshot = delegate.createSnapshot?.bind(delegate);
        this.applySnapshot = delegate.applySnapshot?.bind(delegate);
        this.serialize = delegate.serialize?.bind(delegate);
        this.saveAs = delegate.saveAs?.bind(delegate);
    }

}

export class CompositeSaveable implements Saveable {
    protected isDirty = false;
    protected readonly onDirtyChangedEmitter = new Emitter<void>();
    protected readonly onContentChangedEmitter = new Emitter<void>();
    protected readonly toDispose = new DisposableCollection(this.onDirtyChangedEmitter, this.onContentChangedEmitter);
    protected readonly saveablesMap = new Map<Saveable, Disposable>();

    get dirty(): boolean {
        return this.isDirty;
    }

    get onDirtyChanged(): Event<void> {
        return this.onDirtyChangedEmitter.event;
    }

    get onContentChanged(): Event<void> {
        return this.onContentChangedEmitter.event;
    }

    async save(options?: SaveOptions): Promise<void> {
        await Promise.all(this.saveables.map(saveable => saveable.save(options)));
    }

    async revert(options?: Saveable.RevertOptions): Promise<void> {
        await Promise.all(this.saveables.map(saveable => saveable.revert?.(options)));
    }

    get saveables(): readonly Saveable[] {
        return Array.from(this.saveablesMap.keys());
    }

    add(saveable: Saveable): void {
        if (this.saveablesMap.has(saveable)) {
            return;
        }
        const toDispose = new DisposableCollection();
        this.toDispose.push(toDispose);
        this.saveablesMap.set(saveable, toDispose);
        toDispose.push(Disposable.create(() => {
            this.saveablesMap.delete(saveable);
        }));
        toDispose.push(saveable.onDirtyChanged(() => {
            const wasDirty = this.isDirty;
            this.isDirty = this.saveables.some(s => s.dirty);
            if (this.isDirty !== wasDirty) {
                this.onDirtyChangedEmitter.fire();
            }
        }));
        toDispose.push(saveable.onContentChanged(() => {
            this.onContentChangedEmitter.fire();
        }));
        if (saveable.dirty && !this.isDirty) {
            this.isDirty = true;
            this.onDirtyChangedEmitter.fire();
        }
    }

    remove(saveable: Saveable): boolean {
        const toDispose = this.saveablesMap.get(saveable);
        toDispose?.dispose();
        return !!toDispose;
    }

    dispose(): void {
        this.toDispose.dispose();
    }
}

export namespace Saveable {
    export interface RevertOptions {
        /**
         * If soft then only dirty flag should be updated, otherwise
         * the underlying data should be reverted as well.
         */
        soft?: boolean
    }

    /**
     * A snapshot of a saveable item.
     * Applying a snapshot of a saveable on another (of the same type) using the `applySnapshot` should yield the state of the original saveable.
     */
    export type Snapshot = { value: string } | { read(): string | null };
    export namespace Snapshot {
        export function read(snapshot: Snapshot): string | undefined {
            return 'value' in snapshot ? snapshot.value : (snapshot.read() ?? undefined);
        }
    }
    export function isSource(arg: unknown): arg is SaveableSource {
        return isObject<SaveableSource>(arg) && is(arg.saveable);
    }
    export function is(arg: unknown): arg is Saveable {
        return isObject(arg) && 'dirty' in arg && 'onDirtyChanged' in arg;
    }
    export function get(arg: unknown): Saveable | undefined {
        if (is(arg)) {
            return arg;
        }
        if (isSource(arg)) {
            return arg.saveable;
        }
        return undefined;
    }
    export function getDirty(arg: unknown): Saveable | undefined {
        const saveable = get(arg);
        if (saveable && saveable.dirty) {
            return saveable;
        }
        return undefined;
    }
    export function isDirty(arg: unknown): boolean {
        return !!getDirty(arg);
    }
    export async function save(arg: unknown, options?: SaveOptions): Promise<void> {
        const saveable = get(arg);
        if (saveable) {
            await saveable.save(options);
        }
    }

    export async function confirmSaveBeforeClose(toClose: Iterable<Widget>, others: Widget[]): Promise<boolean | undefined> {
        for (const widget of toClose) {
            const saveable = Saveable.get(widget);
            if (saveable?.dirty) {
                if (!closingWidgetWouldLoseSaveable(widget, others)) {
                    continue;
                }
                const userWantsToSave = await new ShouldSaveDialog(widget).open();
                if (userWantsToSave === undefined) { // User clicked cancel.
                    return undefined;
                } else if (userWantsToSave) {
                    await saveable.save();
                } else {
                    await saveable.revert?.();
                }
            }
        }
        return true;
    }

    export function closingWidgetWouldLoseSaveable(widget: Widget, others: Widget[]): boolean {
        const saveable = Saveable.get(widget);
        return !!saveable && !others.some(otherWidget => otherWidget !== widget && Saveable.get(otherWidget) === saveable);
    }
}

export interface SaveableWidget extends Widget {
    /**
     * @param doRevert whether the saveable should be reverted before being saved. Defaults to `true`.
     */
    closeWithoutSaving(doRevert?: boolean): Promise<void>;
    closeWithSaving(options?: SaveableWidget.CloseOptions): Promise<void>;
}

export const close = Symbol('close');
/**
 * An interface describing saveable widgets that are created by the `Saveable.apply` function.
 * The original `close` function is reassigned to a locally-defined `Symbol`
 */
export interface PostCreationSaveableWidget extends SaveableWidget {
    /**
     * The original `close` function of the widget
     */
    [close](): void;
}
export namespace SaveableWidget {
    export function is(widget: Widget | undefined): widget is SaveableWidget {
        return !!widget && 'closeWithoutSaving' in widget;
    }
    export function getDirty<T extends Widget>(widgets: Iterable<T>): IterableIterator<SaveableWidget & T> {
        return get<T>(widgets, Saveable.isDirty);
    }
    export function* get<T extends Widget>(
        widgets: Iterable<T>,
        filter: (widget: T) => boolean = () => true
    ): IterableIterator<SaveableWidget & T> {
        for (const widget of widgets) {
            if (SaveableWidget.is(widget) && filter(widget)) {
                yield widget;
            }
        }
    }
    export interface CloseOptions {
        shouldSave?(): MaybePromise<boolean | undefined>
    }
}

/**
 * Possible formatting types when saving.
 */
export const enum FormatType {
    /**
     * Formatting should occur (default).
     */
    ON = 1,
    /**
     * Formatting should not occur.
     */
    OFF,
    /**
     * Formatting should only occur if the resource is dirty.
     */
    DIRTY
};

export enum SaveReason {
    Manual = 1,
    AfterDelay = 2,
    FocusChange = 3
}

export namespace SaveReason {
    export function isManual(reason?: number): reason is typeof SaveReason.Manual {
        return reason === SaveReason.Manual;
    }
}

export interface SaveOptions {
    /**
     * Formatting type to apply when saving.
     */
    readonly formatType?: FormatType;
    /**
     * The reason for saving the resource.
     */
    readonly saveReason?: SaveReason;
}

export interface SaveAsOptions extends SaveOptions {
    readonly target: URI;
}

/**
 * The class name added to the dirty widget's title.
 */
const DIRTY_CLASS = 'theia-mod-dirty';
export function setDirty(widget: Widget, dirty: boolean): void {
    const dirtyClass = ` ${DIRTY_CLASS}`;
    widget.title.className = widget.title.className.replace(dirtyClass, '');
    if (dirty) {
        widget.title.className += dirtyClass;
    }
}

export class ShouldSaveDialog extends AbstractDialog<boolean> {

    protected shouldSave = true;

    protected readonly dontSaveButton: HTMLButtonElement;

    constructor(widget: Widget) {
        super({
            title: nls.localizeByDefault('Do you want to save the changes you made to {0}?', widget.title.label || widget.title.caption)
        }, {
            node: widget.node.ownerDocument.createElement('div')
        });

        const messageNode = this.node.ownerDocument.createElement('div');
        messageNode.textContent = nls.localizeByDefault("Your changes will be lost if you don't save them.");
        messageNode.setAttribute('style', 'flex: 1 100%; padding-bottom: calc(var(--theia-ui-padding)*3);');
        this.contentNode.appendChild(messageNode);
        this.appendCloseButton();
        this.dontSaveButton = this.appendDontSaveButton();
        this.appendAcceptButton(nls.localizeByDefault('Save'));
    }

    protected appendDontSaveButton(): HTMLButtonElement {
        const button = this.createButton(nls.localizeByDefault("Don't Save"));
        this.controlPanel.appendChild(button);
        button.classList.add('secondary');
        return button;
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.addKeyListener(this.dontSaveButton, Key.ENTER, () => {
            this.shouldSave = false;
            this.accept();
        }, 'click');
    }

    get value(): boolean {
        return this.shouldSave;
    }

    override async open(disposeOnResolve?: boolean): Promise<boolean | undefined> {
        return super.open(disposeOnResolve);
    }
}
