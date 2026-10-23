import { defineConfig } from "@playwright/test";

// Installs the packages `mise run wasm-check-bundler` staged, so it runs from its
// own config rather than failing the conformance suite wherever nothing is staged.
export default defineConfig({
  testDir: "./test/browser",
  testMatch: "staged-packages.spec.ts",
  reporter: process.env.CI ? "github" : "list",
  use: { trace: "retain-on-failure" },
  // WebKit as well, because these are parsers the release toolchain just built,
  // and JavaScriptCore compiles WebAssembly differently from V8.
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
