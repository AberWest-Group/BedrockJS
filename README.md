# @aberwest-group/bedrock

AberWest Group's shared React component library. It covers every [shadcn/ui](https://ui.shadcn.com)
component plus a high-performance `DataTable`. Components are restyled in a dense,
desktop-first design language inspired by Palantir's [Blueprint](https://blueprintjs.com),
and built on Radix UI and Tailwind CSS v4.

## Install

```bash
npm install @aberwest-group/bedrock
```

Requires `react` and `react-dom` 18 or 19.

## Styles: pick one

**A. Your app does not use Tailwind.** Import the precompiled stylesheet once at your app's root:

```ts
import "@aberwest-group/bedrock/styles.css"
```

**B. Your app uses Tailwind v4.** Import the theme in your main CSS so your Tailwind build
generates the classes the components need, and Tailwind isn't shipped twice:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@aberwest-group/bedrock/theme.css";
```

## Use

```tsx
import { Button, Card, CardHeader, CardTitle, TooltipProvider } from "@aberwest-group/bedrock"

export function App() {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader><CardTitle>Hello</CardTitle></CardHeader>
      </Card>
      <Button variant="success" appearance="outlined">Save</Button>
    </TooltipProvider>
  )
}
```

Some components need a provider at the app root: `TooltipProvider` (tooltip),
`SidebarProvider` (sidebar), `MessageScrollerProvider` (message scroller) and `<Toaster />` (sonner).

## Design language

| | |
| --- | --- |
| Palette | Neutral grays with a blue accent. Raw colours are `--bp-*` variables in `theme.css`. |
| Intents | `default` (primary blue), `secondary` (neutral), `success`, `warning`, `destructive`. Button, Badge and Alert accept them as `variant`. |
| Emphasis | Button `appearance`: `solid`, `outlined`, `minimal`. Badge has `minimal` and `round`. |
| Density | 30px controls (`h-control`), 24px small (`h-control-sm`), 40px large (`h-control-lg`). 14px body text, 12px table text. |
| Shape | 2–4px corner radii. |
| Depth | Layered elevation shadows (`--elevation-0` … `--elevation-4`), mapped to `shadow-xs` … `shadow-xl`. |
| Dark mode | Add the `dark` class to `<html>`. |

Re-theme by overriding any CSS variable in your own stylesheet, e.g. `:root { --primary: #7961db; }`.

## DataTable

A spreadsheet-style grid for large datasets: 100,000+ rows scroll smoothly.

```tsx
import { DataTable, type DataTableColumn } from "@aberwest-group/bedrock"

const columns: DataTableColumn<Trade>[] = [
  { id: "symbol", header: "Symbol", sortable: true },
  { id: "price", header: "Price", align: "right", sortable: true, format: (v) => `$${v}` },
  { id: "notional", header: "Notional", accessor: (r) => r.qty * r.price },
]

<DataTable data={trades} columns={columns} frozenColumns={1} striped className="h-[600px]" />
```

Memoize `columns` with `useMemo` so rows don't re-render needlessly.

**Features:** frozen header and columns, row numbers, column resize (drag the header edge, or
double-click it to fit), sorting, rectangular/row/column selection (drag, shift-click,
Ctrl/Cmd-click), keyboard navigation (arrows, Page Up/Down, Home/End, Tab), Ctrl/Cmd+A,
Ctrl/Cmd+C copies the selection as TSV (pastes into Excel), skeleton loading, empty state.
Selection and sort can be controlled or uncontrolled.

**Why it's fast:**
- Only the rows and columns on screen are rendered (2D virtualization).
- Rendering is batched, so React re-renders every ~12 rows of scrolling rather than every row.
- Selection and focus are drawn as overlays, so selecting never re-renders cells.
- Frozen areas use CSS `position: sticky`, so the browser moves them without JavaScript.
- Column resizing commits on mouse-up, so the grid lays out once per drag.
- Sorting reorders an index array, so your data is never copied.

Limits: rows have a fixed height, and browsers cap element height at ~33 million px
(~1.3 million rows at the default 24px row height).

## Showcase site

```bash
npm run showcase
```

Opens a local Vite site with every component on one page: a filterable nav, a dark-mode
toggle, and a 100,000-row DataTable demo. The source is in [playground/](playground/).

## Developing

| Command | What it does |
| --- | --- |
| `npm run showcase` | Starts the showcase site |
| `npm run build` | Regenerates `src/index.ts`, stamps licence headers, builds `dist/` (ESM + CJS + types + CSS) |
| `npm test` | Checks licence headers, then runs the tests |
| `npm run typecheck` | Type-checks everything |
| `npm run license:fix` | Adds or updates licence headers |
| `npx shadcn@latest add <name>` | Adds or updates a shadcn component in `src/components/ui` |

After adding a component, `npm run build` exports it automatically. If you add your own
(non-shadcn) component to `src/components/ui`, add it to `ORIGINAL_UI_FILES` in
[scripts/license-headers.mjs](scripts/license-headers.mjs) so its header doesn't credit shadcn.

### Licence headers

Every source file must start with the AberWest Group LTD Apache-2.0 header. This is enforced
automatically:

- **On commit:** a git pre-commit hook (`.githooks/`, installed by `npm install`) adds missing
  headers to staged files.
- **On build:** `npm run build` stamps any file that's missing one.
- **On test and publish:** `npm test` fails if any header is missing or outdated.

Each file keeps the year it was first stamped. Files derived from shadcn/ui also credit
shadcn, as its MIT licence requires.

## Publishing

The package is public on [npmjs.com](https://www.npmjs.com/package/@aberwest-group/bedrock),
owned by the npm organization `aberwest-group`.

### Releasing a new version

Releases are published by GitHub Actions ([.github/workflows/publish.yml](.github/workflows/publish.yml))
using npm trusted publishing, so no npm token is stored anywhere:

```bash
npm version patch          # or minor / major: bumps package.json, commits, tags v0.1.1
git push --follow-tags     # pushes the commit and the tag
```

Then on GitHub, open *Releases → Draft a new release*, pick the tag you just pushed, and click
*Publish release*. The workflow checks that the tag matches `package.json`, runs the
type-check, tests and build, and publishes with provenance.

Versioning: `patch` for fixes, `minor` for new components or props, `major` for anything that
breaks existing usage.

### First-time setup (already done once; kept for reference)

1. Create the free npm organization `aberwest-group` on npmjs.com.
2. Publish the first version by hand: `npm login`, then `npm publish --access public`.
3. On npmjs.com, open the package's *Settings → Trusted Publisher*, choose *GitHub Actions*,
   and enter organization `AberWest-Group`, repository `BedrockJS`, workflow `publish.yml`.

## Licence

Copyright 2026 AberWest Group LTD. Licensed under the [Apache License, Version 2.0](LICENSE).
Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.

Includes software derived from shadcn/ui, used under the MIT License. See [NOTICE](NOTICE).
