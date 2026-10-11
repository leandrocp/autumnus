import { test } from "@playwright/test";
import { checkApi } from "./api-check.js";

test("published modules share the browser root runtime", async ({ page }) => {
  await checkApi(page, "/api.html");
});
