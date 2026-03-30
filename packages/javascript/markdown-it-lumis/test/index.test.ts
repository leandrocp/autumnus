import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";
import dracula from "../../themes/dist/json/dracula.json";
import githubLight from "../../themes/dist/json/github_light.json";
import javascript from "../../lumis/langs/javascript.ts";
import json from "../../lumis/langs/json.ts";
import markdownItLumis, { fromHighlighter } from "../src/index.js";
import { createHighlighter } from "@lumis-sh/lumis";
import { htmlInline, htmlLinked, htmlMultiThemes, terminal } from "@lumis-sh/lumis/formatters";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/web";

const JS_SOURCE = "```javascript\nconst x = 1\n```";
const JSON_SOURCE = '```json\n{"a": 1}\n```';

describe("markdown-it-lumis", () => {
  describe("htmlInline formatter", () => {
    it("produces pre with lumis class, inline styles, and colored spans", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(JS_SOURCE);

      expect(html).toMatch(/<pre class="lumis" style="color: #[0-9a-f]+; background-color: #[0-9a-f]+;">/);
      expect(html).toMatch(/<code class="language-javascript"/);
      expect(html).toMatch(/<span style="color: #[0-9a-f]+;">const<\/span>/);
      expect(html).toMatch(/<span style="color: #[0-9a-f]+;">1<\/span>/);
      expect(html).toContain('translate="no"');
      expect(html).toContain('tabindex="0"');
      expect(html).toContain('<div class="line" data-line="1">');
      expect(html).toContain("</code></pre>");
    });

    it("applies preClass", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula, preClass: "my-pre" }),
        languages: [javascript],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(JS_SOURCE);

      expect(html).toMatch(/<pre class="lumis my-pre"/);
    });
  });

  describe("htmlLinked formatter", () => {
    it("produces class-based spans without inline styles", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlLinked({ language }),
        languages: [json],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(JSON_SOURCE);

      expect(html).toMatch(/<pre class="lumis"><code class="language-json"/);
      expect(html).toMatch(/<span class="[a-z-]+">/);
      expect(html).not.toMatch(/style="/);
      expect(html).toContain("</code></pre>");
    });
  });

  describe("htmlMultiThemes formatter", () => {
    it("produces inline styles with CSS custom properties", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) =>
          htmlMultiThemes({
            language,
            themes: { light: githubLight, dark: dracula },
            defaultTheme: "light",
          }),
        languages: [javascript],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(JS_SOURCE);

      expect(html).toMatch(/<pre class="lumis lumis-themes/);
      expect(html).toMatch(/--lumis-dark/);
      expect(html).toMatch(/<code class="language-javascript"/);
      expect(html).toContain("</code></pre>");
    });
  });

  describe("terminal formatter", () => {
    it("produces ANSI escape codes", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => terminal({ language, theme: dracula }),
        languages: [javascript],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(JS_SOURCE);

      // terminal output has ANSI codes, no HTML tags
      expect(html).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
      expect(html).toContain("\u001b[0m");
      expect(html).not.toContain("<pre");
      expect(html).not.toContain("<span");
    });
  });

  describe("language handling", () => {
    it("auto-detects unannotated fences", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render("```\nsome text\n```");

      expect(html).toContain("some text");
    });

    it("strips info string metadata, keeping only the language", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render('```javascript title="example"\nconst x = 1\n```');

      expect(html).toMatch(/<code class="language-javascript"/);
    });

    it("falls back to markdown-it default when language is not available", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(JS_SOURCE);

      expect(html).toMatch(/<pre><code class="language-javascript">/);
    });

    it("renders different languages in the same document", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript, json],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(`${JS_SOURCE}\n\n${JSON_SOURCE}`);

      expect(html).toMatch(/<code class="language-javascript"/);
      expect(html).toMatch(/<code class="language-json"/);
    });

    it("accepts a bundle and loads languages by name", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [bundledLanguages, "javascript"],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(JS_SOURCE);

      expect(html).toMatch(/<pre class="lumis"/);
      expect(html).toMatch(/<span style="color: #[0-9a-f]+;">/);
    });
  });

  describe("document structure", () => {
    it("renders multiple fenced blocks", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(
        "```javascript\nconst a = 1\n```\n\nSome text\n\n```javascript\nconst b = 2\n```",
      );

      expect((html.match(/<pre class="lumis"/g) ?? []).length).toBe(2);
      expect(html).toContain("<p>Some text</p>");
    });

    it("preserves non-fenced content", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render("# Title\n\nParagraph\n\n```javascript\ncode\n```\n\n- list item");

      expect(html).toContain("<h1>Title</h1>");
      expect(html).toContain("<p>Paragraph</p>");
      expect(html).toContain("<li>list item</li>");
      expect(html).toMatch(/<pre class="lumis"/);
    });

    it("handles empty code blocks", async () => {
      const plugin = await markdownItLumis({
        formatter: (language) => htmlInline({ language, theme: dracula }),
        languages: [javascript],
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render("```javascript\n\n```");

      expect(html).toMatch(/<pre class="lumis"/);
      expect(html).toContain("</code></pre>");
    });
  });

  describe("fromHighlighter", () => {
    it("works with a pre-configured highlighter", async () => {
      const highlighter = await createHighlighter({ languages: [javascript] });
      const plugin = fromHighlighter(highlighter, {
        formatter: (language) => htmlInline({ language, theme: dracula }),
      });
      const md = new MarkdownIt();
      md.use(plugin);

      const html = md.render(JS_SOURCE);

      expect(html).toMatch(/<pre class="lumis"/);
      expect(html).toMatch(/<span style="color: #[0-9a-f]+;">const<\/span>/);
    });
  });
});
