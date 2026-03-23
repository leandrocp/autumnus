// Generates two outputs into OUT_DIR:
//
// 1. Compiled C/C++ tree-sitter parsers (via `vendored_parsers()`)
//
//    Compiles vendored tree-sitter grammar sources under `vendored_parsers/`.
//    Each parser is gated behind its `lang-*` feature flag. Builds run in
//    parallel using rayon. Produces static libraries linked into the final
//    binary (e.g. `libtree-sitter-rust.a`).
//
// 2. `queries_constants.rs` (via `queries()`, included by `src/queries.rs`)
//
//    Reads processed .scm files from `queries/processed/<lang>/` and
//    emits one `&str` constant per language per query type:
//      pub const RUST_HIGHLIGHTS: &str = "...";
//      pub const RUST_INJECTIONS: &str = "...";
//      pub const RUST_LOCALS: &str = "...";
//
//    Also converts `#lua-match?` predicates to `#match?` with Lua-to-Rust
//    regex conversion (this step only applies to the native Rust crate,
//    not the CLI which uses web-tree-sitter).
//
//    Each constant is feature-gated to match its language.
//
// Theme data is provided by lumis-core (re-exported via src/themes.rs).
//
// To inspect the generated output, look in:
//   target/debug/build/lumis-<hash>/out/

use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use rayon::prelude::*;
use std::env;
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};

fn manifest_dir() -> PathBuf {
    PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap())
}

fn main() {
    vendored_parsers();
    queries();
    gen_conformance_tests();
}

fn gen_conformance_tests() {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let conformance_dir = workspace_root().join("fixtures").join("conformance");

    println!("cargo:rerun-if-changed={}", conformance_dir.display());

    let mut code = String::new();

    if let Ok(entries) = fs::read_dir(&conformance_dir) {
        let mut names: Vec<String> = entries
            .filter_map(|e| {
                let e = e.ok()?;
                if e.file_type().ok()?.is_dir() {
                    Some(e.file_name().to_string_lossy().to_string())
                } else {
                    None
                }
            })
            .filter(|n| !n.starts_with('.'))
            .collect();
        names.sort();

        for name in &names {
            let ident = name.replace('-', "_");
            code.push_str(&format!(
                r#"
mod {ident} {{
    use super::*;
    fn fixture() -> Fixture {{ load_fixture("{name}") }}
    #[test] fn events() {{ check_events(&fixture()); }}
    #[test] fn html_inline() {{ check_html_inline(&fixture()); }}
    #[test] fn html_linked() {{ check_html_linked(&fixture()); }}
    #[test] fn html_multi_themes() {{ check_html_multi_themes(&fixture()); }}
    #[test] fn terminal() {{ check_terminal(&fixture()); }}
}}
"#
            ));
        }
    }

    fs::write(out_dir.join("conformance_tests.rs"), code).unwrap();
}

struct TreeSitterParser {
    name: &'static str,
    src_dir: &'static str,
    extra_files: Vec<&'static str>,
}

impl TreeSitterParser {
    fn build(&self) {
        let dir = manifest_dir().join(self.src_dir);

        let mut c_files = vec!["parser.c"];
        let mut cpp_files = vec![];

        for file in &self.extra_files {
            if file.ends_with(".c") {
                c_files.push(file);
            } else {
                cpp_files.push(file);
            }
        }

        if !cpp_files.is_empty() {
            let mut cpp_build = cc::Build::new();
            cpp_build
                .include(&dir)
                .cpp(true)
                .std("c++14")
                .flag_if_supported("-Wno-implicit-fallthrough")
                .flag_if_supported("-Wno-unused-parameter")
                .flag_if_supported("-Wno-ignored-qualifiers")
                .link_lib_modifier("+whole-archive");

            for file in cpp_files {
                cpp_build.file(dir.join(file));
            }

            cpp_build.compile(&format!("{}-cpp", self.name));
        }

        let mut build = cc::Build::new();

        // if cfg!(target_env = "msvc") {
        //     build.flag("/utf-8");
        // }

        build.include(&dir).warnings(false);

        // Add unique prefix for symbols to avoid conflicts
        if self.name == "tree-sitter-angular" || self.name == "tree-sitter-vue" {
            build.flag(format!(
                "-DTAG_TYPES_BY_TAG_NAME={}_{}",
                self.name.replace("-", "_"),
                "TAG_TYPES_BY_TAG_NAME"
            ));
        }

        for file in c_files {
            build.file(dir.join(file));
        }

        build.link_lib_modifier("+whole-archive");

        build.compile(self.name);
    }
}

// https://github.com/Wilfred/difftastic/blob/8953c55cf854ceac2ccb6ece004d6a94a5bfa122/build.rs
// TODO: remove vendored parsers in favor of crates as soon as they implement LanguageFn
#[allow(clippy::vec_init_then_push, unused_mut)]
fn vendored_parsers() {
    let mut parsers: Vec<TreeSitterParser> = vec![];

    #[cfg(feature = "lang-angular")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-angular",
        src_dir: "vendored_parsers/tree-sitter-angular/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-astro")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-astro",
        src_dir: "vendored_parsers/tree-sitter-astro/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-caddy")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-caddy",
        src_dir: "vendored_parsers/tree-sitter-caddy/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-clojure")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-clojure",
        src_dir: "vendored_parsers/tree-sitter-clojure/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-commonlisp")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-commonlisp",
        src_dir: "vendored_parsers/tree-sitter-commonlisp/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-csv")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-csv",
        src_dir: "vendored_parsers/tree-sitter-csv/csv/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-dart")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-dart",
        src_dir: "vendored_parsers/tree-sitter-dart/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-dockerfile")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-dockerfile",
        src_dir: "vendored_parsers/tree-sitter-dockerfile/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-eex")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-eex",
        src_dir: "vendored_parsers/tree-sitter-eex/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-fish")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-fish",
        src_dir: "vendored_parsers/tree-sitter-fish/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-glimmer")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-glimmer",
        src_dir: "vendored_parsers/tree-sitter-glimmer/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-graphql")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-graphql",
        src_dir: "vendored_parsers/tree-sitter-graphql/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-http")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-http",
        src_dir: "vendored_parsers/tree-sitter-http/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-iex")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-iex",
        src_dir: "vendored_parsers/tree-sitter-iex/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-kotlin")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-kotlin",
        src_dir: "vendored_parsers/tree-sitter-kotlin/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-latex")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-latex",
        src_dir: "vendored_parsers/tree-sitter-latex/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-liquid")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-liquid",
        src_dir: "vendored_parsers/tree-sitter-liquid/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-llvm")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-llvm",
        src_dir: "vendored_parsers/tree-sitter-llvm/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-make")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-make",
        src_dir: "vendored_parsers/tree-sitter-make/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-markdown")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-markdown",
        src_dir: "vendored_parsers/tree-sitter-markdown/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-markdown-inline")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-markdown_inline",
        src_dir: "vendored_parsers/tree-sitter-markdown_inline/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-nushell")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-nu",
        src_dir: "vendored_parsers/tree-sitter-nu/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-perl")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-perl",
        src_dir: "vendored_parsers/tree-sitter-perl/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-scss")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-scss",
        src_dir: "vendored_parsers/tree-sitter-scss/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-surface")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-surface",
        src_dir: "vendored_parsers/tree-sitter-surface/src",
        extra_files: vec![],
    });

    #[cfg(feature = "lang-typst")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-typst",
        src_dir: "vendored_parsers/tree-sitter-typst/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-vim")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-vim",
        src_dir: "vendored_parsers/tree-sitter-vim/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-vue")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-vue",
        src_dir: "vendored_parsers/tree-sitter-vue/src",
        extra_files: vec!["scanner.c"],
    });

    #[cfg(feature = "lang-wat")]
    parsers.push(TreeSitterParser {
        name: "tree-sitter-wat",
        src_dir: "vendored_parsers/tree-sitter-wat/src",
        extra_files: vec![],
    });

    for parser in &parsers {
        println!(
            "cargo:rerun-if-changed={}",
            manifest_dir().join(parser.src_dir).display()
        );
    }

    parsers.par_iter().for_each(|p| p.build());
}

fn workspace_root() -> PathBuf {
    manifest_dir()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

fn read_query_file(path: &Path) -> String {
    if !path.exists() {
        return String::new();
    }

    let content = fs::read_to_string(path).expect("failed to read query file");
    lumis_build::convert_lua_matches(&content)
}

fn require_highlights_query(path: &Path, language: &str) {
    assert!(
        path.exists(),
        "missing processed highlights query for language '{language}' at {}. Run `just langs-preprocess-queries` first.",
        path.display()
    );

    let content = fs::read_to_string(path).unwrap_or_else(|err| {
        panic!(
            "failed to read processed highlights query for language '{language}' at {}: {err}",
            path.display()
        )
    });

    assert!(
        !content.trim().is_empty(),
        "empty processed highlights query for language '{language}' at {}. Run `just langs-preprocess-queries` again.",
        path.display()
    );
}

fn queries() {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let dest_path = out_dir.join("queries_constants.rs");

    let queries_path = workspace_root().join("queries").join("processed");
    let mut generated_code = TokenStream::new();

    println!("cargo:rerun-if-changed={}", queries_path.display());

    let entries = fs::read_dir(&queries_path).unwrap_or_else(|_| {
        panic!(
            "failed to read queries/processed directory at {}. Run `just langs-preprocess-queries` first.",
            queries_path.display()
        )
    });

    for entry in entries {
        let entry = entry.unwrap();
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let language = path.file_name().unwrap().to_str().unwrap();

        // Check if we should generate constants for this language based on feature flags

        // Only generate constants if the language feature is enabled
        let should_generate = match language {
            "c_sharp" => cfg!(feature = "lang-csharp"),
            "embedded_template" => cfg!(feature = "lang-ejs") || cfg!(feature = "lang-erb"),
            "markdown" => cfg!(feature = "lang-markdown"),
            "markdown_inline" => cfg!(feature = "lang-markdown-inline"),
            "ocaml" => cfg!(feature = "lang-ocaml"),
            "ocaml_interface" => cfg!(feature = "lang-ocaml"),
            "sql" => cfg!(feature = "lang-sql"),
            "svelte" => cfg!(feature = "lang-svelte"),
            "toml" => cfg!(feature = "lang-toml"),
            "angular" => cfg!(feature = "lang-angular"),
            "asm" => cfg!(feature = "lang-asm"),
            "astro" => cfg!(feature = "lang-astro"),
            "bash" => cfg!(feature = "lang-bash"),
            "c" => cfg!(feature = "lang-c"),
            "caddy" => cfg!(feature = "lang-caddy"),
            "clojure" => cfg!(feature = "lang-clojure"),
            "cmake" => cfg!(feature = "lang-cmake"),
            "comment" => cfg!(feature = "lang-comment"),
            "commonlisp" => cfg!(feature = "lang-commonlisp"),
            "cpp" => cfg!(feature = "lang-cpp"),
            "css" => cfg!(feature = "lang-css"),
            "csv" => cfg!(feature = "lang-csv"),
            "dart" => cfg!(feature = "lang-dart"),
            "diff" => true, // Always enabled for plaintext fallback
            "dockerfile" => cfg!(feature = "lang-dockerfile"),
            "eex" => cfg!(feature = "lang-eex"),
            "elixir" => cfg!(feature = "lang-elixir"),
            "elm" => cfg!(feature = "lang-elm"),
            "erlang" => cfg!(feature = "lang-erlang"),
            "fish" => cfg!(feature = "lang-fish"),
            "fsharp" => cfg!(feature = "lang-fsharp"),
            "gleam" => cfg!(feature = "lang-gleam"),
            "glimmer" => cfg!(feature = "lang-glimmer"),
            "go" => cfg!(feature = "lang-go"),
            "graphql" => cfg!(feature = "lang-graphql"),
            "haskell" => cfg!(feature = "lang-haskell"),
            "hcl" => cfg!(feature = "lang-hcl"),
            "heex" => cfg!(feature = "lang-heex"),
            "html" => cfg!(feature = "lang-html"),
            "http" => cfg!(feature = "lang-http"),
            "iex" => cfg!(feature = "lang-iex"),
            "java" => cfg!(feature = "lang-java"),
            "javascript" => cfg!(feature = "lang-javascript"),
            "json" => cfg!(feature = "lang-json"),
            "kotlin" => cfg!(feature = "lang-kotlin"),
            "latex" => cfg!(feature = "lang-latex"),
            "liquid" => cfg!(feature = "lang-liquid"),
            "llvm" => cfg!(feature = "lang-llvm"),
            "lua" => cfg!(feature = "lang-lua"),
            "make" => cfg!(feature = "lang-make"),
            "nix" => cfg!(feature = "lang-nix"),
            "nu" => cfg!(feature = "lang-nushell"),
            "objc" => cfg!(feature = "lang-objc"),
            "perl" => cfg!(feature = "lang-perl"),
            "php" => cfg!(feature = "lang-php"),
            "php_only" => cfg!(feature = "lang-php"),
            "powershell" => cfg!(feature = "lang-powershell"),
            "proto" => cfg!(feature = "lang-protobuf"),
            "python" => cfg!(feature = "lang-python"),
            "r" => cfg!(feature = "lang-r"),
            "regex" => cfg!(feature = "lang-regex"),
            "ruby" => cfg!(feature = "lang-ruby"),
            "rust" => cfg!(feature = "lang-rust"),
            "scala" => cfg!(feature = "lang-scala"),
            "scss" => cfg!(feature = "lang-scss"),
            "surface" => cfg!(feature = "lang-surface"),
            "swift" => cfg!(feature = "lang-swift"),
            "tsx" => cfg!(feature = "lang-tsx"),
            "typescript" => cfg!(feature = "lang-typescript"),
            "typst" => cfg!(feature = "lang-typst"),
            "vim" => cfg!(feature = "lang-vim"),
            "vue" => cfg!(feature = "lang-vue"),
            "wat" => cfg!(feature = "lang-wat"),
            "xml" => cfg!(feature = "lang-xml"),
            "yaml" => cfg!(feature = "lang-yaml"),
            "zig" => cfg!(feature = "lang-zig"),
            _ => false, // Unknown language, skip
        };

        if !should_generate {
            continue;
        }

        let lang_upper = language.to_uppercase();
        let queries = ["highlights", "injections", "locals"];

        require_highlights_query(&path.join("highlights.scm"), language);

        for query in queries {
            let file_path = path.join(format!("{query}.scm"));
            let const_name = format_ident!("{}_{}", lang_upper, query.to_uppercase());
            let processed_content = read_query_file(&file_path);

            generated_code.extend(quote! {
                #[doc(hidden)]
                pub const #const_name: &str = #processed_content;
            });

            generated_code.extend(quote! {});
        }

        generated_code.extend(quote! {});
    }

    let mut output_file = File::create(&dest_path).unwrap();

    write!(
        output_file,
        "{}",
        prettyplease::unparse(&syn::parse2::<syn::File>(generated_code).unwrap())
    )
    .unwrap();
}
