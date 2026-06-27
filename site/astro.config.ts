// @ts-check
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { typst } from "@floffah/astro-typst/vite";
import tailwindcss from "@tailwindcss/vite";
import { imageService } from "@unpic/astro/service";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
    site: "https://floffah.github.io",
    base: "/luminous",

    vite: {
        plugins: [tailwindcss(), typst()],
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
