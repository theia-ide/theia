// *****************************************************************************
// Copyright (C) 2021 logi.cals GmbH, EclipseSource and others.
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
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import { sep } from 'path';
import * as path from 'path';

export class TheiaWorkspace {

    protected workspacePath: string;

    /**
     * Creates a Theia workspace location with the specified path to files that shall be copied to this workspace.
     * The `pathOfFilesToInitialize` must be relative to cwd of the node process.
     *
     * @param {string[]} pathOfFilesToInitialize Path to files or folders that shall be copied to the workspace
     */
    constructor(protected pathOfFilesToInitialize?: string[]) {
        this.workspacePath = fs.mkdtempSync(`${tmpdir}${sep}cloud-ws-`);
    }

    /** Performs the file system operations preparing the workspace location synchronously. */
    initialize(): void {
        if (this.pathOfFilesToInitialize) {
            for (const initPath of this.pathOfFilesToInitialize) {
                const absoluteInitPath = path.resolve(process.cwd(), initPath);
                if (!fs.pathExistsSync(absoluteInitPath)) {
                    throw Error('Workspace does not exist at ' + absoluteInitPath);
                }
                fs.copySync(absoluteInitPath, this.workspacePath);
            }
        }
    }

    get path(): string {
        return this.workspacePath;
    }

    get urlEncodedPath(): string {
        return this.path.replace(/[\\]/g, '/');
    }

    get escapedPath(): string {
        return this.path.replace(/:/g, '%3A').replace(/[\\]/g, '%5C');
    }

    clear(): void {
        fs.emptyDirSync(this.workspacePath);
    }

}
