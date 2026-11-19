/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 * Portions copyright (c) 2023 shadcn, from shadcn/ui (https://github.com/shadcn-ui/ui),
 * used under the MIT License.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

"use client"

import * as React from "react"
import { Direction } from "radix-ui"

function DirectionProvider({
  dir,
  direction,
  children,
}: React.ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"]
}) {
  return (
    <Direction.DirectionProvider dir={direction ?? dir}>
      {children}
    </Direction.DirectionProvider>
  )
}

const useDirection = Direction.useDirection

export { DirectionProvider, useDirection }
