/**
 * Node's default runtime is the native addon, which is the same Wasmtime
 * highlighting the CLI and the Elixir bindings run. These pin what makes it
 * worth having: it resolves parsers itself, and it loads a language injected
 * inside a document during the walk that finds it.
 */
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Read when the addon builds its store, which is the first call into it below.
process.env.LUMIS_WASM_PATH = resolve(import.meta.dirname, "../../../../target/test-parsers");
process.env.LUMIS_DATA_DIR = mkdtempSync(join(tmpdir(), "lumis-native-test-"));

const { loadAddon } = await import("../src/native-binding.js");

// Asserted directly, so a run that selected the Wasm runtime still covers this.
const binding = loadAddon();

/** Every platform CI builds for. Elsewhere the Wasm runtime is the answer. */
const PREBUILT = new Set(["darwin-arm64", "darwin-x64", "linux-x64", "linux-arm64", "win32-x64"]);
const platform = `${process.platform}-${process.arch}`;

describe("native runtime", () => {
  it("is present wherever an addon is built", () => {
    if (!PREBUILT.has(platform)) {
      expect(binding).toBeUndefined();
      return;
    }
    if (!existsSync(new URL("../native", import.meta.url))) {
      throw new Error("run `pnpm build:native` (or `mise run test-javascript`) first");
    }
    expect(binding?.runtimeKind()).toBe("native");
  });

  it.runIf(binding)("resolves a parser without any JavaScript resolver", () => {
    const runtime = new binding!.NativeRuntime();
    runtime.loadLanguage("json");
    expect(runtime.hasLanguage("json")).toBe(true);
  });

  it.runIf(binding)("loads an injected language during the walk that finds it", () => {
    const runtime = new binding!.NativeRuntime();
    runtime.loadLanguage("html");
    expect(runtime.hasLanguage("javascript")).toBe(false);

    runtime.highlightEvents("<script>const answer = 42</script>", "html", false);

    expect(runtime.hasLanguage("javascript")).toBe(true);
  });

  it.runIf(binding)("leaves a document alone when an injected language is unavailable", () => {
    const runtime = new binding!.NativeRuntime();
    // `comment` is staged, `regex` is not, and markdown injects both.
    const events = runtime.highlightEvents("```regex\n[a-z]+\n```\n", "markdown", false);
    expect(events.length).toBeGreaterThan(0);
  });
});
