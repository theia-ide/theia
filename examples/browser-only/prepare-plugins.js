// *****************************************************************************
// Copyright (C) 2024 robertjndw
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

const { promisify } = require('util');
const glob = promisify(require('glob'));
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

async function run() {
    // Resolve the `package.json` at the current working directory.
    const pck = JSON.parse(await fsp.readFile(path.resolve('package.json'), 'utf8'));

    // Resolve the directory for which to download the plugins.
    const pluginsDir = pck.theiaPluginsDir || 'extension';

    // Find all `plugin/extension/*` directories.
    const plugins = await glob(`${pluginsDir}/*/extension`);

    for (const pluginExtensionPath of plugins) {
        // Extract the plugin name from the parent folder of the extension.
        const pluginName = path.basename(path.dirname(pluginExtensionPath)).replace(/[.\-]/g, '_');
        const targetDir = path.join('lib', 'frontend', 'hostedPlugin', pluginName);

        // When the directory exists, skip it
        if (fs.existsSync(targetDir)) {
            console.log(`Plugin ${pluginName} already prepared. Skipping.`);
            continue;
        }
        // Ensure the target directory exists when not already present.
        await fsp.mkdir(targetDir, { recursive: true });

        // Copy the content of the `extension` folder to the target directory.
        const files = await glob(`${pluginExtensionPath}/**/*`, { nodir: true });
        for (const file of files) {
            const relativePath = path.relative(pluginExtensionPath, file);
            const target = path.join(targetDir, relativePath);

            // Ensure the target directory structure exists.
            await fsp.mkdir(path.dirname(target), { recursive: true });

            // Copy the file.
            await fsp.copyFile(file, target);
        }
    }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
