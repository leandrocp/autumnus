import type { Node, Point, QueryCapture, QueryMatch, Range } from "web-tree-sitter";
import type { LoadedLanguage, QueryCaptureOffset } from "./types.js";

interface RuntimeLookup {
  getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined;
}

interface HighlightCapture {
  startByte: number;
  endByte: number;
  scope: string;
  language: string;
  depth: number;
}

interface SourceMaps {
  utf8Offsets: number[];
  lineStarts: number[];
  sourceBytes: Uint8Array;
  sourceUtf8ByteLength: number;
}

interface LocalDef {
  name: string;
  valueEndByte: number;
  highlight?: string;
}

interface LocalScope {
  inherits: boolean;
  endByte: number;
  localDefs: LocalDef[];
}

export interface HighlightStartEvent {
  type: "start";
  scope: string;
  language: string;
}

export interface HighlightSourceEvent {
  type: "source";
  startByte: number;
  endByte: number;
}

export interface HighlightEndEvent {
  type: "end";
}

export type HighlightEvent = HighlightStartEvent | HighlightSourceEvent | HighlightEndEvent;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function utf8ByteLength(codePoint: number): number {
  if (codePoint <= 0x7f) return 1;
  if (codePoint <= 0x7ff) return 2;
  if (codePoint <= 0xffff) return 3;
  return 4;
}

function buildUtf8OffsetMap(source: string): number[] {
  const offsets = Array.from<number>({ length: source.length + 1 });
  offsets[0] = 0;
  let codeUnitOffset = 0;
  let byteOffset = 0;

  for (const char of source) {
    offsets[codeUnitOffset] = byteOffset;

    const codePoint = char.codePointAt(0)!;
    const charCodeUnits = char.length;
    const charBytes = utf8ByteLength(codePoint);

    for (let i = 1; i < charCodeUnits; i += 1) {
      offsets[codeUnitOffset + i] = byteOffset;
    }

    codeUnitOffset += charCodeUnits;
    byteOffset += charBytes;
    offsets[codeUnitOffset] = byteOffset;
  }

  return offsets;
}

function buildLineStartMap(source: string): number[] {
  const starts = [0];

  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === "\n") {
      starts.push(i + 1);
    }
  }

  return starts;
}

function buildSourceMaps(source: string): SourceMaps {
  const utf8Offsets = buildUtf8OffsetMap(source);
  return {
    utf8Offsets,
    lineStarts: buildLineStartMap(source),
    sourceBytes: encoder.encode(source),
    sourceUtf8ByteLength: utf8Offsets[source.length] ?? 0,
  };
}

function nodeStartByte(node: Node, maps: SourceMaps): number {
  return maps.utf8Offsets[node.startIndex] ?? 0;
}

function nodeEndByte(node: Node, maps: SourceMaps): number {
  return maps.utf8Offsets[node.endIndex] ?? 0;
}

function decodeNodeText(node: Node, maps: SourceMaps, decoder: TextDecoder): string {
  return decoder.decode(
    maps.sourceBytes.subarray(nodeStartByte(node, maps), nodeEndByte(node, maps)),
  );
}

function sameNode(a: Node, b: Node): boolean {
  return a.startIndex === b.startIndex && a.endIndex === b.endIndex && a.type === b.type;
}

function compareCaptures(a: HighlightCapture, b: HighlightCapture): number {
  const startDiff = a.startByte - b.startByte;
  if (startDiff !== 0) return startDiff;
  const depthDiff = a.depth - b.depth;
  if (depthDiff !== 0) return depthDiff;
  const endDiff = b.endByte - a.endByte;
  if (endDiff !== 0) return endDiff;
  if (a.scope !== b.scope) {
    return a.scope < b.scope ? -1 : 1;
  }
  if (a.language !== b.language) {
    return a.language < b.language ? -1 : 1;
  }
  return 0;
}

function mergeSortedCaptures(
  left: HighlightCapture[],
  right: HighlightCapture[],
): HighlightCapture[] {
  if (left.length === 0) return right;
  if (right.length === 0) return left;

  const merged: HighlightCapture[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftCapture = left[leftIndex]!;
    const rightCapture = right[rightIndex]!;

    if (compareCaptures(leftCapture, rightCapture) <= 0) {
      merged.push(leftCapture);
      leftIndex += 1;
    } else {
      merged.push(rightCapture);
      rightIndex += 1;
    }
  }

  while (leftIndex < left.length) {
    merged.push(left[leftIndex]!);
    leftIndex += 1;
  }

  while (rightIndex < right.length) {
    merged.push(right[rightIndex]!);
    rightIndex += 1;
  }

  return merged;
}

function filterSpecialPunctuationCaptures(
  captures: HighlightCapture[],
  sourceBytes: Uint8Array,
): HighlightCapture[] {
  const activeStrings: HighlightCapture[] = [];
  const filtered: HighlightCapture[] = [];

  for (const capture of captures) {
    while (
      activeStrings.length > 0 &&
      activeStrings[activeStrings.length - 1]!.endByte <= capture.startByte
    ) {
      activeStrings.pop();
    }

    let keepCapture = true;

    if (
      capture.scope === "punctuation.special" &&
      capture.endByte - capture.startByte === 2 &&
      sourceBytes[capture.startByte] === 0x24 /* $ */ &&
      sourceBytes[capture.startByte + 1] === 0x7b /* { */
    ) {
      let sameLayerString = false;
      let nestedString = false;

      for (let i = activeStrings.length - 1; i >= 0; i -= 1) {
        const active = activeStrings[i]!;
        if (active.endByte < capture.endByte) {
          continue;
        }

        if (active.depth === capture.depth) {
          sameLayerString = true;
        } else if (active.depth > capture.depth) {
          nestedString = true;
        }

        if (sameLayerString && nestedString) {
          break;
        }
      }

      keepCapture = !sameLayerString || nestedString;
    }

    if (keepCapture) {
      filtered.push(capture);
      if (capture.scope === "string") {
        activeStrings.push(capture);
      }
    }
  }

  return filtered;
}

function dedupeCaptures(captures: HighlightCapture[]): HighlightCapture[] {
  const deduped: HighlightCapture[] = [];
  let lastCapture: HighlightCapture | undefined;

  for (const capture of captures) {
    if (
      !lastCapture ||
      capture.startByte !== lastCapture.startByte ||
      capture.endByte !== lastCapture.endByte ||
      capture.depth !== lastCapture.depth
    ) {
      deduped.push(capture);
      lastCapture = capture;
    } else {
      deduped[deduped.length - 1] = capture;
      lastCapture = capture;
    }
  }

  return deduped;
}

function normalizeCaptures(
  captures: HighlightCapture[],
  sourceBytes: Uint8Array,
): HighlightCapture[] {
  return dedupeCaptures(filterSpecialPunctuationCaptures(captures, sourceBytes));
}

function resolveLayerCaptures(
  queryCaptures: QueryCapture[],
  maps: SourceMaps,
  language: LoadedLanguage,
  depth: number,
): HighlightCapture[] {
  const captures: HighlightCapture[] = [];
  const scopeStack: LocalScope[] = [
    {
      inherits: false,
      endByte: maps.sourceUtf8ByteLength,
      localDefs: [],
    },
  ];

  for (let index = 0; index < queryCaptures.length; ) {
    const first = queryCaptures[index]!;
    const startByte = nodeStartByte(first.node, maps);
    const endByte = nodeEndByte(first.node, maps);

    while (scopeStack.length > 1 && startByte > scopeStack[scopeStack.length - 1]!.endByte) {
      scopeStack.pop();
    }

    let selectedScope: string | undefined;
    let referenceHighlight: string | undefined;
    let definitionTarget: LocalDef | undefined;
    let definitionName: string | undefined;
    let definitionValueEndByte = 0;

    let nextIndex = index;
    while (
      nextIndex < queryCaptures.length &&
      sameNode(first.node, queryCaptures[nextIndex]!.node)
    ) {
      const capture = queryCaptures[nextIndex]!;
      const config = language.config;
      const metadata = config.captureMetadata[capture.name];

      if (capture.patternIndex < config.injectionPatternEnd) {
        nextIndex += 1;
        continue;
      }

      if (capture.patternIndex < config.localsPatternEnd) {
        if (metadata?.isLocalScope) {
          const inheritsValue = capture.setProperties?.["local.scope-inherits"];
          scopeStack.push({
            inherits: inheritsValue == null || inheritsValue === "true",
            endByte,
            localDefs: [],
          });
        } else if (metadata?.isLocalDefinitionValue) {
          definitionValueEndByte = nodeEndByte(capture.node, maps);
        } else if (metadata?.isLocalDefinition) {
          definitionName = decodeNodeText(capture.node, maps, decoder);
        } else if (metadata?.isLocalReference && !definitionTarget) {
          const name = decodeNodeText(capture.node, maps, decoder);
          for (let scopeIndex = scopeStack.length - 1; scopeIndex >= 0; scopeIndex -= 1) {
            const scope = scopeStack[scopeIndex]!;
            let highlight: string | undefined;
            for (let defIndex = scope.localDefs.length - 1; defIndex >= 0; defIndex -= 1) {
              const def = scope.localDefs[defIndex]!;
              if (def.name === name && startByte >= def.valueEndByte) {
                highlight = def.highlight;
                break;
              }
            }
            if (highlight) {
              referenceHighlight = highlight;
              break;
            }
            if (!scope.inherits) {
              break;
            }
          }
        }

        nextIndex += 1;
        continue;
      }

      const currentScope = metadata?.highlightScope;
      const isLocalNode = definitionName != null || referenceHighlight != null;

      if (
        currentScope &&
        !(isLocalNode && language.config.nonLocalVariablePatterns[capture.patternIndex])
      ) {
        selectedScope = currentScope;
      }

      nextIndex += 1;
    }

    if (definitionName != null) {
      const scope = scopeStack[scopeStack.length - 1]!;
      definitionTarget = {
        name: definitionName,
        valueEndByte: definitionValueEndByte,
      };
      scope.localDefs.push(definitionTarget);
    }

    const effectiveScope = referenceHighlight ?? selectedScope;
    if (effectiveScope && startByte < endByte) {
      captures.push({
        startByte,
        endByte,
        scope: effectiveScope,
        language: language.definition.id,
        depth,
      });

      if (definitionTarget) {
        definitionTarget.highlight = selectedScope;
      }
    }

    index = nextIndex;
  }

  return captures;
}

function resolveInjection(
  match: QueryMatch,
  language: LoadedLanguage,
  lineStarts: number[],
  parentLanguageName?: string,
): { languageName?: string; ranges: Range[] } {
  let languageName: string | undefined;
  const contentCaptures: QueryCapture[] = [];

  for (const capture of match.captures) {
    const metadata = language.config.captureMetadata[capture.name];
    if (metadata?.isInjectionLanguage && !languageName) {
      languageName = capture.node.text;
    } else if (metadata?.isInjectionContent) {
      contentCaptures.push(capture);
    }
  }

  const setProperties = match.setProperties ?? {};
  if (!languageName) {
    languageName = setProperties["injection.language"] ?? undefined;
  }
  if (!languageName && "injection.self" in setProperties) {
    languageName = language.definition.id;
  }
  if (!languageName && "injection.parent" in setProperties) {
    languageName = parentLanguageName;
  }

  const includeChildren = "injection.include-children" in setProperties;
  const ranges = contentCaptures.flatMap((capture) =>
    getCaptureRanges(
      capture,
      language.config.injectionOffsets[match.patternIndex],
      lineStarts,
      includeChildren,
    ),
  );

  return { languageName, ranges };
}

function collectLayerCaptures(
  source: string,
  maps: SourceMaps,
  runtime: RuntimeLookup,
  language: LoadedLanguage,
  depth: number,
  includedRanges?: Range[],
  parentLanguageName?: string,
): HighlightCapture[] {
  const tree = language.parser.parse(source, null, includedRanges ? { includedRanges } : undefined);
  if (!tree) return [];

  try {
    const rootNode = tree.rootNode;
    const ownCaptures = resolveLayerCaptures(
      language.config.query.captures(rootNode),
      maps,
      language,
      depth,
    );

    if (language.config.injectionPatternEnd === 0) {
      return ownCaptures;
    }

    let injectedCaptures: HighlightCapture[] = [];
    for (const match of language.config.query.matches(rootNode)) {
      if (match.patternIndex >= language.config.injectionPatternEnd) {
        continue;
      }

      const resolved = resolveInjection(match, language, maps.lineStarts, parentLanguageName);
      if (!resolved.languageName || resolved.ranges.length === 0) {
        continue;
      }

      const injectedLanguage = runtime.getLoadedLanguage(resolved.languageName);
      if (!injectedLanguage) {
        continue;
      }

      const childCaptures = collectLayerCaptures(
        source,
        maps,
        runtime,
        injectedLanguage,
        depth + 1,
        resolved.ranges,
        language.definition.id,
      );
      if (childCaptures.length > 0) {
        injectedCaptures = mergeSortedCaptures(injectedCaptures, childCaptures);
      }
    }

    return mergeSortedCaptures(ownCaptures, injectedCaptures);
  } finally {
    tree.delete();
  }
}

function getCaptureRanges(
  capture: QueryCapture,
  offsetsByCapture: Record<string, QueryCaptureOffset> | undefined,
  lineStarts: number[],
  includeChildren: boolean,
): Range[] {
  const offset = offsetsByCapture?.[capture.name];
  const baseRange = nodeToRange(capture.node);
  const adjustedRange = offset ? applyOffset(baseRange, offset, lineStarts) : baseRange;

  if (includeChildren || capture.node.childCount === 0) {
    return [adjustedRange];
  }

  return getInjectionRanges(capture.node, false)
    .map((nodeRange) => intersectRange(nodeRange, adjustedRange, lineStarts))
    .filter((range): range is Range => range != null);
}

function applyOffset(
  range: Range,
  offset: { startRow: number; startColumn: number; endRow: number; endColumn: number },
  lineStarts: number[],
): Range {
  const startPosition = {
    row: range.startPosition.row + offset.startRow,
    column: range.startPosition.column + offset.startColumn,
  };
  const endPosition = {
    row: range.endPosition.row + offset.endRow,
    column: range.endPosition.column + offset.endColumn,
  };

  return makeRange(
    pointToIndex(startPosition, lineStarts),
    pointToIndex(endPosition, lineStarts),
    startPosition,
    endPosition,
  );
}

function pointToIndex(point: Point, lineStarts: number[]): number {
  const lineStart = lineStarts[point.row];
  if (lineStart == null) {
    throw new Error(`Invalid point row ${point.row}`);
  }

  return lineStart + point.column;
}

function intersectRange(range: Range, bounds: Range, lineStarts: number[]): Range | undefined {
  const startIndex = Math.max(range.startIndex, bounds.startIndex);
  const endIndex = Math.min(range.endIndex, bounds.endIndex);

  if (startIndex >= endIndex) {
    return undefined;
  }

  return makeRange(
    startIndex,
    endIndex,
    indexToPoint(startIndex, lineStarts),
    indexToPoint(endIndex, lineStarts),
  );
}

function indexToPoint(index: number, lineStarts: number[]): Point {
  let low = 0;
  let high = lineStarts.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const lineStart = lineStarts[mid] ?? 0;
    const nextLineStart = lineStarts[mid + 1] ?? Number.POSITIVE_INFINITY;

    if (index < lineStart) {
      high = mid - 1;
    } else if (index >= nextLineStart) {
      low = mid + 1;
    } else {
      return { row: mid, column: index - lineStart };
    }
  }

  throw new Error(`Invalid source index ${index}`);
}

export function getInjectionRanges(node: Node, includeChildren: boolean): Range[] {
  if (includeChildren || node.childCount === 0) {
    return [nodeToRange(node)];
  }

  const ranges: Range[] = [];
  let startIndex = node.startIndex;
  let startPosition = node.startPosition;

  for (const child of node.children) {
    if (!child) continue;

    if (!child.isNamed) {
      continue;
    }

    if (startIndex < child.startIndex) {
      ranges.push(makeRange(startIndex, child.startIndex, startPosition, child.startPosition));
    }

    startIndex = child.endIndex;
    startPosition = child.endPosition;
  }

  if (startIndex < node.endIndex) {
    ranges.push(makeRange(startIndex, node.endIndex, startPosition, node.endPosition));
  }

  return ranges;
}

function nodeToRange(node: Node): Range {
  return makeRange(node.startIndex, node.endIndex, node.startPosition, node.endPosition);
}

function makeRange(
  startIndex: number,
  endIndex: number,
  startPosition: Point,
  endPosition: Point,
): Range {
  return { startIndex, endIndex, startPosition, endPosition };
}

export function buildHighlightEvents(
  source: string,
  language: LoadedLanguage,
  runtime: RuntimeLookup,
): HighlightEvent[] {
  const maps = buildSourceMaps(source);
  const captures = normalizeCaptures(
    collectLayerCaptures(source, maps, runtime, language, 0),
    maps.sourceBytes,
  );
  return buildNestedEvents(captures, maps.sourceUtf8ByteLength);
}

/**
 * Build nested highlight events from sorted captures.
 *
 * Mirrors Rust tree-sitter-highlight behavior: when a parent capture (lower
 * depth) spans a range that contains child captures (higher depth), the parent
 * scope stays open across the children, producing nested events.
 */
function buildNestedEvents(
  inputCaptures: HighlightCapture[],
  sourceUtf8ByteLength: number,
): HighlightEvent[] {
  // Re-sort captures for nesting: at the same start position, wider captures
  // open first (so they wrap narrower ones), matching Rust tree-sitter-highlight
  // layer behavior.
  const captures = inputCaptures.slice().sort((a, b) => {
    if (a.startByte !== b.startByte) return a.startByte - b.startByte;
    if (a.endByte !== b.endByte) return b.endByte - a.endByte; // wider first
    return a.depth - b.depth; // same range: lower depth first
  });

  const events: HighlightEvent[] = [];

  interface ActiveScope {
    endByte: number;
    scope: string;
    language: string;
  }

  const scopeStack: ActiveScope[] = [];
  let cursor = 0;
  let captureIndex = 0;

  function emitSource(endByte: number): void {
    if (endByte > cursor) {
      events.push({ type: "source", startByte: cursor, endByte });
      cursor = endByte;
    }
  }

  function closeScopes(upToPos: number): void {
    while (scopeStack.length > 0 && scopeStack[scopeStack.length - 1]!.endByte <= upToPos) {
      emitSource(scopeStack[scopeStack.length - 1]!.endByte);
      scopeStack.pop();
      events.push({ type: "end" });
    }
  }

  while (captureIndex < captures.length) {
    const capture = captures[captureIndex]!;

    // Close any scopes that end before this capture starts
    closeScopes(capture.startByte);

    // Emit source up to this capture's start
    emitSource(capture.startByte);

    // Open this capture's scope
    events.push({
      type: "start",
      scope: capture.scope,
      language: capture.language,
    });
    scopeStack.push({
      endByte: capture.endByte,
      scope: capture.scope,
      language: capture.language,
    });

    captureIndex++;
  }

  // Close all remaining open scopes
  closeScopes(sourceUtf8ByteLength);

  // Emit any trailing source
  emitSource(sourceUtf8ByteLength);

  return events;
}
