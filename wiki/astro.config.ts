// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

import { typstPlugin } from "./plugins/typst.js";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss(), typstPlugin()],
    },
    fonts: [
        {
            provider: fontProviders.google(),
            name: "Inter",
            cssVariable: "--font-sans",
        },
    ],
});
