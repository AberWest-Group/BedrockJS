import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Alert, styled as a "callout": a tinted, borderless panel whose icon and title take
 * the intent colour. Use `variant` for the intent.
 */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-md px-[15px] py-[10px] text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-[10px] [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-accent text-foreground [&>svg]:text-muted-foreground",
        primary:
          "bg-primary/10 text-foreground [&>svg]:text-primary-text *:data-[slot=alert-title]:text-primary-text",
        success:
          "bg-success/10 text-foreground [&>svg]:text-success-text *:data-[slot=alert-title]:text-success-text",
        warning:
          "bg-warning/10 text-foreground [&>svg]:text-warning-text *:data-[slot=alert-title]:text-warning-text",
        destructive:
          "bg-destructive/10 text-foreground [&>svg]:text-destructive-text *:data-[slot=alert-title]:text-destructive-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-semibold", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-normal",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
