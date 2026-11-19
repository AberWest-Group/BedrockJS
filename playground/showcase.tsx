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
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BellIcon,
  BoldIcon,
  CalendarIcon,
  ChevronDownIcon,
  CopyIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  InfoIcon,
  ItalicIcon,
  MailIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  TrashIcon,
  UnderlineIcon,
  UserIcon,
  XIcon,
} from "lucide-react"
import * as B from "../src"
import type { DataTableColumn, DataTableRegion } from "../src"

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

type SectionDef = { id: string; title: string; render: () => React.ReactNode; wide?: boolean }

function Section({ def }: { def: SectionDef }) {
  return (
    <section id={def.id} className="scroll-mt-16">
      <B.Card className="gap-4 py-4">
        <B.CardHeader className="px-4">
          <B.CardTitle className="flex items-center gap-2 text-sm">
            {def.title}
            <code className="font-mono text-xs font-normal text-muted-foreground">{def.id}</code>
          </B.CardTitle>
        </B.CardHeader>
        <B.CardContent className="px-4">{def.render()}</B.CardContent>
      </B.Card>
    </section>
  )
}

const Row = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={B.cn("flex flex-wrap items-center gap-2", className)}>{children}</div>
)

// ---------------------------------------------------------------------------
// Demos that need state
// ---------------------------------------------------------------------------

function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return <B.Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md shadow-xs" />
}

const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies B.ChartConfig

function ChartDemo() {
  return (
    <B.ChartContainer config={chartConfig} className="h-56 w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <B.ChartTooltip content={<B.ChartTooltipContent />} />
        <B.ChartLegend content={<B.ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={2} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={2} />
      </BarChart>
    </B.ChartContainer>
  )
}

const fruits = ["Apple", "Banana", "Blueberry", "Cherry", "Grape", "Lemon", "Mango", "Orange", "Peach"]

function ComboboxDemo() {
  return (
    <B.Combobox items={fruits}>
      <B.ComboboxInput placeholder="Pick a fruit..." className="w-64" />
      <B.ComboboxContent>
        <B.ComboboxEmpty>No fruit found.</B.ComboboxEmpty>
        <B.ComboboxList>
          {(item: string) => (
            <B.ComboboxItem key={item} value={item}>
              {item}
            </B.ComboboxItem>
          )}
        </B.ComboboxList>
      </B.ComboboxContent>
    </B.Combobox>
  )
}

function CommandDemo() {
  return (
    <B.Command className="max-w-md rounded-md shadow-xs">
      <B.CommandInput placeholder="Type a command or search..." />
      <B.CommandList>
        <B.CommandEmpty>No results found.</B.CommandEmpty>
        <B.CommandGroup heading="Suggestions">
          <B.CommandItem>
            <CalendarIcon />
            Calendar
          </B.CommandItem>
          <B.CommandItem>
            <SearchIcon />
            Search
          </B.CommandItem>
        </B.CommandGroup>
        <B.CommandSeparator />
        <B.CommandGroup heading="Settings">
          <B.CommandItem>
            <UserIcon />
            Profile
            <B.CommandShortcut>Ctrl+P</B.CommandShortcut>
          </B.CommandItem>
          <B.CommandItem>
            <SettingsIcon />
            Settings
            <B.CommandShortcut>Ctrl+S</B.CommandShortcut>
          </B.CommandItem>
        </B.CommandGroup>
      </B.CommandList>
    </B.Command>
  )
}

type ProfileForm = { username: string; email: string }

function FormDemo() {
  const form = useForm<ProfileForm>({ defaultValues: { username: "", email: "" } })
  return (
    <B.Form {...form}>
      <form
        className="flex max-w-sm flex-col gap-4"
        onSubmit={form.handleSubmit((v) => toast.success(`Saved ${v.username}`))}
      >
        <B.FormField
          control={form.control}
          name="username"
          rules={{ required: "Username is required", minLength: { value: 2, message: "At least 2 characters" } }}
          render={({ field }) => (
            <B.FormItem>
              <B.FormLabel>Username</B.FormLabel>
              <B.FormControl>
                <B.Input placeholder="jdoe" {...field} />
              </B.FormControl>
              <B.FormDescription>Your public display name.</B.FormDescription>
              <B.FormMessage />
            </B.FormItem>
          )}
        />
        <B.FormField
          control={form.control}
          name="email"
          rules={{ required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } }}
          render={({ field }) => (
            <B.FormItem>
              <B.FormLabel>Email</B.FormLabel>
              <B.FormControl>
                <B.Input type="email" placeholder="jdoe@example.com" {...field} />
              </B.FormControl>
              <B.FormMessage />
            </B.FormItem>
          )}
        />
        <Row>
          <B.Button type="submit">Submit</B.Button>
          <B.Button type="button" variant="secondary" onClick={() => form.reset()}>
            Reset
          </B.Button>
        </Row>
      </form>
    </B.Form>
  )
}

function ProgressDemo() {
  const [value, setValue] = React.useState(35)
  React.useEffect(() => {
    const t = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 5)), 600)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <B.Progress value={value} />
      <span className="text-xs text-muted-foreground">{value}%</span>
    </div>
  )
}

function SliderDemo() {
  const [value, setValue] = React.useState([40])
  const [range, setRange] = React.useState([20, 80])
  return (
    <div className="flex max-w-sm flex-col gap-6">
      <B.Slider value={value} onValueChange={setValue} max={100} step={1} />
      <B.Slider value={range} onValueChange={setRange} max={100} step={5} />
      <span className="text-xs text-muted-foreground">
        {value[0]} / {range[0]}-{range[1]}
      </span>
    </div>
  )
}

const messages = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  mine: i % 3 === 0,
  text: i % 3 === 0 ? `Reply #${i}: sounds good.` : `Message #${i}: status update on the data pipeline.`,
}))

function MessageScrollerDemo() {
  return (
    <div className="h-64 rounded-md shadow-xs">
      <B.MessageScrollerProvider>
      <B.MessageScroller>
        <B.MessageScrollerViewport className="p-3">
          <B.MessageScrollerContent className="flex flex-col gap-2">
            {messages.map((m) => (
              <B.MessageScrollerItem key={m.id}>
                <B.Bubble align={m.mine ? "end" : "start"} variant={m.mine ? "default" : "muted"}>
                  <B.BubbleContent>{m.text}</B.BubbleContent>
                </B.Bubble>
              </B.MessageScrollerItem>
            ))}
          </B.MessageScrollerContent>
        </B.MessageScrollerViewport>
        <B.MessageScrollerButton />
      </B.MessageScroller>
      </B.MessageScrollerProvider>
    </div>
  )
}

function SidebarDemo() {
  const items = [
    { title: "Home", icon: HomeIcon },
    { title: "Inbox", icon: InboxIcon, badge: "12" },
    { title: "Projects", icon: FolderIcon },
    { title: "Settings", icon: SettingsIcon },
  ]
  return (
    <div className="h-72 overflow-hidden rounded-md shadow-xs">
      <B.SidebarProvider className="min-h-0 h-full">
        <B.Sidebar collapsible="none" className="h-full border-r">
          <B.SidebarHeader>
            <B.SidebarInput placeholder="Search..." />
          </B.SidebarHeader>
          <B.SidebarContent>
            <B.SidebarGroup>
              <B.SidebarGroupLabel>Workspace</B.SidebarGroupLabel>
              <B.SidebarGroupContent>
                <B.SidebarMenu>
                  {items.map((it, i) => (
                    <B.SidebarMenuItem key={it.title}>
                      <B.SidebarMenuButton isActive={i === 0}>
                        <it.icon />
                        <span>{it.title}</span>
                      </B.SidebarMenuButton>
                      {it.badge && <B.SidebarMenuBadge>{it.badge}</B.SidebarMenuBadge>}
                    </B.SidebarMenuItem>
                  ))}
                </B.SidebarMenu>
              </B.SidebarGroupContent>
            </B.SidebarGroup>
          </B.SidebarContent>
          <B.SidebarFooter>
            <B.SidebarMenuSkeleton showIcon />
          </B.SidebarFooter>
        </B.Sidebar>
        <main className="flex-1 p-4 text-sm text-muted-foreground">Page content</main>
      </B.SidebarProvider>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DataTable demo
// ---------------------------------------------------------------------------

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
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

function makeTrades(n: number): Trade[] {
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

function DataTableDemo() {
  const [loading, setLoading] = React.useState(false)
  const [selection, setSelection] = React.useState<DataTableRegion[]>([])
  const data = React.useMemo(() => makeTrades(100_000), [])
  const columns = React.useMemo<DataTableColumn<Trade>[]>(() => {
    const cols: DataTableColumn<Trade>[] = [
      { id: "id", header: "ID", width: 80, align: "right", sortable: true },
      { id: "symbol", header: "Symbol", width: 90, sortable: true, className: "font-mono" },
      {
        id: "side",
        header: "Side",
        width: 80,
        sortable: true,
        cell: ({ value }) => (
          <B.Badge minimal variant={value === "BUY" ? "success" : "destructive"}>
            {String(value)}
          </B.Badge>
        ),
      },
      { id: "qty", header: "Quantity", width: 100, align: "right", sortable: true, format: (v) => Number(v).toLocaleString() },
      { id: "price", header: "Price", width: 110, align: "right", sortable: true, format: (v) => money.format(Number(v)) },
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
              value === "Filled" ? "text-success-text" : value === "Pending" ? "text-warning-text" : "text-destructive-text"
            }
          >
            {String(value)}
          </span>
        ),
      },
    ]
    for (let i = 1; i <= 40; i++) {
      cols.push({ id: `m${i}`, header: `Metric ${i}`, width: 100, align: "right", accessor: (r) => ((r.id * (i + 7)) % 997) / 10 })
    }
    return cols
  }, [])

  const summary = selection.length
    ? selection.map((r) => `rows ${r.rows ? r.rows.join("-") : "all"}, cols ${r.cols ? r.cols.join("-") : "all"}`).join("; ")
    : "nothing selected"

  return (
    <div className="flex flex-col gap-2">
      <Row>
        <p className="flex-1 text-xs text-muted-foreground">
          100,000 rows x 50 columns. Drag to select, shift-click to extend, Ctrl/Cmd-click to add regions, click
          headers to select columns, arrow keys to move, Ctrl/Cmd+C to copy. Drag a header edge to resize,
          double-click to fit. The first 2 columns are frozen.
        </p>
        <B.Button size="sm" variant="secondary" onClick={() => setLoading((l) => !l)}>
          {loading ? "Stop loading" : "Simulate loading"}
        </B.Button>
      </Row>
      <B.DataTable
        aria-label="Trades"
        data={data}
        columns={columns}
        frozenColumns={2}
        striped
        loading={loading}
        onSelectionChange={setSelection}
        className="h-[480px]"
      />
      <p className="text-xs text-muted-foreground">Selection: {summary}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// All sections, alphabetical (matches src/components/ui)
// ---------------------------------------------------------------------------

const sections: SectionDef[] = [
  {
    id: "accordion",
    title: "Accordion",
    render: () => (
      <B.Accordion type="single" collapsible className="max-w-lg">
        <B.AccordionItem value="a">
          <B.AccordionTrigger>Is it accessible?</B.AccordionTrigger>
          <B.AccordionContent>Yes. It follows the WAI-ARIA design pattern.</B.AccordionContent>
        </B.AccordionItem>
        <B.AccordionItem value="b">
          <B.AccordionTrigger>Is it themeable?</B.AccordionTrigger>
          <B.AccordionContent>Every colour comes from CSS variables in theme.css.</B.AccordionContent>
        </B.AccordionItem>
        <B.AccordionItem value="c">
          <B.AccordionTrigger>Is it animated?</B.AccordionTrigger>
          <B.AccordionContent>Yes, with tw-animate-css.</B.AccordionContent>
        </B.AccordionItem>
      </B.Accordion>
    ),
  },
  {
    id: "alert-dialog",
    title: "Alert Dialog",
    render: () => (
      <B.AlertDialog>
        <B.AlertDialogTrigger asChild>
          <B.Button variant="destructive">
            <TrashIcon />
            Delete project
          </B.Button>
        </B.AlertDialogTrigger>
        <B.AlertDialogContent>
          <B.AlertDialogHeader>
            <B.AlertDialogTitle>Delete this project?</B.AlertDialogTitle>
            <B.AlertDialogDescription>This permanently deletes the project and its data.</B.AlertDialogDescription>
          </B.AlertDialogHeader>
          <B.AlertDialogFooter>
            <B.AlertDialogCancel>Cancel</B.AlertDialogCancel>
            <B.AlertDialogAction>Delete</B.AlertDialogAction>
          </B.AlertDialogFooter>
        </B.AlertDialogContent>
      </B.AlertDialog>
    ),
  },
  {
    id: "alert",
    title: "Alert (callout)",
    render: () => (
      <div className="grid gap-2 md:grid-cols-2">
        {(["default", "primary", "success", "warning", "destructive"] as const).map((v) => (
          <B.Alert key={v} variant={v}>
            <InfoIcon />
            <B.AlertTitle className="capitalize">{v} callout</B.AlertTitle>
            <B.AlertDescription>Something worth knowing about.</B.AlertDescription>
          </B.Alert>
        ))}
      </div>
    ),
  },
  {
    id: "aspect-ratio",
    title: "Aspect Ratio",
    render: () => (
      <div className="w-64">
        <B.AspectRatio ratio={16 / 9} className="flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
          16 : 9
        </B.AspectRatio>
      </div>
    ),
  },
  {
    id: "attachment",
    title: "Attachment",
    render: () => (
      <B.AttachmentGroup>
        {(["done", "uploading", "error"] as const).map((state) => (
          <B.Attachment key={state} state={state}>
            <B.AttachmentMedia>
              <FileTextIcon />
            </B.AttachmentMedia>
            <B.AttachmentContent>
              <B.AttachmentTitle>report-q3.pdf</B.AttachmentTitle>
              <B.AttachmentDescription>{state}</B.AttachmentDescription>
            </B.AttachmentContent>
            <B.AttachmentActions>
              <B.AttachmentAction aria-label="Remove">
                <XIcon />
              </B.AttachmentAction>
            </B.AttachmentActions>
          </B.Attachment>
        ))}
      </B.AttachmentGroup>
    ),
  },
  {
    id: "avatar",
    title: "Avatar",
    render: () => (
      <Row className="gap-4">
        <B.Avatar>
          <B.AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
          <B.AvatarFallback>CN</B.AvatarFallback>
        </B.Avatar>
        <B.Avatar>
          <B.AvatarFallback>AW</B.AvatarFallback>
          <B.AvatarBadge />
        </B.Avatar>
        <B.AvatarGroup>
          {["AB", "CD", "EF"].map((i) => (
            <B.Avatar key={i}>
              <B.AvatarFallback>{i}</B.AvatarFallback>
            </B.Avatar>
          ))}
          <B.AvatarGroupCount>+5</B.AvatarGroupCount>
        </B.AvatarGroup>
      </Row>
    ),
  },
  {
    id: "badge",
    title: "Badge (tag)",
    render: () => (
      <div className="flex flex-col gap-2">
        <Row>
          <B.Badge variant="secondary">Default</B.Badge>
          <B.Badge>Primary</B.Badge>
          <B.Badge variant="success">Success</B.Badge>
          <B.Badge variant="warning">Warning</B.Badge>
          <B.Badge variant="destructive">Danger</B.Badge>
          <B.Badge variant="outline">Outline</B.Badge>
        </Row>
        <Row>
          <B.Badge minimal variant="secondary">Minimal</B.Badge>
          <B.Badge minimal>Primary</B.Badge>
          <B.Badge minimal variant="success">Success</B.Badge>
          <B.Badge minimal variant="warning">Warning</B.Badge>
          <B.Badge minimal variant="destructive">Danger</B.Badge>
          <B.Badge round>Round</B.Badge>
          <B.Badge size="lg">Large</B.Badge>
        </Row>
      </div>
    ),
  },
  {
    id: "breadcrumb",
    title: "Breadcrumb",
    render: () => (
      <B.Breadcrumb>
        <B.BreadcrumbList>
          <B.BreadcrumbItem>
            <B.BreadcrumbLink href="#">Home</B.BreadcrumbLink>
          </B.BreadcrumbItem>
          <B.BreadcrumbSeparator />
          <B.BreadcrumbItem>
            <B.BreadcrumbEllipsis />
          </B.BreadcrumbItem>
          <B.BreadcrumbSeparator />
          <B.BreadcrumbItem>
            <B.BreadcrumbLink href="#">Components</B.BreadcrumbLink>
          </B.BreadcrumbItem>
          <B.BreadcrumbSeparator />
          <B.BreadcrumbItem>
            <B.BreadcrumbPage>Breadcrumb</B.BreadcrumbPage>
          </B.BreadcrumbItem>
        </B.BreadcrumbList>
      </B.Breadcrumb>
    ),
  },
  {
    id: "bubble",
    title: "Bubble",
    render: () => (
      <B.BubbleGroup className="flex max-w-md flex-col gap-2">
        {(["default", "secondary", "muted", "tinted", "outline", "destructive"] as const).map((v, i) => (
          <B.Bubble key={v} variant={v} align={i % 2 ? "end" : "start"}>
            <B.BubbleContent>{v} bubble</B.BubbleContent>
          </B.Bubble>
        ))}
      </B.BubbleGroup>
    ),
  },
  {
    id: "button-group",
    title: "Button Group",
    render: () => (
      <Row className="gap-4">
        <B.ButtonGroup>
          <B.Button variant="secondary">Archive</B.Button>
          <B.Button variant="secondary">Report</B.Button>
          <B.Button variant="secondary">Snooze</B.Button>
        </B.ButtonGroup>
        <B.ButtonGroup>
          <B.Button variant="secondary" size="icon" aria-label="Bold"><BoldIcon /></B.Button>
          <B.Button variant="secondary" size="icon" aria-label="Italic"><ItalicIcon /></B.Button>
          <B.ButtonGroupSeparator />
          <B.Button variant="secondary" size="icon" aria-label="Underline"><UnderlineIcon /></B.Button>
        </B.ButtonGroup>
        <B.ButtonGroup>
          <B.ButtonGroupText>https://</B.ButtonGroupText>
          <B.Input placeholder="example.com" className="w-40" />
        </B.ButtonGroup>
      </Row>
    ),
  },
  {
    id: "button",
    title: "Button",
    render: () => (
      <div className="flex flex-col gap-3">
        {(["solid", "outlined", "minimal"] as const).map((appearance) => (
          <Row key={appearance}>
            <span className="w-16 text-xs text-muted-foreground">{appearance}</span>
            <B.Button appearance={appearance} variant="secondary">Default</B.Button>
            <B.Button appearance={appearance}><PlusIcon />Primary</B.Button>
            <B.Button appearance={appearance} variant="success">Success</B.Button>
            <B.Button appearance={appearance} variant="warning">Warning</B.Button>
            <B.Button appearance={appearance} variant="destructive"><TrashIcon />Danger</B.Button>
          </Row>
        ))}
        <Row>
          <span className="w-16 text-xs text-muted-foreground">other</span>
          <B.Button size="xs" variant="secondary">XS</B.Button>
          <B.Button size="sm" variant="secondary">Small</B.Button>
          <B.Button size="lg" variant="secondary">Large</B.Button>
          <B.Button size="icon" variant="secondary" aria-label="Add"><PlusIcon /></B.Button>
          <B.Button loading>Saving</B.Button>
          <B.Button disabled>Disabled</B.Button>
          <B.Button variant="ghost">Ghost</B.Button>
          <B.Button variant="outline">Outline</B.Button>
          <B.Button variant="link">Link</B.Button>
        </Row>
      </div>
    ),
  },
  { id: "calendar", title: "Calendar", render: () => <CalendarDemo /> },
  {
    id: "card",
    title: "Card",
    render: () => (
      <B.Card className="max-w-sm">
        <B.CardHeader>
          <B.CardTitle>Quarterly report</B.CardTitle>
          <B.CardDescription>Generated 2 hours ago</B.CardDescription>
          <B.CardAction>
            <B.Button size="sm" appearance="minimal" variant="secondary">Open</B.Button>
          </B.CardAction>
        </B.CardHeader>
        <B.CardContent className="text-sm">Revenue is up 12% quarter over quarter.</B.CardContent>
        <B.CardFooter className="gap-2">
          <B.Button size="sm">Download</B.Button>
          <B.Button size="sm" variant="secondary">Share</B.Button>
        </B.CardFooter>
      </B.Card>
    ),
  },
  {
    id: "carousel",
    title: "Carousel",
    render: () => (
      <div className="px-12">
        <B.Carousel className="w-full max-w-xs">
          <B.CarouselContent>
            {Array.from({ length: 5 }, (_, i) => (
              <B.CarouselItem key={i}>
                <div className="flex aspect-video items-center justify-center rounded-md bg-muted text-2xl font-semibold">
                  {i + 1}
                </div>
              </B.CarouselItem>
            ))}
          </B.CarouselContent>
          <B.CarouselPrevious />
          <B.CarouselNext />
        </B.Carousel>
      </div>
    ),
  },
  { id: "chart", title: "Chart", render: () => <ChartDemo /> },
  {
    id: "checkbox",
    title: "Checkbox",
    render: () => (
      <Row className="gap-6">
        <div className="flex items-center gap-2">
          <B.Checkbox id="cb1" defaultChecked />
          <B.Label htmlFor="cb1">Accept terms</B.Label>
        </div>
        <div className="flex items-center gap-2">
          <B.Checkbox id="cb2" />
          <B.Label htmlFor="cb2">Subscribe</B.Label>
        </div>
        <div className="flex items-center gap-2">
          <B.Checkbox id="cb3" disabled />
          <B.Label htmlFor="cb3">Disabled</B.Label>
        </div>
      </Row>
    ),
  },
  {
    id: "collapsible",
    title: "Collapsible",
    render: () => (
      <B.Collapsible className="flex max-w-sm flex-col gap-2">
        <B.CollapsibleTrigger asChild>
          <B.Button variant="secondary" className="justify-between">
            3 repositories
            <ChevronDownIcon />
          </B.Button>
        </B.CollapsibleTrigger>
        <div className="rounded-md px-3 py-2 font-mono text-sm shadow-xs">aberwest/bedrock</div>
        <B.CollapsibleContent className="flex flex-col gap-2">
          <div className="rounded-md px-3 py-2 font-mono text-sm shadow-xs">aberwest/web</div>
          <div className="rounded-md px-3 py-2 font-mono text-sm shadow-xs">aberwest/api</div>
        </B.CollapsibleContent>
      </B.Collapsible>
    ),
  },
  { id: "combobox", title: "Combobox", render: () => <ComboboxDemo /> },
  { id: "command", title: "Command", render: () => <CommandDemo /> },
  {
    id: "context-menu",
    title: "Context Menu",
    render: () => (
      <B.ContextMenu>
        <B.ContextMenuTrigger className="flex h-32 max-w-sm items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Right-click here
        </B.ContextMenuTrigger>
        <B.ContextMenuContent className="w-52">
          <B.ContextMenuItem>Back<B.ContextMenuShortcut>Alt+Left</B.ContextMenuShortcut></B.ContextMenuItem>
          <B.ContextMenuItem>Reload<B.ContextMenuShortcut>Ctrl+R</B.ContextMenuShortcut></B.ContextMenuItem>
          <B.ContextMenuSub>
            <B.ContextMenuSubTrigger>More tools</B.ContextMenuSubTrigger>
            <B.ContextMenuSubContent>
              <B.ContextMenuItem>Save page as...</B.ContextMenuItem>
              <B.ContextMenuItem>Developer tools</B.ContextMenuItem>
            </B.ContextMenuSubContent>
          </B.ContextMenuSub>
          <B.ContextMenuSeparator />
          <B.ContextMenuCheckboxItem checked>Show bookmarks</B.ContextMenuCheckboxItem>
          <B.ContextMenuRadioGroup value="a">
            <B.ContextMenuLabel>People</B.ContextMenuLabel>
            <B.ContextMenuRadioItem value="a">Alex</B.ContextMenuRadioItem>
            <B.ContextMenuRadioItem value="b">Sam</B.ContextMenuRadioItem>
          </B.ContextMenuRadioGroup>
        </B.ContextMenuContent>
      </B.ContextMenu>
    ),
  },
  { id: "data-table", title: "Data Table", render: () => <DataTableDemo />, wide: true },
  {
    id: "dialog",
    title: "Dialog",
    render: () => (
      <B.Dialog>
        <B.DialogTrigger asChild>
          <B.Button variant="secondary">Edit profile</B.Button>
        </B.DialogTrigger>
        <B.DialogContent className="sm:max-w-md">
          <B.DialogHeader>
            <B.DialogTitle>Edit profile</B.DialogTitle>
            <B.DialogDescription>Make changes to your profile, then save.</B.DialogDescription>
          </B.DialogHeader>
          <div className="flex flex-col gap-3">
            <B.Label htmlFor="dlg-name">Name</B.Label>
            <B.Input id="dlg-name" defaultValue="Alex Rivera" />
          </div>
          <B.DialogFooter>
            <B.DialogClose asChild>
              <B.Button variant="secondary">Cancel</B.Button>
            </B.DialogClose>
            <B.Button>Save</B.Button>
          </B.DialogFooter>
        </B.DialogContent>
      </B.Dialog>
    ),
  },
  {
    id: "direction",
    title: "Direction (RTL)",
    render: () => (
      <B.DirectionProvider dir="rtl">
        <div dir="rtl" className="flex flex-col gap-2">
          <Row>
            <B.Button><MailIcon />ارسال</B.Button>
            <B.Badge minimal>جديد</B.Badge>
          </Row>
          <B.Input placeholder="بحث..." className="max-w-xs" />
        </div>
      </B.DirectionProvider>
    ),
  },
  {
    id: "drawer",
    title: "Drawer",
    render: () => (
      <B.Drawer>
        <B.DrawerTrigger asChild>
          <B.Button variant="secondary">Open drawer</B.Button>
        </B.DrawerTrigger>
        <B.DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <B.DrawerHeader>
              <B.DrawerTitle>Daily goal</B.DrawerTitle>
              <B.DrawerDescription>Set your daily activity goal.</B.DrawerDescription>
            </B.DrawerHeader>
            <div className="p-4 text-center text-5xl font-bold">350</div>
            <B.DrawerFooter>
              <B.Button>Submit</B.Button>
              <B.DrawerClose asChild>
                <B.Button variant="secondary">Cancel</B.Button>
              </B.DrawerClose>
            </B.DrawerFooter>
          </div>
        </B.DrawerContent>
      </B.Drawer>
    ),
  },
  {
    id: "dropdown-menu",
    title: "Dropdown Menu",
    render: () => (
      <B.DropdownMenu>
        <B.DropdownMenuTrigger asChild>
          <B.Button variant="secondary">
            Options
            <ChevronDownIcon />
          </B.Button>
        </B.DropdownMenuTrigger>
        <B.DropdownMenuContent className="w-56" align="start">
          <B.DropdownMenuLabel>My account</B.DropdownMenuLabel>
          <B.DropdownMenuGroup>
            <B.DropdownMenuItem><UserIcon />Profile<B.DropdownMenuShortcut>Ctrl+P</B.DropdownMenuShortcut></B.DropdownMenuItem>
            <B.DropdownMenuItem><SettingsIcon />Settings</B.DropdownMenuItem>
          </B.DropdownMenuGroup>
          <B.DropdownMenuSeparator />
          <B.DropdownMenuSub>
            <B.DropdownMenuSubTrigger>Invite users</B.DropdownMenuSubTrigger>
            <B.DropdownMenuSubContent>
              <B.DropdownMenuItem>Email</B.DropdownMenuItem>
              <B.DropdownMenuItem>Message</B.DropdownMenuItem>
            </B.DropdownMenuSubContent>
          </B.DropdownMenuSub>
          <B.DropdownMenuCheckboxItem checked>Status bar</B.DropdownMenuCheckboxItem>
          <B.DropdownMenuSeparator />
          <B.DropdownMenuItem variant="destructive"><TrashIcon />Delete</B.DropdownMenuItem>
        </B.DropdownMenuContent>
      </B.DropdownMenu>
    ),
  },
  {
    id: "empty",
    title: "Empty",
    render: () => (
      <B.Empty className="border border-dashed">
        <B.EmptyHeader>
          <B.EmptyMedia variant="icon">
            <FolderIcon />
          </B.EmptyMedia>
          <B.EmptyTitle>No projects yet</B.EmptyTitle>
          <B.EmptyDescription>Create your first project to get started.</B.EmptyDescription>
        </B.EmptyHeader>
        <B.EmptyContent>
          <B.Button><PlusIcon />New project</B.Button>
        </B.EmptyContent>
      </B.Empty>
    ),
  },
  {
    id: "field",
    title: "Field",
    render: () => (
      <B.FieldSet className="max-w-sm">
        <B.FieldLegend>Payment</B.FieldLegend>
        <B.FieldGroup>
          <B.Field>
            <B.FieldLabel htmlFor="f-name">Name on card</B.FieldLabel>
            <B.Input id="f-name" placeholder="Alex Rivera" />
          </B.Field>
          <B.Field data-invalid>
            <B.FieldLabel htmlFor="f-card">Card number</B.FieldLabel>
            <B.Input id="f-card" aria-invalid defaultValue="1234" />
            <B.FieldError>Card number is too short.</B.FieldError>
          </B.Field>
          <B.FieldSeparator />
          <B.Field orientation="horizontal">
            <B.Checkbox id="f-save" defaultChecked />
            <B.FieldLabel htmlFor="f-save">Save card for later</B.FieldLabel>
          </B.Field>
          <B.FieldDescription>We never store your CVC.</B.FieldDescription>
        </B.FieldGroup>
      </B.FieldSet>
    ),
  },
  { id: "form", title: "Form", render: () => <FormDemo /> },
  {
    id: "hover-card",
    title: "Hover Card",
    render: () => (
      <B.HoverCard>
        <B.HoverCardTrigger asChild>
          <B.Button variant="link">@aberwest</B.Button>
        </B.HoverCardTrigger>
        <B.HoverCardContent className="w-72">
          <div className="flex gap-3">
            <B.Avatar><B.AvatarFallback>AW</B.AvatarFallback></B.Avatar>
            <div className="text-sm">
              <div className="font-semibold">AberWest</div>
              <p className="text-muted-foreground">Shared component library for every web app.</p>
            </div>
          </div>
        </B.HoverCardContent>
      </B.HoverCard>
    ),
  },
  {
    id: "input-group",
    title: "Input Group",
    render: () => (
      <div className="flex max-w-sm flex-col gap-3">
        <B.InputGroup>
          <B.InputGroupAddon><SearchIcon /></B.InputGroupAddon>
          <B.InputGroupInput placeholder="Search..." />
          <B.InputGroupAddon align="inline-end">
            <B.InputGroupText>12 results</B.InputGroupText>
          </B.InputGroupAddon>
        </B.InputGroup>
        <B.InputGroup>
          <B.InputGroupInput placeholder="https://example.com/invite/abc" readOnly />
          <B.InputGroupAddon align="inline-end">
            <B.InputGroupButton size="icon-xs" aria-label="Copy"><CopyIcon /></B.InputGroupButton>
          </B.InputGroupAddon>
        </B.InputGroup>
        <B.InputGroup>
          <B.InputGroupTextarea placeholder="Write a comment..." />
          <B.InputGroupAddon align="block-end">
            <B.InputGroupButton size="sm" className="ml-auto" variant="default">Post</B.InputGroupButton>
          </B.InputGroupAddon>
        </B.InputGroup>
      </div>
    ),
  },
  {
    id: "input-otp",
    title: "Input OTP",
    render: () => (
      <B.InputOTP maxLength={6}>
        <B.InputOTPGroup>
          <B.InputOTPSlot index={0} />
          <B.InputOTPSlot index={1} />
          <B.InputOTPSlot index={2} />
        </B.InputOTPGroup>
        <B.InputOTPSeparator />
        <B.InputOTPGroup>
          <B.InputOTPSlot index={3} />
          <B.InputOTPSlot index={4} />
          <B.InputOTPSlot index={5} />
        </B.InputOTPGroup>
      </B.InputOTP>
    ),
  },
  {
    id: "input",
    title: "Input",
    render: () => (
      <div className="flex max-w-sm flex-col gap-3">
        <B.Input placeholder="Default" />
        <B.Input type="email" placeholder="Email" />
        <B.Input aria-invalid defaultValue="Invalid value" />
        <B.Input disabled placeholder="Disabled" />
        <B.Input type="file" />
      </div>
    ),
  },
  {
    id: "item",
    title: "Item",
    render: () => (
      <B.ItemGroup className="max-w-md">
        <B.Item variant="outline">
          <B.ItemMedia variant="icon"><BellIcon /></B.ItemMedia>
          <B.ItemContent>
            <B.ItemTitle>Notifications</B.ItemTitle>
            <B.ItemDescription>Choose what you want to be notified about.</B.ItemDescription>
          </B.ItemContent>
          <B.ItemActions>
            <B.Button size="sm" variant="secondary">Manage</B.Button>
          </B.ItemActions>
        </B.Item>
        <B.ItemSeparator />
        <B.Item>
          <B.ItemMedia>
            <B.Avatar><B.AvatarFallback>JC</B.AvatarFallback></B.Avatar>
          </B.ItemMedia>
          <B.ItemContent>
            <B.ItemTitle>J. Chen</B.ItemTitle>
            <B.ItemDescription>Invited you to a project.</B.ItemDescription>
          </B.ItemContent>
          <B.ItemActions>
            <B.Button size="sm">Accept</B.Button>
          </B.ItemActions>
        </B.Item>
      </B.ItemGroup>
    ),
  },
  {
    id: "kbd",
    title: "Kbd",
    render: () => (
      <Row>
        <B.KbdGroup>
          <B.Kbd>Ctrl</B.Kbd>
          <span>+</span>
          <B.Kbd>K</B.Kbd>
        </B.KbdGroup>
        <B.Kbd>Esc</B.Kbd>
        <B.Kbd>Shift</B.Kbd>
      </Row>
    ),
  },
  {
    id: "label",
    title: "Label",
    render: () => (
      <div className="flex max-w-sm flex-col gap-2">
        <B.Label htmlFor="lbl">Email address</B.Label>
        <B.Input id="lbl" placeholder="you@example.com" />
      </div>
    ),
  },
  {
    id: "marker",
    title: "Marker",
    render: () => (
      <div className="flex max-w-md flex-col gap-3">
        <B.Marker>
          <B.MarkerIcon><InfoIcon /></B.MarkerIcon>
          <B.MarkerContent>Default marker</B.MarkerContent>
        </B.Marker>
        <B.Marker variant="separator">
          <B.MarkerContent>Today</B.MarkerContent>
        </B.Marker>
        <B.Marker variant="border">
          <B.MarkerContent>Bordered marker</B.MarkerContent>
        </B.Marker>
      </div>
    ),
  },
  {
    id: "menubar",
    title: "Menubar",
    render: () => (
      <B.Menubar className="w-fit">
        <B.MenubarMenu>
          <B.MenubarTrigger>File</B.MenubarTrigger>
          <B.MenubarContent>
            <B.MenubarItem>New tab<B.MenubarShortcut>Ctrl+T</B.MenubarShortcut></B.MenubarItem>
            <B.MenubarItem>New window<B.MenubarShortcut>Ctrl+N</B.MenubarShortcut></B.MenubarItem>
            <B.MenubarSeparator />
            <B.MenubarSub>
              <B.MenubarSubTrigger>Share</B.MenubarSubTrigger>
              <B.MenubarSubContent>
                <B.MenubarItem>Email link</B.MenubarItem>
                <B.MenubarItem>Messages</B.MenubarItem>
              </B.MenubarSubContent>
            </B.MenubarSub>
          </B.MenubarContent>
        </B.MenubarMenu>
        <B.MenubarMenu>
          <B.MenubarTrigger>View</B.MenubarTrigger>
          <B.MenubarContent>
            <B.MenubarCheckboxItem checked>Show toolbar</B.MenubarCheckboxItem>
            <B.MenubarCheckboxItem>Show status bar</B.MenubarCheckboxItem>
            <B.MenubarSeparator />
            <B.MenubarRadioGroup value="comfortable">
              <B.MenubarRadioItem value="compact">Compact</B.MenubarRadioItem>
              <B.MenubarRadioItem value="comfortable">Comfortable</B.MenubarRadioItem>
            </B.MenubarRadioGroup>
          </B.MenubarContent>
        </B.MenubarMenu>
      </B.Menubar>
    ),
  },
  { id: "message-scroller", title: "Message Scroller", render: () => <MessageScrollerDemo /> },
  {
    id: "message",
    title: "Message",
    render: () => (
      <B.MessageGroup className="flex max-w-lg flex-col gap-3">
        <B.Message>
          <B.MessageAvatar>
            <B.Avatar><B.AvatarFallback>SP</B.AvatarFallback></B.Avatar>
          </B.MessageAvatar>
          <B.MessageContent>
            <B.MessageHeader>S. Patel</B.MessageHeader>
            <B.Bubble variant="muted"><B.BubbleContent>Has the overnight job finished?</B.BubbleContent></B.Bubble>
            <B.MessageFooter>09:12</B.MessageFooter>
          </B.MessageContent>
        </B.Message>
        <B.Message align="end">
          <B.MessageContent>
            <B.Bubble align="end"><B.BubbleContent>Yes, all 14 batches succeeded.</B.BubbleContent></B.Bubble>
            <B.MessageFooter>09:13</B.MessageFooter>
          </B.MessageContent>
        </B.Message>
      </B.MessageGroup>
    ),
  },
  {
    id: "native-select",
    title: "Native Select",
    render: () => (
      <B.NativeSelect defaultValue="uk" className="max-w-xs">
        <B.NativeSelectOptGroup label="Europe">
          <B.NativeSelectOption value="uk">United Kingdom</B.NativeSelectOption>
          <B.NativeSelectOption value="fr">France</B.NativeSelectOption>
        </B.NativeSelectOptGroup>
        <B.NativeSelectOptGroup label="Americas">
          <B.NativeSelectOption value="us">United States</B.NativeSelectOption>
          <B.NativeSelectOption value="ca">Canada</B.NativeSelectOption>
        </B.NativeSelectOptGroup>
      </B.NativeSelect>
    ),
  },
  {
    id: "navigation-menu",
    title: "Navigation Menu",
    render: () => (
      <B.NavigationMenu viewport={false}>
        <B.NavigationMenuList>
          <B.NavigationMenuItem>
            <B.NavigationMenuTrigger>Products</B.NavigationMenuTrigger>
            <B.NavigationMenuContent>
              <ul className="grid w-80 gap-1 p-1">
                {["Analytics", "Pipelines", "Reports"].map((p) => (
                  <li key={p}>
                    <B.NavigationMenuLink href="#">
                      <div className="font-medium">{p}</div>
                      <div className="text-xs text-muted-foreground">Learn more about {p.toLowerCase()}.</div>
                    </B.NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </B.NavigationMenuContent>
          </B.NavigationMenuItem>
          <B.NavigationMenuItem>
            <B.NavigationMenuLink href="#" className={B.navigationMenuTriggerStyle()}>
              Docs
            </B.NavigationMenuLink>
          </B.NavigationMenuItem>
        </B.NavigationMenuList>
      </B.NavigationMenu>
    ),
  },
  {
    id: "pagination",
    title: "Pagination",
    render: () => (
      <B.Pagination className="justify-start">
        <B.PaginationContent>
          <B.PaginationItem><B.PaginationPrevious href="#" /></B.PaginationItem>
          <B.PaginationItem><B.PaginationLink href="#">1</B.PaginationLink></B.PaginationItem>
          <B.PaginationItem><B.PaginationLink href="#" isActive>2</B.PaginationLink></B.PaginationItem>
          <B.PaginationItem><B.PaginationLink href="#">3</B.PaginationLink></B.PaginationItem>
          <B.PaginationItem><B.PaginationEllipsis /></B.PaginationItem>
          <B.PaginationItem><B.PaginationNext href="#" /></B.PaginationItem>
        </B.PaginationContent>
      </B.Pagination>
    ),
  },
  {
    id: "popover",
    title: "Popover",
    render: () => (
      <B.Popover>
        <B.PopoverTrigger asChild>
          <B.Button variant="secondary">Dimensions</B.Button>
        </B.PopoverTrigger>
        <B.PopoverContent className="w-72" align="start">
          <B.PopoverHeader>
            <B.PopoverTitle>Dimensions</B.PopoverTitle>
            <B.PopoverDescription>Set the layer size.</B.PopoverDescription>
          </B.PopoverHeader>
          <div className="mt-3 grid grid-cols-3 items-center gap-2">
            <B.Label htmlFor="pw">Width</B.Label>
            <B.Input id="pw" defaultValue="100%" className="col-span-2" />
            <B.Label htmlFor="ph">Height</B.Label>
            <B.Input id="ph" defaultValue="25px" className="col-span-2" />
          </div>
        </B.PopoverContent>
      </B.Popover>
    ),
  },
  { id: "progress", title: "Progress", render: () => <ProgressDemo /> },
  {
    id: "radio-group",
    title: "Radio Group",
    render: () => (
      <B.RadioGroup defaultValue="comfortable">
        {["default", "comfortable", "compact"].map((v) => (
          <div key={v} className="flex items-center gap-2">
            <B.RadioGroupItem value={v} id={`rg-${v}`} />
            <B.Label htmlFor={`rg-${v}`} className="capitalize">{v}</B.Label>
          </div>
        ))}
      </B.RadioGroup>
    ),
  },
  {
    id: "resizable",
    title: "Resizable",
    render: () => (
      <B.ResizablePanelGroup orientation="horizontal" className="h-48 max-w-lg rounded-md shadow-xs">
        <B.ResizablePanel defaultSize="50%">
          <div className="flex h-full items-center justify-center text-sm">One</div>
        </B.ResizablePanel>
        <B.ResizableHandle withHandle />
        <B.ResizablePanel defaultSize="50%">
          <B.ResizablePanelGroup orientation="vertical">
            <B.ResizablePanel defaultSize="40%">
              <div className="flex h-full items-center justify-center text-sm">Two</div>
            </B.ResizablePanel>
            <B.ResizableHandle withHandle />
            <B.ResizablePanel defaultSize="60%">
              <div className="flex h-full items-center justify-center text-sm">Three</div>
            </B.ResizablePanel>
          </B.ResizablePanelGroup>
        </B.ResizablePanel>
      </B.ResizablePanelGroup>
    ),
  },
  {
    id: "scroll-area",
    title: "Scroll Area",
    render: () => (
      <B.ScrollArea className="h-48 w-56 rounded-md shadow-xs">
        <div className="p-3">
          <div className="mb-2 text-sm font-semibold">Tags</div>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} className="border-b py-1.5 text-sm last:border-0">v1.2.0-beta.{40 - i}</div>
          ))}
        </div>
      </B.ScrollArea>
    ),
  },
  {
    id: "select",
    title: "Select",
    render: () => (
      <Row>
        <B.Select>
          <B.SelectTrigger className="w-48">
            <B.SelectValue placeholder="Select a fruit" />
          </B.SelectTrigger>
          <B.SelectContent>
            <B.SelectGroup>
              <B.SelectLabel>Fruits</B.SelectLabel>
              {fruits.map((f) => (
                <B.SelectItem key={f} value={f.toLowerCase()}>{f}</B.SelectItem>
              ))}
            </B.SelectGroup>
            <B.SelectSeparator />
            <B.SelectItem value="none" disabled>None</B.SelectItem>
          </B.SelectContent>
        </B.Select>
        <B.Select defaultValue="sm">
          <B.SelectTrigger size="sm" className="w-32">
            <B.SelectValue />
          </B.SelectTrigger>
          <B.SelectContent>
            <B.SelectItem value="sm">Small</B.SelectItem>
            <B.SelectItem value="md">Medium</B.SelectItem>
          </B.SelectContent>
        </B.Select>
      </Row>
    ),
  },
  {
    id: "separator",
    title: "Separator",
    render: () => (
      <div className="max-w-sm text-sm">
        <div className="font-semibold">Bedrock</div>
        <div className="text-muted-foreground">A component library.</div>
        <B.Separator className="my-3" />
        <div className="flex h-5 items-center gap-3">
          <span>Docs</span>
          <B.Separator orientation="vertical" />
          <span>Source</span>
          <B.Separator orientation="vertical" />
          <span>Changelog</span>
        </div>
      </div>
    ),
  },
  {
    id: "sheet",
    title: "Sheet",
    render: () => (
      <Row>
        {(["right", "left", "top", "bottom"] as const).map((side) => (
          <B.Sheet key={side}>
            <B.SheetTrigger asChild>
              <B.Button variant="secondary" className="capitalize">{side}</B.Button>
            </B.SheetTrigger>
            <B.SheetContent side={side}>
              <B.SheetHeader>
                <B.SheetTitle>Filters</B.SheetTitle>
                <B.SheetDescription>Narrow down the results.</B.SheetDescription>
              </B.SheetHeader>
              <div className="px-4">
                <B.Input placeholder="Keyword" />
              </div>
              <B.SheetFooter>
                <B.SheetClose asChild>
                  <B.Button>Apply</B.Button>
                </B.SheetClose>
              </B.SheetFooter>
            </B.SheetContent>
          </B.Sheet>
        ))}
      </Row>
    ),
  },
  { id: "sidebar", title: "Sidebar", render: () => <SidebarDemo /> },
  {
    id: "skeleton",
    title: "Skeleton",
    render: () => (
      <div className="flex items-center gap-3">
        <B.Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <B.Skeleton className="h-3 w-56" />
          <B.Skeleton className="h-3 w-40" />
        </div>
      </div>
    ),
  },
  { id: "slider", title: "Slider", render: () => <SliderDemo /> },
  {
    id: "sonner",
    title: "Sonner (toasts)",
    render: () => (
      <Row>
        <B.Button variant="secondary" onClick={() => toast("Event created", { description: "Monday at 9:00" })}>Default</B.Button>
        <B.Button variant="success" onClick={() => toast.success("Saved")}>Success</B.Button>
        <B.Button variant="warning" onClick={() => toast.warning("Disk almost full")}>Warning</B.Button>
        <B.Button variant="destructive" onClick={() => toast.error("Upload failed")}>Error</B.Button>
      </Row>
    ),
  },
  {
    id: "spinner",
    title: "Spinner",
    render: () => (
      <Row className="gap-4">
        <B.Spinner />
        <B.Spinner className="size-6 text-primary" />
        <B.Button disabled><B.Spinner />Processing</B.Button>
      </Row>
    ),
  },
  {
    id: "switch",
    title: "Switch",
    render: () => (
      <Row className="gap-6">
        <div className="flex items-center gap-2">
          <B.Switch id="sw1" defaultChecked />
          <B.Label htmlFor="sw1">Airplane mode</B.Label>
        </div>
        <div className="flex items-center gap-2">
          <B.Switch id="sw2" disabled />
          <B.Label htmlFor="sw2">Disabled</B.Label>
        </div>
      </Row>
    ),
  },
  {
    id: "table",
    title: "Table",
    render: () => (
      <B.Table>
        <B.TableCaption>Recent invoices.</B.TableCaption>
        <B.TableHeader>
          <B.TableRow>
            <B.TableHead>Invoice</B.TableHead>
            <B.TableHead>Status</B.TableHead>
            <B.TableHead>Method</B.TableHead>
            <B.TableHead className="text-right">Amount</B.TableHead>
          </B.TableRow>
        </B.TableHeader>
        <B.TableBody>
          {[
            ["INV001", "Paid", "Card", 250],
            ["INV002", "Pending", "PayPal", 150],
            ["INV003", "Unpaid", "Transfer", 350],
          ].map(([inv, status, method, amt]) => (
            <B.TableRow key={inv as string}>
              <B.TableCell className="font-medium">{inv}</B.TableCell>
              <B.TableCell>
                <B.Badge minimal variant={status === "Paid" ? "success" : status === "Pending" ? "warning" : "destructive"}>
                  {status}
                </B.Badge>
              </B.TableCell>
              <B.TableCell>{method}</B.TableCell>
              <B.TableCell className="text-right tabular-nums">{money.format(amt as number)}</B.TableCell>
            </B.TableRow>
          ))}
        </B.TableBody>
        <B.TableFooter>
          <B.TableRow>
            <B.TableCell colSpan={3}>Total</B.TableCell>
            <B.TableCell className="text-right tabular-nums">{money.format(750)}</B.TableCell>
          </B.TableRow>
        </B.TableFooter>
      </B.Table>
    ),
  },
  {
    id: "tabs",
    title: "Tabs",
    render: () => (
      <B.Tabs defaultValue="account" className="max-w-md">
        <B.TabsList>
          <B.TabsTrigger value="account">Account</B.TabsTrigger>
          <B.TabsTrigger value="password">Password</B.TabsTrigger>
          <B.TabsTrigger value="billing" disabled>Billing</B.TabsTrigger>
        </B.TabsList>
        <B.TabsContent value="account" className="pt-2 text-sm">Manage your account details.</B.TabsContent>
        <B.TabsContent value="password" className="pt-2 text-sm">Change your password.</B.TabsContent>
      </B.Tabs>
    ),
  },
  {
    id: "textarea",
    title: "Textarea",
    render: () => <B.Textarea placeholder="Type your message here." className="max-w-md" />,
  },
  {
    id: "toggle-group",
    title: "Toggle Group",
    render: () => (
      <Row className="gap-4">
        <B.ToggleGroup type="single" defaultValue="left" variant="outline">
          <B.ToggleGroupItem value="left" aria-label="Align left"><AlignLeftIcon /></B.ToggleGroupItem>
          <B.ToggleGroupItem value="center" aria-label="Align center"><AlignCenterIcon /></B.ToggleGroupItem>
          <B.ToggleGroupItem value="right" aria-label="Align right"><AlignRightIcon /></B.ToggleGroupItem>
        </B.ToggleGroup>
        <B.ToggleGroup type="multiple" defaultValue={["bold"]}>
          <B.ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></B.ToggleGroupItem>
          <B.ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></B.ToggleGroupItem>
          <B.ToggleGroupItem value="underline" aria-label="Underline"><UnderlineIcon /></B.ToggleGroupItem>
        </B.ToggleGroup>
      </Row>
    ),
  },
  {
    id: "toggle",
    title: "Toggle",
    render: () => (
      <Row>
        <B.Toggle aria-label="Bold"><BoldIcon /></B.Toggle>
        <B.Toggle variant="outline" aria-label="Italic"><ItalicIcon />Italic</B.Toggle>
        <B.Toggle size="sm" defaultPressed aria-label="Underline"><UnderlineIcon /></B.Toggle>
      </Row>
    ),
  },
  {
    id: "tooltip",
    title: "Tooltip",
    render: () => (
      <Row>
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <B.Tooltip key={side}>
            <B.TooltipTrigger asChild>
              <B.Button variant="secondary" className="capitalize">{side}</B.Button>
            </B.TooltipTrigger>
            <B.TooltipContent side={side}>Tooltip on the {side}</B.TooltipContent>
          </B.Tooltip>
        ))}
      </Row>
    ),
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function Showcase() {
  const [dark, setDark] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
  )
  const [filter, setFilter] = React.useState("")

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  // ?only=button,dialog renders just those sections (handy for debugging one component).
  const only = React.useMemo(() => {
    if (typeof window === "undefined") return null
    const v = new URLSearchParams(window.location.search).get("only")
    return v ? new Set(v.split(",").map((s) => s.trim())) : null
  }, [])

  const visible = sections.filter(
    (s) =>
      (!only || only.has(s.id)) &&
      (!filter || s.title.toLowerCase().includes(filter.toLowerCase()) || s.id.includes(filter.toLowerCase()))
  )

  return (
    <B.TooltipProvider>
      <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
        <span className="font-semibold">Bedrock</span>
        <B.Badge minimal>@aberwest/bedrock</B.Badge>
        <span className="hidden text-xs text-muted-foreground sm:inline">{sections.length} components</span>
        <div className="ml-auto flex items-center gap-2">
          <B.InputGroup className="w-56">
            <B.InputGroupAddon><SearchIcon /></B.InputGroupAddon>
            <B.InputGroupInput placeholder="Filter components..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          </B.InputGroup>
          <B.Button variant="secondary" size="icon" aria-label="Toggle dark mode" onClick={() => setDark((d) => !d)}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </B.Button>
        </div>
      </header>

      <div className="flex">
        <nav className="sticky top-12 hidden h-[calc(100svh-3rem)] w-52 shrink-0 overflow-y-auto border-r p-3 md:block">
          <ul className="flex flex-col">
            {visible.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-sm px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <main className="grid min-w-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-2">
          {visible.map((s) => (
            <div key={s.id} className={s.wide ? "xl:col-span-2" : undefined}>
              <Section def={s} />
            </div>
          ))}
          {visible.length === 0 && (
            <p className="p-8 text-sm text-muted-foreground">No components match "{filter}".</p>
          )}
        </main>
      </div>
      <B.Toaster richColors />
    </B.TooltipProvider>
  )
}
