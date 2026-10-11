import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const cases: { expected: string | null }[] = JSON.parse(
  readFileSync(new URL("../../../../../fixtures/theme-choice-cases.json", import.meta.url), "utf8"),
);

test("the published themes module matches the shared corpus in a browser", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  expect(cases.length).toBeGreaterThanOrEqual(20);
  await page.goto("/themes.html");
  await expect(page.locator("#output")).toHaveText(
    JSON.stringify(cases.map((fixture) => fixture.expected)),
  );
  expect(errors).toEqual([]);
});
