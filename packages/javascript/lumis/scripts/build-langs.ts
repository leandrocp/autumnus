/**
 * Builds the language modules used by the portable WebAssembly runtime. It reads
 * preprocessed query .scm files, converts Lua patterns to JavaScript regexes,
 * and emits one TypeScript module per language.
 *
 * Preprocessing (inheritance, text replacements, overwrite merging) is done by
 * `mise run langs-preprocess-queries`, which is run before the JS generate commands.
 *
 * Language list and metadata (aliases, wasm_name, query_name) are read from
 * languages.toml at the repo root.
 */

import fs from "node:fs";
import path from "node:path";
import { parse as parseToml } from "smol-toml";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../..");
const QUERIES_PROCESSED_DIR = path.join(WORKSPACE_ROOT, "queries", "processed");
const OUT_DIR = path.resolve(import.meta.dirname, "../langs");
const LANGUAGES_TOML = path.join(WORKSPACE_ROOT, "languages.toml");
const WASM_MANIFEST = path.join(WORKSPACE_ROOT, "wasm-manifest.json");
const PACKAGE_JSON = path.resolve(import.meta.dirname, "../package.json");
const ELIXIR_CATALOG = path.join(
  WORKSPACE_ROOT,
  "packages/elixir/lumis/native/lumis_nif/src/catalog.rs",
);
const ELIXIR_MANIFEST = path.join(
  WORKSPACE_ROOT,
  "packages/elixir/lumis/lib/lumis/generated/language_manifest.ex",
);

interface ParserEntry {
  git: string;
  rev: string;
  crate?: string;
  version: string;
  aliases?: string[];
  emacs?: string[];
  shebang?: string[];
  location?: string;
  generate?: boolean;
  wasm_name?: string;
  query_name?: string;
  display_name?: string;
  variant?: string;
  globs?: string[];
}

interface BundleEntry {
  parsers: string[] | "all";
}

interface LanguagesToml {
  queries: Record<string, { git: string; rev: string; path: string }>;
  parsers: Record<string, ParserEntry>;
  bundles?: Record<string, BundleEntry>;
}

interface WasmManifestEntry {
  packageName: string;
  version: string;
  sha256: string;
  size: number;
  grammarName: string;
}

interface WasmManifest {
  schemaVersion: number;
  treeSitter: string;
  grammars: Record<string, WasmManifestEntry>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLanguagesToml(value: unknown): value is LanguagesToml {
  if (!isRecord(value)) return false;
  if (!isRecord(value.queries) || !isRecord(value.parsers)) return false;
  return true;
}

function readLanguagesToml(): LanguagesToml {
  const text = fs.readFileSync(LANGUAGES_TOML, "utf-8");
  const parsed = parseToml(text);
  if (!isLanguagesToml(parsed)) {
    throw new Error("Invalid languages.toml structure");
  }
  return parsed;
}

function readWasmManifest(): WasmManifest {
  const manifest = JSON.parse(fs.readFileSync(WASM_MANIFEST, "utf-8")) as WasmManifest;
  if (manifest.schemaVersion !== 1 || !isRecord(manifest.grammars)) {
    throw new Error("Invalid wasm-manifest.json structure");
  }
  return manifest;
}

function treeSitterWasmCli(): string {
  const packageJson: { dependencies?: Record<string, string> } = JSON.parse(
    fs.readFileSync(PACKAGE_JSON, "utf-8"),
  );
  const spec = packageJson.dependencies?.["web-tree-sitter"];
  const match = spec?.match(/(\d+\.\d+)/);

  if (!match) {
    throw new Error("Could not determine web-tree-sitter compatibility from package.json");
  }

  return match[1];
}

function convertLuaPatternToRegex(lua: string): string {
  let result = "";
  const chars = [...lua];
  let i = 0;
  let inCharacterClass = false;

  while (i < chars.length) {
    if (chars[i] === "%") {
      i++;
      if (i >= chars.length) break;
      const next = chars[i];
      const map: Record<string, string> = {
        d: "\\d",
        s: "\\s",
        l: "[a-z]",
        u: "[A-Z]",
        A: "[^a-zA-Z]",
        S: "\\S",
        ".": "\\.",
        "%": "%",
        "{": "\\{",
        "}": "\\}",
        $: "\\$",
        "^": "\\^",
      };
      result += map[next] ?? `\\${next}`;
    } else if (chars[i] === "\\") {
      result += chars[i];
      if (i + 1 < chars.length) {
        result += chars[i + 1];
        i++;
      }
    } else if (chars[i] === "[") {
      inCharacterClass = true;
      result += chars[i];
    } else if (chars[i] === "]") {
      inCharacterClass = false;
      result += chars[i];
    } else if (chars[i] === "-" && !inCharacterClass) {
      // Lua's non-greedy zero-or-more quantifier.
      result += "*?";
    } else if ("{}|".includes(chars[i])) {
      // These are literals in Lua patterns but operators in Rust/JS regexes.
      result += `\\${chars[i]}`;
    } else if (chars[i] === "^" && i > 0) {
      result += "\\^";
    } else {
      result += chars[i];
    }
    i++;
  }

  return result;
}

function expandCaseInsensitiveAscii(regex: string): string {
  let result = "";
  let inCharClass = false;

  for (let i = 0; i < regex.length; i++) {
    const char = regex[i];

    if (char === "\\") {
      result += char;
      if (i + 1 < regex.length) {
        result += regex[i + 1];
        i++;
      }
      continue;
    }

    if (char === "[") {
      inCharClass = true;
      result += char;
      continue;
    }

    if (char === "]") {
      inCharClass = false;
      result += char;
      continue;
    }

    if (!inCharClass && /[A-Za-z]/.test(char)) {
      const lower = char.toLowerCase();
      const upper = char.toUpperCase();
      result += lower === upper ? char : `[${lower}${upper}]`;
      continue;
    }

    result += char;
  }

  return result;
}

function normalizeRegexForJs(regex: string): string {
  if (!regex.startsWith("(?i)")) return regex;
  return expandCaseInsensitiveAscii(regex.slice(4));
}

function escapeRegexForQueryString(regex: string): string {
  return regex.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function convertLuaMatches(content: string): string {
  const converted = content
    .split("\n")
    .map((line) => {
      const isLuaMatch = line.includes("#lua-match?") || line.includes("#not-lua-match?");
      let updated = line
        .replace(/#lua-match\?/g, "#match?")
        .replace(/#not-lua-match\?/g, "#not-match?");

      if (isLuaMatch) {
        const firstQuote = updated.indexOf('"');
        if (firstQuote !== -1) {
          const secondQuote = updated.indexOf('"', firstQuote + 1);
          if (secondQuote !== -1) {
            const luaPattern = updated.slice(firstQuote + 1, secondQuote);
            const regex = normalizeRegexForJs(convertLuaPatternToRegex(luaPattern));
            updated =
              updated.slice(0, firstQuote + 1) +
              escapeRegexForQueryString(regex) +
              updated.slice(secondQuote);
          }
        }
      }

      return updated;
    })
    .join("\n");

  return converted.replace(/"\(\?i\)([^"]*)"/g, (_match, regex: string) => {
    return `"${escapeRegexForQueryString(expandCaseInsensitiveAscii(regex))}"`;
  });
}

function resolveQuerySource(language: string, queryType: string): string {
  const filePath = path.join(QUERIES_PROCESSED_DIR, language, `${queryType}.scm`);
  if (!fs.existsSync(filePath)) {
    if (queryType === "brackets") {
      const defaultPath = path.join(QUERIES_PROCESSED_DIR, "default", "brackets.scm");
      if (fs.existsSync(defaultPath)) {
        return fs.readFileSync(defaultPath, "utf-8");
      }
    }
    return "";
  }
  return fs.readFileSync(filePath, "utf-8");
}

function rustRawString(value: string): string {
  value = value.replace(/[ \t]+$/gm, "");
  let hashes = "";
  while (value.includes(`"${hashes}`)) hashes += "#";
  return `r${hashes}"${value}"${hashes}`;
}

function elixirInteger(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "_");
}

interface RuntimeLanguageEntry {
  id: string;
  aliases: string[];
  wasmName: string;
  wasm: WasmManifestEntry;
  highlights: string;
  injections: string;
  locals: string;
  brackets: string;
}

function generateElixirLanguageFiles(entries: RuntimeLanguageEntry[]): void {
  const rustEntries = entries
    .map(
      (entry) => `    LanguageEntry {
        id: ${JSON.stringify(entry.id)},
        aliases: &[${entry.aliases.map(JSON.stringify).join(", ")}],
        grammar_name: ${JSON.stringify(entry.wasm.grammarName)},
        highlights: ${rustRawString(entry.highlights)},
        injections: ${rustRawString(entry.injections)},
        locals: ${rustRawString(entry.locals)},
        brackets: ${rustRawString(entry.brackets)},
    },`,
    )
    .join("\n");

  const rust = `// Auto-generated by packages/javascript/lumis/scripts/build-langs.ts.
// Do not edit manually.

pub struct LanguageEntry {
    pub id: &'static str,
    pub aliases: &'static [&'static str],
    pub grammar_name: &'static str,
    pub highlights: &'static str,
    pub injections: &'static str,
    pub locals: &'static str,
    pub brackets: &'static str,
}

pub static LANGUAGES: &[LanguageEntry] = &[
${rustEntries}
];

pub fn find(name: &str) -> Option<&'static LanguageEntry> {
    LANGUAGES
        .iter()
        .find(|entry| entry.id == name || entry.aliases.contains(&name))
}
`;
  fs.mkdirSync(path.dirname(ELIXIR_CATALOG), { recursive: true });
  fs.writeFileSync(ELIXIR_CATALOG, rust);
  console.log("  Elixir NIF language catalog");

  const elixirEntries = entries
    .map(
      (entry, index) => `    %{
      id: ${JSON.stringify(entry.id)},
      aliases: [${entry.aliases.map(JSON.stringify).join(", ")}],
      wasm_name: ${JSON.stringify(entry.wasmName)},
      package_name: ${JSON.stringify(entry.wasm.packageName)},
      version: ${JSON.stringify(entry.wasm.version)},
      sha256: ${JSON.stringify(entry.wasm.sha256)},
      size: ${elixirInteger(entry.wasm.size)}
    }${index === entries.length - 1 ? "" : ","}`,
    )
    .join("\n");
  const elixir = `# Auto-generated by packages/javascript/lumis/scripts/build-langs.ts.
# Do not edit manually.

defmodule Lumis.Generated.LanguageManifest do
  @moduledoc false

  @languages [
${elixirEntries}
  ]

  @by_name for language <- @languages,
               name <- [language.id | language.aliases],
               into: %{},
               do: {String.downcase(name), language}

  def all, do: @languages

  def fetch(name) when is_binary(name) do
    Map.fetch(@by_name, String.downcase(name))
  end
end
`;
  fs.mkdirSync(path.dirname(ELIXIR_MANIFEST), { recursive: true });
  fs.writeFileSync(ELIXIR_MANIFEST, elixir);
  console.log("  Elixir language manifest");
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const config = readLanguagesToml();
  const tsCli = treeSitterWasmCli();
  const wasmManifest = readWasmManifest();
  if (wasmManifest.treeSitter !== tsCli) {
    throw new Error(
      `WASM manifest targets Tree-sitter ${wasmManifest.treeSitter}, expected ${tsCli}`,
    );
  }
  const expectedLanguageIds = new Set([...Object.keys(config.parsers), "plaintext"]);
  const runtimeEntries: RuntimeLanguageEntry[] = [];

  for (const entry of fs.readdirSync(OUT_DIR)) {
    if (!entry.endsWith(".ts")) continue;
    const id = path.parse(entry).name;
    if (expectedLanguageIds.has(id)) continue;
    fs.unlinkSync(path.join(OUT_DIR, entry));
    console.log(`  removed stale language: langs/${entry}`);
  }

  for (const [id, entry] of Object.entries(config.parsers)) {
    const queryName = entry.query_name || id;
    const wasmName = entry.wasm_name || `tree-sitter-${id}`;
    const wasm = wasmManifest.grammars[wasmName];
    if (!wasm) throw new Error(`Missing ${wasmName} in wasm-manifest.json`);
    const aliases = entry.aliases || [];

    const highlightSource = resolveQuerySource(queryName, "highlights");
    const injectionSource = resolveQuerySource(queryName, "injections");
    const localsSource = resolveQuerySource(queryName, "locals");
    const bracketsSource = resolveQuerySource(queryName, "brackets");
    const highlights = convertLuaMatches(highlightSource);
    const injections = convertLuaMatches(injectionSource);
    const locals = convertLuaMatches(localsSource);
    const brackets = convertLuaMatches(bracketsSource);
    runtimeEntries.push({
      id,
      aliases,
      wasmName,
      wasm,
      highlights,
      injections,
      locals,
      brackets,
    });

    const injectionsStr = injections.trim();
    const localsStr = locals.trim();
    const bracketsStr = brackets.trim();

    const module = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { Language } from '../src/types.js'

const language: Language = {
  id: ${JSON.stringify(id)},
  aliases: ${JSON.stringify(aliases)},
  highlights: ${JSON.stringify(highlights)},${injectionsStr ? `\n  injections: ${JSON.stringify(injections)},` : ""}${localsStr ? `\n  locals: ${JSON.stringify(localsStr)},` : ""}${bracketsStr ? `\n  brackets: ${JSON.stringify(bracketsStr)},` : ""}
  wasm: { packageName: ${JSON.stringify(wasm.packageName)}, name: ${JSON.stringify(wasmName)}, version: ${JSON.stringify(wasm.version)}, sha256: ${JSON.stringify(wasm.sha256)}, size: ${wasm.size} },
}

export default language
`;

    fs.writeFileSync(path.join(OUT_DIR, `${id}.ts`), module);
    console.log(`  ${id}: langs/${id}.ts`);
  }

  // Plaintext — uses diff parser with empty queries (same as Rust crate)
  const diffEntry = config.parsers["diff"];
  if (!diffEntry) throw new Error("diff parser entry not found in languages.toml");
  const diffWasmName = diffEntry.wasm_name || "tree-sitter-diff";
  const diffWasm = wasmManifest.grammars[diffWasmName];
  if (!diffWasm) throw new Error(`Missing ${diffWasmName} in wasm-manifest.json`);
  const plaintextModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { Language } from '../src/types.js'

const language: Language = {
  id: "plaintext",
  aliases: ["text", "txt", "plain"],
  highlights: "",
  wasm: { packageName: ${JSON.stringify(diffWasm.packageName)}, name: ${JSON.stringify(diffWasmName)}, version: ${JSON.stringify(diffWasm.version)}, sha256: ${JSON.stringify(diffWasm.sha256)}, size: ${diffWasm.size} },
}

export default language
`;
  fs.writeFileSync(path.join(OUT_DIR, "plaintext.ts"), plaintextModule);
  console.log(`  plaintext: langs/plaintext.ts`);
  generateElixirLanguageFiles(runtimeEntries);

  // Generate language metadata
  const languageEntries: {
    id: string;
    name: string;
    aliases: string[];
    extensions: string[];
    globs: string[];
    emacsModes: string[];
    shebangs: string[];
  }[] = [];

  for (const [id, entry] of Object.entries(config.parsers)) {
    const aliases = entry.aliases || [];
    const variant = entry.variant || titlecase(id);
    const name = entry.display_name || variant;
    const globs = entry.globs || [];
    const extensions = globs.filter((g) => g.startsWith("*."));
    const emacsModes = entry.emacs || [];
    const shebangs = entry.shebang || [];

    languageEntries.push({ id, name, aliases, extensions, globs, emacsModes, shebangs });
  }

  // Add plaintext
  languageEntries.push({
    id: "plaintext",
    name: "Plain Text",
    aliases: ["text", "txt", "plain"],
    extensions: [],
    globs: [],
    emacsModes: ["fundamental", "text"],
    shebangs: [],
  });

  const GENERATED_DIR = path.resolve(import.meta.dirname, "../src/generated");
  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const languageMetaModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { LanguageInfo } from '../types.js'

export const LANGUAGES: LanguageInfo[] = ${JSON.stringify(languageEntries, null, 2)}
`;
  fs.writeFileSync(path.join(GENERATED_DIR, "languages-meta.ts"), languageMetaModule);
  console.log(`  languages metadata: src/generated/languages-meta.ts`);

  const exactLanguageMap: Record<string, string> = {};
  const emacsModeMap: Record<string, string> = {};
  const shebangMap: Record<string, string> = {};
  const globMatchers: Array<{ id: string; glob: string }> = [];

  for (const language of languageEntries) {
    exactLanguageMap[language.id.toLowerCase()] = language.id;

    for (const alias of language.aliases) {
      exactLanguageMap[alias.toLowerCase()] = language.id;
    }

    for (const mode of language.emacsModes) {
      emacsModeMap[mode.toLowerCase()] = language.id;
    }

    for (const shebang of language.shebangs) {
      shebangMap[shebang.toLowerCase()] = language.id;
    }

    for (const glob of language.globs) {
      globMatchers.push({ id: language.id, glob: glob.toLowerCase() });
    }
  }

  const languageDetectionModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
export const EXACT_LANGUAGE_MAP: Record<string, string> = ${JSON.stringify(exactLanguageMap, null, 2)}

export const EMACS_MODE_MAP: Record<string, string> = ${JSON.stringify(emacsModeMap, null, 2)}

export const SHEBANG_MAP: Record<string, string> = ${JSON.stringify(shebangMap, null, 2)}

export const GLOB_MATCHERS: Array<{ id: string; glob: string }> = ${JSON.stringify(globMatchers, null, 2)}
`;
  fs.writeFileSync(path.join(GENERATED_DIR, "language-detection.ts"), languageDetectionModule);
  console.log(`  language detection: src/generated/language-detection.ts`);

  const languageLoaderEntries = [...Object.keys(config.parsers), "plaintext"]
    .map((id) => `  ${JSON.stringify(id)}: () => import('../../langs/${id}.js'),`)
    .join("\n");

  const languageLoadersModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { Language } from '../types.js'

export const LANGUAGE_LOADERS: Record<string, () => Promise<{ default: Language }>> = {
${languageLoaderEntries}
}
`;
  fs.writeFileSync(path.join(GENERATED_DIR, "language-loaders.ts"), languageLoadersModule);
  console.log(`  language loaders: src/generated/language-loaders.ts`);

  // Generate theme metadata
  const THEMES_SRC = path.join(WORKSPACE_ROOT, "themes");
  const themeEntries: { name: string; appearance: string }[] = [];

  for (const file of fs
    .readdirSync(THEMES_SRC)
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    const json = fs.readFileSync(path.join(THEMES_SRC, file), "utf-8");
    const data = JSON.parse(json);
    if (data.name && data.appearance) {
      themeEntries.push({ name: data.name, appearance: data.appearance });
    }
  }

  const themeMetaModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { ThemeInfo } from '../types.js'

export const THEMES: ThemeInfo[] = ${JSON.stringify(themeEntries, null, 2)}
`;
  fs.writeFileSync(path.join(GENERATED_DIR, "themes-meta.ts"), themeMetaModule);
  console.log(`  themes metadata: src/generated/themes-meta.ts`);

  // Generate bundle files
  const BUNDLES_DIR = path.resolve(import.meta.dirname, "../bundles");
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });

  const allParserIds = Object.keys(config.parsers);
  const expectedBundles = new Set(Object.keys(config.bundles ?? {}));

  for (const entry of fs.readdirSync(BUNDLES_DIR)) {
    if (!entry.endsWith(".ts")) continue;
    const bundleName = path.parse(entry).name;
    if (expectedBundles.has(bundleName)) continue;
    fs.unlinkSync(path.join(BUNDLES_DIR, entry));
    console.log(`  removed stale bundle: bundles/${entry}`);
  }

  for (const [bundleName, bundleEntry] of Object.entries(config.bundles ?? {})) {
    const parserIds = bundleEntry.parsers === "all" ? allParserIds : bundleEntry.parsers;
    const aliases: Record<string, string[]> = {};

    for (const id of parserIds) {
      const entry = config.parsers[id];
      aliases[id] = entry?.aliases ?? [];
    }

    // Always include plaintext
    if (!parserIds.includes("plaintext")) {
      aliases["plaintext"] = ["text", "txt", "plain"];
    }

    const allIds = [...parserIds];
    if (!allIds.includes("plaintext")) {
      allIds.push("plaintext");
    }

    const entries = allIds
      .map((id) => {
        const a = JSON.stringify(aliases[id] ?? []);
        return `  ${JSON.stringify(id)}: lazy(${JSON.stringify(id)}, ${a}, () => import("../langs/${id}.js")),`;
      })
      .join("\n");

    const bundleModule = `// Auto-generated by scripts/build-langs.ts — do not edit manually.
import type { LanguageBundle } from '../src/types.js'
import { lazy } from '../src/bundle-helpers.js'

export const bundledLanguages: LanguageBundle = {
${entries}
}
`;

    fs.writeFileSync(path.join(BUNDLES_DIR, `${bundleName}.ts`), bundleModule);
    console.log(`  bundle ${bundleName}: bundles/${bundleName}.ts (${allIds.length} languages)`);
  }
}

function titlecase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

main();
