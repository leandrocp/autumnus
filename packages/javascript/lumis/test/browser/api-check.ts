import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const cases: { input: string; expected: string | null }[] = JSON.parse(
  readFileSync(new URL("../../../../../fixtures/language-lookup.json", import.meta.url), "utf8"),
);

export async function checkApi(page: Page, url: string): Promise<void> {
  expect(cases.length).toBeGreaterThanOrEqual(24);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(
    (inputs) => {
      window.lookupInputs = inputs;
    },
    cases.map(({ input }) => input),
  );
  await page.goto(url);
  await expect(page.locator("#output")).toHaveText(
    JSON.stringify({
      runtime: "wasm",
      aliases: true,
      guess: "javascript",
      language: "javascript",
      lookup: cases.map(({ expected }) => expected),
      loaded: true,
      theme: "dracula",
      highlighted: true,
    }),
  );
  expect(errors).toEqual([]);
}
