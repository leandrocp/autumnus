import { beforeAll, describe, expect, it } from "vitest";
import dracula from "../../themes/dist/json/dracula.json";
import json from "../langs/json.ts";
import {
  ANSI_RESET,
  hexToRgb,
  highlightIterWithAnsi,
  paint,
  rgbToAnsi,
  styleToAnsi,
  wrapWithAnsi,
} from "../src/formatter/ansi.js";
import type { Theme } from "../src/types.js";
import { configureLocalWasmResolver } from "./wasm.js";

const theme: Theme = dracula;

describe("formatter ansi helpers", () => {
  beforeAll(() => {
    configureLocalWasmResolver(["diff", "json"]);
  }, 120_000);

  it("exports the ANSI reset sequence", () => {
    expect(ANSI_RESET).toBe("\u001B[0m");
  });

  it("parses full hex colors", () => {
    expect(hexToRgb("#123456")).toEqual([0x12, 0x34, 0x56]);
    expect(hexToRgb("abcdef")).toEqual([0xab, 0xcd, 0xef]);
  });

  it("rejects invalid hex colors", () => {
    expect(hexToRgb("#123")).toBeUndefined();
    expect(hexToRgb("#zzzzzz")).toBeUndefined();
  });

  it("creates foreground and background ANSI codes", () => {
    expect(rgbToAnsi(17, 34, 51, false)).toBe("\u001B[38;2;17;34;51m");
    expect(rgbToAnsi(17, 34, 51, true)).toBe("\u001B[48;2;17;34;51m");
  });

  it("supports extended underline modes", () => {
    expect(styleToAnsi({ underline: "wavy" })).toBe("\u001B[4:3m");
    expect(styleToAnsi({ underline: "double" })).toBe("\u001B[4:2m");
  });

  it("combines color and font styles into ANSI output", () => {
    const ansi = styleToAnsi({
      fg: "#ffffff",
      bg: "#000000",
      bold: true,
      italic: true,
      strikethrough: true,
    });

    expect(ansi).toContain("\u001B[38;2;255;255;255m");
    expect(ansi).toContain("\u001B[48;2;0;0;0m");
    expect(ansi).toContain("\u001B[1m");
    expect(ansi).toContain("\u001B[3m");
    expect(ansi).toContain("\u001B[9m");
  });

  it("preserves background styling across lines and resets safely", () => {
    const output = paint("a\nb", {
      fg: "#ffffff",
      bg: "#000000",
    });

    expect(output).toContain("\u001B[0m\u001B[38;2;255;255;255m\u001B[48;2;0;0;0ma");
    expect(output).toContain("\u001B[0m\n\u001B[38;2;255;255;255m\u001B[48;2;0;0;0mb");
    expect(output.endsWith("\u001B[0m")).toBe(true);
  });

  it("returns unmodified text when no style is present", () => {
    expect(paint("plain")).toBe("plain");
  });

  it("keeps wrapWithAnsi as an alias for paint", () => {
    // oxlint-disable-next-line typescript/no-deprecated -- the point of the test is that the deprecated name still works.
    expect(wrapWithAnsi("plain")).toBe(paint("plain"));
    // oxlint-disable-next-line typescript/no-deprecated -- the point of the test is that the deprecated name still works.
    expect(wrapWithAnsi("fn", { fg: "#8be9fd" })).toBe(paint("fn", { fg: "#8be9fd" }));
  });

  it("collects ANSI wrapped segments from highlight iteration", async () => {
    // oxlint-disable-next-line typescript/no-deprecated -- the point of the test is that the deprecated name still works.
    const segments = await highlightIterWithAnsi('{"x":1}', json, theme);

    expect(segments.length).toBeGreaterThan(0);
    expect(segments.some(([text]) => text.includes("\u001B["))).toBe(true);
    expect(segments.map(([text]) => text.replaceAll("\u001B[0m", "")).join("")).toContain('"x"');
  }, 30_000);
});
