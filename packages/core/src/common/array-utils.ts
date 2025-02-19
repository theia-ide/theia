// *****************************************************************************
// Copyright (C) 2023 Ericsson and others.
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

export namespace ArrayUtils {
    export interface Head<T> extends Array<T> {
        head(): T;
    }

    export interface Tail<T> extends Array<T> {
        tail(): T;
    }

    export interface Children<T> extends Array<T> {
        children(): Tail<T>
    }

    export const TailImpl = {
        tail<T>(this: Array<T>): T {
            return this[this.length - 1];
        },
    };

    export const HeadAndChildrenImpl = {
        head<T>(this: Array<T>): T {
            return this[0];
        },

        children<T>(this: Array<T>): Tail<T> {
            return Object.assign(this.slice(1), TailImpl);
        }
    };

    export interface HeadAndTail<T> extends Head<T>, Tail<T>, Children<T> { }

    export function asTail<T>(array: Array<T>): Tail<T> {
        return Object.assign(array, TailImpl);
    }

    export function asHeadAndTail<T>(array: Array<T>): HeadAndTail<T> {
        return Object.assign(array, HeadAndChildrenImpl, TailImpl);
    }

    export enum Sort {
        LeftBeforeRight = -1,
        RightBeforeLeft = 1,
        Equal = 0,
    }

    // Copied from https://github.com/microsoft/vscode/blob/9c29becfad5f68270b9b23efeafb147722c5feba/src/vs/base/common/arrays.ts
    /**
     * Performs a binary search algorithm over a sorted collection. Useful for cases
     * when we need to perform a binary search over something that isn't actually an
     * array, and converting data to an array would defeat the use of binary search
     * in the first place.
     *
     * @param length The collection length.
     * @param compareToKey A function that takes an index of an element in the
     *   collection and returns zero if the value at this index is equal to the
     *   search key, a negative number if the value precedes the search key in the
     *   sorting order, or a positive number if the search key precedes the value.
     * @return A non-negative index of an element, if found. If not found, the
     *   result is -(n+1) (or ~n, using bitwise notation), where n is the index
     *   where the key should be inserted to maintain the sorting order.
     */
    export function binarySearch2(length: number, compareToKey: (index: number) => number): number {
        let low = 0;
        let high = length - 1;

        while (low <= high) {
            const mid = ((low + high) / 2) | 0;
            const comp = compareToKey(mid);
            if (comp < 0) {
                low = mid + 1;
            } else if (comp > 0) {
                high = mid - 1;
            } else {
                return mid;
            }
        }
        return -(low + 1);
    }

    export function partition<T>(array: T[], filter: (e: T, idx: number, arr: T[]) => boolean | undefined): [T[], T[]] {
        const pass: T[] = [];
        const fail: T[] = [];
        array.forEach((e, idx, arr) => (filter(e, idx, arr) ? pass : fail).push(e));
        return [pass, fail];
    }

    /**
     * @returns New array with all falsy values removed. The original array IS NOT modified.
     */
    export function coalesce<T>(array: ReadonlyArray<T | undefined | null>): T[] {
        return <T[]>array.filter(e => !!e);
    }

    /**
     * groups array elements through a comparator function
     * @param data array of elements to group
     * @param compare comparator function: return of 0 means should group, anything above means not group
     * @returns array of arrays with grouped elements
     */
    export function groupBy<T>(data: ReadonlyArray<T>, compare: (a: T, b: T) => number): T[][] {
        const result: T[][] = [];
        let currentGroup: T[] | undefined = undefined;
        for (const element of data.slice(0).sort(compare)) {
            if (!currentGroup || compare(currentGroup[0], element) !== 0) {
                currentGroup = [element];
                result.push(currentGroup);
            } else {
                currentGroup.push(element);
            }
        }
        return result;
    }

    export function shallowEqual<T>(left: readonly T[], right: readonly T[]): boolean {
        if (left.length !== right.length) {
            return false;
        }
        for (let i = 0; i < left.length; i++) {
            if (left[i] !== right[i]) {
                return false;
            }
        }
        return true;
    }

    export function startsWith<T>(left: readonly T[], right: readonly T[]): boolean {
        if (right.length > left.length) {
            return false;
        }

        for (let i = 0; i < right.length; i++) {
            if (left[i] !== right[i]) {
                return false;
            }
        }
        return true;
    }
}
