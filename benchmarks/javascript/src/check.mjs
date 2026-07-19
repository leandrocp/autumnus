import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createHighlighter as createLumisHighlighter, withWasm } from "@lumis-sh/lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import rust from "@lumis-sh/lumis/langs/rust";
import githubDark from "@lumis-sh/themes/github_dark";
import rustWasm from "@lumis-sh/wasm-rust";
import { createHighlighter as createShikiHighlighter } from "shiki";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import {
  applicationRuntimeDir,
  assertHtml,
  loadFixtures,
  prepareApplicationRuntime,
} from "./common.mjs";

await prepareApplicationRuntime();
process.chdir(applicationRuntimeDir);
const [small] = await loadFixtures();
const language = withWasm(rust, rustWasm);
const lumis = await createLumisHighlighter({ languages: [language] });
const lumisOutput = lumis.highlight(small.source, htmlInline({ language, theme: githubDark }));
assertHtml(lumisOutput, small.source.length, "Lumis JS");

const shiki = await createShikiHighlighter({
  langs: ["rust"],
  themes: ["github-dark"],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
try {
  const shikiOutput = shiki.codeToHtml(small.source, { lang: "rust", theme: "github-dark" });
  assertHtml(shikiOutput, small.source.length, "Shiki");
  console.log(
    JSON.stringify({
      lumisOutputBytes: Buffer.byteLength(lumisOutput),
      shikiOutputBytes: Buffer.byteLength(shikiOutput),
    }),
  );
} finally {
  shiki.dispose();
}

for (const adapter of ["application-lumis.mjs", "application-shiki.mjs"]) {
  const child = spawnSync(process.execPath, [fileURLToPath(new URL(adapter, import.meta.url))], {
    cwd: applicationRuntimeDir,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
  if (child.status !== 0) {
    throw new Error(`${adapter} failed\n${child.stdout}${child.stderr}`);
  }
  const report = JSON.parse(child.stdout);
  if (report.languages.length !== 2 || report.snippetCount !== 6) {
    throw new Error(`${adapter} did not run the expected application workload`);
  }
}
