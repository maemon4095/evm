export type PluginProperties = {
    target: string;
};

/** { name: path } pairs that installed executables */
export type PluginInstallArtifacts = {
    [name: string]: string;
};