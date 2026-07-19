import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { do_not_optimize, measure } from "mitata";
import {
  applicationRuntimeDir,
  assertHtml,
  nsSince,
  prepareApplicationRuntime,
  repoDir,
} from "./common.mjs";

const implementation = process.env.BENCH_APPLICATION_IMPLEMENTATION;
const samples = Number.parseInt(process.env.BENCH_SAMPLES ?? "10", 10);
const requestedOutput = process.env.BENCH_OUTPUT;

if (!requestedOutput) throw new Error("BENCH_OUTPUT is required");
if (!Number.isSafeInteger(samples) || samples < 2) {
  throw new Error(`BENCH_SAMPLES must be an integer greater than one, got ${samples}`);
}
if (!["lumis-js-native", "lumis-js-wasm", "shiki"].includes(implementation)) {
  throw new Error(`unknown JavaScript application implementation: ${implementation}`);
}

const outputPath = isAbsolute(requestedOutput)
  ? requestedOutput
  : resolve(repoDir, requestedOutput);

await prepareApplicationRuntime();
process.chdir(applicationRuntimeDir);

const fixtureStarted = process.hrtime.bigint();
const { applicationInputBytes, applicationSnippetCount, applicationWorkload } =
  await import("./application-workload.mjs");
const fixtureNs = nsSince(fixtureStarted);

const importStarted = process.hrtime.bigint();
const adapter = implementation === "shiki" ? await loadShiki() : await loadLumis();
const importNs = nsSince(importStarted);
const initialized = await adapter.initialize();
const outputBytes = adapter.render(initialized);
adapter.validate(outputBytes);

async function measureCase(run, dispose = () => {}) {
  let result;
  const cleanup = () => {
    if (result !== undefined) dispose(result);
    result = undefined;
    globalThis.gc?.();
  };
  cleanup();
  let stats;
  try {
    stats = await measure(
      async () => {
        result = await run();
        do_not_optimize(result.outputBytes ?? result);
      },
      {
        min_samples: samples,
        max_samples: samples,
        min_cpu_time: 0,
        warmup_samples: 1,
        batch_samples: 1,
        gc: cleanup,
        inner_gc: true,
      },
    );
  } finally {
    cleanup();
  }
  const { debug: _debug, ...serializableStats } = stats;
  return serializableStats;
}

const benchmarks = {
  init: await measureCase(async () => adapter.initialize(), adapter.dispose),
  render: await measureCase(() => adapter.render(initialized)),
  total: await measureCase(async () => {
    const runtime = await adapter.initialize();
    return { runtime, outputBytes: adapter.render(runtime) };
  }, adapter.disposeResult),
};

adapter.dispose(initialized);

const report = {
  schemaVersion: 2,
  runner: "mitata",
  implementation,
  scenario: "application-two-languages-six-snippets",
  languages: applicationWorkload.map((entry) => entry.language),
  snippetCount: applicationSnippetCount,
  inputBytes: applicationInputBytes,
  outputBytes,
  fixtureNs,
  importNs,
  node: process.version,
  samples,
  benchmarks,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(outputPath);

async function loadLumis() {
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
  const languages = {
    javascript: withWasm(javascript, javascriptWasm.default),
    json: withWasm(json, jsonWasm.default),
  };

  return {
    async initialize() {
      const highlighter = await createHighlighter({ languages: Object.values(languages) });
      const formatters = Object.fromEntries(
        Object.entries(languages).map(([id, language]) => [id, htmlInline({ language, theme })]),
      );
      return { formatters, highlighter };
    },
    render({ formatters, highlighter }) {
      let renderedBytes = 0;
      for (const entry of applicationWorkload) {
        for (const source of entry.snippets) {
          const output = highlighter.highlight(source, formatters[entry.language]);
          assertHtml(output, Buffer.byteLength(source), implementation);
          renderedBytes += Buffer.byteLength(output);
        }
      }
      return renderedBytes;
    },
    validate(renderedBytes) {
      if (renderedBytes <= applicationInputBytes) {
        throw new Error(`${implementation} did not expand the application fixture`);
      }
    },
    dispose() {},
    disposeResult() {},
  };
}

async function loadShiki() {
  const [{ createHighlighter }, { createOnigurumaEngine }] = await Promise.all([
    import("shiki"),
    import("shiki/engine/oniguruma"),
  ]);

  return {
    async initialize() {
      const highlighter = await createHighlighter({
        langs: applicationWorkload.map((entry) => entry.language),
        themes: ["github-dark"],
        engine: createOnigurumaEngine(import("shiki/wasm")),
      });
      for (const { language } of applicationWorkload) {
        highlighter.codeToHtml("", { lang: language, theme: "github-dark" });
      }
      return highlighter;
    },
    render(highlighter) {
      let renderedBytes = 0;
      for (const entry of applicationWorkload) {
        for (const source of entry.snippets) {
          const output = highlighter.codeToHtml(source, {
            lang: entry.language,
            theme: "github-dark",
          });
          assertHtml(output, Buffer.byteLength(source), implementation);
          renderedBytes += Buffer.byteLength(output);
        }
      }
      return renderedBytes;
    },
    validate(renderedBytes) {
      if (renderedBytes <= applicationInputBytes) {
        throw new Error("Shiki did not expand the application fixture");
      }
    },
    dispose(highlighter) {
      highlighter.dispose();
    },
    disposeResult({ runtime }) {
      runtime.dispose();
    },
  };
}
