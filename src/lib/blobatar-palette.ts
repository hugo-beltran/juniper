/* Blobatar palettes drawn from the identity's four chromatic families, in
 * two context tunings: "bold" for chrome surfaces like the sidebar squircle
 * (~700 heads, light eyes — except needle, whose pale 50-head creature is
 * the sidebar's original look) and "soft" for content surfaces like the
 * leads table (~200 wash heads, dark 900 eyes, so 44 rows of avatars stay
 * quiet). Hex because blobatar's tint math parses hex (and palette overrides
 * bypass its contrast guarantee, so eyes are set explicitly); resolved from
 * the --juni-* steps named below — re-derive if a ramp changes.
 *
 * Array order is deliberate: under the FNV-1a bucketing, the seed tenants
 * land Juniper→needle, Bramblewood→heartwood, Evergreen Studio→berry,
 * Kingfisher→bloom. Keep both sets family-aligned by index so a name wears
 * the same family everywhere. */
const BOLD_PALETTES = [
  { head: "#eff3e6", eye: "#1c3d2e" }, // needle-50 / needle-900 (the exception)
  { head: "#89484b", eye: "#f9d7b5" }, // heartwood-700 / heartwood-100
  { head: "#635886", eye: "#dcdcee" }, // berry-700 / berry-100
  { head: "#1a6a75", eye: "#c4e4ef" }, // bloom-700 / bloom-100
];

const SOFT_PALETTES = [
  { head: "#c9dda6", eye: "#1c3d2e" }, // needle-200 / needle-900
  { head: "#f2ba8c", eye: "#59373b" }, // heartwood-200 / heartwood-900
  { head: "#c5c4de", eye: "#433c60" }, // berry-200 / berry-900
  { head: "#8bd4e9", eye: "#1e4a50" }, // bloom-200 / bloom-900
];

/* FNV-1a, chosen over simpler folds because it spreads the seed tenant names
 * across all four buckets (multiplicative char-sum hashes collide them). */
function fnv1a(text: string) {
  let hash = 2166136261;
  for (const ch of text) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/** Deterministic family palette for a name — shape stays name-driven. */
export function blobatarPalette(name: string, tone: "bold" | "soft" = "bold") {
  const palettes = tone === "soft" ? SOFT_PALETTES : BOLD_PALETTES;
  return palettes[fnv1a(name) % palettes.length];
}
