/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import dts from "vite-plugin-dts"
import { resolve } from "node:path"
import pkg from "./package.json" with { type: "json" }

const external = [
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.dependencies ?? {}),
]

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ tsconfigPath: "./tsconfig.build.json", entryRoot: "src" }),
  ],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      cssFileName: "styles",
    },
    rollupOptions: {
      // Keep react, radix, etc. out of the bundle: consumers install them.
      external: (id) =>
        id === "react/jsx-runtime" ||
        external.some((dep) => id === dep || id.startsWith(dep + "/")),
      output: {
        // Licence notice on the published bundles (source comments are stripped by the bundler).
        banner: [
          "/*!",
          ` * ${pkg.name} v${pkg.version}`,
          ` * Copyright ${new Date().getFullYear()} AberWest Group LTD. All rights reserved.`,
          " * Portions copyright (c) 2023 shadcn (https://github.com/shadcn-ui/ui), MIT License.",
          " * Licensed under the MIT License. See LICENSE in the package root.",
          " */",
        ].join("\n"),
      },
    },
    sourcemap: true,
  },
})
