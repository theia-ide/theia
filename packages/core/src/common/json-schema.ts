// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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

import { JSONValue } from '@lumino/coreutils';

export type JsonType = 'string' | 'array' | 'number' | 'integer' | 'object' | 'boolean' | 'null';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// copied from https://github.com/Microsoft/vscode/blob/d4edb9abcc261846cabee6702715fe2914ae42cb/src/vs/base/common/jsonSchema.ts

// Keep tab indent for easier comparison with the original file.
/* eslint-disable @typescript-eslint/indent */

/**
 * extended JSON schema
 */
export interface IJSONSchema {
    id?: string;
    $id?: string;
    $schema?: string;
    type?: JsonType | JsonType[];
    owner?: string;
    group?: string;
    title?: string;
    default?: JSONValue;
    definitions?: IJSONSchemaMap;
    description?: string;
    properties?: IJSONSchemaMap;
    patternProperties?: IJSONSchemaMap;
    additionalProperties?: boolean | IJSONSchema;
    minProperties?: number;
    maxProperties?: number;
    dependencies?: IJSONSchemaMap | { [prop: string]: string[] };
    items?: IJSONSchema | IJSONSchema[];
    prefixItems?: IJSONSchema[];
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    additionalItems?: boolean | IJSONSchema;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean | number;
    exclusiveMaximum?: boolean | number;
    multipleOf?: number;
    required?: string[];
    $ref?: string;
    anyOf?: IJSONSchema[];
    allOf?: IJSONSchema[];
    oneOf?: IJSONSchema[];
    not?: IJSONSchema;
    enum?: JSONValue[];
    format?: string;

    // schema draft 06
    const?: JSONValue;
    contains?: IJSONSchema;
    propertyNames?: IJSONSchema;

    // schema draft 07
    $comment?: string;
    if?: IJSONSchema;
    then?: IJSONSchema;
    else?: IJSONSchema;

    // VSCode extensions
    defaultSnippets?: IJSONSchemaSnippet[]; // VSCode extension
    errorMessage?: string; // VSCode extension
    patternErrorMessage?: string; // VSCode extension
    deprecationMessage?: string; // VSCode extension
    enumItemLabels?: string[]; // VSCode extension
    enumDescriptions?: string[]; // VSCode extension
    markdownEnumDescriptions?: string[]; // VSCode extension
    markdownDescription?: string; // VSCode extension
    doNotSuggest?: boolean; // VSCode extension
    allowComments?: boolean; // VSCode extension
    allowTrailingCommas?: boolean; // VSCode extension
}

export interface IJSONSchemaMap {
    [name: string]: IJSONSchema;
}

export interface IJSONSchemaSnippet {
    label?: string;
    description?: string;
    body?: JSONValue; // a object that will be JSON stringified
    bodyText?: string; // an already stringified JSON object that can contain new lines (\n) and tabs (\t)
}
