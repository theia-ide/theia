// *****************************************************************************
// Copyright (C) 2025 EclipseSource GmbH.
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

import { DisposableCollection, Emitter, URI } from '@theia/core';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { Replacement } from '@theia/core/lib/common/content-replacer';
import { ChangeSetElement, ChangeSetImpl } from '../common';
import { ChangeSetFileResourceResolver, createChangeSetFileUri, UpdatableReferenceResource } from './change-set-file-resource';
import { ChangeSetFileService } from './change-set-file-service';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { ConfirmDialog } from '@theia/core/lib/browser';

export const ChangeSetFileElementFactory = Symbol('ChangeSetFileElementFactory');
export type ChangeSetFileElementFactory = (elementProps: ChangeSetElementArgs) => ChangeSetFileElement;
type ChangeSetElementState = ChangeSetElement['state'];

export const ChangeSetElementArgs = Symbol('ChangeSetElementArgs');
export interface ChangeSetElementArgs extends Partial<ChangeSetElement> {
    /** The URI of the element, expected to be unique within the same change set. */
    uri: URI;
    /** The change set containing this element. */
    changeSet: ChangeSetImpl;
    /** The id of the chat session containing this change set element. */
    chatSessionId: string;
    /**
     * The state of the file after the changes have been applied.
     * If `undefined`, there is no change.
     */
    targetState?: string;
    /**
     * An array of replacements used to create the new content for the targetState.
     * This is only available if the agent was able to provide replacements and we were able to apply them.
     */
    replacements?: Replacement[];
};

@injectable()
export class ChangeSetFileElement implements ChangeSetElement {

    static toReadOnlyUri(baseUri: URI, sessionId: string): URI {
        return baseUri.withScheme('change-set-immutable').withAuthority(sessionId);
    }

    @inject(ChangeSetElementArgs)
    protected readonly elementProps: ChangeSetElementArgs;

    @inject(ChangeSetFileService)
    protected readonly changeSetFileService: ChangeSetFileService;

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(ChangeSetFileResourceResolver)
    protected readonly resourceResolver: ChangeSetFileResourceResolver;

    protected readonly toDispose = new DisposableCollection();
    protected _state: ChangeSetElementState;

    protected originalContent: string | undefined;

    protected readonly onDidChangeEmitter = new Emitter<void>();
    readonly onDidChange = this.onDidChangeEmitter.event;
    protected readOnlyResource: UpdatableReferenceResource;
    protected changeResource: UpdatableReferenceResource;

    @postConstruct()
    init(): void {
        this.getResources();
        this.obtainOriginalContent();
        this.listenForOriginalFileChanges();
        this.toDispose.push(this.onDidChangeEmitter);
    }

    protected async obtainOriginalContent(): Promise<void> {
        this.originalContent = await this.changeSetFileService.read(this.uri);
        this.readOnlyResource.update({ contents: this.originalContent ?? '' });
        if (this.state === 'applied') {

        }
    }

    protected getResources(): void {
        this.readOnlyResource = this.resourceResolver.tryGet(this.readOnlyUri) ?? this.resourceResolver.add(this.readOnlyUri, { autosaveable: false, readOnly: true });
        let changed = this.resourceResolver.tryGet(this.changedUri);
        if (changed) {
            changed.update({ contents: this.targetState, onSave: content => this.writeChanges(content) });
        } else {
            changed = this.resourceResolver.add(this.changedUri, { contents: this.targetState, onSave: content => this.writeChanges(content), autosaveable: false });
        }
        this.changeResource = changed;
        this.toDispose.pushAll([this.readOnlyResource, this.changeResource]);
    }

    protected listenForOriginalFileChanges(): void {
        this.toDispose.push(this.fileService.onDidFilesChange(async event => {
            if (!event.contains(this.uri)) { return; }
            // If we are applied, the tricky thing becomes the question what to revert to; otherwise, what to apply.
            const newContent = await this.changeSetFileService.read(this.uri).catch(() => '');
            this.readOnlyResource.update({ contents: newContent });
            if (newContent === this.originalContent) {
                this.state = 'pending';
            } else if (newContent === this.targetState) {
                this.state = 'applied';
            } else {
                this.state = 'stale';
            }
        }));
    }

    get uri(): URI {
        return this.elementProps.uri;
    }

    get readOnlyUri(): URI {
        return ChangeSetFileElement.toReadOnlyUri(this.uri, this.elementProps.chatSessionId);
    }

    get changedUri(): URI {
        return createChangeSetFileUri(this.elementProps.chatSessionId, this.uri);
    }

    get name(): string {
        return this.elementProps.name ?? this.changeSetFileService.getName(this.uri);
    }

    get icon(): string | undefined {
        return this.elementProps.icon ?? this.changeSetFileService.getIcon(this.uri);
    }

    get additionalInfo(): string | undefined {
        return this.changeSetFileService.getAdditionalInfo(this.uri);
    }

    get state(): ChangeSetElementState {
        return this._state ?? this.elementProps.state;
    }

    protected set state(value: ChangeSetElementState) {
        if (this._state !== value) {
            this._state = value;
            this.onDidChangeEmitter.fire();
        }
    }

    get replacements(): Replacement[] | undefined {
        return this.elementProps.replacements;
    }

    get type(): 'add' | 'modify' | 'delete' | undefined {
        return this.elementProps.type;
    }

    get data(): { [key: string]: unknown; } | undefined {
        return this.elementProps.data;
    };

    get targetState(): string {
        return this.elementProps.targetState ?? '';
    }

    async open(): Promise<void> {
        this.changeSetFileService.open(this);
    }

    async openChange(): Promise<void> {
        this.changeSetFileService.openDiff(
            this.readOnlyUri,
            this.changedUri
        );
    }

    async apply(contents?: string): Promise<void> {
        if (!await this.confirm('Apply')) { return; }
        if (!(await this.changeSetFileService.trySave(this.changedUri))) {
            if (this.type === 'delete') {
                await this.changeSetFileService.delete(this.uri);
                this.state = 'applied';
            } else {
                await this.writeChanges(contents);
            }
        }
        this.changeSetFileService.closeDiff(this.readOnlyUri);
    }

    async writeChanges(contents?: string): Promise<void> {
        await this.changeSetFileService.writeFrom(this.changedUri, this.uri, contents ?? this.targetState);
        this.state = 'applied';
    }

    async revert(): Promise<void> {
        if (!await this.confirm('Revert')) { return; }
        this.state = 'pending';
        if (this.type === 'add') {
            await this.changeSetFileService.delete(this.uri);
        } else if (this.originalContent) {
            await this.changeSetFileService.write(this.uri, this.originalContent);
        }
    }

    async confirm(verb: string): Promise<boolean> {
        if (this._state !== 'stale') { return true; }
        await this.openChange();
        const thing = await new ConfirmDialog({
            title: `${verb} suggestion.`,
            msg: `The file ${this.uri.path.toString()} has changed since this suggestion was created. Are you certain you wish to ${verb.toLowerCase()} the change?`
        }).open(true);
        return !!thing;
    }

    dispose(): void {
        this.toDispose.dispose();
    }
}
