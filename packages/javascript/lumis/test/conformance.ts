import { readdirSync, readFileSync } from "node:fs";

export type SerializableHighlightEvent =
  | { type: "start"; scope: string; language: string }
  | { type: "source"; start: number; end: number }
  | { type: "end" };

export interface ConformanceFixture {
  name: string;
  language: string;
  theme: string;
  events: SerializableHighlightEvent[];
  source: string;
  htmlInline: string;
  htmlLinked: string;
  htmlMultiThemes: string;
  terminal: string;
}

interface FixtureMetadata {
  name: string;
  language: string;
  theme: string;
  events: SerializableHighlightEvent[];
}

export function loadConformanceFixtures(): ConformanceFixture[] {
  const baseDir = new URL("../../../../fixtures/conformance/", import.meta.url);

  return readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const fixtureDir = new URL(`${entry.name}/`, baseDir);
      const metadata: FixtureMetadata = JSON.parse(
        readFileSync(new URL("fixture.json", fixtureDir), "utf8"),
      );

      return {
        ...metadata,
        source: readFileSync(new URL("source.txt", fixtureDir), "utf8"),
        htmlInline: readFileSync(new URL("html-inline.html", fixtureDir), "utf8"),
        htmlLinked: readFileSync(new URL("html-linked.html", fixtureDir), "utf8"),
        htmlMultiThemes: readFileSync(new URL("html-multi-themes.html", fixtureDir), "utf8"),
        terminal: readFileSync(new URL("terminal.txt", fixtureDir), "utf8"),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
