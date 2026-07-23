import { expect, test } from "@playwright/test";
import type { BrowserTestResult } from "./smoke.js";

test("loads local parsers and highlights in a real browser", async ({ page }) => {
  const externalRequests: string[] = [];
  const pageErrors: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173/")) {
      externalRequests.push(request.url());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.goto("/");
  await page.waitForFunction(
    () => window.__lumisBrowserResult !== undefined || window.__lumisBrowserError !== undefined,
  );

  const outcome = await page.evaluate(() => ({
    error: window.__lumisBrowserError,
    result: window.__lumisBrowserResult,
  }));

  expect(outcome.error).toBeUndefined();
  expect(pageErrors).toEqual([]);
  expect(externalRequests).toEqual([]);

  const result = outcome.result as BrowserTestResult;
  expect(result.languages).toEqual(expect.arrayContaining(["plaintext", "javascript", "html"]));
  expect(result.requestedWasms).toEqual(
    expect.arrayContaining(["tree-sitter-javascript", "tree-sitter-html"]),
  );
  expect(result.javascriptHtml).toContain('class="language-javascript"');
  expect(result.javascriptHtml).toContain("<span");
  expect(result.htmlHtml).toContain('class="language-html"');
  expect(result.htmlHtml).toContain("<span");
  expect(result.injectionLanguages).toContain("html");
});
