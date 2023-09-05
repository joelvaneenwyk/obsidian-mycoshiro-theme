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
const isWatch = (process.argv[2] === "watch");

async function build(isProductionBuild) {
    const minify = isProductionBuild;
    const context = await esbuild.context({
        banner: {
            js: banner,
        },
        entryPoints: ["src/index.scss"],
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
        sourcemap: false,
        treeShaking: false,
        outfile: minify ? "dist/main.min.css" : "dist/main.css",
        minify: minify,
        plugins: [sassPlugin({
            filter: /\.(scss|css)$/,
            transform: async (source, resolveDir) => {
                const { css } = await postcss([autoprefixer, postcssPresetEnv({ stage: 0 })])
                    .process(source, { from: undefined });
                return css;
            }
        })]
    });

     return context.rebuild().then(async (result) => {
            console.log(`⚡ Finished building ${isProductionBuild ? "production" : "development"} theme! ⚡`);

            if (isWatch) {
                console.log("⚡ Starting watch.... ⚡");
                await context.watch();
            }
        });
}

try {
    await build(true);
    await build(false);
    process.exit(0);
}
catch (error) {
    console.error(error);
    process.exit(1);
}
