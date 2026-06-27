import { describe, expect, test } from "bun:test";
import { load } from "cheerio";

import { buildCardLinkIndex, linkCardHtml } from "./card-links.ts";

const hrefForId = (id: string) => `/d/${id}`;

describe("card auto-linking", () => {
    test("links titles and aliases only in paragraphs and list items", () => {
        const index = buildCardLinkIndex([
            { id: "places/haven", title: "Haven" },
            {
                id: "places/earth",
                title: "Earth",
                aliases: ["the old world"],
            },
        ]);
        const linked = linkCardHtml({
            html: `
                <h2>Haven and Earth</h2>
                <p>Haven, Earth, and the old world.</p>
                <ul><li>Haven</li></ul>
                <figcaption><p>Haven and Earth</p></figcaption>
                <table><tr><td>Haven</td></tr></table>
            `,
            sourceId: "another-card",
            index,
            hrefForId,
        });
        const $ = load(linked.html, null, false);

        expect($("p > a, li > a").length).toBe(4);
        expect($("h2 a, figcaption a, td a").length).toBe(0);
        expect(linked.outgoingLinks).toEqual([
            {
                targetId: "places/earth",
                count: 2,
                terms: ["Earth", "the old world"],
            },
            { targetId: "places/haven", count: 2, terms: ["Haven"] },
        ]);
    });

    test("does not link existing links, code, preformatted text, or the source card", () => {
        const index = buildCardLinkIndex([
            { id: "places/haven", title: "Haven" },
            { id: "places/earth", title: "Earth" },
        ]);
        const linked = linkCardHtml({
            html: `
                <p><a href="/somewhere">Haven</a> <code>Haven</code> Earth Haven</p>
                <pre>Haven</pre>
            `,
            sourceId: "places/earth",
            index,
            hrefForId,
        });
        const $ = load(linked.html, null, false);

        expect($("a[data-card-link]").length).toBe(1);
        expect($("a[data-card-link]").text()).toBe("Haven");
        expect(linked.outgoingLinks).toEqual([
            { targetId: "places/haven", count: 1, terms: ["Haven"] },
        ]);
    });

    test("is case-sensitive, respects word boundaries, and prefers longer terms", () => {
        const index = buildCardLinkIndex([
            { id: "places/haven", title: "Haven" },
            { id: "places/haven-spaceport", title: "Haven Spaceport" },
        ]);
        const linked = linkCardHtml({
            html: "<p>Haven Spaceport is near Haven, not haven or Havenly.</p>",
            sourceId: "another-card",
            index,
            hrefForId,
        });
        const $ = load(linked.html, null, false);

        expect(
            $("a[data-card-link]")
                .map((_, element) => ({
                    id: $(element).attr("data-card-link"),
                    text: $(element).text(),
                }))
                .get(),
        ).toEqual([
            { id: "places/haven-spaceport", text: "Haven Spaceport" },
            { id: "places/haven", text: "Haven" },
        ]);
    });

    test("rejects terms shared by different cards", () => {
        expect(() =>
            buildCardLinkIndex([
                { id: "one", title: "First", aliases: ["Shared"] },
                { id: "two", title: "Shared" },
            ]),
        ).toThrow('Auto-link term "Shared" belongs to both "one" and "two"');
    });
});
