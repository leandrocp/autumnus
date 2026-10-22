import { describe, expect, it } from "vitest";

import { decodeNativeEvents } from "../src/core/native-event-codec.js";
import { HIGHLIGHT_NAMES } from "../src/highlights.js";

describe("native event codec", () => {
  it("decodes syntax and rainbow-decoration events", () => {
    const encoded = new Uint8Array([
      1,
      0,
      0,
      2,
      0,
      106,
      115, // start: scope 0, language "js"
      0,
      1,
      0,
      0,
      0,
      5,
      0,
      0,
      0, // source: bytes 1..5
      2, // end
      3,
      7,
      0,
      0,
      0, // rainbow bracket start: depth 7
      4, // decoration end
    ]);

    expect(decodeNativeEvents(encoded)).toEqual([
      { type: "start", scope: HIGHLIGHT_NAMES[0], language: "js" },
      { type: "source", start: 1, end: 5 },
      { type: "end" },
      { type: "decorationStart", decoration: { type: "rainbowBracket", depth: 7 } },
      { type: "decorationEnd" },
    ]);
  });

  it("honors Uint8Array offsets", () => {
    const wrapped = new Uint8Array([255, 0, 1, 0, 0, 0, 5, 0, 0, 0, 255]);

    expect(decodeNativeEvents(wrapped.subarray(1, -1))).toEqual([
      { type: "source", start: 1, end: 5 },
    ]);
  });

  it.each([new Uint8Array([0]), new Uint8Array([1]), new Uint8Array([1, 0, 0, 2, 0, 106])])(
    "rejects truncated buffers",
    (encoded) => {
      expect(() => decodeNativeEvents(encoded)).toThrow("Invalid native Lumis event buffer");
    },
  );

  it("decodes both sides of a changed word", () => {
    expect(decodeNativeEvents(new Uint8Array([5, 0, 4, 5, 1, 4]))).toEqual([
      { type: "decorationStart", decoration: { type: "diffWord", kind: "removed" } },
      { type: "decorationEnd" },
      { type: "decorationStart", decoration: { type: "diffWord", kind: "added" } },
      { type: "decorationEnd" },
    ]);
  });

  it.each([new Uint8Array([5]), new Uint8Array([5, 2])])(
    "rejects a changed word without a known side",
    (encoded) => {
      expect(() => decodeNativeEvents(encoded)).toThrow("Invalid native Lumis event buffer");
    },
  );

  it("rejects unknown event tags", () => {
    expect(() => decodeNativeEvents(new Uint8Array([6]))).toThrow(
      "Unknown native Lumis event tag 6",
    );
  });

  it("rejects unknown highlight indices", () => {
    expect(() => decodeNativeEvents(new Uint8Array([1, 255, 255, 0, 0]))).toThrow(
      "Unknown native Lumis highlight index 65535",
    );
  });
});
