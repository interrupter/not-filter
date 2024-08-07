import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ["node_modules/**/*", "coverage/**/*", "docs/**/*"],
    },
    ...compat.extends("eslint:recommended"),
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.mongo,
                ...globals.mocha,
                ENV: true,
            },

            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    experimentalObjectRestSpread: true,
                },
            },
        },

        rules: {
            indent: [
                "error",
                "tab",
                {
                    SwitchCase: 0,
                },
            ],

            "linebreak-style": ["error", "unix"],
            semi: ["error", "always"],
            "no-console": [1],
            "no-useless-escape": [0],
        },
    },
];
