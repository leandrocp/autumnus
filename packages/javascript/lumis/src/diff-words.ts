import type { DiffWordKind } from "./diff-word-style.js";

/**
 * Runs larger than this on either side, in bytes of line content, are left
 * unmarked. The comparison table grows with the product of both sides.
 */
export const MAX_RUN_SIDE_BYTES = 1000;

/** One removed or added line, as the diff grammar marks it. */
export interface DiffLine {
  kind: DiffWordKind;
  /** The zero-based row the line is on, which decides what counts as consecutive. */
  row: number;
  /** The line's text after its `-` or `+` marker, as UTF-8 byte offsets. */
  startByte: number;
  endByte: number;
}

/** A changed range before it is composed into the event stream. */
export interface DiffWordRange {
  startByte: number;
  endByte: number;
  kind: DiffWordKind;
}

type TokenClass = "word" | "space" | "other";

interface Token {
  startByte: number;
  endByte: number;
  text: string;
  class: TokenClass;
}

interface Comparison {
  oldChanged: boolean[];
  newChanged: boolean[];
  /** Non-whitespace tokens both lines share. */
  kept: number;
}

/**
 * The changed ranges of every run in `lines`, in source order.
 *
 * The port of `diff_word_ranges` in `crates/lumis-core/src/diff_words.rs`;
 * `test/diff-words.test.ts` holds both to `fixtures/diff-words.json`. The
 * pairing and comparison break ties the same way, so the two mark the same
 * words.
 */
export function diffWordRanges(
  sourceBytes: Uint8Array,
  lines: readonly DiffLine[],
): DiffWordRange[] {
  const ranges: DiffWordRange[] = [];
  let start = 0;
  while (start < lines.length) {
    const end = runEnd(lines, start);
    let split = start;
    while (split < end && lines[split]!.kind === "removed") split += 1;
    diffRun(sourceBytes, lines.slice(start, split), lines.slice(split, end), ranges);
    start = end;
  }
  return ranges;
}

function runEnd(lines: readonly DiffLine[], start: number): number {
  let end = start + 1;
  while (end < lines.length) {
    const previous = lines[end - 1]!;
    const line = lines[end]!;
    const startsNewRun = previous.kind === "added" && line.kind === "removed";
    if (line.row !== previous.row + 1 || startsNewRun) break;
    end += 1;
  }
  return end;
}

function diffRun(
  sourceBytes: Uint8Array,
  removed: readonly DiffLine[],
  added: readonly DiffLine[],
  out: DiffWordRange[],
): void {
  const sideBytes = (side: readonly DiffLine[]): number =>
    side.reduce((total, line) => total + line.endByte - line.startByte, 0);
  if (
    removed.length === 0 ||
    added.length === 0 ||
    sideBytes(removed) > MAX_RUN_SIDE_BYTES ||
    sideBytes(added) > MAX_RUN_SIDE_BYTES
  ) {
    return;
  }

  const decoder = new TextDecoder();
  const old = removed.map((line) => tokenize(sourceBytes, line, decoder));
  const neu = added.map((line) => tokenize(sourceBytes, line, decoder));

  const removedRanges: DiffWordRange[] = [];
  const addedRanges: DiffWordRange[] = [];
  for (const [i, j, comparison] of pairLines(old, neu)) {
    markLine(old[i]!, comparison.oldChanged, "removed", removedRanges);
    markLine(neu[j]!, comparison.newChanged, "added", addedRanges);
  }
  out.push(...removedRanges, ...addedRanges);
}

// Order-preserving pairing that shares the most tokens. Ties prefer pairing,
// then skipping a removed line, as the Rust walk does.
function pairLines(
  old: readonly Token[][],
  neu: readonly Token[][],
): Array<[number, number, Comparison]> {
  const rows = old.length;
  const columns = neu.length;
  const comparisons: Array<Comparison | undefined> = old.flatMap((oldLine) =>
    neu.map((newLine) => {
      const comparison = compare(oldLine, newLine);
      const qualifies =
        comparison.kept * 3 >= nonSpace(oldLine) &&
        comparison.kept * 3 >= nonSpace(newLine) &&
        comparison.kept > 0;
      return qualifies ? comparison : undefined;
    }),
  );

  const best = Array.from({ length: rows + 1 }, () => Array.from({ length: columns + 1 }, () => 0));
  for (let i = 1; i <= rows; i += 1) {
    for (let j = 1; j <= columns; j += 1) {
      const comparison = comparisons[(i - 1) * columns + j - 1];
      const paired = comparison ? best[i - 1]![j - 1]! + comparison.kept : 0;
      best[i]![j] = Math.max(paired, best[i - 1]![j]!, best[i]![j - 1]!);
    }
  }

  const pairs: Array<[number, number, Comparison]> = [];
  let i = rows;
  let j = columns;
  while (i > 0 && j > 0) {
    const comparison = comparisons[(i - 1) * columns + j - 1];
    if (comparison && best[i]![j] === best[i - 1]![j - 1]! + comparison.kept) {
      pairs.push([i - 1, j - 1, comparison]);
      i -= 1;
      j -= 1;
    } else if (best[i]![j] === best[i - 1]![j]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  return pairs.toReversed();
}

function nonSpace(tokens: readonly Token[]): number {
  return tokens.filter((token) => token.class !== "space").length;
}

// The classic LCS table walk of `similar::algorithms::lcs`: trim the common
// prefix and suffix, then walk the suffix table forward, deleting when that
// keeps at least as long a common subsequence as inserting.
function compare(old: readonly Token[], neu: readonly Token[]): Comparison {
  const oldChanged = Array.from({ length: old.length }, () => false);
  const newChanged = Array.from({ length: neu.length }, () => false);
  const [prefix, suffix] = commonEnds(old, neu);
  const middle = {
    old: old.slice(prefix, old.length - suffix),
    neu: neu.slice(prefix, neu.length - suffix),
  };
  const table = lcsTable(middle.old, middle.neu);
  const width = middle.old.length + 1;

  let o = 0;
  let n = 0;
  while (n < middle.neu.length && o < middle.old.length) {
    if (middle.neu[n]!.text === middle.old[o]!.text) {
      o += 1;
      n += 1;
    } else if (table[n * width + o + 1]! >= table[(n + 1) * width + o]!) {
      oldChanged[prefix + o] = true;
      o += 1;
    } else {
      newChanged[prefix + n] = true;
      n += 1;
    }
  }
  oldChanged.fill(true, prefix + o, prefix + middle.old.length);
  newChanged.fill(true, prefix + n, prefix + middle.neu.length);

  const kept = old.filter((token, index) => !oldChanged[index] && token.class !== "space").length;
  return { oldChanged, newChanged, kept };
}

/** How many tokens the two lines share at the start, then at the end. */
function commonEnds(old: readonly Token[], neu: readonly Token[]): [number, number] {
  const shortest = Math.min(old.length, neu.length);
  let prefix = 0;
  while (prefix < shortest && old[prefix]!.text === neu[prefix]!.text) prefix += 1;
  let suffix = 0;
  while (
    suffix < shortest - prefix &&
    old[old.length - 1 - suffix]!.text === neu[neu.length - 1 - suffix]!.text
  ) {
    suffix += 1;
  }
  return [prefix, suffix];
}

/**
 * `table[n * (old.length + 1) + o]` is the longest common subsequence of
 * `neu[n..]` and `old[o..]`.
 */
function lcsTable(old: readonly Token[], neu: readonly Token[]): Uint32Array {
  const width = old.length + 1;
  const table = new Uint32Array((neu.length + 1) * width);
  for (let n = neu.length - 1; n >= 0; n -= 1) {
    for (let o = old.length - 1; o >= 0; o -= 1) {
      table[n * width + o] =
        neu[n]!.text === old[o]!.text
          ? table[(n + 1) * width + o + 1]! + 1
          : Math.max(table[(n + 1) * width + o]!, table[n * width + o + 1]!);
    }
  }
  return table;
}

const WORD = /^[\p{Alphabetic}\p{N}_]$/u;
const SPACE = /^\p{White_Space}$/u;

/** Word runs, whitespace runs, and every other character on its own. */
function tokenize(sourceBytes: Uint8Array, line: DiffLine, decoder: TextDecoder): Token[] {
  const text = decoder.decode(sourceBytes.subarray(line.startByte, line.endByte));
  const tokens: Token[] = [];
  let offset = line.startByte;
  for (const char of text) {
    const length = utf8Length(char);
    const tokenClass = classOf(char);
    const last = tokens.at(-1);
    if (last && tokenClass !== "other" && last.class === tokenClass) {
      last.endByte = offset + length;
      last.text += char;
    } else {
      tokens.push({ startByte: offset, endByte: offset + length, text: char, class: tokenClass });
    }
    offset += length;
  }
  return tokens;
}

function utf8Length(char: string): number {
  const codePoint = char.codePointAt(0)!;
  if (codePoint < 0x80) return 1;
  if (codePoint < 0x800) return 2;
  return codePoint < 0x10000 ? 3 : 4;
}

function classOf(char: string): TokenClass {
  if (WORD.test(char)) return "word";
  return SPACE.test(char) ? "space" : "other";
}

/** Emit the changed ranges of one line. */
function markLine(
  tokens: readonly Token[],
  changed: readonly boolean[],
  kind: DiffWordKind,
  out: DiffWordRange[],
): void {
  const segments: Array<[number, number]> = [];
  for (let index = 0; index < changed.length; index += 1) {
    if (!changed[index]) continue;
    const last = segments.at(-1);
    // A single unchanged space between two changes reads as part of one edit,
    // and splitting there leaves a gap in the emphasis.
    if (
      last &&
      (last[1] + 1 === index || (last[1] + 2 === index && tokens[last[1] + 1]!.class === "space"))
    ) {
      last[1] = index;
    } else {
      segments.push([index, index]);
    }
  }

  for (const [first, last] of segments) {
    out.push({ startByte: tokens[first]!.startByte, endByte: tokens[last]!.endByte, kind });
  }
}
