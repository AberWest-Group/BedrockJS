/*
 * Copyright 2026 AberWest Group LTD. All rights reserved.
 *
 * Licensed under the MIT License. See the LICENSE file in the project root.
 */

import * as React from "react"
import { createRoot } from "react-dom/client"
import "../src/styles/globals.css"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Input,
  type DataTableColumn,
  type DataTableRegion,
} from "../src"
import { InfoIcon, MoonIcon, PlusIcon, SunIcon, TrashIcon } from "lucide-react"

type Trade = {
  id: number
  symbol: string
  side: "BUY" | "SELL"
  qty: number
  price: number
  venue: string
  trader: string
  ts: Date
  status: "Filled" | "Pending" | "Rejected"
}

const SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOG", "META", "TSLA", "ORCL", "IBM", "INTC"]
const VENUES = ["NYSE", "NASDAQ", "BATS", "IEX", "ARCA"]
const TRADERS = ["A. Rivera", "J. Chen", "M. Okafor", "S. Patel", "L. Novak", "R. Haddad"]
const STATUSES = ["Filled", "Filled", "Filled", "Pending", "Rejected"] as const

function makeData(n: number): Trade[] {
  let seed = 42
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const start = Date.now() - n * 60_000
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    symbol: SYMBOLS[Math.floor(rnd() * SYMBOLS.length)],
    side: rnd() > 0.5 ? "BUY" : "SELL",
    qty: Math.floor(rnd() * 10_000) + 1,
    price: Math.round(rnd() * 100_000) / 100,
    venue: VENUES[Math.floor(rnd() * VENUES.length)],
    trader: TRADERS[Math.floor(rnd() * TRADERS.length)],
    ts: new Date(start + i * 60_000),
    status: STATUSES[Math.floor(rnd() * STATUSES.length)],
  }))
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function App() {
  const [dark, setDark] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [selection, setSelection] = React.useState<DataTableRegion[]>([])
  const data = React.useMemo(() => makeData(100_000), [])

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const columns = React.useMemo<DataTableColumn<Trade>[]>(() => {
    const base: DataTableColumn<Trade>[] = [
      { id: "id", header: "ID", width: 80, align: "right", sortable: true },
      { id: "symbol", header: "Symbol", width: 90, sortable: true, className: "font-mono" },
      {
        id: "side",
        header: "Side",
        width: 80,
        sortable: true,
        cell: ({ value }) => (
          <Badge minimal variant={value === "BUY" ? "success" : "destructive"}>
            {String(value)}
          </Badge>
        ),
      },
      {
        id: "qty",
        header: "Quantity",
        width: 100,
        align: "right",
        sortable: true,
        format: (v) => Number(v).toLocaleString(),
      },
      {
        id: "price",
        header: "Price",
        width: 110,
        align: "right",
        sortable: true,
        format: (v) => money.format(Number(v)),
      },
      {
        id: "notional",
        header: "Notional",
        width: 140,
        align: "right",
        sortable: true,
        accessor: (r) => r.qty * r.price,
        format: (v) => money.format(Number(v)),
      },
      { id: "venue", header: "Venue", width: 90, sortable: true },
      { id: "trader", header: "Trader", width: 130, sortable: true },
      {
        id: "ts",
        header: "Timestamp",
        width: 180,
        sortable: true,
        format: (v) => (v as Date).toISOString().replace("T", " ").slice(0, 19),
      },
      {
        id: "status",
        header: "Status",
        width: 100,
        sortable: true,
        cell: ({ value }) => (
          <span
            className={
              value === "Filled"
                ? "text-success-text"
                : value === "Pending"
                  ? "text-warning-text"
                  : "text-destructive-text"
            }
          >
            {String(value)}
          </span>
        ),
      },
    ]
    // Extra columns to exercise horizontal virtualization.
    for (let i = 1; i <= 40; i++) {
      base.push({
        id: `m${i}`,
        header: `Metric ${i}`,
        width: 100,
        align: "right",
        accessor: (r) => ((r.id * (i + 7)) % 997) / 10,
      })
    }
    return base
  }, [])

  const summary = selection.length
    ? selection
        .map(
          (r) =>
            `rows ${r.rows ? r.rows.join("-") : "all"}, cols ${r.cols ? r.cols.join("-") : "all"}`
        )
        .join("; ")
    : "nothing selected"

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-5">
      <header className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Bedrock</h1>
        <span className="text-muted-foreground">@aberwest/bedrock playground</span>
        <Button
          className="ml-auto"
          variant="secondary"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Intents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {(["solid", "outlined", "minimal"] as const).map((appearance) => (
            <div key={appearance} className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-xs text-muted-foreground">{appearance}</span>
              <Button appearance={appearance} variant="secondary">
                Default
              </Button>
              <Button appearance={appearance}>
                <PlusIcon />
                Primary
              </Button>
              <Button appearance={appearance} variant="success">
                Success
              </Button>
              <Button appearance={appearance} variant="warning">
                Warning
              </Button>
              <Button appearance={appearance} variant="destructive">
                <TrashIcon />
                Danger
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 text-xs text-muted-foreground">sizes</span>
            <Button size="sm" variant="secondary">
              Small
            </Button>
            <Button variant="secondary">Regular</Button>
            <Button size="lg" variant="secondary">
              Large
            </Button>
            <Button loading>Saving</Button>
            <Input className="w-56" placeholder="Search trades..." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 text-xs text-muted-foreground">tags</span>
            <Badge variant="secondary">Default</Badge>
            <Badge>Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Danger</Badge>
            <Badge minimal>Minimal</Badge>
            <Badge minimal variant="success">
              Minimal
            </Badge>
            <Badge round minimal variant="secondary">
              Round
            </Badge>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Alert variant="primary">
              <InfoIcon />
              <AlertTitle>Primary callout</AlertTitle>
              <AlertDescription>Neutral information.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <InfoIcon />
              <AlertTitle>Success callout</AlertTitle>
              <AlertDescription>The export finished.</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <InfoIcon />
              <AlertTitle>Warning callout</AlertTitle>
              <AlertDescription>Market data is delayed.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <InfoIcon />
              <AlertTitle>Danger callout</AlertTitle>
              <AlertDescription>3 orders were rejected.</AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle>DataTable: 100,000 rows x 50 columns</CardTitle>
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto"
            onClick={() => setLoading((l) => !l)}
          >
            {loading ? "Stop loading" : "Simulate loading"}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Drag to select, shift-click to extend, Ctrl/Cmd-click to add regions, click headers to
            select columns, arrows to move, Ctrl/Cmd+C to copy. Drag a header edge to resize;
            double-click it to fit. The first 2 columns are frozen.
          </p>
          <DataTable
            aria-label="Trades"
            data={data}
            columns={columns}
            frozenColumns={2}
            striped
            loading={loading}
            onSelectionChange={setSelection}
            className="h-[520px]"
          />
          <p className="text-xs text-muted-foreground">Selection: {summary}</p>
        </CardContent>
      </Card>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
