import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    profileImageDir: "/static/profile/m_base.png",
    pageTitle: "작은물개스튜디오 | 개발, IT, 그리고 뭐라도 만드는 이야기",
    pageTitleSuffix: "",
    keywords: "작은물개스튜디오, 개발, IT, 블로그, 바이브코딩",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-CYYRSYCQRH"

    },
    locale: "ko-KR",
    baseUrl: "littlesealstudio.kr", // ✅ 수정
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    generateSocialImages: true,
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true, // ✅ RSS 비활성화
      }),
      Plugin.CNAME(),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
      Plugin.Robots(),
      Plugin.Ads(),
    ],
  },
}

export default config