import { themes as prismThemes } from "prism-react-renderer";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Claude Profiles",
  tagline: "How to actually understand your agent harness.",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://aliparoya.github.io",
  baseUrl: "/claude-profiles/",

  organizationName: "aliparoya",
  projectName: "claude-profiles",

  onBrokenLinks: "throw",

  markdown: {
    mermaid: true,
    format: "detect",
  },

  themes: ["@docusaurus/theme-mermaid"],

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // MUI X Premium components require a license key. Set MUI_X_LICENSE_KEY in
  // the environment if you use them. Demos work without it but render a watermark.
  customFields: {
    muiXLicenseKey: process.env.MUI_X_LICENSE_KEY ?? "",
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
      type: "text/css",
      integrity: "sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+",
      crossorigin: "anonymous",
    },
  ],

  plugins: [
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 85,
        max: 1600,
        min: 640,
        steps: 3,
        disableInDev: false,
      },
    ],
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [],
      },
    ],
    [
      "docusaurus-plugin-image-zoom",
      {
        selector: ".markdown :not(em) > img",
        config: {
          margin: 24,
          background: {
            light: "rgb(255, 255, 255)",
            dark: "rgb(50, 50, 50)",
          },
          scrollOffset: 40,
        },
      },
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Claude Profiles",
      logo: {
        alt: "Claude Profiles logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Docs",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/aliparoya/claude-profiles",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/aliparoya/claude-profiles",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ali Tanveer.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {
      theme: { light: "neutral", dark: "dark" },
    },
    zoom: {
      selector: ".markdown :not(em) > img",
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
