/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { assert } from "https://deno.land/std@0.203.0/assert/assert.ts";
import { AsyncWorkerBase } from "../asyncworker/AsyncWorkerBase.ts";
import { PluginInstallRequest, PluginPropertiesRequest } from "./Plugin.ts";
import { PluginInstallArtifacts, PluginProperties } from "./common.ts";

export type PluginResponse = PluginProperties | PluginInstallArtifacts;

class PluginProxy extends AsyncWorkerBase {
    constructor() {
        super(self);
    }

    protected async onrequest(message: unknown): Promise<PluginResponse> {
        assertTypeIsString(message);

        switch (message.type) {
            case "install": {

                break;
            }

            case "properties": {
                return await self.properties();
            }

            default: {
                throw new Error(`invalid request; unrecongnized type "${message.type}"`);
            }
        }
    }
}

function assertTypeIsString(message: unknown): asserts message is { type: string; } {
    if (message === undefined || message === null) {
        throw new Error(`invalid request; message is ${message}`);
    }

    if (typeof message !== "object") {
        throw new Error(`invalid request; message is not object.`);
    }

    const msg = message as { type: unknown; };

    if (msg.type === null || msg.type === undefined) {
        throw new Error(`invalid request; property "type" is ${msg.type}`);
    }
    if (typeof msg.type !== "string") {
        throw new Error(`invalid request; property "type" is not string.`);
    }
}

const proxy = new PluginProxy();

// prevent tree shaking
Object.defineProperty(self, Symbol(), { value: proxy });




self.properties = () => { throw new Error(`plugin properties is not provided.`); };

declare global {
    // deno-lint-ignore no-var
    var properties: () => Promise<PluginProperties> | PluginProperties;
}