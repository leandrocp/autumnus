// Generates `queries_constants.rs` into OUT_DIR, included by `src/registry.rs`.
//
// Reads from two sources:
//   1. `languages.toml` at the workspace root (parser metadata)
//   2. `queries/<lang>/` directories (tree-sitter query files)
//
// The generated file contains:
//
//   - One `&str` constant per language per query type, e.g.:
//       pub const RUST_HIGHLIGHTS: &str = "...";
//       pub const RUST_INJECTIONS: &str = "...";
//       pub const RUST_LOCALS: &str = "";
//     Empty string when the .scm file doesn't exist for that language.
//
//   - `get_queries(lang_name) -> (highlights, injections, locals)`
//     Match on the directory name (e.g. "rust") and return the three constants.
//     Falls back to ("", "", "") for unknown languages.
//
//   - `language_to_query_name(lang: Language) -> &str`
//     Maps the Language enum variant to its query directory name.
//     Uses `query_name` from languages.toml when set, otherwise the parser key.
//     Example: Language::Assembly -> "asm", Language::Rust -> "rust"
//
//   - `wasm_file_name(lang_name) -> &str`
//     Maps a query name to its wasm file stem when they differ.
//     Only emits arms where the wasm stem != the query name.
//     Falls back to lang_name as-is (most languages match by convention).
//
// If you want to see the actual generated output, look in:
//   target/debug/build/lumis-cli-<hash>/out/queries_constants.rs

use lumis_build::convert_lua_matches;
use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use serde::Deserialize;
use std::collections::BTreeMap;
use std::env;
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;

#[derive(Deserialize)]
struct LanguagesToml {
    parsers: BTreeMap<String, ParserEntry>,
    #[serde(flatten)]
    _rest: toml::Value,
}

#[derive(Deserialize)]
struct ParserEntry {
    variant: Option<String>,
    query_name: Option<String>,
    wasm_name: Option<String>,
    #[serde(flatten)]
    _rest: toml::Value,
}

fn workspace_root() -> PathBuf {
    PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap())
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

fn titlecase(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(c) => c.to_uppercase().to_string() + chars.as_str(),
    }
}

fn main() {
    gen_conformance_tests();

    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let dest_path = out_dir.join("queries_constants.rs");

    let queries_path = workspace_root().join("queries").join("processed");
    let languages_toml_path = workspace_root().join("languages.toml");

    println!("cargo:rerun-if-changed={}", queries_path.display());
    println!("cargo:rerun-if-changed={}", languages_toml_path.display());

    let toml_content =
        fs::read_to_string(&languages_toml_path).expect("failed to read languages.toml");
    let lang_toml: LanguagesToml =
        toml::from_str(&toml_content).expect("failed to parse languages.toml");

    let mut generated_code = TokenStream::new();

    // --- Part 1: per-language query constants ---
    let entries = fs::read_dir(&queries_path).unwrap_or_else(|_| {
        panic!(
            "failed to read queries directory at {}. Run `just langs-preprocess-queries` first.",
            queries_path.display()
        )
    });

    let mut query_dirs: Vec<String> = Vec::new();

    for entry in entries {
        let entry = entry.unwrap();
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let language = path.file_name().unwrap().to_str().unwrap().to_string();
        let lang_upper = language.to_uppercase();
        let queries = ["highlights", "injections", "locals"];

        for query in queries {
            let file_path = path.join(format!("{query}.scm"));
            let content = if file_path.exists() {
                convert_lua_matches(&fs::read_to_string(&file_path).unwrap())
            } else {
                String::new()
            };
            let const_name = format_ident!("{}_{}", lang_upper, query.to_uppercase());

            generated_code.extend(quote! {
                pub const #const_name: &str = #content;
            });
        }

        query_dirs.push(language);
    }

    query_dirs.sort();

    // --- Part 2: get_queries() match arms ---
    let get_queries_arms: Vec<TokenStream> = query_dirs
        .iter()
        .map(|lang| {
            let upper = lang.to_uppercase();
            let h = format_ident!("{}_HIGHLIGHTS", upper);
            let i = format_ident!("{}_INJECTIONS", upper);
            let l = format_ident!("{}_LOCALS", upper);
            quote! { #lang => (#h, #i, #l), }
        })
        .collect();

    generated_code.extend(quote! {
        pub fn get_queries(lang_name: &str) -> (&'static str, &'static str, &'static str) {
            match lang_name {
                #(#get_queries_arms)*
                _ => ("", "", ""),
            }
        }
    });

    // --- Part 3: language_to_query_name() ---
    let mut lang_to_query_arms: Vec<TokenStream> = Vec::new();
    lang_to_query_arms.push(quote! { Language::PlainText => "plaintext", });

    for (key, entry) in &lang_toml.parsers {
        let variant_str = entry
            .variant
            .as_deref()
            .unwrap_or(&titlecase(key))
            .to_string();
        let variant = format_ident!("{}", variant_str);
        let query_name = entry.query_name.as_deref().unwrap_or(key.as_str());

        lang_to_query_arms.push(quote! {
            Language::#variant => #query_name,
        });
    }

    generated_code.extend(quote! {
        pub fn language_to_query_name(lang: Language) -> &'static str {
            match lang {
                #(#lang_to_query_arms)*
            }
        }
    });

    // --- Part 4: wasm_file_name() ---
    let mut wasm_map: BTreeMap<String, String> = BTreeMap::new();

    for (key, entry) in &lang_toml.parsers {
        let query_name = entry.query_name.as_deref().unwrap_or(key.as_str());

        let wasm_stem = if let Some(wn) = &entry.wasm_name {
            wn.strip_prefix("tree-sitter-").unwrap_or(wn).to_string()
        } else {
            key.replace('_', "-")
        };

        if wasm_stem != query_name {
            wasm_map.insert(query_name.to_string(), wasm_stem);
        }
    }

    let wasm_arms: Vec<TokenStream> = wasm_map
        .iter()
        .map(|(qn, stem)| quote! { #qn => #stem, })
        .collect();

    generated_code.extend(quote! {
        fn wasm_file_name(lang_name: &str) -> &str {
            match lang_name {
                #(#wasm_arms)*
                _ => lang_name,
            }
        }
    });

    // --- Part 5: all_wasm_names() ---
    // Returns all (query_name, wasm_stem) pairs for batch downloading.
    let mut all_pairs: Vec<TokenStream> = Vec::new();
    for (key, entry) in &lang_toml.parsers {
        let query_name = entry.query_name.as_deref().unwrap_or(key.as_str());
        let wasm_stem = if let Some(wn) = &entry.wasm_name {
            wn.strip_prefix("tree-sitter-").unwrap_or(wn).to_string()
        } else {
            key.replace('_', "-")
        };
        all_pairs.push(quote! { (#query_name, #wasm_stem), });
    }

    generated_code.extend(quote! {
        pub fn all_wasm_names() -> &'static [(&'static str, &'static str)] {
            &[#(#all_pairs)*]
        }
    });

    let mut output_file = File::create(&dest_path).unwrap();

    write!(
        output_file,
        "{}",
        prettyplease::unparse(&syn::parse2::<syn::File>(generated_code).unwrap())
    )
    .unwrap();
}

fn gen_conformance_tests() {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let conformance_dir = workspace_root().join("fixtures").join("conformance");

    println!("cargo:rerun-if-changed={}", conformance_dir.display());

    let mut code = String::new();

    if let Ok(entries) = fs::read_dir(&conformance_dir) {
        let mut names: Vec<String> = entries
            .filter_map(|entry| {
                let entry = entry.ok()?;
                if entry.file_type().ok()?.is_dir() {
                    Some(entry.file_name().to_string_lossy().to_string())
                } else {
                    None
                }
            })
            .filter(|name| !name.starts_with('.'))
            .collect();
        names.sort();

        for name in names {
            let ident = name.replace('-', "_");
            code.push_str(&format!(
                r#"
mod {ident} {{
    use super::*;
    fn fixture() -> Fixture {{ load_fixture("{name}") }}
    #[test] fn conformance_html_inline() {{ check_html_inline(&fixture()); }}
    #[test] fn conformance_html_linked() {{ check_html_linked(&fixture()); }}
    #[test] fn conformance_html_multi_themes() {{ check_html_multi_themes(&fixture()); }}
    #[test] fn conformance_terminal() {{ check_terminal(&fixture()); }}
}}
"#
            ));
        }
    }

    fs::write(out_dir.join("conformance_tests.rs"), code)
        .expect("failed to write generated conformance tests");
}
