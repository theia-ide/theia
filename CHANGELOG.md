# Changelog

## History

- [Previous Changelogs](https://github.com/eclipse-theia/theia/tree/master/doc/changelogs/)

Poking Github

## 1.56.0 - 11/28/2024

- [ai] added support for users to specify custom request settings, model, and optionally provider-specific [#14535](https://github.com/eclipse-theia/theia/pull/14535)
- [ai] allowed specifying max lines used for AI code completion context [#14539](https://github.com/eclipse-theia/theia/pull/14539)
- [ai] added hovers for agents and variables [#14498](https://github.com/eclipse-theia/theia/pull/14498)
- [ai] allowed comments in prompt templates [#14470](https://github.com/eclipse-theia/theia/pull/14470)
- [ai] added local models to non-streaming accept list [#14420](https://github.com/eclipse-theia/theia/pull/14420)
- [ai] allowed canceling llama-file requests [#14515](https://github.com/eclipse-theia/theia/pull/14515)
- [ai] showed arguments in tool call response renderer [#14424](https://github.com/eclipse-theia/theia/pull/14424)
- [ai] supported prompt variants [#14487](https://github.com/eclipse-theia/theia/pull/14487)
- [ai] turned automatic inline completion off by default [#14513](https://github.com/eclipse-theia/theia/pull/14513)
- [ai] fixed request settings and stop words in HF provider [#14504](https://github.com/eclipse-theia/theia/pull/14504)
- [ai] added preference to ignore files in workspace functions [#14449](https://github.com/eclipse-theia/theia/pull/14449)
- [ai] fixed prompt template contribution category and template [#14497](https://github.com/eclipse-theia/theia/pull/14497)
- [ai] chore: avoided conflicting keybinding for opening chat window [#14495](https://github.com/eclipse-theia/theia/pull/14495)
- [ai] supported agents asking for input and continuing [#14486](https://github.com/eclipse-theia/theia/pull/14486) - Contributed on behalf of STMicroelectronics
- [ai] showed progress while calculating AI code completion [#14537](https://github.com/eclipse-theia/theia/pull/14537)
- [ai] fixed AI history view crashing on first use [#14443](https://github.com/eclipse-theia/theia/pull/14443)
- [ai] fixed: added React keys in chat views [#14444](https://github.com/eclipse-theia/theia/pull/14444)
- [ai] sorted models in LLM selection dialogue in AI Configuration View [#14442](https://github.com/eclipse-theia/theia/pull/14442)
- [ai] added support for Hugging Face [#14412](https://github.com/eclipse-theia/theia/pull/14412)
- [ai] added manual AI code completion [#14393](https://github.com/eclipse-theia/theia/pull/14393)
- [ai] improved workspace agent functions and prompt [#14426](https://github.com/eclipse-theia/theia/pull/14426)
- [ai] improved agent history recording [#14378](https://github.com/eclipse-theia/theia/pull/14378)
- [ai] allowed reopening AI history widget [#14422](https://github.com/eclipse-theia/theia/pull/14422)
- [ai] avoided prompt template directory error [#14421](https://github.com/eclipse-theia/theia/pull/14421)
- [ai] adjusted chat input height dynamically [#14432](https://github.com/eclipse-theia/theia/pull/14432)
- [ai] fixed: allowed all three brackets for variables [#14465](https://github.com/eclipse-theia/theia/pull/14465)
- [ai] allowed adding variants via prompt template files [#14509](https://github.com/eclipse-theia/theia/pull/14509)
- [application-package] bumped API version to 1.95.3 [#14541](https://github.com/eclipse-theia/theia/pull/14541) - Contributed on behalf of STMicroelectronics
- [browser-only] removed browserfs dependency (replaced by OPFS) [#14263](https://github.com/eclipse-theia/theia/pull/14263)
- [core] updated Inversify to latest [#14435](https://github.com/eclipse-theia/theia/pull/14435)
- [core] updated parcel watcher to 2.5.0 [#14545](https://github.com/eclipse-theia/theia/pull/14545)
- [core] fixed calculation of SelectComponent dropdown bottom [#14381](https://github.com/eclipse-theia/theia/pull/14381)
- [core] fixed electron win background color [#14491](https://github.com/eclipse-theia/theia/pull/14491) - Contributed on behalf of STMicroelectronics
- [core] fixed: kept closable state through pin/unpin [#14377](https://github.com/eclipse-theia/theia/pull/14377) - Contributed on behalf of STMicroelectronics
- [core] fixed alignment of viewWelcome to VS Code [#14391](https://github.com/eclipse-theia/theia/pull/14391)
- [core] fixed uppermost context menu item sometimes not clickable in Electron [#14401](https://github.com/eclipse-theia/theia/pull/14401)
- [debug] disabled editing of read-only variables [#14440](https://github.com/eclipse-theia/theia/pull/14440)
- [dev-container] fixed container stopping on disconnect and application close [#14542](https://github.com/eclipse-theia/theia/pull/14542)
- [electron] pinned Electron version to 30.1.2 [#14407](https://github.com/eclipse-theia/theia/pull/14407) - Contributed on behalf of STMicroelectronics
- [filesystem] added support for files.insertFinalNewline during formatOnSave [#13751](https://github.com/eclipse-theia/theia/pull/13751) - Contributed on behalf of STMicroelectronics
- [plugin] added min height to cell outputs [#14488](https://github.com/eclipse-theia/theia/pull/14488)
- [plugin] fixed selection and improved active text editor behavior [#14480](https://github.com/eclipse-theia/theia/pull/14480)
- [plugin] supported MappedEditProviders proposed API evolution [#14453](https://github.com/eclipse-theia/theia/pull/14453) - Contributed on behalf of STMicroelectronics
- [plugin] added support for ThemeColor property id [#14437](https://github.com/eclipse-theia/theia/pull/14437) - Contributed on behalf of STMicroelectronics
- [plugin] added support for property ThemeColor ID [#14437](https://github.com/eclipse-theia/theia/pull/14437) - Contributed on behalf of STMicroelectronics
- [plugin-ext] fixed overlapping outputs when creating a cell at the top [#14417](https://github.com/eclipse-theia/theia/pull/14417)
- [plugin-ext] fixed active notebook editor staying active as long as the editor is active [#14419](https://github.com/eclipse-theia/theia/pull/14419)
- [metrics] fixed MeasurementNotificationService binding [#14439](https://github.com/eclipse-theia/theia/pull/14439)

<a name="breaking_changes_1.56.0">[Breaking Changes:](#breaking_changes_1.56.0)</a>

- [core] fixed disposing of dialogs on close - [#14456](https://github.com/eclipse-theia/theia/pull/14456) - Contributed on behalf of STMicroelectronics

## 1.55.0 - 10/31/2024

- [ai] added logic to allow to order and clear AI History view [#14233](https://github.com/eclipse-theia/theia/pull/14233)
- [ai] added preference to exclude files from code completion [#14315](https://github.com/eclipse-theia/theia/pull/14315)
- [ai] added support for custom agents [#14301](https://github.com/eclipse-theia/theia/pull/14301)
- [ai] added support for custom keys for custom Open AI models [#14299](https://github.com/eclipse-theia/theia/pull/14299)
- [ai] added support for llamafile as ai model provider [#14281](https://github.com/eclipse-theia/theia/pull/14281)
- [ai] added support for o1-preview [#14356](https://github.com/eclipse-theia/theia/pull/14356)
- [ai] added support to make response parsing extensible [#14196](https://github.com/eclipse-theia/theia/pull/14196) - Contributed on behalf of STMicroelectronics
- [ai] added support to query history by session [#14368](https://github.com/eclipse-theia/theia/pull/14368) - Contributed on behalf of STMicroelectronics
- [ai] fixed markdown request renderer [#14211](https://github.com/eclipse-theia/theia/pull/14211)
- [ai] improved custom OpenAI and llama-file preference description [#14376](https://github.com/eclipse-theia/theia/pull/14376)
- [ai] improved styling of the chat widget [#14278](https://github.com/eclipse-theia/theia/pull/14278) - Contributed on behalf of STMicroelectronics
- [ai] updated list of OpenAI models supporting structured output [#14247](https://github.com/eclipse-theia/theia/pull/14247)
- [ai] updated logic so that orchestrator logs its own requests [#14255](https://github.com/eclipse-theia/theia/pull/14255)
- [ai] updated logic to allow customizing the LLM request settings [#14284](https://github.com/eclipse-theia/theia/pull/14284) - Contributed on behalf of STMicroelectronics
- [ai] updated logic to avoid line wrap in code response parts [#14363](https://github.com/eclipse-theia/theia/pull/14363)
- [ai] updated terminal agent to record its requests [#14246](https://github.com/eclipse-theia/theia/pull/14246)
- [application-package] added an application prop to set the configuration area [#14319](https://github.com/eclipse-theia/theia/pull/14319) - Contributed on behalf of STMicroelectronics
- [application-package] bumped API version to 1.94.2 [#14371](https://github.com/eclipse-theia/theia/pull/14371) - Contributed on behalf of STMicroelectronics
- [cli] upgraded puppeteer to 23.1.0 [#14261](https://github.com/eclipse-theia/theia/pull/14261) - Contributed on behalf of STMicroelectronics
- [core] fixed circular imports when importing ReactDialog [#14352](https://github.com/eclipse-theia/theia/pull/14352)
- [core] fixed css calc expression to have space around operator [#14241](https://github.com/eclipse-theia/theia/pull/14241) - Contributed on behalf of STMicroelectronics
- [core] fixed duplicate text editor entry [#14238](https://github.com/eclipse-theia/theia/pull/14238)
- [core] improved widget specific status bar handling [#14239](https://github.com/eclipse-theia/theia/pull/14239)
- [core] replaced nsfw with @parcel/watcher [#14194](https://github.com/eclipse-theia/theia/pull/14194)
- [core] updated logic to set menu bar less often at startup [#14295](https://github.com/eclipse-theia/theia/pull/14295) - Contributed on behalf of STMicroelectronics
- [core] updated logic to start menu handler ids at one, not zero [#14282](https://github.com/eclipse-theia/theia/pull/14282) - Contributed on behalf of STMicroelectronics
- [core] upgraded express to 4.21.0 [#14283](https://github.com/eclipse-theia/theia/pull/14283) - Contributed on behalf of STMicroelectronics
- [filesystem] added logic to New File dialog to accept Enter for default [#14146](https://github.com/eclipse-theia/theia/pull/14146)
- [filesystem] updated logic to show error message when uploading fails [#14349](https://github.com/eclipse-theia/theia/pull/14349)
- [filesystem] updated rimraf to 5 [#14273](https://github.com/eclipse-theia/theia/pull/14273)
- [notebook] added Cell Tag Support for Notebooks [#14271](https://github.com/eclipse-theia/theia/pull/14271)
- [notebook] added notebook split cell command [#14212](https://github.com/eclipse-theia/theia/pull/14212)
- [notebook] fixed notebook editor focusing [#14229](https://github.com/eclipse-theia/theia/pull/14229)
- [notebook] fixed notebook editor staying current even when selecting sidebar or bottom panel [#14262](https://github.com/eclipse-theia/theia/pull/14262)
- [notebook] optimized notebook webview output [#14234](https://github.com/eclipse-theia/theia/pull/14234)
- [notebook] updated logic to blur cell on shift+enter, only update cell height when changed [#14277](https://github.com/eclipse-theia/theia/pull/14277)
- [notebook] updated logic to ensure notebook document event registration [#14242](https://github.com/eclipse-theia/theia/pull/14242)
- [notebook] updated logic to not disable cell edit mode when escaping code completion in notebooks [#14328](https://github.com/eclipse-theia/theia/pull/14328)
- [playwright] added Playwright API for Notebooks [#14098](https://github.com/eclipse-theia/theia/pull/14098)
- [plugin] added support for proposed signature for workspace.createFileSystemWatcher [#14303](https://github.com/eclipse-theia/theia/pull/14303) - Contributed on behalf of STMicroelectronics
- [plugin] fixed the onDidChangeActiveNotebookEditorEmitter to fire correctly [#14321](https://github.com/eclipse-theia/theia/pull/14321)
- [plugin] supported MappedEditProviders proposed API evolution [#14276](https://github.com/eclipse-theia/theia/pull/14276) - Contributed on behalf of STMicroelectronics
- [plugin] updated logic to accept a string argument in env.openExternal API [#14350](https://github.com/eclipse-theia/theia/pull/14350) - Contributed on behalf of STMicroelectronics
- [plugin] updated logic to properly dispose tab/title-based resources on tab close [#14359](https://github.com/eclipse-theia/theia/pull/14359)
- [plugin] wrapped api objects returned to clients in a proxy [#14213](https://github.com/eclipse-theia/theia/pull/14213) - Contributed on behalf of STMicroelectronics
- [preferences] improved preference renderer linking [#14311](https://github.com/eclipse-theia/theia/pull/14311)
- [workspace] optimized showing recent workspaces [#14260](https://github.com/eclipse-theia/theia/pull/14260)

## 1.54.0 - 09/26/2024

- [ai] add Theia AI LLM Support [Experimental] [#14048](https://github.com/eclipse-theia/theia/pull/14048)
- [ai] adapted default LLM for Theia AI to gpt-4o [#14165](https://github.com/eclipse-theia/theia/pull/14165)
- [ai] add enable state of agent to preferences [#14206](https://github.com/eclipse-theia/theia/pull/14206)
- [ai] chore: polished AI code completion [#14192](https://github.com/eclipse-theia/theia/pull/14192)
- [ai] consistently named agents and added tags [#14182](https://github.com/eclipse-theia/theia/pull/14182)
- [ai] feat: added toolbar actions for chat nodes [#14181](https://github.com/eclipse-theia/theia/pull/14181) - Contributed on behalf of STMicroelectronics
- [ai] feat: show variables and functions on AI agent configuration [#14177](https://github.com/eclipse-theia/theia/pull/14177)
- [ai] feat: supported models served via OpenAI API [#14172](https://github.com/eclipse-theia/theia/pull/14172)
- [ai] fixed ai-settings retrieval [#14221](https://github.com/eclipse-theia/theia/pull/14221)
- [ai] fixed enablement of AI support [#14166](https://github.com/eclipse-theia/theia/pull/14166)
- [ai] improved prompt of workspace agent [#14159](https://github.com/eclipse-theia/theia/pull/14159)
- [ai] refined AI settings [#14202](https://github.com/eclipse-theia/theia/pull/14202)
- [ai] refined experimental message for AI features [#14187](https://github.com/eclipse-theia/theia/pull/14187)
- [ai] removed type duplication for kind property [#14207](https://github.com/eclipse-theia/theia/pull/14207)
- [ai] consistent prompt ids [#14162](https://github.com/eclipse-theia/theia/pull/14162)
- [ai] fix: disabled an agent also disabled its UIContribution [#14184](https://github.com/eclipse-theia/theia/pull/14184)
- [application-package] bumped API version to 1.93.1 [#14224](https://github.com/eclipse-theia/theia/pull/14224) - Contributed on behalf of STMicroelectronics
- [core] fixed selection of contributed menu action argument adapters [#14132](https://github.com/eclipse-theia/theia/pull/14132) - Contributed on behalf of STMicroelectronics
- [core] supported proxy env variable for schema catalog download [#14130](https://github.com/eclipse-theia/theia/pull/14130)
- [core] supported workbench.editorAssociations preference [#14139](https://github.com/eclipse-theia/theia/pull/14139)
- [editor] aligned active text and notebook editor more towards vscode [#14190](https://github.com/eclipse-theia/theia/pull/14190)
- [filesystem] fixed FileResource sometimes sending contents change event during writing [#14043](https://github.com/eclipse-theia/theia/pull/14043) - Contributed on behalf of Toro Cloud
- [notebook] focused notebook cell container correctly [#14175](https://github.com/eclipse-theia/theia/pull/14175)
- [notebook] fixed notebook context selection [#14179](https://github.com/eclipse-theia/theia/pull/14179)
- [notebook] made the cell editor border grey when not focused [#14195](https://github.com/eclipse-theia/theia/pull/14195)
- [plugin] removed stub tag from TerminalOptions#color [#14171](https://github.com/eclipse-theia/theia/pull/14171)
- [plugin] moved stubbed API TerminalShellIntegration into main API [#14168](https://github.com/eclipse-theia/theia/pull/14168) - Contributed on behalf of STMicroelectronics
- [plugin] supported evolution on proposed API extensionAny [#14199](https://github.com/eclipse-theia/theia/pull/14199) - Contributed on behalf of STMicroelectronics
- [plugin] updated TreeView reveal options to be readonly [#14198](https://github.com/eclipse-theia/theia/pull/14198) - Contributed on behalf of STMicroelectronics
- [plugin-ext] properly supported executeDocumentSymbolProvider command [#14173](https://github.com/eclipse-theia/theia/pull/14173)
- [plugin-ext] fixed leak in tabs-main.ts [#14186](https://github.com/eclipse-theia/theia/pull/14186)
- [preferences] expanded plugin preferences on scroll correctly [#14170](https://github.com/eclipse-theia/theia/pull/14170)
- [test] supported TestMessage stack traces [#14154](https://github.com/eclipse-theia/theia/pull/14154) - Contributed on behalf of STMicroelectronics
- [workspace] handled only the user workspace security settings [#14147](https://github.com/eclipse-theia/theia/pull/14147)

<a name="breaking_changes_1.54.0">[Breaking Changes:](#breaking_changes_1.54.0)</a>

- [ai] added toolbar actions on chat nodes [#14181](https://github.com/eclipse-theia/theia/pull/14181) - Contributed on behalf of STMicroelectronics
- [core] updated AuthenticationService to handle multiple accounts per provider [#14149](https://github.com/eclipse-theia/theia/pull/14149) - Contributed on behalf of STMicroelectronics

## 1.53.0 - 08/29/2024

- [application-package] bumpped API version to 1.92.2 [#14076](https://github.com/eclipse-theia/theia/pull/14076) - Contributed on behalf of STMicroelectronics
- [collaboration] added support for collaboration feature [#13309](https://github.com/eclipse-theia/theia/pull/13309)
- [core] added `testing/profiles/context` menu contribution [#14028](https://github.com/eclipse-theia/theia/pull/14028) - Contributed on behalf of STMicroelectronics
- [core] added support for reverting a composite saveable [#14079](https://github.com/eclipse-theia/theia/pull/14079)
- [core] aligned available locales to VS Code [#14039](https://github.com/eclipse-theia/theia/pull/14039)
- [core] dropped support for Node 16.x [#14027](https://github.com/eclipse-theia/theia/pull/14027) - Contributed on behalf of STMicroelectronics
- [core] refactored undo-redo action for editors [#13963](https://github.com/eclipse-theia/theia/pull/13963)
- [core] updated logic to correctly revert saveable on widget close [#14062](https://github.com/eclipse-theia/theia/pull/14062)
- [core] updated logic to download json schema catalog at build-time [#14065](https://github.com/eclipse-theia/theia/pull/14065) - Contributed on behalf of STMicroelectronics
- [electron] updated electron to version 30.1.2 [#14041](https://github.com/eclipse-theia/theia/pull/14041) - Contributed on behalf of STMicroelectronics
- [monaco] updated logic to rely on `IConfigurationService` change event to update model options [#13994](https://github.com/eclipse-theia/theia/pull/13994) - Contributed on behalf of STMicroelectronics
- [notebook] added aliases for `list.focusUp` and `list.focusDown` for notebooks [#14042](https://github.com/eclipse-theia/theia/pull/14042)
- [notebook] added logic to support Alt+Enter in notebooks - run the current cell and insert a new below [#14022](https://github.com/eclipse-theia/theia/pull/14022)
- [notebook] added notebook selected cell status bar item and center selected cell command [#14046](https://github.com/eclipse-theia/theia/pull/14046)
- [notebook] added support to find widget in notebooks [#13982](https://github.com/eclipse-theia/theia/pull/13982)
- [notebook] enhanced notebook cell divider [#14081](https://github.com/eclipse-theia/theia/pull/14081)
- [notebook] fixed notebook output scrolling and text rendering [#14016](https://github.com/eclipse-theia/theia/pull/14016)
- [notebook] fixed vscode api notebook selection property [#14087](https://github.com/eclipse-theia/theia/pull/14087)
- [notebook] updated logic to make sure notebook model created when calling `openNotebookDocument` [#14029](https://github.com/eclipse-theia/theia/pull/14029)
- [notebook] updated logic to use correct cell type for selected language [#13983](https://github.com/eclipse-theia/theia/pull/13983)
- [playwright] fixed flaky playwright Theia Main Menu test [#13951](https://github.com/eclipse-theia/theia/pull/13951) - Contributed on behalf of STMicroelectronics
- [plugin] added `executeFoldingRangeProvider`, `executeCodeActionProvider`, and `executeWorkspaceSymbolProvider` command implementations [#14093](https://github.com/eclipse-theia/theia/pull/14093)
- [plugin] added support for `--headless-hosted-plugin-inspect` cmd argument [#13918](https://github.com/eclipse-theia/theia/pull/13918)
- [plugin] fixed issue when creating new untitled notebook doesn't work [#14031](https://github.com/eclipse-theia/theia/pull/14031)
- [plugin] implemented previously stubbed API `window.registerUriHandler()` [#13306](https://github.com/eclipse-theia/theia/pull/13306) - Contributed on behalf of STMicroelectronics
- [plugin] stubbed Terminal Shell Integration VS Code API [#14058](https://github.com/eclipse-theia/theia/pull/14058)
- [plugin] updated logic to allow opening changes for files associated with custom editors [#13916](https://github.com/eclipse-theia/theia/pull/13916)
- [plugin] upated code to not use `ChannelMultiplexer` in `RPCProtocol` [#13980](https://github.com/eclipse-theia/theia/pull/13980) - Contributed on behalf of STMicroelectronics
- [preferences] fixed preference tree for plugins [#14036](https://github.com/eclipse-theia/theia/pull/14036)
- [vsx-registry] fixed `429` errors on OVSX requests [#14030](https://github.com/eclipse-theia/theia/pull/14030)

<a name="breaking_changes_1.53.0">[Breaking Changes:](#breaking_changes_1.53.0)</a>

- [dependencies] Updated electron to version 30.1.2 - [#14041](https://github.com/eclipse-theia/theia/pull/14041) - Contributed on behalf of STMicroelectronics
- [dependencies] increased minimum node version to 18. [#14027](https://github.com/eclipse-theia/theia/pull/14027) - Contributed on behalf of STMicroelectronics

## 1.52.0 - 07/25/2024

- [application-package] bumped the default supported API from `1.90.2` to `1.91.1` [#13955](https://github.com/eclipse-theia/theia/pull/13955) - Contributed on behalf of STMicroelectronics
- [cli] added logging to download:plugins script [#13905](https://github.com/eclipse-theia/theia/pull/13905) - Contributed on behalf of STMicroelectronics
- [core] bug fix: "core.saveAll" command only saved dirty widgets [#13942](https://github.com/eclipse-theia/theia/pull/13942)
- [core] downgrade jsdom to 22.1.0 [#13944](https://github.com/eclipse-theia/theia/pull/13944)
- [core] fixed reload for remote feature and added option to the electron window to change URL on reload [#13891](https://github.com/eclipse-theia/theia/pull/13891)
- [core] improved implementation around widget management [#13818](https://github.com/eclipse-theia/theia/pull/13818)
- [core] introduced `FRONTEND_CONNECTION_TIMEOUT` environment variable to override application connection settings [#13936](https://github.com/eclipse-theia/theia/pull/13936) - Contributed on behalf of STMicroelectronics
- [core] made sure UI loaded when minimized [#13887](https://github.com/eclipse-theia/theia/pull/13887) - Contributed on behalf of STMicroelectronics
- [core] prevented the rendering of the tab bar tooltip if no caption was provided [#13945](https://github.com/eclipse-theia/theia/pull/13945)
- [core] tab selected should be adjacent when closing the last one [#13912](https://github.com/eclipse-theia/theia/pull/13912) - Contributed on behalf of STMicroelectronics
- [core] upgraded ws to 8.18.0 [#13903](https://github.com/eclipse-theia/theia/pull/13903)
- [debug] added DebugSessionOptions.testRun [#13939](https://github.com/eclipse-theia/theia/pull/13939) - Contributed on behalf of STMicroelectronics
- [debug] implemented activeStackItem and related change event in debug namespace [#13900](https://github.com/eclipse-theia/theia/pull/13900) - Contributed on behalf of STMicroelectronics
- [filesystem] fixed FileResource not adding event listener to the disposable collection [#13880](https://github.com/eclipse-theia/theia/pull/13880)
- [notebook] changed cell type when selecting markdown as a code cell's language [#13933](https://github.com/eclipse-theia/theia/pull/13933)
- [notebook] made Notebook preferences registration substitutable [#13926](https://github.com/eclipse-theia/theia/pull/13926)
- [ovsx-client] fixed plugin version comparison [#13907](https://github.com/eclipse-theia/theia/pull/13907)
- [plugin-ext] codicon color and URI support to TerminalOptions [#13413](https://github.com/eclipse-theia/theia/pull/13413)
- [plugin-ext] used relative paths for ctx.importScripts() [#13854](https://github.com/eclipse-theia/theia/pull/13854)
- [preferences] refactored preference tree layouting [#13819](https://github.com/eclipse-theia/theia/pull/13819)
- [terminal] added support for 256 truecolor [#13853](https://github.com/eclipse-theia/theia/pull/13853)
- [workflows] updated Mac OS version to 14 in CI [#13908](https://github.com/eclipse-theia/theia/pull/13908)

## 1.51.0 - 06/27/2024

- [application-manager] updated logic to load correct messaging module in browser-only mode [#13827](https://github.com/eclipse-theia/theia/pull/13827)
- [application-package] bumped the default supported API from `1.89.1` to `1.90.2` [#13849](https://github.com/eclipse-theia/theia/pull/13849) - Contributed on behalf of STMicroelectronics
- [core] added support for dynamic menu contributions [#13720](https://github.com/eclipse-theia/theia/pull/13720)
- [core] fixed account menu order, icon and badge [#13771](https://github.com/eclipse-theia/theia/pull/13771)
- [core] fixed overflow behavior of sidebars [#13483](https://github.com/eclipse-theia/theia/pull/13483) - Contributed on behalf of STMicroelectronics
- [core] improved shown keybindings in context menu [#13830](https://github.com/eclipse-theia/theia/pull/13830)
- [core] introduced optional serialize method in Saveable [#13833](https://github.com/eclipse-theia/theia/pull/13833)
- [core] updated doc comments on service-connection-provider.ts [#13805](https://github.com/eclipse-theia/theia/pull/13805) - Contributed on behalf of STMicroelectronics
- [core] updated logic of links to block local navigation and open new windows externally in electron [#13782](https://github.com/eclipse-theia/theia/pull/13782) - Contributed on behalf of STMicroelectronics
- [core] updated logic to propagate "Save As" operation to plugin host [#13689](https://github.com/eclipse-theia/theia/pull/13689)
- [core] updated logic to use 'openWithSystemApp' to open uri when 'env.openExternal' requested [#13676](https://github.com/eclipse-theia/theia/pull/13676)
- [electron] switched single instance on per default. [#13831](https://github.com/eclipse-theia/theia/pull/13831) - Contributed on behalf of STMicroelectronics
- [filesystem] improved Upload Command [#13775](https://github.com/eclipse-theia/theia/pull/13775)
- [markers] fixed data race in problem view tree [#13841](https://github.com/eclipse-theia/theia/pull/13841)
- [messages] updated logic to always resolve existing before showing new notification [#13668](https://github.com/eclipse-theia/theia/pull/13668)
- [monaco] fixed editors theme change and widget not attached error [#13757](https://github.com/eclipse-theia/theia/pull/13757)
- [notebook] added an indicator for loading notebooks [#13843](https://github.com/eclipse-theia/theia/pull/13843)
- [notebook] added notebook output options and tag preference search [#13773](https://github.com/eclipse-theia/theia/pull/13773)
- [notebook] disabled cell editor search widget [#13836](https://github.com/eclipse-theia/theia/pull/13836)
- [notebook] improved ability to overwrite notebook services [#13776](https://github.com/eclipse-theia/theia/pull/13776)
- [notebook] improved notebook cell drag images [#13791](https://github.com/eclipse-theia/theia/pull/13791)
- [notebook] improved support for creating new notebooks [#13696](https://github.com/eclipse-theia/theia/pull/13696)
- [notebook] updated logic to set notebook editor as active when opening in foreground [#13828](https://github.com/eclipse-theia/theia/pull/13828)
- [notebook] updated logic to stop moving to next cell when suggestion widget is visible [#13774](https://github.com/eclipse-theia/theia/pull/13774)
- [playwright] fixed type definition of TheiaAppFactory [#13799](https://github.com/eclipse-theia/theia/pull/13799) - Contributed on behalf of STMicroelectronics
- [plugin] added stub for `registerMappedEditProvider` [#13681](https://github.com/eclipse-theia/theia/pull/13681) - Contributed on behalf of STMicroelectronics
- [plugin] added support for PluginExt#extensionKind [#13763](https://github.com/eclipse-theia/theia/pull/13763)
- [plugin] added support for TestRunRequest preserveFocus API [#13839](https://github.com/eclipse-theia/theia/pull/13839) - Contributed on behalf of STMicroelectronics
- [plugin] fixed RPC proxy handler notifications and requests order [#13810](https://github.com/eclipse-theia/theia/pull/13810)
- [plugin] fixed programmatic save for custom text editors [#13684](https://github.com/eclipse-theia/theia/pull/13684)
- [plugin] fixed tab group API event order [#13812](https://github.com/eclipse-theia/theia/pull/13812)
- [plugin] stubbed Chat and Language Model API [#13778](https://github.com/eclipse-theia/theia/pull/13778)
- [plugin] stubbed activeStackItem and related change event in debug namespace [#13847](https://github.com/eclipse-theia/theia/pull/13847) - Contributed on behalf of STMicroelectronics
- [plugin] updated logic to avoid pollution of all toolbars by actions contributed by tree views in extensions [#13768](https://github.com/eclipse-theia/theia/pull/13768) - Contributed on behalf of STMicroelectronics
- [plugin] updated logic to return empty appRoot in web plugin host [#13762](https://github.com/eclipse-theia/theia/pull/13762)
- [scm] updated jsdiff and simplify diff computation [#13787](https://github.com/eclipse-theia/theia/pull/13787) - Contributed on behalf of STMicroelectronics
- [vsx-registry] updated logic to use targetPlatform when installing plugin from open-vsx [#13825](https://github.com/eclipse-theia/theia/pull/13825)

<a name="breaking_changes_1.51.0">[Breaking Changes:](#breaking_changes_1.51.0)</a>

- [electron] switched single instance on per default. [#13831](https://github.com/eclipse-theia/theia/pull/13831) - Contributed on behalf of STMicroelectronics
- [filesystem] adjusted the "Save As" mechanism to assume that `Saveable.getSnapshot()` returns a full snapshot of the editor model [#13689](https://github.com/eclipse-theia/theia/pull/13689).

## 1.50.0 - 06/03/2024

- [application-package] bumped the default supported API from `1.88.1` to `1.89.1` [#13738](https://github.com/eclipse-theia/theia/pull/13738) - contributed on behalf of STMicroelectronics
- [cli] upgrade the Theia build to use Typescript 5.4.5 [#13628](https://github.com/eclipse-theia/theia/pull/13628) - Contributed on behalf of STMicroelectronics
- [core] added logic to delegate showing help to the back end process. [#13729](https://github.com/eclipse-theia/theia/pull/13729) - Contributed on behalf of STMicroelectronics
- [core] added logic to don't reveal the focused element when updating the tree rows [#13703](https://github.com/eclipse-theia/theia/pull/13703) - Contributed on behalf of STMicroelectronics
- [core] added logic to ensure globalSelection is correctly set when opening context menu on a tree widget [#13710](https://github.com/eclipse-theia/theia/pull/13710)
- [core] added to logic to ensure usage of user-defined `THEIA_CONFIG_DIR` [#13708](https://github.com/eclipse-theia/theia/pull/13708) - Contributed on behalf of STMicroelectronics
- [core] fixed hex editor by updating `msgpckr` to 1.10.2 [#13722](https://github.com/eclipse-theia/theia/pull/13722)
- [core] improved `WebSocketConnectionProvider` deprecation message [#13713](https://github.com/eclipse-theia/theia/pull/13713) - Contributed on behalf of STMicroelectronics
- [core] refactored auto save mechanism via a central service [#13683](https://github.com/eclipse-theia/theia/pull/13683)
- [core] updated logic to make browserWindow of splashScreen transparent [#13699](https://github.com/eclipse-theia/theia/pull/13699)
- [dev-container] added support for four previously unsupported dev container properties [#13714](https://github.com/eclipse-theia/theia/pull/13714)
- [dev-container] improved logic to show dev-container label in status bar [#13744](https://github.com/eclipse-theia/theia/pull/13744)
- [electron] updated electron to ^28.2.8 [#13580](https://github.com/eclipse-theia/theia/pull/13580)
- [navigator] added logic to handle `isFileSystemResource` context key [#13664](https://github.com/eclipse-theia/theia/pull/13664)
- [navigator] added logic to not show the new "Open With..." command on folders [#13678](https://github.com/eclipse-theia/theia/pull/13678)
- [notebook] added additional css to notebook output webviews [#13666](https://github.com/eclipse-theia/theia/pull/13666)
- [notebook] added basics for notebook cell drag image renderers [#13698](https://github.com/eclipse-theia/theia/pull/13698)
- [notebook] added logic to select next notebook cell on first or last line of editor [#13656](https://github.com/eclipse-theia/theia/pull/13656)
- [notebook] added logic to select the last cell when deleting selected last cell [#13715](https://github.com/eclipse-theia/theia/pull/13715)
- [notebook] added logic to stop execution when deleting cell [#13701](https://github.com/eclipse-theia/theia/pull/13701)
- [notebook] added responsive design for the main notebook toolbar [#13663](https://github.com/eclipse-theia/theia/pull/13663)
- [notebook] aligned commands with vscode notebook commands [#13645](https://github.com/eclipse-theia/theia/pull/13645)
- [notebook] aligned notebook scroll into view behaviour with vscode [#13742](https://github.com/eclipse-theia/theia/pull/13742)
- [notebook] fixed focus loss of the notebook editor widget when bluring a cell editor [#13741](https://github.com/eclipse-theia/theia/pull/13741)
- [notebook] fixed notebook cell divider size [#13745](https://github.com/eclipse-theia/theia/pull/13745)
- [notebook] fixed storing of the notebook-outlineview state data [#13648](https://github.com/eclipse-theia/theia/pull/13648)
- [notebook] improved notebook cell model lifecycle [#13675](https://github.com/eclipse-theia/theia/pull/13675)
- [notebook] improved support for creating new notebooks [#13696](https://github.com/eclipse-theia/theia/pull/13696)
- [plugin] added stub for `registerMappedEditProvider` [#13681](https://github.com/eclipse-theia/theia/pull/13681) - Contributed on behalf of STMicroelectronics
- [plugin] added support `WindowState` active API [#13718](https://github.com/eclipse-theia/theia/pull/13718) - contributed on behalf of STMicroelectronics
- [plugin] fixed github authentication built-in for electron case [#13611](https://github.com/eclipse-theia/theia/pull/13611) - Contributed on behalof of STMicroelectronics
- [plugin] fixed incorrect URI conversions in custom-editors-main [#13653](https://github.com/eclipse-theia/theia/pull/13653)
- [plugin] fixed quick pick separators from plugins [#13740](https://github.com/eclipse-theia/theia/pull/13740)
- [plugin] improved vscode tab API [#13730](https://github.com/eclipse-theia/theia/pull/13730)
- [plugin] updated `DropMetada` and `documentPaste` proposed API for 1.89 compatibility [#13733](https://github.com/eclipse-theia/theia/pull/13733) - contributed on behalf of STMicroelectronics
- [plugin] updated nls metadata for VSCode API 1.89.0 [#13743](https://github.com/eclipse-theia/theia/pull/13743)
- [remote] added logic to support plugin copying for remote feature [#13369](https://github.com/eclipse-theia/theia/pull/13369)
- [terminal] fixed performance issues in terminal [#13735](https://github.com/eclipse-theia/theia/pull/13735) - Contributed on behalf of STMicroelectronics
- [terminal] updated logic to allow transitive binding for TerminalFrontendContribution [#13667](https://github.com/eclipse-theia/theia/pull/13667)

<a name="breaking_changes_1.50.0">[Breaking Changes:](#breaking_changes_1.50.0)</a>

- [core] Classes implementing the `Saveable` interface no longer need to implement the `autoSave` field. However, a new `onContentChanged` event has been added instead.
- [navigator] The `Open With...` command now uses a dedicated `OpenWithHandler` to populate the quick pick.
  Adopters contributing an open handler need to explicitly add the handler to the `OpenWithHandler` ([#13573](https://github.com/eclipse-theia/theia/pull/13573)).

## v1.49.0 - 04/29/2024

- [application-manager] added logic to generate Extension Info in server application to avoid empty About Dialog [#13590](https://github.com/eclipse-theia/theia/pull/13590) - contributed on behalf of STMicroelectronics
- [application-manager] fixed spawn calls for node LTS versions [#13614](https://github.com/eclipse-theia/theia/pull/13614)
- [application-package] bumped the default supported API from `1.87.2` to `1.88.1` [#13646](https://github.com/eclipse-theia/theia/pull/13646) - contributed on behalf of STMicroelectronics
- [cli] added "patches" folder to package.json "files" field [#13554](https://github.com/eclipse-theia/theia/pull/13554) - contributed on behalf of STMicroelectronics
- [core] added a new built-in handler to open files with system application [#13601](https://github.com/eclipse-theia/theia/pull/13601)
- [core] added logic to always consider the "passthrough" commmand enabled for keybindings [#13564](https://github.com/eclipse-theia/theia/pull/13564) - contributed on behalf of STMicroelectronics
- [core] added Splash Screen Support for Electron [#13505](https://github.com/eclipse-theia/theia/pull/13505) - contributed on behalf of Pragmatiqu IT GmbH
- [core] fixed window revealing when navigating with multiple windows [#13561](https://github.com/eclipse-theia/theia/pull/13561) - contributed on behalf of STMicroelectronics
- [core] improved "Open With..." command UX [#13573](https://github.com/eclipse-theia/theia/pull/13573)
- [filesystem] added logic to open editor on file upload [#13578](https://github.com/eclipse-theia/theia/pull/13578)
- [monaco] added logic to prevent duplicate Clipboard actions in editor context menu [#13626](https://github.com/eclipse-theia/theia/pull/13626)
- [monaco] fixed monaco localization [#13557](https://github.com/eclipse-theia/theia/pull/13557)
- [notebook] added additional keybings to the notebook editor [#13594](https://github.com/eclipse-theia/theia/pull/13594)
- [notebook] added logic to force notebook scrollbar update after content change [#13575](https://github.com/eclipse-theia/theia/pull/13575)
- [notebook] added logic to read execution summary [#13567](https://github.com/eclipse-theia/theia/pull/13567)
- [notebook] added logic to select notebook cell language [#13615](https://github.com/eclipse-theia/theia/pull/13615)
- [notebook] added logic to show short title for notebook toolbar commands [#13586](https://github.com/eclipse-theia/theia/pull/13586)
- [notebook] added logic to use notebook URI as context for toolbar commands [#13585](https://github.com/eclipse-theia/theia/pull/13585)
- [notebook] added shift+enter keybinding for markdown cells [#13563](https://github.com/eclipse-theia/theia/pull/13563)
- [notebook] added support for Outline-View and Breadcrumbs [#13562](https://github.com/eclipse-theia/theia/pull/13562)
- [notebook] added support for truncated notebook output commands [#13555](https://github.com/eclipse-theia/theia/pull/13555)
- [notebook] disabled clear all outputs in notebook main toolbar [#13569](https://github.com/eclipse-theia/theia/pull/13569)
- [notebook] fixed clear cell outputs command [#13640](https://github.com/eclipse-theia/theia/pull/13640)
- [notebook] fixed kernel autobind for on startup opened notebooks [#13598](https://github.com/eclipse-theia/theia/pull/13598)
- [notebook] fixed logic to set context for multiple notebooks [#13566](https://github.com/eclipse-theia/theia/pull/13566)
- [notebook] fixed notebook cell EOL splitting [#13574](https://github.com/eclipse-theia/theia/pull/13574)
- [notebook] fixed notebook model/cell disposal [#13606](https://github.com/eclipse-theia/theia/pull/13606)
- [notebook] fixed notebook widget icon on reload [#13612](https://github.com/eclipse-theia/theia/pull/13612)
- [notebook] improved notebook cell context key handling [#13572](https://github.com/eclipse-theia/theia/pull/13572)
- [notebook] improved notebook markdown cell rendering [#13577](https://github.com/eclipse-theia/theia/pull/13577)
- [plugin] added logic to hide empty plugin view containers from user [#13581](https://github.com/eclipse-theia/theia/pull/13581)
- [plugin] added logic to ignore vsix files in local-plugins dir [#13435](https://github.com/eclipse-theia/theia/pull/13435) - contributed on behalf of STMicroelectronics
- [plugin] fixed `onLanguage` activation event [#13630](https://github.com/eclipse-theia/theia/pull/13630)
- [plugin] fixed issue with webview communication for Safari [#13587](https://github.com/eclipse-theia/theia/pull/13587)
- [plugin] updated `DropMetada` and `documentPaste` proposed API for 1.88 compatibility [#13632](https://github.com/eclipse-theia/theia/pull/13632)
- [plugin] updated back-end plugin deployment logic [#13643](https://github.com/eclipse-theia/theia/pull/13643) - contributed on behalf of STMicroelectronics
- [process] fixed spawn calls for node LTS versions [#13614](https://github.com/eclipse-theia/theia/pull/13614)
- [remote] fixed remote support in packaged apps [#13584](https://github.com/eclipse-theia/theia/pull/13584)
- [scm] added support for dirty diff peek view [#13104](https://github.com/eclipse-theia/theia/pull/13104)
- [terminal] fixed spawn calls for node LTS versions [#13614](https://github.com/eclipse-theia/theia/pull/13614)
- [test] stubbed VS Code `Test Coverage` API [#13631](https://github.com/eclipse-theia/theia/pull/13631) - contributed on behalf of STMicroelectronics
- [vsx-registry] fixed logic to bind Extension search bar within view container [#13623](https://github.com/eclipse-theia/theia/pull/13623)

<a name="breaking_changes_1.49.0">[Breaking Changes:](#breaking_changes_1.49.0)</a>

- [scm] revised some of the dirty diff related types [#13104](https://github.com/eclipse-theia/theia/pull/13104)
  - replaced `DirtyDiff.added/removed/modified` with `changes`, which provides more detailed information about the changes
  - changed the semantics of `LineRange` to represent a range that spans up to but not including the `end` line (previously, it included the `end` line)
  - changed the signature of `DirtyDiffDecorator.toDeltaDecoration(LineRange | number, EditorDecorationOptions)` to `toDeltaDecoration(Change)`

## v1.48.0 - 03/28/2024

- [application-package] bumped the default supported API from `1.86.2` to `1.87.2` [#13514](https://github.com/eclipse-theia/theia/pull/13514) - contributed on behalf of STMicroelectronics
- [core] added "New File" default implementation [#13344](https://github.com/eclipse-theia/theia/pull/13344)
- [core] added logic to check for disposed before sending update message in toolbars [#13454](https://github.com/eclipse-theia/theia/pull/13454) - contributed on behalf of STMicroelectronics
- [core] fixed default translation of Close Editor command [#13412](https://github.com/eclipse-theia/theia/pull/13412)
- [core] fixed logic to allow reopening secondary windows [#13509](https://github.com/eclipse-theia/theia/pull/13509) - contributed on behalf of STMicroelectronics
- [core] fixed rending of quickpick buttons [#13342](https://github.com/eclipse-theia/theia/pull/13342) - contributed on behalf of STMicroelectronics
- [core] updated logic to remove unneeded URI conversion [#13415](https://github.com/eclipse-theia/theia/pull/13415)
- [dev-container] added first version of dev-container support [#13372](https://github.com/eclipse-theia/theia/pull/13372)
- [editor] added secondary window support for text editors [#13493](https://github.com/eclipse-theia/theia/pull/13493) - contributed on behalf of STMicroelectronics
- [git] fixed detecting changes after git init [#13487](https://github.com/eclipse-theia/theia/pull/13487)
- [metrics] allowed accessing the metrics endpoint for performance analysis in electron [#13380](https://github.com/eclipse-theia/theia/pull/13380) - contributed on behalf of STMicroelectronics
- [monaco] fixed monaco quickpick [#13451](https://github.com/eclipse-theia/theia/pull/13451) - contributed on behalf of STMicroelectronics
- [monaco] fixed rending of quickpick buttons [#13342](https://github.com/eclipse-theia/theia/pull/13342) - contributed on behalf of STMicroelectronics
- [notebook] added execute cells above/below commands [#13528](https://github.com/eclipse-theia/theia/pull/13528)
- [notebook] added execution order display to code cells [#13502](https://github.com/eclipse-theia/theia/pull/13502)
- [notebook] added keybindings to notebook editor [#13497](https://github.com/eclipse-theia/theia/pull/13497)
- [notebook] added support for custom widget types for notebook outputs [#13517](https://github.com/eclipse-theia/theia/pull/13517)
- [notebook] fixed cell execution height styling [#13515](https://github.com/eclipse-theia/theia/pull/13515)
- [notebook] fixed context keys for notebook editor context [#13448](https://github.com/eclipse-theia/theia/pull/13448)
- [notebook] fixed keybindings triggers when cell editor is focused [#13500](https://github.com/eclipse-theia/theia/pull/13500)
- [notebook] fixed notebook document metadata edit [#13528](https://github.com/eclipse-theia/theia/pull/13528)
- [notebook] fixed renaming and moving of open notebooks [#13467](https://github.com/eclipse-theia/theia/pull/13467)
- [notebook] fixed undo redo keybindings for notebook editor [#13518](https://github.com/eclipse-theia/theia/pull/13518)
- [notebook] improved focusing of the notebook cell editors [#13516](https://github.com/eclipse-theia/theia/pull/13516)
- [notebook] improved performance when opening notebooks [#13488](https://github.com/eclipse-theia/theia/pull/13488)
- [notebook] updated logic to only initialize notebook cell editor when in viewport [#13476](https://github.com/eclipse-theia/theia/pull/13476)
- [plugin] added `Interval` `TextEditorLineNumbersStyle` [#13458](https://github.com/eclipse-theia/theia/pull/13458) - contributed on behalf of STMicroelectronics
- [plugin] added terminal observer API [#13402](https://github.com/eclipse-theia/theia/pull/13402)
- [plugin] changed logic to ensure that showOpenDialog returns correct file URI [#13208](https://github.com/eclipse-theia/theia/pull/13208) - contributed on behalf of STMicroelectronics
- [plugin] fixed quickpick [#13451](https://github.com/eclipse-theia/theia/pull/13451) - contributed on behalf of STMicroelectronics
- [plugin] made `acquireVsCodeApi` function available on global objects [#13411](https://github.com/eclipse-theia/theia/pull/13411)
- [plugin] updated logic to avoid disposal of `QuickInputExt` on hide [#13485](https://github.com/eclipse-theia/theia/pull/13485) - contributed on behalf of STMicroelectronics
- [remote] added logic to support remote port forwarding [#13439](https://github.com/eclipse-theia/theia/pull/13439)
- [terminal] added logic to resolve links to workspace files in terminal [#13498](https://github.com/eclipse-theia/theia/pull/13498) - contributed on behalf of STMicroelectronics
- [terminal] added terminal observer API [#13402](https://github.com/eclipse-theia/theia/pull/13402)

<a name="breaking_changes_1.48.0">[Breaking Changes:](#breaking_changes_1.48.0)</a>

- [core] Add secondary windows support for text editors. [#13493](https://github.com/eclipse-theia/theia/pull/13493 ). The changes in require more extensive patches for our dependencies than before. For this purpose, we are using the `patch-package` library. However, this change requires adopters to add the line  `"postinstall": "theia-patch"` to the `package.json` at the root of their monorepo (where the `node_modules` folder is located). - contributed on behalf of STMicroelectronics

## v1.47.0 - 02/29/2024

- [application-package] bumped the default supported API from `1.85.1` to `1.86.2` [#13429](https://github.com/eclipse-theia/theia/pull/13429) - contributed on behalf of STMicroelectronics
- [core] added logic to show decorations in the editor tabs [#13371](https://github.com/eclipse-theia/theia/pull/13371)
- [core] added ts-docs for several key utility classes [#13324](https://github.com/eclipse-theia/theia/pull/13324)
- [core] fixed core localizations for electron [#13331](https://github.com/eclipse-theia/theia/pull/13331)
- [core] fixed memory leak in `DockPanelRenderer` and `ToolbarAwareTabBar` [#13327](https://github.com/eclipse-theia/theia/pull/13327)
- [core] fixed update of CompositeMenuNode properties [#13425](https://github.com/eclipse-theia/theia/pull/13425)
- [core] improved title rendering on menu bar change [#13317](https://github.com/eclipse-theia/theia/pull/13317)
- [core] updated code to use common uuid generator everywhere [#13255](https://github.com/eclipse-theia/theia/pull/13255)
- [core] updated logic to use `tslib` in order to reduce bundle size [#13350](https://github.com/eclipse-theia/theia/pull/13350)
- [core] upgraded msgpackr to 1.10.1 [#13365](https://github.com/eclipse-theia/theia/pull/13365) - contributed on behalf of STMicroelectronics
- [debug] fixed issue with unexpected breakpoint in python [#12543](https://github.com/eclipse-theia/theia/pull/12543)
- [documentation] extended custom plugin API documentation [#13358](https://github.com/eclipse-theia/theia/pull/13358)
- [editor] improved readonly editor behaviour [#13403](https://github.com/eclipse-theia/theia/pull/13403)
- [filesystem] fixed issue with non recursive folder deletion [#13361](https://github.com/eclipse-theia/theia/pull/13361)
- [filesystem] implemented readonly markdown message for file system providers [#13414](https://github.com/eclipse-theia/theia/pull/13414) - contributed on behalf of STMicroelectronics
- [monaco] upgraded Monaco to 1.83.1 [#13217](https://github.com/eclipse-theia/theia/pull/13217)
- [notebook] added support for proposed notebook kernel messaging and preload contribution point [#13401](https://github.com/eclipse-theia/theia/pull/13401)
- [notebook] fixed notebook renderer messaging [#13401](https://github.com/eclipse-theia/theia/pull/13401)
- [notebook] fixed race condition in notebook kernel association [#13364](https://github.com/eclipse-theia/theia/pull/13364)
- [notebook] improved logic to update notebook execution timer [#13366](https://github.com/eclipse-theia/theia/pull/13366)
- [notebook] improved notebook scrolling behaviour [#13338](https://github.com/eclipse-theia/theia/pull/13338)
- [notebook] improved styling for notebook toolbar items [#13334](https://github.com/eclipse-theia/theia/pull/13334)
- [notebook] fixed scroll behaviour of Notebooks [#13430](https://github.com/eclipse-theia/theia/pull/13430)
- [plugin] added command to install plugins from the command line [#13406](https://github.com/eclipse-theia/theia/issues/13406) - contributed on behalf of STMicroelectronics
- [plugin] added logic to support `workspace.save(URI)` and `workspace.saveAs(URI)` [#13393](https://github.com/eclipse-theia/theia/pull/13393) - contributed on behalf of STMicroelectronics
- [plugin] added support for `extension/context`, `terminal/context`, and `terminal/title/context` menu contribution points [#13226](https://github.com/eclipse-theia/theia/pull/13226)
- [plugin] fixed custom editors asset loading [#13382](https://github.com/eclipse-theia/theia/pull/13382)
- [plugin] fixed logic to use correct path for hosted plugin deployer handler [#13427](https://github.com/eclipse-theia/theia/pull/13427) - contributed on behalf of STMicroelectronics
- [plugin] fixed regressions from headless plugins introduction [#13337](https://github.com/eclipse-theia/theia/pull/13337) - contributed on behalf of STMicroelectronics
- [plugin] support TestRunProfile onDidChangeDefault introduced in VS Code 1.86.0 [#13388](https://github.com/eclipse-theia/theia/pull/13388) - contributed on behalf of STMicroelectronics
- [plugin] updated `WorkspaceEdit` metadata typing [#13395](https://github.com/eclipse-theia/theia/pull/13395) - contributed on behalf of STMicroelectronics
- [search-in-workspace] added logic to focus on next and previous search results [#12703](https://github.com/eclipse-theia/theia/pull/12703)
- [task] fixed logic to configure tasks [#13367](https://github.com/eclipse-theia/theia/pull/13367) - contributed on behalf of STMicroelectronics
- [terminal] updated to latest xterm version [#12691](https://github.com/eclipse-theia/theia/pull/12691)
- [vsx-registry] added `--install-plugin` cli command [#13421](https://github.com/eclipse-theia/theia/pull/13421) - contributed on behalf of STMicroelectronics
- [vsx-registry] added possibility to install vsix files from the explorer view [#13291](https://github.com/eclipse-theia/theia/pull/13291)

<a name="breaking_changes_1.47.0">[Breaking Changes:](#breaking_changes_1.47.0)</a>

- [monaco] Upgrade Monaco dependency to 1.83.1 [#13217](https://github.com/eclipse-theia/theia/pull/13217)- contributed on behalf of STMicroelectronics\
  There are a couple of breaking changes that come with this monaco update
  - Moved `ThemaIcon` and `ThemeColor` to the common folder
  - Minor typing adjustments in QuickPickService: in parti
  - FileUploadService: moved id field from data transfer item to the corresponding file info
  - The way we instantiate monaco services has changed completely: if you touch monaco services in your code, please read the description in the
    file comment in `monaco-init.ts`.

## v1.46.0 - 01/25/2024

- [plugin] Add prefix to contributed view container ids [#13362](https://github.com/eclipse-theia/theia/pull/13362) - contributed on behalf of STMicroelectronics
- [application-manager] updated message for missing Electron main entries [#13242](https://github.com/eclipse-theia/theia/pull/13242)
- [application-package] bumped the default supported API from `1.84.2` to `1.85.1` [#13276](https://github.com/eclipse-theia/theia/pull/13276) - contributed on behalf of STMicroelectronics
- [browser-only] added support for 'browser-only' Theia [#12853](https://github.com/eclipse-theia/theia/pull/12853)
- [builtins] update built-ins to version 1.83.1 [#13298](https://github.com/eclipse-theia/theia/pull/13298) - contributed on behalf of STMicroelectronics
- [core] added keybindings to toggle the tree checkbox [#13271](https://github.com/eclipse-theia/theia/pull/13271)
- [core] added logic to dispose cancellation event listeners [#13254](https://github.com/eclipse-theia/theia/pull/13254)
- [core] added preference 'workbench.tree.indent' to control the indentation in the tree widget [#13179](https://github.com/eclipse-theia/theia/pull/13179) - contributed on behalf of STMicroelectronics
- [core] fixed copy/paste from a menu in electron [#13220](https://github.com/eclipse-theia/theia/pull/13220) - contributed on behalf of STMicroelectronics
- [core] fixed file explorer progress bar issue [#13268](https://github.com/eclipse-theia/theia/pull/13268)
- [core] fixed issue with cyclic menu contributions [#13264](https://github.com/eclipse-theia/theia/pull/13264)
- [core] fixed leak when reconnecting to back end without reload [#13250](https://github.com/eclipse-theia/theia/pull/13250) - contributed on behalf of STMicroelectronics
- [core] fixed SelectComponent to render dropdown correctly in dialog [#13261](https://github.com/eclipse-theia/theia/pull/13261)
- [core] removed error logs from RpcProxyFactory [#13191](https://github.com/eclipse-theia/theia/pull/13191)
- [documentation] improved documentation about 'ContributionProvider' use [#13278](https://github.com/eclipse-theia/theia/pull/13278)
- [docuemtnation] improved documentation on passing objects across RPC [#13238](https://github.com/eclipse-theia/theia/pull/13238)
- [documentation] updated plugin API docs for headless plugins and Inversify DI [#13299](https://github.com/eclipse-theia/theia/pull/13299)
- [filesystem] updated logic to only read unbuffered when we read the whole file [#13197](https://github.com/eclipse-theia/theia/pull/13197)
- [headless-plugin] added support for "headless plugins" in a new plugin host [#13138](https://github.com/eclipse-theia/theia/pull/13138)
- [monaco] updated logic to add document URI as context to getDefaultFormatter [#13280](https://github.com/eclipse-theia/theia/pull/13280) - contributed on behalf of STMicroelectronics
- [notebook] fixed dynamic notebook widgets resizing [#13289](https://github.com/eclipse-theia/theia/pull/13289)
- [notebook] fixed multiple problems with the notebook output rendering [#13239](https://github.com/eclipse-theia/theia/pull/13239)
- [notebook] improved notebook error logging [#13256](https://github.com/eclipse-theia/theia/pull/13256)
- [plugin] added logic to synchronize messages sent via different proxies [#13180](https://github.com/eclipse-theia/theia/pull/13180)
- [remote] added support for specifying the port of a remote SSH connection [#13296](https://github.com/eclipse-theia/theia/pull/13296) - contributed on behalf of STMicroelectronics
- [plugin] fixed inputbox onTriggerButton() event [#13207](https://github.com/eclipse-theia/theia/pull/13207) - contributed on behalf of STMicroelectronics
- [plugin] fixed localization for the removeSession method [#13257](https://github.com/eclipse-theia/theia/pull/13257)
- [plugin] fixed `vscode.env.appRoot` path [#13285](https://github.com/eclipse-theia/theia/pull/13285)
- [plugin] stubbed multiDocumentHighlightProvider proposed API [#13248](https://github.com/eclipse-theia/theia/pull/13248) - contributed on behalf of STMicroelectronics
- [plugin] updated logic to handle activeCustomEditorId [#13267](https://github.com/eclipse-theia/theia/pull/13267)
- [plugin] updated logic to pass context to webview context menu action [#13228](https://github.com/eclipse-theia/theia/pull/13228)
- [plugin] updated logic to use more stable hostname for webviews [#13092](https://github.com/eclipse-theia/theia/pull/13225) [#13258](https://github.com/eclipse-theia/theia/pull/13265)
- [terminal] fixed wording in error message [#13245](https://github.com/eclipse-theia/theia/pull/13245) - contributed on behalf of STMicroelectronics
- [terminal] renamed terminal.sendText() parameter from addNewLine to shouldExecute [#13236](https://github.com/eclipse-theia/theia/pull/13236) - contributed on behalf of STMicroelectronics
- [terminal] updated logic to resize terminal [#13281](https://github.com/eclipse-theia/theia/pull/13281)
- [terminal] updated terminalQuickFixProvider proposed API according to vscode 1.85 version [#13240](https://github.com/eclipse-theia/theia/pull/13240) - contributed on behalf of STMicroelectronics
- [vsx-registry] implemented verified extension filtering [#12995](https://github.com/eclipse-theia/theia/pull/12995)

<a name="breaking_changes_1.46.0">[Breaking Changes:](#breaking_changes_1.46.0)</a>

- [core] moved `FileUri` from `node` package to `common` [#12853](https://github.com/eclipse-theia/theia/pull/12853)
- [plugin] introduced new common interfaces/classes for reuse by different plugin hosts [#13138](https://github.com/eclipse-theia/theia/pull/13138)

## v1.45.0 - 12/21/2023

- [application-manager] updated logic to allow rebinding messaging services in preload [#13199](https://github.com/eclipse-theia/theia/pull/13199)
- [application-package] bumped the default supported API from `1.83.1` to `1.84.2` [#13198](https://github.com/eclipse-theia/theia/pull/13198)
- [core] added cli parameter `--electronUserData` to control `userDataPath` [#13155](https://github.com/eclipse-theia/theia/pull/13155)
- [core] added logic to control the size and position of secondary windows [#13201](https://github.com/eclipse-theia/theia/pull/13201)
- [core] added logic to save untitled files to the last active folder [#13184](https://github.com/eclipse-theia/theia/pull/13184)
- [core] fixed regression preventing closing the application when a dirty editor is present [#13173](https://github.com/eclipse-theia/theia/pull/13173)
- [core] fixed styling for compressed navigator indents [#13162](https://github.com/eclipse-theia/theia/pull/13162)
- [core] introduced timeout logic for keeping connection contexts alive [#13082](https://github.com/eclipse-theia/theia/pull/13082)
- [core] updated `nls.metadata.json` for `1.84.2` [#13200](https://github.com/eclipse-theia/theia/pull/13200)
- [debug] fixed issue where debug configuration providers would replace other providers [#13196](https://github.com/eclipse-theia/theia/pull/13196)
- [documentation] improved documentation regarding the addition of the plugin API in the plugin host [#13153](https://github.com/eclipse-theia/theia/pull/13153)
- [notebook] fixed notebook kernel selection [#13171](https://github.com/eclipse-theia/theia/pull/13171)
- [notebook] implemented general API improvements [#13012](https://github.com/eclipse-theia/theia/pull/13012)
- [notebook] optimized output logic [#13137](https://github.com/eclipse-theia/theia/pull/13137)
- [plugin] added documentation about adding custom activation events [#13190](https://github.com/eclipse-theia/theia/pull/13190)
- [plugin] added logic to deploy plugins asynchronously [#13134](https://github.com/eclipse-theia/theia/pull/13134)
- [plugin] added logic to not reject unknown schemas in `WindowStateExt.asExternalUri` [#13057](https://github.com/eclipse-theia/theia/pull/13057)
- [plugin] added support for the `TestMessage.contextValue` VS Code API [#13176](https://github.com/eclipse-theia/theia/pull/13176) - contributed on behalf of STMicroelectronics
- [plugin] added support for the `webview/context` menu contribution point [#13166](https://github.com/eclipse-theia/theia/pull/13166)
- [plugin] fixed incorrect `unsupported activation error` in stdout [#13095](https://github.com/eclipse-theia/theia/pull/13095)
- [plugin] fixed issue where the `onView` activation event was incorrectly generated [#13091](https://github.com/eclipse-theia/theia/pull/13091)
- [plugin] fixed plugin icon styling [#13101](https://github.com/eclipse-theia/theia/pull/13101)
- [terminal] updated logic to use `ApplicationShell` when expanding/collapsing the bottom panel [#13131](https://github.com/eclipse-theia/theia/pull/13131)
- [workspace] added logic to create an empty workspace if no workspace is active on `updateWorkspaceFolders` event [#13181](https://github.com/eclipse-theia/theia/pull/13181) - contributed on behalf of STMicroelectronics

<a name="breaking_changes_1.45.0">[Breaking Changes:](#breaking_changes_1.45.0)</a>

- [plugin] updated VS Code extension locations: deployment dir switched to `$CONFDIR/deployedPlugin`, `.vsix` files from `$CONFDIR/extensions` are deployed automatically [#13178](https://github.com/eclipse-theia/theia/pull/13178) - Contributed on behalf of STMicroelectronics

## v1.44.0 - 11/30/2023

- [application-manager] added option to copy `trash` dependency to the bundle [#13112](https://github.com/eclipse-theia/theia/pull/13112)
- [application-package] bumped the default supported API from `1.82.0` to `1.83.1` [#13118](https://github.com/eclipse-theia/theia/pull/13118)
- [ci] added smokes tests for production builds [#12965](https://github.com/eclipse-theia/theia/pull/12965)
- [ci] updated CI to pin Python at `3.11` to resolve `node-gyp` errors [#13040](https://github.com/eclipse-theia/theia/pull/13040)
- [core] added handling to prevent class name based contribution filtering [#13103](https://github.com/eclipse-theia/theia/pull/13103)
- [core] added support for portable mode for electron apps [#12690](https://github.com/eclipse-theia/theia/pull/12690)
- [core] fixed logic when handling listener events [#13079](https://github.com/eclipse-theia/theia/pull/13079)
- [core] improved default translations using preferred keys [#13078](https://github.com/eclipse-theia/theia/pull/13078)
- [core] updated `nls.metadata.json` for `1.83.1` [#13119](https://github.com/eclipse-theia/theia/pull/13119)
- [core] updated proxy path handling for `socket.io` [#13054](https://github.com/eclipse-theia/theia/pull/13054)
- [debug] fixed issue where the UI was not updated upon editing breakpoint conditions [#12980](https://github.com/eclipse-theia/theia/pull/12980)
- [debug] fixed localizations of debug schema attributes [#13017](https://github.com/eclipse-theia/theia/pull/13017)
- [debug] updated description field for thread stopped status [#13050](https://github.com/eclipse-theia/theia/pull/13050)
- [documentation] added coding guidelines regarding `@stubbed` and `@monaco-uplift` tags [#13029](https://github.com/eclipse-theia/theia/pull/13029)
- [documentation] updated broken link to `private-ext-scripts/README.md` [#13122](https://github.com/eclipse-theia/theia/pull/13122)
- [filesystem] updated electron dialogs so they are modal by default [#13043](https://github.com/eclipse-theia/theia/pull/13043)
- [notebook] fixed race condition for view registrations [#13115](https://github.com/eclipse-theia/theia/pull/13115)
- [playwright] added basic support for electron [#12207](https://github.com/eclipse-theia/theia/pull/12207)
- [plugin] added a command to list installed plugins [#12818](https://github.com/eclipse-theia/theia/pull/12818)
- [plugin] added handling to forward webview log messages to the browser console [#13084](https://github.com/eclipse-theia/theia/pull/13084)
- [plugin] added support for VS Code default language icons [#13014](https://github.com/eclipse-theia/theia/pull/13014)
- [plugin] added support for `autoClosingPairs` in the `LanguageConfiguration` VS Code API [#13088](https://github.com/eclipse-theia/theia/pull/13088) - contributed on behalf of STMicroelectronics
- [plugin] added support for the `CodeActionKind#Notebook` VS Code API [#13093](https://github.com/eclipse-theia/theia/pull/13093) - contributed on behalf of STMicroelectronics
- [plugin] added support for the `TextEditorOptions.indentSize` VS Code API [#13105](https://github.com/eclipse-theia/theia/pull/13105) - contributed on behalf of STMicroelectronics
- [plugin] added support for the `env.onDidChangeShell` VS Code API [#13097](https://github.com/eclipse-theia/theia/pull/13097) - contributed on behalf of STMicroelectronics
- [private-ext-scripts] updated information regarding scripts [#13127](https://github.com/eclipse-theia/theia/pull/13127)
- [repo] removed usages of `baseUrl` in `tsconfig` [#12981](https://github.com/eclipse-theia/theia/pull/12981)
- [search-in-workspace] added support for search history hint in input fields [#12967](https://github.com/eclipse-theia/theia/pull/12967)
- [search-in-workspace] fixed search-in-workspace line styling [#13071](https://github.com/eclipse-theia/theia/pull/13071)
- [task] added handling to prevent the task widget title from being changed by task process [#13003](https://github.com/eclipse-theia/theia/pull/13003)
- [task] added support for `isDefault: false` in task group definitions [#13075](https://github.com/eclipse-theia/theia/pull/13075) - contributed on behalf of STMicroelectronics
- [toolbar] fixed rendering error for undefined toolbar groups [#13124](https://github.com/eclipse-theia/theia/pull/13124)

## v1.43.0 - 10/26/2023

- [application-manager] fixed backend webpack output and watching [#12902](https://github.com/eclipse-theia/theia/pull/12902)
- [application-manager] updated `clean` command to delete `gen-webpack.node.config.js` [#12975](https://github.com/eclipse-theia/theia/pull/12975)
- [application-package] bumped the default supported API version from `1.81.0` to `1.82.0` [#13025](https://github.com/eclipse-theia/theia/pull/13025)
- [cli] upgraded`chai` dependency from `^4.2.0` to `^4.3.10` [#12958](https://github.com/eclipse-theia/theia/pull/12958)
- [core] added `manage` related menus to the bottom sidebar [#12803](https://github.com/eclipse-theia/theia/pull/12803)
- [core] added lazy loading support for localizations [#12932](https://github.com/eclipse-theia/theia/pull/12932)
- [core] added localizations for clipboard commands [#13031](https://github.com/eclipse-theia/theia/pull/13031)
- [core] fixed file saving dialog for dirty editors [#12864](https://github.com/eclipse-theia/theia/pull/12864)
- [core] fixed preload application package import [#12964](https://github.com/eclipse-theia/theia/pull/12964)
- [core] improved responsiveness when selecting a localization language [#12992](https://github.com/eclipse-theia/theia/pull/12992)
- [core] removed unnecessary `try-catch` from `RpcProtocol` [#12961](https://github.com/eclipse-theia/theia/pull/12961)
- [core] updated `nls.metadata.json` for `1.82.0` [#13028](https://github.com/eclipse-theia/theia/pull/13028)
- [core] updated handling to ensure `ApplicationShellOptions` are properly applied on init [#12983](https://github.com/eclipse-theia/theia/pull/12983)
- [debug] added missing localizations for debug paused labels [#12973](https://github.com/eclipse-theia/theia/pull/12973)
- [debug] fixed an issue which caused jumping of the hover widget [#12971](https://github.com/eclipse-theia/theia/pull/12971)
- [file-search] implemented `search.quickOpen.includeHistory` preference [#12913](https://github.com/eclipse-theia/theia/pull/12913)
- [keymaps] added context-menu items for the keyboard shortcuts view [#12791](https://github.com/eclipse-theia/theia/pull/12791)
- [monaco] upgraded `vscode-textmate` dependency from `7.0.3` to `9.0.0` [#12963](https://github.com/eclipse-theia/theia/pull/12963)
- [notebook] updated handling to correctly updated when output items are updated [#13023](https://github.com/eclipse-theia/theia/pull/13023)
- [plugin] added support for string arguments for `vscode.open` [#12997](https://github.com/eclipse-theia/theia/pull/12997)
- [plugin] added support for the `EnvironmentVariableMutatorOptions` VS Code API [#12984](https://github.com/eclipse-theia/theia/pull/12984)
- [plugin] added support for the icons contribution point [#12912](https://github.com/eclipse-theia/theia/pull/12912)
- [plugin] fixed output renderer scripts path [#12979](https://github.com/eclipse-theia/theia/pull/12979)
- [plugin] fixed symlink handling when initializing plugins [#12841](https://github.com/eclipse-theia/theia/pull/12841)
- [plugin] improved resolution of webview views [#12998](https://github.com/eclipse-theia/theia/pull/12998)
- [plugin] updated handling to allow null items in tree data providers [#13018](https://github.com/eclipse-theia/theia/pull/13018)
- [remote] added remote ssh support [#12618](https://github.com/eclipse-theia/theia/pull/12618)
- [test] added support for the `test` API [#12935](https://github.com/eclipse-theia/theia/pull/12935)
- [vscode] added support for `provideDocumentRangesFormattingEdits` in the `DocumentRangeFormattingEditProvider` VS Code API [#13020](https://github.com/eclipse-theia/theia/pull/13020) - contributed on behalf of STMicroelectronics
- [vscode] evolved proposed API for `documentPaste` (stubbed) [#13010](https://github.com/eclipse-theia/theia/pull/13010) - contributed on behalf of STMicroelectronics
- [vscode] evolved proposed API for `dropDocument` [#13009](https://github.com/eclipse-theia/theia/pull/13009) - contributed on behalf of STMicroelectronics
- [vscode] evolved proposed API for `terminalQuickFixProvider` [#13006](https://github.com/eclipse-theia/theia/pull/13006) - contributed on behalf of STMicroelectronics
- [vscode] implemented scope API on env var collections [#12999](https://github.com/eclipse-theia/theia/pull/12999) - contributed on behalf of STMicroelectronics

<a name="breaking_changes_1.43.0">[Breaking Changes:](#breaking_changes_1.43.0)</a>

- [core] moved `FrontendApplicationContribution` from `@theia/core/lib/browser/frontend-application` to `@theia/core/lib/browser/frontend-application-contribution` [#12993](https://github.com/eclipse-theia/theia/pull/12993)
- [core] removed `SETTINGS_OPEN` menupath constant - replaced by `MANAGE_GENERAL` [#12803](https://github.com/eclipse-theia/theia/pull/12803)
- [core] removed `SETTINGS__THEME` menupath constant - replaced by `MANAGE_SETTINGS` [#12803](https://github.com/eclipse-theia/theia/pull/12803)

## v1.42.0 - 09/28/2023

- [core] added `inversify` support in the frontend preload script [#12590](https://github.com/eclipse-theia/theia/pull/12590)
- [core] added missing localizations for keybinding error messages [#12889](https://github.com/eclipse-theia/theia/pull/12889)
- [core] fixed logger level propagation when log config changes at runtime [#12566](https://github.com/eclipse-theia/theia/pull/12566) - Contributed on behalf of STMicroelectronics
- [core] improved the frontend startup time [#12936](https://github.com/eclipse-theia/theia/pull/12936) - Contributed on behalf of STMicroelectronics
- [core] updated `nls.metadata.json` for `1.81.0` [#12951](https://github.com/eclipse-theia/theia/pull/12951)
- [core] upgraded `ws` from `7.1.2` to `8.14.1` [#12909](https://github.com/eclipse-theia/theia/pull/12909)
- [debug] fixed erroneous inline breakpoints [#12832](https://github.com/eclipse-theia/theia/pull/12832)
- [dev-packages] bumped the default supported API version from `1.80.0` to `1.81.0` [#12949](https://github.com/eclipse-theia/theia/pull/12949)
- [dev-packages] restored src-gen frontend production behavior [12950](https://github.com/eclipse-theia/theia/pull/12950) - Contributed on behalf of STMicroelectronics
- [dialogs] added functionality to allow multiple selection in open dialogs [#12923](https://github.com/eclipse-theia/theia/pull/12923) - Contributed on behalf of STMicroelectronics
- [documentation] added follow-up section to the pull-request template [#12901](https://github.com/eclipse-theia/theia/pull/12901)
- [editor] added functionality to create untitled files when double-clicking the tabbar [#12867](https://github.com/eclipse-theia/theia/pull/12867)
- [electron] improved responsiveness of the initial electron window [#12897](https://github.com/eclipse-theia/theia/pull/12897) - Contributed on behalf of STMicroelectronics.
- [plugin] added stubbing for the `TestController#invalidateTestResults` VS Code API [#12944](https://github.com/eclipse-theia/theia/pull/12944) - Contributed by STMicroelectronics
- [plugin] added support for `iconPath` in the `QuickPickItem` VS Code API [#12945](https://github.com/eclipse-theia/theia/pull/12945) - Contributed by STMicroelectronics
- [repo] updated deprecated instances of `context` in favor of `when` clauses [#12830](https://github.com/eclipse-theia/theia/pull/12830)
- [search-in-workspace] added support for multiline searches [#12868](https://github.com/eclipse-theia/theia/pull/12868)
- [vsx-registry] added a hint in `ENOTFOUND` errors when failing to fetch extensions [#12858](https://github.com/eclipse-theia/theia/pull/12858) - Contributed by STMicroelectronics

## v1.41.0 - 08/31/2023

- [application-package] added handling to quit the electron app when the backend fails to start [#12778](https://github.com/eclipse-theia/theia/pull/12778) - Contributed on behalf of STMicroelectronics
- [core] added `--dnsDefaultResultOrder <value>` CLI argument where `value` is one of `ipv4first`, `verbatim` or `nodeDefault`. It controls how domain names are resolved [#12711](https://github.com/eclipse-theia/theia/pull/12711)
- [core] added functionality to capture stopwatch results [#12812](https://github.com/eclipse-theia/theia/pull/12812)
- [core] added support for `file/newFile` menu path [#12819](https://github.com/eclipse-theia/theia/pull/12819)
- [core] added support for icon-less tabbar items [#12804](https://github.com/eclipse-theia/theia/pull/12804)
- [core] added support for independent items in the `editor/title/run` menu [#12799](https://github.com/eclipse-theia/theia/pull/12799)
- [core] fixed submenu contributions to `editor/title` and `view/title` [#12706](https://github.com/eclipse-theia/theia/pull/12706)
- [core] improved middle-click behavior for tree nodes [#12783](https://github.com/eclipse-theia/theia/pull/12783)
- [core] improved rendering of the close icon when hovering tabs [#12806](https://github.com/eclipse-theia/theia/pull/12806)
- [core] updated `nls.metadata.json` for `1.80.0` [#12875](https://github.com/eclipse-theia/theia/pull/12875)
- [debug] fixed issue where edit watch expressions were not updated without a session [#12627](https://github.com/eclipse-theia/theia/pull/12627)
- [dev-packages] bumped the default supported API version from `1.79.0` to `1.89.0` [#12866](https://github.com/eclipse-theia/theia/pull/12866)
- [editor] fixed context-menu behavior for the editor gutter [#12794](https://github.com/eclipse-theia/theia/pull/12794)
- [filesystem] added missing localization for the copied download link to clipboard notification [#12873](https://github.com/eclipse-theia/theia/pull/12873)
- [getting-started] added checkbox to the welcome page to toggle visibility on startup [#12750](https://github.com/eclipse-theia/theia/pull/12750)
- [getting-started] added support for the `workbench.startupEditor` preference [#12813](https://github.com/eclipse-theia/theia/pull/12813)
- [getting-started] fixed `open folder` link on the welcome page [#12857](https://github.com/eclipse-theia/theia/pull/12857)
- [getting-started] improved rendering of the welcome page for smaller viewports [#12825](https://github.com/eclipse-theia/theia/pull/12825)
- [git] fixed unhandled promise rejection during git operations [#12433](https://github.com/eclipse-theia/theia/pull/12433)
- [markers] improved problems widget rendering, and problem matching [#12802](https://github.com/eclipse-theia/theia/pull/12802)
- [monaco] improved extensibility of `MonacoEditorCommandHandlers` [#12785](https://github.com/eclipse-theia/theia/pull/12785)
- [native-webpack-plugin] added `trash` dependency helpers bundling to the backend [#12797](https://github.com/eclipse-theia/theia/pull/12797)
- [navigator] added missing localizations when no roots are present in a multi-root workspace [#12795](https://github.com/eclipse-theia/theia/pull/12795)
- [notebook] added initial support for `notebook` editors [#12442](https://github.com/eclipse-theia/theia/pull/12442)
- [playwright] upgraded to the latest version and added new page objects [#12843](https://github.com/eclipse-theia/theia/pull/12843)
- [plugin] added support for the `EnvironmentVariableCollection#description` VS Code API [#12838](https://github.com/eclipse-theia/theia/pull/12838)
- [plugin] fixed `configurationDefault` support from VS Code plugins [#12758](https://github.com/eclipse-theia/theia/pull/12758)
- [plugin] fixed `view/title` menu behavior for builtin views [#12763](https://github.com/eclipse-theia/theia/pull/12763)
- [plugin] fixed an issue where the `WebviewPanelSerializer` would not serialize successfully [#12584](https://github.com/eclipse-theia/theia/pull/12584)
- [plugin] fixed plugin menu icon background when hovering [#12827](https://github.com/eclipse-theia/theia/pull/12827)
- [plugin] fixed the default `folderExpanded` icon for themes [#12776](https://github.com/eclipse-theia/theia/pull/12776)
- [plugin] fixed web plugin express endpoint [#12787](https://github.com/eclipse-theia/theia/pull/12787)
- [preferences] improved memory consumption by re-using the markdown renderer instance [#12790](https://github.com/eclipse-theia/theia/pull/12790)
- [process] fixed `.exe` compatibility for shell commands similarly to VS Code [#12761](https://github.com/eclipse-theia/theia/pull/12761)
- [repo] bumped builtin plugins to `1.79.0` [#12807](https://github.com/eclipse-theia/theia/pull/12807)
- [scm-extra] fixed an issue with scm history after performing a commit [#12837](https://github.com/eclipse-theia/theia/pull/12837)
- [task] added handling to ensure contributed problem matchers are successfully discovered [#12805](https://github.com/eclipse-theia/theia/pull/12805)
- [task] fixed error thrown for custom task execution [#12770](https://github.com/eclipse-theia/theia/pull/12770)
- [vscode] added support for tree checkbox api [#12836](https://github.com/eclipse-theia/theia/pull/12836) - Contributed on behalf of STMicroelectronics
- [workspace] fixed saving of untitled text editors when closing a workspace or closing the application [#12577](https://github.com/eclipse-theia/theia/pull/12577)

<a name="breaking_changes_1.41.0">[Breaking Changes:](#breaking_changes_1.41.0)</a>

- [deps] bumped supported Node.js version from 16.x to >=18, you may need to update your environments [#12711](https://github.com/eclipse-theia/theia/pull/12711)
- [preferences] removed the `welcome.alwaysShowWelcomePage` preference in favor of `workbench.startupEditor` [#12813](https://github.com/eclipse-theia/theia/pull/12813)
- [terminal] deprecated `terminal.integrated.rendererType` preference [#12691](https://github.com/eclipse-theia/theia/pull/12691)
- [terminal] removed protected method `TerminalWidgetImpl.getTerminalRendererType` [#12691](https://github.com/eclipse-theia/theia/pull/12691)

## v1.40.0 - 07/27/2023

- [application-package] bumped the default supported VS Code API from `1.78.0` to `1.79.0` [#12764](https://github.com/eclipse-theia/theia/pull/12764) - Contributed on behalf of STMicroelectronics
- [application-package] fixed ignored resource in backend bundling [#12681](https://github.com/eclipse-theia/theia/pull/12681)
- [cli] added `check:theia-extensions` to facilitate checking the uniqueness of `@theia` extension versions [#12596](https://github.com/eclipse-theia/theia/pull/12596) - Contributed on behalf of STMicroelectronics
- [core] added functionality to display command shortcuts in toolbar item tooltips [#12660](https://github.com/eclipse-theia/theia/pull/12660) - Contributed on behalf of STMicroelectronics
- [core] added support to render a visual preview of a tab while hovering [#12648](https://github.com/eclipse-theia/theia/pull/12648) - Contributed on behalf of STMicroelectronics
- [core] fixed regression when rendering icons in menus [#12739](https://github.com/eclipse-theia/theia/pull/12739)
- [core] fixed tabbar icon flickering when resizing views [#12629](https://github.com/eclipse-theia/theia/pull/12629)
- [core] updated localization data with respect to VS Code `1.79.0` [#12765](https://github.com/eclipse-theia/theia/pull/12765)
- [debug] fixed issue where the `DebugBreakpointWidget` did not have the proper value [#12567](https://github.com/eclipse-theia/theia/pull/12567)
- [debug] improved multi-root experience for launch configurations [#12674](https://github.com/eclipse-theia/theia/pull/12674)
- [dialog] added support for the `maxWidth` attribute [#12642](https://github.com/eclipse-theia/theia/pull/12642)
- [documentation] added policy on VS Code usage [#11537](https://github.com/eclipse-theia/theia/pull/11537)
- [filesystem] fixed readonly permissions with disk filesystem provider [#12354](https://github.com/eclipse-theia/theia/pull/12354)
- [keymaps] improved display of action buttons in the keyboard shortcuts view [#12675](https://github.com/eclipse-theia/theia/pull/12675)
- [playwright] fixed issue with `TheiaDialog` page object [#12753](https://github.com/eclipse-theia/theia/pull/12753)
- [plugin] added stubbing for the `ShareProvider` VS Code API [#12747](https://github.com/eclipse-theia/theia/pull/12474)
- [plugin] fixed `MarkdownString` support for `documentation` [#12685](https://github.com/eclipse-theia/theia/pull/12685)
- [plugin] improved handling when writing stores [#12717](https://github.com/eclipse-theia/theia/pull/12717)
- [preferences] improved preference file button rendering [#12586](https://github.com/eclipse-theia/theia/pull/12586)
- [repo] fixed launch configurations for ovsx [#12731](https://github.com/eclipse-theia/theia/pull/12731)
- [scm] improved tree selection styling [#12470](https://github.com/eclipse-theia/theia/pull/12670)
- [search-in-workspace] improved styling of search options [#12697](https://github.com/eclipse-theia/theia/pull/12697)
- [search-in-workspace] improved tree selection styling [#12470](https://github.com/eclipse-theia/theia/pull/12470)
- [vscode] added support for `AuthenticationForceNewSessionOptions` and `detail` message [#12752](https://github.com/eclipse-theia/theia/pull/12752) - Contributed on behalf of STMicroelectronics
- [vscode] added support for the `TaskPresentationOptions` close property [#12749](https://github.com/eclipse-theia/theia/pull/12749) - Contributed on behalf of STMicroelectronics
- [workspace] added support for workspace file extension customization [#12420](https://github.com/eclipse-theia/theia/pull/12420)
- [workspace] implemented `CanonicalUriProvider` VS Code API [#12743](https://github.com/eclipse-theia/theia/pull/12743) - Contributed on behalf of STMicroelectronics

<a name="breaking_changes_1.40.0">[Breaking Changes:](#breaking_changes_1.40.0)</a>

- [preferences] changed the `window.tabbar.enhancedPreview` preference from boolean to enum: [#12648](https://github.com/eclipse-theia/theia/pull/12648) - Contributed on behalf of STMicroelectronics
  - `classic`: Display a simple preview of the tab with basic information.
  - `enhanced`: Display an enhanced preview of the tab with additional information. (The behavior introduced in [#12350](https://github.com/eclipse-theia/theia/pull/12350))
  - `visual`: Display a visual preview of the tab. (The preview support was added with this PR)
- [repo] updated GitHub workflow to stop publishing `next` versions [#12699](https://github.com/eclipse-theia/theia/pull/12699)
- [workspace] split `CommonWorkspaceUtils` into `WorkspaceFileService` and `UntitledWorkspaceService` [#12420](https://github.com/eclipse-theia/theia/pull/12420)
- [plugin] Removed synchronous `fs` calls from the backend application and plugins. The plugin scanner, directory and file handlers, and the plugin deploy entry has async API now. Internal `protected` APIs have been affected. [#12798](https://github.com/eclipse-theia/theia/pull/12798)

## v1.39.0 - 06/29/2023

- [application-manager] added support for backend bundling [#12412](https://github.com/eclipse-theia/theia/pull/12412)
- [application-package] bumped the default supported VS Code API from `1.77.0` to `1.78.0` [#12655](https://github.com/eclipse-theia/theia/pull/12655)
- [core] fixed visibility of the toolbar when resizing [#12617](https://github.com/eclipse-theia/theia/pull/12617)
- [core] improved responsiveness of input fields [#12604](https://github.com/eclipse-theia/theia/pull/12604)
- [core] improved rpc protocol [#12581](https://github.com/eclipse-theia/theia/pull/12581)
- [core] updated `ConfirmSaveDialog` button order for consistency [#12559](https://github.com/eclipse-theia/theia/pull/12559)
- [core] updated handling on tab overflow for sidepanels [#12593](https://github.com/eclipse-theia/theia/pull/12593)
- [core] updated localization metadata for `1.78.0` [#12661](https://github.com/eclipse-theia/theia/pull/12661)
- [core] updated styling for input validation in dialogs [#12585](https://github.com/eclipse-theia/theia/pull/12585)
- [debug] added missing localizations for the debug session status [#12569](https://github.com/eclipse-theia/theia/pull/12569)
- [debug] added support for conditional exception breakpoints [#12445](https://github.com/eclipse-theia/theia/pull/12445)
- [electron] added secondary window support [#12481](https://github.com/eclipse-theia/theia/pull/12481)
- [file-search] added missing localizations for the quick-file open [#12571](https://github.com/eclipse-theia/theia/pull/12571)
- [file-search] updated `ripgrep` arguments for file searches [#12608](https://github.com/eclipse-theia/theia/pull/12608)
- [keymaps] fixed broken typedoc link for supported keys [#12573](https://github.com/eclipse-theia/theia/pull/12573)
- [monaco] improved styling of the quick-input menu [#12239](https://github.com/eclipse-theia/theia/pull/12239)
- [navigator] improved open editors styling and decorations [#12598](https://github.com/eclipse-theia/theia/pull/12598)
- [plugin] added `ThemeIcon` support for `SourceControlResourceThemableDecorations.iconPath` VS Code API [#12187](https://github.com/eclipse-theia/theia/pull/12187)
- [plugin] added stubbing for the `onWillSaveNotebookDocument` VS Code API [#12614](https://github.com/eclipse-theia/theia/pull/12614)
- [plugin] added support to track the visible viewlet [#12597](https://github.com/eclipse-theia/theia/pull/12597)
- [repo] updated border-radius styling for various elements [#12252](https://github.com/eclipse-theia/theia/pull/12252)
- [repo] updated license headers to respect `SPDX` standards [#12584](https://github.com/eclipse-theia/theia/pull/12584)
- [repo] upgraded builtin extension-pack to `v1.77.0` [#12576](https://github.com/eclipse-theia/theia/pull/12576)
- [terminal] fixed `split-terminal` toolbar item visibility [#12626](https://github.com/eclipse-theia/theia/pull/12626)
- [terminal] fixed command executions on Windows [#12620](https://github.com/eclipse-theia/theia/pull/12620)
- [terminal] fixed terminal flicker when resizing [#12587](https://github.com/eclipse-theia/theia/pull/12587)
- [vscode] added missing editor/lineNumber/context menu mapping [#12638](https://github.com/eclipse-theia/theia/pull/12638) - Contributed on behalf of STMicroelectronics
- [vscode] added support for the `editor/title/run` toolbar menu [#12637](https://github.com/eclipse-theia/theia/pull/12637) - Contributed on behalf of STMicroelectronics
- [vsx-registry] added multiple registries support [#12040](https://github.com/eclipse-theia/theia/pull/12040)

<a name="breaking_changes_1.39.0">[Breaking Changes:](#breaking_changes_1.39.0)</a>

- [cli] build process has been adapted to facilitate backend bundling [#12412](https://github.com/eclipse-theia/theia/pull/12412)
  - `webpack` compiles frontend files now into the `lib/frontend` directory (previously `lib`)
  - the `electron-main.js` has been moved from `src-gen/frontend` to `src-gen/backend`
  - `theia rebuild` needs to run **before** `theia build` for the respective target when using a bundled backend
- [repo] with the upgrade to Inversify 6.0, a few initialization methods were adjusted. See also [this migration guide entry](https://github.com/eclipse-theia/theia/blob/master/doc/Migration.md#inversify-60). Additionally, other changes include: [#12425](https://github.com/eclipse-theia/theia/pull/12425)
  - the type expected by the `PreferenceProxySchema` symbol has been changed from `PromiseLike<PreferenceSchema>` to `() => PromiseLike<PreferenceSchema>`
  - the symbol `OnigasmPromise` has been changed to `OnigasmProvider` and injects a function of type `() => Promise<IOnigLib>`
  - the symbol `PreferenceTransactionPrelude` has been changed to `PreferenceTransactionPreludeProvider` and injects a function of type `() => Promise<unknown>`
- [rpc] Renamed suffixes of classes and types that were still referencing the old rpc protocol. From `JsonRpc*` to `Rpc*`.
  - old classes and types are still available but haven been deprecated and will be removed future releases [#12588](https://github.com/eclipse-theia/theia/pull/12588)
  - e.g. `JsonRpcProxyFactory` is deprecated, use `RpcProxyFactory` instead.

## v1.38.0 - 05/25/2023

- [application-manager] fixed regression preventing browser-only builds from succeeding [#12491](https://github.com/eclipse-theia/theia/pull/12491)
- [application-package] bumped the default supported VS Code API from `1.74.2` to `1.77.0` [#12516](https://github.com/eclipse-theia/theia/pull/12516)
- [core] added `open tabs` dropdown for `workbench.tab.shrinkToFit.enabled` preference [#12411](https://github.com/eclipse-theia/theia/pull/12411)
- [core] added confirmation prompt when executing `Clear Command History` [#12510](https://github.com/eclipse-theia/theia/pull/12510)
- [core] added handling to prevent concurrent access to the disk [#12236](https://github.com/eclipse-theia/theia/pull/12236)
- [core] added handling to properly dismiss quick-open menus without explicit focus [#12446](https://github.com/eclipse-theia/theia/pull/12446)
- [core] added missing theming for `hc-dark` for active borders [#12448](https://github.com/eclipse-theia/theia/pull/12448)
- [core] added support for `enablement` property for command contributions [#12483](https://github.com/eclipse-theia/theia/pull/12483)
- [core] updated JSON schema URL [#12376](https://github.com/eclipse-theia/theia/pull/12376)
- [core] updated `nls.metadata.json` for `1.77.0` [#12555](https://github.com/eclipse-theia/theia/pull/12555)
- [debug] added handling to associate root folder to dynamic debug configurations [#12482](https://github.com/eclipse-theia/theia/pull/12482)
- [debug] fixed behavior for exited threads [#12113](https://github.com/eclipse-theia/theia/pull/12113)
- [debug] fixed focus out for the debug configuration quick-open menu [#12046](https://github.com/eclipse-theia/theia/pull/12046)
- [debug] fixed incorrect debug configuration on startup [#12480](https://github.com/eclipse-theia/theia/pull/12480)
- [documentation] added resolution note for `msgpackr` [#12527](https://github.com/eclipse-theia/theia/pull/12527)
- [editor] added confirmation prompt when executing `Clear Editor History` [#12506](https://github.com/eclipse-theia/theia/pull/12506)
- [markers] improved the performance when rending markers [#12408](https://github.com/eclipse-theia/theia/pull/12408)
- [messages] added handling to properly close the toaster container when empty [#12457](https://github.com/eclipse-theia/theia/pull/12457)
- [monaco] fixed styling for the suggest list highlighting [#12317](https://github.com/eclipse-theia/theia/pull/12317)
- [plugin] added stubbing for the `ProfileContentHandler` VS Code API [#12535](https://github.com/eclipse-theia/theia/pull/12535)
- [plugin] added stubbing for the `TerminalQuickFixProvider` VS Code API [#12532](https://github.com/eclipse-theia/theia/pull/12532)
- [plugin] added stubbing for the `onWillCreateEditSessionIdentity` [#12533](https://github.com/eclipse-theia/theia/pull/12533)
- [plugin] added stubbing for the proposed `DocumentPaste` VS Code API [#12512](https://github.com/eclipse-theia/theia/pull/12512)
- [plugin] added stubbing for the proposed `EditSessionIdentityProvider` VS Code API [#12508](https://github.com/eclipse-theia/theia/pull/12508)
- [plugin] added stubbing for the proposed `ExternalUriOpener` VS Code API [#12539](https://github.com/eclipse-theia/theia/pull/12539)
- [plugin] added support for `collapse all` in tree-view toolbars [#12514](https://github.com/eclipse-theia/theia/pull/12514)
- [plugin] added support for the `TelemetryLogger` VS Code API [#12453](https://github.com/eclipse-theia/theia/pull/12453)
- [plugin] fixed `TreeView#reveal` behavior [#12489](https://github.com/eclipse-theia/theia/pull/12489)
- [plugin] fixed tab indices logic when moving or closing tabs [#12400](https://github.com/eclipse-theia/theia/pull/12400)
- [repo] upgraded `engine.io` to fix a known vulnerability [#12556](https://github.com/eclipse-theia/theia/pull/12556)
- [repo] upgraded `socket.io-parser` to fix a known vulnerability [#12556](https://github.com/eclipse-theia/theia/pull/12556)
- [scripts] improved `dash-licenses` to handle internal errors [#12545](https://github.com/eclipse-theia/theia/pull/12545)
- [search-in-workspace] added multiselect support in the view [#12331](https://github.com/eclipse-theia/theia/pull/12331)
- [task] improved user-experience when configuring and running tasks [#12507](https://github.com/eclipse-theia/theia/pull/12507)
- [workspace] added exception handling for `WorkspaceDeleteHandler` [#12544](https://github.com/eclipse-theia/theia/pull/12544)
- [workspace] improved behavior of `open workspace` and `open folder` [#12537](https://github.com/eclipse-theia/theia/pull/12537)

<a name="breaking_changes_1.38.0">[Breaking Changes:](#breaking_changes_1.38.0)</a>

- [core] moved `ToolbarAwareTabBar.Styles` to `ScrollableTabBar.Styles` [#12411](https://github.com/eclipse-theia/theia/pull/12411/)
- [debug] changed the return type of `DebugConfigurationManager.provideDynamicDebugConfigurations()` to `Promise<Record<string, DynamicDebugConfigurationSessionOptions[]>>` [#12482](https://github.com/eclipse-theia/theia/pull/12482)
- [workspace] removed `WorkspaceFrontendContribution.createOpenWorkspaceOpenFileDialogProps(...)` and `WorkspaceFrontendContribution.preferences` [#12537](https://github.com/eclipse-theia/theia/pull/12537)

## v1.37.0 - 04/27/2023

- [application-package] bumped the default supported VS Code API from `1.72.2` to `1.74.2` [#12468](https://github.com/eclipse-theia/theia/pull/12468)
- [cli] added support for `${targetPlatform}` when declaring URLs for plugins [#12410](https://github.com/eclipse-theia/theia/pull/12410)
- [core] added support for a dynamic tab resizing strategy (controlled by `workbench.tab.shrinkToFit.enabled`) [#12360](https://github.com/eclipse-theia/theia/pull/12360)
- [core] added support for enhanced `tabbar` previews on hover [#12350](https://github.com/eclipse-theia/theia/pull/12350)
- [core] added support for localizations using VS Code's `l10n` [#12192](https://github.com/eclipse-theia/theia/pull/12192)
- [core] added support for pushing a large number of items in tree iterators [#12172](https://github.com/eclipse-theia/theia/pull/12172)
- [core] added theming support for `highlightModifiedTabs` [#12367](https://github.com/eclipse-theia/theia/pull/12367)
- [core] fixed an issue where the `theia-file-icons` theme was not always applied [#12419](https://github.com/eclipse-theia/theia/pull/12419)
- [core] fixed right-click behavior in trees due to padding [#12436](https://github.com/eclipse-theia/theia/pull/12436)
- [core] replaced `request` with `@theia/request` [#12413](https://github.com/eclipse-theia/theia/pull/12413)
- [debug] fixed an issue where `getTrackableWidgets` did not return the right result [#12241](https://github.com/eclipse-theia/theia/pull/12241)
- [electron] upgraded `electron` to `23.2.4` [#12464](https://github.com/eclipse-theia/theia/pull/12464)
- [keymaps] improved search when searching for keybindings [#12312](https://github.com/eclipse-theia/theia/pull/12312)
- [monaco] added missing localizations [#12378](https://github.com/eclipse-theia/theia/pull/12378)
- [monaco] added support for the `inQuickOpen` when-clause context [#12427](https://github.com/eclipse-theia/theia/pull/12427)
- [monaco] fixed `parseSnippets` handling [#12463](https://github.com/eclipse-theia/theia/pull/12463)
- [monaco] fixed `Save As...` limit [#12418](https://github.com/eclipse-theia/theia/pull/12418)
- [playwright] added a page object for terminals [#12381](https://github.com/eclipse-theia/theia/pull/12381)
- [playwright] upgraded `playwright` to latest version [#12384](https://github.com/eclipse-theia/theia/pull/12384)
- [plugin] added error feedback when invoking the `vscode.open` command [#12284](https://github.com/eclipse-theia/theia/pull/12284)
- [plugin] added handling to ensure unique tree-view IDs [#12338](https://github.com/eclipse-theia/theia/pull/12338)
- [plugin] added handling to use `TaskScope.Workspace` as a default when no `scope` is provided [#12431](https://github.com/eclipse-theia/theia/pull/12431)
- [plugin] added stubbing for the `TestRunProfile#supportsContinuousRun` VS Code API [#12456](https://github.com/eclipse-theia/theia/pull/12456)
- [plugin] added support for the `CommentThread#state` VS Code API [#12454](https://github.com/eclipse-theia/theia/pull/12454)
- [plugin] added support for the `onTaskType` when-clause context [#12431](https://github.com/eclipse-theia/theia/pull/12431)
- [plugin] fixed check for presence of files in drag-and-drop [#12409](https://github.com/eclipse-theia/theia/pull/12409)
- [plugin] fixed memory leak in tree-views [#12353](https://github.com/eclipse-theia/theia/pull/12353)
- [plugin] implemented the VS Code `LogOutputChannel` API [#12017](https://github.com/eclipse-theia/theia/pull/12429) - Contributed on behalf of STMicroelectronics
- [preferences] improved localizations for preferences [#12378](https://github.com/eclipse-theia/theia/pull/12378)
- [search-in-workspace] added missing placeholder for glob input fields [#12389](https://github.com/eclipse-theia/theia/pull/12389)
- [search-in-workspace] fixed `patternExcludesInputBoxFocus` when-clause handler [#12385](https://github.com/eclipse-theia/theia/pull/12385)

<a name="breaking_changes_1.37.0">[Breaking Changes:](#breaking_changes_1.37.0)</a>

- [core] injected `CorePreferences` into `DockPanelRenderer` constructor [12360](https://github.com/eclipse-theia/theia/pull/12360)
- [core] introduced `ScrollableTabBar.updateTabs()` to fully render tabs [12360](https://github.com/eclipse-theia/theia/pull/12360)
- [plugin] changed visibility from `private` to `protected` for member `proxy` and function `validate()` in `output-channel-item.ts` [#12017](https://github.com/eclipse-theia/theia/pull/12429)
- [plugin] removed enum `LogLevel` and namespace `env` from `plugin/src/theia-proposed.d.ts` [#12017](https://github.com/eclipse-theia/theia/pull/12429)

## v1.36.0 0 - 03/30/2023

- [application-manager] upgraded `webpack` to `5.76.0` [#12316](https://github.com/eclipse-theia/theia/pull/12316)
- [cli] updated `puppeteer` version [#12222](https://github.com/eclipse-theia/theia/pull/12222)
- [core] added fallback to `applicationName` for the application window [#12265](https://github.com/eclipse-theia/theia/pull/12265)
- [core] added support for `placeholder` in `SingleTextInputDialog` [#12244](https://github.com/eclipse-theia/theia/pull/12244)
- [core] fixed `waitForHidden` method implementation to properly check visibility [#12300](https://github.com/eclipse-theia/theia/pull/12300)
- [core] fixed handling when rendering preferences according to the schema [#12347](https://github.com/eclipse-theia/theia/pull/12347)
- [core] fixed issue with the rendering of toolbar items with when clauses [#12329](https://github.com/eclipse-theia/theia/pull/12329)
- [core] fixed tabbar rendering when items are present [#12307](https://github.com/eclipse-theia/theia/pull/12307)
- [core] fixed the `merge` of debug configurations [#12174](https://github.com/eclipse-theia/theia/pull/12174)
- [core] refined typings for `isObject<T>` [#12259](https://github.com/eclipse-theia/theia/pull/12259)
- [core] updated styling of dialogs [#12254](https://github.com/eclipse-theia/theia/pull/12254)
- [debug] added suppression support for the `DebugSessionOptions` VS Code API [#12220](https://github.com/eclipse-theia/theia/pull/12220)
- [debug] improved breakpoint decoration rendering [#12249](https://github.com/eclipse-theia/theia/pull/12249)
- [file-search] updated handling when a file is not found [#12255](https://github.com/eclipse-theia/theia/pull/12255)
- [monaco] fixed incorrect range in `MonacoOutlineContribution` [#12306](https://github.com/eclipse-theia/theia/pull/12306)
- [monaco] fixed issue preventing the first element in a quick-input from being selected initially [#12208](https://github.com/eclipse-theia/theia/pull/12208)
- [outline-view] added "expand-all" toolbar item [#12188](https://github.com/eclipse-theia/theia/pull/12188)
- [plugin] added handling to ensure uniqueness of tree node ids [#12120](https://github.com/eclipse-theia/theia/pull/12120)
- [plugin] added proper handling for `OnEnterRule` [#12228](https://github.com/eclipse-theia/theia/pull/12228)
- [plugin] added stubbing of the proposed `extensions.allAcrossExtensionHosts` VS Code API [#12277](https://github.com/eclipse-theia/theia/pull/12277)
- [plugin] added support for the `TerminalExitReason` VS Code API [#12293](https://github.com/eclipse-theia/theia/pull/12293)
- [plugin] added support for the `ViewBadge` VS Code API [#12330](https://github.com/eclipse-theia/theia/pull/12330)
- [plugin] bumped the default supported API to `1.72.2` [#12359](https://github.com/eclipse-theia/theia/pull/12359)
- [plugin] fixed issue which caused the loss of file watching events [#12264](https://github.com/eclipse-theia/theia/pull/12264)
- [plugin] fixed issue with `PseudoTerminal` events [#12146](https://github.com/eclipse-theia/theia/pull/12146)
- [plugin] fixed plugin proxy support [#12266](https://github.com/eclipse-theia/theia/pull/12266)
- [plugin] fixed recursion when setting webview title [#12221](https://github.com/eclipse-theia/theia/pull/12221)
- [plugin] reduced plugging logging level to debug [#12224](https://github.com/eclipse-theia/theia/pull/12224)
- [scm] fixed inline toolbar command execution [#12295](https://github.com/eclipse-theia/theia/pull/12295)
- [terminal] added support for context-menus in terminals [#12326](https://github.com/eclipse-theia/theia/pull/12326)
- [terminal] fixed issue causing new terminals to not spawn without a workspace present [#12322](https://github.com/eclipse-theia/theia/pull/12322)
- [terminal] fixed terminal creation when spawning multiple terminals quickly [#12225](https://github.com/eclipse-theia/theia/pull/12225)
- [toolbar] fixed `dragOver` behavior in toolbars [#12257](https://github.com/eclipse-theia/theia/pull/12257)
- [workspace] simplified `add folder` and `remove folder` command implementations [#12242](https://github.com/eclipse-theia/theia/pull/12242)
- [workspace] updated the `rename` command to return the `stat` when successful [#12278](https://github.com/eclipse-theia/theia/pull/12278)

<a name="breaking_changes_1.36.0">[Breaking Changes:](#breaking_changes_1.36.0)</a>

- [core] changed default icon theme from `none` to `theia-file-icons` [#11028](https://github.com/eclipse-theia/theia/pull/12346)
- [plugin] renamed `TreeViewExtImpl#toTreeItem()` to `TreeViewExtImpl#toTreeElement()`
- [scm] fixed `scm` inline toolbar commands, the changes introduces the following breakage: [#12295](https://github.com/eclipse-theia/theia/pull/12295)
  - Interface `ScmInlineAction` removes `commands: CommandRegistry`
  - Interface `ScmInlineActions` removes `commands: CommandRegistry`
  - Interface `ScmTreeWidget.Props` removes `commands: CommandRegistry`
- [terminal] removed `openTerminalFromProfile` method from `TerminalFrontendContribution` [#12322](https://github.com/eclipse-theia/theia/pull/12322)
- [electron] enabled context isolation and disabled node integration in Electron renderer (<https://github.com/eclipse-theia/theia/issues/2018>)

## v1.35.0 - 02/23/2023

- [application-package] updated default supported VS Code API to `1.70.1` [#12200](https://github.com/eclipse-theia/theia/pull/12200)
- [core] added handling on shutdown when dirty editors are present [#12166](https://github.com/eclipse-theia/theia/pull/12166)
- [core] fixed `ToolbarItem.when` handling [#12067](https://github.com/eclipse-theia/theia/pull/12067)
- [core] fixed styling of view titles with toolbar items [#12077](https://github.com/eclipse-theia/theia/pull/12077)
- [core] implemented `workbench.editor.revealIfOpen` preference [#12145](https://github.com/eclipse-theia/theia/pull/12145)
- [core] improved styling for tree and select component outlines [#12156](https://github.com/eclipse-theia/theia/pull/12156)
- [core] updated localizations to VS Code `1.70.2` [#12205](https://github.com/eclipse-theia/theia/pull/12205)
- [debug] added localizations for the debug level selector [#12033](https://github.com/eclipse-theia/theia/pull/12033)
- [debug] fixed handling of for breakpoint events when metadata is updated [#12183](https://github.com/eclipse-theia/theia/pull/12183)
- [debug] fixed instruction breakpoints in `DebugSession` [#12190](https://github.com/eclipse-theia/theia/pull/12190)
- [debug] removed unnecessary "download debug adapters" script [#12150](https://github.com/eclipse-theia/theia/pull/12150)
- [editor] added handling for closing duplicate editors on the same tabbar [#12147](https://github.com/eclipse-theia/theia/pull/12147)
- [filesystem] added option to toggle hidden files/folders in the file dialog [#12179](https://github.com/eclipse-theia/theia/pull/12179)
- [filesystem] fixed memory leak in `NsfwWatcher` [#12144](https://github.com/eclipse-theia/theia/pull/12144)
- [filesystem] upgrades trash from `6.1.1` to `7.2.0` [#12133](https://github.com/eclipse-theia/theia/pull/12133)
- [navigator] updated restoration handling for open-editors [#12210](https://github.com/eclipse-theia/theia/pull/12210)
- [playwright] upgraded `@playwright/test` dependency to `1.30.0` [#12141](https://github.com/eclipse-theia/theia/pull/12141)
- [plugin] added ability to generate activation events automatically [#12167](https://github.com/eclipse-theia/theia/pull/12167)
- [plugin] added handling for plugins to access language overrides with bracket syntax [#12136](https://github.com/eclipse-theia/theia/pull/12136)
- [plugin] added support for `DocumentDropEditProvider` [#12125](https://github.com/eclipse-theia/theia/pull/12125)
- [plugin] added support for the `activeWebviewPanelId` context when-clause [#12182](https://github.com/eclipse-theia/theia/pull/12182)
- [plugin] exposed terminal commands to plugins [#12134](https://github.com/eclipse-theia/theia/pull/12134)
- [plugin] fixed focus issue for modal notifications [#12206](https://github.com/eclipse-theia/theia/pull/12206)
- [plugin] implemented the VS Code `Tab` API [#12109](https://github.com/eclipse-theia/theia/pull/12109)
- [plugin] implemented the `WorkspaceEditMetadata` VS Code API [#12193](https://github.com/eclipse-theia/theia/pull/12193)
- [plugin] updated restoration handling when a `Webview` does not implement `WebviewPanelSerializer` [#12138](https://github.com/eclipse-theia/theia/pull/12138)
- [repo] fixed API integration test suite [#12117](https://github.com/eclipse-theia/theia/pull/12117)
- [scripts] fixed comparison when compiling package references [#12122](https://github.com/eclipse-theia/theia/pull/12122)
- [terminal] added support for multi-root workspaces in terminal profiles [#12199](https://github.com/eclipse-theia/theia/pull/12199)
- [terminal] fixed issue when no default terminal profile is set on startup [#12191](https://github.com/eclipse-theia/theia/pull/12191)
- [workspace] added handling to ensure uniqueness of roots [#12159](https://github.com/eclipse-theia/theia/pull/12159)
- [workspace] updated styling for input dialogs [#12158](https://github.com/eclipse-theia/theia/pull/12158)

<a name="breaking_changes_1.35.0">[Breaking Changes:](#breaking_changes_1.35.0)</a>

- [repo] drop support for `Node 14` [#12169](https://github.com/eclipse-theia/theia/pull/12169)

## v1.34.0 - 01/26/2023

- [application-package] bumped the default supported API version from `1.55.2` to `1.66.2` [#12104](https://github.com/eclipse-theia/theia/pull/12104)
- [cli] added ability to use client side rate limiting when download plugins [#11962](https://github.com/eclipse-theia/theia/pull/11962)
- [core] improved display of dialogs with a lot of content [#12052](https://github.com/eclipse-theia/theia/pull/12052)
- [core] improved extensibility of the "uncaught error" handler in the `BackendApplication` [#12068](https://github.com/eclipse-theia/theia/pull/12068)
- [core] improved styling of the `select-dropdown` component when content overflows [#12038](https://github.com/eclipse-theia/theia/pull/12038)
- [core] refactored to use `fsPath` for the `COPY_PATH` command [#12002](https://github.com/eclipse-theia/theia/pull/12002)
- [core] updated `nsfw` from `2.1.2` to `2.2.4` [#11975](https://github.com/eclipse-theia/theia/pull/11975)
- [core] updated `vscode-languageserver-protocol` from `3.15.3` to `3.17.2` [#12012](https://github.com/eclipse-theia/theia/pull/12012)
- [debug] fixed numerous issues related to debugging [#11984](https://github.com/eclipse-theia/theia/pull/11984)
- [debug] fixed styling of the hover widget when content overflows [#12058](https://github.com/eclipse-theia/theia/pull/12058)
- [debug] fixed styling of variables in the view [#12089](https://github.com/eclipse-theia/theia/pull/12089)
- [filesystem] added missing localization for the "preparing download" message [#12041](https://github.com/eclipse-theia/theia/pull/12041)
- [filesystem] added missing localization for the deleted tab suffix [#12032](https://github.com/eclipse-theia/theia/pull/12032)
- [filesystem] updated styling for children of root nodes to include additional depth padding [#11967](https://github.com/eclipse-theia/theia/pull/11967)
- [filesystem] updated visibility of the `UPLOAD` command [#11756](https://github.com/eclipse-theia/theia/pull/11756)
- [getting-started] fixed an issue where the getting-started widget did not accept focus [#11807](https://github.com/eclipse-theia/theia/pull/11807)
- [memory-view] updating handling when variable requests fail [#11928](https://github.com/eclipse-theia/theia/pull/11928)
- [monaco] improved the responsiveness of quick-input menus [#12095](https://github.com/eclipse-theia/theia/pull/12095)
- [navigator] added the `OPEN_CONTAINING_FOLDER` command to the tab context-menu [#12076](https://github.com/eclipse-theia/theia/pull/12076)
- [plugin] added full support for the `Diagnostic.code` API [#11765](https://github.com/eclipse-theia/theia/pull/11765)
- [plugin] added handling for top-level preference access [#12056](https://github.com/eclipse-theia/theia/pull/12056)
- [plugin] added partial support for `iconPath` and `color` in the `TerminalOptions` and `ExtensionTerminalOptions` VS Code API [#12060](https://github.com/eclipse-theia/theia/pull/12060)
- [plugin] added stubbing of `tab`-related VS Code APIs [#12031](https://github.com/eclipse-theia/theia/pull/12031)
- [plugin] added support `valueSelection` for the `InputBox` VS Code API [#12050](https://github.com/eclipse-theia/theia/pull/12050)
- [plugin] added support for `RefactorMove` in the `CodeActionKind` VS Code API [#12039](https://github.com/eclipse-theia/theia/pull/12039)
- [plugin] added support for `enabled` in the `SourceControlInputBox` VS Code API [#12069](https://github.com/eclipse-theia/theia/pull/12069)
- [plugin] added support for `isTransient` in the `TerminalOptions` and `ExternalTerminalOptions` VS Code APIs [#12055](https://github.com/eclipse-theia/theia/pull/12055) - Contributed on behalf of STMicroelectronics
- [plugin] added support for `location` in the `TerminalOptions` VS Code API [#12006](https://github.com/eclipse-theia/theia/pull/12006)
- [plugin] added support for `timestamp` in the `Comment` VS Code API [#12007](https://github.com/eclipse-theia/theia/pull/12007)
- [plugin] added support for multi-selection in tree-views [#12088](https://github.com/eclipse-theia/theia/pull/12088)
- [plugin] added support for the `DataTransfer` VS Code API [#12065](https://github.com/eclipse-theia/theia/pull/12065)
- [plugin] added support for the `SnippetTextEdit` VS Code API [#12047](https://github.com/eclipse-theia/theia/pull/12047)
- [plugin] added support for the `TerminalProfile` VS Code API [#12066](https://github.com/eclipse-theia/theia/pull/12066)
- [plugin] added support for the `TreeDragAndDropController` VS Code API [#12065](https://github.com/eclipse-theia/theia/pull/12065)
- [plugin] fixed `WebView` CORS handling for `vscode-resource` [#12070](https://github.com/eclipse-theia/theia/pull/12070)
- [plugin] fixed `WebView` VS Code API inconsistencies [#12091](https://github.com/eclipse-theia/theia/pull/12091) - Contributed on behalf of STMicroelectronics
- [plugin] fixed regression when starting pseudoterminals [#12098](https://github.com/eclipse-theia/theia/pull/12098)
- [repo] added missing localizations in dialogs [#12062](https://github.com/eclipse-theia/theia/pull/12062)
- [repo] added simplified type checking for objects [#11831](https://github.com/eclipse-theia/theia/pull/11831)
- [repo] updated default localizations to `1.68.1` [#12092](https://github.com/eclipse-theia/theia/pull/12092)
- [scm] added support for `strikethrough` decorations contributed by the `SourceControlResourceDecorations` VS Code API [#11999](https://github.com/eclipse-theia/theia/pull/11999)
- [terminal] added support for the preference `terminal.integrated.enablePersistentSessions` to allow disabling restoring terminals on reload [#12055](https://github.com/eclipse-theia/theia/pull/12055) - Contributed on behalf of STMicroelectronics
- [terminal] removed unnecessary use `RPCProtocol` [#11972](https://github.com/eclipse-theia/theia/pull/11972)
- [variable-resolver] fixed evaluations of `pickString` variables [#12100](https://github.com/eclipse-theia/theia/pull/12100) - Contributed on behalf of STMicroelectronics
- [workspace] refactored to use `fsPath` for the `COPY_RELATIVE_PATH` command [#12002](https://github.com/eclipse-theia/theia/pull/12002)

<a name="breaking_changes_1.34.0">[Breaking Changes:](#breaking_changes_1.34.0)</a>

- [plugin-ext] renamed `TreeViewWidgetIdentifier` to `TreeViewWidgetOptions` as there were more fields added to it [12065](https://github.com/eclipse-theia/theia/pull/12065)
