/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "node:path"

// Dev server for trying components locally: npm run playground
export default defineConfig({
  root: resolve(import.meta.dirname, "playground"),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  build: { outDir: resolve(import.meta.dirname, "node_modules/.playground-dist"), emptyOutDir: true },
})
