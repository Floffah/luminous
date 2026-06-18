import { load } from "cheerio";
import { Link as LinkIcon } from "lucide-static";
import { typstToHtml, typstToHtmlWithMetadata } from "typst-wasm";

import cn from "@/lib/cn.ts";

export function renderTypst(typst: string) {
    return modifyHtml(typstToHtml(typst));
}

export interface CompiledTypst {
    html: string;
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

    return {
        html: modifyHtml(compiled.html),
        metadata: compiled.metadata,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function modifyHtml(html: string) {
    const $ = load(html, null, false);
    const usedIds = new Set(
        $("[id]")
            .map((_, element) => $(element).attr("id"))
            .get()
            .filter(Boolean),
    );

    $("h1, h2, h3, h4, h5, h6").each((_, heading) => {
        const element = $(heading);
        if (element.attr("id")) return;

        const base = slugify(element.text()) || "heading";
        let id = base;
        let suffix = 2;

        while (usedIds.has(id)) {
            id = `${base}-${suffix}`;
            suffix += 1;
        }

        element.attr("id", id);
        usedIds.add(id);

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

    return $.html();
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
