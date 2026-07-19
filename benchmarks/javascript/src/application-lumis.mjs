import { assertHtml, nsSince } from "./common.mjs";

const totalStarted = process.hrtime.bigint();
const fixtureStarted = process.hrtime.bigint();
const { applicationInputBytes, applicationSnippetCount, applicationWorkload } =
  await import("./application-workload.mjs");
const fixtureNs = nsSince(fixtureStarted);
const importStarted = process.hrtime.bigint();
const [
  { createHighlighter, withWasm },
  { htmlInline },
  { default: javascript },
  { default: json },
  { default: theme },
  javascriptWasm,
  jsonWasm,
] = await Promise.all([
  import("@lumis-sh/lumis"),
  import("@lumis-sh/lumis/formatters"),
  import("@lumis-sh/lumis/langs/javascript"),
  import("@lumis-sh/lumis/langs/json"),
  import("@lumis-sh/themes/github_dark"),
  import("@lumis-sh/wasm-javascript"),
  import("@lumis-sh/wasm-json"),
]);
const importNs = nsSince(importStarted);
const afterImport = process.memoryUsage();

const initStarted = process.hrtime.bigint();
const languages = {
  javascript: withWasm(javascript, javascriptWasm.default),
  json: withWasm(json, jsonWasm.default),
};
const highlighter = await createHighlighter({ languages: Object.values(languages) });
const formatters = Object.fromEntries(
  Object.entries(languages).map(([id, language]) => [id, htmlInline({ language, theme })]),
);
const initNs = nsSince(initStarted);
const afterInit = process.memoryUsage();

const renderStarted = process.hrtime.bigint();
let outputBytes = 0;
for (const entry of applicationWorkload) {
  for (const source of entry.snippets) {
    const output = highlighter.highlight(source, formatters[entry.language]);
    assertHtml(output, Buffer.byteLength(source), `Lumis JS (${entry.language})`);
    outputBytes += Buffer.byteLength(output);
  }
}
const renderNs = nsSince(renderStarted);
const afterRender = process.memoryUsage();

console.log(
  JSON.stringify({
    schemaVersion: 1,
    implementation: process.env.BENCH_IMPLEMENTATION ?? "lumis-js",
    scenario: "application-two-languages-six-snippets",
    languages: applicationWorkload.map((entry) => entry.language),
    snippetCount: applicationSnippetCount,
    fixtureNs,
    importNs,
    initNs,
    renderNs,
    internalTotalNs: nsSince(totalStarted),
    inputBytes: applicationInputBytes,
    outputBytes,
    maxRssBytes: process.resourceUsage().maxRSS * 1024,
    memory: { afterImport, afterInit, afterRender },
  }),
);
