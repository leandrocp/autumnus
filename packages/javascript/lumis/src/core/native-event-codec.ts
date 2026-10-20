import { HIGHLIGHT_NAMES } from "../highlights.js";
import type { LumisHighlightEvent } from "../types.js";

const SOURCE_EVENT = 0;
const START_EVENT = 1;
const END_EVENT = 2;
const RAINBOW_START_EVENT = 3;
const DECORATION_END_EVENT = 4;
const DIFF_WORD_START_EVENT = 5;
const DIFF_WORD_KINDS = ["removed", "added"] as const;
const SOURCE_EVENT_BYTES = 8;
const START_EVENT_HEADER_BYTES = 4;
const decoder = new TextDecoder("utf-8", { fatal: true });

function requireBytes(offset: number, count: number, length: number): void {
  if (offset + count > length) {
    throw new Error("Invalid native Lumis event buffer");
  }
}

/**
 * Decode the compact event stream returned by the native addon.
 *
 * Every event starts with a one-byte tag:
 * - source (0): start byte as u32 LE, end byte as u32 LE
 * - start  (1): scope index as u16 LE, language byte length as u16 LE, UTF-8 language
 * - end    (2): no payload
 * - rainbow-bracket start (3): zero-based depth as u32 LE
 * - decoration end       (4): no payload
 * - diff-word start      (5): side as u8, 0 removed and 1 added
 */
// A decoration start's payload, appended to `events`. Returns the offset past it.
function decodeDecorationStart(
  tag: number,
  view: DataView,
  offset: number,
  events: LumisHighlightEvent[],
): number {
  if (tag === RAINBOW_START_EVENT) {
    requireBytes(offset, 4, view.byteLength);
    events.push({
      type: "decorationStart",
      decoration: { type: "rainbowBracket", depth: view.getUint32(offset, true) },
    });
    return offset + 4;
  }
  if (tag === DIFF_WORD_START_EVENT) {
    requireBytes(offset, 1, view.byteLength);
    const kind = DIFF_WORD_KINDS[view.getUint8(offset)];
    if (kind === undefined) throw new Error("Invalid native Lumis event buffer");
    events.push({ type: "decorationStart", decoration: { type: "diffWord", kind } });
    return offset + 1;
  }
  throw new Error(`Unknown native Lumis event tag ${tag}`);
}

export function decodeNativeEvents(data: Uint8Array): LumisHighlightEvent[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const events: LumisHighlightEvent[] = [];
  let offset = 0;

  while (offset < data.byteLength) {
    const tag = view.getUint8(offset++);

    switch (tag) {
      case SOURCE_EVENT: {
        requireBytes(offset, SOURCE_EVENT_BYTES, data.byteLength);
        const startByte = view.getUint32(offset, true);
        const endByte = view.getUint32(offset + 4, true);
        offset += SOURCE_EVENT_BYTES;
        events.push({ type: "source", start: startByte, end: endByte });
        break;
      }
      case START_EVENT: {
        requireBytes(offset, START_EVENT_HEADER_BYTES, data.byteLength);
        const scopeIndex = view.getUint16(offset, true);
        const languageLength = view.getUint16(offset + 2, true);
        offset += START_EVENT_HEADER_BYTES;
        requireBytes(offset, languageLength, data.byteLength);

        const scope = HIGHLIGHT_NAMES[scopeIndex];
        if (scope === undefined) {
          throw new Error(`Unknown native Lumis highlight index ${scopeIndex}`);
        }

        const language = decoder.decode(data.subarray(offset, offset + languageLength));
        offset += languageLength;
        events.push({ type: "start", scope, language });
        break;
      }
      case END_EVENT:
        events.push({ type: "end" });
        break;
      case DECORATION_END_EVENT:
        events.push({ type: "decorationEnd" });
        break;
      default:
        offset = decodeDecorationStart(tag, view, offset, events);
    }
  }

  return events;
}
