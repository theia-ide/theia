// *****************************************************************************
// Copyright (C) 2025 EclipseSource GmbH and others.
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

import * as React from '@theia/core/shared/react';
import { ChangeSet, ChangeSetElement } from '@theia/ai-chat';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { ChangeSetActionRenderer } from '@theia/ai-chat-ui/lib/browser/change-set-actions/change-set-action-service';
import { PreferenceService } from '@theia/core/lib/browser/preferences';
import { ScanOSSService, ScanOSSResult, ScanOSSResultMatch } from '@theia/scanoss';
import { SCANOSS_MODE_PREF } from '../ai-scanoss-preferences';
import { SCAN_OSS_API_KEY_PREF } from '@theia/scanoss/lib/browser/scanoss-preferences';
import { ChangeSetFileElement } from '@theia/ai-chat/lib/browser/change-set-file-element';
import { ScanOSSDialog } from '../ai-scanoss-code-scan-action';
import { StandaloneServices } from '@theia/monaco-editor-core/esm/vs/editor/standalone/browser/standaloneServices';
import { IDiffProviderFactoryService } from '@theia/monaco-editor-core/esm/vs/editor/browser/widget/diffEditor/diffProviderFactoryService';
import { IDocumentDiffProvider } from '@theia/monaco-editor-core/esm/vs/editor/common/diff/documentDiffProvider';
import { MonacoTextModelService } from '@theia/monaco/lib/browser/monaco-text-model-service';
import { CancellationToken, Emitter, MessageService, nls } from '@theia/core';

type ScanOSSState = 'pending' | 'clean' | 'match' | 'error' | 'none';
type ScanOSSResultOptions = 'pending' | ScanOSSResult[] | undefined;

@injectable()
export class ChangeSetScanActionRenderer implements ChangeSetActionRenderer {
    readonly id = 'change-set-scanoss';
    protected readonly onDidChangeEmitter = new Emitter<void>();
    readonly onDidChange = this.onDidChangeEmitter.event;

    @inject(ScanOSSService)
    protected readonly scanService: ScanOSSService;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    @inject(MonacoTextModelService)
    protected readonly textModelService: MonacoTextModelService;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    protected differ: IDocumentDiffProvider;

    @postConstruct()
    init(): void {
        this.differ = StandaloneServices.get(IDiffProviderFactoryService).createDiffProvider({ diffAlgorithm: 'advanced' });
        this._scan = this.runScan.bind(this);
        this.preferenceService.onPreferenceChanged(e => e.affects(SCANOSS_MODE_PREF) && this.onDidChangeEmitter.fire());
    }

    canRender(_changeSet: ChangeSet): boolean {
        return true;
    }

    render(changeSet: ChangeSet): React.ReactNode {
        return (
            <ChangeSetScanOSSIntegration
                changeSet={changeSet}
                scanOssMode={this.getPreferenceValues()}
                scanChangeSet={this._scan}
            />
        );
    }

    protected getPreferenceValues(): string {
        return this.preferenceService.get(SCANOSS_MODE_PREF, 'off');
    }

    protected _scan: (changeSetElements: ChangeSetElement[]) => Promise<ScanOSSResult[]>;

    protected async runScan(changeSetElements: ChangeSetFileElement[], cache: Map<string, ScanOSSResult>, userTriggered: boolean): Promise<ScanOSSResult[]> {
        const apiKey = this.preferenceService.get(SCAN_OSS_API_KEY_PREF, undefined);
        const notifiedError = false;
        const fileResults = await Promise.all(changeSetElements.map(async fileChange => {
            if (fileChange.targetState.trim().length === 0) {
                return { type: 'clean' } satisfies ScanOSSResult;
            }
            const toScan = await this.getScanContent(fileChange);

            if (!toScan) { return { type: 'clean' } satisfies ScanOSSResult; }

            const cached = cache.get(toScan);
            if (cached) { return cached; }

            const result = { ...await this.scanService.scanContent(toScan, apiKey), file: fileChange.uri.path.toString() };
            if (result.type !== 'error') {
                cache.set(toScan, result);
            } else if (!notifiedError && userTriggered) {
                this.messageService.warn(nls.localize('theia/ai/scanoss/changeSet/error-notification', 'ScanOSS error encountered: {0}.', result.message));
            }

            return result;
        }));
        return fileResults;
    }

    protected async getScanContent(fileChange: ChangeSetFileElement): Promise<string> {
        if (fileChange.replacements) {
            return fileChange.replacements.map(({ newContent }) => newContent).join('\n\n').trim();
        }
        const textModels = await Promise.all([
            this.textModelService.createModelReference(fileChange.uri),
            this.textModelService.createModelReference(fileChange.changedUri)
        ]);

        const [original, changed] = textModels;
        const diff = await this.differ.computeDiff(
            original.object.textEditorModel,
            changed.object.textEditorModel,
            { maxComputationTimeMs: 5000, computeMoves: false, ignoreTrimWhitespace: true },
            CancellationToken.None
        );

        if (diff.identical) { return ''; }

        const insertions = diff.changes.filter(candidate => !candidate.modified.isEmpty);

        if (insertions.length === 0) { return ''; }

        const changedLinesInSuggestion = insertions.map(change => {
            const range = change.modified.toInclusiveRange();
            return range ? changed.object.textEditorModel.getValueInRange(range) : ''; // In practice, we've filtered out cases where the range would be null already.
        }).join('\n\n');

        textModels.forEach(ref => ref.dispose());
        return changedLinesInSuggestion.trim();
    }
}

interface ChangeSetScanActionProps {
    changeSet: ChangeSet;
    scanOssMode: string;
    scanChangeSet: (changeSet: ChangeSetElement[], cache: Map<string, ScanOSSResult>, userTriggered: boolean) => Promise<ScanOSSResult[]>
}

const ChangeSetScanOSSIntegration = React.memo(({
    changeSet,
    scanOssMode,
    scanChangeSet
}: ChangeSetScanActionProps) => {
    const [scanOSSResult, setScanOSSResult] = React.useState<ScanOSSResult[] | 'pending' | undefined>(undefined);
    const cache = React.useRef(new Map<string, ScanOSSResult>());
    const [changeSetElements, setChangeSetElements] = React.useState(() => changeSet.getElements().filter(candidate => candidate instanceof ChangeSetFileElement));

    React.useEffect(() => {
        if (scanOSSResult === undefined) {
            if (scanOssMode === 'automatic' && scanOSSResult === undefined) {
                setScanOSSResult('pending');
                scanChangeSet(changeSetElements, cache.current, false).then(result => setScanOSSResult(result));
            }
        }
    }, [scanOssMode, scanOSSResult]);

    React.useEffect(() => {
        const disposable = changeSet.onDidChange(() => {
            setChangeSetElements(changeSet.getElements().filter(candidate => candidate instanceof ChangeSetFileElement));
            setScanOSSResult(undefined);
        });
        return () => disposable.dispose();
    }, [changeSet]);

    const scanOSSClicked = React.useCallback(async () => {
        if (scanOSSResult === 'pending') {
            return;
        } else if (!scanOSSResult || scanOSSResult.some(candidate => candidate.type === 'error')) {
            setScanOSSResult('pending');
            scanChangeSet(changeSetElements, cache.current, true).then(result => setScanOSSResult(result));
        } else {
            const matches = scanOSSResult.filter((candidate): candidate is ScanOSSResultMatch => candidate.type === 'match');
            if (matches.length === 0) { return; }
            const dialog = new ScanOSSDialog(matches);
            dialog.open();
        }
    }, [scanOSSResult, changeSetElements]);

    const state = getResult(scanOSSResult);
    const content = getTitle(state);
    const title = `ScanOSS: ${content}`;
    const icon = getIcon(state);

    if (scanOssMode === 'off' || changeSetElements.length === 0) {
        return undefined;
    } else if (state === 'clean' || state === 'pending') {
        return <div
            className={`theia-button button theia-changeSet-scanOss ${state}`}
            title={title}
        >
            <span className={'scanoss-logo icon-container'} />
            {content}
            {icon}
        </div>;
    } else {
        return <button
            className={`theia-button theia-changeSet-scanOss ${state}`}
            title={title}
            onClick={scanOSSClicked}
        >
            <span className={'scanoss-logo icon-container'} />
            {content}
            {icon}
        </button>;
    }
});

function getResult(scanOSSResult: ScanOSSResultOptions): ScanOSSState {
    switch (true) {
        case scanOSSResult === undefined: return 'none';
        case scanOSSResult === 'pending': return 'pending';
        case (scanOSSResult as ScanOSSResult[]).some(candidate => candidate.type === 'error'): return 'error';
        case (scanOSSResult as ScanOSSResult[]).some(candidate => candidate.type === 'match'): return 'match';
        default: return 'clean';
    }
}

function getTitle(result: ScanOSSState): string {
    switch (result) {
        case 'none': return nls.localize('theia/ai/scanoss/changeSet/scan', 'Scan');
        case 'pending': return nls.localize('theia/ai/scanoss/changeSet/scanning', 'Scanning...');
        case 'error': return nls.localize('theia/ai/scanoss/changeSet/error', 'Error: Rerun');
        case 'match': return nls.localize('theia/ai/scanoss/changeSet/view-matches', 'View Matches');
        case 'clean': return nls.localize('theia/ai/scanoss/changeSet/clean', 'No Matches');
    }
}

function getIcon(result: ScanOSSState): React.ReactNode {
    switch (result) {
        case 'clean': return (<span className="status-icon">
            <span className="codicon codicon-pass-filled" />
        </span>);
        case 'match': return (<span className="status-icon">
            <span className="codicon codicon-warning" />
        </span>);
        case 'pending': return <i className="fa fa-spinner fa-spin" />;
        default: return undefined;
    }
}
