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

import { Disposable, SelectionService, Event, UNTITLED_SCHEME, DisposableCollection } from '@theia/core/lib/common';
import { Widget, BaseWidget, Message, Saveable, SaveableSource, Navigatable, StatefulWidget, lock, TabBar, DockPanel, unlock, ExtractableWidget } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { find } from '@theia/core/shared/@lumino/algorithm';
import { TextEditor } from './editor';

export class EditorWidget extends BaseWidget implements SaveableSource, Navigatable, StatefulWidget, ExtractableWidget {

    protected toDisposeOnTabbarChange = new DisposableCollection();
    protected currentTabbar: TabBar<Widget> | undefined;

    constructor(
        readonly editor: TextEditor,
        protected readonly selectionService: SelectionService
    ) {
        super(editor);
        this.addClass('theia-editor');
        if (editor.isReadonly) {
            lock(this.title);
        }
        this.toDispose.push(this.editor);
        this.toDispose.push(this.toDisposeOnTabbarChange);
        this.toDispose.push(this.editor.onSelectionChanged(() => this.setSelection()));
        this.toDispose.push(this.editor.onFocusChanged(() => this.setSelection()));
        this.toDispose.push(this.editor.onDidChangeReadOnly(isReadonly => {
            if (isReadonly) {
                lock(this.title);
            } else {
                unlock(this.title);
            }
        }));
        this.toDispose.push(Disposable.create(() => {
            if (this.selectionService.selection === this.editor) {
                this.selectionService.selection = undefined;
            }
        }));
    }
    isExtractable: boolean = true;
    secondaryWindow: Window | undefined;

    setSelection(): void {
        if (this.editor.isFocused() && this.selectionService.selection !== this.editor) {
            this.selectionService.selection = this.editor;
        }
    }

    protected override handleVisiblityChanged(isNowVisible: boolean): void {
        this.editor.handleVisibilityChanged(isNowVisible);
        super.handleVisiblityChanged(isNowVisible);
    }

    get saveable(): Saveable {
        return this.editor.document;
    }

    getResourceUri(): URI | undefined {
        return this.editor.getResourceUri();
    }
    createMoveToUri(resourceUri: URI): URI | undefined {
        return this.editor.createMoveToUri(resourceUri);
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.editor.focus();
        this.selectionService.selection = this.editor;
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        if (this.isVisible) {
            this.editor.refresh();
        }
        this.checkForTabbarChange();
    }

    protected checkForTabbarChange(): void {
        const { parent } = this;
        if (parent instanceof DockPanel) {
            const newTabbar = find(parent.tabBars(), tabbar => !!tabbar.titles.find(title => title === this.title));
            if (this.currentTabbar !== newTabbar) {
                this.toDisposeOnTabbarChange.dispose();
                const listener = () => this.checkForTabbarChange();
                parent.layoutModified.connect(listener);
                this.toDisposeOnTabbarChange.push(Disposable.create(() => parent.layoutModified.disconnect(listener)));
                const last = this.currentTabbar;
                this.currentTabbar = newTabbar;
                this.handleTabBarChange(last, newTabbar);
            }
        }
    }

    protected handleTabBarChange(oldTabBar?: TabBar<Widget>, newTabBar?: TabBar<Widget>): void {
        const ownSaveable = Saveable.get(this);
        const competingEditors = ownSaveable && newTabBar?.titles.filter(title => title !== this.title
            && (title.owner instanceof EditorWidget)
            && title.owner.editor.uri.isEqual(this.editor.uri)
            && Saveable.get(title.owner) === ownSaveable
        );
        competingEditors?.forEach(title => title.owner.close());
    }

    protected override onAfterShow(msg: Message): void {
        super.onAfterShow(msg);
        this.editor.refresh();
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        if (msg.width < 0 || msg.height < 0) {
            this.editor.resizeToFit();
        } else {
            this.editor.setSize(msg);
        }
    }

    storeState(): object | undefined {
        return this.getResourceUri()?.scheme === UNTITLED_SCHEME ? undefined : this.editor.storeViewState();
    }

    restoreState(oldState: object): void {
        this.editor.restoreViewState(oldState);
    }

    get onDispose(): Event<void> {
        return this.toDispose.onDispose;
    }

}
