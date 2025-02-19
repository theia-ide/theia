// *****************************************************************************
// Copyright (C) 2024 EclipseSource GmbH.
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

import { FrontendApplicationContribution, PreferenceProvider, PreferenceService } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { MCPServerDescription, MCPServerManager } from '../common';
import { MCP_SERVERS_PREF } from './mcp-preferences';
import { JSONObject } from '@theia/core/shared/@lumino/coreutils';
import { MCPFrontendService } from './mcp-frontend-service';

interface MCPServersPreferenceValue {
    command: string;
    args?: string[];
    env?: { [key: string]: string };
    autostart?: boolean;
};

interface MCPServersPreference {
    [name: string]: MCPServersPreferenceValue
};

namespace MCPServersPreference {
    export function isValue(obj: unknown): obj is MCPServersPreferenceValue {
        return !!obj && typeof obj === 'object' &&
            'command' in obj && typeof obj.command === 'string' &&
            (!('args' in obj) || Array.isArray(obj.args) && obj.args.every(arg => typeof arg === 'string')) &&
            (!('env' in obj) || !!obj.env && typeof obj.env === 'object' && Object.values(obj.env).every(value => typeof value === 'string')) &&
            (!('autostart' in obj) || typeof obj.autostart === 'boolean');
    }
}

function filterValidValues(servers: unknown): MCPServersPreference {
    const result: MCPServersPreference = {};
    if (!servers || typeof servers !== 'object') {
        return result;
    }
    for (const [name, value] of Object.entries(servers)) {
        if (typeof name === 'string' && MCPServersPreference.isValue(value)) {
            result[name] = value;
        }
    }
    return result;
}

@injectable()
export class McpFrontendApplicationContribution implements FrontendApplicationContribution {

    @inject(PreferenceService)
    protected preferenceService: PreferenceService;

    @inject(MCPServerManager)
    protected manager: MCPServerManager;

    @inject(MCPFrontendService)
    protected frontendMCPService: MCPFrontendService;

    protected prevServers: Map<string, MCPServerDescription> = new Map();

    onStart(): void {
        this.preferenceService.ready.then(() => {
            const servers = filterValidValues(this.preferenceService.get(
                MCP_SERVERS_PREF,
                {}
            ));
            this.prevServers = this.convertToMap(servers);
            this.syncServers(this.prevServers);
            this.autoStartServers(this.prevServers);

            this.preferenceService.onPreferenceChanged(event => {
                if (event.preferenceName === MCP_SERVERS_PREF) {
                    this.handleServerChanges(filterValidValues(event.newValue));
                }
            });
        });
        this.frontendMCPService.registerToolsForAllStartedServers();
    }

    protected async autoStartServers(servers: Map<string, MCPServerDescription>): Promise<void> {
        const startedServers = await this.frontendMCPService.getStartedServers();
        for (const [name, serverDesc] of servers) {
            if (serverDesc && serverDesc.autostart) {
                if (!startedServers.includes(name)) {
                    await this.frontendMCPService.startServer(name);
                }
            }
        }
    }

    protected handleServerChanges(newServers: MCPServersPreference): void {
        const oldServers = this.prevServers;
        const updatedServers = this.convertToMap(newServers);

        for (const [name] of oldServers) {
            if (!updatedServers.has(name)) {
                this.manager.removeServer(name);
            }
        }

        for (const [name, description] of updatedServers) {
            const oldDescription = oldServers.get(name);
            let diff = false;
            try {
                // We know that that the descriptions are actual JSONObjects as we construct them ourselves
                if (!oldDescription || !PreferenceProvider.deepEqual(oldDescription as unknown as JSONObject, description as unknown as JSONObject)) {
                    diff = true;
                }
            } catch (e) {
                // In some cases the deepEqual function throws an error, so we fall back to assuming that there is a difference
                // This seems to happen in cases where the objects are structured differently, e.g. whole sub-objects are missing
                console.debug('Failed to compare MCP server descriptions, assuming a difference', e);
                diff = true;
            }
            if (diff) {
                this.manager.addOrUpdateServer(description);
            }
        }

        this.prevServers = updatedServers;
    }

    protected syncServers(servers: Map<string, MCPServerDescription>): void {

        for (const [, description] of servers) {
            this.manager.addOrUpdateServer(description);
        }

        for (const [name] of this.prevServers) {
            if (!servers.has(name)) {
                this.manager.removeServer(name);
            }
        }
    }

    protected convertToMap(servers: MCPServersPreference): Map<string, MCPServerDescription> {
        const map = new Map<string, MCPServerDescription>();
        Object.entries(servers).forEach(([name, description]) => {
            map.set(name, {
                name,
                ...description,
                autostart: 'autostart' in description ? description.autostart : true,
                env: description.env || undefined
            });
        });
        return map;
    }
}
