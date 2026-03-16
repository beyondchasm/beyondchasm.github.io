import fs from "node:fs/promises"
import path from "node:path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

type Frontmatter = {
  title: string
  date?: string
  tags?: string[]
  draft?: boolean
  type?: "article"
}

function formatYamlFrontmatter(frontmatter: Frontmatter): string {
  const lines: string[] = ["---"]
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      lines.push(`${key}:`)
      for (const item of value) lines.push(`  - ${item}`)
    } else {
      lines.push(`${key}: ${value}`)
    }
  }
  lines.push("---")
  return lines.join("\n")
}

function toKebabSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p)
    return true
  } catch {
    return false
  }
}

async function writeFileSafe(filePath: string, content: string, force: boolean) {
  if (!force && (await pathExists(filePath))) {
    throw new Error(`File already exists: ${filePath}`)
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, "utf8")
}

async function ensureBlogIndex(args: { contentDir: string; articleSlug: string; title: string }) {
  const blogIndexPath = path.join(args.contentDir, "blog", "index.md")
  const startMarker = "<!-- ARTICLES:START -->"
  const endMarker = "<!-- ARTICLES:END -->"

  if (!(await pathExists(blogIndexPath))) {
    const initial = `---\ntitle: Blog\ntags:\n  - blog\n---\n\n# Blog\n\n${startMarker}\n${endMarker}\n`
    await writeFileSafe(blogIndexPath, initial, true)
  }

  const raw = await fs.readFile(blogIndexPath, "utf8")
  if (!raw.includes(startMarker) || !raw.includes(endMarker)) {
    throw new Error(`Missing markers in ${blogIndexPath}`)
  }

  const linkLine = `- [[blog/${args.articleSlug}|${args.title}]]`
  const before = raw.split(startMarker)[0] + startMarker
  const after = raw.split(endMarker)[1] ?? ""
  const middle = raw.split(startMarker)[1]!.split(endMarker)[0]!
  const existingLines = middle
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => l !== startMarker && l !== endMarker)

  const set = new Set(existingLines)
  set.add(linkLine)
  const sorted = [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  const updated = `${before}\n${sorted.join("\n")}\n${endMarker}${after}`
  await fs.writeFile(blogIndexPath, updated, "utf8")
}

async function updateHomeRecentArticles(args: {
  contentDir: string
  articleSlug: string
  title: string
  limit: number
}) {
  const homePath = path.join(args.contentDir, "index.md")
  const startMarker = "<!-- HOME:ARTICLES:START -->"
  const endMarker = "<!-- HOME:ARTICLES:END -->"
  if (!(await pathExists(homePath))) return

  const raw = await fs.readFile(homePath, "utf8")
  if (!raw.includes(startMarker) || !raw.includes(endMarker)) return

  const linkLine = `- [[blog/${args.articleSlug}|${args.title}]]`
  const before = raw.split(startMarker)[0] + startMarker
  const after = raw.split(endMarker)[1] ?? ""
  const middle = raw.split(startMarker)[1]!.split(endMarker)[0]!

  const existingLines = middle
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => l !== startMarker && l !== endMarker)
    .filter((l) => l !== linkLine)

  const updatedLines = [linkLine, ...existingLines].slice(0, args.limit)
  const updated = `${before}\n${updatedLines.join("\n")}\n${endMarker}${after}`
  await fs.writeFile(homePath, updated, "utf8")
}

function articleTemplate(args: {
  title: string
  date: string
  tags: string[]
  draft: boolean
}): string {
  const fm: Frontmatter = {
    type: "article",
    title: args.title,
    date: args.date,
    tags: args.tags,
    draft: args.draft ? true : undefined,
  }

  return `${formatYamlFrontmatter(fm)}

# ${args.title}

## TL;DR

## Notes
`
}

const argv = await yargs(hideBin(process.argv))
  .scriptName("create-article")
  .usage("$0 <article-slug> [options]")
  .positional("article-slug", {
    type: "string",
    describe: "Article slug (kebab-case recommended). Example: why-quartz",
  })
  .option("title", {
    type: "string",
    describe: "Article title (defaults to slug)",
  })
  .option("date", {
    type: "string",
    default: formatYYYYMMDD(new Date()),
    describe: "Date frontmatter value (YYYY-MM-DD)",
  })
  .option("tag", {
    type: "array",
    default: ["blog"],
    describe: "Tags (repeatable). Example: --tag spring --tag security",
  })
  .option("draft", {
    type: "boolean",
    default: false,
    describe: "Mark as draft (won't publish with RemoveDrafts)",
  })
  .option("contentDir", {
    type: "string",
    default: "content",
    describe: "Quartz content directory",
  })
  .option("force", {
    type: "boolean",
    default: false,
    describe: "Overwrite existing file",
  })
  .demandCommand(1)
  .strict()
  .help().argv

const rawSlug = String(argv._[0] ?? "")
const articleSlug = toKebabSlug(rawSlug)
if (!articleSlug) {
  throw new Error(`Invalid article slug: "${rawSlug}"`)
}

const contentDir = path.resolve(process.cwd(), String(argv.contentDir))
const articlePath = path.join(contentDir, "blog", `${articleSlug}.md`)

const title = argv.title?.trim() ? String(argv.title) : rawSlug.trim()
const date = String(argv.date)
const tags = (argv.tag as unknown[]).map(String).filter(Boolean)
const draft = Boolean(argv.draft)

await writeFileSafe(articlePath, articleTemplate({ title, date, tags, draft }), Boolean(argv.force))
await ensureBlogIndex({ contentDir, articleSlug, title })
await updateHomeRecentArticles({ contentDir, articleSlug, title, limit: 5 })

console.log(`✅ Article created: ${path.relative(process.cwd(), articlePath)}`)
