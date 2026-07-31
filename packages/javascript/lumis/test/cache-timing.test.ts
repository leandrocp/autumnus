/**
 * Pins the JavaScript cache timings to the Rust definitions they port.
 *
 * The browser cannot call Rust, so `src/cache-timing.ts` is a genuine port —
 * the kind `AGENTS.md` requires to be held against its original by a test.
 * These constants previously appeared as bare numbers in `node-cache.ts` and
 * `core/languages.ts` and agreed with `crates/lumis-wasm-runtime` only because
 * one person wrote both.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  LOCK_STALE_AFTER_MS,
  LOCK_TIMEOUT_MS,
  PACKAGE_CACHE_TTL_MS,
} from "../src/cache-timing.js";

const STORE_RS = fileURLToPath(
  new URL("../../../../crates/lumis-wasm-runtime/src/store.rs", import.meta.url),
);

/** Read `pub const NAME: Duration = Duration::from_secs(<expr>);` as milliseconds. */
function rustDurationMs(source: string, name: string): number {
  const match = source.match(
    new RegExp(String.raw`pub const ${name}: Duration = Duration::from_secs\(([^)]+)\);`),
  );
  if (!match) throw new Error(`${name} not found in store.rs`);
  const expression = match[1]!.trim();
  if (!/^[\d\s*+]+$/.test(expression)) {
    throw new Error(`${name} is not a plain arithmetic expression: ${expression}`);
  }
  // Only digits and * + reach here, so this is a constant fold, not arbitrary code.
  const seconds = Function(`"use strict";return (${expression})`)() as number;
  return seconds * 1000;
}

describe("cache timings match the Rust runtime", () => {
  const source = readFileSync(STORE_RS, "utf8");

  it("finds the Rust definitions", () => {
    // Guards against the regex silently matching nothing if store.rs is reshaped.
    expect(source).toContain("pub const PACKAGE_CACHE_TTL");
    expect(source).toContain("pub const LOCK_TIMEOUT");
    expect(source).toContain("pub const LOCK_STALE_AFTER");
  });

  it.each([
    ["PACKAGE_CACHE_TTL", PACKAGE_CACHE_TTL_MS],
    ["LOCK_TIMEOUT", LOCK_TIMEOUT_MS],
    ["LOCK_STALE_AFTER", LOCK_STALE_AFTER_MS],
  ])("%s agrees", (name, javascript) => {
    expect(rustDurationMs(source, name)).toBe(javascript);
  });

  it("keeps the stale threshold above the wait", () => {
    // A dead lock holder must eventually be taken over rather than block forever.
    expect(LOCK_STALE_AFTER_MS).toBeGreaterThan(LOCK_TIMEOUT_MS);
  });
});
