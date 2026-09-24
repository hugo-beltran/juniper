import type { ComponentProps } from "react";
import { Heading, type HeadingProps } from "react-aria-components";
import { cn } from "@/lib/cn";
import styles from "./card.module.css";

/* Generic bordered surface container, with the shadcn Card's named parts
 * ported onto it (component-architecture §8): CardHeader, CardTitle,
 * CardDescription and CardFooter. CardContent is deliberately not ported:
 * Card already pads, and a content wrapper would only restate it. Card was
 * promoted out of the summary-card family when the SCOUT report timeline
 * became its second consumer; the parts arrived with the login screen,
 * whose title, intro and actions row were the first card chrome a route
 * had to style itself (theming §1.6: a themed line in a route means a
 * component is missing). */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card" className={cn(styles.card, className)} {...props} />
  );
}

/* Title over description, stacked. */
export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(styles.header, className)}
      {...props}
    />
  );
}

/* react-aria Heading: `level` picks the element. h2 by default; a card that
 * is the page's main content passes 1. */
export function CardTitle({
  className,
  level = 2,
  ...props
}: Omit<HeadingProps, "className"> & { className?: string }) {
  return (
    <Heading
      data-slot="card-title"
      level={level}
      className={cn(styles.title, className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(styles.description, className)}
      {...props}
    />
  );
}

/* A row of actions by default; a consumer that stacks its actions (the
 * login screen) extends it with its own class. */
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(styles.footer, className)}
      {...props}
    />
  );
}
