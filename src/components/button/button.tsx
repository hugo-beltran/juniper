import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import styles from './button.module.css'

/* shadcn-style button on the react-aria Button primitive (onPress/isDisabled
 * semantics). Callers pass intent props: `variant` and `size` — never class
 * names. No destructive variant yet: the jn palette has no red scale. */

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.primary,
      secondary: styles.secondary,
      discrete: styles.discrete,
    },
    size: {
      mini: styles.mini,
      small: styles.small,
      medium: styles.medium,
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
})

export interface ButtonProps
  extends Omit<AriaButtonProps, 'className'>,
    VariantProps<typeof buttonVariants> {
  className?: string
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      data-slot="button"
      data-variant={variant ?? 'primary'}
      data-size={size ?? 'medium'}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
