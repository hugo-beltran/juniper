import { ArrowRightIcon } from "@heroicons/react/24/outline"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import {
  Button,
  Card,
  Input,
  PageDescription,
  PageHeader,
  PageTitle,
  Select,
  type SelectOption,
  Switch,
  Textarea,
} from "@/components"
import styles from "./forms.module.css"

export const Route = createFileRoute("/_authenticated/lab/forms")({
  component: FormsPage,
})

/* Forms lab — every form primitive the registry publishes, in every state,
 * side by side: the three Button faces, Input, Textarea and Select at the
 * three shared sizes, with description, error and disabled states. A
 * reference for discussing the controls, not a shipped screen; the route
 * owns layout and demo state only. */

const CLUBS: SelectOption[] = [
  { value: "bayside", label: "Bayside Nine", hint: "12" },
  { value: "copper", label: "Copper Kings", hint: "7" },
  { value: "river", label: "River Hawks", hint: "3" },
  { value: "harbor", label: "Harbor Cats", hint: "9" },
]

const POSITIONS: SelectOption[] = [
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "OF",
  "DH",
  "UTL",
  "SP",
  "RP",
].map((p) => ({ value: p, label: p }))

const SIZES = ["mini", "small", "medium"] as const

function FormsPage() {
  const [club, setClub] = useState("")
  const [position, setPosition] = useState("")
  const [name, setName] = useState("")
  const [note, setNote] = useState("")
  const [rowValues, setRowValues] = useState<Record<string, string>>({})
  const [pendingOnly, setPendingOnly] = useState(false)
  const [notify, setNotify] = useState(true)

  return (
    <div className={styles.page}>
      <PageHeader>
        <PageTitle>Forms</PageTitle>
        <PageDescription>
          The form primitives — Button, Input, Textarea, Select, Switch — and
          the Field chrome they share, in every state. Hover, focus, press and
          type into each one; toggle the colour mode to check both branches.
          Every control is a registry entry; this page only arranges them.
        </PageDescription>
      </PageHeader>

      <section className={styles.grid}>
        <Card className={styles.card}>
          <h2>Button · variants</h2>
          <p className={styles.note}>
            Primary is the glass pane. Secondary is extruded like a field and
            sinks when pressed. Discrete is flat text until touched: bloom wash
            on hover, inset when pressed. The last one is a router Link wearing
            the button through <code>asChild</code>.
          </p>
          <div className={styles.row}>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="discrete">Discrete</Button>
            <Button variant="secondary" asChild>
              <Link to="/lab/lift">
                Lift lab <ArrowRightIcon />
              </Link>
            </Button>
          </div>
          <div className={styles.row}>
            <Button isDisabled>Primary</Button>
            <Button variant="secondary" isDisabled>
              Secondary
            </Button>
            <Button variant="discrete" isDisabled>
              Discrete
            </Button>
          </div>
        </Card>

        <Card className={styles.card}>
          <h2>One row, one size</h2>
          <p className={styles.note}>
            Field sizes mirror Button's heights (mini 1.75rem, small 2rem,
            medium 2.5rem), so a field, a select and a button sit on one row
            when they share a size name.
          </p>
          {SIZES.map((size) => (
            <div key={size} className={styles.row}>
              <Input
                label={`Player · ${size}`}
                size={size}
                placeholder="e.g. R. Ibarra"
                value={rowValues[`${size}-name`] ?? ""}
                onChange={(value) =>
                  setRowValues((v) => ({ ...v, [`${size}-name`]: value }))
                }
              />
              <Select
                label="Position"
                size={size}
                options={POSITIONS}
                value={rowValues[`${size}-pos`] ?? ""}
                onChange={(value) =>
                  setRowValues((v) => ({ ...v, [`${size}-pos`]: value }))
                }
              />
              <Button size={size} variant="secondary">
                Add
              </Button>
            </div>
          ))}
        </Card>

        <Card className={styles.card}>
          <h2>Input</h2>
          <p className={styles.note}>
            Extruded at rest, bloom hairline on hover, sinks while focused.
            Description and error come from Field and land in aria-describedby;
            the error is heartwood, the identity's only red.
          </p>
          <div className={styles.stack}>
            <Input
              label="Player"
              placeholder="e.g. R. Ibarra"
              value={name}
              onChange={setName}
              description="Last name first if the card reads that way."
            />
            <Input
              label="Ask"
              placeholder="e.g. $4.5M"
              value=""
              onChange={() => {}}
              isRequired
              isInvalid
              errorMessage="Required"
            />
            <Input
              label="Password"
              type="password"
              value="hunter2"
              onChange={() => {}}
            />
            <Input
              label="Scout"
              value="M. Okafor"
              onChange={() => {}}
              isDisabled
            />
          </div>
        </Card>

        <Card className={styles.card}>
          <h2>Textarea</h2>
          <p className={styles.note}>
            Same material and states as Input; vertical resize only, height from{" "}
            <code>rows</code>. The title label variant is for a field that heads
            its own card, as in the SCOUT report.
          </p>
          <div className={styles.stack}>
            <Textarea
              label="Skillset"
              labelVariant="title"
              placeholder="What are the tools? Hit, power, speed, arm, glove…"
              value={note}
              onChange={setNote}
            />
            <Textarea
              label="Character"
              rows={2}
              value=""
              onChange={() => {}}
              isInvalid
              errorMessage="Say something about makeup before filing."
            />
          </div>
        </Card>

        <Card className={styles.card}>
          <h2>Select · form</h2>
          <p className={styles.note}>
            A placeholder until a choice is made; a filled form select stays
            neutral. The popover is the sanctioned anchored picker: flush
            beneath the trigger, at its width, on the same material.
          </p>
          <div className={styles.stack}>
            <Select
              label="Position"
              options={POSITIONS}
              value={position}
              onChange={setPosition}
              isRequired
              isInvalid={position === ""}
              errorMessage="Pick a position"
              description="Thirteen options: scroll or type to jump."
            />
            <Select
              label="Grade"
              options={[{ value: "60", label: "60 · plus" }]}
              value="60"
              onChange={() => {}}
              isDisabled
            />
          </div>
        </Card>

        <Card className={styles.card}>
          <h2>Switch</h2>
          <p className={styles.note}>
            An extruded track at the small-control offsets, inset while pressed;
            bloom on hover, needle when on. The title names the switch and the
            hint describes it, so the two lines are never read as one name.
          </p>
          <div className={styles.stack}>
            <Switch
              label="Pending analysis only"
              description="Leads scouted but not yet graded"
              isSelected={pendingOnly}
              onChange={setPendingOnly}
            />
            <Switch
              label="Notify on new leads"
              isSelected={notify}
              onChange={setNotify}
            />
            <Switch label="Archived tenants" isDisabled />
          </div>
        </Card>

        <Card className={styles.card}>
          <h2>Select · filter</h2>
          <p className={styles.note}>
            <code>isClearable</code>: the placeholder is a real "any" row, a
            clear × appears while a value is set, and the trigger wears the
            needle wash to say a filter is applied. Hints stay in the list.
          </p>
          <div className={styles.row}>
            <Select
              label="Club"
              size="mini"
              isClearable
              placeholder="Any club"
              options={CLUBS}
              value={club}
              onChange={setClub}
            />
            <Button
              size="mini"
              variant="discrete"
              isDisabled={club === ""}
              onPress={() => setClub("")}
            >
              Clear all
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
