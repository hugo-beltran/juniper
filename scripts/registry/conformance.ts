import type { RegistryEntry, ThemeEntry } from "./types.ts"

/* Build-time contract gate. The build fails, rather than publishing a
 * registry that contradicts the docs, when a component breaks a rule the
 * reference docs state as MUST. Rules enforced here are listed in
 * docs/theming.md under "Conformance". */

interface ConformanceInput {
  root: string
  entries: RegistryEntry[]
  theme: ThemeEntry
}

/* Color literals that bypass the palette. `oklch(from var(--juni-…) …)` is
 * the sanctioned way to derive alpha/lightness tweaks and is allowed. */
const COLOR_LITERAL =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|color)\(|\boklch\((?!\s*from\s+var\(--juni-)/gi

/* Type scale (theming §4.2): a font-size is a token or inherits. */
const FONT_SIZE = /font-size\s*:\s*([^;]+);/g
const TYPE_TOKEN = /^(?:var\(--(?:text|display)-[a-z0-9]+\)|inherit)$/

export function checkConformance({ entries, theme }: ConformanceInput) {
  const problems: string[] = []
  const themePalette = new Set(theme.palette)

  for (const entry of entries) {
    if (entry.type === "theme") continue

    for (const file of entry.files) {
      if (file.kind !== "style") continue
      const css = stripComments(file.content)
      for (const match of css.matchAll(COLOR_LITERAL)) {
        problems.push(
          `${file.path}: color literal "${match[0]}" — component CSS MUST reference --juni-* palette steps (or derive from one with oklch(from var(--juni-…))).`,
        )
      }
      for (const match of css.matchAll(FONT_SIZE)) {
        const value = match[1].trim()
        if (!TYPE_TOKEN.test(value)) {
          problems.push(
            `${file.path}: font-size "${value}" — component CSS MUST use a type-scale token (var(--text-*) / var(--display-*)) or inherit (docs/theming.md §4.2).`,
          )
        }
      }
    }

    for (const step of entry.palette) {
      if (!themePalette.has(step)) {
        problems.push(
          `${entry.name}: references ${step}, which src/styles does not define.`,
        )
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `[registry] ${problems.length} conformance problem(s):\n  - ${problems.join("\n  - ")}`,
    )
  }
}

function stripComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}
