import { AsyncWorker } from "./asyncworker/AsyncWorker.ts";

export type PluginProperty = {
    target: string;
};

export class Plugin {
    readonly #worker: AsyncWorker;

    constructor(url: string | URL) {
        this.#worker = new AsyncWorker(url);
    }

    async property() {
        return await this.#worker.request({ type: "property" }) as PluginProperty;
    }
}