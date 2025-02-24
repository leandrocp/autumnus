use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use rayon::prelude::*;
use std::env;
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};

fn main() {
    vendored_parsers();
    queries();
    themes();
}

fn vendored_parsers() {
    let parsers = vec![TreeSitterParser {
        name: "tree-sitter-dockerfile",
        src_dir: "vendored_parsers/tree-sitter-dockerfile/src",
        extra_files: vec!["scanner.c"],
    }];

    for parser in &parsers {
        println!("cargo:rerun-if-changed={}", parser.src_dir);
    }

    parsers.par_iter().for_each(|p| p.build());
}

fn queries() {
    let out_dir = env::var("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("queries_data.rs");
    let mut file = File::create(&dest_path).unwrap();

    // Path to queries directory
    let queries_dir = Path::new("queries");

    let mut token_stream = TokenStream::new();

    // Process each language directory
    if let Ok(entries) = fs::read_dir(queries_dir) {
        for entry in entries.filter_map(Result::ok) {
            let path = entry.path();
            if path.is_dir() {
                let language = path.file_name().unwrap().to_string_lossy();

                // Look for highlights.scm only
                let highlight_path = path.join("highlights.scm");

                if !highlight_path.exists() {
                    println!(
                        "cargo:warning=No highlights.scm found for language: {}",
                        language
                    );
                    continue; // No highlights.scm file found, skip this language
                }

                // Generate constant name
                let constant_name = format_ident!("HIGHLIGHTS_{}", language.to_uppercase());

                // Read file content to process it
                if let Ok(content) = fs::read_to_string(&highlight_path) {
                    let processed_content = content
                        .replace("@spell", "")
                        .replace("@none", "")
                        .replace("@conceal", "")
                        .replace("@nospell", "");

                    // Create constant definition with the processed content directly
                    let constant_def = quote! {
                        pub const #constant_name: &str = #processed_content;
                    };

                    token_stream.extend(constant_def);

                    // Also add the file to rerun-if-changed
                    println!("cargo:rerun-if-changed={}", highlight_path.display());
                }
            }
        }
    }

    // Write all generated constants to the output file
    write!(file, "{}", token_stream).unwrap();
}

fn themes() {
    println!("cargo:rerun-if-changed=themes/");

    let out_dir = env::var("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("theme_data.rs");

    let themes_dir = Path::new("themes");

    let theme_names: Vec<String> = fs::read_dir(themes_dir)
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
        let json_path = format!("../../../../../themes/{}.json", name); // Changed to use relative path from OUT_DIR

        quote! {
            pub static #constant_name: LazyLock<Theme> = LazyLock::new(|| {
                let theme_str = include_str!(#json_path);
                 crate::themes::from_json(theme_str).unwrap_or_else(|_| panic!("failed to load theme: {}", #name))
            });
        }
    });

    let theme_refs = theme_names.iter().map(|name| {
        let constant_name = format_ident!("{}", name.to_uppercase());
        quote! { &#constant_name }
    });

    let output = quote! {
        use std::sync::LazyLock;

        #(#theme_constants)*

        pub static ALL_THEMES: LazyLock<Vec<&'static Theme>> = LazyLock::new(|| vec![
            #(#theme_refs),*
        ]);
    };

    fs::write(dest_path, output.to_string()).unwrap();
}

// Build vendored tree-sitter parsers
// https://github.com/Wilfred/difftastic/blob/8953c55cf854ceac2ccb6ece004d6a94a5bfa122/build.rs

struct TreeSitterParser {
    name: &'static str,
    src_dir: &'static str,
    extra_files: Vec<&'static str>,
}

impl TreeSitterParser {
    fn build(&self) {
        let dir = PathBuf::from(&self.src_dir);

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
        if cfg!(target_env = "msvc") {
            build.flag("/utf-8");
        }
        build.include(&dir).warnings(false); // ignore unused parameter warnings
        for file in c_files {
            build.file(dir.join(file));
        }

        build.link_lib_modifier("+whole-archive");

        build.compile(self.name);
    }
}
