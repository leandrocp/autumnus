/**
 * These lock timings are Node-only: the native store needs no lock, while Node
 * keeps one to avoid duplicate downloads.
 */

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
