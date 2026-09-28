import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import type { Plugin, ResolvedConfig } from "vite"
import { collect } from "./collect.ts"
import { renderLlmsTxt } from "./llms.ts"
import type { IndexEntry, RegistryIndex } from "./types.ts"
import { SCHEMA_VERSION } from "./types.ts"

/* Publishes the Juniper contract beside the app on every `vite build`:
 *
 *   llms.txt                         crawl entry point
 *   docs/<slug>.md                   normative reference docs (copied from ./docs)
 *   registry/index.json              every entry, with URLs
 *   registry/components/<name>.json  per-component entry, source files inlined
 *   registry/lib/<name>.json         shared helpers
 *   registry/theme.json              palette scales + semantic tokens
 *   registry/schema/*.schema.json    JSON Schema for the above
 *
 * The URL prefix is Vite's `base` (the single source of truth for where the
 * site is served) joined onto SITE_ORIGIN. Build-only: the dev server does
 * not serve these files — verify with `vite preview`. A collection or
 * conformance error fails the build so a stale registry is never deployed
 * beside a fresh app. This path layout is a published contract; changing it
 * breaks every consumer that has stored a URL. */

const SITE_ORIGIN = "https://hugo-beltran.github.io"
const REPOSITORY = "https://github.com/hugo-beltran/juniper"

export function juniperRegistry({
  origin = SITE_ORIGIN,
}: {
  origin?: string
} = {}): Plugin {
  let config: ResolvedConfig

  return {
    name: "juniper-registry",
    apply: "build",
    configResolved(resolved) {
      config = resolved
    },
    generateBundle() {
      const root = config.root
      const baseUrl = new URL(config.base, origin).href
      const { entries, docs, docSources } = collect({ root, baseUrl })

      const emit = (fileName: string, source: string) =>
        this.emitFile({ type: "asset", fileName, source })

      for (const entry of entries) {
        emit(new URL(entry.url).pathname.replace(config.base, ""), json(entry))
      }

      const index: RegistryIndex = {
        $schema: `${baseUrl}registry/schema/index.schema.json`,
        schemaVersion: SCHEMA_VERSION,
        name: "juniper",
        description:
          "Juniper design-system contract: normative reference docs plus a component registry generated from source.",
        baseUrl,
        repository: REPOSITORY,
        llms: `${baseUrl}llms.txt`,
        schema: {
          index: `${baseUrl}registry/schema/index.schema.json`,
          entry: `${baseUrl}registry/schema/entry.schema.json`,
        },
        docs,
        entries: entries.map<IndexEntry>((entry) => ({
          name: entry.name,
          type: entry.type,
          title: entry.title,
          description: entry.description,
          ...(entry.type === "component" ? { category: entry.category } : {}),
          url: entry.url,
        })),
      }
      emit("registry/index.json", json(index))

      const schemaDir = path.join(root, "scripts/registry/schema")
      for (const file of readdirSync(schemaDir)) {
        emit(
          `registry/schema/${file}`,
          readFileSync(path.join(schemaDir, file), "utf8"),
        )
      }

      for (const [slug, source] of docSources) emit(`docs/${slug}.md`, source)

      emit(
        "llms.txt",
        renderLlmsTxt({ baseUrl, repository: REPOSITORY, docs, entries }),
      )

      config.logger.info(
        `[registry] published ${entries.length} entries, ${docs.length} docs → ${baseUrl}llms.txt`,
      )
    },
  }
}

function json(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`
}
