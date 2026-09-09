import { STEPS, oklch, type Family, type Oklch, type RampDef } from "./data";
import styles from "../ramp-lab.module.css";

/* Renders one palette family's tab panel: the shipped ramp, the exploration
 * strips (with pairing/legibility chips on candidates), the chroma-vs-
 * lightness chart, and the candidates' oklch values. */

const swatchText = (l: number) =>
  l > 62 ? "oklch(25% 0.01 80)" : "oklch(96% 0.005 80)";

function Strip({ ramp }: { ramp: Oklch[] }) {
  return (
    <div className={styles.strip}>
      {ramp.map((v, i) => (
        <div
          key={STEPS[i]}
          className={styles.swatch}
          style={{ background: oklch(v), color: swatchText(v[0]) }}
        >
          {STEPS[i]}
        </div>
      ))}
    </div>
  );
}

/* Candidate steps sitting directly beside the shipped families. */
function BesideChips({ family, ramp }: { family: Family; ramp: Oklch[] }) {
  const refs = family.chips?.refs ?? [];
  return (
    <div className={styles.pairs}>
      {[2, 5, 7].map((i) => (
        <span key={STEPS[i]} className={styles.pair}>
          {refs.map((r) => (
            <i key={r.label} style={{ background: oklch(r.ramp[i]) }} />
          ))}
          <i style={{ background: oklch(ramp[i]) }} />
          <small>{STEPS[i]}</small>
        </span>
      ))}
      <small className={styles.pairKey}>
        {refs.map((r) => r.label).join(" | ")} | candidate
      </small>
    </div>
  );
}

/* The candidate rendered ON the reference ramp's surfaces — the sidebar
 * test: an alert badge on light, mid, and dark backgrounds. */
function OnChips({ family, ramp }: { family: Family; ramp: Oklch[] }) {
  const bg = family.chips?.refs[0];
  if (!bg) return null;
  const combos: [Oklch, Oklch][] = [
    [bg.ramp[1], ramp[6]],
    [bg.ramp[4], ramp[1]],
    [bg.ramp[8], ramp[3]],
  ];
  return (
    <div className={styles.pairs}>
      {combos.map(([surface, fg], i) => (
        <span
          key={i}
          className={styles.overChip}
          style={{ background: oklch(surface), color: oklch(fg) }}
        >
          <i style={{ background: oklch(fg) }} />
          Alert
        </span>
      ))}
      <small className={styles.pairKey}>on {bg.label}-100 / 400 / 800</small>
    </div>
  );
}

const W = 820;
const H = 440;
const MARGIN = { t: 18, r: 16, b: 46, l: 56 };

function Chart({ family }: { family: Family }) {
  const x = (l: number) =>
    MARGIN.l + ((100 - l) / (100 - family.lMin)) * (W - MARGIN.l - MARGIN.r);
  const y = (c: number) =>
    H -
    MARGIN.b -
    (Math.min(c, family.cMax) / family.cMax) * (H - MARGIN.t - MARGIN.b);

  const lTicks = [];
  for (let l = 100; l >= family.lMin; l -= 10) lTicks.push(l);
  const cTicks = [];
  for (let c = 0; c <= family.cMax + 1e-6; c += 0.03) cTicks.push(c);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={`Chroma versus lightness curves for the ${family.tab} exploration`}
    >
      {lTicks.map((l) => (
        <g key={l}>
          <line
            className={styles.grid}
            x1={x(l)}
            y1={MARGIN.t}
            x2={x(l)}
            y2={H - MARGIN.b}
          />
          <text
            className={styles.tick}
            x={x(l)}
            y={H - MARGIN.b + 18}
            textAnchor="middle"
          >
            {l}
          </text>
        </g>
      ))}
      {cTicks.map((c) => (
        <g key={c}>
          <line
            className={styles.grid}
            x1={MARGIN.l}
            y1={y(c)}
            x2={W - MARGIN.r}
            y2={y(c)}
          />
          <text
            className={styles.tick}
            x={MARGIN.l - 8}
            y={y(c) + 4}
            textAnchor="end"
          >
            {c.toFixed(2)}
          </text>
        </g>
      ))}
      <text
        className={styles.axisLabel}
        x={(MARGIN.l + W - MARGIN.r) / 2}
        y={H - 8}
        textAnchor="middle"
      >
        Lightness (%) — 50 step on the left, 950 on the right
      </text>
      <text
        className={styles.axisLabel}
        x={14}
        y={(MARGIN.t + H - MARGIN.b) / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${(MARGIN.t + H - MARGIN.b) / 2})`}
      >
        Chroma
      </text>
      {family.ramps.map((r) => {
        const stroke = oklch(r.ramp[5]);
        const quiet = r.style !== undefined;
        return (
          <g key={r.key}>
            <polyline
              points={r.ramp.map((v) => `${x(v[0])},${y(v[1])}`).join(" ")}
              fill="none"
              stroke={stroke}
              strokeWidth={quiet ? 1.75 : 2.75}
              strokeDasharray={
                r.style === "dashed"
                  ? "5 5"
                  : r.style === "dotted"
                    ? "2 4"
                    : undefined
              }
              strokeLinecap="round"
            />
            {r.ramp.map((v, i) => (
              <circle
                key={STEPS[i]}
                cx={x(v[0])}
                cy={y(v[1])}
                r={quiet ? 2.5 : 3.5}
                fill={stroke}
              />
            ))}
          </g>
        );
      })}
      {family.anchors?.map(({ label, value }) => (
        <g key={label}>
          <rect
            x={x(value[0]) - 4}
            y={y(value[1]) - 4}
            width={8}
            height={8}
            transform={`rotate(45 ${x(value[0])} ${y(value[1])})`}
            fill={oklch(value)}
            stroke="oklch(40% 0.02 195)"
            strokeWidth={1}
          />
          <text
            className={styles.tick}
            x={x(value[0])}
            y={y(value[1]) - 9}
            textAnchor="middle"
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

const isCandidate = (r: RampDef) => r.slug !== undefined && !r.style;

function valuesListing(family: Family) {
  return family.ramps
    .filter(isCandidate)
    .map(
      (r) =>
        `/* ${r.name}${r.chosen ? ` — shipped as ${family.shippedVar}` : ""} · ${r.note} */\n` +
        r.ramp
          .map((v, i) => `  --juni-${r.slug}-${STEPS[i]}: ${oklch(v)};`)
          .join("\n"),
    )
    .join("\n\n");
}

export function FamilySection({ family }: { family: Family }) {
  const chosen = family.ramps.find((r) => r.chosen);
  if (!chosen) return null;

  /* A family with only its shipped ramp (bark) has no archive to show. */
  const hasExploration =
    family.anchors !== undefined || family.ramps.some((r) => !r.chosen);

  return (
    <>
      <p className={styles.sub}>{family.intro}</p>

      <div className={styles.ramp}>
        <div className={styles.rampName}>
          {family.shippedVar}
          <span className={styles.badge}>current</span>
          <small>{family.role}</small>
        </div>
        <Strip ramp={chosen.ramp} />
      </div>

      {hasExploration && (
        <>
          <h2>Exploration</h2>
          {family.anchors && (
            <div className={styles.ramp}>
              <div className={styles.rampName}>
                bonito trio (retired)
                <small>the three accent anchors being promoted</small>
              </div>
              <div className={`${styles.strip} ${styles.trioStrip}`}>
                {family.anchors.map(({ label, value }) => (
                  <div
                    key={label}
                    className={styles.swatch}
                    style={{
                      background: oklch(value),
                      color: swatchText(value[0]),
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
          {family.ramps.map((r) => (
            <div key={r.key} className={styles.ramp}>
              <div className={styles.rampName}>
                {r.name}
                {r.chosen && (
                  <span className={styles.badge}>
                    shipped as{" "}
                    {family.shippedVar.replace("--juni-", "").replace("-*", "")}
                  </span>
                )}
                {r.note && <small>{r.note}</small>}
              </div>
              <Strip ramp={r.ramp} />
              {isCandidate(r) &&
                family.chips &&
                (family.chips.kind === "beside" ? (
                  <BesideChips family={family} ramp={r.ramp} />
                ) : (
                  <OnChips family={family} ramp={r.ramp} />
                ))}
            </div>
          ))}

          <h2>Chroma vs lightness</h2>
          <div className={styles.chartCard}>
            <div className={styles.legend}>
              {family.ramps.map((r) => (
                <span key={r.key}>
                  <span
                    className={
                      r.style === "dashed"
                        ? styles.chipDashed
                        : r.style === "dotted"
                          ? styles.chipDotted
                          : styles.chip
                    }
                    style={{ borderColor: oklch(r.ramp[5]) }}
                  />
                  {r.name}
                </span>
              ))}
            </div>
            <Chart family={family} />
          </div>
        </>
      )}

      <h2>oklch values</h2>
      <pre className={styles.values}>{valuesListing(family)}</pre>
    </>
  );
}
