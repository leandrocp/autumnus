import rehypeLumis from '@lumis-sh/rehype-lumis'
import { htmlInline } from '@lumis-sh/lumis/formatters'
import { bundledLanguages } from '@lumis-sh/lumis/bundles/web'
import githubLight from '@lumis-sh/themes/github_light'

export default function configuredRehypeLumis() {
  return rehypeLumis.call(this, {
    formatter: (language) => htmlInline({ language, theme: githubLight }),
    languages: [bundledLanguages],
  })
}
