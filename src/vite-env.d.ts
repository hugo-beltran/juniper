/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /** True when the build was asked for the lab routes (scripts/lab-gate.ts). */
  readonly LAB: boolean
}
