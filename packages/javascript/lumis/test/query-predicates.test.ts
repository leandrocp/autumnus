/**
 * The browser's half of the Tree-sitter predicate parity check.
 *
 * `fixtures/query-predicates.json` records, per case, the match count each
 * engine produces. This asserts the `browser` column and re-derives the
 * supported operator set from the data, so the checked-in list cannot drift
 * from what the engines actually do. `crates/lumis/tests/query_predicates.rs`
 * does the same for the `tree-sitter` crate.
 */
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { Language, Parser, Query } from "web-tree-sitter";

import { ensureLocalWasm } from "./wasm.js";

type Outcome = number | "error";

interface Case {
  name: string;
  operator: string;
  source: string;
  query: string;
  rust: Outcome;
  browser: Outcome;
}

interface Manifest {
  supported: string[];
  cases: Case[];
}

const manifest: Manifest = JSON.parse(
  readFileSync(new URL("../../../../fixtures/query-predicates.json", import.meta.url), "utf8"),
);

let language: Language;
let parser: Parser;

beforeAll(async () => {
  await Parser.init();
  language = await Language.load(readFileSync(ensureLocalWasm("rust")));
  parser = new Parser();
  parser.setLanguage(language);
}, 120_000);

function run(testCase: Case): Outcome {
  const tree = parser.parse(testCase.source);
  if (!tree) throw new Error(`source did not parse: ${testCase.name}`);
  try {
    return new Query(language, testCase.query).matches(tree.rootNode).length;
  } catch {
    return "error";
  } finally {
    tree.delete();
  }
}

describe("tree-sitter predicate parity", () => {
  it("covers every text predicate", () => {
    // A discovery bug that found nothing would otherwise pass silently.
    expect(manifest.cases.length).toBeGreaterThanOrEqual(70);

    const covered = [...new Set(manifest.cases.map((c) => c.operator))].sort();
    expect(covered).toEqual(
      [
        "any-eq?",
        "any-match?",
        "any-not-eq?",
        "any-not-match?",
        "any-of?",
        "eq?",
        "match?",
        "not-any-of?",
        "not-eq?",
        "not-match?",
      ].sort(),
    );
  });

  it("recorded browser results still hold", () => {
    for (const testCase of manifest.cases) {
      expect(
        run(testCase),
        `${testCase.name}: web-tree-sitter changed. Re-record the fixture.`,
      ).toBe(testCase.browser);
    }
  });

  // The supported list is a conclusion, not a decision: an operator is
  // supported when no case makes the two engines disagree.
  it("supported operators match the measurements", () => {
    const diverging = new Set(
      manifest.cases.filter((c) => c.rust !== c.browser).map((c) => c.operator),
    );
    const derived = [...new Set(manifest.cases.map((c) => c.operator))]
      .filter((operator) => !diverging.has(operator))
      .sort();

    expect(derived).toEqual([...manifest.supported].sort());
  });
});
