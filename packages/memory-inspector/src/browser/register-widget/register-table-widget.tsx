/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
 ********************************************************************************/

import { Key, KeyCode } from '@theia/core/lib/browser';
import { inject } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { DebugVariable } from '@theia/debug/lib/browser/console/debug-console-items';
import { EMPTY_MEMORY } from '../memory-widget/memory-options-widget';
import { MemoryTable, MemoryTableWidget } from '../memory-widget/memory-table-widget';
import { Interfaces } from '../utils/memory-widget-utils';
import { RegisterReadResult } from '../utils/memory-widget-variable-utils';
import { RegisterOptions, RegisterOptionsWidget } from './register-options-widget';

export namespace RegisterTable {

    export const ROW_CLASS = 't-mv-view-row';
    export const ROW_DIVIDER_CLASS = 't-mv-view-row-highlight';
    export const REGISTER_NAME_CLASS = 't-mv-view-address';
    export const REGISTER_DATA_CLASS = 't-mv-view-data';
    export const EXTRA_COLUMN_DATA_CLASS = 't-mv-view-code';
    export const HEADER_ROW_CLASS = 't-mv-header';

    export interface RowOptions {
        regName: string;
        regVal: string;
        hexadecimal?: string;
        decimal?: string;
        octal?: string;
        binary?: string;
        doShowDivider?: boolean;
        isChanged?: boolean;
    }

    export interface StylableNodeAttributes {
        className?: string;
        style?: React.CSSProperties;
        title?: string;
        isChanged?: boolean;
    }

    export interface RowDecorator {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (...args: any[]): Partial<StylableNodeAttributes>;
    }
}

export class RegisterTableWidget extends MemoryTableWidget {
    static override CONTEXT_MENU = ['register.view.context.menu'];
    static override ID = 'register-table-widget';

    @inject(RegisterOptionsWidget) override readonly optionsWidget: RegisterOptionsWidget;

    protected readonly registerNotSaved = '<not saved>';
    protected registers: RegisterReadResult;
    protected previousRegisters: RegisterReadResult | undefined;
    protected override options: RegisterOptions;
    protected override memory: Interfaces.WidgetMemoryState = { ...EMPTY_MEMORY, variables: [] };

    protected override async doInit(): Promise<void> {
        this.id = RegisterTableWidget.ID;
        this.addClass(RegisterTableWidget.ID);
        this.scrollOptions = { ...this.scrollOptions, suppressScrollX: false };
        this.toDispose.push(this.optionsWidget.onOptionsChanged(optionId => this.handleOptionChange(optionId)));
        this.toDispose.push(this.optionsWidget.onRegisterChanged(e => this.handleRegisterChange(e)));
        this.toDispose.push(this.themeService.onDidColorThemeChange(e => this.handleThemeChange(e)));

        this.getStateAndUpdate();
    }

    handleSetValue(dVar: DebugVariable | undefined): void {
        if (dVar) {
            dVar.open();
        }
    }

    protected handleRegisterChange(newRegister: [RegisterReadResult, boolean]): void {
        const regResult = newRegister[0];
        const updatePrevRegs = !newRegister[1];
        if (this.registers.threadId !== regResult.threadId) {
            // if not same thread Id, dont highlighting register changes
            this.previousRegisters = undefined;
        } else {
            if (updatePrevRegs) {
                this.previousRegisters = this.registers;
            }
        }
        this.getStateAndUpdate();
    }

    protected override getState(): void {
        this.options = this.optionsWidget.options;
        this.registers = this.optionsWidget.registers;
    }

    protected override getTableRows(): React.ReactNode {
        return [...this.renderRegRows()];
    }

    protected *renderRegRows(result: RegisterReadResult = this.registers): IterableIterator<React.ReactNode> {
        let rowsYielded = 0;
        // For each row...
        for (const reg of result.registers) {
            if (this.optionsWidget.displayReg(reg.name)) {
                const notSaved = reg.value === this.registerNotSaved;
                const isChanged = this.previousRegisters && reg.value !== this.getPrevRegVal(reg.name, this.previousRegisters);
                const options: RegisterTable.RowOptions = {
                    regName: reg.name,
                    regVal: reg.value,
                    hexadecimal: notSaved ? reg.value : this.optionsWidget.handleRadixRendering(reg.value, 16, reg.name),
                    decimal: notSaved ? reg.value : this.optionsWidget.handleRadixRendering(reg.value, 10),
                    octal: notSaved ? reg.value : this.optionsWidget.handleRadixRendering(reg.value, 8),
                    binary: notSaved ? reg.value : this.optionsWidget.handleRadixRendering(reg.value, 2, reg.name),
                    doShowDivider: (rowsYielded % 4) === 3,
                    isChanged,
                };
                yield this.renderRegRow(options);
                rowsYielded += 1;
            }
        }
    }

    protected getPrevRegVal(regName: string, inRegs: RegisterReadResult): string | undefined {
        return inRegs.registers.find(element => element.name === regName)?.value;
    }

    protected renderRegRow(
        options: RegisterTable.RowOptions,
        getRowAttributes: RegisterTable.RowDecorator = this.getRowAttributes.bind(this),
    ): React.ReactNode {
        const { regName } = options;
        const { className, style, title } = getRowAttributes(options);
        return (
            <tr
                // Add a marker to help visual navigation when scrolling
                className={className}
                style={style}
                title={title}
                key={regName}
                data-id={regName}
                data-value={options.decimal ?? 'none'}
                tabIndex={0}
                onKeyDown={this.handleRowKeyDown}
                onContextMenu={this.options.isFrozen ? undefined : this.handleTableRightClick}
                onDoubleClick={this.options.isFrozen ? undefined : this.openDebugVariableByCurrentTarget}
            >
                <td className={RegisterTable.REGISTER_NAME_CLASS}>{regName}</td>
                {this.getExtraRegColumn(options)}
            </tr>
        );
    }

    protected override getRowAttributes(options: Partial<RegisterTable.RowOptions>): Partial<RegisterTable.StylableNodeAttributes> {
        let className = RegisterTable.ROW_CLASS;
        if (options.doShowDivider) {
            className += ` ${RegisterTable.ROW_DIVIDER_CLASS}`;
        }
        if (options.isChanged) {
            // use the eight-bits change CSS class
            className += ' eight-bits changed';
        }
        return { className };
    }

    protected getExtraRegColumn(options: Pick<RegisterTable.RowOptions, 'hexadecimal' | 'decimal' | 'octal' | 'binary'>): React.ReactNode[] {
        const additionalColumns = [];
        if (this.options.columnsDisplayed.hexadecimal.doRender) {
            additionalColumns.push(<td className={RegisterTable.EXTRA_COLUMN_DATA_CLASS} key='hexadecimal'>{options.hexadecimal}</td>);
        }
        if (this.options.columnsDisplayed.decimal.doRender) {
            additionalColumns.push(<td className={RegisterTable.EXTRA_COLUMN_DATA_CLASS} key='decimal'>{options.decimal}</td>);
        }
        if (this.options.columnsDisplayed.octal.doRender) {
            additionalColumns.push(<td className={RegisterTable.EXTRA_COLUMN_DATA_CLASS} key='octal'>{options.octal}</td>);
        }
        if (this.options.columnsDisplayed.binary.doRender) {
            additionalColumns.push(<td className={RegisterTable.EXTRA_COLUMN_DATA_CLASS} key='binary'>{options.binary}</td>);
        }

        return additionalColumns;
    }

    protected override getWrapperHandlers(): MemoryTable.WrapperHandlers {
        return this.options.isFrozen || this.options.noRadixColumnDisplayed
            ? super.getWrapperHandlers()
            : {
                onMouseMove: this.handleTableMouseMove,
                onContextMenu: this.handleTableRightClick,
            };
    }

    protected override doHandleTableMouseMove(targetElement: React.MouseEvent['target']): void {
        const tempTarget = targetElement as HTMLElement;
        const target = tempTarget.parentElement?.tagName === 'TR' ? tempTarget.parentElement : tempTarget;
        if (target.tagName === 'TR') {
            const { x, y } = target.getBoundingClientRect();
            const anchor = { x: Math.round(x), y: Math.round(y + target.clientHeight) };
            const value = Number(target.getAttribute('data-value'));
            if (!isNaN(value)) {
                const register = target.getAttribute('data-id') as string;
                const properties = {
                    register,
                    hex: `0x${value.toString(16)}`,
                    binary: `0b${value.toString(2)}`,
                    decimal: value.toString(10),
                    octal: `0o${value.toString(8)}`,
                };
                return this.hoverRenderer.render(this.node, anchor, properties);
            }
        }
        return this.hoverRenderer.hide();
    }

    protected handleRowKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
        const keyCode = KeyCode.createKeyCode(event.nativeEvent).key?.keyCode;
        switch (keyCode) {
            case Key.ENTER.keyCode:
                this.openDebugVariableByCurrentTarget(event);
                break;
            default:
                break;
        }
    };

    protected openDebugVariableByCurrentTarget = (event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>): void => {
        this.openDebugVariableByDataId(event.currentTarget);
    };

    protected openDebugVariableByDataId(element: HTMLElement): void {
        const registerName = element.getAttribute('data-id');
        if (registerName) {
            this.openDebugVariableByName(registerName);
        }
    }

    protected openDebugVariableByName(registerName: string): void {
        const debugVariable = this.registers.registers.find(element => element.name === registerName);
        this.handleSetValue(debugVariable);
    }

    protected override doHandleTableRightClick(event: React.MouseEvent): void {
        event.preventDefault();
        const curTarget = event.currentTarget as HTMLElement;
        if (curTarget.tagName === 'TR') {
            this.update();
            event.stopPropagation();
            this.contextMenuRenderer.render({
                menuPath: RegisterTableWidget.CONTEXT_MENU,
                anchor: event.nativeEvent,
                args: this.getContextMenuArgs(event),
                context: curTarget
            });
        }
    }

    protected override getContextMenuArgs(event: React.MouseEvent): unknown[] {
        const args: unknown[] = [this];
        const regName = (event.currentTarget as HTMLElement).getAttribute('data-id');
        if (regName) {
            const dVar = this.registers.registers.find(element => element.name === regName);
            args.push(dVar);
        }
        return args;
    }
}
