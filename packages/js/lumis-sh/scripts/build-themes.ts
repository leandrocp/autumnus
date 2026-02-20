/**
 * Generates one TypeScript module per theme JSON file.
 * Each module re-exports the theme JSON as a typed default export.
 */

import fs from 'node:fs'
import path from 'node:path'

const THEMES_SRC = path.resolve(import.meta.dirname, '../../../../crates/lumis/themes')
const OUT_DIR = path.resolve(import.meta.dirname, '../themes')

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const files = fs.readdirSync(THEMES_SRC).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    const name = path.basename(file, '.json')
    const json = fs.readFileSync(path.join(THEMES_SRC, file), 'utf-8')
    const data = JSON.parse(json)

    // Validate it has the expected shape
    if (!data.name || !data.highlights) {
      console.warn(`  skipping ${file}: missing name or highlights`)
      continue
    }

    // Normalize underline/undercurl values to match StyleEntry type
    for (const entry of Object.values(data.highlights as Record<string, any>)) {
      if (entry.underline === true) {
        entry.underline = 'solid'
      }
      if (entry.undercurl) {
        entry.underline = 'undercurl'
        delete entry.undercurl
      }
    }

    const module = `import type { ThemeData } from '../src/types.js'

const theme: ThemeData = ${JSON.stringify(data)}

export default theme
`

    fs.writeFileSync(path.join(OUT_DIR, `${name}.ts`), module)
  }

  console.log(`  ${files.length} themes generated in themes/`)
}

main()
