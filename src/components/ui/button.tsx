import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Buttons follow the Bedrock (Blueprint-style) design language:
 * - `variant` picks the semantic intent: default (primary), secondary (neutral),
 *   success, warning, destructive.
 * - `appearance` picks how loud it is: solid (filled), outlined, minimal (no chrome).
 * - `ghost`, `outline` and `link` variants are kept for shadcn/ui compatibility.
 */
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-[7px] rounded-md text-sm font-normal whitespace-nowrap select-none transition-[background-color,box-shadow,color] duration-100 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        success: "",
        warning: "",
        destructive: "",
        outline:
          "bg-transparent shadow-[inset_0_0_0_1px_var(--input)] hover:bg-accent active:bg-accent/70",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/70",
        link: "h-auto px-0 text-primary-text underline-offset-4 hover:underline",
      },
      appearance: {
        solid: "",
        outlined: "bg-transparent",
        minimal: "bg-transparent",
      },
      size: {
        default: "h-control min-w-control px-[10px] has-[>svg]:px-[7px]",
        xs: "h-5 min-w-5 gap-1 px-1.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-control-sm min-w-control-sm gap-[5px] px-[7px] has-[>svg]:px-[5px]",
        lg: "h-control-lg min-w-control-lg px-[15px] text-base has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-control",
        "icon-xs": "size-5 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-control-sm",
        "icon-lg": "size-control-lg [&_svg:not([class*='size-'])]:size-5",
      },
      fill: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      // ---- solid ----
      {
        variant: "default",
        appearance: "solid",
        className:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active",
      },
      {
        variant: "secondary",
        appearance: "solid",
        className:
          "bg-secondary text-secondary-foreground shadow-[inset_0_0_0_1px_var(--border),0_1px_2px_rgba(17,20,24,0.1)] hover:bg-secondary-hover active:bg-accent",
      },
      {
        variant: "success",
        appearance: "solid",
        className:
          "bg-success text-success-foreground shadow-sm hover:bg-success-hover active:brightness-90",
      },
      {
        variant: "warning",
        appearance: "solid",
        className:
          "bg-warning text-warning-foreground shadow-sm hover:bg-warning-hover hover:text-white active:brightness-90",
      },
      {
        variant: "destructive",
        appearance: "solid",
        className:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive-hover active:brightness-90",
      },
      // ---- outlined ----
      {
        variant: "default",
        appearance: "outlined",
        className:
          "text-primary-text shadow-[inset_0_0_0_1px_var(--primary)] hover:bg-primary/10 active:bg-primary/20",
      },
      {
        variant: "secondary",
        appearance: "outlined",
        className:
          "text-foreground shadow-[inset_0_0_0_1px_var(--input)] hover:bg-accent active:bg-accent/70",
      },
      {
        variant: "success",
        appearance: "outlined",
        className:
          "text-success-text shadow-[inset_0_0_0_1px_var(--success)] hover:bg-success/10 active:bg-success/20",
      },
      {
        variant: "warning",
        appearance: "outlined",
        className:
          "text-warning-text shadow-[inset_0_0_0_1px_var(--warning)] hover:bg-warning/10 active:bg-warning/20",
      },
      {
        variant: "destructive",
        appearance: "outlined",
        className:
          "text-destructive-text shadow-[inset_0_0_0_1px_var(--destructive)] hover:bg-destructive/10 active:bg-destructive/20",
      },
      // ---- minimal ----
      {
        variant: "default",
        appearance: "minimal",
        className: "text-primary-text hover:bg-primary/10 active:bg-primary/20",
      },
      {
        variant: "secondary",
        appearance: "minimal",
        className: "text-foreground hover:bg-accent active:bg-accent/70",
      },
      {
        variant: "success",
        appearance: "minimal",
        className: "text-success-text hover:bg-success/10 active:bg-success/20",
      },
      {
        variant: "warning",
        appearance: "minimal",
        className: "text-warning-text hover:bg-warning/10 active:bg-warning/20",
      },
      {
        variant: "destructive",
        appearance: "minimal",
        className:
          "text-destructive-text hover:bg-destructive/10 active:bg-destructive/20",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "solid",
      size: "default",
      fill: false,
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Shows a spinner, disables the button, and keeps its width stable. */
    loading?: boolean
  }

function Button({
  className,
  variant = "default",
  appearance = "solid",
  size = "default",
  fill = false,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-appearance={appearance}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, appearance, size, fill, className }))}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            </span>
          )}
          {loading ? (
            <span className="invisible contents">{children}</span>
          ) : (
            children
          )}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
