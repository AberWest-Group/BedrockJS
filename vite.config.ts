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
    },
    sourcemap: true,
  },
})
