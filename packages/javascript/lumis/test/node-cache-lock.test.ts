/**
 * A lock file cannot say whether its owner is alive, so the holder records its
 * host and pid. Without that, a process killed mid-download made every other
 * process fail until the staleness timer expired.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { lockOwnerIsGone, wasmCacheFilename, withWasmCacheLock } from "../src/runtime/node-cache.js";

const directory = mkdtempSync(join(tmpdir(), "lumis-lock-"));
afterAll(() => rmSync(directory, { recursive: true, force: true }));

const lockPath = (key: string) => join(directory, `${wasmCacheFilename(key)}.lock`);

/** A pid that cannot be running: allocate one, then let the process exit. */
function deadPid(): number {
  // 2^22 is above every platform's default pid_max, so nothing holds it.
  return 4_194_305;
}

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
    writeFileSync(lockPath("dead"), JSON.stringify({ host: hostname(), pid: deadPid() }));

    const started = Date.now();
    expect(await withWasmCacheLock("dead", async () => "taken", directory)).toBe("taken");
    // Previously this waited out LOCK_TIMEOUT_MS and then threw.
    expect(Date.now() - started).toBeLessThan(1_000);
  });

  it("serializes two callers in the same process", async () => {
    const order: string[] = [];
    const slow = withWasmCacheLock(
      "shared",
      async () => {
        order.push("first-in");
        await new Promise((resolve) => setTimeout(resolve, 50));
        order.push("first-out");
      },
      directory,
    );
    const fast = withWasmCacheLock("shared", async () => void order.push("second"), directory);

    await Promise.all([slow, fast]);
    expect(order).toEqual(["first-in", "first-out", "second"]);
  });
});

describe("lockOwnerIsGone", () => {
  const host = hostname();

  it("is false for a live process", () => {
    expect(lockOwnerIsGone({ host, pid: process.pid }, host)).toBe(false);
  });

  it("is true for a pid that is not running here", () => {
    expect(lockOwnerIsGone({ host, pid: deadPid() }, host)).toBe(true);
  });

  it("never judges a pid from another machine", () => {
    // A shared cache directory can hold a lock written on a different host,
    // where that pid means nothing; the staleness timer covers it instead.
    expect(lockOwnerIsGone({ host: "somewhere-else", pid: deadPid() }, host)).toBe(false);
  });

  it("falls back to the staleness timer for an unreadable lock", () => {
    expect(lockOwnerIsGone(undefined, host)).toBe(false);
  });
});
