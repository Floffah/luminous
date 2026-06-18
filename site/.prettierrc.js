export default {
    trailingComma: "all",
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    jsxSingleQuote: false,
    jsxBracketSameLine: false,
    arrowParens: "always",
    endOfLine: "lf",
    embeddedLanguageFormatting: "auto",

    tailwindStylesheet: "./src/styles/global.css",
    tailwindFunctions: ["clsx", "cn", "cva"],

    importOrder: [
        "<TYPES>",
        "<THIRD_PARTY_MODULES>",
        "",
        "@/(.*)$",
        "",
        "^[.]",
    ],
    importOrderSortSpecifiers: true,
    importOrderGroupNamespaceSpecifiers: true,

    plugins: [
        "prettier-plugin-astro",
        "@ianvs/prettier-plugin-sort-imports",
        "prettier-plugin-tailwindcss",
    ],
    overrides: [
        {
            files: "*.astro",
            options: {
                parser: "astro",
            },
        },
    ],
};
