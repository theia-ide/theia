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

import { Widget, Message, BaseWidget, Key, StatefulWidget, MessageLoop, KeyCode, codicon } from '@theia/core/lib/browser';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { SearchInWorkspaceResultTreeWidget } from './search-in-workspace-result-tree-widget';
import { SearchInWorkspaceOptions } from '../common/search-in-workspace-interface';
import * as React from '@theia/core/shared/react';
import { createRoot, Root } from '@theia/core/shared/react-dom/client';
import { Event, Emitter, Disposable } from '@theia/core/lib/common';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { SearchInWorkspaceContextKeyService } from './search-in-workspace-context-key-service';
import { CancellationTokenSource } from '@theia/core';
import { ProgressBarFactory } from '@theia/core/lib/browser/progress-bar-factory';
import { EditorManager } from '@theia/editor/lib/browser';
import { SearchInWorkspacePreferences } from './search-in-workspace-preferences';
import { SearchInWorkspaceInput } from './components/search-in-workspace-input';
import { SearchInWorkspaceTextArea } from './components/search-in-workspace-textarea';
import { nls } from '@theia/core/lib/common/nls';

export interface SearchFieldState {
    className: string;
    enabled: boolean;
    title: string;
}

@injectable()
export class SearchInWorkspaceWidget extends BaseWidget implements StatefulWidget {

    static ID = 'search-in-workspace';
    static LABEL = nls.localizeByDefault('Search');

    protected matchCaseState: SearchFieldState;
    protected wholeWordState: SearchFieldState;
    protected regExpState: SearchFieldState;
    protected includeIgnoredState: SearchFieldState;

    protected showSearchDetails = false;
    protected _hasResults = false;
    protected get hasResults(): boolean {
        return this._hasResults;
    }
    protected set hasResults(hasResults: boolean) {
        this.contextKeyService.hasSearchResult.set(hasResults);
        this._hasResults = hasResults;
    }
    protected resultNumber = 0;

    protected searchFieldContainerIsFocused = false;

    protected searchInWorkspaceOptions: SearchInWorkspaceOptions;

    protected searchTerm = '';
    protected replaceTerm = '';

    private searchRef = React.createRef<SearchInWorkspaceTextArea>();
    private replaceRef = React.createRef<SearchInWorkspaceTextArea>();
    private includeRef = React.createRef<SearchInWorkspaceInput>();
    private excludeRef = React.createRef<SearchInWorkspaceInput>();

    private refsAreSet: Promise<void> = new Promise(resolve => this.resolveRefsAreSet = resolve);
    private resolveRefsAreSet: () => void;

    protected _showReplaceField = false;
    protected get showReplaceField(): boolean {
        return this._showReplaceField;
    }
    protected set showReplaceField(showReplaceField: boolean) {
        this.contextKeyService.replaceActive.set(showReplaceField);
        this._showReplaceField = showReplaceField;
    }

    protected contentNode: HTMLElement;
    protected searchFormContainer: HTMLElement;
    protected resultContainer: HTMLElement;

    protected readonly onDidUpdateEmitter = new Emitter<void>();
    readonly onDidUpdate: Event<void> = this.onDidUpdateEmitter.event;

    @inject(SearchInWorkspaceResultTreeWidget) readonly resultTreeWidget: SearchInWorkspaceResultTreeWidget;
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;

    @inject(SearchInWorkspaceContextKeyService)
    protected readonly contextKeyService: SearchInWorkspaceContextKeyService;

    @inject(ProgressBarFactory)
    protected readonly progressBarFactory: ProgressBarFactory;

    @inject(EditorManager) protected readonly editorManager: EditorManager;

    @inject(SearchInWorkspacePreferences)
    protected readonly searchInWorkspacePreferences: SearchInWorkspacePreferences;

    protected searchFormContainerRoot: Root;

    @postConstruct()
    protected init(): void {
        this.id = SearchInWorkspaceWidget.ID;
        this.title.label = SearchInWorkspaceWidget.LABEL;
        this.title.caption = SearchInWorkspaceWidget.LABEL;
        this.title.iconClass = codicon('search');
        this.title.closable = true;
        this.contentNode = document.createElement('div');
        this.contentNode.classList.add('t-siw-search-container');
        this.searchFormContainer = document.createElement('div');
        this.searchFormContainer.classList.add('searchHeader');
        this.contentNode.appendChild(this.searchFormContainer);
        this.searchFormContainerRoot = createRoot(this.searchFormContainer);
        this.node.tabIndex = 0;
        this.node.appendChild(this.contentNode);

        this.matchCaseState = {
            className: codicon('case-sensitive'),
            enabled: false,
            title: nls.localizeByDefault('Match Case')
        };
        this.wholeWordState = {
            className: codicon('whole-word'),
            enabled: false,
            title: nls.localizeByDefault('Match Whole Word')
        };
        this.regExpState = {
            className: codicon('regex'),
            enabled: false,
            title: nls.localizeByDefault('Use Regular Expression')
        };
        this.includeIgnoredState = {
            className: codicon('eye'),
            enabled: false,
            title: nls.localize('theia/search-in-workspace/includeIgnoredFiles', 'Include Ignored Files')
        };
        this.searchInWorkspaceOptions = {
            matchCase: false,
            matchWholeWord: false,
            useRegExp: false,
            multiline: false,
            includeIgnored: false,
            include: [],
            exclude: [],
            maxResults: 2000
        };
        this.toDispose.push(this.resultTreeWidget.onChange(r => {
            this.hasResults = r.size > 0;
            this.resultNumber = 0;
            const results = Array.from(r.values());
            results.forEach(rootFolder =>
                rootFolder.children.forEach(file => this.resultNumber += file.children.length)
            );
            this.update();
        }));

        this.toDispose.push(this.resultTreeWidget.onFocusInput(b => {
            this.focusInputField();
        }));

        this.toDispose.push(this.searchInWorkspacePreferences.onPreferenceChanged(e => {
            if (e.preferenceName === 'search.smartCase') {
                this.performSearch();
            }
        }));

        this.toDispose.push(this.resultTreeWidget);
        this.toDispose.push(this.resultTreeWidget.onExpansionChanged(() => {
            this.onDidUpdateEmitter.fire();
        }));

        this.toDispose.push(this.progressBarFactory({ container: this.node, insertMode: 'prepend', locationId: 'search' }));
    }

    storeState(): object {
        return {
            matchCaseState: this.matchCaseState,
            wholeWordState: this.wholeWordState,
            regExpState: this.regExpState,
            includeIgnoredState: this.includeIgnoredState,
            showSearchDetails: this.showSearchDetails,
            searchInWorkspaceOptions: this.searchInWorkspaceOptions,
            searchTerm: this.searchTerm,
            replaceTerm: this.replaceTerm,
            showReplaceField: this.showReplaceField,
            searchHistoryState: this.searchRef.current?.state,
            replaceHistoryState: this.replaceRef.current?.state,
            includeHistoryState: this.includeRef.current?.state,
            excludeHistoryState: this.excludeRef.current?.state,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    restoreState(oldState: any): void {
        this.matchCaseState = oldState.matchCaseState;
        this.wholeWordState = oldState.wholeWordState;
        this.regExpState = oldState.regExpState;
        this.includeIgnoredState = oldState.includeIgnoredState;
        // Override the title of the restored state, as we could have changed languages in between
        this.matchCaseState.title = nls.localizeByDefault('Match Case');
        this.wholeWordState.title = nls.localizeByDefault('Match Whole Word');
        this.regExpState.title = nls.localizeByDefault('Use Regular Expression');
        this.includeIgnoredState.title = nls.localize('theia/search-in-workspace/includeIgnoredFiles', 'Include Ignored Files');
        this.showSearchDetails = oldState.showSearchDetails;
        this.searchInWorkspaceOptions = oldState.searchInWorkspaceOptions;
        this.searchTerm = oldState.searchTerm;
        this.replaceTerm = oldState.replaceTerm;
        this.showReplaceField = oldState.showReplaceField;
        this.resultTreeWidget.replaceTerm = this.replaceTerm;
        this.resultTreeWidget.showReplaceButtons = this.showReplaceField;
        this.searchRef.current?.setState(oldState.searchHistoryState);
        this.replaceRef.current?.setState(oldState.replaceHistoryState);
        this.includeRef.current?.setState(oldState.includeHistoryState);
        this.excludeRef.current?.setState(oldState.excludeHistoryState);
        this.refresh();
    }

    findInFolder(uris: string[]): void {
        this.showSearchDetails = true;
        const values = Array.from(new Set(uris.map(uri => `${uri}/**`)));
        const value = values.join(', ');
        this.searchInWorkspaceOptions.include = values;
        if (this.includeRef.current) {
            this.includeRef.current.value = value;
            this.includeRef.current.addToHistory();
        }
        this.update();
    }

    /**
     * Update the search term and input field.
     * @param term the search term.
     * @param showReplaceField controls if the replace field should be displayed.
     */
    updateSearchTerm(term: string, showReplaceField?: boolean): void {
        this.searchTerm = term;
        if (this.searchRef.current) {
            this.searchRef.current.value = term;
            this.searchRef.current.addToHistory();
        }
        if (showReplaceField) {
            this.showReplaceField = true;
        }
        this.refresh();
    }

    hasResultList(): boolean {
        return this.hasResults;
    }

    hasSearchTerm(): boolean {
        return this.searchTerm !== '';
    }

    refresh(): void {
        this.performSearch();
        this.update();
    }

    getCancelIndicator(): CancellationTokenSource | undefined {
        return this.resultTreeWidget.cancelIndicator;
    }

    collapseAll(): void {
        this.resultTreeWidget.collapseAll();
        this.update();
    }

    expandAll(): void {
        this.resultTreeWidget.expandAll();
        this.update();
    }

    areResultsCollapsed(): boolean {
        return this.resultTreeWidget.areResultsCollapsed();
    }

    clear(): void {
        this.searchTerm = '';
        this.replaceTerm = '';
        this.searchInWorkspaceOptions.include = [];
        this.searchInWorkspaceOptions.exclude = [];
        this.includeIgnoredState.enabled = false;
        this.matchCaseState.enabled = false;
        this.wholeWordState.enabled = false;
        this.regExpState.enabled = false;
        if (this.searchRef.current) {
            this.searchRef.current.value = '';
        }
        if (this.replaceRef.current) {
            this.replaceRef.current.value = '';
        }
        if (this.includeRef.current) {
            this.includeRef.current.value = '';
        }
        if (this.excludeRef.current) {
            this.excludeRef.current.value = '';
        }
        this.performSearch();
        this.update();
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.searchFormContainerRoot.render(<React.Fragment>{this.renderSearchHeader()}{this.renderSearchInfo()}</React.Fragment>);
        Widget.attach(this.resultTreeWidget, this.contentNode);
        this.toDisposeOnDetach.push(Disposable.create(() => {
            Widget.detach(this.resultTreeWidget);
        }));
    }

    protected override onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        const searchInfo = this.renderSearchInfo();
        if (searchInfo) {
            this.searchFormContainerRoot.render(<React.Fragment>{this.renderSearchHeader()}{searchInfo}</React.Fragment>);
            this.onDidUpdateEmitter.fire(undefined);
        }
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        super.onResize(msg);
        this.searchRef.current?.forceUpdate();
        this.replaceRef.current?.forceUpdate();
        MessageLoop.sendMessage(this.resultTreeWidget, Widget.ResizeMessage.UnknownSize);
    }

    protected override onAfterShow(msg: Message): void {
        super.onAfterShow(msg);
        this.focusInputField();
        this.contextKeyService.searchViewletVisible.set(true);
    }

    protected override onAfterHide(msg: Message): void {
        super.onAfterHide(msg);
        this.contextKeyService.searchViewletVisible.set(false);
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.focusInputField();
    }

    protected async focusInputField(): Promise<void> {
        // Wait until React rendering is sufficiently progressed before trying to focus the input field.
        await this.refsAreSet;
        if (this.searchRef.current?.textarea.current) {
            this.searchRef.current.textarea.current.focus();
            this.searchRef.current.textarea.current.select();
        }
    }

    protected renderSearchHeader(): React.ReactNode {
        const searchAndReplaceContainer = this.renderSearchAndReplace();
        const searchDetails = this.renderSearchDetails();
        return <div ref={() => this.resolveRefsAreSet()}>{searchAndReplaceContainer}{searchDetails}</div>;
    }

    protected renderSearchAndReplace(): React.ReactNode {
        const toggleContainer = this.renderReplaceFieldToggle();
        const searchField = this.renderSearchField();
        const replaceField = this.renderReplaceField();
        return <div className='search-and-replace-container'>
            {toggleContainer}
            <div className='search-and-replace-fields'>
                {searchField}
                {replaceField}
            </div>
        </div>;
    }

    protected renderReplaceFieldToggle(): React.ReactNode {
        const toggle = <span className={codicon(this.showReplaceField ? 'chevron-down' : 'chevron-right')}></span>;
        return <div
            title={nls.localizeByDefault('Toggle Replace')}
            className='replace-toggle'
            tabIndex={0}
            onClick={e => {
                const elArr = document.getElementsByClassName('replace-toggle');
                if (elArr && elArr.length > 0) {
                    (elArr[0] as HTMLElement).focus();
                }
                this.showReplaceField = !this.showReplaceField;
                this.resultTreeWidget.showReplaceButtons = this.showReplaceField;
                this.update();
            }}>
            {toggle}
        </div>;
    }

    protected renderNotification(): React.ReactNode {
        if (this.workspaceService.tryGetRoots().length <= 0 && this.editorManager.all.length <= 0) {
            return <div className='search-notification show'>
                <div>{nls.localize('theia/search-in-workspace/noFolderSpecified', 'You have not opened or specified a folder. Only open files are currently searched.')}</div>
            </div>;
        }
        return <div
            className={`search-notification ${this.searchInWorkspaceOptions.maxResults && this.resultNumber >= this.searchInWorkspaceOptions.maxResults ? 'show' : ''}`}>
            <div>{nls.localize('theia/search-in-workspace/resultSubset',
                'This is only a subset of all results. Use a more specific search term to narrow down the result list.')}</div>
        </div>;
    }

    protected readonly focusSearchFieldContainer = () => this.doFocusSearchFieldContainer();
    protected doFocusSearchFieldContainer(): void {
        this.searchFieldContainerIsFocused = true;
        this.update();
    }

    protected readonly blurSearchFieldContainer = () => this.doBlurSearchFieldContainer();
    protected doBlurSearchFieldContainer(): void {
        this.searchFieldContainerIsFocused = false;
        this.update();
    }

    private _searchTimeout: number;
    protected readonly search = (e: React.KeyboardEvent) => {
        e.persist();
        const searchOnType = this.searchInWorkspacePreferences['search.searchOnType'];
        if (searchOnType) {
            const delay = this.searchInWorkspacePreferences['search.searchOnTypeDebouncePeriod'] || 0;
            window.clearTimeout(this._searchTimeout);
            this._searchTimeout = window.setTimeout(() => this.doSearch(e), delay);
        }
    };

    protected readonly onKeyDownSearch = (e: React.KeyboardEvent) => {
        if (Key.ENTER.keyCode === KeyCode.createKeyCode(e.nativeEvent).key?.keyCode) {
            this.searchTerm = (e.target as HTMLInputElement).value;
            this.performSearch();
        }
    };

    protected doSearch(e: React.KeyboardEvent): void {
        if (e.target) {
            const searchValue = (e.target as HTMLInputElement).value;
            if (this.searchTerm === searchValue && Key.ENTER.keyCode !== KeyCode.createKeyCode(e.nativeEvent).key?.keyCode) {
                return;
            } else {
                this.searchTerm = searchValue;
                this.performSearch();
            }
        }
    }

    protected performSearch(): void {
        const searchOptions: SearchInWorkspaceOptions = {
            ...this.searchInWorkspaceOptions,
            followSymlinks: this.shouldFollowSymlinks(),
            matchCase: this.shouldMatchCase(),
            multiline: this.searchTerm.includes('\n')
        };
        this.resultTreeWidget.search(this.searchTerm, searchOptions);
    }

    protected shouldFollowSymlinks(): boolean {
        return this.searchInWorkspacePreferences['search.followSymlinks'];
    }

    /**
     * Determine if search should be case sensitive.
     */
    protected shouldMatchCase(): boolean {
        if (this.matchCaseState.enabled) {
            return this.matchCaseState.enabled;
        }
        // search.smartCase makes siw search case-sensitive if the search term contains uppercase letter(s).
        return (
            !!this.searchInWorkspacePreferences['search.smartCase']
            && this.searchTerm !== this.searchTerm.toLowerCase()
        );
    }

    protected renderSearchField(): React.ReactNode {
        const input = <SearchInWorkspaceTextArea
            id='search-input-field'
            className='theia-input'
            title={SearchInWorkspaceWidget.LABEL}
            placeholder={SearchInWorkspaceWidget.LABEL}
            defaultValue={this.searchTerm}
            autoComplete='off'
            onKeyUp={this.search}
            onKeyDown={this.onKeyDownSearch}
            onFocus={this.handleFocusSearchInputBox}
            onBlur={this.handleBlurSearchInputBox}
            ref={this.searchRef}
        />;
        const notification = this.renderNotification();
        const optionContainer = this.renderOptionContainer();
        const tooMany = this.searchInWorkspaceOptions.maxResults && this.resultNumber >= this.searchInWorkspaceOptions.maxResults ? 'tooManyResults' : '';
        const className = `search-field-container ${tooMany} ${this.searchFieldContainerIsFocused ? 'focused' : ''}`;
        return <div className={className}>
            <div className='search-field' tabIndex={-1} onFocus={this.focusSearchFieldContainer} onBlur={this.blurSearchFieldContainer}>
                {input}
                {optionContainer}
            </div>
            {notification}
        </div>;
    }
    protected handleFocusSearchInputBox = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        event.target.placeholder = SearchInWorkspaceWidget.LABEL + nls.localizeByDefault(' ({0} for history)', '⇅');
        this.contextKeyService.setSearchInputBoxFocus(true);
    };
    protected handleBlurSearchInputBox = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        event.target.placeholder = SearchInWorkspaceWidget.LABEL;
        this.contextKeyService.setSearchInputBoxFocus(false);
    };

    protected readonly updateReplaceTerm = (e: React.KeyboardEvent) => this.doUpdateReplaceTerm(e);
    protected doUpdateReplaceTerm(e: React.KeyboardEvent): void {
        if (e.target) {
            this.replaceTerm = (e.target as HTMLInputElement).value;
            this.resultTreeWidget.replaceTerm = this.replaceTerm;
            if (KeyCode.createKeyCode(e.nativeEvent).key?.keyCode === Key.ENTER.keyCode) { this.performSearch(); }
            this.update();
        }
    }

    protected renderReplaceField(): React.ReactNode {
        const replaceAllButtonContainer = this.renderReplaceAllButtonContainer();
        const replace = nls.localizeByDefault('Replace');
        return <div className={`replace-field${this.showReplaceField ? '' : ' hidden'}`}>
            <SearchInWorkspaceTextArea
                id='replace-input-field'
                className='theia-input'
                title={replace}
                placeholder={replace}
                defaultValue={this.replaceTerm}
                autoComplete='off'
                onKeyUp={this.updateReplaceTerm}
                onFocus={this.handleFocusReplaceInputBox}
                onBlur={this.handleBlurReplaceInputBox}
                ref={this.replaceRef}
            />
            {replaceAllButtonContainer}
        </div>;
    }

    protected handleFocusReplaceInputBox = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        event.target.placeholder = nls.localizeByDefault('Replace') + nls.localizeByDefault(' ({0} for history)', '⇅');
        this.contextKeyService.setReplaceInputBoxFocus(true);
    };
    protected handleBlurReplaceInputBox = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        event.target.placeholder = nls.localizeByDefault('Replace');
        this.contextKeyService.setReplaceInputBoxFocus(false);
    };

    protected renderReplaceAllButtonContainer(): React.ReactNode {
        // The `Replace All` button is enabled if there is a search term present with results.
        const enabled: boolean = this.searchTerm !== '' && this.resultNumber > 0;
        return <div className='replace-all-button-container'>
            <span
                title={nls.localizeByDefault('Replace All')}
                className={`${codicon('replace-all', true)} ${enabled ? ' ' : ' disabled'}`}
                onClick={() => {
                    if (enabled) {
                        this.resultTreeWidget.replace(undefined);
                    }
                }}>
            </span>
        </div>;
    }

    protected renderOptionContainer(): React.ReactNode {
        const matchCaseOption = this.renderOptionElement(this.matchCaseState);
        const wholeWordOption = this.renderOptionElement(this.wholeWordState);
        const regexOption = this.renderOptionElement(this.regExpState);
        const includeIgnoredOption = this.renderOptionElement(this.includeIgnoredState);
        return <div className='option-buttons'>{matchCaseOption}{wholeWordOption}{regexOption}{includeIgnoredOption}</div>;
    }

    protected renderOptionElement(opt: SearchFieldState): React.ReactNode {
        return <span
            className={`${opt.className} option action-label ${opt.enabled ? 'enabled' : ''}`}
            title={opt.title}
            onClick={() => this.handleOptionClick(opt)}></span>;
    }

    protected handleOptionClick(option: SearchFieldState): void {
        option.enabled = !option.enabled;
        this.updateSearchOptions();
        this.searchFieldContainerIsFocused = true;
        this.performSearch();
        this.update();
    }

    protected updateSearchOptions(): void {
        this.searchInWorkspaceOptions.matchCase = this.matchCaseState.enabled;
        this.searchInWorkspaceOptions.matchWholeWord = this.wholeWordState.enabled;
        this.searchInWorkspaceOptions.useRegExp = this.regExpState.enabled;
        this.searchInWorkspaceOptions.includeIgnored = this.includeIgnoredState.enabled;
    }

    protected renderSearchDetails(): React.ReactNode {
        const expandButton = this.renderExpandGlobFieldsButton();
        const globFieldContainer = this.renderGlobFieldContainer();
        return <div className='search-details'>{expandButton}{globFieldContainer}</div>;
    }

    protected renderGlobFieldContainer(): React.ReactNode {
        const includeField = this.renderGlobField('include');
        const excludeField = this.renderGlobField('exclude');
        return <div className={`glob-field-container${!this.showSearchDetails ? ' hidden' : ''}`}>{includeField}{excludeField}</div>;
    }

    protected renderExpandGlobFieldsButton(): React.ReactNode {
        return <div className='button-container'>
            <span
                title={nls.localizeByDefault('Toggle Search Details')}
                className={codicon('ellipsis')}
                onClick={() => {
                    this.showSearchDetails = !this.showSearchDetails;
                    this.update();
                }}></span>
        </div>;
    }

    protected renderGlobField(kind: 'include' | 'exclude'): React.ReactNode {
        const currentValue = this.searchInWorkspaceOptions[kind];
        const value = currentValue && currentValue.join(', ') || '';
        return <div className='glob-field'>
            <div className='label'>{nls.localizeByDefault('files to ' + kind)}</div>
            <SearchInWorkspaceInput
                className='theia-input'
                type='text'
                size={1}
                defaultValue={value}
                autoComplete='off'
                id={kind + '-glob-field'}
                placeholder={kind === 'include'
                    ? nls.localizeByDefault('e.g. *.ts, src/**/include')
                    : nls.localizeByDefault('e.g. *.ts, src/**/exclude')
                }
                onKeyUp={e => {
                    if (e.target) {
                        const targetValue = (e.target as HTMLInputElement).value || '';
                        let shouldSearch = Key.ENTER.keyCode === KeyCode.createKeyCode(e.nativeEvent).key?.keyCode;
                        const currentOptions = (this.searchInWorkspaceOptions[kind] || []).slice().map(s => s.trim()).sort();
                        const candidateOptions = this.splitOnComma(targetValue).map(s => s.trim()).sort();
                        const sameAs = (left: string[], right: string[]) => {
                            if (left.length !== right.length) {
                                return false;
                            }
                            for (let i = 0; i < left.length; i++) {
                                if (left[i] !== right[i]) {
                                    return false;
                                }
                            }
                            return true;
                        };
                        if (!sameAs(currentOptions, candidateOptions)) {
                            this.searchInWorkspaceOptions[kind] = this.splitOnComma(targetValue);
                            shouldSearch = true;
                        }
                        if (shouldSearch) {
                            this.performSearch();
                        }
                    }
                }}
                onFocus={kind === 'include' ? this.handleFocusIncludesInputBox : this.handleFocusExcludesInputBox}
                onBlur={kind === 'include' ? this.handleBlurIncludesInputBox : this.handleBlurExcludesInputBox}
                ref={kind === 'include' ? this.includeRef : this.excludeRef}
            />
        </div>;
    }

    protected handleFocusIncludesInputBox = () => this.contextKeyService.setPatternIncludesInputBoxFocus(true);
    protected handleBlurIncludesInputBox = () => this.contextKeyService.setPatternIncludesInputBoxFocus(false);

    protected handleFocusExcludesInputBox = () => this.contextKeyService.setPatternExcludesInputBoxFocus(true);
    protected handleBlurExcludesInputBox = () => this.contextKeyService.setPatternExcludesInputBoxFocus(false);

    protected splitOnComma(patterns: string): string[] {
        return patterns.length > 0 ? patterns.split(',').map(s => s.trim()) : [];
    }

    protected renderSearchInfo(): React.ReactNode {
        const message = this.getSearchResultMessage() || '';
        return <div className='search-info'>{message}</div>;
    }

    protected getSearchResultMessage(): string | undefined {

        if (!this.searchTerm) {
            return undefined;
        }

        if (this.resultNumber === 0) {
            const isIncludesPresent = this.searchInWorkspaceOptions.include && this.searchInWorkspaceOptions.include.length > 0;
            const isExcludesPresent = this.searchInWorkspaceOptions.exclude && this.searchInWorkspaceOptions.exclude.length > 0;

            let message: string;
            if (isIncludesPresent && isExcludesPresent) {
                message = nls.localizeByDefault("No results found in '{0}' excluding '{1}' - ",
                    this.searchInWorkspaceOptions.include!.toString(), this.searchInWorkspaceOptions.exclude!.toString());
            } else if (isIncludesPresent) {
                message = nls.localizeByDefault("No results found in '{0}' - ",
                    this.searchInWorkspaceOptions.include!.toString());
            } else if (isExcludesPresent) {
                message = nls.localizeByDefault("No results found excluding '{0}' - ",
                    this.searchInWorkspaceOptions.exclude!.toString());
            } else {
                message = nls.localizeByDefault('No results found') + ' - ';
            }
            // We have to trim here as vscode will always add a trailing " - " string
            return message.substring(0, message.length - 2).trim();
        } else {
            if (this.resultNumber === 1 && this.resultTreeWidget.fileNumber === 1) {
                return nls.localizeByDefault('{0} result in {1} file',
                    this.resultNumber.toString(), this.resultTreeWidget.fileNumber.toString());
            } else if (this.resultTreeWidget.fileNumber === 1) {
                return nls.localizeByDefault('{0} results in {1} file',
                    this.resultNumber.toString(), this.resultTreeWidget.fileNumber.toString());
            } else if (this.resultTreeWidget.fileNumber > 0) {
                return nls.localizeByDefault('{0} results in {1} files',
                    this.resultNumber.toString(), this.resultTreeWidget.fileNumber.toString());
            } else {
                // if fileNumber === 0, return undefined so that `onUpdateRequest()` would not re-render component
                return undefined;
            }
        }
    }
}
