import { describe, expect, test } from "bun:test";

import { buildCardGraph } from "./card-graph.ts";

describe("card graph", () => {
    test("builds directed edges and keeps isolated cards", () => {
        const graph = buildCardGraph(
            [
                {
                    id: "alpha",
                    data: {
                        title: "Alpha",
                        type: "Place",
                        coverImageUrl: "https://example.com/alpha.jpg",
                        outgoingLinks: [
                            {
                                targetId: "beta",
                                count: 2,
                                terms: ["Beta", "the second"],
                            },
                        ],
                    },
                },
                {
                    id: "beta",
                    data: {
                        title: "Beta",
                        type: "Person",
                        outgoingLinks: [],
                    },
                },
                {
                    id: "isolated",
                    data: {
                        title: "Isolated",
                        type: "Event",
                        outgoingLinks: [],
                    },
                },
            ],
            (id) => `/d/${id}`,
        );

        expect(graph.nodes).toEqual([
            {
                id: "alpha",
                title: "Alpha",
                type: "Place",
                href: "/d/alpha",
                coverImageUrl: "https://example.com/alpha.jpg",
                incomingLinks: 0,
                outgoingLinks: 1,
            },
            {
                id: "beta",
                title: "Beta",
                type: "Person",
                href: "/d/beta",
                incomingLinks: 1,
                outgoingLinks: 0,
            },
            {
                id: "isolated",
                title: "Isolated",
                type: "Event",
                href: "/d/isolated",
                incomingLinks: 0,
                outgoingLinks: 0,
            },
        ]);
        expect(graph.edges).toEqual([
            {
                source: "alpha",
                target: "beta",
                targetId: "beta",
                count: 2,
                terms: ["Beta", "the second"],
            },
        ]);
    });
});
