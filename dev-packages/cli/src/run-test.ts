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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as net from 'net';
import * as puppeteer from 'puppeteer-core';
import newTestPage, { TestFileOptions } from './test-page';

export interface TestOptions {
    start: () => Promise<net.AddressInfo>
    launch?: puppeteer.PuppeteerLaunchOptions
    files?: Partial<TestFileOptions>
    coverage?: boolean
}

export default async function runTest(options: TestOptions): Promise<void> {
    const { start, launch } = options;
    const exit = !(launch && launch.devtools);

    const testPage = await newTestPage({
        files: options.files,
        matchAppUrl: () => true, // all urls are application urls
        newPage: async () => {
            const browser = await puppeteer.launch(launch);
            // re-use empty tab
            const [tab] = await browser.pages();
            return tab;
        },
        onWillRun: async () => {
            const promises = [];
            if (options.coverage) {
                promises.push(testPage.coverage.startJSCoverage());
                promises.push(testPage.coverage.startCSSCoverage());
            }
            // When launching in non-headless mode (with a UI and dev-tools open), make sure
            // the app has focus, to avoid failures of tests that query the UI's state.
            if (launch && launch.devtools) {
                promises.push(testPage.waitForSelector('#theia-app-shell.lm-Widget.theia-ApplicationShell')
                    .then(e => {
                        // eslint-disable-next-line no-null/no-null
                        if (e !== null) {
                            e.click();
                        }
                    }));
            }

            // Clear application's local storage to avoid reusing previous state
            promises.push(testPage.evaluate(() => localStorage.clear()));
            await Promise.all(promises);
        },
        onDidRun: async failures => {
            if (options.coverage) {
                console.log('collecting test coverage...');
                const [jsCoverage, cssCoverage] = await Promise.all([
                    testPage.coverage.stopJSCoverage(),
                    testPage.coverage.stopCSSCoverage(),
                ]);
                require('puppeteer-to-istanbul').write([...jsCoverage, ...cssCoverage]);
            }
            if (exit) {
                // allow a bit of time to finish printing-out test results
                await new Promise(resolve => setTimeout(resolve, 1000));
                await testPage.close();
                process.exit(failures > 0 ? 1 : 0);
            }
        }
    });
    const { address, port } = await start();
    const url = net.isIPv6(address)
        ? `http://[${address}]:${port}`
        : `http://${address}:${port}`;
    await testPage.goto(url);
    await testPage.bringToFront();
}
