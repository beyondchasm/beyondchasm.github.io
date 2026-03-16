import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import type { FileNode } from "./quartz/components/ExplorerNode"

const stripNumericPrefix = (name: string) => name.replace(/^\s*\d+\.\s*/, "")

// Controls folder order + display in the Explorer without ugly "1." prefixes.
// Customize this list to your preferred top-level ordering.
const explorerFolderOrder = ["projects", "blog"]

const explorerOptions = {
  mapFn: (node: FileNode) => {
    if (!node.file) {
      node.displayName = stripNumericPrefix(node.displayName)
    }
  },
  sortFn: (a: FileNode, b: FileNode) => {
    // folders first
    if ((!a.file && !b.file) || (a.file && b.file)) {
      // continue
    } else if (a.file && !b.file) {
      return 1
    } else {
      return -1
    }

    const aIsTopFolder = !a.file && a.depth === 1
    const bIsTopFolder = !b.file && b.depth === 1
    if (aIsTopFolder && bIsTopFolder) {
      const aName = stripNumericPrefix(a.displayName)
      const bName = stripNumericPrefix(b.displayName)
      const aIdx = explorerFolderOrder.indexOf(aName)
      const bIdx = explorerFolderOrder.indexOf(bName)
      if (aIdx !== -1 || bIdx !== -1) {
        return (
          (aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx) -
          (bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx)
        )
      }
    }

    return stripNumericPrefix(a.displayName).localeCompare(
      stripNumericPrefix(b.displayName),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      },
    )
  },
} as const

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: "giscus",
      options: {
        // data-repo
        repo: "beyondchasm/omoolgae-blog",
        // data-repo-id
        repoId: "R_kgDON5SDfQ",
        // data-category
        category: "Announcements",
        // data-category-id
        categoryId: "DIC_kwDON5SDfc4Cm9Gy",
        mapping: "pathname",
        // Use built-in themes to avoid CORS/theme-url issues.
        themeUrl: "https://giscus.app/themes",
        lightTheme: "light",
        darkTheme: "dark",
      },
    }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/beyondchasm",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.SidebarHeader(),
    Component.Explorer(explorerOptions),
    // Component.Hits(),
  ],
  right: [
    // Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [Component.SidebarHeader(), Component.Explorer(explorerOptions)],
  right: [],
}
