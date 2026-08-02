import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

import { applyCaptureOffset, buildLineStartMap } from "../src/events.js";
import { compileHighlightConfig } from "../src/core/languages.js";
import { ensureLocalWasm } from "./wasm.js";

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
  query: string;
  offset: string[];
  original: Endpoint;
  expected: Endpoint;
}

const fixturePath = fileURLToPath(
  new URL("../../../../fixtures/offset-directive.json", import.meta.url),
);
const { cases } = JSON.parse(readFileSync(fixturePath, "utf8")) as { cases: Case[] };

let Query: typeof import("web-tree-sitter").Query;
let language: import("web-tree-sitter").Language;

beforeAll(async () => {
  const treeSitter = await import("web-tree-sitter");
  await treeSitter.Parser.init();
  Query = treeSitter.Query;
  language = await treeSitter.Language.load(
    new Uint8Array(readFileSync(fileURLToPath(ensureLocalWasm("json")))),
  );
}, 60_000);

/**
 * Every expected range in the fixture came out of Neovim itself, and
 * `crates/lumis-wasm-runtime/src/tree_sitter_highlight.rs` asserts the same file.
 * A change that makes one implementation drift fails in both.
 *
 * The offsets are read back through `compileHighlightConfig`, the path the
 * runtime actually uses, so breaking predicate extraction fails here too.
 */
describe("#offset! matches Neovim", () => {
  it("has a corpus", () => {
    expect(cases.length).toBeGreaterThanOrEqual(10);
  });

  it.each(cases.map((entry) => [entry.name, entry] as const))("%s", (_name, entry) => {
    const config = compileHighlightConfig(language, Query, entry.query, "", "");
    const offset = Object.values(config.captureOffsets[0] ?? {})[0];
    expect(offset, "the directive must survive compilation").toBeDefined();

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

  // Neovim reads pred[3] through pred[6] and stops, so a fifth operand of any
  // kind is untouched. Mirrors `a_fifth_operand_never_voids_the_directive`.
  it.each([
    "((string) @cap (#offset! @cap 0 1 0 -1))",
    "((string) @cap (#offset! @cap 0 1 0 -1 99))",
    "((string) @cap (#offset! @cap 0 1 0 -1 nope))",
    "((string) @cap (#offset! @cap 0 1 0 -1 @cap))",
  ])("a fifth operand never voids %s", (query) => {
    const config = compileHighlightConfig(language, Query, query, "", "");
    expect(Object.values(config.captureOffsets[0] ?? {})[0]).toEqual({
      startRow: 0,
      startColumn: 1,
      endRow: 0,
      endColumn: -1,
    });
  });

  // Neovim raises a Lua error rather than defining a behaviour here, so this is
  // Lumis's own choice and only has to be the same in both implementations.
  it.each([
    "((string) @cap (#offset! @cap 0 nope 0 -1))",
    "((string) @cap (#offset! @cap 0 @cap 0 -1))",
  ])("discards %s, whose slot is not a number", (query) => {
    const config = compileHighlightConfig(language, Query, query, "", "");
    expect(config.captureOffsets[0]).toBeUndefined();
  });
});
