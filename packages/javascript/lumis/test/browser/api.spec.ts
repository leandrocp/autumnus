import { expect, test } from "@playwright/test";

test("published modules share the browser root runtime", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/api.html");
  await expect(page.locator("#output")).toHaveText(
    JSON.stringify({
      runtime: "wasm",
      aliases: true,
      guess: "javascript",
      language: "javascript",
      loaded: true,
      theme: "dracula",
      highlighted: true,
    }),
  );
  expect(errors).toEqual([]);
});
