import { describe, expect, it } from "vitest";

import { wasmCacheFilename } from "../src/runtime/node.js";

describe("Node runtime", () => {
  it("keeps custom WASM cache keys inside the cache directory", () => {
    const filename = wasmCacheFilename("../../outside\\parser");

    expect(filename).not.toMatch(/[\\/]/);
    expect(filename).toBe("..%2F..%2Foutside%5Cparser.wasm");
  });
});
