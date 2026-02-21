import { beforeAll, describe, expect, it } from "vitest";

import dracula from "../../themes/dist/json/dracula.json";
import json from "../langs/json.ts";
import {
  createHighlighter,
} from "../src/index.js";
import { type Formatter, htmlInline } from "../src/formatters.js";
import { closeTag, closingTags, openCodeTag, openPreTag, openSpanTag, wrapLine } from "../src/formatter/html.js";
import type { HighlightContext, Theme } from "../src/types.js";
import { configureLocalWasmResolver } from "./wasm.js";

const theme: Theme = dracula;

describe("custom formatter", () => {
  beforeAll(() => {
    configureLocalWasmResolver(["diff", "json"]);
  }, 120_000);

  it("flows through the public formatter contract using hl.highlightIter", async () => {
    const hl = await createHighlighter({ langs: [json] });

    const formatter: Formatter = {
      language: json,
      format(source: string, hl: HighlightContext) {
        const lines = [""];
        let currentLine = 1;

        const append = (text: string): void => {
          const parts = text.split("\n");
          lines[currentLine - 1] ??= "";
          lines[currentLine - 1] += parts[0] ?? "";

          for (let index = 1; index < parts.length; index += 1) {
            lines.push(parts[index] ?? "");
            currentLine += 1;
          }
        };

        hl.highlightIter(source, json, undefined, (text, _language, _range, scope, _style) => {
          if (scope.length === 0) {
            append(text);
          } else {
            append(`${openSpanTag({ class: `tok ${scope.replaceAll(".", "-")}` })}${text}${closeTag("span")}`);
          }
        });

        const body = lines
          .map((line, index) =>
            wrapLine(index + 1, `${openSpanTag({ class: "line-no" })}${index + 1}${closeTag("span")}${openSpanTag({ class: "line-body" })}${line}${closeTag("span")}`, {
              className: index === 0 ? "first-line" : undefined,
            }),
          )
          .join("");

        return `${openPreTag({ preClass: "custom-frame" })}${openCodeTag(json)}${body}${closingTags()}`;
      },
    };

    const output = hl.highlight('{"name":"lumis"}', formatter);

    expect(output).toContain('class="lumis custom-frame"');
    expect(output).toContain('class="language-json"');
    expect(output).toContain('class="line-no"');
    expect(output).toContain('class="line-body"');
    expect(output).toContain('class="line first-line"');
  }, 30_000);

  it("keeps built-in formatters as plain convenience objects", async () => {
    const hl = await createHighlighter({ langs: [json] });
    const output = hl.highlight('{"name":"lumis"}', htmlInline({ language: json, theme }));

    expect(output).toContain('<pre class="lumis"');
    expect(output).toContain('class="language-json"');
  }, 30_000);
});
