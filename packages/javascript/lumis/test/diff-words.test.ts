/**
 * The TypeScript half of the changed-word parity check.
 *
 * `fixtures/diff-words.json` holds the words each diff marks.
 * `crates/lumis-core/tests/diff_words.rs` asserts Rust marks them; this asserts
 * JavaScript does too, and that a highlighted diff carries them on whichever
 * runtime Node picked.
 */
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

import diff from "../langs/diff.ts";
import javascript from "../langs/javascript.ts";
import { diffWordRanges, type DiffLine } from "../src/diff-words.js";
import { createHighlighter, type HighlightEvent, type Highlighter } from "../src/index.js";
import { htmlLinked, type Formatter } from "../src/formatters.js";
import { configureLocalWasmResolver } from "./wasm.js";

type Marked = [side: "-" | "+", startByte: number, text: string];

const fixture: {
  ranges: Array<{ name: string; diff: string; marked: Marked[] }>;
} = JSON.parse(
  readFileSync(new URL("../../../../fixtures/diff-words.json", import.meta.url), "utf8"),
);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// The removed and added lines of a diff body, each starting with its marker.
function lines(body: string): DiffLine[] {
  const found: DiffLine[] = [];
  let offset = 0;
  body.split("\n").forEach((line, row) => {
    const length = encoder.encode(line).length;
    const kind = line.startsWith("-") ? "removed" : line.startsWith("+") ? "added" : undefined;
    if (kind) found.push({ kind, row, startByte: offset + 1, endByte: offset + length });
    offset += length + 1;
  });
  return found;
}

function slice(bytes: Uint8Array, start: number, end: number): string {
  return decoder.decode(bytes.subarray(start, end));
}

// What a custom formatter sees: each changed word with its side and offset.
const markedWords: Formatter = {
  language: diff,
  render(source, events) {
    const bytes = encoder.encode(source);
    const marked: Marked[] = [];
    let open: OpenWord;
    for (const event of events) {
      open = markEvent(event, open, bytes, marked);
    }
    return JSON.stringify(marked);
  },
};

const SIDE = { removed: "-", added: "+" } as const;

type OpenWord = { side: "-" | "+"; start?: number; end: number } | undefined;

function markEvent(
  event: HighlightEvent,
  open: OpenWord,
  bytes: Uint8Array,
  marked: Marked[],
): OpenWord {
  if (event.type === "decorationStart" && event.decoration.type === "diffWord") {
    return { side: SIDE[event.decoration.kind], end: 0 };
  }
  if (event.type === "decorationEnd" && open?.start !== undefined) {
    marked.push([open.side, open.start, slice(bytes, open.start, open.end)]);
    return undefined;
  }
  if (event.type === "source" && open) {
    return { ...open, start: open.start ?? event.start, end: event.end };
  }
  return open;
}

// Every removed line resembles every added one, so pairing a run of them
// would compare all of them: seconds of work, were it not skipped.
function largeSide(marker: string): string {
  return Array.from(
    { length: 3000 },
    (_, i) => `${marker}let value_${i} = compute(alpha, beta, gamma);\n`,
  ).join("");
}

describe("changed words", () => {
  it("marks the words Rust marks", () => {
    expect(fixture.ranges.length).toBeGreaterThanOrEqual(16);

    for (const testCase of fixture.ranges) {
      const bytes = encoder.encode(testCase.diff);
      const marked = (diffWordRanges(bytes, lines(testCase.diff)) ?? []).map((range): Marked => [
        range.kind === "removed" ? "-" : "+",
        range.startByte,
        slice(bytes, range.startByte, range.endByte),
      ]);
      expect(marked, testCase.name).toEqual(testCase.marked);
    }
  });

  it("gives up inside a run when asked to stop", () => {
    const source = "-a b c\n+a b d";
    let calls = 0;
    const ranges = diffWordRanges(encoder.encode(source), lines(source), () => {
      calls += 1;
      return calls > 1;
    });
    expect(ranges).toBeUndefined();
  });

  // Blank lines skip the comparison, and with it the budget check inside it,
  // so a run of them must not reach the pairing table at all.
  it("keeps blank lines out of the pairing", () => {
    const source = `${"-\n".repeat(5000)}-a b c\n${"+\n".repeat(5000)}+a b d`;
    const bytes = encoder.encode(source);
    let calls = 0;
    const ranges = diffWordRanges(bytes, lines(source), () => {
      calls += 1;
      return calls > 100;
    });
    expect(ranges?.map((range) => slice(bytes, range.startByte, range.endByte))).toEqual([
      "c",
      "d",
    ]);
  });

  describe("in a highlighted diff", () => {
    let hl: Highlighter;
    const header = "@@ -1,9 +1,9 @@\n";
    const headerBytes = encoder.encode(header).length;

    beforeAll(async () => {
      configureLocalWasmResolver(["diff", "javascript"]);
      hl = await createHighlighter({ languages: [diff, javascript] });
    }, 120_000);

    it("marks the fixture's words inside a hunk", () => {
      let checked = 0;
      for (const testCase of fixture.ranges) {
        const output = hl.highlight(`${header}${testCase.diff}`, markedWords, { wordDiff: true });
        const expected = testCase.marked.map(([side, start, text]): Marked => [
          side,
          start + headerBytes,
          text,
        ]);
        expect(JSON.parse(output), testCase.name).toEqual(expected);
        checked += expected.length;
      }
      expect(checked).toBeGreaterThan(20);
    });

    it("renders changed words as linked classes, only when asked", () => {
      const source = `${header}-    File.write!(path, Jason.encode!(json))\n+    File.write!(path, JSON.encode!(json))\n`;

      const marked = hl.highlight(source, htmlLinked({ language: diff }), { wordDiff: true });
      expect(marked).toContain('<span class="l-diff-minus-word">Jason</span>');
      expect(marked).toContain('<span class="l-diff-plus-word">JSON</span>');

      const plain = hl.highlight(source, htmlLinked({ language: diff }));
      expect(plain).not.toMatch(/l-diff-(minus|plus)-word/u);
      expect(plain.replaceAll(/<[^>]+>/gu, "")).toBe(marked.replaceAll(/<[^>]+>/gu, ""));
    });

    it("leaves a run over the size cap unmarked", () => {
      const started = performance.now();
      const html = hl.highlight(
        `${largeSide("-")}${largeSide("+")}`,
        htmlLinked({ language: diff }),
        { wordDiff: true },
      );

      expect(performance.now() - started).toBeLessThan(2000);
      expect(html).not.toContain("data-lumis-budget");
      expect(html).not.toMatch(/l-diff-(minus|plus)-word/u);
    });

    it("leaves other languages alone", () => {
      const output = hl.highlight(
        "-a\n+b\n",
        { ...markedWords, language: javascript },
        {
          wordDiff: true,
        },
      );
      expect(output).toBe("[]");
    });
  });
});
