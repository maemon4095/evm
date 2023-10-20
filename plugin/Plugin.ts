import { PathSafeString } from "../PathSafeString.ts";
import { AsyncWorker } from "../asyncworker/AsyncWorker.ts";
import { InstallArtifacts, PluginProperties } from "./common.ts";

// plugin は deno の パーミッションを使わずに requestを受ける形にする．
export class Plugin {
    readonly #worker: AsyncWorker;

    constructor(url: string | URL) {
        this.#worker = new AsyncWorker(url);
    }

    async properties() {
        const request: PropertiesRequest = { type: "properties" };
        const response = await this.#worker.request(request);
        assertPluginProperties(response);
        return response;
    }

    async install(version: PathSafeString, directory: string) {
        const request: InstallRequest = { type: "install", version, directory };
        const response = await this.#worker.request(request);
        assertInstallArtifacts(response);
        return response;
    }
}

export type PropertiesRequest = { type: "properties"; };
export type InstallRequest = { type: "install", version: PathSafeString, directory: string; };


function assertPluginProperties(maybeProps: unknown): asserts maybeProps is PluginProperties {


}

function assertInstallArtifacts(maybeInstallArtifacts: unknown): asserts maybeInstallArtifacts is InstallArtifacts {

}