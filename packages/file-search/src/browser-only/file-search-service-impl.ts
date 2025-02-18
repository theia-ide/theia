// *****************************************************************************
// Copyright (C) 2025 robertjndw, TypeFox
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

import { injectable, inject, named } from '@theia/core/shared/inversify';
import { FileSearchService, WHITESPACE_QUERY_SEPARATOR } from '../common/file-search-service';
import { FileSystemProvider, FileType } from '@theia/filesystem/lib/common/files';
import { CancellationTokenSource, CancellationToken, ILogger, URI } from '@theia/core';
import { minimatch } from 'minimatch';

@injectable()
export class FileSearchServiceImpl implements FileSearchService {
    constructor(
        @inject(ILogger) @named('file-search')
        protected logger: ILogger,
        @inject(FileSystemProvider)
        protected readonly fileSystemProvider: FileSystemProvider
    ) { }

    async find(
        searchPattern: string,
        options: FileSearchService.Options,
        clientToken?: CancellationToken
    ): Promise<string[]> {
        const cancellationSource = new CancellationTokenSource();
        if (clientToken) {
            clientToken.onCancellationRequested(() => cancellationSource.cancel());
        }
        const token = cancellationSource.token;

        const opts = {
            fuzzyMatch: true,
            limit: Number.MAX_SAFE_INTEGER,
            useGitIgnore: true,
            ...options
        };

        const roots: FileSearchService.RootOptions = options.rootOptions || {};
        if (options.rootUris) {
            for (const rootUri of options.rootUris) {
                if (!roots[rootUri]) {
                    roots[rootUri] = {};
                }
            }
        }

        const exactMatches = new Set<string>();
        const fuzzyMatches = new Set<string>();

        const patterns = searchPattern.toLowerCase().trim().split(WHITESPACE_QUERY_SEPARATOR);

        await Promise.all(
            Object.keys(roots).map(async root => {
                try {
                    const rootUri = new URI(root);
                    await this.doFind(rootUri, opts, candidate => {
                        const candidatePattern = candidate.toLowerCase();
                        const patternExists = patterns.every(pattern => candidatePattern.includes(pattern));

                        if (!searchPattern || searchPattern === '*') {
                            exactMatches.add(candidate);
                        } else if (patternExists) {
                            exactMatches.add(candidate);
                        } else if (opts.fuzzyMatch && this.isFuzzyMatch(patterns, candidatePattern)) {
                            fuzzyMatches.add(candidate);
                        }

                        // Stop early if we hit the limit
                        if (exactMatches.size >= opts.limit) {
                            cancellationSource.cancel();
                        }
                    }, token);
                } catch (e) {
                    this.logger.error('Failed to search:', root, e);
                }
            })
        );

        if (clientToken?.isCancellationRequested) {
            return [];
        }
        return [...exactMatches, ...fuzzyMatches].slice(0, opts.limit);
    }

    protected async doFind(
        rootUri: URI,
        options: FileSearchService.BaseOptions,
        accept: (fileUri: string) => void,
        token: CancellationToken
    ): Promise<void> {
        try {
            const queue: URI[] = [rootUri];

            while (queue.length > 0) {
                if (token.isCancellationRequested) { return; }

                const currentUri = queue.shift()!;
                try {
                    const entries = await this.fileSystemProvider.readdir(currentUri);

                    for (const [name, type] of entries) {
                        if (token.isCancellationRequested) { return; }

                        const entryUri = currentUri.resolve(name);
                        if (type === FileType.Directory) {
                            queue.push(entryUri); // Add directories for recursive search
                        } else {
                            if (this.matchesFilters(entryUri, options)) {
                                accept(entryUri.toString());
                            }
                        }
                    }
                } catch (e) {
                    this.logger.error(`Error reading directory: ${currentUri.toString()}`, e);
                }
            }
        } catch (e) {
            this.logger.error(`Error searching in: ${rootUri.toString()}`, e);
        }
    }

    private matchesFilters(uri: URI, options: FileSearchService.BaseOptions): boolean {
        const path = uri.path.toString();

        if (options.excludePatterns) {
            for (const exclude of options.excludePatterns) {
                if (minimatch(path, exclude)) {
                    return false;
                }
            }
        }

        if (options.includePatterns && options.includePatterns.length > 0) {
            return options.includePatterns.some(include => minimatch(path, include));
        }

        return true; // By default all files are valid
    }

    private isFuzzyMatch(patterns: string[], text: string): boolean {
        return patterns.every(pattern => minimatch(text, `*${pattern}*`, { nocase: true }));
    }
}
