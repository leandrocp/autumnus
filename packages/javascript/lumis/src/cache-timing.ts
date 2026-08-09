/**
 * None of these have a Rust counterpart, and `test/cache-timing.test.ts` is what
 * keeps it that way.
 *
 * The Rust store pins an exact version per package, so a cached package is
 * either that version and trustworthy or it is not and gets refetched; there is
 * no TTL to agree with. `PACKAGE_CACHE_TTL_MS` applies only to a package the
 * catalog does not pin. The lock timings are Node-only: the native store needs
 * no lock, while Node keeps one to avoid duplicate downloads.
 */

/** How long a cached `lumis.json` is trusted before it is refreshed. */
export const PACKAGE_CACHE_TTL_MS = 60 * 60 * 1000;

/** When a lock file is old enough that its owner is presumed dead. */
export const LOCK_STALE_AFTER_MS = 300_000;

/**
 * How long to wait for another process to release a cache lock.
 *
 * Deliberately longer than {@link LOCK_STALE_AFTER_MS}: a waiter that gave up
 * first would fail during the window where it was already entitled to break the
 * lock. A holder on this machine is detected by pid long before either elapses.
 */
export const LOCK_TIMEOUT_MS = LOCK_STALE_AFTER_MS + 30_000;

/** How long to sleep between attempts to take a contended lock. */
export const LOCK_RETRY_MS = 25;
