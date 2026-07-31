/**
 * Timing shared with the native runtimes.
 *
 * The browser cannot call Rust, so this is a port. `crates/lumis-wasm-runtime`
 * defines `PACKAGE_CACHE_TTL`, and `test/cache-timing.test.ts` reads that file to
 * check the two still agree. Change it there first.
 *
 * The lock timings below have no Rust counterpart. The native store needs no lock:
 * writes rename a uniquely named temporary into place and parser bytes are
 * verified first, so concurrent writers converge. The browser and Node keep a
 * lock only to avoid duplicate downloads, which is a cost concern, not a
 * correctness one.
 */

/** How long a cached `language.json` is trusted before it is refreshed. */
export const PACKAGE_CACHE_TTL_MS = 60 * 60 * 1000;

/** How long to wait for another process to release a cache lock. */
export const LOCK_TIMEOUT_MS = 120_000;

/**
 * When a lock file is old enough that its owner is presumed dead.
 *
 * Deliberately longer than {@link LOCK_TIMEOUT_MS}: a process that dies holding
 * the lock makes its peers fail for the difference rather than wait forever.
 */
export const LOCK_STALE_AFTER_MS = 300_000;

/** How long to sleep between attempts to take a contended lock. */
export const LOCK_RETRY_MS = 25;
