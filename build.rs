use proc_macro2::TokenStream;
use quote::{format_ident, quote};
use rayon::prelude::*;
use std::collections::HashMap;
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

    // First, build a cache of all language files
    let mut highlights_cache: HashMap<String, String> = HashMap::new();
    let mut injections_cache: HashMap<String, String> = HashMap::new();
    let mut locals_cache: HashMap<String, String> = HashMap::new();

    // Pre-load all files into cache
    if let Ok(entries) = fs::read_dir(queries_dir) {
        for entry in entries.filter_map(Result::ok) {
            let path = entry.path();
            if path.is_dir() {
                let language = path.file_name().unwrap().to_string_lossy().to_string();

                // Cache highlights.scm
                let highlights_path = path.join("highlights.scm");
                if highlights_path.exists() {
                    if let Ok(content) = fs::read_to_string(&highlights_path) {
                        highlights_cache.insert(language.clone(), content);
                    }
                }

                // Cache injections.scm
                let injections_path = path.join("injections.scm");
                if injections_path.exists() {
                    if let Ok(content) = fs::read_to_string(&injections_path) {
                        injections_cache.insert(language.clone(), content);
                    }
                }

                // Cache locals.scm
                let locals_path = path.join("locals.scm");
                if locals_path.exists() {
                    if let Ok(content) = fs::read_to_string(&locals_path) {
                        locals_cache.insert(language.clone(), content);
                    }
                }
            }
        }
    }

    // Process the inheritance for each file type
    let processed_highlights = process_inheritance(&highlights_cache);
    let processed_injections = process_inheritance(&injections_cache);
    let processed_locals = process_inheritance(&locals_cache);

    // Now generate constants for each language
    if let Ok(entries) = fs::read_dir(queries_dir) {
        for entry in entries.filter_map(Result::ok) {
            let path = entry.path();
            if path.is_dir() {
                let language = path.file_name().unwrap().to_string_lossy().to_string();
                let language_upper = language.to_uppercase();

                // Skip languages without highlights.scm
                if !processed_highlights.contains_key(&language) {
                    println!(
                        "cargo:warning=No highlights.scm found for language: {}",
                        language
                    );
                    continue;
                }

                // Generate HIGHLIGHTS constant
                let highlights_constant_name = format_ident!("{}_{}", language_upper, "HIGHLIGHTS");
                if let Some(content) = processed_highlights.get(&language) {
                    // Process content to remove specific annotations (only for highlights.scm)
                    let processed_content = content
                        .replace("@spell", "")
                        .replace("@none", "")
                        .replace("@conceal", "")
                        .replace("@nospell", "");

                    let constant_def = quote! {
                        pub const #highlights_constant_name: &str = #processed_content;
                    };

                    token_stream.extend(constant_def);
                }

                // Generate INJECTIONS constant
                let injections_constant_name = format_ident!("{}_{}", language_upper, "INJECTIONS");
                if let Some(content) = processed_injections.get(&language) {
                    let constant_def = quote! {
                        pub const #injections_constant_name: &str = #content;
                    };

                    token_stream.extend(constant_def);
                } else {
                    let constant_def = quote! {
                        pub const #injections_constant_name: &str = "";
                    };

                    token_stream.extend(constant_def);
                }

                // Generate LOCALS constant
                let locals_constant_name = format_ident!("{}_{}", language_upper, "LOCALS");
                if let Some(content) = processed_locals.get(&language) {
                    let constant_def = quote! {
                        pub const #locals_constant_name: &str = #content;
                    };

                    token_stream.extend(constant_def);
                } else {
                    let constant_def = quote! {
                        pub const #locals_constant_name: &str = "";
                    };

                    token_stream.extend(constant_def);
                }

                // Add files to rerun-if-changed
                println!("cargo:rerun-if-changed=queries/{}/highlights.scm", language);
                println!("cargo:rerun-if-changed=queries/{}/injections.scm", language);
                println!("cargo:rerun-if-changed=queries/{}/locals.scm", language);
            }
        }
    }

    // Write all generated constants to the output file
    write!(file, "{}", token_stream).unwrap();
}

// Process inheritance in a set of files
fn process_inheritance(files: &HashMap<String, String>) -> HashMap<String, String> {
    let mut processed = HashMap::new();

    // First pass: Detect inheritance relationships
    let mut inheritance: HashMap<String, String> = HashMap::new();
    for (language, content) in files {
        // Look for inheritance directive in the first line
        if let Some(first_line) = content.lines().next() {
            if first_line.starts_with("; inherits: ") {
                let parent = first_line.trim_start_matches("; inherits: ").trim();
                inheritance.insert(language.clone(), parent.to_string());
            }
        }
    }

    // Second pass: Process each file with inheritance
    for (language, content) in files {
        let processed_content =
            process_file(language, content, files, &inheritance, &mut Vec::new());
        processed.insert(language.clone(), processed_content);
    }

    processed
}

// Process a single file, resolving its inheritance
fn process_file(
    language: &str,
    content: &str,
    files: &HashMap<String, String>,
    inheritance: &HashMap<String, String>,
    visited: &mut Vec<String>,
) -> String {
    // Check for circular inheritance
    if visited.contains(&language.to_string()) {
        println!(
            "cargo:warning=Circular inheritance detected for language: {}",
            language
        );
        return content.to_string();
    }

    // Track visited languages to detect cycles
    visited.push(language.to_string());

    // Check if this language inherits from another
    if let Some(parent) = inheritance.get(language) {
        if let Some(parent_content) = files.get(parent) {
            // Process the parent content first (recursive handling of multi-level inheritance)
            let processed_parent =
                process_file(parent, parent_content, files, inheritance, visited);

            // Replace the inheritance directive with the parent content
            let mut result = String::new();
            let mut lines = content.lines();

            // Skip the first line (inheritance directive)
            lines.next();

            // Add the parent content
            result.push_str(&processed_parent);
            result.push('\n');

            // Add the rest of the current file
            for line in lines {
                result.push_str(line);
                result.push('\n');
            }

            return result;
        } else {
            println!(
                "cargo:warning=Parent language not found for {}: {}",
                language, parent
            );
        }
    }

    // If no inheritance or parent not found, return the original content
    content.to_string()
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
