import type { Node, Point, QueryCapture, QueryMatch, Range } from "web-tree-sitter";
import type { LoadedLanguage } from "./types.js";

interface RuntimeLookup {
  getLoadedLanguage(nameOrAlias: string): LoadedLanguage | undefined;
}

interface HighlightCapture {
  startByte: number;
  endByte: number;
  scope: string;
  language: string;
}

interface HighlightLayer {
  depth: number;
  language: LoadedLanguage;
  captures: LayerQueryCapture[];
  localDefinitionValueEnds: Uint32Array;
}

interface LayerQueryCapture {
  matchIndex: number;
  patternIndex: number;
  name: string;
  nodeId: number;
  startByte: number;
  endByte: number;
  setProperties?: Record<string, string | null>;
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

interface MatchQueue {
  indexes: number[];
  cursor: number;
}

type CaptureMatchQueues = Map<number, Map<number, Map<string, MatchQueue>>>;

// Query.captures() preserves Tree-sitter's stream order but omits match identity.
// Query.matches() preserves match identity but not that order. Join both views so
// whole matches can be discarded exactly when the native highlighter discards them.
function snapshotCapturesWithMatches(
  captures: QueryCapture[],
  matches: QueryMatch[],
  maps: SourceMaps,
  firstHighlightPattern: number,
): LayerQueryCapture[] {
  const queues: CaptureMatchQueues = new Map();

  for (const [matchIndex, match] of matches.entries()) {
    if (match.patternIndex < firstHighlightPattern) continue;

    for (const capture of match.captures) {
      let nodes = queues.get(capture.patternIndex);
      if (!nodes) {
        nodes = new Map();
        queues.set(capture.patternIndex, nodes);
      }

      let names = nodes.get(capture.node.id);
      if (!names) {
        names = new Map();
        nodes.set(capture.node.id, names);
      }

      const queue = names.get(capture.name);
      if (queue) {
        queue.indexes.push(matchIndex);
      } else {
        names.set(capture.name, { indexes: [matchIndex], cursor: 0 });
      }
    }
  }

  const result: LayerQueryCapture[] = [];
  for (const capture of captures) {
    if (capture.patternIndex < firstHighlightPattern) continue;

    const queue = queues.get(capture.patternIndex)?.get(capture.node.id)?.get(capture.name);
    const matchIndex = queue?.indexes[queue.cursor];
    if (queue == null || matchIndex == null) {
      throw new Error("tree-sitter returned inconsistent query captures and matches");
    }
    queue.cursor += 1;
    result.push({
      matchIndex,
      patternIndex: capture.patternIndex,
      name: capture.name,
      nodeId: capture.node.id,
      startByte: nodeStartByte(capture.node, maps),
      endByte: nodeEndByte(capture.node, maps),
      setProperties: capture.setProperties,
    });
  }
  return result;
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
    getCaptureRanges(capture, lineStarts, includeChildren),
  );

  return { languageName, ranges };
}

function collectHighlightLayers(
  source: string,
  maps: SourceMaps,
  runtime: RuntimeLookup,
  language: LoadedLanguage,
  depth: number,
  includedRanges?: Range[],
  parentLanguageName?: string,
): HighlightLayer[] {
  const tree = language.parser.parse(source, null, includedRanges ? { includedRanges } : undefined);
  if (!tree) return [];

  try {
    const rootNode = tree.rootNode;
    const queryMatches = language.config.query.matches(rootNode);
    const queryCaptures = language.config.query.captures(rootNode);
    const localDefinitionValueEnds = new Uint32Array(queryMatches.length);

    for (const [matchIndex, match] of queryMatches.entries()) {
      const value = match.captures.find(
        (capture) => language.config.captureMetadata[capture.name]?.isLocalDefinitionValue,
      );
      if (value) {
        localDefinitionValueEnds[matchIndex] = nodeEndByte(value.node, maps);
      }
    }

    const layers: HighlightLayer[] = [
      {
        depth,
        language,
        captures: snapshotCapturesWithMatches(
          queryCaptures,
          queryMatches,
          maps,
          language.config.injectionPatternEnd,
        ),
        localDefinitionValueEnds,
      },
    ];

    if (language.config.injectionPatternEnd === 0) {
      return layers;
    }

    for (const match of queryMatches) {
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

      const childLayers = collectHighlightLayers(
        source,
        maps,
        runtime,
        injectedLanguage,
        depth + 1,
        resolved.ranges,
        language.definition.id,
      );
      layers.push(...childLayers);
    }

    return layers;
  } finally {
    tree.delete();
  }
}

function getCaptureRanges(
  capture: QueryCapture,
  lineStarts: number[],
  includeChildren: boolean,
): Range[] {
  const range = nodeToRange(capture.node);

  if (includeChildren || capture.node.childCount === 0) {
    return [range];
  }

  return getInjectionRanges(capture.node, false)
    .map((nodeRange) => intersectRange(nodeRange, range, lineStarts))
    .filter((range): range is Range => range != null);
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
  options: { rainbowBrackets?: boolean } = {},
): HighlightEvent[] {
  const maps = buildSourceMaps(source);
  const layers = collectHighlightLayers(source, maps, runtime, language, 0);
  const events = buildNestedEvents(layers, maps);
  return options.rainbowBrackets ? applyRainbowBrackets(source, events, language, maps) : events;
}

const RAINBOW_BRACKET_SCOPES = [
  "punctuation.bracket.rainbow.1",
  "punctuation.bracket.rainbow.2",
  "punctuation.bracket.rainbow.3",
  "punctuation.bracket.rainbow.4",
  "punctuation.bracket.rainbow.5",
  "punctuation.bracket.rainbow.6",
];

interface BracketPair {
  open: { startByte: number; endByte: number };
  close: { startByte: number; endByte: number };
}

function queryRainbowBracketRanges(
  source: string,
  language: LoadedLanguage,
  maps: SourceMaps,
): Array<{ startByte: number; endByte: number; scope: string }> {
  if (!language.brackets) return [];

  const tree = language.parser.parse(source);
  if (!tree) return [];

  try {
    const pairs: BracketPair[] = [];
    for (const match of language.brackets.query.matches(tree.rootNode)) {
      if (language.brackets.rainbowExcludePatterns[match.patternIndex]) {
        continue;
      }

      const opens = [];
      const closes = [];
      for (const capture of match.captures) {
        const metadata = language.brackets.captureMetadata[capture.name];
        if (metadata?.isOpen) {
          opens.push({
            startByte: nodeStartByte(capture.node, maps),
            endByte: nodeEndByte(capture.node, maps),
          });
        } else if (metadata?.isClose) {
          closes.push({
            startByte: nodeStartByte(capture.node, maps),
            endByte: nodeEndByte(capture.node, maps),
          });
        }
      }

      for (let index = 0; index < Math.min(opens.length, closes.length); index += 1) {
        const open = opens[index]!;
        const close = closes[index]!;
        if (
          open.startByte < close.endByte &&
          (open.endByte - open.startByte === 1 || close.endByte - close.startByte === 1)
        ) {
          pairs.push({ open, close });
        }
      }
    }

    return colorizeBracketPairs(pairs);
  } finally {
    tree.delete();
  }
}

function colorizeBracketPairs(
  pairs: BracketPair[],
): Array<{ startByte: number; endByte: number; scope: string }> {
  const opens = pairs
    .map((pair) => pair.open)
    .sort((a, b) => a.startByte - b.startByte || a.endByte - b.endByte)
    .filter((range, index, all) => {
      const previous = all[index - 1];
      return (
        !previous || previous.startByte !== range.startByte || previous.endByte !== range.endByte
      );
    });

  const colorPairs = pairs.slice().sort((a, b) => a.close.endByte - b.close.endByte);
  const openStack: Array<{ startByte: number; endByte: number }> = [];
  const ranges: Array<{ startByte: number; endByte: number; scope: string }> = [];
  let openIndex = 0;

  for (const pair of colorPairs) {
    while (openIndex < opens.length && opens[openIndex]!.startByte < pair.close.startByte) {
      openStack.push(opens[openIndex]!);
      openIndex += 1;
    }

    const lastOpen = openStack[openStack.length - 1];
    if (
      lastOpen &&
      lastOpen.startByte === pair.open.startByte &&
      lastOpen.endByte === pair.open.endByte
    ) {
      const scope = RAINBOW_BRACKET_SCOPES[(openStack.length - 1) % RAINBOW_BRACKET_SCOPES.length]!;
      ranges.push({ startByte: pair.open.startByte, endByte: pair.open.endByte, scope });
      ranges.push({ startByte: pair.close.startByte, endByte: pair.close.endByte, scope });
      openStack.pop();
    }
  }

  return ranges.sort((a, b) => a.startByte - b.startByte || a.endByte - b.endByte);
}

function applyRainbowBrackets(
  source: string,
  events: HighlightEvent[],
  language: LoadedLanguage,
  maps: SourceMaps,
): HighlightEvent[] {
  const ranges = queryRainbowBracketRanges(source, language, maps);
  if (ranges.length === 0) return events;

  const output: HighlightEvent[] = [];
  let rangeIndex = 0;

  for (const event of events) {
    if (event.type !== "source") {
      output.push(event);
      continue;
    }

    let cursor = event.startByte;
    while (rangeIndex < ranges.length && ranges[rangeIndex]!.endByte <= event.startByte) {
      rangeIndex += 1;
    }

    let nextIndex = rangeIndex;
    while (nextIndex < ranges.length) {
      const range = ranges[nextIndex]!;
      if (range.startByte >= event.endByte) break;
      if (range.startByte < event.startByte || range.endByte > event.endByte) {
        nextIndex += 1;
        continue;
      }

      if (cursor < range.startByte) {
        output.push({ type: "source", startByte: cursor, endByte: range.startByte });
      }
      output.push({ type: "start", scope: range.scope, language: language.definition.id });
      output.push({ type: "source", startByte: range.startByte, endByte: range.endByte });
      output.push({ type: "end" });
      cursor = range.endByte;
      nextIndex += 1;
    }

    if (cursor < event.endByte) {
      output.push({ type: "source", startByte: cursor, endByte: event.endByte });
    }
  }

  return output;
}

/** Merge parser layers using tree-sitter-highlight's boundary ordering. */
function buildNestedEvents(inputLayers: HighlightLayer[], maps: SourceMaps): HighlightEvent[] {
  const events: HighlightEvent[] = [];

  interface LayerState extends HighlightLayer {
    captureIndex: number;
    removedMatches: Uint8Array;
    scopeStack: LocalScope[];
    highlightEndStack: number[];
  }

  interface Boundary {
    offset: number;
    isStart: boolean;
  }

  const layers: LayerState[] = inputLayers.map((layer) => ({
    ...layer,
    captureIndex: 0,
    removedMatches: new Uint8Array(layer.localDefinitionValueEnds.length),
    scopeStack: [
      {
        inherits: false,
        endByte: Number.POSITIVE_INFINITY,
        localDefs: [],
      },
    ],
    highlightEndStack: [],
  }));
  let cursor = 0;
  let lastHighlightRange: { startByte: number; endByte: number; depth: number } | undefined;

  function emitSource(endByte: number): void {
    if (endByte > cursor) {
      events.push({ type: "source", startByte: cursor, endByte });
      cursor = endByte;
    }
  }

  function peekCapture(layer: LayerState): LayerQueryCapture | undefined {
    while (layer.captureIndex < layer.captures.length) {
      const capture = layer.captures[layer.captureIndex]!;
      if (layer.removedMatches[capture.matchIndex] !== 0) {
        layer.captureIndex += 1;
        continue;
      }
      return capture;
    }
    return undefined;
  }

  function takeCapture(layer: LayerState): LayerQueryCapture | undefined {
    const capture = peekCapture(layer);
    if (capture) layer.captureIndex += 1;
    return capture;
  }

  function nextBoundary(layer: LayerState): Boundary | undefined {
    const nextStart = peekCapture(layer)?.startByte;
    const nextEnd = layer.highlightEndStack.at(-1);

    if (nextStart != null && nextEnd != null) {
      return nextStart < nextEnd
        ? { offset: nextStart, isStart: true }
        : { offset: nextEnd, isStart: false };
    }
    if (nextStart != null) return { offset: nextStart, isStart: true };
    if (nextEnd != null) return { offset: nextEnd, isStart: false };
    return undefined;
  }

  function precedes(
    candidate: Boundary,
    candidateDepth: number,
    current: Boundary,
    currentDepth: number,
  ): boolean {
    if (candidate.offset !== current.offset) {
      return candidate.offset < current.offset;
    }
    if (candidate.isStart !== current.isStart) {
      return !candidate.isStart;
    }
    return candidateDepth > currentDepth;
  }

  function consumeNextHighlight(
    layer: LayerState,
    lastRange: typeof lastHighlightRange,
  ): HighlightCapture | undefined {
    let capture = takeCapture(layer);
    if (!capture) return undefined;

    while (
      layer.scopeStack.length > 1 &&
      capture.startByte > layer.scopeStack[layer.scopeStack.length - 1]!.endByte
    ) {
      layer.scopeStack.pop();
    }

    let definitionTarget: LocalDef | undefined;
    let referenceHighlight: string | undefined;

    while (capture.patternIndex < layer.language.config.localsPatternEnd) {
      const metadata = layer.language.config.captureMetadata[capture.name];

      if (metadata?.isLocalScope) {
        const inheritsValue = capture.setProperties?.["local.scope-inherits"];
        layer.scopeStack.push({
          inherits: inheritsValue == null || inheritsValue === "true",
          endByte: capture.endByte,
          localDefs: [],
        });
      } else if (metadata?.isLocalDefinition) {
        definitionTarget = {
          name: decoder.decode(maps.sourceBytes.subarray(capture.startByte, capture.endByte)),
          valueEndByte: layer.localDefinitionValueEnds[capture.matchIndex]!,
        };
        layer.scopeStack[layer.scopeStack.length - 1]!.localDefs.push(definitionTarget);
      } else if (metadata?.isLocalReference && !definitionTarget) {
        const name = decoder.decode(maps.sourceBytes.subarray(capture.startByte, capture.endByte));
        let found = false;

        for (let scopeIndex = layer.scopeStack.length - 1; scopeIndex >= 0; scopeIndex -= 1) {
          const scope = layer.scopeStack[scopeIndex]!;
          for (let defIndex = scope.localDefs.length - 1; defIndex >= 0; defIndex -= 1) {
            const definition = scope.localDefs[defIndex]!;
            if (definition.name === name && capture.startByte >= definition.valueEndByte) {
              referenceHighlight = definition.highlight;
              found = true;
              break;
            }
          }
          if (found || !scope.inherits) break;
        }
      }

      const next = peekCapture(layer);
      if (!next || next.nodeId !== capture.nodeId) {
        return undefined;
      }
      capture = takeCapture(layer)!;
    }

    if (
      lastRange &&
      capture.startByte === lastRange.startByte &&
      capture.endByte === lastRange.endByte &&
      layer.depth < lastRange.depth
    ) {
      return undefined;
    }

    while (true) {
      const next = peekCapture(layer);
      if (!next || next.nodeId !== capture.nodeId) break;

      const following = takeCapture(layer)!;
      if (
        (definitionTarget || referenceHighlight) &&
        layer.language.config.nonLocalVariablePatterns[following.patternIndex]
      ) {
        continue;
      }

      layer.removedMatches[capture.matchIndex] = 1;
      capture = following;
    }

    const scope = layer.language.config.captureMetadata[capture.name]?.highlightScope;
    if (definitionTarget) {
      definitionTarget.highlight = scope;
    }

    const effectiveScope = referenceHighlight ?? scope;
    if (!effectiveScope) return undefined;

    return {
      startByte: capture.startByte,
      endByte: capture.endByte,
      scope: effectiveScope,
      language: layer.language.definition.id,
    };
  }

  while (true) {
    let layer: LayerState | undefined;
    let boundary: Boundary | undefined;

    for (const candidate of layers) {
      const candidateBoundary = nextBoundary(candidate);
      if (
        candidateBoundary &&
        (!boundary || !layer || precedes(candidateBoundary, candidate.depth, boundary, layer.depth))
      ) {
        layer = candidate;
        boundary = candidateBoundary;
      }
    }

    if (!layer || !boundary) break;

    if (!boundary.isStart) {
      layer.highlightEndStack.pop();
      emitSource(boundary.offset);
      events.push({ type: "end" });
      continue;
    }

    const capture = consumeNextHighlight(layer, lastHighlightRange);
    if (!capture) continue;

    emitSource(capture.startByte);
    events.push({
      type: "start",
      scope: capture.scope,
      language: capture.language,
    });
    layer.highlightEndStack.push(capture.endByte);
    lastHighlightRange = {
      startByte: capture.startByte,
      endByte: capture.endByte,
      depth: layer.depth,
    };
  }

  emitSource(maps.sourceUtf8ByteLength);

  return events;
}
