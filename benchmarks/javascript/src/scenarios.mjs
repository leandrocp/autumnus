import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { do_not_optimize, measure } from "mitata";
import { implementations } from "../../scripts/implementations.mjs";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const repoDir = resolve(benchmarksDir, "..");
const implementation = process.env.BENCH_IMPLEMENTATION;
const scenarioId = process.env.BENCH_SCENARIO;
const requestedOutput = process.env.BENCH_OUTPUT;
const minimumSamples = Number.parseInt(process.env.BENCH_SAMPLES ?? "10", 10);
const measurementSeconds = Number.parseFloat(process.env.BENCH_TIME_SECONDS ?? "1");

if (!requestedOutput) throw new Error("BENCH_OUTPUT is required");
if (!scenarioId) throw new Error("BENCH_SCENARIO is required");
if (!Number.isSafeInteger(minimumSamples) || minimumSamples < 2) {
  throw new Error("BENCH_SAMPLES must be at least two");
}
if (!Number.isFinite(measurementSeconds) || measurementSeconds <= 0) {
  throw new Error("BENCH_TIME_SECONDS must be positive");
}
if (!implementations.some(({ id, runner }) => id === implementation && runner === "mitata")) {
  throw new Error(`unknown JavaScript benchmark implementation: ${implementation}`);
}

const resolvedManifest = JSON.parse(
  await readFile(resolve(repoDir, "target/benchmarks/fixtures/scenarios.json"), "utf8"),
);
const scenarioSpec = resolvedManifest.scenarios.find(({ id }) => id === scenarioId);
if (!scenarioSpec) throw new Error(`unknown benchmark scenario: ${scenarioId}`);
const scenario = {
  ...scenarioSpec,
  files: await Promise.all(
    scenarioSpec.files.map(async (file) => ({
      ...file,
      source: await readFile(resolve(repoDir, file.path), "utf8"),
    })),
  ),
};

if (
  scenario.files.reduce((total, file) => total + Buffer.byteLength(file.source), 0) !==
  scenario.inputBytes
) {
  throw new Error(`${scenario.id} input bytes changed after fixture verification`);
}

await prepareRuntime();
const adapter =
  implementation === "shiki"
    ? await loadShiki()
    : implementation === "highlight-js"
      ? await loadHighlightJs()
      : await loadLumis();
const validationRuntime = await adapter.initialize();
const outputBytes = adapter.render(validationRuntime, true);
adapter.dispose(validationRuntime);
if (outputBytes <= scenario.inputBytes) {
  throw new Error(`${implementation} did not expand ${scenario.id}`);
}

let result;
const cleanup = () => {
  if (result !== undefined) adapter.disposeResult(result);
  result = undefined;
  globalThis.gc?.();
};
const stats = await measure(
  async () => {
    const runtime = await adapter.initialize();
    result = { runtime, outputBytes: adapter.render(runtime) };
    do_not_optimize(result.outputBytes);
  },
  {
    min_samples: minimumSamples,
    max_samples: 1_000_000,
    min_cpu_time: measurementSeconds * 1e9,
    warmup_samples: 1,
    batch_samples: 1,
    gc: cleanup,
    inner_gc: true,
  },
);
cleanup();

const { debug: _debug, ...serializableStats } = stats;
const report = {
  schemaVersion: 1,
  runner: "mitata",
  implementation,
  scenario: scenario.id,
  inputBytes: scenario.inputBytes,
  outputBytes,
  fileCount: scenario.fileCount,
  languageCount: scenario.languageCount,
  total: serializableStats,
};
const outputPath = isAbsolute(requestedOutput)
  ? requestedOutput
  : resolve(repoDir, requestedOutput);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(outputPath);

async function prepareRuntime() {
  const runtimeDir = resolve(repoDir, "target/benchmarks/javascript-runtime");
  await mkdir(runtimeDir, { recursive: true });
  process.env.LUMIS_WASM_CACHE_DIR = resolve(runtimeDir, "wasm-cache");
  process.chdir(runtimeDir);
}

async function loadLumis() {
  const [{ createHighlighter, withWasm }, { htmlInline }, { default: theme }] = await Promise.all([
    import("@lumis-sh/lumis"),
    import("@lumis-sh/lumis/formatters"),
    import("@lumis-sh/themes/github_dark"),
  ]);
  const uniqueIds = [...new Set(scenario.files.map(({ language }) => language))];
  const languages = Object.fromEntries(
    await Promise.all(
      uniqueIds.map(async (id) => {
        const [{ default: language }, { default: wasm }] = await Promise.all([
          import(`@lumis-sh/lumis/langs/${id}`),
          import(`@lumis-sh/wasm-${id}`),
        ]);
        return [id, withWasm(language, wasm)];
      }),
    ),
  );

  return {
    async initialize() {
      const highlighter = await createHighlighter({ languages: Object.values(languages) });
      const formatters = Object.fromEntries(
        Object.entries(languages).map(([id, language]) => [id, htmlInline({ language, theme })]),
      );
      return { formatters, highlighter };
    },
    render({ formatters, highlighter }, validate = false) {
      let renderedBytes = 0;
      for (const file of scenario.files) {
        const output = highlighter.highlight(file.source, formatters[file.language]);
        if (validate) assertHtml(output, file.source, implementation);
        renderedBytes += Buffer.byteLength(output);
      }
      return renderedBytes;
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
  const languages = [...new Set(scenario.files.map(({ language }) => language))];

  return {
    async initialize() {
      return createHighlighter({
        langs: languages,
        themes: ["github-dark"],
        engine: createOnigurumaEngine(import("shiki/wasm")),
      });
    },
    render(highlighter, validate = false) {
      let renderedBytes = 0;
      for (const file of scenario.files) {
        const output = highlighter.codeToHtml(file.source, {
          lang: file.language,
          theme: "github-dark",
        });
        if (validate) assertHtml(output, file.source, implementation);
        renderedBytes += Buffer.byteLength(output);
      }
      return renderedBytes;
    },
    dispose(highlighter) {
      highlighter.dispose();
    },
    disposeResult(measured) {
      measured.runtime.dispose();
    },
  };
}

async function loadHighlightJs() {
  const { default: highlightJs } = await import("highlight.js/lib/core");
  const languageNames = [...new Set(scenario.files.map(({ language }) => language))];
  const languageModules = Object.fromEntries(
    await Promise.all(
      languageNames.map(async (language) => {
        const moduleName = language === "html" ? "xml" : language;
        const { default: definition } = await import(`highlight.js/lib/languages/${moduleName}`);
        return [language, definition];
      }),
    ),
  );

  return {
    async initialize() {
      const highlighter = highlightJs.newInstance();
      for (const [language, definition] of Object.entries(languageModules)) {
        highlighter.registerLanguage(language, definition);
      }
      return highlighter;
    },
    render(highlighter, validate = false) {
      let renderedBytes = 0;
      for (const file of scenario.files) {
        const highlighted = highlighter.highlight(file.source, { language: file.language }).value;
        const output = `<pre><code class="hljs language-${file.language}">${highlighted}</code></pre>`;
        if (validate) assertHtml(output, file.source, implementation);
        renderedBytes += Buffer.byteLength(output);
      }
      return renderedBytes;
    },
    dispose() {},
    disposeResult() {},
  };
}

function assertHtml(output, source, name) {
  if (
    Buffer.byteLength(output) <= Buffer.byteLength(source) ||
    !output.includes("<pre") ||
    !output.includes("<span")
  ) {
    throw new Error(`${name} did not produce highlighted HTML`);
  }
}
