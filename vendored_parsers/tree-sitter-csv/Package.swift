// swift-tools-version: 5.6
import PackageDescription

let package = Package(
    name: "TreeSitterCSV",
    platforms: [.macOS(.v10_13), .iOS(.v11)],
    products: [.library(name: "TreeSitterCSV", targets: ["TreeSitterCSV"])],
    targets: [
        .target(
            name: "TreeSitterCSV",
            path: ".",
            exclude: [
            ],
            sources: [
                "csv/src/parser.c",
                "tsv/src/parser.c",
            ],
            resources: [
                .copy("csv/queries")
                .copy("tsv/queries"),
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("csv/src")]
        ),
    ]
)
