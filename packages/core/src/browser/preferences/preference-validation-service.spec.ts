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

import { Container } from 'inversify';
import { PreferenceValidationService } from './preference-validation-service';
import { PreferenceItem, PreferenceSchemaProvider } from './preference-contribution';
import { PreferenceLanguageOverrideService } from './preference-language-override-service';
import * as assert from 'assert';
import { JSONValue } from '@lumino/coreutils';
import { IJSONSchema, JsonType } from '../../common/json-schema';

/* eslint-disable no-null/no-null */

describe('Preference Validation Service', () => {
    const container = new Container();
    container.bind(PreferenceSchemaProvider).toConstantValue({ getDefaultValue: PreferenceSchemaProvider.prototype.getDefaultValue } as PreferenceSchemaProvider);
    container.bind(PreferenceLanguageOverrideService).toSelf().inSingletonScope();
    const validator = container.resolve(PreferenceValidationService);
    const validateBySchema: (value: JSONValue, schema: PreferenceItem) => JSONValue = validator.validateBySchema.bind(validator, 'dummy');

    describe('should validate strings', () => {
        const expected = 'expected';
        it('good input -> should return the same string', () => {
            const actual = validateBySchema(expected, { type: 'string' });
            assert.strictEqual(actual, expected);
        });
        it('bad input -> should return the default', () => {
            const actual = validateBySchema(3, { type: 'string', default: expected });
            assert.strictEqual(actual, expected);
        });
        it('bad input -> should return string even if default is not a string', () => {
            const actual = validateBySchema(3, { type: 'string', default: 3 });
            assert.strictEqual(typeof actual, 'string');
            assert.strictEqual(actual, '3');
        });
        it('bad input -> should return an empty string if no default', () => {
            const actual = validateBySchema(3, { type: 'string' });
            assert.strictEqual(actual, '');
        });
    });
    describe('should validate numbers', () => {
        const expected = 1.23;
        it('good input -> should return the same number', () => {
            const actual = validateBySchema(expected, { type: 'number' });
            assert.strictEqual(actual, expected);
        });
        it('bad input -> should return the default', () => {
            const actual = validateBySchema('zxy', { type: 'number', default: expected });
            assert.strictEqual(actual, expected);
        });
        it('bad input -> should return a number even if the default is not a number', () => {
            const actual = validateBySchema('zxy', { type: 'number', default: ['fun array'] });
            assert.strictEqual(actual, 0);
        });
        it('bad input -> should return 0 if no default', () => {
            const actual = validateBySchema('zxy', { type: 'number' });
            assert.strictEqual(actual, 0);
        });
        it('should do its best to make a number of a string', () => {
            const actual = validateBySchema(expected.toString(), { type: 'number' });
            assert.strictEqual(actual, expected);
        });
        it('should return the max if input is greater than max', () => {
            const maximum = 50;
            const actual = validateBySchema(100, { type: 'number', maximum });
            assert.strictEqual(actual, maximum);
        });
        it('should return the minimum if input is less than minimum', () => {
            const minimum = 30;
            const actual = validateBySchema(15, { type: 'number', minimum });
            assert.strictEqual(actual, minimum);
        });
    });
    describe('should validate integers', () => {
        const expected = 2;
        it('good input -> should return the same number', () => {
            const actual = validateBySchema(expected, { type: 'integer' });
            assert.strictEqual(actual, expected);
        });
        it('bad input -> should return the default', () => {
            const actual = validateBySchema('zxy', { type: 'integer', default: expected });
            assert.strictEqual(actual, expected);
        });
        it('bad input -> should return 0 if no default', () => {
            const actual = validateBySchema('zxy', { type: 'integer' });
            assert.strictEqual(actual, 0);
        });
        it('should round a non-integer', () => {
            const actual = validateBySchema(1.75, { type: 'integer' });
            assert.strictEqual(actual, expected);
        });
    });
    describe('should validate booleans', () => {
        it('good input -> should return the same value', () => {
            assert.strictEqual(validateBySchema(true, { type: 'boolean' }), true);
            assert.strictEqual(validateBySchema(false, { type: 'boolean' }), false);
        });
        it('bad input -> should return the default', () => {
            const actual = validateBySchema(['not a boolean!'], { type: 'boolean', default: true });
            assert.strictEqual(actual, true);
        });
        it('bad input -> should return false if no default', () => {
            const actual = validateBySchema({ isBoolean: 'no' }, { type: 'boolean' });
            assert.strictEqual(actual, false);
        });
        it('should treat string "true" and "false" as equivalent to booleans', () => {
            assert.strictEqual(validateBySchema('true', { type: 'boolean' }), true);
            assert.strictEqual(validateBySchema('false', { type: 'boolean' }), false);
        });
    });
    describe('should validate null', () => {
        it('should always just return null', () => {
            assert.strictEqual(validateBySchema({ whatever: ['anything'] }, { type: 'null' }), null);
            assert.strictEqual(validateBySchema('not null', { type: 'null' }), null);
            assert.strictEqual(validateBySchema(123, { type: 'null', default: 123 }), null);
        });
    });
    describe('should validate enums', () => {
        const expected = 'expected';
        const defaultValue = 'default';
        const options = [expected, defaultValue, 'other-value'];
        it('good value -> should return same value', () => {
            const actual = validateBySchema(expected, { enum: options });
            assert.strictEqual(actual, expected);
        });
        it('bad value -> should return default value', () => {
            const actual = validateBySchema('not-in-enum', { enum: options, defaultValue });
            assert.strictEqual(actual, defaultValue);
        });
        it('bad value -> should return first value if no default or bad default', () => {
            const noDefault = validateBySchema(['not-in-enum'], { enum: options });
            assert.strictEqual(noDefault, expected);
            const badDefault = validateBySchema({ inEnum: false }, { enum: options, default: 'not-in-enum' });
            assert.strictEqual(badDefault, expected);
        });
    });
    describe('should validate objects', () => {
        it('should reject non object types', () => {
            const schema = { type: 'object' } as const;
            assert.deepStrictEqual(validateBySchema(null, schema), {});
            assert.deepStrictEqual(validateBySchema('null', schema), {});
            assert.deepStrictEqual(validateBySchema(3, schema), {});
        });
        it('should reject objects that are missing required fields', () => {
            const schema: PreferenceItem = { type: 'object', properties: { 'required': { type: 'string' }, 'not-required': { type: 'number' } }, required: ['required'] };
            assert.deepStrictEqual(validateBySchema({ 'not-required': 3 }, schema), {});
            const defaultValue = { required: 'present' };
            assert.deepStrictEqual(validateBySchema({ 'not-required': 3 }, { ...schema, defaultValue }), defaultValue);
        });
        it('should reject objects that have impermissible extra properties', () => {
            const schema: PreferenceItem = { type: 'object', properties: { 'required': { type: 'string' } }, additionalProperties: false };
            assert.deepStrictEqual(validateBySchema({ 'required': 'hello', 'not-required': 3 }, schema), {});
        });
        it('should accept objects with extra properties if extra properties are not forbidden', () => {
            const input = { 'required': 'hello', 'not-forbidden': 3 };
            const schema: PreferenceItem = { type: 'object', properties: { 'required': { type: 'string' } }, additionalProperties: true };
            assert.deepStrictEqual(validateBySchema(input, schema), input);
            assert.deepStrictEqual(validateBySchema(input, { ...schema, additionalProperties: undefined }), input);
        });
        it("should reject objects with properties that violate the property's rules", () => {
            const input = { required: 'not-a-number!' };
            const schema: PreferenceItem = { type: 'object', properties: { required: { type: 'number' } } };
            assert.deepStrictEqual(validateBySchema(input, schema), {});
        });
        it('should reject objects with extra properties that violate the extra property rules', () => {
            const input = { required: 3, 'not-required': 'not-a-number!' };
            const schema: PreferenceItem = { type: 'object', properties: { required: { type: 'number' } }, additionalProperties: { type: 'number' } };
            assert.deepStrictEqual(validateBySchema(input, schema), {});
        });
    });
    describe('should validate arrays', () => {
        const expected = ['one-string', 'two-string'];
        it('good input -> should return same value', () => {
            const actual = validateBySchema(expected, { type: 'array', items: { type: 'string' } });
            assert.deepStrictEqual(actual, expected);
            const augmentedExpected = [3, ...expected, 4];
            const augmentedActual = validateBySchema(augmentedExpected, { type: 'array', items: { type: ['number', 'string'] } });
            assert.deepStrictEqual(augmentedActual, augmentedExpected);
        });
        it('bad input -> should filter out impermissible items', () => {
            const actual = validateBySchema([3, ...expected, []], { type: 'array', items: { type: 'string' } });
            assert.deepStrictEqual(actual, expected);
        });
    });
    describe('should validate tuples', () => {
        const schema: PreferenceItem & { items: IJSONSchema[] } = {
            'type': 'array',
            'items': [{
                'type': 'number',
            },
            {
                'type': 'string',
            }],
        };
        it('good input -> returns same object', () => {
            const expected = [1, 'two'];
            assert.strictEqual(validateBySchema(expected, schema), expected);
        });
        it('bad input -> should use the default if supplied present and valid', () => {
            const defaultValue = [8, 'three'];
            const withDefault = { ...schema, default: defaultValue };
            assert.strictEqual(validateBySchema('not even an array!', withDefault), defaultValue);
            assert.strictEqual(validateBySchema(['first fails', 'second ok'], withDefault), defaultValue);
            assert.strictEqual(validateBySchema([], withDefault), defaultValue);
            assert.strictEqual(validateBySchema([2, ['second fails']], withDefault), defaultValue);
        });
        it('bad input -> in the absence of a default, it should return any good values or the default for each subschema', () => {
            const withSubDefault: PreferenceItem = { ...schema, items: [{ type: 'string', default: 'cool' }, ...schema.items] };
            assert.deepStrictEqual(validateBySchema('not an array', withSubDefault), ['cool', 0, '']);
            assert.deepStrictEqual(validateBySchema([2, 8, null], withSubDefault), ['cool', 8, '']);
        });
        it("bad input -> uses the default, but fixes fields that don't match schema", () => {
            const defaultValue = [8, 8];
            const withDefault = { ...schema, default: defaultValue };
            assert.deepStrictEqual(validateBySchema('something invalid', withDefault), [8, '']);
        });
    });
    describe('should validate type arrays', () => {
        const type: JsonType[] = ['boolean', 'string', 'number'];
        it('good input -> returns same value', () => {
            const goodBoolean = validateBySchema(true, { type });
            assert.strictEqual(goodBoolean, true);
            const goodString = validateBySchema('string', { type });
            assert.strictEqual(goodString, 'string');
            const goodNumber = validateBySchema(1.23, { type });
            assert.strictEqual(goodNumber, 1.23);
        });
        it('bad input -> returns default if default valid', () => {
            const stringDefault = 'default';
            const booleanDefault = true;
            const numberDefault = 100;
            assert.strictEqual(validateBySchema([], { type, default: stringDefault }), stringDefault);
            assert.strictEqual(validateBySchema([], { type, default: booleanDefault }), booleanDefault);
            assert.strictEqual(validateBySchema([], { type, default: numberDefault }), numberDefault);
        });
        it("bad input -> returns first validator's result if no default or bad default", () => {
            assert.strictEqual(validateBySchema([], { type }), false);
            assert.strictEqual(validateBySchema([], { type, default: {} }), false);
        });
    });
    describe('should validate anyOfs', () => {
        const schema: PreferenceItem = { anyOf: [{ type: 'number', minimum: 1 }, { type: 'array', items: { type: 'string' } }], default: 5 };
        it('good input -> returns same value', () => {
            assert.strictEqual(validateBySchema(3, schema), 3);
            const goodArray = ['a string', 'here too'];
            assert.strictEqual(validateBySchema(goodArray, schema), goodArray);
        });
        it('bad input -> returns default if present and valid', () => {
            assert.strictEqual(validateBySchema({}, schema), 5);
        });
        it('bad input -> first validator, if default absent or default ill-formed', () => {
            assert.strictEqual(validateBySchema({}, { ...schema, default: 0 }), 1);
            assert.strictEqual(validateBySchema({}, { ...schema, default: undefined }), 1);
        });
    });
    describe('should validate oneOfs', () => {
        // Between 4 and 6 should be rejected
        const schema: PreferenceItem = { oneOf: [{ type: 'number', minimum: 1, maximum: 6 }, { type: 'number', minimum: 4, maximum: 10 }], default: 8 };
        it('good input -> returns same value', () => {
            assert.strictEqual(validateBySchema(2, schema), 2);
            assert.strictEqual(validateBySchema(7, schema), 7);
        });
        it('bad input -> returns default if present and valid', () => {
            assert.strictEqual(validateBySchema(5, schema), 8);
        });
        it('bad input -> returns value if default absent or invalid.', () => {
            assert.strictEqual(validateBySchema(5, { ...schema, default: undefined }), 5);
        });
    });
    describe('should validate consts', () => {
        const schema: PreferenceItem = { const: { 'the only': 'possible value' }, default: 'ignore-the-default' };
        const goodValue = { 'the only': 'possible value' };
        it('good input -> returns same value', () => {
            assert.strictEqual(validateBySchema(goodValue, schema), goodValue);
        });
        it('bad input -> returns the const value for any other value', () => {
            assert.deepStrictEqual(validateBySchema('literally anything else', schema), goodValue);
            assert.deepStrictEqual(validateBySchema('ignore-the-default', schema), goodValue);
        });
    });
    describe('should maintain triple equality for valid object types', () => {
        const arraySchema: PreferenceItem = { type: 'array', items: { type: 'string' } };
        it('maintains triple equality for arrays', () => {
            const input = ['one-string', 'two-string'];
            assert(validateBySchema(input, arraySchema) === input);
        });
        it('does not maintain triple equality if the array is only partially correct', () => {
            const input = ['one-string', 'two-string', 3];
            assert.notStrictEqual(validateBySchema(input, arraySchema), input);
        });
        it('maintains triple equality for objects', () => {
            const schema: PreferenceItem = {
                'type': 'object',
                properties: {
                    primitive: { type: 'string' },
                    complex: { type: 'object', properties: { nested: { type: 'number' } } }
                }
            };
            const input = { primitive: 'is a string', complex: { nested: 3 } };
            assert(validateBySchema(input, schema) === input);
        });
    });
    it('should return the value if any error occurs', () => {
        let wasCalled = false;
        const originalValidator = validator['validateString'];
        validator['validateString'] = () => {
            wasCalled = true;
            throw new Error('Only a test!');
        };
        const input = { shouldBeValid: false };
        const output = validateBySchema(input, { type: 'string' });
        assert(wasCalled);
        assert(input === output);
        validator['validateString'] = originalValidator;
    });
    it('should return the same object if no validation possible', () => {
        for (const input of ['whatever', { valid: 'hard to say' }, 234, ["no one knows if I'm not", 'so I am']]) {
            assert(validateBySchema(input, {}) === input);
        }
    });
});
