import { closest } from "../../dist/themes.js";
import cases from "../../../../../fixtures/theme-choice-cases.json";

const output = document.querySelector("#output");
if (!output) throw new Error("missing output element");
output.textContent = JSON.stringify(cases.map((fixture) => closest(fixture)?.name ?? null));
