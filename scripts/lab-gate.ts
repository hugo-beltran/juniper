import path from "node:path"
import type { Plugin } from "vite"

/* The lab gate. The lab routes (src/routes/_authenticated/lab/) are
 * explorations and archives, not the product, so they are built only when
 * asked: `npm run dev:lab` (or `bun run dev:lab`), which sets LAB=on;
 * under npm alone, `npm run dev --lab=on` reaches the config as
 * npm_config_lab. Off by default.
 *
 * Off, every lab route module is replaced at load time with a stub that
 * throws notFound, so the generated route tree, the typecheck and the
 * links in the app stay exactly as they are while the lab pages, their
 * stylesheets and their private files never enter the bundle. The
 * navigation tree drops the lab items on the same flag through
 * import.meta.env.LAB, which this plugin defines. Added 2026-10-01. */

const LAB_DIR = path.join("src", "routes", "_authenticated", "lab")

/** Is this module a lab route file (not a private `-dir` file inside)? */
const isLabRoute = (id: string, root: string) => {
  const relative = path.relative(path.join(root, LAB_DIR), id.split("?")[0])
  const directories = relative.split(path.sep).slice(0, -1)
  return (
    !relative.startsWith("..") &&
    !path.isAbsolute(relative) &&
    !directories.some((segment) => segment.startsWith("-")) &&
    /\.tsx?$/.test(relative)
  )
}

/** The route id TanStack derives from the file: /_authenticated/lab/<name>. */
const routeId = (id: string, root: string) =>
  `/${path
    .relative(path.join(root, "src", "routes"), id.split("?")[0])
    .replace(/\.tsx?$/, "")}`

export function labGate(enabled: boolean): Plugin {
  let root = process.cwd()
  return {
    name: "juniper-lab-gate",
    enforce: "pre",
    config: () => ({
      define: { "import.meta.env.LAB": JSON.stringify(enabled) },
    }),
    configResolved(config) {
      root = config.root
    },
    load(id) {
      if (enabled || !isLabRoute(id, root)) return null
      return [
        'import { createFileRoute, notFound } from "@tanstack/react-router"',
        "",
        "/* Lab route, gated off: built only by dev:lab or LAB=on. */",
        `export const Route = createFileRoute(${JSON.stringify(routeId(id, root))})({`,
        "  beforeLoad: () => {",
        "    throw notFound()",
        "  },",
        "})",
        "",
      ].join("\n")
    },
  }
}
