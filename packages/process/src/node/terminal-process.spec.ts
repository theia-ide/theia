// *****************************************************************************
// Copyright (C) 2017 Ericsson and others.
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
import * as chai from 'chai';
import * as process from 'process';
import * as stream from 'stream';
import { createProcessTestContainer } from './test/process-test-container';
import { TerminalProcessFactory } from './terminal-process';
import { IProcessExitEvent } from './process';

/**
 * Globals
 */

const expect = chai.expect;

let terminalProcessFactory: TerminalProcessFactory;

beforeEach(() => {
    terminalProcessFactory = createProcessTestContainer().get<TerminalProcessFactory>(TerminalProcessFactory);
});

describe('TerminalProcess', function (): void {
    this.timeout(20_000);

    it('test exit', async function (): Promise<void> {
        const args = ['--version'];
        const exit = await new Promise<IProcessExitEvent>((resolve, reject) => {
            const proc = terminalProcessFactory({ command: process.execPath, args });
            proc.onExit(resolve);
            proc.onError(reject);
        });

        expect(exit.code).eq(0);
    });

    it('test pipe stream', async function (): Promise<void> {
        const v = await new Promise<string>((resolve, reject) => {
            const args = ['--version'];
            const terminalProcess = terminalProcessFactory({ command: process.execPath, args });
            terminalProcess.onError(reject);
            const outStream = new stream.PassThrough();

            terminalProcess.createOutputStream().pipe(outStream);

            let version = '';
            outStream.on('data', data => {
                version += data.toString();
            });
            /* node-pty is not sending 'end' on the stream as it quits
            only 'exit' is sent on the terminal process.  */
            terminalProcess.onExit(() => {
                resolve(version.trim());
            });
        });

        /* Avoid using equal since terminal characters can be inserted at the end.  */
        expect(v).to.have.string(process.version);
    });

});
