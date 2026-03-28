export function renderWasm() {
  return `
    <section id="wasm" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <a href="#wasm" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
          <span class="text-orange-400">&lt;</span><span class="text-cyan-400">Parsers</span> <span class="text-orange-400">/&gt;</span>
        </a>
        <div class="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 class="font-mono text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
              Pre-built WASM parsers.<br>No build step.
            </h2>
            <p class="mt-6 font-mono text-sm leading-relaxed text-zinc-500">
              Every Tree-sitter grammar is compiled to WebAssembly and published to npm under the
              <code class="text-zinc-700 dark:text-zinc-300">@lumis-sh</code> scope. Verified builds, no native
              dependencies, no emscripten required.
            </p>
          </div>
          <div class="space-y-6">
            <div class="border border-zinc-200 dark:border-zinc-800">
              <div class="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                <span class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Install a single language</span>
              </div>
              <div class="px-5 py-4">
                <code class="font-mono text-sm text-zinc-700 dark:text-zinc-300"><span class="mr-2 text-zinc-400 select-none">&gt;</span>npm install @lumis-sh/lang-javascript</code>
              </div>
            </div>
            <div class="border border-zinc-200 dark:border-zinc-800">
              <div class="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                <span class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">Or use the full bundle</span>
              </div>
              <div class="px-5 py-4">
                <code class="font-mono text-sm text-zinc-700 dark:text-zinc-300"><span class="mr-2 text-zinc-400 select-none">&gt;</span>npm install @lumis-sh/lumis</code>
              </div>
            </div>
            <dl class="space-y-5">
              <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
                <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">110+ grammars</dt>
                <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">Every language includes highlight queries and injection support, tested for conformance.</dd>
              </div>
              <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
                <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">Works everywhere</dt>
                <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">Browser and Node.js. Ship parsers with your app, no runtime downloads or CDN dependency.</dd>
              </div>
              <div class="border-l-2 border-zinc-200 py-1 pl-5 dark:border-zinc-800">
                <dt class="font-mono text-sm font-medium text-zinc-900 dark:text-white">Verified on npm</dt>
                <dd class="mt-1 font-mono text-xs leading-relaxed text-zinc-500">Published with provenance. Browse all packages at
                  <a href="https://www.npmjs.com/search?q=keywords:lumis-sh" target="_blank" rel="noreferrer" class="text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:decoration-zinc-700 dark:hover:text-white">npm</a>.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>`;
}
