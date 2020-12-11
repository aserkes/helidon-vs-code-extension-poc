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
import * as vscode from 'vscode';
import { showHelidonGenerator } from './generator';
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('helidon.generate', () => {
		showHelidonGenerator();
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('helidon.startPage', () => {
			// Create and show panel
			const panel = vscode.window.createWebviewPanel(
				'helidon_generator',
				'helidon',
				vscode.ViewColumn.One,
				{
					enableCommandUris: true,
					enableScripts: true
				}
			);

			// And set its HTML content
			vscode.workspace.openTextDocument(vscode.Uri.file(
				path.join(context.extensionPath, 'assets', 'start_page.html')
			).fsPath).then(
				doc => {
					panel.webview.html = doc.getText();
				}
			);
		})
	);

}

export function deactivate() { }
