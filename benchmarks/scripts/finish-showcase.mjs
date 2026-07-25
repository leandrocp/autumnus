#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { implementations } from "./implementations.mjs";

const benchmarksDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(benchmarksDir, "..");
const generatedDir = resolve(benchmarksDir, "showcase/generated");
const fragmentsDir = resolve(generatedDir, "fragments");
const sourcePath = resolve(generatedDir, "assets/webgpu_compute_reduce.html");
const source = await readFile(sourcePath, "utf8");
const sourceBytes = Buffer.byteLength(source);
const sourceLines = source.split("\n").length;

await mkdir(fragmentsDir, { recursive: true });

const commandEnv = {
  ...process.env,
  XDG_CACHE_HOME: resolve(repoDir, "target/benchmarks/cli/xdg-cache"),
  LUMIS_DATA_DIR: resolve(repoDir, "target/benchmarks/cli/data"),
  LUMIS_CONFIG: resolve(repoDir, "target/benchmarks/cli/missing-config.toml"),
  BAT_OPTS: "",
  BAT_PAGER: "cat",
  PAGER: "cat",
  CLICOLOR_FORCE: "1",
};
delete commandEnv.NO_COLOR;

const lumisBinary = resolve(
  repoDir,
  "target/benchmarks/rust-target/release",
  process.platform === "win32" ? "lumis.exe" : "lumis",
);
const lumisCli = run(lumisBinary, [
  "--data-dir",
  commandEnv.LUMIS_DATA_DIR,
  "highlight",
  "--language",
  "html",
  "--formatter",
  "html-inline",
  "--theme",
  "dracula",
  sourcePath,
]);
validateHtml(lumisCli, "Lumis CLI");
await writeFile(resolve(fragmentsDir, "lumis-cli.html"), lumisCli);

const bat = run(findBat(), [
  "--no-config",
  "--paging=never",
  "--style=plain",
  "--color=always",
  "--language=html",
  "--theme=Dracula",
  sourcePath,
]);
const batHtml = `<pre style="background-color:#282a36;color:#f8f8f2"><code>${ansiToHtml(
  bat,
)}</code></pre>`;
validateHtml(batHtml, "bat");
await writeFile(resolve(fragmentsDir, "bat.html"), batHtml);

const manifest = {
  schemaVersion: 2,
  fixture: {
    name: "Three.js webgpu_compute_reduce.html",
    source:
      "https://github.com/mrdoob/three.js/blob/6365c1a0af6a32ed45f99712197555fee2f4b24a/examples/webgpu_compute_reduce.html",
    sha256: createHash("sha256").update(source).digest("hex"),
    bytes: sourceBytes,
    lines: sourceLines,
    injections: ["CSS", "JSON", "JavaScript"],
  },
  theme: {
    name: "Dracula",
    source:
      "https://github.com/dracula/sublime/blob/d490b57c08f3d110ff61a07ec6edcc1ed9e24a63/Dracula.tmTheme",
  },
  implementations: [],
};

for (const { id, label } of implementations) {
  const fragment = await readFile(resolve(fragmentsDir, `${id}.html`), "utf8");
  validateHtml(fragment, label);
  if (id.startsWith("lumis-")) validateLumisScopes(fragment, label);
  const page = pageHtml({ fragment, label });
  await writeFile(resolve(generatedDir, `${id}.html`), page);
  manifest.implementations.push({
    id,
    label,
    outputBytes: Buffer.byteLength(fragment),
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
  `Generated ${implementations.length} visual comparisons from ${sourceLines.toLocaleString()} lines (${sourceBytes.toLocaleString()} bytes).`,
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

function findBat() {
  for (const candidate of ["bat", "batcat"]) {
    const result = spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (!result.error && result.status === 0) return candidate;
  }
  throw new Error("bat is required");
}

function validateHtml(output, implementation) {
  if (
    Buffer.byteLength(output) <= sourceBytes ||
    !output.includes("<pre") ||
    !output.includes("<span")
  ) {
    throw new Error(`${implementation} did not produce highlighted HTML`);
  }
}

function validateLumisScopes(output, implementation) {
  const expected = [
    ["HTML tag delimiter", '<span style="color: #8be9fd;">&lt;</span>'],
    ["HTML tag", '<span style="color: #8be9fd;">title</span>'],
    ["HTML attribute", '<span style="color: #50fa7b;">lang</span>'],
    [
      "HTML title text",
      '<span style="color: #ff79c6; font-weight: bold;">three.js webgpu - compute reduction</span>',
    ],
    ["injected CSS property", '<span style="color: #bd93f9;">background-color</span>'],
  ];
  for (const [scope, fragment] of expected) {
    if (!output.includes(fragment)) {
      throw new Error(`${implementation} has the wrong Dracula style for ${scope}`);
    }
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
  </style>
</head>
<body>
  <main>${fragment}</main>
</body>
</html>
`;
}

function ansiToHtml(input) {
  const foreground = {
    30: "#21222c",
    31: "#ff5555",
    32: "#50fa7b",
    33: "#f1fa8c",
    34: "#bd93f9",
    35: "#ff79c6",
    36: "#8be9fd",
    37: "#f8f8f2",
    90: "#6272a4",
    91: "#ff6e6e",
    92: "#69ff94",
    93: "#ffffa5",
    94: "#d6acff",
    95: "#ff92df",
    96: "#a4ffff",
    97: "#ffffff",
  };
  let style = {};
  let html = "";
  let offset = 0;
  const pattern = new RegExp(`${String.fromCharCode(27)}\\[([0-9;]*)m`, "g");

  for (const match of input.matchAll(pattern)) {
    html += span(input.slice(offset, match.index), style);
    const codes = (match[1] || "0").split(";").map(Number);
    for (let index = 0; index < codes.length; index += 1) {
      const code = codes[index];
      if (code === 0) style = {};
      else if (code === 1) style.bold = true;
      else if (code === 3) style.italic = true;
      else if (code === 4) style.underline = true;
      else if (code === 22) delete style.bold;
      else if (code === 23) delete style.italic;
      else if (code === 24) delete style.underline;
      else if (code === 39) delete style.color;
      else if (foreground[code]) style.color = foreground[code];
      else if (code === 38 && codes[index + 1] === 5) {
        style.color = xtermColor(codes[index + 2]);
        index += 2;
      } else if (code === 38 && codes[index + 1] === 2) {
        style.color = `rgb(${codes[index + 2]},${codes[index + 3]},${codes[index + 4]})`;
        index += 4;
      }
    }
    offset = match.index + match[0].length;
  }
  html += span(input.slice(offset), style);
  if (html.includes("\u001b")) throw new Error("unsupported ANSI escape sequence in bat output");
  return html;
}

function xtermColor(index) {
  const basic = [
    "#000000",
    "#800000",
    "#008000",
    "#808000",
    "#000080",
    "#800080",
    "#008080",
    "#c0c0c0",
    "#808080",
    "#ff0000",
    "#00ff00",
    "#ffff00",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
    "#ffffff",
  ];
  if (index < 16) return basic[index];
  if (index < 232) {
    const value = index - 16;
    const levels = [0, 95, 135, 175, 215, 255];
    return `rgb(${levels[Math.floor(value / 36)]},${levels[Math.floor((value % 36) / 6)]},${
      levels[value % 6]
    })`;
  }
  const gray = 8 + (index - 232) * 10;
  return `rgb(${gray},${gray},${gray})`;
}

function span(value, style) {
  if (!value) return "";
  const declarations = [
    style.color && `color:${style.color}`,
    style.bold && "font-weight:700",
    style.italic && "font-style:italic",
    style.underline && "text-decoration:underline",
  ].filter(Boolean);
  const escaped = escapeHtml(value);
  return declarations.length
    ? `<span style="${declarations.join(";")}">${escaped}</span>`
    : escaped;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
