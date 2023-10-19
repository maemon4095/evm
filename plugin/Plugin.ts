import { AsyncWorker } from "../asyncworker/AsyncWorker.ts";
import { InstallArtifacts, PluginProperties } from "./common.ts";

// plugin は deno の パーミッションを使わずに requestを受ける形にする．
export class Plugin {
    readonly #worker: AsyncWorker;

    constructor(url: string | URL) {
        this.#worker = new AsyncWorker(url);
    }

    async properties() {
        const response = await this.#worker.request({ type: "properties" });
        assertPluginProperties(response);
        return response;
    }

    async install(version: string, directory: string) {
        const response = await this.#worker.request({ type: "install", version, directory });
        assertInstallArtifacts(response);
        return response;
    }
}

function assertPluginProperties(maybeProps: unknown): asserts maybeProps is PluginProperties {


}

function assertInstallArtifacts(maybeInstallArtifacts: unknown): asserts maybeInstallArtifacts is InstallArtifacts {

}