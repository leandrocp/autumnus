import { describe, expect, it } from "vitest";
import {
  hexToRgb,
  rgbToAnsi,
  styleToAnsi,
  wrapWithAnsi,
} from "../src/formatter/ansi.js";

describe("formatter ansi helpers", () => {
  it("parses full hex colors", () => {
    expect(hexToRgb("#123456")).toEqual([0x12, 0x34, 0x56]);
    expect(hexToRgb("abcdef")).toEqual([0xab, 0xcd, 0xef]);
  });

  it("rejects invalid hex colors", () => {
    expect(hexToRgb("#123")).toBeUndefined();
    expect(hexToRgb("#zzzzzz")).toBeUndefined();
  });

  it("creates foreground and background ANSI codes", () => {
    expect(rgbToAnsi(17, 34, 51, false)).toBe("\u001b[38;2;17;34;51m");
    expect(rgbToAnsi(17, 34, 51, true)).toBe("\u001b[48;2;17;34;51m");
  });

  it("supports extended underline modes", () => {
    expect(styleToAnsi({ underline: "wavy" })).toBe("\u001b[4:3m");
    expect(styleToAnsi({ underline: "double" })).toBe("\u001b[4:2m");
  });

  it("combines color and font styles into ANSI output", () => {
    const ansi = styleToAnsi({
      fg: "#ffffff",
      bg: "#000000",
      bold: true,
      italic: true,
      strikethrough: true,
    });

    expect(ansi).toContain("\u001b[38;2;255;255;255m");
    expect(ansi).toContain("\u001b[48;2;0;0;0m");
    expect(ansi).toContain("\u001b[1m");
    expect(ansi).toContain("\u001b[3m");
    expect(ansi).toContain("\u001b[9m");
  });

  it("preserves background styling across lines and resets safely", () => {
    const output = wrapWithAnsi("a\nb", {
      fg: "#ffffff",
      bg: "#000000",
    });

    expect(output).toContain("\u001b[0m\u001b[38;2;255;255;255m\u001b[48;2;0;0;0ma");
    expect(output).toContain("\u001b[0m\n\u001b[38;2;255;255;255m\u001b[48;2;0;0;0mb");
    expect(output.endsWith("\u001b[0m")).toBe(true);
  });

  it("returns unmodified text when no style is present", () => {
    expect(wrapWithAnsi("plain", undefined)).toBe("plain");
  });
});
