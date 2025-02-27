fn main() {
    let root_dir = std::path::Path::new(".");
    let csv_dir = root_dir.join("csv").join("src");
    let psv_dir = root_dir.join("psv").join("src");
    let tsv_dir = root_dir.join("tsv").join("src");

    let mut c_config = cc::Build::new();
    c_config.include(&csv_dir);
    c_config
        .flag_if_supported("-Wno-unused-parameter")
        .flag_if_supported("-Wno-unused-but-set-variable")
        .flag_if_supported("-Wno-trigraphs");

    for path in &[
        csv_dir.join("parser.c"),
        psv_dir.join("parser.c"),
        tsv_dir.join("parser.c"),
    ] {
        c_config.file(path);
        println!("cargo:rerun-if-changed={}", path.to_str().unwrap());
    }

    c_config.compile("parser");
}
