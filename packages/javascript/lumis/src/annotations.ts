import type { SourceIndex } from "./events.js";
import type {
  Annotation,
  AnnotationRange,
  HighlightEvent,
  HighlightRange,
  Position,
  ResolvedAnnotation,
  SyntaxHighlightEvent,
} from "./types.js";

interface Boundary {
  starts: number[];
  ends: number[];
}

interface SyntaxLayer {
  type: "syntax";
  id: number;
  scope: string;
  language: string;
}

interface AnnotationLayer<T> {
  type: "annotation";
  index: number;
  annotation: ResolvedAnnotation<T>;
}

type ActiveLayer<T> = SyntaxLayer | AnnotationLayer<T>;

function isUtf8Boundary(bytes: Uint8Array, offset: number): boolean {
  return (
    offset === 0 ||
    offset === bytes.length ||
    (offset < bytes.length && (bytes[offset]! & 0xc0) !== 0x80)
  );
}

function validateByteOffset(sourceIndex: SourceIndex, index: number, offset: number): void {
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new RangeError(`annotation ${index} byte offset must be a non-negative integer`);
  }
  if (offset > sourceIndex.sourceBytes.length) {
    throw new RangeError(
      `annotation ${index} ends at byte ${offset}, beyond source length ${sourceIndex.sourceBytes.length}`,
    );
  }
  if (!isUtf8Boundary(sourceIndex.sourceBytes, offset)) {
    throw new RangeError(`annotation ${index} offset ${offset} is not a UTF-8 character boundary`);
  }
}

function resolvePosition(sourceIndex: SourceIndex, index: number, position: Position): number {
  if (
    !Number.isSafeInteger(position.line) ||
    position.line < 0 ||
    !Number.isSafeInteger(position.column) ||
    position.column < 0
  ) {
    throw new RangeError(
      `annotation ${index} position must contain non-negative integer line and column values`,
    );
  }

  const lineStartIndex = sourceIndex.lineStarts[position.line];
  if (lineStartIndex === undefined) {
    throw new RangeError(
      `annotation ${index} line ${position.line} is outside the source's ${sourceIndex.lineStarts.length} lines`,
    );
  }
  const lineStart = sourceIndex.utf8Offsets[lineStartIndex] ?? 0;
  const nextLineStartIndex = sourceIndex.lineStarts[position.line + 1];
  const nextLineStart =
    nextLineStartIndex === undefined ? undefined : sourceIndex.utf8Offsets[nextLineStartIndex];
  const lineEnd = nextLineStart === undefined ? sourceIndex.sourceBytes.length : nextLineStart - 1;
  const lineLength = lineEnd - lineStart;

  if (position.column > lineLength) {
    throw new RangeError(
      `annotation ${index} column ${position.column} is beyond line ${position.line} byte length ${lineLength}`,
    );
  }

  const offset = lineStart + position.column;
  validateByteOffset(sourceIndex, index, offset);
  return offset;
}

function resolveRange(
  sourceIndex: SourceIndex,
  index: number,
  range: AnnotationRange,
): HighlightRange {
  let start: number;
  let end: number;

  if (range.type === "offset") {
    start = range.start;
    end = range.end;
    validateByteOffset(sourceIndex, index, start);
    validateByteOffset(sourceIndex, index, end);
  } else if (range.type === "position") {
    start = resolvePosition(sourceIndex, index, range.start);
    end = resolvePosition(sourceIndex, index, range.end);
  } else {
    throw new RangeError(`annotation ${index} has an unknown range type`);
  }

  if (start >= end) {
    throw new RangeError(
      `annotation ${index} range start must be before its end: ${start}..${end}`,
    );
  }

  return { start, end };
}

function resolveAnnotations<T>(
  sourceIndex: SourceIndex,
  annotations: readonly Annotation<T>[],
): ResolvedAnnotation<T>[] {
  return annotations.map((annotation, index) => ({
    range: resolveRange(sourceIndex, index, annotation.range),
    properties: annotation.properties,
  }));
}

function annotationBoundaries<T>(
  annotations: readonly ResolvedAnnotation<T>[],
): Map<number, Boundary> {
  const boundaries = new Map<number, Boundary>();

  annotations.forEach((annotation, index) => {
    const start = boundaries.get(annotation.range.start) ?? { starts: [], ends: [] };
    start.starts.push(index);
    boundaries.set(annotation.range.start, start);

    const end = boundaries.get(annotation.range.end) ?? { starts: [], ends: [] };
    end.ends.push(index);
    boundaries.set(annotation.range.end, end);
  });

  return boundaries;
}

function applyBoundary(boundary: Boundary, active: Set<number>): void {
  for (const index of boundary.ends) active.delete(index);
  for (const index of boundary.starts) active.add(index);
}

function sameLayer<T>(left: ActiveLayer<T>, right: ActiveLayer<T>): boolean {
  if (left.type !== right.type) return false;

  if (left.type === "syntax" && right.type === "syntax") {
    return left.id === right.id && left.scope === right.scope && left.language === right.language;
  }

  return left.type === "annotation" && right.type === "annotation" && left.index === right.index;
}

function desiredLayers<T>(
  activeAnnotations: Set<number>,
  annotations: readonly ResolvedAnnotation<T>[],
  syntaxLayers: readonly SyntaxLayer[],
): ActiveLayer<T>[] {
  const layers: ActiveLayer<T>[] = [...activeAnnotations]
    .sort((left, right) => left - right)
    .map((index) => ({
      type: "annotation",
      index,
      annotation: annotations[index]!,
    }));

  layers.push(...syntaxLayers);
  return layers;
}

function transitionLayers<T>(
  output: HighlightEvent<T>[],
  current: ActiveLayer<T>[],
  desired: ActiveLayer<T>[],
): ActiveLayer<T>[] {
  let common = 0;
  while (
    common < current.length &&
    common < desired.length &&
    sameLayer(current[common]!, desired[common]!)
  ) {
    common += 1;
  }

  for (let index = current.length - 1; index >= common; index -= 1) {
    output.push({
      type: current[index]!.type === "syntax" ? "end" : "annotationEnd",
    });
  }

  for (const layer of desired.slice(common)) {
    if (layer.type === "syntax") {
      output.push({
        type: "start",
        scope: layer.scope,
        language: layer.language,
      });
    } else {
      output.push({
        type: "annotationStart",
        annotation: layer.annotation,
      });
    }
  }

  return desired;
}

/** @internal */
export function composeAnnotations<T>(
  syntaxEvents: readonly SyntaxHighlightEvent[],
  annotations: readonly Annotation<T>[],
  sourceIndex: SourceIndex,
): HighlightEvent<T>[] {
  if (annotations.length === 0) return [...syntaxEvents];

  const resolvedAnnotations = resolveAnnotations(sourceIndex, annotations);

  const boundaries = annotationBoundaries(resolvedAnnotations);
  const boundaryPositions = [...boundaries.keys()].sort((left, right) => left - right);
  const activeAnnotations = new Set<number>();
  const syntaxLayers: SyntaxLayer[] = [];
  const output: HighlightEvent<T>[] = [];
  let activeLayers: ActiveLayer<T>[] = [];
  let boundaryIndex = 0;
  let nextSyntaxId = 0;

  for (const event of syntaxEvents) {
    if (event.type === "start") {
      syntaxLayers.push({
        type: "syntax",
        id: nextSyntaxId,
        scope: event.scope,
        language: event.language,
      });
      nextSyntaxId += 1;
      continue;
    }

    if (event.type === "end") {
      syntaxLayers.pop();
      continue;
    }

    while (
      boundaryIndex < boundaryPositions.length &&
      boundaryPositions[boundaryIndex]! <= event.startByte
    ) {
      applyBoundary(boundaries.get(boundaryPositions[boundaryIndex]!)!, activeAnnotations);
      boundaryIndex += 1;
    }

    let cursor = event.startByte;
    while (cursor < event.endByte) {
      const boundary = boundaryPositions[boundaryIndex];
      const next = boundary !== undefined && boundary < event.endByte ? boundary : event.endByte;

      activeLayers = transitionLayers(
        output,
        activeLayers,
        desiredLayers(activeAnnotations, resolvedAnnotations, syntaxLayers),
      );

      if (cursor < next) {
        output.push({ type: "source", startByte: cursor, endByte: next });
      }
      cursor = next;

      while (
        boundaryIndex < boundaryPositions.length &&
        boundaryPositions[boundaryIndex] === cursor
      ) {
        applyBoundary(boundaries.get(cursor)!, activeAnnotations);
        boundaryIndex += 1;
      }
    }
  }

  transitionLayers(output, activeLayers, []);
  return output;
}
