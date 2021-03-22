/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { ChildProcess } from "child_process";

export class ChildProcessAPI {

    public static spawnProcess(command: String, args: string[], options: Object): ChildProcess {
        return require('child_process').spawn(command, args, options);
    }

    public static execProcess(command: String, options: Object, callback: Function): ChildProcess {
        return require('child_process').exec(command, options, callback);
    }

    public static killProcess(processPid: number){
        let kill = require('tree-kill');
        kill(processPid);
    }
}