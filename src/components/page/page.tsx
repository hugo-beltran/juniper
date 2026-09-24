import type { ComponentProps } from "react";
import { Heading, type HeadingProps } from "react-aria-components";
import { cn } from "@/lib/cn";
import styles from "./page.module.css";

/* Page chrome: the title and intro at the top of a route. Six route modules
 * restated the same h1-plus-muted-paragraph recipe, each with palette steps
 * in route CSS; theming §1.6 says a themed line in a route means a
 * component is missing, and this is that component. Compound like Sidebar
 * (component-architecture §4.1): the route arranges the parts, each part
 * owns its type and colour. */

export function PageHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header"
      className={cn(styles.header, className)}
      {...props}
    />
  );
}

/* react-aria Heading, h1 by default: a page has one title. */
export function PageTitle({
  className,
  level = 1,
  ...props
}: Omit<HeadingProps, "className"> & { className?: string }) {
  return (
    <Heading
      data-slot="page-title"
      level={level}
      className={cn(styles.title, className)}
      {...props}
    />
  );
}

export function PageDescription({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      data-slot="page-description"
      className={cn(styles.description, className)}
      {...props}
    />
  );
}
