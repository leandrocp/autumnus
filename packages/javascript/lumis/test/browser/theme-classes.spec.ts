import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { formatHtmlMultiThemes } from "../../src/formatter/html-multi-themes.ts";
import { htmlMultiThemes } from "../../src/formatters.ts";
import type { Theme } from "../../src/types.ts";

const theme = { name: "test", appearance: "dark", highlights: {} } satisfies Theme;
const rendered = formatHtmlMultiThemes(
  "x",
  [{ type: "source", start: 0, end: 1 }],
  htmlMultiThemes({ themes: { light: theme, dark: theme, "custom dark": theme } }),
);
const fixture = readFileSync(
  new URL(
    "../../../../../fixtures/conformance/json-multi-themes-variables/html-multi-themes.html",
    import.meta.url,
  ),
  "utf8",
);

for (const [runtime, html] of Object.entries({ javascript: rendered, rust: fixture })) {
  test(`${runtime}: theme classes do not activate Tailwind's dark variant`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setContent(`<style>
      .dark\\:bg-stone-900:where(.dark, .dark *) { background-color: rgb(28, 25, 23); }
    </style>${html}`);
    await page.locator("pre, code").evaluateAll((elements) => {
      for (const element of elements) element.classList.add("dark:bg-stone-900");
    });

    for (const selector of ["pre", "code"]) {
      await expect(page.locator(selector)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    }
    await page.locator("html").evaluate((element) => element.classList.add("dark"));
    for (const selector of ["pre", "code"]) {
      await expect(page.locator(selector)).toHaveCSS("background-color", "rgb(28, 25, 23)");
    }
    await page.locator("html").evaluate((element) => element.classList.remove("dark"));
    for (const selector of ["pre", "code"]) {
      await expect(page.locator(selector)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    }
  });
}
