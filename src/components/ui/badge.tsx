/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 * Portions copyright (c) 2023 shadcn, from shadcn/ui (https://github.com/shadcn-ui/ui),
 * used under the MIT License.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Badge, styled as a compact "tag": small radius, dense padding, semantic intents.
 * `minimal` gives a tinted, low-emphasis version; `round` gives a pill shape.
 */
const badgeVariants = cva(
  "inline-flex w-fit min-h-5 max-w-full shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-1.5 py-px text-xs leading-4 whitespace-nowrap transition-[color,box-shadow,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        success: "",
        warning: "",
        destructive: "",
        outline: "border-border text-foreground [a&]:hover:bg-accent",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary-text underline-offset-4 [a&]:hover:underline",
      },
      minimal: { true: "", false: "" },
      round: { true: "rounded-full px-2", false: "" },
      size: {
        default: "",
        lg: "min-h-control-sm px-2 text-sm leading-5",
      },
    },
    compoundVariants: [
      { variant: "default", minimal: false, className: "bg-primary text-primary-foreground [a&]:hover:bg-primary-hover" },
      { variant: "secondary", minimal: false, className: "bg-[var(--bp-gray-1)] text-white dark:bg-[var(--bp-gray-4)] dark:text-[var(--bp-dark-gray-1)]" },
      { variant: "success", minimal: false, className: "bg-success text-success-foreground [a&]:hover:bg-success-hover" },
      { variant: "warning", minimal: false, className: "bg-warning text-warning-foreground [a&]:hover:bg-warning-hover" },
      { variant: "destructive", minimal: false, className: "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive-hover" },
      { variant: "default", minimal: true, className: "bg-primary/15 text-primary-text [a&]:hover:bg-primary/25" },
      { variant: "secondary", minimal: true, className: "bg-accent text-foreground [a&]:hover:bg-accent/70" },
      { variant: "success", minimal: true, className: "bg-success/15 text-success-text [a&]:hover:bg-success/25" },
      { variant: "warning", minimal: true, className: "bg-warning/15 text-warning-text [a&]:hover:bg-warning/25" },
      { variant: "destructive", minimal: true, className: "bg-destructive/15 text-destructive-text [a&]:hover:bg-destructive/25" },
    ],
    defaultVariants: {
      variant: "default",
      minimal: false,
      round: false,
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  minimal = false,
  round = false,
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, minimal, round, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
