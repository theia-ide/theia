/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ILanguageClient } from '../common/languageclient-services';

export const LanguageClientProvider = Symbol('LanguageClientProvider');
export interface LanguageClientProvider {
    getLanguageClient(languageId: string): Promise<ILanguageClient | undefined>
}
