// Auto-generated from languages.toml by `mise run langs-gen-catalog`.
// Do not edit manually.

define_catalog! {
    package_version_range: "0.26",
    languages: {
        "angular" => {
            aliases: [],
            globs: ["*.angular", "component.html"],
            package_name: "@lumis-sh/wasm-angular"
        },
        "asm" => {
            aliases: ["assembly"],
            globs: ["*.s", "*.asm", "*.assembly"],
            package_name: "@lumis-sh/wasm-asm"
        },
        "astro" => {
            aliases: [],
            globs: ["*.astro"],
            package_name: "@lumis-sh/wasm-astro"
        },
        "bash" => {
            aliases: ["sh"],
            globs: ["*.bash", "*.bats", "*.cgi", "*.command", "*.env", "*.fcgi", "*.ksh", "*.sh", "*.sh.in", "*.tool", ".bash_aliases", ".bash_history", ".bash_logout", ".bash_profile", ".bashrc", ".cshrc", ".env", ".env.example", ".flaskenv", ".kshrc", ".login", ".profile", "9fs", "PKGBUILD", "bash_aliases", "bash_logout", "bash_profile", "bashrc", "cshrc", "ebuild", "eclass", "gradlew", "kshrc", "login", "man", "profile"],
            package_name: "@lumis-sh/wasm-bash"
        },
        "c" => {
            aliases: [],
            globs: ["*.c"],
            package_name: "@lumis-sh/wasm-c"
        },
        "caddy" => {
            aliases: [],
            globs: ["Caddyfile", "caddyfile"],
            package_name: "@lumis-sh/wasm-caddy"
        },
        "clojure" => {
            aliases: [],
            globs: ["*.bb", "*.boot", "*.clj", "*.cljc", "*.clje", "*.cljs", "*.cljx", "*.edn", "*.joke", "*.joker"],
            package_name: "@lumis-sh/wasm-clojure"
        },
        "cmake" => {
            aliases: [],
            globs: ["*.cmake", "*.cmake.in", "CMakeLists.txt"],
            package_name: "@lumis-sh/wasm-cmake"
        },
        "comment" => {
            aliases: [],
            globs: [],
            package_name: "@lumis-sh/wasm-comment"
        },
        "commonlisp" => {
            aliases: [],
            globs: ["*.lisp", "*.lsp", "*.asd"],
            package_name: "@lumis-sh/wasm-commonlisp"
        },
        "cpp" => {
            aliases: ["c++"],
            globs: ["*.cc", "*.cpp", "*.h", "*.hh", "*.hpp", "*.cxx", "*.cu", "*.hxx"],
            package_name: "@lumis-sh/wasm-cpp"
        },
        "csharp" => {
            aliases: ["c#"],
            globs: ["*.cs"],
            package_name: "@lumis-sh/wasm-csharp"
        },
        "css" => {
            aliases: [],
            globs: ["*.css"],
            package_name: "@lumis-sh/wasm-css"
        },
        "csv" => {
            aliases: [],
            globs: ["*.csv"],
            package_name: "@lumis-sh/wasm-csv"
        },
        "dart" => {
            aliases: [],
            globs: ["*.dart"],
            package_name: "@lumis-sh/wasm-dart"
        },
        "diff" => {
            aliases: [],
            globs: ["*.diff"],
            package_name: "@lumis-sh/wasm-diff"
        },
        "dockerfile" => {
            aliases: ["docker"],
            globs: ["Dockerfile", "dockerfile", "docker", "Containerfile", "container", "*.dockerfile", "*.docker", "*.container"],
            package_name: "@lumis-sh/wasm-dockerfile"
        },
        "eex" => {
            aliases: [],
            globs: ["*.eex"],
            package_name: "@lumis-sh/wasm-eex"
        },
        "ejs" => {
            aliases: [],
            globs: ["*.ejs"],
            package_name: "@lumis-sh/wasm-embedded-template"
        },
        "elixir" => {
            aliases: [],
            globs: ["*.ex", "*.exs"],
            package_name: "@lumis-sh/wasm-elixir"
        },
        "elm" => {
            aliases: [],
            globs: ["*.elm"],
            package_name: "@lumis-sh/wasm-elm"
        },
        "erb" => {
            aliases: [],
            globs: ["*.erb"],
            package_name: "@lumis-sh/wasm-embedded-template"
        },
        "erlang" => {
            aliases: [],
            globs: ["*.erl", "*.app", "*.app.src", "*.es", "*.escript", "*.hrl", "*.xrl", "*.yrl", "Emakefile", "rebar.config"],
            package_name: "@lumis-sh/wasm-erlang"
        },
        "fish" => {
            aliases: [],
            globs: ["*.fish"],
            package_name: "@lumis-sh/wasm-fish"
        },
        "fsharp" => {
            aliases: ["f#"],
            globs: ["*.fs", "*.fsx", "*.fsi"],
            package_name: "@lumis-sh/wasm-fsharp"
        },
        "gleam" => {
            aliases: [],
            globs: ["*.gleam"],
            package_name: "@lumis-sh/wasm-gleam"
        },
        "glimmer" => {
            aliases: ["ember", "handlebars"],
            globs: ["*.hbs", "*.handlebars", "*.html.handlebars", "*.glimmer"],
            package_name: "@lumis-sh/wasm-glimmer"
        },
        "go" => {
            aliases: [],
            globs: ["*.go"],
            package_name: "@lumis-sh/wasm-go"
        },
        "graphql" => {
            aliases: [],
            globs: [],
            package_name: "@lumis-sh/wasm-graphql"
        },
        "haskell" => {
            aliases: [],
            globs: ["*.hs", "*.hs-boot"],
            package_name: "@lumis-sh/wasm-haskell"
        },
        "hcl" => {
            aliases: [],
            globs: ["*.hcl", "*.nomad", "*.workflow"],
            package_name: "@lumis-sh/wasm-hcl"
        },
        "heex" => {
            aliases: [],
            globs: ["*.heex", "*.neex"],
            package_name: "@lumis-sh/wasm-heex"
        },
        "html" => {
            aliases: [],
            globs: ["*.html", "*.htm", "*.xhtml"],
            package_name: "@lumis-sh/wasm-html"
        },
        "http" => {
            aliases: [],
            globs: ["*.http", "*.rest"],
            package_name: "@lumis-sh/wasm-http"
        },
        "iex" => {
            aliases: [],
            globs: ["*.iex"],
            package_name: "@lumis-sh/wasm-iex"
        },
        "ini" => {
            aliases: [],
            globs: ["*.ini", "*.cfg", "*.cnf", ".gitmodules", ".npmrc"],
            package_name: "@lumis-sh/wasm-ini"
        },
        "java" => {
            aliases: [],
            globs: ["*.java"],
            package_name: "@lumis-sh/wasm-java"
        },
        "javascript" => {
            aliases: ["js", "jsx"],
            globs: ["*.cjs", "*.js", "*.mjs", "*.snap", "*.jsx"],
            package_name: "@lumis-sh/wasm-javascript"
        },
        "json" => {
            aliases: [],
            globs: ["*.json", "*.avsc", "*.geojson", "*.gltf", "*.har", "*.ice", "*.JSON-tmLanguage", "*.jsonl", "*.mcmeta", "*.tfstate", "*.tfstate.backup", "*.topojson", "*.webapp", "*.webmanifest", ".arcconfig", ".auto-changelog", ".c8rc", ".htmlhintrc", ".imgbotconfig", ".nycrc", ".tern-config", ".tern-project", ".watchmanconfig", "Pipfile.lock", "composer.lock", "mcmod.info", "flake.lock"],
            package_name: "@lumis-sh/wasm-json"
        },
        "julia" => {
            aliases: [],
            globs: ["*.jl"],
            package_name: "@lumis-sh/wasm-julia"
        },
        "kotlin" => {
            aliases: [],
            globs: ["*.kt", "*.ktm", "*.kts"],
            package_name: "@lumis-sh/wasm-kotlin"
        },
        "latex" => {
            aliases: ["tex"],
            globs: ["*.aux", "*.cls", "*.sty", "*.tex"],
            package_name: "@lumis-sh/wasm-latex"
        },
        "liquid" => {
            aliases: [],
            globs: ["*liquid"],
            package_name: "@lumis-sh/wasm-liquid"
        },
        "llvm" => {
            aliases: [],
            globs: ["*.llvm", "*.ll"],
            package_name: "@lumis-sh/wasm-llvm"
        },
        "lua" => {
            aliases: [],
            globs: ["*.lua"],
            package_name: "@lumis-sh/wasm-lua"
        },
        "make" => {
            aliases: [],
            globs: ["*.mak", "*.d", "*.make", "*.makefile", "*.mk", "*.mkfile", "*.dsp", "BSDmakefile", "GNUmakefile", "Kbuild", "Makefile", "MAKEFILE", "Makefile.am", "Makefile.boot", "Makefile.frag", "Makefile*.in", "Makefile.inc", "Makefile.wat", "makefile", "makefile.sco", "mkfile"],
            package_name: "@lumis-sh/wasm-make"
        },
        "markdown" => {
            aliases: [],
            globs: ["*.md", "*.markdown", "*.mdown", "*.mkd", ".MD", "README", "LICENSE"],
            package_name: "@lumis-sh/wasm-markdown"
        },
        "markdown_inline" => {
            aliases: [],
            globs: [],
            package_name: "@lumis-sh/wasm-markdown_inline"
        },
        "mdx" => {
            aliases: [],
            globs: ["*.mdx"],
            package_name: "@lumis-sh/wasm-markdown"
        },
        "nix" => {
            aliases: [],
            globs: ["*.nix"],
            package_name: "@lumis-sh/wasm-nix"
        },
        "nushell" => {
            aliases: ["nu"],
            globs: ["*.nu"],
            package_name: "@lumis-sh/wasm-nushell"
        },
        "objc" => {
            aliases: ["objective-c"],
            globs: ["*.m", "*.objc"],
            package_name: "@lumis-sh/wasm-objc"
        },
        "ocaml" => {
            aliases: [],
            globs: ["*.ml"],
            package_name: "@lumis-sh/wasm-ocaml"
        },
        "ocaml_interface" => {
            aliases: [],
            globs: ["*.mli"],
            package_name: "@lumis-sh/wasm-ocaml_interface"
        },
        "perl" => {
            aliases: [],
            globs: ["*.pm", "*.pl", "*.t"],
            package_name: "@lumis-sh/wasm-perl"
        },
        "php" => {
            aliases: [],
            globs: ["*.php", "*.phtml", "*.php3", "*.php4", "*.php5", "*.php7", "*.phps"],
            package_name: "@lumis-sh/wasm-php"
        },
        "powershell" => {
            aliases: [],
            globs: ["*.ps1", "*.psm1"],
            package_name: "@lumis-sh/wasm-powershell"
        },
        "protobuf" => {
            aliases: [],
            globs: ["*.proto", "*.protobuf", "*.proto2", "*.proto3"],
            package_name: "@lumis-sh/wasm-protobuf"
        },
        "python" => {
            aliases: [],
            globs: ["*.py", "*.py3", "*.pyi", "*.bzl", "TARGETS", "BUCK", "DEPS"],
            package_name: "@lumis-sh/wasm-python"
        },
        "r" => {
            aliases: [],
            globs: ["*.R", "*.r", "*.rd", "*.rsx", ".Rprofile", "expr-dist"],
            package_name: "@lumis-sh/wasm-r"
        },
        "regex" => {
            aliases: [],
            globs: ["*.regex"],
            package_name: "@lumis-sh/wasm-regex"
        },
        "ruby" => {
            aliases: [],
            globs: ["*.rb", "*.builder", "*.spec", "*.rake", "Gemfile", "Rakefile"],
            package_name: "@lumis-sh/wasm-ruby"
        },
        "rust" => {
            aliases: [],
            globs: ["*.rs"],
            package_name: "@lumis-sh/wasm-rust"
        },
        "scala" => {
            aliases: [],
            globs: ["*.scala", "*.sbt", "*.sc"],
            package_name: "@lumis-sh/wasm-scala"
        },
        "scss" => {
            aliases: [],
            globs: ["*.scss"],
            package_name: "@lumis-sh/wasm-scss"
        },
        "sql" => {
            aliases: [],
            globs: ["*.sql", "*.pgsql"],
            package_name: "@lumis-sh/wasm-sql"
        },
        "surface" => {
            aliases: [],
            globs: ["*.surface", "*.sface"],
            package_name: "@lumis-sh/wasm-surface"
        },
        "svelte" => {
            aliases: [],
            globs: ["*.svelte"],
            package_name: "@lumis-sh/wasm-svelte"
        },
        "swift" => {
            aliases: [],
            globs: ["*.swift"],
            package_name: "@lumis-sh/wasm-swift"
        },
        "toml" => {
            aliases: [],
            globs: ["*.toml", "Cargo.lock", "Gopkg.lock", "Pipfile", "pdm.lock", "poetry.lock", "uv.lock"],
            package_name: "@lumis-sh/wasm-toml"
        },
        "tsx" => {
            aliases: [],
            globs: ["*.tsx"],
            package_name: "@lumis-sh/wasm-tsx"
        },
        "typescript" => {
            aliases: ["ts"],
            globs: ["*.ts"],
            package_name: "@lumis-sh/wasm-typescript"
        },
        "typst" => {
            aliases: [],
            globs: ["*.typ", "*.typst"],
            package_name: "@lumis-sh/wasm-typst"
        },
        "vim" => {
            aliases: ["viml", "vimscript"],
            globs: ["*.vim", "*.viml"],
            package_name: "@lumis-sh/wasm-vim"
        },
        "vue" => {
            aliases: [],
            globs: ["*.vue"],
            package_name: "@lumis-sh/wasm-vue"
        },
        "wat" => {
            aliases: ["wasm", "webassembly"],
            globs: ["*.wat"],
            package_name: "@lumis-sh/wasm-wat"
        },
        "xml" => {
            aliases: [],
            globs: ["*.ant", "*.csproj", "*.mjml", "*.plist", "*.resx", "*.svg", "*.ui", "*.vbproj", "*.xaml", "*.xml", "*.xsd", "*.xsl", "*.xslt", "*.zcml", "*.rng", "App.config", "nuget.config", "packages.config", ".classpath", ".cproject", ".project"],
            package_name: "@lumis-sh/wasm-xml"
        },
        "yaml" => {
            aliases: [],
            globs: ["*.yaml", "*.yml"],
            package_name: "@lumis-sh/wasm-yaml"
        },
        "zig" => {
            aliases: [],
            globs: ["*.zig"],
            package_name: "@lumis-sh/wasm-zig"
        },
        "arduino" => {
            aliases: [],
            globs: ["*.ino", "*.pde"],
            package_name: "@lumis-sh/wasm-arduino"
        },
        "bicep" => {
            aliases: [],
            globs: ["*.bicep", "*.bicepparam"],
            package_name: "@lumis-sh/wasm-bicep"
        },
        "dot" => {
            aliases: [],
            globs: ["*.dot", "*.gv"],
            package_name: "@lumis-sh/wasm-dot"
        },
        "editorconfig" => {
            aliases: [],
            globs: [".editorconfig"],
            package_name: "@lumis-sh/wasm-editorconfig"
        },
        "gitattributes" => {
            aliases: [],
            globs: [".gitattributes", "gitattributes"],
            package_name: "@lumis-sh/wasm-gitattributes"
        },
        "javadoc" => {
            aliases: [],
            globs: [],
            package_name: "@lumis-sh/wasm-javadoc"
        },
        "jq" => {
            aliases: [],
            globs: ["*.jq"],
            package_name: "@lumis-sh/wasm-jq"
        },
        "kdl" => {
            aliases: [],
            globs: ["*.kdl"],
            package_name: "@lumis-sh/wasm-kdl"
        },
        "luadoc" => {
            aliases: [],
            globs: [],
            package_name: "@lumis-sh/wasm-luadoc"
        },
        "nim" => {
            aliases: [],
            globs: ["*.nim", "*.nims", "*.nimble"],
            package_name: "@lumis-sh/wasm-nim"
        },
        "pascal" => {
            aliases: [],
            globs: ["*.pas", "*.pp", "*.lpr", "*.dpr"],
            package_name: "@lumis-sh/wasm-pascal"
        },
        "puppet" => {
            aliases: [],
            globs: ["*.pp", "Puppetfile"],
            package_name: "@lumis-sh/wasm-puppet"
        },
        "terraform" => {
            aliases: [],
            globs: ["*.tf", "*.tfvars", "*.tfvars.json"],
            package_name: "@lumis-sh/wasm-terraform"
        },
        "toon" => {
            aliases: [],
            globs: ["*.toon"],
            package_name: "@lumis-sh/wasm-toon"
        },
        "wgsl" => {
            aliases: [],
            globs: ["*.wgsl"],
            package_name: "@lumis-sh/wasm-wgsl"
        },
        "zsh" => {
            aliases: [],
            globs: ["*.zsh", ".zshrc", ".zshenv", ".zprofile", ".zlogin", ".zlogout", "zshrc", "zshenv", "zprofile", "zlogin", "zlogout"],
            package_name: "@lumis-sh/wasm-zsh"
        },
        "d" => {
            aliases: [],
            globs: ["*.d"],
            package_name: "@lumis-sh/wasm-d"
        },
        "fortran" => {
            aliases: [],
            globs: ["*.f", "*.f03", "*.f08", "*.f90", "*.f95", "*.for", "*.ftn"],
            package_name: "@lumis-sh/wasm-fortran"
        },
        "gitignore" => {
            aliases: [],
            globs: [".gitignore", ".ignore", ".fdignore", ".rgignore"],
            package_name: "@lumis-sh/wasm-gitignore"
        },
        "glsl" => {
            aliases: [],
            globs: ["*.comp", "*.frag", "*.geom", "*.glsl", "*.tesc", "*.tese", "*.vert"],
            package_name: "@lumis-sh/wasm-glsl"
        },
        "jinja" => {
            aliases: ["jinja2"],
            globs: ["*.j2", "*.jinja", "*.jinja2"],
            package_name: "@lumis-sh/wasm-jinja"
        },
        "jinja_inline" => {
            aliases: [],
            globs: [],
            package_name: "@lumis-sh/wasm-jinja_inline"
        },
        "json5" => {
            aliases: [],
            globs: ["*.json5"],
            package_name: "@lumis-sh/wasm-json5"
        },
        "just" => {
            aliases: [],
            globs: ["*.just", ".just", ".justfile", ".JUSTFILE", ".Justfile", "justfile", "JUSTFILE", "Justfile"],
            package_name: "@lumis-sh/wasm-just"
        },
        "matlab" => {
            aliases: [],
            globs: ["*.m"],
            package_name: "@lumis-sh/wasm-matlab"
        },
        "mermaid" => {
            aliases: [],
            globs: ["*.mmd", "*.mermaid"],
            package_name: "@lumis-sh/wasm-mermaid"
        },
        "nginx" => {
            aliases: [],
            globs: ["*.nginx", "nginx.conf"],
            package_name: "@lumis-sh/wasm-nginx"
        },
        "prisma" => {
            aliases: [],
            globs: ["*.prisma"],
            package_name: "@lumis-sh/wasm-prisma"
        },
        "qmljs" => {
            aliases: ["qml"],
            globs: ["*.qml", "*.qmljs", "*.qmltypes"],
            package_name: "@lumis-sh/wasm-qmljs"
        },
        "racket" => {
            aliases: [],
            globs: ["*.rkt", "*.rktd", "*.rktl"],
            package_name: "@lumis-sh/wasm-racket"
        },
        "rst" => {
            aliases: ["restructuredtext"],
            globs: ["*.rst"],
            package_name: "@lumis-sh/wasm-rst"
        },
        "scheme" => {
            aliases: [],
            globs: ["*.scm", "*.sld", "*.ss"],
            package_name: "@lumis-sh/wasm-scheme"
        },
        "solidity" => {
            aliases: [],
            globs: ["*.sol"],
            package_name: "@lumis-sh/wasm-solidity"
        },
        "systemverilog" => {
            aliases: [],
            globs: ["*.sv", "*.svh"],
            package_name: "@lumis-sh/wasm-systemverilog"
        },
        "tcl" => {
            aliases: [],
            globs: ["*.itcl", "*.tcl", "*.tk"],
            package_name: "@lumis-sh/wasm-tcl"
        },
        "vhdl" => {
            aliases: [],
            globs: ["*.vhd", "*.vhdl"],
            package_name: "@lumis-sh/wasm-vhdl"
        },
    },
    bundles: {
        "backend" => ["csharp", "elixir", "erlang", "go", "java", "javadoc", "javascript", "kotlin", "php", "protobuf", "python", "ruby", "rust", "scala", "sql", "typescript"],
        "full" => ["angular", "asm", "astro", "bash", "c", "caddy", "clojure", "cmake", "comment", "commonlisp", "cpp", "csharp", "css", "csv", "dart", "diff", "dockerfile", "eex", "ejs", "elixir", "elm", "erb", "erlang", "fish", "fsharp", "gleam", "glimmer", "go", "graphql", "haskell", "hcl", "heex", "html", "http", "iex", "ini", "java", "javascript", "json", "julia", "kotlin", "latex", "liquid", "llvm", "lua", "make", "markdown", "markdown_inline", "mdx", "nix", "nushell", "objc", "ocaml", "ocaml_interface", "perl", "php", "powershell", "protobuf", "python", "r", "regex", "ruby", "rust", "scala", "scss", "sql", "surface", "svelte", "swift", "toml", "tsx", "typescript", "typst", "vim", "vue", "wat", "xml", "yaml", "zig", "arduino", "bicep", "dot", "editorconfig", "gitattributes", "javadoc", "jq", "kdl", "luadoc", "nim", "pascal", "puppet", "terraform", "toon", "wgsl", "zsh", "d", "fortran", "gitignore", "glsl", "jinja", "jinja_inline", "json5", "just", "matlab", "mermaid", "nginx", "prisma", "qmljs", "racket", "rst", "scheme", "solidity", "systemverilog", "tcl", "vhdl"],
        "system" => ["asm", "bash", "c", "cmake", "cpp", "go", "llvm", "make", "rust", "wat", "zig", "zsh"],
        "web" => ["css", "html", "javascript", "json", "tsx", "typescript"],
        "web-extra" => ["angular", "astro", "dart", "eex", "ejs", "elm", "erb", "glimmer", "graphql", "heex", "markdown", "markdown_inline", "mdx", "php", "prisma", "scss", "surface", "svelte", "vue", "xml"],
    },
}
