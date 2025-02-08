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

import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { ILogger } from '@theia/core/lib/common/logger';
import { StorageService } from '@theia/core/lib/browser/storage-service';
import { Disposable, DisposableCollection } from '@theia/core/lib/common/disposable';
import { FrontendApplicationContribution } from '@theia/core/lib/browser/frontend-application-contribution';
import { CommandRegistry } from '@theia/core/lib/common/command';
import { EditorCommands } from './editor-command';
import { EditorWidget } from './editor-widget';
import { EditorManager } from './editor-manager';
import { TextEditor, Position, Range, TextDocumentChangeEvent } from './editor';
import { NavigationLocation, RecentlyClosedEditor } from './navigation/navigation-location';
import { NavigationLocationService } from './navigation/navigation-location-service';
import { PreferenceService, PreferenceScope, addEventListener } from '@theia/core/lib/browser';
import { ConfirmDialog, Dialog } from '@theia/core/lib/browser/dialogs';
import { nls } from '@theia/core';

@injectable()
export class EditorNavigationContribution implements Disposable, FrontendApplicationContribution {

    private static ID = 'editor-navigation-contribution';
    private static CLOSED_EDITORS_KEY = 'recently-closed-editors';
    private static MOUSE_NAVIGATION_PREFERENCE = 'workbench.editor.mouseBackForwardToNavigate';

    protected readonly toDispose = new DisposableCollection();
    protected readonly toDisposePerCurrentEditor = new DisposableCollection();

    @inject(ILogger)
    protected readonly logger: ILogger;

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;

    @inject(NavigationLocationService)
    protected readonly locationStack: NavigationLocationService;

    @inject(StorageService)
    protected readonly storageService: StorageService;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    @postConstruct()
    protected init(): void {
        this.toDispose.pushAll([
            // TODO listen on file resource changes, if a file gets deleted, remove the corresponding navigation locations (if any).
            // This would require introducing the FS dependency in the editor extension.
            this.editorManager.onCurrentEditorChanged(this.onCurrentEditorChanged.bind(this)),
            this.editorManager.onCreated(widget => {
                this.locationStack.removeClosedEditor(widget.editor.uri);
                widget.disposed.connect(() => this.locationStack.addClosedEditor({
                    uri: widget.editor.uri,
                    viewState: widget.editor.storeViewState()
                }));
            })
        ]);
        this.commandRegistry.registerHandler(EditorCommands.GO_BACK.id, {
            execute: () => this.locationStack.back(),
            isEnabled: () => this.locationStack.canGoBack()
        });
        this.commandRegistry.registerHandler(EditorCommands.GO_FORWARD.id, {
            execute: () => this.locationStack.forward(),
            isEnabled: () => this.locationStack.canGoForward()
        });
        this.commandRegistry.registerHandler(EditorCommands.GO_LAST_EDIT.id, {
            execute: () => this.locationStack.reveal(this.locationStack.lastEditLocation()),
            isEnabled: () => !!this.locationStack.lastEditLocation()
        });
        this.commandRegistry.registerHandler(EditorCommands.CLEAR_EDITOR_HISTORY.id, {
            execute: async () => {
                const shouldClear = await new ConfirmDialog({
                    title: nls.localizeByDefault('Clear Editor History'),
                    msg: nls.localizeByDefault('Do you want to clear the history of recently opened editors?'),
                    ok: Dialog.YES,
                    cancel: Dialog.NO
                }).open();
                if (shouldClear) {
                    this.locationStack.clearHistory();
                }
            },
            isEnabled: () => this.locationStack.locations().length > 0
        });
        this.commandRegistry.registerHandler(EditorCommands.TOGGLE_MINIMAP.id, {
            execute: () => this.toggleMinimap(),
            isEnabled: () => true,
            isToggled: () => this.isMinimapEnabled()
        });
        this.commandRegistry.registerHandler(EditorCommands.TOGGLE_RENDER_WHITESPACE.id, {
            execute: () => this.toggleRenderWhitespace(),
            isEnabled: () => true,
            isToggled: () => this.isRenderWhitespaceEnabled()
        });
        this.commandRegistry.registerHandler(EditorCommands.TOGGLE_WORD_WRAP.id, {
            execute: () => this.toggleWordWrap(),
            isEnabled: () => true,
        });
        this.commandRegistry.registerHandler(EditorCommands.TOGGLE_STICKY_SCROLL.id, {
            execute: () => this.toggleStickyScroll(),
            isEnabled: () => true,
            isToggled: () => this.isStickyScrollEnabled()
        });
        this.commandRegistry.registerHandler(EditorCommands.REOPEN_CLOSED_EDITOR.id, {
            execute: () => this.reopenLastClosedEditor()
        });

        this.installMouseNavigationSupport();
    }

    protected async installMouseNavigationSupport(): Promise<void> {
        const mouseNavigationSupport = new DisposableCollection();
        const updateMouseNavigationListener = () => {
            mouseNavigationSupport.dispose();
            if (this.shouldNavigateWithMouse()) {
                mouseNavigationSupport.push(addEventListener(document.body, 'mousedown', event => this.onMouseDown(event), true));
            }
        };
        this.toDispose.push(this.preferenceService.onPreferenceChanged(change => {
            if (change.preferenceName === EditorNavigationContribution.MOUSE_NAVIGATION_PREFERENCE) {
                updateMouseNavigationListener();
            }
        }));
        updateMouseNavigationListener();
        this.toDispose.push(mouseNavigationSupport);
    }

    protected async onMouseDown(event: MouseEvent): Promise<void> {
        // Support navigation in history when mouse buttons 4/5 are pressed
        switch (event.button) {
            case 3:
                event.preventDefault();
                this.locationStack.back();
                break;
            case 4:
                event.preventDefault();
                this.locationStack.forward();
                break;
        }
    }

    /**
     * Reopens the last closed editor with its stored view state if possible from history.
     * If the editor cannot be restored, continue to the next editor in history.
     */
    protected async reopenLastClosedEditor(): Promise<void> {
        const lastClosedEditor = this.locationStack.getLastClosedEditor();
        if (lastClosedEditor === undefined) {
            return;
        }

        try {
            const widget = await this.editorManager.open(lastClosedEditor.uri);
            widget.editor.restoreViewState(lastClosedEditor.viewState);
        } catch {
            this.locationStack.removeClosedEditor(lastClosedEditor.uri);
            this.reopenLastClosedEditor();
        }
    }

    async onStart(): Promise<void> {
        this.restoreState();
    }

    onStop(): void {
        this.storeState();
        this.dispose();
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    /**
     * Toggle the editor word wrap behavior.
     */
    protected async toggleWordWrap(): Promise<void> {
        // Get the current word wrap.
        const wordWrap: string | undefined = this.preferenceService.get('editor.wordWrap');
        if (wordWrap === undefined) {
            return;
        }
        // The list of allowed word wrap values.
        const values: string[] = ['off', 'on', 'wordWrapColumn', 'bounded'];
        // Get the index of the current value, and toggle to the next available value.
        const index = values.indexOf(wordWrap) + 1;
        if (index > -1) {
            await this.preferenceService.set('editor.wordWrap', values[index % values.length], PreferenceScope.User);
        }
    }

    /**
     * Toggle the display of sticky scroll in the editor.
     */
    protected async toggleStickyScroll(): Promise<void> {
        const value: boolean | undefined = this.preferenceService.get('editor.stickyScroll.enabled');
        await this.preferenceService.set('editor.stickyScroll.enabled', !value, PreferenceScope.User);
    }

    /**
     * Toggle the display of minimap in the editor.
     */
    protected async toggleMinimap(): Promise<void> {
        const value: boolean | undefined = this.preferenceService.get('editor.minimap.enabled');
        await this.preferenceService.set('editor.minimap.enabled', !value, PreferenceScope.User);
    }

    /**
     * Toggle the rendering of whitespace in the editor.
     */
    protected async toggleRenderWhitespace(): Promise<void> {
        const renderWhitespace: string | undefined = this.preferenceService.get('editor.renderWhitespace');
        let updatedRenderWhitespace: string;
        if (renderWhitespace === 'none') {
            updatedRenderWhitespace = 'all';
        } else {
            updatedRenderWhitespace = 'none';
        }
        await this.preferenceService.set('editor.renderWhitespace', updatedRenderWhitespace, PreferenceScope.User);
    }

    protected onCurrentEditorChanged(editorWidget: EditorWidget | undefined): void {
        this.toDisposePerCurrentEditor.dispose();
        if (editorWidget) {
            const { editor } = editorWidget;
            this.toDisposePerCurrentEditor.pushAll([
                // Instead of registering an `onCursorPositionChanged` listener, we treat the zero length selection as a cursor position change.
                // Otherwise we would have two events for a single cursor change interaction.
                editor.onSelectionChanged(selection => this.onSelectionChanged(editor, selection)),
                editor.onDocumentContentChanged(event => this.onDocumentContentChanged(editor, event))
            ]);
            this.locationStack.register(NavigationLocation.create(editor, editor.selection));
        }
    }

    protected onCursorPositionChanged(editor: TextEditor, position: Position): void {
        this.locationStack.register(NavigationLocation.create(editor, position));
    }

    protected onSelectionChanged(editor: TextEditor, selection: Range): void {
        if (this.isZeroLengthRange(selection)) {
            this.onCursorPositionChanged(editor, selection.start);
        } else {
            this.locationStack.register(NavigationLocation.create(editor, selection));
        }
    }

    protected onDocumentContentChanged(editor: TextEditor, event: TextDocumentChangeEvent): void {
        if (event.contentChanges.length > 0) {
            this.locationStack.register(NavigationLocation.create(editor, event.contentChanges[0]));
        }
    }

    /**
     * `true` if the `range` argument has zero length. In other words, the `start` and the `end` positions are the same. Otherwise, `false`.
     */
    protected isZeroLengthRange(range: Range): boolean {
        const { start, end } = range;
        return start.line === end.line && start.character === end.character;
    }

    protected async storeState(): Promise<void> {
        this.storageService.setData(EditorNavigationContribution.ID, {
            locations: this.locationStack.locations().map(NavigationLocation.toObject)
        });
        this.storageService.setData(EditorNavigationContribution.CLOSED_EDITORS_KEY, {
            closedEditors: this.shouldStoreClosedEditors() ? this.locationStack.closedEditorsStack.map(RecentlyClosedEditor.toObject) : []
        });
    }

    protected async restoreState(): Promise<void> {
        await this.restoreNavigationLocations();
        await this.restoreClosedEditors();
    }

    protected async restoreNavigationLocations(): Promise<void> {
        const raw: { locations?: ArrayLike<object> } | undefined = await this.storageService.getData(EditorNavigationContribution.ID);
        if (raw && raw.locations) {
            const locations: NavigationLocation[] = [];
            for (let i = 0; i < raw.locations.length; i++) {
                const location = NavigationLocation.fromObject(raw.locations[i]);
                if (location) {
                    locations.push(location);
                } else {
                    this.logger.warn('Could not restore the state of the editor navigation history.');
                    return;
                }
            }
            this.locationStack.register(...locations);
        }
    }

    protected async restoreClosedEditors(): Promise<void> {
        const raw: { closedEditors?: ArrayLike<object> } | undefined = await this.storageService.getData(EditorNavigationContribution.CLOSED_EDITORS_KEY);
        if (raw && raw.closedEditors) {
            for (let i = 0; i < raw.closedEditors.length; i++) {
                const editor = RecentlyClosedEditor.fromObject(raw.closedEditors[i]);
                if (editor) {
                    this.locationStack.addClosedEditor(editor);
                } else {
                    this.logger.warn('Could not restore the state of the closed editors stack.');
                }
            }
        }
    }

    private isMinimapEnabled(): boolean {
        return !!this.preferenceService.get('editor.minimap.enabled');
    }

    private isRenderWhitespaceEnabled(): boolean {
        const renderWhitespace = this.preferenceService.get('editor.renderWhitespace');
        return renderWhitespace === 'none' ? false : true;
    }

    private shouldStoreClosedEditors(): boolean {
        return !!this.preferenceService.get('editor.history.persistClosedEditors');
    }

    private shouldNavigateWithMouse(): boolean {
        return !!this.preferenceService.get(EditorNavigationContribution.MOUSE_NAVIGATION_PREFERENCE);
    }

    private isStickyScrollEnabled(): boolean {
        return !!this.preferenceService.get('editor.stickyScroll.enabled');
    }
}
