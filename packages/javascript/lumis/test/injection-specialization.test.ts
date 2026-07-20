import { describe, expect, it } from "vitest";
import javascript from "../langs/javascript.ts";
import { specializeInjections } from "../src/core/injection-specialization.js";

describe("specializeInjections", () => {
  it("keeps available and dynamic patterns while tracking omitted targets", () => {
    const source = `
((comment) @injection.content
  (#set! injection.language "comment"))

(call_expression
  function: (identifier) @injection.language
  arguments: (template_string) @injection.content)

((regex_pattern) @injection.content
  (#set! injection.language "regex"))
`;
    const specialized = specializeInjections(source, (language) => language === "regex");

    expect(specialized.source).toContain("@injection.language");
    expect(specialized.source).toContain('injection.language "regex"');
    expect(specialized.source).not.toContain('injection.language "comment"');
    expect(specialized.omittedLanguages).toEqual(new Set(["comment"]));
  });

  it("substantially reduces JavaScript injections for a JavaScript and JSON highlighter", () => {
    const specialized = specializeInjections(
      javascript.injections ?? "",
      (language) => language === "javascript" || language === "json",
    );

    expect(specialized.source).toContain("@injection.language");
    expect(specialized.source.length).toBeLessThan((javascript.injections?.length ?? 0) / 3);
    expect(specialized.omittedLanguages).toContain("html");
    expect(specialized.omittedLanguages).toContain("regex");
  });
});
