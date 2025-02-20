// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
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

import { environment, MessageService, nls } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { Navigatable, Saveable, SaveableSource, SaveOptions, Widget, open, OpenerService, ConfirmDialog, CommonCommands, LabelProvider } from '@theia/core/lib/browser';
import { SaveableService } from '@theia/core/lib/browser/saveable-service';
import URI from '@theia/core/lib/common/uri';
import { FileService } from './file-service';
import { FileDialogService } from './file-dialog';
import { BinaryBuffer } from '@theia/core/lib/common/buffer';

@injectable()
export class FilesystemSaveableService extends SaveableService {

    @inject(MessageService)
    protected readonly messageService: MessageService;
    @inject(FileService)
    protected readonly fileService: FileService;
    @inject(FileDialogService)
    protected readonly fileDialogService: FileDialogService;
    @inject(OpenerService)
    protected readonly openerService: OpenerService;
    @inject(LabelProvider)
    protected readonly labelProvider: LabelProvider;

    /**
     * This method ensures a few things about `widget`:
     * - `widget.getResourceUri()` actually returns a URI.
     * - `widget.saveable.createSnapshot` or `widget.saveable.serialize` is defined.
     * - `widget.saveable.revert` is defined.
     */
    override canSaveAs(widget: Widget | undefined): widget is Widget & SaveableSource & Navigatable {
        return widget !== undefined
            && Saveable.isSource(widget)
            && (typeof widget.saveable.createSnapshot === 'function' || typeof widget.saveable.serialize === 'function' || typeof widget.saveable.saveAs === 'function')
            && typeof widget.saveable.revert === 'function'
            && Navigatable.is(widget)
            && widget.getResourceUri() !== undefined;
    }

    /**
     * Save `sourceWidget` to a new file picked by the user.
     */
    override async saveAs(sourceWidget: Widget & SaveableSource & Navigatable, options?: SaveOptions): Promise<URI | undefined> {
        let exist: boolean = false;
        let overwrite: boolean = false;
        let selected: URI | undefined;
        const canSave = this.canSaveNotSaveAs(sourceWidget);
        const uri: URI = sourceWidget.getResourceUri()!;
        do {
            selected = await this.fileDialogService.showSaveDialog(
                {
                    title: CommonCommands.SAVE_AS.label!,
                    filters: {},
                    inputValue: uri.path.base
                });
            if (selected) {
                exist = await this.fileService.exists(selected);
                if (exist) {
                    overwrite = await this.confirmOverwrite(selected);
                }
            }
        } while ((selected && exist && !overwrite) || (selected?.isEqual(uri) && !canSave));
        if (selected && selected.isEqual(uri)) {
            return this.save(sourceWidget, options);
        } else if (selected) {
            try {
                await this.saveSnapshot(sourceWidget, selected, overwrite);
                return selected;
            } catch (e) {
                console.warn(e);
            }
        }
    }

    /**
     * Saves the current snapshot of the {@link sourceWidget} to the target file
     * and replaces the widget with a new one that contains the snapshot content
     *
     * @param sourceWidget widget to save as `target`.
     * @param target The new URI for the widget.
     * @param overwrite
     */
    protected async saveSnapshot(sourceWidget: Widget & SaveableSource & Navigatable, target: URI, overwrite: boolean): Promise<void> {
        const saveable = sourceWidget.saveable;
        if (saveable.saveAs) {
            // Some widgets have their own "Save As" implementation, such as the custom plugin editors
            await saveable.saveAs({
                target
            });
        } else {
            // Most other editors simply allow us to serialize the content and write it to the target file.
            let buffer: BinaryBuffer;
            if (saveable.serialize) {
                buffer = await saveable.serialize();
            } else if (saveable.createSnapshot) {
                const snapshot = saveable.createSnapshot();
                const content = Saveable.Snapshot.read(snapshot) ?? '';
                buffer = BinaryBuffer.fromString(content);
            } else {
                throw new Error('Cannot save the widget as the saveable does not provide a snapshot or a serialize method.');
            }
            if (await this.fileService.exists(target)) {
                // Do not fire the `onDidCreate` event as the file already exists.
                await this.fileService.writeFile(target, buffer);
            } else {
                // Ensure to actually call `create` as that fires the `onDidCreate` event.
                await this.fileService.createFile(target, buffer, { overwrite });
            }
        }
        await saveable.revert!();
        await open(this.openerService, target, { widgetOptions: { ref: sourceWidget, mode: 'tab-replace' } });
    }

    async confirmOverwrite(uri: URI): Promise<boolean> {
        // Electron already handles the confirmation so do not prompt again.
        if (this.isElectron()) {
            return true;
        }
        // Prompt users for confirmation before overwriting.
        const confirmed = await new ConfirmDialog({
            title: nls.localizeByDefault('Overwrite'),
            msg: nls.localizeByDefault('{0} already exists. Are you sure you want to overwrite it?', this.labelProvider.getName(uri))
        }).open();
        return !!confirmed;
    }

    private isElectron(): boolean {
        return environment.electron.is();
    }
}
