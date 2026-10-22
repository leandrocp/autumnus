import type { DiffWordKind } from "./diff-word-style.js";

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

type Stop = () => boolean;

interface Comparison {
  oldChanged: boolean[];
  newChanged: boolean[];
  /** Non-whitespace tokens both lines share. */
  kept: number;
}

/**
 * The changed ranges of every run in `lines`, in source order, or `undefined`
 * when `stop` asked to give up. Pairing a run compares every removed line with
 * every added one. A run over 1000 bytes a side is left unmarked, and `stop`
 * is consulted throughout the rest.
 *
 * The port of `diff_word_ranges` in `crates/lumis-core/src/diff_words.rs`;
 * `test/diff-words.test.ts` holds both to `fixtures/diff-words.json`. The
 * pairing and comparison break ties the same way, so the two mark the same
 * words.
 */
export function diffWordRanges(
  sourceBytes: Uint8Array,
  lines: readonly DiffLine[],
  stop: Stop = () => false,
): DiffWordRange[] | undefined {
  const ranges: DiffWordRange[] = [];
  let start = 0;
  while (start < lines.length) {
    const end = runEnd(lines, start);
    let split = start;
    while (split < end && lines[split]!.kind === "removed") split += 1;
    const ran = diffRun(sourceBytes, lines.slice(start, split), lines.slice(split, end), stop);
    if (!ran) return undefined;
    for (const range of ran) ranges.push(range);
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

// As in Rust, runs larger than this on either side, in bytes of line content,
// are left unmarked.
const MAX_RUN_SIDE_BYTES = 1000;

function sideBytes(lines: readonly DiffLine[]): number {
  return lines.reduce((total, line) => total + line.endByte - line.startByte, 0);
}

function diffRun(
  sourceBytes: Uint8Array,
  removed: readonly DiffLine[],
  added: readonly DiffLine[],
  stop: Stop,
): DiffWordRange[] | undefined {
  if (stop()) return undefined;
  if (sideBytes(removed) > MAX_RUN_SIDE_BYTES || sideBytes(added) > MAX_RUN_SIDE_BYTES) return [];

  // A leading U+FEFF is source text here, and the byte offsets count it.
  const decoder = new TextDecoder("utf-8", { ignoreBOM: true });
  // As in Rust, a line with no words never pairs, so it stays out of the table.
  const tokenizeWorded = (lines: readonly DiffLine[]): Token[][] =>
    lines.map((line) => tokenize(sourceBytes, line, decoder)).filter((t) => nonSpace(t) > 0);
  const old = tokenizeWorded(removed);
  const neu = tokenizeWorded(added);
  if (old.length === 0 || neu.length === 0) return [];

  const removedRanges: DiffWordRange[] = [];
  const addedRanges: DiffWordRange[] = [];
  const pairs = pairLines(old, neu, stop);
  if (!pairs) return undefined;
  for (const [i, j, comparison] of pairs) {
    markLine(old[i]!, comparison.oldChanged, "removed", removedRanges);
    markLine(neu[j]!, comparison.newChanged, "added", addedRanges);
  }
  return [...removedRanges, ...addedRanges];
}

// Order-preserving pairing that shares the most tokens. Ties prefer pairing,
// then skipping a removed line, as the Rust walk does.
function pairLines(
  old: readonly Token[][],
  neu: readonly Token[][],
  stop: Stop,
): Array<[number, number, Comparison]> | undefined {
  const table = pairingTable(old, neu, stop);
  return table && walkPairs(old, neu, table);
}

interface PairingTable {
  /** Tokens removed line `i` and added line `j` share when they qualify, else 0. */
  kept: number[];
  /** The most tokens the first `i` removed and first `j` added lines can share. */
  best: number[];
}

// As in Rust, built a row at a time so `stop` bounds how large it gets.
function pairingTable(
  old: readonly Token[][],
  neu: readonly Token[][],
  stop: Stop,
): PairingTable | undefined {
  const width = neu.length + 1;
  const newWords = neu.map((line) => nonSpace(line));
  const kept: number[] = [];
  const best: number[] = Array.from({ length: width }, () => 0);
  for (const [i, oldLine] of old.entries()) {
    if (stop()) return undefined;
    const oldWords = nonSpace(oldLine);
    const row = (i + 1) * width;
    best.push(0);
    for (const [j, newLine] of neu.entries()) {
      const shared = sharedTokens(oldLine, oldWords, newLine, newWords[j]!, stop);
      if (shared === undefined) return undefined;
      kept.push(shared);
      const paired = shared > 0 ? best[row - width + j]! + shared : 0;
      best.push(Math.max(paired, best[row - width + j + 1]!, best[row + j]!));
    }
  }
  return { kept, best };
}

// The tokens two lines share when each keeps at least a third of its words,
// else 0.
function sharedTokens(
  oldLine: readonly Token[],
  oldWords: number,
  newLine: readonly Token[],
  newWords: number,
  stop: Stop,
): number | undefined {
  if (stop()) return undefined;
  const shared = compare(oldLine, newLine).kept;
  return shared > 0 && shared * 3 >= oldWords && shared * 3 >= newWords ? shared : 0;
}

function walkPairs(
  old: readonly Token[][],
  neu: readonly Token[][],
  { kept, best }: PairingTable,
): Array<[number, number, Comparison]> {
  const columns = neu.length;
  const at = (i: number, j: number): number => best[i * (columns + 1) + j]!;
  const pairs: Array<[number, number, Comparison]> = [];
  let i = old.length;
  let j = columns;
  while (i > 0 && j > 0) {
    const shared = kept[(i - 1) * columns + j - 1]!;
    if (shared > 0 && at(i, j) === at(i - 1, j - 1) + shared) {
      pairs.unshift([i - 1, j - 1, compare(old[i - 1]!, neu[j - 1]!)]);
      i -= 1;
      j -= 1;
    } else if (at(i, j) === at(i - 1, j)) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  return pairs;
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
