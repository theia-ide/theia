## Browser-Only

### Static Extension Support

Currently, Theia Browser-Only supports the static configuration of extensions. This means only the extensions that are statically configured at build time will be available in the browser. Theia Browser-Only does not support dynamic extension loading at runtime.

When it comes to extension support, there are some restrictions to consider:
1. The extensions must be compatible to run in a browser environment. This means that ideally, the extension is already a web extension according to the [VS Code Web Extension API](https://code.visualstudio.com/api/extension-guides/web-extensions).
2. The extensions must not rely on Node.js APIs or other APIs that are not available in the browser.

There are two ways to retrieve extensions:
1. VSIX packages: Copy the `.vsix` files to the directory specified in the `package.json` file by the `theiaPluginsDir` property. (e.g. `"theiaPluginsDir": "plugins"`)
2. Open VSX Link: Specify a list of `id:link` mappings in the `package.json` file by the `theiaPlugins` property (e.g. `"theiaPlugins": { "vscodevim.vim": "https://open-vsx.org/api/vscodevim/vim/1.29.0/file/vscodevim.vim-1.29.0.vsix" }`). Extensions can be found on the [Open VSX Registry](https://open-vsx.org/) by searching for the extension and copying the link linked to the Download button.
When using the Theia CLI command `theia download:plugins`, the Theia CLI will download the `.vsix` files from the specified links and install them in the directory specified by the `theiaPluginsDir` property.

After the extensions are downloaded, they need to be unpacked and placed in the **`lib/frontend/hostedPlugin`** directory so that they can be used by Theia Browser-Only.

To achieve this, the `.vsix` files must be extracted, and their contents copied into the correct directory structure. This process involves:
1. Unpacking the `.vsix` files.
2. Copying the extracted contents into the **`lib/frontend/hostedPlugin`** directory. Make sure to copy the `extension` folder from the VSIX file and name it according to the extension's id (typically the publisher name and the extension name separated by a dot).

This process can be automated using a script. For an example implementation, you can refer to the [prepare-plugins.js script](examples/browser-only/prepare-plugins.js), which demonstrates how to extract and place the `.vsix` files in the appropriate location.

As Theia need to know which extensions are available, the `pluginMetadata` inside the `PluginLocalOptions` needs to be updated with the metadata of the extensions. This can be achieved by specifying the metadata and binding it to `PluginLocalOptions` (see this [example initialization](examples/api-samples/src/browser-only/plugin-sample/example-plugin-initialization.ts)).

As of now, the metadata is required to be specified manually. In the future, it is planned to automate this process.
An example of the format of meta can be found [here](examples/api-samples/src/browser-only/plugin-sample/example-static-plugin-metadata.ts). In the following section we will give tips on how to generate this metadata such that it adheres to the `DeployedPlugin` interface (see [`plugin-protocol.ts`](packages/plugin-ext/src/common/plugin-protocol.ts)).

#### Creating the static metadata
Most of the information to create the model in metadata can be found in the `package.json` file of the extension.

The general structure of each entry should be as follows:
```typescript
{
    "metadata": {
        ...
    },
    "type": 0, // should always be set to 0
    "contributes": {
        ...
    },
  },
```

The `metadata` object should contain the following fields:
```typescript
metadata: {
    'host': 'main', // Should always be set to 'main'
    'model': {
        'packagePath': '/home/user/theia/examples/browser-only/plugins/theia.helloworld-web-sample/extension', // Deprecated
        'packageUri': 'file:///home/user/theia/examples/browser-only/plugins/theia.helloworld-web-sample/extension', // The absolute path to the extension's location inside the 'theiaPluginsDir' directory; prefixed with 'file://' protocol
        'id': 'theia.helloworld-web-sample', // the extension's id; typically the publisher name and the extension name separated by a dot
        'name': 'helloworld-web-sample', // the extension's name as specified in the 'package.json' file
        'publisher': 'theia', // the extension's publisher as specified in the 'package.json' file
        'version': '0.0.1', // the extension's version as specified in the 'package.json' file
        'displayName': 'theia.helloworld-web-sample', // the extension's display name as specified in the 'package.json' file
        'description': '', // the extension's description as specified in the 'package.json' file
        'engine': {
            'type': 'vscode', // incase of vscode web extension; if Theia plugin, set to 'theiaPlugin'
            'version': '^1.74.0' // the version of the engine the extension is compatible with; specified in the 'engines' field of the 'package.json' file
        },
        'entryPoint': {
            'frontend': 'dist/web/extension.js' // specified by the 'browser' field in the 'package.json' file for VScode web extensions or 'frontend' field for Theia plugins
        }
        iconUrl: 'hostedPlugin/theia_helloworld_web_sample/media%2Ficon.png', // optional: the path to the extension's icon; prefixed with 'hostedPlugin' and URL encoded
        l10n: undefined,
        readmeUrl: 'hostedPlugin/theia_helloworld_web_sample/.%2FREADME.md', // optional: the path to the extension's README file; prefixed with 'hostedPlugin' and URL encoded
        licenseUrl: 'hostedPlugin/theia_helloworld_web_sample/.%2FLICENSE', // optional: the path to the extension's LICENSE file; prefixed with 'hostedPlugin' and URL encoded
    },
    'lifecycle': {
        'startMethod': 'activate', // the method to call when the extension is activated; typically 'activate' for VS Code extensions and 'start' for Theia plugins
        'stopMethod': 'deactivate', // the method to call when the extension is deactivated; typically 'deactivate' for VS Code extensions and 'stop' for Theia plugins
        'frontendModuleName': 'theia_helloworld_web_sample', // the id specified above but with underscores instead of dots and dashes similar to iconUrl, readmeUrl, and licenseUrl
        'frontendInitPath': 'plugin-vscode-init-fe.js', // the path to the frontend initialization script; only required for VS Code extensions
    },
    'outOfSync': false, // should always be set to false
    'isUnderDevelopment': false // should always be set to false
},
```

For the `contributes` object, one can copy the `contributes` object from the `package.json` file of the extension. This object contains the contributions the extension makes to the Theia application. This includes 'activationEvents', 'commands', 'configuration', 'debuggers' etc. Details on the structure of the `contributes` object can be found in the [plugin-protocol file under PluginContribution](packages/plugin-ext/src/common/plugin-protocol.ts).

Once this static metadata is complete, one can build and start the Theia Browser-Only application. The extensions should now be available in the browser. To verify that the extensions are correctly packaged with the Theia Browser-Only application, one can check the `lib/frontend/hostedPlugin` directory. The extensions should be present in this directory with the correct `frontendModuleName`.
