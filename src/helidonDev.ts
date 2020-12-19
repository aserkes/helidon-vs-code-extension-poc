/**
 * Copyright (c) 2020 Oracle and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {window} from "vscode";
import * as vscode from "vscode";
import {showOpenFolderDialog} from "./common";
import {Utils} from "vscode-uri";

export async function startHelidonDev() {

    async function getProjectDir() {
        let directory = await showOpenFolderDialog({openLabel:'Select folder'});
        let terminalName = directory?.fsPath ? Utils.basename(directory) : 'HelidonDev';
        let terminal = vscode.window.createTerminal({name: terminalName, cwd: directory?.fsPath});
        terminal.show(true);
        terminal.sendText('helidon dev');
    }

    try {
        getProjectDir();
    } catch (e) {
        window.showErrorMessage(e);
        return;
    }
}