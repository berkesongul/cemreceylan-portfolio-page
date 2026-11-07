import { build, context } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const watch = process.argv.includes("--watch");

await mkdir("dist", { recursive: true });

const codeOptions = {
  entryPoints: ["src/code.ts"],
  outfile: "dist/code.js",
  bundle: true,
  format: "iife",
  target: "es2020",
  sourcemap: true,
};

const uiOptions = {
  entryPoints: ["src/ui.ts"],
  bundle: true,
  format: "iife",
  target: "es2020",
  write: false,
  minify: true,
};

async function buildUi() {
  const result = await build(uiOptions);
  const template = await readFile("src/ui-template.html", "utf8");
  const script = result.outputFiles[0].text.replaceAll("</script>", "<\\/script>");
  await writeFile("dist/ui.html", template.replace("<!-- SCRIPT -->", `<script>${script}</script>`));
}

if (watch) {
  const codeContext = await context(codeOptions);
  await codeContext.watch();
  await buildUi();
  console.log("Watching plugin code. Re-run build after editing the UI.");
} else {
  await Promise.all([build(codeOptions), buildUi()]);
  console.log("Built Portfolio PDF Exporter in dist/.");
}
