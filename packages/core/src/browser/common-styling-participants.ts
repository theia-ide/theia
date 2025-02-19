// *****************************************************************************
// Copyright (C) 2022 TypeFox and others.
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

import { injectable, interfaces } from 'inversify';
import { ColorTheme, CssStyleCollector, StylingParticipant } from './styling-service';
import { isHighContrast } from '../common/theme';

export function bindCommonStylingParticipants(bind: interfaces.Bind): void {
    for (const participant of [
        ActionLabelStylingParticipant,
        BadgeStylingParticipant,
        BreadcrumbStylingParticipant,
        ButtonStylingParticipant,
        MenuStylingParticipant,
        TabbarStylingParticipant,
        TreeStylingParticipant,
        StatusBarStylingParticipant
    ]) {
        bind(participant).toSelf().inSingletonScope();
        bind(StylingParticipant).toService(participant);
    }
}

@injectable()
export class ActionLabelStylingParticipant implements StylingParticipant {
    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const focusBorder = theme.getColor('focusBorder');

        if (isHighContrast(theme.type) && focusBorder) {
            if (focusBorder) {
                collector.addRule(`
                    .action-label:hover {
                        outline: 1px dashed ${focusBorder};
                    }
                `);
            }
        }
    }
}

@injectable()
export class TreeStylingParticipant implements StylingParticipant {
    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const focusBorder = theme.getColor('focusBorder');

        if (isHighContrast(theme.type) && focusBorder) {
            collector.addRule(`
                .theia-TreeNode {
                    outline-offset: -1px;
                }
                .theia-TreeNode:hover {
                    outline: 1px dashed ${focusBorder};
                }
                .theia-Tree .theia-TreeNode.theia-mod-selected {
                    outline: 1px dotted ${focusBorder};
                }
                .theia-Tree:focus .theia-TreeNode.theia-mod-selected,
                .theia-Tree .ReactVirtualized__List:focus .theia-TreeNode.theia-mod-selected {
                    outline: 1px solid ${focusBorder};
                }
            `);
        }
    }
}

@injectable()
export class BreadcrumbStylingParticipant implements StylingParticipant {
    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const contrastBorder = theme.getColor('contrastBorder');

        if (isHighContrast(theme.type) && contrastBorder) {
            collector.addRule(`
                .theia-tabBar-breadcrumb-row {
                    outline: 1px solid ${contrastBorder};
                }
            `);
        }
    }
}

@injectable()
export class StatusBarStylingParticipant implements StylingParticipant {
    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const focusBorder = theme.getColor('focusBorder');

        if (isHighContrast(theme.type) && focusBorder) {
            collector.addRule(`
                #theia-statusBar .area .element.hasCommand:hover {
                    outline: 1px dashed ${focusBorder};
                }
                #theia-statusBar .area .element.hasCommand:active {
                    outline: 1px solid ${focusBorder};
                }
                .theia-mod-offline #theia-statusBar .area .element.hasCommand:hover {
                    outline: none;
                }
                .theia-mod-offline #theia-statusBar .area .element.hasCommand:active {
                    outline: none;
                }
            `);
        } else {
            collector.addRule(`
                #theia-statusBar .area .element.hasCommand:hover {
                    background-color: var(--theia-statusBarItem-hoverBackground);
                }
                #theia-statusBar .area .element.hasCommand:active {
                    background-color: var(--theia-statusBarItem-activeBackground);
                }
                .theia-mod-offline #theia-statusBar .area .element.hasCommand:hover {
                    background-color: var(--theia-statusBarItem-offlineHoverBackground) !important;
                }
                .theia-mod-offline #theia-statusBar .area .element.hasCommand:active {
                    background-color: var(--theia-statusBarItem-offlineActiveBackground) !important;
                }
            `);
        }
    }
}

@injectable()
export class MenuStylingParticipant implements StylingParticipant {
    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const focusBorder = theme.getColor('focusBorder');

        if (isHighContrast(theme.type) && focusBorder) {
            // Menu items
            collector.addRule(`
                .lm-Menu .lm-Menu-item.lm-mod-active {
                    outline: 1px solid ${focusBorder};
                    outline-offset: -1px;
                }
                .lm-MenuBar .lm-MenuBar-item.lm-mod-active {
                    outline: 1px dashed ${focusBorder};
                }
                .lm-MenuBar.lm-mod-active .lm-MenuBar-item.lm-mod-active {
                    outline: 1px solid ${focusBorder};
                }
            `);
            // Sidebar items
            collector.addRule(`
                .theia-sidebar-menu > :hover {
                    outline: 1px dashed ${focusBorder};
                    outline-offset: -7px;
                }
            `);
        }
    }
}

@injectable()
export class BadgeStylingParticipant implements StylingParticipant {
    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const contrastBorder = theme.getColor('contrastBorder');

        if (isHighContrast(theme.type) && contrastBorder) {
            collector.addRule(`.lm-TabBar .theia-badge-decorator-sidebar {
                outline: 1px solid ${contrastBorder};
            }`);
        }
    }
}

@injectable()
export class TabbarStylingParticipant implements StylingParticipant {
    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const focusBorder = theme.getColor('focusBorder');
        const contrastBorder = theme.getColor('contrastBorder');
        const highContrast = isHighContrast(theme.type);

        if (highContrast && focusBorder) {
            collector.addRule(`
                #theia-bottom-content-panel .lm-TabBar .lm-TabBar-tab,
                #theia-main-content-panel .lm-TabBar .lm-TabBar-tab {
                    outline-offset: -4px;
                }
                #theia-bottom-content-panel .lm-TabBar .lm-TabBar-tab.lm-mod-current,
                #theia-main-content-panel .lm-TabBar .lm-TabBar-tab.lm-mod-current {
                    outline: 1px solid ${focusBorder};
                }
                #theia-bottom-content-panel .lm-TabBar:not(.theia-tabBar-active) .lm-TabBar-tab.lm-mod-current,
                #theia-main-content-panel .lm-TabBar:not(.theia-tabBar-active) .lm-TabBar-tab.lm-mod-current {
                    outline: 1px dotted ${focusBorder};
                }
                #theia-bottom-content-panel .lm-TabBar .lm-TabBar-tab:not(.lm-mod-current):hover,
                #theia-main-content-panel .lm-TabBar .lm-TabBar-tab:not(.lm-mod-current):hover {
                    outline: 1px dashed ${focusBorder};
                }
            `);
        }
        const tabActiveBackground = theme.getColor('tab.activeBackground');
        const tabActiveBorderTop = theme.getColor('tab.activeBorderTop');
        const tabUnfocusedActiveBorderTop = theme.getColor('tab.unfocusedActiveBorderTop');
        const tabActiveBorder = theme.getColor('tab.activeBorder') || (highContrast && contrastBorder) || 'transparent';
        const tabUnfocusedActiveBorder = theme.getColor('tab.unfocusedActiveBorder') || (highContrast && contrastBorder) || 'transparent';
        collector.addRule(`
            #theia-main-content-panel .lm-TabBar .lm-TabBar-tab.lm-mod-current {
                color: var(--theia-tab-activeForeground);
                ${tabActiveBackground ? `background: ${tabActiveBackground};` : ''}
                ${tabActiveBorderTop ? `border-top: 1px solid ${tabActiveBorderTop};` : ''}
                border-bottom: 1px solid ${tabActiveBorder};
            }
            #theia-main-content-panel .lm-TabBar:not(.theia-tabBar-active) .lm-TabBar-tab.lm-mod-current {
                background: var(--theia-tab-unfocusedActiveBackground);
                color: var(--theia-tab-unfocusedActiveForeground);
                ${tabUnfocusedActiveBorderTop ? `border-top: 1px solid ${tabUnfocusedActiveBorderTop};` : ''}
                border-bottom: 1px solid ${tabUnfocusedActiveBorder};
            }
        `);

        // Highlight Modified Tabs
        const tabActiveModifiedBorder = theme.getColor('tab.activeModifiedBorder');
        const tabUnfocusedInactiveModifiedBorder = theme.getColor('tab.unfocusedInactiveModifiedBorder');
        const tabInactiveModifiedBorder = theme.getColor('tab.inactiveModifiedBorder');
        if (tabActiveModifiedBorder || tabInactiveModifiedBorder) {
            collector.addRule(`
                body.theia-editor-highlightModifiedTabs
                #theia-main-content-panel .lm-TabBar .lm-TabBar-tab.theia-mod-dirty {
                    border-top: 2px solid ${tabInactiveModifiedBorder};
                    padding-bottom: 1px;
                }

                body.theia-editor-highlightModifiedTabs
                #theia-main-content-panel .lm-TabBar.theia-tabBar-active .lm-TabBar-tab.theia-mod-dirty.lm-mod-current {
                    border-top: 2px solid ${tabActiveModifiedBorder};
                }
                
                body.theia-editor-highlightModifiedTabs
                #theia-main-content-panel .lm-TabBar:not(.theia-tabBar-active) .lm-TabBar-tab.theia-mod-dirty:not(.lm-mod-current) {
                    border-top: 2px solid ${tabUnfocusedInactiveModifiedBorder};
                }
            `);
        }

        // Activity Bar Active Border
        const activityBarActiveBorder = theme.getColor('activityBar.activeBorder') || 'var(--theia-activityBar-foreground)';
        collector.addRule(`
            .lm-TabBar.theia-app-left .lm-TabBar-tab.lm-mod-current {
                border-top-color: transparent;
                box-shadow: 2px 0 0 ${activityBarActiveBorder} inset;
            }
          
            .lm-TabBar.theia-app-right .lm-TabBar-tab.lm-mod-current {
                border-top-color: transparent;
                box-shadow: -2px 0 0 ${activityBarActiveBorder} inset;
            }
        `);
        // Hover Background
        const tabHoverBackground = theme.getColor('tab.hoverBackground');
        if (tabHoverBackground) {
            collector.addRule(`
                #theia-main-content-panel .lm-TabBar .lm-TabBar-tab:hover {
                    background-color: ${tabHoverBackground};
                }
            `);
        }

        const tabUnfocusedHoverBackground = theme.getColor('tab.unfocusedHoverBackground');
        if (tabUnfocusedHoverBackground) {
            collector.addRule(`
                #theia-main-content-panel .lm-TabBar:not(.theia-tabBar-active) .lm-TabBar-tab:hover {
                    background-color: ${tabUnfocusedHoverBackground};
                }
            `);
        }

        // Hover Foreground
        const tabHoverForeground = theme.getColor('tab.hoverForeground');
        if (tabHoverForeground) {
            collector.addRule(`
                #theia-main-content-panel .lm-TabBar .lm-TabBar-tab:hover {
                    color: ${tabHoverForeground};
                }
            `);
        }

        const tabUnfocusedHoverForeground = theme.getColor('tab.unfocusedHoverForeground');
        if (tabUnfocusedHoverForeground) {
            collector.addRule(`
                #theia-main-content-panel .lm-TabBar:not(.theia-tabBar-active) .lm-TabBar-tab:hover {
                    color: ${tabUnfocusedHoverForeground};
                }
            `);
        }

        // Hover Border
        const tabHoverBorder = theme.getColor('tab.hoverBorder');
        if (tabHoverBorder) {
            collector.addRule(`
                #theia-main-content-panel .lm-TabBar .lm-TabBar-tab:hover {
                    box-shadow: 0 1px 0 ${tabHoverBorder} inset;
                }
            `);
        }

        const tabUnfocusedHoverBorder = theme.getColor('tab.unfocusedHoverBorder');
        if (tabUnfocusedHoverBorder) {
            collector.addRule(`
                #theia-main-content-panel .lm-TabBar:not(.theia-tabBar-active) .lm-TabBar-tab:hover {
                    box-shadow: 0 1px 0 ${tabUnfocusedHoverBorder} inset;
                }
            `);
        }
    }
}

@injectable()
export class ButtonStylingParticipant implements StylingParticipant {
    registerThemeStyle(theme: ColorTheme, collector: CssStyleCollector): void {
        const contrastBorder = theme.getColor('contrastBorder');

        if (isHighContrast(theme.type) && contrastBorder) {
            collector.addRule(`
                .theia-button {
                    border: 1px solid ${contrastBorder};
                }
            `);
        }

        const buttonBackground = theme.getColor('button.background');
        collector.addRule(`
            .theia-button {
                background: ${buttonBackground || 'none'};
            }
        `);
        const buttonHoverBackground = theme.getColor('button.hoverBackground');
        if (buttonHoverBackground) {
            collector.addRule(`
                .theia-button:hover {
                    background-color: ${buttonHoverBackground};
                }
            `);
        }
        const secondaryButtonBackground = theme.getColor('secondaryButton.background');
        collector.addRule(`
            .theia-button.secondary {
                background: ${secondaryButtonBackground || 'none'};
            }
        `);
        const secondaryButtonHoverBackground = theme.getColor('secondaryButton.hoverBackground');
        if (secondaryButtonHoverBackground) {
            collector.addRule(`
                .theia-button.secondary:hover {
                    background-color: ${secondaryButtonHoverBackground};
                }
            `);
        }
    }
}
