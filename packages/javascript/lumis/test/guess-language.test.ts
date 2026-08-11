import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { guessLanguage } from "../src/index.js";

interface DetectionCase {
  name: string;
  hint: string | null;
  source: string;
  expected: string;
}

const cases: DetectionCase[] = JSON.parse(
  readFileSync(new URL("../../../../fixtures/language-detection.json", import.meta.url), "utf8"),
);

describe("shared language detection", () => {
  for (const detection of cases) {
    it(detection.name, () => {
      expect(guessLanguage(detection.hint ?? undefined, detection.source)).toBe(detection.expected);
    });
  }
});
