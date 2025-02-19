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

import { ContextMenuRenderer, ReactWidget, Widget } from '@theia/core/lib/browser';
import { ThemeService } from '@theia/core/lib/browser/theming';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { ThemeChangeEvent } from '@theia/core/lib/common/theme';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { hexStrToUnsignedLong } from '../../common/util';
import { MemoryProviderService } from '../memory-provider/memory-provider-service';
import { EasilyMappedObject, MemoryHoverRendererService } from '../utils/memory-hover-renderer';
import { MWMoreMemorySelect } from '../utils/memory-widget-components';
import {
    Constants, Interfaces, Utils
} from '../utils/memory-widget-utils';
import { VariableDecoration, VariableFinder } from '../utils/memory-widget-variable-utils';
import { MemoryOptionsWidget } from './memory-options-widget';
import debounce = require('@theia/core/shared/lodash.debounce');

/* eslint-disable @typescript-eslint/no-explicit-any */
export namespace MemoryTable {
    export interface WrapperHandlers {
        onKeyDown?: React.KeyboardEventHandler;
        onClick?: React.MouseEventHandler;
        onContextMenu?: React.MouseEventHandler;
        onMouseMove?: React.MouseEventHandler;
        onFocus?(e: React.FocusEvent<HTMLDivElement>): any;
        onBlur?(e: React.FocusEvent<HTMLDivElement>): any;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    export interface StylableNodeAttributes {
        className?: string;
        style?: React.CSSProperties;
        variable?: VariableDecoration;
        title?: string;
        isHighlighted?: boolean;
    }

    export interface GroupData {
        node: React.ReactNode;
        ascii: string; index: number;
        variables: VariableDecoration[];
        isHighlighted?: boolean;
    }
    export interface ByteData {
        node: React.ReactNode;
        ascii: string; index: number;
        variables: VariableDecoration[];
        isHighlighted?: boolean;
    }
    export interface ItemData {
        node: React.ReactNode;
        content: string;
        variable?: VariableDecoration;
        index: number;
        isHighlighted?: boolean;
    }

    export interface RowOptions {
        address: string;
        groups: React.ReactNode;
        ascii?: string;
        variables?: VariableDecoration[];
        doShowDivider?: boolean;
        index: number;
        isHighlighted?: boolean;
    }

    export const ROW_CLASS = 't-mv-view-row';
    export const ROW_DIVIDER_CLASS = 't-mv-view-row-highlight';
    export const ADDRESS_DATA_CLASS = 't-mv-view-address';
    export const MEMORY_DATA_CLASS = 't-mv-view-data';
    export const EXTRA_COLUMN_DATA_CLASS = 't-mv-view-code';
    export const GROUP_SPAN_CLASS = 'byte-group';
    export const BYTE_SPAN_CLASS = 'single-byte';
    export const EIGHT_BIT_SPAN_CLASS = 'eight-bits';
    export const HEADER_LABEL_CONTAINER_CLASS = 't-mv-header-label-container';
    export const HEADER_LABEL_CLASS = 't-mv-header-label';
    export const VARIABLE_LABEL_CLASS = 't-mv-variable-label';
    export const HEADER_ROW_CLASS = 't-mv-header';
}

@injectable()
export class MemoryTableWidget extends ReactWidget {
    static CONTEXT_MENU = ['memory.view.context.menu'];
    static ID = 'memory-table-widget';

    @inject(ThemeService) protected readonly themeService: ThemeService;
    @inject(MemoryOptionsWidget) readonly optionsWidget: MemoryOptionsWidget;
    @inject(MemoryProviderService) protected readonly memoryProvider: MemoryProviderService;
    @inject(MemoryHoverRendererService) protected readonly hoverRenderer: MemoryHoverRendererService;
    @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer;

    protected previousBytes: Interfaces.LabeledUint8Array | undefined;
    protected memory: Interfaces.WidgetMemoryState;
    protected options: Interfaces.MemoryOptions;
    protected variableFinder: VariableFinder | undefined;
    protected deferredScrollContainer = new Deferred<HTMLDivElement>();

    @postConstruct()
    protected init(): void {
        this.doInit();
    }

    protected async doInit(): Promise<void> {
        this.id = MemoryTableWidget.ID;
        this.addClass(MemoryTableWidget.ID);
        this.scrollOptions = { ...this.scrollOptions, suppressScrollX: false };
        this.toDispose.push(this.optionsWidget.onOptionsChanged(optionId => this.handleOptionChange(optionId)));
        this.toDispose.push(this.optionsWidget.onMemoryChanged(e => this.handleMemoryChange(e)));
        this.toDispose.push(this.themeService.onDidColorThemeChange(e => this.handleThemeChange(e)));

        this.getStateAndUpdate();
    }

    protected handleOptionChange(_id?: string): Promise<void> {
        this.getStateAndUpdate();
        return Promise.resolve();
    }

    override update(): void {
        super.update();
        this.updateColumnWidths();
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        this.updateColumnWidths();
        super.onResize(msg);
    }

    protected updateColumnWidths = debounce(this.doUpdateColumnWidths.bind(this), Constants.DEBOUNCE_TIME);

    protected doUpdateColumnWidths(): void {
        setTimeout(() => {
            const firstTR = this.node.querySelector('tr');
            const header = this.node.querySelector(`.${MemoryTable.HEADER_ROW_CLASS}`) as HTMLDivElement;
            if (firstTR && header) {
                const allTDs = Array.from(firstTR.querySelectorAll('td'));
                const allSizes = allTDs.map(td => `minmax(max-content, ${td.clientWidth}px)`);
                header.style.gridTemplateColumns = allSizes.join(' ');
            }
        });
    }

    protected areSameRegion(a: Interfaces.MemoryReadResult, b: Interfaces.MemoryReadResult): boolean {
        return a.address.equals(b?.address) && a.bytes.length === b?.bytes.length;
    }

    protected handleMemoryChange(newMemory: Interfaces.MemoryReadResult): void {
        if (this.areSameRegion(this.memory, newMemory)) {
            this.previousBytes = this.memory.bytes;
        } else {
            this.previousBytes = undefined;
        }
        this.getStateAndUpdate();
    }

    protected handleThemeChange(_themeChange: ThemeChangeEvent): void {
        this.getStateAndUpdate();
    }

    protected getState(): void {
        this.options = this.optionsWidget.options;
        this.memory = this.optionsWidget.memory;
        const isHighContrast = this.themeService.getCurrentTheme().type === 'hc';
        this.variableFinder = this.optionsWidget.options.columnsDisplayed.variables.doRender
            ? new VariableFinder(this.memory.variables, isHighContrast)
            : undefined;
    }

    protected getStateAndUpdate(): void {
        this.getState();
        this.update();
        this.scrollIntoViewIfNecessary();
    }

    protected scrollIntoViewIfNecessary(): Promise<void> {
        return new Promise(resolve => setTimeout(() => {
            this.deferredScrollContainer.promise.then(scrollContainer => {
                const table = scrollContainer.querySelector('table');
                if (table && scrollContainer.scrollTop > table.clientHeight) {
                    const valueToGetInWindow = table.clientHeight - this.node.clientHeight;
                    const scrollHere = Math.max(valueToGetInWindow, 0);
                    scrollContainer.scrollTo(scrollContainer.scrollLeft, scrollHere);
                }
                this.scrollBar?.update();
                resolve();
            });
        }));
    }

    protected getWrapperHandlers(): MemoryTable.WrapperHandlers {
        return { onMouseMove: this.handleTableMouseMove };
    }

    protected assignScrollContainerRef = (element: HTMLDivElement): void => {
        this.deferredScrollContainer.resolve(element);
    };

    override async getScrollContainer(): Promise<HTMLDivElement> {
        return this.deferredScrollContainer.promise;
    }

    render(): React.ReactNode {
        const rows = this.getTableRows();
        const { onClick, onContextMenu, onFocus, onBlur, onKeyDown, onMouseMove } = this.getWrapperHandlers();
        const headers: Interfaces.ColumnIDs[] = Object.entries(this.options.columnsDisplayed)
            .filter(([, { doRender }]) => doRender)
            .map(([id, { label }]) => ({ label, id }));

        return (
            <div
                className={this.getWrapperClass()}
                onClick={onClick}
                onContextMenu={onContextMenu}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                onMouseMove={onMouseMove}
                role='textbox'
                tabIndex={0}
            >
                <div
                    className={this.getTableHeaderClass()}
                    style={this.getTableHeaderStyle(headers.length)}
                >
                    {this.getTableHeaders(headers)}
                </div>
                <div
                    className='t-mv-view-container'
                    style={{ position: 'relative' }}
                    ref={this.assignScrollContainerRef}
                >
                    {this.getBeforeTableContent()}
                    <table className='t-mv-view'>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                    {this.getAfterTableContent()}
                </div>
                {this.getTableFooter()}
            </div>
        );
    }

    protected getWrapperClass(): string {
        return `t-mv-memory-container${this.options.isFrozen ? ' frozen' : ''}`;
    }

    protected getTableHeaderClass(): string {
        return MemoryTable.HEADER_ROW_CLASS + ' no-select';
    }

    protected getTableHeaderStyle(numLabels: number): React.CSSProperties {
        const safePercentage = Math.floor(100 / numLabels);
        const gridTemplateColumns = ` ${safePercentage}% `.repeat(numLabels);
        return { gridTemplateColumns };
    }

    protected getTableHeaders(labels: Interfaces.ColumnIDs[]): React.ReactNode {
        return labels.map(label => this.getTableHeader(label));
    }

    protected getTableHeader({ label, id }: Interfaces.ColumnIDs): React.ReactNode {
        return (
            <div key={id} className={MemoryTable.HEADER_LABEL_CONTAINER_CLASS}>
                <span className='t-mv-header-label'>{label}</span>
            </div>
        );
    }

    protected getBeforeTableContent(): React.ReactNode {
        return (
            !!this.memory.bytes.length && (<MWMoreMemorySelect
                options={[128, 256, 512]}
                direction='above'
                handler={this.loadMoreMemory}
            />)
        );
    }

    protected getAfterTableContent(): React.ReactNode {
        return (
            !!this.memory.bytes.length && (<MWMoreMemorySelect
                options={[128, 256, 512]}
                direction='below'
                handler={this.loadMoreMemory}
            />)
        );
    }

    protected loadMoreMemory = async (options: Interfaces.MoreMemoryOptions): Promise<void> => {
        const { direction, numBytes } = options;
        const { address, offset, length } = this.optionsWidget.options;
        let newOffset = 0;
        const newLength = length + numBytes;
        if (direction === 'above') {
            newOffset = offset - numBytes;
        }
        await this.optionsWidget.setAddressAndGo(`${address}`, newOffset, newLength, direction);
    };

    protected getTableFooter(): React.ReactNode {
        return undefined;
    }

    protected getTableRows(): React.ReactNode {
        return [...this.renderRows()];
    }

    protected *renderRows(iteratee: Interfaces.LabeledUint8Array = this.memory.bytes): IterableIterator<React.ReactNode> {
        const bytesPerRow = this.options.bytesPerGroup * this.options.groupsPerRow;
        let rowsYielded = 0;
        let groups: React.ReactNode[] = [];
        let ascii = '';
        let variables: VariableDecoration[] = [];
        let isRowHighlighted = false;
        for (const { node, index, ascii: groupAscii, variables: groupVariables, isHighlighted = false } of this.renderGroups(iteratee)) {
            groups.push(node);
            ascii += groupAscii;
            variables.push(...groupVariables);
            isRowHighlighted = isRowHighlighted || isHighlighted;
            if (groups.length === this.options.groupsPerRow || index === iteratee.length - 1) {
                const rowAddress = this.memory.address.add(bytesPerRow * rowsYielded);
                const options: MemoryTable.RowOptions = {
                    address: `0x${rowAddress.toString(16)}`,
                    doShowDivider: (rowsYielded % 4) === 3,
                    isHighlighted: isRowHighlighted,
                    ascii,
                    groups,
                    variables,
                    index,
                };
                yield this.renderRow(options);
                ascii = '';
                variables = [];
                groups = [];
                rowsYielded += 1;
                isRowHighlighted = false;
            }
        }
    }

    protected renderRow(
        options: MemoryTable.RowOptions,
        getRowAttributes: Interfaces.RowDecorator = this.getRowAttributes.bind(this),
    ): React.ReactNode {
        const { address, groups } = options;
        const { className, style, title } = getRowAttributes(options);
        return (
            <tr
                // Add a marker to help visual navigation when scrolling
                className={className}
                style={style}
                title={title}
                key={address}
            >
                <td className={MemoryTable.ADDRESS_DATA_CLASS}>{address}</td>
                <td className={MemoryTable.MEMORY_DATA_CLASS}>{groups}</td>
                {this.getExtraColumn(options)}
            </tr>
        );
    }

    protected getRowAttributes(options: Partial<MemoryTable.RowOptions>): Partial<Interfaces.StylableNodeAttributes> {
        let className = MemoryTable.ROW_CLASS;
        if (options.doShowDivider) {
            className += ` ${MemoryTable.ROW_DIVIDER_CLASS}`;
        }
        return { className };
    }

    protected getExtraColumn(options: Pick<MemoryTable.RowOptions, 'ascii' | 'variables'>): React.ReactNode {
        const { variables } = options;
        const additionalColumns = [];
        if (this.options.columnsDisplayed.variables.doRender) {
            additionalColumns.push(
                <td className={MemoryTable.EXTRA_COLUMN_DATA_CLASS} key='variables'>
                    {!!variables?.length && (
                        <span className='variable-container'>
                            {variables.map(({ name, color }) => (
                                <span
                                    key={name}
                                    className={MemoryTable.VARIABLE_LABEL_CLASS}
                                    style={{ color }}
                                >
                                    {name}
                                </span>
                            ))}
                        </span>
                    )}
                </td>,
            );
        }
        if (this.options.columnsDisplayed.ascii.doRender) {
            const asciiColumn = this.options.columnsDisplayed.ascii.doRender && <td className={MemoryTable.EXTRA_COLUMN_DATA_CLASS} key='ascii'>{options.ascii}</td>;
            additionalColumns.push(asciiColumn);
        }
        return additionalColumns;
    }

    protected *renderGroups(iteratee: Interfaces.LabeledUint8Array = this.memory.bytes): IterableIterator<MemoryTable.GroupData> {
        let bytesInGroup: React.ReactNode[] = [];
        let ascii = '';
        let variables: VariableDecoration[] = [];
        let isGroupHighlighted = false;
        for (const { node, index, ascii: byteAscii, variables: byteVariables, isHighlighted = false } of this.renderBytes(iteratee)) {
            this.buildGroupByEndianness(bytesInGroup, node);
            ascii += byteAscii;
            variables.push(...byteVariables);
            isGroupHighlighted = isGroupHighlighted || isHighlighted;
            if (bytesInGroup.length === this.options.bytesPerGroup || index === iteratee.length - 1) {
                const itemID = this.memory.address.add(index);
                yield {
                    node: <span className='byte-group' key={itemID.toString(16)}>{bytesInGroup}</span>,
                    ascii,
                    index,
                    variables,
                    isHighlighted: isGroupHighlighted,
                };
                bytesInGroup = [];
                ascii = '';
                variables = [];
                isGroupHighlighted = false;
            }
        }
    }

    protected buildGroupByEndianness(oldBytes: React.ReactNode[], newByte: React.ReactNode): void {
        if (this.options.endianness === Interfaces.Endianness.Big) {
            oldBytes.push(newByte);
        } else {
            oldBytes.unshift(newByte);
        }
    }

    protected *renderBytes(iteratee: Interfaces.LabeledUint8Array = this.memory.bytes): IterableIterator<MemoryTable.ByteData> {
        const itemsPerByte = this.options.byteSize / 8;
        let currentByte = 0;
        let chunksInByte: React.ReactNode[] = [];
        let variables: VariableDecoration[] = [];
        let isByteHighlighted = false;
        for (const { node, content, index, variable, isHighlighted = false } of this.renderArrayItems(iteratee)) {
            chunksInByte.push(node);
            const numericalValue = parseInt(content, 16);
            currentByte = (currentByte << 8) + numericalValue;
            isByteHighlighted = isByteHighlighted || isHighlighted;
            if (variable?.firstAppearance) {
                variables.push(variable);
            }
            if (chunksInByte.length === itemsPerByte || index === iteratee.length - 1) {
                const itemID = this.memory.address.add(index);
                const ascii = this.getASCIIForSingleByte(currentByte);
                yield {
                    node: <span className='single-byte' key={itemID.toString(16)}>{chunksInByte}</span>,
                    ascii,
                    index,
                    variables,
                    isHighlighted: isByteHighlighted,
                };
                currentByte = 0;
                chunksInByte = [];
                variables = [];
                isByteHighlighted = false;
            }
        }
    }

    protected getASCIIForSingleByte(byte: number | undefined): string {
        return typeof byte === 'undefined'
            ? ' ' : Utils.isPrintableAsAscii(byte) ? String.fromCharCode(byte) : '.';
    }

    protected *renderArrayItems(
        iteratee: Interfaces.LabeledUint8Array = this.memory.bytes,
        getBitAttributes: Interfaces.BitDecorator = this.getBitAttributes.bind(this),
    ): IterableIterator<MemoryTable.ItemData> {
        const { address } = this.memory;

        for (let i = 0; i < iteratee.length; i += 1) {
            const itemID = address.add(i).toString(16);
            const { content = '', className, style, variable, title, isHighlighted } = getBitAttributes(i, iteratee);
            const node = (
                <span
                    style={style}
                    key={itemID}
                    className={className}
                    data-id={itemID}
                    title={title}
                >
                    {content}
                </span>
            );
            yield {
                node,
                content,
                index: i,
                variable,
                isHighlighted,
            };
        }
    }

    protected getBitAttributes(arrayOffset: number, iteratee: Interfaces.LabeledUint8Array): Partial<Interfaces.FullNodeAttributes> {
        const itemAddress = this.memory.address.add(arrayOffset * 8 / this.options.byteSize);
        const classNames = [MemoryTable.EIGHT_BIT_SPAN_CLASS];
        const isChanged = this.previousBytes && iteratee[arrayOffset] !== this.previousBytes[arrayOffset];
        const variable = this.variableFinder?.getVariableForAddress(itemAddress);
        if (!this.options.isFrozen) {
            if (isChanged) {
                classNames.push('changed');
            }
        }
        return {
            className: classNames.join(' '),
            variable,
            style: { color: variable?.color },
            content: iteratee[arrayOffset].toString(16).padStart(2, '0')
        };
    }

    protected handleTableMouseMove = (e: React.MouseEvent): void => {
        const { target } = e; // react events can't be put into the debouncer
        this.debounceHandleMouseTableMove(target);
    };

    protected debounceHandleMouseTableMove = debounce(this.doHandleTableMouseMove.bind(this), Constants.DEBOUNCE_TIME, { trailing: true });

    protected doHandleTableMouseMove(targetSpan: React.MouseEvent['target']): void {
        const target = targetSpan instanceof HTMLElement && targetSpan;
        if (target) {
            const { x, y } = target.getBoundingClientRect();
            const anchor = { x: Math.round(x), y: Math.round(y + target.clientHeight) };
            if (target.classList.contains(MemoryTable.EIGHT_BIT_SPAN_CLASS)) {
                const properties = this.getHoverForChunk(target);
                this.hoverRenderer.render(this.node, anchor, properties);
            } else if (target.classList.contains(MemoryTable.VARIABLE_LABEL_CLASS)) {
                const properties = this.getHoverForVariable(target);
                this.hoverRenderer.render(this.node, anchor, properties);
            } else {
                this.hoverRenderer.hide();
            }
        } else {
            this.hoverRenderer.hide();
        }
    }

    protected getHoverForChunk(span: HTMLElement): EasilyMappedObject | undefined {
        if (span.classList.contains(MemoryTable.EIGHT_BIT_SPAN_CLASS)) {
            const parentByteContainer = span.parentElement;
            if (parentByteContainer?.textContent) {
                const hex = parentByteContainer.textContent ?? '';
                const decimal = parseInt(hex, 16);
                const binary = this.getPaddedBinary(decimal);
                const UTF8 = String.fromCodePoint(decimal);
                return { hex, binary, decimal, UTF8 };
            }
        }
        return undefined;
    }

    protected getPaddedBinary(decimal: number): string {
        const paddedBinary = decimal.toString(2).padStart(this.options.byteSize, '0');
        let paddedAndSpacedBinary = '';
        for (let i = 8; i <= paddedBinary.length; i += 8) {
            paddedAndSpacedBinary += ` ${paddedBinary.slice(i - 8, i)}`;
        }
        return paddedAndSpacedBinary.trim();
    }

    protected getHoverForVariable(span: HTMLElement): EasilyMappedObject | undefined {
        const variable = this.variableFinder?.searchForVariable(span.textContent ?? '');
        if (variable?.type) {
            return { type: variable.type };
        }
        return undefined;
    }

    protected handleTableRightClick = (e: React.MouseEvent): void => this.doHandleTableRightClick(e);

    protected doHandleTableRightClick(event: React.MouseEvent): void {
        event.preventDefault();
        const target = event.target as HTMLElement;
        if (target.classList?.contains('eight-bits')) {
            const { right, top } = target.getBoundingClientRect();
            this.update();
            event.stopPropagation();
            this.contextMenuRenderer.render({
                menuPath: MemoryTableWidget.CONTEXT_MENU,
                anchor: { x: right, y: top },
                args: this.getContextMenuArgs(event),
                context: target
            });
        }
    }

    protected getContextMenuArgs(event: React.MouseEvent): unknown[] {
        const args: unknown[] = [this];
        const id = (event.target as HTMLElement).getAttribute('data-id');
        if (id) {
            const location = hexStrToUnsignedLong(id);
            args.push(location);
            const offset = this.memory.address.multiply(-1).add(location);
            const cellAddress = this.memory.address.add(offset.multiply(8 / this.options.byteSize));
            const variableAtLocation = this.variableFinder?.searchForVariable(cellAddress);
            args.push(variableAtLocation);
        }
        return args;
    }
}
