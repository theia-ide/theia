// *****************************************************************************
// Copyright (C) 2023 STMicroelectronics and others.
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

import { AbstractViewContribution, FrontendApplicationContribution, ViewContainerTitleOptions, Widget, codicon } from '@theia/core/lib/browser';
import { Command, CommandRegistry, MenuModelRegistry, nls } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { TestItem, TestRunProfileKind, TestService } from '../test-service';
import { ContextKeyService } from '@theia/core/lib/browser/context-key-service';
import { TestTreeWidget } from './test-tree-widget';
import { TabBarToolbarContribution, TabBarToolbarRegistry } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { TestCommandId } from '../constants';
import { NavigationLocationService } from '@theia/editor/lib/browser/navigation/navigation-location-service';
import { NavigationLocation } from '@theia/editor/lib/browser/navigation/navigation-location';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileNavigatorCommands } from '@theia/navigator/lib/browser/file-navigator-commands';
export const PLUGIN_TEST_VIEW_TITLE_MENU = ['plugin_test', 'title'];

export namespace TestViewCommands {
    /**
     * Command which refreshes all test.
     */
    export const REFRESH: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.RefreshTestsAction,
        label: 'Refresh Tests',
        category: 'Test',
        iconClass: codicon('refresh')
    });

    /**
     * Command which cancels the refresh
     */
    export const CANCEL_REFRESH: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.CancelTestRefreshAction,
        label: 'Cancel Test Refresh',
        category: 'Test',
        iconClass: codicon('stop')
    });

    export const RUN_ALL_TESTS: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.RunAllAction,
        label: 'Run All Tests',
        category: 'Test',
        iconClass: codicon('run-all')
    });

    export const DEBUG_ALL_TESTS: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.DebugAllAction,
        label: 'Debug Tests',
        category: 'Test',
        iconClass: codicon('debug-all')
    });

    export const RUN_TEST: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.RunAction,
        label: 'Run Test',
        category: 'Test',
        iconClass: codicon('run')
    });

    export const RUN_TEST_WITH_PROFILE: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.RunUsingProfileAction,
        category: 'Test',
        label: 'Execute using Profile...'
    });

    export const DEBUG_TEST: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.DebugAction,
        label: 'Debug Test',
        category: 'Test',
        iconClass: codicon('debug-alt')
    });

    export const CANCEL_ALL_RUNS: Command = Command.toLocalizedCommand({
        id: 'testing.cancelAllRuns',
        label: 'Cancel All Test Runs',
        category: 'Test',
        iconClass: codicon('debug-stop')
    }, 'theia/test/cancelAllTestRuns', nls.getDefaultKey('Test'));

    export const CANCEL_RUN: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.CancelTestRunAction,
        label: 'Cancel Test Run',
        category: 'Test',
        iconClass: codicon('debug-stop')
    });

    export const GOTO_TEST: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.GoToTest,
        label: 'Go to Test',
        category: 'Test',
        iconClass: codicon('go-to-file')
    });

    export const CONFIGURE_PROFILES: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.ConfigureTestProfilesAction,
        label: 'Configure Test Profiles',
        category: 'Test'
    });

    export const SELECT_DEFAULT_PROFILES: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.SelectDefaultTestProfiles,
        label: 'Select Default Test Profiles...',
        category: 'Test'
    });

    export const CLEAR_ALL_RESULTS: Command = Command.toDefaultLocalizedCommand({
        id: TestCommandId.ClearTestResultsAction,
        label: 'Clear All Results',
        category: 'Test',
        iconClass: codicon('trash')
    });
}

export const TEST_VIEW_CONTEXT_MENU = ['test-view-context-menu'];
export const TEST_VIEW_INLINE_MENU = [...TEST_VIEW_CONTEXT_MENU, 'inline'];

export const TEST_VIEW_CONTAINER_ID = 'test-view-container';
export const TEST_VIEW_CONTAINER_TITLE_OPTIONS: ViewContainerTitleOptions = {
    label: nls.localizeByDefault('Testing'),
    iconClass: codicon('beaker'),
    closeable: true
};

@injectable()
export class TestViewContribution extends AbstractViewContribution<TestTreeWidget> implements
    FrontendApplicationContribution, TabBarToolbarContribution {

    @inject(TestService) protected readonly testService: TestService;
    @inject(ContextKeyService) protected readonly contextKeys: ContextKeyService;
    @inject(NavigationLocationService) navigationService: NavigationLocationService;
    @inject(FileService) fileSystem: FileService;

    constructor() {
        super({
            viewContainerId: TEST_VIEW_CONTAINER_ID,
            widgetId: TestTreeWidget.ID,
            widgetName: nls.localizeByDefault('Test Explorer'),
            defaultWidgetOptions: {
                area: 'left',
                rank: 600,
            }
        });
    }

    async initializeLayout(): Promise<void> {
        await this.openView({ activate: false });
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(TestViewCommands.REFRESH, {
            isEnabled: w => this.withWidget(w, () => !this.testService.isRefreshing),
            isVisible: w => this.withWidget(w, () => !this.testService.isRefreshing),
            execute: () => this.testService.refresh()
        });

        commands.registerCommand(TestViewCommands.CANCEL_REFRESH, {
            isEnabled: w => this.withWidget(w, () => this.testService.isRefreshing),
            isVisible: w => this.withWidget(w, () => this.testService.isRefreshing),
            execute: () => this.testService.cancelRefresh()
        });

        commands.registerCommand(TestViewCommands.RUN_ALL_TESTS, {
            isEnabled: w => this.withWidget(w, () => true),
            isVisible: w => this.withWidget(w, () => true),
            execute: () => this.testService.runAllTests(TestRunProfileKind.Run)
        });

        commands.registerCommand(TestViewCommands.DEBUG_ALL_TESTS, {
            isEnabled: w => this.withWidget(w, () => true),
            isVisible: w => this.withWidget(w, () => true),
            execute: () => this.testService.runAllTests(TestRunProfileKind.Debug)
        });

        commands.registerCommand(TestViewCommands.RUN_TEST, {
            isEnabled: t => TestItem.is(t),
            isVisible: t => TestItem.is(t),
            execute: t => {
                this.testService.runTests(TestRunProfileKind.Run, [t]);
            }
        });

        commands.registerCommand(TestViewCommands.SELECT_DEFAULT_PROFILES, {
            isEnabled: t => TestItem.is(t),
            isVisible: t => TestItem.is(t),
            execute: () => {
                this.testService.selectDefaultProfile();
            }
        });

        commands.registerCommand(TestViewCommands.DEBUG_TEST, {
            isEnabled: t => TestItem.is(t),
            isVisible: t => TestItem.is(t),
            execute: t => {
                this.testService.runTests(TestRunProfileKind.Debug, [t]);
            }
        });

        commands.registerCommand(TestViewCommands.RUN_TEST_WITH_PROFILE, {
            isEnabled: t => TestItem.is(t),
            isVisible: t => TestItem.is(t),
            execute: t => {
                this.testService.runTestsWithProfile([t]);
            }
        });

        commands.registerCommand(TestViewCommands.CANCEL_ALL_RUNS, {
            isEnabled: w => this.withWidget(w, () => true),
            isVisible: w => this.withWidget(w, () => true),
            execute: () => this.cancelAllRuns()
        });

        commands.registerCommand(TestViewCommands.GOTO_TEST, {
            isEnabled: t => TestItem.is(t) && !!t.uri,
            isVisible: t => TestItem.is(t) && !!t.uri,
            execute: t => {
                if (TestItem.is(t)) {
                    this.fileSystem.resolve(t.uri!).then(stat => {
                        if (stat.isFile) {
                            this.navigationService.reveal(NavigationLocation.create(t.uri!, t.range ? t.range.start : { line: 0, character: 0 }));
                        } else {
                            commands.executeCommand(FileNavigatorCommands.REVEAL_IN_NAVIGATOR.id, t.uri!);
                        }
                    });
                }
            }
        });

        commands.registerCommand(TestViewCommands.CONFIGURE_PROFILES, {
            execute: () => {
                this.testService.configureProfile();
            }
        });
    }

    protected cancelAllRuns(): void {
        this.testService.getControllers().forEach(controller => controller.testRuns.forEach(run => run.cancel()));
    }

    override registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
        menus.registerMenuAction(TEST_VIEW_INLINE_MENU, {
            commandId: TestViewCommands.RUN_TEST.id,
            order: 'a'
        });
        menus.registerMenuAction(TEST_VIEW_INLINE_MENU, {
            commandId: TestViewCommands.DEBUG_TEST.id,
            order: 'aa'
        });
        menus.registerMenuAction(TEST_VIEW_INLINE_MENU, {
            commandId: TestViewCommands.GOTO_TEST.id,
            order: 'aaa'
        });

        menus.registerMenuAction(TEST_VIEW_CONTEXT_MENU, {
            commandId: TestViewCommands.RUN_TEST_WITH_PROFILE.id,
            order: 'aaaa'
        });

        menus.registerMenuAction(TEST_VIEW_CONTEXT_MENU, {
            commandId: TestViewCommands.SELECT_DEFAULT_PROFILES.id,
            order: 'aaaaa'
        });

        menus.registerSubmenu([...PLUGIN_TEST_VIEW_TITLE_MENU, TestViewCommands.RUN_ALL_TESTS.id], '', {
            contextKeyOverlay: {
                'testing.profile.context.group': 'run'
            }
        });

        menus.registerSubmenu([...PLUGIN_TEST_VIEW_TITLE_MENU, TestViewCommands.DEBUG_ALL_TESTS.id], '', {
            contextKeyOverlay: {
                'testing.profile.context.group': 'debug'
            }
        });
    }

    registerToolbarItems(toolbar: TabBarToolbarRegistry): void {
        toolbar.registerItem({
            id: TestViewCommands.REFRESH.id,
            command: TestViewCommands.REFRESH.id,
            priority: 0,
            onDidChange: this.testService.onDidChangeIsRefreshing
        });

        toolbar.registerItem({
            id: TestViewCommands.CANCEL_REFRESH.id,
            command: TestViewCommands.CANCEL_REFRESH.id,
            priority: 0,
            onDidChange: this.testService.onDidChangeIsRefreshing
        });

        toolbar.registerItem({
            id: TestViewCommands.RUN_ALL_TESTS.id,
            command: TestViewCommands.RUN_ALL_TESTS.id,
            menuPath: PLUGIN_TEST_VIEW_TITLE_MENU,
            priority: 1,
            isVisible(widget): boolean {
                return widget instanceof TestTreeWidget && widget.id === TestTreeWidget.ID;
            }
        });

        toolbar.registerItem({
            id: TestViewCommands.DEBUG_ALL_TESTS.id,
            command: TestViewCommands.DEBUG_ALL_TESTS.id,
            menuPath: PLUGIN_TEST_VIEW_TITLE_MENU,
            priority: 2,
            isVisible(widget): boolean {
                return widget instanceof TestTreeWidget && widget.id === TestTreeWidget.ID;
            }
        });

        toolbar.registerItem({
            id: TestViewCommands.CANCEL_ALL_RUNS.id,
            command: TestViewCommands.CANCEL_ALL_RUNS.id,
            priority: 3
        });

    }

    protected withWidget<T>(widget: Widget | undefined = this.tryGetWidget(), cb: (widget: TestTreeWidget) => T): T | false {
        if (widget instanceof TestTreeWidget && widget.id === TestTreeWidget.ID) {
            return cb(widget);
        }
        return false;
    }
}
