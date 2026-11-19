"use client"

import * as React from "react"
import { cn } from "cn"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DataTableSortDirection = "asc" | "desc"

export interface DataTableSort {
  columnId: string
  direction: DataTableSortDirection
}

/**
 * A rectangular selection. `null` means "all" along that axis, so
 * `{ rows: null, cols: [2, 2] }` is the whole third column.
 * Row indices are display indices (after sorting).
 */
export interface DataTableRegion {
  rows: [number, number] | null
  cols: [number, number] | null
}

export interface DataTableCellCoords {
  row: number
  col: number
}

export interface DataTableVisibleRange {
  rowStart: number
  rowEnd: number
  colStart: number
  colEnd: number
}

export interface DataTableCellContext<T> {
  row: T
  /** Display index (after sorting). */
  rowIndex: number
  /** Index into the original `data` array. */
  dataIndex: number
  value: unknown
  column: DataTableColumn<T>
}

export interface DataTableColumn<T> {
  /** Unique id. Also used as the property name when no `accessor`/`key` is given. */
  id: string
  header: React.ReactNode
  /** Property to read from each row. */
  key?: keyof T
  /** Computes the cell value. Takes precedence over `key`. */
  accessor?: (row: T) => unknown
  /** Custom cell renderer. Defaults to `format(value)` or `String(value)`. */
  cell?: (ctx: DataTableCellContext<T>) => React.ReactNode
  /** Formats a value for display and for clipboard copy. */
  format?: (value: unknown) => string
  /** Initial width in px. */
  width?: number
  minWidth?: number
  maxWidth?: number
  align?: "left" | "center" | "right"
  sortable?: boolean
  /** Custom comparator for sorting. Defaults to a natural, null-last compare. */
  compare?: (a: unknown, b: unknown) => number
  resizable?: boolean
  /** Extra class names for every body cell in this column. */
  className?: string
}

export interface DataTableProps<T> {
  data: readonly T[]
  columns: readonly DataTableColumn<T>[]
  /** Stable key per row; defaults to the data index. */
  getRowKey?: (row: T, dataIndex: number) => React.Key

  rowHeight?: number
  headerHeight?: number
  defaultColumnWidth?: number
  /** Number of leading columns that stay pinned while scrolling horizontally. */
  frozenColumns?: number
  /** Show the numbered row-header column. */
  showRowHeaders?: boolean
  striped?: boolean
  /** Shows skeleton cells. With no data, fills the viewport with skeleton rows. */
  loading?: boolean
  emptyState?: React.ReactNode

  /** Rows rendered beyond the viewport, also the render batch size. */
  overscanRows?: number
  overscanColumns?: number

  /** "cells" (default): rectangular regions. "rows": whole rows. "none": disabled. */
  selectionMode?: "cells" | "rows" | "none"
  /** Controlled selection. */
  selectedRegions?: DataTableRegion[]
  defaultSelectedRegions?: DataTableRegion[]
  onSelectionChange?: (regions: DataTableRegion[]) => void
  onFocusedCellChange?: (cell: DataTableCellCoords | null) => void

  /** Controlled sort. */
  sort?: DataTableSort | null
  defaultSort?: DataTableSort | null
  onSortChange?: (sort: DataTableSort | null) => void
  /** When true, `data` is assumed to be pre-sorted (e.g. by a server). */
  manualSorting?: boolean

  /** Controlled column widths by column id. */
  columnWidths?: Record<string, number>
  onColumnWidthsChange?: (widths: Record<string, number>) => void

  /** Fires when the rendered window changes; use it to lazy-load data. */
  onVisibleRangeChange?: (range: DataTableVisibleRange) => void
  onCellDoubleClick?: (ctx: DataTableCellContext<T>) => void
  /** Builds the clipboard text for a copy. Defaults to TSV of the last region. */
  getClipboardText?: (region: DataTableRegion, rows: T[], columns: DataTableColumn<T>[]) => string

  className?: string
  style?: React.CSSProperties
  "aria-label"?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })

export function defaultCompare(a: unknown, b: unknown): number {
  const aNil = a === null || a === undefined || a === ""
  const bNil = b === null || b === undefined || b === ""
  if (aNil || bNil) return aNil === bNil ? 0 : aNil ? 1 : -1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b)
  return collator.compare(String(a), String(b))
}

function getValue<T>(col: DataTableColumn<T>, row: T): unknown {
  if (col.accessor) return col.accessor(row)
  const k = (col.key ?? col.id) as keyof T
  return row == null ? undefined : row[k]
}

function formatValue<T>(col: DataTableColumn<T>, value: unknown): string {
  if (col.format) return col.format(value)
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toLocaleString()
  return String(value)
}

/** Index of the column containing x (column-space px). Returns n if x is past the end. */
function columnAt(offsets: number[], x: number): number {
  const n = offsets.length - 1
  if (x < 0) return -1
  if (x >= offsets[n]) return n
  let lo = 0
  let hi = n - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (offsets[mid] <= x) lo = mid
    else hi = mid - 1
  }
  return lo
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

interface Bounds {
  r0: number
  r1: number
  c0: number
  c1: number
}

function regionBounds(region: DataTableRegion, rowCount: number, colCount: number): Bounds | null {
  const [r0, r1] = region.rows ?? [0, rowCount - 1]
  const [c0, c1] = region.cols ?? [0, colCount - 1]
  const b = {
    r0: Math.max(0, Math.min(r0, r1)),
    r1: Math.min(rowCount - 1, Math.max(r0, r1)),
    c0: Math.max(0, Math.min(c0, c1)),
    c1: Math.min(colCount - 1, Math.max(c0, c1)),
  }
  return b.r0 > b.r1 || b.c0 > b.c1 ? null : b
}

function sanitizeClipboardCell(s: string) {
  return s.replace(/[\t\r\n]+/g, " ")
}

interface Range {
  r0: number
  r1: number
  c0: number
  c1: number
}

const sameRange = (a: Range, b: Range) =>
  a.r0 === b.r0 && a.r1 === b.r1 && a.c0 === b.c0 && a.c1 === b.c1

function useControllable<V>(
  controlled: V | undefined,
  defaultValue: V,
  onChange?: (v: V) => void
): [V, (v: V) => void] {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : internal
  const set = React.useCallback(
    (v: V) => {
      if (!isControlled) setInternal(v)
      onChange?.(v)
    },
    [isControlled, onChange]
  )
  return [value, set]
}

// ---------------------------------------------------------------------------
// Row (memoized)
// ---------------------------------------------------------------------------

interface RowProps<T> {
  row: T | undefined
  rowIndex: number
  dataIndex: number
  columns: readonly DataTableColumn<T>[]
  offsets: number[]
  c0: number
  c1: number
  xOffset: number
  rowHeight: number
  width: number
  striped: boolean
  loading: boolean
  rowHeaderWidth: number
}

function RowImpl<T>({
  row,
  rowIndex,
  dataIndex,
  columns,
  offsets,
  c0,
  c1,
  xOffset,
  rowHeight,
  width,
  striped,
  loading,
  rowHeaderWidth,
}: RowProps<T>) {
  const cells: React.ReactNode[] = []
  if (rowHeaderWidth > 0) {
    cells.push(
      <div
        key="__rh"
        role="rowheader"
        className="absolute top-0 left-0 truncate border-r border-b border-table-grid bg-table-header px-[6px] text-right text-xs text-muted-foreground tabular-nums select-none"
        style={{ width: rowHeaderWidth, height: rowHeight, lineHeight: `${rowHeight - 1}px` }}
      >
        {rowIndex + 1}
      </div>
    )
  }
  for (let c = c0; c <= c1; c++) {
    const col = columns[c]
    const left = xOffset + offsets[c]
    const w = offsets[c + 1] - offsets[c]
    let content: React.ReactNode
    if (loading || row === undefined) {
      const pct = 45 + ((rowIndex * 7 + c * 13) % 45)
      content = (
        <span
          className="inline-block h-2 animate-pulse rounded-xs bg-accent align-middle"
          style={{ width: `${pct}%` }}
        />
      )
    } else {
      const value = getValue(col, row)
      content = col.cell
        ? col.cell({ row, rowIndex, dataIndex, value, column: col })
        : formatValue(col, value)
    }
    cells.push(
      <div
        key={col.id}
        role="gridcell"
        aria-colindex={c + 1 + (rowHeaderWidth > 0 ? 1 : 0)}
        data-col-index={c}
        className={cn(
          "absolute top-0 overflow-hidden border-r border-b border-table-grid px-[10px] text-xs whitespace-nowrap",
          col.align === "right" && "text-right tabular-nums",
          col.align === "center" && "text-center",
          col.className
        )}
        style={{ left, width: w, height: rowHeight, lineHeight: `${rowHeight - 1}px` }}
      >
        <span data-cell-content className="block truncate">
          {content}
        </span>
      </div>
    )
  }
  return (
    <div
      role="row"
      aria-rowindex={rowIndex + 2}
      className={cn("absolute left-0", striped && rowIndex % 2 === 1 && "bg-table-stripe")}
      style={{ top: rowIndex * rowHeight, height: rowHeight, width }}
    >
      {cells}
    </div>
  )
}

const Row = React.memo(RowImpl) as typeof RowImpl

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

function DataTable<T>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    getRowKey,
    rowHeight = 24,
    headerHeight = 30,
    defaultColumnWidth = 150,
    frozenColumns: frozenColumnsProp = 0,
    showRowHeaders = true,
    striped = false,
    loading = false,
    emptyState,
    overscanRows = 12,
    overscanColumns = 2,
    selectionMode = "cells",
    onFocusedCellChange,
    manualSorting = false,
    onVisibleRangeChange,
    onCellDoubleClick,
    getClipboardText,
    className,
    style,
  } = props

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const colCount = columns.length
  const frozenColumns = clamp(frozenColumnsProp, 0, colCount)

  // ---- controlled / uncontrolled state ----
  const [regions, setRegions] = useControllable<DataTableRegion[]>(
    props.selectedRegions,
    props.defaultSelectedRegions ?? [],
    props.onSelectionChange
  )
  const [sort, setSort] = useControllable<DataTableSort | null>(
    props.sort,
    props.defaultSort ?? null,
    props.onSortChange
  )
  const [widthMap, setWidthMap] = useControllable<Record<string, number>>(
    props.columnWidths,
    {},
    props.onColumnWidthsChange
  )
  const [focused, setFocusedState] = React.useState<DataTableCellCoords | null>(null)
  const setFocused = React.useCallback(
    (c: DataTableCellCoords | null) => {
      setFocusedState(c)
      onFocusedCellChange?.(c)
    },
    [onFocusedCellChange]
  )

  // ---- viewport ----
  const [viewport, setViewport] = React.useState({ w: 1000, h: 600 })
  useIsoLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () =>
      setViewport((v) => {
        const w = el.clientWidth || v.w
        const h = el.clientHeight || v.h
        return v.w === w && v.h === h ? v : { w, h }
      })
    measure()
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ---- geometry ----
  const widths = React.useMemo(
    () =>
      columns.map((c) =>
        clamp(
          widthMap[c.id] ?? c.width ?? defaultColumnWidth,
          c.minWidth ?? 40,
          c.maxWidth ?? Number.POSITIVE_INFINITY
        )
      ),
    [columns, widthMap, defaultColumnWidth]
  )
  const offsets = React.useMemo(() => {
    const o = new Array<number>(widths.length + 1)
    o[0] = 0
    for (let i = 0; i < widths.length; i++) o[i + 1] = o[i] + widths[i]
    return o
  }, [widths])

  const skeletonRows = Math.ceil(Math.max(0, viewport.h - headerHeight) / rowHeight)
  const showSkeletonRows = loading && data.length === 0
  const rowCount = showSkeletonRows ? skeletonRows : data.length
  const rowHeaderWidth = showRowHeaders
    ? Math.max(30, String(Math.max(rowCount, 1)).length * 7 + 16)
    : 0
  const frozenWidth = offsets[frozenColumns]
  const pinnedWidth = rowHeaderWidth + frozenWidth
  const totalWidth = rowHeaderWidth + offsets[colCount]
  const bodyHeight = rowCount * rowHeight

  // ---- sorting (index permutation, data is never copied) ----
  const order = React.useMemo(() => {
    if (!sort || manualSorting) return null
    const col = columns.find((c) => c.id === sort.columnId)
    if (!col) return null
    const keys = data.map((r) => getValue(col, r))
    const cmp = col.compare ?? defaultCompare
    const dir = sort.direction === "asc" ? 1 : -1
    const idx = Array.from({ length: data.length }, (_, i) => i)
    idx.sort((a, b) => {
      const ka = keys[a]
      const kb = keys[b]
      const aNil = ka === null || ka === undefined || ka === ""
      const bNil = kb === null || kb === undefined || kb === ""
      // Empty values stay at the bottom in both directions.
      if (aNil || bNil) return aNil === bNil ? a - b : aNil ? 1 : -1
      return cmp(ka, kb) * dir || a - b
    })
    return idx
  }, [data, columns, sort, manualSorting])

  const dataIndexAt = React.useCallback(
    (displayIndex: number) => (order ? order[displayIndex] : displayIndex),
    [order]
  )

  // ---- visible range (batched) ----
  const computeRange = React.useCallback(
    (scrollTop: number, scrollLeft: number): Range => {
      const bodyViewH = Math.max(0, viewport.h - headerHeight)
      const batch = Math.max(1, overscanRows)
      const first = Math.floor(scrollTop / rowHeight)
      const last = Math.ceil((scrollTop + bodyViewH) / rowHeight)
      const r0 = Math.max(0, Math.floor((first - overscanRows) / batch) * batch)
      const r1 = Math.min(rowCount - 1, Math.ceil((last + overscanRows) / batch) * batch)

      const xStart = scrollLeft + frozenWidth
      const xEnd = scrollLeft + viewport.w - rowHeaderWidth
      const c0 = Math.max(frozenColumns, columnAt(offsets, xStart) - overscanColumns)
      const c1 = Math.min(colCount - 1, columnAt(offsets, xEnd) + overscanColumns)
      return { r0, r1, c0, c1 }
    },
    [
      viewport,
      headerHeight,
      overscanRows,
      overscanColumns,
      rowHeight,
      rowCount,
      frozenWidth,
      rowHeaderWidth,
      frozenColumns,
      offsets,
      colCount,
    ]
  )

  const [range, setRange] = React.useState<Range>(() => computeRange(0, 0))
  const updateRange = React.useCallback(() => {
    const el = scrollRef.current
    const next = computeRange(el?.scrollTop ?? 0, el?.scrollLeft ?? 0)
    setRange((prev) => (sameRange(prev, next) ? prev : next))
  }, [computeRange])
  useIsoLayoutEffect(updateRange, [updateRange])

  React.useEffect(() => {
    onVisibleRangeChange?.({
      rowStart: range.r0,
      rowEnd: range.r1,
      colStart: range.c0,
      colEnd: range.c1,
    })
  }, [range, onVisibleRangeChange])

  // ---- hit testing (event delegation) ----
  type Hit = { row: number; col: number; inHeader: boolean }
  const hitTest = React.useCallback(
    (clientX: number, clientY: number): Hit | null => {
      const el = scrollRef.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      const sx = clientX - rect.left - el.clientLeft
      const sy = clientY - rect.top - el.clientTop
      const cx = sx < pinnedWidth ? sx - rowHeaderWidth : sx + el.scrollLeft - rowHeaderWidth
      const col = columnAt(offsets, cx)
      const inHeader = sy < headerHeight
      const row = inHeader ? -1 : Math.floor((sy - headerHeight + el.scrollTop) / rowHeight)
      return { row, col, inHeader }
    },
    [pinnedWidth, rowHeaderWidth, offsets, headerHeight, rowHeight]
  )

  const scrollCellIntoView = React.useCallback(
    (row: number, col: number) => {
      const el = scrollRef.current
      if (!el) return
      const bodyViewH = el.clientHeight - headerHeight
      const top = row * rowHeight
      if (top < el.scrollTop) el.scrollTop = top
      else if (top + rowHeight > el.scrollTop + bodyViewH) el.scrollTop = top + rowHeight - bodyViewH
      if (col >= frozenColumns && col < colCount) {
        const left = offsets[col]
        const right = offsets[col + 1]
        const visibleW = el.clientWidth - rowHeaderWidth
        if (left < el.scrollLeft + frozenWidth) el.scrollLeft = left - frozenWidth
        else if (right > el.scrollLeft + visibleW) el.scrollLeft = right - visibleW
      }
    },
    [headerHeight, rowHeight, frozenColumns, colCount, offsets, rowHeaderWidth, frozenWidth]
  )

  // ---- selection ----
  const anchorRef = React.useRef<DataTableCellCoords | null>(null)
  const leadRef = React.useRef<DataTableCellCoords | null>(null)
  const dragRef = React.useRef<{
    kind: "cell" | "row" | "col"
    anchor: DataTableCellCoords
    base: DataTableRegion[]
  } | null>(null)

  const makeRegion = React.useCallback(
    (kind: "cell" | "row" | "col", a: DataTableCellCoords, b: DataTableCellCoords): DataTableRegion => {
      const rows: [number, number] = [Math.min(a.row, b.row), Math.max(a.row, b.row)]
      const cols: [number, number] = [Math.min(a.col, b.col), Math.max(a.col, b.col)]
      if (kind === "row" || selectionMode === "rows") return { rows, cols: null }
      if (kind === "col") return { rows: null, cols }
      return { rows, cols }
    },
    [selectionMode]
  )

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || selectionMode === "none") return
    const target = e.target as HTMLElement
    if (target.closest("[data-table-interactive]")) return
    const hit = hitTest(e.clientX, e.clientY)
    if (!hit || rowCount === 0) return
    if (hit.col >= colCount) return
    if (!hit.inHeader && (hit.row < 0 || hit.row >= rowCount)) return

    e.preventDefault()
    scrollRef.current?.focus({ preventScroll: true })

    let kind: "cell" | "row" | "col"
    if (hit.inHeader && hit.col < 0) {
      setRegions([{ rows: null, cols: null }])
      return
    } else if (hit.inHeader) kind = selectionMode === "rows" ? "row" : "col"
    else if (hit.col < 0) kind = "row"
    else kind = "cell"

    const cell = {
      row: hit.inHeader ? 0 : hit.row,
      col: hit.col < 0 ? 0 : hit.col,
    }
    if (kind === "row" && hit.inHeader) return // header click in row mode: nothing to select

    const additive = e.metaKey || e.ctrlKey
    const extend = e.shiftKey && anchorRef.current !== null
    const anchor = extend ? anchorRef.current! : cell
    const base = additive ? regions : extend ? regions.slice(0, -1) : []

    if (!extend) {
      anchorRef.current = cell
      setFocused(cell)
    }
    leadRef.current = cell
    setRegions([...base, makeRegion(kind, anchor, cell)])
    dragRef.current = { kind, anchor, base }

    const onMove = (ev: MouseEvent) => {
      const drag = dragRef.current
      const el = scrollRef.current
      if (!drag || !el) return
      // Auto-scroll when dragging past the edges.
      const rect = el.getBoundingClientRect()
      if (ev.clientY > rect.bottom) el.scrollTop += ev.clientY - rect.bottom
      else if (ev.clientY < rect.top + headerHeight && drag.kind !== "col")
        el.scrollTop -= rect.top + headerHeight - ev.clientY
      if (ev.clientX > rect.right) el.scrollLeft += ev.clientX - rect.right
      else if (ev.clientX < rect.left + pinnedWidth && drag.kind !== "row")
        el.scrollLeft -= Math.min(el.scrollLeft, rect.left + pinnedWidth - ev.clientX)

      const h = hitTest(ev.clientX, ev.clientY)
      if (!h) return
      const cur = {
        row: clamp(h.inHeader ? el.scrollTop / rowHeight : h.row, 0, rowCount - 1) | 0,
        col: clamp(h.col, 0, colCount - 1),
      }
      leadRef.current = cur
      setRegions([...drag.base, makeRegion(drag.kind, drag.anchor, cur)])
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCellDoubleClick || loading) return
    const hit = hitTest(e.clientX, e.clientY)
    if (!hit || hit.inHeader || hit.col < 0 || hit.col >= colCount) return
    if (hit.row < 0 || hit.row >= rowCount) return
    const dataIndex = dataIndexAt(hit.row)
    const row = data[dataIndex]
    const column = columns[hit.col]
    onCellDoubleClick({ row, rowIndex: hit.row, dataIndex, value: getValue(column, row), column })
  }

  // ---- clipboard ----
  const copySelection = React.useCallback(() => {
    const region = regions[regions.length - 1]
    if (!region || loading) return
    const b = regionBounds(region, rowCount, colCount)
    if (!b) return
    const cols = columns.slice(b.c0, b.c1 + 1)
    const rows: T[] = []
    for (let r = b.r0; r <= b.r1; r++) rows.push(data[dataIndexAt(r)])
    const text = getClipboardText
      ? getClipboardText(region, rows, cols)
      : rows
          .map((row) =>
            cols.map((c) => sanitizeClipboardCell(formatValue(c, getValue(c, row)))).join("\t")
          )
          .join("\n")
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    } else {
      fallbackCopy(text)
    }
  }, [regions, loading, rowCount, colCount, columns, data, dataIndexAt, getClipboardText])

  // ---- keyboard ----
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return // let inputs inside custom cells work
    const mod = e.metaKey || e.ctrlKey
    const key = e.key.toLowerCase()
    if (mod && key === "c") {
      e.preventDefault()
      copySelection()
      return
    }
    if (selectionMode === "none" || rowCount === 0 || colCount === 0) return
    if (mod && key === "a") {
      e.preventDefault()
      setRegions([{ rows: null, cols: null }])
      return
    }
    if (e.key === "Escape") {
      setRegions([])
      return
    }

    const pageRows = Math.max(1, Math.floor((viewport.h - headerHeight) / rowHeight) - 1)
    const from = (e.shiftKey ? leadRef.current : focused) ?? { row: 0, col: 0 }
    let next: DataTableCellCoords | null = null
    switch (e.key) {
      case "ArrowUp":
        next = { row: mod ? 0 : from.row - 1, col: from.col }
        break
      case "ArrowDown":
        next = { row: mod ? rowCount - 1 : from.row + 1, col: from.col }
        break
      case "ArrowLeft":
        next = { row: from.row, col: mod ? 0 : from.col - 1 }
        break
      case "ArrowRight":
        next = { row: from.row, col: mod ? colCount - 1 : from.col + 1 }
        break
      case "PageUp":
        next = { row: from.row - pageRows, col: from.col }
        break
      case "PageDown":
        next = { row: from.row + pageRows, col: from.col }
        break
      case "Home":
        next = { row: mod ? 0 : from.row, col: 0 }
        break
      case "End":
        next = { row: mod ? rowCount - 1 : from.row, col: colCount - 1 }
        break
      case "Tab":
        // Move within the row, wrapping. Leave the grid at the edges.
        {
          const step = e.shiftKey ? -1 : 1
          const lin = from.row * colCount + from.col + step
          if (lin < 0 || lin >= rowCount * colCount) return
          e.preventDefault()
          const c = { row: Math.floor(lin / colCount), col: lin % colCount }
          anchorRef.current = leadRef.current = c
          setFocused(c)
          setRegions([makeRegion("cell", c, c)])
          scrollCellIntoView(c.row, c.col)
        }
        return
      default:
        return
    }
    e.preventDefault()
    next = { row: clamp(next.row, 0, rowCount - 1), col: clamp(next.col, 0, colCount - 1) }
    if (e.shiftKey && anchorRef.current) {
      leadRef.current = next
      setRegions([makeRegion("cell", anchorRef.current, next)])
    } else {
      anchorRef.current = leadRef.current = next
      setFocused(next)
      setRegions([makeRegion("cell", next, next)])
    }
    scrollCellIntoView(next.row, next.col)
  }

  // ---- column resizing (commit on mouse up) ----
  const [resizing, setResizing] = React.useState<{ col: number; width: number } | null>(null)
  const startResize = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const col = columns[colIndex]
    const min = col.minWidth ?? 40
    const max = col.maxWidth ?? Number.POSITIVE_INFINITY
    const startX = e.clientX
    const startW = widths[colIndex]
    let current = startW
    setResizing({ col: colIndex, width: startW })
    const onMove = (ev: MouseEvent) => {
      current = clamp(startW + ev.clientX - startX, min, max)
      setResizing({ col: colIndex, width: current })
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      setResizing(null)
      if (current !== startW) setWidthMap({ ...widthMap, [col.id]: current })
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  /** Double-click a resize handle: fit to the widest rendered content. */
  const autoFit = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const el = scrollRef.current
    if (!el) return
    const col = columns[colIndex]
    let max = 0
    el.querySelectorAll<HTMLElement>(`[data-col-index="${colIndex}"] [data-cell-content]`).forEach(
      (n) => {
        max = Math.max(max, n.scrollWidth)
      }
    )
    const extra = col.sortable ? 22 : 0
    const w = clamp(Math.ceil(max) + 21 + extra, col.minWidth ?? 40, col.maxWidth ?? Infinity)
    setWidthMap({ ...widthMap, [col.id]: w })
  }

  const toggleSort = (col: DataTableColumn<T>) => {
    let next: DataTableSort | null
    if (!sort || sort.columnId !== col.id) next = { columnId: col.id, direction: "asc" }
    else if (sort.direction === "asc") next = { columnId: col.id, direction: "desc" }
    else next = null
    setSort(next)
    setRegions([])
    setFocused(null)
    anchorRef.current = leadRef.current = null
  }

  // ---- render: header ----
  const renderHeaderCell = (c: number) => {
    const col = columns[c]
    const active = sort?.columnId === col.id ? sort.direction : null
    return (
      <div
        key={col.id}
        role="columnheader"
        aria-colindex={c + 1 + (showRowHeaders ? 1 : 0)}
        aria-sort={active === "asc" ? "ascending" : active === "desc" ? "descending" : undefined}
        data-col-index={c}
        className={cn(
          "group/th absolute top-0 flex items-center gap-1 border-r border-b border-table-grid bg-table-header px-[10px] text-xs font-semibold select-none",
          col.align === "right" && "flex-row-reverse text-right",
          col.align === "center" && "justify-center"
        )}
        style={{ left: rowHeaderWidth + offsets[c], width: widths[c], height: headerHeight }}
      >
        <span data-cell-content className="min-w-0 truncate">
          {col.header}
        </span>
        {col.sortable && (
          <button
            type="button"
            data-table-interactive
            tabIndex={-1}
            aria-label={`Sort by ${typeof col.header === "string" ? col.header : col.id}`}
            onClick={() => toggleSort(col)}
            className={cn(
              "inline-flex size-[18px] shrink-0 items-center justify-center rounded-xs text-muted-foreground hover:bg-accent hover:text-foreground",
              !active && "opacity-0 group-hover/th:opacity-100 focus-visible:opacity-100"
            )}
          >
            {active === "asc" ? (
              <ArrowUpIcon className="size-3.5 text-primary-text" />
            ) : active === "desc" ? (
              <ArrowDownIcon className="size-3.5 text-primary-text" />
            ) : (
              <ChevronsUpDownIcon className="size-3.5" />
            )}
          </button>
        )}
        {col.resizable !== false && (
          <div
            data-table-interactive
            aria-hidden
            onMouseDown={(e) => startResize(e, c)}
            onDoubleClick={(e) => autoFit(e, c)}
            className="absolute top-0 -right-[3px] z-10 h-full w-[6px] cursor-col-resize hover:bg-primary/50"
          />
        )}
      </div>
    )
  }

  // ---- render: overlays ----
  const overlays = React.useMemo(() => {
    const body: React.ReactNode[] = []
    const pinned: React.ReactNode[] = []
    const header: React.ReactNode[] = []
    const corner: React.ReactNode[] = []
    const rowHeaders: React.ReactNode[] = []
    if (loading || rowCount === 0) return { body, pinned, header, corner, rowHeaders }

    const ov = "pointer-events-none absolute border-table-selection-border bg-table-selection"
    regions.forEach((region, i) => {
      const b = regionBounds(region, rowCount, colCount)
      if (!b) return
      const top = b.r0 * rowHeight
      const height = (b.r1 - b.r0 + 1) * rowHeight
      // Scrolling part
      if (b.c1 >= frozenColumns) {
        const s = Math.max(b.c0, frozenColumns)
        const left = rowHeaderWidth + offsets[s]
        const width = offsets[b.c1 + 1] - offsets[s]
        body.push(
          <div
            key={i}
            className={ov}
            style={{ top, left, width, height, borderWidth: 1, borderLeftWidth: b.c0 < frozenColumns ? 0 : 1 }}
          />
        )
        header.push(
          <div
            key={i}
            className="pointer-events-none absolute top-0 bg-table-selection"
            style={{ left, width, height: headerHeight }}
          />
        )
      }
      // Frozen part
      if (b.c0 < frozenColumns) {
        const e = Math.min(b.c1, frozenColumns - 1)
        const left = rowHeaderWidth + offsets[b.c0]
        const width = offsets[e + 1] - offsets[b.c0]
        pinned.push(
          <div
            key={i}
            className={ov}
            style={{ top, left, width, height, borderWidth: 1, borderRightWidth: b.c1 >= frozenColumns ? 0 : 1 }}
          />
        )
        corner.push(
          <div
            key={i}
            className="pointer-events-none absolute top-0 bg-table-selection"
            style={{ left, width, height: headerHeight }}
          />
        )
      }
      if (rowHeaderWidth > 0) {
        rowHeaders.push(
          <div
            key={i}
            className="pointer-events-none absolute left-0 bg-table-selection"
            style={{ top, height, width: rowHeaderWidth }}
          />
        )
      }
    })

    if (focused && focused.row < rowCount && focused.col < colCount) {
      const node = (
        <div
          key="focus"
          className="pointer-events-none absolute border-2 border-table-selection-border"
          style={{
            top: focused.row * rowHeight,
            left: rowHeaderWidth + offsets[focused.col],
            width: widths[focused.col],
            height: rowHeight,
          }}
        />
      )
      if (focused.col < frozenColumns) pinned.push(node)
      else body.push(node)
    }
    return { body, pinned, header, corner, rowHeaders }
  }, [
    regions,
    focused,
    loading,
    rowCount,
    colCount,
    rowHeight,
    headerHeight,
    frozenColumns,
    rowHeaderWidth,
    offsets,
    widths,
  ])

  // ---- render: rows ----
  const scrollRows: React.ReactNode[] = []
  const pinnedRows: React.ReactNode[] = []
  if (rowCount > 0) {
    for (let r = range.r0; r <= range.r1; r++) {
      const dataIndex = showSkeletonRows ? r : dataIndexAt(r)
      const row = showSkeletonRows ? undefined : data[dataIndex]
      const key = row !== undefined && getRowKey ? getRowKey(row, dataIndex) : dataIndex
      if (range.c0 <= range.c1) {
        scrollRows.push(
          <Row<T>
            key={key}
            row={row}
            rowIndex={r}
            dataIndex={dataIndex}
            columns={columns}
            offsets={offsets}
            c0={range.c0}
            c1={range.c1}
            xOffset={rowHeaderWidth}
            rowHeight={rowHeight}
            width={totalWidth}
            striped={striped}
            loading={loading}
            rowHeaderWidth={0}
          />
        )
      }
      if (pinnedWidth > 0) {
        pinnedRows.push(
          <Row<T>
            key={key}
            row={row}
            rowIndex={r}
            dataIndex={dataIndex}
            columns={columns}
            offsets={offsets}
            c0={0}
            c1={frozenColumns - 1}
            xOffset={rowHeaderWidth}
            rowHeight={rowHeight}
            width={pinnedWidth}
            striped={striped}
            loading={loading}
            rowHeaderWidth={rowHeaderWidth}
          />
        )
      }
    }
  }

  const headerCells: React.ReactNode[] = []
  const frozenHeaderCells: React.ReactNode[] = []
  for (let c = 0; c < frozenColumns; c++) frozenHeaderCells.push(renderHeaderCell(c))
  for (let c = range.c0; c <= range.c1; c++) headerCells.push(renderHeaderCell(c))

  // Resize guide position in canvas coordinates.
  let guideLeft: number | null = null
  if (resizing) {
    const base = rowHeaderWidth + offsets[resizing.col] + resizing.width
    guideLeft = resizing.col < frozenColumns ? base + (scrollRef.current?.scrollLeft ?? 0) : base
  }

  const isMultiSelect = selectionMode !== "none"

  return (
    <div
      ref={scrollRef}
      role="grid"
      aria-label={props["aria-label"]}
      aria-rowcount={rowCount + 1}
      aria-colcount={colCount + (showRowHeaders ? 1 : 0)}
      aria-multiselectable={isMultiSelect || undefined}
      aria-busy={loading || undefined}
      tabIndex={0}
      data-slot="data-table"
      onScroll={updateRange}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      className={cn(
        "relative h-96 overflow-auto overscroll-contain rounded-md bg-background text-foreground shadow-xs outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        resizing && "cursor-col-resize select-none",
        className
      )}
      style={style}
    >
      <div
        className="relative"
        style={{ width: totalWidth, height: headerHeight + bodyHeight, minWidth: "100%" }}
      >
        {/* Header (sticky top) */}
        <div
          role="row"
          aria-rowindex={1}
          className="sticky top-0 z-20"
          style={{ height: headerHeight, width: totalWidth }}
        >
          {pinnedWidth > 0 && (
            <div
              className="sticky left-0 z-10 bg-table-header"
              style={{ width: pinnedWidth, height: headerHeight }}
            >
              {rowHeaderWidth > 0 && (
                <div
                  aria-hidden
                  title="Select all"
                  className="absolute top-0 left-0 border-r border-b border-table-grid bg-table-header"
                  style={{ width: rowHeaderWidth, height: headerHeight }}
                />
              )}
              {frozenHeaderCells}
              {overlays.corner}
              {frozenColumns > 0 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-0 h-full w-px shadow-[1px_0_0_var(--table-grid)]"
                  style={{ left: pinnedWidth - 1 }}
                />
              )}
            </div>
          )}
          <div className="absolute top-0 left-0 w-full bg-table-header" style={{ height: headerHeight, zIndex: -1 }} />
          {headerCells}
          {overlays.header}
        </div>

        {/* Body */}
        <div className="relative" style={{ height: bodyHeight, width: totalWidth }}>
          {pinnedWidth > 0 && (
            <div
              className={cn(
                "sticky left-0 z-10 bg-background",
                frozenColumns > 0 && "shadow-[1px_0_0_var(--table-grid),4px_0_6px_-4px_rgba(17,20,24,0.15)]"
              )}
              style={{ width: pinnedWidth, height: bodyHeight }}
            >
              {pinnedRows}
              {overlays.rowHeaders}
              {overlays.pinned}
            </div>
          )}
          {scrollRows}
          {overlays.body}
        </div>

        {rowCount === 0 && !loading && (
          <div
            className="sticky left-0 flex items-center justify-center p-6 text-sm text-muted-foreground"
            style={{ width: viewport.w, height: Math.max(80, viewport.h - headerHeight) }}
          >
            {emptyState ?? "No data"}
          </div>
        )}

        {guideLeft !== null && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 z-30 w-[2px] bg-primary"
            style={{ left: guideLeft - 1, height: headerHeight + Math.max(bodyHeight, viewport.h) }}
          />
        )}
      </div>
    </div>
  )
}

function fallbackCopy(text: string) {
  if (typeof document === "undefined") return
  const ta = document.createElement("textarea")
  ta.value = text
  ta.setAttribute("readonly", "")
  ta.style.position = "fixed"
  ta.style.opacity = "0"
  const active = document.activeElement as HTMLElement | null
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand("copy")
  } finally {
    document.body.removeChild(ta)
    active?.focus({ preventScroll: true })
  }
}

export { DataTable }
