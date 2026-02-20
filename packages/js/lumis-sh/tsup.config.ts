import { defineConfig } from 'tsup'
import fs from 'node:fs'
import path from 'node:path'

// Dynamically discover generated theme modules
const themesDir = path.resolve(import.meta.dirname, 'themes')
const themeEntries: Record<string, string> = {}
if (fs.existsSync(themesDir)) {
  for (const file of fs.readdirSync(themesDir)) {
    if (file.endsWith('.ts')) {
      const name = path.basename(file, '.ts')
      themeEntries[`themes/${name}`] = `themes/${file}`
    }
  }
}

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'langs/javascript': 'langs/javascript.ts',
    'langs/rust': 'langs/rust.ts',
    'langs/json': 'langs/json.ts',
    ...themeEntries,
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  clean: true,
  treeshake: true,
  onSuccess: async () => {
    // Copy wasm/ into dist/wasm/ so relative paths from dist/langs/*.js resolve correctly
    const src = path.resolve(import.meta.dirname, 'wasm')
    const dst = path.resolve(import.meta.dirname, 'dist', 'wasm')
    fs.mkdirSync(dst, { recursive: true })
    for (const file of fs.readdirSync(src)) {
      if (file.endsWith('.wasm')) {
        fs.copyFileSync(path.join(src, file), path.join(dst, file))
      }
    }
  },
})
