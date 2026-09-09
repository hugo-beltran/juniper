import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import styles from "./card.module.css";

/* Generic bordered surface container. Lives in the summary-card family until
 * a second, unrelated component needs it — then promote. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card" className={cn(styles.card, className)} {...props} />
  );
}
