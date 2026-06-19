import type { MarkdownHeading } from "astro";
import { load } from "cheerio";
import { Link as LinkIcon } from "lucide-static";
import { typstToHtml, typstToHtmlWithMetadata } from "typst-wasm";

import cn from "@/lib/cn.ts";

export function renderTypst(typst: string) {
    return modifyHtml(typstToHtml(typst)).html;
}

export interface CompiledTypst {
    html: string;
    headings: MarkdownHeading[];
    metadata: Record<string, unknown>;
}

export function compileTypst(typst: string): CompiledTypst {
    const compiled: unknown = JSON.parse(typstToHtmlWithMetadata(typst));

    if (!isRecord(compiled) || typeof compiled.html !== "string") {
        throw new TypeError(
            "typst-wasm returned an invalid compilation result",
        );
    }

    if (!isRecord(compiled.metadata)) {
        throw new TypeError("the Typst `astro` variable must be a dictionary");
    }

    const rendered = modifyHtml(compiled.html);

    return {
        html: rendered.html,
        headings: rendered.headings,
        metadata: compiled.metadata,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function modifyHtml(html: string) {
    const $ = load(html, null, false);
    const headings: MarkdownHeading[] = [];
    const usedIds = new Set(
        $("[id]")
            .map((_, element) => $(element).attr("id"))
            .get()
            .filter(Boolean),
    );

    $("h1, h2, h3, h4, h5, h6").each((_, heading) => {
        const element = $(heading);
        const text = element.text().trim();
        const existingId = element.attr("id");
        let id = existingId;

        if (!id) {
            const base = slugify(text) || "heading";
            id = base;
            let suffix = 2;

            while (usedIds.has(id)) {
                id = `${base}-${suffix}`;
                suffix += 1;
            }

            element.attr("id", id);
            usedIds.add(id);
        }

        headings.push({
            depth: Number(heading.tagName.slice(1)),
            slug: id,
            text,
        });

        if (existingId) return;

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

function slugify(value: string) {
    return value
        .normalize("NFKD")
        .replace(/\p{Mark}+/gu, "")
        .toLocaleLowerCase("en")
        .replace(/[’']/gu, "")
        .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
        .replace(/^-+|-+$/gu, "");
}
