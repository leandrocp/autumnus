import { describe, expect, it } from "vitest";
import { parse as parseToml } from "smol-toml";
import { parseLanguagesToml } from "../scripts/languages-toml.js";

describe("languages.toml parsing", () => {
  it("constructs the generator fields from TOML", () => {
    expect(
      parseLanguagesToml(
        parseToml(`
          [parsers.javascript]
          aliases = ["js"]
          wasm_name = "tree-sitter-javascript"

          [bundles.web]
          parsers = ["javascript"]
        `),
      ),
    ).toEqual({
      parsers: {
        javascript: {
          aliases: ["js"],
          emacs: undefined,
          shebang: undefined,
          wasm_name: "tree-sitter-javascript",
          display_name: undefined,
          variant: undefined,
          globs: undefined,
        },
      },
      bundles: { web: { parsers: ["javascript"] } },
    });
  });

  it.each([
    ["parser entry", 'parsers.javascript = "javascript"', "parsers.javascript"],
    ["parser field", "[parsers.javascript]\naliases = [1]", "parsers.javascript.aliases"],
    ["bundle field", "[parsers.javascript]\n[bundles.web]\nparsers = true", "bundles.web.parsers"],
  ])("rejects an invalid %s", (_name, text, path) => {
    expect(() => parseLanguagesToml(parseToml(text))).toThrow(`Invalid languages.toml: ${path}`);
  });
});
