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

import {OpenDialogOptions, Uri, window} from "vscode";
import * as vscode from "vscode";

// VS Code Helidon extension commands
export namespace VSCodeHelidonCommands {
    export const GENERATE_PROJECT = 'helidon.generate';
    export const DEV_SERVER_START = 'helidon.startDev';
    export const START_PAGE = 'helidon.startPage';
}

export async function showOpenFolderDialog(customOptions: OpenDialogOptions): Promise<Uri | undefined> {
    const openDialogOptions: OpenDialogOptions = {
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
    };

    const result: Uri[] | undefined = await window.showOpenDialog(Object.assign(openDialogOptions, customOptions));
    if (result && result.length > 0) {
        return Promise.resolve(result[0]);
    } else {
        return Promise.resolve(undefined);
    }
}

export function getPageContent(pagePath: string) :Thenable<string> {
    return vscode.workspace.openTextDocument(vscode.Uri.file(pagePath).fsPath)
        .then(doc => doc.getText());
}