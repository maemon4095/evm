// deno-lint-ignore no-unused-vars
abstract class PathSafeStringMark {
    readonly #mark: undefined;
}

/** non empty string does not starts with - and only contains A to Z, a to z, 0 to 9, _, - and . */
export type PathSafeString = string & PathSafeStringMark;

export function isPathSafe(str: string): str is PathSafeString {
    const regex = /^[A-Za-z0-9_\.][A-Za-z0-9_\. -]+$/;
    return regex.test(str);
}
