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

// Ships the raw theme (tokens + @theme mapping) for apps that run Tailwind v4 themselves.
// The @source line makes the consumer's Tailwind scan this package's JS for class names.
import { readFileSync, writeFileSync } from "node:fs"
const theme = readFileSync("src/styles/theme.css", "utf8")
writeFileSync("dist/theme.css", `@source "./index.js";\n\n${theme}`)
