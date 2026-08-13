/**
 * `loadLanguages()` is the JavaScript spelling of `Lumis.Languages.load/1`, so
 * these pin the parts of that contract a caller depends on: it warms the runtime
 * `highlight()` already uses, it takes the same names every other runtime takes,
 * and one unobtainable language does not cost the rest.
 *
 * Bundle expansion itself is pinned in `cache.test.ts` against the same shared
 * `expandBundles`; what matters here is that `loadLanguages` goes through it,
 * which the unknown-bundle case proves.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Its own store, never the staged one. Loading writes what it resolves, so
// sharing a directory would leave whatever this pulled in for the next suite to
// verify against its own fixtures.
process.env.LUMIS_DATA_DIR = mkdtempSync(join(tmpdir(), "lumis-load-languages-"));

const { loadLanguages, loadedLanguages, highlight } = await import("../src/index.js");
const { htmlInline } = await import("../src/formatters.js");
const { configureLocalWasmResolver } = await import("./wasm.js");

// Resolve from the checked-in fixtures rather than the CDN, so these neither
// need the network nor depend on whatever version it would hand back.
configureLocalWasmResolver(["json", "javascript", "rust", "css", "python"]);

describe("loadLanguages", () => {
  it("loads into the runtime highlight() uses", async () => {
    expect(loadedLanguages()).not.toContain("json");

    const loaded = await loadLanguages(["json"]);

    expect(loaded).toEqual(["json"]);
    // `loadedLanguages()` reads the default runtime, which is the one the
    // module-level `highlight()` uses — so it is now warm without being handed
    // anything, which is the whole difference from `createHighlighter`.
    expect(loadedLanguages()).toContain("json");

    const html = await highlight('{"answer": 42}', htmlInline({ language: "json" }));
    expect(html).toContain("42");
  });

  it("resolves aliases to the same language", async () => {
    const [id] = await loadLanguages(["js"]);

    expect(id).toBe("javascript");
    expect(loadedLanguages()).toContain("javascript");
  });

  it("deduplicates a name given twice", async () => {
    const loaded = await loadLanguages(["rust", "rust"]);

    expect(loaded).toEqual(["rust"]);
  });

  it("is idempotent", async () => {
    await loadLanguages(["css"]);
    await loadLanguages(["css"]);

    expect(loadedLanguages().filter((id) => id === "css")).toEqual(["css"]);
  });

  it("rejects an unknown bundle rather than treating it as a language", async () => {
    await expect(loadLanguages(["bundle-nope"])).rejects.toThrow(/Unknown bundle "bundle-nope"/);
  });

  it("reports every failure and still loads the rest", async () => {
    const error = await loadLanguages(["not-a-language", "also-not", "python"]).catch(
      (thrown: unknown) => thrown,
    );

    expect(error).toBeInstanceOf(AggregateError);
    const aggregate = error as AggregateError;
    expect(aggregate.errors).toHaveLength(2);
    expect(aggregate.errors.map((each: Error) => each.message).sort()).toEqual([
      'could not load "also-not"',
      'could not load "not-a-language"',
    ]);

    // The name that could be loaded was, rather than being lost to the two
    // that could not.
    expect(loadedLanguages()).toContain("python");
  });
});
