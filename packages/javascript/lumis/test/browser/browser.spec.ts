import { readFileSync } from "node:fs";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import type { BrowserTestResult } from "./smoke.js";

const fixtureDir = new URL(
  "../../../../../fixtures/conformance/javascript-html-template-nested-script-css/",
  import.meta.url,
);

function readFixture(name: string): string {
  return readFileSync(new URL(name, fixtureDir), "utf8");
}

const expectedFormatters: BrowserTestResult["formatters"] = {
  bbcodeScoped: readFixture("bbcode.txt"),
  htmlInline: readFixture("html-inline.html"),
  htmlLinked: readFixture("html-linked.html"),
  htmlMultiThemes: readFixture("html-multi-themes.html"),
  terminal: readFixture("terminal.txt"),
};
const fixtureSource = readFixture("source.txt");
const customSource =
  `const nested = foo(bar([1, 2], { a: "3" }));\n` + `const view = ${fixtureSource.trim()};\n`;

test.describe("browser runtime", () => {
  let context: BrowserContext;
  let page: Page;
  let result: BrowserTestResult;
  const externalRequests: string[] = [];
  const pageErrors: string[] = [];

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
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
    result = outcome.result as BrowserTestResult;
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("loads every parser locally without browser errors", () => {
    expect(pageErrors).toEqual([]);
    expect(externalRequests).toEqual([]);
    expect(result.languages).toEqual(
      expect.arrayContaining(["plaintext", "javascript", "html", "css"]),
    );
    expect(result.requestedWasms).toEqual(
      expect.arrayContaining(["tree-sitter-javascript", "tree-sitter-html", "tree-sitter-css"]),
    );
  });

  test("renders with htmlInline", () => {
    expect(result.formatters.htmlInline).toBe(expectedFormatters.htmlInline);
  });

  test("renders with htmlLinked", () => {
    expect(result.formatters.htmlLinked).toBe(expectedFormatters.htmlLinked);
  });

  test("renders with htmlMultiThemes", () => {
    expect(result.formatters.htmlMultiThemes).toBe(expectedFormatters.htmlMultiThemes);
  });

  test("renders with bbcodeScoped", () => {
    expect(result.formatters.bbcodeScoped).toBe(expectedFormatters.bbcodeScoped);
  });

  test("renders with terminal", () => {
    expect(result.formatters.terminal).toBe(expectedFormatters.terminal);
  });

  test("supports a stateful custom formatter", () => {
    const custom = result.customFormatter;

    expect(custom.resolvedLanguage).toBe("javascript");
    expect(custom.restoredLanguage).toBe("js");
    expect(custom.balancedEvents).toBe(true);
    expect(custom.reconstructedSource).toBe(customSource);
    expect(custom.eventLanguages).toEqual(["css", "html", "javascript"]);
    expect(custom.tokenLanguages).toEqual(["css", "html", "javascript"]);
    expect(custom.maxDepth).toBeGreaterThan(1);
    expect(custom.eventCount).toBeGreaterThan(custom.tokenCount);
    expect(custom.tokenCount).toBeGreaterThan(20);
    expect(custom.styledTokenCount).toBeGreaterThan(20);
    expect(custom.eventScopes).toContain("punctuation.bracket.rainbow.1");
    expect(custom.tokenScopes).toContain("punctuation.bracket");
    expect(custom.unicodeToken).toMatchObject({
      text: '"😀"',
      language: "css",
      scope: "string",
    });
    expect(custom.unicodeToken!.endByte - custom.unicodeToken!.startByte).toBeGreaterThan(
      custom.unicodeToken!.text.length,
    );
  });
});
