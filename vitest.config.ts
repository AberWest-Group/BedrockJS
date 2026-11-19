/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  test: { environment: "jsdom", css: false },
})
