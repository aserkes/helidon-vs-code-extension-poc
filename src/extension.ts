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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { showHelidonGenerator } from './generator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log(vscode.workspace.getConfiguration().get('helidon.showStartPage'));
	//if (vscode.workspace.getConfiguration().get('helidon.showStartPage')) {
	//	vscode.commands.executeCommand('helidon.startPage');
	//}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('\"Helidon generator\" extension is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// CTRL + SHIFT + P -> will show commands
	context.subscriptions.push(vscode.commands.registerCommand('helidon.generate', () => {
		// Display a message box to the user
		showHelidonGenerator();
	}));

	// context.subscriptions.push(vscode.commands.registerCommand('helidon.startPage', () => {
	// 	console.log("display start page");
	// 	let assets = vscode.Uri.file(path.join(context.extensionPath, "assets"));
	// 	let template = vscode.Uri.file(path.join(context.extensionPath, "assets", "Start_page.html"));

	// 	const webViewPanel = vscode.window.createWebviewPanel(
	// 		'helidonStartPage',
	// 		'Helidon - Start page',
	// 		{ viewColumn: vscode.ViewColumn.One, preserveFocus: false }, // Editor column to show the new webview panel in.
	// 		{
	// 			/*enableCommandUris: true,
	// 			enableScripts: true,
	// 			localResourceRoots: [assets]*/
	// 		}
	// 	);
	// 	webViewPanel.webview.html = fs.readFileSync(template.fsPath,'utf8');

	// 	//webViewPanel.s


	// }));

}

// this method is called when your extension is deactivated
export function deactivate() { }
