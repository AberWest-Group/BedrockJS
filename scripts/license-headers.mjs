/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

// Ensures every source file starts with the AberWest Group LTD licence header.
//
//   node scripts/license-headers.mjs            check, exit 1 if any file is missing it
//   node scripts/license-headers.mjs --fix      add missing headers
//   node scripts/license-headers.mjs --fix --staged   only git-staged files (pre-commit hook)
//
// Files derived from shadcn/ui keep shadcn's copyright line next to ours, as the MIT
// licence requires. Existing headers are never rewritten, so each file keeps the year
// it was first stamped.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, relative, sep } from "node:path"
import { execSync } from "node:child_process"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
const OWNER = "AberWest Group LTD"

/** Folders and root files that get headers. */
const INCLUDE_DIRS = ["src", "scripts", "tests", "playground"]
const INCLUDE_ROOT_FILES = ["vite.config.ts", "vite.playground.config.ts", "vitest.config.ts"]
const EXTENSIONS = [".ts", ".tsx", ".js", ".mjs", ".cjs", ".css"]
const IGNORE = [/\.d\.ts$/, /^src[\\/]index\.ts$/] // generated files are stamped by their generator

/**
 * Third-party derived code. Everything shadcn's CLI writes into src/components/ui is
 * derived from shadcn/ui, except files listed in ORIGINAL_UI_FILES (our own components).
 */
const SHADCN_DIR = "src/components/ui/"
const ORIGINAL_UI_FILES = new Set(["src/components/ui/data-table.tsx"])
const SHADCN_EXTRA = new Set(["src/hooks/use-mobile.ts", "src/lib/utils.ts"])

const year = new Date().getFullYear()

export function headerFor(path, y = year) {
  const p = path.split(sep).join("/")
  const derived =
    (p.startsWith(SHADCN_DIR) && !ORIGINAL_UI_FILES.has(p)) || SHADCN_EXTRA.has(p)
  const lines = [`Copyright ${y} ${OWNER}. All rights reserved.`]
  if (derived) {
    lines.push(
      "Portions copyright (c) 2023 shadcn, from shadcn/ui (https://github.com/shadcn-ui/ui),",
      "used under the MIT License."
    )
  }
  lines.push("", "Licensed under the MIT License. See the LICENSE file in the project root.")
  return "/*\n" + lines.map((l) => (l ? ` * ${l}` : " *")).join("\n") + "\n */\n\n"
}

const HAS_HEADER = new RegExp(`^(#![^\\n]*\\n)?/\\*\\s*\\n \\* Copyright \\d{4} ${OWNER}`)

function walk(dir, out) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function eligible(rel) {
  return EXTENSIONS.some((e) => rel.endsWith(e)) && !IGNORE.some((re) => re.test(rel))
}

function candidateFiles(stagedOnly) {
  if (stagedOnly) {
    const out = execSync("git diff --cached --name-only --diff-filter=ACMR", { encoding: "utf8" })
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((f) => INCLUDE_ROOT_FILES.includes(f) || INCLUDE_DIRS.some((d) => f.startsWith(d + "/")))
      .filter(eligible)
  }
  const files = INCLUDE_ROOT_FILES.filter((f) => existsSync(f))
  for (const d of INCLUDE_DIRS) files.push(...walk(join(ROOT, d), []).map((f) => relative(ROOT, f)))
  return files.filter(eligible)
}

export function addHeader(rel, text) {
  // Keep a shebang on the first line.
  const shebang = text.startsWith("#!") ? text.slice(0, text.indexOf("\n") + 1) : ""
  const body = text.slice(shebang.length).replace(/^\s+/, "")
  return shebang + headerFor(rel) + body
}

function main() {
  const args = new Set(process.argv.slice(2))
  const fix = args.has("--fix")
  const staged = args.has("--staged")
  const missing = []
  for (const rel of candidateFiles(staged)) {
    const text = readFileSync(rel, "utf8")
    if (HAS_HEADER.test(text)) continue
    missing.push(rel)
    if (fix) writeFileSync(rel, addHeader(rel, text))
  }
  if (fix) {
    if (missing.length) {
      console.log(`license-headers: added header to ${missing.length} file(s)`)
      if (staged) execSync(`git add -- ${missing.map((f) => JSON.stringify(f)).join(" ")}`)
    }
    return
  }
  if (missing.length) {
    console.error("license-headers: missing licence header in:")
    for (const f of missing) console.error("  " + f)
    console.error("Run `npm run license:fix` to add them.")
    process.exit(1)
  }
  console.log("license-headers: all files OK")
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
