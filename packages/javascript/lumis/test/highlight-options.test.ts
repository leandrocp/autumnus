/**
 * JavaScript's half of the cross-runtime highlight option check.
 *
 * `fixtures/highlight-options.json` lists the per-call options every runtime
 * must accept. The literal below is `Required<HighlightOptions>`, so an option
 * the types lack, or one they have and the literal omits, fails type checking;
 * the test then requires the manifest to name exactly these keys.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { HighlightOptions } from "../src/types.js";

interface Manifest {
  options: { name: string }[];
  runtime_only: Record<string, unknown>;
  waived: Record<string, unknown>;
}

const manifest: Manifest = JSON.parse(
  readFileSync(new URL("../../../../fixtures/highlight-options.json", import.meta.url), "utf8"),
);

const options: Required<HighlightOptions> = {
  annotations: [],
  rainbowBrackets: true,
  budget: { matchLimit: 1, timeLimit: 0 },
  onUnresolved: () => {},
};

function toCamel(name: string): string {
  return name.replaceAll(/_([a-z])/gu, (_, letter: string) => letter.toUpperCase());
}

function namesFor(section: Record<string, unknown>): string[] {
  const names = section.javascript;
  return typeof names === "object" && names !== null ? Object.keys(names) : [];
}

describe("highlight option manifest", () => {
  it("names exactly the options HighlightOptions accepts", () => {
    const expected = [
      ...manifest.options.map((option) => toCamel(option.name)),
      ...namesFor(manifest.runtime_only),
    ].sort();

    expect(Object.keys(options).sort()).toEqual(expected);
  });

  it("has no waiver left standing", () => {
    expect(Object.keys(manifest.waived).filter((key) => !key.startsWith("$"))).toEqual([]);
  });
});
