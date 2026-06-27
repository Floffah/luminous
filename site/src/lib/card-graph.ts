import type { CardLinkEdge } from "./card-links.ts";

export interface CardGraphSource {
    id: string;
    data: {
        title: string;
        type: string;
        coverImageUrl?: string;
        outgoingLinks: CardLinkEdge[];
    };
}

export interface CardGraphNode {
    id: string;
    title: string;
    type: string;
    href: string;
    coverImageUrl?: string;
    incomingLinks: number;
    outgoingLinks: number;
}

export interface CardGraphEdge extends CardLinkEdge {
    source: string;
    target: string;
}

export interface CardGraphData {
    nodes: CardGraphNode[];
    edges: CardGraphEdge[];
}

export function buildCardGraph(
    docs: CardGraphSource[],
    hrefForId: (id: string) => string,
): CardGraphData {
    const nodeById = new Map(
        docs.map((doc) => [
            doc.id,
            {
                id: doc.id,
                title: doc.data.title,
                type: doc.data.type,
                href: hrefForId(doc.id),
                ...(doc.data.coverImageUrl
                    ? { coverImageUrl: doc.data.coverImageUrl }
                    : {}),
                incomingLinks: 0,
                outgoingLinks: 0,
            } satisfies CardGraphNode,
        ]),
    );
    const edges: CardGraphEdge[] = [];

    for (const doc of docs) {
        const source = nodeById.get(doc.id)!;

        for (const link of doc.data.outgoingLinks) {
            const target = nodeById.get(link.targetId);
            if (!target) continue;

            source.outgoingLinks += 1;
            target.incomingLinks += 1;
            edges.push({
                source: doc.id,
                target: link.targetId,
                targetId: link.targetId,
                count: link.count,
                terms: link.terms,
            });
        }
    }

    return {
        nodes: [...nodeById.values()].sort((left, right) =>
            left.title.localeCompare(right.title),
        ),
        edges: edges.sort(
            (left, right) =>
                left.source.localeCompare(right.source) ||
                left.target.localeCompare(right.target),
        ),
    };
}
