/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import {OutputChannel, QuickPickItem} from "vscode";
import * as path from 'path';
import {ChildProcess} from "child_process";
import {VSCodeAPI} from "./VSCodeAPI";
import {FileSystemAPI} from "./FileSystemAPI";
import {ChildProcessAPI} from "./ChildProcessAPI";
import {OutputFormatter} from "./OutputFormatter";

// const fs = require('fs');
const POM_XML_FILE: string = 'pom.xml';
const SRC_DIR: string = 'src';
const EXCLUDE_DIRS: RegExp[] = [/target/i, /^\./i];
// let currentProcess: ChildProcess;
const launchedServers: Map<string, HelidonServerInstance> = new Map();

// event
// https://code.visualstudio.com/api/references/vscode-api
// onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent>
// onDidSaveTextDocument: Event<TextDocument>
// CustomDocumentContentChangeEvent<T> - CustomDocumentProvider.onDidChangeCustomDocument.

export interface HelidonServerInstance {
    serverProcess: ChildProcess;
    outputChannel: OutputChannel;
    projectFolder: string;
    isActive: boolean;
}

export function addLaunchedServers(servers: Map<string, HelidonServerInstance>) {
    for (let [key, value] of servers) {
        launchedServers.set(key, value);
    }
}

export function getLaunchedServers(): Map<string, HelidonServerInstance> {
    return launchedServers;
}

export async function startHelidonDev(): Promise<Map<string, HelidonServerInstance>> {
    try {
        let helidonProjectDirs = getHelidonProjectDirs();
        let helidonProjectDir: string;

        if (helidonProjectDirs.length == 0) {
            return new Map();
        } else if (helidonProjectDirs.length == 1) {
            helidonProjectDir = helidonProjectDirs[0];
        } else {
            // let directory = await showOpenFolderDialog({ openLabel: 'Select folder with Helidon Project' });
            let directory = await obtainHelidonProjectDirToStart(helidonProjectDirs);

            if (!directory) {
                return new Map();
            }
            // helidonProjectDir = directory.fsPath;
            helidonProjectDir = directory.description!;
        }

        let helidonServer = obtainHelidonServerInstance(helidonProjectDir);
        launchedServers.set(path.basename(helidonProjectDir), helidonServer);
        return launchedServers;

    } catch (e) {
        // window.showErrorMessage(e);
        VSCodeAPI.showErrorMessage(e);
        return new Map();
    }
}

async function obtainHelidonProjectDirToStart(helidonProjectDirs: string[]): Promise<QuickPickItem | undefined> {

    let helidonProjectDirItems: QuickPickItem[] = [];
    helidonProjectDirs.forEach((value: string) => {

        helidonProjectDirItems.push({
            label: path.basename(value),
            description: value
        });
    });

    return await VSCodeAPI.showPickOption({
        title: "Choose a Helidon project that you want to start.",
        totalSteps: 1,
        currentStep: 1,
        placeholder: "Project name",
        items: helidonProjectDirItems
    });
}

function obtainHelidonServerInstance(helidonProjectDir: string): HelidonServerInstance {

    let helidonDirName = path.basename(helidonProjectDir);
    refreshLaunchedServers();

    if (launchedServers.has(helidonDirName)) {
        let helidonServer = launchedServers.get(helidonDirName)!;
        if (helidonServer.isActive) {
            helidonServer.outputChannel.show();
            return helidonServer;
        }
        //change existing instance
        helidonServer.serverProcess = obtainNewServerProcess(helidonProjectDir);
        helidonServer.outputChannel.show();
        configureServerOutput(helidonServer.serverProcess, helidonServer.outputChannel);
        helidonServer.isActive = true;

        return helidonServer;
    }

    //create new instance
    // let outputChannel = vscode.window.createOutputChannel(helidonDirName);
    let outputChannel = VSCodeAPI.createOutputChannel(helidonDirName);
    outputChannel.show();
    let serverProcess = obtainNewServerProcess(helidonProjectDir);
    configureServerOutput(serverProcess, outputChannel);


    return {
        serverProcess: serverProcess,
        outputChannel: outputChannel,
        projectFolder: helidonProjectDir,
        isActive: true
    };
}

function refreshLaunchedServers() {
    let helidonProjectDirs = getHelidonProjectDirs();
    launchedServers.forEach((server, name) => {
        if (!helidonProjectDirs.includes(server.projectFolder)) {
            launchedServers.delete(name);
        }
    });
}

function obtainNewServerProcess(helidonProjectDir: string): ChildProcess {
    let cmdSpan = "helidon";
    let args = ['dev'];
    let opts = {
        cwd: helidonProjectDir //cwd means -> current working directory (where this maven command will by executed)
    };
    // let serverProcess = require('child_process').spawn(cmdSpan, args, opts);
    let serverProcess = ChildProcessAPI.spawnProcess(cmdSpan, args, opts);
    return serverProcess;
}

function configureServerOutput(serverProcess: ChildProcess, outputChannel: OutputChannel) {

    let tempString: string = '';
    let stripAnsi = require('strip-ansi');
    let outputFormatter = new OutputFormatter(outputChannel);

    serverProcess!.stdout!.on('data', function (data: string) {
        outputFormatter.formatInputString(data);
        // data = data.toString();
        // console.log(data);

        // let countFinishedLines = data.match(/[\n\r]/g)?.length ?? 0;
        // if (countFinishedLines === 0) {
        //     tempString += data;
        //     return;
        // }
        // let splitData = data.split(/[\n\r]/g);
        // if (splitData[splitData.length - 1] === '') {
        //     splitData.splice(splitData.length - 1, 1);
        // }
        // let lastOutputLineIndex = 0;
        // if (splitData.length === countFinishedLines) {
        //     lastOutputLineIndex = countFinishedLines;
        //     outputLines(splitData, lastOutputLineIndex);
        // } else {
        //     lastOutputLineIndex = countFinishedLines;
        //     outputLines(splitData, lastOutputLineIndex);
        //     tempString = splitData[splitData.length - 1];
        // }
    });

    serverProcess!.stderr!.on('data', (data: string) => {
        console.error(data);
        // window.showErrorMessage(data);
        VSCodeAPI.showErrorMessage(data)
    });

    serverProcess.on('close', (code: string) => {
        outputChannel.appendLine("Server stopped");
    });

    // function outputLines(lines: string[], lastIndex: number) {
    //     for (let i = 0; i < lastIndex; i++) {
    //         if (i === 0) {
    //             outputChannel.appendLine(stripAnsi(tempString + lines[i]));
    //             tempString = '';
    //         } else {
    //             outputChannel.appendLine(stripAnsi(lines[i]));
    //         }
    //     }
    // }
}

export async function stopHelidonDev() {
    try {
        let currentHelidonServer: HelidonServerInstance;
        let activeServerNames = getActiveServerNames();
        if (activeServerNames.length == 0) {
            return;
        }
        // if (launchedServers.size == 0) {
        //     return;
        // }
        if (activeServerNames.length == 1) {//launchedServers.size == 1
            // currentHelidonServer = launchedServers.values().next().value;
            currentHelidonServer = launchedServers.get(activeServerNames[0])!;
            deactivateServer(currentHelidonServer);
            return;
        }

        let stopServerName = await obtainStopServerName();

        if (stopServerName) {
            // currentHelidonServer = launchedServers.get(stopServerName.label)!;
            currentHelidonServer = launchedServers.get(stopServerName)!;
            deactivateServer(currentHelidonServer);
        }

        // vscode.window.terminals.filter(terminal => terminal.name === 'helidon-bare-mp')[0].dispose();
        // vscode.window.terminals.filter(terminal => terminal.name === 'helidon-bare-mp')[0].show();
    } catch (e) {
        // window.showErrorMessage(e);
        VSCodeAPI.showErrorMessage(e)
        return;
    }
}

async function obtainStopServerName(): Promise<string | undefined> {

    let runningProjectNames: QuickPickItem[] = [];
    // launchedServers.forEach((value: HelidonServerInstance, key: string) => {
    //     if (value.isActive) {
    //         runningProjectNames.push({ label: key })
    //     }
    // });
    getActiveServerNames().forEach(name => runningProjectNames.push({label: name}));

    let stopServer = await VSCodeAPI.showPickOption({
        title: "Choose a server that you want to stop.",
        totalSteps: 1,
        currentStep: 1,
        placeholder: "Project name",
        items: runningProjectNames
    });

    return stopServer?.label;
}

function getActiveServerNames(): string[] {
    let runningProjectNames: string[] = [];
    launchedServers.forEach((value: HelidonServerInstance, key: string) => {
        if (value.isActive) {
            runningProjectNames.push(key);
        }
    });
    return runningProjectNames;
}


function deactivateServer(currentHelidonServer: HelidonServerInstance) {
    if (currentHelidonServer.isActive) {
        killProcess(currentHelidonServer.serverProcess);
        currentHelidonServer.isActive = false;
    }
}

function killProcess(process: ChildProcess) {
    // let kill = require('tree-kill');
    // kill(process.pid);
    ChildProcessAPI.killProcess(process.pid);
}


/**
 * Find folders that contain the specific file and src folder (root folder of the project)
 * @param searchFileName Name of the file for search
 * @param inputDirPaths Directories for search
 */
function getDirsByFileName(inputDirPaths: string[], searchFileName: string): string[] {
    let dirPaths: string[] = [];
    recursiveSearch(inputDirPaths, searchFileName);
    return dirPaths;

    function recursiveSearch(inputDirs: string[], searchFile: string) {
        for (let inputDir of inputDirs) {
            let searchFilePath = path.join(inputDir, searchFile);
            let srcDirPath = path.join(inputDir, SRC_DIR);
            // if (fs.existsSync(searchFilePath) && fs.existsSync(srcDirPath)) {
            if (FileSystemAPI.isPathExistsSync(searchFilePath) && FileSystemAPI.isPathExistsSync(srcDirPath)) {
                console.log("pomFilePath - " + searchFilePath);
                console.log("srcDirPath - " + srcDirPath);
                dirPaths.push(inputDir);
            }
            // fs.readdirSync(inputDir).forEach((file: string) => {
            FileSystemAPI.readDirSync(inputDir).forEach((file: string) => {
                let filePath = path.join(inputDir, file);
                // if (fs.lstatSync(filePath).isDirectory()) {
                if (FileSystemAPI.isDirectorySync(filePath)) {
                    // console.log("inputDir = ", inputDir);
                    if (!isDirMatchesPattern(filePath, EXCLUDE_DIRS)) {
                        // console.log("isDirectory = " + filePath);
                        recursiveSearch([filePath], searchFile);
                    }
                }
            });
        }
        return dirPaths;
    }
}

function isDirMatchesPattern(dirName: string, patterns: RegExp[]): boolean {
    // console.log("path.basename(dirName) - "+path.basename(dirName));
    for (let pattern of patterns) {
        if (pattern.test(path.basename(dirName))) {
            // console.log("path.basename(dirName) TRUE = "+path.basename(dirName));
            return true;
        }
    }
    return false;
}

function getHelidonProjectDirs(): string[] {
    let helidonProjectDirs: string[] = [];
    let rootDirPaths = getRootDirPaths();
    let MavenProjectDirs = getDirsByFileName(rootDirPaths, POM_XML_FILE);
    console.log("projectDirs - " + MavenProjectDirs.toString());
    for (let mavenProject of MavenProjectDirs) {
        let mavenProjectPomPath = path.join(mavenProject, POM_XML_FILE);
        let isHelidonProject = isPomFileContainsHelidonDependency(mavenProjectPomPath);
        console.log("mavenProject - " + mavenProjectPomPath);
        console.log("isHelidonProject - " + isHelidonProject);
        if (isHelidonProject) {
            helidonProjectDirs.push(mavenProject);
        }
    }
    return helidonProjectDirs;
}

function isPomFileContainsHelidonDependency(pomFilePath: string): boolean {
    let regex = /.*<dependency>[^<>]*<groupId>[^<>]*helidon[^<>]*<\/groupId>.*/isg
    // let pomContent = fs.readFileSync(pomFilePath, 'utf8');
    let pomContent = FileSystemAPI.readTextFileSync(pomFilePath, 'utf8');
    if (pomContent) {
        return regex.test(pomContent);
    }
    return false;
}

/**
 * Find full paths of the root directories for the current workspace
 */
function getRootDirPaths(): string[] {
    let dirs = VSCodeAPI.getWorkspaceFolders();//vscode.workspace.workspaceFolders;
    if (!dirs) {
        return [];
    }
    let dirPaths: string[] = [];
    for (let dir of dirs) {
        console.log("dir - " + dir.uri.fsPath);
        dirPaths.push(dir.uri.fsPath);
    }
    return dirPaths;
}
