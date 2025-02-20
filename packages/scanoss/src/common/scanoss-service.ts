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

import { ScannerComponent } from 'scanoss';

export const SCANOSS_SERVICE_PATH = '/services/scanoss/service';
export const ScanOSSService = Symbol('ScanOSSService');
export interface ScanOSSResultClean {
    type: 'clean';
}
export interface ScanOSSResultMatch {
    type: 'match';
    matched: string; // e.g. "75%"
    url: string;
    raw: ScannerComponent;
    file?: string;
}
export interface ScanOSSResultError {
    type: 'error';
    message: string;
}
export type ScanOSSResult = ScanOSSResultClean | ScanOSSResultMatch | ScanOSSResultError;
export interface ScanOSSService {
    scanContent(content: string, apiKey?: string): Promise<ScanOSSResult>;
}
