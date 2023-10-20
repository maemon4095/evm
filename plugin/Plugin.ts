import { PathSafeString } from "../PathSafeString.ts";
import { AsyncWorker } from "../asyncworker/AsyncWorker.ts";
import { InstallArtifacts, PluginProperties } from "./common.ts";

type Maybe = { [key: string | symbol | number]: Maybe; } | null | undefined | string | number | boolean | bigint;

// plugin は deno の パーミッションを使わずに requestを受ける形にする．
export class Plugin {
    readonly #worker: AsyncWorker;

    constructor(url: string | URL) {
        this.#worker = new AsyncWorker(url, {

        });
    }

    async properties() {
        const request: PropertiesRequest = { type: "properties" };
        const response = await this.#worker.request(request);
        assertPluginProperties(response as Maybe);
        return response;
    }

    async install(version: PathSafeString, directory: string) {
        const request: InstallRequest = { type: "install", version, directory };
        const response = await this.#worker.request(request);
        assertInstallArtifacts(response as Maybe);
        return response;
    }
}

export type PropertiesRequest = { type: "properties"; };
export type InstallRequest = { type: "install", version: PathSafeString, directory: string; };


function assertPluginProperties(message: Maybe): asserts message is PluginProperties {
    if (message === null || message === undefined) {
        throwInvalidMessage(`message was ${message}.`);
    }

    if (typeof message !== "object") {
        throwInvalidMessage(`message was not object.`);
    }

    const target = message["target"];
    if (target === null || target === undefined) {
        throwInvalidMessage(`property "target" was ${target}.`);
    }

    if (typeof target !== "string") {
        throwInvalidMessage(`property "target" was not string.`);
    }
}

function assertInstallArtifacts(message: Maybe): asserts message is InstallArtifacts {
    if (message === null || message === undefined) {
        throwInvalidMessage(`message was ${message}.`);
    }

    if (typeof message !== "object") {
        throwInvalidMessage(`message was not object.`);
    }
}

function throwInvalidMessage(description: string): never {
    throw new Error(`plugin responded with invalid message; ${description}`);
}