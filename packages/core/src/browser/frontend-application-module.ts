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

import '../../src/browser/style/index.css';
require('../../src/browser/style/materialcolors.css').use();
import 'font-awesome/css/font-awesome.min.css';
import 'file-icons-js/css/style.css';
import '@vscode/codicons/dist/codicon.css';

import { ContainerModule } from 'inversify';
import {
    bindContributionProvider,
    SelectionService,
    ResourceResolver,
    CommandContribution, CommandRegistry, CommandService, commandServicePath,
    MenuModelRegistry, MenuContribution,
    MessageClient,
    InMemoryResources,
    messageServicePath,
    InMemoryTextResourceResolver,
    UntitledResourceResolver,
    MenuPath
} from '../common';
import { KeybindingRegistry, KeybindingContext, KeybindingContribution } from './keybinding';
import { FrontendApplication } from './frontend-application';
import { FrontendApplicationContribution, DefaultFrontendApplicationContribution } from './frontend-application-contribution';
import { DefaultOpenerService, OpenerService, OpenHandler } from './opener-service';
import { HttpOpenHandler } from './http-open-handler';
import { CommonFrontendContribution } from './common-frontend-contribution';
import { LocalStorageService, StorageService } from './storage-service';
import { WidgetFactory, WidgetManager } from './widget-manager';
import {
    ApplicationShell, ApplicationShellOptions, DockPanelRenderer, TabBarRenderer,
    TabBarRendererFactory, ShellLayoutRestorer,
    SidePanelHandler, SidePanelHandlerFactory,
    SidebarMenuWidget, SidebarTopMenuWidgetFactory,
    SplitPositionHandler, DockPanelRendererFactory, ApplicationShellLayoutMigration, ApplicationShellLayoutMigrationError, SidebarBottomMenuWidgetFactory
} from './shell';
import { LabelParser } from './label-parser';
import { LabelProvider, LabelProviderContribution, DefaultUriLabelProviderContribution } from './label-provider';
import { PreferenceService } from './preferences';
import { ContextMenuRenderer, Coordinate } from './context-menu-renderer';
import { ThemeService } from './theming';
import { ConnectionStatusService, FrontendConnectionStatusService, ApplicationConnectionStatusContribution, PingService } from './connection-status-service';
import { DiffUriLabelProviderContribution } from './diff-uris';
import { ApplicationServer, applicationPath } from '../common/application-protocol';
import { WebSocketConnectionProvider } from './messaging';
import { AboutDialog, AboutDialogProps } from './about-dialog';
import { EnvVariablesServer, envVariablesPath, EnvVariable } from './../common/env-variables';
import { FrontendApplicationStateService } from './frontend-application-state';
import { JsonSchemaStore, JsonSchemaContribution, DefaultJsonSchemaContribution, JsonSchemaDataStore } from './json-schema-store';
import { TabBarToolbarRegistry, TabBarToolbarContribution, TabBarToolbarFactory, TabBarToolbar } from './shell/tab-bar-toolbar';
import { bindCorePreferences, CorePreferences } from './core-preferences';
import { ContextKeyService, ContextKeyServiceDummyImpl } from './context-key-service';
import { ResourceContextKey } from './resource-context-key';
import { KeyboardLayoutService } from './keyboard/keyboard-layout-service';
import { MimeService } from './mime-service';
import { ApplicationShellMouseTracker } from './shell/application-shell-mouse-tracker';
import { ViewContainer, ViewContainerIdentifier } from './view-container';
import { QuickViewService } from './quick-input/quick-view-service';
import { DialogOverlayService } from './dialogs';
import { ProgressLocationService } from './progress-location-service';
import { ProgressClient } from '../common/progress-service-protocol';
import { ProgressService } from '../common/progress-service';
import { DispatchingProgressClient } from './progress-client';
import { ProgressStatusBarItem } from './progress-status-bar-item';
import { TabBarDecoratorService, TabBarDecorator } from './shell/tab-bar-decorator';
import { ContextMenuContext } from './menu/context-menu-context';
import { bindResourceProvider, bindMessageService, bindPreferenceService } from './frontend-application-bindings';
import { ColorRegistry } from './color-registry';
import { ColorContribution, ColorApplicationContribution } from './color-application-contribution';
import { ExternalUriService } from './external-uri-service';
import { IconThemeService, NoneIconTheme } from './icon-theme-service';
import { IconThemeApplicationContribution, IconThemeContribution, DefaultFileIconThemeContribution } from './icon-theme-contribution';
import { TreeLabelProvider } from './tree/tree-label-provider';
import { ProgressBar } from './progress-bar';
import { ProgressBarFactory, ProgressBarOptions } from './progress-bar-factory';
import { CommandOpenHandler } from './command-open-handler';
import { LanguageService } from './language-service';
import { EncodingRegistry } from './encoding-registry';
import { EncodingService } from '../common/encoding-service';
import { AuthenticationService, AuthenticationServiceImpl } from '../browser/authentication-service';
import { DecorationsService, DecorationsServiceImpl } from './decorations-service';
import { keyStoreServicePath, KeyStoreService } from '../common/key-store';
import { CredentialsService, CredentialsServiceImpl } from './credentials-service';
import { ContributionFilterRegistry, ContributionFilterRegistryImpl } from '../common/contribution-filter';
import { QuickCommandFrontendContribution } from './quick-input/quick-command-frontend-contribution';
import { QuickPickService, quickPickServicePath } from '../common/quick-pick-service';
import {
    QuickPickServiceImpl,
    QuickInputFrontendContribution,
    QuickAccessContribution,
    QuickCommandService,
    QuickHelpService
} from './quick-input';
import { SidebarBottomMenuWidget } from './shell/sidebar-bottom-menu-widget';
import { WindowContribution } from './window-contribution';
import {
    BreadcrumbID,
    BreadcrumbPopupContainer,
    BreadcrumbPopupContainerFactory,
    BreadcrumbRenderer,
    BreadcrumbsContribution,
    BreadcrumbsRenderer,
    BreadcrumbsRendererFactory,
    BreadcrumbsService,
    DefaultBreadcrumbRenderer,
} from './breadcrumbs';
import { DockPanel, RendererHost } from './widgets';
import { TooltipService, TooltipServiceImpl } from './tooltip-service';
import { BackendRequestService, RequestService, REQUEST_SERVICE_PATH } from '@theia/request';
import { bindFrontendStopwatch, bindBackendStopwatch } from './performance';
import { SaveableService } from './saveable-service';
import { SecondaryWindowHandler } from './secondary-window-handler';
import { UserWorkingDirectoryProvider } from './user-working-directory-provider';
import { WindowTitleService } from './window/window-title-service';
import { WindowTitleUpdater } from './window/window-title-updater';
import { TheiaDockPanel } from './shell/theia-dock-panel';
import { bindStatusBar } from './status-bar';
import { MarkdownRenderer, MarkdownRendererFactory, MarkdownRendererImpl } from './markdown-rendering/markdown-renderer';
import { StylingParticipant, StylingService } from './styling-service';
import { bindCommonStylingParticipants } from './common-styling-participants';
import { HoverService } from './hover-service';
import { AdditionalViewsMenuPath, AdditionalViewsMenuWidget, AdditionalViewsMenuWidgetFactory } from './shell/additional-views-menu-widget';
import { LanguageIconLabelProvider } from './language-icon-provider';
import { bindTreePreferences } from './tree';
import { OpenWithService } from './open-with-service';
import { ViewColumnService } from './shell/view-column-service';
import { DomInputUndoRedoHandler, UndoRedoHandler, UndoRedoHandlerService } from './undo-redo-handler';
import { WidgetStatusBarContribution, WidgetStatusBarService } from './widget-status-bar-service';

export { bindResourceProvider, bindMessageService, bindPreferenceService };

export const frontendApplicationModule = new ContainerModule((bind, _unbind, _isBound, _rebind) => {
    bind(NoneIconTheme).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(NoneIconTheme);
    bind(IconThemeService).toSelf().inSingletonScope();
    bindContributionProvider(bind, IconThemeContribution);
    bind(DefaultFileIconThemeContribution).toSelf().inSingletonScope();
    bind(IconThemeContribution).toService(DefaultFileIconThemeContribution);
    bind(IconThemeApplicationContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(IconThemeApplicationContribution);
    bind(LanguageIconLabelProvider).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(LanguageIconLabelProvider);

    bind(ColorRegistry).toSelf().inSingletonScope();
    bindContributionProvider(bind, ColorContribution);
    bind(ColorApplicationContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ColorApplicationContribution);

    bind(FrontendApplication).toSelf().inSingletonScope();
    bind(FrontendApplicationStateService).toSelf().inSingletonScope();
    bind(DefaultFrontendApplicationContribution).toSelf();
    bindContributionProvider(bind, FrontendApplicationContribution);

    bind(ApplicationShellOptions).toConstantValue({});
    bind(ApplicationShell).toSelf().inSingletonScope();
    bind(SidePanelHandlerFactory).toAutoFactory(SidePanelHandler);
    bind(SidePanelHandler).toSelf();
    bind(SidebarTopMenuWidgetFactory).toAutoFactory(SidebarMenuWidget);
    bind(SidebarMenuWidget).toSelf();
    bind(SidebarBottomMenuWidget).toSelf();
    bind(SidebarBottomMenuWidgetFactory).toAutoFactory(SidebarBottomMenuWidget);
    bind(AdditionalViewsMenuWidget).toSelf();
    bind(AdditionalViewsMenuWidgetFactory).toFactory(ctx => (side: 'left' | 'right') => {
        const childContainer = ctx.container.createChild();
        childContainer.bind<MenuPath>(AdditionalViewsMenuPath).toConstantValue(['additional_views_menu', side]);
        return childContainer.resolve(AdditionalViewsMenuWidget);
    });
    bind(SplitPositionHandler).toSelf().inSingletonScope();

    bindContributionProvider(bind, TabBarToolbarContribution);
    bind(TabBarToolbarRegistry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(TabBarToolbarRegistry);
    bind(TabBarToolbarFactory).toFactory(context => () => {
        const container = context.container.createChild();
        container.bind(TabBarToolbar).toSelf().inSingletonScope();
        return container.get(TabBarToolbar);
    });

    bind(DockPanelRendererFactory).toFactory(context => () => context.container.get(DockPanelRenderer));
    bind(DockPanelRenderer).toSelf();
    bind(TabBarRendererFactory).toFactory(({ container }) => () => {
        const contextMenuRenderer = container.get(ContextMenuRenderer);
        const tabBarDecoratorService = container.get(TabBarDecoratorService);
        const iconThemeService = container.get(IconThemeService);
        const selectionService = container.get(SelectionService);
        const commandService = container.get<CommandService>(CommandService);
        const corePreferences = container.get<CorePreferences>(CorePreferences);
        const hoverService = container.get(HoverService);
        const contextKeyService: ContextKeyService = container.get(ContextKeyService);
        return new TabBarRenderer(contextMenuRenderer, tabBarDecoratorService, iconThemeService,
            selectionService, commandService, corePreferences, hoverService, contextKeyService);
    });
    bind(TheiaDockPanel.Factory).toFactory(({ container }) => (options?: DockPanel.IOptions) => {
        const corePreferences = container.get<CorePreferences>(CorePreferences);
        return new TheiaDockPanel(options, corePreferences);
    });

    bindContributionProvider(bind, TabBarDecorator);
    bind(TabBarDecoratorService).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(TabBarDecoratorService);

    bindContributionProvider(bind, OpenHandler);
    bind(DefaultOpenerService).toSelf().inSingletonScope();
    bind(OpenerService).toService(DefaultOpenerService);

    bind(ExternalUriService).toSelf().inSingletonScope();
    bind(HttpOpenHandler).toSelf().inSingletonScope();
    bind(OpenHandler).toService(HttpOpenHandler);

    bind(CommandOpenHandler).toSelf().inSingletonScope();
    bind(OpenHandler).toService(CommandOpenHandler);

    bind(OpenWithService).toSelf().inSingletonScope();

    bind(TooltipServiceImpl).toSelf().inSingletonScope();
    bind(TooltipService).toService(TooltipServiceImpl);

    bindContributionProvider(bind, ApplicationShellLayoutMigration);
    bind<ApplicationShellLayoutMigration>(ApplicationShellLayoutMigration).toConstantValue({
        layoutVersion: 2.0,
        onWillInflateLayout({ layoutVersion }): void {
            throw ApplicationShellLayoutMigrationError.create(
                `It is not possible to migrate layout of version ${layoutVersion} to version ${this.layoutVersion}.`
            );
        }
    });

    bindContributionProvider(bind, WidgetFactory);
    bind(WidgetManager).toSelf().inSingletonScope();
    bind(ShellLayoutRestorer).toSelf().inSingletonScope();
    bind(CommandContribution).toService(ShellLayoutRestorer);

    bindResourceProvider(bind);
    bind(InMemoryResources).toSelf().inSingletonScope();
    bind(ResourceResolver).toService(InMemoryResources);

    bind(InMemoryTextResourceResolver).toSelf().inSingletonScope();
    bind(ResourceResolver).toService(InMemoryTextResourceResolver);

    bind(UntitledResourceResolver).toSelf().inSingletonScope();
    bind(ResourceResolver).toService(UntitledResourceResolver);

    bind(SelectionService).toSelf().inSingletonScope();
    bind(CommandRegistry).toSelf().inSingletonScope().onActivation(({ container }, registry) => {
        WebSocketConnectionProvider.createHandler(container, commandServicePath, registry);
        return registry;
    });
    bind(CommandService).toService(CommandRegistry);
    bindContributionProvider(bind, CommandContribution);

    bind(ContextKeyService).to(ContextKeyServiceDummyImpl).inSingletonScope();

    bind(MenuModelRegistry).toSelf().inSingletonScope();
    bindContributionProvider(bind, MenuContribution);

    bind(KeyboardLayoutService).toSelf().inSingletonScope();
    bind(KeybindingRegistry).toSelf().inSingletonScope();
    bindContributionProvider(bind, KeybindingContext);
    bindContributionProvider(bind, KeybindingContribution);

    bindMessageService(bind).onActivation(({ container }, messages) => {
        const client = container.get(MessageClient);
        WebSocketConnectionProvider.createHandler(container, messageServicePath, client);
        return messages;
    });

    bind(LanguageService).toSelf().inSingletonScope();

    bind(EncodingService).toSelf().inSingletonScope();
    bind(EncodingRegistry).toSelf().inSingletonScope();

    bind(ResourceContextKey).toSelf().inSingletonScope();
    bind(CommonFrontendContribution).toSelf().inSingletonScope();
    [FrontendApplicationContribution, CommandContribution, KeybindingContribution, MenuContribution, ColorContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(CommonFrontendContribution)
    );

    bindCommonStylingParticipants(bind);

    bind(QuickCommandFrontendContribution).toSelf().inSingletonScope();
    [CommandContribution, KeybindingContribution, MenuContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(QuickCommandFrontendContribution)
    );
    bind(QuickCommandService).toSelf().inSingletonScope();
    bind(QuickAccessContribution).toService(QuickCommandService);

    bind(QuickHelpService).toSelf().inSingletonScope();
    bind(QuickAccessContribution).toService(QuickHelpService);

    bind(QuickPickService).to(QuickPickServiceImpl).inSingletonScope().onActivation(({ container }, quickPickService: QuickPickService) => {
        WebSocketConnectionProvider.createHandler(container, quickPickServicePath, quickPickService);
        return quickPickService;
    });

    bind(MarkdownRenderer).to(MarkdownRendererImpl).inSingletonScope();
    bind(MarkdownRendererFactory).toFactory(({ container }) => () => container.get(MarkdownRenderer));

    bindContributionProvider(bind, QuickAccessContribution);
    bind(QuickInputFrontendContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(QuickInputFrontendContribution);

    bind(LocalStorageService).toSelf().inSingletonScope();
    bind(StorageService).toService(LocalStorageService);

    bindStatusBar(bind);
    bind(LabelParser).toSelf().inSingletonScope();

    bindContributionProvider(bind, LabelProviderContribution);
    bind(LabelProvider).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(LabelProvider);
    bind(DefaultUriLabelProviderContribution).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(DefaultUriLabelProviderContribution);
    bind(LabelProviderContribution).to(DiffUriLabelProviderContribution).inSingletonScope();

    bind(TreeLabelProvider).toSelf().inSingletonScope();
    bind(LabelProviderContribution).toService(TreeLabelProvider);

    bindPreferenceService(bind);
    bind(FrontendApplicationContribution).toService(PreferenceService);

    bindContributionProvider(bind, JsonSchemaContribution);
    bind(JsonSchemaStore).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(JsonSchemaStore);
    bind(JsonSchemaDataStore).toSelf().inSingletonScope();
    bind(DefaultJsonSchemaContribution).toSelf().inSingletonScope();
    bind(JsonSchemaContribution).toService(DefaultJsonSchemaContribution);

    bind(PingService).toDynamicValue(ctx => {
        // let's reuse a simple and cheap service from this package
        const envServer: EnvVariablesServer = ctx.container.get(EnvVariablesServer);
        return {
            ping(): Promise<EnvVariable | undefined> {
                return envServer.getValue('does_not_matter');
            }
        };
    });
    bind(FrontendConnectionStatusService).toSelf().inSingletonScope();
    bind(ConnectionStatusService).toService(FrontendConnectionStatusService);
    bind(ApplicationConnectionStatusContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ApplicationConnectionStatusContribution);

    bind(ApplicationServer).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<ApplicationServer>(applicationPath);
    }).inSingletonScope();

    bind(AboutDialog).toSelf().inSingletonScope();
    bind(AboutDialogProps).toConstantValue({ title: 'Theia' });

    bind(EnvVariablesServer).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<EnvVariablesServer>(envVariablesPath);
    }).inSingletonScope();

    bind(ThemeService).toSelf().inSingletonScope();

    bindCorePreferences(bind);
    bindTreePreferences(bind);

    bind(MimeService).toSelf().inSingletonScope();

    bind(ApplicationShellMouseTracker).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ApplicationShellMouseTracker);

    bind(ViewContainer.Factory).toFactory(context => (options: ViewContainerIdentifier) => {
        const container = context.container.createChild();
        container.bind(ViewContainerIdentifier).toConstantValue(options);
        container.bind(ViewContainer).toSelf().inSingletonScope();
        return container.get(ViewContainer);
    });

    bind(QuickViewService).toSelf().inSingletonScope();
    bind(QuickAccessContribution).toService(QuickViewService);

    bind(DialogOverlayService).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(DialogOverlayService);

    bind(DispatchingProgressClient).toSelf().inSingletonScope();
    bind(ProgressLocationService).toSelf().inSingletonScope();
    bind(ProgressStatusBarItem).toSelf().inSingletonScope();
    bind(ProgressClient).toService(DispatchingProgressClient);
    bind(ProgressService).toSelf().inSingletonScope();
    bind(ProgressBarFactory).toFactory(context => (options: ProgressBarOptions) => {
        const childContainer = context.container.createChild();
        childContainer.bind(ProgressBarOptions).toConstantValue(options);
        childContainer.bind(ProgressBar).toSelf().inSingletonScope();
        return childContainer.get(ProgressBar);
    });

    bind(ContextMenuContext).toSelf().inSingletonScope();

    bind(AuthenticationService).to(AuthenticationServiceImpl).inSingletonScope();
    bind(DecorationsService).to(DecorationsServiceImpl).inSingletonScope();

    bind(KeyStoreService).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<KeyStoreService>(keyStoreServicePath);
    }).inSingletonScope();

    bind(CredentialsService).to(CredentialsServiceImpl);

    bind(ContributionFilterRegistry).to(ContributionFilterRegistryImpl).inSingletonScope();
    bind(WindowContribution).toSelf().inSingletonScope();
    for (const contribution of [CommandContribution, KeybindingContribution, MenuContribution]) {
        bind(contribution).toService(WindowContribution);
    }
    bind(WindowTitleService).toSelf().inSingletonScope();
    bind(WindowTitleUpdater).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(WindowTitleUpdater);
    bindContributionProvider(bind, BreadcrumbsContribution);
    bind(BreadcrumbsService).toSelf().inSingletonScope();
    bind(BreadcrumbsRenderer).toSelf();
    bind(BreadcrumbsRendererFactory).toFactory(ctx =>
        () => {
            const childContainer = ctx.container.createChild();
            childContainer.bind(BreadcrumbRenderer).to(DefaultBreadcrumbRenderer).inSingletonScope();
            return childContainer.get(BreadcrumbsRenderer);
        }
    );
    bind(BreadcrumbPopupContainer).toSelf();
    bind(BreadcrumbPopupContainerFactory).toFactory(({ container }) => (parent: HTMLElement, breadcrumbId: string, position: Coordinate): BreadcrumbPopupContainer => {
        const child = container.createChild();
        child.bind(RendererHost).toConstantValue(parent);
        child.bind(BreadcrumbID).toConstantValue(breadcrumbId);
        child.bind(Coordinate).toConstantValue(position);
        return child.get(BreadcrumbPopupContainer);
    });

    bind(BackendRequestService).toDynamicValue(ctx =>
        WebSocketConnectionProvider.createProxy<RequestService>(ctx.container, REQUEST_SERVICE_PATH)
    ).inSingletonScope();

    bindFrontendStopwatch(bind);
    bindBackendStopwatch(bind);

    bind(SaveableService).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(SaveableService);

    bind(UserWorkingDirectoryProvider).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(UserWorkingDirectoryProvider);

    bind(HoverService).toSelf().inSingletonScope();

    bind(StylingService).toSelf().inSingletonScope();
    bindContributionProvider(bind, StylingParticipant);
    bind(FrontendApplicationContribution).toService(StylingService);

    bind(SecondaryWindowHandler).toSelf().inSingletonScope();
    bind(ViewColumnService).toSelf().inSingletonScope();

    bind(UndoRedoHandlerService).toSelf().inSingletonScope();
    bindContributionProvider(bind, UndoRedoHandler);
    bind(DomInputUndoRedoHandler).toSelf().inSingletonScope();
    bind(UndoRedoHandler).toService(DomInputUndoRedoHandler);

    bind(WidgetStatusBarService).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(WidgetStatusBarService);
    bindContributionProvider(bind, WidgetStatusBarContribution);
});
