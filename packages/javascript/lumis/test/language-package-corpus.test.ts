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

/** Lower bounds, matching the Rust half. They catch a discovery bug that finds nothing. */
const MIN_VALID = 9;
const MIN_INVALID = 34;

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
    expect(() => parseLanguagePackage(bytes, declaredPackageName(bytes))).not.toThrow();
  });

  it.each(invalid)("rejects invalid/%s", (_name, bytes) => {
    expect(() => parseLanguagePackage(bytes, declaredPackageName(bytes))).toThrow();
  });

  // Rust used to accept both of these while JavaScript rejected them. Pinned by name
  // so the divergence cannot come back from either side.
  it.each(["language-missing-aliases", "parser-size-zero"])(
    "rejects the formerly divergent %s",
    (name) => {
      const bytes = new Uint8Array(readFileSync(join(CORPUS, "invalid", `${name}.json`)));
      expect(() => parseLanguagePackage(bytes, declaredPackageName(bytes))).toThrow();
    },
  );

  it("rejects malformed UTF-8 instead of replacing it", () => {
    const bytes = new Uint8Array(readFileSync(join(CORPUS, "valid", "minimal.json")));
    const index = Buffer.from(bytes).indexOf("d41d8cd98f00");
    expect(index).toBeGreaterThan(0);
    bytes[index] = 0xff;

    expect(() => parseLanguagePackage(bytes, "@lumis-sh/wasm-json")).toThrow();
  });

  it("rejects a UTF-8 BOM like Rust's JSON parser", () => {
    const json = new Uint8Array(readFileSync(join(CORPUS, "valid", "minimal.json")));
    const bytes = new Uint8Array(json.byteLength + 3);
    bytes.set([0xef, 0xbb, 0xbf]);
    bytes.set(json, 3);

    expect(() => parseLanguagePackage(bytes, "@lumis-sh/wasm-json")).toThrow();
  });

  it.each([
    "language-id-case-collision",
    "language-alias-collision",
    "language-alias-id-collision",
  ])("rejects ambiguous ASCII case-insensitive names in %s", (name) => {
    const bytes = new Uint8Array(readFileSync(join(CORPUS, "invalid", `${name}.json`)));
    expect(() => parseLanguagePackage(bytes, declaredPackageName(bytes))).toThrow();
  });

  it.each(["unpaired-surrogate", "unpaired-surrogate-unknown-field"])(
    "rejects unpaired surrogates anywhere in %s",
    (name) => {
      const bytes = new Uint8Array(readFileSync(join(CORPUS, "invalid", `${name}.json`)));
      expect(() => parseLanguagePackage(bytes, declaredPackageName(bytes))).toThrow();
    },
  );

  it.each(["duplicate-members-last-wins", "maximum-nesting-depth"])(
    "accepts the raw-profile boundary %s",
    (name) => {
      const bytes = new Uint8Array(readFileSync(join(CORPUS, "valid", `${name}.json`)));
      expect(() => parseLanguagePackage(bytes, declaredPackageName(bytes))).not.toThrow();
    },
  );

  it.each([
    "duplicate-member-overwritten-surrogate",
    "nesting-depth-exceeded",
    "unknown-number-out-of-range",
  ])("rejects the raw-profile violation %s", (name) => {
    const bytes = new Uint8Array(readFileSync(join(CORPUS, "invalid", `${name}.json`)));
    expect(() => parseLanguagePackage(bytes, declaredPackageName(bytes))).toThrow();
  });
});

function declaredPackageName(bytes: Uint8Array): string {
  return (JSON.parse(new TextDecoder().decode(bytes)) as { packageName: string }).packageName;
}
