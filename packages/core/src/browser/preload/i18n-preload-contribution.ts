// *****************************************************************************
// Copyright (C) 2023 TypeFox and others.
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

import { PreloadContribution } from './preloader';
import { FrontendApplicationConfigProvider } from '../frontend-application-config-provider';
import { nls } from '../../common/nls';
import { inject, injectable, named } from 'inversify';
import { LocalizationServer } from '../../common/i18n/localization-server';
import { ContributionProvider } from '../../common';
import { TextReplacementContribution } from './text-replacement-contribution';

@injectable()
export class I18nPreloadContribution implements PreloadContribution {

    @inject(LocalizationServer)
    protected readonly localizationServer: LocalizationServer;

    @inject(ContributionProvider) @named(TextReplacementContribution)
    protected readonly replacementContributions: ContributionProvider<TextReplacementContribution>;

    async initialize(): Promise<void> {
        const defaultLocale = FrontendApplicationConfigProvider.get().defaultLocale;
        if (defaultLocale && !nls.locale) {
            Object.assign(nls, {
                locale: defaultLocale
            });
        }
        let locale = nls.locale ?? nls.defaultLocale;
        if (nls.locale && nls.locale !== nls.defaultLocale) {
            const localization = await this.localizationServer.loadLocalization(locale);
            if (localization.languagePack) {
                nls.localization = localization;
            } else {
                // In case the localization that we've loaded doesn't localize Theia completely (languagePack is false)
                // We simply reset the locale to the default again
                Object.assign(nls, {
                    locale: defaultLocale || undefined
                });
                locale = defaultLocale;
            }
        }
        const replacements = this.getReplacements(locale);
        if (Object.keys(replacements).length > 0) {
            nls.localization ??= { translations: {}, languageId: locale };
            nls.localization.replacements = replacements;
        }
    }

    protected getReplacements(locale: string): Record<string, string> {
        const replacements: Record<string, string> = {};
        for (const contribution of this.replacementContributions.getContributions()) {
            Object.assign(replacements, contribution.getReplacement(locale));
        }
        return replacements;
    }

}
