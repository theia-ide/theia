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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { injectable, decorate, unmanaged } from 'inversify';
import { Title, Widget } from '@lumino/widgets';
import { Message, MessageLoop } from '@lumino/messaging';
import { Emitter, Event, Disposable, DisposableCollection, MaybePromise, isObject } from '../../common';
import { KeyCode, KeysOrKeyCodes } from '../keyboard/keys';

import PerfectScrollbar from 'perfect-scrollbar';
import { PreviewableWidget } from '../widgets/previewable-widget';
import { Slot } from '@lumino/signaling';

decorate(injectable(), Widget);
decorate(unmanaged(), Widget, 0);

export * from '@lumino/widgets';
export * from '@lumino/messaging';

export const ACTION_ITEM = 'action-label';

export function codiconArray(name: string, actionItem = false): string[] {
    const array = ['codicon', `codicon-${name}`];
    if (actionItem) {
        array.push(ACTION_ITEM);
    }
    return array;
}

export function codicon(name: string, actionItem = false): string {
    return `codicon codicon-${name}${actionItem ? ` ${ACTION_ITEM}` : ''}`;
}

export const DISABLED_CLASS = 'theia-mod-disabled';
export const EXPANSION_TOGGLE_CLASS = 'theia-ExpansionToggle';
export const CODICON_TREE_ITEM_CLASSES = codiconArray('chevron-down');
export const COLLAPSED_CLASS = 'theia-mod-collapsed';
export const BUSY_CLASS = 'theia-mod-busy';
export const CODICON_LOADING_CLASSES = codiconArray('loading');
export const SELECTED_CLASS = 'theia-mod-selected';
export const FOCUS_CLASS = 'theia-mod-focus';
export const PINNED_CLASS = 'theia-mod-pinned';
export const LOCKED_CLASS = 'theia-mod-locked';
export const DEFAULT_SCROLL_OPTIONS: PerfectScrollbar.Options = {
    suppressScrollX: true,
    minScrollbarLength: 35,
};

/**
 * At a number of places in the code, we have effectively reimplemented Lumino's Widget.attach and Widget.detach,
 * but omitted the checks that Lumino expects to be performed for those operations. That is a bad idea, because it
 * means that we are telling widgets that they are attached or detached when not all the conditions that should apply
 * do apply. We should explicitly mark those locations so that we know where we should go fix them later.
 */
export namespace UnsafeWidgetUtilities {
    /**
     * Ordinarily, the following checks should be performed before detaching a widget:
     * It should not be the child of another widget
     * It should be attached and it should be a child of document.body
     */
    export function detach(widget: Widget): void {
        MessageLoop.sendMessage(widget, Widget.Msg.BeforeDetach);
        widget.node.remove();
        MessageLoop.sendMessage(widget, Widget.Msg.AfterDetach);
    };
    /**
     * @param ref The child of the host element to insert the widget before.
     * Ordinarily the following checks should be performed:
     * The widget should have no parent
     * The widget should not be attached, and its node should not be a child of document.body
     * The host should be a child of document.body
     * We often violate the last condition.
     */
    // eslint-disable-next-line no-null/no-null
    export function attach(widget: Widget, host: HTMLElement, ref: HTMLElement | null = null): void {
        MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
        host.insertBefore(widget.node, ref);
        MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
    };
}

@injectable()
export class BaseWidget extends Widget implements PreviewableWidget {

    protected readonly onScrollYReachEndEmitter = new Emitter<void>();
    readonly onScrollYReachEnd: Event<void> = this.onScrollYReachEndEmitter.event;
    protected readonly onScrollUpEmitter = new Emitter<void>();
    readonly onScrollUp: Event<void> = this.onScrollUpEmitter.event;
    protected readonly onDidChangeVisibilityEmitter = new Emitter<boolean>();
    readonly onDidChangeVisibility = this.onDidChangeVisibilityEmitter.event;
    protected readonly onDidDisposeEmitter = new Emitter<void>();
    readonly onDidDispose = this.onDidDisposeEmitter.event;

    protected readonly toDispose = new DisposableCollection(
        this.onDidDisposeEmitter,
        Disposable.create(() => this.onDidDisposeEmitter.fire()),
        this.onScrollYReachEndEmitter,
        this.onScrollUpEmitter,
        this.onDidChangeVisibilityEmitter
    );
    protected readonly toDisposeOnDetach = new DisposableCollection();
    protected scrollBar?: PerfectScrollbar;
    protected scrollOptions?: PerfectScrollbar.Options;

    constructor(@unmanaged() options?: Widget.IOptions) {
        super(options);
    }

    override dispose(): void {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        this.toDispose.dispose();
    }

    protected override onCloseRequest(msg: Message): void {
        super.onCloseRequest(msg);
        this.dispose();
    }

    protected override onBeforeAttach(msg: Message): void {
        if (this.title.iconClass === '') {
            this.title.iconClass = 'no-icon';
        }
        super.onBeforeAttach(msg);
    }

    protected override onAfterDetach(msg: Message): void {
        if (this.title.iconClass === 'no-icon') {
            this.title.iconClass = '';
        }
        super.onAfterDetach(msg);
    }

    protected override onBeforeDetach(msg: Message): void {
        this.toDisposeOnDetach.dispose();
        super.onBeforeDetach(msg);
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        if (this.scrollOptions) {
            (async () => {
                const container = await this.getScrollContainer();
                container.style.overflow = 'hidden';
                this.scrollBar = new PerfectScrollbar(container, this.scrollOptions);
                this.disableScrollBarFocus(container);
                this.toDisposeOnDetach.push(addEventListener(container, <any>'ps-y-reach-end', () => { this.onScrollYReachEndEmitter.fire(undefined); }));
                this.toDisposeOnDetach.push(addEventListener(container, <any>'ps-scroll-up', () => { this.onScrollUpEmitter.fire(undefined); }));
                this.toDisposeOnDetach.push(Disposable.create(() => {
                    if (this.scrollBar) {
                        this.scrollBar.destroy();
                        this.scrollBar = undefined;
                    }
                    container.style.overflow = 'initial';
                }));
            })();
        }
    }

    protected getScrollContainer(): MaybePromise<HTMLElement> {
        return this.node;
    }

    protected disableScrollBarFocus(scrollContainer: HTMLElement): void {
        for (const thumbs of [scrollContainer.getElementsByClassName('ps__thumb-x'), scrollContainer.getElementsByClassName('ps__thumb-y')]) {
            for (let i = 0; i < thumbs.length; i++) {
                const element = thumbs.item(i);
                if (element) {
                    element.removeAttribute('tabIndex');
                }
            }
        }
    }

    protected override onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        if (this.scrollBar) {
            this.scrollBar.update();
        }
    }

    protected addUpdateListener<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, useCapture?: boolean): void {
        this.addEventListener(element, type, e => {
            this.update();
            e.preventDefault();
        }, useCapture);
    }

    protected addEventListener<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, listener: EventListenerOrEventListenerObject<K>, useCapture?: boolean): void {
        this.toDisposeOnDetach.push(addEventListener(element, type, listener, useCapture));
    }

    protected addKeyListener<K extends keyof HTMLElementEventMap>(
        element: HTMLElement,
        keysOrKeyCodes: KeyCode.Predicate | KeysOrKeyCodes,
        action: (event: KeyboardEvent) => boolean | void | Object, ...additionalEventTypes: K[]): void {
        this.toDisposeOnDetach.push(addKeyListener(element, keysOrKeyCodes, action, ...additionalEventTypes));
    }

    protected addClipboardListener<K extends 'cut' | 'copy' | 'paste'>(element: HTMLElement, type: K, listener: EventListenerOrEventListenerObject<K>): void {
        this.toDisposeOnDetach.push(addClipboardListener(element, type, listener));
    }

    getPreviewNode(): Node | undefined {
        return this.node;
    }

    override setFlag(flag: Widget.Flag): void {
        super.setFlag(flag);
        if (flag === Widget.Flag.IsVisible) {
            this.handleVisiblityChanged(this.isVisible);
        }
    }

    protected handleVisiblityChanged(isNowVisible: boolean): void {
        this.onDidChangeVisibilityEmitter.fire(isNowVisible);
    }

    override clearFlag(flag: Widget.Flag): void {
        super.clearFlag(flag);
        if (flag === Widget.Flag.IsVisible) {
            this.handleVisiblityChanged(this.isVisible);
        }
    }
}

export function setEnabled(element: HTMLElement, enabled: boolean): void {
    element.classList.toggle(DISABLED_CLASS, !enabled);
    element.tabIndex = enabled ? 0 : -1;
}

export function createIconButton(...classNames: string[]): HTMLSpanElement {
    const icon = document.createElement('i');
    icon.classList.add(...classNames);
    const button = document.createElement('span');
    button.tabIndex = 0;
    button.appendChild(icon);
    return button;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventListener<K extends keyof HTMLElementEventMap> = (this: HTMLElement, event: HTMLElementEventMap[K]) => any;
export interface EventListenerObject<K extends keyof HTMLElementEventMap> {
    handleEvent(evt: HTMLElementEventMap[K]): void;
}
export namespace EventListenerObject {
    export function is<K extends keyof HTMLElementEventMap>(listener: unknown): listener is EventListenerObject<K> {
        return isObject(listener) && 'handleEvent' in listener;
    }
}
export type EventListenerOrEventListenerObject<K extends keyof HTMLElementEventMap> = EventListener<K> | EventListenerObject<K>;
export function addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement, type: K, listener: EventListenerOrEventListenerObject<K>, useCapture?: boolean
): Disposable {
    element.addEventListener(type, listener, useCapture);
    return Disposable.create(() =>
        element.removeEventListener(type, listener, useCapture)
    );
}

export function addKeyListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    keysOrKeyCodes: KeyCode.Predicate | KeysOrKeyCodes,
    action: (event: KeyboardEvent) => boolean | void | Object, ...additionalEventTypes: K[]): Disposable {

    const toDispose = new DisposableCollection();
    const keyCodePredicate = (() => {
        if (typeof keysOrKeyCodes === 'function') {
            return keysOrKeyCodes;
        } else {
            return (actual: KeyCode) => KeysOrKeyCodes.toKeyCodes(keysOrKeyCodes).some(k => k.equals(actual));
        }
    })();
    toDispose.push(addEventListener(element, 'keydown', e => {
        const kc = KeyCode.createKeyCode(e);
        if (keyCodePredicate(kc)) {
            const result = action(e);
            if (typeof result !== 'boolean' || result) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }));
    for (const type of additionalEventTypes) {
        toDispose.push(addEventListener(element, type, e => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const event = (type as any)['keydown'];
            const result = action(event);
            if (typeof result !== 'boolean' || result) {
                e.stopPropagation();
                e.preventDefault();
            }
        }));
    }
    return toDispose;
}

export function addClipboardListener<K extends 'cut' | 'copy' | 'paste'>(element: HTMLElement, type: K, listener: EventListenerOrEventListenerObject<K>): Disposable {
    const documentListener = (e: ClipboardEvent) => {
        const activeElement = document.activeElement;
        if (activeElement && element.contains(activeElement)) {
            if (EventListenerObject.is(listener)) {
                listener.handleEvent(e);
            } else {
                listener.bind(element)(e);
            }
        }
    };
    document.addEventListener(type, documentListener);
    return Disposable.create(() =>
        document.removeEventListener(type, documentListener)
    );
}

/**
 * Resolves when the given widget is detached and hidden.
 */
export function waitForClosed(widget: Widget): Promise<void> {
    return waitForVisible(widget, false, false);
}

/**
 * Resolves when the given widget is attached and visible.
 */
export function waitForRevealed(widget: Widget): Promise<void> {
    return waitForVisible(widget, true, true);
}

/**
 * Resolves when the given widget is hidden regardless of attachment.
 */
export function waitForHidden(widget: Widget): Promise<void> {
    return waitForVisible(widget, false);
}

function waitForVisible(widget: Widget, visible: boolean, attached?: boolean): Promise<void> {
    if ((typeof attached !== 'boolean' || widget.isAttached === attached) &&
        (widget.isVisible === visible || (widget.node.style.visibility !== 'hidden') === visible)
    ) {
        return new Promise(resolve => window.requestAnimationFrame(() => resolve()));
    }
    return new Promise(resolve => {
        const waitFor = () => window.requestAnimationFrame(() => {
            if ((typeof attached !== 'boolean' || widget.isAttached === attached) &&
                (widget.isVisible === visible || (widget.node.style.visibility !== 'hidden') === visible)) {
                window.requestAnimationFrame(() => resolve());
            } else {
                waitFor();
            }
        });
        waitFor();
    });
}

const pinnedTitles = new Map<Title<Widget>, [boolean, Slot<Widget, void>]>();

export function isPinned(title: Title<Widget>): boolean {
    const pinnedState = !title.closable && title.className.includes(PINNED_CLASS);
    return pinnedState;
}

export function pin(title: Title<Widget>): void {
    const l = () => {
        pinnedTitles.delete(title);
    };
    pinnedTitles.set(title, [title.closable, l]);
    title.owner.disposed.connect(l);
    title.closable = false;
    if (!title.className.includes(PINNED_CLASS)) {
        title.className += ` ${PINNED_CLASS}`;
    }
}

export function unpin(title: Title<Widget>): void {
    const entry = pinnedTitles.get(title);
    if (entry) {
        title.owner.disposed.disconnect(entry[1]);
        title.closable = entry[0];
        pinnedTitles.delete(title);
    } else {
        title.closable = true;
    }
    title.className = title.className.replace(PINNED_CLASS, '').trim();
}

export function isLocked(title: Title<Widget>): boolean {
    return title.className.includes(LOCKED_CLASS);
}

export function lock(title: Title<Widget>): void {
    if (!title.className.includes(LOCKED_CLASS)) {
        title.className += ` ${LOCKED_CLASS}`;
    }
}

export function unlock(title: Title<Widget>): void {
    title.className = title.className.replace(LOCKED_CLASS, '').trim();
}

export function togglePinned(title?: Title<Widget>): void {
    if (title) {
        if (isPinned(title)) {
            unpin(title);
        } else {
            pin(title);
        }
    }
}
