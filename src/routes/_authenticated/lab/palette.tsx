import { createFileRoute } from "@tanstack/react-router";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { FAMILIES, oklch } from "./-palette/data";
import { FamilySection } from "./-palette/family-section";
import styles from "./ramp-lab.module.css";

export const Route = createFileRoute("/_authenticated/lab/palette")({
  component: PalettePage,
});

/* The palette lab: every chromatic family the identity ships, one tab each,
 * with the full exploration that produced it (retired sources, rejected
 * directions, candidates). Supersedes the per-ramp lab pages. */
function PalettePage() {
  return (
    <div className={styles.page}>
      <h1>Color Palette</h1>
      <p className={styles.sub}>
        The identity's five working colors, named for juniper anatomy and
        organized by function: needle is the brand (~130), bloom its
        complementary (~211), berry the accent (~292), heartwood the outlier and
        attention-catcher (~28), and bark the neutral for muted surfaces and
        plain content. Each chromatic family was consolidated from retired ramps
        during the 2026-09-08 explorations; every tab shows the shipped ramp and
        the archive of how it was chosen (under its exploration-era name).
      </p>
      <Tabs>
        <TabList aria-label="Palette families" className={styles.tabList}>
          {FAMILIES.map((family) => {
            const chosen = family.ramps.find((r) => r.chosen);
            return (
              <Tab key={family.id} id={family.id} className={styles.tab}>
                {chosen && (
                  <span
                    className={styles.tabDot}
                    style={{ background: oklch(chosen.ramp[5]) }}
                  />
                )}
                {family.tab}
              </Tab>
            );
          })}
        </TabList>
        {FAMILIES.map((family) => (
          <TabPanel key={family.id} id={family.id}>
            <FamilySection family={family} />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}
