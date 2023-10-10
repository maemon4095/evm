// deno-lint-ignore no-unused-vars
class PathSafeStringMark {
    static #SYMBOL = Symbol("identifer");

    constructor(symbol: symbol) {
        this.#symbol = symbol;
    }

    #symbol;
}

type PathSafeString = string & PathSafeStringMark;

function isPathSafe(str: string): str is PathSafeString {
    const regex = /[A-Za-z0-9_\-\. ]+/;
    return regex.test(str);
}

export type Args = PluginArgs | InstallArgs | UseArgs;

// evm plugin [--global | --local] ${identifier} ${url}
type PluginArgs = {
    type: "plugin";
    flag: "--global" | "--local" | null;
    identifier: PathSafeString;
    pluginURL: URL;
};

// evm install [--global | --local] ${identifier} ${version}
type InstallArgs = {
    type: "install";
    flag: "--global" | "--local" | null;
    identifier: PathSafeString;
    version: PathSafeString;
};

// evm use [--global | --local] ${identifier} ${version}
type UseArgs = {
    type: "use";
    flag: "--global" | "--local" | null;
    identifier: PathSafeString;
    version: PathSafeString;
};


export function args_from(args: string[]): Args {

    throw null;
}
