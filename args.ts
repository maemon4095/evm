export type Args = {

};


// evm use [--global | --local] ${name} ${version}
type UseArgs = {
    type: "use";
};


export function args_from(args: string[]): Args {
    throw null;
}