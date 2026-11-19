/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 * Portions copyright (c) 2023 shadcn, from shadcn/ui (https://github.com/shadcn-ui/ui),
 * used under the MIT License.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
