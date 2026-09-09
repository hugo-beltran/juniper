export const TENANT_BLOBATAR_PALETTE = {
  head: "#eff3e6",
  eye: "#1c3d2e",
} as const;

const BARK_PALETTES = [
  { head: "#e0dedb", eye: "#5a5048" }, // bark-100 / bark-800
  { head: "#bebab5", eye: "#4a4038" }, // bark-300 / bark-900
  { head: "#948e87", eye: "#2c221a" }, // bark-500 / bark-950
  { head: "#6a615a", eye: "#e0dedb" }, // bark-700 / bark-100
];

/* FNV-1a — buckets a name into one of the bark variants. */
function fnv1a(text: string) {
  let hash = 2166136261;
  for (const ch of text) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/** Deterministic bark variant for a name — shape stays name-driven. */
export function blobatarPalette(name: string) {
  return BARK_PALETTES[fnv1a(name) % BARK_PALETTES.length];
}
