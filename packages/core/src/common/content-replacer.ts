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

export interface Replacement {
    oldContent: string;
    newContent: string;
    multiple?: boolean;
}

export class ContentReplacer {
    /**
     * Applies a list of replacements to the original content using a multi-step matching strategy.
     * @param originalContent The original file content.
     * @param replacements Array of Replacement objects.
     * @param allowMultiple If true, all occurrences of each oldContent will be replaced. If false, an error is returned when multiple occurrences are found.
     * @returns An object containing the updated content and any error messages.
     */
    applyReplacements(originalContent: string, replacements: Replacement[]): { updatedContent: string, errors: string[] } {
        let updatedContent = originalContent;
        const errorMessages: string[] = [];

        // Guard against conflicting replacements: if the same oldContent appears with different newContent, return with an error.
        const conflictMap = new Map<string, string>();
        for (const replacement of replacements) {
            if (conflictMap.has(replacement.oldContent) && conflictMap.get(replacement.oldContent) !== replacement.newContent) {
                return { updatedContent: originalContent, errors: [`Conflicting replacement values for: "${replacement.oldContent}"`] };
            }
            conflictMap.set(replacement.oldContent, replacement.newContent);
        }

        replacements.forEach(({ oldContent, newContent, multiple }) => {
            // If the old content is empty, prepend the new content to the beginning of the file (e.g. in new file)
            if (oldContent === '') {
                updatedContent = newContent + updatedContent;
                return;
            }

            let matchIndices = this.findExactMatches(updatedContent, oldContent);

            if (matchIndices.length === 0) {
                matchIndices = this.findLineTrimmedMatches(updatedContent, oldContent);
            }

            if (matchIndices.length === 0) {
                errorMessages.push(`Content to replace not found: "${oldContent}"`);
            } else if (matchIndices.length > 1) {
                if (multiple) {
                    updatedContent = this.replaceContentAll(updatedContent, oldContent, newContent);
                } else {
                    errorMessages.push(`Multiple occurrences found for: "${oldContent}"`);
                }
            } else {
                updatedContent = this.replaceContentOnce(updatedContent, oldContent, newContent);
            }
        });

        return { updatedContent, errors: errorMessages };
    }

    /**
     * Finds all exact matches of a substring within a string.
     * @param content The content to search within.
     * @param search The substring to search for.
     * @returns An array of starting indices where the exact substring is found.
     */
    private findExactMatches(content: string, search: string): number[] {
        const indices: number[] = [];
        let startIndex = 0;

        while ((startIndex = content.indexOf(search, startIndex)) !== -1) {
            indices.push(startIndex);
            startIndex += search.length;
        }

        return indices;
    }

    /**
     * Attempts to find matches by trimming whitespace from lines in the original content and the search string.
     * @param content The original content.
     * @param search The substring to search for, potentially with varying whitespace.
     * @returns An array of starting indices where a trimmed match is found.
     */
    private findLineTrimmedMatches(content: string, search: string): number[] {
        const trimmedSearch = search.trim();
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            if (trimmedLine === trimmedSearch) {
                // Calculate the starting index of this line in the original content
                const startIndex = this.getLineStartIndex(content, i);
                return [startIndex];
            }
        }

        return [];
    }

    /**
     * Calculates the starting index of a specific line number in the content.
     * @param content The original content.
     * @param lineNumber The zero-based line number.
     * @returns The starting index of the specified line.
     */
    private getLineStartIndex(content: string, lineNumber: number): number {
        const lines = content.split('\n');
        let index = 0;
        for (let i = 0; i < lineNumber; i++) {
            index += lines[i].length + 1; // +1 for the newline character
        }
        return index;
    }

    /**
     * Replaces the first occurrence of oldContent with newContent in the content.
     * @param content The original content.
     * @param oldContent The content to be replaced.
     * @param newContent The content to replace with.
     * @returns The content after replacement.
     */
    private replaceContentOnce(content: string, oldContent: string, newContent: string): string {
        const index = content.indexOf(oldContent);
        if (index === -1) { return content; }
        return content.substring(0, index) + newContent + content.substring(index + oldContent.length);
    }

    /**
     * Replaces all occurrences of oldContent with newContent in the content.
     * @param content The original content.
     * @param oldContent The content to be replaced.
     * @param newContent The content to replace with.
     * @returns The content after all replacements.
     */
    private replaceContentAll(content: string, oldContent: string, newContent: string): string {
        return content.split(oldContent).join(newContent);
    }
}
