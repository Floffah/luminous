import { describe, expect, test } from "bun:test";

import { typstEntryId } from "./typst-path.ts";

describe("typstEntryId", () => {
    test.each([
        ["luminous.typ", "luminous"],
        ["luminous/index.typ", "luminous"],
        ["guides/luminous/index.typ", "guides/luminous"],
        ["index.typ", "index"],
        ["guides/indexing.typ", "guides/indexing"],
    ])("maps %s to %s", (path, expected) => {
        expect(typstEntryId(path)).toBe(expected);
    });
});
