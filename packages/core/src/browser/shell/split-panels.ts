// *****************************************************************************
// Copyright (C) 2018 TypeFox and others.
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

import { injectable } from 'inversify';
import { SplitPanel, SplitLayout, Widget } from '@lumino/widgets';

export interface SplitPositionOptions {
    /** The side of the side panel that shall be resized. */
    side?: 'left' | 'right' | 'top' | 'bottom';
    /** The duration in milliseconds, or 0 for no animation. */
    duration: number;
    /** When this widget is hidden, the animation is canceled. */
    referenceWidget?: Widget;
}

export interface MoveEntry extends SplitPositionOptions {
    parent: SplitPanel;
    index: number;
    started: boolean;
    ended: boolean;
    targetSize?: number;
    targetPosition?: number;
    startPosition?: number;
    startTime?: number;
    resolve?: (position: number) => void;
    reject?: (reason: string) => void;
}

@injectable()
export class SplitPositionHandler {

    private readonly splitMoves: MoveEntry[] = [];
    private currentMoveIndex: number = 0;

    /**
     * Set the position of a split handle asynchronously. This function makes sure that such movements
     * are performed one after another in order to prevent the movements from overriding each other.
     * When resolved, the returned promise yields the final position of the split handle.
     */
    setSplitHandlePosition(parent: SplitPanel, index: number, targetPosition: number, options: SplitPositionOptions): Promise<number> {
        const move: MoveEntry = {
            ...options,
            parent, targetPosition, index,
            started: false,
            ended: false
        };
        return this.moveSplitPos(move);
    }

    /**
     * Resize a side panel asynchronously. This function makes sure that such movements are performed
     * one after another in order to prevent the movements from overriding each other.
     * When resolved, the returned promise yields the final position of the split handle.
     */
    setSidePanelSize(sidePanel: Widget, targetSize: number, options: SplitPositionOptions): Promise<number> {
        if (targetSize < 0) {
            return Promise.reject(new Error('Cannot resize to negative value.'));
        }
        const parent = sidePanel.parent;
        if (!(parent instanceof SplitPanel)) {
            return Promise.reject(new Error('Widget must be contained in a SplitPanel.'));
        }
        let index = parent.widgets.indexOf(sidePanel);
        if (index > 0 && (options.side === 'right' || options.side === 'bottom')) {
            index--;
        }
        const move: MoveEntry = {
            ...options,
            parent, targetSize, index,
            started: false,
            ended: false
        };
        return this.moveSplitPos(move);
    }

    protected moveSplitPos(move: MoveEntry): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            move.resolve = resolve;
            move.reject = reject;
            if (this.splitMoves.length === 0) {
                setTimeout(this.animationFrame.bind(this), 10);
            }
            this.splitMoves.push(move);
        });
    }

    protected animationFrame(): void {
        const time = Date.now();
        const move = this.splitMoves[this.currentMoveIndex];
        let rejectedOrResolved = false;
        if (move.ended || move.referenceWidget && move.referenceWidget.isHidden) {
            this.splitMoves.splice(this.currentMoveIndex, 1);
            if (move.startPosition === undefined || move.targetPosition === undefined) {
                move.reject!('Panel is not visible.');
            } else {
                move.resolve!(move.targetPosition);
            }
            rejectedOrResolved = true;
        } else if (!move.started) {
            this.startMove(move, time);
            if (move.duration <= 0 || move.startPosition === undefined || move.targetPosition === undefined
                || move.startPosition === move.targetPosition) {
                this.endMove(move);
            }
        } else {
            const elapsedTime = time - move.startTime!;
            if (elapsedTime >= move.duration) {
                this.endMove(move);
            } else {
                const t = elapsedTime / move.duration;
                const start = move.startPosition || 0;
                const target = move.targetPosition || 0;
                const pos = start + (target - start) * t;
                (move.parent.layout as SplitLayout).moveHandle(move.index, pos);
            }
        }
        if (!rejectedOrResolved) {
            this.currentMoveIndex++;
        }
        if (this.currentMoveIndex >= this.splitMoves.length) {
            this.currentMoveIndex = 0;
        }
        if (this.splitMoves.length > 0) {
            setTimeout(this.animationFrame.bind(this));
        }
    }

    protected startMove(move: MoveEntry, time: number): void {
        if (move.targetPosition === undefined && move.targetSize !== undefined) {
            const { clientWidth, clientHeight } = move.parent.node;
            if (clientWidth && clientHeight) {
                switch (move.side) {
                    case 'left':
                        move.targetPosition = Math.max(Math.min(move.targetSize, clientWidth), 0);
                        break;
                    case 'right':
                        move.targetPosition = Math.max(Math.min(clientWidth - move.targetSize, clientWidth), 0);
                        break;
                    case 'top':
                        move.targetPosition = Math.max(Math.min(move.targetSize, clientHeight), 0);
                        break;
                    case 'bottom':
                        move.targetPosition = Math.max(Math.min(clientHeight - move.targetSize, clientHeight), 0);
                        break;
                }
            }
        }
        if (move.startPosition === undefined) {
            move.startPosition = this.getCurrentPosition(move);
        }
        move.startTime = time;
        move.started = true;
    }

    protected endMove(move: MoveEntry): void {
        if (move.targetPosition !== undefined) {
            (move.parent.layout as SplitLayout).moveHandle(move.index, move.targetPosition);
        }
        move.ended = true;
    }

    protected getCurrentPosition(move: MoveEntry): number | undefined {
        const layout = move.parent.layout as SplitLayout;
        let pos: number | null;
        if (layout.orientation === 'horizontal') {
            pos = layout.handles[move.index].offsetLeft;
        } else {
            pos = layout.handles[move.index].offsetTop;
        }
        // eslint-disable-next-line no-null/no-null
        if (pos !== null) {
            return pos;
        } else {
            return undefined;
        }
    }

}
