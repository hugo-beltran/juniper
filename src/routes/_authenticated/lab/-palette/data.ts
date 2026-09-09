/* Data for /lab/palette — the palette's four chromatic families, each with
 * the retired sources, rejected directions, and candidates from its
 * exploration (all 2026-09-08). Numbers are frozen: retired ramps no longer
 * exist as CSS vars, and the candidate math re-runs here as the executable
 * record of each decision.
 *
 * Naming note: the shipped families were renamed to juniper anatomy on
 * 2026-09-08 — grove→needle, reef→bloom, orchid→berry, nectarine→heartwood.
 * Candidate and retired-ramp names below stay exploration-era; in this file
 * "berry (retired)" always means the old BLUE ramp, not today's purple
 * --juni-berry-*. */

export type Oklch = readonly [number, number, number]; // lightness %, chroma, hue

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/* The house lightness ladder (berry donated it; every shipped ramp uses it). */
const HOUSE_L = [96, 90, 83, 79, 73, 65, 56, 48.18, 44, 38, 26];

const mix = (a: number, b: number, w: number) => a * (1 - w) + b * w;

const normalizedProfile = (ramp: Oklch[]) => {
  const peak = Math.max(...ramp.map((v) => v[1]));
  return ramp.map((v) => v[1] / peak);
};

export const oklch = ([l, c, h]: Oklch) =>
  `oklch(${+l.toFixed(2)}% ${+c.toFixed(4)} ${+h.toFixed(2)})`;

/* ---- retired ramps ---- */

const LEAF: Oklch[] = [
  [96, 0.015, 124], [90, 0.019, 125.73], [83, 0.03, 127.93],
  [79, 0.043, 130.72], [73, 0.054, 134.28], [65, 0.058, 138.8],
  [56, 0.057, 144.55], [49.22, 0.0534, 151.85], [44, 0.048, 161.15],
  [38, 0.041, 173], [26, 0.034, 188],
];
const PEAR: Oklch[] = [
  [95.5, 0.021, 120], [93, 0.068, 121], [91, 0.165, 122],
  [82, 0.188, 124], [72, 0.196, 128], [61, 0.172, 132],
  [52, 0.144, 135], [43, 0.112, 138], [35, 0.082, 148],
  [28, 0.062, 156], [24, 0.058, 162],
];
const BERRY: Oklch[] = [
  [96, 0.018, 236], [90, 0.0213, 240.2], [83, 0.0299, 244.4],
  [79, 0.0416, 248.6], [73, 0.0544, 252.8], [65, 0.0661, 257],
  [56, 0.0747, 261.2], [48.18, 0.078, 265.4], [44, 0.0752, 269.6],
  [38, 0.0698, 273.8], [26, 0.067, 278],
];
const PLUM: Oklch[] = [
  [96, 0.02, 330.55], [90, 0.028, 330.34], [83, 0.042, 330.01],
  [79, 0.054, 329.5], [73, 0.066, 328.7], [65, 0.076, 327.47],
  [56, 0.074, 325.57], [50, 0.069, 322.61], [44, 0.062, 318.03],
  [38, 0.053, 310.93], [26, 0.044, 299.92],
];
const MOMO: Oklch[] = [
  [96.5, 0.02, 50], [90, 0.049, 43.5], [84, 0.0832, 36.5],
  [78, 0.1262, 29.8], [70, 0.1602, 23.8], [62, 0.1802, 19.33],
  [52, 0.1442, 21.44], [42, 0.1082, 25.22], [32, 0.0722, 28.56],
  [23, 0.0422, 31.78], [18, 0.02, 34],
];
/* oriole's --or-nectarine-*; dark-end hues unwrapped below 0 for blending. */
const ORIOLE_NECTARINE: Oklch[] = [
  [96, 0.04, 90], [90, 0.0831, 83.98], [83, 0.118, 76.57],
  [79, 0.134, 61.11], [73, 0.152, 44.14], [65, 0.1376, 33.29],
  [56, 0.1227, 22.77], [50, 0.1025, 13.58], [44, 0.0823, 6.14],
  [38, 0.0674, -0.41], [26, 0.062, -6.95],
];

/* ---- shipped ramps (must mirror juniper-theme.css) ---- */

export const GROVE: Oklch[] = [
  [95.75, 0.0171, 121.4], [91.5, 0.0362, 122.66], [87, 0.0772, 124.08],
  [80.5, 0.0938, 126.35], [72.5, 0.1037, 130.2], [63, 0.0979, 134.38],
  [54, 0.0874, 138.34], [46.11, 0.0739, 142.85], [39.5, 0.0599, 152.6],
  [33, 0.0484, 161.95], [25, 0.0424, 171.1],
];
export const ORCHID: Oklch[] = [
  [96, 0.0304, 302.19], [90, 0.0394, 303.3], [83, 0.0575, 304.33],
  [79, 0.0765, 305.23], [73, 0.0963, 305.93], [65, 0.1137, 306.33],
  [56, 0.119, 306.26], [49.09, 0.1176, 305.45], [44, 0.1098, 303.5],
  [38, 0.0982, 299.79], [26, 0.0888, 293.34],
];
export const REEF: Oklch[] = [
  [96, 0.0173, 221.3], [90, 0.0367, 219.44], [83, 0.0782, 217.06],
  [79, 0.095, 216.24], [73, 0.105, 214.38], [65, 0.0991, 211.5],
  [56, 0.0885, 210.02], [48.18, 0.0748, 208.9], [44, 0.0607, 208.89],
  [38, 0.049, 208.31], [26, 0.0429, 205.9],
];

const GROVE_PROFILE = normalizedProfile(GROVE);
const ORCHID_PROFILE = normalizedProfile(ORCHID);
const MOMO_PROFILE = normalizedProfile(MOMO);

/* ---- family builders ---- */

/* grove: leaf × pear — mean lightness, weighted chroma and hue. */
const groveBlend = (chromaW: number, hueW: number): Oklch[] =>
  LEAF.map((l, i) => {
    const p = PEAR[i];
    return [mix(l[0], p[0], 0.5), mix(l[1], p[1], chromaW), mix(l[2], p[2], hueW)];
  });

/* orchid: berry × plum — mean lightness, hue weighted toward plum, mean
 * chroma scaled by a boost. */
const orchidBlend = (hueW: number, boost: number): Oklch[] =>
  BERRY.map((b, i) => {
    const p = PLUM[i];
    return [mix(b[0], p[0], 0.5), mix(b[1], p[1], 0.5) * boost, mix(b[2], p[2], hueW)];
  });

/* reef: bonito trio expanded onto the house ladder, hue pulled 30% toward
 * berry; chroma from a donor ramp's normalized profile. */
const BONITO_TRIO: { label: string; value: Oklch }[] = [
  { label: "subtle", value: [73.11, 0.055, 198] },
  { label: "base", value: [65, 0.155, 192] },
  { label: "bold", value: [42, 0.11, 182] },
];
const REEF_HUE_ANCHORS: [number, number][] = [
  [96, 215], [73.11, 198], [65, 192], [42, 182], [26, 175],
];
const anchored = (anchors: [number, number][], l: number) => {
  if (l >= anchors[0][0]) return anchors[0][1];
  if (l <= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [l1, v1] = anchors[i];
    const [l2, v2] = anchors[i + 1];
    if (l <= l1 && l >= l2) return v1 + (v2 - v1) * ((l1 - l) / (l1 - l2));
  }
  return anchors[0][1];
};
const reefBuild = (profile: number[], peak: number): Oklch[] =>
  HOUSE_L.map((l, i) => [
    l,
    profile[i] * peak,
    BERRY[i][2] * 0.3 + anchored(REEF_HUE_ANCHORS, l) * 0.7,
  ]);
const REEF_OLD_C_ANCHORS: [number, number][] = [
  [96, 0.02], [73.11, 0.055], [65, 0.155], [42, 0.11], [26, 0.079],
];
const REEF_OLD_BLEND: Oklch[] = HOUSE_L.map((l, i) => [
  l,
  BERRY[i][1] * 0.3 + anchored(REEF_OLD_C_ANCHORS, l) * 0.7,
  BERRY[i][2] * 0.3 + anchored(REEF_HUE_ANCHORS, l) * 0.7,
]);

/* nectarine: momo adjusted along four briefs. */
const NECT_SOBER: Oklch[] = HOUSE_L.map((l, i) => [
  l, GROVE_PROFILE[i] * 0.115, MOMO[i][2],
]);
const NECT_CHOSEN: Oklch[] = HOUSE_L.map((l, i) => [
  l,
  mix(MOMO[i][1], ORIOLE_NECTARINE[i][1], 0.6) * 0.85,
  ((mix(MOMO[i][2], ORIOLE_NECTARINE[i][2], 0.6) % 360) + 360) % 360,
]);
const NECT_TETRAD: Oklch[] = HOUSE_L.map((l, i) => [
  l, MOMO_PROFILE[i] * 0.13, MOMO[i][2] + 18.7,
]);
const NECT_OVER_L = [97, 91, 84, 79, 71, 58, 50, 44, 38, 32, 24];
const NECT_OVER: Oklch[] = NECT_OVER_L.map((l, i) => [
  l, MOMO_PROFILE[i] * 0.155, MOMO[i][2],
]);

/* ---- family definitions ---- */

export interface RampDef {
  key: string;
  name: string;
  note?: string;
  ramp: Oklch[];
  /** dashed = retired/rejected, dotted = shipped-ramp reference */
  style?: "dashed" | "dotted";
  chosen?: boolean;
  /** present on candidates: names the vars in the values listing */
  slug?: string;
}

export interface Family {
  id: string;
  tab: string;
  intro: string;
  shippedVar: string;
  cMax: number;
  lMin: number;
  ramps: RampDef[];
  /** pairing chips under each candidate: beside refs, or rendered on refs[0] */
  chips?: { kind: "beside" | "on"; refs: { label: string; ramp: Oklch[] }[] };
  /** three-stop trio strip + chart diamonds (reef) */
  anchors?: { label: string; value: Oklch }[];
}

export const FAMILIES: Family[] = [
  {
    id: "needle",
    tab: "Needle",
    shippedVar: "--juni-needle-*",
    cMax: 0.21,
    lMin: 20,
    intro:
      "The brand green, born by merging the retired leaf and pear ramps. Every candidate takes the 50/50 mean of lightness per step (keeps the contrast ramp stable) and weights hue toward pear so the family leans yellow, away from leaf's blue-teal drift at the dark end; the knob that differs is how much of pear's chroma survives. B (Willow) shipped first; the pick was revised to A (Fern) — the muted blend wore better in the full UI. Shipped as \"grove\", renamed needle in the juniper-anatomy naming pass.",
    ramps: [
      { key: "leaf", name: "leaf (retired)", ramp: LEAF, style: "dashed" },
      { key: "pear", name: "pear (retired)", ramp: PEAR, style: "dashed" },
      { key: "A", slug: "fern", name: "A — Fern (muted)", note: "chroma 35% pear · hue 65% pear", ramp: groveBlend(0.35, 0.65), chosen: true },
      { key: "B", slug: "willow", name: "B — Willow", note: "chroma 50% pear · hue 65% pear — shipped first, superseded by Fern", ramp: groveBlend(0.5, 0.65) },
      { key: "C", slug: "chartreuse", name: "C — Chartreuse (vivid)", note: "chroma 70% pear · hue 75% pear", ramp: groveBlend(0.7, 0.75) },
    ],
  },
  {
    id: "berry",
    tab: "Berry",
    shippedVar: "--juni-berry-*",
    cMax: 0.15,
    lMin: 20,
    intro:
      "The purple accent, born by merging the retired blue berry and plum ramps — both competed with the brand green for attention; the brief was one complementary tone. Blue berry's hue climbs down-scale (236→278) while plum's falls (330→300), so blends hold an unusually stable hue. A (Iris) was trialed first but read too recessive; C (Orchid) — hue ~306, nearly opposite the brand's ~130 — shipped as \"orchid\", then renamed berry in the juniper-anatomy pass, inheriting the retired blue ramp's name (ripe juniper berries are purple; unripe ones wear the blue).",
    chips: { kind: "beside", refs: [{ label: "needle", ramp: GROVE }] },
    ramps: [
      { key: "needle", name: "needle (brand)", ramp: GROVE, style: "dotted" },
      { key: "berry", name: "berry (retired, blue)", ramp: BERRY, style: "dashed" },
      { key: "plum", name: "plum (retired)", ramp: PLUM, style: "dashed" },
      { key: "A", slug: "iris", name: "A — Iris (true average)", note: "hue 50/50 · chroma ×1.0 — trialed first, too recessive", ramp: orchidBlend(0.5, 1.0) },
      { key: "B", slug: "violet", name: "B — Violet (vivid average)", note: "hue 50/50 · chroma ×1.8", ramp: orchidBlend(0.5, 1.8) },
      { key: "C", slug: "orchid", name: "C — Orchid (grove's complement)", note: "hue 70% plum · chroma ×1.6", ramp: orchidBlend(0.7, 1.6), chosen: true },
      { key: "D", slug: "twilight", name: "D — Twilight (cool foil)", note: "hue 70% berry · chroma ×1.4", ramp: orchidBlend(0.3, 1.4) },
    ],
  },
  {
    id: "bloom",
    tab: "Bloom",
    shippedVar: "--juni-bloom-*",
    cMax: 0.15,
    lMin: 20,
    intro:
      "The teal, born by promoting the retired bonito trio to a full ramp — a point 30% toward the retired blue berry, 70% bonito. Bonito only existed as three stops, so its hues were interpolated onto the house lightness ladder. The straight blend honoring the trio's chroma spiked at the 500 step (the base anchor carries C 0.155) and was rejected for seamless easing: each candidate borrows the normalized chroma profile of an existing ramp. C (Reef, the brand ramp's profile at peak 0.105) shipped, completing a loose triad — needle ~130, bloom ~211, berry ~306. Shipped as \"reef\", renamed bloom in the juniper-anatomy pass.",
    chips: {
      kind: "beside",
      refs: [
        { label: "needle", ramp: GROVE },
        { label: "berry", ramp: ORCHID },
      ],
    },
    anchors: BONITO_TRIO,
    ramps: [
      { key: "needle", name: "needle (brand)", ramp: GROVE, style: "dotted" },
      { key: "berry-accent", name: "berry (accent)", ramp: ORCHID, style: "dotted" },
      { key: "old", name: "straight blend (rejected)", note: "trio chroma honored — spikes at the 500 step", ramp: REEF_OLD_BLEND, style: "dashed" },
      { key: "A", slug: "lagoon", name: "A — Lagoon (calm)", note: "the accent ramp's chroma profile · peak 0.10", ramp: reefBuild(ORCHID_PROFILE, 0.1) },
      { key: "B", slug: "bonito", name: "B — Bonito (parity)", note: "the accent ramp's chroma profile · peak 0.115", ramp: reefBuild(ORCHID_PROFILE, 0.115) },
      { key: "C", slug: "reef", name: "C — Reef", note: "the brand ramp's chroma profile · peak 0.105", ramp: reefBuild(GROVE_PROFILE, 0.105), chosen: true },
    ],
  },
  {
    id: "heartwood",
    tab: "Heartwood",
    shippedVar: "--juni-heartwood-*",
    cMax: 0.19,
    lMin: 15,
    intro:
      "The red family (destructive/error — the identity's only red), born by adjusting the retired momo, which peaked at C 0.18 against the trio's 0.10-0.12 and sat on its own darker lightness ladder. Four briefs were explored: sober it, pull it toward the oriole project's nectarine, re-seat its hue in the wheel gap the trio leaves open (~38), or tune it to sit legibly on the brand-green surfaces. 2 (Nectarine, pulled 60% toward oriole's ramp — gold-leaning tints, crimson depths) shipped on the house ladder at chroma ×0.85, as \"nectarine\"; renamed heartwood in the juniper-anatomy pass.",
    chips: { kind: "on", refs: [{ label: "needle", ramp: GROVE }] },
    ramps: [
      { key: "needle", name: "needle (brand)", ramp: GROVE, style: "dotted" },
      { key: "momo", name: "momo (retired)", ramp: MOMO, style: "dashed" },
      {
        key: "oriole",
        name: "nectarine (oriole project)",
        ramp: ORIOLE_NECTARINE.map((v) => [v[0], v[1], ((v[2] % 360) + 360) % 360]),
        style: "dashed",
      },
      { key: "1", slug: "sober", name: "1 — Sober", note: "momo hues · grove's chroma profile at peak 0.115", ramp: NECT_SOBER },
      { key: "2", slug: "nectarine", name: "2 — Nectarine", note: "60% toward oriole's nectarine · chroma ×0.85", ramp: NECT_CHOSEN, chosen: true },
      { key: "3", slug: "tetrad", name: "3 — Tetrad", note: "hue +18.7 so 500 lands at h38, the wheel gap's midpoint", ramp: NECT_TETRAD },
      { key: "4", slug: "overgrove", name: "4 — Over grove", note: "darker mids (500 at L58) for separation from grove surfaces", ramp: NECT_OVER },
    ],
  },
];
