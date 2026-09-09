import path from 'node:path'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the app from /<repo>/; dev stays at the root. The
  // router picks this up via import.meta.env.BASE_URL (see src/main.tsx).
  // `vite preview` resolves config with command 'serve', so it needs the
  // isPreview flag to serve the built output under the same base.
  base: command === 'build' || isPreview ? '/juniper/' : '/',
  plugins: [
    // Must run before the React plugin: generates src/routeTree.gen.ts
    // from the files in src/routes/.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    // `import Icon from './icon.svg?react'` — plain .svg imports still
    // resolve to asset URLs.
    svgr(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
}))
