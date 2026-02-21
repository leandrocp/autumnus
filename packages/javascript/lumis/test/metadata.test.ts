import { describe, it, expect } from 'vitest'
import { availableLanguages, availableThemes } from '../src/index.js'

describe('availableLanguages', () => {
  it('returns a non-empty array', () => {
    const langs = availableLanguages()
    expect(langs.length).toBeGreaterThan(0)
  })

  it('includes known languages', () => {
    const langs = availableLanguages()
    const ids = langs.map((l) => l.id)
    expect(ids).toContain('javascript')
    expect(ids).toContain('rust')
    expect(ids).toContain('python')
    expect(ids).toContain('json')
    expect(ids).toContain('plaintext')
  })

  it('has correct shape', () => {
    const js = availableLanguages().find((l) => l.id === 'javascript')!
    expect(js.name).toBe('JavaScript')
    expect(js.aliases).toContain('js')
    expect(js.extensions).toContain('*.js')
    expect(js.globs).toContain('*.js')
  })

  it('plaintext has correct metadata', () => {
    const pt = availableLanguages().find((l) => l.id === 'plaintext')!
    expect(pt.name).toBe('Plain Text')
    expect(pt.aliases).toContain('text')
    expect(pt.aliases).toContain('txt')
    expect(pt.extensions).toEqual([])
    expect(pt.emacsModes).toContain('text')
  })

  it('includes filename globs beyond extensions', () => {
    const bash = availableLanguages().find((l) => l.id === 'bash')!
    expect(bash.globs).toContain('.bashrc')

    const dockerfile = availableLanguages().find((l) => l.id === 'dockerfile')!
    expect(dockerfile.globs).toContain('Dockerfile')
  })
})


describe('availableThemes', () => {
  it('returns a non-empty array', () => {
    const themes = availableThemes()
    expect(themes.length).toBeGreaterThan(0)
  })

  it('includes known themes', () => {
    const themes = availableThemes()
    const names = themes.map((t) => t.name)
    expect(names).toContain('dracula')
    expect(names).toContain('github_light')
    expect(names).toContain('catppuccin_mocha')
  })

  it('has correct appearance values', () => {
    const themes = availableThemes()
    const dracula = themes.find((t) => t.name === 'dracula')!
    expect(dracula.appearance).toBe('dark')

    const githubLight = themes.find((t) => t.name === 'github_light')!
    expect(githubLight.appearance).toBe('light')
  })

  it('all themes have valid appearance', () => {
    for (const theme of availableThemes()) {
      expect(['light', 'dark']).toContain(theme.appearance)
    }
  })
})
