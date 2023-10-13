// deno-lint-ignore no-unused-vars
abstract class PathSafeStringMark {
    readonly #mark: undefined;
}

/** non emptystring only contains A to Z, a to z, 0 to 9, _, - and . */
type PathSafeString = string & PathSafeStringMark;

function isPathSafe(str: string): str is PathSafeString {
    const regex = /^[A-Za-z0-9_\-\. ]+$/;
    return regex.test(str);
}


export type Args = ArgList | ArgPlugin | ArgInstall | ArgUse;

/** ... --location ${identifier} */
export type ArgLocation = {
    identifier: PathSafeString;
};

/** evm list [--location ${identifier}] [${identifier}] */
export type ArgList = {
    subCommand: "list";
    location: ArgLocation | null;
    identifier: PathSafeString | null;
};

/** evm plugin (install | uninstall) ${url} | evm plugin list */
export type ArgPlugin = {
    subCommand: "plugin";
    pluginSubCommand: ArgPluginInstall | ArgPluginUninstall | ArgPluginList;
};

/** ... install ${url} */
export type ArgPluginInstall = {
    subCommand: "install";
    pathOrURL: URL | string;
};

/** ... uninstall ${url} */
export type ArgPluginUninstall = {
    subCommand: "uninstall";
    pathOrURL: URL | string;
};

/** ... list */
export type ArgPluginList = {
    subCommand: "list";
};

/** evm install [--location ${identifier}] ${identifier} ${version} */
export type ArgInstall = {
    subCommand: "install";
    location: ArgLocation | null;
    identifier: PathSafeString;
    version: PathSafeString;
};

/** evm use ${identifier} ${version} */
export type ArgUse = {
    subCommand: "use";
    identifier: PathSafeString;
    version: PathSafeString;
};


export function parseArgs(args: string[]): Args {
    const SUBCOMMAND = "SUBCOMMAND";
    const usage = `evm \${${SUBCOMMAND}: list | plugin | install | use}`;
    if (args.length === 0) {
        throw new ArgumentMissingError(SUBCOMMAND, usage);
    }

    const subCommand = args[0];

    switch (subCommand) {
        case "list": {
            return parseRestOfList(args.slice(1));
        }
        case "plugin": {
            return parseRestOfPlugin(args.slice(1));
        }
        case "install": {
            return parseRestOfInstall(args.slice(1));
        }
        case "use": {
            return parseRestOfUse(args.slice(1));
        }
        default: {
            throw new InvalidArgumentError(SUBCOMMAND, `unrecognized subcommand: '${subCommand}'`, usage);
        }
    }
}

function parseRestOfList(args: string[]): ArgList {
    const LOCATION_IDENT = "LOCATION_IDENTIFIER";
    const IDENT = "IDENTIFIER";
    const usage = `evm list [--location \${${LOCATION_IDENT}}] [\${${IDENT}}]`;

    let location: ArgLocation | null = null;
    let identifier: PathSafeString | null = null;
    let index = 0;

    while (index < args.length) {
        const arg = args[index];
        index += 1;

        if (arg === "--location") {
            if (location !== null) {
                throw new UnexpectedArgumentError(args, usage);
            }

            const l = args.at(index);
            index += 1;

            if (l === undefined) {
                throw new ArgumentMissingError(LOCATION_IDENT, usage);
            }

            if (!isPathSafe(l)) {
                throw new InvalidArgumentError(LOCATION_IDENT, messageArgMustBePathSafe(LOCATION_IDENT), usage);
            }

            location = {
                identifier: l
            } as ArgLocation;
        } else {
            if (identifier !== null) {
                throw new UnexpectedArgumentError(args, usage);
            }

            if (!isPathSafe(arg)) {
                throw new InvalidArgumentError(IDENT, messageArgMustBePathSafe(IDENT), usage);
            }

            identifier = arg;
        }
    }

    return {
        subCommand: "list",
        identifier,
        location
    };
}

function parseRestOfPlugin(args: string[]): ArgPlugin {
    const PLUGIN_SUBCOMMAND = "PLUGIN_SUBCOMMAND";
    const usage = `evm plugin \${${PLUGIN_SUBCOMMAND}: install | uninstall | list} ...`;

    const mode = args.at(0);

    switch (mode) {
        case "install":
        case "uninstall": {
            return {
                subCommand: "plugin",
                pluginSubCommand: parseInstallOrUninstall(mode, args.slice(1))
            };
        }
        case "list": {
            const listUsage = `evm plugin list`;

            if (args.length > 1) {
                throw new UnexpectedArgumentError(args.slice(1), listUsage);
            }

            return {
                subCommand: "plugin",
                pluginSubCommand: { subCommand: "list" }
            };
        }
        case undefined: {
            throw new ArgumentMissingError(PLUGIN_SUBCOMMAND, usage);
        }
        default: {
            throw new InvalidArgumentError(PLUGIN_SUBCOMMAND, `unrecognized plugin subcommand: '${mode}'`, usage);
        }
    }
    function parseInstallOrUninstall(cmd: "install" | "uninstall", args: string[]): ArgPluginUninstall | ArgPluginInstall {
        const URL_VAR = "URL";
        const usage = `evm plugin ${cmd} \${${URL_VAR}}`;
        if (args.length > 1) {
            throw new UnexpectedArgumentError(args, usage);
        }
        const arg = args.at(0);

        if (arg === undefined) {
            throw new ArgumentMissingError(URL_VAR, usage);
        }

        let pathOrURL;

        try {
            pathOrURL = parsePathOrURL(arg);
        } catch (e) {
            if (e instanceof TypeError) {
                throw new InvalidArgumentError(URL_VAR, `${URL_VAR} must be valid path or url.`, usage);
            }
            throw e;
        }
        return { subCommand: cmd, pathOrURL };
    }
}

function parseRestOfInstall(args: string[]): ArgInstall {
    const LOCATION_IDENT = "LOCATION_IDENTIFIER";
    const IDENT = "IDENTIFIER";
    const VERSION = "VERSION";
    const usage = `evm install [--location \${${LOCATION_IDENT}}] \${${IDENT}} \${${VERSION}} `;

    let location: ArgLocation | null = null;
    let identifier: PathSafeString | null = null;
    let version: PathSafeString | null = null;
    let index = 0;

    while (index < args.length) {
        const arg = args[index];
        index += 1;

        if (arg === "--location") {
            if (location !== null) {
                throw new UnexpectedArgumentError(args, usage);
            }

            const l = args.at(index);
            index += 1;

            if (l === undefined) {
                throw new ArgumentMissingError(LOCATION_IDENT, usage);
            }

            if (!isPathSafe(l)) {
                throw new InvalidArgumentError(LOCATION_IDENT, l, usage);
            }

            location = {
                identifier: l
            };
            continue;
        }

        if (identifier === null) {
            if (!isPathSafe(arg)) {
                throw new InvalidArgumentError(IDENT, messageArgMustBePathSafe(IDENT), usage);
            }

            identifier = arg;
        } else if (version === null) {
            if (!isPathSafe(arg)) {
                throw new InvalidArgumentError(VERSION, messageArgMustBePathSafe(VERSION), usage);
            }

            version = arg;
        } else {
            throw new UnexpectedArgumentError(args, usage);
        }
    }

    if (identifier === null) {
        throw new ArgumentMissingError(IDENT, usage);
    }

    if (version === null) {
        throw new ArgumentMissingError(VERSION, usage);
    }

    return {
        subCommand: "install",
        location,
        identifier,
        version
    };
}
function parseRestOfUse(args: string[]): ArgUse {
    const IDENT = "IDENTIFIER";
    const VERSION = "VERSION";
    const usage = `evm use \${${IDENT}} \${${VERSION}} `;

    if (args.length > 2) {
        throw new UnexpectedArgumentError(args, usage);
    }

    const identifier = args.at(0);
    const version = args.at(1);

    if (identifier === undefined) {
        throw new ArgumentMissingError(IDENT, usage);
    }
    if (!isPathSafe(identifier)) {
        throw new InvalidArgumentError(IDENT, messageArgMustBePathSafe(IDENT), usage);
    }

    if (version === undefined) {
        throw new ArgumentMissingError(VERSION, usage);
    }
    if (!isPathSafe(version)) {
        throw new InvalidArgumentError(VERSION, messageArgMustBePathSafe(VERSION), usage);
    }

    return {
        subCommand: "use",
        identifier,
        version
    };
}


function parsePathOrURL(str: string): URL | string {
    // See RFC2396 3.1 Scheme Component: https://www.ietf.org/rfc/rfc2396.txt
    const StartsWithSchemePattern = /^(?<scheme>[A-Za-z][A-Za-z0-9+.-]*):.*$/;

    const match = str.match(StartsWithSchemePattern);
    if (match === null) {
        return str;
    }

    switch (Deno.build.os) {
        case "darwin":
        case "linux":
        case "freebsd":
        case "netbsd":
        case "aix":
        case "solaris":
        case "illumos":
            // posix path does not has drive letter
            return new URL(str);

        case "windows":
            break;
    }

    const scheme = match.groups!.scheme;

    if (scheme.length != 1) {
        // currently drive letter are always one character
        return new URL(str);
    }
    return str;
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

export class InvalidArgumentError {
    #name: string;
    #usage: string;
    #message: string;
    constructor(name: string, message: string, usage: string) {
        this.#name = name;
        this.#usage = usage;
        this.#message = message;
    }

    get name(): string {
        return this.#name;
    }

    get message(): string {
        return this.#message;
    }

    get usage(): string {
        return this.#usage;
    }
}

export class UnexpectedArgumentError {
    #usage: string;
    #unexpected: string[];
    constructor(unexpected: string[], usage: string) {
        this.#usage = usage;
        this.#unexpected = unexpected;
    }

    get unexpected(): string[] {
        return this.#unexpected;
    }

    get usage(): string {
        return this.#usage;
    }
}

function messageArgMustBePathSafe(ident: string) {
    return `${ident} must not contain other than A-Z, a-z, 0-9, - or _`;
}