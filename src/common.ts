/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { QuickPickItem } from "vscode";
import * as vscode from "vscode";

export interface QuickPickData {
    title: string;
    placeholder: string;
    totalSteps: number;
    currentStep: number;
    items: QuickPickItem[];
}

// VS Code Helidon extension commands
export namespace VSCodeHelidonCommands {
    export const GENERATE_PROJECT = 'helidon.generate';
    export const DEV_SERVER_START = 'helidon.startDev';
    export const DEV_SERVER_STOP = 'helidon.stopDev';
    export const START_PAGE = 'helidon.startPage';
}

export namespace VSCodeJavaCommands {
    export const JAVA_MARKERS_COMMAND = 'microprofile/java/projectLabels';
}

export function getPageContent(pagePath: string) :Thenable<string> {
    return vscode.workspace.openTextDocument(vscode.Uri.file(pagePath).fsPath)
        .then(doc => doc.getText());
}

export function validateUserInput (userInput: string, pattern: RegExp, errorMessage: string) : string | undefined {
    if (!pattern.test(userInput)) {
        return errorMessage;
    }
    return undefined;
}

// export async function showPickOption(data: QuickPickData) {
//     return await new Promise<QuickPickItem | undefined>((resolve, reject) => {
//         let quickPick = window.createQuickPick();
//         quickPick.title = data.title;
//         quickPick.totalSteps = data.currentStep;
//         quickPick.step = data.currentStep;
//         quickPick.items = data.items;
//         quickPick.ignoreFocusOut = true;
//         quickPick.canSelectMany = false;
//         quickPick.placeholder = data.placeholder;
//
//         quickPick.show();
//         quickPick.onDidAccept(async () => {
//             if (quickPick.selectedItems[0]) {
//                 resolve(quickPick.selectedItems[0]);
//                 quickPick.dispose();
//             }
//         });
//         quickPick.onDidHide(() => {
//             quickPick.dispose();
//         });
//     });
// }