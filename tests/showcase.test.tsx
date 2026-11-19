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

import * as React from "react"
import { readdirSync } from "node:fs"
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"

beforeAll(() => {
  // Browser APIs jsdom lacks, used by charts, carousels and media queries.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  Element.prototype.scrollTo ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
})

afterEach(cleanup)

describe("showcase site", () => {
  it("renders a section for every component without errors", async () => {
    const errors: unknown[] = []
    const spy = vi.spyOn(console, "error").mockImplementation((...args) => errors.push(args))
    const { Showcase } = await import("../playground/showcase")
    const { container } = render(<Showcase />)
    spy.mockRestore()

    const components = readdirSync("src/components/ui").map((f) => f.replace(/\.tsx?$/, ""))
    const missing = components.filter((id) => !container.querySelector(`section#${id}`))
    expect(missing).toEqual([])
    expect(errors).toEqual([])
  })
})
