import rehypeLumis from "@lumis-sh/rehype-lumis";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import javascript from "@lumis-sh/wasm-javascript";
import rust from "@lumis-sh/wasm-rust";
import githubLight from "@lumis-sh/themes/github_light";

function configuredRehypeLumis() {
  return rehypeLumis.call(this, {
    formatter: (language) => htmlInline({ language, theme: githubLight }),
    languages: [javascript, rust],
  });
}

export default {
  title: "Docusaurus + Lumis",
  url: "https://example.com",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "lumis",
  projectName: "docusaurus-example",
  onBrokenLinks: "warn",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          rehypePlugins: [configuredRehypeLumis],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: "Docusaurus + Lumis",
      items: [
        { type: "docSidebar", sidebarId: "tutorialSidebar", position: "left", label: "Docs" },
      ],
    },
  },
};
