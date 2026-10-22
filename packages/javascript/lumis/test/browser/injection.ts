/**
 * A language one highlighter loaded is ready for another highlighter's walk to
 * descend into, without that highlighter naming it, because instantiating a
 * parser whose bytes are already here is synchronous.
 */
import { lowestCompatibleLanguagePackageVersion } from "../../src/core/languages.ts";
import type { Formatter, Language } from "../../src/types.ts";
import { createHighlighter } from "../../src/index.browser.ts";

export interface InjectionOutcome {
  /** Fenced languages the markdown-only highlighter highlighted. */
  injected?: string[];
  /** The same, from a highlighter with a resolver of its own. */
  injectedWithResolver?: string[];
  error?: string;
}

declare global {
  interface Window {
    lumisInjection?: InjectionOutcome;
  }
}

const parsers = import.meta.glob<string>("../../../../../fixtures/test-parsers/*.wasm", {
  eager: true,
  query: "?url",
  import: "default",
});
const queries = import.meta.glob<string>("../../../../../queries/processed/*/*.scm", {
  eager: true,
  query: "?raw",
  import: "default",
});

function query(language: string, kind: string): string | undefined {
  return Object.entries(queries).find(([path]) =>
    path.endsWith(`/processed/${language}/${kind}.scm`),
  )?.[1];
}

/** What an imported `@lumis-sh/wasm-*` package exports, built from the committed fixtures. */
async function importedLanguage(id: string, requires?: Language[]): Promise<Language> {
  const entry = Object.entries(parsers).find(([path]) => path.endsWith(`/tree-sitter-${id}.wasm`));
  if (!entry) throw new Error(`no committed parser fixture for ${id}`);
  const wasm = new URL(entry[1], location.href);
  const bytes = await (await fetch(wasm)).arrayBuffer();
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const sha256 = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const packageName = `@lumis-sh/wasm-${id}`;
  return {
    id,
    aliases: [],
    packageName,
    wasm,
    ...(requires ? { requires } : {}),
    languagePackage: {
      packageName,
      version: lowestCompatibleLanguagePackageVersion(),
      parser: { name: `tree-sitter-${id}`, grammarName: id, sha256 },
      languages: {
        [id]: {
          aliases: [],
          highlights: query(id, "highlights") ?? "",
          injections: query(id, "injections"),
          locals: query(id, "locals"),
        },
      },
    },
  };
}

function injectedLanguages(language: Language): Formatter {
  return {
    language,
    render(_source, events) {
      const seen = new Set<string>();
      for (const event of events) {
        if (event.type === "start" && !event.language.startsWith("markdown")) {
          seen.add(event.language);
        }
      }
      return [...seen].sort().join(",");
    },
  };
}

const document = ["```rust", "fn main() {}", "```", "", "```python", "x = 1", "```", ""].join("\n");

try {
  const markdown = await importedLanguage("markdown", [await importedLanguage("markdown_inline")]);
  await createHighlighter({ languages: [await importedLanguage("rust")] });

  const plain = await createHighlighter({ languages: [markdown] });
  const resolved = await createHighlighter({
    languages: [markdown],
    wasmResolver: () => {
      throw new Error("not reached: every parser here is imported");
    },
  });
  window.lumisInjection = {
    injected: plain.highlight(document, injectedLanguages(markdown)).split(","),
    injectedWithResolver: resolved
      .highlight(document, injectedLanguages(markdown))
      .split(",")
      .filter(Boolean),
  };
} catch (error) {
  window.lumisInjection = { error: String(error) };
}
