import { glob, readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { Loader } from "astro/loaders";

import { compileTypst } from "@/lib/typst.ts";

export interface TypstLoaderOptions {
    base?: string;
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
                new URL(withTrailingSlash(base), config.root),
            );
            const untouchedEntries = new Set(store.keys());

            async function syncFile(filePath: string) {
                const entryPath = toPosixPath(relative(basePath, filePath));
                if (!isTypstEntry(entryPath)) return;

                const id = entryPath.slice(0, -".typ".length);
                const source = await readFile(filePath, "utf8");
                const digest = generateDigest(source);
                const existing = store.get(id);
                untouchedEntries.delete(id);

                if (existing?.digest === digest) return;

                const compiled = compileTypst(source);
                const data = await parseData({
                    id,
                    data: compiled.metadata,
                    filePath,
                });

                store.set({
                    id,
                    data,
                    body: source,
                    digest,
                    filePath: toPosixPath(relative(rootPath, filePath)),
                    rendered: { html: compiled.html },
                });
            }

            const entries: string[] = [];
            for await (const entry of glob("**/*.typ", { cwd: basePath })) {
                const entryPath = toPosixPath(entry);
                if (isTypstEntry(entryPath)) {
                    entries.push(resolve(basePath, entry));
                }
            }

            if (entries.length === 0) {
                logger.warn(`No Typst files found in ${basePath}`);
            }

            await Promise.all(entries.map(syncFile));
            untouchedEntries.forEach((id) => store.delete(id));

            if (!watcher) return;

            watcher.add(basePath);
            const reload = async (filePath: string) => {
                const entryPath = toPosixPath(relative(basePath, filePath));
                if (!isTypstEntry(entryPath)) return;

                try {
                    await syncFile(filePath);
                    logger.info(`Reloaded Typst content from ${entryPath}`);
                } catch (error) {
                    const message =
                        error instanceof Error ? error.message : String(error);
                    logger.error(`Failed to reload ${entryPath}: ${message}`);
                }
            };

            watcher.on("add", reload);
            watcher.on("change", reload);
            watcher.on("unlink", (filePath) => {
                const entryPath = toPosixPath(relative(basePath, filePath));
                if (!isTypstEntry(entryPath)) return;

                store.delete(entryPath.slice(0, -".typ".length));
            });
        },
    };
}

function withTrailingSlash(path: string) {
    return path.endsWith("/") ? path : `${path}/`;
}

function toPosixPath(path: string) {
    return path.split(sep).join("/");
}

function isTypstEntry(path: string) {
    const fileName = path.split("/").at(-1);

    return (
        path.endsWith(".typ") &&
        path !== ".." &&
        !path.startsWith("../") &&
        !fileName?.startsWith("_")
    );
}
