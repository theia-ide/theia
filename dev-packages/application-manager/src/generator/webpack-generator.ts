/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import * as paths from 'path';
import * as fs from 'fs-extra';
import { AbstractGenerator } from './abstract-generator';

export class WebpackGenerator extends AbstractGenerator {

    async generate(): Promise<void> {
        await this.write(this.genConfigPath, this.compileWebpackConfig());
        if (await this.shouldGenerateUserWebpackConfig()) {
            await this.write(this.configPath, this.compileUserWebpackConfig());
        }
    }

    protected async shouldGenerateUserWebpackConfig(): Promise<boolean> {
        if (!(await fs.pathExists(this.configPath))) {
            return true;
        }
        const content = await fs.readFile(this.configPath, 'utf8');
        return content.indexOf('gen-webpack') === -1;
    }

    get configPath(): string {
        return this.pck.path('webpack.config.js');
    }

    get genConfigPath(): string {
        return this.pck.path('gen-webpack.config.js');
    }

    protected resolve(moduleName: string, path: string): string {
        return this.pck.resolveModulePath(moduleName, path).split(paths.sep).join('/');
    }

    protected compileWebpackConfig(): string {
        return `/**
 * Don't touch this file. It will be regenerated by theia build.
 * To customize webpack configuration change ${this.configPath}
 */
// @ts-check
const path = require('path');
const webpack = require('webpack');
const yargs = require('yargs');
${this.ifMonaco(() => `const CopyWebpackPlugin = require('copy-webpack-plugin');
`)}const CircularDependencyPlugin = require('circular-dependency-plugin');
const CompressionPlugin = require('compression-webpack-plugin')

const outputPath = path.resolve(__dirname, 'lib');
const { mode, staticCompression }  = yargs.option('mode', {
    description: "Mode to use",
    choices: ["development", "production"],
    default: "production"
}).option('static-compression', {
    description: 'Controls whether to enable compression of static artifacts.',
    type: 'boolean',
    default: true
}).argv;
const development = mode === 'development';

const plugins = [
    new webpack.ProvidePlugin({
        // the Buffer class doesn't exist in the browser but some dependencies rely on it
        Buffer: ['buffer', 'Buffer']
    })
];
// it should go after copy-plugin in order to compress monaco as well
if (staticCompression) {
    plugins.push(new CompressionPlugin({}));
}
plugins.push(new CircularDependencyPlugin({
    exclude: /(node_modules|examples)[\\\\|\/]./,
    failOnError: false // https://github.com/nodejs/readable-stream/issues/280#issuecomment-297076462
}));

module.exports = {
    mode,
    plugins,
    devtool: 'source-map',
    entry: {
        bundle: path.resolve(__dirname, 'src-gen/frontend/index.js'),
        ${this.ifMonaco(() => "'editor.worker': 'monaco-editor-core/esm/vs/editor/editor.worker.js'")}
    },
    output: {
        filename: '[name].js',
        path: outputPath,
        devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
        globalObject: 'self'
    },
    target: '${this.ifBrowser('web', 'electron-renderer')}',
    cache: staticCompression,
    module: {
        rules: [
            {
                test: /\\.css$/,
                exclude: /materialcolors\\.css$|\\.useable\\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /materialcolors\\.css$|\\.useable\\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            esModule: false,
                            injectType: 'lazySingletonStyleTag',
                            attributes: {
                                id: 'theia-theme'
                            }
                        }
                    },
                    'css-loader'
                ]
            },
            {
                test: /\\.(ttf|eot|svg)(\\?v=\\d+\\.\\d+\\.\\d+)?$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10000,
                    }
                },
                generator: {
                    dataUrl: {
                        mimetype: 'image/svg+xml'
                    }
                }
            },
            {
                test: /\\.(jpg|png|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[hash].[ext]'
                }
            },
            {
                // see https://github.com/eclipse-theia/theia/issues/556
                test: /source-map-support/,
                loader: 'ignore-loader'
            },
            {
                test: /\\.js$/,
                enforce: 'pre',
                loader: 'source-map-loader',
                exclude: /jsonc-parser|fast-plist|onigasm/
            },
            {
                test: /\\.woff(2)?(\\?v=[0-9]\\.[0-9]\\.[0-9])?$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10000,
                    }
                },
                generator: {
                    dataUrl: {
                        mimetype: 'image/svg+xml'
                    }
                }
            },
            {
                test: /node_modules[\\\\|\/](vscode-languageserver-types|vscode-uri|jsonc-parser|vscode-languageserver-protocol)/,
                loader: 'umd-compat-loader'
            },
            {
                test: /\\.wasm$/,
                type: 'asset/resource'
            },
            {
                test: /\\.plist$/,
                type: 'asset/resource'
            }
        ]
    },
    resolve: {
        fallback: {
            'child_process': false,
            'crypto': false,
            'net': false,
            'path': require.resolve('path-browserify'),
            'process': false,
            'os': false,
            'timers': false
        },
        extensions: ['.js']
    },
    stats: {
        warnings: true,
        children: true
    }
};`;
    }

    protected compileUserWebpackConfig(): string {
        return `/**
 * This file can be edited to customize webpack configuration.
 * To reset delete this file and rerun theia build again.
 */
// @ts-check
const config = require('./${paths.basename(this.genConfigPath)}');

/**
 * Expose bundled modules on window.theia.moduleName namespace, e.g.
 * window['theia']['@theia/core/lib/common/uri'].
 * Such syntax can be used by external code, for instance, for testing.
config.module.rules.push({
    test: /\\.js$/,
    loader: require.resolve('@theia/application-manager/lib/expose-loader')
}); */

module.exports = config;`;
    }

}
