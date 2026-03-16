import fs from "node:fs/promises"
import path from "node:path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

type Frontmatter = {
  type: "project" | "project-doc"
  status?: string
  start?: string
  stack?: string[]
  tags?: string[]
  project?: string
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

function formatYYYYMM(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(" ")
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

async function ensureProjectsIndex(args: {
  contentDir: string
  projectSlug: string
  projectName: string
}) {
  const projectsIndexPath = path.join(args.contentDir, "projects", "index.md")
  const startMarker = "<!-- PROJECTS:START -->"
  const endMarker = "<!-- PROJECTS:END -->"

  if (!(await pathExists(projectsIndexPath))) {
    const initial = `---\ntitle: Projects\ntags:\n  - project\n---\n\n# Projects\n\n${startMarker}\n${endMarker}\n`
    await writeFileSafe(projectsIndexPath, initial, true)
  }

  const raw = await fs.readFile(projectsIndexPath, "utf8")
  if (!raw.includes(startMarker) || !raw.includes(endMarker)) {
    throw new Error(`Missing markers in ${projectsIndexPath}`)
  }

  const linkLine = `- [[projects/${args.projectSlug}/index|${args.projectName}]]`
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
  await fs.writeFile(projectsIndexPath, updated, "utf8")
}

async function updateHomeRecentProjects(args: {
  contentDir: string
  projectSlug: string
  projectName: string
  limit: number
}) {
  const homePath = path.join(args.contentDir, "index.md")
  const startMarker = "<!-- HOME:PROJECTS:START -->"
  const endMarker = "<!-- HOME:PROJECTS:END -->"
  if (!(await pathExists(homePath))) return

  const raw = await fs.readFile(homePath, "utf8")
  if (!raw.includes(startMarker) || !raw.includes(endMarker)) return

  const linkLine = `- [[projects/${args.projectSlug}/index|${args.projectName}]]`
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

function docTemplate(projectSlug: string, title: string, extra?: Partial<Frontmatter>): string {
  const frontmatter: Frontmatter = {
    type: "project-doc",
    project: projectSlug,
    tags: ["project"],
    ...extra,
  }
  return `${formatYamlFrontmatter(frontmatter)}\n\n# ${title}\n`
}

function indexTemplate(args: {
  projectSlug: string
  projectName: string
  status: string
  start: string
  stack: string[]
  tags: string[]
}): string {
  const fm: Frontmatter = {
    type: "project",
    status: args.status,
    start: args.start,
    stack: args.stack,
    tags: args.tags,
  }

  return `${formatYamlFrontmatter(fm)}

# ${args.projectName}

프로젝트 설명

---

## Overview

한 줄 소개

---

## Docs

### Planning
- [[planning/concept]]
- [[planning/roadmap]]
- [[planning/requirements]]

### Development
- [[development/architecture]]
- [[development/tech-stack]]
- [[development/devlog]]

### Issues
- [[issues/README]]

### Release
- [[release/changelog]]
- [[release/versions/v0.1.0]]

### Pages
- [[pages/landing]]

### Legal
- [[legal/privacy-policy]]
- [[legal/terms-of-service]]

### Feedback
- [[feedback/feature-requests]]
`
}

const argv = await yargs(hideBin(process.argv))
  .scriptName("create-project")
  .usage("$0 <project-slug> [options]")
  .positional("project-slug", {
    type: "string",
    describe: "Project slug (kebab-case recommended). Example: wordcard",
  })
  .option("name", {
    type: "string",
    describe: "Project display name for index.md",
  })
  .option("status", {
    type: "string",
    default: "planning",
    describe: "Initial status frontmatter value",
  })
  .option("start", {
    type: "string",
    default: formatYYYYMM(new Date()),
    describe: "Start date (YYYY-MM)",
  })
  .option("stack", {
    type: "array",
    default: [],
    describe: "Tech stack list (repeatable). Example: --stack spring --stack postgres",
  })
  .option("tag", {
    type: "array",
    default: ["project"],
    describe: "Index tags (repeatable). Example: --tag app",
  })
  .option("contentDir", {
    type: "string",
    default: "content",
    describe: "Quartz content directory",
  })
  .option("force", {
    type: "boolean",
    default: false,
    describe: "Overwrite existing files",
  })
  .option("devlogFolder", {
    type: "boolean",
    default: true,
    describe: "Create devlog/YYYY-MM-DD.md folder structure",
  })
  .demandCommand(1)
  .strict()
  .help().argv

const rawSlug = String(argv._[0] ?? "")
const projectSlug = toKebabSlug(rawSlug)
if (!projectSlug) {
  throw new Error(`Invalid project slug: "${rawSlug}"`)
}

const contentDir = path.resolve(process.cwd(), String(argv.contentDir))
const projectRoot = path.join(contentDir, "projects", projectSlug)

if (!argv.force && (await pathExists(projectRoot))) {
  throw new Error(`Project already exists: ${projectRoot}`)
}

const projectName = argv.name?.trim() ? String(argv.name) : titleFromSlug(projectSlug)
const status = String(argv.status)
const start = String(argv.start)
const stack = (argv.stack as unknown[]).map(String).filter(Boolean)
const tags = (argv.tag as unknown[]).map(String).filter(Boolean)

const files: Array<{ rel: string; content: string }> = [
  {
    rel: "index.md",
    content: indexTemplate({ projectSlug, projectName, status, start, stack, tags }),
  },

  { rel: "planning/concept.md", content: docTemplate(projectSlug, "Concept") },
  { rel: "planning/roadmap.md", content: docTemplate(projectSlug, "Roadmap") },
  { rel: "planning/requirements.md", content: docTemplate(projectSlug, "Requirements") },

  { rel: "development/architecture.md", content: docTemplate(projectSlug, "Architecture") },
  { rel: "development/tech-stack.md", content: docTemplate(projectSlug, "Tech Stack") },
  {
    rel: "development/devlog.md",
    content: docTemplate(projectSlug, "Devlog", { tags: ["project", "devlog"] }),
  },

  {
    rel: "issues/README.md",
    content: `${formatYamlFrontmatter({ type: "project-doc", project: projectSlug, tags: ["project", "issues"] })}

# Issues

- \`issue-0001.md\`, \`issue-0002.md\` 처럼 번호로 관리
- 각 이슈는 "문제 → 원인 → 해결 → 회고" 구조로 작성
`,
  },

  {
    rel: "release/changelog.md",
    content: docTemplate(projectSlug, "Changelog", { tags: ["project", "release"] }),
  },
  {
    rel: "release/versions/v0.1.0.md",
    content: `${formatYamlFrontmatter({
      type: "project-doc",
      project: projectSlug,
      tags: ["project", "release"],
    })}

# v0.1.0

## Added

## Changed

## Fixed
`,
  },

  { rel: "pages/landing.md", content: docTemplate(projectSlug, "Landing") },

  {
    rel: "legal/privacy-policy.md",
    content: docTemplate(projectSlug, "Privacy Policy", { tags: ["project", "legal"] }),
  },
  {
    rel: "legal/terms-of-service.md",
    content: docTemplate(projectSlug, "Terms of Service", { tags: ["project", "legal"] }),
  },

  {
    rel: "feedback/feature-requests.md",
    content: docTemplate(projectSlug, "Feature Requests", { tags: ["project", "feedback"] }),
  },
]

if (argv.devlogFolder) {
  const today = formatYYYYMMDD(new Date())
  files.push({
    rel: `devlog/${today}.md`,
    content: `${formatYamlFrontmatter({
      type: "project-doc",
      project: projectSlug,
      tags: ["project", "devlog"],
    })}

# ${today}

## Today

## Notes

## Next
`,
  })
}

for (const file of files) {
  const abs = path.join(projectRoot, file.rel)
  await writeFileSafe(abs, file.content, Boolean(argv.force))
}

await ensureProjectsIndex({ contentDir, projectSlug, projectName })
await updateHomeRecentProjects({ contentDir, projectSlug, projectName, limit: 5 })

console.log(`✅ Project scaffold created: ${path.relative(process.cwd(), projectRoot)}`)
