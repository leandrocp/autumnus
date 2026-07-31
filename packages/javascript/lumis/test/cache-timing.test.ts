/** Pins the JavaScript cache timings to the Rust definitions they port. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LOCK_STALE_AFTER_MS, LOCK_TIMEOUT_MS, PACKAGE_CACHE_TTL_MS } from "../src/cache-timing.js";

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
  });

  it("PACKAGE_CACHE_TTL agrees", () => {
    expect(rustDurationMs(source, "PACKAGE_CACHE_TTL")).toBe(PACKAGE_CACHE_TTL_MS);
  });

  it("keeps the stale threshold above the wait", () => {
    // JavaScript-only: a dead lock holder must be taken over, not block forever.
    expect(LOCK_STALE_AFTER_MS).toBeGreaterThan(LOCK_TIMEOUT_MS);
  });
});
