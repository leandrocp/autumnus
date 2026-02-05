package dev.lumis;

import com.dylibso.chicory.runtime.Instance;
import com.dylibso.chicory.runtime.Memory;
import com.dylibso.chicory.runtime.Store;
import com.dylibso.chicory.runtime.ExportFunction;
import com.dylibso.chicory.wasi.WasiOptions;
import com.dylibso.chicory.wasi.WasiPreview1;
import com.dylibso.chicory.wasm.Parser;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {

    static class Module {
        final Instance instance;
        final Memory memory;
        final ExportFunction alloc;
        final ExportFunction dealloc;
        final ExportFunction highlight;
        final ExportFunction getResultPtr;
        final ExportFunction getResultLen;

        Module(Instance instance) {
            this.instance = instance;
            this.memory = instance.memory();
            this.alloc = instance.export("alloc");
            this.dealloc = instance.export("dealloc");
            this.highlight = instance.export("highlight");
            this.getResultPtr = instance.export("get_result_ptr");
            this.getResultLen = instance.export("get_result_len");
        }
    }

    static Module loadModule(String name) throws Exception {
        String baseDir = System.getProperty("user.dir");
        Path wasmPath = Path.of(baseDir, "../../build/lumis-lang-" + name + ".wasm");

        var wasiOptions = WasiOptions.builder().build();
        var wasi = WasiPreview1.builder().withOptions(wasiOptions).build();

        var module = Parser.parse(wasmPath.toFile());

        var store = new Store().addFunction(wasi.toHostFunctions());
        var instance = store.instantiate(name, module);

        return new Module(instance);
    }

    static String highlightCode(Module m, String code, String lang, String themeJson) {
        long[] codeAlloc = writeString(m.memory, m.alloc, code);
        long[] langAlloc = writeString(m.memory, m.alloc, lang);
        long[] themeAlloc = writeString(m.memory, m.alloc, themeJson);

        long[] result = m.highlight.apply(
            codeAlloc[0], codeAlloc[1],
            langAlloc[0], langAlloc[1],
            themeAlloc[0], themeAlloc[1]
        );

        String output;
        if (result[0] == 0) {
            long[] ptrResult = m.getResultPtr.apply();
            long[] lenResult = m.getResultLen.apply();
            output = readString(m.memory, (int) ptrResult[0], (int) lenResult[0]);
        } else {
            long[] ptrResult = m.getResultPtr.apply();
            long[] lenResult = m.getResultLen.apply();
            output = "Error: " + readString(m.memory, (int) ptrResult[0], (int) lenResult[0]);
        }

        m.dealloc.apply(codeAlloc[0], codeAlloc[1]);
        m.dealloc.apply(langAlloc[0], langAlloc[1]);
        m.dealloc.apply(themeAlloc[0], themeAlloc[1]);

        return output;
    }

    public static void main(String[] args) throws Exception {
        String baseDir = System.getProperty("user.dir");
        Path themePath = Path.of(baseDir, "../../themes/tokyonight_night.json");
        String themeJson = Files.readString(themePath);

        String htmlCode = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <title>Hello</title>
            </head>
            <body>
              <h1 class="title">Hello, World!</h1>
            </body>
            </html>""";

        String cssCode = """
            .title {
              color: #333;
              font-size: 24px;
            }

            @media (max-width: 768px) {
              .title {
                font-size: 18px;
              }
            }""";

        System.out.println("=== Lumis WASM POC - Java Host ===");

        Module htmlModule = loadModule("html");
        Module cssModule = loadModule("css");
        Module bundleModule = loadModule("bundle-web");

        String htmlFromHtmlModule = highlightCode(htmlModule, htmlCode, "html", themeJson);
        String cssFromCssModule = highlightCode(cssModule, cssCode, "css", themeJson);
        String htmlFromBundle = highlightCode(bundleModule, htmlCode, "html", themeJson);
        String cssFromBundle = highlightCode(bundleModule, cssCode, "css", themeJson);

        String outputHtml = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Lumis WASM POC - Java</title>
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
              <h1>Lumis WASM POC - Java Host</h1>

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
            </html>""".formatted(htmlFromHtmlModule, cssFromCssModule, htmlFromBundle, cssFromBundle);

        Files.writeString(Path.of(baseDir, "output.html"), outputHtml);
        System.out.println("Written: output.html");
        System.out.println("=== Done ===");
    }

    private static long[] writeString(Memory memory, ExportFunction alloc, String s) {
        byte[] bytes = s.getBytes(StandardCharsets.UTF_8);
        int len = bytes.length;

        long[] ptrResult = alloc.apply(len);
        int ptr = (int) ptrResult[0];

        memory.write(ptr, bytes);

        return new long[] { ptr, len };
    }

    private static String readString(Memory memory, int ptr, int len) {
        byte[] bytes = memory.readBytes(ptr, len);
        return new String(bytes, StandardCharsets.UTF_8);
    }
}
