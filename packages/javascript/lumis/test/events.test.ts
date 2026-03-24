import { describe, expect, it } from "vitest";
import type { Node } from "web-tree-sitter";

import { getInjectionRanges } from "../src/events.js";

function stubNode(overrides: Partial<Node> = {}): Node {
  return {
    startIndex: 0,
    endIndex: 0,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 0 },
    childCount: 0,
    children: [],
    isNamed: true,
    ...overrides,
  } as Node;
}

describe("getInjectionRanges", () => {
  it("ignores unnamed children when includeChildren is false", () => {
    const unnamed = stubNode({
      startIndex: 0,
      endIndex: 1,
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 1 },
      isNamed: false,
    });

    const named = stubNode({
      startIndex: 2,
      endIndex: 5,
      startPosition: { row: 0, column: 2 },
      endPosition: { row: 0, column: 5 },
    });

    const node = stubNode({
      endIndex: 6,
      endPosition: { row: 0, column: 6 },
      childCount: 2,
      children: [unnamed, named],
    });

    expect(getInjectionRanges(node, false)).toEqual([
      {
        startIndex: 0,
        endIndex: 2,
        startPosition: { row: 0, column: 0 },
        endPosition: { row: 0, column: 2 },
      },
      {
        startIndex: 5,
        endIndex: 6,
        startPosition: { row: 0, column: 5 },
        endPosition: { row: 0, column: 6 },
      },
    ]);
  });
});
