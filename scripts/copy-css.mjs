/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

// Ships the raw theme (tokens + @theme mapping) for apps that run Tailwind v4 themselves.
// The @source line makes the consumer's Tailwind scan this package's JS for class names.
import { readFileSync, writeFileSync } from "node:fs"
const theme = readFileSync("src/styles/theme.css", "utf8")
writeFileSync("dist/theme.css", `@source "./index.js";\n\n${theme}`)
