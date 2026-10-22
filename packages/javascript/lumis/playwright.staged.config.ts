import { defineConfig } from "@playwright/test";

// Installs the packages `mise run wasm-check-bundler` staged, so it runs from its
// own config rather than failing the conformance suite wherever nothing is staged.
export default defineConfig({
  testDir: "./test/browser",
  testMatch: "staged-packages.spec.ts",
  reporter: process.env.CI ? "github" : "list",
  use: { trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
