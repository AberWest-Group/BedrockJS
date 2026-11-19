/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Ensures every source file starts with the AberWest Group LTD Apache-2.0 header.
//
//   node scripts/license-headers.mjs                  check; exit 1 if any header is missing or outdated
//   node scripts/license-headers.mjs --fix            add missing headers, update outdated ones
//   node scripts/license-headers.mjs --fix --staged   same, for git-staged files only (pre-commit hook)
//
// The copyright year a file was first stamped with is always preserved.
// Files derived from shadcn/ui also credit shadcn, whose MIT licence requires its
// copyright notice to be kept (full text in the NOTICE file).

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

const APACHE_NOTICE = [
  'Licensed under the Apache License, Version 2.0 (the "License");',
  "you may not use this file except in compliance with the License.",
  "You may obtain a copy of the License at",
  "",
  "    http://www.apache.org/licenses/LICENSE-2.0",
  "",
  "Unless required by applicable law or agreed to in writing, software",
  'distributed under the License is distributed on an "AS IS" BASIS,',
  "WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.",
  "See the License for the specific language governing permissions and",
  "limitations under the License.",
]

const currentYear = new Date().getFullYear()

const isDerived = (path) => {
  const p = path.split(sep).join("/")
  return (p.startsWith(SHADCN_DIR) && !ORIGINAL_UI_FILES.has(p)) || SHADCN_EXTRA.has(p)
}

export function headerFor(path, year = currentYear) {
  const lines = [`Copyright ${year} ${OWNER}. All rights reserved.`]
  if (isDerived(path)) {
    lines.push(
      "Portions copyright (c) 2023 shadcn, from shadcn/ui (https://github.com/shadcn-ui/ui),",
      "originally licensed under the MIT License. See the NOTICE file for details."
    )
  }
  lines.push("", ...APACHE_NOTICE)
  return "/*\n" + lines.map((l) => (l ? ` * ${l}` : " *")).join("\n") + "\n */\n\n"
}

/** Matches an existing AberWest header block (any version of its wording). */
const EXISTING = new RegExp(
  `^/\\*\\s*\\n \\* Copyright (\\d{4}) ${OWNER}[\\s\\S]*?\\*/[ \\t]*\\n\\s*`
)

/** Returns the file text with the correct header, or the same text if already correct. */
export function applyHeader(rel, text) {
  const shebang = text.startsWith("#!") ? text.slice(0, text.indexOf("\n") + 1) : ""
  let body = text.slice(shebang.length)
  let year = currentYear
  const m = body.match(EXISTING)
  if (m) {
    year = Number(m[1])
    body = body.slice(m[0].length)
  } else {
    body = body.replace(/^\s+/, "")
  }
  return shebang + headerFor(rel, year) + body
}

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

const eligible = (rel) =>
  EXTENSIONS.some((e) => rel.endsWith(e)) && !IGNORE.some((re) => re.test(rel))

function candidateFiles(stagedOnly) {
  if (stagedOnly) {
    const out = execSync("git diff --cached --name-only --diff-filter=ACMR", { encoding: "utf8" })
    return out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter(
        (f) => INCLUDE_ROOT_FILES.includes(f) || INCLUDE_DIRS.some((d) => f.startsWith(d + "/"))
      )
      .filter(eligible)
  }
  const files = INCLUDE_ROOT_FILES.filter((f) => existsSync(f))
  for (const d of INCLUDE_DIRS) files.push(...walk(join(ROOT, d), []).map((f) => relative(ROOT, f)))
  return files.filter(eligible)
}

function main() {
  const args = new Set(process.argv.slice(2))
  const fix = args.has("--fix")
  const staged = args.has("--staged")
  const wrong = []
  for (const rel of candidateFiles(staged)) {
    const text = readFileSync(rel, "utf8")
    const next = applyHeader(rel, text)
    if (next === text) continue
    wrong.push(rel)
    if (fix) writeFileSync(rel, next)
  }
  if (fix) {
    if (wrong.length) {
      console.log(`license-headers: fixed header in ${wrong.length} file(s)`)
      if (staged) execSync(`git add -- ${wrong.map((f) => JSON.stringify(f)).join(" ")}`)
    }
    return
  }
  if (wrong.length) {
    console.error("license-headers: missing or outdated licence header in:")
    for (const f of wrong) console.error("  " + f)
    console.error("Run `npm run license:fix` to fix them.")
    process.exit(1)
  }
  console.log("license-headers: all files OK")
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
