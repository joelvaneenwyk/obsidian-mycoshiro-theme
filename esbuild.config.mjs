import autoprefixer from "autoprefixer";
import builtins from "builtin-modules";
import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";
import process from "process";

const banner =
    `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
If you want to view the source, please visit the GitHub repository of this plugin.
*/
`;

const isDevelopmentBuild = (process.argv[2] !== "production");
const isProductionBuild = (process.argv[2] === "production");
const isWatch = (process.argv[2] === "watch");

const context = await esbuild.context({
    banner: {
        js: banner,
    },
    outdir: "dist",
    entryPoints: ["src/scss/index.scss"],
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@electron/remote",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "loglevel",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins],
    format: "cjs",
    target: "es2018",
    logLevel: isDevelopmentBuild ? "debug" : "info",
    sourcemap: isProductionBuild ? false : "inline",
    treeShaking: false,
    minify: false,
    plugins: [sassPlugin({
        filter: /\.(scss|css)$/,
        transform: async (source, resolveDir) => {
            const { css } = await postcss([autoprefixer, postcssPresetEnv({ stage: 0 })])
                .process(source, { from: undefined });
            return css;
        }
    })]
});

try {
    await context.rebuild().then(async (result) => {
        console.log("⚡ Obsidian theme finished building! ⚡");

        if (isWatch) {
            console.log("⚡ Starting watch.... ⚡");
            await context.watch();
        }
    });

    process.exit(0);
}
catch (error) {
    console.error(error);
    process.exit(1);
}
