export function typstEntryId(path: string) {
    const id = path.slice(0, -".typ".length);

    return id.endsWith("/index") ? id.slice(0, -"/index".length) : id;
}
