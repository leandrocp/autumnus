/**
 * The public contract that must not depend on which runtime Node picked.
 *
 * Node highlights through the Wasmtime addon and falls back to `web-tree-sitter`,
 * and the two resolve parsers completely differently — Rust against its own store,
 * JavaScript against a resolver you can configure. A caller should not be able to
 * tell. `mise run test-javascript` runs this file under both.
 */
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Language } from "../src/types.js";
import { ensureLocalParserWasm, ensureLocalWasm, localLanguagePackageResolver } from "./wasm.js";

process.env.LUMIS_DATA_DIR = mkdtempSync(join(tmpdir(), "lumis-parity-"));

/**
 * A language Lumis does not ship: its own id, its own parser bytes, its own
 * query. Nothing about it can come from the generated catalog.
 */
function customJson(): Language {
  return {
    id: "custom-json",
    aliases: ["cjson"],
    highlights: "(string) @string",
    wasm: new Uint8Array(readFileSync(fileURLToPath(ensureLocalWasm("json")))),
  };
}

let index: typeof import("../src/index.js");
let htmlLinked: typeof import("../src/formatters.js").htmlLinked;

beforeAll(async () => {
  index = await import("../src/index.js");
  ({ htmlLinked } = await import("../src/formatters.js"));
});

beforeEach(() => {
  index.configureLanguagePackageResolver(localLanguagePackageResolver);
});

describe("runtime parity", () => {
  it("runs under the runtime the environment asked for", () => {
    const requested = process.env.LUMIS_TEST_RUNTIME;
    if (requested === "native" || requested === "wasm") {
      expect(index.runtimeKind()).toBe(requested);
    } else {
      expect(["native", "wasm"]).toContain(index.runtimeKind());
    }
  });

  it("highlights a complete custom language definition", async () => {
    const language = customJson();
    const hl = await index.createHighlighter({ languages: [language] });
    const html = hl.highlight('{"a": "b"}', htmlLinked({ language }));

    expect(html).toContain('class="language-custom-json"');
    // The custom query captures strings and nothing else, so highlighting ran
    // rather than the document being passed through unchanged.
    expect(html).toContain('class="l-string"');
  }, 30_000);

  it("registers a custom language and its aliases", async () => {
    const language = customJson();
    const hl = await index.createHighlighter({ languages: [language] });

    expect(hl.registeredLanguages).toContain("custom-json");
    expect(hl.languages).toContain("custom-json");
  }, 30_000);

  it("rejects a custom language with no queries and no package", async () => {
    const hl = await index.createHighlighter({
      languages: [
        {
          id: "no-queries",
          aliases: [],
          wasm: new Uint8Array(readFileSync(fileURLToPath(ensureLocalWasm("json")))),
        },
      ],
    });

    // `createHighlighter` reports what it could load rather than failing, so the
    // incomplete definition has to be absent rather than half-registered.
    expect(hl.registeredLanguages).not.toContain("no-queries");
  }, 30_000);

  it("reads parser bytes a per-highlighter resolver returns", async () => {
    const { default: diff } = await import("../langs/diff.ts");
    const seen: string[] = [];

    const hl = await index.createHighlighter({
      languages: [diff],
      wasmResolver: (language, wasm) => {
        seen.push(language);
        return ensureLocalParserWasm(language, wasm.name);
      },
    });

    expect(seen).toContain("diff");
    expect(hl.highlight("- old\n+ new", htmlLinked({ language: diff }))).toContain(
      'class="language-diff"',
    );
  }, 30_000);

  it("applies a globally configured resolver to later highlighters", async () => {
    const { default: css } = await import("../langs/css.ts");
    const seen: string[] = [];

    index.configureWasmResolver((language, wasm) => {
      seen.push(language);
      return ensureLocalParserWasm(language, wasm.name);
    });

    const hl = await index.createHighlighter({ languages: [css] });

    expect(seen).toContain("css");
    expect(hl.highlight("a { color: red }", htmlLinked({ language: css }))).toContain(
      'class="language-css"',
    );
  }, 30_000);
});
