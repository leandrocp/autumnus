import { describe, it, expect, beforeAll } from "vitest";
import { createHighlighter } from "../src/index.js";
import { htmlInline } from "../src/formatters.js";
import type { Highlighter, Theme } from "../src/index.js";
import json from "../langs/json.ts";
import { withWasmBundle } from "../src/index.js";
import { bundledLanguages as webBundle } from "../bundles/web.ts";
import { bundledLanguages as webExtraBundle } from "../bundles/web-extra.ts";
import { bundledLanguages as systemBundle } from "../bundles/system.ts";
import { bundledLanguages as backendBundle } from "../bundles/backend.ts";
import { bundledLanguages as fullBundle } from "../bundles/full.ts";
import { configureLocalWasmResolver, ensureLocalWasm } from "./wasm.js";

import dracula from "../../themes/dist/json/dracula.json";

const theme: Theme = dracula;

beforeAll(() => {
  configureLocalWasmResolver(["diff", "json", "javascript", "html", "css", "bash", "c", "rust"]);
}, 120_000);

describe("bundled plaintext", () => {
  // Plaintext has no `languages.toml` entry, so its aliases come from the
  // generator rather than the catalog. Every other assertion here checks that
  // plaintext is present, which an empty alias list still satisfies.
  const bundles = {
    web: webBundle,
    "web-extra": webExtraBundle,
    system: systemBundle,
    backend: backendBundle,
    full: fullBundle,
  };

  for (const [name, bundle] of Object.entries(bundles)) {
    it(`${name} resolves text, txt and plain`, () => {
      expect(bundle.plaintext?.aliases).toEqual(["text", "txt", "plain"]);
    });
  }
});

describe("LanguageBundle type", () => {
  it("web bundle has expected languages", () => {
    expect(Object.keys(webBundle)).toContain("html");
    expect(Object.keys(webBundle)).toContain("javascript");
    expect(Object.keys(webBundle)).toContain("css");
    expect(Object.keys(webBundle)).toContain("json");
    expect(Object.keys(webBundle)).toContain("typescript");
    expect(Object.keys(webBundle)).toContain("plaintext");
    expect(Object.keys(webBundle)).not.toContain("rust");
    expect(Object.keys(webBundle)).not.toContain("bash");
    expect(Object.keys(webBundle)).not.toContain("heex");
  });

  it("web extra bundle has expected languages", () => {
    expect(Object.keys(webExtraBundle)).toContain("angular");
    expect(Object.keys(webExtraBundle)).toContain("astro");
    expect(Object.keys(webExtraBundle)).toContain("dart");
    expect(Object.keys(webExtraBundle)).toContain("elm");
    expect(Object.keys(webExtraBundle)).toContain("heex");
    expect(Object.keys(webExtraBundle)).toContain("php");
    expect(Object.keys(webExtraBundle)).toContain("prisma");
    expect(Object.keys(webExtraBundle)).toContain("surface");
    expect(Object.keys(webExtraBundle)).toContain("vue");
    expect(Object.keys(webExtraBundle)).toContain("plaintext");
    expect(Object.keys(webExtraBundle)).not.toContain("javascript");
    expect(Object.keys(webExtraBundle)).not.toContain("bash");
    expect(Object.keys(webExtraBundle)).not.toContain("sql");
  });

  it("system bundle has expected languages", () => {
    expect(Object.keys(systemBundle)).toContain("c");
    expect(Object.keys(systemBundle)).toContain("cpp");
    expect(Object.keys(systemBundle)).toContain("rust");
    expect(Object.keys(systemBundle)).toContain("go");
    expect(Object.keys(systemBundle)).toContain("zig");
    expect(Object.keys(systemBundle)).toContain("plaintext");
    expect(Object.keys(systemBundle)).not.toContain("html");
  });

  it("backend bundle has expected languages", () => {
    expect(Object.keys(backendBundle)).toContain("python");
    expect(Object.keys(backendBundle)).toContain("go");
    expect(Object.keys(backendBundle)).toContain("sql");
    expect(Object.keys(backendBundle)).toContain("javadoc");
    expect(Object.keys(backendBundle)).toContain("plaintext");
    expect(Object.keys(backendBundle)).not.toContain("html");
    expect(Object.keys(backendBundle)).not.toContain("json");
    expect(Object.keys(backendBundle)).not.toContain("nginx");
  });

  it("full bundle has all languages", () => {
    expect(Object.keys(fullBundle).length).toBeGreaterThan(50);
    expect(Object.keys(fullBundle)).toContain("html");
    expect(Object.keys(fullBundle)).toContain("rust");
    expect(Object.keys(fullBundle)).toContain("plaintext");
  });

  it("LazyLanguage entries have id and aliases", () => {
    const html = webBundle.html;
    expect(html.id).toBe("html");
    expect(html.aliases).toEqual([]);

    const js = webBundle.javascript;
    expect(js.id).toBe("javascript");
    expect(js.aliases).toEqual(["js", "jsx"]);
  });

  it("LazyLanguage entries are callable", async () => {
    const lang = await webBundle.json();
    expect(lang.id).toBe("json");
    expect(lang.packageName).toBe("@lumis-sh/wasm-json");
  });
});

describe("createHighlighter with LanguageBundle", () => {
  it("accepts a bundle and lazily loads languages", async () => {
    const hl = await createHighlighter({ languages: [webBundle] });

    // Languages are registered but not loaded yet
    expect(hl.registeredLanguages).toContain("json");
    expect(hl.registeredLanguages).toContain("html");
    expect(hl.registeredLanguages).toContain("javascript");

    // Only plaintext loaded initially
    expect(hl.languages).toContain("plaintext");
    expect(hl.languages).not.toContain("json");
  });

  it("loads language on demand via loadLanguage string", async () => {
    const hl = await createHighlighter({ languages: [webBundle] });
    expect(hl.languages).not.toContain("json");

    await hl.loadLanguage("json");
    expect(hl.languages).toContain("json");

    const html = hl.highlight('{"a":1}', htmlInline({ language: "json", theme }));
    expect(html).toContain("language-json");
  });

  it("loads language on demand via LazyLanguage handle", async () => {
    const hl = await createHighlighter({ languages: [webBundle] });

    await hl.loadLanguage(webBundle.json);
    expect(hl.languages).toContain("json");

    const html = hl.highlight('{"a":1}', htmlInline({ language: webBundle.json, theme }));
    expect(html).toContain("language-json");
  });

  it("withWasmBundle overrides bundle WASM inputs", async () => {
    const bundle = withWasmBundle(webBundle, { json: ensureLocalWasm("json") });
    const hl = await createHighlighter({ languages: [bundle] });

    await hl.loadLanguage(bundle.json);

    const html = hl.highlight('{"a":1}', htmlInline({ language: bundle.json, theme }));
    expect(html).toContain("language-json");
  });

  it("resolves aliases in lazy registry", async () => {
    const hl = await createHighlighter({ languages: [webBundle] });
    expect(hl.registeredLanguages).toContain("js");
  });
});

describe("createHighlighter with mixed inputs", () => {
  it("accepts Language objects and bundles together", async () => {
    const hl = await createHighlighter({
      languages: [json, systemBundle],
    });

    // json is eagerly loaded
    expect(hl.languages).toContain("json");

    // system bundle languages are registered lazily
    expect(hl.registeredLanguages).toContain("rust");
    expect(hl.languages).not.toContain("rust");
  });

  it("accepts dynamic import promise", async () => {
    const hl = await createHighlighter({
      languages: [import("../langs/json.ts")],
    });

    expect(hl.languages).toContain("json");
  });

  it("accepts lazy import function", async () => {
    const hl = await createHighlighter({
      languages: [() => import("../langs/json.ts")],
    });

    expect(hl.languages).toContain("json");
  });
});

describe("highlight with LanguageRef", () => {
  let hl: Highlighter;

  beforeAll(async () => {
    hl = await createHighlighter({ languages: [json] });
  });

  it("accepts Language object as language", () => {
    const html = hl.highlight('{"a":1}', htmlInline({ language: json, theme }));
    expect(html).toContain("language-json");
  });

  it("accepts string as language", () => {
    const html = hl.highlight('{"a":1}', htmlInline({ language: "json", theme }));
    expect(html).toContain("language-json");
  });
});
