/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { AsyncWorkerBase } from "./AsyncWorkerBase.ts";

class AsyncWorkerProxy extends AsyncWorkerBase {
    constructor() {
        super(self);
    }

    protected async onrequest(message: unknown): Promise<unknown> {
        if (self.onrequest === undefined) {
            throw new Error(`unhandled request; handler was not given.`);
        }
        return await self.onrequest(message);
    }
}


const proxy = new AsyncWorkerProxy();

// prevent tree shaking
Object.defineProperty(self, Symbol(), { value: proxy });

export async function request(message: unknown) {
    return await proxy.request(message);
}

self.onrequest = undefined;

declare global {
    // deno-lint-ignore no-var
    var onrequest: ((message: unknown) => unknown) | undefined;
}