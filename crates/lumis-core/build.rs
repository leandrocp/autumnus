// Generates Rust source files into OUT_DIR:
//
// 1. `languages_data.rs` (included by `src/languages.rs`)
//
//    Reads `languages.toml` and emits a `define_languages!` macro invocation
//    that declares the `Language` enum with all parser variants, detection
//    metadata (globs, aliases, emacs modes, shebangs), and feature gates.
//
//    Variants are split into two groups:
//      - `always`: PlainText, Diff (no feature gate)
//      - `gated`: everything else, behind `lang-*` features
//
// 2. `guess_queries.rs` (included by `src/languages/detection.rs`)
//
//    Discovers `queries/guess/*/guess.scm` and emits detector specifications
//    for detection features enabled in this build.
//
// 3. `theme_data.rs` (included by `src/themes.rs`)
//
//    Scans `themes/*.json` and emits:
//      - One `LazyLock<Theme>` constant per theme file
//      - `get(name) -> Result<Theme, ThemeError>` to look up themes by name
//      - `ALL_THEMES` vec of all built-in themes
//
// To inspect the generated output, look in:
//   target/debug/build/lumis-core-<hash>/out/

use quote::{format_ident, quote};
use serde::Deserialize;
use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

#[derive(Deserialize)]
struct LanguagesToml {
    parsers: BTreeMap<String, ParserEntry>,
    #[serde(flatten)]
    _rest: toml::Value,
}

#[derive(Deserialize)]
struct ParserEntry {
    #[serde(rename = "crate")]
    crate_name: Option<String>,
    globs: Option<Vec<String>>,
    aliases: Option<Vec<String>>,
    variant: Option<String>,
    display_name: Option<String>,
    emacs: Option<Vec<String>>,
    shebang: Option<Vec<String>>,
    feature: Option<String>,
    #[serde(flatten)]
    _rest: toml::Value,
}

fn manifest_dir() -> PathBuf {
    PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap())
}

fn titlecase(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(c) => c.to_uppercase().to_string() + chars.as_str(),
    }
}

fn key_to_feature(key: &str) -> String {
    format!("lang-{}", key.replace('_', "-"))
}

fn detection_feature(key: &str) -> String {
    format!("detect-{}", key.replace('_', "-"))
}

fn is_feature_enabled(feature: &str) -> bool {
    let env_key = format!("CARGO_FEATURE_{}", feature.to_uppercase().replace('-', "_"));
    env::var(env_key).is_ok()
}

fn format_str_list(list: &[String]) -> String {
    if list.is_empty() {
        return "[]".to_string();
    }
    let items: Vec<String> = list.iter().map(|s| format!("\"{}\"", s)).collect();
    format!("[{}]", items.join(", "))
}

fn format_entry(key: &str, entry: &ParserEntry) -> String {
    let variant = entry
        .variant
        .as_deref()
        .unwrap_or(&titlecase(key))
        .to_string();
    let display_name = entry
        .display_name
        .as_deref()
        .unwrap_or(&variant)
        .to_string();

    let mut from_str = vec![key.to_string()];
    if let Some(aliases) = &entry.aliases {
        from_str.extend(aliases.iter().cloned());
    }

    let globs = entry.globs.as_deref().unwrap_or(&[]);
    let emacs = entry.emacs.as_deref().unwrap_or(&[]);
    let shebang = entry.shebang.as_deref().unwrap_or(&[]);

    format!(
        r#"{variant} {{
            id: "{key}",
            name: "{display_name}",
            from_str: {from_str},
            globs: {globs},
            emacs: {emacs},
            shebang: {shebang}
        }}"#,
        variant = variant,
        key = key,
        display_name = display_name,
        from_str = format_str_list(&from_str),
        globs = format_str_list(&globs.iter().map(|s| s.to_string()).collect::<Vec<_>>()),
        emacs = format_str_list(&emacs.iter().map(|s| s.to_string()).collect::<Vec<_>>()),
        shebang = format_str_list(&shebang.iter().map(|s| s.to_string()).collect::<Vec<_>>()),
    )
}

fn languages() {
    // In the workspace, languages.toml lives at the repo root (../../).
    // When published, it's included at the crate root via Cargo.toml `include`.
    let workspace_path = manifest_dir().join("../../languages.toml");
    let crate_path = manifest_dir().join("languages.toml");
    let languages_toml_path = if workspace_path.exists() {
        workspace_path
    } else {
        crate_path
    };

    println!("cargo:rerun-if-changed={}", languages_toml_path.display());

    let content = fs::read_to_string(&languages_toml_path).expect("failed to read languages.toml");
    let toml: LanguagesToml = toml::from_str(&content).expect("failed to parse languages.toml");

    let mut always_entries = Vec::new();
    let mut gated_entries = Vec::new();

    // PlainText is always hardcoded (no parser entry in languages.toml)
    always_entries.push(
        r#"        PlainText {
            id: "plaintext",
            name: "Plain Text",
            from_str: [],
            globs: [],
            emacs: [],
            shebang: []
        }"#
        .to_string(),
    );

    for (key, entry) in &toml.parsers {
        let body = format_entry(key, entry);

        if key == "diff" {
            always_entries.push(format!("        {}", body));
        } else {
            let feat = entry.feature.clone().unwrap_or_else(|| key_to_feature(key));
            gated_entries.push(format!("        [\"{}\"] {}", feat, body));
        }
    }

    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let out_path = out_dir.join("languages_data.rs");
    let mut f = fs::File::create(&out_path).expect("failed to create languages_data.rs");

    writeln!(
        f,
        "// This file is auto-generated from languages.toml by build.rs"
    )
    .unwrap();
    writeln!(f, "// Do not edit.").unwrap();
    writeln!(f).unwrap();
    writeln!(f, "define_languages! {{").unwrap();
    writeln!(f, "    always {{").unwrap();
    writeln!(f, "{}", always_entries.join(",\n")).unwrap();
    writeln!(f, "    }}").unwrap();
    writeln!(f, "    gated {{").unwrap();
    writeln!(f, "{}", gated_entries.join(",\n")).unwrap();
    writeln!(f, "    }}").unwrap();
    writeln!(f, "}}").unwrap();
}

fn guess_queries() {
    let workspace_path = manifest_dir().join("../../queries/guess");
    let crate_path = manifest_dir().join("queries/guess");
    let queries_path = if workspace_path.exists() {
        workspace_path
    } else {
        crate_path
    };
    println!("cargo:rerun-if-changed={}", queries_path.display());

    let languages_path = if manifest_dir().join("../../languages.toml").exists() {
        manifest_dir().join("../../languages.toml")
    } else {
        manifest_dir().join("languages.toml")
    };
    let content = fs::read_to_string(languages_path).expect("failed to read languages.toml");
    let toml: LanguagesToml = toml::from_str(&content).expect("failed to parse languages.toml");
    let manifest_content = fs::read_to_string(manifest_dir().join("Cargo.toml"))
        .expect("failed to read lumis-core Cargo.toml");
    let manifest: toml::Value =
        toml::from_str(&manifest_content).expect("failed to parse lumis-core Cargo.toml");

    let mut specs = proc_macro2::TokenStream::new();
    let mut entries = fs::read_dir(&queries_path)
        .expect("failed to read queries/guess")
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    entries.sort_by_key(|entry| entry.file_name());

    let mut guessing_crate_counts = BTreeMap::<&str, usize>::new();
    for entry in &entries {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let language_id = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_else(|| panic!("invalid guess query directory: {}", path.display()));
        let parser = toml
            .parsers
            .get(language_id)
            .unwrap_or_else(|| panic!("guess query has no parser entry: {}", path.display()));
        let crate_name = parser
            .crate_name
            .as_deref()
            .unwrap_or_else(|| panic!("guess query requires a crate-backed parser: {language_id}"));
        *guessing_crate_counts.entry(crate_name).or_default() += 1;
    }

    for entry in entries {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let language_id = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_else(|| panic!("invalid guess query directory: {}", path.display()));
        let parser = toml
            .parsers
            .get(language_id)
            .unwrap_or_else(|| panic!("guess query has no parser entry: {}", path.display()));
        let crate_name = parser
            .crate_name
            .as_deref()
            .unwrap_or_else(|| panic!("guess query requires a crate-backed parser: {language_id}"));
        let query_path = path.join("guess.scm");
        let query = fs::read_to_string(&query_path)
            .unwrap_or_else(|error| panic!("failed to read {}: {error}", query_path.display()));

        let detector_feature = detection_feature(language_id);
        let feature_values = manifest
            .get("features")
            .and_then(|features| features.get(&detector_feature))
            .and_then(toml::Value::as_array)
            .unwrap_or_else(|| {
                panic!("missing `{detector_feature}` feature for {language_id} guessing")
            });
        let language_feature = parser
            .feature
            .clone()
            .unwrap_or_else(|| key_to_feature(language_id));
        for required in [
            "content-detection".to_string(),
            language_feature,
            format!("dep:{crate_name}"),
        ] {
            assert!(
                feature_values
                    .iter()
                    .any(|value| value.as_str() == Some(&required)),
                "feature `{detector_feature}` must enable `{required}`"
            );
        }
        assert!(
            manifest
                .get("dependencies")
                .and_then(|dependencies| dependencies.get(crate_name))
                .is_some(),
            "missing `{crate_name}` dependency for {language_id} guessing"
        );

        if !is_feature_enabled(&detector_feature) {
            continue;
        }

        let parser_crate = format_ident!("{}", crate_name.replace('-', "_"));
        let language_symbol = if guessing_crate_counts[crate_name] > 1 {
            format!("LANGUAGE_{}", language_id.to_uppercase().replace('-', "_"))
        } else {
            "LANGUAGE".to_string()
        };
        let language_symbol = format_ident!("{language_symbol}");
        let variant = format_ident!(
            "{}",
            parser
                .variant
                .clone()
                .unwrap_or_else(|| titlecase(language_id))
        );

        specs.extend(quote! {
            ContentDetectorSpec {
                language: Language::#variant,
                parser: || tree_sitter::Language::new(#parser_crate::#language_symbol),
                query: #query,
            },
        });
    }

    let generated = quote! {
        static CONTENT_DETECTOR_SPECS: &[ContentDetectorSpec] = &[#specs];
    };
    let out_dir =
        env::var("OUT_DIR").unwrap_or_else(|error| panic!("OUT_DIR is unavailable: {error}"));
    let out_path = PathBuf::from(out_dir).join("guess_queries.rs");
    let mut output = fs::File::create(out_path).expect("failed to create guess_queries.rs");
    let syntax = syn::parse2::<syn::File>(generated)
        .unwrap_or_else(|error| panic!("failed to generate guess queries: {error}"));
    write!(output, "{}", prettyplease::unparse(&syntax))
        .unwrap_or_else(|error| panic!("failed to write guess_queries.rs: {error}"));
}

fn themes() {
    let themes_dir = manifest_dir().join("themes");

    println!("cargo:rerun-if-changed={}", themes_dir.display());

    let out_dir = env::var("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("theme_data.rs");

    let theme_names: Vec<String> = fs::read_dir(&themes_dir)
        .unwrap()
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                path.file_stem().and_then(|s| s.to_str()).map(String::from)
            } else {
                None
            }
        })
        .collect();

    let theme_constants = theme_names.iter().map(|name| {
        let constant_name = format_ident!("{}", name.to_uppercase());
        let json_path = format!("{}/{}.json", themes_dir.display(), name);

        quote! {
            #[doc(hidden)]
            pub(crate) static #constant_name: LazyLock<Theme> = LazyLock::new(|| {
                let theme_str = include_str!(#json_path);
                crate::themes::from_json(theme_str).unwrap_or_else(|_| panic!("failed to load theme: {}", #name))
            });
        }
    });

    let theme_refs = theme_names.iter().map(|name| {
        let constant_name = format_ident!("{}", name.to_uppercase());
        quote! { &#constant_name }
    });

    let theme_name_matches = theme_names.iter().map(|name| {
        let constant_name = format_ident!("{}", name.to_uppercase());
        let name_str = name.to_lowercase();
        quote! { #name_str => Ok(#constant_name.clone()), }
    });

    let output = quote! {
        use std::sync::LazyLock;

        #(#theme_constants)*

        #[doc(hidden)]
        pub static ALL_THEMES: LazyLock<Vec<&'static Theme>> = LazyLock::new(|| vec![
            #(#theme_refs),*
        ]);

        /// Retrieves a theme by its name.
        pub fn get(name: &str) -> Result<Theme, ThemeError> {
            match name {
                #(#theme_name_matches)*
                _ => Err(ThemeError::NotFound(name.to_string())),
            }
        }

        /// Returns an iterator over all available built-in themes.
        pub fn available_themes() -> impl Iterator<Item = &'static Theme> {
            ALL_THEMES.iter().copied()
        }
    };

    fs::write(dest_path, output.to_string()).unwrap();
}

fn main() {
    languages();
    guess_queries();
    themes();
}
