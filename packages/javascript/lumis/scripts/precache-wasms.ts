import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join, parse } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

type WasmRef = {
  packageName: string
  name: string
  version: string
}

type Language = {
  id: string
  wasm?: WasmRef
}

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const langsDir = join(packageRoot, 'langs')
const npmCacheDir = execFileSync('npm', ['config', 'get', 'cache'], {
  cwd: packageRoot,
  encoding: 'utf8',
}).trim()
const filterArg = process.argv[2]?.trim()
const filter = filterArg ? new RegExp(filterArg) : null

async function loadLanguages(): Promise<Language[]> {
  const ids = readdirSync(langsDir)
    .filter((entry) => entry.endsWith('.ts'))
    .map((entry) => parse(entry).name)
    .sort((a, b) => a.localeCompare(b))

  const languages = await Promise.all(
    ids.map(async (id) => {
      const mod = await import(pathToFileURL(join(langsDir, `${id}.ts`)).href)
      return mod.default as Language
    }),
  )

  return filter ? languages.filter((language) => filter.test(language.id)) : languages
}

function uniqueWasmPackages(languages: Language[]): string[] {
  return [...new Set(languages.flatMap((language) => {
    if (!language.wasm) return []
    return [`${language.wasm.packageName}@${language.wasm.version}`]
  }))].sort((a, b) => a.localeCompare(b))
}

const languages = await loadLanguages()
const packages = uniqueWasmPackages(languages)

for (const pkg of packages) {
  console.log(`Caching ${pkg}`)
  execFileSync('npm', ['cache', 'add', pkg, '--cache', npmCacheDir], {
    cwd: packageRoot,
    stdio: 'inherit',
  })
}

console.log(`Cached ${packages.length} WASM packages`)
