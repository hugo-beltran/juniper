import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { checkConformance } from "./conformance.ts"
import type {
  ComponentEntry,
  Dependencies,
  DocLink,
  FileKind,
  LibEntry,
  RegistryEntry,
  RegistryFile,
  Sidecar,
  ThemeEntry,
} from "./types.ts"
import { SCHEMA_VERSION } from "./types.ts"

/* Collects everything the registry publishes, from source. The registered
 * set is the components barrel: a directory exported from
 * src/components/index.ts MUST carry a registry.json sidecar; directories
 * outside the barrel are private and ignored. File lists, palette steps and
 * dependencies are derived, never hand-typed, so they cannot drift. */

export interface CollectOptions {
  root: string
  /** Absolute URL prefix the site is served from, with trailing slash. */
  baseUrl: string
}

export interface Collected {
  entries: RegistryEntry[]
  docs: DocLink[]
  /** Raw markdown per doc slug, copied into the published site. */
  docSources: Map<string, string>
}

const COMPONENTS_DIR = "src/components"
const LIB_DIR = "src/lib"
const STYLES_DIR = "src/styles"
const DOCS_DIR = "docs"

const PALETTE_VAR = /--juni-[a-z]+(?:-[a-z0-9]+)*/g
/* Matches `import … from "x"` (including multi-line specifier blocks, hence
 * no \n exclusion — the class can't cross a quoted string), `export … from
 * "x"`, and side-effect `import "x"`. */
const IMPORT_SPEC =
  /(?:^|\n)\s*(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g

export function collect({ root, baseUrl }: CollectOptions): Collected {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"))
  const npmDeps = new Set(Object.keys(pkg.dependencies ?? {}))

  const componentNames = readBarrel(root)
  /* Every module in src/lib is addressable, but only the ones a registered
   * component imports are published — demo-only modules (mock data) are not
   * part of the contract. */
  const libCandidates = readdirSync(path.join(root, LIB_DIR))
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(/\.ts$/, ""))
  const registryNames = new Set([...componentNames, ...libCandidates, "theme"])

  const entryUrl = (type: string, name: string) =>
    type === "theme"
      ? `${baseUrl}registry/theme.json`
      : `${baseUrl}registry/${type === "component" ? "components" : "lib"}/${name}.json`
  const entrySchema = `${baseUrl}registry/schema/entry.schema.json`

  const components: ComponentEntry[] = componentNames.map((name) => {
    const dir = path.join(root, COMPONENTS_DIR, name)
    const sidecar = readSidecar(dir, name)
    const files = readFiles(root, path.join(COMPONENTS_DIR, name))
    return {
      $schema: entrySchema,
      schemaVersion: SCHEMA_VERSION,
      name,
      type: "component",
      title: sidecar.title,
      description: sidecar.description,
      category: sidecar.category,
      url: entryUrl("component", name),
      anatomy: sidecar.anatomy,
      usage: sidecar.usage,
      files,
      palette: derivePalette(files),
      dependencies: deriveDependencies(files, name, npmDeps, registryNames),
      docs: sidecar.docs ?? [],
    }
  })

  const libNames = [
    ...new Set(
      components.flatMap((c) =>
        c.dependencies.registry.filter((dep) => libCandidates.includes(dep)),
      ),
    ),
  ].sort()

  const libs: LibEntry[] = libNames.map((name) => {
    const file = readFile(root, path.join(LIB_DIR, `${name}.ts`))
    return {
      $schema: entrySchema,
      schemaVersion: SCHEMA_VERSION,
      name,
      type: "lib",
      title: name,
      description: leadingComment(file.content) ?? `${name} helper`,
      url: entryUrl("lib", name),
      files: [file],
      palette: [],
      dependencies: deriveDependencies([file], name, npmDeps, registryNames),
      docs: [],
    }
  })

  const themeFiles = readFiles(root, STYLES_DIR)
  const theme: ThemeEntry = {
    $schema: entrySchema,
    schemaVersion: SCHEMA_VERSION,
    name: "theme",
    type: "theme",
    title: "Juniper theme",
    description:
      "The --juni-* oklch palette scales, the shared semantic tokens, and the document base styles. Every component's palette dependencies resolve against this entry.",
    url: entryUrl("theme", "theme"),
    files: themeFiles,
    palette: derivePalette(themeFiles),
    dependencies: { npm: [], registry: [] },
    docs: ["theming", "palette", "light-dark"],
  }

  const entries: RegistryEntry[] = [...components, ...libs, theme]
  checkConformance({ root, entries, theme })

  const { docs, docSources } = readDocs(root, baseUrl)
  return { entries, docs, docSources }
}

/* The barrel is the registration list: `export * from './<dir>/<file>'`. */
function readBarrel(root: string): string[] {
  const barrel = readFileSync(
    path.join(root, COMPONENTS_DIR, "index.ts"),
    "utf8",
  )
  const names = new Set<string>()
  for (const match of barrel.matchAll(
    /export\s+\*\s+from\s+['"]\.\/([^/'"]+)\//g,
  )) {
    names.add(match[1])
  }
  return [...names].sort()
}

function readSidecar(dir: string, name: string): Sidecar {
  const file = path.join(dir, "registry.json")
  if (!existsSync(file)) {
    throw new Error(
      `[registry] ${name}: exported from the components barrel but has no ${path.relative(process.cwd(), file)}. Every barrel export MUST carry a registry.json sidecar (see docs/registry-schema.md).`,
    )
  }
  const sidecar = JSON.parse(readFileSync(file, "utf8")) as Partial<Sidecar>
  const missing = (
    ["title", "description", "category", "anatomy", "usage"] as const
  ).filter((key) => sidecar[key] === undefined)
  if (missing.length > 0) {
    throw new Error(
      `[registry] ${name}/registry.json is missing required field(s): ${missing.join(", ")}`,
    )
  }
  return sidecar as Sidecar
}

function readFiles(root: string, relDir: string): RegistryFile[] {
  return readdirSync(path.join(root, relDir))
    .filter((f) => /\.(tsx?|css)$/.test(f))
    .sort()
    .map((f) => readFile(root, path.join(relDir, f)))
}

function readFile(root: string, relPath: string): RegistryFile {
  return {
    path: relPath,
    kind: fileKind(relPath),
    content: readFileSync(path.join(root, relPath), "utf8"),
  }
}

function fileKind(relPath: string): FileKind {
  const base = path.basename(relPath)
  if (base.endsWith(".css")) return "style"
  if (base.endsWith(".tsx")) return "component"
  if (base.startsWith("use-")) return "hook"
  return "util"
}

function derivePalette(files: RegistryFile[]): string[] {
  const steps = new Set<string>()
  for (const file of files) {
    if (file.kind !== "style") continue
    for (const match of file.content.matchAll(PALETTE_VAR)) steps.add(match[0])
  }
  return [...steps].sort()
}

function deriveDependencies(
  files: RegistryFile[],
  self: string,
  npmDeps: Set<string>,
  registryNames: Set<string>,
): Dependencies {
  const npm = new Set<string>()
  const registry = new Set<string>()
  for (const file of files) {
    if (file.kind === "style") continue
    for (const match of file.content.matchAll(IMPORT_SPEC)) {
      const spec = match[1] ?? match[2]
      if (!spec || spec.startsWith(".")) continue
      const internal = spec.match(/^@\/(components|lib)\/([^/]+)/)
      if (internal) {
        const name = internal[2].replace(/\.tsx?$/, "")
        if (name !== self && registryNames.has(name)) registry.add(name)
        continue
      }
      const pkgName = spec.startsWith("@")
        ? spec.split("/").slice(0, 2).join("/")
        : spec.split("/")[0]
      if (!npmDeps.has(pkgName)) {
        throw new Error(
          `[registry] ${self}: imports "${spec}" but "${pkgName}" is not in package.json dependencies.`,
        )
      }
      npm.add(pkgName)
    }
  }
  return { npm: [...npm].sort(), registry: [...registry].sort() }
}

/* First block comment in a source file, flattened to one line. */
function leadingComment(source: string): string | undefined {
  const match = source.match(/\/\*\s*([\s\S]*?)\s*\*\//)
  return match?.[1].replace(/\s*\n\s*\*?\s*/g, " ").trim()
}

/* Reference docs: `# Title` on the first line, a `> summary` blockquote
 * beneath it (the llms.txt convention). Ordered by DOC_ORDER, unknown slugs
 * appended alphabetically. */
const DOC_ORDER = [
  "theming",
  "light-dark",
  "palette",
  "component-architecture",
  "registry-schema",
]

function readDocs(root: string, baseUrl: string) {
  const dir = path.join(root, DOCS_DIR)
  const slugs = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort((a, b) => {
      const ia = DOC_ORDER.indexOf(a)
      const ib = DOC_ORDER.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  const docSources = new Map<string, string>()
  const docs: DocLink[] = slugs.map((slug) => {
    const source = readFileSync(path.join(dir, `${slug}.md`), "utf8")
    docSources.set(slug, source)
    const title = source.match(/^#\s+(.+)$/m)?.[1]?.trim()
    const summary = source.match(/^>\s+(.+)$/m)?.[1]?.trim()
    if (!title || !summary) {
      throw new Error(
        `[registry] docs/${slug}.md needs a "# Title" heading and a "> summary" blockquote.`,
      )
    }
    return { slug, title, summary, url: `${baseUrl}docs/${slug}.md` }
  })
  return { docs, docSources }
}
