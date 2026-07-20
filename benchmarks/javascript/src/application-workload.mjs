import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { repoDir } from "./common.mjs";

export const applicationFixturePath = resolve(repoDir, "benchmarks/fixtures/application.json");
const fixture = JSON.parse(await readFile(applicationFixturePath, "utf8"));

if (fixture.schemaVersion !== 1 || fixture.languages.length !== 2) {
  throw new Error("invalid application benchmark fixture");
}

export const applicationWorkload = fixture.languages.map(({ id, snippets }) => ({
  language: id,
  snippets,
}));

export const applicationSnippetCount = applicationWorkload.reduce(
  (count, entry) => count + entry.snippets.length,
  0,
);

export const applicationExecutionContract = {
  requestedLanguages: applicationWorkload.length,
  renderHighlights: applicationSnippetCount,
  totalHighlights: applicationSnippetCount,
};

export const applicationInputBytes = applicationWorkload.reduce(
  (bytes, entry) =>
    bytes +
    entry.snippets.reduce((languageBytes, source) => languageBytes + Buffer.byteLength(source), 0),
  0,
);
