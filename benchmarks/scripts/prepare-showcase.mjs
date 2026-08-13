#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedDir = resolve(benchmarksDir, "showcase/generated");
const assetsDir = resolve(generatedDir, "assets");

// One list, read by the Rust, JavaScript, Elixir and CLI producers alike, so the
// set of documents cannot drift across four languages. `load` is what a runtime
// that cannot fetch inside a synchronous walk has to hold before it starts.
const documents = [
  {
    id: "webgpu",
    label: "three.js WebGPU compute reduce",
    language: "html",
    languageLabel: "HTML",
    file: "webgpu_compute_reduce.html",
    sha256: "e1b31d91c25e9103931d7e830b9dfb9e075d97c175623e3e44fb3dc3685067af",
    source:
      "https://github.com/mrdoob/three.js/blob/6365c1a0af6a32ed45f99712197555fee2f4b24a/examples/webgpu_compute_reduce.html",
    injections: ["CSS", "JSON", "JavaScript"],
    load: ["html", "comment", "css", "json", "javascript"],
    unsupported: [],
  },
  {
    id: "ripgrep",
    label: "ripgrep searcher",
    language: "rust",
    languageLabel: "Rust",
    file: "ripgrep_searcher.rs",
    sha256: "b1ba96daf77e0298c70bc2b381d2b50b358b632c6dfa954e5a0925f0ace32e27",
    source:
      "https://github.com/BurntSushi/ripgrep/blob/4649aa9700619f94cf9c66876e9549d83420e16c/crates/searcher/src/searcher/mod.rs",
    injections: ["Comment"],
    load: ["rust", "comment"],
    unsupported: [],
  },
  {
    id: "phoenix",
    label: "Phoenix core components",
    language: "elixir",
    languageLabel: "Elixir",
    file: "phoenix_core_components.ex",
    sha256: "840129d0b1201a29492ef515c97f017d8a57ca7cd16ef98f5b2789bfa8b00832",
    source:
      "https://github.com/phoenixframework/phoenix/blob/1562adca2e9b02b4564c519d5cc2a096ae6fc009/installer/templates/phx_web/components/core_components.ex",
    injections: ["HEEx", "Markdown", "Comment"],
    load: ["elixir", "heex", "comment", "markdown", "markdown_inline"],
    unsupported: [],
  },
  {
    id: "go",
    label: "Go encoding/json",
    language: "go",
    languageLabel: "Go",
    file: "go_json_encode.go",
    sha256: "c711a284c0fb68148f1e72137b034630a83f03d2f73bc4e0f5d885f786ef0a1a",
    source:
      "https://github.com/golang/go/blob/3901409b5d0fb7c85a3e6730a59943cc93b2835c/src/encoding/json/encode.go",
    injections: ["Comment"],
    load: ["go", "comment"],
    unsupported: [],
  },
  {
    id: "readme",
    label: "Lumis README",
    language: "markdown",
    languageLabel: "Markdown",
    file: "lumis_readme.md",
    sha256: "11e1f4b62177f9b939b5dcbc84612add23dd2171dc9ba0594a62afbb60e82108",
    source: "https://github.com/leandrocp/lumis/blob/main/README.md",
    injections: ["Bash", "Elixir", "Java", "JavaScript", "Rust"],
    // Every fence names its own language, and a browser cannot fetch a parser
    // inside a synchronous walk, so each one has to be held before the walk.
    load: [
      "markdown",
      "markdown_inline",
      "comment",
      "bash",
      "elixir",
      "java",
      "javascript",
      "rust",
    ],
    unsupported: [],
  },
  {
    id: "shadcn",
    label: "shadcn/ui sidebar",
    language: "tsx",
    languageLabel: "TSX",
    file: "shadcn_sidebar.tsx",
    sha256: "78dd9a5c50628d7bc8d5c637fdbfe613e49f4174fd3d525c9cc0be2152e67994",
    source:
      "https://github.com/shadcn-ui/ui/blob/607e8a9717fe6ff0d374ba74c651012f9c052534/apps/v4/registry/new-york-v4/ui/sidebar.tsx",
    injections: ["Comment"],
    load: ["tsx", "comment"],
    unsupported: [],
  },
];

const assets = [
  ...documents.map((document) => ({
    name: document.file,
    source: resolve(benchmarksDir, document.file),
    sha256: document.sha256,
  })),
  {
    name: "Dracula.tmTheme",
    url: "https://raw.githubusercontent.com/dracula/sublime/d490b57c08f3d110ff61a07ec6edcc1ed9e24a63/Dracula.tmTheme",
    sha256: "6767fe7cf5a2759d108207156f500c189a3dec216bd6f4f60b9b4bc09fbf8a5a",
  },
];

await mkdir(assetsDir, { recursive: true });

for (const asset of assets) {
  const path = resolve(assetsDir, asset.name);
  let bytes = asset.source ? await readFile(asset.source) : undefined;

  if (!bytes) {
    try {
      const cached = await readFile(path);
      if (sha256(cached) === asset.sha256) bytes = cached;
    } catch {
      // Download below.
    }
    if (!bytes) {
      const response = await fetch(asset.url);
      if (!response.ok) throw new Error(`failed to download ${asset.url}: HTTP ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
    }
  }

  const actual = sha256(bytes);
  if (actual !== asset.sha256) {
    throw new Error(`${asset.name} SHA-256 mismatch: expected ${asset.sha256}, got ${actual}`);
  }
  await writeFile(path, bytes);
}

await writeFile(resolve(assetsDir, "documents.json"), `${JSON.stringify(documents, null, 2)}\n`);

console.log(generatedDir);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
