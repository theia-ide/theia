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

import { injectable, inject, named } from 'inversify';
import { Widget } from '@lumino/widgets';
import { FrontendApplication } from '../frontend-application';
import { WidgetManager, WidgetConstructionOptions } from '../widget-manager';
import { StorageService } from '../storage-service';
import { ILogger } from '../../common/logger';
import { CommandContribution, CommandRegistry, Command } from '../../common/command';
import { ThemeService } from '../theming';
import { ContributionProvider } from '../../common/contribution-provider';
import { ApplicationShell, applicationShellLayoutVersion, ApplicationShellLayoutVersion } from './application-shell';
import { CommonCommands } from '../common-frontend-contribution';
import { WindowService } from '../window/window-service';
import { StopReason } from '../../common/frontend-application-state';
import { isFunction, isObject, MaybePromise } from '../../common';

/**
 * A contract for widgets that want to store and restore their inner state, between sessions.
 */
export interface StatefulWidget {

    /**
     * Called on unload to store the inner state. Returns 'undefined' if the widget cannot be stored.
     */
    storeState(): object | undefined;

    /**
     * Called when the widget got created by the storage service
     */
    restoreState(oldState: object): void;
}

export namespace StatefulWidget {
    export function is(arg: unknown): arg is StatefulWidget {
        return isObject<StatefulWidget>(arg) && isFunction(arg.storeState) && isFunction(arg.restoreState);
    }
}

export interface WidgetDescription {
    constructionOptions: WidgetConstructionOptions,
    innerWidgetState?: string | object
}

export interface ApplicationShellLayoutMigrationContext {
    /**
     * A resolved version of a current layout.
     */
    layoutVersion: number
    /**
     * A layout to be inflated.
     */
    layout: ApplicationShell.LayoutData
    /**
     * A parent widget is to be inflated. `undefined` if the application shell
     */
    parent?: Widget
}

export interface ApplicationShellLayoutMigrationError extends Error {
    code: 'ApplicationShellLayoutMigrationError'
}
export namespace ApplicationShellLayoutMigrationError {
    const code: ApplicationShellLayoutMigrationError['code'] = 'ApplicationShellLayoutMigrationError';
    export function create(message?: string): ApplicationShellLayoutMigrationError {
        return Object.assign(new Error(
            `Could not migrate layout to version ${applicationShellLayoutVersion}.` + (message ? '\n' + message : '')
        ), { code });
    }
    export function is(error: Error | undefined): error is ApplicationShellLayoutMigrationError {
        return !!error && 'code' in error && error['code'] === code;
    }
}

export const ApplicationShellLayoutMigration = Symbol('ApplicationShellLayoutMigration');
export interface ApplicationShellLayoutMigration {
    /**
     * A target migration version.
     */
    readonly layoutVersion: ApplicationShellLayoutVersion;

    /**
     * A migration can transform layout before it will be inflated.
     *
     * @throws `ApplicationShellLayoutMigrationError` if a layout cannot be migrated,
     * in this case the default layout will be initialized.
     */
    onWillInflateLayout?(context: ApplicationShellLayoutMigrationContext): MaybePromise<void>;

    /**
     * A migration can transform the given description before it will be inflated.
     *
     * @returns a migrated widget description, or `undefined`
     * @throws `ApplicationShellLayoutMigrationError` if a widget description cannot be migrated,
     * in this case the default layout will be initialized.
     */
    onWillInflateWidget?(desc: WidgetDescription, context: ApplicationShellLayoutMigrationContext): MaybePromise<WidgetDescription | undefined>;
}

export const RESET_LAYOUT = Command.toLocalizedCommand({
    id: 'reset.layout',
    category: CommonCommands.VIEW_CATEGORY,
    label: 'Reset Workbench Layout'
}, 'theia/core/resetWorkbenchLayout', CommonCommands.VIEW_CATEGORY_KEY);

@injectable()
export class ShellLayoutRestorer implements CommandContribution {

    protected storageKey = 'layout';
    protected shouldStoreLayout: boolean = true;

    @inject(ContributionProvider) @named(ApplicationShellLayoutMigration) protected readonly migrations: ContributionProvider<ApplicationShellLayoutMigration>;
    @inject(WindowService) protected readonly windowService: WindowService;
    @inject(ThemeService) protected readonly themeService: ThemeService;

    constructor(
        @inject(WidgetManager) protected widgetManager: WidgetManager,
        @inject(ILogger) protected logger: ILogger,
        @inject(StorageService) protected storageService: StorageService) { }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(RESET_LAYOUT, {
            execute: async () => this.resetLayout()
        });
    }

    protected async resetLayout(): Promise<void> {
        if (await this.windowService.isSafeToShutDown(StopReason.Reload)) {
            this.logger.info('>>> Resetting layout...');
            this.shouldStoreLayout = false;
            this.storageService.setData(this.storageKey, undefined);
            this.themeService.reset();
            this.logger.info('<<< The layout has been successfully reset.');
            this.windowService.reload();
        }
    }

    storeLayout(app: FrontendApplication): void {
        if (this.shouldStoreLayout) {
            try {
                this.logger.info('>>> Storing the layout...');
                const layoutData = app.shell.getLayoutData();
                const serializedLayoutData = this.deflate(layoutData);
                this.storageService.setData(this.storageKey, serializedLayoutData);
                this.logger.info('<<< The layout has been successfully stored.');
            } catch (error) {
                this.storageService.setData(this.storageKey, undefined);
                this.logger.error('Error during serialization of layout data', error);
            }
        }
    }

    async restoreLayout(app: FrontendApplication): Promise<boolean> {
        this.logger.info('>>> Restoring the layout state...');
        const serializedLayoutData = await this.storageService.getData<string>(this.storageKey);
        if (serializedLayoutData === undefined) {
            this.logger.info('<<< Nothing to restore.');
            return false;
        }
        const layoutData = await this.inflate(serializedLayoutData);
        await app.shell.setLayoutData(layoutData);
        this.logger.info('<<< The layout has been successfully restored.');
        return true;
    }

    protected isWidgetProperty(propertyName: string): boolean {
        return propertyName === 'widget';
    }

    protected isWidgetsProperty(propertyName: string): boolean {
        return propertyName === 'widgets';
    }

    /**
     * Turns the layout data to a string representation.
     */
    protected deflate(data: object): string {
        return JSON.stringify(data, (property: string, value) => {
            if (this.isWidgetProperty(property)) {
                const description = this.convertToDescription(value as Widget);
                return description;
            } else if (this.isWidgetsProperty(property)) {
                const descriptions: WidgetDescription[] = [];
                for (const widget of (value as Widget[])) {
                    const description = this.convertToDescription(widget);
                    if (description) {
                        descriptions.push(description);
                    }
                }
                return descriptions;
            }
            return value;
        });
    }

    private convertToDescription(widget: Widget): WidgetDescription | undefined {
        const desc = this.widgetManager.getDescription(widget);
        if (desc) {
            if (StatefulWidget.is(widget)) {
                const innerState = widget.storeState();
                return innerState ? {
                    constructionOptions: desc,
                    innerWidgetState: this.deflate(innerState)
                } : undefined;
            } else {
                return {
                    constructionOptions: desc,
                    innerWidgetState: undefined
                };
            }
        }
    }

    /**
     * Creates the layout data from its string representation.
     */
    protected async inflate(layoutData: string): Promise<ApplicationShell.LayoutData> {
        const parseContext = new ShellLayoutRestorer.ParseContext();
        const layout = this.parse<ApplicationShell.LayoutData>(layoutData, parseContext);

        const layoutVersion = Number(layout.version);
        if (typeof layoutVersion !== 'number' || Number.isNaN(layoutVersion)) {
            throw new Error('could not resolve a layout version');
        }
        if (layoutVersion !== applicationShellLayoutVersion) {
            if (layoutVersion < applicationShellLayoutVersion) {
                console.warn(`Layout version ${layoutVersion} is behind current layout version ${applicationShellLayoutVersion}, trying to migrate...`);
            } else {
                console.warn(`Layout version ${layoutVersion} is ahead current layout version ${applicationShellLayoutVersion}, trying to load anyway...`);
            }
            console.info(`Please use '${RESET_LAYOUT.label}' command if the layout looks bogus.`);
        }

        const migrations = this.migrations.getContributions()
            .filter(m => m.layoutVersion > layoutVersion && m.layoutVersion <= applicationShellLayoutVersion)
            .sort((m, m2) => m.layoutVersion - m2.layoutVersion);
        if (migrations.length) {
            console.info(`Found ${migrations.length} migrations from layout version ${layoutVersion} to version ${applicationShellLayoutVersion}, migrating...`);
        }

        const context = { layout, layoutVersion, migrations };
        await this.fireWillInflateLayout(context);
        await parseContext.inflate(context);
        return layout;
    }

    protected async fireWillInflateLayout(context: ShellLayoutRestorer.InflateContext): Promise<void> {
        for (const migration of context.migrations) {
            if (migration.onWillInflateLayout) {
                // don't catch exceptions, if one migration fails all should fail.
                await migration.onWillInflateLayout(context);
            }
        }
    }

    protected parse<T>(layoutData: string, parseContext: ShellLayoutRestorer.ParseContext): T {
        return JSON.parse(layoutData, (property: string, value) => {
            if (this.isWidgetsProperty(property)) {
                const widgets = parseContext.filteredArray();
                const descs = (value as WidgetDescription[]);
                for (let i = 0; i < descs.length; i++) {
                    parseContext.push(async context => {
                        widgets[i] = await this.convertToWidget(descs[i], context);
                    });
                }
                return widgets;
            } else if (isObject(value) && !Array.isArray(value)) {
                const copy: Record<string, unknown> = {};
                for (const p in value) {
                    if (this.isWidgetProperty(p)) {
                        parseContext.push(async context => {
                            copy[p] = await this.convertToWidget(value[p] as WidgetDescription, context);
                        });
                    } else {
                        copy[p] = value[p];
                    }
                }
                return copy;
            }
            return value;
        });
    }

    protected async fireWillInflateWidget(desc: WidgetDescription, context: ShellLayoutRestorer.InflateContext): Promise<WidgetDescription> {
        for (const migration of context.migrations) {
            if (migration.onWillInflateWidget) {
                // don't catch exceptions, if one migration fails all should fail.
                const migrated = await migration.onWillInflateWidget(desc, context);
                if (migrated) {
                    if (isObject(migrated.innerWidgetState)) {
                        // in order to inflate nested widgets
                        migrated.innerWidgetState = JSON.stringify(migrated.innerWidgetState);
                    }
                    desc = migrated;
                }
            }
        }
        return desc;
    }

    protected async convertToWidget(desc: WidgetDescription, context: ShellLayoutRestorer.InflateContext): Promise<Widget | undefined> {
        if (!desc.constructionOptions) {
            return undefined;
        }
        try {
            desc = await this.fireWillInflateWidget(desc, context);
            const widget = await this.widgetManager.getOrCreateWidget(desc.constructionOptions.factoryId, desc.constructionOptions.options);
            if (StatefulWidget.is(widget) && desc.innerWidgetState !== undefined) {
                try {
                    let oldState: object;
                    if (typeof desc.innerWidgetState === 'string') {
                        const parseContext = new ShellLayoutRestorer.ParseContext();
                        oldState = this.parse(desc.innerWidgetState, parseContext);
                        await parseContext.inflate({ ...context, parent: widget });
                    } else {
                        oldState = desc.innerWidgetState;
                    }
                    widget.restoreState(oldState);
                } catch (e) {
                    if (ApplicationShellLayoutMigrationError.is(e)) {
                        throw e;
                    }
                    this.logger.warn(`Couldn't restore widget state for ${widget.id}. Error: ${e} `);
                }
            }
            if (widget.isDisposed) {
                return undefined;
            }
            return widget;
        } catch (e) {
            if (ApplicationShellLayoutMigrationError.is(e)) {
                throw e;
            }
            this.logger.warn(`Couldn't restore widget for ${desc.constructionOptions.factoryId}. Error: ${e} `);
            return undefined;
        }
    }

}

export namespace ShellLayoutRestorer {

    export class ParseContext {
        protected readonly toInflate: Inflate[] = [];
        protected readonly toFilter: Widgets[] = [];

        /**
         * Returns an array, which will be filtered from undefined elements
         * after resolving promises, that create widgets.
         */
        filteredArray(): Widgets {
            const array: Widgets = [];
            this.toFilter.push(array);
            return array;
        }

        push(toInflate: Inflate): void {
            this.toInflate.push(toInflate);
        }

        async inflate(context: InflateContext): Promise<void> {
            const pending: Promise<void>[] = [];
            while (this.toInflate.length) {
                pending.push(this.toInflate.pop()!(context));
            }
            await Promise.all(pending);

            if (this.toFilter.length) {
                this.toFilter.forEach(array => {
                    for (let i = 0; i < array.length; i++) {
                        if (array[i] === undefined) {
                            array.splice(i--, 1);
                        }
                    }
                });
            }
        }
    }

    export type Widgets = (Widget | undefined)[];
    export type Inflate = (context: InflateContext) => Promise<void>;
    export interface InflateContext extends ApplicationShellLayoutMigrationContext {
        readonly migrations: ApplicationShellLayoutMigration[];
    }
}
