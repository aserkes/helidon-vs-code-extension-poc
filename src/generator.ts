/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as path from 'path';
import { Uri, QuickPickItem } from 'vscode';
import {validateUserInput} from "./common";
import {InputBoxData, VSCodeAPI} from "./VSCodeAPI";
import {FileSystemAPI} from "./FileSystemAPI";
import {ChildProcessAPI} from "./ChildProcessAPI";

export interface ProjectData extends QuickPickItem {
    projectName: string;
    packages: string;
}

export async function showHelidonGenerator() {

    const NUMBER_OF_STEPS = 4;

    const DEFAULT_ARCHETYPE_VERSION = "2.0.1";

    const PROJECT_READY: string = 'Your new project is ready.';
    const NEW_WINDOW: string = 'Open in new window';
    const CURRENT_WINDOW: string = 'Open in current window';
    const ADD_TO_WORKSPACE: string = 'Add to current workspace';

    const SELECT_FOLDER = 'Select folder';
    const OVERWRITE_EXISTING = 'Overwrite';
    const NEW_DIR = 'Choose new directory';
    const EXISTING_FOLDER = ' already exists in selected directory.';

    // interface InputBoxData {
    //     title: string;
    //     placeholder: string;
    //     value: string;
    //     prompt: string;
    //     totalSteps: number;
    //     currentStep: number;
    //     messageValidation: (value: string) => Promise<string | undefined>;
    // }

    interface GeneratedProjectData {
        projectData: ProjectData;
        groupId: string;
        artifactId: string;
        packages: string;
        archetypeVersion: string;
    }

    const quickPickItems: ProjectData[] = [
        { label: "Helidon MP Bare", projectName: "helidon-bare-mp", packages: "io.helidon.examples.bare.mp" },
        { label: "Helidon MP Database", projectName: "helidon-database-mp", packages: "io.helidon.examples.database.mp" },
        { label: "Helidon MP Quickstart", projectName: "helidon-quickstart-mp", packages: "io.helidon.examples.quickstart.mp" },
        { label: "Helidon SE Bare", projectName: "helidon-bare-se", packages: "io.helidon.examples.bare.se" },
        { label: "Helidon SE Database", projectName: "helidon-database-se", packages: "io.helidon.examples.database.se" },
        { label: "Helidon SE Quickstart", projectName: "helidon-quickstart-se", packages: "io.helidon.examples.quickstart.se" }
    ];

    // async function showInputBox(data: InputBoxData) {
    //     return await new Promise<string | undefined>((resolve, rejects) => {
    //         // let inputBox = window.createInputBox();
    //         let inputBox = VSCodeAPI.createInputBox();
    //         inputBox.title = data.title;
    //         inputBox.placeholder = data.placeholder;
    //         inputBox.prompt = data.prompt;
    //         inputBox.value = data.value;
    //         inputBox.totalSteps = data.totalSteps;
    //         inputBox.step = data.currentStep;
    //         inputBox.ignoreFocusOut = true;
    //
    //         inputBox.show();
    //         inputBox.onDidAccept(async () => {
    //             let t = inputBox.value;
    //             let validation: string | undefined = await data.messageValidation(t);
    //             if (validation) {
    //                 inputBox.validationMessage = validation;
    //             } else {
    //                 inputBox.dispose();
    //                 resolve(t);
    //             }
    //         });
    //         inputBox.onDidChangeValue(async text => {
    //             let validation: string | undefined = await data.messageValidation(text);
    //             inputBox.validationMessage = validation;
    //         });
    //         inputBox.onDidHide(() => {
    //             inputBox.dispose();
    //         });
    //     });
    // }

    async function showInputBox(data: InputBoxData) {
        return VSCodeAPI.showInputBox(data);
    }

     async function obtainTypeOfProject(projectState: Partial<GeneratedProjectData>) {

         // projectState.projectData = (<ProjectData>await showPickOption({
         //     title: "Choose project you want to generate.",
         //     totalSteps: NUMBER_OF_STEPS,
         //     currentStep: 1,
         //     placeholder: "Project type",
         //     items: quickPickItems
         // }));

         projectState.projectData = (<ProjectData>await VSCodeAPI.showPickOption({
             title: "Choose project you want to generate.",
             totalSteps: NUMBER_OF_STEPS,
             currentStep: 1,
             placeholder: "Project type",
             items: quickPickItems
         }));

         await obtainGroupId(projectState);
     }

    // async function obtainGroupId(projectState: Partial<GeneratedProjectData>) {
    //     projectState.groupId = await showInputBox({
    //         title: "Select your project groupId",
    //         placeholder: "Project groupId",
    //         value: "io.helidon.examples",
    //         prompt: "Type in your project groupId",
    //         totalSteps: NUMBER_OF_STEPS,
    //         currentStep: 2,
    //         messageValidation: groupIdValidator
    //     });
    //
    //     return obtainArtefactId(projectState);
    // }

    async function obtainGroupId(projectState: Partial<GeneratedProjectData>) {
        projectState.groupId = await VSCodeAPI.showInputBox({
            title: "Select your project groupId",
            placeholder: "Project groupId",
            value: "io.helidon.examples",
            prompt: "Type in your project groupId",
            totalSteps: NUMBER_OF_STEPS,
            currentStep: 2,
            messageValidation: groupIdValidator
        });

        return await obtainArtefactId(projectState);
    }

    // async function groupIdValidator(value: string): Promise<string | undefined> {
    //     const exp = new RegExp("^[a-z\.]*$");
    //     if (!exp.test(value)) {
    //         return "This groupId is not valid. Use only words separated by dots.";
    //     }
    //     return undefined;
    // }

    function groupIdValidator(value: string): string | undefined {
        const exp = new RegExp("^[a-z\.]*$");
        const errorMessage = "This groupId is not valid. Use only words separated by dots.";
        return validateUserInput(value, exp, errorMessage);
    }

    async function obtainArtefactId(projectState: Partial<GeneratedProjectData>) {
        projectState.artifactId = await showInputBox({
            title: "Select your project artefactId",
            placeholder: "Project artefactId",
            value: projectState.projectData ? projectState.projectData.projectName : "helidon-project",
            prompt: "Type in your project artefactId",
            totalSteps: NUMBER_OF_STEPS,
            currentStep: 3,
            messageValidation: artefactIdValidator
        });

        return await obtainPackages(projectState);
    }

    // async function artefactIdValidator(value: string): Promise<string | undefined> {
    //     const exp = new RegExp("^[a-z\-]*$");
    //     if (!exp.test(value)) {
    //         return "This artefactId is not valid. Use only words separated by -";
    //     }
    //     return undefined;
    // }

    function artefactIdValidator(value: string): string | undefined {
        const exp = new RegExp("^[a-z\-]*$");
        const errorMessage = "This artefactId is not valid. Use only words separated by -";
        return validateUserInput(value, exp, errorMessage);
    }

    async function obtainPackages(projectState: Partial<GeneratedProjectData>) {
        let packages = projectState.projectData ? projectState.projectData.packages : "io.helidon.examples.quickstart";

        projectState.packages = await showInputBox({
            title: "Select your project package structure",
            placeholder: packages,
            value: packages,
            prompt: "Type in your project package structure",
            totalSteps: NUMBER_OF_STEPS,
            currentStep: 4,
            messageValidation: packagesValidator
        });

        return await generateProject(projectState as GeneratedProjectData);
    }

    // async function packagesValidator(value: string): Promise<string | undefined> {
    //     const exp = new RegExp("^[a-zA-Z\.]*$");
    //     if (!exp.test(value)) {
    //         return "This package structure is not valid. Use only words separated by dots.";
    //     }
    //     return undefined;
    // }

    function packagesValidator(value: string): string | undefined {
        const exp = new RegExp("^[a-zA-Z\.]*$");
        const errorMessage = "This package structure is not valid. Use only words separated by dots.";
        return validateUserInput(value, exp, errorMessage);
    }

    async function generateProject(projectData: GeneratedProjectData) {
        const targetDir = await obtainTargetFolder(projectData.artifactId);
        if (!targetDir) {
            throw new Error('Helidon project generation has been canceled.');
        }

        // window.showInformationMessage('Your Helidon project is being created...');
        VSCodeAPI.showInformationMessage('Your Helidon project is being created...');

        let cmd = "mvn archetype:generate -DinteractiveMode=false \
            -DarchetypeGroupId=io.helidon.archetypes \
            -DarchetypeArtifactId=" + projectData.projectData.projectName + " \
            -DarchetypeVersion=" + projectData.archetypeVersion + " \
            -DgroupId=" + projectData.groupId + " \
            -DartifactId=" + projectData.artifactId + " \
            -Dpackage=" + projectData.packages;


        let opts = {
            cwd: targetDir.fsPath //cwd means -> current working directory (where this maven command will by executed)
        };

        // const exec = require('child_process').exec;
        
        // await exec(cmd, opts, function (error: string, stdout: string, stderr: string) {
        //     console.log(stdout);
        //     if (stdout.includes("BUILD SUCCESS")) {
        //         window.showInformationMessage('Project generated...');
        //         openPreparedProject(targetDir, projectData.artifactId);
        //     } else if (stdout.includes("BUILD FAILURE")) {
        //         window.showInformationMessage('Project generation failed...');
        //     }
        //     if (stderr) {
        //         console.log(stderr);
        //     }
        //     if (error) {
        //         console.log(error);
        //     }
        // });

        ChildProcessAPI.execProcess(cmd, opts, function (error: string, stdout: string, stderr: string) {
            console.log(stdout);
            if (stdout.includes("BUILD SUCCESS")) {
                // window.showInformationMessage('Project generated...');
                VSCodeAPI.showInformationMessage('Project generated...');
                openPreparedProject(targetDir, projectData.artifactId);
            } else if (stdout.includes("BUILD FAILURE")) {
                // window.showInformationMessage('Project generation failed...');
                VSCodeAPI.showInformationMessage('Project generation failed...');
            }
            if (stderr) {
                console.log(stderr);
            }
            if (error) {
                console.log(error);
            }
        });
    }

    async function obtainTargetFolder(projectName: string) {
        const specificFolderMessage = `'${projectName}'` + EXISTING_FOLDER;

        let directory: Uri | undefined = await VSCodeAPI.showOpenFolderDialog({ openLabel: SELECT_FOLDER });

        while (directory && FileSystemAPI.isPathExistsSync(path.join(directory.fsPath, projectName))) {
            // const choice: string | undefined = await window.showWarningMessage(specificFolderMessage, OVERWRITE_EXISTING, NEW_DIR);
            const choice: string | undefined = await VSCodeAPI.showWarningMessage(specificFolderMessage, OVERWRITE_EXISTING, NEW_DIR);
            if (choice === OVERWRITE_EXISTING) {
                //Following line deletes target folder recursively
                require("rimraf").sync(path.join(directory.fsPath, projectName));
                break;
            } else if (choice === NEW_DIR) {
                directory = await VSCodeAPI.showOpenFolderDialog({ openLabel: SELECT_FOLDER });
            } else {
                directory = undefined;
                break;
            }
        }

        return directory;
    }

    async function openPreparedProject(targetDir: Uri, artifactId: string): Promise<void> {

        const openFolderCommand = 'vscode.openFolder';
        const newProjectFolderUri = getNewProjectFolder(targetDir, artifactId);

        // if (workspace.workspaceFolders) {
        if (VSCodeAPI.getWorkspaceFolders()) {
            // const input: string | undefined = await window.showInformationMessage(PROJECT_READY, NEW_WINDOW, ADD_TO_WORKSPACE);
            const input: string | undefined = await VSCodeAPI.showInformationMessage(PROJECT_READY, NEW_WINDOW, ADD_TO_WORKSPACE);
            if (!input) {
                return;
            } else if (input === ADD_TO_WORKSPACE) {
                // workspace.updateWorkspaceFolders(
                //     workspace.workspaceFolders ? workspace.workspaceFolders.length : 0,
                //     undefined,
                //     { uri: newProjectFolderUri }
                // );
                VSCodeAPI.updateWorkspaceFolders(
                    VSCodeAPI.getWorkspaceFolders() ? VSCodeAPI.getWorkspaceFolders()!.length : 0,
                    undefined,
                    { uri: newProjectFolderUri }
                );
            } else {
                // commands.executeCommand(openFolderCommand, newProjectFolderUri, true);
                VSCodeAPI.executeCommand(openFolderCommand, newProjectFolderUri, true);
            }
        // } else if (window.visibleTextEditors.length > 0) {
        } else if (VSCodeAPI.getVisibleTextEditors().length > 0) {
            //If VS does not have any project opened, but has some file opened in it.
            // const input: string | undefined = await window.showInformationMessage(PROJECT_READY, NEW_WINDOW, CURRENT_WINDOW);
            const input: string | undefined = await VSCodeAPI.showInformationMessage(PROJECT_READY, NEW_WINDOW, CURRENT_WINDOW);
            if (input) {
                // commands.executeCommand(openFolderCommand, newProjectFolderUri, NEW_WINDOW === input);
                VSCodeAPI.executeCommand(openFolderCommand, newProjectFolderUri, NEW_WINDOW === input);
            }
        } else {
            // commands.executeCommand(openFolderCommand, newProjectFolderUri, false);
            VSCodeAPI.executeCommand(openFolderCommand, newProjectFolderUri, false);
        }

    }

    function getNewProjectFolder(targetDir: Uri, artifactId: string): Uri {
        return Uri.file(path.join(targetDir.fsPath, artifactId));
    }

    try {
        await obtainTypeOfProject({
            archetypeVersion: DEFAULT_ARCHETYPE_VERSION
        });
    } catch (e) {
        // window.showErrorMessage(e);
        VSCodeAPI.showErrorMessage(e);
    }

}
