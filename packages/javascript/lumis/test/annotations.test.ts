import { beforeAll, describe, expect, it } from "vitest";

import javascript from "../langs/javascript.ts";
import { createHighlighter, type Annotation } from "../src/index.js";
import type { Formatter } from "../src/formatters.js";
import { renderExample } from "../examples/diff_viewer.ts";
import { configureLocalWasmResolver } from "./wasm.js";

interface Change {
  id: number;
}

describe("annotations", () => {
  beforeAll(() => {
    configureLocalWasmResolver(["javascript"]);
  }, 120_000);

  it("flows typed annotations through the public highlight options", async () => {
    const source = "const total = (price + tax)";
    const changedText = "price + tax";
    const start = new TextEncoder().encode(source.slice(0, source.indexOf(changedText))).length;
    const annotations: Annotation<Change>[] = [
      {
        range: { type: "offset", start, end: start + new TextEncoder().encode(changedText).length },
        properties: { id: 7 },
      },
    ];
    const formatter: Formatter<Change> = {
      language: javascript,
      render(source, events) {
        const bytes = new TextEncoder().encode(source);
        const decoder = new TextDecoder();
        const output: string[] = [];

        for (const event of events) {
          if (event.type === "start") output.push(`<syntax:${event.scope}>`);
          if (event.type === "end") output.push("</syntax>");
          if (event.type === "annotationStart") {
            output.push(`<annotation:${event.annotation.properties.id}>`);
          }
          if (event.type === "annotationEnd") output.push("</annotation>");
          if (event.type === "source") {
            output.push(decoder.decode(bytes.subarray(event.startByte, event.endByte)));
          }
        }

        return output.join("");
      },
    };
    const highlighter = await createHighlighter({ languages: [javascript] });

    const output = highlighter.highlight(source, formatter, {
      annotations,
      rainbowBrackets: true,
    });

    expect(output).toContain("<syntax:");
    expect(output).toContain("<syntax:punctuation.bracket.rainbow.");
    expect(output).toContain("<annotation:7>");
    expect(output).toContain("</annotation>");
    expect(output.replaceAll(/<[^>]+>/g, "")).toBe(source);
  }, 30_000);

  it("rejects annotation offsets that are not UTF-8 boundaries", async () => {
    const source = "const café = 1";
    const annotations: Annotation[] = [
      {
        range: { type: "offset", start: 10, end: 11 },
        properties: {},
      },
    ];
    const formatter: Formatter = {
      language: javascript,
      render(_source, events) {
        return JSON.stringify(events);
      },
    };
    const highlighter = await createHighlighter({ languages: [javascript] });

    expect(() => highlighter.highlight(source, formatter, { annotations })).toThrow(
      "is not a UTF-8 boundary",
    );
  }, 30_000);

  it("resolves position ranges to UTF-8 byte ranges before formatting", async () => {
    const source = "const π = 3\nconst café = 4";
    let resolvedRange: { start: number; end: number } | undefined;
    const annotations: Annotation<Change>[] = [
      {
        range: {
          type: "position",
          start: { line: 1, column: 6 },
          end: { line: 1, column: 11 },
        },
        properties: { id: 8 },
      },
    ];
    const formatter: Formatter<Change> = {
      language: javascript,
      render(source, events) {
        const sourceBytes = new TextEncoder().encode(source);
        const decoder = new TextDecoder();

        return events
          .map((event) => {
            if (event.type === "annotationStart") {
              resolvedRange = event.annotation.range;
            }
            if (event.type === "source") {
              return decoder.decode(sourceBytes.subarray(event.startByte, event.endByte));
            }
            return "";
          })
          .join("");
      },
    };
    const highlighter = await createHighlighter({ languages: [javascript] });

    const output = highlighter.highlight(source, formatter, { annotations });
    const start = new TextEncoder().encode(source.slice(0, source.indexOf("café"))).length;

    expect(output).toBe(source);
    expect(resolvedRange).toEqual({ start, end: start + new TextEncoder().encode("café").length });
  }, 30_000);

  it("rejects position columns that are not UTF-8 boundaries", async () => {
    const source = "π\ncafé";
    const annotations: Annotation[] = [
      {
        range: {
          type: "position",
          start: { line: 1, column: 0 },
          end: { line: 1, column: 4 },
        },
        properties: {},
      },
    ];
    const formatter: Formatter = {
      language: javascript,
      render(_source, events) {
        return JSON.stringify(events);
      },
    };
    const highlighter = await createHighlighter({ languages: [javascript] });

    expect(() => highlighter.highlight(source, formatter, { annotations })).toThrow(
      "is not a UTF-8 boundary",
    );
  }, 30_000);

  it("renders the complete JavaScript diff viewer example", async () => {
    const output = await renderExample();

    expect(output).toContain("calculator.js · before");
    expect(output).toContain("calculator.js · after");
    expect(output).toContain('data-marker="-"');
    expect(output).toContain('data-marker="+"');
    expect(output).toContain('data-marker="~"');
    expect(output).toContain("diff-span-removed");
    expect(output).toContain("diff-span-added");
    expect(output).toContain('data-label="New service fee"');
    expect(output).toContain('class="l-');
  }, 30_000);
});
