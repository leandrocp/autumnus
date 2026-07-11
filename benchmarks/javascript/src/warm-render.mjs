import { do_not_optimize, measure } from "mitata";
import { createHighlighter as createLumisHighlighter, withWasm } from "@lumis-sh/lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import rust from "@lumis-sh/lumis/langs/rust";
import githubDark from "@lumis-sh/themes/github_dark";
import rustWasm from "@lumis-sh/wasm-rust";
import { createHighlighter as createShikiHighlighter } from "shiki";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { assertHtml, loadFixtures } from "./common.mjs";

const samples = Number.parseInt(process.env.BENCH_JS_SAMPLES ?? "5", 10);
if (!Number.isSafeInteger(samples) || samples < 2) {
  throw new Error(`BENCH_JS_SAMPLES must be an integer greater than one, got ${samples}`);
}

const fixtureSelection = process.env.BENCH_FIXTURE ?? "all";
const loadedFixtures = (await loadFixtures()).filter(
  (fixture) => fixtureSelection === "all" || fixture.name === fixtureSelection,
);
if (loadedFixtures.length === 0) throw new Error(`unknown BENCH_FIXTURE: ${fixtureSelection}`);
const lumisRust = withWasm(rust, rustWasm);
const lumis = await createLumisHighlighter({ languages: [lumisRust] });
const shiki = await createShikiHighlighter({
  langs: ["rust"],
  themes: ["github-dark"],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
const lumisFormatter = htmlInline({ language: lumisRust, theme: githubDark });
const shikiOptions = { lang: "rust", theme: "github-dark" };
const results = [];

async function measureCase(name, fixture, render) {
  globalThis.gc?.();
  const stats = await measure(
    () => {
      do_not_optimize(render());
    },
    {
      min_samples: samples,
      max_samples: samples,
      min_cpu_time: 100 * 1e6,
      warmup_samples: 1,
      batch_samples: 16,
    },
  );
  const { debug: _debug, ...serializableStats } = stats;
  results.push({
    name,
    fixture: fixture.name,
    inputBytes: Buffer.byteLength(fixture.source),
    stats: serializableStats,
  });
}

try {
  for (const fixture of loadedFixtures) {
    const lumisOutput = lumis.highlight(fixture.source, lumisFormatter);
    const shikiOutput = shiki.codeToHtml(fixture.source, shikiOptions);
    assertHtml(lumisOutput, fixture.source.length, "Lumis JS");
    assertHtml(shikiOutput, fixture.source.length, "Shiki");

    await measureCase("lumis-js", fixture, () => lumis.highlight(fixture.source, lumisFormatter));
    await measureCase("shiki", fixture, () => shiki.codeToHtml(fixture.source, shikiOptions));
  }

  console.log(
    JSON.stringify({
      schemaVersion: 1,
      runner: "mitata",
      node: process.version,
      samples,
      results,
    }),
  );
} finally {
  shiki.dispose();
}
