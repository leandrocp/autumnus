// Renders public/comparison/index.md from the published comparison and its
// measurements, so the Markdown page states what the data says rather than what
// someone last wrote about it. Without `--write` it fails when the committed
// page is not what the data renders.
import { readFile, writeFile } from "node:fs/promises";

const markdownUrl = new URL("../public/comparison/index.md", import.meta.url);
const vercelUrl = new URL("../vercel.json", import.meta.url);
const publishedManifest = await readJson(
  new URL("../public/comparison-data/manifest.json", import.meta.url),
);
const publishedReport = await readJson(
  new URL("../public/benchmark-data/comparison.json", import.meta.url),
);

const markdown = render(publishedManifest, publishedReport);
const tokens = Math.ceil(Buffer.byteLength(markdown, "utf8") / 4);

if (process.argv.includes("--write")) {
  await writeFile(markdownUrl, markdown);
  const vercel = await readFile(vercelUrl, "utf8");
  await writeFile(
    vercelUrl,
    vercel.replace(
      /("src": "\^\/comparison\/\?\$"[\s\S]*?"x-markdown-tokens": ")\d+"/u,
      (_match, prefix) => `${prefix}${tokens}"`,
    ),
  );
  console.log(`Wrote public/comparison/index.md (${tokens} tokens).`);
} else if ((await readFile(markdownUrl, "utf8")) === markdown) {
  console.log("public/comparison/index.md matches the published comparison.");
} else {
  throw new Error(
    "public/comparison/index.md does not match the published comparison; " +
      "run `node website/scripts/comparison-markdown.mjs --write`",
  );
}

function render(manifest, report) {
  const libraries = listOf(manifest.implementations.map((entry) => entry.label));
  return [
    "---",
    "title: Lumis - Visual output comparison",
    `description: The same source files highlighted by ${libraries}.`,
    "---",
    "",
    "# Visual output comparison",
    "",
    `The [interactive comparison](https://lumis.sh/comparison/) renders the same source files with ${libraries}, ` +
      "each through its own public API, in Catppuccin " +
      `${listOf(manifest.themes.map((theme) => theme.name.replace(/^Catppuccin /u, "")))}. ` +
      "Every Lumis runtime renders each file byte for byte identically, so one Lumis output is shown.",
    "",
    "## Libraries",
    "",
    ...table(
      ["Library", "Version", "Theme"],
      "lll",
      manifest.implementations.map((entry) => [entry.label, entry.version, entry.theme]),
    ),
    "",
    "speed-highlight has no TSX grammar, so it reads the TSX file as TypeScript.",
    "",
    "## Documents",
    "",
    ...manifest.documents.map(documentLine),
    "",
    "## Methodology",
    "",
    ...methodology(report),
    "",
    "A token is a span the highlighter gave a colour to, counted in the published output. " +
      "Grammars split punctuation and whitespace differently, so it shows how finely a file was " +
      "resolved, not a quality score.",
    "",
    "## Results",
    "",
    ...manifest.documents.flatMap((document) => results(manifest, report, document)),
    "The source files, rendering pipeline, themes, and generated outputs are available in the " +
      "[Lumis repository](https://github.com/leandrocp/lumis).",
    "",
    "[Lumis home](https://lumis.sh/) · [Documentation](https://docs.lumis.sh) · [Showcase](https://lumis.sh/showcase/)",
    "",
  ].join("\n");
}

function documentLine(document) {
  const injections =
    document.injections.length > 0 ? ` with ${listOf(document.injections)} injections` : "";
  const unsupported =
    document.unsupported.length > 0
      ? `; not supported by ${listOf(document.unsupported.map((id) => labelOf(id)))}`
      : "";
  return (
    `- [${document.label}](${document.source}): ${document.languageLabel}${injections}, ` +
    `${document.lines.toLocaleString("en")} lines${unsupported}`
  );
}

function methodology(report) {
  const system = report.system ?? {};
  const lines = [
    `- Measured: ${report.measuredAt ? report.measuredAt.slice(0, 10) : "date not recorded in this report"}`,
    `- Hardware: ${hardware(system)}`,
    `- Operating system: ${system.os ?? [system.platform, system.release].filter(Boolean).join(" ")}`,
  ];
  if (report.runtimes) {
    lines.push(`- Runtimes: Node.js ${report.runtimes.node}, ${report.runtimes.rust}`);
  }
  lines.push(
    `- Metric: ${report.metric} of each library's samples; every figure comes from one run on one machine`,
    `- Timed: ${report.timingBoundary}`,
  );
  if (report.memory) {
    const { baselines } = report.memory;
    lines.push(
      `- Memory: ${report.memory.metric} ${report.memory.boundary}, over ${report.memory.runs} processes`,
      `- Resident set size: ${report.memory.definition}. ` +
        `An empty Node.js process peaks at ${mebibytes(baselines.node)} and an empty Rust one at ${mebibytes(baselines.rust)}`,
    );
  } else {
    lines.push("- Memory: not measured in this report");
  }
  return lines;
}

function hardware(system) {
  const parts = [system.cpu ?? "unknown CPU", system.architecture].filter(Boolean);
  if (system.cores) parts.push(`${system.cores} cores`);
  if (system.memoryBytes) parts.push(`${Math.round(system.memoryBytes / 2 ** 30)} GiB`);
  return parts.join(", ");
}

// A figure is published only beside the output it measured, as on the page.
function results(manifest, report, document) {
  const measured = new Map(
    report.documents.find((entry) => entry.id === document.id)?.results.map((r) => [r.id, r]),
  );
  const rows = manifest.implementations
    .filter((entry) => !document.unsupported.includes(entry.id))
    .map((entry) => {
      const result = measured.get(entry.id);
      const current = result?.sha256 === document.outputSha256[entry.id]?.[report.theme];
      return [
        entry.label,
        document.tokens[entry.id].toLocaleString("en"),
        current ? duration(result.totalNs) : "—",
        current && result.peakRssBytes ? mebibytes(result.peakRssBytes) : "—",
      ];
    });
  return [
    `### ${document.label}`,
    "",
    ...table(["Library", "Tokens", "Median highlight", "Peak RSS"], "lrrr", rows),
    "",
  ];
}

// Padded the way the website's formatter pads a Markdown table, so the committed
// page passes its format check as generated.
function table(header, alignment, rows) {
  const widths = header.map((cell, column) =>
    Math.max(3, cell.length, ...rows.map((row) => row[column].length)),
  );
  const pad = (cell, column) =>
    alignment[column] === "r" ? cell.padStart(widths[column]) : cell.padEnd(widths[column]);
  const rule = widths.map((width, column) =>
    alignment[column] === "r" ? `${"-".repeat(width - 1)}:` : "-".repeat(width),
  );
  const padded = (cells) => tableLine(cells.map((cell, column) => pad(cell, column)));
  return [padded(header), tableLine(rule), ...rows.map((row) => padded(row))];
}

function tableLine(cells) {
  return `| ${cells.join(" | ")} |`;
}

function labelOf(id) {
  return publishedManifest.implementations.find((entry) => entry.id === id)?.label ?? id;
}

function listOf(items) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")}${items.length > 2 ? "," : ""} and ${items.at(-1)}`;
}

function duration(ns) {
  if (ns >= 1e9) return `${(ns / 1e9).toFixed(2)} s`;
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(2)} ms`;
  return `${(ns / 1e3).toFixed(0)} µs`;
}

function mebibytes(bytes) {
  return `${(bytes / 2 ** 20).toFixed(1)} MiB`;
}

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}
