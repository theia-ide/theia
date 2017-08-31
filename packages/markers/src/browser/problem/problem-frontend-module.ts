/*
* Copyright (C) 2017 TypeFox and others.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
* You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { ContainerModule } from "inversify";
import { ProblemWidget } from './problem-widget';
import { ProblemContribution } from './problem-contribution';
import { MarkerManager } from '../marker-manager';
import { createProblemWidget } from './problem-container';
import { CommandContribution, MenuContribution, KeybindingContribution } from "@theia/core/lib/common";

import '../../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bind(MarkerManager).toSelf().inSingletonScope();

    bind(ProblemWidget).toDynamicValue(ctx =>
        createProblemWidget(ctx.container)
    ).inSingletonScope();

    bind(ProblemContribution).toSelf().inSingletonScope();
    for (const identifier of [CommandContribution, MenuContribution, KeybindingContribution]) {
        bind(identifier).toDynamicValue(ctx =>
            ctx.container.get(ProblemContribution)
        ).inSingletonScope();
    }
});
