/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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

import { AbstractGenerator } from './abstract-generator';

export class BackendGenerator extends AbstractGenerator {

    async generate(): Promise<void> {
        const { backendModules, backendMasterModules } = this.pck;
        await this.write(this.pck.backend('server.js'), this.compileServer(backendModules));
        await this.write(this.pck.backend('main.js'), this.compileMain(backendModules));
        await this.writeIf(this.pck.backend('master.js'), this.compileMaster(backendMasterModules));
    }

    protected async writeIf(path: string, content: string): Promise<void> {
        if (content === undefined || content === '') { return; }
        await this.write(path, content);
    }

    protected compileServer(backendModules: Map<string, string>): string {
        return `// @ts-check
require('reflect-metadata');
const path = require('path');
const express = require('express');
const { Container, injectable } = require('inversify');

const { BackendApplication, CliManager } = require('@theia/core/lib/node');
const { backendApplicationModule } = require('@theia/core/lib/node/backend-application-module');
const { messagingBackendModule } = require('@theia/core/lib/node/messaging/messaging-backend-module');
const { loggerBackendModule } = require('@theia/core/lib/node/logger-backend-module');

const container = new Container();
container.load(backendApplicationModule);
container.load(messagingBackendModule);
container.load(loggerBackendModule);

function load(raw) {
    return Promise.resolve(raw.default).then(module =>
        container.load(module)
    )
}

function start(port, host, argv) {
    if (argv === undefined) {
        argv = process.argv;
    }

    const cliManager = container.get(CliManager);
    return cliManager.initializeCli(argv).then(function () {
        const application = container.get(BackendApplication);
        application.use(express.static(path.join(__dirname, '../../lib'), {
            index: 'index.html'
        }));
        return application.start(port, host);
    });
}

module.exports = (port, host, argv) => Promise.resolve()${this.compileBackendModuleImports(backendModules)}
    .then(() => start(port, host, argv)).catch(reason => {
        console.error('Failed to start the backend application.');
        if (reason) {
            console.error(reason);
        }
        throw reason;
    });`;
    }

    protected compileMaster(backendMasterModules: Map<string, string>): string {
        if (backendMasterModules.size === 0) { return ''; }
        return `// @ts-check
require('reflect-metadata');
const { Container, injectable } = require('inversify');
// Add master modules entry point container;

const container = new Container();

function load(raw) {
    return Promise.resolve(raw.default).then(module => {
        container.load(module)
    });
}

module.exports = () =>
    Promise.resolve()${this.compileBackendModuleImports(backendMasterModules)}
        .catch(err => {
            console.error('Failed to import master modules:', err);
            throw err;
        });`;
    }

    protected compileMain(backendModules: Map<string, string>): string {
        return `// @ts-check
const { BackendApplicationConfigProvider } = require('@theia/core/lib/node/backend-application-config-provider');
BackendApplicationConfigProvider.set(${this.prettyStringify(this.pck.props.backend.config)}); ${this.pck.backendMasterModules.size === 0 ? '' : `
const { isMaster } = require('cluster');
if (isMaster) { require('./master')(); }`}

const serverPath = require('path').resolve(__dirname, 'server');
const address = require('@theia/core/lib/node/cluster/main').default(serverPath);
address.then(function (address) {
    if (process && process.send) {
        process.send(address.port.toString());
    }
});
module.exports = address;
`;
    }

}
