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
import { inject, injectable } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { ILogger, LogLevel, MeasurementResult, Stopwatch } from '@theia/core';
import { UUID } from '@theia/core/shared/@lumino/coreutils';
import { MeasurementNotificationService } from '../common';

@injectable()
export class MetricsFrontendApplicationContribution implements FrontendApplicationContribution {
    @inject(Stopwatch)
    protected stopwatch: Stopwatch;

    @inject(MeasurementNotificationService)
    protected notificationService: MeasurementNotificationService;

    @inject(ILogger)
    protected logger: ILogger;

    readonly id = UUID.uuid4();

    initialize(): void {
        this.doInitialize();
    }

    protected async doInitialize(): Promise<void> {
        const logLevel = await this.logger.getLogLevel();
        if (logLevel !== LogLevel.DEBUG) {
            return;
        }
        this.stopwatch.storedMeasurements.forEach(result => this.notify(result));
        this.stopwatch.onDidAddMeasurementResult(result => this.notify(result));
    }

    protected notify(result: MeasurementResult): void {
        this.notificationService.onFrontendMeasurement(this.id, result);
    }
}
