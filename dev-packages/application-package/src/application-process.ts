/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as path from 'path';
import * as cp from 'child_process';
import { ApplicationPackage } from './application-package';

export class ApplicationProcess {

    protected readonly defaultOptions = {
        cwd: this.pck.projectPath,
        env: process.env
    };

    constructor(
        protected readonly pck: ApplicationPackage
    ) { }

    spawn(command: string, args?: string[], options?: cp.SpawnOptions): cp.ChildProcess {
        return cp.spawn(command, args, Object.assign({}, this.defaultOptions, options));
    }
    fork(modulePath: string, args?: string[], options?: cp.ForkOptions): cp.ChildProcess {
        return cp.fork(modulePath, args, Object.assign({}, this.defaultOptions, options));
    }

    run(command: string, args: string[], options?: cp.SpawnOptions): Promise<string> {
        const commandProcess = this.spawnBin(command, args, options);
        return this.promisify(commandProcess);
    }
    spawnBin(command: string, args: string[], options?: cp.SpawnOptions): cp.ChildProcess {
        const binPath = this.resolveBin(command);
        return this.spawn(binPath, args, options);
    }
    protected resolveBin(command: string): string {
        const commandPath = path.resolve(__dirname, '..', 'node_modules', '.bin', command);
        if (process.platform === 'win32') {
            return commandPath + '.cmd';
        }
        return commandPath;
    }

    bunyan(childProcess: cp.ChildProcess): Promise<string> {
        const bunyanProcess = this.spawnBin('bunyan', [], {
            stdio: ['pipe', 1, 2, 'ipc']
        });
        childProcess.stdout.pipe(bunyanProcess.stdin);
        childProcess.stderr.pipe(bunyanProcess.stdin);
        return this.promisify(bunyanProcess);
    }

    protected promisify(p: cp.ChildProcess): Promise<string> {
        return new Promise((resolve, reject) => {
            p.stdout.on('data', data => this.pck.log(data.toString()));
            p.stderr.on('data', data => this.pck.error(data.toString()));
            p.on('error', reject);
            p.on('close', resolve);
        });
    }

}
