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

import '../../src/browser/style/index.css';
import { ContainerModule } from '@theia/core/shared/inversify';
import { AIScanOSSPreferencesSchema } from './ai-scanoss-preferences';
import { PreferenceContribution } from '@theia/core/lib/browser';
import { ScanOSSScanButtonAction } from './ai-scanoss-code-scan-action';
import { CodePartRendererAction } from '@theia/ai-chat-ui/lib/browser/chat-response-renderer';
import { ChangeSetActionRenderer } from '@theia/ai-chat-ui/lib/browser/change-set-actions/change-set-action-service';
import { ChangeSetScanActionRenderer } from './change-set-scan-action/change-set-scan-action';

export default new ContainerModule(bind => {
    bind(PreferenceContribution).toConstantValue({ schema: AIScanOSSPreferencesSchema });
    bind(ScanOSSScanButtonAction).toSelf().inSingletonScope();
    bind(CodePartRendererAction).toService(ScanOSSScanButtonAction);
    bind(ChangeSetScanActionRenderer).toSelf();
    bind(ChangeSetActionRenderer).toService(ChangeSetScanActionRenderer);
});
