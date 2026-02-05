package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/tetratelabs/wazero"
	"github.com/tetratelabs/wazero/api"
	"github.com/tetratelabs/wazero/imports/wasi_snapshot_preview1"
)

type Module struct {
	module       api.Module
	alloc        api.Function
	dealloc      api.Function
	highlight    api.Function
	getResultPtr api.Function
	getResultLen api.Function
}

func loadModule(ctx context.Context, runtime wazero.Runtime, name string) (*Module, error) {
	dir, _ := os.Getwd()
	wasmPath := filepath.Join(dir, fmt.Sprintf("../../build/lumis-lang-%s.wasm", name))

	wasmBytes, err := os.ReadFile(wasmPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read WASM: %v", err)
	}

	compiled, err := runtime.CompileModule(ctx, wasmBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to compile module: %v", err)
	}

	mod, err := runtime.InstantiateModule(ctx, compiled, wazero.NewModuleConfig().WithName(name))
	if err != nil {
		return nil, fmt.Errorf("failed to instantiate module: %v", err)
	}

	return &Module{
		module:       mod,
		alloc:        mod.ExportedFunction("alloc"),
		dealloc:      mod.ExportedFunction("dealloc"),
		highlight:    mod.ExportedFunction("highlight"),
		getResultPtr: mod.ExportedFunction("get_result_ptr"),
		getResultLen: mod.ExportedFunction("get_result_len"),
	}, nil
}

func highlightCode(ctx context.Context, m *Module, code, lang, themeJSON string) string {
	codePtr, codeLen := writeString(ctx, m.module, m.alloc, code)
	langPtr, langLen := writeString(ctx, m.module, m.alloc, lang)
	themePtr, themeLen := writeString(ctx, m.module, m.alloc, themeJSON)

	results, err := m.highlight.Call(ctx, codePtr, codeLen, langPtr, langLen, themePtr, themeLen)
	if err != nil {
		return fmt.Sprintf("Error: %v", err)
	}

	var result string
	if results[0] == 0 {
		ptrResults, _ := m.getResultPtr.Call(ctx)
		lenResults, _ := m.getResultLen.Call(ctx)
		result = readString(m.module, uint32(ptrResults[0]), uint32(lenResults[0]))
	} else {
		ptrResults, _ := m.getResultPtr.Call(ctx)
		lenResults, _ := m.getResultLen.Call(ctx)
		result = fmt.Sprintf("Error: %s", readString(m.module, uint32(ptrResults[0]), uint32(lenResults[0])))
	}

	m.dealloc.Call(ctx, codePtr, codeLen)
	m.dealloc.Call(ctx, langPtr, langLen)
	m.dealloc.Call(ctx, themePtr, themeLen)

	return result
}

func main() {
	ctx := context.Background()

	dir, _ := os.Getwd()
	themePath := filepath.Join(dir, "../../themes/tokyonight_night.json")

	themeBytes, err := os.ReadFile(themePath)
	if err != nil {
		log.Fatalf("Failed to read theme: %v", err)
	}
	themeJSON := string(themeBytes)

	runtime := wazero.NewRuntime(ctx)
	defer runtime.Close(ctx)

	wasi_snapshot_preview1.MustInstantiate(ctx, runtime)

	htmlCode := `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Hello</title>
</head>
<body>
  <h1 class="title">Hello, World!</h1>
</body>
</html>`

	cssCode := `.title {
  color: #333;
  font-size: 24px;
}

@media (max-width: 768px) {
  .title {
    font-size: 18px;
  }
}`

	fmt.Println("=== Lumis WASM POC - Go Host ===")

	htmlModule, err := loadModule(ctx, runtime, "html")
	if err != nil {
		log.Fatalf("Failed to load HTML module: %v", err)
	}

	cssModule, err := loadModule(ctx, runtime, "css")
	if err != nil {
		log.Fatalf("Failed to load CSS module: %v", err)
	}

	bundleModule, err := loadModule(ctx, runtime, "bundle-web")
	if err != nil {
		log.Fatalf("Failed to load bundle module: %v", err)
	}

	htmlFromHtmlModule := highlightCode(ctx, htmlModule, htmlCode, "html", themeJSON)
	cssFromCssModule := highlightCode(ctx, cssModule, cssCode, "css", themeJSON)
	htmlFromBundle := highlightCode(ctx, bundleModule, htmlCode, "html", themeJSON)
	cssFromBundle := highlightCode(ctx, bundleModule, cssCode, "css", themeJSON)

	outputHTML := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lumis WASM POC - Go</title>
  <style>
    body { font-family: system-ui; background: #1a1b26; color: #c0caf5; padding: 2rem; }
    h1 { color: #7aa2f7; }
    h2 { color: #bb9af7; margin-top: 2rem; }
    h3 { color: #7dcfff; }
    .section { margin: 1rem 0; padding: 1rem; background: #24283b; border-radius: 8px; }
    pre { margin: 0; }
    code { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <h1>Lumis WASM POC - Go Host</h1>

  <h2>Individual Modules</h2>

  <h3>lumis-lang-html.wasm</h3>
  <div class="section">
    %s
  </div>

  <h3>lumis-lang-css.wasm</h3>
  <div class="section">
    %s
  </div>

  <h2>Bundle Module (lumis-lang-bundle-web.wasm)</h2>

  <h3>HTML</h3>
  <div class="section">
    %s
  </div>

  <h3>CSS</h3>
  <div class="section">
    %s
  </div>
</body>
</html>`, htmlFromHtmlModule, cssFromCssModule, htmlFromBundle, cssFromBundle)

	err = os.WriteFile(filepath.Join(dir, "output.html"), []byte(outputHTML), 0644)
	if err != nil {
		log.Fatalf("Failed to write output.html: %v", err)
	}

	fmt.Println("Written: output.html")
	fmt.Println("=== Done ===")
}

func writeString(ctx context.Context, mod api.Module, alloc api.Function, s string) (uint64, uint64) {
	bytes := []byte(s)
	length := uint64(len(bytes))

	results, err := alloc.Call(ctx, length)
	if err != nil {
		log.Fatalf("Alloc failed: %v", err)
	}
	ptr := results[0]

	mod.Memory().Write(uint32(ptr), bytes)

	return ptr, length
}

func readString(mod api.Module, ptr, length uint32) string {
	bytes, _ := mod.Memory().Read(ptr, length)
	return string(bytes)
}
