/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject } from 'inversify';
import { MarkerManager } from '../marker-manager';
import { PROBLEM_KIND } from '../../common/problem-marker';
import { Marker } from '../../common/marker';
import { StorageService } from '@theia/core/lib/browser/storage-service';
import { FileSystemWatcher } from '@theia/filesystem/lib/browser/filesystem-watcher';
import URI from '@theia/core/lib/common/uri';
import { Diagnostic } from "vscode-languageserver-types";

export interface ProblemStat {
    errors: number;
    warnings: number;
}

@injectable()
export class ProblemManager extends MarkerManager<Diagnostic> {

    public getKind() {
        return PROBLEM_KIND;
    }

    constructor(
        @inject(StorageService) storageService: StorageService,
        @inject(FileSystemWatcher) protected fileWatcher?: FileSystemWatcher) {
        super(storageService, fileWatcher);
    }

    getProblemStat(): ProblemStat {
        const allMarkers: Marker<Diagnostic>[] = [];
        for (const uri of this.getUris()) {
            allMarkers.push(...this.findMarkers({ uri: new URI(uri) }));
        }

        const errors = allMarkers.filter(m => m.data.severity === 1).length;
        const warnings = allMarkers.filter(m => m.data.severity === 2).length;

        return { errors, warnings };
    }

}
