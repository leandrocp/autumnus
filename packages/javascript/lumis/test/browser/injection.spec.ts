import { expect, test } from "@playwright/test";
import type { InjectionOutcome } from "./injection.js";

test("a walk descends into a language another highlighter already loaded", async ({ page }) => {
  await page.goto("/injection.html");
  await page.waitForFunction(() => window.lumisInjection !== undefined);
  const outcome: InjectionOutcome | undefined = await page.evaluate(() => window.lumisInjection);

  expect(outcome?.error).toBeUndefined();
  // Rust was loaded elsewhere; python never was, so its block stays plain.
  expect(outcome?.injected).toEqual(["rust"]);
  // The Rust package claimed `python`, but the catalog gives that name to Python.
  expect(outcome?.injectedClaimedAlias).toEqual([]);
  // A caller's resolver says where its parsers come from, so nothing is borrowed.
  expect(outcome?.injectedWithResolver).toEqual([]);
});
