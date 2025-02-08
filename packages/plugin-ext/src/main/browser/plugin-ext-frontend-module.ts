// *****************************************************************************
// Copyright (C) 2018 Red Hat, Inc. and others.
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

import '../../../src/main/style/status-bar.css';
import '../../../src/main/browser/style/index.css';
import '../../../src/main/browser/style/comments.css';

import { ContainerModule } from '@theia/core/shared/inversify';
import {
    FrontendApplicationContribution, WidgetFactory, bindViewContribution,
    ViewContainerIdentifier, ViewContainer, createTreeContainer, TreeWidget, LabelProviderContribution, LabelProvider,
    UndoRedoHandler, DiffUris, Navigatable, SplitWidget,
    noopWidgetStatusBarContribution,
    WidgetStatusBarContribution
} from '@theia/core/lib/browser';
import { MaybePromise, CommandContribution, ResourceResolver, bindContributionProvider, URI, generateUuid } from '@theia/core/lib/common';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser/messaging';
import { HostedPluginSupport } from '../../hosted/browser/hosted-plugin';
import { HostedPluginWatcher } from '../../hosted/browser/hosted-plugin-watcher';
import { OpenUriCommandHandler } from './commands';
import { PluginApiFrontendContribution } from './plugin-frontend-contribution';
import { HostedPluginServer, hostedServicePath, PluginServer, pluginServerJsonRpcPath } from '../../common/plugin-protocol';
import { ModalNotification } from './dialogs/modal-notification';
import { PluginWidget } from './plugin-ext-widget';
import { PluginFrontendViewContribution } from './plugin-frontend-view-contribution';
import { EditorModelService } from './text-editor-model-service';
import { MenusContributionPointHandler } from './menus/menus-contribution-handler';
import { PluginContributionHandler } from './plugin-contribution-handler';
import { PluginViewRegistry, PLUGIN_VIEW_CONTAINER_FACTORY_ID, PLUGIN_VIEW_FACTORY_ID, PLUGIN_VIEW_DATA_FACTORY_ID } from './view/plugin-view-registry';
import { TextContentResourceResolver } from './workspace-main';
import { MainPluginApiProvider } from '../../common/plugin-ext-api-contribution';
import { PluginPathsService, pluginPathsServicePath } from '../common/plugin-paths-protocol';
import { KeybindingsContributionPointHandler } from './keybindings/keybindings-contribution-handler';
import { DebugSessionContributionRegistry } from '@theia/debug/lib/browser/debug-session-contribution';
import { PluginDebugSessionContributionRegistry } from './debug/plugin-debug-session-contribution-registry';
import { PluginDebugService } from './debug/plugin-debug-service';
import { DebugService } from '@theia/debug/lib/common/debug-service';
import { PluginSharedStyle } from './plugin-shared-style';
import { SelectionProviderCommandContribution } from './selection-provider-command';
import { ViewContextKeyService } from './view/view-context-key-service';
import { PluginViewWidget, PluginViewWidgetIdentifier } from './view/plugin-view-widget';
import { TreeViewWidgetOptions, VIEW_ITEM_CONTEXT_MENU, PluginTree, TreeViewWidget, PluginTreeModel } from './view/tree-view-widget';
import { RPCProtocol } from '../../common/rpc-protocol';
import { LanguagesMainFactory, OutputChannelRegistryFactory } from '../../common';
import { LanguagesMainImpl } from './languages-main';
import { OutputChannelRegistryMainImpl } from './output-channel-registry-main';
import { WebviewWidget } from './webview/webview';
import { WebviewEnvironment } from './webview/webview-environment';
import { WebviewThemeDataProvider } from './webview/webview-theme-data-provider';
import { bindWebviewPreferences } from './webview/webview-preferences';
import { WebviewResourceCache } from './webview/webview-resource-cache';
import { PluginIconThemeService, PluginIconThemeFactory, PluginIconThemeDefinition, PluginIconTheme } from './plugin-icon-theme-service';
import { PluginTreeViewNodeLabelProvider } from './view/plugin-tree-view-node-label-provider';
import { WebviewWidgetFactory } from './webview/webview-widget-factory';
import { CommentsService, PluginCommentService } from './comments/comments-service';
import { CommentingRangeDecorator } from './comments/comments-decorator';
import { CommentsContribution } from './comments/comments-contribution';
import { CommentsContext } from './comments/comments-context';
import { PluginCustomEditorRegistry } from './custom-editors/plugin-custom-editor-registry';
import { CustomEditorWidgetFactory } from '../browser/custom-editors/custom-editor-widget-factory';
import { CustomEditorWidget } from './custom-editors/custom-editor-widget';
import { CustomEditorService } from './custom-editors/custom-editor-service';
import { WebviewFrontendSecurityWarnings } from './webview/webview-frontend-security-warnings';
import { PluginAuthenticationServiceImpl } from './plugin-authentication-service';
import { AuthenticationService } from '@theia/core/lib/browser/authentication-service';
import { bindTreeViewDecoratorUtilities, TreeViewDecoratorService } from './view/tree-view-decorator-service';
import { PluginMenuCommandAdapter } from './menus/plugin-menu-command-adapter';
import './theme-icon-override';
import { PluginIconService } from './plugin-icon-service';
import { PluginTerminalRegistry } from './plugin-terminal-registry';
import { DnDFileContentStore } from './view/dnd-file-content-store';
import { WebviewContextKeys } from './webview/webview-context-keys';
import { LanguagePackService, languagePackServicePath } from '../../common/language-pack-service';
import { TabBarToolbarContribution } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { CellOutputWebviewFactory } from '@theia/notebook/lib/browser';
import { CellOutputWebviewImpl, createCellOutputWebviewContainer } from './notebooks/renderers/cell-output-webview';
import { ArgumentProcessorContribution } from './command-registry-main';
import { WebviewSecondaryWindowSupport } from './webview/webview-secondary-window-support';
import { CustomEditorUndoRedoHandler } from './custom-editors/custom-editor-undo-redo-handler';

export default new ContainerModule((bind, unbind, isBound, rebind) => {

    bind(LanguagesMainImpl).toSelf().inTransientScope();
    bind(LanguagesMainFactory).toFactory(context => (rpc: RPCProtocol) => {
        const child = context.container.createChild();
        child.bind(RPCProtocol).toConstantValue(rpc);
        return child.get(LanguagesMainImpl);
    });

    bind(OutputChannelRegistryMainImpl).toSelf().inTransientScope();
    bind(OutputChannelRegistryFactory).toFactory(context => () => {
        const child = context.container.createChild();
        return child.get(OutputChannelRegistryMainImpl);
    });

    bind(ModalNotification).toSelf().inSingletonScope();

    bind(HostedPluginSupport).toSelf().inSingletonScope();
    bind(HostedPluginWatcher).toSelf().inSingletonScope();
    bind(SelectionProviderCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(SelectionProviderCommandContribution);

    bind(OpenUriCommandHandler).toSelf().inSingletonScope();
    bind(PluginApiFrontendContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(PluginApiFrontendContribution);
    bind(TabBarToolbarContribution).toService(PluginApiFrontendContribution);

    bind(EditorModelService).toSelf().inSingletonScope();

    bind(FrontendApplicationContribution).toDynamicValue(ctx => ({
        onStart(): MaybePromise<void> {
            ctx.container.get(HostedPluginSupport).onStart(ctx.container);
        }
    }));
    bind(HostedPluginServer).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        const hostedWatcher = ctx.container.get(HostedPluginWatcher);
        return connection.createProxy<HostedPluginServer>(hostedServicePath, hostedWatcher.getHostedPluginClient());
    }).inSingletonScope();

    bind(PluginPathsService).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<PluginPathsService>(pluginPathsServicePath);
    }).inSingletonScope();

    bindViewContribution(bind, PluginFrontendViewContribution);

    bind(PluginWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: PluginFrontendViewContribution.PLUGINS_WIDGET_FACTORY_ID,
        createWidget: () => ctx.container.get(PluginWidget)
    }));

    bind(PluginServer).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<PluginServer>(pluginServerJsonRpcPath);
    }).inSingletonScope();

    bind(ViewContextKeyService).toSelf().inSingletonScope();

    bindTreeViewDecoratorUtilities(bind);
    bind(PluginTreeViewNodeLabelProvider).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(PluginTreeViewNodeLabelProvider);
    bind(DnDFileContentStore).toSelf().inSingletonScope();
    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: PLUGIN_VIEW_DATA_FACTORY_ID,
        createWidget: (options: TreeViewWidgetOptions) => {
            const props = {
                contextMenuPath: VIEW_ITEM_CONTEXT_MENU,
                expandOnlyOnExpansionToggleClick: true,
                expansionTogglePadding: 22,
                globalSelection: true,
                leftPadding: 8,
                search: true,
                multiSelect: options.multiSelect
            };
            const child = createTreeContainer(container, {
                props,
                tree: PluginTree,
                model: PluginTreeModel,
                widget: TreeViewWidget,
                decoratorService: TreeViewDecoratorService
            });
            child.bind(TreeViewWidgetOptions).toConstantValue(options);
            return child.get(TreeWidget);
        }
    })).inSingletonScope();

    bindWebviewPreferences(bind);
    bind(WebviewEnvironment).toSelf().inSingletonScope();
    bind(WebviewThemeDataProvider).toSelf().inSingletonScope();
    bind(WebviewResourceCache).toSelf().inSingletonScope();
    bind(WebviewWidget).toSelf();
    bind(WebviewWidgetFactory).toDynamicValue(ctx => new WebviewWidgetFactory(ctx.container)).inSingletonScope();
    bind(WidgetFactory).toService(WebviewWidgetFactory);
    bind(WebviewContextKeys).toSelf().inSingletonScope();
    bind(WebviewSecondaryWindowSupport).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(WebviewSecondaryWindowSupport);
    bind(FrontendApplicationContribution).toService(WebviewContextKeys);
    bind(WidgetStatusBarContribution).toConstantValue(noopWidgetStatusBarContribution(WebviewWidget));

    bind(PluginCustomEditorRegistry).toSelf().inSingletonScope();
    bind(CustomEditorService).toSelf().inSingletonScope();
    bind(CustomEditorWidget).toSelf();
    bind(CustomEditorWidgetFactory).toDynamicValue(ctx => new CustomEditorWidgetFactory(ctx.container)).inSingletonScope();
    bind(WidgetFactory).toService(CustomEditorWidgetFactory);
    bind(CustomEditorUndoRedoHandler).toSelf().inSingletonScope();
    bind(UndoRedoHandler).toService(CustomEditorUndoRedoHandler);

    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: CustomEditorWidget.SIDE_BY_SIDE_FACTORY_ID,
        createWidget: (arg: { uri: string, viewType: string }) => {
            const uri = new URI(arg.uri);
            const [leftUri, rightUri] = DiffUris.decode(uri);
            const navigatable: Navigatable = {
                getResourceUri: () => rightUri,
                createMoveToUri: resourceUri => DiffUris.encode(leftUri, rightUri.withPath(resourceUri.path))
            };
            const widget = new SplitWidget({ navigatable });
            widget.id = arg.viewType + '.side-by-side:' + generateUuid();
            const labelProvider = ctx.container.get(LabelProvider);
            widget.title.label = labelProvider.getName(uri);
            widget.title.iconClass = labelProvider.getIcon(uri);
            widget.title.closable = true;
            return widget;
        }
    })).inSingletonScope();

    bind(PluginViewWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: PLUGIN_VIEW_FACTORY_ID,
        createWidget: (identifier: PluginViewWidgetIdentifier) => {
            const child = container.createChild();
            child.bind(PluginViewWidgetIdentifier).toConstantValue(identifier);
            return child.get(PluginViewWidget);
        }
    })).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: PLUGIN_VIEW_CONTAINER_FACTORY_ID,
        createWidget: (identifier: ViewContainerIdentifier) =>
            container.get<ViewContainer.Factory>(ViewContainer.Factory)(identifier)
    })).inSingletonScope();
    bind(PluginSharedStyle).toSelf().inSingletonScope();
    bind(PluginViewRegistry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(PluginViewRegistry);

    bind(PluginIconThemeFactory).toFactory<PluginIconTheme>(({ container }) => (definition: PluginIconThemeDefinition) => {
        const child = container.createChild();
        child.bind(PluginIconThemeDefinition).toConstantValue(definition);
        child.bind(PluginIconTheme).toSelf().inSingletonScope();
        return child.get(PluginIconTheme);
    });
    bind(PluginIconThemeService).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(PluginIconThemeService);

    bind(MenusContributionPointHandler).toSelf().inSingletonScope();
    bind(PluginMenuCommandAdapter).toSelf().inSingletonScope();
    bind(KeybindingsContributionPointHandler).toSelf().inSingletonScope();
    bind(PluginContributionHandler).toSelf().inSingletonScope();

    bind(TextContentResourceResolver).toSelf().inSingletonScope();
    bind(ResourceResolver).toService(TextContentResourceResolver);
    bindContributionProvider(bind, MainPluginApiProvider);

    bind(PluginDebugService).toSelf().inSingletonScope();
    rebind(DebugService).toService(PluginDebugService);
    bind(PluginDebugSessionContributionRegistry).toSelf().inSingletonScope();
    rebind(DebugSessionContributionRegistry).toService(PluginDebugSessionContributionRegistry);

    bind(CommentsService).to(PluginCommentService).inSingletonScope();
    bind(CommentingRangeDecorator).toSelf().inSingletonScope();
    bind(CommentsContribution).toSelf().inSingletonScope();
    bind(CommentsContext).toSelf().inSingletonScope();

    bind(WebviewFrontendSecurityWarnings).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(WebviewFrontendSecurityWarnings);

    bind(PluginIconService).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(PluginIconService);

    bind(PluginAuthenticationServiceImpl).toSelf().inSingletonScope();
    rebind(AuthenticationService).toService(PluginAuthenticationServiceImpl);

    bind(PluginTerminalRegistry).toSelf().inSingletonScope();

    bind(LanguagePackService).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<LanguagePackService>(languagePackServicePath);
    }).inSingletonScope();

    bind(CellOutputWebviewFactory).toFactory(ctx => () =>
        createCellOutputWebviewContainer(ctx.container).get(CellOutputWebviewImpl)
    );
    bindContributionProvider(bind, ArgumentProcessorContribution);

});
