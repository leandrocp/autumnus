import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { buildCss, type ThemeData } from "@lumis-sh/themes";
import githubLight from "@lumis-sh/themes/github_light";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

const sample: ThemeData = {
  name: "test",
  appearance: "dark",
  revision: "3e976b4",
  highlights: {
    normal: { fg: "red", bg: "green" },
    keyword: { fg: "blue", italic: true },
    "tag.attribute": { bg: "gray", bold: true },
  },
};

describe("buildCss", () => {
  it("renders the default stylesheet", () => {
    const expected = `/* test
 * revision: 3e976b4
 */

pre.lumis {
  color: red;
  background-color: green;
}
.keyword {
  color: blue;
  font-style: italic;
}
.tag-attribute {
  background-color: gray;
  font-weight: bold;
}
`;

    expect(buildCss(sample)).toBe(expected);
  });

  it("scopes selectors and applies base rules", () => {
    const expected = `/* test
 * revision: 3e976b4
 */

html[data-theme="dark"] .lumis {
  color: red;
  background-color: var(--color-grey-900);
  border-radius: 0.375rem;
}
html[data-theme="dark"] .lumis .keyword {
  color: blue;
  font-style: italic;
}
html[data-theme="dark"] .lumis .tag-attribute {
  background-color: gray;
  font-weight: bold;
}
`;

    expect(
      buildCss(sample, {
        selectorPrefix: 'html[data-theme="dark"] ',
        preSelector: ".lumis",
        scopeTokens: true,
        background: "var(--color-grey-900)",
        baseRules: [["border-radius", "0.375rem"]],
      }),
    ).toBe(expected);
  });

  it("omits italic styles when disabled", () => {
    const css = buildCss(sample, { enableItalic: false });

    expect(css).toContain(".keyword {\n  color: blue;\n}");
    expect(css).not.toContain("font-style: italic;");
  });

  it("matches the bundled stylesheet for the default config", () => {
    const bundled = readFileSync(
      require.resolve("@lumis-sh/themes/css/github_light"),
      "utf-8",
    );

    expect(buildCss(githubLight)).toBe(bundled);
  });
});
