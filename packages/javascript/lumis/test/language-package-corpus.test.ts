/**
 * JavaScript half of the shared language-package validation corpus.
 *
 * The Rust half is `crates/lumis-wasm-runtime/tests/language_package_corpus.rs`.
 * Both read `fixtures/language-packages/` and must agree on every file, so a validator
 * that drifts in either runtime fails here.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseLanguagePackage } from "../src/core/languages.js";

const CORPUS = fileURLToPath(new URL("../../../../fixtures/language-packages", import.meta.url));

/** Every fixture declares this name; the corpus covers document validity only. */
const PACKAGE_NAME = "@lumis-sh/wasm-json";

/** Lower bounds, matching the Rust half. They catch a discovery bug that finds nothing. */
const MIN_VALID = 5;
const MIN_INVALID = 17;

function fixtures(kind: "valid" | "invalid"): [string, Uint8Array][] {
  return readdirSync(join(CORPUS, kind))
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => [
      name.replace(/\.json$/, ""),
      new Uint8Array(readFileSync(join(CORPUS, kind, name))),
    ]);
}

describe("shared language-package corpus", () => {
  const valid = fixtures("valid");
  const invalid = fixtures("invalid");

  it("finds the corpus", () => {
    expect(valid.length).toBeGreaterThanOrEqual(MIN_VALID);
    expect(invalid.length).toBeGreaterThanOrEqual(MIN_INVALID);
  });

  it.each(valid)("accepts valid/%s", (_name, bytes) => {
    expect(() => parseLanguagePackage(bytes, PACKAGE_NAME)).not.toThrow();
  });

  it.each(invalid)("rejects invalid/%s", (_name, bytes) => {
    expect(() => parseLanguagePackage(bytes, PACKAGE_NAME)).toThrow();
  });

  // Rust used to accept both of these while JavaScript rejected them. Pinned by name
  // so the divergence cannot come back from either side.
  it.each(["language-missing-aliases", "parser-size-zero"])(
    "rejects the formerly divergent %s",
    (name) => {
      const bytes = new Uint8Array(readFileSync(join(CORPUS, "invalid", `${name}.json`)));
      expect(() => parseLanguagePackage(bytes, PACKAGE_NAME)).toThrow();
    },
  );
});
