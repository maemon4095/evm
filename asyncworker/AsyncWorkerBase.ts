export abstract class AsyncWorkerBase {
    readonly #base: RawWorker;
    readonly #target: Map<string, WorkerHandler>;

    constructor(raw: RawWorker) {
        const target = new Map<string, WorkerHandler>();

        raw.addEventListener("message", e => {
            const data = e.data as { type: unknown; token: unknown; payload: unknown; };
            const type = data.type;

            assertMessageMemberIsString("type", type);
            assertMessageMemberIsString("token", data.token);

            switch (type) {
                case "request": {
                    this.#handleRequest(data as WorkerRequest);
                    break;
                }
                case "response": {
                    this.#handleResponse(data as WorkerResponse);
                    break;
                }
                default:
                    throw new InvalidMessageError({
                        reason: "invalidType",
                        type,
                        message: "the type was neither `request` nor `response`."
                    });
            }
        });
        raw.addEventListener("error", e => {
            for (const [_, handler] of target) {
                handler.reject(e);
            }
        });

        this.#target = target;
        this.#base = raw;
    }

    #handleResponse(data: WorkerResponse) {
        const target = this.#target;
        const token = data.token;
        const handler = target.get(token);

        if (handler === undefined) {
            throw new InvalidMessageError({
                reason: "invalidToken",
                token,
                message: "No request has the token were found."
            });
        }

        target.delete(token);
        handler.resolve(data.payload);
    }

    async #handleRequest(data: WorkerRequest) {
        const worker = this.#base;

        const token = data.token;
        const payload = data.payload;

        const result = await this.onrequest(payload);

        const message: WorkerResponse = {
            type: "response",
            token,
            payload: result
        };

        worker.postMessage(message);
    }

    async request(message: unknown): Promise<unknown> {
        const token = crypto.randomUUID();

        return await new Promise((resolve, reject) => {
            this.#target.set(token, { resolve, reject });
            this.#base.postMessage({ type: "request", token, payload: message } as WorkerRequest);
        });
    }

    protected abstract onrequest(message: unknown): Promise<unknown>;
}

type AsyncWorkerEvents = {
    message: MessageEvent<unknown>;
    error: ErrorEvent;
};

export type RawWorker = {
    postMessage(message: unknown, options?: StructuredSerializeOptions | undefined): void;
    addEventListener<K extends keyof AsyncWorkerEvents>(type: K, listener: (ev: AsyncWorkerEvents[K]) => unknown): void;
};

export class InvalidMessageError {
    #description;
    constructor(description: InvalidMessageErrorDescription) {
        this.#description = description;
    }

    get description() {
        return this.#description;
    }
}

export type InvalidMessageErrorDescription = {
    reason: "invalidToken";
    token: string;
    message: string;
} | {
    reason: "invalidType";
    type: unknown;
    message: string;
} | {
    reason: "memberNotString";
    name: string;
    value: unknown;
} | {
    reason: "memberMissing";
    name: string;
};

type WorkerRequest = {
    type: "request";
    token: string;
    payload: unknown;
};

type WorkerResponse = {
    type: "response";
    token: string;
    payload: unknown;
};


type WorkerHandler = {
    resolve: (arg: unknown) => void;
    reject: (arg: unknown) => void;
};

function assertMessageMemberIsString(name: string, value: unknown): asserts value is string {
    switch (value) {
        case undefined:
        case null: {
            throw new InvalidMessageError({ reason: "memberMissing", name });
        }
        default: break;
    }

    if (typeof value !== "string") {
        throw new InvalidMessageError({ reason: "memberNotString", name, value });
    }
}