import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
  worker: {
    format: "es",
  },
  server: {
    host: "0.0.0.0",
    port: 4321,
  },
});
