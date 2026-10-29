/* Demo season review — fictional clubs, players and figures for the
 * Kingfisher tenant's Season page. Everything is generated from a seeded
 * random walk keyed by club and season, so a given view always draws the
 * same numbers (screenshots are stable) and no real data is carried. The
 * current season (2026) is in progress: it runs through August. Mock data
 * is demo-only and is not published in the registry. */

export const SEASONS = ["2024", "2025", "2026"] as const
export type Season = (typeof SEASONS)[number]

export const CLUBS = [
  "River Hawks",
  "Bayside Nine",
  "Cascade Pilots",
  "Copper Kings",
  "Dust Devils",
  "Harbor Cats",
  "Ironwood Foxes",
  "Northgate Owls",
] as const
export type Club = (typeof CLUBS)[number]

export const HALVES = ["first", "second"] as const
export type Half = (typeof HALVES)[number]

export const WIN_TARGET = 90
export const CAPACITY = 42_000

export interface Month {
  id: string
  label: string
  half: Half
  games: number
}

const CALENDAR: readonly Month[] = [
  { id: "apr", label: "Apr", half: "first", games: 26 },
  { id: "may", label: "May", half: "first", games: 28 },
  { id: "jun", label: "Jun", half: "first", games: 27 },
  { id: "jul", label: "Jul", half: "second", games: 26 },
  { id: "aug", label: "Aug", half: "second", games: 28 },
  { id: "sep", label: "Sep", half: "second", games: 27 },
]

export const HIT_TYPES = [
  { id: "single", label: "Singles" },
  { id: "double", label: "Doubles" },
  { id: "triple", label: "Triples" },
  { id: "homer", label: "Home runs" },
] as const
export type HitType = (typeof HIT_TYPES)[number]["id"]

export interface MonthReview extends Month {
  wins: number
  losses: number
  runsFor: number
  runsAgainst: number
  hits: Record<HitType, number>
  /** One figure per home game. */
  attendance: number[]
  /** Contract asks filed that month, in dollars. */
  asks: number[]
}

export interface Inning {
  id: string
  label: string
  hits: Record<HitType, number>
}

export interface Hitter {
  id: string
  name: string
  plateAppearances: number
  ops: number
  homers: number
  priorOps: number | null
}

export interface Pitcher {
  id: string
  name: string
  era: number
  priorEra: number | null
  /** ERA per month, null where the pitcher did not start. */
  byMonth: (number | null)[]
}

export interface Opponent {
  club: Club
  /** Win rate against the club per month, null where they did not meet. */
  byMonth: (number | null)[]
}

export interface Rate {
  id: string
  label: string
  made: number
  chances: number
  priorRate: number | null
}

export interface HomeAway {
  id: string
  label: string
  home: number
  away: number
  homePrior: number | null
  awayPrior: number | null
  kind: "perGame" | "average" | "era" | "count"
}

export interface SeasonReview {
  club: Club
  season: Season
  months: MonthReview[]
  innings: Inning[]
  hitters: Hitter[]
  pitchers: Pitcher[]
  opponents: Opponent[]
  rates: Rate[]
  homeAway: HomeAway[]
  wins: number
  losses: number
  /** The earlier season's wins, for the target bar's marker. */
  priorWins: number | null
  /** Wins the remaining games would add at the season's pace; 0 once it is over. */
  projectedWins: number
  playoffOdds: number
  priorPlayoffOdds: number | null
  attendanceAverage: number
}

/* A small string hash and a mulberry32 generator: enough to make the walk
 * repeatable per club and season. */
const hash = (text: string): number => {
  let h = 1779033703 ^ text.length
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return (h ^ (h >>> 16)) >>> 0
}

const generator = (seed: number) => {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (lo: number, hi: number, v: number) =>
  Math.min(hi, Math.max(lo, v))

const HITTERS = [
  "D. Castellanos",
  "M. Okonkwo",
  "J. Lindqvist",
  "R. Tanaka",
  "A. Whitfield",
  "S. Moreau",
  "T. Arroyo",
  "K. Osei",
  "L. Brennan",
]

const PITCHERS = [
  "C. Nakamura",
  "E. Halvorsen",
  "P. Delgado",
  "B. Achebe",
  "N. Ferreira",
  "G. Sorensen",
]

const RATES = [
  { id: "risp", label: "Runners in scoring position" },
  { id: "saves", label: "Save chances converted" },
  { id: "steals", label: "Stolen base attempts" },
  { id: "loaded", label: "Bases loaded" },
]

/** The months a season has played: all six, or through August for the one in progress. */
const monthsOf = (season: Season): readonly Month[] =>
  season === "2026" ? CALENDAR.slice(0, 5) : CALENDAR

/** How strong a club is in a season, 0.4 to 0.6: the win rate it plays around. */
const strengthOf = (club: Club, season: Season): number =>
  0.4 + 0.2 * generator(hash(`${club}/${season}/strength`))()

interface Core {
  strength: number
  months: MonthReview[]
  hitters: Hitter[]
  pitchers: Pitcher[]
  rates: Rate[]
  homeAway: HomeAway[]
  playoffOdds: number
}

/** The figures of one season on their own, without the earlier season's for comparison. */
const core = (club: Club, season: Season | "2023"): Core => {
  const random = generator(hash(`${club}/${season}`))
  const noise = (spread: number) => (random() - 0.5) * 2 * spread
  const strength =
    season === "2023"
      ? 0.4 + 0.2 * random()
      : strengthOf(club, season as Season)
  const calendar = season === "2023" ? CALENDAR : monthsOf(season as Season)

  const months: MonthReview[] = calendar.map((m) => {
    const rate = clamp(0.25, 0.75, strength + noise(0.09))
    const wins = Math.round(m.games * rate)
    const runsFor = Math.round(m.games * (3.6 + 2.2 * strength + noise(0.5)))
    const runsAgainst = Math.round(
      m.games * (5.4 - 2.2 * strength + noise(0.5)),
    )
    const hits = {
      single: Math.round(m.games * (5.4 + noise(0.6))),
      double: Math.round(m.games * (1.6 + noise(0.3))),
      triple: Math.round(m.games * (0.16 + noise(0.08))),
      homer: Math.round(m.games * (0.8 + 0.9 * strength + noise(0.25))),
    }
    const homeGames = Math.round(m.games / 2)
    const draw = CAPACITY * (0.5 + 0.45 * strength)
    const attendance = Array.from({ length: homeGames }, (_, i) =>
      Math.round(
        clamp(
          8_000,
          CAPACITY,
          draw * (i % 7 < 2 ? 1.12 : 0.92) * (1 + noise(0.14)),
        ),
      ),
    )
    const asks = Array.from(
      { length: 2 + Math.floor(random() * 5) },
      () => Math.round(10 ** (5.8 + random() * 1.8) / 10_000) * 10_000,
    )
    return {
      ...m,
      wins,
      losses: m.games - wins,
      runsFor,
      runsAgainst,
      hits,
      attendance,
      asks,
    }
  })

  const hitters: Hitter[] = HITTERS.map((name, i) => ({
    id: `h${i}`,
    name,
    // a regular's six hundred down to a bench bat's forty, spread by rank
    // on a log so the scatter's bubbles stand apart
    plateAppearances: Math.round(
      (calendar.length / 6) *
        10 ** (1.6 + 1.2 * ((i + 0.2 + random() * 0.6) / HITTERS.length)),
    ),
    ops: Number((0.58 + 0.34 * random() + 0.08 * strength).toFixed(3)),
    homers: Math.round((calendar.length / 6) * (2 + random() * 36)),
    priorOps: null,
  }))

  const pitchers: Pitcher[] = PITCHERS.map((name, i) => {
    const era = Number((5.6 - 2.6 * strength + noise(0.7)).toFixed(2))
    return {
      id: `p${i}`,
      name,
      era,
      priorEra: null,
      byMonth: calendar.map((_, m) =>
        i === 4 && m === 1
          ? null
          : Number(clamp(1.2, 8.5, era + noise(1.1)).toFixed(2)),
      ),
    }
  })

  const rates: Rate[] = RATES.map(({ id, label }) => {
    const chances = Math.round((calendar.length / 6) * (60 + random() * 260))
    const made = Math.round(
      chances * clamp(0.15, 0.9, 0.3 + 0.5 * strength + noise(0.15)),
    )
    return { id, label, made, chances, priorRate: null }
  })

  const edge = 0.04 + 0.08 * random()
  const perGame = 3.6 + 2.2 * strength
  const average = 0.235 + 0.06 * strength
  const era = 5.4 - 2.2 * strength
  const crowd = CAPACITY * (0.5 + 0.45 * strength)
  const homeAway: HomeAway[] = [
    {
      id: "runs",
      label: "Runs per game",
      home: Number((perGame * (1 + edge)).toFixed(2)),
      away: Number((perGame * (1 - edge)).toFixed(2)),
      homePrior: null,
      awayPrior: null,
      kind: "perGame",
    },
    {
      id: "average",
      label: "Batting average",
      home: Number((average * (1 + edge / 2)).toFixed(3)),
      away: Number((average * (1 - edge / 2)).toFixed(3)),
      homePrior: null,
      awayPrior: null,
      kind: "average",
    },
    {
      id: "era",
      label: "Earned run average",
      home: Number((era * (1 - edge)).toFixed(2)),
      away: Number((era * (1 + edge)).toFixed(2)),
      homePrior: null,
      awayPrior: null,
      kind: "era",
    },
    {
      id: "crowd",
      label: "Average crowd",
      home: Math.round(crowd),
      away: Math.round(crowd * (0.7 + noise(0.1))),
      homePrior: null,
      awayPrior: null,
      kind: "count",
    },
  ]

  const playoffOdds = clamp(0.03, 0.97, (strength - 0.4) * 4.5 + noise(0.08))

  return { strength, months, hitters, pitchers, rates, homeAway, playoffOdds }
}

/** The season before, for the earlier figures every chart marks. */
const priorOf = (season: Season): Season | "2023" =>
  season === "2024" ? "2023" : season === "2025" ? "2024" : "2025"

/* A club's season with the earlier season's figures folded in where a
 * chart marks them: hitters' and pitchers' earlier rates, the conversion
 * rates, the home and away measures, the playoff odds. */
export function seasonReview(club: Club, season: Season): SeasonReview {
  const now = core(club, season)
  const before = core(club, priorOf(season))
  const random = generator(hash(`${club}/${season}/innings`))
  const noise = (spread: number) => (random() - 0.5) * 2 * spread

  const totals = (key: HitType) =>
    now.months.reduce((sum, m) => sum + m.hits[key], 0)
  const innings: Inning[] = Array.from({ length: 9 }, (_, i) => ({
    id: `${i + 1}`,
    label: `${i + 1}`,
    hits: {
      single: Math.round((totals("single") / 9) * (1 + noise(0.18))),
      double: Math.round((totals("double") / 9) * (1 + noise(0.25))),
      triple: Math.round((totals("triple") / 9) * (1 + noise(0.5))),
      homer: Math.round((totals("homer") / 9) * (1 + noise(0.3))),
    },
  }))

  const opponents: Opponent[] = CLUBS.filter((c) => c !== club).map((other) => {
    const theirs = strengthOf(other, season)
    return {
      club: other,
      byMonth: now.months.map(() => {
        const games = Math.round(1 + random() * 3)
        if (games === 0 || random() < 0.06) return null
        const rate = clamp(
          0,
          1,
          0.5 + (now.strength - theirs) * 2 + noise(0.25),
        )
        return Math.round(rate * games) / games
      }),
    }
  })

  const wins = now.months.reduce((sum, m) => sum + m.wins, 0)
  const losses = now.months.reduce((sum, m) => sum + m.losses, 0)
  const played = wins + losses
  const remaining = CALENDAR.reduce((sum, m) => sum + m.games, 0) - played
  const projectedWins = played > 0 ? Math.round((remaining * wins) / played) : 0
  const crowd = now.months.flatMap((m) => m.attendance)
  const attendanceAverage = Math.round(
    crowd.reduce((sum, a) => sum + a, 0) / Math.max(1, crowd.length),
  )

  return {
    club,
    season,
    months: now.months,
    innings,
    hitters: now.hitters.map((h, i) => ({
      ...h,
      priorOps: before.hitters[i]?.ops ?? null,
    })),
    pitchers: now.pitchers.map((p, i) => ({
      ...p,
      priorEra: before.pitchers[i]?.era ?? null,
    })),
    opponents,
    rates: now.rates.map((r, i) => {
      const earlier = before.rates[i]
      return {
        ...r,
        priorRate: earlier ? earlier.made / earlier.chances : null,
      }
    }),
    homeAway: now.homeAway.map((row, i) => ({
      ...row,
      homePrior: before.homeAway[i]?.home ?? null,
      awayPrior: before.homeAway[i]?.away ?? null,
    })),
    wins,
    losses,
    priorWins: before.months.reduce((sum, m) => sum + m.wins, 0),
    projectedWins,
    playoffOdds: now.playoffOdds,
    priorPlayoffOdds: before.playoffOdds,
    attendanceAverage,
  }
}

/** The quartiles and range of a set of figures, for a box. */
export function spread(values: readonly number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const at = (q: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0
  return {
    low: sorted[0] ?? 0,
    q1: at(0.25),
    median: at(0.5),
    q3: at(0.75),
    high: sorted[sorted.length - 1] ?? 0,
    count: sorted.length,
  }
}
