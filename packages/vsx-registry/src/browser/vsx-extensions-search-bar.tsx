// *****************************************************************************
// Copyright (C) 2020 TypeFox and others.
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

import * as React from '@theia/core/shared/react';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
import { ReactWidget, Message, codicon } from '@theia/core/lib/browser/widgets';
import { VSXExtensionsSearchModel } from './vsx-extensions-search-model';
import { VSXExtensionsModel } from './vsx-extensions-model';
import { nls } from '@theia/core/lib/common/nls';

@injectable()
export class VSXExtensionsSearchBar extends ReactWidget {

    @inject(VSXExtensionsSearchModel)
    protected readonly searchModel: VSXExtensionsSearchModel;

    @inject(VSXExtensionsModel)
    protected readonly extensionsModel: VSXExtensionsModel;

    @postConstruct()
    protected init(): void {
        this.id = 'vsx-extensions-search-bar';
        this.addClass('theia-vsx-extensions-search-bar');
        this.searchModel.onDidChangeQuery((query: string) => this.updateSearchTerm(query));
    }

    protected input: HTMLInputElement | undefined;

    protected render(): React.ReactNode {
        return <div className='vsx-search-container'>
            <input type='text'
                ref={input => this.input = input || undefined}
                defaultValue={this.searchModel.query}
                spellCheck={false}
                className='theia-input'
                placeholder={nls.localize('theia/vsx-registry/searchPlaceholder', 'Search Extensions in {0}', 'Open VSX Registry')}
                onChange={this.updateQuery}>
            </input>
            {this.renderOptionContainer()}
        </div>;
    }

    protected updateQuery = (e: React.ChangeEvent<HTMLInputElement>) => this.searchModel.query = e.target.value;

    protected updateSearchTerm(term: string): void {
        if (this.input) {
            this.input.value = term;
        }
    }

    protected renderOptionContainer(): React.ReactNode {
        const showVerifiedExtensions = this.renderShowVerifiedExtensions();
        return <div className='option-buttons'>{showVerifiedExtensions}</div>;
    }

    protected renderShowVerifiedExtensions(): React.ReactNode {
        return <span
            className={`${codicon('verified')} option action-label ${this.extensionsModel.onlyShowVerified ? 'enabled' : ''}`}
            title={'Only Show Verified Extensions'} // localize
            onClick={() => this.handleShowVerifiedExtensionsClick()}>
        </span>;
    }

    protected handleShowVerifiedExtensionsClick(): void {
        this.extensionsModel.setOnlyShowVerified(!this.extensionsModel.onlyShowVerified);
        this.update();
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        if (this.input) {
            this.input.focus();
        }
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.update();
    }

}
