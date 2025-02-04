# Migration Guide

## Description

The following guide highlights potential migration steps necessary during `theia` upgrades discovered when adopting the framework.
Please see the latest version (`master`) for the most up-to-date information. Please contribute any issues you experienced when upgrading to a newer version of Theia to this document, even for previous releases.

## Guide

### General

_Builtin Extension Pack_:

If you are using the [`eclipse-theia.builtin-extension-pack@1.79.0`](https://open-vsx.org/extension/eclipse-theia/builtin-extension-pack) extension pack you may need to include the [`ms-vscode.js-debug`](https://open-vsx.org/extension/ms-vscode/js-debug) and [`ms-vscode.js-debug-companion`](https://open-vsx.org/extension/ms-vscode/js-debug-companion) plugins for JavaScript debug support.
There was an issue when the publishing of the pack which excluded these necessary builtins.

For example, in your application's `package.json`:

```json
"theiaPlugins": {
  "eclipse-theia.builtin-extension-pack": "https://open-vsx.org/api/eclipse-theia/builtin-extension-pack/1.79.0/file/eclipse-theia.builtin-extension-pack-1.79.0.vsix",
  "ms-vscode.js-debug": "https://open-vsx.org/api/ms-vscode/js-debug/1.78.0/file/ms-vscode.js-debug-1.78.0.vsix",
  "ms-vscode.js-debug-companion": "https://open-vsx.org/api/ms-vscode/js-debug-companion/1.1.2/file/ms-vscode.js-debug-companion-1.1.2.vsix"
}
```

_msgpackr_:

If you're experiencing [`maximum callstack exceeded`](https://github.com/eclipse-theia/theia/issues/12499) errors you may need to downgrade the version of `msgpackr` pulled using a [yarn resolution](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/).

```
rpc-message-encoder.ts:151 Uncaught (in promise) Error: Error during encoding: 'Maximum call stack size exceeded'
    at MsgPackMessageEncoder.encode (rpc-message-encoder.ts:151:23)
    at MsgPackMessageEncoder.request (rpc-message-encoder.ts:137:14)
    at RpcProtocol.sendRequest (rpc-protocol.ts:161:22)
    at proxy-handler.ts:74:45
```

For the best results follow the version used and tested by the framework.

For example:

```json
"resolutions": {
    "**/msgpackr": "1.8.3"
}
```

_socket.io-parser_:

Prior to [`v1.31.1`](https://github.com/eclipse-theia/theia/releases/tag/v1.31.1), a [resolution](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/) might be necessary to work-around a recently discovered [critical vulnerability](https://security.snyk.io/vuln/SNYK-JS-SOCKETIOPARSER-3091012) in one of our runtime dependencies [socket.io-parser](https://github.com/socketio/socket.io-parser).

For example:

```json
"resolutions": {
    "**/socket.io": "^4.5.3",
    "**/socket.io-client": "^4.5.3"
}
```

### v1.59.0

#### Refactor menu nodes [#14676](https://github.com/eclipse-theia/theia/pull/14676)

This PR makes menu nodes and tab toolbar items into active object instead of pure data descriptors. This means they can polymorphically handle concerns like enablement, visibility, command execution and rendering. This keeps concerns like conversion of parameters out of the general tool bar and menu handling code. In this way, we could get rid of the MenuCommandExecutor and MenuCommandAdapter infrastructure.
If you are simply registering toolbar items and menus, little will change for you as a Theia adopter. Mainly, some of the paremeter types have changed in menu-model-registry.ts. Menu registration has been simplified in that an independent submenu is simply a menu that is registered under a path that does not start with the MAIN_MENU_BAR prefix.
If you override any of the toolbar or menu related implementations in your product, the biggest change will be that some functionality is now delegated to the menu and too bar item implementations. If this breaks your use case, please let us know.

### v1.38.0

#### Inversify 6.0

With Inversify 6, the library has introduced a strict split between sync and async dependency injection contexts.
Theia uses the sync dependency injection context, and therefore no async dependencies cannot be used as dependencies in Theia.

This might require a few changes in your Theia extensions, if you've been using async dependencies before. These include:

1. Injecting promises directly into services
2. Classes with `@postConstruct` methods which return a `Promise` instance.

In order to work around 1., you can just wrap the promise inside of a function:

```diff
const PromiseSymbol = Symbol();
const promise = startLongRunningOperation();

-bind(PromiseSymbol).toConstantValue(promise);
+bind(PromiseSymbol).toConstantValue(() => promise);
```

The newly bound function needs to be handled appropriately at the injection side.

For 2., `@postConstruct` methods can be refactored into a sync and an async method:

```diff
-@postConstruct()
-protected async init(): Promise<void> {
-  await longRunningOperation();
-}
+@postConstruct()
+protected init(): void {
+  this.doInit();
+}
+
+protected async doInit(): Promise<void> {
+  await longRunningOperation();
+}
```

Note that this release includes a few breaking changes that also perform this refactoring on our own classes.
If you've been overriding some of these `init()` methods, it might make sense to override `doInit()` instead.

### v1.37.0

#### Disabled node integration and added context isolation flag in Electron renderer

This also means that `electron-remote` can no longer be used in components in `electron-frontend` or `electron-common`. In order to use electron-related functionality from the browser, you need to expose an API via a preload script (see <https://www.electronjs.org/docs/latest/tutorial/context-isolation>). To achieve this from a Theia extension, you need to follow these steps:

1. Define the API interface and declare an API variable on the global `window` variable. See `packages/filesystem/electron-common/electron-api.ts` for an example
2. Write a preload script module that implements the API on the renderer ("browser") side and exposes the API via `exposeInMainWorld`. You'll need to expose the API in an exported function called `preload()`. See `packages/filesystem/electron-browser/preload.ts` for an example.
3. Declare a `theiaExtensions` entry pointing to the preload script like so:

```
"theiaExtensions": [
    {
      "preload": "lib/electron-browser/preload",
```

See `/packages/filesystem/package.json` for an example

4. Implement the API on the electron-main side by contributing a `ElectronMainApplicationContribution`. See `packages/filesystem/electron-main/electron-api-main.ts` for an example. If you don't have a module contributing to the electron-main application, you may have to declare it in your package.json.

```
"theiaExtensions": [
  {
    "preload": "lib/electron-browser/preload",
    "electronMain": "lib/electron-main/electron-main-module"
  }
```

If you are using NodeJS API in your electron browser-side code you will also have to move the code outside of the renderer process, for example
by setting up an API like described above, or, for example, by using a back-end service.

### v1.35.0

#### Drop support for `Node 14`

The framework no longer supports `Node 14` in order to better support plugins targeting the default supported VS Code API of `1.68.1`.
It is always possible to build using the `yarn --ignore-engines` workaround, but we advise against it.

### v1.32.0

#### Removal of `CircularDependencyPlugin`

We no longer enforce usage of the `CircularDependencyPlugin` in the generated webpack configuration. This plugin previously informed users of any non-fatal circular dependencies in their JavaScript imports.
Note that Theia adopters can enable the plugin again by manually adding `circular-dependency-plugin` as a dev dependency and adding the following snippet to their `webpack.config.js` file.

```js
config[0].module.plugins.push(new CircularDependencyPlugin({
    exclude: /(node_modules)[\\\\|\/]./,
    failOnError: false
}));
```

### v1.30.0

#### lerna 5.5.4

The `lerna` dev-dependency was upgraded one major versions, to v5.5.4. This removes a few high and severe known vulnerabilities from our development environment. See the [PR](https://github.com/eclipse-theia/theia/pull/11738) for more details.

The upgrade was smooth in this repo, but it's possible that Theia developers/extenders, that are potentially using `lerna` differently, might need to do some adaptations.

### v1.29.0

#### React 18 update

The `react` and `react-dom` dependencies were upgraded to version 18. Some relevant changes include:

- `ReactDOM.render` is now deprecated and is replaced by `createRoot` from `react-dom/client`
- the new API no longer supports render callbacks
- updates in promises, setTimeout, event handlers are automatically batched
- the dependency `react-virtualized` has been removed in favor of `react-virtuoso`

### v1.24.0

#### node-gyp 8.4.1

The `electron-rebuild` dependency was upgraded which in turn upgraded `node-gyp` to `v8.4.1`.
This version of `node-gyp` does not support **Python2** (which is EOL) so **Python3** is necessary during the build.

#### From WebSocket to Socket.io

This is a very important change to how Theia sends and receives messages with its backend.

This new Socket.io protocol will try to establish a WebSocket connection whenever possible, but it may also
setup HTTP polling. It may even try to connect through HTTP before attempting WebSocket.

Make sure your network configurations support both WebSockets and/or HTTP polling.

### Monaco 1.65.2

This version updates the Monaco code used in Theia to the state of VSCode 1.65.2, and it changes the way that code is consumed from ASM modules loaded and put on the
`window.monaco` object to ESM modules built into the bundle using Webpack.

#### ASM to ESM

Two kinds of changes may be required to consume Monaco using ESM modules.

- If your application uses its own Webpack config rather than that generated by the @theia/dev-packages, you
will need to update that config to remove the `CopyWebpackPlugin` formerly used to place Monaco
code in the build folder and to build a separate entrypoint for the `editor.worker`. See [the changes here](https://github.com/eclipse-theia/theia/pull/10736/files#diff-b4677f3ff57d8b952eeefc10493ed3600d2737f9b5c9b0630b172472acb9c3a2)
- If your application uses its own frontend generator, you should modify the code that generates the `index.html` to load the `script` containing the bundle into the `body` element rather than the head. See [changes here](https://github.com/eclipse-theia/theia/pull/10947/files)
- References to the `window.monaco` object should be replaced with imports from `@theia/monaco-editor-core`. In most cases, simply adding an import `import * as monaco from
'@theia/monaco-editor-core'` will suffice. More complex use cases may require imports from specific parts of Monaco. Please see
[the PR](https://github.com/eclipse-theia/theia/pull/10736) for details, and please post any questions or problems there.

Using ESM modules, it is now possible to follow imports to definitions and to the Monaco source code. This should aid in tracking down issues related to changes in Monaco discussed
below.

#### Changes to Monaco

The Monaco API has changed in significant ways since the last uplift. One of the most significant is the handling of overrides to services instantiated by Monaco.

- The style of service access `monaco.StaticServices.<ServiceName>.get()` is no longer available. Instead, use `StaticServices.get(<ServiceIdentifier>)` with a service
identifier imported from `@theia/monaco-editor-core`.
- Any service overrides that should be used for all instantiations in Monaco should be passed to the first call of `StaticServices.initialize`. The first call is used to set the
services for all subsequent calls. Overrides passed to subsequent calls to `StaticServices.initialize` will be ignored. To change the overrides used, please override
[`MonacoFrontendApplicationContribution.initialize`](https://github.com/eclipse-theia/theia/pull/10736/files#diff-99d13bb12b3c33ada58d66291db38b8b9f61883822b08b228f0ebf30b457a85d).
- Services that should be used for a particular instantiation must be passed to a child of the global `IInstantiationService`. See `MonacoEditor.getInstantiationWithOverrides`
for an example.

Other changes include a number of changes of name from `mode` -> `language` and changes of interface. Please consult [the PR](https://github.com/eclipse-theia/theia/pull/10736) or
the Monaco source code included with `@theia/monaco-editor-core`.

#### Breaking changes in Theia

Please see the CHANGELOG for details of changes to Theia interfaces.

### v1.23.0

#### TypeScript 4.5.5

If you are using TypeScript <= 4.5.5 and you encounter issues when building your Theia application because your compiler fails to parse our type definitions,
then you should upgrade to TypeScript >= 4.5.5.

#### Socket.io

If you are deploying multiple Theia nodes behind a load balancer, you will have to enable sticky-sessions,
as it is now required by the new WebSocket implementation using Socket.io protocol.

For more details, see the socket.io documentation about [using multiple nodes](https://socket.io/docs/v4/using-multiple-nodes/#enabling-sticky-session).

### v1.22.0

#### Resolutions

Due to a [colors.js](https://github.com/Marak/colors.js) issue, a [resolution](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/) may be necessary for your application in order to work around the problem:

For example:

```json
"resolutions": {
    "**/colors": "<=1.4.0"
}
```

#### Electron Update

Electron got updated from 9 to 15, this might involve some modifications in your code based on the new APIs.

See Electron's [documentation](https://github.com/electron/electron/tree/15-x-y/docs).

Most notably the `electron.remote` API got deprecated and replaced with a `@electron/remote` package.

Theia makes use of that package and re-exports it as `@theia/core/electron-shared/@electron/remote`.

See `@theia/core` re-exports [documentation](../packages/core/README.md#re-exports).

Lastly, Electron must now be defined in your application's `package.json` under `devDependencies`.

`theia build` will automatically add the entry and prompt you to re-install your dependencies when out of sync.

### v1.21.0

#### Frontend Source Maps

The frontend's source map naming changed. If you had something like the following in your debug configurations:

```json
      "sourceMapPathOverrides": {
        "webpack://@theia/example-electron/*": "${workspaceFolder}/examples/electron/*"
      }
```

You can delete this whole block and replace it by the following:

```json
      "webRoot": "${workspaceFolder}/examples/electron"
```

### v1.17.0

#### ES2017

- Theia was updated to ES2017
  - es5 VS Code extensions and Theia plugins are still supported
  - If you require an es5 codebase you should be able to transpile back to es5 using webpack
  - The following code transpiles back to an es2015 codebase:

    ```
    config.module.rules.push({
        test: /\.js$/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: [['@babel/preset-env', { targets: { chrome: '58', ie: '11' } }]],
            }
        }
    });
    ```

  - Replace the targets with the ones that are needed for your use case
  - Make sure to use `inversify@5.1.1`. Theia requires `inversify@^5.0.1` which means that `5.1.1` is compatible,
    but your lockfile might reference an older version.

### v1.16.0

[Release](https://github.com/eclipse-theia/theia/releases/tag/v1.16.0)

- N/A.

### v1.15.0

[Release](https://github.com/eclipse-theia/theia/releases/tag/v1.15.0)

#### Keytar

- [`keytar`](https://github.com/atom/node-keytar) was added as a dependency for the secrets API. It may require `libsecret` in your particular distribution to be functional:
  - Debian/Ubuntu: `sudo apt-get install libsecret-1-dev`
  - Red Hat-based: `sudo yum install libsecret-devel`
  - Arch Linux: `sudo pacman -S libsecret`
  - Alpine: `apk add libsecret-dev`
- It is possible that a `yarn resolution` is necessary for `keytar` to work on older distributions (the fix was added in `1.16.0` by downgrading the dependency version):

  ```json
  "resolutions": {
    "**/keytar": "7.6.0",
  }
  ```

- `keytar` uses [`prebuild-install`](https://github.com/prebuild/prebuild-install) to download prebuilt binaries. If you are experiencing issues where some shared libraries are missing from the system it was originally built upon, you can tell `prebuild-install` to build the native extension locally by setting the environment variable before performing `yarn`:

  ```sh
  # either:
  export npm_config_build_from_source=true
  yarn
  # or:
  npm_config_build_from_source=true yarn
  ```

#### Webpack

- The version of webpack was upgraded from 4 to 5 and may require additional shims to work properly given an application's particular setup.
- The `webpack` dependency may need to be updated if there are errors when performing a `production` build of the application due to a bogus `webpack-sources` dependency. The valid `webpack` version includes `^5.36.2 <5.47.0`. If necessary, you can use a `yarn resolution` to fix the issue:

  ```json
  "resolutions": {
    "**/webpack": "5.46.0",
  }
  ```
