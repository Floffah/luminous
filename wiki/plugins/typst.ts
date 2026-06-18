import type { PluginOption } from "vite";
import { load } from "cheerio";
import { Link as LinkIcon } from "lucide-static";
import { typstToHtml } from "typst-wasm";

import cn from "../src/lib/cn.ts";

const headingSelector = "h1, h2, h3, h4, h5, h6";

export function addHeadingIds(html: string) {
    const $ = load(html, null, false);
    const usedIds = new Set(
        $("[id]")
            .map((_, element) => $(element).attr("id"))
            .get()
            .filter(Boolean),
    );

    $(headingSelector).each((_, heading) => {
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

export function typstPlugin(): PluginOption {
    return {
        name: "typst-html",
        transform: {
            filter: {
                id: /\.typ$/,
            },
            handler(src) {
                const html = addHeadingIds(typstToHtml(src));

                return {
                    code: `export default ${JSON.stringify(html)};`,
                    map: null,
                };
            },
        },
    };
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
