export const normalisedBaseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

export function pathFromBase(path: string) {
    return normalisedBaseUrl + "/" + path;
}
