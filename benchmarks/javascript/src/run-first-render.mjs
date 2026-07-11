import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fixtures as allFixtures, nsSince, repoDir } from "./common.mjs";

const fixtureSelection = process.env.BENCH_FIXTURE ?? "all";
const fixtures = allFixtures.filter(
  (fixture) => fixtureSelection === "all" || fixture.name === fixtureSelection,
);
const samples = Number.parseInt(process.env.BENCH_SAMPLES ?? "10", 10);
const requestedOutput =
  process.env.BENCH_OUTPUT ?? "target/benchmarks/runs/current/js-first-render.json";
const outputPath = isAbsolute(requestedOutput)
  ? requestedOutput
  : resolve(repoDir, requestedOutput);
const implementations = [
  {
    name: "lumis-js",
    script: fileURLToPath(new URL("./first-render-lumis.mjs", import.meta.url)),
  },
  { name: "shiki", script: fileURLToPath(new URL("./first-render-shiki.mjs", import.meta.url)) },
];

if (!Number.isSafeInteger(samples) || samples < 1) {
  throw new Error(`BENCH_SAMPLES must be a positive integer, got ${process.env.BENCH_SAMPLES}`);
}
if (fixtures.length === 0) throw new Error(`unknown BENCH_FIXTURE: ${fixtureSelection}`);

function parseResult(source, implementation) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${implementation} returned invalid JSON: ${source}`, { cause: error });
  }
}

const results = [];
for (const fixture of fixtures) {
  for (let sample = 0; sample < samples; sample += 1) {
    for (const implementation of implementations) {
      const started = process.hrtime.bigint();
      const child = spawnSync(process.execPath, [implementation.script, fixture.path], {
        cwd: repoDir,
        encoding: "utf8",
        env: { ...process.env, NO_COLOR: "1" },
      });
      const externalTotalNs = nsSince(started);
      if (child.status !== 0) {
        throw new Error(
          `${implementation.name} failed with status ${child.status}\n${child.stdout}${child.stderr}`,
        );
      }
      results.push({
        ...parseResult(child.stdout.trim(), implementation.name),
        fixtureName: fixture.name,
        sample,
        externalTotalNs,
      });
    }
  }
}

const report = {
  schemaVersion: 1,
  runner: "node-child-process",
  node: process.version,
  samples,
  results,
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(outputPath);
