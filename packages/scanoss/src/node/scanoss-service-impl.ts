// *****************************************************************************
// Copyright (C) 2024 EclipseSource GmbH.
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

import { injectable } from '@theia/core/shared/inversify';
import { ScanOSSResult, ScanOSSService } from '../common';

import { Scanner, ScannerCfg, ScannerComponent } from 'scanoss';

// Define our own type of what is actually returned by the scanner
interface ScanOSSScanner {
    scanContents: <T extends string>(options: { content: string; key: T }) => Promise<{ [K in `/${T}`]: ScannerComponent[] } | null>;
}

// Helper class to perform scans sequentially
class SequentialProcessor<T> {
    private queue: Promise<T> = Promise.resolve() as Promise<T>;
    public async processTask(task: () => Promise<T>): Promise<T> {
        this.queue = this.queue.then(() => task());
        return this.queue;
    }
}

@injectable()
export class ScanOSSServiceImpl implements ScanOSSService {

    private readonly processor = new SequentialProcessor<ScanOSSResult>();

    async scanContent(content: string, apiKey?: string): Promise<ScanOSSResult> {
        return this.processor.processTask(async () => this.doScanContent(content, apiKey));
    }

    async doScanContent(content: string, apiKey?: string): Promise<ScanOSSResult> {
        const config = new ScannerCfg();
        const apiKeyToUse = apiKey || process.env.SCANOSS_API_KEY || undefined;
        if (apiKeyToUse) {
            config.API_KEY = apiKeyToUse;
        }
        const scanner = new Scanner(config);
        let results = undefined;
        try {
            results = await (scanner as unknown as ScanOSSScanner).scanContents({
                content,
                key: 'content_scanning',
            });
        } catch (e) {
            console.debug('SCANOSS error', e);

            // map known errors to a more user-friendly message

            // Invalid API key message
            if (e.message?.includes('Forbidden')) {
                return {
                    type: 'error',
                    message: 'Forbidden: Please check your API key'
                };
            }
            // Rate limit message
            // HTTP:
            // HTTP Status code: 503
            // Server Response:
            // 503 Unavailable. Check https://osskb.org/limit
            if (e.message?.includes('https://osskb.org/limit')) {
                return {
                    type: 'error',
                    message: 'You have reached the limit of the free data subscription, for a commercial subscription please contact support@scanoss.com'
                };
            }
            return {
                type: 'error',
                message: e.message
            };
        }
        if (!results) {
            return {
                type: 'error',
                message: 'Scan request unsuccessful'
            };
        }

        console.debug('SCANOSS results', JSON.stringify(results, undefined, 2));

        let contentScanning: ScannerComponent[] | undefined = results['/content_scanning'];
        if (!contentScanning) {
            // #14648: The scanoss library prefixes the property with the path of a temporary file on Windows, so we need to search for it
            contentScanning = Object.entries(results).find(([key]) => key.endsWith('content_scanning'))?.[1];
        }
        if (!contentScanning || contentScanning.length === 0) {
            return {
                type: 'error',
                message: 'Scan request unsuccessful'
            };
        }

        // first result is the best result
        const firstEntry = contentScanning[0];
        if (firstEntry.id === 'none') {
            return {
                type: 'clean'
            };
        }
        return {
            type: 'match',
            matched: firstEntry.matched,
            url: firstEntry.url,
            raw: firstEntry
        };
    }
}
