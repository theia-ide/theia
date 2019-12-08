/********************************************************************************
 * Copyright (C) 2017 Ericsson and others.
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

import { ApplicationShell, FrontendApplication, WidgetManager } from '@theia/core/lib/browser';
import { open, OpenerService } from '@theia/core/lib/browser/opener-service';
import { ILogger, CommandService } from '@theia/core/lib/common';
import { MessageService } from '@theia/core/lib/common/message-service';
import { Deferred } from '@theia/core/lib/common/promise-util';
import { QuickPickItem, QuickPickService } from '@theia/core/lib/common/quick-pick-service';
import { LabelProvider } from '@theia/core/lib/browser/label-provider';
import URI from '@theia/core/lib/common/uri';
import { EditorManager } from '@theia/editor/lib/browser';
import { ProblemManager } from '@theia/markers/lib/browser/problem/problem-manager';
import { TerminalService } from '@theia/terminal/lib/browser/base/terminal-service';
import { TerminalWidget } from '@theia/terminal/lib/browser/base/terminal-widget';
import { TerminalWidgetFactoryOptions, TERMINAL_WIDGET_FACTORY_ID } from '@theia/terminal/lib/browser/terminal-widget-impl';
import { VariableResolverService } from '@theia/variable-resolver/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { inject, injectable, named, postConstruct } from 'inversify';
import { Range } from 'vscode-languageserver-types';
import {
    NamedProblemMatcher,
    ProblemMatchData,
    ProblemMatcher,
    RunTaskOption,
    TaskConfiguration,
    TaskCustomization,
    TaskExitedEvent,
    TaskInfo,
    TaskOutputProcessedEvent,
    TaskServer
} from '../common';
import { TaskWatcher } from '../common/task-watcher';
import { ProvidedTaskConfigurations } from './provided-task-configurations';
import { TaskConfigurationClient, TaskConfigurations } from './task-configurations';
import { TaskProviderRegistry, TaskResolverRegistry } from './task-contribution';
import { TaskDefinitionRegistry } from './task-definition-registry';
import { TaskNameResolver } from './task-name-resolver';
import { TaskSourceResolver } from './task-source-resolver';
import { ProblemMatcherRegistry } from './task-problem-matcher-registry';
import { TaskSchemaUpdater } from './task-schema-updater';
import { TaskConfigurationManager } from './task-configuration-manager';
import { PROBLEMS_WIDGET_ID, ProblemWidget } from '@theia/markers/lib/browser/problem/problem-widget';

export interface QuickPickProblemMatcherItem {
    problemMatchers: NamedProblemMatcher[] | undefined;
    learnMore?: boolean;
}

@injectable()
export class TaskService implements TaskConfigurationClient {

    /**
     * The last executed task.
     */
    protected lastTask: { source: string, taskLabel: string } | undefined = undefined;
    protected cachedRecentTasks: TaskConfiguration[] = [];
    protected runningTasks = new Map<number, {
        exitCode: Deferred<number | undefined>,
        terminateSignal: Deferred<string | undefined>
    }>();

    @inject(FrontendApplication)
    protected readonly app: FrontendApplication;

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(TaskServer)
    protected readonly taskServer: TaskServer;

    @inject(ILogger) @named('task')
    protected readonly logger: ILogger;

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    @inject(TaskWatcher)
    protected readonly taskWatcher: TaskWatcher;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(TaskConfigurations)
    protected readonly taskConfigurations: TaskConfigurations;

    @inject(ProvidedTaskConfigurations)
    protected readonly providedTaskConfigurations: ProvidedTaskConfigurations;

    @inject(VariableResolverService)
    protected readonly variableResolverService: VariableResolverService;

    @inject(TaskResolverRegistry)
    protected readonly taskResolverRegistry: TaskResolverRegistry;

    @inject(TerminalService)
    protected readonly terminalService: TerminalService;

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;

    @inject(ProblemManager)
    protected readonly problemManager: ProblemManager;

    @inject(TaskDefinitionRegistry)
    protected readonly taskDefinitionRegistry: TaskDefinitionRegistry;

    @inject(ProblemMatcherRegistry)
    protected readonly problemMatcherRegistry: ProblemMatcherRegistry;

    @inject(QuickPickService)
    protected readonly quickPick: QuickPickService;

    @inject(OpenerService)
    protected readonly openerService: OpenerService;

    @inject(TaskNameResolver)
    protected readonly taskNameResolver: TaskNameResolver;

    @inject(TaskSourceResolver)
    protected readonly taskSourceResolver: TaskSourceResolver;

    @inject(TaskSchemaUpdater)
    protected readonly taskSchemaUpdater: TaskSchemaUpdater;

    @inject(TaskConfigurationManager)
    protected readonly taskConfigurationManager: TaskConfigurationManager;

    @inject(CommandService)
    protected readonly commands: CommandService;

    @inject(LabelProvider)
    protected readonly labelProvider: LabelProvider;
    /**
     * @deprecated To be removed in 0.5.0
     */
    @inject(TaskProviderRegistry)
    protected readonly taskProviderRegistry: TaskProviderRegistry;

    @postConstruct()
    protected init(): void {
        this.getRunningTasks().then(tasks =>
            tasks.forEach(task => {
                if (!this.runningTasks.has(task.taskId)) {
                    this.runningTasks.set(task.taskId, { exitCode: new Deferred<number | undefined>(), terminateSignal: new Deferred<string | undefined>() });
                }
            }));

        // notify user that task has started
        this.taskWatcher.onTaskCreated((event: TaskInfo) => {
            if (!this.isEventForThisClient(event.ctx)) {
                return;
            }
            this.runningTasks.set(event.taskId, { exitCode: new Deferred<number | undefined>(), terminateSignal: new Deferred<string | undefined>() });
            const taskConfig = event.config;
            const taskIdentifier = taskConfig ? this.getTaskIdentifier(taskConfig) : event.taskId.toString();
            this.messageService.info(`Task '${taskIdentifier}' has been started.`);
        });

        this.taskWatcher.onOutputProcessed((event: TaskOutputProcessedEvent) => {
            if (!this.isEventForThisClient(event.ctx)) {
                return;
            }
            if (event.problems) {
                event.problems.forEach(problem => {
                    const existingMarkers = this.problemManager.findMarkers({ owner: problem.description.owner });
                    const uris = new Set<string>();
                    existingMarkers.forEach(marker => uris.add(marker.uri));
                    if (ProblemMatchData.is(problem) && problem.resource) {
                        const uri = new URI(problem.resource.path).withScheme(problem.resource.scheme);
                        if (uris.has(uri.toString())) {
                            const newData = [
                                ...existingMarkers
                                    .filter(marker => marker.uri === uri.toString())
                                    .map(markerData => markerData.data),
                                problem.marker
                            ];
                            this.problemManager.setMarkers(uri, problem.description.owner, newData);
                        } else {
                            this.problemManager.setMarkers(uri, problem.description.owner, [problem.marker]);
                        }
                    } else { // should have received an event for finding the "background task begins" pattern
                        uris.forEach(uriString => this.problemManager.setMarkers(new URI(uriString), problem.description.owner, []));
                    }
                });
            }
        });

        // notify user that task has finished
        this.taskWatcher.onTaskExit((event: TaskExitedEvent) => {
            if (!this.isEventForThisClient(event.ctx)) {
                return;
            }
            if (!this.runningTasks.has(event.taskId)) {
                this.runningTasks.set(event.taskId, { exitCode: new Deferred<number | undefined>(), terminateSignal: new Deferred<string | undefined>() });
            }
            this.runningTasks.get(event.taskId)!.exitCode.resolve(event.code);
            this.runningTasks.get(event.taskId)!.terminateSignal.resolve(event.signal);
            setTimeout(() => this.runningTasks.delete(event.taskId), 60 * 1000);

            const taskConfig = event.config;
            const taskIdentifier = taskConfig ? this.getTaskIdentifier(taskConfig) : event.taskId.toString();
            if (event.code !== undefined) {
                const message = `Task '${taskIdentifier}' has exited with code ${event.code}.`;
                if (event.code === 0) {
                    this.messageService.info(message);
                } else {
                    this.messageService.error(message);
                }
            } else if (event.signal !== undefined) {
                this.messageService.info(`Task '${taskIdentifier}' was terminated by signal ${event.signal}.`);
            } else {
                console.error('Invalid TaskExitedEvent received, neither code nor signal is set.');
            }
        });
    }

    private getTaskIdentifier(taskConfig: TaskConfiguration): string {
        const taskName = this.taskNameResolver.resolve(taskConfig);
        const sourceStrUri = this.taskSourceResolver.resolve(taskConfig);
        return `${taskName} (${this.labelProvider.getName(new URI(sourceStrUri))})`;
    }

    /** Returns an array of the task configurations configured in tasks.json and provided by the extensions. */
    async getTasks(): Promise<TaskConfiguration[]> {
        const configuredTasks = await this.getConfiguredTasks();
        const providedTasks = await this.getProvidedTasks();
        const notCustomizedProvidedTasks = providedTasks.filter(provided =>
            !configuredTasks.some(configured => this.taskDefinitionRegistry.compareTasks(configured, provided))
        );
        return [...configuredTasks, ...notCustomizedProvidedTasks];
    }

    /** Returns an array of the valid task configurations which are configured in tasks.json files */
    async getConfiguredTasks(): Promise<TaskConfiguration[]> {
        const invalidTaskConfig = this.taskConfigurations.getInvalidTaskConfigurations()[0];
        if (invalidTaskConfig) {
            const widget = <ProblemWidget>await this.widgetManager.getOrCreateWidget(PROBLEMS_WIDGET_ID);
            const isProblemsWidgetVisible = widget && widget.isVisible;
            const currentEditorUri = this.editorManager.currentEditor && this.editorManager.currentEditor.editor.getResourceUri();
            let isInvalidTaskConfigFileOpen = false;
            if (currentEditorUri) {
                const folderUri = this.workspaceService.getWorkspaceRootUri(currentEditorUri);
                if (folderUri && folderUri.toString() === invalidTaskConfig._scope) {
                    isInvalidTaskConfigFileOpen = true;
                }
            }
            const warningMessage = 'Invalid task configurations are found. Open tasks.json and find details in the Problems view.';
            if (!isProblemsWidgetVisible || !isInvalidTaskConfigFileOpen) {
                this.messageService.warn(warningMessage, 'Open').then(actionOpen => {
                    if (actionOpen) {
                        if (invalidTaskConfig && invalidTaskConfig._scope) {
                            this.taskConfigurationManager.openConfiguration(invalidTaskConfig._scope);
                        }
                        if (!isProblemsWidgetVisible) {
                            this.commands.executeCommand('problemsView:toggle');
                        }
                    }
                });
            } else {
                this.messageService.warn(warningMessage);
            }
        }

        const validTaskConfigs = await this.taskConfigurations.getTasks();
        return validTaskConfigs;
    }

    /** Returns an array of the task configurations which are provided by the extensions. */
    getProvidedTasks(): Promise<TaskConfiguration[]> {
        return this.providedTaskConfigurations.getTasks();
    }

    addRecentTasks(tasks: TaskConfiguration | TaskConfiguration[]): void {
        if (Array.isArray(tasks)) {
            tasks.forEach(task => this.addRecentTasks(task));
        } else {
            const ind = this.cachedRecentTasks.findIndex(recent => this.taskDefinitionRegistry.compareTasks(recent, tasks));
            if (ind >= 0) {
                this.cachedRecentTasks.splice(ind, 1);
            }
            this.cachedRecentTasks.unshift(tasks);
        }
    }

    get recentTasks(): TaskConfiguration[] {
        return this.cachedRecentTasks;
    }

    set recentTasks(recent: TaskConfiguration[]) {
        this.cachedRecentTasks = recent;
    }

    /**
     * Clears the list of recently used tasks.
     */
    clearRecentTasks(): void {
        this.cachedRecentTasks = [];
    }

    /**
     * Returns a task configuration provided by an extension by task source and label.
     * If there are no task configuration, returns undefined.
     */
    async getProvidedTask(source: string, label: string, scope?: string): Promise<TaskConfiguration | undefined> {
        return this.providedTaskConfigurations.getTask(source, label, scope);
    }

    /** Returns an array of running tasks 'TaskInfo' objects */
    getRunningTasks(): Promise<TaskInfo[]> {
        return this.taskServer.getTasks(this.getContext());
    }

    /** Returns an array of task types that are registered, including the default types */
    getRegisteredTaskTypes(): Promise<string[]> {
        return this.taskSchemaUpdater.getRegisteredTaskTypes();
    }

    /**
     * Get the last executed task.
     *
     * @returns the last executed task or `undefined`.
     */
    getLastTask(): { source: string, taskLabel: string } | undefined {
        return this.lastTask;
    }

    /**
     * Runs a task, by task configuration label.
     * Note, it looks for a task configured in tasks.json only.
     */
    async runConfiguredTask(source: string, taskLabel: string): Promise<void> {
        const task = this.taskConfigurations.getTask(source, taskLabel);
        if (!task) {
            this.logger.error(`Can't get task launch configuration for label: ${taskLabel}`);
            return;
        }

        this.run(source, taskLabel);
    }

    /**
     * Run the last executed task.
     */
    async runLastTask(): Promise<TaskInfo | undefined> {
        if (!this.lastTask) {
            return;
        }
        const { source, taskLabel } = this.lastTask;
        return this.run(source, taskLabel);
    }

    /**
     * Runs a task, by the source and label of the task configuration.
     * It looks for configured and detected tasks.
     */
    async run(source: string, taskLabel: string, scope?: string): Promise<TaskInfo | undefined> {
        let task = await this.getProvidedTask(source, taskLabel, scope);
        if (!task) { // if a detected task cannot be found, search from tasks.json
            task = this.taskConfigurations.getTask(source, taskLabel);
            if (!task) {
                this.logger.error(`Can't get task launch configuration for label: ${taskLabel}`);
                return;
            }
        }
        const customizationObject = await this.getTaskCustomization(task);

        if (!customizationObject.problemMatcher) {
            // ask the user what s/he wants to use to parse the task output
            const items = this.getCustomizeProblemMatcherItems();
            const selected = await this.quickPick.show(items, {
                placeholder: 'Select for which kind of errors and warnings to scan the task output'
            });
            if (selected) {
                if (selected.problemMatchers) {
                    let matcherNames: string[] = [];
                    if (selected.problemMatchers && selected.problemMatchers.length === 0) { // never parse output for this task
                        matcherNames = [];
                    } else if (selected.problemMatchers && selected.problemMatchers.length > 0) { // continue with user-selected parser
                        matcherNames = selected.problemMatchers.map(matcher => matcher.name);
                    }
                    customizationObject.problemMatcher = matcherNames;

                    // write the selected matcher (or the decision of "never parse") into the `tasks.json`
                    this.updateTaskConfiguration(task, { problemMatcher: matcherNames });
                } else if (selected.learnMore) { // user wants to learn more about parsing task output
                    open(this.openerService, new URI('https://code.visualstudio.com/docs/editor/tasks#_processing-task-output-with-problem-matchers'));
                }
                // else, continue the task with no parser
            } else { // do not start the task in case that the user did not select any item from the list
                return;
            }
        }

        const resolvedMatchers = await this.resolveProblemMatchers(task, customizationObject);
        return this.runTask(task, {
            customization: { ...customizationObject, ...{ problemMatcher: resolvedMatchers } }
        });
    }

    async runTask(task: TaskConfiguration, option?: RunTaskOption): Promise<TaskInfo | undefined> {
        const runningTasksInfo: TaskInfo[] = await this.getRunningTasks();

        // check if the task is active
        const matchedRunningTaskInfo = runningTasksInfo.find(taskInfo => {
            const taskConfig = taskInfo.config;
            return this.taskDefinitionRegistry.compareTasks(taskConfig, task);
        });
        if (matchedRunningTaskInfo) { // the task is active
            const taskName = this.taskNameResolver.resolve(task);
            const terminalId = matchedRunningTaskInfo.terminalId;
            if (terminalId) {
                const terminal = this.terminalService.getById(this.getTerminalWidgetId(terminalId));
                if (terminal) {
                    this.shell.activateWidget(terminal.id); // make the terminal visible and assign focus
                }
            }
            const selectedAction = await this.messageService.info(`The task '${taskName}' is already active`, 'Terminate Task', 'Restart Task');
            if (selectedAction === 'Terminate Task') {
                await this.terminateTask(matchedRunningTaskInfo);
            } else if (selectedAction === 'Restart Task') {
                return this.restartTask(matchedRunningTaskInfo, option);
            }
        } else { // run task as the task is not active
            return this.doRunTask(task, option);
        }
    }

    /**
     * Terminates a task that is actively running.
     * @param activeTaskInfo the TaskInfo of the task that is actively running
     */
    protected async terminateTask(activeTaskInfo: TaskInfo): Promise<void> {
        const taskId = activeTaskInfo.taskId;
        return this.kill(taskId);
    }

    /**
     * Terminates a task that is actively running, and restarts it.
     * @param activeTaskInfo the TaskInfo of the task that is actively running
     */
    protected async restartTask(activeTaskInfo: TaskInfo, option?: RunTaskOption): Promise<TaskInfo | undefined> {
        await this.terminateTask(activeTaskInfo);
        return this.doRunTask(activeTaskInfo.config, option);
    }

    protected async doRunTask(task: TaskConfiguration, option?: RunTaskOption): Promise<TaskInfo | undefined> {
        if (option && option.customization) {
            const taskDefinition = this.taskDefinitionRegistry.getDefinition(task);
            if (taskDefinition) { // use the customization object to override the task config
                Object.keys(option.customization).forEach(customizedProperty => {
                    // properties used to define the task cannot be customized
                    if (customizedProperty !== 'type' && !taskDefinition.properties.all.some(pDefinition => pDefinition === customizedProperty)) {
                        task[customizedProperty] = option.customization![customizedProperty];
                    }
                });
            }
        }

        const resolvedTask = await this.getResolvedTask(task);
        if (resolvedTask) {
            // remove problem markers from the same source before running the task
            await this.removeProblemMarks(option);
            return this.runResolvedTask(resolvedTask, option);
        }
    }

    async runTaskByLabel(taskLabel: string): Promise<TaskInfo | undefined> {
        const tasks: TaskConfiguration[] = await this.getTasks();
        for (const task of tasks) {
            if (task.label === taskLabel) {
                return this.runTask(task);
            }
        }

        return;
    }

    async runWorkspaceTask(workspaceFolderUri: string | undefined, taskName: string): Promise<TaskInfo | undefined> {
        const tasks = await this.getWorkspaceTasks(workspaceFolderUri);
        const task = tasks.filter(t => taskName === this.taskNameResolver.resolve(t))[0];
        if (!task) {
            return undefined;
        }

        const taskCustomization = await this.getTaskCustomization(task);
        const resolvedMatchers = await this.resolveProblemMatchers(task, taskCustomization);

        return this.runTask(task, {
            customization: { ...taskCustomization, ...{ problemMatcher: resolvedMatchers } }
        });
    }

    /**
     * Updates the task configuration in the `tasks.json`.
     * The task config, together with updates, will be written into the `tasks.json` if it is not found in the file.
     *
     * @param task task that the updates will be applied to
     * @param update the updates to be appplied
     */
    // tslint:disable-next-line:no-any
    async updateTaskConfiguration(task: TaskConfiguration, update: { [name: string]: any }): Promise<void> {
        if (update.problemMatcher) {
            if (Array.isArray(update.problemMatcher)) {
                update.problemMatcher.forEach((name, index) => {
                    if (!name.startsWith('$')) {
                        update.problemMatcher[index] = `$${update.problemMatcher[index]}`;
                    }
                });
            } else if (!update.problemMatcher.startsWith('$')) {
                update.problemMatcher = `$${update.problemMatcher}`;
            }
        }
        this.taskConfigurations.updateTaskConfig(task, update);
    }

    protected async getWorkspaceTasks(workspaceFolderUri: string | undefined): Promise<TaskConfiguration[]> {
        const tasks = await this.getTasks();
        return tasks.filter(t => t._scope === workspaceFolderUri || t._scope === undefined);
    }

    protected async resolveProblemMatchers(task: TaskConfiguration, customizationObject: TaskCustomization): Promise<ProblemMatcher[] | undefined> {
        const notResolvedMatchers = customizationObject.problemMatcher ?
            (Array.isArray(customizationObject.problemMatcher) ? customizationObject.problemMatcher : [customizationObject.problemMatcher]) : undefined;
        let resolvedMatchers: ProblemMatcher[] | undefined = [];
        if (notResolvedMatchers) {
            // resolve matchers before passing them to the server
            for (const matcher of notResolvedMatchers) {
                let resolvedMatcher: ProblemMatcher | undefined;
                await this.problemMatcherRegistry.onReady();
                if (typeof matcher === 'string') {
                    resolvedMatcher = this.problemMatcherRegistry.get(matcher);
                } else {
                    resolvedMatcher = await this.problemMatcherRegistry.getProblemMatcherFromContribution(matcher);
                }
                if (resolvedMatcher) {
                    const scope = task._scope || task._source;
                    if (resolvedMatcher.filePrefix && scope) {
                        const options = {
                            context: new URI(scope).withScheme('file'),
                            configurationSection: 'tasks'
                        };
                        const resolvedPrefix = await this.variableResolverService.resolve(resolvedMatcher.filePrefix, options);
                        Object.assign(resolvedMatcher, { filePrefix: resolvedPrefix });
                    }
                    resolvedMatchers.push(resolvedMatcher);
                }
            }
        } else {
            resolvedMatchers = undefined;
        }
        return resolvedMatchers;
    }

    protected async getTaskCustomization(task: TaskConfiguration): Promise<TaskCustomization> {
        const customizationObject: TaskCustomization = { type: '' };
        const customizationFound = this.taskConfigurations.getCustomizationForTask(task);
        if (customizationFound) {
            Object.assign(customizationObject, customizationFound);
        } else {
            Object.assign(customizationObject, {
                type: task.type,
                problemMatcher: task.problemMatcher
            });
        }
        return customizationObject;
    }

    private async removeProblemMarks(option?: RunTaskOption): Promise<void> {
        if (option && option.customization) {
            const matchersFromOption = option.customization.problemMatcher || [];
            for (const matcher of matchersFromOption) {
                if (matcher && matcher.owner) {
                    const existingMarkers = this.problemManager.findMarkers({ owner: matcher.owner });
                    const uris = new Set<string>();
                    existingMarkers.forEach(marker => uris.add(marker.uri));
                    uris.forEach(uriString => this.problemManager.setMarkers(new URI(uriString), matcher.owner, []));
                }
            }
        }
    }

    private async getResolvedTask(task: TaskConfiguration): Promise<TaskConfiguration | undefined> {
        const resolver = await this.taskResolverRegistry.getResolver(task.type);
        try {
            const resolvedTask = resolver ? await resolver.resolveTask(task) : task;
            this.addRecentTasks(task);
            return resolvedTask;
        } catch (error) {
            const errMessage = `Error resolving task '${task.label}': ${error}`;
            this.logger.error(errMessage);
            this.messageService.error(errMessage);
        }
    }

    /**
     * Runs the resolved task and opens terminal widget if the task is based on a terminal process
     * @param resolvedTask the resolved task
     * @param option options to run the resolved task
     */
    private async runResolvedTask(resolvedTask: TaskConfiguration, option?: RunTaskOption): Promise<TaskInfo | undefined> {
        const source = resolvedTask._source;
        const taskLabel = resolvedTask.label;
        try {
            const taskInfo = await this.taskServer.run(resolvedTask, this.getContext(), option);
            this.lastTask = { source, taskLabel };
            this.logger.debug(`Task created. Task id: ${taskInfo.taskId}`);

            /**
             * open terminal widget if the task is based on a terminal process (type: 'shell' or 'process')
             *
             * @todo Use a different mechanism to determine if the task should be attached?
             *       Reason: Maybe a new task type wants to also be displayed in a terminal.
             */
            if (typeof taskInfo.terminalId === 'number') {
                this.attach(taskInfo.terminalId, taskInfo.taskId);
            }
            return taskInfo;
        } catch (error) {
            const errorStr = `Error launching task '${taskLabel}': ${error.message}`;
            this.logger.error(errorStr);
            this.messageService.error(errorStr);
        }
    }

    private getCustomizeProblemMatcherItems(): QuickPickItem<QuickPickProblemMatcherItem>[] {
        const items: QuickPickItem<QuickPickProblemMatcherItem>[] = [];
        items.push({
            label: 'Continue without scanning the task output',
            value: { problemMatchers: undefined }
        });
        items.push({
            label: 'Never scan the task output',
            value: { problemMatchers: [] }
        });
        items.push({
            label: 'Learn more about scanning the task output',
            value: { problemMatchers: undefined, learnMore: true }
        });
        items.push({ type: 'separator', label: 'registered parsers' });

        const registeredProblemMatchers = this.problemMatcherRegistry.getAll();
        items.push(...registeredProblemMatchers.map(matcher =>
            ({
                label: matcher.label,
                value: { problemMatchers: [matcher] },
                description: matcher.name.startsWith('$') ? matcher.name : `$${matcher.name}`
            })
        ));
        return items;
    }

    /**
     * Run selected text in the last active terminal.
     */
    async runSelectedText(): Promise<void> {
        if (!this.editorManager.currentEditor) { return; }
        const startLine = this.editorManager.currentEditor.editor.selection.start.line;
        const startCharacter = this.editorManager.currentEditor.editor.selection.start.character;
        const endLine = this.editorManager.currentEditor.editor.selection.end.line;
        const endCharacter = this.editorManager.currentEditor.editor.selection.end.character;
        let selectedRange: Range = Range.create(startLine, startCharacter, endLine, endCharacter);
        // if no text is selected, default to selecting entire line
        if (startLine === endLine && startCharacter === endCharacter) {
            selectedRange = Range.create(startLine, 0, endLine + 1, 0);
        }
        const selectedText: string = this.editorManager.currentEditor.editor.document.getText(selectedRange).trimRight() + '\n';
        let terminal = this.terminalService.currentTerminal;
        if (!terminal) {
            terminal = <TerminalWidget>await this.terminalService.newTerminal(<TerminalWidgetFactoryOptions>{ created: new Date().toString() });
            await terminal.start();
            this.terminalService.activateTerminal(terminal);
        }
        terminal.sendText(selectedText);
    }

    async attach(processId: number, taskId: number): Promise<void> {
        // Get the list of all available running tasks.
        const runningTasks: TaskInfo[] = await this.getRunningTasks();
        // Get the corresponding task information based on task id if available.
        const taskInfo: TaskInfo | undefined = runningTasks.find((t: TaskInfo) => t.taskId === taskId);
        // Create terminal widget to display an execution output of a task that was launched as a command inside a shell.
        const widget = <TerminalWidget>await this.widgetManager.getOrCreateWidget(
            TERMINAL_WIDGET_FACTORY_ID,
            <TerminalWidgetFactoryOptions>{
                created: new Date().toString(),
                id: this.getTerminalWidgetId(processId),
                title: taskInfo
                    ? `Task: ${taskInfo.config.label}`
                    : `Task: #${taskId}`,
                destroyTermOnClose: true
            }
        );
        this.shell.addWidget(widget, { area: 'bottom' });
        this.shell.activateWidget(widget.id);
        widget.start(processId);
    }

    private getTerminalWidgetId(terminalId: number): string {
        return `${TERMINAL_WIDGET_FACTORY_ID}-${terminalId}`;
    }

    async configure(task: TaskConfiguration): Promise<void> {
        await this.taskConfigurations.configure(task);
    }

    protected isEventForThisClient(context: string | undefined): boolean {
        if (context === this.getContext()) {
            return true;
        }
        return false;
    }

    taskConfigurationChanged(event: string[]): void {
        // do nothing for now
    }

    protected getContext(): string | undefined {
        return this.workspaceService.workspace && this.workspaceService.workspace.uri;
    }

    /** Kill task for a given id if task is found */
    async kill(id: number): Promise<void> {
        try {
            await this.taskServer.kill(id);
        } catch (error) {
            this.logger.error(`Error killing task '${id}': ${error}`);
            this.messageService.error(`Error killing task '${id}': ${error}`);
            return;
        }
        this.logger.debug(`Task killed. Task id: ${id}`);
    }

    async getExitCode(id: number): Promise<number | undefined> {
        const completedTask = this.runningTasks.get(id);
        return completedTask && completedTask.exitCode.promise;
    }

    async getTerminateSignal(id: number): Promise<string | undefined> {
        const completedTask = this.runningTasks.get(id);
        return completedTask && completedTask.terminateSignal.promise;
    }
}
