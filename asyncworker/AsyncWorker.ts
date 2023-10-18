import { AsyncWorkerBase } from "./AsyncWorkerBase.ts";

export type AsyncWorkerOptions = { requestHandler?: (message: unknown) => unknown; } & WorkerOptions;

export class AsyncWorker extends AsyncWorkerBase {
    #handler: ((message: unknown) => unknown) | undefined;

    constructor(url: string | URL, options?: AsyncWorkerOptions) {
        super(new Worker(url, options));
        this.#handler = options?.requestHandler;
    }

    async onrequest(message: unknown): Promise<unknown> {
        const handler = this.#handler;

        if (handler === undefined) {
            throw new Error(`unhandled request; handler was not given.`);
        }

        return await handler(message);
    }
}