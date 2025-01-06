// *****************************************************************************
// Copyright (C) 2020 TORO Limited and others.
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

import { ConfirmDialog, Dialog, QuickInputService } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { SelectComponent } from '@theia/core/lib/browser/widgets/select-component';
import {
    Command, CommandContribution, CommandMenu, CommandRegistry, ContextExpressionMatcher, MAIN_MENU_BAR,
    MenuContribution, MenuModelRegistry, MenuPath, MessageService
} from '@theia/core/lib/common';
import { inject, injectable, interfaces } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { ReactNode } from '@theia/core/shared/react';

const SampleCommand: Command = {
    id: 'sample-command',
    label: 'Sample Command'
};
const SampleCommand2: Command = {
    id: 'sample-command2',
    label: 'Sample Command2'
};
const SampleCommandConfirmDialog: Command = {
    id: 'sample-command-confirm-dialog',
    label: 'Sample Confirm Dialog'
};
const SampleComplexCommandConfirmDialog: Command = {
    id: 'sample-command-complex-confirm-dialog',
    label: 'Sample Complex Confirm Dialog'
};
const SampleCommandWithProgressMessage: Command = {
    id: 'sample-command-with-progress',
    label: 'Sample Command With Progress Message'
};
const SampleCommandWithIndeterminateProgressMessage: Command = {
    id: 'sample-command-with-indeterminate-progress',
    label: 'Sample Command With Indeterminate Progress Message'
};
const SampleQuickInputCommand: Command = {
    id: 'sample-quick-input-command',
    category: 'Quick Input',
    label: 'Test Positive Integer'
};
const SampleSelectDialog: Command = {
    id: 'sample-command-select-dialog',
    label: 'Sample Select Component Dialog'
};

@injectable()
export class SampleCommandContribution implements CommandContribution {

    @inject(QuickInputService)
    protected readonly quickInputService: QuickInputService;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand({ id: 'create-quick-pick-sample', label: 'Internal QuickPick' }, {
            execute: () => {
                const pick = this.quickInputService.createQuickPick();
                pick.items = [{ label: '1' }, { label: '2' }, { label: '3' }];
                pick.onDidAccept(() => {
                    console.log(`accepted: ${pick.selectedItems[0]?.label}`);
                    pick.hide();
                });
                pick.show();
            }
        });
        commands.registerCommand(SampleCommand, {
            execute: () => {
                alert('This is a sample command!');
            }
        });
        commands.registerCommand(SampleCommand2, {
            execute: () => {
                alert('This is sample command2!');
            }
        });
        commands.registerCommand(SampleCommandConfirmDialog, {
            execute: async () => {
                const choice = await new ConfirmDialog({
                    title: 'Sample Confirm Dialog',
                    msg: 'This is a sample with lots of text:' + Array(100)
                        .fill(undefined)
                        .map((element, index) => `\n\nExtra line #${index}`)
                        .join('')
                }).open();
                this.messageService.info(`Sample confirm dialog returned with: \`${JSON.stringify(choice)}\``);
            }
        });
        commands.registerCommand(SampleComplexCommandConfirmDialog, {
            execute: async () => {
                const mainDiv = document.createElement('div');
                for (const color of ['#FF00007F', '#00FF007F', '#0000FF7F']) {
                    const innerDiv = document.createElement('div');
                    innerDiv.textContent = 'This is a sample with lots of text:' + Array(50)
                        .fill(undefined)
                        .map((_, index) => `\n\nExtra line #${index}`)
                        .join('');
                    innerDiv.style.backgroundColor = color;
                    innerDiv.style.padding = '5px';
                    mainDiv.appendChild(innerDiv);
                }
                const choice = await new ConfirmDialog({
                    title: 'Sample Confirm Dialog',
                    msg: mainDiv
                }).open();
                this.messageService.info(`Sample confirm dialog returned with: \`${JSON.stringify(choice)}\``);
            }
        });
        commands.registerCommand(SampleSelectDialog, {
            execute: async () => {
                await new class extends ReactDialog<boolean> {
                    constructor() {
                        super({ title: 'Sample Select Component Dialog' });
                        this.appendAcceptButton(Dialog.OK);
                    }
                    protected override render(): ReactNode {
                        return React.createElement(SelectComponent, {
                            options: Array.from(Array(10).keys()).map(i => ({ label: 'Option ' + ++i })),
                            defaultValue: 0
                        });
                    }
                    override get value(): boolean {
                        return true;
                    }
                }().open();
            }
        });
        commands.registerCommand(SampleQuickInputCommand, {
            execute: async () => {
                const result = await this.quickInputService.input({
                    placeHolder: 'Please provide a positive integer',
                    validateInput: async (input: string) => {
                        const numericValue = Number(input);
                        if (isNaN(numericValue)) {
                            return 'Invalid: NaN';
                        } else if (numericValue % 2 === 1) {
                            return 'Invalid: Odd Number';
                        } else if (numericValue < 0) {
                            return 'Invalid: Negative Number';
                        } else if (!Number.isInteger(numericValue)) {
                            return 'Invalid: Only Integers Allowed';
                        }
                    }
                });
                if (result) {
                    this.messageService.info(`Positive Integer: ${result}`);
                }
            }
        });
        commands.registerCommand(SampleCommandWithProgressMessage, {
            execute: () => {
                this.messageService
                    .showProgress({
                        text: 'Starting to report progress',
                    })
                    .then(progress => {
                        window.setTimeout(() => {
                            progress.report({
                                message: 'First step completed',
                                work: { done: 25, total: 100 }
                            });
                        }, 2000);
                        window.setTimeout(() => {
                            progress.report({
                                message: 'Next step completed',
                                work: { done: 60, total: 100 }
                            });
                        }, 4000);
                        window.setTimeout(() => {
                            progress.report({
                                message: 'Complete',
                                work: { done: 100, total: 100 }
                            });
                        }, 6000);
                        window.setTimeout(() => progress.cancel(), 7000);
                    });
            }
        });
        commands.registerCommand(SampleCommandWithIndeterminateProgressMessage, {
            execute: () => {
                this.messageService
                    .showProgress({
                        text: 'Starting to report indeterminate progress',
                    })
                    .then(progress => {
                        window.setTimeout(() => {
                            progress.report({
                                message: 'First step completed',
                            });
                        }, 2000);
                        window.setTimeout(() => {
                            progress.report({
                                message: 'Next step completed',
                            });
                        }, 4000);
                        window.setTimeout(() => {
                            progress.report({
                                message: 'Complete',
                            });
                        }, 6000);
                        window.setTimeout(() => progress.cancel(), 7000);
                    });
            }
        });
    }

}

@injectable()
export class SampleMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void {
        const subMenuPath = [...MAIN_MENU_BAR, 'sample-menu'];
        menus.registerSubmenu(subMenuPath, 'Sample Menu', '2'); // that should put the menu right next to the File menu

        menus.registerMenuAction(subMenuPath, {
            commandId: SampleCommand.id,
            order: '0'
        });
        menus.registerMenuAction(subMenuPath, {
            commandId: SampleCommand2.id,
            order: '2'
        });
        const subSubMenuPath = [...subMenuPath, 'sample-sub-menu'];
        menus.registerSubmenu(subSubMenuPath, 'Sample sub menu', '2');
        menus.registerMenuAction(subSubMenuPath, {
            commandId: SampleCommand.id,
            order: '1'
        });
        menus.registerMenuAction(subSubMenuPath, {
            commandId: SampleCommand2.id,
            order: '3'
        });
        const placeholder = new PlaceholderMenuNode([...subSubMenuPath, 'placeholder'].join('-'), 'Placeholder', '0');
        menus.registerCommandMenu(subSubMenuPath, placeholder);

        /**
         * Register an action menu with an invalid command (un-registered and without a label) in order
         * to determine that menus and the layout does not break on startup.
         */
        menus.registerMenuAction(subMenuPath, { commandId: 'invalid-command' });
    }

}

/**
 * Special menu node that is not backed by any commands and is always disabled.
 */
export class PlaceholderMenuNode implements CommandMenu {

    constructor(readonly id: string, public readonly label: string, readonly order?: string, readonly icon?: string) { }

    isEnabled(effectiveMenuPath: MenuPath, ...args: unknown[]): boolean {
        return false;
    }

    isToggled(effectiveMenuPath: MenuPath): boolean {
        return false;
    }
    run(effectiveMenuPath: MenuPath, ...args: unknown[]): Promise<void> {
        throw new Error('Should never happen');
    }
    getAccelerator(context: HTMLElement | undefined): string[] {
        return [];
    }

    get sortString(): string {
        return this.order || this.label;
    }

    isVisible<T>(effectiveMenuPath: MenuPath, contextMatcher: ContextExpressionMatcher<T>, context: T | undefined, ...args: unknown[]): boolean {
        return true;
    }

}

export const bindSampleMenu = (bind: interfaces.Bind) => {
    bind(CommandContribution).to(SampleCommandContribution).inSingletonScope();
    bind(MenuContribution).to(SampleMenuContribution).inSingletonScope();
};
