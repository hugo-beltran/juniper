import { clsx, type ClassValue } from 'clsx'

/* shadcn-style class combiner. Without Tailwind there are no utility-class
 * conflicts to merge, so clsx alone is enough (no tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
