/*
 * Copyright (C) 2018 Red Hat, Inc. and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

export class IdGenerator {
    private lastId: number;
    constructor(private prefix: string) {
        this.lastId = 0;
    }

    nextId(): string {
        return this.prefix + (++this.lastId);
    }
}
