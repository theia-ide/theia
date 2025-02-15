// *****************************************************************************
// Copyright (C) 2024 robertjndw
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

import { ContainerModule } from '@theia/core/shared/inversify';
import { TerminalFrontendOnlyContribution } from './terminal-frontend-only-contribution';
import { TerminalService } from '../browser/base/terminal-service';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(TerminalFrontendOnlyContribution).toSelf().inSingletonScope();
    rebind(TerminalService).toService(TerminalFrontendOnlyContribution);
});
