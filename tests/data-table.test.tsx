/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

import * as React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react"
import { DataTable, type DataTableColumn, type DataTableRegion } from "../src/components/ui/data-table"

type Row = { id: number; name: string; score: number | null }

const data: Row[] = Array.from({ length: 100_000 }, (_, i) => ({
  id: i,
  name: `Name ${i}`,
  score: i % 10 === 0 ? null : (i * 37) % 1000,
}))

const columns: DataTableColumn<Row>[] = Array.from({ length: 50 }, (_, c) => {
  if (c === 0) return { id: "id", header: "ID", width: 80, sortable: true }
  if (c === 1) return { id: "name", header: "Name", sortable: true }
  if (c === 2) return { id: "score", header: "Score", sortable: true, align: "right" }
  return { id: `c${c}`, header: `Col ${c}`, accessor: (r: Row) => r.id * c }
})

afterEach(cleanup)

const grid = () => screen.getByRole("grid")
const cellsInRow = (rowIndex: number) =>
  grid().querySelectorAll(`[role=row][aria-rowindex="${rowIndex + 2}"] [role=gridcell]`)

describe("DataTable", () => {
  it("virtualizes rows and columns", () => {
    render(<DataTable data={data} columns={columns} />)
    const rows = grid().querySelectorAll("[role=row][aria-rowindex]")
    // 100k rows x 50 columns, but only a viewport's worth is in the DOM.
    expect(rows.length).toBeLessThan(80)
    expect(grid().querySelectorAll("[role=gridcell]").length).toBeLessThan(80 * 12)
    expect(grid().getAttribute("aria-rowcount")).toBe("100001")
    expect(screen.getByText("Name 0")).toBeTruthy()
    expect(screen.queryByText("Name 5000")).toBeNull()
  })

  it("renders new rows after scrolling", () => {
    render(<DataTable data={data} columns={columns} />)
    const el = grid()
    el.scrollTop = 5000 * 24
    fireEvent.scroll(el)
    expect(screen.getByText("Name 5005")).toBeTruthy()
    expect(screen.queryByText("Name 0")).toBeNull()
  })

  it("sorts via an index permutation, keeping empty values last", () => {
    const small = data.slice(0, 30)
    render(<DataTable data={small} columns={columns} />)
    fireEvent.click(screen.getByLabelText("Sort by Score")) // asc
    const firstAsc = cellsInRow(0)[2].textContent
    fireEvent.click(screen.getByLabelText("Sort by Score")) // desc
    const firstDesc = cellsInRow(0)[2].textContent
    const scores = small.map((r) => r.score).filter((s): s is number => s !== null)
    expect(Number(firstAsc)).toBe(Math.min(...scores))
    expect(Number(firstDesc)).toBe(Math.max(...scores))
    expect(cellsInRow(29)[2].textContent).toBe("") // nulls at the bottom
    expect(small[0].score).toBeNull() // source data untouched
  })

  it("supports keyboard selection and copies TSV", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    let regions: DataTableRegion[] = []
    render(
      <DataTable data={data} columns={columns} onSelectionChange={(r) => (regions = r)} />
    )
    const el = grid()
    el.focus()
    fireEvent.keyDown(el, { key: "ArrowDown" }) // focus (0,0) -> (1,0)
    fireEvent.keyDown(el, { key: "ArrowRight" }) // (1,1)
    fireEvent.keyDown(el, { key: "ArrowDown", shiftKey: true })
    fireEvent.keyDown(el, { key: "ArrowRight", shiftKey: true })
    expect(regions).toEqual([{ rows: [1, 2], cols: [1, 2] }])
    fireEvent.keyDown(el, { key: "c", ctrlKey: true })
    expect(writeText).toHaveBeenCalledWith("Name 1\t37\nName 2\t74")
  })

  it("selects everything with Ctrl+A and clears with Escape", () => {
    const onSelectionChange = vi.fn()
    render(<DataTable data={data} columns={columns} onSelectionChange={onSelectionChange} />)
    fireEvent.keyDown(grid(), { key: "a", ctrlKey: true })
    expect(onSelectionChange).toHaveBeenLastCalledWith([{ rows: null, cols: null }])
    fireEvent.keyDown(grid(), { key: "Escape" })
    expect(onSelectionChange).toHaveBeenLastCalledWith([])
  })

  it("renders frozen columns in a pinned layer", () => {
    render(<DataTable data={data} columns={columns} frozenColumns={2} />)
    const pinned = grid().querySelectorAll("[role=row][aria-rowindex='2']")
    expect(pinned.length).toBe(2) // pinned part + scrolling part of the same row
    expect(within(pinned[0] as HTMLElement).getByText("Name 0")).toBeTruthy()
    expect(within(pinned[1] as HTMLElement).queryByText("Name 0")).toBeNull()
  })

  it("does not re-render rows when only the selection changes", () => {
    const renders = vi.fn()
    const cols: DataTableColumn<Row>[] = [
      { id: "name", header: "Name", cell: ({ value }) => (renders(), String(value)) },
    ]
    render(<DataTable data={data} columns={cols} />)
    const initial = renders.mock.calls.length
    fireEvent.keyDown(grid(), { key: "ArrowDown" })
    fireEvent.keyDown(grid(), { key: "ArrowDown", shiftKey: true })
    expect(renders.mock.calls.length).toBe(initial)
  })

  it("shows skeleton rows while loading and an empty state otherwise", () => {
    const { rerender } = render(<DataTable data={[]} columns={columns} loading />)
    expect(grid().getAttribute("aria-busy")).toBe("true")
    expect(grid().querySelectorAll(".animate-pulse").length).toBeGreaterThan(0)
    rerender(<DataTable data={[]} columns={columns} emptyState="Nothing here" />)
    expect(screen.getByText("Nothing here")).toBeTruthy()
  })
})
