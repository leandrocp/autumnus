import { escapeHtml } from "../lib/utils";
import { LANGUAGES_BY_ID } from "../data/languages";
import { loadTheme } from "../data/themes";
import { renderHighlightMultiTheme } from "../lib/highlighter";

const REVIEW_FORMATTER_CODE = `// 1. The decorator emits formatter-neutral annotations.
impl LineViewDecorator for ReviewNotes {
    fn run(&self, ctx: DecoratorContext<'_>, out: &mut DecorationOutput) {
        for note in find_review_notes(ctx.source()) {
            out.line_highlights.push(LineHighlight {
                line: note.line,
                kind: Some("review.note".to_string()),
                class: Some("has-note".to_string()),
                style: note.line_style,
            });
            out.signs.push(SignText {
                line: note.line,
                kind: Some("review.sign".to_string()),
                text: note.sign,
                style: note.sign_style,
            });
        }
    }
}

// 2. LineView combines syntax spans and decorator output.
let view = LineViewBuilder::new()
    .source(source)
    .language(Language::JavaScript)
    .decorators([&ReviewNotes])
    .build()?;

// 3. The formatter owns the final UI.
for line in &view.lines {
    render_line_number(line.line_number);
    render_code_row(&line.spans, &line.signs);
    render_annotation_cards(&line.line_highlights);
}`;

const LINE_VIEW_SHAPE = `LineView {
    trailing_newline: false,
    lines: [
        Line {
            line_number: 1,
            range: 0..11,
            gutter_text: [],
            spans: [
                Span { range: 0..2, text: "fn", scopes: ["keyword.function"], ... },
                Span { range: 3..7, text: "main", scopes: ["function"], ... },
            ],
            ..
        },
        Line {
            line_number: 2,
            line_highlights: [
                LineHighlight { kind: Some("review.todo"), class: Some("has-todo"), ... },
            ],
            spans: [
                Span { range: 16..23, text: "println", scopes: ["keyword.exception"], ... },
                Span { range: 25..29, text: '"hi"', scopes: ["string"], ... },
            ],
            ..
        },
    ],
}`;

const DECORATION_FEATURES = [
  {
    name: "rainbow_brackets",
    description: "Built in now: query-backed bracket pairs styled by nesting depth.",
  },
  {
    name: "custom_decorators",
    description: "Rust code can add line state, signs, gutter text, virtual text, or span output.",
  },
  {
    name: "more_built_ins_soon",
    description:
      "Line numbers, highlighted lines, guides, and diff notation can use the same LineView model later.",
  },
];

const DECORATION_OUTPUT = [
  {
    name: "line_highlights",
    description: "whole-line state for selected lines, diffs, or diagnostics",
  },
  { name: "gutter_text", description: "optional gutter labels for custom formatters" },
  { name: "virtual_text", description: "overlays attached to display columns" },
  {
    name: "span decorations",
    description: "inline styles for rainbow brackets and custom review markers",
  },
];

const DECORATION_CAPABILITIES = [
  ...DECORATION_FEATURES,
  ...DECORATION_OUTPUT.map((item) => ({
    name: item.name,
    description: item.description,
  })),
];

export function renderDecorations() {
  return `
    <section id="decorations" class="py-24 sm:py-36">
      <div class="mx-auto max-w-6xl px-6">
        <div class="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <a href="#decorations" class="group inline-flex items-center gap-1 font-mono text-sm font-semibold tracking-wider no-underline transition-opacity hover:opacity-80">
              <span class="text-fuchsia-400">&lt;</span><span class="text-cyan-400">Decorations</span> <span class="text-fuchsia-400">/&gt;</span>
            </a>
            <h2 class="mt-8 font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Rainbow brackets now. Custom decorators now. More soon.
            </h2>
            <p class="mt-4 max-w-3xl font-mono text-sm leading-7 text-zinc-500">
              LineView gives decorators a place to put extra line and span data before anything becomes HTML or ANSI.
            </p>
          </div>

          <div class="grid gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-2">
              ${DECORATION_CAPABILITIES.map(
                (item) => `
                <div class="bg-white p-5 dark:bg-[#09090b]">
                  <h3 class="font-mono text-xs font-bold tracking-wider text-zinc-900 dark:text-white">${item.name}</h3>
                  <p class="mt-2 font-mono text-[11px] leading-relaxed text-zinc-500">${item.description}</p>
                </div>
              `,
              ).join("")}
          </div>
        </div>

        <div class="mt-12 overflow-hidden border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800">
          <div class="grid gap-px">
            <div class="bg-white p-4 dark:bg-[#09090b] sm:p-6">
              <div class="mb-4 flex items-center justify-between gap-4 font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                <span>Rendered output</span>
                <span class="border border-zinc-200 px-2.5 py-1 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">LineView powered</span>
              </div>
              ${renderReviewOutput()}
            </div>

            <div class="bg-white dark:bg-[#09090b]">
              <div class="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                <span class="font-mono text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">How it is wired</span>
              </div>
              <p class="px-5 pt-5 font-mono text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                The decorator marks lines and spans. Lumis merges that with syntax highlighting into LineView. The formatter chooses the final UI.
              </p>
              <div id="review-formatter-code" class="[&_code]:font-mono" data-code="${encodeURIComponent(REVIEW_FORMATTER_CODE)}">
                <pre class="m-0 max-h-96 overflow-auto px-5 py-4 font-mono text-[11px] leading-5 text-zinc-700 dark:text-zinc-300"><code>${escapeHtml(REVIEW_FORMATTER_CODE)}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 grid gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 lg:grid-cols-[0.95fr_1.05fr]">
          <div class="bg-white p-5 dark:bg-[#09090b]">
            <h3 class="font-mono text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-white">LineView shape</h3>
            <p class="mt-3 font-mono text-xs leading-6 text-zinc-500 dark:text-zinc-400">
              LineView is what formatters receive: ranges, scopes, line state, signs, virtual text, optional gutter text, and inline decorations in one read-only model.
            </p>
            <p class="mt-4 font-mono text-xs leading-6 text-zinc-500 dark:text-zinc-400">
              Built-in rainbow labels live in <code>lumis::highlight::annotation_kinds</code>. Custom decorators can use their own labels. Future built-ins can add more without changing the LineView shape.
            </p>
          </div>
          <div id="line-view-shape-code" class="bg-white [&_code]:font-mono dark:bg-[#09090b]" data-code="${encodeURIComponent(LINE_VIEW_SHAPE)}">
            <pre class="m-0 max-h-96 overflow-auto px-5 py-4 font-mono text-[11px] leading-5 text-zinc-700 dark:text-zinc-300"><code>${escapeHtml(LINE_VIEW_SHAPE)}</code></pre>
          </div>
        </div>

      </div>
    </section>`;
}

function renderReviewOutput() {
  const rows = [
    {
      line: 1,
      sign: "",
      className: "",
      code: `<span class="text-violet-600 dark:text-fuchsia-400">export</span> <span class="text-violet-600 dark:text-fuchsia-400">function</span> <span class="text-sky-600 dark:text-sky-400">checkout</span><span class="text-zinc-500">(</span><span class="text-rose-600 dark:text-rose-300">cart</span><span class="text-zinc-500">)</span> <span class="text-zinc-500">{</span>`,
    },
    {
      line: 2,
      sign: "",
      className: "",
      code: `  <span class="text-violet-600 dark:text-fuchsia-400">const</span> <span class="text-zinc-900 dark:text-zinc-200">total</span> <span class="text-cyan-600 dark:text-cyan-300">=</span> <span class="text-zinc-900 dark:text-zinc-200">cart</span><span class="text-zinc-500">.</span><span class="text-violet-600 dark:text-violet-300">items</span><span class="text-zinc-500">.</span><span class="text-sky-600 dark:text-sky-400">reduce</span><span class="text-zinc-500">((</span><span class="text-rose-600 dark:text-rose-300">sum</span><span class="text-zinc-500">,</span> <span class="text-rose-600 dark:text-rose-300">item</span><span class="text-zinc-500">)</span> <span class="text-cyan-600 dark:text-cyan-300">=&gt;</span> <span class="text-zinc-900 dark:text-zinc-200">sum</span> <span class="text-cyan-600 dark:text-cyan-300">+</span> <span class="text-zinc-900 dark:text-zinc-200">item</span><span class="text-zinc-500">.</span><span class="text-violet-600 dark:text-violet-300">price</span><span class="text-zinc-500">,</span> <span class="text-orange-600 dark:text-orange-300">0</span><span class="text-zinc-500">)</span>`,
    },
    {
      line: 3,
      sign: "?",
      className: "border-l-2 border-amber-400 bg-amber-50 dark:bg-amber-400/10",
      code: `  <span class="text-zinc-500 italic">// </span><mark class="bg-amber-200 px-1 text-zinc-950 dark:bg-amber-300">TODO</mark><span class="text-zinc-500">:</span><span class="text-zinc-500 italic"> show tax and shipping before charging the card</span>`,
    },
    {
      line: 4,
      sign: "",
      className: "",
      code: `  <span class="text-sky-600 dark:text-sky-400">charge</span><span class="text-zinc-500">(</span><span class="text-zinc-900 dark:text-zinc-200">total</span><span class="text-zinc-500">)</span>`,
    },
    {
      line: 5,
      sign: "!",
      className: "border-l-2 border-rose-400 bg-rose-50 dark:bg-rose-400/10",
      code: `  <span class="text-zinc-500 italic">// </span><mark class="bg-rose-200 px-1 text-zinc-950 dark:bg-rose-300">FIXME</mark><span class="text-zinc-500">:</span><span class="text-zinc-500 italic"> handle failed payments and retry safely</span>`,
    },
    {
      line: 6,
      sign: "",
      className: "",
      code: `  <span class="text-violet-600 dark:text-fuchsia-400">return</span> <span class="text-zinc-500">{</span> <span class="text-violet-600 dark:text-violet-300">ok</span><span class="text-zinc-500">:</span> <span class="text-orange-600 dark:text-orange-300">true</span> <span class="text-zinc-500">}</span>`,
    },
    { line: 7, sign: "", className: "", code: `<span class="text-zinc-500">}</span>` },
  ];

  return `
    <section class="overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#09090b]">
      <header class="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div>
          <p class="font-mono text-[10px] tracking-[0.28em] text-cyan-500 uppercase dark:text-cyan-400">custom formatter + decorator</p>
          <h3 class="mt-1 font-sans text-lg font-bold text-zinc-900 dark:text-white">Checkout flow review</h3>
        </div>
        <span class="border border-zinc-200 px-3 py-1 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">2 notes</span>
      </header>
      <div class="grid lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div class="overflow-hidden py-3 font-mono text-[11px] leading-5 text-zinc-900 dark:text-zinc-200 sm:text-[12px]">
          ${rows
            .map(
              (row) => `
              <div class="grid grid-cols-[3.25ch_2ch_minmax(0,1fr)] px-4 ${row.className}">
                <span class="select-none text-right text-zinc-400 dark:text-zinc-600">${row.line}</span>
                <span class="select-none text-center ${row.sign === "!" ? "text-rose-500 dark:text-rose-300" : "text-amber-600 dark:text-amber-300"}">${row.sign}</span>
                <span class="truncate whitespace-pre">${row.code}</span>
              </div>
            `,
            )
            .join("")}
        </div>
        <aside class="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#050507] lg:border-t-0 lg:border-l">
          <h4 class="font-sans text-sm font-bold text-zinc-900 dark:text-zinc-100">Annotations</h4>
          <article class="mt-4 border border-amber-200 bg-amber-50 p-3 dark:border-amber-300/20 dark:bg-amber-300/10">
            <span class="font-mono text-xs text-cyan-600 dark:text-cyan-300">line 3</span>
            <p class="mt-2 font-mono text-xs leading-5 text-zinc-600 dark:text-zinc-300">show tax and shipping before charging the card</p>
          </article>
          <article class="mt-3 border border-rose-200 bg-rose-50 p-3 dark:border-rose-300/20 dark:bg-rose-300/10">
            <span class="font-mono text-xs text-cyan-600 dark:text-cyan-300">line 5</span>
            <p class="mt-2 font-mono text-xs leading-5 text-zinc-600 dark:text-zinc-300">handle failed payments and retry safely</p>
          </article>
        </aside>
      </div>
    </section>`;
}

export async function setupDecorations(root: HTMLElement) {
  const reviewCode = root.querySelector<HTMLDivElement>("#review-formatter-code");
  const lineViewShape = root.querySelector<HTMLDivElement>("#line-view-shape-code");
  if (!reviewCode && !lineViewShape) return;

  const rust = LANGUAGES_BY_ID.get("rust");
  if (!rust) return;

  const [lightTheme, darkTheme] = await Promise.all([
    loadTheme("catppuccin_latte"),
    loadTheme("catppuccin_mocha"),
  ]);

  if (reviewCode) {
    reviewCode.innerHTML = await renderHighlightMultiTheme(
      rust,
      lightTheme,
      darkTheme,
      decodeURIComponent(reviewCode.dataset.code!),
      "m-0 overflow-x-auto p-5 font-mono text-[12px] leading-6 sm:p-6",
    );
  }

  if (lineViewShape) {
    lineViewShape.innerHTML = await renderHighlightMultiTheme(
      rust,
      lightTheme,
      darkTheme,
      decodeURIComponent(lineViewShape.dataset.code!),
      "m-0 max-h-96 overflow-auto px-5 py-4 font-mono text-[11px] leading-5",
    );
  }
}
