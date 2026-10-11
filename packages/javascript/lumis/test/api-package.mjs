import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const store = mkdtempSync(join(tmpdir(), "lumis-api-package-"));
process.env.LUMIS_DATA_DIR = store;
const require = createRequire(import.meta.url);
const aliases = JSON.parse(
  readFileSync(new URL("../../../../fixtures/api.json", import.meta.url), "utf8"),
).deprecated.javascript;
const lookupCases = JSON.parse(
  readFileSync(new URL("../../../../fixtures/language-lookup.json", import.meta.url), "utf8"),
);

try {
  for (const format of ["esm", "cjs"]) {
    const load = format === "esm" ? (name) => import(name) : (name) => require(name);
    const root = await load("@lumis-sh/lumis");
    const languages = await load("@lumis-sh/lumis/languages");
    const themes = await load("@lumis-sh/lumis/themes");
    const html = await load("@lumis-sh/lumis/formatters/html");
    const { htmlInline } = await load("@lumis-sh/lumis/formatters");
    const modules = { languages, themes, html };

    await test(`${format} follows the shared language lookup contract`, () => {
      assert.ok(lookupCases.length >= 24);
      for (const { input, expected } of lookupCases) {
        assert.equal(languages.get(input)?.id ?? null, expected, JSON.stringify(input));
      }
    });

    await test(`${format} preserves the published aliases and catalog APIs`, () => {
      for (const [name, replacement] of Object.entries(aliases)) {
        const [module, member] = replacement.split(".");
        assert.equal(typeof root[name], "function", name);
        assert.equal(root[name], modules[module][member], name);
      }
      assert.equal(languages.guess("app.js"), "javascript");
      assert.equal(languages.get("js").id, "javascript");
      assert.equal(languages.get("no-such-language"), undefined);
      assert.ok(languages.available().some((language) => language.id === "json"));
      assert.ok(themes.available().some((theme) => theme.name === "dracula"));
      assert.equal(themes.get("no-such-theme"), undefined);
      const first = themes.get("dracula");
      first.highlights.normal.fg = "#123456";
      assert.notEqual(themes.get("dracula").highlights.normal.fg, "#123456");
    });

    await test(`${format} loads into the runtime the root highlighter uses`, async () => {
      assert.deepEqual(await languages.load(["json"]), ["json"]);
      assert.ok(root.loadedLanguages().includes("json"));
      languages.configureWasmResolver(() => {
        throw new Error("highlight must reuse the already loaded parser");
      });
      const result = await root.highlight(
        '{"answer":42}',
        htmlInline({ language: "json", theme: themes.get("dracula") }),
      );
      assert.match(result, /<span/u);
      assert.match(result, /42/u);
    });
  }
  for (const format of ["esm", "cjs"]) {
    await test(`${format} explicit client and node modules use their corresponding roots`, async () => {
      const load = format === "esm" ? (name) => import(name) : (name) => require(name);
      const runtimes = [];
      for (const name of ["client", "node"]) {
        const root = await load(`@lumis-sh/lumis/${name}`);
        const languages = await load(`@lumis-sh/lumis/${name}/languages`);
        assert.equal(root.loadLanguages, languages.load);
        assert.equal(root.configureWasmResolver, languages.configureWasmResolver);
        assert.equal(root.loadedLanguages, languages.loaded);
        assert.equal(root.withWasm, languages.withWasm);
        runtimes.push(languages.load);
      }
      assert.notEqual(runtimes[0], runtimes[1]);
    });
  }
} finally {
  rmSync(store, { recursive: true, force: true });
}
