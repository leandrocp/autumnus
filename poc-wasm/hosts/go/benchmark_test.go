package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/tetratelabs/wazero"
	"github.com/tetratelabs/wazero/imports/wasi_snapshot_preview1"
)

const (
	warmupRuns    = 3
	benchmarkRuns = 10
)

func benchLoadModule(ctx context.Context, runtime wazero.Runtime, name string) error {
	dir, _ := os.Getwd()
	wasmPath := filepath.Join(dir, fmt.Sprintf("../../build/lumis-lang-%s.wasm", name))

	wasmBytes, err := os.ReadFile(wasmPath)
	if err != nil {
		return err
	}

	compiled, err := runtime.CompileModule(ctx, wasmBytes)
	if err != nil {
		return err
	}

	_, err = runtime.InstantiateModule(ctx, compiled, wazero.NewModuleConfig().WithName(name))
	return err
}

func runOnce(ctx context.Context, name string) error {
	runtime := wazero.NewRuntime(ctx)
	defer runtime.Close(ctx)
	wasi_snapshot_preview1.MustInstantiate(ctx, runtime)
	return benchLoadModule(ctx, runtime, name)
}

func benchmarkLoad(ctx context.Context, name string) (float64, error) {
	// Warmup
	for i := 0; i < warmupRuns; i++ {
		if err := runOnce(ctx, name); err != nil {
			return 0, err
		}
	}

	// Measured runs
	var total time.Duration
	for i := 0; i < benchmarkRuns; i++ {
		start := time.Now()
		if err := runOnce(ctx, name); err != nil {
			return 0, err
		}
		total += time.Since(start)
	}

	meanMs := float64(total.Nanoseconds()) / float64(benchmarkRuns) / 1_000_000.0
	return meanMs, nil
}

func TestBenchmark(t *testing.T) {
	ctx := context.Background()

	fmt.Println("=== Lumis WASM Benchmark - Go ===")
	fmt.Println()
	fmt.Printf("Warmup: %d, Runs: %d\n\n", warmupRuns, benchmarkRuns)

	languages := []string{
		"html", "css", "javascript", "typescript", "json",
		"rust", "go", "c",
		"python", "ruby", "bash", "lua",
	}

	bundles := []string{
		"bundle-web",
		"bundle-system",
		"bundle-scripting",
	}

	fmt.Println("--- Individual Languages ---")
	fmt.Println("| Language   | Mean (ms) |")
	fmt.Println("|------------|-----------|")

	for _, lang := range languages {
		mean, err := benchmarkLoad(ctx, lang)
		if err != nil {
			t.Fatalf("failed to benchmark %s: %v", lang, err)
		}
		fmt.Printf("| %-10s | %9.2f |\n", lang, mean)
	}

	fmt.Println()
	fmt.Println("--- Bundles ---")
	fmt.Println("| Bundle           | Mean (ms) |")
	fmt.Println("|------------------|-----------|")

	for _, bundle := range bundles {
		mean, err := benchmarkLoad(ctx, bundle)
		if err != nil {
			t.Fatalf("failed to benchmark %s: %v", bundle, err)
		}
		fmt.Printf("| %-16s | %9.2f |\n", bundle, mean)
	}
}
