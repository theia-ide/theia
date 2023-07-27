// *****************************************************************************
// Copyright (C) 2017 Ericsson and others.
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

/* note: this bogus test file is required so that
   we are able to run mocha unit tests on this
   package, without having any actual unit tests in it.
   This way a coverage report will be generated,
   showing 0% coverage, instead of no report.
   This file can be removed once we have real unit
   tests in place. */

describe('terminal package', () => {
    it('support code coverage statistics', () => true);
});
