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

import { SELECTED_CLASS, Key, Widget } from '@theia/core/lib/browser';
import { ScmService } from '@theia/scm/lib/browser/scm-service';
import URI from '@theia/core/lib/common/uri';
import { LabelProvider } from '@theia/core/lib/browser/label-provider';
import { Message } from '@theia/core/shared/@lumino/messaging';
import { ElementExt } from '@theia/core/shared/@lumino/domutils';
import { inject, injectable } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import * as React from '@theia/core/shared/react';
import { ScmFileChangeLabelProvider } from './scm-file-change-label-provider';
import { ScmFileChangeNode } from './scm-file-change-node';

@injectable()
export abstract class ScmNavigableListWidget<T extends { selected?: boolean }> extends ReactWidget {

    protected scmNodes: T[] = [];
    private _scrollContainer: string;

    @inject(ScmService) protected readonly scmService: ScmService;
    @inject(LabelProvider) protected readonly labelProvider: LabelProvider;
    @inject(ScmFileChangeLabelProvider) protected readonly scmLabelProvider: ScmFileChangeLabelProvider;

    constructor() {
        super();
        this.node.tabIndex = 0;
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.update();
        this.node.focus();
    }

    protected set scrollContainer(id: string) {
        this._scrollContainer = id + Date.now();
    }

    protected get scrollContainer(): string {
        return this._scrollContainer;
    }

    protected override onUpdateRequest(msg: Message): void {
        if (!this.isAttached || !this.isVisible) {
            return;
        }
        super.onUpdateRequest(msg);
        (async () => {
            const selected = this.node.getElementsByClassName(SELECTED_CLASS)[0];
            if (selected) {
                const container = document.getElementById(this.scrollContainer);
                if (container) {
                    ElementExt.scrollIntoViewIfNeeded(container, selected);
                }
            }
        })();
    }

    protected override onResize(msg: Widget.ResizeMessage): void {
        super.onResize(msg);
        this.update();
    }

    protected getRepositoryLabel(uri: string): string | undefined {
        const repository = this.scmService.findRepository(new URI(uri));
        const isSelectedRepo = this.scmService.selectedRepository && repository && this.scmService.selectedRepository.provider.rootUri === repository.provider.rootUri;
        return repository && !isSelectedRepo ? this.labelProvider.getLongName(new URI(repository.provider.rootUri)) : undefined;
    }

    protected renderHeaderRow({ name, value, classNames, title }: { name: string, value: React.ReactNode, classNames?: string[], title?: string }): React.ReactNode {
        if (!value) {
            return;
        }
        const className = ['header-row', ...(classNames || [])].join(' ');
        return <div key={name} className={className} title={title}>
            <div className='theia-header'>{name}</div>
            <div className='header-value'>{value}</div>
        </div>;
    }

    protected addListNavigationKeyListeners(container: HTMLElement): void {
        this.addKeyListener(container, Key.ARROW_LEFT, () => this.navigateLeft());
        this.addKeyListener(container, Key.ARROW_RIGHT, () => this.navigateRight());
        this.addKeyListener(container, Key.ARROW_UP, () => this.navigateUp());
        this.addKeyListener(container, Key.ARROW_DOWN, () => this.navigateDown());
        this.addKeyListener(container, Key.ENTER, () => this.handleListEnter());
    }

    protected navigateLeft(): void {
        this.selectPreviousNode();
    }

    protected navigateRight(): void {
        this.selectNextNode();
    }

    protected navigateUp(): void {
        this.selectPreviousNode();
    }

    protected navigateDown(): void {
        this.selectNextNode();
    }

    protected handleListEnter(): void {

    }

    protected getSelected(): T | undefined {
        return this.scmNodes ? this.scmNodes.find(c => c.selected || false) : undefined;
    }

    protected selectNode(node: T): void {
        const n = this.getSelected();
        if (n) {
            n.selected = false;
        }
        node.selected = true;
        this.update();
    }

    protected selectNextNode(): void {
        const idx = this.indexOfSelected;
        if (idx >= 0 && idx < this.scmNodes.length - 1) {
            this.selectNode(this.scmNodes[idx + 1]);
        } else if (this.scmNodes.length > 0 && idx === -1) {
            this.selectNode(this.scmNodes[0]);
        }
    }

    protected selectPreviousNode(): void {
        const idx = this.indexOfSelected;
        if (idx > 0) {
            this.selectNode(this.scmNodes[idx - 1]);
        }
    }

    protected get indexOfSelected(): number {
        if (this.scmNodes && this.scmNodes.length > 0) {
            return this.scmNodes.findIndex(c => c.selected || false);
        }
        return -1;
    }
}

export namespace ScmItemComponent {
    export interface Props {
        labelProvider: LabelProvider;
        scmLabelProvider: ScmFileChangeLabelProvider;
        change: ScmFileChangeNode;
        revealChange: (change: ScmFileChangeNode) => void
        selectNode: (change: ScmFileChangeNode) => void
    }
}
export class ScmItemComponent extends React.Component<ScmItemComponent.Props> {

    override render(): JSX.Element {
        const { labelProvider, scmLabelProvider, change } = this.props;
        const icon = labelProvider.getIcon(change);
        const label = labelProvider.getName(change);
        const description = labelProvider.getLongName(change);
        const caption = scmLabelProvider.getCaption(change);
        const statusCaption = scmLabelProvider.getStatusCaption(change);
        return <div className={`scmItem noselect${change.selected ? ' ' + SELECTED_CLASS : ''}`}
            onDoubleClick={this.revealChange}
            onClick={this.selectNode}>
            <span className={icon + ' file-icon'}></span>
            <div className='noWrapInfo' title={caption} >
                <span className='name'>{label + ' '}</span>
                <span className='path'>{description}</span>
            </div>
            <div
                title={caption}
                className={change.fileChange.getClassNameForStatus()}>
                {statusCaption.charAt(0)}
            </div>
        </div>;
    }

    protected readonly revealChange = () => this.props.revealChange(this.props.change);
    protected readonly selectNode = () => this.props.selectNode(this.props.change);
}
