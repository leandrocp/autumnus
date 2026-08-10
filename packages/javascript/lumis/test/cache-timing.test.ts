/** Pins the JavaScript cache timings to the Rust definitions they port. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LOCK_STALE_AFTER_MS, LOCK_TIMEOUT_MS } from "../src/cache-timing.js";

const STORE_RS = fileURLToPath(
  new URL("../../../../crates/lumis-wasm-runtime/src/store.rs", import.meta.url),
);

describe("cache timings match the Rust runtime", () => {
  const source = readFileSync(STORE_RS, "utf8");

  it("finds the Rust definitions", () => {
    // Guards against the regex silently matching nothing if store.rs is reshaped.
    expect(source).toContain("const REPLACE_RETRY_DELAY");
  });

  it("has no package TTL to agree with", () => {
    expect(source).not.toContain("PACKAGE_CACHE_TTL");
  });

  it("waits past the point where a stale lock may be broken", () => {
    // Giving up first would fail callers during the window in which they were
    // already entitled to take the dead holder's lock.
    expect(LOCK_TIMEOUT_MS).toBeGreaterThan(LOCK_STALE_AFTER_MS);
  });
});
