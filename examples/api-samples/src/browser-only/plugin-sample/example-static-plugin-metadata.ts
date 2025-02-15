// *****************************************************************************
// Copyright (C) 2023 EclipseSource and others.
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
// ****************************************************************************

export const staticMetadata: any[] = [
  {
    metadata: {
      host: 'main',
      model: {
        packagePath: '/home/user/theia/examples/browser-only/plugins/vscode.typescript-language-features/extension',
        packageUri: 'file:///home/user/theia/examples/browser-only/plugins/vscode.typescript-language-features',
        id: 'vscode.typescript-language-features',
        name: 'typescript-language-features',
        publisher: 'vscode',
        version: '1.95.3',
        displayName: 'TypeScript and JavaScript Language Features (built-in)',
        description: 'Provides rich language support for JavaScript and TypeScript.',
        engine: {
          type: 'vscode',
          version: '^1.30.0',
        },
        entryPoint: {
          frontend: './dist/browser/extension.js',
        },
        iconUrl: 'hostedPlugin/vscode_typescript_language_features/media%2Ficon.png',
        l10n: undefined,
        readmeUrl: 'hostedPlugin/vscode_typescript_language_features/.%2FREADME.md',
        licenseUrl: 'hostedPlugin/vscode_typescript_language_features/.%2FLICENSE',
      },
      lifecycle: {
        startMethod: 'activate',
        stopMethod: 'deactivate',
        frontendModuleName: 'vscode_typescript_language_features',
        frontendInitPath: 'plugin-vscode-init-fe.js',
      },
      outOfSync: false,
      isUnderDevelopment: false,
    },
    type: 0,
    contributes: {
      activationEvents: [
        'onLanguage:javascript',
        'onLanguage:javascriptreact',
        'onLanguage:typescript',
        'onLanguage:typescriptreact',
        'onLanguage:jsx-tags',
        'onCommand:typescript.tsserverRequest',
        'onCommand:_typescript.configurePlugin',
        'onCommand:_typescript.learnMoreAboutRefactorings',
        'onCommand:typescript.fileReferences',
        'onTaskType:typescript',
        'onLanguage:jsonc',
        'onWalkthrough:nodejsWelcome',
        'onCommand:typescript.reloadProjects',
        'onCommand:javascript.reloadProjects',
        'onCommand:typescript.selectTypeScriptVersion',
        'onCommand:typescript.goToProjectConfig',
        'onCommand:javascript.goToProjectConfig',
        'onCommand:typescript.openTsServerLog',
        'onCommand:typescript.restartTsServer',
        'onCommand:typescript.findAllFileReferences',
        'onCommand:typescript.goToSourceDefinition',
        'onCommand:typescript.sortImports',
        'onCommand:javascript.sortImports',
        'onCommand:typescript.removeUnusedImports',
        'onCommand:javascript.removeUnusedImports',
      ],
      configuration: [
        {
          type: 'object',
          title: 'TypeScript',
          order: 20,
          properties: {
            'typescript.tsdk': {
              type: 'string',
              markdownDescription: 'Specifies the folder path to the tsserver and `lib*.d.ts` files under a TypeScript install to use for IntelliSense, for example: `./node_modules/typescript/lib`.\n\n- When specified as a user setting, the TypeScript version from `typescript.tsdk` automatically replaces the built-in TypeScript version.\n- When specified as a workspace setting, `typescript.tsdk` allows you to switch to use that workspace version of TypeScript for IntelliSense with the `TypeScript: Select TypeScript version` command.\n\nSee the [TypeScript documentation](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-newer-typescript-versions) for more detail about managing TypeScript versions.',
              scope: 'window',
            },
            'typescript.disableAutomaticTypeAcquisition': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Disables [automatic type acquisition](https://code.visualstudio.com/docs/nodejs/working-with-javascript#_typings-and-automatic-type-acquisition). Automatic type acquisition fetches `@types` packages from npm to improve IntelliSense for external libraries.',
              scope: 'window',
              tags: [
                'usesOnlineServices',
              ],
            },
            'typescript.enablePromptUseWorkspaceTsdk': {
              type: 'boolean',
              default: false,
              description: 'Enables prompting of users to use the TypeScript version configured in the workspace for Intellisense.',
              scope: 'window',
            },
            'typescript.npm': {
              type: 'string',
              markdownDescription: 'Specifies the path to the npm executable used for [Automatic Type Acquisition](https://code.visualstudio.com/docs/nodejs/working-with-javascript#_typings-and-automatic-type-acquisition).',
              scope: 'machine',
            },
            'typescript.check.npmIsInstalled': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Check if npm is installed for [Automatic Type Acquisition](https://code.visualstudio.com/docs/nodejs/working-with-javascript#_typings-and-automatic-type-acquisition).',
              scope: 'window',
            },
            'javascript.referencesCodeLens.enabled': {
              type: 'boolean',
              default: false,
              description: 'Enable/disable references CodeLens in JavaScript files.',
              scope: 'window',
            },
            'javascript.referencesCodeLens.showOnAllFunctions': {
              type: 'boolean',
              default: false,
              description: 'Enable/disable references CodeLens on all functions in JavaScript files.',
              scope: 'window',
            },
            'typescript.referencesCodeLens.enabled': {
              type: 'boolean',
              default: false,
              description: 'Enable/disable references CodeLens in TypeScript files.',
              scope: 'window',
            },
            'typescript.referencesCodeLens.showOnAllFunctions': {
              type: 'boolean',
              default: false,
              description: 'Enable/disable references CodeLens on all functions in TypeScript files.',
              scope: 'window',
            },
            'typescript.implementationsCodeLens.enabled': {
              type: 'boolean',
              default: false,
              description: 'Enable/disable implementations CodeLens. This CodeLens shows the implementers of an interface.',
              scope: 'window',
            },
            'typescript.tsserver.enableTracing': {
              type: 'boolean',
              default: false,
              description: 'Enables tracing TS server performance to a directory. These trace files can be used to diagnose TS Server performance issues. The log may contain file paths, source code, and other potentially sensitive information from your project.',
              scope: 'window',
            },
            'typescript.tsserver.log': {
              type: 'string',
              enum: [
                'off',
                'terse',
                'normal',
                'verbose',
              ],
              default: 'off',
              description: 'Enables logging of the TS server to a file. This log can be used to diagnose TS Server issues. The log may contain file paths, source code, and other potentially sensitive information from your project.',
              scope: 'window',
            },
            'typescript.tsserver.pluginPaths': {
              type: 'array',
              items: {
                type: 'string',
                description: 'Either an absolute or relative path. Relative path will be resolved against workspace folder(s).',
              },
              default: [
              ],
              description: 'Additional paths to discover TypeScript Language Service plugins.',
              scope: 'machine',
            },
            'typescript.tsserver.trace': {
              type: 'string',
              enum: [
                'off',
                'messages',
                'verbose',
              ],
              default: 'off',
              description: 'Enables tracing of messages sent to the TS server. This trace can be used to diagnose TS Server issues. The trace may contain file paths, source code, and other potentially sensitive information from your project.',
              scope: 'window',
            },
            'javascript.suggest.completeFunctionCalls': {
              type: 'boolean',
              default: false,
              description: 'Complete functions with their parameter signature.',
              scope: 'resource',
            },
            'typescript.suggest.completeFunctionCalls': {
              type: 'boolean',
              default: false,
              description: 'Complete functions with their parameter signature.',
              scope: 'resource',
            },
            'javascript.suggest.includeAutomaticOptionalChainCompletions': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable showing completions on potentially undefined values that insert an optional chain call. Requires strict null checks to be enabled.',
              scope: 'resource',
            },
            'typescript.suggest.includeAutomaticOptionalChainCompletions': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable showing completions on potentially undefined values that insert an optional chain call. Requires strict null checks to be enabled.',
              scope: 'resource',
            },
            'typescript.inlayHints.parameterNames.enabled': {
              type: 'string',
              enum: [
                'none',
                'literals',
                'all',
              ],
              enumDescriptions: [
                'Disable parameter name hints.',
                'Enable parameter name hints only for literal arguments.',
                'Enable parameter name hints for literal and non-literal arguments.',
              ],
              default: 'none',
              markdownDescription: "Enable/disable inlay hints for parameter names:\n```typescript\n\nparseInt(/* str: */ '123', /* radix: */ 8)\n \n```",
              scope: 'resource',
            },
            'typescript.inlayHints.parameterNames.suppressWhenArgumentMatchesName': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Suppress parameter name hints on arguments whose text is identical to the parameter name.',
              scope: 'resource',
            },
            'typescript.inlayHints.parameterTypes.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: "Enable/disable inlay hints for implicit parameter types:\n```typescript\n\nel.addEventListener('click', e /* :MouseEvent */ => ...)\n \n```",
              scope: 'resource',
            },
            'typescript.inlayHints.variableTypes.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable inlay hints for implicit variable types:\n```typescript\n\nconst foo /* :number */ = Date.now();\n \n```',
              scope: 'resource',
            },
            'typescript.inlayHints.variableTypes.suppressWhenTypeMatchesName': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Suppress type hints on variables whose name is identical to the type name. Requires using TypeScript 4.8+ in the workspace.',
              scope: 'resource',
            },
            'typescript.inlayHints.propertyDeclarationTypes.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable inlay hints for implicit types on property declarations:\n```typescript\n\nclass Foo {\n\tprop /* :number */ = Date.now();\n}\n \n```',
              scope: 'resource',
            },
            'typescript.inlayHints.functionLikeReturnTypes.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable inlay hints for implicit return types on function signatures:\n```typescript\n\nfunction foo() /* :number */ {\n\treturn Date.now();\n} \n \n```',
              scope: 'resource',
            },
            'typescript.inlayHints.enumMemberValues.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable inlay hints for member values in enum declarations:\n```typescript\n\nenum MyValue {\n\tA /* = 0 */;\n\tB /* = 1 */;\n}\n \n```',
              scope: 'resource',
            },
            'javascript.inlayHints.parameterNames.enabled': {
              type: 'string',
              enum: [
                'none',
                'literals',
                'all',
              ],
              enumDescriptions: [
                'Disable parameter name hints.',
                'Enable parameter name hints only for literal arguments.',
                'Enable parameter name hints for literal and non-literal arguments.',
              ],
              default: 'none',
              markdownDescription: "Enable/disable inlay hints for parameter names:\n```typescript\n\nparseInt(/* str: */ '123', /* radix: */ 8)\n \n```",
              scope: 'resource',
            },
            'javascript.inlayHints.parameterNames.suppressWhenArgumentMatchesName': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Suppress parameter name hints on arguments whose text is identical to the parameter name.',
              scope: 'resource',
            },
            'javascript.inlayHints.parameterTypes.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: "Enable/disable inlay hints for implicit parameter types:\n```typescript\n\nel.addEventListener('click', e /* :MouseEvent */ => ...)\n \n```",
              scope: 'resource',
            },
            'javascript.inlayHints.variableTypes.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable inlay hints for implicit variable types:\n```typescript\n\nconst foo /* :number */ = Date.now();\n \n```',
              scope: 'resource',
            },
            'javascript.inlayHints.variableTypes.suppressWhenTypeMatchesName': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Suppress type hints on variables whose name is identical to the type name. Requires using TypeScript 4.8+ in the workspace.',
              scope: 'resource',
            },
            'javascript.inlayHints.propertyDeclarationTypes.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable inlay hints for implicit types on property declarations:\n```typescript\n\nclass Foo {\n\tprop /* :number */ = Date.now();\n}\n \n```',
              scope: 'resource',
            },
            'javascript.inlayHints.functionLikeReturnTypes.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable inlay hints for implicit return types on function signatures:\n```typescript\n\nfunction foo() /* :number */ {\n\treturn Date.now();\n} \n \n```',
              scope: 'resource',
            },
            'javascript.inlayHints.enumMemberValues.enabled': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable inlay hints for member values in enum declarations:\n```typescript\n\nenum MyValue {\n\tA /* = 0 */;\n\tB /* = 1 */;\n}\n \n```',
              scope: 'resource',
            },
            'javascript.suggest.includeCompletionsForImportStatements': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable auto-import-style completions on partially-typed import statements.',
              scope: 'resource',
            },
            'typescript.suggest.includeCompletionsForImportStatements': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable auto-import-style completions on partially-typed import statements.',
              scope: 'resource',
            },
            'typescript.reportStyleChecksAsWarnings': {
              type: 'boolean',
              default: true,
              description: 'Report style checks as warnings.',
              scope: 'window',
            },
            'typescript.validate.enable': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable TypeScript validation.',
              scope: 'window',
            },
            'typescript.format.enable': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable default TypeScript formatter.',
              scope: 'window',
            },
            'typescript.format.insertSpaceAfterCommaDelimiter': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after a comma delimiter.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterConstructor': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after the constructor keyword.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterSemicolonInForStatements': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after a semicolon in a for statement.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceBeforeAndAfterBinaryOperators': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after a binary operator.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterKeywordsInControlFlowStatements': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after keywords in a control flow statement.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after function keyword for anonymous functions.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceBeforeFunctionParenthesis': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling before function argument parentheses.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after opening and before closing non-empty parenthesis.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after opening and before closing non-empty brackets.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after opening and before closing non-empty braces.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after opening and before closing empty braces.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after opening and before closing template string braces.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after opening and before closing JSX expression braces.',
              scope: 'resource',
            },
            'typescript.format.insertSpaceAfterTypeAssertion': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after type assertions in TypeScript.',
              scope: 'resource',
            },
            'typescript.format.placeOpenBraceOnNewLineForFunctions': {
              type: 'boolean',
              default: false,
              description: 'Defines whether an open brace is put onto a new line for functions or not.',
              scope: 'resource',
            },
            'typescript.format.placeOpenBraceOnNewLineForControlBlocks': {
              type: 'boolean',
              default: false,
              description: 'Defines whether an open brace is put onto a new line for control blocks or not.',
              scope: 'resource',
            },
            'typescript.format.semicolons': {
              type: 'string',
              default: 'ignore',
              description: 'Defines handling of optional semicolons.',
              scope: 'resource',
              enum: [
                'ignore',
                'insert',
                'remove',
              ],
              enumDescriptions: [
                "Don't insert or remove any semicolons.",
                'Insert semicolons at statement ends.',
                'Remove unnecessary semicolons.',
              ],
            },
            'javascript.validate.enable': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable JavaScript validation.',
              scope: 'window',
            },
            'javascript.format.enable': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable default JavaScript formatter.',
              scope: 'window',
            },
            'javascript.format.insertSpaceAfterCommaDelimiter': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after a comma delimiter.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterConstructor': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after the constructor keyword.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterSemicolonInForStatements': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after a semicolon in a for statement.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceBeforeAndAfterBinaryOperators': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after a binary operator.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterKeywordsInControlFlowStatements': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after keywords in a control flow statement.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after function keyword for anonymous functions.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceBeforeFunctionParenthesis': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling before function argument parentheses.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after opening and before closing non-empty parenthesis.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after opening and before closing non-empty brackets.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after opening and before closing non-empty braces.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces': {
              type: 'boolean',
              default: true,
              description: 'Defines space handling after opening and before closing empty braces.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after opening and before closing template string braces.',
              scope: 'resource',
            },
            'javascript.format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces': {
              type: 'boolean',
              default: false,
              description: 'Defines space handling after opening and before closing JSX expression braces.',
              scope: 'resource',
            },
            'javascript.format.placeOpenBraceOnNewLineForFunctions': {
              type: 'boolean',
              default: false,
              description: 'Defines whether an open brace is put onto a new line for functions or not.',
              scope: 'resource',
            },
            'javascript.format.placeOpenBraceOnNewLineForControlBlocks': {
              type: 'boolean',
              default: false,
              description: 'Defines whether an open brace is put onto a new line for control blocks or not.',
              scope: 'resource',
            },
            'javascript.format.semicolons': {
              type: 'string',
              default: 'ignore',
              description: 'Defines handling of optional semicolons.',
              scope: 'resource',
              enum: [
                'ignore',
                'insert',
                'remove',
              ],
              enumDescriptions: [
                "Don't insert or remove any semicolons.",
                'Insert semicolons at statement ends.',
                'Remove unnecessary semicolons.',
              ],
            },
            'js/ts.implicitProjectConfig.module': {
              type: 'string',
              markdownDescription: 'Sets the module system for the program. See more: https://www.typescriptlang.org/tsconfig#module.',
              default: 'ESNext',
              enum: [
                'CommonJS',
                'AMD',
                'System',
                'UMD',
                'ES6',
                'ES2015',
                'ES2020',
                'ESNext',
                'None',
                'ES2022',
                'Node12',
                'NodeNext',
              ],
              scope: 'window',
            },
            'js/ts.implicitProjectConfig.target': {
              type: 'string',
              default: 'ES2020',
              markdownDescription: 'Set target JavaScript language version for emitted JavaScript and include library declarations. See more: https://www.typescriptlang.org/tsconfig#target.',
              enum: [
                'ES3',
                'ES5',
                'ES6',
                'ES2015',
                'ES2016',
                'ES2017',
                'ES2018',
                'ES2019',
                'ES2020',
                'ES2021',
                'ES2022',
                'ESNext',
              ],
              scope: 'window',
            },
            'javascript.implicitProjectConfig.checkJs': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable semantic checking of JavaScript files. Existing `jsconfig.json` or `tsconfig.json` files override this setting.',
              markdownDeprecationMessage: 'This setting has been deprecated in favor of `js/ts.implicitProjectConfig.checkJs`.',
              scope: 'window',
            },
            'js/ts.implicitProjectConfig.checkJs': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable semantic checking of JavaScript files. Existing `jsconfig.json` or `tsconfig.json` files override this setting.',
              scope: 'window',
            },
            'javascript.implicitProjectConfig.experimentalDecorators': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable `experimentalDecorators` in JavaScript files that are not part of a project. Existing `jsconfig.json` or `tsconfig.json` files override this setting.',
              markdownDeprecationMessage: 'This setting has been deprecated in favor of `js/ts.implicitProjectConfig.experimentalDecorators`.',
              scope: 'window',
            },
            'js/ts.implicitProjectConfig.experimentalDecorators': {
              type: 'boolean',
              default: false,
              markdownDescription: 'Enable/disable `experimentalDecorators` in JavaScript files that are not part of a project. Existing `jsconfig.json` or `tsconfig.json` files override this setting.',
              scope: 'window',
            },
            'js/ts.implicitProjectConfig.strictNullChecks': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Enable/disable [strict null checks](https://www.typescriptlang.org/tsconfig#strictNullChecks) in JavaScript and TypeScript files that are not part of a project. Existing `jsconfig.json` or `tsconfig.json` files override this setting.',
              scope: 'window',
            },
            'js/ts.implicitProjectConfig.strictFunctionTypes': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Enable/disable [strict function types](https://www.typescriptlang.org/tsconfig#strictFunctionTypes) in JavaScript and TypeScript files that are not part of a project. Existing `jsconfig.json` or `tsconfig.json` files override this setting.',
              scope: 'window',
            },
            'javascript.suggest.names': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Enable/disable including unique names from the file in JavaScript suggestions. Note that name suggestions are always disabled in JavaScript code that is semantically checked using `@ts-check` or `checkJs`.',
              scope: 'resource',
            },
            'typescript.tsc.autoDetect': {
              type: 'string',
              default: 'on',
              enum: [
                'on',
                'off',
                'build',
                'watch',
              ],
              markdownEnumDescriptions: [
                'Create both build and watch tasks.',
                'Disable this feature.',
                'Only create single run compile tasks.',
                'Only create compile and watch tasks.',
              ],
              description: 'Controls auto detection of tsc tasks.',
              scope: 'window',
            },
            'javascript.suggest.paths': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable suggestions for paths in import statements and require calls.',
              scope: 'resource',
            },
            'typescript.suggest.paths': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable suggestions for paths in import statements and require calls.',
              scope: 'resource',
            },
            'javascript.suggest.autoImports': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable auto import suggestions.',
              scope: 'resource',
            },
            'typescript.suggest.autoImports': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable auto import suggestions.',
              scope: 'resource',
            },
            'javascript.suggest.completeJSDocs': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable suggestion to complete JSDoc comments.',
              scope: 'language-overridable',
            },
            'typescript.suggest.completeJSDocs': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable suggestion to complete JSDoc comments.',
              scope: 'language-overridable',
            },
            'javascript.suggest.jsdoc.generateReturns': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Enable/disable generating `@returns` annotations for JSDoc templates.',
              scope: 'language-overridable',
            },
            'typescript.suggest.jsdoc.generateReturns': {
              type: 'boolean',
              default: true,
              markdownDescription: 'Enable/disable generating `@returns` annotations for JSDoc templates.',
              scope: 'language-overridable',
            },
            'typescript.locale': {
              type: 'string',
              default: 'auto',
              enum: [
                'auto',
                'de',
                'es',
                'en',
                'fr',
                'it',
                'ja',
                'ko',
                'ru',
                'zh-CN',
                'zh-TW',
              ],
              markdownDescription: "Sets the locale used to report JavaScript and TypeScript errors. Defaults to use VS Code's locale.",
              scope: 'window',
            },
            'javascript.suggestionActions.enabled': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable suggestion diagnostics for JavaScript files in the editor.',
              scope: 'resource',
            },
            'typescript.suggestionActions.enabled': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable suggestion diagnostics for TypeScript files in the editor.',
              scope: 'resource',
            },
            'javascript.preferences.quoteStyle': {
              type: 'string',
              enum: [
                'auto',
                'single',
                'double',
              ],
              default: 'auto',
              markdownDescription: 'Preferred quote style to use for Quick Fixes.',
              markdownEnumDescriptions: [
                'Infer quote type from existing code',
                "Always use single quotes: `'`",
                'Always use double quotes: `"`',
              ],
              scope: 'language-overridable',
            },
            'typescript.preferences.quoteStyle': {
              type: 'string',
              enum: [
                'auto',
                'single',
                'double',
              ],
              default: 'auto',
              markdownDescription: 'Preferred quote style to use for Quick Fixes.',
              markdownEnumDescriptions: [
                'Infer quote type from existing code',
                "Always use single quotes: `'`",
                'Always use double quotes: `"`',
              ],
              scope: 'language-overridable',
            },
            'javascript.preferences.importModuleSpecifier': {
              type: 'string',
              enum: [
                'shortest',
                'relative',
                'non-relative',
                'project-relative',
              ],
              markdownEnumDescriptions: [
                'Prefers a non-relative import only if one is available that has fewer path segments than a relative import.',
                'Prefers a relative path to the imported file location.',
                'Prefers a non-relative import based on the `baseUrl` or `paths` configured in your `jsconfig.json` / `tsconfig.json`.',
                'Prefers a non-relative import only if the relative import path would leave the package or project directory.',
              ],
              default: 'shortest',
              description: 'Preferred path style for auto imports.',
              scope: 'language-overridable',
            },
            'typescript.preferences.importModuleSpecifier': {
              type: 'string',
              enum: [
                'shortest',
                'relative',
                'non-relative',
                'project-relative',
              ],
              markdownEnumDescriptions: [
                'Prefers a non-relative import only if one is available that has fewer path segments than a relative import.',
                'Prefers a relative path to the imported file location.',
                'Prefers a non-relative import based on the `baseUrl` or `paths` configured in your `jsconfig.json` / `tsconfig.json`.',
                'Prefers a non-relative import only if the relative import path would leave the package or project directory.',
              ],
              default: 'shortest',
              description: 'Preferred path style for auto imports.',
              scope: 'language-overridable',
            },
            'javascript.preferences.importModuleSpecifierEnding': {
              type: 'string',
              enum: [
                'auto',
                'minimal',
                'index',
                'js',
              ],
              markdownEnumDescriptions: [
                'Use project settings to select a default.',
                'Shorten `./component/index.js` to `./component`.',
                'Shorten `./component/index.js` to `./component/index`.',
                'Do not shorten path endings; include the `.js` extension.',
              ],
              default: 'auto',
              description: 'Preferred path ending for auto imports.',
              scope: 'language-overridable',
            },
            'typescript.preferences.importModuleSpecifierEnding': {
              type: 'string',
              enum: [
                'auto',
                'minimal',
                'index',
                'js',
              ],
              markdownEnumDescriptions: [
                'Use project settings to select a default.',
                'Shorten `./component/index.js` to `./component`.',
                'Shorten `./component/index.js` to `./component/index`.',
                'Do not shorten path endings; include the `.js` extension.',
              ],
              default: 'auto',
              description: 'Preferred path ending for auto imports.',
              scope: 'language-overridable',
            },
            'javascript.preferences.jsxAttributeCompletionStyle': {
              type: 'string',
              enum: [
                'auto',
                'braces',
                'none',
              ],
              markdownEnumDescriptions: [
                'Insert `={}` or `=""` after attribute names based on the prop type. See `javascript.preferences.quoteStyle` to control the type of quotes used for string attributes.',
                'Insert `={}` after attribute names.',
                'Only insert attribute names.',
              ],
              default: 'auto',
              description: 'Preferred style for JSX attribute completions.',
              scope: 'language-overridable',
            },
            'typescript.preferences.jsxAttributeCompletionStyle': {
              type: 'string',
              enum: [
                'auto',
                'braces',
                'none',
              ],
              markdownEnumDescriptions: [
                'Insert `={}` or `=""` after attribute names based on the prop type. See `typescript.preferences.quoteStyle` to control the type of quotes used for string attributes.',
                'Insert `={}` after attribute names.',
                'Only insert attribute names.',
              ],
              default: 'auto',
              description: 'Preferred style for JSX attribute completions.',
              scope: 'language-overridable',
            },
            'typescript.preferences.includePackageJsonAutoImports': {
              type: 'string',
              enum: [
                'auto',
                'on',
                'off',
              ],
              enumDescriptions: [
                'Search dependencies based on estimated performance impact.',
                'Always search dependencies.',
                'Never search dependencies.',
              ],
              default: 'auto',
              markdownDescription: 'Enable/disable searching `package.json` dependencies for available auto imports.',
              scope: 'window',
            },
            'typescript.preferences.autoImportFileExcludePatterns': {
              type: 'array',
              items: {
                type: 'string',
              },
              markdownDescription: 'Specify glob patterns of files to exclude from auto imports. Requires using TypeScript 4.8 or newer in the workspace.',
              scope: 'resource',
            },
            'javascript.preferences.autoImportFileExcludePatterns': {
              type: 'array',
              items: {
                type: 'string',
              },
              markdownDescription: 'Specify glob patterns of files to exclude from auto imports. Requires using TypeScript 4.8 or newer in the workspace.',
              scope: 'resource',
            },
            'javascript.preferences.renameShorthandProperties': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable introducing aliases for object shorthand properties during renames.',
              deprecationMessage: "The setting 'typescript.preferences.renameShorthandProperties' has been deprecated in favor of 'typescript.preferences.useAliasesForRenames'",
              scope: 'language-overridable',
            },
            'typescript.preferences.renameShorthandProperties': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable introducing aliases for object shorthand properties during renames.',
              deprecationMessage: "The setting 'typescript.preferences.renameShorthandProperties' has been deprecated in favor of 'typescript.preferences.useAliasesForRenames'",
              scope: 'language-overridable',
            },
            'javascript.preferences.useAliasesForRenames': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable introducing aliases for object shorthand properties during renames.',
              scope: 'language-overridable',
            },
            'typescript.preferences.useAliasesForRenames': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable introducing aliases for object shorthand properties during renames.',
              scope: 'language-overridable',
            },
            'typescript.updateImportsOnFileMove.enabled': {
              type: 'string',
              enum: [
                'prompt',
                'always',
                'never',
              ],
              markdownEnumDescriptions: [
                'Prompt on each rename.',
                'Always update paths automatically.',
                "Never rename paths and don't prompt.",
              ],
              default: 'prompt',
              description: 'Enable/disable automatic updating of import paths when you rename or move a file in VS Code.',
              scope: 'resource',
            },
            'javascript.updateImportsOnFileMove.enabled': {
              type: 'string',
              enum: [
                'prompt',
                'always',
                'never',
              ],
              markdownEnumDescriptions: [
                'Prompt on each rename.',
                'Always update paths automatically.',
                "Never rename paths and don't prompt.",
              ],
              default: 'prompt',
              description: 'Enable/disable automatic updating of import paths when you rename or move a file in VS Code.',
              scope: 'resource',
            },
            'typescript.autoClosingTags': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable automatic closing of JSX tags.',
              scope: 'language-overridable',
            },
            'javascript.autoClosingTags': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable automatic closing of JSX tags.',
              scope: 'language-overridable',
            },
            'javascript.suggest.enabled': {
              type: 'boolean',
              default: true,
              description: 'Enabled/disable autocomplete suggestions.',
              scope: 'language-overridable',
            },
            'typescript.suggest.enabled': {
              type: 'boolean',
              default: true,
              description: 'Enabled/disable autocomplete suggestions.',
              scope: 'language-overridable',
            },
            'typescript.surveys.enabled': {
              type: 'boolean',
              default: true,
              description: "Enabled/disable occasional surveys that help us improve VS Code's JavaScript and TypeScript support.",
              scope: 'window',
            },
            'typescript.tsserver.useSeparateSyntaxServer': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable spawning a separate TypeScript server that can more quickly respond to syntax related operations, such as calculating folding or computing document symbols.',
              markdownDeprecationMessage: 'This setting has been deprecated in favor of `typescript.tsserver.useSyntaxServer`.',
              scope: 'window',
            },
            'typescript.tsserver.useSyntaxServer': {
              type: 'string',
              scope: 'window',
              description: 'Controls if TypeScript launches a dedicated server to more quickly handle syntax related operations, such as computing code folding.',
              default: 'auto',
              enum: [
                'always',
                'never',
                'auto',
              ],
              enumDescriptions: [
                'Use a lighter weight syntax server to handle all IntelliSense operations. This syntax server can only provide IntelliSense for opened files.',
                "Don't use a dedicated syntax server. Use a single server to handle all IntelliSense operations.",
                'Spawn both a full server and a lighter weight server dedicated to syntax operations. The syntax server is used to speed up syntax operations and provide IntelliSense while projects are loading.',
              ],
            },
            'typescript.tsserver.maxTsServerMemory': {
              type: 'number',
              default: 3072,
              description: 'The maximum amount of memory (in MB) to allocate to the TypeScript server process.',
              scope: 'window',
            },
            'typescript.tsserver.experimental.enableProjectDiagnostics': {
              type: 'boolean',
              default: false,
              description: '(Experimental) Enables project wide error reporting.',
              scope: 'window',
              tags: [
                'experimental',
              ],
            },
            'typescript.tsserver.watchOptions': {
              type: 'object',
              description: 'Configure which watching strategies should be used to keep track of files and directories.',
              scope: 'window',
              properties: {
                watchFile: {
                  type: 'string',
                  description: 'Strategy for how individual files are watched.',
                  enum: [
                    'fixedChunkSizePolling',
                    'fixedPollingInterval',
                    'priorityPollingInterval',
                    'dynamicPriorityPolling',
                    'useFsEvents',
                    'useFsEventsOnParentDirectory',
                  ],
                  enumDescriptions: [
                    'Polls files in chunks at regular interval.',
                    'Check every file for changes several times a second at a fixed interval.',
                    'Check every file for changes several times a second, but use heuristics to check certain types of files less frequently than others.',
                    'Use a dynamic queue where less-frequently modified files will be checked less often.',
                    "Attempt to use the operating system/file system's native events for file changes.",
                    "Attempt to use the operating system/file system's native events to listen for changes on a file's containing directories. This can use fewer file watchers, but might be less accurate.",
                  ],
                  default: 'useFsEvents',
                },
                watchDirectory: {
                  type: 'string',
                  description: 'Strategy for how entire directory trees are watched under systems that lack recursive file-watching functionality.',
                  enum: [
                    'fixedChunkSizePolling',
                    'fixedPollingInterval',
                    'dynamicPriorityPolling',
                    'useFsEvents',
                  ],
                  enumDescriptions: [
                    'Polls directories in chunks at regular interval.',
                    'Check every directory for changes several times a second at a fixed interval.',
                    'Use a dynamic queue where less-frequently modified directories will be checked less often.',
                    "Attempt to use the operating system/file system's native events for directory changes.",
                  ],
                  default: 'useFsEvents',
                },
                fallbackPolling: {
                  type: 'string',
                  description: "When using file system events, this option specifies the polling strategy that gets used when the system runs out of native file watchers and/or doesn't support native file watchers.",
                  enum: [
                    'fixedPollingInterval',
                    'priorityPollingInterval',
                    'dynamicPriorityPolling',
                  ],
                  enumDescriptions: [
                    'configuration.tsserver.watchOptions.fallbackPolling.fixedPollingInterval',
                    'configuration.tsserver.watchOptions.fallbackPolling.priorityPollingInterval',
                    'configuration.tsserver.watchOptions.fallbackPolling.dynamicPriorityPolling',
                  ],
                },
                synchronousWatchDirectory: {
                  type: 'boolean',
                  description: 'Disable deferred watching on directories. Deferred watching is useful when lots of file changes might occur at once (e.g. a change in node_modules from running npm install), but you might want to disable it with this flag for some less-common setups.',
                },
              },
            },
            'typescript.workspaceSymbols.scope': {
              type: 'string',
              enum: [
                'allOpenProjects',
                'currentProject',
              ],
              enumDescriptions: [
                'Search all open JavaScript or TypeScript projects for symbols.',
                'Only search for symbols in the current JavaScript or TypeScript project.',
              ],
              default: 'allOpenProjects',
              markdownDescription: 'Controls which files are searched by [Go to Symbol in Workspace](https://code.visualstudio.com/docs/editor/editingevolved#_open-symbol-by-name).',
              scope: 'window',
            },
            'javascript.suggest.classMemberSnippets.enabled': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable snippet completions for class members.',
              scope: 'resource',
            },
            'typescript.suggest.classMemberSnippets.enabled': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable snippet completions for class members.',
              scope: 'resource',
            },
            'typescript.suggest.objectLiteralMethodSnippets.enabled': {
              type: 'boolean',
              default: true,
              description: 'Enable/disable snippet completions for methods in object literals. Requires using TypeScript 4.7+ in the workspace.',
              scope: 'resource',
            },
            'typescript.experimental.tsserver.web.enableProjectWideIntellisense': {
              type: 'boolean',
              default: false,
              description: 'Enable/disable project-wide IntelliSense on web. Requires that VS Code is running in a trusted context.',
              scope: 'window',
              tags: [
                'experimental',
              ],
            },
          },
        },
      ],
      configurationDefaults: undefined,
      commands: [
        {
          command: 'typescript.reloadProjects',
          title: 'Reload Project',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'javascript.reloadProjects',
          title: 'Reload Project',
          originalTitle: undefined,
          category: 'JavaScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'typescript.selectTypeScriptVersion',
          title: 'Select TypeScript Version...',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'typescript.goToProjectConfig',
          title: 'Go to Project Configuration',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'javascript.goToProjectConfig',
          title: 'Go to Project Configuration',
          originalTitle: undefined,
          category: 'JavaScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'typescript.openTsServerLog',
          title: 'Open TS Server log',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'typescript.restartTsServer',
          title: 'Restart TS Server',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'typescript.findAllFileReferences',
          title: 'Find File References',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'typescript.goToSourceDefinition',
          title: 'Go to Source Definition',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'typescript.sortImports',
          title: 'Sort Imports',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'javascript.sortImports',
          title: 'Sort Imports',
          originalTitle: undefined,
          category: 'JavaScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'typescript.removeUnusedImports',
          title: 'Remove Unused Imports',
          originalTitle: undefined,
          category: 'TypeScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
        {
          command: 'javascript.removeUnusedImports',
          title: 'Remove Unused Imports',
          originalTitle: undefined,
          category: 'JavaScript',
          iconUrl: undefined,
          themeIcon: undefined,
          enablement: undefined,
        },
      ],
      menus: {
        commandPalette: [
          {
            command: 'typescript.reloadProjects',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'editorLangId == typescript && typescript.isManagedFile',
          },
          {
            command: 'typescript.reloadProjects',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'editorLangId == typescriptreact && typescript.isManagedFile',
          },
          {
            command: 'javascript.reloadProjects',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'editorLangId == javascript && typescript.isManagedFile',
          },
          {
            command: 'javascript.reloadProjects',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'editorLangId == javascriptreact && typescript.isManagedFile',
          },
          {
            command: 'typescript.goToProjectConfig',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'editorLangId == typescript && typescript.isManagedFile',
          },
          {
            command: 'typescript.goToProjectConfig',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'editorLangId == typescriptreact',
          },
          {
            command: 'javascript.goToProjectConfig',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'editorLangId == javascript && typescript.isManagedFile',
          },
          {
            command: 'javascript.goToProjectConfig',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'editorLangId == javascriptreact && typescript.isManagedFile',
          },
          {
            command: 'typescript.selectTypeScriptVersion',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'typescript.isManagedFile',
          },
          {
            command: 'typescript.openTsServerLog',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'typescript.isManagedFile',
          },
          {
            command: 'typescript.restartTsServer',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'typescript.isManagedFile',
          },
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'tsSupportsFileReferences && typescript.isManagedFile',
          },
          {
            command: 'typescript.goToSourceDefinition',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'tsSupportsSourceDefinition && typescript.isManagedFile',
          },
          {
            command: 'typescript.sortImports',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'supportedCodeAction =~ /(\\s|^)source\\.sortImports\\b/ && editorLangId =~ /^typescript(react)?$/',
          },
          {
            command: 'javascript.sortImports',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'supportedCodeAction =~ /(\\s|^)source\\.sortImports\\b/ && editorLangId =~ /^javascript(react)?$/',
          },
          {
            command: 'typescript.removeUnusedImports',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'supportedCodeAction =~ /(\\s|^)source\\.removeUnusedImports\\b/ && editorLangId =~ /^typescript(react)?$/',
          },
          {
            command: 'javascript.removeUnusedImports',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'supportedCodeAction =~ /(\\s|^)source\\.removeUnusedImports\\b/ && editorLangId =~ /^javascript(react)?$/',
          },
        ],
        'editor/context': [
          {
            command: 'typescript.goToSourceDefinition',
            submenu: undefined,
            alt: undefined,
            group: 'navigation@9',
            when: 'tsSupportsSourceDefinition && resourceLangId == typescript',
          },
          {
            command: 'typescript.goToSourceDefinition',
            submenu: undefined,
            alt: undefined,
            group: 'navigation@9',
            when: 'tsSupportsSourceDefinition && resourceLangId == typescriptreact',
          },
          {
            command: 'typescript.goToSourceDefinition',
            submenu: undefined,
            alt: undefined,
            group: 'navigation@9',
            when: 'tsSupportsSourceDefinition && resourceLangId == javascript',
          },
          {
            command: 'typescript.goToSourceDefinition',
            submenu: undefined,
            alt: undefined,
            group: 'navigation@9',
            when: 'tsSupportsSourceDefinition && resourceLangId == javascriptreact',
          },
        ],
        'explorer/context': [
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: '4_search',
            when: 'tsSupportsFileReferences && resourceLangId == typescript',
          },
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: '4_search',
            when: 'tsSupportsFileReferences && resourceLangId == typescriptreact',
          },
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: '4_search',
            when: 'tsSupportsFileReferences && resourceLangId == javascript',
          },
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: '4_search',
            when: 'tsSupportsFileReferences && resourceLangId == javascriptreact',
          },
        ],
        'editor/title/context': [
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'tsSupportsFileReferences && resourceLangId == javascript',
          },
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'tsSupportsFileReferences && resourceLangId == javascriptreact',
          },
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'tsSupportsFileReferences && resourceLangId == typescript',
          },
          {
            command: 'typescript.findAllFileReferences',
            submenu: undefined,
            alt: undefined,
            group: undefined,
            when: 'tsSupportsFileReferences && resourceLangId == typescriptreact',
          },
        ],
      },
      taskDefinitions: [
        {
          taskType: 'typescript',
          source: 'typescript-language-features',
          properties: {
            required: [
              'tsconfig',
            ],
            all: [
              'tsconfig',
              'option',
            ],
            schema: {
              type: 'object',
              required: [
                'tsconfig',
              ],
              properties: {
                tsconfig: {
                  type: 'string',
                  description: 'The tsconfig file that defines the TS build.',
                },
                option: {
                  type: 'string',
                },
                type: {
                  type: 'string',
                  const: 'typescript',
                },
              },
              when: 'shellExecutionSupported',
            },
          },
        },
      ],
      problemMatchers: [
        {
          name: 'tsc',
          label: 'TypeScript problems',
          owner: 'typescript',
          source: 'ts',
          applyTo: 'closedDocuments',
          fileLocation: [
            'relative',
            '${cwd}',
          ],
          pattern: '$tsc',
        },
        {
          name: 'tsc-watch',
          label: 'TypeScript problems (watch mode)',
          owner: 'typescript',
          source: 'ts',
          applyTo: 'closedDocuments',
          fileLocation: [
            'relative',
            '${cwd}',
          ],
          pattern: '$tsc',
          background: {
            activeOnStart: true,
            beginsPattern: {
              regexp: '^\\s*(?:message TS6032:|\\[?\\D*.{1,2}[:.].{1,2}[:.].{1,2}\\D*(├\\D*\\d{1,2}\\D+┤)?(?:\\]| -)) (Starting compilation in watch mode|File change detected\\. Starting incremental compilation)\\.\\.\\.',
            },
            endsPattern: {
              regexp: '^\\s*(?:message TS6042:|\\[?\\D*.{1,2}[:.].{1,2}[:.].{1,2}\\D*(├\\D*\\d{1,2}\\D+┤)?(?:\\]| -)) (?:Compilation complete\\.|Found \\d+ errors?\\.) Watching for file changes\\.',
            },
          },
        },
      ],
      problemPatterns: [
        {
          name: 'tsc',
          regexp: '^([^\\s].*)[\\(:](\\d+)[,:](\\d+)(?:\\):\\s+|\\s+-\\s+)(error|warning|info)\\s+TS(\\d+)\\s*:\\s*(.*)$',
          file: 1,
          line: 2,
          column: 3,
          severity: 4,
          code: 5,
          message: 6,
        },
      ],
      resourceLabelFormatters: undefined,
      authentication: undefined,
      notebooks: undefined,
      snippets: undefined,
      themes: undefined,
      iconThemes: undefined,
      colors: undefined,
      localizations: undefined,
      terminalProfiles: undefined,
    },
  },
  {
    metadata: {
      host: 'main',
      model: {
        packagePath: '/home/user/theia/examples/browser-only/plugins/vscode.typescript/extension',
        packageUri: 'file:///home/user/theia/examples/browser-only/plugins/vscode.typescript/extension',
        id: 'vscode.typescript',
        name: 'typescript',
        publisher: 'vscode',
        version: '1.95.3',
        displayName: 'TypeScript Language Basics (built-in)',
        description: 'Provides snippets, syntax highlighting, bracket matching and folding in TypeScript files.',
        engine: {
          type: 'vscode',
          version: '*',
        },
        entryPoint: {
          backend: undefined,
        },
        iconUrl: undefined,
        l10n: undefined,
        readmeUrl: 'hostedPlugin/vscode_typescript/.%2FREADME.md',
        licenseUrl: 'hostedPlugin/vscode_typescript/.%2FLICENSE',
      },
      lifecycle: {
        startMethod: 'activate',
        stopMethod: 'deactivate',
        frontendModuleName: 'vscode_typescript',
        frontendInitPath: 'plugin-vscode-init-fe.js',
      },
      outOfSync: false,
      isUnderDevelopment: false,
    },
    type: 0,
    contributes: {
      activationEvents: [
        'onLanguage:typescript',
        'onLanguage:typescriptreact',
        'onLanguage:jsonc',
        'onLanguage:json',
      ],
      configurationDefaults: undefined,
      languages: [
        {
          id: 'typescript',
          aliases: [
            'TypeScript',
            'ts',
            'typescript',
          ],
          extensions: [
            '.ts',
            '.cts',
            '.mts',
          ],
          filenamePatterns: undefined,
          filenames: undefined,
          firstLine: undefined,
          mimetypes: undefined,
          configuration: {
            brackets: [
              [
                '${',
                '}',
              ],
              [
                '{',
                '}',
              ],
              [
                '[',
                ']',
              ],
              [
                '(',
                ')',
              ],
            ],
            comments: {
              lineComment: '//',
              blockComment: [
                '/*',
                '*/',
              ],
            },
            folding: {
              markers: {
                start: '^\\s*//\\s*#?region\\b',
                end: '^\\s*//\\s*#?endregion\\b',
              },
            },
            wordPattern: {
              pattern: "(-?\\d*\\.\\d\\w*)|([^\\`\\@\\~\\!\\%\\^\\&\\*\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>/\\?\\s]+)",
            },
            autoClosingPairs: [
              {
                open: '{',
                close: '}',
                notIn: undefined,
              },
              {
                open: '[',
                close: ']',
                notIn: undefined,
              },
              {
                open: '(',
                close: ')',
                notIn: undefined,
              },
              {
                open: "'",
                close: "'",
                notIn: [
                  'string',
                  'comment',
                ],
              },
              {
                open: '"',
                close: '"',
                notIn: [
                  'string',
                ],
              },
              {
                open: '`',
                close: '`',
                notIn: [
                  'string',
                  'comment',
                ],
              },
              {
                open: '/**',
                close: ' */',
                notIn: [
                  'string',
                ],
              },
            ],
            indentationRules: {
              decreaseIndentPattern: {
                pattern: '^((?!.*?/\\*).*\\*/)?\\s*[\\}\\]].*$',
              },
              increaseIndentPattern: {
                pattern: "^((?!//).)*(\\{([^}\"'`/]*|(\\t|[ ])*//.*)|\\([^)\"'`/]*|\\[[^\\]\"'`/]*)$",
              },
              unIndentedLinePattern: {
                pattern: '^(\\t|[ ])*[ ]\\*[^/]*\\*/\\s*$|^(\\t|[ ])*[ ]\\*/\\s*$|^(\\t|[ ])*[ ]\\*([ ]([^\\*]|\\*(?!/))*)?$',
              },
            },
            surroundingPairs: [
              {
                open: '{',
                close: '}',
              },
              {
                open: '[',
                close: ']',
              },
              {
                open: '(',
                close: ')',
              },
              {
                open: "'",
                close: "'",
              },
              {
                open: '"',
                close: '"',
              },
              {
                open: '`',
                close: '`',
              },
              {
                open: '<',
                close: '>',
              },
            ],
            onEnterRules: [
              {
                beforeText: {
                  pattern: '^\\s*/\\*\\*(?!/)([^\\*]|\\*(?!/))*$',
                },
                afterText: {
                  pattern: '^\\s*\\*/$',
                },
                action: {
                  indent: 'indentOutdent',
                  appendText: ' * ',
                },
              },
              {
                beforeText: {
                  pattern: '^\\s*/\\*\\*(?!/)([^\\*]|\\*(?!/))*$',
                },
                action: {
                  indent: 'none',
                  appendText: ' * ',
                },
              },
              {
                beforeText: {
                  pattern: '^(\\t|[ ])*[ ]\\*([ ]([^\\*]|\\*(?!/))*)?$',
                },
                previousLineText: {
                  pattern: '(?=^(\\s*(/\\*\\*|\\*)).*)(?=(?!(\\s*\\*/)))',
                },
                action: {
                  indent: 'none',
                  appendText: '* ',
                },
              },
              {
                beforeText: {
                  pattern: '^(\\t|[ ])*[ ]\\*/\\s*$',
                },
                action: {
                  indent: 'none',
                  removeText: 1,
                },
              },
              {
                beforeText: {
                  pattern: '^(\\t|[ ])*[ ]\\*[^/]*\\*/\\s*$',
                },
                action: {
                  indent: 'none',
                  removeText: 1,
                },
              },
              {
                beforeText: {
                  pattern: '^\\s*(\\bcase\\s.+:|\\bdefault:)$',
                },
                afterText: {
                  pattern: '^(?!\\s*(\\bcase\\b|\\bdefault\\b))',
                },
                action: {
                  indent: 'indent',
                },
              },
            ],
          },
        },
        {
          id: 'typescriptreact',
          aliases: [
            'TypeScript JSX',
            'TypeScript React',
            'tsx',
          ],
          extensions: [
            '.tsx',
          ],
          filenamePatterns: undefined,
          filenames: undefined,
          firstLine: undefined,
          mimetypes: undefined,
          configuration: {
            brackets: [
              [
                '${',
                '}',
              ],
              [
                '{',
                '}',
              ],
              [
                '[',
                ']',
              ],
              [
                '(',
                ')',
              ],
            ],
            comments: {
              lineComment: '//',
              blockComment: [
                '/*',
                '*/',
              ],
            },
            folding: {
              markers: {
                start: '^\\s*//\\s*#?region\\b',
                end: '^\\s*//\\s*#?endregion\\b',
              },
            },
            wordPattern: {
              pattern: "(-?\\d*\\.\\d\\w*)|([^\\`\\@\\~\\!\\%\\^\\&\\*\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>/\\?\\s]+)",
            },
            autoClosingPairs: [
              {
                open: '{',
                close: '}',
                notIn: undefined,
              },
              {
                open: '[',
                close: ']',
                notIn: undefined,
              },
              {
                open: '(',
                close: ')',
                notIn: undefined,
              },
              {
                open: "'",
                close: "'",
                notIn: [
                  'string',
                  'comment',
                ],
              },
              {
                open: '"',
                close: '"',
                notIn: [
                  'string',
                ],
              },
              {
                open: '`',
                close: '`',
                notIn: [
                  'string',
                  'comment',
                ],
              },
              {
                open: '/**',
                close: ' */',
                notIn: [
                  'string',
                ],
              },
            ],
            indentationRules: {
              decreaseIndentPattern: {
                pattern: '^((?!.*?/\\*).*\\*/)?\\s*[\\}\\]].*$',
              },
              increaseIndentPattern: {
                pattern: "^((?!//).)*(\\{([^}\"'`/]*|(\\t|[ ])*//.*)|\\([^)\"'`/]*|\\[[^\\]\"'`/]*)$",
              },
              unIndentedLinePattern: {
                pattern: '^(\\t|[ ])*[ ]\\*[^/]*\\*/\\s*$|^(\\t|[ ])*[ ]\\*/\\s*$|^(\\t|[ ])*[ ]\\*([ ]([^\\*]|\\*(?!/))*)?$',
              },
            },
            surroundingPairs: [
              {
                open: '{',
                close: '}',
              },
              {
                open: '[',
                close: ']',
              },
              {
                open: '(',
                close: ')',
              },
              {
                open: "'",
                close: "'",
              },
              {
                open: '"',
                close: '"',
              },
              {
                open: '`',
                close: '`',
              },
              {
                open: '<',
                close: '>',
              },
            ],
            onEnterRules: [
              {
                beforeText: {
                  pattern: '^\\s*/\\*\\*(?!/)([^\\*]|\\*(?!/))*$',
                },
                afterText: {
                  pattern: '^\\s*\\*/$',
                },
                action: {
                  indent: 'indentOutdent',
                  appendText: ' * ',
                },
              },
              {
                beforeText: {
                  pattern: '^\\s*/\\*\\*(?!/)([^\\*]|\\*(?!/))*$',
                },
                action: {
                  indent: 'none',
                  appendText: ' * ',
                },
              },
              {
                beforeText: {
                  pattern: '^(\\t|[ ])*[ ]\\*([ ]([^\\*]|\\*(?!/))*)?$',
                },
                previousLineText: {
                  pattern: '(?=^(\\s*(/\\*\\*|\\*)).*)(?=(?!(\\s*\\*/)))',
                },
                action: {
                  indent: 'none',
                  appendText: '* ',
                },
              },
              {
                beforeText: {
                  pattern: '^(\\t|[ ])*[ ]\\*/\\s*$',
                },
                action: {
                  indent: 'none',
                  removeText: 1,
                },
              },
              {
                beforeText: {
                  pattern: '^(\\t|[ ])*[ ]\\*[^/]*\\*/\\s*$',
                },
                action: {
                  indent: 'none',
                  removeText: 1,
                },
              },
              {
                beforeText: {
                  pattern: '^\\s*(\\bcase\\s.+:|\\bdefault:)$',
                },
                afterText: {
                  pattern: '^(?!\\s*(\\bcase\\b|\\bdefault\\b))',
                },
                action: {
                  indent: 'indent',
                },
              },
            ],
          },
        },
        {
          id: 'jsonc',
          aliases: undefined,
          extensions: undefined,
          filenamePatterns: [
            'tsconfig.*.json',
            'jsconfig.*.json',
            'tsconfig-*.json',
            'jsconfig-*.json',
          ],
          filenames: [
            'tsconfig.json',
            'jsconfig.json',
          ],
          firstLine: undefined,
          mimetypes: undefined,
        },
        {
          id: 'json',
          aliases: undefined,
          extensions: undefined,
          filenamePatterns: undefined,
          filenames: [
            'tsconfig.tsbuildinfo',
          ],
          firstLine: undefined,
          mimetypes: undefined,
        },
      ],
      grammars: [
        {
          language: 'typescript',
          scope: 'source.ts',
          format: 'json',
          grammar: {
            information_for_contributors: [
              'This file has been converted from https://github.com/microsoft/TypeScript-TmLanguage/blob/master/TypeScript.tmLanguage',
              'If you want to provide a fix or improvement, please create a pull request against the original repository.',
              'Once accepted there, we are happy to receive an update request.',
            ],
            version: 'https://github.com/microsoft/TypeScript-TmLanguage/commit/0d73d1117e0a9b1d6635ebbe9aa37d615171b02d',
            name: 'TypeScript',
            scopeName: 'source.ts',
            patterns: [
              {
                include: '#directives',
              },
              {
                include: '#statements',
              },
              {
                include: '#shebang',
              },
            ],
            repository: {
              shebang: {
                name: 'comment.line.shebang.ts',
                match: '\\A(#!).*(?=$)',
                captures: {
                  '1': {
                    name: 'punctuation.definition.comment.ts',
                  },
                },
              },
              statements: {
                patterns: [
                  {
                    include: '#declaration',
                  },
                  {
                    include: '#control-statement',
                  },
                  {
                    include: '#after-operator-block-as-object-literal',
                  },
                  {
                    include: '#decl-block',
                  },
                  {
                    include: '#label',
                  },
                  {
                    include: '#expression',
                  },
                  {
                    include: '#punctuation-semicolon',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#comment',
                  },
                ],
              },
              declaration: {
                patterns: [
                  {
                    include: '#decorator',
                  },
                  {
                    include: '#var-expr',
                  },
                  {
                    include: '#function-declaration',
                  },
                  {
                    include: '#class-declaration',
                  },
                  {
                    include: '#interface-declaration',
                  },
                  {
                    include: '#enum-declaration',
                  },
                  {
                    include: '#namespace-declaration',
                  },
                  {
                    include: '#type-alias-declaration',
                  },
                  {
                    include: '#import-equals-declaration',
                  },
                  {
                    include: '#import-declaration',
                  },
                  {
                    include: '#export-declaration',
                  },
                  {
                    name: 'storage.modifier.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(declare|export)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              'control-statement': {
                patterns: [
                  {
                    include: '#switch-statement',
                  },
                  {
                    include: '#for-loop',
                  },
                  {
                    name: 'keyword.control.trycatch.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(catch|finally|throw|try)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(break|continue|goto)\\s+([_$[:alpha:]][_$[:alnum:]]*)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    captures: {
                      '1': {
                        name: 'keyword.control.loop.ts',
                      },
                      '2': {
                        name: 'entity.name.label.ts',
                      },
                    },
                  },
                  {
                    name: 'keyword.control.loop.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(break|continue|do|goto|while)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(return)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.control.flow.ts',
                      },
                    },
                    end: '(?=[;}]|$|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'keyword.control.switch.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(case|default|switch)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    include: '#if-statement',
                  },
                  {
                    name: 'keyword.control.conditional.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(else|if)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.control.with.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(with)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.control.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(package)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.other.debugger.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(debugger)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              label: {
                patterns: [
                  {
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(:)(?=\\s*\\{)',
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.label.ts',
                      },
                      '2': {
                        name: 'punctuation.separator.label.ts',
                      },
                    },
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#decl-block',
                      },
                    ],
                  },
                  {
                    match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(:)',
                    captures: {
                      '1': {
                        name: 'entity.name.label.ts',
                      },
                      '2': {
                        name: 'punctuation.separator.label.ts',
                      },
                    },
                  },
                ],
              },
              expression: {
                patterns: [
                  {
                    include: '#expressionWithoutIdentifiers',
                  },
                  {
                    include: '#identifiers',
                  },
                  {
                    include: '#expressionPunctuations',
                  },
                ],
              },
              expressionWithoutIdentifiers: {
                patterns: [
                  {
                    include: '#string',
                  },
                  {
                    include: '#regex',
                  },
                  {
                    include: '#comment',
                  },
                  {
                    include: '#function-expression',
                  },
                  {
                    include: '#class-expression',
                  },
                  {
                    include: '#arrow-function',
                  },
                  {
                    include: '#paren-expression-possibly-arrow',
                  },
                  {
                    include: '#cast',
                  },
                  {
                    include: '#ternary-expression',
                  },
                  {
                    include: '#new-expr',
                  },
                  {
                    include: '#instanceof-expr',
                  },
                  {
                    include: '#object-literal',
                  },
                  {
                    include: '#expression-operators',
                  },
                  {
                    include: '#function-call',
                  },
                  {
                    include: '#literal',
                  },
                  {
                    include: '#support-objects',
                  },
                  {
                    include: '#paren-expression',
                  },
                ],
              },
              expressionPunctuations: {
                patterns: [
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    include: '#punctuation-accessor',
                  },
                ],
              },
              decorator: {
                name: 'meta.decorator.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))\\@',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.decorator.ts',
                  },
                },
                end: '(?=\\s)',
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              'var-expr': {
                patterns: [
                  {
                    name: 'meta.var.expr.ts',
                    begin: '(?=(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(var|let)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))',
                    end: '(?!(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(var|let)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))((?=;|}|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+)|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))|((?<!^let|[^\\._$[:alnum:]]let|^var|[^\\._$[:alnum:]]var)(?=\\s*$)))',
                    patterns: [
                      {
                        begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(var|let)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*',
                        beginCaptures: {
                          '1': {
                            name: 'keyword.control.export.ts',
                          },
                          '2': {
                            name: 'storage.modifier.ts',
                          },
                          '3': {
                            name: 'storage.type.ts',
                          },
                        },
                        end: '(?=\\S)',
                      },
                      {
                        include: '#destructuring-variable',
                      },
                      {
                        include: '#var-single-variable',
                      },
                      {
                        include: '#variable-initializer',
                      },
                      {
                        include: '#comment',
                      },
                      {
                        begin: '(,)\\s*((?!\\S)|(?=\\/\\/))',
                        beginCaptures: {
                          '1': {
                            name: 'punctuation.separator.comma.ts',
                          },
                        },
                        end: '(?<!,)(((?==|;|}|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+)|^\\s*$))|((?<=\\S)(?=\\s*$)))',
                        patterns: [
                          {
                            include: '#single-line-comment-consuming-line-ending',
                          },
                          {
                            include: '#comment',
                          },
                          {
                            include: '#destructuring-variable',
                          },
                          {
                            include: '#var-single-variable',
                          },
                          {
                            include: '#punctuation-comma',
                          },
                        ],
                      },
                      {
                        include: '#punctuation-comma',
                      },
                    ],
                  },
                  {
                    name: 'meta.var.expr.ts',
                    begin: '(?=(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(const(?!\\s+enum\\b))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                      '3': {
                        name: 'storage.type.ts',
                      },
                    },
                    end: '(?!(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(const(?!\\s+enum\\b))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))((?=;|}|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+)|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))|((?<!^const|[^\\._$[:alnum:]]const)(?=\\s*$)))',
                    patterns: [
                      {
                        begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(const(?!\\s+enum\\b))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*',
                        beginCaptures: {
                          '1': {
                            name: 'keyword.control.export.ts',
                          },
                          '2': {
                            name: 'storage.modifier.ts',
                          },
                          '3': {
                            name: 'storage.type.ts',
                          },
                        },
                        end: '(?=\\S)',
                      },
                      {
                        include: '#destructuring-const',
                      },
                      {
                        include: '#var-single-const',
                      },
                      {
                        include: '#variable-initializer',
                      },
                      {
                        include: '#comment',
                      },
                      {
                        begin: '(,)\\s*((?!\\S)|(?=\\/\\/))',
                        beginCaptures: {
                          '1': {
                            name: 'punctuation.separator.comma.ts',
                          },
                        },
                        end: '(?<!,)(((?==|;|}|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+)|^\\s*$))|((?<=\\S)(?=\\s*$)))',
                        patterns: [
                          {
                            include: '#single-line-comment-consuming-line-ending',
                          },
                          {
                            include: '#comment',
                          },
                          {
                            include: '#destructuring-const',
                          },
                          {
                            include: '#var-single-const',
                          },
                          {
                            include: '#punctuation-comma',
                          },
                        ],
                      },
                      {
                        include: '#punctuation-comma',
                      },
                    ],
                  },
                ],
              },
              'var-single-variable': {
                patterns: [
                  {
                    name: 'meta.var-single-variable.expr.ts',
                    begin: "(?x)([_$[:alpha:]][_$[:alnum:]]*)(\\!)?(?=\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.ts entity.name.function.ts',
                      },
                      '2': {
                        name: 'keyword.operator.definiteassignment.ts',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                  {
                    name: 'meta.var-single-variable.expr.ts',
                    begin: '([[:upper:]][_$[:digit:][:upper:]]*)(?![_$[:alnum:]])(\\!)?',
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.ts variable.other.constant.ts',
                      },
                      '2': {
                        name: 'keyword.operator.definiteassignment.ts',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                  {
                    name: 'meta.var-single-variable.expr.ts',
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)(\\!)?',
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.ts variable.other.readwrite.ts',
                      },
                      '2': {
                        name: 'keyword.operator.definiteassignment.ts',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                ],
              },
              'var-single-const': {
                patterns: [
                  {
                    name: 'meta.var-single-variable.expr.ts',
                    begin: "(?x)([_$[:alpha:]][_$[:alnum:]]*)(?=\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.ts variable.other.constant.ts entity.name.function.ts',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                  {
                    name: 'meta.var-single-variable.expr.ts',
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)',
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.ts variable.other.constant.ts',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                ],
              },
              'var-single-variable-type-annotation': {
                patterns: [
                  {
                    include: '#type-annotation',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#comment',
                  },
                ],
              },
              'destructuring-variable': {
                patterns: [
                  {
                    name: 'meta.object-binding-pattern-variable.ts',
                    begin: '(?<!=|:|^of|[^\\._$[:alnum:]]of|^in|[^\\._$[:alnum:]]in)\\s*(?=\\{)',
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#object-binding-pattern',
                      },
                      {
                        include: '#type-annotation',
                      },
                      {
                        include: '#comment',
                      },
                    ],
                  },
                  {
                    name: 'meta.array-binding-pattern-variable.ts',
                    begin: '(?<!=|:|^of|[^\\._$[:alnum:]]of|^in|[^\\._$[:alnum:]]in)\\s*(?=\\[)',
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#array-binding-pattern',
                      },
                      {
                        include: '#type-annotation',
                      },
                      {
                        include: '#comment',
                      },
                    ],
                  },
                ],
              },
              'destructuring-const': {
                patterns: [
                  {
                    name: 'meta.object-binding-pattern-variable.ts',
                    begin: '(?<!=|:|^of|[^\\._$[:alnum:]]of|^in|[^\\._$[:alnum:]]in)\\s*(?=\\{)',
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#object-binding-pattern-const',
                      },
                      {
                        include: '#type-annotation',
                      },
                      {
                        include: '#comment',
                      },
                    ],
                  },
                  {
                    name: 'meta.array-binding-pattern-variable.ts',
                    begin: '(?<!=|:|^of|[^\\._$[:alnum:]]of|^in|[^\\._$[:alnum:]]in)\\s*(?=\\[)',
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#array-binding-pattern-const',
                      },
                      {
                        include: '#type-annotation',
                      },
                      {
                        include: '#comment',
                      },
                    ],
                  },
                ],
              },
              'object-binding-element': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(:))",
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        include: '#object-binding-element-propertyName',
                      },
                      {
                        include: '#binding-element',
                      },
                    ],
                  },
                  {
                    include: '#object-binding-pattern',
                  },
                  {
                    include: '#destructuring-variable-rest',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'object-binding-element-const': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(:))",
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        include: '#object-binding-element-propertyName',
                      },
                      {
                        include: '#binding-element-const',
                      },
                    ],
                  },
                  {
                    include: '#object-binding-pattern-const',
                  },
                  {
                    include: '#destructuring-variable-rest-const',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'object-binding-element-propertyName': {
                begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(:))",
                end: '(:)',
                endCaptures: {
                  '0': {
                    name: 'punctuation.destructuring.ts',
                  },
                },
                patterns: [
                  {
                    include: '#string',
                  },
                  {
                    include: '#array-literal',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    name: 'variable.object.property.ts',
                    match: '([_$[:alpha:]][_$[:alnum:]]*)',
                  },
                ],
              },
              'binding-element': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#regex',
                  },
                  {
                    include: '#object-binding-pattern',
                  },
                  {
                    include: '#array-binding-pattern',
                  },
                  {
                    include: '#destructuring-variable-rest',
                  },
                  {
                    include: '#variable-initializer',
                  },
                ],
              },
              'binding-element-const': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#regex',
                  },
                  {
                    include: '#object-binding-pattern-const',
                  },
                  {
                    include: '#array-binding-pattern-const',
                  },
                  {
                    include: '#destructuring-variable-rest-const',
                  },
                  {
                    include: '#variable-initializer',
                  },
                ],
              },
              'destructuring-variable-rest': {
                match: '(?:(\\.\\.\\.)\\s*)?([_$[:alpha:]][_$[:alnum:]]*)',
                captures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'meta.definition.variable.ts variable.other.readwrite.ts',
                  },
                },
              },
              'destructuring-variable-rest-const': {
                match: '(?:(\\.\\.\\.)\\s*)?([_$[:alpha:]][_$[:alnum:]]*)',
                captures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'meta.definition.variable.ts variable.other.constant.ts',
                  },
                },
              },
              'object-binding-pattern': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.object.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.object.ts',
                  },
                },
                patterns: [
                  {
                    include: '#object-binding-element',
                  },
                ],
              },
              'object-binding-pattern-const': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.object.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.object.ts',
                  },
                },
                patterns: [
                  {
                    include: '#object-binding-element-const',
                  },
                ],
              },
              'array-binding-pattern': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\[)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.array.ts',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.array.ts',
                  },
                },
                patterns: [
                  {
                    include: '#binding-element',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'array-binding-pattern-const': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\[)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.array.ts',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.array.ts',
                  },
                },
                patterns: [
                  {
                    include: '#binding-element-const',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'parameter-name': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|protected|private|readonly)\\s+(?=(override|public|protected|private|readonly)\\s+)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                    },
                  },
                  {
                    match: "(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*(\\??)(?=\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'keyword.operator.rest.ts',
                      },
                      '3': {
                        name: 'entity.name.function.ts variable.language.this.ts',
                      },
                      '4': {
                        name: 'entity.name.function.ts',
                      },
                      '5': {
                        name: 'keyword.operator.optional.ts',
                      },
                    },
                  },
                  {
                    match: '(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*(\\??)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'keyword.operator.rest.ts',
                      },
                      '3': {
                        name: 'variable.parameter.ts variable.language.this.ts',
                      },
                      '4': {
                        name: 'variable.parameter.ts',
                      },
                      '5': {
                        name: 'keyword.operator.optional.ts',
                      },
                    },
                  },
                ],
              },
              'destructuring-parameter': {
                patterns: [
                  {
                    name: 'meta.parameter.object-binding-pattern.ts',
                    begin: '(?<!=|:)\\s*(?:(\\.\\.\\.)\\s*)?(\\{)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.rest.ts',
                      },
                      '2': {
                        name: 'punctuation.definition.binding-pattern.object.ts',
                      },
                    },
                    end: '\\}',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.binding-pattern.object.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#parameter-object-binding-element',
                      },
                    ],
                  },
                  {
                    name: 'meta.paramter.array-binding-pattern.ts',
                    begin: '(?<!=|:)\\s*(?:(\\.\\.\\.)\\s*)?(\\[)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.rest.ts',
                      },
                      '2': {
                        name: 'punctuation.definition.binding-pattern.array.ts',
                      },
                    },
                    end: '\\]',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.binding-pattern.array.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#parameter-binding-element',
                      },
                      {
                        include: '#punctuation-comma',
                      },
                    ],
                  },
                ],
              },
              'parameter-object-binding-element': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(:))",
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        include: '#object-binding-element-propertyName',
                      },
                      {
                        include: '#parameter-binding-element',
                      },
                      {
                        include: '#paren-expression',
                      },
                    ],
                  },
                  {
                    include: '#parameter-object-binding-pattern',
                  },
                  {
                    include: '#destructuring-parameter-rest',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'parameter-binding-element': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#regex',
                  },
                  {
                    include: '#parameter-object-binding-pattern',
                  },
                  {
                    include: '#parameter-array-binding-pattern',
                  },
                  {
                    include: '#destructuring-parameter-rest',
                  },
                  {
                    include: '#variable-initializer',
                  },
                ],
              },
              'destructuring-parameter-rest': {
                match: '(?:(\\.\\.\\.)\\s*)?([_$[:alpha:]][_$[:alnum:]]*)',
                captures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'variable.parameter.ts',
                  },
                },
              },
              'parameter-object-binding-pattern': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.object.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.object.ts',
                  },
                },
                patterns: [
                  {
                    include: '#parameter-object-binding-element',
                  },
                ],
              },
              'parameter-array-binding-pattern': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\[)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.ts',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.array.ts',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.array.ts',
                  },
                },
                patterns: [
                  {
                    include: '#parameter-binding-element',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'field-declaration': {
                name: 'meta.field.declaration.ts',
                begin: "(?x)(?<!\\()(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(readonly)\\s+)?(?=\\s*((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|(\\#?[_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(?:(?:(\\?)|(\\!))\\s*)?(=|:|;|,|\\}|$))",
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.ts',
                  },
                },
                end: "(?x)(?=\\}|;|,|$|(^(?!\\s*((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|(\\#?[_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(?:(?:(\\?)|(\\!))\\s*)?(=|:|;|,|$))))|(?<=\\})",
                patterns: [
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#array-literal',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#comment',
                  },
                  {
                    match: "(?x)(\\#?[_$[:alpha:]][_$[:alnum:]]*)(?:(\\?)|(\\!))?(?=\\s*\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    captures: {
                      '1': {
                        name: 'meta.definition.property.ts entity.name.function.ts',
                      },
                      '2': {
                        name: 'keyword.operator.optional.ts',
                      },
                      '3': {
                        name: 'keyword.operator.definiteassignment.ts',
                      },
                    },
                  },
                  {
                    name: 'meta.definition.property.ts variable.object.property.ts',
                    match: '\\#?[_$[:alpha:]][_$[:alnum:]]*',
                  },
                  {
                    name: 'keyword.operator.optional.ts',
                    match: '\\?',
                  },
                  {
                    name: 'keyword.operator.definiteassignment.ts',
                    match: '\\!',
                  },
                ],
              },
              'variable-initializer': {
                patterns: [
                  {
                    begin: '(?<!=|!)(=)(?!=)(?=\\s*\\S)(?!\\s*.*=>\\s*$)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.ts',
                      },
                    },
                    end: '(?=$|^|[,);}\\]]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    begin: '(?<!=|!)(=)(?!=)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.ts',
                      },
                    },
                    end: '(?=[,);}\\]]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))|(?=^\\s*$)|(?<![\\|\\&\\+\\-\\*\\/])(?<=\\S)(?<!=)(?=\\s*$)',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                ],
              },
              'function-declaration': {
                name: 'meta.function.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?(?:(async)\\s+)?(function\\b)(?:\\s*(\\*))?(?:(?:\\s+|(?<=\\*))([_$[:alpha:]][_$[:alnum:]]*))?\\s*',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.ts',
                  },
                  '2': {
                    name: 'storage.modifier.ts',
                  },
                  '3': {
                    name: 'storage.modifier.async.ts',
                  },
                  '4': {
                    name: 'storage.type.function.ts',
                  },
                  '5': {
                    name: 'keyword.generator.asterisk.ts',
                  },
                  '6': {
                    name: 'meta.definition.function.ts entity.name.function.ts',
                  },
                },
                end: '(?=;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))|(?<=\\})',
                patterns: [
                  {
                    include: '#function-name',
                  },
                  {
                    include: '#function-body',
                  },
                ],
              },
              'function-expression': {
                name: 'meta.function.expression.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(async)\\s+)?(function\\b)(?:\\s*(\\*))?(?:(?:\\s+|(?<=\\*))([_$[:alpha:]][_$[:alnum:]]*))?\\s*',
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.async.ts',
                  },
                  '2': {
                    name: 'storage.type.function.ts',
                  },
                  '3': {
                    name: 'keyword.generator.asterisk.ts',
                  },
                  '4': {
                    name: 'meta.definition.function.ts entity.name.function.ts',
                  },
                },
                end: '(?=;)|(?<=\\})',
                patterns: [
                  {
                    include: '#function-name',
                  },
                  {
                    include: '#single-line-comment-consuming-line-ending',
                  },
                  {
                    include: '#function-body',
                  },
                ],
              },
              'function-name': {
                name: 'meta.definition.function.ts entity.name.function.ts',
                match: '[_$[:alpha:]][_$[:alnum:]]*',
              },
              'function-body': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#function-parameters',
                  },
                  {
                    include: '#return-type',
                  },
                  {
                    include: '#type-function-return-type',
                  },
                  {
                    include: '#decl-block',
                  },
                  {
                    name: 'keyword.generator.asterisk.ts',
                    match: '\\*',
                  },
                ],
              },
              'method-declaration': {
                patterns: [
                  {
                    name: 'meta.method.declaration.ts',
                    begin: '(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(override)\\s+)?(?:\\b(public|private|protected)\\s+)?(?:\\b(abstract)\\s+)?(?:\\b(async)\\s+)?\\s*\\b(constructor)\\b(?!:)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                      '3': {
                        name: 'storage.modifier.ts',
                      },
                      '4': {
                        name: 'storage.modifier.async.ts',
                      },
                      '5': {
                        name: 'storage.type.ts',
                      },
                    },
                    end: '(?=\\}|;|,|$)|(?<=\\})',
                    patterns: [
                      {
                        include: '#method-declaration-name',
                      },
                      {
                        include: '#function-body',
                      },
                    ],
                  },
                  {
                    name: 'meta.method.declaration.ts',
                    begin: '(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(override)\\s+)?(?:\\b(public|private|protected)\\s+)?(?:\\b(abstract)\\s+)?(?:\\b(async)\\s+)?(?:(?:\\s*\\b(new)\\b(?!:)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))|(?:(\\*)\\s*)?)(?=\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?[\\(])',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                      '3': {
                        name: 'storage.modifier.ts',
                      },
                      '4': {
                        name: 'storage.modifier.async.ts',
                      },
                      '5': {
                        name: 'keyword.operator.new.ts',
                      },
                      '6': {
                        name: 'keyword.generator.asterisk.ts',
                      },
                    },
                    end: '(?=\\}|;|,|$)|(?<=\\})',
                    patterns: [
                      {
                        include: '#method-declaration-name',
                      },
                      {
                        include: '#function-body',
                      },
                    ],
                  },
                  {
                    name: 'meta.method.declaration.ts',
                    begin: "(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(override)\\s+)?(?:\\b(public|private|protected)\\s+)?(?:\\b(abstract)\\s+)?(?:\\b(async)\\s+)?(?:\\b(get|set)\\s+)?(?:(\\*)\\s*)?(?=\\s*(((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(\\??))\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?[\\(])",
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                      '3': {
                        name: 'storage.modifier.ts',
                      },
                      '4': {
                        name: 'storage.modifier.async.ts',
                      },
                      '5': {
                        name: 'storage.type.property.ts',
                      },
                      '6': {
                        name: 'keyword.generator.asterisk.ts',
                      },
                    },
                    end: '(?=\\}|;|,|$)|(?<=\\})',
                    patterns: [
                      {
                        include: '#method-declaration-name',
                      },
                      {
                        include: '#function-body',
                      },
                    ],
                  },
                ],
              },
              'object-literal-method-declaration': {
                name: 'meta.method.declaration.ts',
                begin: "(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(async)\\s+)?(?:\\b(get|set)\\s+)?(?:(\\*)\\s*)?(?=\\s*(((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(\\??))\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?[\\(])",
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.async.ts',
                  },
                  '2': {
                    name: 'storage.type.property.ts',
                  },
                  '3': {
                    name: 'keyword.generator.asterisk.ts',
                  },
                },
                end: '(?=\\}|;|,)|(?<=\\})',
                patterns: [
                  {
                    include: '#method-declaration-name',
                  },
                  {
                    include: '#function-body',
                  },
                  {
                    begin: "(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(async)\\s+)?(?:\\b(get|set)\\s+)?(?:(\\*)\\s*)?(?=\\s*(((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(\\??))\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?[\\(])",
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.async.ts',
                      },
                      '2': {
                        name: 'storage.type.property.ts',
                      },
                      '3': {
                        name: 'keyword.generator.asterisk.ts',
                      },
                    },
                    end: '(?=\\(|\\<)',
                    patterns: [
                      {
                        include: '#method-declaration-name',
                      },
                    ],
                  },
                ],
              },
              'method-declaration-name': {
                begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(\\??)\\s*[\\(\\<])",
                end: '(?=\\(|\\<)',
                patterns: [
                  {
                    include: '#string',
                  },
                  {
                    include: '#array-literal',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    name: 'meta.definition.method.ts entity.name.function.ts',
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                  },
                  {
                    name: 'keyword.operator.optional.ts',
                    match: '\\?',
                  },
                ],
              },
              'arrow-function': {
                patterns: [
                  {
                    name: 'meta.arrow.ts',
                    match: '(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(\\basync)\\s+)?([_$[:alpha:]][_$[:alnum:]]*)\\s*(?==>)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.async.ts',
                      },
                      '2': {
                        name: 'variable.parameter.ts',
                      },
                    },
                  },
                  {
                    name: 'meta.arrow.ts',
                    begin: "(?x) (?:\n  (?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(\\basync)\n)? ((?<![})!\\]])\\s*\n  (?=\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  )\n)",
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.async.ts',
                      },
                    },
                    end: '(?==>|\\{|(^\\s*(export|function|class|interface|let|var|const|import|enum|namespace|module|type|abstract|declare)\\s+))',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#type-parameters',
                      },
                      {
                        include: '#function-parameters',
                      },
                      {
                        include: '#arrow-return-type',
                      },
                      {
                        include: '#possibly-arrow-return-type',
                      },
                    ],
                  },
                  {
                    name: 'meta.arrow.ts',
                    begin: '=>',
                    beginCaptures: {
                      '0': {
                        name: 'storage.type.function.arrow.ts',
                      },
                    },
                    end: '((?<=\\}|\\S)(?<!=>)|((?!\\{)(?=\\S)))(?!\\/[\\/\\*])',
                    patterns: [
                      {
                        include: '#single-line-comment-consuming-line-ending',
                      },
                      {
                        include: '#decl-block',
                      },
                      {
                        include: '#expression',
                      },
                    ],
                  },
                ],
              },
              'indexer-declaration': {
                name: 'meta.indexer.declaration.ts',
                begin: '(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(readonly)\\s*)?\\s*(\\[)\\s*([_$[:alpha:]][_$[:alnum:]]*)\\s*(?=:)',
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.ts',
                  },
                  '2': {
                    name: 'meta.brace.square.ts',
                  },
                  '3': {
                    name: 'variable.parameter.ts',
                  },
                },
                end: '(\\])\\s*(\\?\\s*)?|$',
                endCaptures: {
                  '1': {
                    name: 'meta.brace.square.ts',
                  },
                  '2': {
                    name: 'keyword.operator.optional.ts',
                  },
                },
                patterns: [
                  {
                    include: '#type-annotation',
                  },
                ],
              },
              'indexer-mapped-type-declaration': {
                name: 'meta.indexer.mappedtype.declaration.ts',
                begin: '(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))([+-])?(readonly)\\s*)?\\s*(\\[)\\s*([_$[:alpha:]][_$[:alnum:]]*)\\s+(in)\\s+',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.type.modifier.ts',
                  },
                  '2': {
                    name: 'storage.modifier.ts',
                  },
                  '3': {
                    name: 'meta.brace.square.ts',
                  },
                  '4': {
                    name: 'entity.name.type.ts',
                  },
                  '5': {
                    name: 'keyword.operator.expression.in.ts',
                  },
                },
                end: '(\\])([+-])?\\s*(\\?\\s*)?|$',
                endCaptures: {
                  '1': {
                    name: 'meta.brace.square.ts',
                  },
                  '2': {
                    name: 'keyword.operator.type.modifier.ts',
                  },
                  '3': {
                    name: 'keyword.operator.optional.ts',
                  },
                },
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as)\\s+',
                    captures: {
                      '1': {
                        name: 'keyword.control.as.ts',
                      },
                    },
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'function-parameters': {
                name: 'meta.parameters.ts',
                begin: '\\(',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.parameters.begin.ts',
                  },
                },
                end: '\\)',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.parameters.end.ts',
                  },
                },
                patterns: [
                  {
                    include: '#function-parameters-body',
                  },
                ],
              },
              'function-parameters-body': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#decorator',
                  },
                  {
                    include: '#destructuring-parameter',
                  },
                  {
                    include: '#parameter-name',
                  },
                  {
                    include: '#parameter-type-annotation',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    name: 'punctuation.separator.parameter.ts',
                    match: ',',
                  },
                ],
              },
              'class-declaration': {
                name: 'meta.class.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(?:(abstract)\\s+)?\\b(class)\\b(?=\\s+|/[/*])',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.ts',
                  },
                  '2': {
                    name: 'storage.modifier.ts',
                  },
                  '3': {
                    name: 'storage.modifier.ts',
                  },
                  '4': {
                    name: 'storage.type.class.ts',
                  },
                },
                end: '(?<=\\})',
                patterns: [
                  {
                    include: '#class-declaration-or-expression-patterns',
                  },
                ],
              },
              'class-expression': {
                name: 'meta.class.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(abstract)\\s+)?(class)\\b(?=\\s+|[<{]|\\/[\\/*])',
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.ts',
                  },
                  '2': {
                    name: 'storage.type.class.ts',
                  },
                },
                end: '(?<=\\})',
                patterns: [
                  {
                    include: '#class-declaration-or-expression-patterns',
                  },
                ],
              },
              'class-declaration-or-expression-patterns': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#class-or-interface-heritage',
                  },
                  {
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                    captures: {
                      '0': {
                        name: 'entity.name.type.class.ts',
                      },
                    },
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#class-or-interface-body',
                  },
                ],
              },
              'interface-declaration': {
                name: 'meta.interface.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(?:(abstract)\\s+)?\\b(interface)\\b(?=\\s+|/[/*])',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.ts',
                  },
                  '2': {
                    name: 'storage.modifier.ts',
                  },
                  '3': {
                    name: 'storage.modifier.ts',
                  },
                  '4': {
                    name: 'storage.type.interface.ts',
                  },
                },
                end: '(?<=\\})',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#class-or-interface-heritage',
                  },
                  {
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                    captures: {
                      '0': {
                        name: 'entity.name.type.interface.ts',
                      },
                    },
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#class-or-interface-body',
                  },
                ],
              },
              'class-or-interface-heritage': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(extends|implements)\\b)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.ts',
                  },
                },
                end: '(?=\\{)',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#class-or-interface-heritage',
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#expressionWithoutIdentifiers',
                  },
                  {
                    match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))(?=\\s*[_$[:alpha:]][_$[:alnum:]]*(\\s*\\??\\.\\s*[_$[:alpha:]][_$[:alnum:]]*)*\\s*)',
                    captures: {
                      '1': {
                        name: 'entity.name.type.module.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.ts',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                    },
                  },
                  {
                    match: '([_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'entity.other.inherited-class.ts',
                      },
                    },
                  },
                  {
                    include: '#expressionPunctuations',
                  },
                ],
              },
              'class-or-interface-body': {
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#decorator',
                  },
                  {
                    begin: '(?<=:)\\s*',
                    end: '(?=\\s|[;),}\\]:\\-\\+]|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    include: '#method-declaration',
                  },
                  {
                    include: '#indexer-declaration',
                  },
                  {
                    include: '#field-declaration',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#access-modifier',
                  },
                  {
                    include: '#property-accessor',
                  },
                  {
                    include: '#async-modifier',
                  },
                  {
                    include: '#after-operator-block-as-object-literal',
                  },
                  {
                    include: '#decl-block',
                  },
                  {
                    include: '#expression',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    include: '#punctuation-semicolon',
                  },
                ],
              },
              'access-modifier': {
                name: 'storage.modifier.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(abstract|declare|override|public|protected|private|readonly|static)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'property-accessor': {
                name: 'storage.type.property.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(accessor|get|set)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'async-modifier': {
                name: 'storage.modifier.async.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(async)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'enum-declaration': {
                name: 'meta.enum.declaration.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?(?:\\b(const)\\s+)?\\b(enum)\\s+([_$[:alpha:]][_$[:alnum:]]*)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.ts',
                  },
                  '2': {
                    name: 'storage.modifier.ts',
                  },
                  '3': {
                    name: 'storage.modifier.ts',
                  },
                  '4': {
                    name: 'storage.type.enum.ts',
                  },
                  '5': {
                    name: 'entity.name.type.enum.ts',
                  },
                },
                end: '(?<=\\})',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: '\\{',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.block.ts',
                      },
                    },
                    end: '\\}',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.block.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        begin: '([_$[:alpha:]][_$[:alnum:]]*)',
                        beginCaptures: {
                          '0': {
                            name: 'variable.other.enummember.ts',
                          },
                        },
                        end: '(?=,|\\}|$)',
                        patterns: [
                          {
                            include: '#comment',
                          },
                          {
                            include: '#variable-initializer',
                          },
                        ],
                      },
                      {
                        begin: "(?=((\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\])))",
                        end: '(?=,|\\}|$)',
                        patterns: [
                          {
                            include: '#string',
                          },
                          {
                            include: '#array-literal',
                          },
                          {
                            include: '#comment',
                          },
                          {
                            include: '#variable-initializer',
                          },
                        ],
                      },
                      {
                        include: '#punctuation-comma',
                      },
                    ],
                  },
                ],
              },
              'namespace-declaration': {
                name: 'meta.namespace.declaration.ts',
                begin: "(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(namespace|module)\\s+(?=[_$[:alpha:]\"'`]))",
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.ts',
                  },
                  '2': {
                    name: 'storage.modifier.ts',
                  },
                  '3': {
                    name: 'storage.type.namespace.ts',
                  },
                },
                end: '(?<=\\})|(?=;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    name: 'entity.name.type.module.ts',
                    match: '([_$[:alpha:]][_$[:alnum:]]*)',
                  },
                  {
                    include: '#punctuation-accessor',
                  },
                  {
                    include: '#decl-block',
                  },
                ],
              },
              'type-alias-declaration': {
                name: 'meta.type.declaration.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(type)\\b\\s+([_$[:alpha:]][_$[:alnum:]]*)\\s*',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.ts',
                  },
                  '2': {
                    name: 'storage.modifier.ts',
                  },
                  '3': {
                    name: 'storage.type.type.ts',
                  },
                  '4': {
                    name: 'entity.name.type.alias.ts',
                  },
                },
                end: '(?=\\}|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    begin: '(=)\\s*(intrinsic)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.ts',
                      },
                      '2': {
                        name: 'keyword.control.intrinsic.ts',
                      },
                    },
                    end: '(?=\\}|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    begin: '(=)\\s*',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.ts',
                      },
                    },
                    end: '(?=\\}|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'import-equals-declaration': {
                patterns: [
                  {
                    name: 'meta.import-equals.external.ts',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(import)(?:\\s+(type))?\\s+([_$[:alpha:]][_$[:alnum:]]*)\\s*(=)\\s*(require)\\s*(\\()',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                      '3': {
                        name: 'keyword.control.import.ts',
                      },
                      '4': {
                        name: 'keyword.control.type.ts',
                      },
                      '5': {
                        name: 'variable.other.readwrite.alias.ts',
                      },
                      '6': {
                        name: 'keyword.operator.assignment.ts',
                      },
                      '7': {
                        name: 'keyword.control.require.ts',
                      },
                      '8': {
                        name: 'meta.brace.round.ts',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'meta.brace.round.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#string',
                      },
                    ],
                  },
                  {
                    name: 'meta.import-equals.internal.ts',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(import)(?:\\s+(type))?\\s+([_$[:alpha:]][_$[:alnum:]]*)\\s*(=)\\s*(?!require\\b)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                      '3': {
                        name: 'keyword.control.import.ts',
                      },
                      '4': {
                        name: 'keyword.control.type.ts',
                      },
                      '5': {
                        name: 'variable.other.readwrite.alias.ts',
                      },
                      '6': {
                        name: 'keyword.operator.assignment.ts',
                      },
                    },
                    end: '(?=;|$|^)',
                    patterns: [
                      {
                        include: '#single-line-comment-consuming-line-ending',
                      },
                      {
                        include: '#comment',
                      },
                      {
                        match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))',
                        captures: {
                          '1': {
                            name: 'entity.name.type.module.ts',
                          },
                          '2': {
                            name: 'punctuation.accessor.ts',
                          },
                          '3': {
                            name: 'punctuation.accessor.optional.ts',
                          },
                        },
                      },
                      {
                        name: 'variable.other.readwrite.ts',
                        match: '([_$[:alpha:]][_$[:alnum:]]*)',
                      },
                    ],
                  },
                ],
              },
              'import-declaration': {
                name: 'meta.import.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(import)(?:\\s+(type)(?!\\s+from))?(?!\\s*[:\\(])(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.ts',
                  },
                  '2': {
                    name: 'storage.modifier.ts',
                  },
                  '3': {
                    name: 'keyword.control.import.ts',
                  },
                  '4': {
                    name: 'keyword.control.type.ts',
                  },
                },
                end: '(?<!^import|[^\\._$[:alnum:]]import)(?=;|$|^)',
                patterns: [
                  {
                    include: '#single-line-comment-consuming-line-ending',
                  },
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    begin: "(?<=^import|[^\\._$[:alnum:]]import)(?!\\s*[\"'])",
                    end: '\\bfrom\\b',
                    endCaptures: {
                      '0': {
                        name: 'keyword.control.from.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#import-export-declaration',
                      },
                    ],
                  },
                  {
                    include: '#import-export-declaration',
                  },
                ],
              },
              'export-declaration': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(export)\\s+(as)\\s+(namespace)\\s+([_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'keyword.control.export.ts',
                      },
                      '2': {
                        name: 'keyword.control.as.ts',
                      },
                      '3': {
                        name: 'storage.type.namespace.ts',
                      },
                      '4': {
                        name: 'entity.name.type.module.ts',
                      },
                    },
                  },
                  {
                    name: 'meta.export.default.ts',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(export)(?:\\s+(type))?(?:(?:\\s*(=))|(?:\\s+(default)(?=\\s+)))',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.ts',
                      },
                      '2': {
                        name: 'keyword.control.type.ts',
                      },
                      '3': {
                        name: 'keyword.operator.assignment.ts',
                      },
                      '4': {
                        name: 'keyword.control.default.ts',
                      },
                    },
                    end: '(?=$|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#interface-declaration',
                      },
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'meta.export.ts',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(export)(?:\\s+(type))?\\b(?!(\\$)|(\\s*:))((?=\\s*[\\{*])|((?=\\s*[_$[:alpha:]][_$[:alnum:]]*(\\s|,))(?!\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b)))',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.ts',
                      },
                      '2': {
                        name: 'keyword.control.type.ts',
                      },
                    },
                    end: '(?=$|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#import-export-declaration',
                      },
                    ],
                  },
                ],
              },
              'import-export-declaration': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#import-export-block',
                  },
                  {
                    name: 'keyword.control.from.ts',
                    match: '\\bfrom\\b',
                  },
                  {
                    include: '#import-export-assert-clause',
                  },
                  {
                    include: '#import-export-clause',
                  },
                ],
              },
              'import-export-assert-clause': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(assert)\\s*(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.assert.ts',
                  },
                  '2': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    name: 'meta.object-literal.key.ts',
                    match: '(?:[_$[:alpha:]][_$[:alnum:]]*)\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*:)',
                  },
                  {
                    name: 'punctuation.separator.key-value.ts',
                    match: ':',
                  },
                ],
              },
              'import-export-block': {
                name: 'meta.block.ts',
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                patterns: [
                  {
                    include: '#import-export-clause',
                  },
                ],
              },
              'import-export-clause': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(?:(\\btype)\\s+)?(?:(\\bdefault)|(\\*)|(\\b[_$[:alpha:]][_$[:alnum:]]*)))\\s+(as)\\s+(?:(default(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))|([_$[:alpha:]][_$[:alnum:]]*))',
                    captures: {
                      '1': {
                        name: 'keyword.control.type.ts',
                      },
                      '2': {
                        name: 'keyword.control.default.ts',
                      },
                      '3': {
                        name: 'constant.language.import-export-all.ts',
                      },
                      '4': {
                        name: 'variable.other.readwrite.ts',
                      },
                      '5': {
                        name: 'keyword.control.as.ts',
                      },
                      '6': {
                        name: 'keyword.control.default.ts',
                      },
                      '7': {
                        name: 'variable.other.readwrite.alias.ts',
                      },
                    },
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    name: 'constant.language.import-export-all.ts',
                    match: '\\*',
                  },
                  {
                    name: 'keyword.control.default.ts',
                    match: '\\b(default)\\b',
                  },
                  {
                    match: '(?:(\\btype)\\s+)?([_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'keyword.control.type.ts',
                      },
                      '2': {
                        name: 'variable.other.readwrite.alias.ts',
                      },
                    },
                  },
                ],
              },
              'switch-statement': {
                name: 'switch-statement.expr.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?=\\bswitch\\s*\\()',
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    name: 'switch-expression.expr.ts',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(switch)\\s*(\\()',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.switch.ts',
                      },
                      '2': {
                        name: 'meta.brace.round.ts',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'meta.brace.round.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'switch-block.expr.ts',
                    begin: '\\{',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.block.ts',
                      },
                    },
                    end: '(?=\\})',
                    patterns: [
                      {
                        name: 'case-clause.expr.ts',
                        begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(case|default(?=:))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                        beginCaptures: {
                          '1': {
                            name: 'keyword.control.switch.ts',
                          },
                        },
                        end: '(?=:)',
                        patterns: [
                          {
                            include: '#expression',
                          },
                        ],
                      },
                      {
                        begin: '(:)\\s*(\\{)',
                        beginCaptures: {
                          '1': {
                            name: 'case-clause.expr.ts punctuation.definition.section.case-statement.ts',
                          },
                          '2': {
                            name: 'meta.block.ts punctuation.definition.block.ts',
                          },
                        },
                        end: '\\}',
                        endCaptures: {
                          '0': {
                            name: 'meta.block.ts punctuation.definition.block.ts',
                          },
                        },
                        contentName: 'meta.block.ts',
                        patterns: [
                          {
                            include: '#statements',
                          },
                        ],
                      },
                      {
                        match: '(:)',
                        captures: {
                          '0': {
                            name: 'case-clause.expr.ts punctuation.definition.section.case-statement.ts',
                          },
                        },
                      },
                      {
                        include: '#statements',
                      },
                    ],
                  },
                ],
              },
              'for-loop': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))for(?=((\\s+|(\\s*\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*))await)?\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)?(\\())',
                beginCaptures: {
                  '0': {
                    name: 'keyword.control.loop.ts',
                  },
                },
                end: '(?<=\\))',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    name: 'keyword.control.loop.ts',
                    match: 'await',
                  },
                  {
                    begin: '\\(',
                    beginCaptures: {
                      '0': {
                        name: 'meta.brace.round.ts',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'meta.brace.round.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#var-expr',
                      },
                      {
                        include: '#expression',
                      },
                      {
                        include: '#punctuation-semicolon',
                      },
                    ],
                  },
                ],
              },
              'if-statement': {
                patterns: [
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?=\\bif\\s*(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))\\s*(?!\\{))',
                    end: '(?=;|$|\\})',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(if)\\s*(\\()',
                        beginCaptures: {
                          '1': {
                            name: 'keyword.control.conditional.ts',
                          },
                          '2': {
                            name: 'meta.brace.round.ts',
                          },
                        },
                        end: '\\)',
                        endCaptures: {
                          '0': {
                            name: 'meta.brace.round.ts',
                          },
                        },
                        patterns: [
                          {
                            include: '#expression',
                          },
                        ],
                      },
                      {
                        name: 'string.regexp.ts',
                        begin: '(?<=\\))\\s*\\/(?![\\/*])(?=(?:[^\\/\\\\\\[]|\\\\.|\\[([^\\]\\\\]|\\\\.)*\\])+\\/([dgimsuy]+|(?![\\/\\*])|(?=\\/\\*))(?!\\s*[a-zA-Z0-9_$]))',
                        beginCaptures: {
                          '0': {
                            name: 'punctuation.definition.string.begin.ts',
                          },
                        },
                        end: '(/)([dgimsuy]*)',
                        endCaptures: {
                          '1': {
                            name: 'punctuation.definition.string.end.ts',
                          },
                          '2': {
                            name: 'keyword.other.ts',
                          },
                        },
                        patterns: [
                          {
                            include: '#regexp',
                          },
                        ],
                      },
                      {
                        include: '#statements',
                      },
                    ],
                  },
                ],
              },
              'decl-block': {
                name: 'meta.block.ts',
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                patterns: [
                  {
                    include: '#statements',
                  },
                ],
              },
              'after-operator-block-as-object-literal': {
                name: 'meta.objectliteral.ts',
                begin: '(?<!\\+\\+|--)(?<=[:=(,\\[?+!>]|^await|[^\\._$[:alnum:]]await|^return|[^\\._$[:alnum:]]return|^yield|[^\\._$[:alnum:]]yield|^throw|[^\\._$[:alnum:]]throw|^in|[^\\._$[:alnum:]]in|^of|[^\\._$[:alnum:]]of|^typeof|[^\\._$[:alnum:]]typeof|&&|\\|\\||\\*)\\s*(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                patterns: [
                  {
                    include: '#object-member',
                  },
                ],
              },
              'object-literal': {
                name: 'meta.objectliteral.ts',
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                patterns: [
                  {
                    include: '#object-member',
                  },
                ],
              },
              'object-member': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#object-literal-method-declaration',
                  },
                  {
                    name: 'meta.object.member.ts meta.object-literal.key.ts',
                    begin: '(?=\\[)',
                    end: '(?=:)|((?<=[\\]])(?=\\s*[\\(\\<]))',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#array-literal',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.ts meta.object-literal.key.ts',
                    begin: "(?=[\\'\\\"\\`])",
                    end: "(?=:)|((?<=[\\'\\\"\\`])(?=((\\s*[\\(\\<,}])|(\\s+(as|satisifies)\\s+))))",
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#string',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.ts meta.object-literal.key.ts',
                    begin: '(?x)(?=(\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$)))',
                    end: '(?=:)|(?=\\s*([\\(\\<,}])|(\\s+as|satisifies\\s+))',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#numeric-literal',
                      },
                    ],
                  },
                  {
                    name: 'meta.method.declaration.ts',
                    begin: "(?<=[\\]\\'\\\"\\`])(?=\\s*[\\(\\<])",
                    end: '(?=\\}|;|,)|(?<=\\})',
                    patterns: [
                      {
                        include: '#function-body',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.ts',
                    match: '(?![_$[:alpha:]])([[:digit:]]+)\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*:)',
                    captures: {
                      '0': {
                        name: 'meta.object-literal.key.ts',
                      },
                      '1': {
                        name: 'constant.numeric.decimal.ts',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.ts',
                    match: "(?x)(?:([_$[:alpha:]][_$[:alnum:]]*)\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*:(\\s*\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/)*\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    captures: {
                      '0': {
                        name: 'meta.object-literal.key.ts',
                      },
                      '1': {
                        name: 'entity.name.function.ts',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.ts',
                    match: '(?:[_$[:alpha:]][_$[:alnum:]]*)\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*:)',
                    captures: {
                      '0': {
                        name: 'meta.object-literal.key.ts',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.ts',
                    begin: '\\.\\.\\.',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.operator.spread.ts',
                      },
                    },
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.ts',
                    match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?=,|\\}|$|\\/\\/|\\/\\*)',
                    captures: {
                      '1': {
                        name: 'variable.other.readwrite.ts',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as)\\s+(const)(?=\\s*([,}]|$))',
                    captures: {
                      '1': {
                        name: 'keyword.control.as.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.ts',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(as)|(satisfies))\\s+',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.as.ts',
                      },
                      '2': {
                        name: 'keyword.control.satisfies.ts',
                      },
                    },
                    end: '(?=[;),}\\]:?\\-\\+\\>]|\\|\\||\\&\\&|\\!\\=\\=|$|^|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as|satisifies)\\s+))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.ts',
                    begin: '(?=[_$[:alpha:]][_$[:alnum:]]*\\s*=)',
                    end: '(?=,|\\}|$|\\/\\/|\\/\\*)',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.ts',
                    begin: ':',
                    beginCaptures: {
                      '0': {
                        name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts',
                      },
                    },
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        begin: '(?<=:)\\s*(async)?(?=\\s*(<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)\\(\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))',
                        beginCaptures: {
                          '1': {
                            name: 'storage.modifier.async.ts',
                          },
                        },
                        end: '(?<=\\))',
                        patterns: [
                          {
                            include: '#type-parameters',
                          },
                          {
                            begin: '\\(',
                            beginCaptures: {
                              '0': {
                                name: 'meta.brace.round.ts',
                              },
                            },
                            end: '\\)',
                            endCaptures: {
                              '0': {
                                name: 'meta.brace.round.ts',
                              },
                            },
                            patterns: [
                              {
                                include: '#expression-inside-possibly-arrow-parens',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        begin: '(?<=:)\\s*(async)?\\s*(\\()(?=\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))',
                        beginCaptures: {
                          '1': {
                            name: 'storage.modifier.async.ts',
                          },
                          '2': {
                            name: 'meta.brace.round.ts',
                          },
                        },
                        end: '\\)',
                        endCaptures: {
                          '0': {
                            name: 'meta.brace.round.ts',
                          },
                        },
                        patterns: [
                          {
                            include: '#expression-inside-possibly-arrow-parens',
                          },
                        ],
                      },
                      {
                        begin: '(?<=:)\\s*(async)?\\s*(?=\\<\\s*$)',
                        beginCaptures: {
                          '1': {
                            name: 'storage.modifier.async.ts',
                          },
                        },
                        end: '(?<=\\>)',
                        patterns: [
                          {
                            include: '#type-parameters',
                          },
                        ],
                      },
                      {
                        begin: '(?<=\\>)\\s*(\\()(?=\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))',
                        beginCaptures: {
                          '1': {
                            name: 'meta.brace.round.ts',
                          },
                        },
                        end: '\\)',
                        endCaptures: {
                          '0': {
                            name: 'meta.brace.round.ts',
                          },
                        },
                        patterns: [
                          {
                            include: '#expression-inside-possibly-arrow-parens',
                          },
                        ],
                      },
                      {
                        include: '#possibly-arrow-return-type',
                      },
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    include: '#decl-block',
                  },
                ],
              },
              'ternary-expression': {
                begin: '(?!\\?\\.\\s*[^[:digit:]])(\\?)(?!\\?)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.ternary.ts',
                  },
                },
                end: '\\s*(:)',
                endCaptures: {
                  '1': {
                    name: 'keyword.operator.ternary.ts',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              'function-call': {
                patterns: [
                  {
                    begin: "(?=(((([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))|(?<=[\\)]))\\s*(?:(\\?\\.\\s*)|(\\!))?((<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?\\())",
                    end: "(?<=\\))(?!(((([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))|(?<=[\\)]))\\s*(?:(\\?\\.\\s*)|(\\!))?((<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?\\())",
                    patterns: [
                      {
                        name: 'meta.function-call.ts',
                        begin: '(?=(([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))',
                        end: "(?=\\s*(?:(\\?\\.\\s*)|(\\!))?((<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?\\())",
                        patterns: [
                          {
                            include: '#function-call-target',
                          },
                        ],
                      },
                      {
                        include: '#comment',
                      },
                      {
                        include: '#function-call-optionals',
                      },
                      {
                        include: '#type-arguments',
                      },
                      {
                        include: '#paren-expression',
                      },
                    ],
                  },
                  {
                    begin: '(?=(((([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))|(?<=[\\)]))(<\\s*[\\{\\[\\(]\\s*$))',
                    end: '(?<=\\>)(?!(((([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))|(?<=[\\)]))(<\\s*[\\{\\[\\(]\\s*$))',
                    patterns: [
                      {
                        name: 'meta.function-call.ts',
                        begin: '(?=(([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))',
                        end: '(?=(<\\s*[\\{\\[\\(]\\s*$))',
                        patterns: [
                          {
                            include: '#function-call-target',
                          },
                        ],
                      },
                      {
                        include: '#comment',
                      },
                      {
                        include: '#function-call-optionals',
                      },
                      {
                        include: '#type-arguments',
                      },
                    ],
                  },
                ],
              },
              'function-call-target': {
                patterns: [
                  {
                    include: '#support-function-call-identifiers',
                  },
                  {
                    name: 'entity.name.function.ts',
                    match: '(\\#?[_$[:alpha:]][_$[:alnum:]]*)',
                  },
                ],
              },
              'function-call-optionals': {
                patterns: [
                  {
                    name: 'meta.function-call.ts punctuation.accessor.optional.ts',
                    match: '\\?\\.',
                  },
                  {
                    name: 'meta.function-call.ts keyword.operator.definiteassignment.ts',
                    match: '\\!',
                  },
                ],
              },
              'support-function-call-identifiers': {
                patterns: [
                  {
                    include: '#literal',
                  },
                  {
                    include: '#support-objects',
                  },
                  {
                    include: '#object-identifiers',
                  },
                  {
                    include: '#punctuation-accessor',
                  },
                  {
                    name: 'keyword.operator.expression.import.ts',
                    match: "(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))import(?=\\s*[\\(]\\s*[\\\"\\'\\`]))",
                  },
                ],
              },
              'new-expr': {
                name: 'new.expr.ts',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(new)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.new.ts',
                  },
                },
                end: '(?<=\\))|(?=[;),}\\]:?\\-\\+\\>]|\\|\\||\\&\\&|\\!\\=\\=|$|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))new(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))function((\\s+[_$[:alpha:]][_$[:alnum:]]*)|(\\s*[\\(]))))',
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              'instanceof-expr': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(instanceof)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.expression.instanceof.ts',
                  },
                },
                end: '(?<=\\))|(?=[;),}\\]:?\\-\\+\\>]|\\|\\||\\&\\&|\\!\\=\\=|$|(===|!==|==|!=)|(([\\&\\~\\^\\|]\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s+instanceof(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))function((\\s+[_$[:alpha:]][_$[:alnum:]]*)|(\\s*[\\(]))))',
                patterns: [
                  {
                    include: '#type',
                  },
                ],
              },
              'paren-expression-possibly-arrow': {
                patterns: [
                  {
                    begin: '(?<=[(=,])\\s*(async)?(?=\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?\\(\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.async.ts',
                      },
                    },
                    end: '(?<=\\))',
                    patterns: [
                      {
                        include: '#paren-expression-possibly-arrow-with-typeparameters',
                      },
                    ],
                  },
                  {
                    begin: '(?<=[(=,]|=>|^return|[^\\._$[:alnum:]]return)\\s*(async)?(?=\\s*((((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?\\()|(<)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)))\\s*$)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.async.ts',
                      },
                    },
                    end: '(?<=\\))',
                    patterns: [
                      {
                        include: '#paren-expression-possibly-arrow-with-typeparameters',
                      },
                    ],
                  },
                  {
                    include: '#possibly-arrow-return-type',
                  },
                ],
              },
              'paren-expression-possibly-arrow-with-typeparameters': {
                patterns: [
                  {
                    include: '#type-parameters',
                  },
                  {
                    begin: '\\(',
                    beginCaptures: {
                      '0': {
                        name: 'meta.brace.round.ts',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'meta.brace.round.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#expression-inside-possibly-arrow-parens',
                      },
                    ],
                  },
                ],
              },
              'expression-inside-possibly-arrow-parens': {
                patterns: [
                  {
                    include: '#expressionWithoutIdentifiers',
                  },
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#decorator',
                  },
                  {
                    include: '#destructuring-parameter',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|protected|private|readonly)\\s+(?=(override|public|protected|private|readonly)\\s+)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                    },
                  },
                  {
                    match: "(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*(\\??)(?=\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'keyword.operator.rest.ts',
                      },
                      '3': {
                        name: 'entity.name.function.ts variable.language.this.ts',
                      },
                      '4': {
                        name: 'entity.name.function.ts',
                      },
                      '5': {
                        name: 'keyword.operator.optional.ts',
                      },
                    },
                  },
                  {
                    match: '(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*(\\??)(?=\\s*[:,]|$)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'keyword.operator.rest.ts',
                      },
                      '3': {
                        name: 'variable.parameter.ts variable.language.this.ts',
                      },
                      '4': {
                        name: 'variable.parameter.ts',
                      },
                      '5': {
                        name: 'keyword.operator.optional.ts',
                      },
                    },
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    name: 'punctuation.separator.parameter.ts',
                    match: ',',
                  },
                  {
                    include: '#identifiers',
                  },
                  {
                    include: '#expressionPunctuations',
                  },
                ],
              },
              'paren-expression': {
                begin: '\\(',
                beginCaptures: {
                  '0': {
                    name: 'meta.brace.round.ts',
                  },
                },
                end: '\\)',
                endCaptures: {
                  '0': {
                    name: 'meta.brace.round.ts',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              cast: {
                patterns: [
                  {
                    name: 'cast.expr.ts',
                    match: '\\s*(<)\\s*(const)\\s*(>)',
                    captures: {
                      '1': {
                        name: 'meta.brace.angle.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                      '3': {
                        name: 'meta.brace.angle.ts',
                      },
                    },
                  },
                  {
                    name: 'cast.expr.ts',
                    begin: '(?:(?<!\\+\\+|--)(?<=^return|[^\\._$[:alnum:]]return|^throw|[^\\._$[:alnum:]]throw|^yield|[^\\._$[:alnum:]]yield|^await|[^\\._$[:alnum:]]await|^default|[^\\._$[:alnum:]]default|[=(,:>*?\\&\\|\\^]|[^_$[:alnum:]](?:\\+\\+|\\-\\-)|[^\\+]\\+|[^\\-]\\-))\\s*(<)(?!<?\\=)(?!\\s*$)',
                    beginCaptures: {
                      '1': {
                        name: 'meta.brace.angle.ts',
                      },
                    },
                    end: '(\\>)',
                    endCaptures: {
                      '1': {
                        name: 'meta.brace.angle.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    name: 'cast.expr.ts',
                    begin: '(?:(?<=^))\\s*(<)(?=[_$[:alpha:]][_$[:alnum:]]*\\s*>)',
                    beginCaptures: {
                      '1': {
                        name: 'meta.brace.angle.ts',
                      },
                    },
                    end: '(\\>)',
                    endCaptures: {
                      '1': {
                        name: 'meta.brace.angle.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'expression-operators': {
                patterns: [
                  {
                    name: 'keyword.control.flow.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(await)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(yield)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?=\\s*\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*\\*)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.flow.ts',
                      },
                    },
                    end: '\\*',
                    endCaptures: {
                      '0': {
                        name: 'keyword.generator.asterisk.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#comment',
                      },
                    ],
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(yield)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?:\\s*(\\*))?',
                    captures: {
                      '1': {
                        name: 'keyword.control.flow.ts',
                      },
                      '2': {
                        name: 'keyword.generator.asterisk.ts',
                      },
                    },
                  },
                  {
                    name: 'keyword.operator.expression.delete.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))delete(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.operator.expression.in.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))in(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?!\\()',
                  },
                  {
                    name: 'keyword.operator.expression.of.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))of(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?!\\()',
                  },
                  {
                    name: 'keyword.operator.expression.instanceof.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))instanceof(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.operator.new.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))new(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    include: '#typeof-operator',
                  },
                  {
                    name: 'keyword.operator.expression.void.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))void(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as)\\s+(const)(?=\\s*($|[;,:})\\]]))',
                    captures: {
                      '1': {
                        name: 'keyword.control.as.ts',
                      },
                      '2': {
                        name: 'storage.modifier.ts',
                      },
                    },
                  },
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(as)|(satisfies))\\s+',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.as.ts',
                      },
                      '2': {
                        name: 'keyword.control.satisfies.ts',
                      },
                    },
                    end: '(?=^|[;),}\\]:?\\-\\+\\>]|\\|\\||\\&\\&|\\!\\=\\=|$|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as|satisfies)\\s+)|(\\s+\\<))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    name: 'keyword.operator.spread.ts',
                    match: '\\.\\.\\.',
                  },
                  {
                    name: 'keyword.operator.assignment.compound.ts',
                    match: '\\*=|(?<!\\()/=|%=|\\+=|\\-=',
                  },
                  {
                    name: 'keyword.operator.assignment.compound.bitwise.ts',
                    match: '\\&=|\\^=|<<=|>>=|>>>=|\\|=',
                  },
                  {
                    name: 'keyword.operator.bitwise.shift.ts',
                    match: '<<|>>>|>>',
                  },
                  {
                    name: 'keyword.operator.comparison.ts',
                    match: '===|!==|==|!=',
                  },
                  {
                    name: 'keyword.operator.relational.ts',
                    match: '<=|>=|<>|<|>',
                  },
                  {
                    match: '(?<=[_$[:alnum:]])(\\!)\\s*(?:(/=)|(?:(/)(?![/*])))',
                    captures: {
                      '1': {
                        name: 'keyword.operator.logical.ts',
                      },
                      '2': {
                        name: 'keyword.operator.assignment.compound.ts',
                      },
                      '3': {
                        name: 'keyword.operator.arithmetic.ts',
                      },
                    },
                  },
                  {
                    name: 'keyword.operator.logical.ts',
                    match: '\\!|&&|\\|\\||\\?\\?',
                  },
                  {
                    name: 'keyword.operator.bitwise.ts',
                    match: '\\&|~|\\^|\\|',
                  },
                  {
                    name: 'keyword.operator.assignment.ts',
                    match: '\\=',
                  },
                  {
                    name: 'keyword.operator.decrement.ts',
                    match: '--',
                  },
                  {
                    name: 'keyword.operator.increment.ts',
                    match: '\\+\\+',
                  },
                  {
                    name: 'keyword.operator.arithmetic.ts',
                    match: '%|\\*|/|-|\\+',
                  },
                  {
                    begin: '(?<=[_$[:alnum:])\\]])\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)+(?:(/=)|(?:(/)(?![/*]))))',
                    end: '(?:(/=)|(?:(/)(?!\\*([^\\*]|(\\*[^\\/]))*\\*\\/)))',
                    endCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.compound.ts',
                      },
                      '2': {
                        name: 'keyword.operator.arithmetic.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#comment',
                      },
                    ],
                  },
                  {
                    match: '(?<=[_$[:alnum:])\\]])\\s*(?:(/=)|(?:(/)(?![/*])))',
                    captures: {
                      '1': {
                        name: 'keyword.operator.assignment.compound.ts',
                      },
                      '2': {
                        name: 'keyword.operator.arithmetic.ts',
                      },
                    },
                  },
                ],
              },
              'typeof-operator': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))typeof(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '0': {
                    name: 'keyword.operator.expression.typeof.ts',
                  },
                },
                end: '(?=[,);}\\]=>:&|{\\?]|(extends\\s+)|$|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                patterns: [
                  {
                    include: '#type-arguments',
                  },
                  {
                    include: '#expression',
                  },
                ],
              },
              literal: {
                patterns: [
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#boolean-literal',
                  },
                  {
                    include: '#null-literal',
                  },
                  {
                    include: '#undefined-literal',
                  },
                  {
                    include: '#numericConstant-literal',
                  },
                  {
                    include: '#array-literal',
                  },
                  {
                    include: '#this-literal',
                  },
                  {
                    include: '#super-literal',
                  },
                ],
              },
              'array-literal': {
                name: 'meta.array.literal.ts',
                begin: '\\s*(\\[)',
                beginCaptures: {
                  '1': {
                    name: 'meta.brace.square.ts',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'meta.brace.square.ts',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'numeric-literal': {
                patterns: [
                  {
                    name: 'constant.numeric.hex.ts',
                    match: '\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                    },
                  },
                  {
                    name: 'constant.numeric.binary.ts',
                    match: '\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                    },
                  },
                  {
                    name: 'constant.numeric.octal.ts',
                    match: '\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                    },
                  },
                  {
                    match: '(?x)\n(?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$)',
                    captures: {
                      '0': {
                        name: 'constant.numeric.decimal.ts',
                      },
                      '1': {
                        name: 'meta.delimiter.decimal.period.ts',
                      },
                      '2': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                      '3': {
                        name: 'meta.delimiter.decimal.period.ts',
                      },
                      '4': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                      '5': {
                        name: 'meta.delimiter.decimal.period.ts',
                      },
                      '6': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                      '7': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                      '8': {
                        name: 'meta.delimiter.decimal.period.ts',
                      },
                      '9': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                      '10': {
                        name: 'meta.delimiter.decimal.period.ts',
                      },
                      '11': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                      '12': {
                        name: 'meta.delimiter.decimal.period.ts',
                      },
                      '13': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                      '14': {
                        name: 'storage.type.numeric.bigint.ts',
                      },
                    },
                  },
                ],
              },
              'boolean-literal': {
                patterns: [
                  {
                    name: 'constant.language.boolean.true.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))true(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'constant.language.boolean.false.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))false(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              'null-literal': {
                name: 'constant.language.null.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))null(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'this-literal': {
                name: 'variable.language.this.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))this\\b(?!\\$)',
              },
              'super-literal': {
                name: 'variable.language.super.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))super\\b(?!\\$)',
              },
              'undefined-literal': {
                name: 'constant.language.undefined.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))undefined(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'numericConstant-literal': {
                patterns: [
                  {
                    name: 'constant.language.nan.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))NaN(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'constant.language.infinity.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Infinity(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              'support-objects': {
                patterns: [
                  {
                    name: 'variable.language.arguments.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(arguments)\\b(?!\\$)',
                  },
                  {
                    name: 'support.class.promise.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(Promise)\\b(?!\\$)',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(import)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(meta)\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'keyword.control.import.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.ts',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '4': {
                        name: 'support.variable.property.importmeta.ts',
                      },
                    },
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(new)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(target)\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'keyword.operator.new.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.ts',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '4': {
                        name: 'support.variable.property.target.ts',
                      },
                    },
                  },
                  {
                    match: '(?x) (?:(\\.)|(\\?\\.(?!\\s*[[:digit:]]))) \\s* (?:\n  (?:(constructor|length|prototype|__proto__)\\b(?!\\$|\\s*(<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\\())\n  |\n  (?:(EPSILON|MAX_SAFE_INTEGER|MAX_VALUE|MIN_SAFE_INTEGER|MIN_VALUE|NEGATIVE_INFINITY|POSITIVE_INFINITY)\\b(?!\\$)))',
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '3': {
                        name: 'support.variable.property.ts',
                      },
                      '4': {
                        name: 'support.constant.ts',
                      },
                    },
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(exports)|(module)(?:(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))(exports|id|filename|loaded|parent|children))?)\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'support.type.object.module.ts',
                      },
                      '2': {
                        name: 'support.type.object.module.ts',
                      },
                      '3': {
                        name: 'punctuation.accessor.ts',
                      },
                      '4': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '5': {
                        name: 'support.type.object.module.ts',
                      },
                    },
                  },
                ],
              },
              identifiers: {
                patterns: [
                  {
                    include: '#object-identifiers',
                  },
                  {
                    match: "(?x)(?:(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*)?([_$[:alpha:]][_$[:alnum:]]*)(?=\\s*=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n))",
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '3': {
                        name: 'entity.name.function.ts',
                      },
                    },
                  },
                  {
                    match: '(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(\\#?[[:upper:]][_$[:digit:][:upper:]]*)(?![_$[:alnum:]])',
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '3': {
                        name: 'variable.other.constant.property.ts',
                      },
                    },
                  },
                  {
                    match: '(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '3': {
                        name: 'variable.other.property.ts',
                      },
                    },
                  },
                  {
                    name: 'variable.other.constant.ts',
                    match: '([[:upper:]][_$[:digit:][:upper:]]*)(?![_$[:alnum:]])',
                  },
                  {
                    name: 'variable.other.readwrite.ts',
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                  },
                ],
              },
              'object-identifiers': {
                patterns: [
                  {
                    name: 'support.class.ts',
                    match: '([_$[:alpha:]][_$[:alnum:]]*)(?=\\s*\\??\\.\\s*prototype\\b(?!\\$))',
                  },
                  {
                    match: '(?x)(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(?:\n  (\\#?[[:upper:]][_$[:digit:][:upper:]]*) |\n  (\\#?[_$[:alpha:]][_$[:alnum:]]*)\n)(?=\\s*\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '3': {
                        name: 'variable.other.constant.object.property.ts',
                      },
                      '4': {
                        name: 'variable.other.object.property.ts',
                      },
                    },
                  },
                  {
                    match: '(?x)(?:\n  ([[:upper:]][_$[:digit:][:upper:]]*) |\n  ([_$[:alpha:]][_$[:alnum:]]*)\n)(?=\\s*\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'variable.other.constant.object.ts',
                      },
                      '2': {
                        name: 'variable.other.object.ts',
                      },
                    },
                  },
                ],
              },
              'type-annotation': {
                patterns: [
                  {
                    name: 'meta.type.annotation.ts',
                    begin: '(:)(?=\\s*\\S)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.ts',
                      },
                    },
                    end: '(?<![:|&])(?!\\s*[|&]\\s+)((?=^|[,);\\}\\]]|//)|(?==[^>])|((?<=[\\}>\\]\\)]|[_$[:alpha:]])\\s*(?=\\{)))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    name: 'meta.type.annotation.ts',
                    begin: '(:)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.ts',
                      },
                    },
                    end: '(?<![:|&])((?=[,);\\}\\]]|\\/\\/)|(?==[^>])|(?=^\\s*$)|((?<=[\\}>\\]\\)]|[_$[:alpha:]])\\s*(?=\\{)))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'parameter-type-annotation': {
                patterns: [
                  {
                    name: 'meta.type.annotation.ts',
                    begin: '(:)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.ts',
                      },
                    },
                    end: '(?=[,)])|(?==[^>])',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'return-type': {
                patterns: [
                  {
                    name: 'meta.return.type.ts',
                    begin: '(?<=\\))\\s*(:)(?=\\s*\\S)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.ts',
                      },
                    },
                    end: '(?<![:|&])(?=$|^|[{};,]|//)',
                    patterns: [
                      {
                        include: '#return-type-core',
                      },
                    ],
                  },
                  {
                    name: 'meta.return.type.ts',
                    begin: '(?<=\\))\\s*(:)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.ts',
                      },
                    },
                    end: '(?<![:|&])((?=[{};,]|//|^\\s*$)|((?<=\\S)(?=\\s*$)))',
                    patterns: [
                      {
                        include: '#return-type-core',
                      },
                    ],
                  },
                ],
              },
              'return-type-core': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: '(?<=[:|&])(?=\\s*\\{)',
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#type-object',
                      },
                    ],
                  },
                  {
                    include: '#type-predicate-operator',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'arrow-return-type': {
                name: 'meta.return.type.arrow.ts',
                begin: '(?<=\\))\\s*(:)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.type.annotation.ts',
                  },
                },
                end: '(?==>|\\{|(^\\s*(export|function|class|interface|let|var|const|import|enum|namespace|module|type|abstract|declare)\\s+))',
                patterns: [
                  {
                    include: '#arrow-return-type-body',
                  },
                ],
              },
              'possibly-arrow-return-type': {
                begin: '(?<=\\)|^)\\s*(:)(?=\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*=>)',
                beginCaptures: {
                  '1': {
                    name: 'meta.arrow.ts meta.return.type.arrow.ts keyword.operator.type.annotation.ts',
                  },
                },
                end: '(?==>|\\{|(^\\s*(export|function|class|interface|let|var|const|import|enum|namespace|module|type|abstract|declare)\\s+))',
                contentName: 'meta.arrow.ts meta.return.type.arrow.ts',
                patterns: [
                  {
                    include: '#arrow-return-type-body',
                  },
                ],
              },
              'arrow-return-type-body': {
                patterns: [
                  {
                    begin: '(?<=[:])(?=\\s*\\{)',
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#type-object',
                      },
                    ],
                  },
                  {
                    include: '#type-predicate-operator',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'type-parameters': {
                name: 'meta.type.parameters.ts',
                begin: '(<)',
                beginCaptures: {
                  '1': {
                    name: 'punctuation.definition.typeparameters.begin.ts',
                  },
                },
                end: '(>)',
                endCaptures: {
                  '1': {
                    name: 'punctuation.definition.typeparameters.end.ts',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    name: 'storage.modifier.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(extends|in|out|const)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    include: '#type',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    name: 'keyword.operator.assignment.ts',
                    match: '(=)(?!>)',
                  },
                ],
              },
              'type-arguments': {
                name: 'meta.type.parameters.ts',
                begin: '\\<',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.typeparameters.begin.ts',
                  },
                },
                end: '\\>',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.typeparameters.end.ts',
                  },
                },
                patterns: [
                  {
                    include: '#type-arguments-body',
                  },
                ],
              },
              'type-arguments-body': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(_)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    captures: {
                      '0': {
                        name: 'keyword.operator.type.ts',
                      },
                    },
                  },
                  {
                    include: '#type',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              type: {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#type-string',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#type-primitive',
                  },
                  {
                    include: '#type-builtin-literals',
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#type-tuple',
                  },
                  {
                    include: '#type-object',
                  },
                  {
                    include: '#type-operators',
                  },
                  {
                    include: '#type-conditional',
                  },
                  {
                    include: '#type-fn-type-parameters',
                  },
                  {
                    include: '#type-paren-or-function-parameters',
                  },
                  {
                    include: '#type-function-return-type',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(readonly)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*',
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                    },
                  },
                  {
                    include: '#type-name',
                  },
                ],
              },
              'type-primitive': {
                name: 'support.type.primitive.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(string|number|bigint|boolean|symbol|any|void|never|unknown)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'type-builtin-literals': {
                name: 'support.type.builtin.ts',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(this|true|false|undefined|null|object)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'type-tuple': {
                name: 'meta.type.tuple.ts',
                begin: '\\[',
                beginCaptures: {
                  '0': {
                    name: 'meta.brace.square.ts',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'meta.brace.square.ts',
                  },
                },
                patterns: [
                  {
                    name: 'keyword.operator.rest.ts',
                    match: '\\.\\.\\.',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))([_$[:alpha:]][_$[:alnum:]]*)\\s*(\\?)?\\s*(:)',
                    captures: {
                      '1': {
                        name: 'entity.name.label.ts',
                      },
                      '2': {
                        name: 'keyword.operator.optional.ts',
                      },
                      '3': {
                        name: 'punctuation.separator.label.ts',
                      },
                    },
                  },
                  {
                    include: '#type',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'type-object': {
                name: 'meta.object.type.ts',
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.ts',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#method-declaration',
                  },
                  {
                    include: '#indexer-declaration',
                  },
                  {
                    include: '#indexer-mapped-type-declaration',
                  },
                  {
                    include: '#field-declaration',
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    begin: '\\.\\.\\.',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.operator.spread.ts',
                      },
                    },
                    end: '(?=\\}|;|,|$)|(?<=\\})',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    include: '#punctuation-semicolon',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'type-conditional': {
                patterns: [
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(extends)\\s+',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                    },
                    end: '(?<=:)',
                    patterns: [
                      {
                        begin: '\\?',
                        beginCaptures: {
                          '0': {
                            name: 'keyword.operator.ternary.ts',
                          },
                        },
                        end: ':',
                        endCaptures: {
                          '0': {
                            name: 'keyword.operator.ternary.ts',
                          },
                        },
                        patterns: [
                          {
                            include: '#type',
                          },
                        ],
                      },
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'type-paren-or-function-parameters': {
                name: 'meta.type.paren.cover.ts',
                begin: '\\(',
                beginCaptures: {
                  '0': {
                    name: 'meta.brace.round.ts',
                  },
                },
                end: '\\)',
                endCaptures: {
                  '0': {
                    name: 'meta.brace.round.ts',
                  },
                },
                patterns: [
                  {
                    match: '(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))\\s*(\\??)(?=\\s*(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?[\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))))',
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'keyword.operator.rest.ts',
                      },
                      '3': {
                        name: 'entity.name.function.ts variable.language.this.ts',
                      },
                      '4': {
                        name: 'entity.name.function.ts',
                      },
                      '5': {
                        name: 'keyword.operator.optional.ts',
                      },
                    },
                  },
                  {
                    match: '(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))\\s*(\\??)(?=:)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'keyword.operator.rest.ts',
                      },
                      '3': {
                        name: 'variable.parameter.ts variable.language.this.ts',
                      },
                      '4': {
                        name: 'variable.parameter.ts',
                      },
                      '5': {
                        name: 'keyword.operator.optional.ts',
                      },
                    },
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    name: 'punctuation.separator.parameter.ts',
                    match: ',',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'type-fn-type-parameters': {
                patterns: [
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(abstract)\\s+)?(new)\\b(?=\\s*\\<)',
                    beginCaptures: {
                      '1': {
                        name: 'meta.type.constructor.ts storage.modifier.ts',
                      },
                      '2': {
                        name: 'meta.type.constructor.ts keyword.control.new.ts',
                      },
                    },
                    end: '(?<=>)',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#type-parameters',
                      },
                    ],
                  },
                  {
                    name: 'meta.type.constructor.ts',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(abstract)\\s+)?(new)\\b\\s*(?=\\()',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.ts',
                      },
                      '2': {
                        name: 'keyword.control.new.ts',
                      },
                    },
                    end: '(?<=\\))',
                    patterns: [
                      {
                        include: '#function-parameters',
                      },
                    ],
                  },
                  {
                    name: 'meta.type.function.ts',
                    begin: '(?x)(\n  (?=\n    [(]\\s*(\n      ([)]) |\n      (\\.\\.\\.) |\n      ([_$[:alnum:]]+\\s*(\n        ([:,?=])|\n        ([)]\\s*=>)\n      ))\n    )\n  )\n)',
                    end: '(?<=\\))',
                    patterns: [
                      {
                        include: '#function-parameters',
                      },
                    ],
                  },
                ],
              },
              'type-function-return-type': {
                patterns: [
                  {
                    name: 'meta.type.function.return.ts',
                    begin: '(=>)(?=\\s*\\S)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.function.arrow.ts',
                      },
                    },
                    end: '(?<!=>)(?<![|&])(?=[,\\]\\)\\{\\}=;>:\\?]|//|$)',
                    patterns: [
                      {
                        include: '#type-function-return-type-core',
                      },
                    ],
                  },
                  {
                    name: 'meta.type.function.return.ts',
                    begin: '=>',
                    beginCaptures: {
                      '0': {
                        name: 'storage.type.function.arrow.ts',
                      },
                    },
                    end: '(?<!=>)(?<![|&])((?=[,\\]\\)\\{\\}=;:\\?>]|//|^\\s*$)|((?<=\\S)(?=\\s*$)))',
                    patterns: [
                      {
                        include: '#type-function-return-type-core',
                      },
                    ],
                  },
                ],
              },
              'type-function-return-type-core': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: '(?<==>)(?=\\s*\\{)',
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#type-object',
                      },
                    ],
                  },
                  {
                    include: '#type-predicate-operator',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'type-operators': {
                patterns: [
                  {
                    include: '#typeof-operator',
                  },
                  {
                    include: '#type-infer',
                  },
                  {
                    begin: '([&|])(?=\\s*\\{)',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.operator.type.ts',
                      },
                    },
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#type-object',
                      },
                    ],
                  },
                  {
                    begin: '[&|]',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.operator.type.ts',
                      },
                    },
                    end: '(?=\\S)',
                  },
                  {
                    name: 'keyword.operator.expression.keyof.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))keyof(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.operator.ternary.ts',
                    match: '(\\?|\\:)',
                  },
                  {
                    name: 'keyword.operator.expression.import.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))import(?=\\s*\\()',
                  },
                ],
              },
              'type-infer': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(infer)\\s+([_$[:alpha:]][_$[:alnum:]]*)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?:\\s+(extends)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))?',
                    name: 'meta.type.infer.ts',
                    captures: {
                      '1': {
                        name: 'keyword.operator.expression.infer.ts',
                      },
                      '2': {
                        name: 'entity.name.type.ts',
                      },
                      '3': {
                        name: 'keyword.operator.expression.extends.ts',
                      },
                    },
                  },
                ],
              },
              'type-predicate-operator': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(asserts)\\s+)?(?!asserts)(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))\\s(is)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    captures: {
                      '1': {
                        name: 'keyword.operator.type.asserts.ts',
                      },
                      '2': {
                        name: 'variable.parameter.ts variable.language.this.ts',
                      },
                      '3': {
                        name: 'variable.parameter.ts',
                      },
                      '4': {
                        name: 'keyword.operator.expression.is.ts',
                      },
                    },
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(asserts)\\s+(?!is)(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    captures: {
                      '1': {
                        name: 'keyword.operator.type.asserts.ts',
                      },
                      '2': {
                        name: 'variable.parameter.ts variable.language.this.ts',
                      },
                      '3': {
                        name: 'variable.parameter.ts',
                      },
                    },
                  },
                  {
                    name: 'keyword.operator.type.asserts.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))asserts(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.operator.expression.is.ts',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))is(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              'type-name': {
                patterns: [
                  {
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(<)',
                    captures: {
                      '1': {
                        name: 'entity.name.type.module.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.ts',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                      '4': {
                        name: 'meta.type.parameters.ts punctuation.definition.typeparameters.begin.ts',
                      },
                    },
                    end: '(>)',
                    endCaptures: {
                      '1': {
                        name: 'meta.type.parameters.ts punctuation.definition.typeparameters.end.ts',
                      },
                    },
                    contentName: 'meta.type.parameters.ts',
                    patterns: [
                      {
                        include: '#type-arguments-body',
                      },
                    ],
                  },
                  {
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(<)',
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.type.ts',
                      },
                      '2': {
                        name: 'meta.type.parameters.ts punctuation.definition.typeparameters.begin.ts',
                      },
                    },
                    end: '(>)',
                    endCaptures: {
                      '1': {
                        name: 'meta.type.parameters.ts punctuation.definition.typeparameters.end.ts',
                      },
                    },
                    contentName: 'meta.type.parameters.ts',
                    patterns: [
                      {
                        include: '#type-arguments-body',
                      },
                    ],
                  },
                  {
                    match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))',
                    captures: {
                      '1': {
                        name: 'entity.name.type.module.ts',
                      },
                      '2': {
                        name: 'punctuation.accessor.ts',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.ts',
                      },
                    },
                  },
                  {
                    name: 'entity.name.type.ts',
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                  },
                ],
              },
              'punctuation-comma': {
                name: 'punctuation.separator.comma.ts',
                match: ',',
              },
              'punctuation-semicolon': {
                name: 'punctuation.terminator.statement.ts',
                match: ';',
              },
              'punctuation-accessor': {
                match: '(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))',
                captures: {
                  '1': {
                    name: 'punctuation.accessor.ts',
                  },
                  '2': {
                    name: 'punctuation.accessor.optional.ts',
                  },
                },
              },
              string: {
                patterns: [
                  {
                    include: '#qstring-single',
                  },
                  {
                    include: '#qstring-double',
                  },
                  {
                    include: '#template',
                  },
                ],
              },
              'qstring-double': {
                name: 'string.quoted.double.ts',
                begin: '"',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.string.begin.ts',
                  },
                },
                end: '(")|((?:[^\\\\\\n])$)',
                endCaptures: {
                  '1': {
                    name: 'punctuation.definition.string.end.ts',
                  },
                  '2': {
                    name: 'invalid.illegal.newline.ts',
                  },
                },
                patterns: [
                  {
                    include: '#string-character-escape',
                  },
                ],
              },
              'qstring-single': {
                name: 'string.quoted.single.ts',
                begin: "'",
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.string.begin.ts',
                  },
                },
                end: "(\\')|((?:[^\\\\\\n])$)",
                endCaptures: {
                  '1': {
                    name: 'punctuation.definition.string.end.ts',
                  },
                  '2': {
                    name: 'invalid.illegal.newline.ts',
                  },
                },
                patterns: [
                  {
                    include: '#string-character-escape',
                  },
                ],
              },
              'string-character-escape': {
                name: 'constant.character.escape.ts',
                match: '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\\{[0-9A-Fa-f]+\\}|[0-2][0-7]{0,2}|3[0-6][0-7]?|37[0-7]?|[4-7][0-7]?|.|$)',
              },
              template: {
                patterns: [
                  {
                    include: '#template-call',
                  },
                  {
                    contentName: 'string.template.ts',
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)?(`)',
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.function.tagged-template.ts',
                      },
                      '2': {
                        name: 'string.template.ts punctuation.definition.string.template.begin.ts',
                      },
                    },
                    end: '`',
                    endCaptures: {
                      '0': {
                        name: 'string.template.ts punctuation.definition.string.template.end.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#template-substitution-element',
                      },
                      {
                        include: '#string-character-escape',
                      },
                    ],
                  },
                ],
              },
              'template-call': {
                patterns: [
                  {
                    begin: "(?=(([_$[:alpha:]][_$[:alnum:]]*\\s*\\??\\.\\s*)*|(\\??\\.\\s*)?)([_$[:alpha:]][_$[:alnum:]]*)(<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?`)",
                    end: '(?=`)',
                    patterns: [
                      {
                        begin: '(?=(([_$[:alpha:]][_$[:alnum:]]*\\s*\\??\\.\\s*)*|(\\??\\.\\s*)?)([_$[:alpha:]][_$[:alnum:]]*))',
                        end: "(?=(<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?`)",
                        patterns: [
                          {
                            include: '#support-function-call-identifiers',
                          },
                          {
                            name: 'entity.name.function.tagged-template.ts',
                            match: '([_$[:alpha:]][_$[:alnum:]]*)',
                          },
                        ],
                      },
                      {
                        include: '#type-arguments',
                      },
                    ],
                  },
                  {
                    begin: "([_$[:alpha:]][_$[:alnum:]]*)?\\s*(?=(<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)`)",
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.function.tagged-template.ts',
                      },
                    },
                    end: '(?=`)',
                    patterns: [
                      {
                        include: '#type-arguments',
                      },
                    ],
                  },
                ],
              },
              'template-substitution-element': {
                name: 'meta.template.expression.ts',
                begin: '\\$\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.template-expression.begin.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.template-expression.end.ts',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
                contentName: 'meta.embedded.line.ts',
              },
              'type-string': {
                patterns: [
                  {
                    include: '#qstring-single',
                  },
                  {
                    include: '#qstring-double',
                  },
                  {
                    include: '#template-type',
                  },
                ],
              },
              'template-type': {
                patterns: [
                  {
                    include: '#template-call',
                  },
                  {
                    contentName: 'string.template.ts',
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)?(`)',
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.function.tagged-template.ts',
                      },
                      '2': {
                        name: 'string.template.ts punctuation.definition.string.template.begin.ts',
                      },
                    },
                    end: '`',
                    endCaptures: {
                      '0': {
                        name: 'string.template.ts punctuation.definition.string.template.end.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#template-type-substitution-element',
                      },
                      {
                        include: '#string-character-escape',
                      },
                    ],
                  },
                ],
              },
              'template-type-substitution-element': {
                name: 'meta.template.expression.ts',
                begin: '\\$\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.template-expression.begin.ts',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.template-expression.end.ts',
                  },
                },
                patterns: [
                  {
                    include: '#type',
                  },
                ],
                contentName: 'meta.embedded.line.ts',
              },
              regex: {
                patterns: [
                  {
                    name: 'string.regexp.ts',
                    begin: '(?<!\\+\\+|--|})(?<=[=(:,\\[?+!]|^return|[^\\._$[:alnum:]]return|^case|[^\\._$[:alnum:]]case|=>|&&|\\|\\||\\*\\/)\\s*(\\/)(?![\\/*])(?=(?:[^\\/\\\\\\[\\()]|\\\\.|\\[([^\\]\\\\]|\\\\.)+\\]|\\(([^\\)\\\\]|\\\\.)+\\))+\\/([dgimsuy]+|(?![\\/\\*])|(?=\\/\\*))(?!\\s*[a-zA-Z0-9_$]))',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.string.begin.ts',
                      },
                    },
                    end: '(/)([dgimsuy]*)',
                    endCaptures: {
                      '1': {
                        name: 'punctuation.definition.string.end.ts',
                      },
                      '2': {
                        name: 'keyword.other.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#regexp',
                      },
                    ],
                  },
                  {
                    name: 'string.regexp.ts',
                    begin: '((?<![_$[:alnum:])\\]]|\\+\\+|--|}|\\*\\/)|((?<=^return|[^\\._$[:alnum:]]return|^case|[^\\._$[:alnum:]]case))\\s*)\\/(?![\\/*])(?=(?:[^\\/\\\\\\[]|\\\\.|\\[([^\\]\\\\]|\\\\.)*\\])+\\/([dgimsuy]+|(?![\\/\\*])|(?=\\/\\*))(?!\\s*[a-zA-Z0-9_$]))',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.string.begin.ts',
                      },
                    },
                    end: '(/)([dgimsuy]*)',
                    endCaptures: {
                      '1': {
                        name: 'punctuation.definition.string.end.ts',
                      },
                      '2': {
                        name: 'keyword.other.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#regexp',
                      },
                    ],
                  },
                ],
              },
              regexp: {
                patterns: [
                  {
                    name: 'keyword.control.anchor.regexp',
                    match: '\\\\[bB]|\\^|\\$',
                  },
                  {
                    match: '\\\\[1-9]\\d*|\\\\k<([a-zA-Z_$][\\w$]*)>',
                    captures: {
                      '0': {
                        name: 'keyword.other.back-reference.regexp',
                      },
                      '1': {
                        name: 'variable.other.regexp',
                      },
                    },
                  },
                  {
                    name: 'keyword.operator.quantifier.regexp',
                    match: '[?+*]|\\{(\\d+,\\d+|\\d+,|,\\d+|\\d+)\\}\\??',
                  },
                  {
                    name: 'keyword.operator.or.regexp',
                    match: '\\|',
                  },
                  {
                    name: 'meta.group.assertion.regexp',
                    begin: '(\\()((\\?=)|(\\?!)|(\\?<=)|(\\?<!))',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.group.regexp',
                      },
                      '2': {
                        name: 'punctuation.definition.group.assertion.regexp',
                      },
                      '3': {
                        name: 'meta.assertion.look-ahead.regexp',
                      },
                      '4': {
                        name: 'meta.assertion.negative-look-ahead.regexp',
                      },
                      '5': {
                        name: 'meta.assertion.look-behind.regexp',
                      },
                      '6': {
                        name: 'meta.assertion.negative-look-behind.regexp',
                      },
                    },
                    end: '(\\))',
                    endCaptures: {
                      '1': {
                        name: 'punctuation.definition.group.regexp',
                      },
                    },
                    patterns: [
                      {
                        include: '#regexp',
                      },
                    ],
                  },
                  {
                    name: 'meta.group.regexp',
                    begin: '\\((?:(\\?:)|(?:\\?<([a-zA-Z_$][\\w$]*)>))?',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.group.regexp',
                      },
                      '1': {
                        name: 'punctuation.definition.group.no-capture.regexp',
                      },
                      '2': {
                        name: 'variable.other.regexp',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.group.regexp',
                      },
                    },
                    patterns: [
                      {
                        include: '#regexp',
                      },
                    ],
                  },
                  {
                    name: 'constant.other.character-class.set.regexp',
                    begin: '(\\[)(\\^)?',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.character-class.regexp',
                      },
                      '2': {
                        name: 'keyword.operator.negation.regexp',
                      },
                    },
                    end: '(\\])',
                    endCaptures: {
                      '1': {
                        name: 'punctuation.definition.character-class.regexp',
                      },
                    },
                    patterns: [
                      {
                        name: 'constant.other.character-class.range.regexp',
                        match: '(?:.|(\\\\(?:[0-7]{3}|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}))|(\\\\c[A-Z])|(\\\\.))\\-(?:[^\\]\\\\]|(\\\\(?:[0-7]{3}|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}))|(\\\\c[A-Z])|(\\\\.))',
                        captures: {
                          '1': {
                            name: 'constant.character.numeric.regexp',
                          },
                          '2': {
                            name: 'constant.character.control.regexp',
                          },
                          '3': {
                            name: 'constant.character.escape.backslash.regexp',
                          },
                          '4': {
                            name: 'constant.character.numeric.regexp',
                          },
                          '5': {
                            name: 'constant.character.control.regexp',
                          },
                          '6': {
                            name: 'constant.character.escape.backslash.regexp',
                          },
                        },
                      },
                      {
                        include: '#regex-character-class',
                      },
                    ],
                  },
                  {
                    include: '#regex-character-class',
                  },
                ],
              },
              'regex-character-class': {
                patterns: [
                  {
                    name: 'constant.other.character-class.regexp',
                    match: '\\\\[wWsSdDtrnvf]|\\.',
                  },
                  {
                    name: 'constant.character.numeric.regexp',
                    match: '\\\\([0-7]{3}|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4})',
                  },
                  {
                    name: 'constant.character.control.regexp',
                    match: '\\\\c[A-Z]',
                  },
                  {
                    name: 'constant.character.escape.backslash.regexp',
                    match: '\\\\.',
                  },
                ],
              },
              comment: {
                patterns: [
                  {
                    name: 'comment.block.documentation.ts',
                    begin: '/\\*\\*(?!/)',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.comment.ts',
                      },
                    },
                    end: '\\*/',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.comment.ts',
                      },
                    },
                    patterns: [
                      {
                        include: '#docblock',
                      },
                    ],
                  },
                  {
                    name: 'comment.block.ts',
                    begin: '(/\\*)(?:\\s*((@)internal)(?=\\s|(\\*/)))?',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.comment.ts',
                      },
                      '2': {
                        name: 'storage.type.internaldeclaration.ts',
                      },
                      '3': {
                        name: 'punctuation.decorator.internaldeclaration.ts',
                      },
                    },
                    end: '\\*/',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.comment.ts',
                      },
                    },
                  },
                  {
                    begin: '(^[ \\t]+)?((//)(?:\\s*((@)internal)(?=\\s|$))?)',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.whitespace.comment.leading.ts',
                      },
                      '2': {
                        name: 'comment.line.double-slash.ts',
                      },
                      '3': {
                        name: 'punctuation.definition.comment.ts',
                      },
                      '4': {
                        name: 'storage.type.internaldeclaration.ts',
                      },
                      '5': {
                        name: 'punctuation.decorator.internaldeclaration.ts',
                      },
                    },
                    end: '(?=$)',
                    contentName: 'comment.line.double-slash.ts',
                  },
                ],
              },
              'single-line-comment-consuming-line-ending': {
                begin: '(^[ \\t]+)?((//)(?:\\s*((@)internal)(?=\\s|$))?)',
                beginCaptures: {
                  '1': {
                    name: 'punctuation.whitespace.comment.leading.ts',
                  },
                  '2': {
                    name: 'comment.line.double-slash.ts',
                  },
                  '3': {
                    name: 'punctuation.definition.comment.ts',
                  },
                  '4': {
                    name: 'storage.type.internaldeclaration.ts',
                  },
                  '5': {
                    name: 'punctuation.decorator.internaldeclaration.ts',
                  },
                },
                end: '(?=^)',
                contentName: 'comment.line.double-slash.ts',
              },
              directives: {
                name: 'comment.line.triple-slash.directive.ts',
                begin: "^(///)\\s*(?=<(reference|amd-dependency|amd-module)(\\s+(path|types|no-default-lib|lib|name|resolution-mode)\\s*=\\s*((\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)))+\\s*/>\\s*$)",
                beginCaptures: {
                  '1': {
                    name: 'punctuation.definition.comment.ts',
                  },
                },
                end: '(?=$)',
                patterns: [
                  {
                    name: 'meta.tag.ts',
                    begin: '(<)(reference|amd-dependency|amd-module)',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.tag.directive.ts',
                      },
                      '2': {
                        name: 'entity.name.tag.directive.ts',
                      },
                    },
                    end: '/>',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.tag.directive.ts',
                      },
                    },
                    patterns: [
                      {
                        name: 'entity.other.attribute-name.directive.ts',
                        match: 'path|types|no-default-lib|lib|name|resolution-mode',
                      },
                      {
                        name: 'keyword.operator.assignment.ts',
                        match: '=',
                      },
                      {
                        include: '#string',
                      },
                    ],
                  },
                ],
              },
              docblock: {
                patterns: [
                  {
                    match: '(?x)\n((@)(?:access|api))\n\\s+\n(private|protected|public)\n\\b',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'constant.language.access-type.jsdoc',
                      },
                    },
                  },
                  {
                    match: '(?x)\n((@)author)\n\\s+\n(\n  [^@\\s<>*/]\n  (?:[^@<>*/]|\\*[^/])*\n)\n(?:\n  \\s*\n  (<)\n  ([^>\\s]+)\n  (>)\n)?',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                      '4': {
                        name: 'punctuation.definition.bracket.angle.begin.jsdoc',
                      },
                      '5': {
                        name: 'constant.other.email.link.underline.jsdoc',
                      },
                      '6': {
                        name: 'punctuation.definition.bracket.angle.end.jsdoc',
                      },
                    },
                  },
                  {
                    match: '(?x)\n((@)borrows) \\s+\n((?:[^@\\s*/]|\\*[^/])+)    # <that namepath>\n\\s+ (as) \\s+              # as\n((?:[^@\\s*/]|\\*[^/])+)    # <this namepath>',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                      '4': {
                        name: 'keyword.operator.control.jsdoc',
                      },
                      '5': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                    },
                  },
                  {
                    name: 'meta.example.jsdoc',
                    begin: '((@)example)\\s+',
                    end: '(?=@|\\*/)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    patterns: [
                      {
                        match: '^\\s\\*\\s+',
                      },
                      {
                        contentName: 'constant.other.description.jsdoc',
                        begin: '\\G(<)caption(>)',
                        beginCaptures: {
                          '0': {
                            name: 'entity.name.tag.inline.jsdoc',
                          },
                          '1': {
                            name: 'punctuation.definition.bracket.angle.begin.jsdoc',
                          },
                          '2': {
                            name: 'punctuation.definition.bracket.angle.end.jsdoc',
                          },
                        },
                        end: '(</)caption(>)|(?=\\*/)',
                        endCaptures: {
                          '0': {
                            name: 'entity.name.tag.inline.jsdoc',
                          },
                          '1': {
                            name: 'punctuation.definition.bracket.angle.begin.jsdoc',
                          },
                          '2': {
                            name: 'punctuation.definition.bracket.angle.end.jsdoc',
                          },
                        },
                      },
                      {
                        match: '[^\\s@*](?:[^*]|\\*[^/])*',
                        captures: {
                          '0': {
                            name: 'source.embedded.ts',
                          },
                        },
                      },
                    ],
                  },
                  {
                    match: '(?x) ((@)kind) \\s+ (class|constant|event|external|file|function|member|mixin|module|namespace|typedef) \\b',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'constant.language.symbol-type.jsdoc',
                      },
                    },
                  },
                  {
                    match: '(?x)\n((@)see)\n\\s+\n(?:\n  # URL\n  (\n    (?=https?://)\n    (?:[^\\s*]|\\*[^/])+\n  )\n  |\n  # JSDoc namepath\n  (\n    (?!\n      # Avoid matching bare URIs (also acceptable as links)\n      https?://\n      |\n      # Avoid matching {@inline tags}; we match those below\n      (?:\\[[^\\[\\]]*\\])? # Possible description [preceding]{@tag}\n      {@(?:link|linkcode|linkplain|tutorial)\\b\n    )\n    # Matched namepath\n    (?:[^@\\s*/]|\\*[^/])+\n  )\n)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.link.underline.jsdoc',
                      },
                      '4': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                    },
                  },
                  {
                    match: '(?x)\n((@)template)\n\\s+\n# One or more valid identifiers\n(\n  [A-Za-z_$]         # First character: non-numeric word character\n  [\\w$.\\[\\]]*        # Rest of identifier\n  (?:                # Possible list of additional identifiers\n    \\s* , \\s*\n    [A-Za-z_$]\n    [\\w$.\\[\\]]*\n  )*\n)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.jsdoc',
                      },
                    },
                  },
                  {
                    begin: '(?x)((@)template)\\s+(?={)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                    patterns: [
                      {
                        include: '#jsdoctype',
                      },
                      {
                        name: 'variable.other.jsdoc',
                        match: '([A-Za-z_$][\\w$.\\[\\]]*)',
                      },
                    ],
                  },
                  {
                    match: '(?x)\n(\n  (@)\n  (?:arg|argument|const|constant|member|namespace|param|var)\n)\n\\s+\n(\n  [A-Za-z_$]\n  [\\w$.\\[\\]]*\n)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.jsdoc',
                      },
                    },
                  },
                  {
                    begin: '((@)typedef)\\s+(?={)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                    patterns: [
                      {
                        include: '#jsdoctype',
                      },
                      {
                        name: 'entity.name.type.instance.jsdoc',
                        match: '(?:[^@\\s*/]|\\*[^/])+',
                      },
                    ],
                  },
                  {
                    begin: '((@)(?:arg|argument|const|constant|member|namespace|param|prop|property|var))\\s+(?={)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                    patterns: [
                      {
                        include: '#jsdoctype',
                      },
                      {
                        name: 'variable.other.jsdoc',
                        match: '([A-Za-z_$][\\w$.\\[\\]]*)',
                      },
                      {
                        name: 'variable.other.jsdoc',
                        match: "(?x)\n(\\[)\\s*\n[\\w$]+\n(?:\n  (?:\\[\\])?                                        # Foo[ ].bar properties within an array\n  \\.                                                # Foo.Bar namespaced parameter\n  [\\w$]+\n)*\n(?:\n  \\s*\n  (=)                                                # [foo=bar] Default parameter value\n  \\s*\n  (\n    # The inner regexes are to stop the match early at */ and to not stop at escaped quotes\n    (?>\n      \"(?:(?:\\*(?!/))|(?:\\\\(?!\"))|[^*\\\\])*?\" |                      # [foo=\"bar\"] Double-quoted\n      '(?:(?:\\*(?!/))|(?:\\\\(?!'))|[^*\\\\])*?' |                      # [foo='bar'] Single-quoted\n      \\[ (?:(?:\\*(?!/))|[^*])*? \\] |                                # [foo=[1,2]] Array literal\n      (?:(?:\\*(?!/))|\\s(?!\\s*\\])|\\[.*?(?:\\]|(?=\\*/))|[^*\\s\\[\\]])*   # Everything else\n    )*\n  )\n)?\n\\s*(?:(\\])((?:[^*\\s]|\\*[^\\s/])+)?|(?=\\*/))",
                        captures: {
                          '1': {
                            name: 'punctuation.definition.optional-value.begin.bracket.square.jsdoc',
                          },
                          '2': {
                            name: 'keyword.operator.assignment.jsdoc',
                          },
                          '3': {
                            name: 'source.embedded.ts',
                          },
                          '4': {
                            name: 'punctuation.definition.optional-value.end.bracket.square.jsdoc',
                          },
                          '5': {
                            name: 'invalid.illegal.syntax.jsdoc',
                          },
                        },
                      },
                    ],
                  },
                  {
                    begin: '(?x)\n(\n  (@)\n  (?:define|enum|exception|export|extends|lends|implements|modifies\n  |namespace|private|protected|returns?|satisfies|suppress|this|throws|type\n  |yields?)\n)\n\\s+(?={)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                    patterns: [
                      {
                        include: '#jsdoctype',
                      },
                    ],
                  },
                  {
                    match: '(?x)\n(\n  (@)\n  (?:alias|augments|callback|constructs|emits|event|fires|exports?\n  |extends|external|function|func|host|lends|listens|interface|memberof!?\n  |method|module|mixes|mixin|name|requires|see|this|typedef|uses)\n)\n\\s+\n(\n  (?:\n    [^{}@\\s*] | \\*[^/]\n  )+\n)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                    },
                  },
                  {
                    contentName: 'variable.other.jsdoc',
                    begin: "((@)(?:default(?:value)?|license|version))\\s+(([''\"]))",
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.jsdoc',
                      },
                      '4': {
                        name: 'punctuation.definition.string.begin.jsdoc',
                      },
                    },
                    end: '(\\3)|(?=$|\\*/)',
                    endCaptures: {
                      '0': {
                        name: 'variable.other.jsdoc',
                      },
                      '1': {
                        name: 'punctuation.definition.string.end.jsdoc',
                      },
                    },
                  },
                  {
                    match: '((@)(?:default(?:value)?|license|tutorial|variation|version))\\s+([^\\s*]+)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.jsdoc',
                      },
                    },
                  },
                  {
                    name: 'storage.type.class.jsdoc',
                    match: '(?x) (@) (?:abstract|access|alias|api|arg|argument|async|attribute|augments|author|beta|borrows|bubbles |callback|chainable|class|classdesc|code|config|const|constant|constructor|constructs|copyright |default|defaultvalue|define|deprecated|desc|description|dict|emits|enum|event|example|exception |exports?|extends|extension(?:_?for)?|external|externs|file|fileoverview|final|fires|for|func |function|generator|global|hideconstructor|host|ignore|implements|implicitCast|inherit[Dd]oc |inner|instance|interface|internal|kind|lends|license|listens|main|member|memberof!?|method |mixes|mixins?|modifies|module|name|namespace|noalias|nocollapse|nocompile|nosideeffects |override|overview|package|param|polymer(?:Behavior)?|preserve|private|prop|property|protected |public|read[Oo]nly|record|require[ds]|returns?|see|since|static|struct|submodule|summary |suppress|template|this|throws|todo|tutorial|type|typedef|unrestricted|uses|var|variation |version|virtual|writeOnce|yields?) \\b',
                    captures: {
                      '1': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                  },
                  {
                    include: '#inline-tags',
                  },
                  {
                    match: '((@)(?:[_$[:alpha:]][_$[:alnum:]]*))(?=\\s+)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                  },
                ],
              },
              brackets: {
                patterns: [
                  {
                    begin: '{',
                    end: '}|(?=\\*/)',
                    patterns: [
                      {
                        include: '#brackets',
                      },
                    ],
                  },
                  {
                    begin: '\\[',
                    end: '\\]|(?=\\*/)',
                    patterns: [
                      {
                        include: '#brackets',
                      },
                    ],
                  },
                ],
              },
              'inline-tags': {
                patterns: [
                  {
                    name: 'constant.other.description.jsdoc',
                    match: '(\\[)[^\\]]+(\\])(?={@(?:link|linkcode|linkplain|tutorial))',
                    captures: {
                      '1': {
                        name: 'punctuation.definition.bracket.square.begin.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.bracket.square.end.jsdoc',
                      },
                    },
                  },
                  {
                    name: 'entity.name.type.instance.jsdoc',
                    begin: '({)((@)(?:link(?:code|plain)?|tutorial))\\s*',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.bracket.curly.begin.jsdoc',
                      },
                      '2': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '3': {
                        name: 'punctuation.definition.inline.tag.jsdoc',
                      },
                    },
                    end: '}|(?=\\*/)',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.bracket.curly.end.jsdoc',
                      },
                    },
                    patterns: [
                      {
                        match: '\\G((?=https?://)(?:[^|}\\s*]|\\*[/])+)(\\|)?',
                        captures: {
                          '1': {
                            name: 'variable.other.link.underline.jsdoc',
                          },
                          '2': {
                            name: 'punctuation.separator.pipe.jsdoc',
                          },
                        },
                      },
                      {
                        match: '\\G((?:[^{}@\\s|*]|\\*[^/])+)(\\|)?',
                        captures: {
                          '1': {
                            name: 'variable.other.description.jsdoc',
                          },
                          '2': {
                            name: 'punctuation.separator.pipe.jsdoc',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
              jsdoctype: {
                patterns: [
                  {
                    contentName: 'entity.name.type.instance.jsdoc',
                    begin: '\\G({)',
                    beginCaptures: {
                      '0': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                      '1': {
                        name: 'punctuation.definition.bracket.curly.begin.jsdoc',
                      },
                    },
                    end: '((}))\\s*|(?=\\*/)',
                    endCaptures: {
                      '1': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.bracket.curly.end.jsdoc',
                      },
                    },
                    patterns: [
                      {
                        include: '#brackets',
                      },
                    ],
                  },
                ],
              },
            },
          },
          grammarLocation: './syntaxes/TypeScript.tmLanguage.json',
          injectTo: undefined,
          embeddedLanguages: undefined,
          tokenTypes: {
            'meta.template.expression': 'other',
            'meta.template.expression string': 'string',
            'meta.template.expression comment': 'comment',
            'entity.name.type.instance.jsdoc': 'other',
            'entity.name.function.tagged-template': 'other',
            'meta.import string.quoted': 'other',
            'variable.other.jsdoc': 'other',
          },
        },
        {
          language: 'typescriptreact',
          scope: 'source.tsx',
          format: 'json',
          grammar: {
            information_for_contributors: [
              'This file has been converted from https://github.com/microsoft/TypeScript-TmLanguage/blob/master/TypeScriptReact.tmLanguage',
              'If you want to provide a fix or improvement, please create a pull request against the original repository.',
              'Once accepted there, we are happy to receive an update request.',
            ],
            version: 'https://github.com/microsoft/TypeScript-TmLanguage/commit/0d73d1117e0a9b1d6635ebbe9aa37d615171b02d',
            name: 'TypeScriptReact',
            scopeName: 'source.tsx',
            patterns: [
              {
                include: '#directives',
              },
              {
                include: '#statements',
              },
              {
                include: '#shebang',
              },
            ],
            repository: {
              shebang: {
                name: 'comment.line.shebang.tsx',
                match: '\\A(#!).*(?=$)',
                captures: {
                  '1': {
                    name: 'punctuation.definition.comment.tsx',
                  },
                },
              },
              statements: {
                patterns: [
                  {
                    include: '#declaration',
                  },
                  {
                    include: '#control-statement',
                  },
                  {
                    include: '#after-operator-block-as-object-literal',
                  },
                  {
                    include: '#decl-block',
                  },
                  {
                    include: '#label',
                  },
                  {
                    include: '#expression',
                  },
                  {
                    include: '#punctuation-semicolon',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#comment',
                  },
                ],
              },
              declaration: {
                patterns: [
                  {
                    include: '#decorator',
                  },
                  {
                    include: '#var-expr',
                  },
                  {
                    include: '#function-declaration',
                  },
                  {
                    include: '#class-declaration',
                  },
                  {
                    include: '#interface-declaration',
                  },
                  {
                    include: '#enum-declaration',
                  },
                  {
                    include: '#namespace-declaration',
                  },
                  {
                    include: '#type-alias-declaration',
                  },
                  {
                    include: '#import-equals-declaration',
                  },
                  {
                    include: '#import-declaration',
                  },
                  {
                    include: '#export-declaration',
                  },
                  {
                    name: 'storage.modifier.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(declare|export)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              'control-statement': {
                patterns: [
                  {
                    include: '#switch-statement',
                  },
                  {
                    include: '#for-loop',
                  },
                  {
                    name: 'keyword.control.trycatch.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(catch|finally|throw|try)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(break|continue|goto)\\s+([_$[:alpha:]][_$[:alnum:]]*)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    captures: {
                      '1': {
                        name: 'keyword.control.loop.tsx',
                      },
                      '2': {
                        name: 'entity.name.label.tsx',
                      },
                    },
                  },
                  {
                    name: 'keyword.control.loop.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(break|continue|do|goto|while)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(return)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.control.flow.tsx',
                      },
                    },
                    end: '(?=[;}]|$|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'keyword.control.switch.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(case|default|switch)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    include: '#if-statement',
                  },
                  {
                    name: 'keyword.control.conditional.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(else|if)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.control.with.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(with)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.control.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(package)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.other.debugger.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(debugger)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              label: {
                patterns: [
                  {
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(:)(?=\\s*\\{)',
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.label.tsx',
                      },
                      '2': {
                        name: 'punctuation.separator.label.tsx',
                      },
                    },
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#decl-block',
                      },
                    ],
                  },
                  {
                    match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(:)',
                    captures: {
                      '1': {
                        name: 'entity.name.label.tsx',
                      },
                      '2': {
                        name: 'punctuation.separator.label.tsx',
                      },
                    },
                  },
                ],
              },
              expression: {
                patterns: [
                  {
                    include: '#expressionWithoutIdentifiers',
                  },
                  {
                    include: '#identifiers',
                  },
                  {
                    include: '#expressionPunctuations',
                  },
                ],
              },
              expressionWithoutIdentifiers: {
                patterns: [
                  {
                    include: '#jsx',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#regex',
                  },
                  {
                    include: '#comment',
                  },
                  {
                    include: '#function-expression',
                  },
                  {
                    include: '#class-expression',
                  },
                  {
                    include: '#arrow-function',
                  },
                  {
                    include: '#paren-expression-possibly-arrow',
                  },
                  {
                    include: '#cast',
                  },
                  {
                    include: '#ternary-expression',
                  },
                  {
                    include: '#new-expr',
                  },
                  {
                    include: '#instanceof-expr',
                  },
                  {
                    include: '#object-literal',
                  },
                  {
                    include: '#expression-operators',
                  },
                  {
                    include: '#function-call',
                  },
                  {
                    include: '#literal',
                  },
                  {
                    include: '#support-objects',
                  },
                  {
                    include: '#paren-expression',
                  },
                ],
              },
              expressionPunctuations: {
                patterns: [
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    include: '#punctuation-accessor',
                  },
                ],
              },
              decorator: {
                name: 'meta.decorator.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))\\@',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.decorator.tsx',
                  },
                },
                end: '(?=\\s)',
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              'var-expr': {
                patterns: [
                  {
                    name: 'meta.var.expr.tsx',
                    begin: '(?=(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(var|let)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))',
                    end: '(?!(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(var|let)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))((?=;|}|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+)|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))|((?<!^let|[^\\._$[:alnum:]]let|^var|[^\\._$[:alnum:]]var)(?=\\s*$)))',
                    patterns: [
                      {
                        begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(var|let)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*',
                        beginCaptures: {
                          '1': {
                            name: 'keyword.control.export.tsx',
                          },
                          '2': {
                            name: 'storage.modifier.tsx',
                          },
                          '3': {
                            name: 'storage.type.tsx',
                          },
                        },
                        end: '(?=\\S)',
                      },
                      {
                        include: '#destructuring-variable',
                      },
                      {
                        include: '#var-single-variable',
                      },
                      {
                        include: '#variable-initializer',
                      },
                      {
                        include: '#comment',
                      },
                      {
                        begin: '(,)\\s*((?!\\S)|(?=\\/\\/))',
                        beginCaptures: {
                          '1': {
                            name: 'punctuation.separator.comma.tsx',
                          },
                        },
                        end: '(?<!,)(((?==|;|}|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+)|^\\s*$))|((?<=\\S)(?=\\s*$)))',
                        patterns: [
                          {
                            include: '#single-line-comment-consuming-line-ending',
                          },
                          {
                            include: '#comment',
                          },
                          {
                            include: '#destructuring-variable',
                          },
                          {
                            include: '#var-single-variable',
                          },
                          {
                            include: '#punctuation-comma',
                          },
                        ],
                      },
                      {
                        include: '#punctuation-comma',
                      },
                    ],
                  },
                  {
                    name: 'meta.var.expr.tsx',
                    begin: '(?=(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(const(?!\\s+enum\\b))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.tsx',
                      },
                      '2': {
                        name: 'storage.modifier.tsx',
                      },
                      '3': {
                        name: 'storage.type.tsx',
                      },
                    },
                    end: '(?!(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(const(?!\\s+enum\\b))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))((?=;|}|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+)|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))|((?<!^const|[^\\._$[:alnum:]]const)(?=\\s*$)))',
                    patterns: [
                      {
                        begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(const(?!\\s+enum\\b))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*',
                        beginCaptures: {
                          '1': {
                            name: 'keyword.control.export.tsx',
                          },
                          '2': {
                            name: 'storage.modifier.tsx',
                          },
                          '3': {
                            name: 'storage.type.tsx',
                          },
                        },
                        end: '(?=\\S)',
                      },
                      {
                        include: '#destructuring-const',
                      },
                      {
                        include: '#var-single-const',
                      },
                      {
                        include: '#variable-initializer',
                      },
                      {
                        include: '#comment',
                      },
                      {
                        begin: '(,)\\s*((?!\\S)|(?=\\/\\/))',
                        beginCaptures: {
                          '1': {
                            name: 'punctuation.separator.comma.tsx',
                          },
                        },
                        end: '(?<!,)(((?==|;|}|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+)|^\\s*$))|((?<=\\S)(?=\\s*$)))',
                        patterns: [
                          {
                            include: '#single-line-comment-consuming-line-ending',
                          },
                          {
                            include: '#comment',
                          },
                          {
                            include: '#destructuring-const',
                          },
                          {
                            include: '#var-single-const',
                          },
                          {
                            include: '#punctuation-comma',
                          },
                        ],
                      },
                      {
                        include: '#punctuation-comma',
                      },
                    ],
                  },
                ],
              },
              'var-single-variable': {
                patterns: [
                  {
                    name: 'meta.var-single-variable.expr.tsx',
                    begin: "(?x)([_$[:alpha:]][_$[:alnum:]]*)(\\!)?(?=\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.tsx entity.name.function.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.definiteassignment.tsx',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                  {
                    name: 'meta.var-single-variable.expr.tsx',
                    begin: '([[:upper:]][_$[:digit:][:upper:]]*)(?![_$[:alnum:]])(\\!)?',
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.tsx variable.other.constant.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.definiteassignment.tsx',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                  {
                    name: 'meta.var-single-variable.expr.tsx',
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)(\\!)?',
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.tsx variable.other.readwrite.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.definiteassignment.tsx',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                ],
              },
              'var-single-const': {
                patterns: [
                  {
                    name: 'meta.var-single-variable.expr.tsx',
                    begin: "(?x)([_$[:alpha:]][_$[:alnum:]]*)(?=\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.tsx variable.other.constant.tsx entity.name.function.tsx',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                  {
                    name: 'meta.var-single-variable.expr.tsx',
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)',
                    beginCaptures: {
                      '1': {
                        name: 'meta.definition.variable.tsx variable.other.constant.tsx',
                      },
                    },
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#var-single-variable-type-annotation',
                      },
                    ],
                  },
                ],
              },
              'var-single-variable-type-annotation': {
                patterns: [
                  {
                    include: '#type-annotation',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#comment',
                  },
                ],
              },
              'destructuring-variable': {
                patterns: [
                  {
                    name: 'meta.object-binding-pattern-variable.tsx',
                    begin: '(?<!=|:|^of|[^\\._$[:alnum:]]of|^in|[^\\._$[:alnum:]]in)\\s*(?=\\{)',
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#object-binding-pattern',
                      },
                      {
                        include: '#type-annotation',
                      },
                      {
                        include: '#comment',
                      },
                    ],
                  },
                  {
                    name: 'meta.array-binding-pattern-variable.tsx',
                    begin: '(?<!=|:|^of|[^\\._$[:alnum:]]of|^in|[^\\._$[:alnum:]]in)\\s*(?=\\[)',
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#array-binding-pattern',
                      },
                      {
                        include: '#type-annotation',
                      },
                      {
                        include: '#comment',
                      },
                    ],
                  },
                ],
              },
              'destructuring-const': {
                patterns: [
                  {
                    name: 'meta.object-binding-pattern-variable.tsx',
                    begin: '(?<!=|:|^of|[^\\._$[:alnum:]]of|^in|[^\\._$[:alnum:]]in)\\s*(?=\\{)',
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#object-binding-pattern-const',
                      },
                      {
                        include: '#type-annotation',
                      },
                      {
                        include: '#comment',
                      },
                    ],
                  },
                  {
                    name: 'meta.array-binding-pattern-variable.tsx',
                    begin: '(?<!=|:|^of|[^\\._$[:alnum:]]of|^in|[^\\._$[:alnum:]]in)\\s*(?=\\[)',
                    end: '(?=$|^|[;,=}]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#array-binding-pattern-const',
                      },
                      {
                        include: '#type-annotation',
                      },
                      {
                        include: '#comment',
                      },
                    ],
                  },
                ],
              },
              'object-binding-element': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(:))",
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        include: '#object-binding-element-propertyName',
                      },
                      {
                        include: '#binding-element',
                      },
                    ],
                  },
                  {
                    include: '#object-binding-pattern',
                  },
                  {
                    include: '#destructuring-variable-rest',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'object-binding-element-const': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(:))",
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        include: '#object-binding-element-propertyName',
                      },
                      {
                        include: '#binding-element-const',
                      },
                    ],
                  },
                  {
                    include: '#object-binding-pattern-const',
                  },
                  {
                    include: '#destructuring-variable-rest-const',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'object-binding-element-propertyName': {
                begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(:))",
                end: '(:)',
                endCaptures: {
                  '0': {
                    name: 'punctuation.destructuring.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#string',
                  },
                  {
                    include: '#array-literal',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    name: 'variable.object.property.tsx',
                    match: '([_$[:alpha:]][_$[:alnum:]]*)',
                  },
                ],
              },
              'binding-element': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#regex',
                  },
                  {
                    include: '#object-binding-pattern',
                  },
                  {
                    include: '#array-binding-pattern',
                  },
                  {
                    include: '#destructuring-variable-rest',
                  },
                  {
                    include: '#variable-initializer',
                  },
                ],
              },
              'binding-element-const': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#regex',
                  },
                  {
                    include: '#object-binding-pattern-const',
                  },
                  {
                    include: '#array-binding-pattern-const',
                  },
                  {
                    include: '#destructuring-variable-rest-const',
                  },
                  {
                    include: '#variable-initializer',
                  },
                ],
              },
              'destructuring-variable-rest': {
                match: '(?:(\\.\\.\\.)\\s*)?([_$[:alpha:]][_$[:alnum:]]*)',
                captures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'meta.definition.variable.tsx variable.other.readwrite.tsx',
                  },
                },
              },
              'destructuring-variable-rest-const': {
                match: '(?:(\\.\\.\\.)\\s*)?([_$[:alpha:]][_$[:alnum:]]*)',
                captures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'meta.definition.variable.tsx variable.other.constant.tsx',
                  },
                },
              },
              'object-binding-pattern': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.object.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.object.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#object-binding-element',
                  },
                ],
              },
              'object-binding-pattern-const': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.object.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.object.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#object-binding-element-const',
                  },
                ],
              },
              'array-binding-pattern': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\[)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.array.tsx',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.array.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#binding-element',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'array-binding-pattern-const': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\[)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.array.tsx',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.array.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#binding-element-const',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'parameter-name': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|protected|private|readonly)\\s+(?=(override|public|protected|private|readonly)\\s+)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                    },
                  },
                  {
                    match: "(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*(\\??)(?=\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.rest.tsx',
                      },
                      '3': {
                        name: 'entity.name.function.tsx variable.language.this.tsx',
                      },
                      '4': {
                        name: 'entity.name.function.tsx',
                      },
                      '5': {
                        name: 'keyword.operator.optional.tsx',
                      },
                    },
                  },
                  {
                    match: '(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*(\\??)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.rest.tsx',
                      },
                      '3': {
                        name: 'variable.parameter.tsx variable.language.this.tsx',
                      },
                      '4': {
                        name: 'variable.parameter.tsx',
                      },
                      '5': {
                        name: 'keyword.operator.optional.tsx',
                      },
                    },
                  },
                ],
              },
              'destructuring-parameter': {
                patterns: [
                  {
                    name: 'meta.parameter.object-binding-pattern.tsx',
                    begin: '(?<!=|:)\\s*(?:(\\.\\.\\.)\\s*)?(\\{)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.rest.tsx',
                      },
                      '2': {
                        name: 'punctuation.definition.binding-pattern.object.tsx',
                      },
                    },
                    end: '\\}',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.binding-pattern.object.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#parameter-object-binding-element',
                      },
                    ],
                  },
                  {
                    name: 'meta.paramter.array-binding-pattern.tsx',
                    begin: '(?<!=|:)\\s*(?:(\\.\\.\\.)\\s*)?(\\[)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.rest.tsx',
                      },
                      '2': {
                        name: 'punctuation.definition.binding-pattern.array.tsx',
                      },
                    },
                    end: '\\]',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.binding-pattern.array.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#parameter-binding-element',
                      },
                      {
                        include: '#punctuation-comma',
                      },
                    ],
                  },
                ],
              },
              'parameter-object-binding-element': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(:))",
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        include: '#object-binding-element-propertyName',
                      },
                      {
                        include: '#parameter-binding-element',
                      },
                      {
                        include: '#paren-expression',
                      },
                    ],
                  },
                  {
                    include: '#parameter-object-binding-pattern',
                  },
                  {
                    include: '#destructuring-parameter-rest',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'parameter-binding-element': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#regex',
                  },
                  {
                    include: '#parameter-object-binding-pattern',
                  },
                  {
                    include: '#parameter-array-binding-pattern',
                  },
                  {
                    include: '#destructuring-parameter-rest',
                  },
                  {
                    include: '#variable-initializer',
                  },
                ],
              },
              'destructuring-parameter-rest': {
                match: '(?:(\\.\\.\\.)\\s*)?([_$[:alpha:]][_$[:alnum:]]*)',
                captures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'variable.parameter.tsx',
                  },
                },
              },
              'parameter-object-binding-pattern': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.object.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.object.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#parameter-object-binding-element',
                  },
                ],
              },
              'parameter-array-binding-pattern': {
                begin: '(?:(\\.\\.\\.)\\s*)?(\\[)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.rest.tsx',
                  },
                  '2': {
                    name: 'punctuation.definition.binding-pattern.array.tsx',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.binding-pattern.array.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#parameter-binding-element',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'field-declaration': {
                name: 'meta.field.declaration.tsx',
                begin: "(?x)(?<!\\()(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(readonly)\\s+)?(?=\\s*((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|(\\#?[_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(?:(?:(\\?)|(\\!))\\s*)?(=|:|;|,|\\}|$))",
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.tsx',
                  },
                },
                end: "(?x)(?=\\}|;|,|$|(^(?!\\s*((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|(\\#?[_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(?:(?:(\\?)|(\\!))\\s*)?(=|:|;|,|$))))|(?<=\\})",
                patterns: [
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#array-literal',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#comment',
                  },
                  {
                    match: "(?x)(\\#?[_$[:alpha:]][_$[:alnum:]]*)(?:(\\?)|(\\!))?(?=\\s*\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    captures: {
                      '1': {
                        name: 'meta.definition.property.tsx entity.name.function.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.optional.tsx',
                      },
                      '3': {
                        name: 'keyword.operator.definiteassignment.tsx',
                      },
                    },
                  },
                  {
                    name: 'meta.definition.property.tsx variable.object.property.tsx',
                    match: '\\#?[_$[:alpha:]][_$[:alnum:]]*',
                  },
                  {
                    name: 'keyword.operator.optional.tsx',
                    match: '\\?',
                  },
                  {
                    name: 'keyword.operator.definiteassignment.tsx',
                    match: '\\!',
                  },
                ],
              },
              'variable-initializer': {
                patterns: [
                  {
                    begin: '(?<!=|!)(=)(?!=)(?=\\s*\\S)(?!\\s*.*=>\\s*$)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.tsx',
                      },
                    },
                    end: '(?=$|^|[,);}\\]]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    begin: '(?<!=|!)(=)(?!=)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.tsx',
                      },
                    },
                    end: '(?=[,);}\\]]|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(of|in)\\s+))|(?=^\\s*$)|(?<![\\|\\&\\+\\-\\*\\/])(?<=\\S)(?<!=)(?=\\s*$)',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                ],
              },
              'function-declaration': {
                name: 'meta.function.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?(?:(async)\\s+)?(function\\b)(?:\\s*(\\*))?(?:(?:\\s+|(?<=\\*))([_$[:alpha:]][_$[:alnum:]]*))?\\s*',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.tsx',
                  },
                  '2': {
                    name: 'storage.modifier.tsx',
                  },
                  '3': {
                    name: 'storage.modifier.async.tsx',
                  },
                  '4': {
                    name: 'storage.type.function.tsx',
                  },
                  '5': {
                    name: 'keyword.generator.asterisk.tsx',
                  },
                  '6': {
                    name: 'meta.definition.function.tsx entity.name.function.tsx',
                  },
                },
                end: '(?=;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))|(?<=\\})',
                patterns: [
                  {
                    include: '#function-name',
                  },
                  {
                    include: '#function-body',
                  },
                ],
              },
              'function-expression': {
                name: 'meta.function.expression.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(async)\\s+)?(function\\b)(?:\\s*(\\*))?(?:(?:\\s+|(?<=\\*))([_$[:alpha:]][_$[:alnum:]]*))?\\s*',
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.async.tsx',
                  },
                  '2': {
                    name: 'storage.type.function.tsx',
                  },
                  '3': {
                    name: 'keyword.generator.asterisk.tsx',
                  },
                  '4': {
                    name: 'meta.definition.function.tsx entity.name.function.tsx',
                  },
                },
                end: '(?=;)|(?<=\\})',
                patterns: [
                  {
                    include: '#function-name',
                  },
                  {
                    include: '#single-line-comment-consuming-line-ending',
                  },
                  {
                    include: '#function-body',
                  },
                ],
              },
              'function-name': {
                name: 'meta.definition.function.tsx entity.name.function.tsx',
                match: '[_$[:alpha:]][_$[:alnum:]]*',
              },
              'function-body': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#function-parameters',
                  },
                  {
                    include: '#return-type',
                  },
                  {
                    include: '#type-function-return-type',
                  },
                  {
                    include: '#decl-block',
                  },
                  {
                    name: 'keyword.generator.asterisk.tsx',
                    match: '\\*',
                  },
                ],
              },
              'method-declaration': {
                patterns: [
                  {
                    name: 'meta.method.declaration.tsx',
                    begin: '(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(override)\\s+)?(?:\\b(public|private|protected)\\s+)?(?:\\b(abstract)\\s+)?(?:\\b(async)\\s+)?\\s*\\b(constructor)\\b(?!:)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'storage.modifier.tsx',
                      },
                      '3': {
                        name: 'storage.modifier.tsx',
                      },
                      '4': {
                        name: 'storage.modifier.async.tsx',
                      },
                      '5': {
                        name: 'storage.type.tsx',
                      },
                    },
                    end: '(?=\\}|;|,|$)|(?<=\\})',
                    patterns: [
                      {
                        include: '#method-declaration-name',
                      },
                      {
                        include: '#function-body',
                      },
                    ],
                  },
                  {
                    name: 'meta.method.declaration.tsx',
                    begin: '(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(override)\\s+)?(?:\\b(public|private|protected)\\s+)?(?:\\b(abstract)\\s+)?(?:\\b(async)\\s+)?(?:(?:\\s*\\b(new)\\b(?!:)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))|(?:(\\*)\\s*)?)(?=\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?[\\(])',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'storage.modifier.tsx',
                      },
                      '3': {
                        name: 'storage.modifier.tsx',
                      },
                      '4': {
                        name: 'storage.modifier.async.tsx',
                      },
                      '5': {
                        name: 'keyword.operator.new.tsx',
                      },
                      '6': {
                        name: 'keyword.generator.asterisk.tsx',
                      },
                    },
                    end: '(?=\\}|;|,|$)|(?<=\\})',
                    patterns: [
                      {
                        include: '#method-declaration-name',
                      },
                      {
                        include: '#function-body',
                      },
                    ],
                  },
                  {
                    name: 'meta.method.declaration.tsx',
                    begin: "(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(override)\\s+)?(?:\\b(public|private|protected)\\s+)?(?:\\b(abstract)\\s+)?(?:\\b(async)\\s+)?(?:\\b(get|set)\\s+)?(?:(\\*)\\s*)?(?=\\s*(((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(\\??))\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?[\\(])",
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'storage.modifier.tsx',
                      },
                      '3': {
                        name: 'storage.modifier.tsx',
                      },
                      '4': {
                        name: 'storage.modifier.async.tsx',
                      },
                      '5': {
                        name: 'storage.type.property.tsx',
                      },
                      '6': {
                        name: 'keyword.generator.asterisk.tsx',
                      },
                    },
                    end: '(?=\\}|;|,|$)|(?<=\\})',
                    patterns: [
                      {
                        include: '#method-declaration-name',
                      },
                      {
                        include: '#function-body',
                      },
                    ],
                  },
                ],
              },
              'object-literal-method-declaration': {
                name: 'meta.method.declaration.tsx',
                begin: "(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(async)\\s+)?(?:\\b(get|set)\\s+)?(?:(\\*)\\s*)?(?=\\s*(((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(\\??))\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?[\\(])",
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.async.tsx',
                  },
                  '2': {
                    name: 'storage.type.property.tsx',
                  },
                  '3': {
                    name: 'keyword.generator.asterisk.tsx',
                  },
                },
                end: '(?=\\}|;|,)|(?<=\\})',
                patterns: [
                  {
                    include: '#method-declaration-name',
                  },
                  {
                    include: '#function-body',
                  },
                  {
                    begin: "(?x)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(async)\\s+)?(?:\\b(get|set)\\s+)?(?:(\\*)\\s*)?(?=\\s*(((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(\\??))\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?[\\(])",
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.async.tsx',
                      },
                      '2': {
                        name: 'storage.type.property.tsx',
                      },
                      '3': {
                        name: 'keyword.generator.asterisk.tsx',
                      },
                    },
                    end: '(?=\\(|\\<)',
                    patterns: [
                      {
                        include: '#method-declaration-name',
                      },
                    ],
                  },
                ],
              },
              'method-declaration-name': {
                begin: "(?x)(?=((\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$))|([_$[:alpha:]][_$[:alnum:]]*)|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\]))\\s*(\\??)\\s*[\\(\\<])",
                end: '(?=\\(|\\<)',
                patterns: [
                  {
                    include: '#string',
                  },
                  {
                    include: '#array-literal',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    name: 'meta.definition.method.tsx entity.name.function.tsx',
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                  },
                  {
                    name: 'keyword.operator.optional.tsx',
                    match: '\\?',
                  },
                ],
              },
              'arrow-function': {
                patterns: [
                  {
                    name: 'meta.arrow.tsx',
                    match: '(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(\\basync)\\s+)?([_$[:alpha:]][_$[:alnum:]]*)\\s*(?==>)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.async.tsx',
                      },
                      '2': {
                        name: 'variable.parameter.tsx',
                      },
                    },
                  },
                  {
                    name: 'meta.arrow.tsx',
                    begin: "(?x) (?:\n  (?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(\\basync)\n)? ((?<![})!\\]])\\s*\n  (?=\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  )\n)",
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.async.tsx',
                      },
                    },
                    end: '(?==>|\\{|(^\\s*(export|function|class|interface|let|var|const|import|enum|namespace|module|type|abstract|declare)\\s+))',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#type-parameters',
                      },
                      {
                        include: '#function-parameters',
                      },
                      {
                        include: '#arrow-return-type',
                      },
                      {
                        include: '#possibly-arrow-return-type',
                      },
                    ],
                  },
                  {
                    name: 'meta.arrow.tsx',
                    begin: '=>',
                    beginCaptures: {
                      '0': {
                        name: 'storage.type.function.arrow.tsx',
                      },
                    },
                    end: '((?<=\\}|\\S)(?<!=>)|((?!\\{)(?=\\S)))(?!\\/[\\/\\*])',
                    patterns: [
                      {
                        include: '#single-line-comment-consuming-line-ending',
                      },
                      {
                        include: '#decl-block',
                      },
                      {
                        include: '#expression',
                      },
                    ],
                  },
                ],
              },
              'indexer-declaration': {
                name: 'meta.indexer.declaration.tsx',
                begin: '(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(readonly)\\s*)?\\s*(\\[)\\s*([_$[:alpha:]][_$[:alnum:]]*)\\s*(?=:)',
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.tsx',
                  },
                  '2': {
                    name: 'meta.brace.square.tsx',
                  },
                  '3': {
                    name: 'variable.parameter.tsx',
                  },
                },
                end: '(\\])\\s*(\\?\\s*)?|$',
                endCaptures: {
                  '1': {
                    name: 'meta.brace.square.tsx',
                  },
                  '2': {
                    name: 'keyword.operator.optional.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#type-annotation',
                  },
                ],
              },
              'indexer-mapped-type-declaration': {
                name: 'meta.indexer.mappedtype.declaration.tsx',
                begin: '(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))([+-])?(readonly)\\s*)?\\s*(\\[)\\s*([_$[:alpha:]][_$[:alnum:]]*)\\s+(in)\\s+',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.type.modifier.tsx',
                  },
                  '2': {
                    name: 'storage.modifier.tsx',
                  },
                  '3': {
                    name: 'meta.brace.square.tsx',
                  },
                  '4': {
                    name: 'entity.name.type.tsx',
                  },
                  '5': {
                    name: 'keyword.operator.expression.in.tsx',
                  },
                },
                end: '(\\])([+-])?\\s*(\\?\\s*)?|$',
                endCaptures: {
                  '1': {
                    name: 'meta.brace.square.tsx',
                  },
                  '2': {
                    name: 'keyword.operator.type.modifier.tsx',
                  },
                  '3': {
                    name: 'keyword.operator.optional.tsx',
                  },
                },
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as)\\s+',
                    captures: {
                      '1': {
                        name: 'keyword.control.as.tsx',
                      },
                    },
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'function-parameters': {
                name: 'meta.parameters.tsx',
                begin: '\\(',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.parameters.begin.tsx',
                  },
                },
                end: '\\)',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.parameters.end.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#function-parameters-body',
                  },
                ],
              },
              'function-parameters-body': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#decorator',
                  },
                  {
                    include: '#destructuring-parameter',
                  },
                  {
                    include: '#parameter-name',
                  },
                  {
                    include: '#parameter-type-annotation',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    name: 'punctuation.separator.parameter.tsx',
                    match: ',',
                  },
                ],
              },
              'class-declaration': {
                name: 'meta.class.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(?:(abstract)\\s+)?\\b(class)\\b(?=\\s+|/[/*])',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.tsx',
                  },
                  '2': {
                    name: 'storage.modifier.tsx',
                  },
                  '3': {
                    name: 'storage.modifier.tsx',
                  },
                  '4': {
                    name: 'storage.type.class.tsx',
                  },
                },
                end: '(?<=\\})',
                patterns: [
                  {
                    include: '#class-declaration-or-expression-patterns',
                  },
                ],
              },
              'class-expression': {
                name: 'meta.class.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(abstract)\\s+)?(class)\\b(?=\\s+|[<{]|\\/[\\/*])',
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.tsx',
                  },
                  '2': {
                    name: 'storage.type.class.tsx',
                  },
                },
                end: '(?<=\\})',
                patterns: [
                  {
                    include: '#class-declaration-or-expression-patterns',
                  },
                ],
              },
              'class-declaration-or-expression-patterns': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#class-or-interface-heritage',
                  },
                  {
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                    captures: {
                      '0': {
                        name: 'entity.name.type.class.tsx',
                      },
                    },
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#class-or-interface-body',
                  },
                ],
              },
              'interface-declaration': {
                name: 'meta.interface.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(?:(abstract)\\s+)?\\b(interface)\\b(?=\\s+|/[/*])',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.tsx',
                  },
                  '2': {
                    name: 'storage.modifier.tsx',
                  },
                  '3': {
                    name: 'storage.modifier.tsx',
                  },
                  '4': {
                    name: 'storage.type.interface.tsx',
                  },
                },
                end: '(?<=\\})',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#class-or-interface-heritage',
                  },
                  {
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                    captures: {
                      '0': {
                        name: 'entity.name.type.interface.tsx',
                      },
                    },
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#class-or-interface-body',
                  },
                ],
              },
              'class-or-interface-heritage': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:\\b(extends|implements)\\b)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '1': {
                    name: 'storage.modifier.tsx',
                  },
                },
                end: '(?=\\{)',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#class-or-interface-heritage',
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#expressionWithoutIdentifiers',
                  },
                  {
                    match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))(?=\\s*[_$[:alpha:]][_$[:alnum:]]*(\\s*\\??\\.\\s*[_$[:alpha:]][_$[:alnum:]]*)*\\s*)',
                    captures: {
                      '1': {
                        name: 'entity.name.type.module.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                    },
                  },
                  {
                    match: '([_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'entity.other.inherited-class.tsx',
                      },
                    },
                  },
                  {
                    include: '#expressionPunctuations',
                  },
                ],
              },
              'class-or-interface-body': {
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#decorator',
                  },
                  {
                    begin: '(?<=:)\\s*',
                    end: '(?=\\s|[;),}\\]:\\-\\+]|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    include: '#method-declaration',
                  },
                  {
                    include: '#indexer-declaration',
                  },
                  {
                    include: '#field-declaration',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    include: '#access-modifier',
                  },
                  {
                    include: '#property-accessor',
                  },
                  {
                    include: '#async-modifier',
                  },
                  {
                    include: '#after-operator-block-as-object-literal',
                  },
                  {
                    include: '#decl-block',
                  },
                  {
                    include: '#expression',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    include: '#punctuation-semicolon',
                  },
                ],
              },
              'access-modifier': {
                name: 'storage.modifier.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(abstract|declare|override|public|protected|private|readonly|static)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'property-accessor': {
                name: 'storage.type.property.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(accessor|get|set)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'async-modifier': {
                name: 'storage.modifier.async.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(async)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'enum-declaration': {
                name: 'meta.enum.declaration.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?(?:\\b(const)\\s+)?\\b(enum)\\s+([_$[:alpha:]][_$[:alnum:]]*)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.tsx',
                  },
                  '2': {
                    name: 'storage.modifier.tsx',
                  },
                  '3': {
                    name: 'storage.modifier.tsx',
                  },
                  '4': {
                    name: 'storage.type.enum.tsx',
                  },
                  '5': {
                    name: 'entity.name.type.enum.tsx',
                  },
                },
                end: '(?<=\\})',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: '\\{',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.block.tsx',
                      },
                    },
                    end: '\\}',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.block.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        begin: '([_$[:alpha:]][_$[:alnum:]]*)',
                        beginCaptures: {
                          '0': {
                            name: 'variable.other.enummember.tsx',
                          },
                        },
                        end: '(?=,|\\}|$)',
                        patterns: [
                          {
                            include: '#comment',
                          },
                          {
                            include: '#variable-initializer',
                          },
                        ],
                      },
                      {
                        begin: "(?=((\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])+\\])))",
                        end: '(?=,|\\}|$)',
                        patterns: [
                          {
                            include: '#string',
                          },
                          {
                            include: '#array-literal',
                          },
                          {
                            include: '#comment',
                          },
                          {
                            include: '#variable-initializer',
                          },
                        ],
                      },
                      {
                        include: '#punctuation-comma',
                      },
                    ],
                  },
                ],
              },
              'namespace-declaration': {
                name: 'meta.namespace.declaration.tsx',
                begin: "(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(namespace|module)\\s+(?=[_$[:alpha:]\"'`]))",
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.tsx',
                  },
                  '2': {
                    name: 'storage.modifier.tsx',
                  },
                  '3': {
                    name: 'storage.type.namespace.tsx',
                  },
                },
                end: '(?<=\\})|(?=;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    name: 'entity.name.type.module.tsx',
                    match: '([_$[:alpha:]][_$[:alnum:]]*)',
                  },
                  {
                    include: '#punctuation-accessor',
                  },
                  {
                    include: '#decl-block',
                  },
                ],
              },
              'type-alias-declaration': {
                name: 'meta.type.declaration.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(type)\\b\\s+([_$[:alpha:]][_$[:alnum:]]*)\\s*',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.tsx',
                  },
                  '2': {
                    name: 'storage.modifier.tsx',
                  },
                  '3': {
                    name: 'storage.type.type.tsx',
                  },
                  '4': {
                    name: 'entity.name.type.alias.tsx',
                  },
                },
                end: '(?=\\}|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    begin: '(=)\\s*(intrinsic)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.tsx',
                      },
                      '2': {
                        name: 'keyword.control.intrinsic.tsx',
                      },
                    },
                    end: '(?=\\}|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    begin: '(=)\\s*',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.tsx',
                      },
                    },
                    end: '(?=\\}|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'import-equals-declaration': {
                patterns: [
                  {
                    name: 'meta.import-equals.external.tsx',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(import)(?:\\s+(type))?\\s+([_$[:alpha:]][_$[:alnum:]]*)\\s*(=)\\s*(require)\\s*(\\()',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.tsx',
                      },
                      '2': {
                        name: 'storage.modifier.tsx',
                      },
                      '3': {
                        name: 'keyword.control.import.tsx',
                      },
                      '4': {
                        name: 'keyword.control.type.tsx',
                      },
                      '5': {
                        name: 'variable.other.readwrite.alias.tsx',
                      },
                      '6': {
                        name: 'keyword.operator.assignment.tsx',
                      },
                      '7': {
                        name: 'keyword.control.require.tsx',
                      },
                      '8': {
                        name: 'meta.brace.round.tsx',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'meta.brace.round.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#string',
                      },
                    ],
                  },
                  {
                    name: 'meta.import-equals.internal.tsx',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(import)(?:\\s+(type))?\\s+([_$[:alpha:]][_$[:alnum:]]*)\\s*(=)\\s*(?!require\\b)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.tsx',
                      },
                      '2': {
                        name: 'storage.modifier.tsx',
                      },
                      '3': {
                        name: 'keyword.control.import.tsx',
                      },
                      '4': {
                        name: 'keyword.control.type.tsx',
                      },
                      '5': {
                        name: 'variable.other.readwrite.alias.tsx',
                      },
                      '6': {
                        name: 'keyword.operator.assignment.tsx',
                      },
                    },
                    end: '(?=;|$|^)',
                    patterns: [
                      {
                        include: '#single-line-comment-consuming-line-ending',
                      },
                      {
                        include: '#comment',
                      },
                      {
                        match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))',
                        captures: {
                          '1': {
                            name: 'entity.name.type.module.tsx',
                          },
                          '2': {
                            name: 'punctuation.accessor.tsx',
                          },
                          '3': {
                            name: 'punctuation.accessor.optional.tsx',
                          },
                        },
                      },
                      {
                        name: 'variable.other.readwrite.tsx',
                        match: '([_$[:alpha:]][_$[:alnum:]]*)',
                      },
                    ],
                  },
                ],
              },
              'import-declaration': {
                name: 'meta.import.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(\\bexport)\\s+)?(?:(\\bdeclare)\\s+)?\\b(import)(?:\\s+(type)(?!\\s+from))?(?!\\s*[:\\(])(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.export.tsx',
                  },
                  '2': {
                    name: 'storage.modifier.tsx',
                  },
                  '3': {
                    name: 'keyword.control.import.tsx',
                  },
                  '4': {
                    name: 'keyword.control.type.tsx',
                  },
                },
                end: '(?<!^import|[^\\._$[:alnum:]]import)(?=;|$|^)',
                patterns: [
                  {
                    include: '#single-line-comment-consuming-line-ending',
                  },
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    begin: "(?<=^import|[^\\._$[:alnum:]]import)(?!\\s*[\"'])",
                    end: '\\bfrom\\b',
                    endCaptures: {
                      '0': {
                        name: 'keyword.control.from.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#import-export-declaration',
                      },
                    ],
                  },
                  {
                    include: '#import-export-declaration',
                  },
                ],
              },
              'export-declaration': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(export)\\s+(as)\\s+(namespace)\\s+([_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'keyword.control.export.tsx',
                      },
                      '2': {
                        name: 'keyword.control.as.tsx',
                      },
                      '3': {
                        name: 'storage.type.namespace.tsx',
                      },
                      '4': {
                        name: 'entity.name.type.module.tsx',
                      },
                    },
                  },
                  {
                    name: 'meta.export.default.tsx',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(export)(?:\\s+(type))?(?:(?:\\s*(=))|(?:\\s+(default)(?=\\s+)))',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.tsx',
                      },
                      '2': {
                        name: 'keyword.control.type.tsx',
                      },
                      '3': {
                        name: 'keyword.operator.assignment.tsx',
                      },
                      '4': {
                        name: 'keyword.control.default.tsx',
                      },
                    },
                    end: '(?=$|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#interface-declaration',
                      },
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'meta.export.tsx',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(export)(?:\\s+(type))?\\b(?!(\\$)|(\\s*:))((?=\\s*[\\{*])|((?=\\s*[_$[:alpha:]][_$[:alnum:]]*(\\s|,))(?!\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b)))',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.export.tsx',
                      },
                      '2': {
                        name: 'keyword.control.type.tsx',
                      },
                    },
                    end: '(?=$|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                    patterns: [
                      {
                        include: '#import-export-declaration',
                      },
                    ],
                  },
                ],
              },
              'import-export-declaration': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#import-export-block',
                  },
                  {
                    name: 'keyword.control.from.tsx',
                    match: '\\bfrom\\b',
                  },
                  {
                    include: '#import-export-assert-clause',
                  },
                  {
                    include: '#import-export-clause',
                  },
                ],
              },
              'import-export-assert-clause': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(assert)\\s*(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.control.assert.tsx',
                  },
                  '2': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    name: 'meta.object-literal.key.tsx',
                    match: '(?:[_$[:alpha:]][_$[:alnum:]]*)\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*:)',
                  },
                  {
                    name: 'punctuation.separator.key-value.tsx',
                    match: ':',
                  },
                ],
              },
              'import-export-block': {
                name: 'meta.block.tsx',
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#import-export-clause',
                  },
                ],
              },
              'import-export-clause': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(?:(\\btype)\\s+)?(?:(\\bdefault)|(\\*)|(\\b[_$[:alpha:]][_$[:alnum:]]*)))\\s+(as)\\s+(?:(default(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))|([_$[:alpha:]][_$[:alnum:]]*))',
                    captures: {
                      '1': {
                        name: 'keyword.control.type.tsx',
                      },
                      '2': {
                        name: 'keyword.control.default.tsx',
                      },
                      '3': {
                        name: 'constant.language.import-export-all.tsx',
                      },
                      '4': {
                        name: 'variable.other.readwrite.tsx',
                      },
                      '5': {
                        name: 'keyword.control.as.tsx',
                      },
                      '6': {
                        name: 'keyword.control.default.tsx',
                      },
                      '7': {
                        name: 'variable.other.readwrite.alias.tsx',
                      },
                    },
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    name: 'constant.language.import-export-all.tsx',
                    match: '\\*',
                  },
                  {
                    name: 'keyword.control.default.tsx',
                    match: '\\b(default)\\b',
                  },
                  {
                    match: '(?:(\\btype)\\s+)?([_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'keyword.control.type.tsx',
                      },
                      '2': {
                        name: 'variable.other.readwrite.alias.tsx',
                      },
                    },
                  },
                ],
              },
              'switch-statement': {
                name: 'switch-statement.expr.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?=\\bswitch\\s*\\()',
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    name: 'switch-expression.expr.tsx',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(switch)\\s*(\\()',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.switch.tsx',
                      },
                      '2': {
                        name: 'meta.brace.round.tsx',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'meta.brace.round.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'switch-block.expr.tsx',
                    begin: '\\{',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.block.tsx',
                      },
                    },
                    end: '(?=\\})',
                    patterns: [
                      {
                        name: 'case-clause.expr.tsx',
                        begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(case|default(?=:))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                        beginCaptures: {
                          '1': {
                            name: 'keyword.control.switch.tsx',
                          },
                        },
                        end: '(?=:)',
                        patterns: [
                          {
                            include: '#expression',
                          },
                        ],
                      },
                      {
                        begin: '(:)\\s*(\\{)',
                        beginCaptures: {
                          '1': {
                            name: 'case-clause.expr.tsx punctuation.definition.section.case-statement.tsx',
                          },
                          '2': {
                            name: 'meta.block.tsx punctuation.definition.block.tsx',
                          },
                        },
                        end: '\\}',
                        endCaptures: {
                          '0': {
                            name: 'meta.block.tsx punctuation.definition.block.tsx',
                          },
                        },
                        contentName: 'meta.block.tsx',
                        patterns: [
                          {
                            include: '#statements',
                          },
                        ],
                      },
                      {
                        match: '(:)',
                        captures: {
                          '0': {
                            name: 'case-clause.expr.tsx punctuation.definition.section.case-statement.tsx',
                          },
                        },
                      },
                      {
                        include: '#statements',
                      },
                    ],
                  },
                ],
              },
              'for-loop': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))for(?=((\\s+|(\\s*\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*))await)?\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)?(\\())',
                beginCaptures: {
                  '0': {
                    name: 'keyword.control.loop.tsx',
                  },
                },
                end: '(?<=\\))',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    name: 'keyword.control.loop.tsx',
                    match: 'await',
                  },
                  {
                    begin: '\\(',
                    beginCaptures: {
                      '0': {
                        name: 'meta.brace.round.tsx',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'meta.brace.round.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#var-expr',
                      },
                      {
                        include: '#expression',
                      },
                      {
                        include: '#punctuation-semicolon',
                      },
                    ],
                  },
                ],
              },
              'if-statement': {
                patterns: [
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?=\\bif\\s*(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))\\s*(?!\\{))',
                    end: '(?=;|$|\\})',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(if)\\s*(\\()',
                        beginCaptures: {
                          '1': {
                            name: 'keyword.control.conditional.tsx',
                          },
                          '2': {
                            name: 'meta.brace.round.tsx',
                          },
                        },
                        end: '\\)',
                        endCaptures: {
                          '0': {
                            name: 'meta.brace.round.tsx',
                          },
                        },
                        patterns: [
                          {
                            include: '#expression',
                          },
                        ],
                      },
                      {
                        name: 'string.regexp.tsx',
                        begin: '(?<=\\))\\s*\\/(?![\\/*])(?=(?:[^\\/\\\\\\[]|\\\\.|\\[([^\\]\\\\]|\\\\.)*\\])+\\/([dgimsuy]+|(?![\\/\\*])|(?=\\/\\*))(?!\\s*[a-zA-Z0-9_$]))',
                        beginCaptures: {
                          '0': {
                            name: 'punctuation.definition.string.begin.tsx',
                          },
                        },
                        end: '(/)([dgimsuy]*)',
                        endCaptures: {
                          '1': {
                            name: 'punctuation.definition.string.end.tsx',
                          },
                          '2': {
                            name: 'keyword.other.tsx',
                          },
                        },
                        patterns: [
                          {
                            include: '#regexp',
                          },
                        ],
                      },
                      {
                        include: '#statements',
                      },
                    ],
                  },
                ],
              },
              'decl-block': {
                name: 'meta.block.tsx',
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#statements',
                  },
                ],
              },
              'after-operator-block-as-object-literal': {
                name: 'meta.objectliteral.tsx',
                begin: '(?<!\\+\\+|--)(?<=[:=(,\\[?+!>]|^await|[^\\._$[:alnum:]]await|^return|[^\\._$[:alnum:]]return|^yield|[^\\._$[:alnum:]]yield|^throw|[^\\._$[:alnum:]]throw|^in|[^\\._$[:alnum:]]in|^of|[^\\._$[:alnum:]]of|^typeof|[^\\._$[:alnum:]]typeof|&&|\\|\\||\\*)\\s*(\\{)',
                beginCaptures: {
                  '1': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#object-member',
                  },
                ],
              },
              'object-literal': {
                name: 'meta.objectliteral.tsx',
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#object-member',
                  },
                ],
              },
              'object-member': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#object-literal-method-declaration',
                  },
                  {
                    name: 'meta.object.member.tsx meta.object-literal.key.tsx',
                    begin: '(?=\\[)',
                    end: '(?=:)|((?<=[\\]])(?=\\s*[\\(\\<]))',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#array-literal',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.tsx meta.object-literal.key.tsx',
                    begin: "(?=[\\'\\\"\\`])",
                    end: "(?=:)|((?<=[\\'\\\"\\`])(?=((\\s*[\\(\\<,}])|(\\s+(as|satisifies)\\s+))))",
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#string',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.tsx meta.object-literal.key.tsx',
                    begin: '(?x)(?=(\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$))|(\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$))|((?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$)))',
                    end: '(?=:)|(?=\\s*([\\(\\<,}])|(\\s+as|satisifies\\s+))',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#numeric-literal',
                      },
                    ],
                  },
                  {
                    name: 'meta.method.declaration.tsx',
                    begin: "(?<=[\\]\\'\\\"\\`])(?=\\s*[\\(\\<])",
                    end: '(?=\\}|;|,)|(?<=\\})',
                    patterns: [
                      {
                        include: '#function-body',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.tsx',
                    match: '(?![_$[:alpha:]])([[:digit:]]+)\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*:)',
                    captures: {
                      '0': {
                        name: 'meta.object-literal.key.tsx',
                      },
                      '1': {
                        name: 'constant.numeric.decimal.tsx',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.tsx',
                    match: "(?x)(?:([_$[:alpha:]][_$[:alnum:]]*)\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*:(\\s*\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/)*\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    captures: {
                      '0': {
                        name: 'meta.object-literal.key.tsx',
                      },
                      '1': {
                        name: 'entity.name.function.tsx',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.tsx',
                    match: '(?:[_$[:alpha:]][_$[:alnum:]]*)\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*:)',
                    captures: {
                      '0': {
                        name: 'meta.object-literal.key.tsx',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.tsx',
                    begin: '\\.\\.\\.',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.operator.spread.tsx',
                      },
                    },
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.tsx',
                    match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?=,|\\}|$|\\/\\/|\\/\\*)',
                    captures: {
                      '1': {
                        name: 'variable.other.readwrite.tsx',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as)\\s+(const)(?=\\s*([,}]|$))',
                    captures: {
                      '1': {
                        name: 'keyword.control.as.tsx',
                      },
                      '2': {
                        name: 'storage.modifier.tsx',
                      },
                    },
                  },
                  {
                    name: 'meta.object.member.tsx',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(as)|(satisfies))\\s+',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.as.tsx',
                      },
                      '2': {
                        name: 'keyword.control.satisfies.tsx',
                      },
                    },
                    end: '(?=[;),}\\]:?\\-\\+\\>]|\\|\\||\\&\\&|\\!\\=\\=|$|^|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as|satisifies)\\s+))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.tsx',
                    begin: '(?=[_$[:alpha:]][_$[:alnum:]]*\\s*=)',
                    end: '(?=,|\\}|$|\\/\\/|\\/\\*)',
                    patterns: [
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    name: 'meta.object.member.tsx',
                    begin: ':',
                    beginCaptures: {
                      '0': {
                        name: 'meta.object-literal.key.tsx punctuation.separator.key-value.tsx',
                      },
                    },
                    end: '(?=,|\\})',
                    patterns: [
                      {
                        begin: '(?<=:)\\s*(async)?(?=\\s*(<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)\\(\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))',
                        beginCaptures: {
                          '1': {
                            name: 'storage.modifier.async.tsx',
                          },
                        },
                        end: '(?<=\\))',
                        patterns: [
                          {
                            include: '#type-parameters',
                          },
                          {
                            begin: '\\(',
                            beginCaptures: {
                              '0': {
                                name: 'meta.brace.round.tsx',
                              },
                            },
                            end: '\\)',
                            endCaptures: {
                              '0': {
                                name: 'meta.brace.round.tsx',
                              },
                            },
                            patterns: [
                              {
                                include: '#expression-inside-possibly-arrow-parens',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        begin: '(?<=:)\\s*(async)?\\s*(\\()(?=\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))',
                        beginCaptures: {
                          '1': {
                            name: 'storage.modifier.async.tsx',
                          },
                          '2': {
                            name: 'meta.brace.round.tsx',
                          },
                        },
                        end: '\\)',
                        endCaptures: {
                          '0': {
                            name: 'meta.brace.round.tsx',
                          },
                        },
                        patterns: [
                          {
                            include: '#expression-inside-possibly-arrow-parens',
                          },
                        ],
                      },
                      {
                        begin: '(?<=:)\\s*(async)?\\s*(?=\\<\\s*$)',
                        beginCaptures: {
                          '1': {
                            name: 'storage.modifier.async.tsx',
                          },
                        },
                        end: '(?<=\\>)',
                        patterns: [
                          {
                            include: '#type-parameters',
                          },
                        ],
                      },
                      {
                        begin: '(?<=\\>)\\s*(\\()(?=\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))',
                        beginCaptures: {
                          '1': {
                            name: 'meta.brace.round.tsx',
                          },
                        },
                        end: '\\)',
                        endCaptures: {
                          '0': {
                            name: 'meta.brace.round.tsx',
                          },
                        },
                        patterns: [
                          {
                            include: '#expression-inside-possibly-arrow-parens',
                          },
                        ],
                      },
                      {
                        include: '#possibly-arrow-return-type',
                      },
                      {
                        include: '#expression',
                      },
                    ],
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    include: '#decl-block',
                  },
                ],
              },
              'ternary-expression': {
                begin: '(?!\\?\\.\\s*[^[:digit:]])(\\?)(?!\\?)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.ternary.tsx',
                  },
                },
                end: '\\s*(:)',
                endCaptures: {
                  '1': {
                    name: 'keyword.operator.ternary.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              'function-call': {
                patterns: [
                  {
                    begin: "(?=(((([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))|(?<=[\\)]))\\s*(?:(\\?\\.\\s*)|(\\!))?((<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?\\())",
                    end: "(?<=\\))(?!(((([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))|(?<=[\\)]))\\s*(?:(\\?\\.\\s*)|(\\!))?((<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?\\())",
                    patterns: [
                      {
                        name: 'meta.function-call.tsx',
                        begin: '(?=(([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))',
                        end: "(?=\\s*(?:(\\?\\.\\s*)|(\\!))?((<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?\\())",
                        patterns: [
                          {
                            include: '#function-call-target',
                          },
                        ],
                      },
                      {
                        include: '#comment',
                      },
                      {
                        include: '#function-call-optionals',
                      },
                      {
                        include: '#type-arguments',
                      },
                      {
                        include: '#paren-expression',
                      },
                    ],
                  },
                  {
                    begin: '(?=(((([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))|(?<=[\\)]))(<\\s*[\\{\\[\\(]\\s*$))',
                    end: '(?<=\\>)(?!(((([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))|(?<=[\\)]))(<\\s*[\\{\\[\\(]\\s*$))',
                    patterns: [
                      {
                        name: 'meta.function-call.tsx',
                        begin: '(?=(([_$[:alpha:]][_$[:alnum:]]*)(\\s*\\??\\.\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*))*)|(\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*))',
                        end: '(?=(<\\s*[\\{\\[\\(]\\s*$))',
                        patterns: [
                          {
                            include: '#function-call-target',
                          },
                        ],
                      },
                      {
                        include: '#comment',
                      },
                      {
                        include: '#function-call-optionals',
                      },
                      {
                        include: '#type-arguments',
                      },
                    ],
                  },
                ],
              },
              'function-call-target': {
                patterns: [
                  {
                    include: '#support-function-call-identifiers',
                  },
                  {
                    name: 'entity.name.function.tsx',
                    match: '(\\#?[_$[:alpha:]][_$[:alnum:]]*)',
                  },
                ],
              },
              'function-call-optionals': {
                patterns: [
                  {
                    name: 'meta.function-call.tsx punctuation.accessor.optional.tsx',
                    match: '\\?\\.',
                  },
                  {
                    name: 'meta.function-call.tsx keyword.operator.definiteassignment.tsx',
                    match: '\\!',
                  },
                ],
              },
              'support-function-call-identifiers': {
                patterns: [
                  {
                    include: '#literal',
                  },
                  {
                    include: '#support-objects',
                  },
                  {
                    include: '#object-identifiers',
                  },
                  {
                    include: '#punctuation-accessor',
                  },
                  {
                    name: 'keyword.operator.expression.import.tsx',
                    match: "(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))import(?=\\s*[\\(]\\s*[\\\"\\'\\`]))",
                  },
                ],
              },
              'new-expr': {
                name: 'new.expr.tsx',
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(new)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.new.tsx',
                  },
                },
                end: '(?<=\\))|(?=[;),}\\]:?\\-\\+\\>]|\\|\\||\\&\\&|\\!\\=\\=|$|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))new(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))function((\\s+[_$[:alpha:]][_$[:alnum:]]*)|(\\s*[\\(]))))',
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              'instanceof-expr': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(instanceof)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.expression.instanceof.tsx',
                  },
                },
                end: '(?<=\\))|(?=[;),}\\]:?\\-\\+\\>]|\\|\\||\\&\\&|\\!\\=\\=|$|(===|!==|==|!=)|(([\\&\\~\\^\\|]\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s+instanceof(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))function((\\s+[_$[:alpha:]][_$[:alnum:]]*)|(\\s*[\\(]))))',
                patterns: [
                  {
                    include: '#type',
                  },
                ],
              },
              'paren-expression-possibly-arrow': {
                patterns: [
                  {
                    begin: '(?<=[(=,])\\s*(async)?(?=\\s*((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?\\(\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.async.tsx',
                      },
                    },
                    end: '(?<=\\))',
                    patterns: [
                      {
                        include: '#paren-expression-possibly-arrow-with-typeparameters',
                      },
                    ],
                  },
                  {
                    begin: '(?<=[(=,]|=>|^return|[^\\._$[:alnum:]]return)\\s*(async)?(?=\\s*((((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*))?\\()|(<)|((<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)))\\s*$)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.async.tsx',
                      },
                    },
                    end: '(?<=\\))',
                    patterns: [
                      {
                        include: '#paren-expression-possibly-arrow-with-typeparameters',
                      },
                    ],
                  },
                  {
                    include: '#possibly-arrow-return-type',
                  },
                ],
              },
              'paren-expression-possibly-arrow-with-typeparameters': {
                patterns: [
                  {
                    include: '#type-parameters',
                  },
                  {
                    begin: '\\(',
                    beginCaptures: {
                      '0': {
                        name: 'meta.brace.round.tsx',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'meta.brace.round.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#expression-inside-possibly-arrow-parens',
                      },
                    ],
                  },
                ],
              },
              'expression-inside-possibly-arrow-parens': {
                patterns: [
                  {
                    include: '#expressionWithoutIdentifiers',
                  },
                  {
                    include: '#comment',
                  },
                  {
                    include: '#string',
                  },
                  {
                    include: '#decorator',
                  },
                  {
                    include: '#destructuring-parameter',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|protected|private|readonly)\\s+(?=(override|public|protected|private|readonly)\\s+)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                    },
                  },
                  {
                    match: "(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*(\\??)(?=\\s*\n# function assignment |\n(=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)) |\n# typeannotation is fn type: < | () | (... | (param: | (param, | (param? | (param= | (param) =>\n(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))) |\n(:\\s*(=>|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(<[^<>]*>)|[^<>(),=])+=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n)))",
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.rest.tsx',
                      },
                      '3': {
                        name: 'entity.name.function.tsx variable.language.this.tsx',
                      },
                      '4': {
                        name: 'entity.name.function.tsx',
                      },
                      '5': {
                        name: 'keyword.operator.optional.tsx',
                      },
                    },
                  },
                  {
                    match: '(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(override|public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*(\\??)(?=\\s*[:,]|$)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.rest.tsx',
                      },
                      '3': {
                        name: 'variable.parameter.tsx variable.language.this.tsx',
                      },
                      '4': {
                        name: 'variable.parameter.tsx',
                      },
                      '5': {
                        name: 'keyword.operator.optional.tsx',
                      },
                    },
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    include: '#variable-initializer',
                  },
                  {
                    name: 'punctuation.separator.parameter.tsx',
                    match: ',',
                  },
                  {
                    include: '#identifiers',
                  },
                  {
                    include: '#expressionPunctuations',
                  },
                ],
              },
              'paren-expression': {
                begin: '\\(',
                beginCaptures: {
                  '0': {
                    name: 'meta.brace.round.tsx',
                  },
                },
                end: '\\)',
                endCaptures: {
                  '0': {
                    name: 'meta.brace.round.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              cast: {
                patterns: [
                  {
                    include: '#jsx',
                  },
                ],
              },
              'expression-operators': {
                patterns: [
                  {
                    name: 'keyword.control.flow.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(await)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(yield)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?=\\s*\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*\\*)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.flow.tsx',
                      },
                    },
                    end: '\\*',
                    endCaptures: {
                      '0': {
                        name: 'keyword.generator.asterisk.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#comment',
                      },
                    ],
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(yield)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?:\\s*(\\*))?',
                    captures: {
                      '1': {
                        name: 'keyword.control.flow.tsx',
                      },
                      '2': {
                        name: 'keyword.generator.asterisk.tsx',
                      },
                    },
                  },
                  {
                    name: 'keyword.operator.expression.delete.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))delete(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.operator.expression.in.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))in(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?!\\()',
                  },
                  {
                    name: 'keyword.operator.expression.of.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))of(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?!\\()',
                  },
                  {
                    name: 'keyword.operator.expression.instanceof.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))instanceof(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.operator.new.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))new(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    include: '#typeof-operator',
                  },
                  {
                    name: 'keyword.operator.expression.void.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))void(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as)\\s+(const)(?=\\s*($|[;,:})\\]]))',
                    captures: {
                      '1': {
                        name: 'keyword.control.as.tsx',
                      },
                      '2': {
                        name: 'storage.modifier.tsx',
                      },
                    },
                  },
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(as)|(satisfies))\\s+',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.control.as.tsx',
                      },
                      '2': {
                        name: 'keyword.control.satisfies.tsx',
                      },
                    },
                    end: '(?=^|[;),}\\]:?\\-\\+\\>]|\\|\\||\\&\\&|\\!\\=\\=|$|((?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(as|satisfies)\\s+)|(\\s+\\<))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    name: 'keyword.operator.spread.tsx',
                    match: '\\.\\.\\.',
                  },
                  {
                    name: 'keyword.operator.assignment.compound.tsx',
                    match: '\\*=|(?<!\\()/=|%=|\\+=|\\-=',
                  },
                  {
                    name: 'keyword.operator.assignment.compound.bitwise.tsx',
                    match: '\\&=|\\^=|<<=|>>=|>>>=|\\|=',
                  },
                  {
                    name: 'keyword.operator.bitwise.shift.tsx',
                    match: '<<|>>>|>>',
                  },
                  {
                    name: 'keyword.operator.comparison.tsx',
                    match: '===|!==|==|!=',
                  },
                  {
                    name: 'keyword.operator.relational.tsx',
                    match: '<=|>=|<>|<|>',
                  },
                  {
                    match: '(?<=[_$[:alnum:]])(\\!)\\s*(?:(/=)|(?:(/)(?![/*])))',
                    captures: {
                      '1': {
                        name: 'keyword.operator.logical.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.assignment.compound.tsx',
                      },
                      '3': {
                        name: 'keyword.operator.arithmetic.tsx',
                      },
                    },
                  },
                  {
                    name: 'keyword.operator.logical.tsx',
                    match: '\\!|&&|\\|\\||\\?\\?',
                  },
                  {
                    name: 'keyword.operator.bitwise.tsx',
                    match: '\\&|~|\\^|\\|',
                  },
                  {
                    name: 'keyword.operator.assignment.tsx',
                    match: '\\=',
                  },
                  {
                    name: 'keyword.operator.decrement.tsx',
                    match: '--',
                  },
                  {
                    name: 'keyword.operator.increment.tsx',
                    match: '\\+\\+',
                  },
                  {
                    name: 'keyword.operator.arithmetic.tsx',
                    match: '%|\\*|/|-|\\+',
                  },
                  {
                    begin: '(?<=[_$[:alnum:])\\]])\\s*(?=(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)+(?:(/=)|(?:(/)(?![/*]))))',
                    end: '(?:(/=)|(?:(/)(?!\\*([^\\*]|(\\*[^\\/]))*\\*\\/)))',
                    endCaptures: {
                      '1': {
                        name: 'keyword.operator.assignment.compound.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.arithmetic.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#comment',
                      },
                    ],
                  },
                  {
                    match: '(?<=[_$[:alnum:])\\]])\\s*(?:(/=)|(?:(/)(?![/*])))',
                    captures: {
                      '1': {
                        name: 'keyword.operator.assignment.compound.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.arithmetic.tsx',
                      },
                    },
                  },
                ],
              },
              'typeof-operator': {
                begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))typeof(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                beginCaptures: {
                  '0': {
                    name: 'keyword.operator.expression.typeof.tsx',
                  },
                },
                end: '(?=[,);}\\]=>:&|{\\?]|(extends\\s+)|$|;|^\\s*$|(?:^\\s*(?:abstract|async|class|const|declare|enum|export|function|import|interface|let|module|namespace|return|type|var)\\b))',
                patterns: [
                  {
                    include: '#type-arguments',
                  },
                  {
                    include: '#expression',
                  },
                ],
              },
              literal: {
                patterns: [
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#boolean-literal',
                  },
                  {
                    include: '#null-literal',
                  },
                  {
                    include: '#undefined-literal',
                  },
                  {
                    include: '#numericConstant-literal',
                  },
                  {
                    include: '#array-literal',
                  },
                  {
                    include: '#this-literal',
                  },
                  {
                    include: '#super-literal',
                  },
                ],
              },
              'array-literal': {
                name: 'meta.array.literal.tsx',
                begin: '\\s*(\\[)',
                beginCaptures: {
                  '1': {
                    name: 'meta.brace.square.tsx',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'meta.brace.square.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'numeric-literal': {
                patterns: [
                  {
                    name: 'constant.numeric.hex.tsx',
                    match: '\\b(?<!\\$)0(?:x|X)[0-9a-fA-F][0-9a-fA-F_]*(n)?\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                    },
                  },
                  {
                    name: 'constant.numeric.binary.tsx',
                    match: '\\b(?<!\\$)0(?:b|B)[01][01_]*(n)?\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                    },
                  },
                  {
                    name: 'constant.numeric.octal.tsx',
                    match: '\\b(?<!\\$)0(?:o|O)?[0-7][0-7_]*(n)?\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                    },
                  },
                  {
                    match: '(?x)\n(?<!\\$)(?:\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)| # 1.1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # 1.E+3\n  (?:\\B(\\.)[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|             # .1E+3\n  (?:\\b[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*(n)?\\b)|                 # 1E+3\n  (?:\\b[0-9][0-9_]*(\\.)[0-9][0-9_]*(n)?\\b)|                      # 1.1\n  (?:\\b[0-9][0-9_]*(\\.)(n)?\\B)|                                  # 1.\n  (?:\\B(\\.)[0-9][0-9_]*(n)?\\b)|                                  # .1\n  (?:\\b[0-9][0-9_]*(n)?\\b(?!\\.))                                 # 1\n)(?!\\$)',
                    captures: {
                      '0': {
                        name: 'constant.numeric.decimal.tsx',
                      },
                      '1': {
                        name: 'meta.delimiter.decimal.period.tsx',
                      },
                      '2': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                      '3': {
                        name: 'meta.delimiter.decimal.period.tsx',
                      },
                      '4': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                      '5': {
                        name: 'meta.delimiter.decimal.period.tsx',
                      },
                      '6': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                      '7': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                      '8': {
                        name: 'meta.delimiter.decimal.period.tsx',
                      },
                      '9': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                      '10': {
                        name: 'meta.delimiter.decimal.period.tsx',
                      },
                      '11': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                      '12': {
                        name: 'meta.delimiter.decimal.period.tsx',
                      },
                      '13': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                      '14': {
                        name: 'storage.type.numeric.bigint.tsx',
                      },
                    },
                  },
                ],
              },
              'boolean-literal': {
                patterns: [
                  {
                    name: 'constant.language.boolean.true.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))true(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'constant.language.boolean.false.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))false(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              'null-literal': {
                name: 'constant.language.null.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))null(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'this-literal': {
                name: 'variable.language.this.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))this\\b(?!\\$)',
              },
              'super-literal': {
                name: 'variable.language.super.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))super\\b(?!\\$)',
              },
              'undefined-literal': {
                name: 'constant.language.undefined.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))undefined(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'numericConstant-literal': {
                patterns: [
                  {
                    name: 'constant.language.nan.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))NaN(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'constant.language.infinity.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Infinity(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              'support-objects': {
                patterns: [
                  {
                    name: 'variable.language.arguments.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(arguments)\\b(?!\\$)',
                  },
                  {
                    name: 'support.class.promise.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(Promise)\\b(?!\\$)',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(import)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(meta)\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'keyword.control.import.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '4': {
                        name: 'support.variable.property.importmeta.tsx',
                      },
                    },
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(new)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(target)\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'keyword.operator.new.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '4': {
                        name: 'support.variable.property.target.tsx',
                      },
                    },
                  },
                  {
                    match: '(?x) (?:(\\.)|(\\?\\.(?!\\s*[[:digit:]]))) \\s* (?:\n  (?:(constructor|length|prototype|__proto__)\\b(?!\\$|\\s*(<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\\())\n  |\n  (?:(EPSILON|MAX_SAFE_INTEGER|MAX_VALUE|MIN_SAFE_INTEGER|MIN_VALUE|NEGATIVE_INFINITY|POSITIVE_INFINITY)\\b(?!\\$)))',
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '3': {
                        name: 'support.variable.property.tsx',
                      },
                      '4': {
                        name: 'support.constant.tsx',
                      },
                    },
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(exports)|(module)(?:(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))(exports|id|filename|loaded|parent|children))?)\\b(?!\\$)',
                    captures: {
                      '1': {
                        name: 'support.type.object.module.tsx',
                      },
                      '2': {
                        name: 'support.type.object.module.tsx',
                      },
                      '3': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '4': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '5': {
                        name: 'support.type.object.module.tsx',
                      },
                    },
                  },
                ],
              },
              identifiers: {
                patterns: [
                  {
                    include: '#object-identifiers',
                  },
                  {
                    match: "(?x)(?:(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*)?([_$[:alpha:]][_$[:alnum:]]*)(?=\\s*=\\s*(\n  ((async\\s+)?(\n    (function\\s*[(<*]) |\n    (function\\s+) |\n    ([_$[:alpha:]][_$[:alnum:]]*\\s*=>)\n  )) |\n  ((async\\s*)?(\n    ((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))))) |\n    # sure shot arrow functions even if => is on new line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?\n  [(]\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*\n  (\n    ([)]\\s*:) |                                                                                       # ():\n    ((\\.\\.\\.\\s*)?[_$[:alpha:]][_$[:alnum:]]*\\s*:)                                                                  # [(]param: | [(]...param:\n  )\n) |\n(\n  [<]\\s*[_$[:alpha:]][_$[:alnum:]]*\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |\n# arrow function possible to detect only with => on same line\n(\n  (<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<]|\\<\\s*(((const\\s+)?[_$[:alpha:]])|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\]))([^=<>]|=[^<])*\\>)*\\>)*>\\s*)?                                                                                 # typeparameters\n  \\(\\s*(\\/\\*([^\\*]|(\\*[^\\/]))*\\*\\/\\s*)*(([_$[:alpha:]]|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\.\\.\\.\\s*[_$[:alpha:]]))([^()\\'\\\"\\`]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))*)?\\)   # parameters\n  (\\s*:\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+)?                                                                        # return type\n  \\s*=>                                                                                               # arrow operator\n)\n  ))\n))",
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '3': {
                        name: 'entity.name.function.tsx',
                      },
                    },
                  },
                  {
                    match: '(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(\\#?[[:upper:]][_$[:digit:][:upper:]]*)(?![_$[:alnum:]])',
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '3': {
                        name: 'variable.other.constant.property.tsx',
                      },
                    },
                  },
                  {
                    match: '(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(\\#?[_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '3': {
                        name: 'variable.other.property.tsx',
                      },
                    },
                  },
                  {
                    name: 'variable.other.constant.tsx',
                    match: '([[:upper:]][_$[:digit:][:upper:]]*)(?![_$[:alnum:]])',
                  },
                  {
                    name: 'variable.other.readwrite.tsx',
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                  },
                ],
              },
              'object-identifiers': {
                patterns: [
                  {
                    name: 'support.class.tsx',
                    match: '([_$[:alpha:]][_$[:alnum:]]*)(?=\\s*\\??\\.\\s*prototype\\b(?!\\$))',
                  },
                  {
                    match: '(?x)(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(?:\n  (\\#?[[:upper:]][_$[:digit:][:upper:]]*) |\n  (\\#?[_$[:alpha:]][_$[:alnum:]]*)\n)(?=\\s*\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '3': {
                        name: 'variable.other.constant.object.property.tsx',
                      },
                      '4': {
                        name: 'variable.other.object.property.tsx',
                      },
                    },
                  },
                  {
                    match: '(?x)(?:\n  ([[:upper:]][_$[:digit:][:upper:]]*) |\n  ([_$[:alpha:]][_$[:alnum:]]*)\n)(?=\\s*\\??\\.\\s*\\#?[_$[:alpha:]][_$[:alnum:]]*)',
                    captures: {
                      '1': {
                        name: 'variable.other.constant.object.tsx',
                      },
                      '2': {
                        name: 'variable.other.object.tsx',
                      },
                    },
                  },
                ],
              },
              'type-annotation': {
                patterns: [
                  {
                    name: 'meta.type.annotation.tsx',
                    begin: '(:)(?=\\s*\\S)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.tsx',
                      },
                    },
                    end: '(?<![:|&])(?!\\s*[|&]\\s+)((?=^|[,);\\}\\]]|//)|(?==[^>])|((?<=[\\}>\\]\\)]|[_$[:alpha:]])\\s*(?=\\{)))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    name: 'meta.type.annotation.tsx',
                    begin: '(:)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.tsx',
                      },
                    },
                    end: '(?<![:|&])((?=[,);\\}\\]]|\\/\\/)|(?==[^>])|(?=^\\s*$)|((?<=[\\}>\\]\\)]|[_$[:alpha:]])\\s*(?=\\{)))',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'parameter-type-annotation': {
                patterns: [
                  {
                    name: 'meta.type.annotation.tsx',
                    begin: '(:)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.tsx',
                      },
                    },
                    end: '(?=[,)])|(?==[^>])',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'return-type': {
                patterns: [
                  {
                    name: 'meta.return.type.tsx',
                    begin: '(?<=\\))\\s*(:)(?=\\s*\\S)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.tsx',
                      },
                    },
                    end: '(?<![:|&])(?=$|^|[{};,]|//)',
                    patterns: [
                      {
                        include: '#return-type-core',
                      },
                    ],
                  },
                  {
                    name: 'meta.return.type.tsx',
                    begin: '(?<=\\))\\s*(:)',
                    beginCaptures: {
                      '1': {
                        name: 'keyword.operator.type.annotation.tsx',
                      },
                    },
                    end: '(?<![:|&])((?=[{};,]|//|^\\s*$)|((?<=\\S)(?=\\s*$)))',
                    patterns: [
                      {
                        include: '#return-type-core',
                      },
                    ],
                  },
                ],
              },
              'return-type-core': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: '(?<=[:|&])(?=\\s*\\{)',
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#type-object',
                      },
                    ],
                  },
                  {
                    include: '#type-predicate-operator',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'arrow-return-type': {
                name: 'meta.return.type.arrow.tsx',
                begin: '(?<=\\))\\s*(:)',
                beginCaptures: {
                  '1': {
                    name: 'keyword.operator.type.annotation.tsx',
                  },
                },
                end: '(?==>|\\{|(^\\s*(export|function|class|interface|let|var|const|import|enum|namespace|module|type|abstract|declare)\\s+))',
                patterns: [
                  {
                    include: '#arrow-return-type-body',
                  },
                ],
              },
              'possibly-arrow-return-type': {
                begin: '(?<=\\)|^)\\s*(:)(?=\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*=>)',
                beginCaptures: {
                  '1': {
                    name: 'meta.arrow.tsx meta.return.type.arrow.tsx keyword.operator.type.annotation.tsx',
                  },
                },
                end: '(?==>|\\{|(^\\s*(export|function|class|interface|let|var|const|import|enum|namespace|module|type|abstract|declare)\\s+))',
                contentName: 'meta.arrow.tsx meta.return.type.arrow.tsx',
                patterns: [
                  {
                    include: '#arrow-return-type-body',
                  },
                ],
              },
              'arrow-return-type-body': {
                patterns: [
                  {
                    begin: '(?<=[:])(?=\\s*\\{)',
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#type-object',
                      },
                    ],
                  },
                  {
                    include: '#type-predicate-operator',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'type-parameters': {
                name: 'meta.type.parameters.tsx',
                begin: '(<)',
                beginCaptures: {
                  '1': {
                    name: 'punctuation.definition.typeparameters.begin.tsx',
                  },
                },
                end: '(>)',
                endCaptures: {
                  '1': {
                    name: 'punctuation.definition.typeparameters.end.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    name: 'storage.modifier.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(extends|in|out|const)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    include: '#type',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    name: 'keyword.operator.assignment.tsx',
                    match: '(=)(?!>)',
                  },
                ],
              },
              'type-arguments': {
                name: 'meta.type.parameters.tsx',
                begin: '\\<',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.typeparameters.begin.tsx',
                  },
                },
                end: '\\>',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.typeparameters.end.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#type-arguments-body',
                  },
                ],
              },
              'type-arguments-body': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(_)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    captures: {
                      '0': {
                        name: 'keyword.operator.type.tsx',
                      },
                    },
                  },
                  {
                    include: '#type',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              type: {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#type-string',
                  },
                  {
                    include: '#numeric-literal',
                  },
                  {
                    include: '#type-primitive',
                  },
                  {
                    include: '#type-builtin-literals',
                  },
                  {
                    include: '#type-parameters',
                  },
                  {
                    include: '#type-tuple',
                  },
                  {
                    include: '#type-object',
                  },
                  {
                    include: '#type-operators',
                  },
                  {
                    include: '#type-conditional',
                  },
                  {
                    include: '#type-fn-type-parameters',
                  },
                  {
                    include: '#type-paren-or-function-parameters',
                  },
                  {
                    include: '#type-function-return-type',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(readonly)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))\\s*',
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                    },
                  },
                  {
                    include: '#type-name',
                  },
                ],
              },
              'type-primitive': {
                name: 'support.type.primitive.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(string|number|bigint|boolean|symbol|any|void|never|unknown)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'type-builtin-literals': {
                name: 'support.type.builtin.tsx',
                match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(this|true|false|undefined|null|object)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
              },
              'type-tuple': {
                name: 'meta.type.tuple.tsx',
                begin: '\\[',
                beginCaptures: {
                  '0': {
                    name: 'meta.brace.square.tsx',
                  },
                },
                end: '\\]',
                endCaptures: {
                  '0': {
                    name: 'meta.brace.square.tsx',
                  },
                },
                patterns: [
                  {
                    name: 'keyword.operator.rest.tsx',
                    match: '\\.\\.\\.',
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))([_$[:alpha:]][_$[:alnum:]]*)\\s*(\\?)?\\s*(:)',
                    captures: {
                      '1': {
                        name: 'entity.name.label.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.optional.tsx',
                      },
                      '3': {
                        name: 'punctuation.separator.label.tsx',
                      },
                    },
                  },
                  {
                    include: '#type',
                  },
                  {
                    include: '#punctuation-comma',
                  },
                ],
              },
              'type-object': {
                name: 'meta.object.type.tsx',
                begin: '\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.block.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#method-declaration',
                  },
                  {
                    include: '#indexer-declaration',
                  },
                  {
                    include: '#indexer-mapped-type-declaration',
                  },
                  {
                    include: '#field-declaration',
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    begin: '\\.\\.\\.',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.operator.spread.tsx',
                      },
                    },
                    end: '(?=\\}|;|,|$)|(?<=\\})',
                    patterns: [
                      {
                        include: '#type',
                      },
                    ],
                  },
                  {
                    include: '#punctuation-comma',
                  },
                  {
                    include: '#punctuation-semicolon',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'type-conditional': {
                patterns: [
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(extends)\\s+',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                    },
                    end: '(?<=:)',
                    patterns: [
                      {
                        begin: '\\?',
                        beginCaptures: {
                          '0': {
                            name: 'keyword.operator.ternary.tsx',
                          },
                        },
                        end: ':',
                        endCaptures: {
                          '0': {
                            name: 'keyword.operator.ternary.tsx',
                          },
                        },
                        patterns: [
                          {
                            include: '#type',
                          },
                        ],
                      },
                      {
                        include: '#type',
                      },
                    ],
                  },
                ],
              },
              'type-paren-or-function-parameters': {
                name: 'meta.type.paren.cover.tsx',
                begin: '\\(',
                beginCaptures: {
                  '0': {
                    name: 'meta.brace.round.tsx',
                  },
                },
                end: '\\)',
                endCaptures: {
                  '0': {
                    name: 'meta.brace.round.tsx',
                  },
                },
                patterns: [
                  {
                    match: '(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))\\s*(\\??)(?=\\s*(:\\s*(\n  (<) |\n  ([(]\\s*(\n    ([)]) |\n    (\\.\\.\\.) |\n    ([_$[:alnum:]]+\\s*(\n      ([:,?=])|\n      ([)]\\s*=>)\n    ))\n  ))\n)) |\n(:\\s*(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))Function(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))) |\n(:\\s*((<\\s*$)|([\\(]\\s*((([\\{\\[]\\s*)?$)|((\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})\\s*((:\\s*\\{?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*)))|((\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])\\s*((:\\s*\\[?$)|((\\s*([^<>\\(\\)\\{\\}]|\\<([^<>]|\\<([^<>]|\\<[^<>]+\\>)+\\>)+\\>|\\([^\\(\\)]+\\)|\\{[^\\{\\}]+\\})+\\s*)?=\\s*))))))))',
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.rest.tsx',
                      },
                      '3': {
                        name: 'entity.name.function.tsx variable.language.this.tsx',
                      },
                      '4': {
                        name: 'entity.name.function.tsx',
                      },
                      '5': {
                        name: 'keyword.operator.optional.tsx',
                      },
                    },
                  },
                  {
                    match: '(?x)(?:(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(public|private|protected|readonly)\\s+)?(?:(\\.\\.\\.)\\s*)?(?<!=|:)(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))\\s*(\\??)(?=:)',
                    captures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'keyword.operator.rest.tsx',
                      },
                      '3': {
                        name: 'variable.parameter.tsx variable.language.this.tsx',
                      },
                      '4': {
                        name: 'variable.parameter.tsx',
                      },
                      '5': {
                        name: 'keyword.operator.optional.tsx',
                      },
                    },
                  },
                  {
                    include: '#type-annotation',
                  },
                  {
                    name: 'punctuation.separator.parameter.tsx',
                    match: ',',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'type-fn-type-parameters': {
                patterns: [
                  {
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(abstract)\\s+)?(new)\\b(?=\\s*\\<)',
                    beginCaptures: {
                      '1': {
                        name: 'meta.type.constructor.tsx storage.modifier.tsx',
                      },
                      '2': {
                        name: 'meta.type.constructor.tsx keyword.control.new.tsx',
                      },
                    },
                    end: '(?<=>)',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#type-parameters',
                      },
                    ],
                  },
                  {
                    name: 'meta.type.constructor.tsx',
                    begin: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(abstract)\\s+)?(new)\\b\\s*(?=\\()',
                    beginCaptures: {
                      '1': {
                        name: 'storage.modifier.tsx',
                      },
                      '2': {
                        name: 'keyword.control.new.tsx',
                      },
                    },
                    end: '(?<=\\))',
                    patterns: [
                      {
                        include: '#function-parameters',
                      },
                    ],
                  },
                  {
                    name: 'meta.type.function.tsx',
                    begin: '(?x)(\n  (?=\n    [(]\\s*(\n      ([)]) |\n      (\\.\\.\\.) |\n      ([_$[:alnum:]]+\\s*(\n        ([:,?=])|\n        ([)]\\s*=>)\n      ))\n    )\n  )\n)',
                    end: '(?<=\\))',
                    patterns: [
                      {
                        include: '#function-parameters',
                      },
                    ],
                  },
                ],
              },
              'type-function-return-type': {
                patterns: [
                  {
                    name: 'meta.type.function.return.tsx',
                    begin: '(=>)(?=\\s*\\S)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.function.arrow.tsx',
                      },
                    },
                    end: '(?<!=>)(?<![|&])(?=[,\\]\\)\\{\\}=;>:\\?]|//|$)',
                    patterns: [
                      {
                        include: '#type-function-return-type-core',
                      },
                    ],
                  },
                  {
                    name: 'meta.type.function.return.tsx',
                    begin: '=>',
                    beginCaptures: {
                      '0': {
                        name: 'storage.type.function.arrow.tsx',
                      },
                    },
                    end: '(?<!=>)(?<![|&])((?=[,\\]\\)\\{\\}=;:\\?>]|//|^\\s*$)|((?<=\\S)(?=\\s*$)))',
                    patterns: [
                      {
                        include: '#type-function-return-type-core',
                      },
                    ],
                  },
                ],
              },
              'type-function-return-type-core': {
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    begin: '(?<==>)(?=\\s*\\{)',
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#type-object',
                      },
                    ],
                  },
                  {
                    include: '#type-predicate-operator',
                  },
                  {
                    include: '#type',
                  },
                ],
              },
              'type-operators': {
                patterns: [
                  {
                    include: '#typeof-operator',
                  },
                  {
                    include: '#type-infer',
                  },
                  {
                    begin: '([&|])(?=\\s*\\{)',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.operator.type.tsx',
                      },
                    },
                    end: '(?<=\\})',
                    patterns: [
                      {
                        include: '#type-object',
                      },
                    ],
                  },
                  {
                    begin: '[&|]',
                    beginCaptures: {
                      '0': {
                        name: 'keyword.operator.type.tsx',
                      },
                    },
                    end: '(?=\\S)',
                  },
                  {
                    name: 'keyword.operator.expression.keyof.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))keyof(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.operator.ternary.tsx',
                    match: '(\\?|\\:)',
                  },
                  {
                    name: 'keyword.operator.expression.import.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))import(?=\\s*\\()',
                  },
                ],
              },
              'type-infer': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(infer)\\s+([_$[:alpha:]][_$[:alnum:]]*)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))(?:\\s+(extends)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.)))?',
                    name: 'meta.type.infer.tsx',
                    captures: {
                      '1': {
                        name: 'keyword.operator.expression.infer.tsx',
                      },
                      '2': {
                        name: 'entity.name.type.tsx',
                      },
                      '3': {
                        name: 'keyword.operator.expression.extends.tsx',
                      },
                    },
                  },
                ],
              },
              'type-predicate-operator': {
                patterns: [
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(?:(asserts)\\s+)?(?!asserts)(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))\\s(is)(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    captures: {
                      '1': {
                        name: 'keyword.operator.type.asserts.tsx',
                      },
                      '2': {
                        name: 'variable.parameter.tsx variable.language.this.tsx',
                      },
                      '3': {
                        name: 'variable.parameter.tsx',
                      },
                      '4': {
                        name: 'keyword.operator.expression.is.tsx',
                      },
                    },
                  },
                  {
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))(asserts)\\s+(?!is)(?:(this)|([_$[:alpha:]][_$[:alnum:]]*))(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                    captures: {
                      '1': {
                        name: 'keyword.operator.type.asserts.tsx',
                      },
                      '2': {
                        name: 'variable.parameter.tsx variable.language.this.tsx',
                      },
                      '3': {
                        name: 'variable.parameter.tsx',
                      },
                    },
                  },
                  {
                    name: 'keyword.operator.type.asserts.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))asserts(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                  {
                    name: 'keyword.operator.expression.is.tsx',
                    match: '(?<![_$[:alnum:]])(?:(?<=\\.\\.\\.)|(?<!\\.))is(?![_$[:alnum:]])(?:(?=\\.\\.\\.)|(?!\\.))',
                  },
                ],
              },
              'type-name': {
                patterns: [
                  {
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))\\s*(<)',
                    captures: {
                      '1': {
                        name: 'entity.name.type.module.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                      '4': {
                        name: 'meta.type.parameters.tsx punctuation.definition.typeparameters.begin.tsx',
                      },
                    },
                    end: '(>)',
                    endCaptures: {
                      '1': {
                        name: 'meta.type.parameters.tsx punctuation.definition.typeparameters.end.tsx',
                      },
                    },
                    contentName: 'meta.type.parameters.tsx',
                    patterns: [
                      {
                        include: '#type-arguments-body',
                      },
                    ],
                  },
                  {
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(<)',
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.type.tsx',
                      },
                      '2': {
                        name: 'meta.type.parameters.tsx punctuation.definition.typeparameters.begin.tsx',
                      },
                    },
                    end: '(>)',
                    endCaptures: {
                      '1': {
                        name: 'meta.type.parameters.tsx punctuation.definition.typeparameters.end.tsx',
                      },
                    },
                    contentName: 'meta.type.parameters.tsx',
                    patterns: [
                      {
                        include: '#type-arguments-body',
                      },
                    ],
                  },
                  {
                    match: '([_$[:alpha:]][_$[:alnum:]]*)\\s*(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))',
                    captures: {
                      '1': {
                        name: 'entity.name.type.module.tsx',
                      },
                      '2': {
                        name: 'punctuation.accessor.tsx',
                      },
                      '3': {
                        name: 'punctuation.accessor.optional.tsx',
                      },
                    },
                  },
                  {
                    name: 'entity.name.type.tsx',
                    match: '[_$[:alpha:]][_$[:alnum:]]*',
                  },
                ],
              },
              'punctuation-comma': {
                name: 'punctuation.separator.comma.tsx',
                match: ',',
              },
              'punctuation-semicolon': {
                name: 'punctuation.terminator.statement.tsx',
                match: ';',
              },
              'punctuation-accessor': {
                match: '(?:(\\.)|(\\?\\.(?!\\s*[[:digit:]])))',
                captures: {
                  '1': {
                    name: 'punctuation.accessor.tsx',
                  },
                  '2': {
                    name: 'punctuation.accessor.optional.tsx',
                  },
                },
              },
              string: {
                patterns: [
                  {
                    include: '#qstring-single',
                  },
                  {
                    include: '#qstring-double',
                  },
                  {
                    include: '#template',
                  },
                ],
              },
              'qstring-double': {
                name: 'string.quoted.double.tsx',
                begin: '"',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.string.begin.tsx',
                  },
                },
                end: '(")|((?:[^\\\\\\n])$)',
                endCaptures: {
                  '1': {
                    name: 'punctuation.definition.string.end.tsx',
                  },
                  '2': {
                    name: 'invalid.illegal.newline.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#string-character-escape',
                  },
                ],
              },
              'qstring-single': {
                name: 'string.quoted.single.tsx',
                begin: "'",
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.string.begin.tsx',
                  },
                },
                end: "(\\')|((?:[^\\\\\\n])$)",
                endCaptures: {
                  '1': {
                    name: 'punctuation.definition.string.end.tsx',
                  },
                  '2': {
                    name: 'invalid.illegal.newline.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#string-character-escape',
                  },
                ],
              },
              'string-character-escape': {
                name: 'constant.character.escape.tsx',
                match: '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\\{[0-9A-Fa-f]+\\}|[0-2][0-7]{0,2}|3[0-6][0-7]?|37[0-7]?|[4-7][0-7]?|.|$)',
              },
              template: {
                patterns: [
                  {
                    include: '#template-call',
                  },
                  {
                    contentName: 'string.template.tsx',
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)?(`)',
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.function.tagged-template.tsx',
                      },
                      '2': {
                        name: 'string.template.tsx punctuation.definition.string.template.begin.tsx',
                      },
                    },
                    end: '`',
                    endCaptures: {
                      '0': {
                        name: 'string.template.tsx punctuation.definition.string.template.end.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#template-substitution-element',
                      },
                      {
                        include: '#string-character-escape',
                      },
                    ],
                  },
                ],
              },
              'template-call': {
                patterns: [
                  {
                    begin: "(?=(([_$[:alpha:]][_$[:alnum:]]*\\s*\\??\\.\\s*)*|(\\??\\.\\s*)?)([_$[:alpha:]][_$[:alnum:]]*)(<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?`)",
                    end: '(?=`)',
                    patterns: [
                      {
                        begin: '(?=(([_$[:alpha:]][_$[:alnum:]]*\\s*\\??\\.\\s*)*|(\\??\\.\\s*)?)([_$[:alpha:]][_$[:alnum:]]*))',
                        end: "(?=(<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)?`)",
                        patterns: [
                          {
                            include: '#support-function-call-identifiers',
                          },
                          {
                            name: 'entity.name.function.tagged-template.tsx',
                            match: '([_$[:alpha:]][_$[:alnum:]]*)',
                          },
                        ],
                      },
                      {
                        include: '#type-arguments',
                      },
                    ],
                  },
                  {
                    begin: "([_$[:alpha:]][_$[:alnum:]]*)?\\s*(?=(<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))(([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>|\\<\\s*(((keyof|infer|typeof|readonly)\\s+)|(([_$[:alpha:]][_$[:alnum:]]*|(\\{([^\\{\\}]|(\\{([^\\{\\}]|\\{[^\\{\\}]*\\})*\\}))*\\})|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(\\[([^\\[\\]]|(\\[([^\\[\\]]|\\[[^\\[\\]]*\\])*\\]))*\\])|(\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`))(?=\\s*([\\<\\>\\,\\.\\[]|=>|&(?!&)|\\|(?!\\|)))))([^<>\\(]|(\\(([^\\(\\)]|(\\(([^\\(\\)]|\\([^\\(\\)]*\\))*\\)))*\\))|(?<==)\\>)*(?<!=)\\>))*(?<!=)\\>)*(?<!=)>\\s*)`)",
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.function.tagged-template.tsx',
                      },
                    },
                    end: '(?=`)',
                    patterns: [
                      {
                        include: '#type-arguments',
                      },
                    ],
                  },
                ],
              },
              'template-substitution-element': {
                name: 'meta.template.expression.tsx',
                begin: '\\$\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.template-expression.begin.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.template-expression.end.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
                contentName: 'meta.embedded.line.tsx',
              },
              'type-string': {
                patterns: [
                  {
                    include: '#qstring-single',
                  },
                  {
                    include: '#qstring-double',
                  },
                  {
                    include: '#template-type',
                  },
                ],
              },
              'template-type': {
                patterns: [
                  {
                    include: '#template-call',
                  },
                  {
                    contentName: 'string.template.tsx',
                    begin: '([_$[:alpha:]][_$[:alnum:]]*)?(`)',
                    beginCaptures: {
                      '1': {
                        name: 'entity.name.function.tagged-template.tsx',
                      },
                      '2': {
                        name: 'string.template.tsx punctuation.definition.string.template.begin.tsx',
                      },
                    },
                    end: '`',
                    endCaptures: {
                      '0': {
                        name: 'string.template.tsx punctuation.definition.string.template.end.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#template-type-substitution-element',
                      },
                      {
                        include: '#string-character-escape',
                      },
                    ],
                  },
                ],
              },
              'template-type-substitution-element': {
                name: 'meta.template.expression.tsx',
                begin: '\\$\\{',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.template-expression.begin.tsx',
                  },
                },
                end: '\\}',
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.template-expression.end.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#type',
                  },
                ],
                contentName: 'meta.embedded.line.tsx',
              },
              regex: {
                patterns: [
                  {
                    name: 'string.regexp.tsx',
                    begin: '(?<!\\+\\+|--|})(?<=[=(:,\\[?+!]|^return|[^\\._$[:alnum:]]return|^case|[^\\._$[:alnum:]]case|=>|&&|\\|\\||\\*\\/)\\s*(\\/)(?![\\/*])(?=(?:[^\\/\\\\\\[\\()]|\\\\.|\\[([^\\]\\\\]|\\\\.)+\\]|\\(([^\\)\\\\]|\\\\.)+\\))+\\/([dgimsuy]+|(?![\\/\\*])|(?=\\/\\*))(?!\\s*[a-zA-Z0-9_$]))',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.string.begin.tsx',
                      },
                    },
                    end: '(/)([dgimsuy]*)',
                    endCaptures: {
                      '1': {
                        name: 'punctuation.definition.string.end.tsx',
                      },
                      '2': {
                        name: 'keyword.other.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#regexp',
                      },
                    ],
                  },
                  {
                    name: 'string.regexp.tsx',
                    begin: '((?<![_$[:alnum:])\\]]|\\+\\+|--|}|\\*\\/)|((?<=^return|[^\\._$[:alnum:]]return|^case|[^\\._$[:alnum:]]case))\\s*)\\/(?![\\/*])(?=(?:[^\\/\\\\\\[]|\\\\.|\\[([^\\]\\\\]|\\\\.)*\\])+\\/([dgimsuy]+|(?![\\/\\*])|(?=\\/\\*))(?!\\s*[a-zA-Z0-9_$]))',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.string.begin.tsx',
                      },
                    },
                    end: '(/)([dgimsuy]*)',
                    endCaptures: {
                      '1': {
                        name: 'punctuation.definition.string.end.tsx',
                      },
                      '2': {
                        name: 'keyword.other.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#regexp',
                      },
                    ],
                  },
                ],
              },
              regexp: {
                patterns: [
                  {
                    name: 'keyword.control.anchor.regexp',
                    match: '\\\\[bB]|\\^|\\$',
                  },
                  {
                    match: '\\\\[1-9]\\d*|\\\\k<([a-zA-Z_$][\\w$]*)>',
                    captures: {
                      '0': {
                        name: 'keyword.other.back-reference.regexp',
                      },
                      '1': {
                        name: 'variable.other.regexp',
                      },
                    },
                  },
                  {
                    name: 'keyword.operator.quantifier.regexp',
                    match: '[?+*]|\\{(\\d+,\\d+|\\d+,|,\\d+|\\d+)\\}\\??',
                  },
                  {
                    name: 'keyword.operator.or.regexp',
                    match: '\\|',
                  },
                  {
                    name: 'meta.group.assertion.regexp',
                    begin: '(\\()((\\?=)|(\\?!)|(\\?<=)|(\\?<!))',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.group.regexp',
                      },
                      '2': {
                        name: 'punctuation.definition.group.assertion.regexp',
                      },
                      '3': {
                        name: 'meta.assertion.look-ahead.regexp',
                      },
                      '4': {
                        name: 'meta.assertion.negative-look-ahead.regexp',
                      },
                      '5': {
                        name: 'meta.assertion.look-behind.regexp',
                      },
                      '6': {
                        name: 'meta.assertion.negative-look-behind.regexp',
                      },
                    },
                    end: '(\\))',
                    endCaptures: {
                      '1': {
                        name: 'punctuation.definition.group.regexp',
                      },
                    },
                    patterns: [
                      {
                        include: '#regexp',
                      },
                    ],
                  },
                  {
                    name: 'meta.group.regexp',
                    begin: '\\((?:(\\?:)|(?:\\?<([a-zA-Z_$][\\w$]*)>))?',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.group.regexp',
                      },
                      '1': {
                        name: 'punctuation.definition.group.no-capture.regexp',
                      },
                      '2': {
                        name: 'variable.other.regexp',
                      },
                    },
                    end: '\\)',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.group.regexp',
                      },
                    },
                    patterns: [
                      {
                        include: '#regexp',
                      },
                    ],
                  },
                  {
                    name: 'constant.other.character-class.set.regexp',
                    begin: '(\\[)(\\^)?',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.character-class.regexp',
                      },
                      '2': {
                        name: 'keyword.operator.negation.regexp',
                      },
                    },
                    end: '(\\])',
                    endCaptures: {
                      '1': {
                        name: 'punctuation.definition.character-class.regexp',
                      },
                    },
                    patterns: [
                      {
                        name: 'constant.other.character-class.range.regexp',
                        match: '(?:.|(\\\\(?:[0-7]{3}|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}))|(\\\\c[A-Z])|(\\\\.))\\-(?:[^\\]\\\\]|(\\\\(?:[0-7]{3}|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}))|(\\\\c[A-Z])|(\\\\.))',
                        captures: {
                          '1': {
                            name: 'constant.character.numeric.regexp',
                          },
                          '2': {
                            name: 'constant.character.control.regexp',
                          },
                          '3': {
                            name: 'constant.character.escape.backslash.regexp',
                          },
                          '4': {
                            name: 'constant.character.numeric.regexp',
                          },
                          '5': {
                            name: 'constant.character.control.regexp',
                          },
                          '6': {
                            name: 'constant.character.escape.backslash.regexp',
                          },
                        },
                      },
                      {
                        include: '#regex-character-class',
                      },
                    ],
                  },
                  {
                    include: '#regex-character-class',
                  },
                ],
              },
              'regex-character-class': {
                patterns: [
                  {
                    name: 'constant.other.character-class.regexp',
                    match: '\\\\[wWsSdDtrnvf]|\\.',
                  },
                  {
                    name: 'constant.character.numeric.regexp',
                    match: '\\\\([0-7]{3}|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4})',
                  },
                  {
                    name: 'constant.character.control.regexp',
                    match: '\\\\c[A-Z]',
                  },
                  {
                    name: 'constant.character.escape.backslash.regexp',
                    match: '\\\\.',
                  },
                ],
              },
              comment: {
                patterns: [
                  {
                    name: 'comment.block.documentation.tsx',
                    begin: '/\\*\\*(?!/)',
                    beginCaptures: {
                      '0': {
                        name: 'punctuation.definition.comment.tsx',
                      },
                    },
                    end: '\\*/',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.comment.tsx',
                      },
                    },
                    patterns: [
                      {
                        include: '#docblock',
                      },
                    ],
                  },
                  {
                    name: 'comment.block.tsx',
                    begin: '(/\\*)(?:\\s*((@)internal)(?=\\s|(\\*/)))?',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.comment.tsx',
                      },
                      '2': {
                        name: 'storage.type.internaldeclaration.tsx',
                      },
                      '3': {
                        name: 'punctuation.decorator.internaldeclaration.tsx',
                      },
                    },
                    end: '\\*/',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.comment.tsx',
                      },
                    },
                  },
                  {
                    begin: '(^[ \\t]+)?((//)(?:\\s*((@)internal)(?=\\s|$))?)',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.whitespace.comment.leading.tsx',
                      },
                      '2': {
                        name: 'comment.line.double-slash.tsx',
                      },
                      '3': {
                        name: 'punctuation.definition.comment.tsx',
                      },
                      '4': {
                        name: 'storage.type.internaldeclaration.tsx',
                      },
                      '5': {
                        name: 'punctuation.decorator.internaldeclaration.tsx',
                      },
                    },
                    end: '(?=$)',
                    contentName: 'comment.line.double-slash.tsx',
                  },
                ],
              },
              'single-line-comment-consuming-line-ending': {
                begin: '(^[ \\t]+)?((//)(?:\\s*((@)internal)(?=\\s|$))?)',
                beginCaptures: {
                  '1': {
                    name: 'punctuation.whitespace.comment.leading.tsx',
                  },
                  '2': {
                    name: 'comment.line.double-slash.tsx',
                  },
                  '3': {
                    name: 'punctuation.definition.comment.tsx',
                  },
                  '4': {
                    name: 'storage.type.internaldeclaration.tsx',
                  },
                  '5': {
                    name: 'punctuation.decorator.internaldeclaration.tsx',
                  },
                },
                end: '(?=^)',
                contentName: 'comment.line.double-slash.tsx',
              },
              directives: {
                name: 'comment.line.triple-slash.directive.tsx',
                begin: "^(///)\\s*(?=<(reference|amd-dependency|amd-module)(\\s+(path|types|no-default-lib|lib|name|resolution-mode)\\s*=\\s*((\\'([^\\'\\\\]|\\\\.)*\\')|(\\\"([^\\\"\\\\]|\\\\.)*\\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)))+\\s*/>\\s*$)",
                beginCaptures: {
                  '1': {
                    name: 'punctuation.definition.comment.tsx',
                  },
                },
                end: '(?=$)',
                patterns: [
                  {
                    name: 'meta.tag.tsx',
                    begin: '(<)(reference|amd-dependency|amd-module)',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.tag.directive.tsx',
                      },
                      '2': {
                        name: 'entity.name.tag.directive.tsx',
                      },
                    },
                    end: '/>',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.tag.directive.tsx',
                      },
                    },
                    patterns: [
                      {
                        name: 'entity.other.attribute-name.directive.tsx',
                        match: 'path|types|no-default-lib|lib|name|resolution-mode',
                      },
                      {
                        name: 'keyword.operator.assignment.tsx',
                        match: '=',
                      },
                      {
                        include: '#string',
                      },
                    ],
                  },
                ],
              },
              docblock: {
                patterns: [
                  {
                    match: '(?x)\n((@)(?:access|api))\n\\s+\n(private|protected|public)\n\\b',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'constant.language.access-type.jsdoc',
                      },
                    },
                  },
                  {
                    match: '(?x)\n((@)author)\n\\s+\n(\n  [^@\\s<>*/]\n  (?:[^@<>*/]|\\*[^/])*\n)\n(?:\n  \\s*\n  (<)\n  ([^>\\s]+)\n  (>)\n)?',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                      '4': {
                        name: 'punctuation.definition.bracket.angle.begin.jsdoc',
                      },
                      '5': {
                        name: 'constant.other.email.link.underline.jsdoc',
                      },
                      '6': {
                        name: 'punctuation.definition.bracket.angle.end.jsdoc',
                      },
                    },
                  },
                  {
                    match: '(?x)\n((@)borrows) \\s+\n((?:[^@\\s*/]|\\*[^/])+)    # <that namepath>\n\\s+ (as) \\s+              # as\n((?:[^@\\s*/]|\\*[^/])+)    # <this namepath>',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                      '4': {
                        name: 'keyword.operator.control.jsdoc',
                      },
                      '5': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                    },
                  },
                  {
                    name: 'meta.example.jsdoc',
                    begin: '((@)example)\\s+',
                    end: '(?=@|\\*/)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    patterns: [
                      {
                        match: '^\\s\\*\\s+',
                      },
                      {
                        contentName: 'constant.other.description.jsdoc',
                        begin: '\\G(<)caption(>)',
                        beginCaptures: {
                          '0': {
                            name: 'entity.name.tag.inline.jsdoc',
                          },
                          '1': {
                            name: 'punctuation.definition.bracket.angle.begin.jsdoc',
                          },
                          '2': {
                            name: 'punctuation.definition.bracket.angle.end.jsdoc',
                          },
                        },
                        end: '(</)caption(>)|(?=\\*/)',
                        endCaptures: {
                          '0': {
                            name: 'entity.name.tag.inline.jsdoc',
                          },
                          '1': {
                            name: 'punctuation.definition.bracket.angle.begin.jsdoc',
                          },
                          '2': {
                            name: 'punctuation.definition.bracket.angle.end.jsdoc',
                          },
                        },
                      },
                      {
                        match: '[^\\s@*](?:[^*]|\\*[^/])*',
                        captures: {
                          '0': {
                            name: 'source.embedded.tsx',
                          },
                        },
                      },
                    ],
                  },
                  {
                    match: '(?x) ((@)kind) \\s+ (class|constant|event|external|file|function|member|mixin|module|namespace|typedef) \\b',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'constant.language.symbol-type.jsdoc',
                      },
                    },
                  },
                  {
                    match: '(?x)\n((@)see)\n\\s+\n(?:\n  # URL\n  (\n    (?=https?://)\n    (?:[^\\s*]|\\*[^/])+\n  )\n  |\n  # JSDoc namepath\n  (\n    (?!\n      # Avoid matching bare URIs (also acceptable as links)\n      https?://\n      |\n      # Avoid matching {@inline tags}; we match those below\n      (?:\\[[^\\[\\]]*\\])? # Possible description [preceding]{@tag}\n      {@(?:link|linkcode|linkplain|tutorial)\\b\n    )\n    # Matched namepath\n    (?:[^@\\s*/]|\\*[^/])+\n  )\n)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.link.underline.jsdoc',
                      },
                      '4': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                    },
                  },
                  {
                    match: '(?x)\n((@)template)\n\\s+\n# One or more valid identifiers\n(\n  [A-Za-z_$]         # First character: non-numeric word character\n  [\\w$.\\[\\]]*        # Rest of identifier\n  (?:                # Possible list of additional identifiers\n    \\s* , \\s*\n    [A-Za-z_$]\n    [\\w$.\\[\\]]*\n  )*\n)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.jsdoc',
                      },
                    },
                  },
                  {
                    begin: '(?x)((@)template)\\s+(?={)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                    patterns: [
                      {
                        include: '#jsdoctype',
                      },
                      {
                        name: 'variable.other.jsdoc',
                        match: '([A-Za-z_$][\\w$.\\[\\]]*)',
                      },
                    ],
                  },
                  {
                    match: '(?x)\n(\n  (@)\n  (?:arg|argument|const|constant|member|namespace|param|var)\n)\n\\s+\n(\n  [A-Za-z_$]\n  [\\w$.\\[\\]]*\n)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.jsdoc',
                      },
                    },
                  },
                  {
                    begin: '((@)typedef)\\s+(?={)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                    patterns: [
                      {
                        include: '#jsdoctype',
                      },
                      {
                        name: 'entity.name.type.instance.jsdoc',
                        match: '(?:[^@\\s*/]|\\*[^/])+',
                      },
                    ],
                  },
                  {
                    begin: '((@)(?:arg|argument|const|constant|member|namespace|param|prop|property|var))\\s+(?={)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                    patterns: [
                      {
                        include: '#jsdoctype',
                      },
                      {
                        name: 'variable.other.jsdoc',
                        match: '([A-Za-z_$][\\w$.\\[\\]]*)',
                      },
                      {
                        name: 'variable.other.jsdoc',
                        match: "(?x)\n(\\[)\\s*\n[\\w$]+\n(?:\n  (?:\\[\\])?                                        # Foo[ ].bar properties within an array\n  \\.                                                # Foo.Bar namespaced parameter\n  [\\w$]+\n)*\n(?:\n  \\s*\n  (=)                                                # [foo=bar] Default parameter value\n  \\s*\n  (\n    # The inner regexes are to stop the match early at */ and to not stop at escaped quotes\n    (?>\n      \"(?:(?:\\*(?!/))|(?:\\\\(?!\"))|[^*\\\\])*?\" |                      # [foo=\"bar\"] Double-quoted\n      '(?:(?:\\*(?!/))|(?:\\\\(?!'))|[^*\\\\])*?' |                      # [foo='bar'] Single-quoted\n      \\[ (?:(?:\\*(?!/))|[^*])*? \\] |                                # [foo=[1,2]] Array literal\n      (?:(?:\\*(?!/))|\\s(?!\\s*\\])|\\[.*?(?:\\]|(?=\\*/))|[^*\\s\\[\\]])*   # Everything else\n    )*\n  )\n)?\n\\s*(?:(\\])((?:[^*\\s]|\\*[^\\s/])+)?|(?=\\*/))",
                        captures: {
                          '1': {
                            name: 'punctuation.definition.optional-value.begin.bracket.square.jsdoc',
                          },
                          '2': {
                            name: 'keyword.operator.assignment.jsdoc',
                          },
                          '3': {
                            name: 'source.embedded.tsx',
                          },
                          '4': {
                            name: 'punctuation.definition.optional-value.end.bracket.square.jsdoc',
                          },
                          '5': {
                            name: 'invalid.illegal.syntax.jsdoc',
                          },
                        },
                      },
                    ],
                  },
                  {
                    begin: '(?x)\n(\n  (@)\n  (?:define|enum|exception|export|extends|lends|implements|modifies\n  |namespace|private|protected|returns?|satisfies|suppress|this|throws|type\n  |yields?)\n)\n\\s+(?={)',
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                    end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                    patterns: [
                      {
                        include: '#jsdoctype',
                      },
                    ],
                  },
                  {
                    match: '(?x)\n(\n  (@)\n  (?:alias|augments|callback|constructs|emits|event|fires|exports?\n  |extends|external|function|func|host|lends|listens|interface|memberof!?\n  |method|module|mixes|mixin|name|requires|see|this|typedef|uses)\n)\n\\s+\n(\n  (?:\n    [^{}@\\s*] | \\*[^/]\n  )+\n)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                    },
                  },
                  {
                    contentName: 'variable.other.jsdoc',
                    begin: "((@)(?:default(?:value)?|license|version))\\s+(([''\"]))",
                    beginCaptures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.jsdoc',
                      },
                      '4': {
                        name: 'punctuation.definition.string.begin.jsdoc',
                      },
                    },
                    end: '(\\3)|(?=$|\\*/)',
                    endCaptures: {
                      '0': {
                        name: 'variable.other.jsdoc',
                      },
                      '1': {
                        name: 'punctuation.definition.string.end.jsdoc',
                      },
                    },
                  },
                  {
                    match: '((@)(?:default(?:value)?|license|tutorial|variation|version))\\s+([^\\s*]+)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                      '3': {
                        name: 'variable.other.jsdoc',
                      },
                    },
                  },
                  {
                    name: 'storage.type.class.jsdoc',
                    match: '(?x) (@) (?:abstract|access|alias|api|arg|argument|async|attribute|augments|author|beta|borrows|bubbles |callback|chainable|class|classdesc|code|config|const|constant|constructor|constructs|copyright |default|defaultvalue|define|deprecated|desc|description|dict|emits|enum|event|example|exception |exports?|extends|extension(?:_?for)?|external|externs|file|fileoverview|final|fires|for|func |function|generator|global|hideconstructor|host|ignore|implements|implicitCast|inherit[Dd]oc |inner|instance|interface|internal|kind|lends|license|listens|main|member|memberof!?|method |mixes|mixins?|modifies|module|name|namespace|noalias|nocollapse|nocompile|nosideeffects |override|overview|package|param|polymer(?:Behavior)?|preserve|private|prop|property|protected |public|read[Oo]nly|record|require[ds]|returns?|see|since|static|struct|submodule|summary |suppress|template|this|throws|todo|tutorial|type|typedef|unrestricted|uses|var|variation |version|virtual|writeOnce|yields?) \\b',
                    captures: {
                      '1': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                  },
                  {
                    include: '#inline-tags',
                  },
                  {
                    match: '((@)(?:[_$[:alpha:]][_$[:alnum:]]*))(?=\\s+)',
                    captures: {
                      '1': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.block.tag.jsdoc',
                      },
                    },
                  },
                ],
              },
              brackets: {
                patterns: [
                  {
                    begin: '{',
                    end: '}|(?=\\*/)',
                    patterns: [
                      {
                        include: '#brackets',
                      },
                    ],
                  },
                  {
                    begin: '\\[',
                    end: '\\]|(?=\\*/)',
                    patterns: [
                      {
                        include: '#brackets',
                      },
                    ],
                  },
                ],
              },
              'inline-tags': {
                patterns: [
                  {
                    name: 'constant.other.description.jsdoc',
                    match: '(\\[)[^\\]]+(\\])(?={@(?:link|linkcode|linkplain|tutorial))',
                    captures: {
                      '1': {
                        name: 'punctuation.definition.bracket.square.begin.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.bracket.square.end.jsdoc',
                      },
                    },
                  },
                  {
                    name: 'entity.name.type.instance.jsdoc',
                    begin: '({)((@)(?:link(?:code|plain)?|tutorial))\\s*',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.bracket.curly.begin.jsdoc',
                      },
                      '2': {
                        name: 'storage.type.class.jsdoc',
                      },
                      '3': {
                        name: 'punctuation.definition.inline.tag.jsdoc',
                      },
                    },
                    end: '}|(?=\\*/)',
                    endCaptures: {
                      '0': {
                        name: 'punctuation.definition.bracket.curly.end.jsdoc',
                      },
                    },
                    patterns: [
                      {
                        match: '\\G((?=https?://)(?:[^|}\\s*]|\\*[/])+)(\\|)?',
                        captures: {
                          '1': {
                            name: 'variable.other.link.underline.jsdoc',
                          },
                          '2': {
                            name: 'punctuation.separator.pipe.jsdoc',
                          },
                        },
                      },
                      {
                        match: '\\G((?:[^{}@\\s|*]|\\*[^/])+)(\\|)?',
                        captures: {
                          '1': {
                            name: 'variable.other.description.jsdoc',
                          },
                          '2': {
                            name: 'punctuation.separator.pipe.jsdoc',
                          },
                        },
                      },
                    ],
                  },
                ],
              },
              jsdoctype: {
                patterns: [
                  {
                    contentName: 'entity.name.type.instance.jsdoc',
                    begin: '\\G({)',
                    beginCaptures: {
                      '0': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                      '1': {
                        name: 'punctuation.definition.bracket.curly.begin.jsdoc',
                      },
                    },
                    end: '((}))\\s*|(?=\\*/)',
                    endCaptures: {
                      '1': {
                        name: 'entity.name.type.instance.jsdoc',
                      },
                      '2': {
                        name: 'punctuation.definition.bracket.curly.end.jsdoc',
                      },
                    },
                    patterns: [
                      {
                        include: '#brackets',
                      },
                    ],
                  },
                ],
              },
              jsx: {
                patterns: [
                  {
                    include: '#jsx-tag-without-attributes-in-expression',
                  },
                  {
                    include: '#jsx-tag-in-expression',
                  },
                ],
              },
              'jsx-tag-without-attributes-in-expression': {
                begin: '(?<!\\+\\+|--)(?<=[({\\[,?=>:*]|&&|\\|\\||\\?|\\*\\/|^await|[^\\._$[:alnum:]]await|^return|[^\\._$[:alnum:]]return|^default|[^\\._$[:alnum:]]default|^yield|[^\\._$[:alnum:]]yield|^)\\s*(?=(<)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))?\\s*(>))',
                end: '(?!(<)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))?\\s*(>))',
                patterns: [
                  {
                    include: '#jsx-tag-without-attributes',
                  },
                ],
              },
              'jsx-tag-without-attributes': {
                name: 'meta.tag.without-attributes.tsx',
                begin: '(<)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))?\\s*(>)',
                end: '(</)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))?\\s*(>)',
                beginCaptures: {
                  '1': {
                    name: 'punctuation.definition.tag.begin.tsx',
                  },
                  '2': {
                    name: 'entity.name.tag.namespace.tsx',
                  },
                  '3': {
                    name: 'punctuation.separator.namespace.tsx',
                  },
                  '4': {
                    name: 'entity.name.tag.tsx',
                  },
                  '5': {
                    name: 'support.class.component.tsx',
                  },
                  '6': {
                    name: 'punctuation.definition.tag.end.tsx',
                  },
                },
                endCaptures: {
                  '1': {
                    name: 'punctuation.definition.tag.begin.tsx',
                  },
                  '2': {
                    name: 'entity.name.tag.namespace.tsx',
                  },
                  '3': {
                    name: 'punctuation.separator.namespace.tsx',
                  },
                  '4': {
                    name: 'entity.name.tag.tsx',
                  },
                  '5': {
                    name: 'support.class.component.tsx',
                  },
                  '6': {
                    name: 'punctuation.definition.tag.end.tsx',
                  },
                },
                contentName: 'meta.jsx.children.tsx',
                patterns: [
                  {
                    include: '#jsx-children',
                  },
                ],
              },
              'jsx-tag-in-expression': {
                begin: '(?x)\n  (?<!\\+\\+|--)(?<=[({\\[,?=>:*]|&&|\\|\\||\\?|\\*\\/|^await|[^\\._$[:alnum:]]await|^return|[^\\._$[:alnum:]]return|^default|[^\\._$[:alnum:]]default|^yield|[^\\._$[:alnum:]]yield|^)\\s*\n  (?!<\\s*[_$[:alpha:]][_$[:alnum:]]*((\\s+extends\\s+[^=>])|,)) # look ahead is not type parameter of arrow\n  (?=(<)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))(?=((<\\s*)|(\\s+))(?!\\?)|\\/?>))',
                end: '(?!(<)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))(?=((<\\s*)|(\\s+))(?!\\?)|\\/?>))',
                patterns: [
                  {
                    include: '#jsx-tag',
                  },
                ],
              },
              'jsx-tag': {
                name: 'meta.tag.tsx',
                begin: '(?=(<)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))(?=((<\\s*)|(\\s+))(?!\\?)|\\/?>))',
                end: '(/>)|(?:(</)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))?\\s*(>))',
                endCaptures: {
                  '1': {
                    name: 'punctuation.definition.tag.end.tsx',
                  },
                  '2': {
                    name: 'punctuation.definition.tag.begin.tsx',
                  },
                  '3': {
                    name: 'entity.name.tag.namespace.tsx',
                  },
                  '4': {
                    name: 'punctuation.separator.namespace.tsx',
                  },
                  '5': {
                    name: 'entity.name.tag.tsx',
                  },
                  '6': {
                    name: 'support.class.component.tsx',
                  },
                  '7': {
                    name: 'punctuation.definition.tag.end.tsx',
                  },
                },
                patterns: [
                  {
                    begin: '(<)\\s*(?:([_$[:alpha:]][-_$[:alnum:].]*)(?<!\\.|-)(:))?((?:[a-z][a-z0-9]*|([_$[:alpha:]][-_$[:alnum:].]*))(?<!\\.|-))(?=((<\\s*)|(\\s+))(?!\\?)|\\/?>)',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.tag.begin.tsx',
                      },
                      '2': {
                        name: 'entity.name.tag.namespace.tsx',
                      },
                      '3': {
                        name: 'punctuation.separator.namespace.tsx',
                      },
                      '4': {
                        name: 'entity.name.tag.tsx',
                      },
                      '5': {
                        name: 'support.class.component.tsx',
                      },
                    },
                    end: '(?=[/]?>)',
                    patterns: [
                      {
                        include: '#comment',
                      },
                      {
                        include: '#type-arguments',
                      },
                      {
                        include: '#jsx-tag-attributes',
                      },
                    ],
                  },
                  {
                    begin: '(>)',
                    beginCaptures: {
                      '1': {
                        name: 'punctuation.definition.tag.end.tsx',
                      },
                    },
                    end: '(?=</)',
                    contentName: 'meta.jsx.children.tsx',
                    patterns: [
                      {
                        include: '#jsx-children',
                      },
                    ],
                  },
                ],
              },
              'jsx-children': {
                patterns: [
                  {
                    include: '#jsx-tag-without-attributes',
                  },
                  {
                    include: '#jsx-tag',
                  },
                  {
                    include: '#jsx-evaluated-code',
                  },
                  {
                    include: '#jsx-entities',
                  },
                ],
              },
              'jsx-evaluated-code': {
                contentName: 'meta.embedded.expression.tsx',
                begin: '\\{',
                end: '\\}',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.section.embedded.begin.tsx',
                  },
                },
                endCaptures: {
                  '0': {
                    name: 'punctuation.section.embedded.end.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#expression',
                  },
                ],
              },
              'jsx-entities': {
                patterns: [
                  {
                    name: 'constant.character.entity.tsx',
                    match: '(&)([a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+)(;)',
                    captures: {
                      '1': {
                        name: 'punctuation.definition.entity.tsx',
                      },
                      '3': {
                        name: 'punctuation.definition.entity.tsx',
                      },
                    },
                  },
                ],
              },
              'jsx-tag-attributes': {
                name: 'meta.tag.attributes.tsx',
                begin: '\\s+',
                end: '(?=[/]?>)',
                patterns: [
                  {
                    include: '#comment',
                  },
                  {
                    include: '#jsx-tag-attribute-name',
                  },
                  {
                    include: '#jsx-tag-attribute-assignment',
                  },
                  {
                    include: '#jsx-string-double-quoted',
                  },
                  {
                    include: '#jsx-string-single-quoted',
                  },
                  {
                    include: '#jsx-evaluated-code',
                  },
                  {
                    include: '#jsx-tag-attributes-illegal',
                  },
                ],
              },
              'jsx-tag-attribute-name': {
                match: '(?x)\n  \\s*\n  (?:([_$[:alpha:]][-_$[:alnum:].]*)(:))?\n  ([_$[:alpha:]][-_$[:alnum:]]*)\n  (?=\\s|=|/?>|/\\*|//)',
                captures: {
                  '1': {
                    name: 'entity.other.attribute-name.namespace.tsx',
                  },
                  '2': {
                    name: 'punctuation.separator.namespace.tsx',
                  },
                  '3': {
                    name: 'entity.other.attribute-name.tsx',
                  },
                },
              },
              'jsx-tag-attribute-assignment': {
                name: 'keyword.operator.assignment.tsx',
                match: "=(?=\\s*(?:'|\"|{|/\\*|//|\\n))",
              },
              'jsx-string-double-quoted': {
                name: 'string.quoted.double.tsx',
                begin: '"',
                end: '"',
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.string.begin.tsx',
                  },
                },
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.string.end.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#jsx-entities',
                  },
                ],
              },
              'jsx-string-single-quoted': {
                name: 'string.quoted.single.tsx',
                begin: "'",
                end: "'",
                beginCaptures: {
                  '0': {
                    name: 'punctuation.definition.string.begin.tsx',
                  },
                },
                endCaptures: {
                  '0': {
                    name: 'punctuation.definition.string.end.tsx',
                  },
                },
                patterns: [
                  {
                    include: '#jsx-entities',
                  },
                ],
              },
              'jsx-tag-attributes-illegal': {
                name: 'invalid.illegal.attribute.tsx',
                match: '\\S+',
              },
            },
          },
          grammarLocation: './syntaxes/TypeScriptReact.tmLanguage.json',
          injectTo: undefined,
          embeddedLanguages: {
            'meta.tag.tsx': 'jsx-tags',
            'meta.tag.without-attributes.tsx': 'jsx-tags',
            'meta.tag.attributes.tsx': 'typescriptreact',
            'meta.embedded.expression.tsx': 'typescriptreact',
          },
          tokenTypes: {
            'meta.template.expression': 'other',
            'meta.template.expression string': 'string',
            'meta.template.expression comment': 'comment',
            'entity.name.type.instance.jsdoc': 'other',
            'entity.name.function.tagged-template': 'other',
            'meta.import string.quoted': 'other',
            'variable.other.jsdoc': 'other',
          },
        },
        {
          language: undefined,
          scope: 'documentation.injection.ts',
          format: 'json',
          grammar: {
            injectionSelector: 'L:comment.block.documentation',
            patterns: [
              {
                include: '#jsdocbody',
              },
            ],
            repository: {
              jsdocbody: {
                begin: '(?<=/\\*\\*)([^*]|\\*(?!/))*$',
                while: '(^|\\G)\\s*\\*(?!/)(?=([^*]|[*](?!/))*$)',
                patterns: [
                  {
                    include: 'source.ts#docblock',
                  },
                ],
              },
            },
            scopeName: 'documentation.injection.ts',
          },
          grammarLocation: './syntaxes/jsdoc.ts.injection.tmLanguage.json',
          injectTo: [
            'source.ts',
            'source.tsx',
          ],
          embeddedLanguages: undefined,
          tokenTypes: undefined,
        },
        {
          language: undefined,
          scope: 'documentation.injection.js.jsx',
          format: 'json',
          grammar: {
            injectionSelector: 'L:comment.block.documentation',
            patterns: [
              {
                include: '#jsdocbody',
              },
            ],
            repository: {
              jsdocbody: {
                begin: '(?<=/\\*\\*)([^*]|\\*(?!/))*$',
                while: '(^|\\G)\\s*\\*(?!/)(?=([^*]|[*](?!/))*$)',
                patterns: [
                  {
                    include: 'source.ts#docblock',
                  },
                ],
              },
            },
            scopeName: 'documentation.injection.js.jsx',
          },
          grammarLocation: './syntaxes/jsdoc.js.injection.tmLanguage.json',
          injectTo: [
            'source.js',
            'source.js.jsx',
          ],
          embeddedLanguages: undefined,
          tokenTypes: undefined,
        },
      ],
      problemMatchers: undefined,
      problemPatterns: undefined,
      resourceLabelFormatters: undefined,
      authentication: undefined,
      notebooks: undefined,
      snippets: [
        {
          language: 'typescript',
          source: 'TypeScript Language Basics (built-in)',
          uri: 'file:///home/user/theia/theia/plugins/ts-base/extension/snippets/typescript.code-snippets',
        },
        {
          language: 'typescriptreact',
          source: 'TypeScript Language Basics (built-in)',
          uri: 'file:///home/user/theia/theia/plugins/ts-base/extension/snippets/typescript.code-snippets',
        },
      ],
      themes: undefined,
      iconThemes: undefined,
      colors: undefined,
      localizations: undefined,
      terminalProfiles: undefined,
    },
  },
];
