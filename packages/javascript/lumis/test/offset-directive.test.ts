import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { applyCaptureOffset, buildLineStartMap } from "../src/events.js";
import type { QueryCaptureOffset } from "../src/types.js";

interface Endpoint {
  startRow: number;
  startColumn: number;
  startByte: number;
  endRow: number;
  endColumn: number;
  endByte: number;
}

interface Case {
  name: string;
  source: string;
  offset: string[];
  original: Endpoint;
  expected: Endpoint;
}

const fixturePath = fileURLToPath(
  new URL("../../../../fixtures/offset-directive.json", import.meta.url),
);
const { cases } = JSON.parse(readFileSync(fixturePath, "utf8")) as { cases: Case[] };

/**
 * Neovim reads `#offset!`'s operands as `pred[3] or 0` through `pred[6] or 0`.
 * Mirrors `parse_offset_operands` in `crates/lumis-wasm-runtime`; the compiler in
 * `core/languages.ts` does the same thing against `PredicateStep` operands.
 */
function parseOffsetOperands(operands: string[]): QueryCaptureOffset | undefined {
  const values = [0, 0, 0, 0];

  for (const [index, operand] of operands.entries()) {
    const value = Number.parseInt(operand, 10);
    if (!Number.isInteger(value)) return undefined;
    if (index < values.length) values[index] = value;
  }

  return {
    startRow: values[0] as number,
    startColumn: values[1] as number,
    endRow: values[2] as number,
    endColumn: values[3] as number,
  };
}

// Every expected range in the fixture came out of Neovim itself, and
// `crates/lumis-wasm-runtime/src/tree_sitter_highlight.rs` asserts the same file.
// A change that makes one implementation drift fails in both.
describe("#offset! matches Neovim", () => {
  it("has a corpus", () => {
    expect(cases.length).toBeGreaterThanOrEqual(10);
  });

  it.each(cases.map((entry) => [entry.name, entry] as const))("%s", (_name, entry) => {
    const offset = parseOffsetOperands(entry.offset);
    expect(offset).toBeDefined();

    const lineStarts = buildLineStartMap(entry.source);
    const actual = applyCaptureOffset(
      {
        startIndex: entry.original.startByte,
        endIndex: entry.original.endByte,
        startPosition: { row: entry.original.startRow, column: entry.original.startColumn },
        endPosition: { row: entry.original.endRow, column: entry.original.endColumn },
      },
      offset,
      lineStarts,
    );

    expect({
      startRow: actual.startPosition.row,
      startColumn: actual.startPosition.column,
      startByte: actual.startIndex,
      endRow: actual.endPosition.row,
      endColumn: actual.endPosition.column,
      endByte: actual.endIndex,
    }).toEqual(entry.expected);
  });
});
