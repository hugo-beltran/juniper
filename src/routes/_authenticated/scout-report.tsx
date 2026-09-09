import { useState } from "react";
import { Blobatar } from "@blobatar/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Input, Label, TextArea, TextField } from "react-aria-components";
import { Button, Card } from "@/components";
import { blobatarPalette } from "@/lib/blobatar-palette";
import styles from "./scout-report.module.css";

export const Route = createFileRoute("/_authenticated/scout-report")({
  component: ScoutReportPage,
});

/* SCOUT report — the demo's stand-in for the qualitative-notes wizard:
 * acronym-keyed dimensions filed in a deliberate order (hence the timeline),
 * plus structured basics, producing a new pipeline entry. No persistence:
 * filing shows a confirmation and the state resets on reload. */

const DIMENSIONS = [
  {
    letter: "S",
    title: "Skillset",
    placeholder:
      "What are the tools? Hit, power, speed, arm, glove — what stands out, what's fringe?",
  },
  {
    letter: "C",
    title: "Character",
    placeholder:
      "Makeup and coachability. How do they respond to failure? Clubhouse reputation?",
  },
  {
    letter: "O",
    title: "Outlook",
    placeholder:
      "Realistic role projection — everyday starter, platoon, bullpen arm? What's the floor?",
  },
  {
    letter: "U",
    title: "Upside",
    placeholder:
      "The ceiling if development breaks right — and what has to click to get there.",
  },
  {
    letter: "T",
    title: "Team fit",
    placeholder:
      "Where do they fit our roster and timeline? Which current player do they push?",
  },
] as const;

const POSITIONS = [
  "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "OF", "DH", "UTL", "SP", "RP",
];

const EMPTY_NOTES = Object.fromEntries(
  DIMENSIONS.map((d) => [d.letter, ""]),
) as Record<string, string>;

function ScoutReportPage() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState("");
  const [position, setPosition] = useState("");
  const [club, setClub] = useState("");
  const [ask, setAsk] = useState("");
  const [notes, setNotes] = useState(EMPTY_NOTES);
  const [attempted, setAttempted] = useState(false);
  const [filed, setFiled] = useState(false);

  const filledCount = DIMENSIONS.filter(
    (d) => notes[d.letter].trim() !== "",
  ).length;
  const nextIndex = DIMENSIONS.findIndex((d) => notes[d.letter].trim() === "");

  const basicsValid =
    player.trim() !== "" && position !== "" && club.trim() !== "";


  const fileReport = () => {
    if (!basicsValid) {
      setAttempted(true);
      return;
    }
    setFiled(true);
  };

  if (filed) {
    return (
      <div className={styles.page}>
        <Card className={styles.confirmation}>
          <Blobatar
            name={player}
            palette={blobatarPalette(player)}
            size={56}
          />
          <h1>Report filed</h1>
          <p className={styles.sub}>
            <strong>{player}</strong> ({position} · {club}) enters the pipeline
            at <strong>Scouted</strong>
            {ask.trim() !== "" && <> with an ask of {ask}</>}, with{" "}
            {filledCount} of {DIMENSIONS.length} SCOUT dimensions on file.
          </p>
          <Button onPress={() => navigate({ to: "/dashboard" })}>
            Back to pipeline
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>SCOUT Report</h1>
      <p className={styles.sub}>
        File a prospect in five reads, in order — Skillset, Character, Outlook,
        Upside, Team fit. A report is only as strong as its sequence: each read
        builds on the one before it.
      </p>

      <ul className={styles.guides}>
        <li>Lead with what you saw, not what you heard — dates and games.</li>
        <li>Grade the tool, then the player: separate present from projection.</li>
        <li>End every dimension with the one sentence a GM could act on.</li>
      </ul>

      <Card className={styles.basics}>
        <div className={styles.basicsGrid}>
          <TextField
            className={styles.field}
            value={player}
            onChange={setPlayer}
            isRequired
          >
            <Label className={styles.label}>Player</Label>
            <Input className={styles.input} placeholder="e.g. R. Ibarra" />
            {attempted && player.trim() === "" && (
              <span className={styles.required}>Required</span>
            )}
          </TextField>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="scout-position">
              Position
            </label>
            <select
              id="scout-position"
              className={styles.select}
              value={position}
              onChange={(event) => setPosition(event.target.value)}
            >
              <option value="">Select…</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {attempted && position === "" && (
              <span className={styles.required}>Required</span>
            )}
          </div>
          <TextField
            className={styles.field}
            value={club}
            onChange={setClub}
            isRequired
          >
            <Label className={styles.label}>Club</Label>
            <Input className={styles.input} placeholder="e.g. Harbor Cats" />
            {attempted && club.trim() === "" && (
              <span className={styles.required}>Required</span>
            )}
          </TextField>
          <TextField className={styles.field} value={ask} onChange={setAsk}>
            <Label className={styles.label}>Ask</Label>
            <Input className={styles.input} placeholder="e.g. $4.5M" />
          </TextField>
        </div>
      </Card>

      <ol className={styles.timeline}>
        {DIMENSIONS.map((d, index) => {
          const filledNote = notes[d.letter].trim() !== "";
          return (
            <li
              key={d.letter + index}
              className={styles.node}
              data-filled={filledNote || undefined}
              data-next={index === nextIndex || undefined}
            >
              <span className={styles.medallion} aria-hidden>
                {d.letter}
              </span>
              <Card className={styles.dimension}>
                <TextField
                  className={styles.field}
                  value={notes[d.letter]}
                  onChange={(value) =>
                    setNotes((current) => ({ ...current, [d.letter]: value }))
                  }
                >
                  <Label className={styles.dimensionTitle}>{d.title}</Label>
                  <TextArea
                    className={styles.noteArea}
                    placeholder={d.placeholder}
                    rows={3}
                  />
                </TextField>
              </Card>
            </li>
          );
        })}
      </ol>

      <div className={styles.actions}>
        <Button onPress={fileReport}>File report</Button>
        <Button
          variant="discrete"
          onPress={() => navigate({ to: "/dashboard" })}
        >
          Discard
        </Button>
        {attempted && !basicsValid && (
          <span className={styles.required}>
            Player, position, and club are required.
          </span>
        )}
      </div>
    </div>
  );
}
