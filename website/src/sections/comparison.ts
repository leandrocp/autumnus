import { ACTIVE_TAB_CLASSES, INACTIVE_TAB_CLASSES } from "../lib/utils";

const DATA = "/comparison-data";
const BENCHMARKS = "/benchmark-data";

// The gallery renders whole files; the benchmark suite times a scenario. The one
// worth putting next to an output is the common case, a single small file, and
// the Lumis runtime that is the reference implementation for the rest.
const TIMED_SCENARIO = "small-one-language";
const TIMED_LUMIS_RUNTIME = "lumis-rust";

interface ComparisonDocument {
  id: string;
  label: string;
  language: string;
  languageLabel: string;
  source: string;
  lines: number;
  injections: string[];
  tokens?: Record<string, number>;
}

interface Manifest {
  theme: { name: string; source: string };
  lumisRuntimes: string[];
  implementations: Array<{ id: string; label: string; version: string; theme: string }>;
  documents: ComparisonDocument[];
}

export function renderComparison() {
  return `
    <section id="comparison" class="pt-32 pb-24 sm:pt-40 sm:pb-36">
      <div class="mx-auto max-w-6xl px-6">
        <h1 class="inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider">
          <span class="text-orange-400">&lt;</span><span class="text-cyan-400">Comparison</span> <span class="text-orange-400">/&gt;</span>
        </h1>

        <div class="comparison-shell mt-8 border border-zinc-200 dark:border-zinc-800">
          <div class="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <div class="comparison-documents flex flex-wrap gap-2" role="tablist" aria-label="Document"></div>
            <p class="comparison-summary mt-3 font-mono text-[11px] tracking-wider text-zinc-500 dark:text-zinc-400"></p>
          </div>
          <div class="overflow-x-auto border-b border-zinc-200 px-5 dark:border-zinc-800">
            <div class="comparison-implementations flex min-w-max gap-6" role="tablist" aria-label="Implementation"></div>
          </div>
          <p class="comparison-metrics flex flex-wrap gap-x-5 gap-y-1 border-b border-zinc-200 px-5 py-2.5 font-mono text-[11px] tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"></p>
          <div class="comparison-viewport h-[70vh] min-h-[420px] bg-[#171821]">
            <iframe class="comparison-frame block h-full w-full border-0" title="Highlighted output" loading="eager"></iframe>
          </div>
        </div>

        <p class="comparison-missing mt-6 hidden font-mono text-sm text-zinc-500 dark:text-zinc-400"></p>

        <div class="mt-6 border border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <p class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            How this was produced
          </p>
          <p class="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Each library renders the same file at its current release, through its own public API,
            with the closest Dracula it ships. Those Draculas are different files, so some colour
            differences are the theme rather than the parse.
          </p>
          <p class="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            A token is a span the highlighter gave a colour to, counted in the output above.
            Grammars split punctuation and whitespace differently, so read it as how finely the file
            was resolved rather than as a score. The timing beside it is separate work: the median of
            highlighting one small Rust file in the
            <a href="https://github.com/leandrocp/lumis/blob/main/benchmarks/README.md" target="_blank" rel="noreferrer"
               class="text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400">benchmark suite</a>,
            where the Lumis figure is its Rust runtime.
          </p>
          <dl class="comparison-provenance mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]"></dl>
        </div>
      </div>
    </section>`;
}

export async function setupComparison(root: HTMLElement) {
  const documentTabs = root.querySelector<HTMLDivElement>(".comparison-documents")!;
  const implementationTabs = root.querySelector<HTMLDivElement>(".comparison-implementations")!;
  const summary = root.querySelector<HTMLParagraphElement>(".comparison-summary")!;
  const frame = root.querySelector<HTMLIFrameElement>(".comparison-frame")!;
  const shell = root.querySelector<HTMLDivElement>(".comparison-shell")!;
  const missing = root.querySelector<HTMLParagraphElement>(".comparison-missing")!;
  const metrics = root.querySelector<HTMLParagraphElement>(".comparison-metrics")!;

  let manifest: Manifest;
  try {
    const response = await fetch(`${DATA}/manifest.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    manifest = (await response.json()) as Manifest;
  } catch {
    shell.classList.add("hidden");
    missing.classList.remove("hidden");
    missing.textContent =
      "The comparison assets are not published in this build. Run `mise run -C benchmarks showcase-publish` and reload.";
    return;
  }

  const timings = await loadTimings();

  // Switching either tab reloads the frame, so the frame reports where it is and
  // the next page is asked to resume there. Positions are kept per document,
  // because the same offset in a different file is not the same place, while the
  // same offset in a different implementation of one file is.
  const provenance = root.querySelector<HTMLDListElement>(".comparison-provenance")!;
  for (const entry of manifest.implementations) {
    const term = document.createElement("dt");
    term.className = "font-mono text-xs tracking-wider text-zinc-900 uppercase dark:text-white";
    term.textContent = entry.version;
    const detail = document.createElement("dd");
    detail.className = "text-zinc-600 dark:text-zinc-400";
    detail.textContent = entry.theme;
    provenance.append(term, detail);
  }

  const positions = new Map<string, { x: number; y: number }>();
  let currentDocument = manifest.documents[0]!;
  let currentImplementation = manifest.implementations[0]!;

  addEventListener("message", (event: MessageEvent) => {
    const scroll = (event.data as { lumisShowcaseScroll?: { x: number; y: number } } | null)
      ?.lumisShowcaseScroll;
    if (scroll) positions.set(currentDocument.id, scroll);
  });

  function describe() {
    const injections = currentDocument.injections.length
      ? ` + ${currentDocument.injections.join(" + ")}`
      : "";
    summary.replaceChildren(
      `${manifest.theme.name} · ${currentDocument.languageLabel}${injections} · ` +
        `${currentDocument.lines.toLocaleString()} lines · ${currentDocument.label} · `,
    );
    const link = document.createElement("a");
    link.href = currentDocument.source;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.className = "text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400";
    link.textContent = "Original source";
    summary.append(link);
  }

  function show() {
    const at = positions.get(currentDocument.id) ?? { x: 0, y: 0 };
    frame.src = `${DATA}/${currentDocument.id}/${currentImplementation.id}.html#at=${at.x},${at.y}`;
    frame.title = `${currentImplementation.label} highlighting ${currentDocument.label}`;
    describe();
    describeMetrics();
  }

  // Two numbers for whichever output is on screen, rather than a table that
  // competes with it: how finely this file was resolved, and how fast the same
  // library highlights in the benchmark suite.
  function describeMetrics() {
    const tokens = currentDocument.tokens?.[currentImplementation.id];
    const nanoseconds = timings.get(currentImplementation.id);

    metrics.replaceChildren();
    if (tokens === undefined && nanoseconds === undefined) {
      metrics.classList.add("hidden");
      return;
    }
    metrics.classList.remove("hidden");

    if (tokens !== undefined) {
      metrics.append(metric(`${tokens.toLocaleString()} tokens`));
    }
    if (nanoseconds !== undefined) {
      metrics.append(metric(`${formatDuration(nanoseconds)} to highlight`));
    }
  }

  function metric(text: string) {
    const value = document.createElement("span");
    value.className = "tabular-nums text-zinc-900 dark:text-white";
    value.textContent = text;
    return value;
  }

  // A build without the timing report still gets the gallery and the token
  // counts, so a missing or malformed file is silence rather than an error.
  async function loadTimings() {
    try {
      const response = await fetch(`${BENCHMARKS}/results.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return readTimings(await response.json());
    } catch {
      return new Map<string, number>();
    }
  }

  function paint(container: HTMLElement, selected: string) {
    for (const button of Array.from(container.children) as HTMLButtonElement[]) {
      const isSelected = button.dataset.id === selected;
      button.setAttribute("aria-selected", String(isSelected));
      button.classList.remove(...ACTIVE_TAB_CLASSES, ...INACTIVE_TAB_CLASSES);
      button.classList.add(...(isSelected ? ACTIVE_TAB_CLASSES : INACTIVE_TAB_CLASSES));
    }
  }

  for (const entry of manifest.documents) {
    const button = document.createElement("button");
    button.dataset.id = entry.id;
    button.setAttribute("role", "tab");
    button.className =
      "cursor-pointer border border-zinc-300 px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors dark:border-zinc-700";
    button.textContent = entry.label;
    button.addEventListener("click", () => {
      currentDocument = entry;
      paint(documentTabs, entry.id);
      show();
    });
    documentTabs.append(button);
  }

  for (const entry of manifest.implementations) {
    const button = document.createElement("button");
    button.dataset.id = entry.id;
    button.setAttribute("role", "tab");
    button.className =
      "cursor-pointer border-b-2 py-3 font-mono text-xs tracking-wider whitespace-nowrap uppercase transition-colors";
    button.textContent = entry.label;
    button.addEventListener("click", () => {
      currentImplementation = entry;
      paint(implementationTabs, entry.id);
      show();
    });
    implementationTabs.append(button);
  }

  paint(documentTabs, currentDocument.id);
  paint(implementationTabs, currentImplementation.id);
  show();
}

// The report is fetched, so nothing about its shape is known until it has been
// checked. Anything unexpected throws and the caller drops the whole map, which
// is why the map is built here rather than filled in by the caller: half a
// report would put `NaN µs` under one output and nothing under the next.
function readTimings(report: unknown): Map<string, number> {
  if (!isObject(report) || !Array.isArray(report.scenarios)) {
    throw new Error("timing report has no scenarios");
  }
  const scenario = report.scenarios.find((entry) => isObject(entry) && entry.id === TIMED_SCENARIO);
  if (!isObject(scenario) || !Array.isArray(scenario.results)) {
    throw new Error(`timing report has no ${TIMED_SCENARIO} results`);
  }
  const timings = new Map<string, number>();
  for (const result of scenario.results) {
    if (!isObject(result) || typeof result.id !== "string") {
      throw new Error(`${TIMED_SCENARIO} has a result without an id`);
    }
    if (
      typeof result.totalNs !== "number" ||
      !Number.isFinite(result.totalNs) ||
      result.totalNs <= 0
    ) {
      throw new Error(`${result.id} has no positive Total`);
    }
    timings.set(result.id === TIMED_LUMIS_RUNTIME ? "lumis" : result.id, result.totalNs);
  }
  return timings;
}

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}

function formatDuration(ns: number) {
  if (ns >= 1e9) return `${(ns / 1e9).toFixed(2)} s`;
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(2)} ms`;
  return `${(ns / 1e3).toFixed(0)} µs`;
}
