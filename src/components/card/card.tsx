import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import styles from "./card.module.css";

/* Generic bordered surface container. Promoted out of the summary-card
 * family when the SCOUT report timeline became its second consumer. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card" className={cn(styles.card, className)} {...props} />
  );
}
