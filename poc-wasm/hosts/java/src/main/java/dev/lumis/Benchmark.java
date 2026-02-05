package dev.lumis;

import com.dylibso.chicory.runtime.Store;
import com.dylibso.chicory.wasi.WasiOptions;
import com.dylibso.chicory.wasi.WasiPreview1;
import com.dylibso.chicory.wasm.Parser;

import java.nio.file.Path;

public class Benchmark {
    private static final int WARMUP_RUNS = 3;
    private static final int BENCHMARK_RUNS = 10;

    private final String baseDir;

    public Benchmark() {
        this.baseDir = System.getProperty("user.dir");
    }

    private void loadModule(String name) throws Exception {
        Path wasmPath = Path.of(baseDir, "../../build/lumis-lang-" + name + ".wasm");

        var wasiOptions = WasiOptions.builder().build();
        var wasi = WasiPreview1.builder().withOptions(wasiOptions).build();

        var module = Parser.parse(wasmPath.toFile());

        var store = new Store().addFunction(wasi.toHostFunctions());
        store.instantiate(name, module);
    }

    private double benchmarkLoad(String name) throws Exception {
        // Warmup
        for (int i = 0; i < WARMUP_RUNS; i++) {
            loadModule(name);
        }

        // Measured runs
        long total = 0;
        for (int i = 0; i < BENCHMARK_RUNS; i++) {
            long start = System.nanoTime();
            loadModule(name);
            total += System.nanoTime() - start;
        }

        return (double) total / BENCHMARK_RUNS / 1_000_000.0;
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== Lumis WASM Benchmark - Java (Chicory) ===");
        System.out.println();
        System.out.printf("Warmup: %d, Runs: %d%n%n", WARMUP_RUNS, BENCHMARK_RUNS);

        Benchmark bench = new Benchmark();

        String[] languages = {
            "html", "css", "javascript", "typescript", "json",
            "rust", "go", "c",
            "python", "ruby", "bash", "lua"
        };

        String[] bundles = {
            "bundle-web",
            "bundle-system",
            "bundle-scripting"
        };

        System.out.println("--- Individual Languages ---");
        System.out.println("| Language   | Mean (ms) |");
        System.out.println("|------------|-----------|");

        for (String lang : languages) {
            double mean = bench.benchmarkLoad(lang);
            System.out.printf("| %-10s | %9.2f |%n", lang, mean);
        }

        System.out.println();
        System.out.println("--- Bundles ---");
        System.out.println("| Bundle           | Mean (ms) |");
        System.out.println("|------------------|-----------|");

        for (String bundle : bundles) {
            double mean = bench.benchmarkLoad(bundle);
            System.out.printf("| %-16s | %9.2f |%n", bundle, mean);
        }
    }
}
