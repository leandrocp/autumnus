import { readFile } from 'fs/promises';
import { WASI } from 'wasi';
import { argv, env } from 'process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { performance } from 'perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WARMUP_RUNS = 3;
const BENCHMARK_RUNS = 10;

async function loadModule(name) {
  const wasmPath = join(__dirname, `../../build/lumis-lang-${name}.wasm`);
  const wasmBuffer = await readFile(wasmPath);

  const wasi = new WASI({
    version: 'preview1',
    args: argv,
    env,
  });

  const module = await WebAssembly.compile(wasmBuffer);
  const instance = await WebAssembly.instantiate(module, {
    wasi_snapshot_preview1: wasi.wasiImport,
  });

  wasi.initialize(instance);

  return instance.exports;
}

async function benchmarkLoad(name) {
  // Warmup
  for (let i = 0; i < WARMUP_RUNS; i++) {
    await loadModule(name);
  }

  // Measured runs
  const times = [];
  for (let i = 0; i < BENCHMARK_RUNS; i++) {
    const start = performance.now();
    await loadModule(name);
    const elapsed = performance.now() - start;
    times.push(elapsed);
  }

  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  return mean;
}

async function main() {
  console.log('=== Lumis WASM Benchmark - Node.js ===');
  console.log();
  console.log(`Warmup: ${WARMUP_RUNS}, Runs: ${BENCHMARK_RUNS}`);
  console.log();

  const languages = [
    'html', 'css', 'javascript', 'typescript', 'json',
    'rust', 'go', 'c',
    'python', 'ruby', 'bash', 'lua'
  ];

  const bundles = [
    'bundle-web',
    'bundle-system',
    'bundle-scripting'
  ];

  console.log('--- Individual Languages ---');
  console.log('| Language   | Mean (ms) |');
  console.log('|------------|-----------|');

  for (const lang of languages) {
    const mean = await benchmarkLoad(lang);
    console.log(`| ${lang.padEnd(10)} | ${mean.toFixed(2).padStart(9)} |`);
  }

  console.log();
  console.log('--- Bundles ---');
  console.log('| Bundle           | Mean (ms) |');
  console.log('|------------------|-----------|');

  for (const bundle of bundles) {
    const mean = await benchmarkLoad(bundle);
    console.log(`| ${bundle.padEnd(16)} | ${mean.toFixed(2).padStart(9)} |`);
  }
}

main().catch(console.error);
