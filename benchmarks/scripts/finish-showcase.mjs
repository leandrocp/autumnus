#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { showcaseImplementations } from "./implementations.mjs";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const generatedDir = resolve(benchmarksDir, "showcase/generated");
const assetsDir = resolve(generatedDir, "assets");
const documents = JSON.parse(await readFile(resolve(assetsDir, "documents.json"), "utf8"));

// A theme is only worth comparing if it actually reached the scopes a language
// turns on, so every document names fragments that must appear. A document with
// no entry here fails rather than being silently exempt from the check.
const scopeExpectations = {
  webgpu: [
    ["HTML tag delimiter", '<span style="color: #8be9fd;">&lt;</span>'],
    ["HTML tag", '<span style="color: #8be9fd;">title</span>'],
    ["HTML attribute", '<span style="color: #50fa7b;">lang</span>'],
    [
      "HTML title text",
      '<span style="color: #ff79c6; font-weight: bold;">three.js webgpu - compute reduction</span>',
    ],
    ["injected CSS property", '<span style="color: #bd93f9;">background-color</span>'],
    ["injected JSON key", '<span style="color: #bd93f9;">&quot;imports&quot;</span>'],
    ["injected JavaScript keyword", '<span style="color: #ff79c6;">import</span>'],
  ],
  ripgrep: [
    ["Rust keyword", '<span style="color: #ff79c6;">pub</span>'],
    ["Rust type", '<span style="color: #a4ffff;">SearcherBuilder</span>'],
    ["Rust builtin type", '<span style="color: #8be9fd;">usize</span>'],
    ["Rust function", '<span style="color: #50fa7b;">new</span>'],
    ["Rust field", '<span style="color: #ffb86c;">config</span>'],
    ["Rust attribute", '<span style="color: #50fa7b;">derive</span>'],
    ["Rust comment", '<span style="color: #6272a4;">// always required.</span>'],
  ],
  phoenix: [
    ["Elixir keyword", '<span style="color: #ff79c6;">end</span>'],
    ["Elixir module", '<span style="color: #ffb86c;">Phoenix.Component</span>'],
    ["Elixir atom", '<span style="color: #bd93f9;">:string</span>'],
    ["Elixir sigil", '<span style="color: #50fa7b;">~</span>'],
    ["injected HEEx tag", '<span style="color: #8be9fd;">div</span>'],
    ["injected HEEx attribute", '<span style="color: #50fa7b;">class</span>'],
  ],
  go: [
    ["Go keyword", '<span style="color: #ff79c6;">return</span>'],
    ["Go builtin type", '<span style="color: #8be9fd;">string</span>'],
    ["Go type", '<span style="color: #a4ffff;">encodeState</span>'],
    ["Go function", '<span style="color: #50fa7b;">WriteString</span>'],
    ["Go parameter", '<span style="color: #ffb86c;">opts</span>'],
    ["Go comment", '<span style="color: #6272a4;">// an error.</span>'],
  ],
  readme: [
    ["Markdown heading", '<span style="color: #ff79c6;">## Features</span>'],
    ["injected HTML tag", '<span style="color: #8be9fd;">img</span>'],
    ["injected Rust type", '<span style="color: #a4ffff;">HtmlInlineBuilder</span>'],
    ["injected Elixir atom", '<span style="color: #bd93f9;">:html_inline</span>'],
    ["injected JavaScript keyword", '<span style="color: #ff79c6;">await</span>'],
  ],
  shadcn: [
    ["TSX keyword", '<span style="color: #ff79c6;">const</span>'],
    ["TSX type", '<span style="color: #a4ffff;">ComponentProps</span>'],
    ["TSX builtin type", '<span style="color: #8be9fd;">boolean</span>'],
    ["JSX attribute", '<span style="color: #50fa7b;">className</span>'],
    ["TSX constant", '<span style="color: #bd93f9;">SIDEBAR_WIDTH</span>'],
    ["TSX string", '<span style="color: #f1fa8c;">&quot;button&quot;</span>'],
  ],
};

const commandEnv = {
  ...process.env,
  XDG_CACHE_HOME: resolve(repoDir, "target/benchmarks/cli/xdg-cache"),
  LUMIS_DATA_DIR: resolve(repoDir, "target/benchmarks/cli/data"),
  LUMIS_CONFIG: resolve(repoDir, "target/benchmarks/cli/missing-config.toml"),
};

const lumisBinary = resolve(
  repoDir,
  "target/benchmarks/rust-target/release",
  process.platform === "win32" ? "lumis.exe" : "lumis",
);

// Each implementation renders with its own Dracula, because each consumes a
// different theme format. Some colour differences are therefore about the theme
// rather than the parse, and the page has to say so rather than let a reader
// assume otherwise.
// The version that actually rendered, not the range that selected it. The
// comparison libraries float, so a specifier here would publish "shiki latest"
// and leave a reader unable to tell what was measured.
const installedVersion = async (name) => {
  const manifest = createRequire(import.meta.url).resolve(`${name}/package.json`, {
    paths: [resolve(benchmarksDir, "javascript")],
  });
  return JSON.parse(await readFile(manifest, "utf8")).version;
};
const benchmarkCargo = await readFile(resolve(benchmarksDir, "rust/Cargo.toml"), "utf8");
const crateVersion = (name) =>
  benchmarkCargo.match(new RegExp(`^${name} = "([^"]+)"`, "m"))?.[1] ?? "unknown";
const lumisVersion = JSON.parse(
  await readFile(resolve(repoDir, "packages/javascript/lumis/package.json"), "utf8"),
).version;

const provenance = {
  syntect: {
    version: `syntect ${crateVersion("syntect")} with two-face ${crateVersion("two-face")}`,
    theme: "dracula/sublime Dracula.tmTheme, pinned by SHA-256",
  },
  shiki: {
    version: `shiki ${await installedVersion("shiki")}`,
    theme: "Shiki's bundled dracula theme",
  },
  "highlight-js": {
    version: `highlight.js ${await installedVersion("highlight.js")}`,
    theme: "highlight.js styles/base16/dracula.css",
  },
};

const manifest = {
  schemaVersion: 4,
  theme: {
    name: "Dracula",
    source:
      "https://github.com/dracula/sublime/blob/d490b57c08f3d110ff61a07ec6edcc1ed9e24a63/Dracula.tmTheme",
  },
  implementations: showcaseImplementations.map(({ id, label }) => ({
    id,
    label,
    version: provenance[id]?.version ?? `Lumis ${lumisVersion}`,
    theme: provenance[id]?.theme ?? "Neovim Dracula colorscheme, extracted by this repository",
  })),
  documents: [],
};

for (const document of documents) {
  const expectations = scopeExpectations[document.id];
  if (!expectations) {
    throw new Error(`showcase document ${document.id} has no scope expectations`);
  }

  const sourcePath = resolve(assetsDir, document.file);
  const source = await readFile(sourcePath, "utf8");
  const sourceBytes = Buffer.byteLength(source);
  const sourceLines = source.split("\n").length;
  const fragmentsDir = resolve(generatedDir, "fragments", document.id);
  await mkdir(fragmentsDir, { recursive: true });
  await mkdir(resolve(generatedDir, document.id), { recursive: true });

  const lumisCli = run(lumisBinary, [
    "--data-dir",
    commandEnv.LUMIS_DATA_DIR,
    "highlight",
    "--language",
    document.language,
    "--formatter",
    "html-inline",
    "--theme",
    "dracula",
    sourcePath,
  ]);
  validateHtml(lumisCli, sourceBytes, "Lumis CLI");
  await writeFile(resolve(fragmentsDir, "lumis-cli.html"), lumisCli);

  const outputs = [];
  const lumisFragments = [];

  const unsupported = new Set(document.unsupported);

  for (const { id, label } of showcaseImplementations) {
    // An implementation that renders nothing has to have said so: silence is only
    // acceptable where it was declared, and a declaration that stops being true
    // fails too, so the list can only shrink.
    const fragment = await readFile(resolve(fragmentsDir, `${id}.html`), "utf8").catch(
      () => undefined,
    );
    if (fragment === undefined) {
      if (!unsupported.has(id)) {
        throw new Error(`${label} produced no output for ${document.id}`);
      }
      continue;
    }
    if (unsupported.has(id)) {
      throw new Error(
        `${label} is declared unsupported for ${document.id} but produced output; remove it from the list`,
      );
    }

    validateHtml(fragment, sourceBytes, label);
    if (id.startsWith("lumis-")) {
      validateLumisScopes(fragment, label, document, expectations);
      lumisFragments.push({ label, fragment });
    }
    const page = pageHtml({ fragment, label });
    await writeFile(resolve(generatedDir, document.id, `${id}.html`), page);
    outputs.push({ id, outputBytes: Buffer.byteLength(fragment) });
  }

  validateLumisAgreement(lumisFragments, document);

  manifest.documents.push({
    id: document.id,
    label: document.label,
    language: document.language,
    languageLabel: document.languageLabel,
    source: document.source,
    sha256: createHash("sha256").update(source).digest("hex"),
    bytes: sourceBytes,
    lines: sourceLines,
    injections: document.injections,
    unsupported: document.unsupported,
    outputs,
  });
}

const serializedManifest = JSON.stringify(manifest, null, 2);
await Promise.all([
  writeFile(resolve(generatedDir, "manifest.json"), `${serializedManifest}\n`),
  writeFile(
    resolve(generatedDir, "manifest.js"),
    `globalThis.LUMIS_BENCHMARK_SHOWCASE = ${serializedManifest};\n`,
  ),
]);
console.log(
  `Generated ${showcaseImplementations.length} visual comparisons of ${documents.length} documents ` +
    `(${manifest.documents.map((d) => `${d.lines.toLocaleString()} lines`).join(", ")}).`,
);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoDir,
    env: commandEnv,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${basename(command)} failed:\n${result.stderr}`);
  }
  return result.stdout;
}

function validateHtml(output, sourceBytes, implementation) {
  if (
    Buffer.byteLength(output) <= sourceBytes ||
    !output.includes("<pre") ||
    !output.includes("<span")
  ) {
    throw new Error(`${implementation} did not produce highlighted HTML`);
  }
}

function validateLumisScopes(output, implementation, document, expectations) {
  for (const [scope, fragment] of expectations) {
    if (!output.includes(fragment)) {
      throw new Error(
        `${implementation} has the wrong Dracula style for ${scope} in ${document.id}`,
      );
    }
  }
}

// Every Lumis runtime has to render this document identically. The comparison is
// the point of the showcase, so a divergence names the line rather than only
// reporting that two hashes differ.
function validateLumisAgreement(fragments, document) {
  const [reference, ...rest] = fragments;
  if (!reference) throw new Error(`the showcase produced no Lumis output for ${document.id}`);
  const referenceLines = reference.fragment.split("\n");
  for (const { label, fragment } of rest) {
    if (fragment === reference.fragment) continue;
    const lines = fragment.split("\n");
    const differing = lines.findIndex((line, index) => line !== referenceLines[index]);
    const at = differing === -1 ? Math.min(lines.length, referenceLines.length) : differing;
    throw new Error(
      `${label} does not match ${reference.label} on line ${at + 1} of ${document.id}\n` +
        `  ${label}: ${lines[at] ?? "<no line>"}\n` +
        `  ${reference.label}: ${referenceLines[at] ?? "<no line>"}`,
    );
  }
}

function pageHtml({ fragment, label }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(label)} · Lumis visual comparison</title>
  <style>
    * { box-sizing: border-box; }
    html { background: #171821; color: #f8f8f2; font: 14px/1.5 Inter, ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; }
    main { padding: 16px; min-width: max-content; }
    pre { margin: 0 !important; padding: 20px !important; border: 1px solid #44475a; border-radius: 10px; overflow: visible !important; font: 13px/1.55 "SFMono-Regular", Consolas, "Liberation Mono", monospace !important; tab-size: 4; }
    /* Every highlight.js theme ships a 1em pad on pre code.hljs, which would inset
       one panel by 20px plus 1em while the rest are inset by 20px. */
    pre code { padding: 0 !important; }
  </style>
</head>
<body>
  <main>${fragment}</main>
  <script>
    (function () {
      var at = location.hash.match(/^#at=(\\d+),(\\d+)$/);
      if (at) window.scrollTo(Number(at[1]), Number(at[2]));
      addEventListener("scroll", function () {
        parent.postMessage({ lumisShowcaseScroll: { x: scrollX, y: scrollY } }, "*");
      }, { passive: true });
    })();
  </script>
</body>
</html>
`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
