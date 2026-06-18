import { defineCollection } from "astro:content";
import { z } from "zod";

import { typstLoader } from "@/loaders/typst.ts";

const docs = defineCollection({
    loader: typstLoader(),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        type: z.string(),
        tags: z.array(z.string()).optional(),
        aliases: z.array(z.string()).optional(),
        coverImageUrl: z.string().optional(),
    }),
});

export const collections = {
    docs,
};
