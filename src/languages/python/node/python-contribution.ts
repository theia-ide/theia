/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { BaseLanguageServerContribution, IConnection } from "../../node";

/**
 * IF you have python on your machine, `pyls` can be installed with the following command:
 * `pip install `
 */
@injectable()
export class PythonContribution extends BaseLanguageServerContribution {

    readonly id = 'python';

    readonly description = {
        id: 'python',
        name: 'Python',
        documentSelector: ['python'],
        fileEvents: [
            '**/*.py'
        ]
    }

    start(clientConnection: IConnection): void {
        const command = 'pyls';
        const args: string[] = [
        ];
        try {
            const serverConnection = this.createProcessStreamConnection(command, args);
            this.forward(clientConnection, serverConnection);
        } catch (err) {
            console.error(err)
            console.error("Error starting python language server.")
            console.error("Please make sure it is installed on your system.")
            console.error("Use the following command: 'pip install https://github.com/palantir/python-language-server/archive/master.zip'")
        }
    }

}
