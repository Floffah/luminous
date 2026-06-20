import { glob, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { CardLinkEdge } from "@/lib/card-links.ts";
import type { Loader } from "astro/loaders";

import { buildCardLinkIndex, linkCardHtml } from "@/lib/card-links.ts";
import {
    isTypstEntryPath,
    toPosixPath,
    typstEntryId,
} from "@/lib/typst-path.ts";
import { compileTypst } from "@/lib/typst.ts";

export interface TypstLoaderOptions {
    base?: string;
}

interface DocData extends Record<string, unknown> {
    title: string;
    aliases?: string[];
    outgoingLinks: CardLinkEdge[];
}

interface CompiledEntry {
    id: string;
    source: string;
    data: DocData;
    html: string;
    headings: ReturnType<typeof compileTypst>["headings"];
    filePath: string;
}

export function typstLoader({
    base = "../docs",
}: TypstLoaderOptions = {}): Loader {
    return {
        name: "typst-loader",
        async load({
            config,
            generateDigest,
            logger,
            parseData,
            store,
            watcher,
        }) {
            const rootPath = fileURLToPath(config.root);
            const basePath = fileURLToPath(
                new URL(base.endsWith("/") ? base : `${base}/`, config.root),
            );
            const baseUrl = config.base.replace(/\/$/, "");

            async function rebuildAll() {
                const filePaths: string[] = [];
                for await (const entry of glob("**/*.typ", { cwd: basePath })) {
                    const entryPath = toPosixPath(entry);
                    if (isTypstEntryPath(entryPath)) {
                        filePaths.push(resolve(basePath, entry));
                    }
                }

                if (filePaths.length === 0) {
                    logger.warn(`No Typst files found in ${basePath}`);
                }

                const entries = await Promise.all(
                    filePaths.map(async (filePath): Promise<CompiledEntry> => {
                        const entryPath = toPosixPath(
                            relative(basePath, filePath),
                        );
                        const id = typstEntryId(entryPath);
                        const source = await readFile(filePath, "utf8");
                        const compiled = compileTypst(source);
                        const data = (await parseData({
                            id,
                            data: compiled.metadata,
                            filePath,
                        })) as DocData;

                        return {
                            id,
                            source,
                            data,
                            html: compiled.html,
                            headings: compiled.headings,
                            filePath: toPosixPath(relative(rootPath, filePath)),
                        };
                    }),
                );

                const entryIds = new Set<string>();
                for (const entry of entries) {
                    if (entryIds.has(entry.id)) {
                        throw new Error(
                            `More than one Typst content file resolves to id "${entry.id}"`,
                        );
                    }
                    entryIds.add(entry.id);
                }
                entries.sort((left, right) => left.id.localeCompare(right.id));

                const linkIndex = buildCardLinkIndex(
                    entries.map(({ id, data }) => ({
                        id,
                        title: data.title,
                        aliases: data.aliases,
                    })),
                );
                const linkIndexDigest = generateDigest(
                    JSON.stringify(
                        entries.map(({ id, data }) => ({
                            id,
                            title: data.title,
                            aliases: [...(data.aliases ?? [])].sort(),
                        })),
                    ),
                );
                const completedEntries = entries.map((entry) => {
                    const linked = linkCardHtml({
                        html: entry.html,
                        sourceId: entry.id,
                        index: linkIndex,
                        hrefForId: (id) => `${baseUrl}/d/${id}`,
                    });

                    return {
                        ...entry,
                        html: linked.html,
                        data: {
                            ...entry.data,
                            outgoingLinks: linked.outgoingLinks,
                        },
                        digest: generateDigest(
                            JSON.stringify({
                                source: entry.source,
                                linkIndexDigest,
                                html: linked.html,
                                outgoingLinks: linked.outgoingLinks,
                            }),
                        ),
                    };
                });

                const untouchedEntries = new Set(store.keys());
                for (const entry of completedEntries) {
                    untouchedEntries.delete(entry.id);
                    store.set({
                        id: entry.id,
                        data: entry.data,
                        body: entry.source,
                        digest: entry.digest,
                        filePath: entry.filePath,
                        rendered: {
                            html: entry.html,
                            metadata: { headings: entry.headings },
                        },
                    });
                }
                untouchedEntries.forEach((id) => store.delete(id));
            }

            await rebuildAll();

            if (!watcher) return;

            watcher.add(basePath);
            let activeRebuild: Promise<void> | undefined;
            let rebuildAgain = false;

            const reload = async (filePath: string) => {
                const entryPath = toPosixPath(relative(basePath, filePath));
                if (!isTypstEntryPath(entryPath)) return;

                try {
                    rebuildAgain = true;
                    activeRebuild ??= (async () => {
                        while (rebuildAgain) {
                            rebuildAgain = false;
                            await rebuildAll();
                        }
                    })().finally(() => {
                        activeRebuild = undefined;
                    });
                    await activeRebuild;
                    logger.info(`Reloaded Typst content after ${entryPath}`);
                } catch (error) {
                    const message =
                        error instanceof Error ? error.message : String(error);
                    logger.error(
                        `Failed to reload Typst content after ${entryPath}: ${message}`,
                    );
                }
            };

            watcher.on("add", reload);
            watcher.on("change", reload);
            watcher.on("unlink", reload);
        },
    };
}
