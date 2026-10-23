import { ACTIVE_TAB_CLASSES, INACTIVE_TAB_CLASSES } from "../lib/utils";

const DATA = "/comparison-data";
// Each library highlighting each file it renders, published by
// `mise run -C benchmarks comparison-timings-publish`.
const TIMINGS = "/benchmark-data/comparison.json";

interface ComparisonDocument {
  id: string;
  label: string;
  language: string;
  languageLabel: string;
  source: string;
  lines: number;
  injections: string[];
  unsupported?: string[];
  tokens?: Record<string, number>;
  outputSha256?: Record<string, Record<string, string>>;
}

interface ComparisonTheme {
  id: string;
  name: string;
  appearance: "light" | "dark";
  source: string;
}

interface Measurement {
  totalNs: number;
  sha256: string;
  peakRssBytes: number | undefined;
}

interface Timings {
  theme: string;
  documents: Map<string, Map<string, Measurement>>;
  // How the figures were produced, as the report records it, for the
  // methodology list. Older reports leave out what they did not record.
  methodology: Array<[string, string]>;
}

interface Manifest {
  themes: ComparisonTheme[];
  lumisRuntimes: string[];
  implementations: Array<{ id: string; label: string; version: string; theme: string }>;
  documents: ComparisonDocument[];
}

function paint(container: HTMLElement, selected: string) {
  for (const button of Array.from(container.children) as HTMLButtonElement[]) {
    const isSelected = button.dataset.id === selected;
    button.setAttribute("aria-selected", String(isSelected));
    button.classList.remove(...ACTIVE_TAB_CLASSES, ...INACTIVE_TAB_CLASSES);
    button.classList.add(...(isSelected ? ACTIVE_TAB_CLASSES : INACTIVE_TAB_CLASSES));
  }
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
            <p id="comparison-documents-label" class="mb-3 font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Source files
            </p>
            <div class="comparison-documents flex flex-wrap gap-2" role="tablist" aria-labelledby="comparison-documents-label"></div>
            <p class="comparison-summary mt-3 font-mono text-[11px] tracking-wider text-zinc-500 dark:text-zinc-400"></p>
          </div>
          <div class="border-b border-zinc-200 px-5 dark:border-zinc-800">
            <div class="comparison-implementations flex flex-wrap gap-x-4 sm:gap-x-6" role="tablist" aria-label="Implementation"></div>
          </div>
          <div class="comparison-viewport h-[70vh] min-h-[420px] bg-[#eff1f5] dark:bg-[#303446]">
            <iframe class="comparison-frame block h-full w-full border-0" title="Highlighted output" loading="eager"></iframe>
            <p class="comparison-unsupported hidden h-full items-center justify-center px-6 text-center font-mono text-sm text-[#4c4f69] dark:text-[#c6d0f5]"></p>
          </div>
        </div>

        <p class="comparison-missing mt-6 hidden font-mono text-sm text-zinc-500 dark:text-zinc-400"></p>

        <div class="mt-6 border border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <p class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            How this was produced
          </p>
          <p class="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Each library renders the same file at its current release, through its own public API,
            with the closest Catppuccin port for it. speed-highlight, starry-night, Sugar High and
            TanStack Highlight have none, so their themes take the highlight.js port's colours, class for
            class. Those ports are different files, so some colour differences are the theme rather than
            the parse. speed-highlight has no TSX grammar, so it reads the TSX file as TypeScript. Every
            file is rendered in Latte and Frappé, and the panel above follows your system's light or
            dark setting.
          </p>
          <p class="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            A token is a span the highlighter gave a colour to, counted in the output above.
            Grammars split punctuation and whitespace differently, so read it as how finely the file
            was resolved rather than as a score. The time beside it is that library highlighting that
            file: the median of the call that produced the output above, with the highlighter already
            built and its languages loaded. The Lumis figure is its Rust runtime. Peak RSS is what
            a fresh process highlighting that file once held at most, runtime included.
          </p>
          <dl class="comparison-methodology mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]"></dl>
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
  const unsupported = root.querySelector<HTMLParagraphElement>(".comparison-unsupported")!;
  const shell = root.querySelector<HTMLDivElement>(".comparison-shell")!;
  const missing = root.querySelector<HTMLParagraphElement>(".comparison-missing")!;
  const methodology = root.querySelector<HTMLDListElement>(".comparison-methodology")!;

  // The timings are not needed until the panel is drawn, so they load alongside
  // the manifest rather than after it.
  const loadingTimings = loadTimings();
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

  const timings = await loadingTimings;
  for (const [label, value] of timings?.methodology ?? []) {
    appendDefinition(methodology, label, value);
  }

  // Switching either tab reloads the frame, so the frame reports where it is and
  // the next page is asked to resume there. Positions are kept per document,
  // because the same offset in a different file is not the same place, while the
  // same offset in a different implementation of one file is.
  const provenance = root.querySelector<HTMLDListElement>(".comparison-provenance")!;
  for (const entry of manifest.implementations) {
    appendDefinition(provenance, entry.version, entry.theme);
  }

  const positions = new Map<string, number>();
  let currentDocument = manifest.documents[0]!;
  let currentImplementation = manifest.implementations[0]!;

  // The outputs are files rendered ahead of time, so the page cannot restyle one
  // the way the live showcase restyles its own. Both flavours are published and
  // the reader's setting picks between them, which is also why this listens:
  // switching appearance mid-visit would otherwise leave a light page around a
  // dark panel until the next reload.
  const prefersDark = matchMedia("(prefers-color-scheme: dark)");
  const themeFor = (dark: boolean) =>
    manifest.themes.find((theme) => theme.appearance === (dark ? "dark" : "light")) ??
    manifest.themes[0]!;
  let currentTheme = themeFor(prefersDark.matches);
  prefersDark.addEventListener("change", (event) => {
    currentTheme = themeFor(event.matches);
    show();
  });

  addEventListener("message", (event: MessageEvent) => {
    const scroll = (event.data as { lumisShowcaseScroll?: number } | null)?.lumisShowcaseScroll;
    if (typeof scroll === "number") positions.set(currentDocument.id, scroll);
  });

  // One line under the file tabs, which already name the file and leave the
  // flavour to the reader's setting: what the file is, then two numbers for the
  // output on screen rather than a table that competes with it. How finely this
  // file was resolved, and how long this library took to highlight it.
  function describe() {
    const injections =
      currentDocument.injections.length > 0 ? ` + ${currentDocument.injections.join(" + ")}` : "";
    const parts = [
      `${currentDocument.languageLabel}${injections}`,
      `${currentDocument.lines.toLocaleString()} lines`,
    ];

    const tokens = currentDocument.tokens?.[currentImplementation.id];
    if (tokens !== undefined) parts.push(`${tokens.toLocaleString()} tokens`);
    const measured = measurementOf(timings, currentDocument, currentImplementation.id);
    if (measured) parts.push(`${formatDuration(measured.totalNs)} highlight`);
    if (measured?.peakRssBytes !== undefined) {
      parts.push(`${formatBytes(measured.peakRssBytes)} peak RSS`);
    }

    const link = document.createElement("a");
    link.href = currentDocument.source;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.className = "text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400";
    link.textContent = "Original source";
    summary.replaceChildren(`${parts.join(" · ")} · `, link);
  }

  function show() {
    // Not every library reads every language, and a pair with no output has no
    // file to load, so the panel says so in its place.
    const isUnsupported = currentDocument.unsupported?.includes(currentImplementation.id) ?? false;
    frame.classList.toggle("hidden", isUnsupported);
    unsupported.classList.toggle("hidden", !isUnsupported);
    unsupported.classList.toggle("flex", isUnsupported);
    unsupported.textContent = isUnsupported
      ? `${currentImplementation.label} does not support ${currentDocument.languageLabel}.`
      : "";

    frame.src = isUnsupported
      ? "about:blank"
      : `${DATA}/${currentDocument.id}/${currentTheme.id}/${currentImplementation.id}.html` +
        `#at=${positions.get(currentDocument.id) ?? 0}`;
    frame.title =
      `${currentImplementation.label} highlighting ${currentDocument.label} ` +
      `in ${currentTheme.name}`;
    describe();
  }

  const selectDocument = (entry: ComparisonDocument) => () => {
    currentDocument = entry;
    paint(documentTabs, entry.id);
    show();
  };

  const selectImplementation = (entry: Manifest["implementations"][number]) => () => {
    currentImplementation = entry;
    paint(implementationTabs, entry.id);
    show();
  };

  for (const entry of manifest.documents) {
    const button = document.createElement("button");
    button.dataset.id = entry.id;
    button.setAttribute("role", "tab");
    button.className =
      "shrink-0 cursor-pointer border border-zinc-300 px-2.5 py-1 font-mono text-[11px] tracking-wider whitespace-nowrap uppercase transition-colors sm:px-3 sm:py-1.5 sm:text-xs dark:border-zinc-700";
    button.textContent = entry.label;
    button.addEventListener("click", selectDocument(entry));
    documentTabs.append(button);
  }

  for (const entry of manifest.implementations) {
    const button = document.createElement("button");
    button.dataset.id = entry.id;
    button.setAttribute("role", "tab");
    button.className =
      "cursor-pointer border-b-2 py-2 font-mono text-[11px] tracking-wider whitespace-nowrap uppercase transition-colors sm:py-3 sm:text-xs";
    button.textContent = entry.label;
    button.addEventListener("click", selectImplementation(entry));
    implementationTabs.append(button);
  }

  paint(documentTabs, currentDocument.id);
  paint(implementationTabs, currentImplementation.id);
  show();
}

// A time is shown only beside the output it measured. Once the comparison is
// republished with a different output, the old time names an output the page no
// longer has, and goes until the comparison is timed again.
function measurementOf(
  timings: Timings | undefined,
  document: ComparisonDocument,
  implementationId: string,
): Measurement | undefined {
  if (!timings) return undefined;
  const timed = timings.documents.get(document.id)?.get(implementationId);
  const shown = document.outputSha256?.[implementationId]?.[timings.theme];
  return timed && timed.sha256 === shown ? timed : undefined;
}

function appendDefinition(list: HTMLDListElement, label: string, value: string) {
  const term = document.createElement("dt");
  term.className = "font-mono text-xs tracking-wider text-zinc-900 uppercase dark:text-white";
  term.textContent = label;
  const detail = document.createElement("dd");
  detail.className = "text-zinc-600 dark:text-zinc-400";
  detail.textContent = value;
  list.append(term, detail);
}

// A build without the timing report still gets the gallery and the token
// counts, so a missing or malformed file is silence rather than an error.
async function loadTimings(): Promise<Timings | undefined> {
  try {
    const response = await fetch(TIMINGS);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return readTimings(await response.json());
  } catch {
    return undefined;
  }
}

// The report is fetched, so nothing about its shape is known until it has been
// checked. Anything unexpected throws and the caller drops the whole report,
// which is why the maps are built here rather than filled in by the caller: half
// a report would put `NaN µs` under one output and nothing under the next.
function readTimings(report: unknown): Timings {
  if (!isObject(report) || typeof report.theme !== "string" || !Array.isArray(report.documents)) {
    throw new Error("timing report has no theme or documents");
  }
  return {
    theme: report.theme,
    documents: new Map(report.documents.map(readTimingDocument)),
    methodology: readMethodology(report),
  };
}

function readMethodology(report: { [key: string]: unknown }): Array<[string, string]> {
  const system = isObject(report.system) ? report.system : {};
  const measuredAt = stringOf(report.measuredAt);
  const rows: Array<[string, string | undefined]> = [
    ["Measured", measuredAt ? measuredAt.slice(0, 10) : "Date not recorded in this report"],
    ["Hardware", hardwareOf(system)],
    ["Operating system", stringOf(system.os) ?? joined([system.platform, system.release], " ")],
    ["Runtimes", runtimesOf(report.runtimes)],
    ["Metric", stringOf(report.metric) && `${stringOf(report.metric)}, one run on one machine`],
    ["Timed", stringOf(report.timingBoundary)],
    ...memoryRows(report.memory),
  ];
  return rows.filter((row): row is [string, string] => row[1] !== undefined && row[1] !== "");
}

function hardwareOf(system: { [key: string]: unknown }): string | undefined {
  const cores = typeof system.cores === "number" ? `${system.cores} cores` : undefined;
  const memory =
    typeof system.memoryBytes === "number"
      ? `${Math.round(system.memoryBytes / 2 ** 30)} GiB`
      : undefined;
  return joined([system.cpu, system.architecture, cores, memory], ", ");
}

function runtimesOf(runtimes: unknown): string | undefined {
  if (!isObject(runtimes)) return undefined;
  const node = stringOf(runtimes.node);
  return joined([node && `Node.js ${node}`, runtimes.rust], ", ");
}

function memoryRows(memory: unknown): Array<[string, string | undefined]> {
  if (!isObject(memory)) return [["Memory", "Not measured in this report"]];
  const baselines = isObject(memory.baselines) ? memory.baselines : {};
  const baseline =
    isPositiveFinite(baselines.node) && isPositiveFinite(baselines.rust)
      ? ` An empty Node.js process peaks at ${formatBytes(baselines.node)} and an empty Rust one at ${formatBytes(baselines.rust)}.`
      : "";
  const runs = typeof memory.runs === "number" ? `, over ${memory.runs} processes` : "";
  return [
    [
      "Memory",
      stringOf(memory.boundary) &&
        `${stringOf(memory.metric) ?? "median"} ${stringOf(memory.boundary)}${runs}`,
    ],
    [
      "Resident set size",
      stringOf(memory.definition) && `${stringOf(memory.definition)}.${baseline}`,
    ],
  ];
}

function stringOf(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function joined(values: unknown[], separator: string): string | undefined {
  const strings = values.filter(
    (value): value is string => typeof value === "string" && value !== "",
  );
  return strings.length > 0 ? strings.join(separator) : undefined;
}

function readTimingDocument(entry: unknown): [string, Map<string, Measurement>] {
  if (!isObject(entry) || typeof entry.id !== "string" || !Array.isArray(entry.results)) {
    throw new Error("timing report has a document without an id or results");
  }
  const documentId = entry.id;
  return [documentId, new Map(entry.results.map((result) => readTimingResult(result, documentId)))];
}

function readTimingResult(result: unknown, documentId: string): [string, Measurement] {
  if (!isObject(result) || typeof result.id !== "string" || typeof result.sha256 !== "string") {
    throw new Error(`${documentId} has a result without an id or output hash`);
  }
  if (!isPositiveFinite(result.totalNs)) {
    throw new Error(`${result.id} has no positive time for ${documentId}`);
  }

  // A report from before memory was measured has times and no peaks.
  const peakRssBytes = isPositiveFinite(result.peakRssBytes) ? result.peakRssBytes : undefined;
  return [result.id, { totalNs: result.totalNs, sha256: result.sha256, peakRssBytes }];
}

function isPositiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}

function formatBytes(bytes: number) {
  return `${(bytes / 2 ** 20).toFixed(1)} MiB`;
}

function formatDuration(ns: number) {
  if (ns >= 1e9) return `${(ns / 1e9).toFixed(2)}s`;
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(2)}ms`;
  return `${(ns / 1e3).toFixed(0)}µs`;
}
