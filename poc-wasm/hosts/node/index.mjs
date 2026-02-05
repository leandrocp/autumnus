import { readFile, writeFile } from 'fs/promises';
import { WASI } from 'wasi';
import { argv, env } from 'process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function stringToMemory(memory, alloc, str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const ptr = alloc(bytes.length);
  const view = new Uint8Array(memory.buffer, ptr, bytes.length);
  view.set(bytes);
  return [ptr, bytes.length];
}

function memoryToString(memory, ptr, len) {
  const view = new Uint8Array(memory.buffer, ptr, len);
  const decoder = new TextDecoder();
  return decoder.decode(view);
}

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

function highlightCode(exports, code, lang, themeJson) {
  const { memory, alloc, dealloc, highlight, get_result_ptr, get_result_len } = exports;

  const [codePtr, codeLen] = stringToMemory(memory, alloc, code);
  const [langPtr, langLen] = stringToMemory(memory, alloc, lang);
  const [themePtr, themeLen] = stringToMemory(memory, alloc, themeJson);

  const result = highlight(codePtr, codeLen, langPtr, langLen, themePtr, themeLen);

  let output;
  if (result === 0) {
    const resultPtr = get_result_ptr();
    const resultLen = get_result_len();
    output = { success: true, html: memoryToString(memory, resultPtr, resultLen) };
  } else {
    const resultPtr = get_result_ptr();
    const resultLen = get_result_len();
    output = { success: false, error: memoryToString(memory, resultPtr, resultLen) };
  }

  dealloc(codePtr, codeLen);
  dealloc(langPtr, langLen);
  dealloc(themePtr, themeLen);

  return output;
}

async function main() {
  const themePath = join(__dirname, '../../themes/tokyonight_night.json');
  const themeJson = await readFile(themePath, 'utf-8');

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Hello</title>
</head>
<body>
  <h1 class="title">Hello, World!</h1>
</body>
</html>`;

  const cssCode = `.title {
  color: #333;
  font-size: 24px;
}

@media (max-width: 768px) {
  .title {
    font-size: 18px;
  }
}`;

  console.log('=== Lumis WASM POC - Node.js Host ===\n');

  const htmlModule = await loadModule('html');
  const cssModule = await loadModule('css');
  const bundleModule = await loadModule('bundle-web');

  const results = {
    html: {
      html: highlightCode(htmlModule, htmlCode, 'html', themeJson),
      css: highlightCode(cssModule, cssCode, 'css', themeJson),
    },
    bundle: {
      html: highlightCode(bundleModule, htmlCode, 'html', themeJson),
      css: highlightCode(bundleModule, cssCode, 'css', themeJson),
    }
  };

  const outputHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lumis WASM POC - Node.js</title>
  <style>
    body { font-family: system-ui; background: #1a1b26; color: #c0caf5; padding: 2rem; }
    h1 { color: #7aa2f7; }
    h2 { color: #bb9af7; margin-top: 2rem; }
    h3 { color: #7dcfff; }
    .section { margin: 1rem 0; padding: 1rem; background: #24283b; border-radius: 8px; }
    pre { margin: 0; }
    code { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <h1>Lumis WASM POC - Node.js Host</h1>

  <h2>Individual Modules</h2>

  <h3>lumis-lang-html.wasm</h3>
  <div class="section">
    ${results.html.html.html}
  </div>

  <h3>lumis-lang-css.wasm</h3>
  <div class="section">
    ${results.html.css.html}
  </div>

  <h2>Bundle Module (lumis-lang-bundle-web.wasm)</h2>

  <h3>HTML</h3>
  <div class="section">
    ${results.bundle.html.html}
  </div>

  <h3>CSS</h3>
  <div class="section">
    ${results.bundle.css.html}
  </div>
</body>
</html>`;

  await writeFile(join(__dirname, 'output.html'), outputHtml);
  console.log('Written: output.html');
  console.log('=== Done ===');
}

main().catch(console.error);
