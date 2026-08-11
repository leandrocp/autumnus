import { describe, expect, it } from "vitest";
import { parse as parseToml } from "smol-toml";
import { parseLanguagesToml } from "../scripts/languages-toml.js";

describe("languages.toml parsing", () => {
  it("constructs the generator fields from TOML", () => {
    expect(
      parseLanguagesToml(
        parseToml(`
          [plaintext]
          display_name = "Plain Text"
          variant = "PlainText"
          aliases = ["text", "txt", "plain"]
          emacs = ["fundamental", "text"]

          [parsers.javascript]
          aliases = ["js"]
          wasm_name = "tree-sitter-javascript"

          [bundles.web]
          parsers = ["javascript"]
        `),
      ),
    ).toEqual({
      plaintext: {
        aliases: ["text", "txt", "plain"],
        emacs: ["fundamental", "text"],
        shebang: undefined,
        display_name: "Plain Text",
        variant: "PlainText",
        globs: undefined,
      },
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
    ["plaintext entry", "[plaintext]\naliases = [1]\n[parsers]", "plaintext.aliases"],
    ["missing plaintext entry", "[parsers]", "plaintext"],
    ["parser entry", 'parsers.javascript = "javascript"', "parsers.javascript"],
    ["parser field", "[parsers.javascript]\naliases = [1]", "parsers.javascript.aliases"],
    ["bundle field", "[parsers.javascript]\n[bundles.web]\nparsers = true", "bundles.web.parsers"],
    ["empty parser ID", '[parsers.""]', "parsers."],
    ["dot-segment parser ID", '[parsers.".."]', "parsers..."],
    ["slash in parser ID", '[parsers."../outside"]', "parsers.../outside"],
    ["backslash in parser ID", "[parsers.'outside\\parser']", "parsers.outside\\parser"],
    ["empty bundle name", '[parsers.javascript]\n[bundles.""]\nparsers = []', "bundles."],
    ["dot-segment bundle name", '[parsers.javascript]\n[bundles."."]\nparsers = []', "bundles.."],
    [
      "slash in bundle name",
      '[parsers.javascript]\n[bundles."web/extra"]\nparsers = []',
      "bundles.web/extra",
    ],
    [
      "backslash in bundle name",
      "[parsers.javascript]\n[bundles.'web\\extra']\nparsers = []",
      "bundles.web\\extra",
    ],
    [
      "unknown bundle parser",
      '[parsers.javascript]\n[bundles.web]\nparsers = ["missing"]',
      "bundles.web.parsers",
    ],
  ])("rejects an invalid %s", (name, text, path) => {
    const document =
      name === "missing plaintext entry" || text.includes("[plaintext]")
        ? text
        : `plaintext = { display_name = "Plain Text" }\n${text}`;
    expect(() => parseLanguagesToml(parseToml(document))).toThrow(
      `Invalid languages.toml: ${path}`,
    );
  });
});
