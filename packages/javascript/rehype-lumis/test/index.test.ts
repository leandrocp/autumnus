import type { Element, Root } from "hast";
import { describe, expect, it } from "vitest";
import dracula from "../../themes/dist/json/dracula.json";
import githubLight from "../../themes/dist/json/github_light.json";
import javascript from "../../lumis/langs/javascript.ts";
import json from "../../lumis/langs/json.ts";
import { htmlInline, htmlLinked, htmlMultiThemes, terminal } from "@lumis-sh/lumis/formatters";
import rehypeLumis from "../src/index.js";

function codeBlockTree({
  code = "const answer = 42",
  codeClassName,
  preProperties = {},
}: {
  code?: string;
  codeClassName?: string[];
  preProperties?: Record<string, unknown>;
} = {}): Root {
  return {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "pre",
        properties: preProperties,
        children: [
          {
            type: "element",
            tagName: "code",
            properties: codeClassName ? { className: codeClassName } : {},
            children: [{ type: "text", value: code }],
          },
        ],
      },
    ],
  };
}

function findElements(root: Root, tagName: string): Element[] {
  const results: Element[] = [];
  function walk(node: unknown) {
    if (node && typeof node === "object" && "type" in node) {
      const n = node as { type: string; tagName?: string; children?: unknown[] };
      if (n.type === "element" && n.tagName === tagName) {
        results.push(n as unknown as Element);
      }
      if (n.children) {
        for (const child of n.children) {
          walk(child);
        }
      }
    }
  }
  walk(root);
  return results;
}

function assertLumisPreElement(tree: Root) {
  const pres = findElements(tree, "pre");
  expect(pres.length).toBeGreaterThan(0);
  const pre = pres[0]!;
  const classes = (pre.properties as Record<string, unknown>).className as string[];
  expect(classes).toContain("lumis");
  return pre;
}

function assertSpansExist(tree: Root) {
  const spans = findElements(tree, "span");
  expect(spans.length).toBeGreaterThan(0);
  return spans;
}

describe("rehype-lumis", () => {
  describe("htmlInline formatter", () => {
    it("produces pre.lumis with inline styles and colored spans", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree = codeBlockTree({ codeClassName: ["language-javascript"] });

      await transform(tree);

      const pre = assertLumisPreElement(tree);
      const style = (pre.properties as Record<string, unknown>).style as string;
      expect(style).toMatch(/color: #[0-9a-f]+/);
      expect(style).toMatch(/background-color: #[0-9a-f]+/);

      const spans = assertSpansExist(tree);
      const spanWithStyle = spans.find(
        (s) => typeof (s.properties as Record<string, unknown>).style === "string",
      );
      expect(spanWithStyle).toBeDefined();

      const codes = findElements(tree, "code");
      const codeClasses = (codes[0]!.properties as Record<string, unknown>).className as string[];
      expect(codeClasses).toContain("language-javascript");
    });

    it("applies preClass", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula, preClass: "my-pre" }),
        languages: [javascript],
      });
      const tree = codeBlockTree({ codeClassName: ["language-javascript"] });

      await transform(tree);

      const pre = assertLumisPreElement(tree);
      const classes = (pre.properties as Record<string, unknown>).className as string[];
      expect(classes).toContain("my-pre");
    });
  });

  describe("htmlLinked formatter", () => {
    it("produces class-based spans without inline styles", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlLinked({ language }),
        languages: [json],
      });
      const tree = codeBlockTree({
        codeClassName: ["language-json"],
        code: '{"a": 1}',
      });

      await transform(tree);

      assertLumisPreElement(tree);
      const spans = assertSpansExist(tree);

      // All spans should have class, none should have style
      for (const span of spans) {
        const props = span.properties as Record<string, unknown>;
        expect(props.className).toBeDefined();
        expect(props.style).toBeUndefined();
      }
    });
  });

  describe("htmlMultiThemes formatter", () => {
    it("produces inline styles with CSS custom properties", async () => {
      const transform = rehypeLumis({
        formatter: (language) =>
          htmlMultiThemes({
            language,
            themes: { light: githubLight, dark: dracula },
            defaultTheme: "light",
          }),
        languages: [javascript],
      });
      const tree = codeBlockTree({ codeClassName: ["language-javascript"] });

      await transform(tree);

      const pre = assertLumisPreElement(tree);
      const classes = (pre.properties as Record<string, unknown>).className as string[];
      expect(classes).toContain("lumis-themes");

      // Spans should contain CSS custom properties for the non-default theme
      const spans = assertSpansExist(tree);
      const spanStyles = spans
        .map((s) => (s.properties as Record<string, unknown>).style as string)
        .filter(Boolean);
      expect(spanStyles.some((s) => s.includes("--lumis-dark"))).toBe(true);
    });
  });

  describe("terminal formatter", () => {
    it("produces ANSI output, replacing the pre element", async () => {
      const transform = rehypeLumis({
        formatter: (language) => terminal({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree = codeBlockTree({ codeClassName: ["language-javascript"] });

      await transform(tree);

      // terminal output is plain text with ANSI codes, parsed into text nodes
      const text = JSON.stringify(tree);
      expect(text).toMatch(/\\u001b\[38;2;\d+;\d+;\d+m/);
      expect(text).toContain("\\u001b[0m");
      // Should not have lumis class since it's not HTML
      expect(findElements(tree, "span").length).toBe(0);
    });
  });

  describe("language detection", () => {
    it("reads language from code element class", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree = codeBlockTree({ codeClassName: ["language-javascript"] });

      await transform(tree);

      const codes = findElements(tree, "code");
      const codeClasses = (codes[0]!.properties as Record<string, unknown>).className as string[];
      expect(codeClasses).toContain("language-javascript");
    });

    it("reads language from pre element class", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree = codeBlockTree({
        preProperties: { className: ["language-javascript"] },
      });

      await transform(tree);

      assertLumisPreElement(tree);
    });

    it("reads language from pre data-language attribute", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree = codeBlockTree({
        preProperties: { dataLanguage: "javascript" },
      });

      await transform(tree);

      assertLumisPreElement(tree);
    });

    it("reads language from pre language attribute", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree = codeBlockTree({
        preProperties: { language: "javascript" },
      });

      await transform(tree);

      assertLumisPreElement(tree);
    });

    it("prefers code class over pre class", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript, json],
      });
      const tree = codeBlockTree({
        codeClassName: ["language-json"],
        preProperties: { className: ["language-javascript"] },
        code: '{"key": "value"}',
      });

      await transform(tree);

      const codes = findElements(tree, "code");
      const codeClasses = (codes[0]!.properties as Record<string, unknown>).className as string[];
      expect(codeClasses).toContain("language-json");
    });

    it("ignores empty string language attributes", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree = codeBlockTree({
        preProperties: { dataLanguage: "" },
      });

      await transform(tree);

      // No language detected, lumis auto-detects
      assertLumisPreElement(tree);
    });
  });

  describe("error handling", () => {
    it("preserves original node when language is not available", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
      });
      const tree = codeBlockTree({
        codeClassName: ["language-nonexistent_xyz"],
        code: "some code",
      });

      await transform(tree);

      const pre = tree.children[0] as Element;
      expect(pre.tagName).toBe("pre");
      const code = pre.children[0] as Element;
      expect(code.tagName).toBe("code");
    });
  });

  describe("tree structure", () => {
    it("skips pre elements without a code child", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree: Root = {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "pre",
            properties: {},
            children: [{ type: "text", value: "not a code block" }],
          },
        ],
      };

      await transform(tree);

      const pre = tree.children[0] as Element;
      expect(pre.tagName).toBe("pre");
      expect(pre.children[0]).toMatchObject({ type: "text", value: "not a code block" });
    });

    it("skips non-pre elements", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree: Root = {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "div",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "code",
                properties: { className: ["language-javascript"] },
                children: [{ type: "text", value: "not inside pre" }],
              },
            ],
          },
        ],
      };

      await transform(tree);

      const div = tree.children[0] as Element;
      expect(div.tagName).toBe("div");
    });

    it("transforms multiple code blocks", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript, json],
      });
      const tree: Root = {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "pre",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "code",
                properties: { className: ["language-javascript"] },
                children: [{ type: "text", value: "const a = 1" }],
              },
            ],
          },
          {
            type: "element",
            tagName: "pre",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "code",
                properties: { className: ["language-json"] },
                children: [{ type: "text", value: '{"b": 2}' }],
              },
            ],
          },
        ],
      };

      await transform(tree);

      const pres = findElements(tree, "pre");
      expect(pres.length).toBe(2);
      for (const pre of pres) {
        const classes = (pre.properties as Record<string, unknown>).className as string[];
        expect(classes).toContain("lumis");
      }
    });

    it("preserves sibling non-pre elements", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree: Root = {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "h1",
            properties: {},
            children: [{ type: "text", value: "Title" }],
          },
          {
            type: "element",
            tagName: "pre",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "code",
                properties: { className: ["language-javascript"] },
                children: [{ type: "text", value: "const x = 1" }],
              },
            ],
          },
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [{ type: "text", value: "Paragraph" }],
          },
        ],
      };

      await transform(tree);

      expect((tree.children[0] as Element).tagName).toBe("h1");
      assertLumisPreElement(tree);
      const lastElement = tree.children[tree.children.length - 1] as Element;
      expect(lastElement.tagName).toBe("p");
    });

    it("handles mixed success and failure across blocks", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree: Root = {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "pre",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "code",
                properties: { className: ["language-javascript"] },
                children: [{ type: "text", value: "const ok = true" }],
              },
            ],
          },
          {
            type: "element",
            tagName: "pre",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "code",
                properties: { className: ["language-nonexistent_xyz"] },
                children: [{ type: "text", value: "will fail" }],
              },
            ],
          },
        ],
      };

      await transform(tree);

      const pres = findElements(tree, "pre");
      // First: highlighted
      const firstClasses = (pres[0]!.properties as Record<string, unknown>).className as string[];
      expect(firstClasses).toContain("lumis");
      // Second: preserved
      const secondCode = pres[1]!.children[0] as Element;
      expect(secondCode.tagName).toBe("code");
    });

    it("handles empty code content", async () => {
      const transform = rehypeLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const tree = codeBlockTree({
        codeClassName: ["language-javascript"],
        code: "",
      });

      await transform(tree);

      assertLumisPreElement(tree);
    });
  });
});
