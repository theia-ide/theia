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
// **

import { expect } from 'chai';
import { ContentReplacer, Replacement } from './content-replacer';

describe('ContentReplacer', () => {
    let contentReplacer: ContentReplacer;

    before(() => {
        contentReplacer = new ContentReplacer();
    });

    it('should replace content when oldContent matches exactly', () => {
        const originalContent = 'Hello World!';
        const replacements: Replacement[] = [
            { oldContent: 'World', newContent: 'Universe' }
        ];
        const expectedContent = 'Hello Universe!';
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(expectedContent);
        expect(result.errors).to.be.empty;
    });

    it('should replace content when oldContent matches after trimming lines', () => {
        const originalContent = 'Line one\n   Line two   \nLine three';
        const replacements: Replacement[] = [
            { oldContent: 'Line two', newContent: 'Second Line' }
        ];
        const expectedContent = 'Line one\n   Second Line   \nLine three';
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(expectedContent);
        expect(result.errors).to.be.empty;
    });

    it('should return an error when oldContent is not found', () => {
        const originalContent = 'Sample content';
        const replacements: Replacement[] = [
            { oldContent: 'Nonexistent', newContent: 'Replacement' }
        ];
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(originalContent);
        expect(result.errors).to.include('Content to replace not found: "Nonexistent"');
    });

    it('should return an error when oldContent has multiple occurrences', () => {
        const originalContent = 'Repeat Repeat Repeat';
        const replacements: Replacement[] = [
            { oldContent: 'Repeat', newContent: 'Once' }
        ];
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(originalContent);
        expect(result.errors).to.include('Multiple occurrences found for: "Repeat"');
    });

    it('should prepend newContent when oldContent is an empty string', () => {
        const originalContent = 'Existing content';
        const replacements: Replacement[] = [
            { oldContent: '', newContent: 'Prepended content\n' }
        ];
        const expectedContent = 'Prepended content\nExisting content';
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(expectedContent);
        expect(result.errors).to.be.empty;
    });

    it('should handle multiple replacements correctly', () => {
        const originalContent = 'Foo Bar Baz';
        const replacements: Replacement[] = [
            { oldContent: 'Foo', newContent: 'FooModified' },
            { oldContent: 'Bar', newContent: 'BarModified' },
            { oldContent: 'Baz', newContent: 'BazModified' }
        ];
        const expectedContent = 'FooModified BarModified BazModified';
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(expectedContent);
        expect(result.errors).to.be.empty;
    });

    it('should replace all occurrences when mutiple is true', () => {
        const originalContent = 'Repeat Repeat Repeat';
        const replacements: Replacement[] = [
            { oldContent: 'Repeat', newContent: 'Once', multiple: true }
        ];
        const expectedContent = 'Once Once Once';
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(expectedContent);
        expect(result.errors).to.be.empty;
    });

    it('should return an error when mutiple is false and multiple occurrences are found', () => {
        const originalContent = 'Repeat Repeat Repeat';
        const replacements: Replacement[] = [
            { oldContent: 'Repeat', newContent: 'Once', multiple: false }
        ];
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(originalContent);
        expect(result.errors).to.include('Multiple occurrences found for: "Repeat"');
    });

    it('should return an error when conflicting replacements for the same oldContent are provided', () => {
        const originalContent = 'Conflict test content';
        const replacements: Replacement[] = [
            { oldContent: 'test', newContent: 'test1' },
            { oldContent: 'test', newContent: 'test2' }
        ];
        const result = contentReplacer.applyReplacements(originalContent, replacements);
        expect(result.updatedContent).to.equal(originalContent);
        expect(result.errors).to.include('Conflicting replacement values for: "test"');
    });
});
