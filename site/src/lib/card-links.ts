import { load } from "cheerio";

export interface CardLinkDefinition {
    id: string;
    title: string;
    aliases?: string[];
}

export interface CardLinkEdge {
    targetId: string;
    count: number;
    terms: string[];
}

interface CardLinkTarget {
    id: string;
    term: string;
}

export interface CardLinkIndex {
    targetsByTerm: ReadonlyMap<string, CardLinkTarget>;
    matcher: RegExp | null;
}

interface LinkCardHtmlOptions {
    html: string;
    sourceId: string;
    index: CardLinkIndex;
    hrefForId: (id: string) => string;
}

const excludedElements = new Set([
    "a",
    "code",
    "figcaption",
    "pre",
    "script",
    "style",
]);
const wordCharacter = /[\p{Letter}\p{Number}_]/u;

export function buildCardLinkIndex(cards: CardLinkDefinition[]): CardLinkIndex {
    const targetsByTerm = new Map<string, CardLinkTarget>();

    for (const card of cards) {
        const terms = new Set([card.title, ...(card.aliases ?? [])]);

        for (const term of terms) {
            if (term.length === 0) {
                throw new Error(
                    `Card "${card.id}" has an empty title or alias, which cannot be auto-linked`,
                );
            }

            const existing = targetsByTerm.get(term);
            if (existing && existing.id !== card.id) {
                throw new Error(
                    `Auto-link term "${term}" belongs to both "${existing.id}" and "${card.id}"`,
                );
            }

            targetsByTerm.set(term, { id: card.id, term });
        }
    }

    const pattern = [...targetsByTerm.keys()]
        .sort((left, right) => right.length - left.length)
        .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");

    return {
        targetsByTerm,
        matcher: pattern ? new RegExp(pattern, "gu") : null,
    };
}

export function linkCardHtml({
    html,
    sourceId,
    index,
    hrefForId,
}: LinkCardHtmlOptions): { html: string; outgoingLinks: CardLinkEdge[] } {
    if (!index.matcher) return { html, outgoingLinks: [] };

    const $ = load(html, null, false);
    const edges = new Map<string, { count: number; terms: Set<string> }>();

    $("p, li")
        .filter(
            (_, element) =>
                $(element).parents("p, li, figcaption").length === 0,
        )
        .each((_, element) => visit(element));

    function visit(node: Parameters<typeof $>[0]) {
        $(node)
            .contents()
            .each((_, child) => {
                if (child.type === "text") {
                    const text = $(child).text();
                    let cursor = 0;
                    let changed = false;
                    const fragments: string[] = [];

                    index.matcher!.lastIndex = 0;
                    for (const match of text.matchAll(index.matcher!)) {
                        const term = match[0];
                        const start = match.index;
                        const end = start + term.length;
                        const target = index.targetsByTerm.get(term);
                        const first = [...term][0];
                        const last = [...term].at(-1);
                        const before = [...text.slice(0, start)].at(-1) ?? "";
                        const after = [...text.slice(end)][0] ?? "";
                        const hasTermBoundaries = !(
                            (wordCharacter.test(first) &&
                                wordCharacter.test(before)) ||
                            (wordCharacter.test(last ?? "") &&
                                wordCharacter.test(after))
                        );

                        if (
                            !target ||
                            target.id === sourceId ||
                            !hasTermBoundaries
                        ) {
                            continue;
                        }

                        fragments.push(escapeHtml(text.slice(cursor, start)));
                        fragments.push(
                            `<a href="${escapeAttribute(hrefForId(target.id))}" data-card-link="${escapeAttribute(target.id)}">${escapeHtml(term)}</a>`,
                        );
                        cursor = end;
                        changed = true;

                        const edge = edges.get(target.id) ?? {
                            count: 0,
                            terms: new Set<string>(),
                        };
                        edge.count += 1;
                        edge.terms.add(term);
                        edges.set(target.id, edge);
                    }

                    if (changed) {
                        fragments.push(escapeHtml(text.slice(cursor)));
                        $(child).replaceWith(fragments.join(""));
                    }
                    return;
                }

                if (
                    child.type === "tag" &&
                    !excludedElements.has(child.tagName)
                ) {
                    visit(child);
                }
            });
    }

    return {
        html: $.html(),
        outgoingLinks: [...edges.entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([targetId, edge]) => ({
                targetId,
                count: edge.count,
                terms: [...edge.terms].sort((left, right) =>
                    left.localeCompare(right),
                ),
            })),
    };
}

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function escapeAttribute(value: string) {
    return escapeHtml(value).replaceAll('"', "&quot;");
}
