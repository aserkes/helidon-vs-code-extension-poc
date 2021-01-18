import { commands } from "vscode";
import {VSCodeJavaCommands} from "./common";

export class ProjectInformation {
  uri: string;
  name: string | undefined;
  markers: ProjectMarker[];

  constructor(uri: string, markers: ProjectMarker[], name?: string) {
    this.uri = uri;
    this.name = name;
    this.markers = markers;
  }

  public static async getInformation(uri: string): Promise<ProjectInformation> {
    const projectInformation: { uri: string; name: string; markers: ProjectMarker[] } | undefined =
        await commands.executeCommand(
            "java.execute.workspaceCommand",
            VSCodeJavaCommands.JAVA_MARKERS_COMMAND,
            {uri}
        );
    return new ProjectInformation(
        projectInformation ? projectInformation.uri : uri,
        projectInformation ? projectInformation.markers : [],
        projectInformation ? projectInformation.name : undefined);
  }

  public isHelidonProject(): boolean {
    return this.markers.includes(ProjectMarker.HELIDON);
  }

}

enum  ProjectMarker {
  JAVA = 'java',
  HELIDON = 'helidon',
  Maven = 'maven'
}

