// @ts-check
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { imageService } from "@unpic/astro/service";
import { defineConfig, fontProviders } from "astro/config";

import { renderTypst } from "@/lib/typst.ts";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://floffah.github.io",
    base: "/luminous",

    vite: {
        plugins: [
            tailwindcss(),
            {
                name: "typst-html",
                transform: {
                    filter: {
                        id: /\.typ$/,
                    },
                    handler(src) {
                        const html = renderTypst(src);

                        return {
                            code: `export default ${JSON.stringify(html)};`,
                            map: null,
                        };
                    },
                },
            },
        ],
    },

    fonts: [
        {
            provider: fontProviders.google(),
            name: "Inter",
            cssVariable: "--font-sans",
        },
    ],
    image: {
        domains: ["images.unsplash.com"],
        service: imageService(),
    },

    integrations: [react(), sitemap()],
});