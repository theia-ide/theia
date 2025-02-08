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

import {
    PreferenceDataProperty,
    PreferenceScope,
    TreeNode as BaseTreeNode,
    CompositeTreeNode as BaseCompositeTreeNode,
    SelectableTreeNode,
    PreferenceInspection,
    CommonCommands,
    } from '@theia/core/lib/browser';
import { Command, MenuPath } from '@theia/core';
import { JSONValue } from '@theia/core/shared/@phosphor/coreutils';
import { JsonType } from '@theia/core/lib/common/json-schema';

export namespace Preference {

    export interface EditorCommandArgs {
        id: string;
        value: string | undefined;
    }

    export namespace EditorCommandArgs {
        export function is(prefObject: EditorCommandArgs): prefObject is EditorCommandArgs {
            return !!prefObject && 'id' in prefObject && 'value' in prefObject;
        }
    }

    export const Node = Symbol('Preference.Node');
    export type Node = TreeNode;

    export type TreeNode = CompositeTreeNode | LeafNode;

    export namespace TreeNode {
        export const is = (node: BaseTreeNode | TreeNode): node is TreeNode => 'depth' in node;
        export const isTopLevel = (node: BaseTreeNode): boolean => {
            const { group, id } = getGroupAndIdFromNodeId(node.id);
            return group === id;
        };
        export const getGroupAndIdFromNodeId = (nodeId: string): { group: string; id: string } => {
            const separator = nodeId.indexOf('@');
            const group = nodeId.substring(0, separator);
            const id = nodeId.substring(separator + 1, nodeId.length);
            return { group, id };
        };
    }

    export interface CompositeTreeNode extends BaseCompositeTreeNode, SelectableTreeNode {
        expanded?: boolean;
        depth: number;
        label?: string;
    }

    export namespace CompositeTreeNode {
        export const is = (node: TreeNode): node is CompositeTreeNode => !LeafNode.is(node);
    }

    export interface LeafNode extends BaseTreeNode {
        label?: string;
        depth: number;
        preference: { data: PreferenceDataProperty };
        preferenceId: string;
    }

    export namespace LeafNode {
        export const is = (node: BaseTreeNode | LeafNode): node is LeafNode => 'preference' in node && !!node.preference.data;

        export const getType = (node: BaseTreeNode | LeafNode): JsonType | undefined => is(node)
            ? Array.isArray(node.preference.data.type) ? node.preference.data.type[0] : node.preference.data.type
            : undefined;
    }

    export const getValueInScope = <T extends JSONValue>(preferenceInfo: PreferenceInspection<T> | undefined, scope: number): T | undefined => {
        if (!preferenceInfo) {
            return undefined;
        }
        switch (scope) {
            case PreferenceScope.User:
                return preferenceInfo.globalValue;
            case PreferenceScope.Workspace:
                return preferenceInfo.workspaceValue;
            case PreferenceScope.Folder:
                return preferenceInfo.workspaceFolderValue;
            default:
                return undefined;
        }
    };

    export interface SelectedScopeDetails {
        scope: number;
        uri: string | undefined;
        activeScopeIsFolder: boolean;
    };

    export const DEFAULT_SCOPE: SelectedScopeDetails = {
        scope: PreferenceScope.User,
        uri: undefined,
        activeScopeIsFolder: false
    };

}

export namespace PreferencesCommands {
    export const OPEN_PREFERENCES_JSON_TOOLBAR: Command = {
        id: 'preferences:openJson.toolbar',
        iconClass: 'codicon codicon-json'
    };
    export const COPY_JSON_NAME = Command.toDefaultLocalizedCommand({
        id: 'preferences:copyJson.name',
        label: 'Copy Setting ID'
    });
    export const RESET_PREFERENCE = Command.toDefaultLocalizedCommand({
        id: 'preferences:reset',
        label: 'Reset Setting'
    });

    export const COPY_JSON_VALUE = Command.toDefaultLocalizedCommand({
        id: 'preferences:copyJson.value',
        label: 'Copy Setting as JSON',
    });

    export const OPEN_USER_PREFERENCES = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.openGlobalSettings',
        category: CommonCommands.PREFERENCES_CATEGORY,
        label: 'Open User Settings',
    });

    export const OPEN_WORKSPACE_PREFERENCES = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.openWorkspaceSettings',
        category: CommonCommands.PREFERENCES_CATEGORY,
        label: 'Open Workspace Settings',
    });

    export const OPEN_FOLDER_PREFERENCES = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.openFolderSettings',
        category: CommonCommands.PREFERENCES_CATEGORY,
        label: 'Open Folder Settings'
    });

    export const OPEN_USER_PREFERENCES_JSON = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.openSettingsJson',
        category: CommonCommands.PREFERENCES_CATEGORY,
        label: 'Open Settings (JSON)'
    });

    export const OPEN_WORKSPACE_PREFERENCES_JSON = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.openWorkspaceSettingsFile',
        category: CommonCommands.PREFERENCES_CATEGORY,
        label: 'Open Workspace Settings (JSON)',
    });

    export const OPEN_FOLDER_PREFERENCES_JSON = Command.toDefaultLocalizedCommand({
        id: 'workbench.action.openFolderSettingsFile',
        category: CommonCommands.PREFERENCES_CATEGORY,
        label: 'Open Folder Settings (JSON)',
    });
}

export namespace PreferenceMenus {
    export const PREFERENCE_EDITOR_CONTEXT_MENU: MenuPath = ['preferences:editor.contextMenu'];
    export const PREFERENCE_EDITOR_COPY_ACTIONS: MenuPath = [...PREFERENCE_EDITOR_CONTEXT_MENU, 'preferences:editor.contextMenu.copy'];
    export const FOLDER_SCOPE_MENU_PATH = ['preferences:scope.menu'];
}
