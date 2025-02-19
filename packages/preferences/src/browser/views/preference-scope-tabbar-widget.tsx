// *****************************************************************************
// Copyright (C) 2020 Ericsson and others.
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

import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { TabBar, Widget, Title } from '@theia/core/shared/@lumino/widgets';
import { PreferenceScope, Message, ContextMenuRenderer, LabelProvider, StatefulWidget, codicon } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import URI from '@theia/core/lib/common/uri';
import { FileStat } from '@theia/filesystem/lib/common/files';
import { PreferenceScopeCommandManager } from '../util/preference-scope-command-manager';
import { Preference, PreferenceMenus } from '../util/preference-types';
import { CommandRegistry, DisposableCollection, Emitter, MenuModelRegistry } from '@theia/core/lib/common';
import { nls } from '@theia/core/lib/common/nls';

const USER_TAB_LABEL = nls.localizeByDefault('User');
const USER_TAB_INDEX = PreferenceScope['User'];
const WORKSPACE_TAB_LABEL = nls.localizeByDefault('Workspace');
const WORKSPACE_TAB_INDEX = PreferenceScope['Workspace'];
const FOLDER_TAB_LABEL = nls.localizeByDefault('Folder');
const FOLDER_TAB_INDEX = PreferenceScope['Folder'];

const PREFERENCE_TAB_CLASSNAME = 'preferences-scope-tab';
const GENERAL_FOLDER_TAB_CLASSNAME = 'preference-folder';
const LABELED_FOLDER_TAB_CLASSNAME = 'preferences-folder-tab';
const FOLDER_DROPDOWN_CLASSNAME = 'preferences-folder-dropdown';
const FOLDER_DROPDOWN_ICON_CLASSNAME = 'preferences-folder-dropdown-icon ' + codicon('chevron-down');
const TABBAR_UNDERLINE_CLASSNAME = 'tabbar-underline';
const SINGLE_FOLDER_TAB_CLASSNAME = `${PREFERENCE_TAB_CLASSNAME} ${GENERAL_FOLDER_TAB_CLASSNAME} ${LABELED_FOLDER_TAB_CLASSNAME}`;
const UNSELECTED_FOLDER_DROPDOWN_CLASSNAME = `${PREFERENCE_TAB_CLASSNAME} ${GENERAL_FOLDER_TAB_CLASSNAME} ${FOLDER_DROPDOWN_CLASSNAME}`;
const SELECTED_FOLDER_DROPDOWN_CLASSNAME = `${PREFERENCE_TAB_CLASSNAME} ${GENERAL_FOLDER_TAB_CLASSNAME} ${LABELED_FOLDER_TAB_CLASSNAME} ${FOLDER_DROPDOWN_CLASSNAME}`;
const SHADOW_CLASSNAME = 'with-shadow';

export interface PreferencesScopeTabBarState {
    scopeDetails: Preference.SelectedScopeDetails;
}

@injectable()
export class PreferencesScopeTabBar extends TabBar<Widget> implements StatefulWidget {

    static ID = 'preferences-scope-tab-bar';
    @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService;
    @inject(PreferenceScopeCommandManager) protected readonly preferencesMenuFactory: PreferenceScopeCommandManager;
    @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer;
    @inject(LabelProvider) protected readonly labelProvider: LabelProvider;
    @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry;
    @inject(MenuModelRegistry) protected readonly menuModelRegistry: MenuModelRegistry;

    protected readonly onScopeChangedEmitter = new Emitter<Preference.SelectedScopeDetails>();
    readonly onScopeChanged = this.onScopeChangedEmitter.event;

    protected toDispose = new DisposableCollection();
    protected folderTitle: Title<Widget>;
    protected currentWorkspaceRoots: FileStat[] = [];
    protected currentSelection: Preference.SelectedScopeDetails = Preference.DEFAULT_SCOPE;
    protected editorScrollAtTop = true;

    get currentScope(): Preference.SelectedScopeDetails {
        return this.currentSelection;
    }

    protected setNewScopeSelection(newSelection: Preference.SelectedScopeDetails): void {
        const stringifiedSelectionScope = newSelection.scope.toString();
        const newIndex = this.titles.findIndex(title => title.dataset.scope === stringifiedSelectionScope);
        if (newIndex !== -1) {
            this.currentSelection = newSelection;
            this.currentIndex = newIndex;
            if (newSelection.scope === PreferenceScope.Folder) {
                this.addOrUpdateFolderTab();
            }
            this.emitNewScope();
        }
    }

    @postConstruct()
    protected init(): void {
        this.id = PreferencesScopeTabBar.ID;
        this.setupInitialDisplay();

        this.tabActivateRequested.connect((sender, args) => {
            const scopeDetails = this.toScopeDetails(args.title);
            if (scopeDetails) {
                this.setNewScopeSelection(scopeDetails);
            }
        });
        this.toDispose.pushAll([
            this.workspaceService.onWorkspaceChanged(newRoots => this.doUpdateDisplay(newRoots)),
            this.workspaceService.onWorkspaceLocationChanged(() => this.doUpdateDisplay(this.workspaceService.tryGetRoots())),
        ]);
        const tabUnderline = document.createElement('div');
        tabUnderline.className = TABBAR_UNDERLINE_CLASSNAME;
        this.node.append(tabUnderline);
    }

    protected toScopeDetails(title?: Title<Widget> | Preference.SelectedScopeDetails): Preference.SelectedScopeDetails | undefined {
        if (title) {
            const source = 'dataset' in title ? title.dataset : title;
            const { scope, uri, activeScopeIsFolder } = source;
            return {
                scope: Number(scope),
                uri: uri || undefined,
                activeScopeIsFolder: activeScopeIsFolder === 'true' || activeScopeIsFolder === true,
            };
        }
    }

    protected toDataSet(scopeDetails: Preference.SelectedScopeDetails): Title.Dataset {
        const { scope, uri, activeScopeIsFolder } = scopeDetails;
        return {
            scope: scope.toString(),
            uri: uri ?? '',
            activeScopeIsFolder: activeScopeIsFolder.toString()
        };
    }

    protected setupInitialDisplay(): void {
        this.addUserTab();
        if (this.workspaceService.workspace) {
            this.addWorkspaceTab(this.workspaceService.workspace);
        }
        this.addOrUpdateFolderTab();
    }

    protected override onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        this.addTabIndexToTabs();
    }

    protected addTabIndexToTabs(): void {
        this.node.querySelectorAll('li').forEach((tab, index) => {
            tab.tabIndex = 0;
            const handler = () => {
                if (tab.className.includes(GENERAL_FOLDER_TAB_CLASSNAME) && this.currentWorkspaceRoots.length > 1) {
                    const tabRect = tab.getBoundingClientRect();
                    this.openContextMenu(tabRect, tab, 'keypress');
                } else {
                    const details = this.toScopeDetails(this.titles[index]);
                    if (details) {
                        this.setNewScopeSelection(details);
                    }
                }
            };
            tab.onkeydown = handler;
            tab.onclick = handler;
        });
    }

    protected addUserTab(): void {
        this.addTab(new Title({
            dataset: { uri: '', scope: USER_TAB_INDEX.toString() },
            label: USER_TAB_LABEL,
            owner: this,
            className: PREFERENCE_TAB_CLASSNAME
        }));
    }

    protected addWorkspaceTab(currentWorkspace: FileStat): Title<Widget> {
        const scopeDetails = this.getWorkspaceDataset(currentWorkspace);
        const workspaceTabTitle = new Title({
            dataset: this.toDataSet(scopeDetails),
            label: WORKSPACE_TAB_LABEL,
            owner: this,
            className: PREFERENCE_TAB_CLASSNAME,
        });
        this.addTab(workspaceTabTitle);
        return workspaceTabTitle;
    }

    protected getWorkspaceDataset(currentWorkspace: FileStat): Preference.SelectedScopeDetails {
        const { resource, isDirectory } = currentWorkspace;
        const scope = WORKSPACE_TAB_INDEX;
        return { uri: resource.toString(), activeScopeIsFolder: isDirectory, scope };
    }

    protected addOrUpdateFolderTab(): void {
        if (!!this.workspaceService.workspace) {
            this.currentWorkspaceRoots = this.workspaceService.tryGetRoots();
            const multipleFolderRootsAreAvailable = this.currentWorkspaceRoots && this.currentWorkspaceRoots.length > 1;
            const noFolderRootsAreAvailable = this.currentWorkspaceRoots.length === 0;
            const shouldShowFoldersSeparately = this.workspaceService.saved;

            if (!noFolderRootsAreAvailable) {
                if (!this.folderTitle) {
                    this.folderTitle = new Title({
                        label: '',
                        caption: FOLDER_TAB_LABEL,
                        owner: this,
                    });
                }

                this.setFolderTitleProperties(multipleFolderRootsAreAvailable);
                if (multipleFolderRootsAreAvailable || shouldShowFoldersSeparately) {
                    this.addTab(this.folderTitle);
                }
            } else {
                const folderTabIndex = this.titles.findIndex(title => title.caption === FOLDER_TAB_LABEL);

                if (folderTabIndex > -1) {
                    this.removeTabAt(folderTabIndex);
                }
            }
        }
    }

    protected setFolderTitleProperties(multipleFolderRootsAreAvailable: boolean): void {
        this.folderTitle.iconClass = multipleFolderRootsAreAvailable ? FOLDER_DROPDOWN_ICON_CLASSNAME : '';
        if (this.currentSelection.scope === FOLDER_TAB_INDEX) {
            this.folderTitle.label = this.labelProvider.getName(new URI(this.currentSelection.uri));
            this.folderTitle.dataset = this.toDataSet(this.currentSelection);
            this.folderTitle.className = multipleFolderRootsAreAvailable ? SELECTED_FOLDER_DROPDOWN_CLASSNAME : SINGLE_FOLDER_TAB_CLASSNAME;
        } else {
            const singleFolderRoot = this.currentWorkspaceRoots[0].resource;
            const singleFolderLabel = this.labelProvider.getName(singleFolderRoot);
            const defaultURI = multipleFolderRootsAreAvailable ? '' : singleFolderRoot.toString();
            this.folderTitle.label = multipleFolderRootsAreAvailable ? FOLDER_TAB_LABEL : singleFolderLabel;
            this.folderTitle.className = multipleFolderRootsAreAvailable ? UNSELECTED_FOLDER_DROPDOWN_CLASSNAME : SINGLE_FOLDER_TAB_CLASSNAME;
            this.folderTitle.dataset = { folderTitle: 'true', scope: FOLDER_TAB_INDEX.toString(), uri: defaultURI };
        }
    }

    protected folderSelectionCallback = (newScope: Preference.SelectedScopeDetails): void => { this.setNewScopeSelection(newScope); };

    protected getFolderContextMenu(workspaceRoots = this.workspaceService.tryGetRoots()): void {
        this.preferencesMenuFactory.createFolderWorkspacesMenu(workspaceRoots, this.currentSelection.uri);
    }

    override handleEvent(): void {
        // Don't - the handlers are defined in PreferenceScopeTabbarWidget.addTabIndexToTabs()
    }

    protected openContextMenu(tabRect: DOMRect | ClientRect, folderTabNode: HTMLElement, source: 'click' | 'keypress'): void {
        const toDisposeOnHide = new DisposableCollection();
        for (const root of this.workspaceService.tryGetRoots()) {
            const id = `set-scope-to-${root.resource.toString()}`;
            toDisposeOnHide.pushAll([
                this.commandRegistry.registerCommand(
                    { id },
                    { execute: () => this.setScope(root.resource) }
                ),
                this.menuModelRegistry.registerMenuAction(PreferenceMenus.FOLDER_SCOPE_MENU_PATH,
                    {
                        commandId: id,
                        label: this.labelProvider.getName(root),
                    }
                )
            ]);
        }
        this.contextMenuRenderer.render({
            menuPath: PreferenceMenus.FOLDER_SCOPE_MENU_PATH,
            anchor: { x: tabRect.left, y: tabRect.bottom },
            context: folderTabNode,
            onHide: () => {
                setTimeout(() => toDisposeOnHide.dispose());
                if (source === 'click') { folderTabNode.blur(); }
            }
        });
    }

    protected doUpdateDisplay(newRoots: FileStat[]): void {
        const folderWasRemoved = newRoots.length < this.currentWorkspaceRoots.length;
        this.currentWorkspaceRoots = newRoots;
        if (folderWasRemoved) {
            const removedFolderWasSelectedScope = !this.currentWorkspaceRoots.some(root => root.resource.toString() === this.currentSelection.uri);
            if (removedFolderWasSelectedScope) {
                this.setNewScopeSelection(Preference.DEFAULT_SCOPE);
            }
        }
        this.updateWorkspaceTab();
        this.addOrUpdateFolderTab();
    }

    protected updateWorkspaceTab(): void {
        const currentWorkspace = this.workspaceService.workspace;
        if (currentWorkspace) {
            const workspaceTitle = this.titles.find(title => title.label === WORKSPACE_TAB_LABEL) ?? this.addWorkspaceTab(currentWorkspace);
            const scopeDetails = this.getWorkspaceDataset(currentWorkspace);
            workspaceTitle.dataset = this.toDataSet(scopeDetails);
            if (this.currentSelection.scope === PreferenceScope.Workspace) {
                this.setNewScopeSelection(scopeDetails);
            }
        }
    }

    protected emitNewScope(): void {
        this.onScopeChangedEmitter.fire(this.currentSelection);
    }

    setScope(scope: PreferenceScope.User | PreferenceScope.Workspace | URI): void {
        const details = scope instanceof URI ? this.getDetailsForResource(scope) : this.getDetailsForScope(scope);
        if (details) {
            this.setNewScopeSelection(details);
        }
    }

    protected getDetailsForScope(scope: PreferenceScope.User | PreferenceScope.Workspace): Preference.SelectedScopeDetails | undefined {
        const stringifiedSelectionScope = scope.toString();
        const correspondingTitle = this.titles.find(title => title.dataset.scope === stringifiedSelectionScope);
        return this.toScopeDetails(correspondingTitle);
    }

    protected getDetailsForResource(resource: URI): Preference.SelectedScopeDetails | undefined {
        const parent = this.workspaceService.getWorkspaceRootUri(resource);
        if (!parent) {
            return undefined;
        }
        if (!this.workspaceService.isMultiRootWorkspaceOpened) {
            return this.getDetailsForScope(PreferenceScope.Workspace);
        }
        return ({ scope: PreferenceScope.Folder, uri: parent.toString(), activeScopeIsFolder: true });
    }

    storeState(): PreferencesScopeTabBarState {
        return {
            scopeDetails: this.currentScope
        };
    }

    restoreState(oldState: PreferencesScopeTabBarState): void {
        const scopeDetails = this.toScopeDetails(oldState.scopeDetails);
        if (scopeDetails) {
            this.setNewScopeSelection(scopeDetails);
        }
    }

    toggleShadow(showShadow: boolean): void {
        this.toggleClass(SHADOW_CLASSNAME, showShadow);
    }

    override dispose(): void {
        super.dispose();
        this.toDispose.dispose();
    }
}
