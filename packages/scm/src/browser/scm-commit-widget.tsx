// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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

import { injectable, inject } from '@theia/core/shared/inversify';
import { DisposableCollection } from '@theia/core';
import { Message } from '@theia/core/shared/@lumino/messaging';
import * as React from '@theia/core/shared/react';
import TextareaAutosize from 'react-textarea-autosize';
import { ScmInput, ScmInputIssueType } from './scm-input';
import {
    ContextMenuRenderer, ReactWidget, KeybindingRegistry, StatefulWidget
} from '@theia/core/lib/browser';
import { ScmService } from './scm-service';

@injectable()
export class ScmCommitWidget extends ReactWidget implements StatefulWidget {

    static ID = 'scm-commit-widget';

    @inject(ScmService) protected readonly scmService: ScmService;
    @inject(KeybindingRegistry) protected readonly keybindings: KeybindingRegistry;

    protected readonly toDisposeOnRepositoryChange = new DisposableCollection();

    protected shouldScrollToRow = true;

    /**
     * Don't modify DOM use React! only exposed for `focusInput`
     * Use `this.scmService.selectedRepository?.input.value` as a single source of truth!
     */
    protected readonly inputRef = React.createRef<HTMLTextAreaElement>();

    constructor(
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
    ) {
        super();
        this.scrollOptions = {
            suppressScrollX: true,
            minScrollbarLength: 35
        };
        this.addClass('theia-scm-commit');
        this.id = ScmCommitWidget.ID;
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.refreshOnRepositoryChange();
        this.toDisposeOnDetach.push(this.scmService.onDidChangeSelectedRepository(() => {
            this.refreshOnRepositoryChange();
            this.update();
        }));
    }

    protected refreshOnRepositoryChange(): void {
        this.toDisposeOnRepositoryChange.dispose();
        const repository = this.scmService.selectedRepository;
        if (repository) {
            this.toDisposeOnRepositoryChange.push(repository.provider.onDidChange(async () => {
                this.update();
            }));
            this.toDisposeOnRepositoryChange.push(repository.provider.onDidChangeCommitTemplate(e => {
                this.setInputValue(e);
            }));
        }
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.focus();
    }

    public focus(): void {
        (this.inputRef.current || this.node).focus();
    }

    protected render(): React.ReactNode {
        const repository = this.scmService.selectedRepository;
        if (repository) {
            return React.createElement('div', this.createContainerAttributes(), this.renderInput(repository.input));
        }
    }

    /**
     * Create the container attributes for the widget.
     */
    protected createContainerAttributes(): React.HTMLAttributes<HTMLElement> {
        return {
            style: { flexGrow: 0 }
        };
    }

    protected renderInput(input: ScmInput): React.ReactNode {
        let validationStatus = 'idle';
        if (input.issue) {
            switch (input.issue.type) {
                case ScmInputIssueType.Error:
                    validationStatus = 'error';
                    break;
                case ScmInputIssueType.Information:
                    validationStatus = 'info';
                    break;
                case ScmInputIssueType.Warning:
                    validationStatus = 'warning';
                    break;
            }
        }
        const validationMessage = input.issue ? input.issue.message : '';
        const format = (value: string, ...args: string[]): string => {
            if (args.length !== 0) {
                return value.replace(/{(\d+)}/g, (found, n) => {
                    const i = parseInt(n);
                    return isNaN(i) || i < 0 || i >= args.length ? found : args[i];
                });
            }
            return value;
        };

        const keybinding = this.keybindings.acceleratorFor(this.keybindings.getKeybindingsForCommand('scm.acceptInput')[0]).join('+');
        const message = format(input.placeholder || '', keybinding);
        const textArea = input.visible &&
            <TextareaAutosize
                className={`${ScmCommitWidget.Styles.INPUT_MESSAGE} theia-input theia-scm-input-message-${validationStatus}`}
                id={ScmCommitWidget.Styles.INPUT_MESSAGE}
                placeholder={message}
                spellCheck={false}
                autoFocus={true}
                value={input.value}
                disabled={!input.enabled}
                onChange={this.setInputValue}
                ref={this.inputRef}
                rows={1}
                maxRows={6} /* from VS Code */
            >
            </TextareaAutosize>;
        return <div className={ScmCommitWidget.Styles.INPUT_MESSAGE_CONTAINER}>
            {textArea}
            <div
                className={
                    `${ScmCommitWidget.Styles.VALIDATION_MESSAGE} ${ScmCommitWidget.Styles.NO_SELECT}
                    theia-scm-validation-message-${validationStatus} theia-scm-input-message-${validationStatus}`
                }
                style={{
                    display: !!input.issue ? 'block' : 'none'
                }}>{validationMessage}</div>
        </div>;
    }

    protected setInputValue = (event: React.FormEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLTextAreaElement> | string) => {
        const repository = this.scmService.selectedRepository;
        if (repository) {
            repository.input.value = typeof event === 'string' ? event : event.currentTarget.value;
        }
    };

    /**
     * Store the tree state.
     */
    storeState(): ScmCommitWidget.State {
        const message = this.scmService.selectedRepository?.input.value;
        return { message };
    }

    /**
     * Restore the state.
     * @param oldState the old state object.
     */
    restoreState(oldState: ScmCommitWidget.State): void {
        const value = oldState.message;
        if (!value) {
            return;
        }
        let repository = this.scmService.selectedRepository;
        if (repository) {
            repository.input.value = value;
        } else {
            const listener = this.scmService.onDidChangeSelectedRepository(() => {
                repository = this.scmService.selectedRepository;
                if (repository) {
                    listener.dispose();
                    if (!repository.input.value) {
                        repository.input.value = value;
                    }
                }
            });
            this.toDispose.push(listener);
        }
    }

}

export namespace ScmCommitWidget {

    export namespace Styles {
        export const INPUT_MESSAGE_CONTAINER = 'theia-scm-input-message-container';
        export const INPUT_MESSAGE = 'theia-scm-input-message';
        export const VALIDATION_MESSAGE = 'theia-scm-input-validation-message';
        export const NO_SELECT = 'no-select';
    }

    export interface State {
        message?: string
    }
}
