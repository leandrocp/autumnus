/**
 * `PACKAGE_CACHE_TTL_MS` is ported from `crates/lumis-wasm-runtime`;
 * `test/cache-timing.test.ts` holds the two together. Change it there first.
 *
 * The lock timings have no Rust counterpart: the native store needs no lock,
 * while Node keeps one to avoid duplicate downloads.
 */

/** How long a cached `language.json` is trusted before it is refreshed. */
export const PACKAGE_CACHE_TTL_MS = 60 * 60 * 1000;

/** How long to wait for another process to release a cache lock. */
export const LOCK_TIMEOUT_MS = 120_000;

/** Deliberately longer than {@link LOCK_TIMEOUT_MS}. */
export const LOCK_STALE_AFTER_MS = 300_000;

/** How long to sleep between attempts to take a contended lock. */
export const LOCK_RETRY_MS = 25;
