import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { languageIdForFilename } from "../src/guess-language.js";

interface Case {
  path: string;
  language: string | null;
}

const fixture = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../../../fixtures/injection-filename.json", import.meta.url)),
    "utf8",
  ),
) as { cases: Case[] };

describe("@injection.filename resolution", () => {
  it("reads a corpus that cannot silently shrink", () => {
    expect(fixture.cases.length).toBeGreaterThanOrEqual(14);
  });

  // `crates/lumis-wasm-runtime/tests/injection_filename.rs` reads the same file.
  // The browser cannot call `catalog::find_by_filename`, so this is what keeps
  // the port from drifting.
  it.each(fixture.cases)("resolves $path", ({ path, language }) => {
    expect(languageIdForFilename(path) ?? null).toBe(language);
  });
});
