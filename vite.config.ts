import path from "node:path"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"
import { labGate } from "./scripts/lab-gate.ts"
import { juniperRegistry } from "./scripts/registry/vite-plugin.ts"

/* The lab routes are built only on request: `npm run dev:lab` (LAB=on),
 * or `npm run dev --lab=on` under npm (npm_config_lab). See
 * scripts/lab-gate.ts. */
const lab = process.env.npm_config_lab === "on" || process.env.LAB === "on"

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the app from /<repo>/; dev stays at the root. The
  // router picks this up via import.meta.env.BASE_URL (see src/main.tsx).
  // `vite preview` resolves config with command 'serve', so it needs the
  // isPreview flag to serve the built output under the same base.
  base: command === "build" || isPreview ? "/juniper/" : "/",
  plugins: [
    // Gates the lab routes behind --lab=on; before the router plugin so a
    // gated route file is already a stub when the router transforms it.
    labGate(lab),
    // Must run before the React plugin: generates src/routeTree.gen.ts
    // from the files in src/routes/.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    // `import Icon from './icon.svg?react'` — plain .svg imports still
    // resolve to asset URLs.
    svgr(),
    // Publishes llms.txt, docs/ and registry/ into dist/ on build — the
    // Juniper contract surface. URL prefix is derived from `base` above.
    juniperRegistry(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
}))
