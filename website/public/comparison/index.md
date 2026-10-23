---
title: Lumis - Visual output comparison
description: The same source files highlighted by Lumis, highlight.js, Highlights, Prism, Shiki, speed-highlight, starry-night, Sugar High, syntect, and TanStack Highlight.
---

# Visual output comparison

The [interactive comparison](https://lumis.sh/comparison/) renders the same source files with Lumis, highlight.js, Highlights, Prism, Shiki, speed-highlight, starry-night, Sugar High, syntect, and TanStack Highlight, each through its own public API, in Catppuccin Latte and Frappé. Every Lumis runtime renders each file byte for byte identically, so one Lumis output is shown.

## Libraries

| Library            | Version                         | Theme                                                                                   |
| ------------------ | ------------------------------- | --------------------------------------------------------------------------------------- |
| Lumis              | Lumis 0.9.4                     | Neovim Catppuccin colorschemes, extracted by this repository                            |
| highlight.js       | highlight.js 11.12.0            | @catppuccin/highlightjs 1.0.1 stylesheets                                               |
| Highlights         | @pierre/highlights 0.2.0        | Highlights' bundled Catppuccin themes, which match catppuccin/zed                       |
| Prism              | prismjs 1.30.0                  | catppuccin/prismjs stylesheets, pinned by SHA-256                                       |
| Shiki              | shiki 4.5.0                     | Shiki's bundled catppuccin themes                                                       |
| speed-highlight    | @speed-highlight/core 2.1.0     | @catppuccin/highlightjs 1.0.1 colours, mapped onto its token classes by this repository |
| starry-night       | @wooorm/starry-night 3.11.0     | @catppuccin/highlightjs 1.0.1 colours, mapped onto its token classes by this repository |
| Sugar High         | sugar-high 2.6.0                | @catppuccin/highlightjs 1.0.1 colours, mapped onto its token classes by this repository |
| syntect            | syntect 5.3 with two-face 0.5.1 | catppuccin/bat tmTheme files, pinned by SHA-256                                         |
| TanStack Highlight | @tanstack/highlight 1.1.0       | @catppuccin/highlightjs 1.0.1 colours, mapped onto its token classes by this repository |

speed-highlight has no TSX grammar, so it reads the TSX file as TypeScript.

## Documents

- [three.js WebGPU](https://github.com/mrdoob/three.js/blob/6365c1a0af6a32ed45f99712197555fee2f4b24a/examples/webgpu_compute_reduce.html): HTML with CSS, JSON, and JavaScript injections, 1,397 lines
- [ripgrep searcher](https://github.com/BurntSushi/ripgrep/blob/4649aa9700619f94cf9c66876e9549d83420e16c/crates/searcher/src/searcher/mod.rs): Rust with Comment injections, 1,054 lines
- [Livebook core components](https://github.com/livebook-dev/livebook/blob/5133601d9678fb8ef0c87484e5d52eff193813e5/lib/livebook_web/components/core_components.ex): Elixir with HEEx, Markdown, and Comment injections, 1,152 lines; not supported by TanStack Highlight, Sugar High, and speed-highlight
- [Go encoding/json](https://github.com/golang/go/blob/3901409b5d0fb7c85a3e6730a59943cc93b2835c/src/encoding/json/encode.go): Go with Comment injections, 1,342 lines
- [Lumis README](https://github.com/leandrocp/lumis/blob/main/README.md): Markdown with Bash, Elixir, Java, JavaScript, and Rust injections, 181 lines
- [shadcn/ui sidebar](https://github.com/shadcn-ui/ui/blob/607e8a9717fe6ff0d374ba74c651012f9c052534/apps/v4/registry/new-york-v4/ui/sidebar.tsx): TSX with Comment injections, 727 lines

## Methodology

- Measured: date not recorded in this report
- Hardware: Apple M1 Pro, arm64
- Operating system: darwin 27.0.0
- Metric: median of each library's samples; every figure comes from one run on one machine
- Timed: one highlight of the whole document through the call that rendered the published output, with Lumis as Lumis Rust; building the highlighter and loading its languages are excluded
- Memory: not measured in this report

A token is a span the highlighter gave a colour to, counted in the published output. Grammars split punctuation and whitespace differently, so it shows how finely a file was resolved, not a quality score.

## Results

### three.js WebGPU

| Library            | Tokens | Median highlight | Peak RSS |
| ------------------ | -----: | ---------------: | -------: |
| Lumis              |  6,580 |         16.94 ms |        — |
| highlight.js       |  2,019 |         17.67 ms |        — |
| Highlights         |  5,468 |                — |        — |
| Prism              |  6,048 |         11.24 ms |        — |
| Shiki              |  5,887 |         97.83 ms |        — |
| speed-highlight    |  3,415 |          6.55 ms |        — |
| starry-night       |  3,487 |         81.65 ms |        — |
| Sugar High         |  7,297 |                — |        — |
| syntect            |  6,718 |         77.07 ms |        — |
| TanStack Highlight |  1,881 |          4.95 ms |        — |

### ripgrep searcher

| Library            | Tokens | Median highlight | Peak RSS |
| ------------------ | -----: | ---------------: | -------: |
| Lumis              |  4,521 |          8.49 ms |        — |
| highlight.js       |  1,304 |          7.46 ms |        — |
| Highlights         |  3,155 |                — |        — |
| Prism              |  3,428 |          8.26 ms |        — |
| Shiki              |  3,734 |         44.75 ms |        — |
| speed-highlight    |  2,421 |          3.38 ms |        — |
| starry-night       |  2,508 |         44.38 ms |        — |
| Sugar High         |  8,614 |          6.57 ms |        — |
| syntect            |  4,157 |         28.98 ms |        — |
| TanStack Highlight |  1,960 |                — |        — |

### Livebook core components

| Library      | Tokens | Median highlight | Peak RSS |
| ------------ | -----: | ---------------: | -------: |
| Lumis        |  5,401 |         19.62 ms |        — |
| highlight.js |    709 |          3.99 ms |        — |
| Highlights   |  1,976 |                — |        — |
| Prism        |  1,928 |          5.08 ms |        — |
| Shiki        |  3,668 |         36.48 ms |        — |
| starry-night |  2,519 |         30.71 ms |        — |
| syntect      |  3,242 |         11.78 ms |        — |

### Go encoding/json

| Library            | Tokens | Median highlight | Peak RSS |
| ------------------ | -----: | ---------------: | -------: |
| Lumis              |  6,306 |         14.14 ms |        — |
| highlight.js       |  1,336 |          6.61 ms |        — |
| Highlights         |  5,755 |                — |        — |
| Prism              |  4,774 |          8.84 ms |        — |
| Shiki              |  6,189 |         76.01 ms |        — |
| speed-highlight    |  2,718 |          3.09 ms |        — |
| starry-night       |  2,584 |         27.20 ms |        — |
| Sugar High         |  7,182 |          5.64 ms |        — |
| syntect            |  6,824 |         40.00 ms |        — |
| TanStack Highlight |  2,355 |          3.22 ms |        — |

### Lumis README

| Library            | Tokens | Median highlight | Peak RSS |
| ------------------ | -----: | ---------------: | -------: |
| Lumis              |    849 |          5.64 ms |        — |
| highlight.js       |    263 |          1.71 ms |        — |
| Highlights         |    623 |                — |        — |
| Prism              |    844 |          3.68 ms |        — |
| Shiki              |    571 |          8.53 ms |        — |
| speed-highlight    |    259 |           548 µs |        — |
| starry-night       |    567 |         11.77 ms |        — |
| Sugar High         |    385 |           600 µs |        — |
| syntect            |    839 |          7.09 ms |        — |
| TanStack Highlight |    266 |                — |        — |

### shadcn/ui sidebar

| Library            | Tokens | Median highlight | Peak RSS |
| ------------------ | -----: | ---------------: | -------: |
| Lumis              |  2,422 |          5.53 ms |        — |
| highlight.js       |  1,259 |          8.32 ms |        — |
| Highlights         |  2,177 |                — |        — |
| Prism              |  2,631 |         10.71 ms |        — |
| Shiki              |  2,474 |         34.09 ms |        — |
| speed-highlight    |  1,487 |          2.90 ms |        — |
| starry-night       |  2,026 |         33.98 ms |        — |
| Sugar High         |  4,331 |          8.72 ms |        — |
| syntect            |  2,946 |         29.19 ms |        — |
| TanStack Highlight |    838 |          2.98 ms |        — |

The source files, rendering pipeline, themes, and generated outputs are available in the [Lumis repository](https://github.com/leandrocp/lumis).

[Lumis home](https://lumis.sh/) · [Documentation](https://docs.lumis.sh) · [Showcase](https://lumis.sh/showcase/)
