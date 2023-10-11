// deno-lint-ignore no-unused-vars
class PathSafeStringMark {
    static #SYMBOL = Symbol();

    constructor(symbol: symbol) {
        this.#symbol = symbol;
    }

    #symbol;
}

/** non emptystring only contains A to Z, a to z, 0 to 9, _, - and . */
type PathSafeString = string & PathSafeStringMark;

function isPathSafe(str: string): str is PathSafeString {
    const regex = /[A-Za-z0-9_\-\. ]+/;
    return regex.test(str);
}


export type Args = ArgList | ArgPlugin | ArgInstall | ArgUse;

/** ... --location ${identifier} */
export type ArgLocation = {
    identifier: PathSafeString;
};

/** evm list [--location ${identifier}] [${identifier}] */
export type ArgList = {
    mode: "list";
    location: ArgLocation | null;
    identifier: PathSafeString | null;
};

/** evm plugin (install | uninstall) ${url} | evm plugin list */
export type ArgPlugin = {
    mode: "plugin";
    subMode: ArgPluginInstall | ArgPluginUninstall | ArgPluginList;
};

/** ... install ${url} */
export type ArgPluginInstall = {
    mode: "install";
    url: URL;
};

/** ... uninstall ${url} */;
export type ArgPluginUninstall = {
    mode: "uninstall";
    url: URL;
};

/** ... list */
export type ArgPluginList = {
    mode: "list";
};

/** evm install [--location ${identifier}] ${identifier} ${version} */
export type ArgInstall = {
    mode: "install";
    location: ArgLocation;
    identifier: PathSafeString;
    version: PathSafeString;
};

/** evm use ${identifier} ${version} */
export type ArgUse = {
    mode: "use";
    identifier: PathSafeString;
    version: PathSafeString;
};


export function parse_args(args: string[]): Args {
    const MODE = "MODE";
    const usage = `evm \${${MODE}}`;
    if (args.length === 0) {
        throw new ArgumentMissingError(MODE, usage);
    }

    const mode = args[0];

    switch (mode) {
        case "list": {
            return parse_rest_of_list(args.slice(1));
        }
        case "plugin": {
            return parse_rest_of_plugin(args.slice(1));
        }
        case "install": {
            break;
        }
        case "use": {
            break;
        }
        default: {
            throw new UnexpectedArgumentError(MODE, mode, usage);
        }
    }

    throw null;
}


function parse_rest_of_list(args: string[]): ArgList {
    const LOCATION_IDENT = "LOCATION_IDENT";
    const IDENT = "IDENT";
    const usage = `evm list [--location \${${LOCATION_IDENT}}] [\${${IDENT}}]`;

    let location = null;
    let identifier = null;
    let index = 0;

    while (index < args.length) {
        const arg = args[index];
        index += 1;

        if (arg === "--location") {
            if (location !== null) {
                throw new ArgumentDuplicatedError(LOCATION_IDENT, usage);
            }

            const l = args.at(index);
            index += 1;

            if (l === undefined) {
                throw new ArgumentMissingError(LOCATION_IDENT, usage);
            }

            if (!isPathSafe(l)) {
                throw new UnexpectedArgumentError(LOCATION_IDENT, l, usage);
            }

            location = {
                identifier: l
            } as ArgLocation;
        } else {
            if (identifier !== null) {
                throw new ArgumentDuplicatedError(IDENT, usage);
            }

            if (!isPathSafe(arg)) {
                throw new UnexpectedArgumentError(IDENT, arg, usage);
            }

            identifier = arg;
        }
    }

    return {
        mode: "list",
        identifier,
        location
    };
}

function parse_rest_of_plugin(args: string[]): ArgPlugin {
    const MODE = "MODE";
    const usage = `evm plugin \${MODE: install | uninstall | list} ...`;

    const mode = args.at(0);

    switch (mode) {
        case "install": {
            return {
                mode: "plugin",
                subMode: parse_install(args.slice(1))
            };
        }
        case "uninstall": {
            return {
                mode: "plugin",
                subMode: parse_uninstall(args.slice(1))
            };
        }
        case "list": {
            return {
                mode: "plugin",
                subMode: { mode: "list" }
            };
        }
        case undefined: {
            throw new ArgumentMissingError(MODE, usage);
        }
        default: {
            throw new UnexpectedArgumentError(MODE, mode, usage);
        }
    }
    function parse_install(args: string[]): ArgPluginInstall {
        const URL_VAR = "URL";
        const usage = `install \${${URL_VAR}}`;
        if (args.length > 1) {
            throw new UnexpectedArgumentError(URL_VAR, args.slice(1).join(", "), usage);
        }

        const url = args[0];

        return { mode: "install", url: new URL(url) };
    }

    function parse_uninstall(args: string[]): ArgPluginUninstall {
        const URL_VAR = "URL";
        const usage = `uninstall \${${URL_VAR}}`;
        if (args.length > 1) {
            throw new UnexpectedArgumentError(URL_VAR, args.slice(1).join(", "), usage);
        }

        const url = args[0];

        return { mode: "uninstall", url: new URL(url) };
    }
}



export class ArgumentMissingError {
    #name: string;
    #usage: string;
    constructor(name: string, usage: string) {
        this.#name = name;
        this.#usage = usage;
    }

    get name(): string {
        return this.#name;
    }

    get usage(): string {
        return this.#usage;
    }
}

export class UnexpectedArgumentError {
    #name: string;
    #usage: string;
    #unexpected: string;
    constructor(name: string, unexpected: string, usage: string) {
        this.#name = name;
        this.#usage = usage;
        this.#unexpected = unexpected;
    }

    get name(): string {
        return this.#name;
    }

    get unexpected(): string {
        return this.#unexpected;
    }

    get usage(): string {
        return this.#usage;
    }
}

export class ArgumentDuplicatedError {
    #name: string;
    #usage: string;
    constructor(name: string, usage: string) {
        this.#name = name;
        this.#usage = usage;
    }

    get name(): string {
        return this.#name;
    }

    get usage(): string {
        return this.#usage;
    }
}