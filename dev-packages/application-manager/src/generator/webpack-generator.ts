// *****************************************************************************
// Copyright (C) 2017 TypeFox and others.
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

import * as paths from 'path';
import * as fs from 'fs-extra';
import { AbstractGenerator } from './abstract-generator';

export class WebpackGenerator extends AbstractGenerator {

    async generate(): Promise<void> {
        await this.write(this.genConfigPath, this.compileWebpackConfig());
        await this.write(this.genNodeConfigPath, this.compileNodeWebpackConfig());
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

    get genNodeConfigPath(): string {
        return this.pck.path('gen-webpack.node.config.js');
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
const resolvePackagePath = require('resolve-package-path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const outputPath = path.resolve(__dirname, 'lib', 'frontend');
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
    new CopyWebpackPlugin({
        patterns: [
            {
                // copy secondary window html file to lib folder
                from: path.resolve(__dirname, 'src-gen/frontend/secondary-window.html')
            }${this.ifPackage('@theia/plugin-ext', `,
            {
                // copy webview files to lib folder
                from: path.join(resolvePackagePath('@theia/plugin-ext', __dirname), '..', 'src', 'main', 'browser', 'webview', 'pre'),
                to: path.resolve(__dirname, 'lib', 'webview', 'pre')
            }`)}
        ]
    }),
    new webpack.ProvidePlugin({
        // the Buffer class doesn't exist in the browser but some dependencies rely on it
        Buffer: ['buffer', 'Buffer']
    })
];
// it should go after copy-plugin in order to compress monaco as well
if (staticCompression) {
    plugins.push(new CompressionPlugin({}));
}

module.exports = [{
    mode,
    plugins,
    devtool: 'source-map',
    entry: {
        bundle: path.resolve(__dirname, 'src-gen/frontend/index.js'),
        ${this.ifMonaco(() => "'editor.worker': '@theia/monaco-editor-core/esm/vs/editor/editor.worker.js'")}
    },
    output: {
        filename: '[name].js',
        path: outputPath,
        devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
        globalObject: 'self'
    },
    target: 'web',
    cache: staticCompression,
    module: {
        rules: [
            {
                // Removes the host check in PhosphorJS to enable moving widgets to secondary windows.
                test: /widget\\.js$/,
                loader: 'string-replace-loader',
                include: /node_modules[\\\\/]@phosphor[\\\\/]widgets[\\\\/]lib/,
                options: {
                    multiple: [
                        {
                            search: /document\\.body\\.contains\\(widget.node\\)/gm,
                            replace: 'widget.node.ownerDocument.body.contains(widget.node)'
                        },
                        {
                            search: /\\!document\\.body\\.contains\\(host\\)/gm,
                            replace: ' !host.ownerDocument.body.contains(host)'
                        }
                    ]
                }
            },
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
    },
    ignoreWarnings: [
        // Some packages do not have source maps, that's ok
        /Failed to parse source map/,
        {
            // Monaco uses 'require' in a non-standard way
            module: /@theia\\/monaco-editor-core/,
            message: /require function is used in a way in which dependencies cannot be statically extracted/
        }
    ]
},
{
    mode,
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
    ],
    devtool: 'source-map',
    entry: {
        "secondary-window": path.resolve(__dirname, 'src-gen/frontend/secondary-index.js'),
    },
    output: {
        filename: '[name].js',
        path: outputPath,
        devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
        globalObject: 'self'
    },
    target: 'web',
    cache: staticCompression,
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
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
}${this.ifElectron(`, {
    mode,
    devtool: 'source-map',
    entry: {
        "preload": path.resolve(__dirname, 'src-gen/frontend/preload.js'),
    },
    output: {
        filename: '[name].js',
        path: outputPath,
        devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
        globalObject: 'self'
    },
    target: 'electron-preload',
    cache: staticCompression,
    stats: {
        warnings: true,
        children: true
    }
}`)}];`;
    }

    protected compileUserWebpackConfig(): string {
        return `/**
 * This file can be edited to customize webpack configuration.
 * To reset delete this file and rerun theia build again.
 */
// @ts-check
const configs = require('./${paths.basename(this.genConfigPath)}');
const nodeConfig = require('./${paths.basename(this.genNodeConfigPath)}');

/**
 * Expose bundled modules on window.theia.moduleName namespace, e.g.
 * window['theia']['@theia/core/lib/common/uri'].
 * Such syntax can be used by external code, for instance, for testing.
configs[0].module.rules.push({
    test: /\\.js$/,
    loader: require.resolve('@theia/application-manager/lib/expose-loader')
}); */

module.exports = [
    ...configs,
    nodeConfig.config
];`;
    }

    protected compileNodeWebpackConfig(): string {
        return `/**
 * Don't touch this file. It will be regenerated by theia build.
 * To customize webpack configuration change ${this.configPath}
 */
// @ts-check
const path = require('path');
const yargs = require('yargs');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const NativeWebpackPlugin = require('@theia/native-webpack-plugin');

const { mode } = yargs.option('mode', {
    description: "Mode to use",
    choices: ["development", "production"],
    default: "production"
}).argv;

const production = mode === 'production';

/** @type {import('webpack').EntryObject} */
const commonJsLibraries = {};
for (const [entryPointName, entryPointPath] of Object.entries({
    ${this.ifPackage('@theia/plugin-ext', "'backend-init-theia': '@theia/plugin-ext/lib/hosted/node/scanners/backend-init-theia',")}
    ${this.ifPackage('@theia/filesystem', "'nsfw-watcher': '@theia/filesystem/lib/node/nsfw-watcher',")}
    ${this.ifPackage('@theia/plugin-ext-vscode', "'plugin-vscode-init': '@theia/plugin-ext-vscode/lib/node/plugin-vscode-init',")}
})) {
    commonJsLibraries[entryPointName] = {
        import: require.resolve(entryPointPath),
        library: {
            type: 'commonjs2',
        },
    };
}

const ignoredResources = new Set();

if (process.platform !== 'win32') {
    ignoredResources.add('@vscode/windows-ca-certs');
}

const nativePlugin = new NativeWebpackPlugin({
    out: 'native',
    ripgrep: ${this.ifPackage('@theia/search-in-workspace', 'true', 'false')},
    pty: ${this.ifPackage('@theia/process', 'true', 'false')},
    nativeBindings: {
        drivelist: 'drivelist/build/Release/drivelist.node'
    }
});

/** @type {import('webpack').Configuration} */
const config = {
    mode,
    devtool: mode === 'development' ? 'source-map' : false,
    target: 'node',
    node: {
        global: false,
        __filename: false,
        __dirname: false
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'lib', 'backend'),
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]?[loaders]',
    },${this.ifElectron(`
    externals: {
        electron: 'require("electron")'
    },`)}
    entry: {
        // Main entry point of the Theia application backend:
        'main': require.resolve('./src-gen/backend/main'),
        // Theia's IPC mechanism:
        'ipc-bootstrap': require.resolve('@theia/core/lib/node/messaging/ipc-bootstrap'),
        ${this.ifPackage('@theia/plugin-ext', () => `// VS Code extension support:
        'plugin-host': require.resolve('@theia/plugin-ext/lib/hosted/node/plugin-host'),`)}
        ${this.ifPackage('@theia/process', () => `// Make sure the node-pty thread worker can be executed:
        'worker/conoutSocketWorker': require.resolve('node-pty/lib/worker/conoutSocketWorker'),`)}
        ${this.ifPackage('@theia/git', () => `// Ensure the git locator process can the started
        'git-locator-host': require.resolve('@theia/git/lib/node/git-locator/git-locator-host'),`)}
        ${this.ifElectron("'electron-main': require.resolve('./src-gen/backend/electron-main'),")}
        ...commonJsLibraries
    },
    module: {
        rules: [
            // Make sure we can still find and load our native addons.
            {
                test: /\\.node$/,
                loader: 'node-loader',
                options: {
                    name: 'native/[name].[ext]'
                }
            },
            {
                test: /\\.js$/,
                enforce: 'pre',
                loader: 'source-map-loader'
            },
            // jsonc-parser exposes its UMD implementation by default, which
            // confuses Webpack leading to missing js in the bundles.
            {
                test: /node_modules[\\/](jsonc-parser)/,
                loader: 'umd-compat-loader'
            }
        ]
    },
    plugins: [
        // Some native dependencies (bindings, @vscode/ripgrep) need special code replacements
        nativePlugin,
        // Optional node dependencies can be safely ignored
        new webpack.IgnorePlugin({
            checkResource: resource => ignoredResources.has(resource)
        })
    ],
    optimization: {
        // Split and reuse code across the various entry points
        splitChunks: {
            chunks: 'all'
        },
        // Only minimize if we run webpack in production mode
        minimize: production,
        minimizer: [
            new TerserPlugin({
                exclude: /^(lib|builtins)\\//
            })
        ]
    },
};

module.exports = {
    config,
    nativePlugin,
    ignoredResources
};
`;
    }

}
