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

import { Key, KeyCode } from '@theia/core/lib/browser';
import * as React from '@theia/core/shared/react';
import TextareaAutosize from 'react-textarea-autosize';
import debounce = require('@theia/core/shared/lodash.debounce');

interface HistoryState {
    history: string[];
    index: number;
};
type TextareaAttributes = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'>;

export class SearchInWorkspaceTextArea extends React.Component<TextareaAttributes, HistoryState> {
    static LIMIT = 100;

    textarea = React.createRef<HTMLTextAreaElement>();

    constructor(props: TextareaAttributes) {
        super(props);
        this.state = {
            history: [],
            index: 0,
        };
    }

    updateState(index: number, history?: string[]): void {
        this.value = history ? history[index] : this.state.history[index];
        this.setState(prevState => {
            const newState = {
                ...prevState,
                index,
            };
            if (history) {
                newState.history = history;
            }
            return newState;
        });
    }

    get value(): string {
        return this.textarea.current?.value ?? '';
    }

    set value(value: string) {
        if (this.textarea.current) {
            this.textarea.current.value = value;
        }
    }

    /**
     * Handle history navigation without overriding the parent's onKeyDown handler, if any.
     */
    protected readonly onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        // Navigate history only when cursor is at first or last position of the textarea
        if (Key.ARROW_UP.keyCode === KeyCode.createKeyCode(e.nativeEvent).key?.keyCode && e.currentTarget.selectionStart === 0) {
            e.preventDefault();
            this.previousValue();
        } else if (Key.ARROW_DOWN.keyCode === KeyCode.createKeyCode(e.nativeEvent).key?.keyCode && e.currentTarget.selectionEnd === e.currentTarget.value.length) {
            e.preventDefault();
            this.nextValue();
        }

        // Prevent newline on enter
        if (Key.ENTER.keyCode === KeyCode.createKeyCode(e.nativeEvent).key?.keyCode && !e.nativeEvent.shiftKey) {
            e.preventDefault();
        }

        this.props.onKeyDown?.(e);
    };

    /**
     * Switch the textarea's text to the previous value, if any.
     */
    previousValue(): void {
        const { history, index } = this.state;
        if (!this.value) {
            this.value = history[index];
        } else if (index > 0 && index < history.length) {
            this.updateState(index - 1);
        }
    }

    /**
     * Switch the textarea's text to the next value, if any.
     */
    nextValue(): void {
        const { history, index } = this.state;
        if (index === history.length - 1) {
            this.value = '';
        } else if (!this.value) {
            this.value = history[index];
        } else if (index >= 0 && index < history.length - 1) {
            this.updateState(index + 1);
        }
    }

    /**
     * Handle history collection and textarea resizing without overriding the parent's onChange handler, if any.
     */
    protected readonly onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.addToHistory();
        this.props.onChange?.(e);
    };

    /**
     * Add a nonempty current value to the history, if not already present. (Debounced, 1 second delay.)
     */
    readonly addToHistory = debounce(this.doAddToHistory, 1000);

    private doAddToHistory(): void {
        if (!this.value) {
            return;
        }
        const history = this.state.history
            .filter(term => term !== this.value)
            .concat(this.value)
            .slice(-SearchInWorkspaceTextArea.LIMIT);
        this.updateState(history.length - 1, history);
    }

    override render(): React.ReactNode {
        const { onResize, ...filteredProps } = this.props;
        return (
            <TextareaAutosize
                {...filteredProps}
                autoCapitalize="off"
                autoCorrect="off"
                maxRows={7} /* from VS Code */
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                ref={this.textarea}
                rows={1}
                spellCheck={false}
            >
            </TextareaAutosize>
        );
    }
}
