import { sep } from "node:path";

export function toPosixPath(path: string) {
    return path.split(sep).join("/");
}

export function isTypstEntryPath(path: string) {
    const fileName = path.split("/").at(-1);

    return (
        path.endsWith(".typ") &&
        path !== ".." &&
        !path.startsWith("../") &&
        !fileName?.startsWith("_")
    );
}

export function typstEntryId(path: string) {
    const id = path.slice(0, -".typ".length);

    return id.endsWith("/index") ? id.slice(0, -"/index".length) : id;
}
