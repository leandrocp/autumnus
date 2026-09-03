/**
 * A lock file cannot say whether its owner is alive, so the holder records its
 * host and pid. Without that, a process killed mid-download made every other
 * process fail until the staleness timer expired.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  lockOwnerIsGone,
  wasmCacheFilename,
  withWasmCacheLock,
} from "../src/runtime/node-cache.js";

const directory = mkdtempSync(join(tmpdir(), "lumis-lock-"));
afterAll(() => {
  rmSync(directory, { recursive: true, force: true });
});

const lockPath = (key: string) => join(directory, "parsers", `${wasmCacheFilename(key)}.lock`);

/** Above every platform's default pid_max, so nothing can hold it. */
const DEAD_PID = 4_194_305;

describe("withWasmCacheLock", () => {
  it("records the holder so peers can tell whether it is alive", async () => {
    let recorded: { host: string; pid: number } | undefined;
    await withWasmCacheLock(
      "owner",
      async () => {
        recorded = JSON.parse(readFileSync(lockPath("owner"), "utf8"));
      },
      directory,
    );

    expect(recorded).toEqual({ host: hostname(), pid: process.pid });
  });

  it("removes the lock when the operation throws", async () => {
    await expect(
      withWasmCacheLock("throwing", () => Promise.reject(new Error("boom")), directory),
    ).rejects.toThrow("boom");

    expect(await withWasmCacheLock("throwing", async () => "free", directory)).toBe("free");
  });

  it("takes over immediately from a holder that died on this machine", async () => {
    writeFileSync(lockPath("dead"), JSON.stringify({ host: hostname(), pid: DEAD_PID }));

    const started = Date.now();
    expect(await withWasmCacheLock("dead", async () => "taken", directory)).toBe("taken");
    // Previously this waited out LOCK_TIMEOUT_MS and then threw.
    expect(Date.now() - started).toBeLessThan(1_000);
  });

  it("never runs two callers at once", async () => {
    // Which caller wins the lock is a race, so assert the guarantee that is
    // actually made: the critical sections do not overlap.
    let running = 0;
    let overlapped = false;

    const hold = (ms: number) =>
      withWasmCacheLock(
        "shared",
        async () => {
          running += 1;
          if (running > 1) overlapped = true;
          await new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
          running -= 1;
        },
        directory,
      );

    await Promise.all([hold(50), hold(0), hold(10)]);
    expect(overlapped).toBe(false);
  });
});

describe("lockOwnerIsGone", () => {
  const host = hostname();

  it("is false for a live process", () => {
    expect(lockOwnerIsGone({ host, pid: process.pid }, host)).toBe(false);
  });

  it("is true for a pid that is not running here", () => {
    expect(lockOwnerIsGone({ host, pid: DEAD_PID }, host)).toBe(true);
  });

  it("never judges a pid from another machine", () => {
    // A shared cache directory can hold a lock written on a different host,
    // where that pid means nothing; the staleness timer covers it instead.
    expect(lockOwnerIsGone({ host: "somewhere-else", pid: DEAD_PID }, host)).toBe(false);
  });

  it("falls back to the staleness timer for an unreadable lock", () => {
    expect(lockOwnerIsGone(undefined, host)).toBe(false);
  });
});
