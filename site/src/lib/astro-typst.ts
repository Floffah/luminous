import type { MarkdownHeading } from "astro";
import { compileTypst as compileAstroTypst } from "@floffah/astro-typst";
import { load } from "cheerio";
import { Link as LinkIcon } from "lucide-static";

import cn from "@/lib/cn.ts";

export interface CompiledTypst {
    html: string;
    headings: MarkdownHeading[];
    metadata: Record<string, unknown>;
}

export function compileTypst(typst: string): CompiledTypst {
    const compiled = compileAstroTypst(typst);
    const rendered = decorateHtml(compiled.html);

    return {
        html: rendered.html,
        headings: rendered.headings,
        metadata: compiled.metadata,
    };
}

/** Add Luminous-specific heading links after astro-typst renders the HTML. */
function decorateHtml(html: string) {
    const $ = load(html, null, false);
    const headings: MarkdownHeading[] = [];

    $("h1, h2, h3, h4, h5, h6").each((_, heading) => {
        const element = $(heading);
        const id = element.attr("id");

        if (!id) {
            throw new Error("astro-typst rendered a heading without an id");
        }

        headings.push({
            depth: Number(heading.tagName.slice(1)),
            slug: id,
            text: element.text().trim(),
        });

        const existingClass = element.attr("class") ?? "";
        element.attr(
            "class",
            cn("group flex items-center gap-1", existingClass).trim(),
        );

        const content = element.html();
        element.html(
            `${content} <a class="hidden *:size-4 text-muted group-hover:block" href="#${id}">${LinkIcon}</a>`.trim(),
        );
    });

    return { html: $.html(), headings };
}
