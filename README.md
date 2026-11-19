# @aberwest/bedrock

Aberwest's shared React component library, built on [shadcn/ui](https://ui.shadcn.com),
Radix UI and Tailwind CSS v4.

## Install

```bash
npm install @aberwest/bedrock
```

Requires `react` and `react-dom` 18 or 19.

## Styles: pick one

**A. Your app does not use Tailwind.** Import the precompiled stylesheet once, at your app's root:

```ts
import "@aberwest/bedrock/styles.css"
```

**B. Your app uses Tailwind v4.** Import the theme in your main CSS so your own Tailwind
build generates the classes the components need (and you avoid shipping Tailwind twice):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@aberwest/bedrock/theme.css";
```

## Use

```tsx
import { Button, Card, CardHeader, CardTitle, TooltipProvider } from "@aberwest/bedrock"

export function App() {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader><CardTitle>Hello</CardTitle></CardHeader>
      </Card>
      <Button variant="outline">Click me</Button>
    </TooltipProvider>
  )
}
```

Dark mode: add the `dark` class to `<html>`. Re-theme by overriding CSS variables
(`--primary`, `--radius`, etc.) in your app; see `theme.css` for the full list.

Some components need a provider at the app root: `TooltipProvider` (tooltip),
`SidebarProvider` (sidebar), and `<Toaster />` (sonner).

## Developing

| Command | What it does |
| --- | --- |
| `npm run build` | Regenerates `src/index.ts`, builds `dist/` (ESM + CJS + types + CSS) |
| `npm run dev` | Rebuilds on change |
| `npm run typecheck` | Type-checks the source |
| `npx shadcn@latest add <name>` | Adds or updates a shadcn component in `src/components/ui` |

Component files are yours to edit. After adding or removing a component, `npm run build`
picks it up automatically.

To test in another app locally before publishing: `npm pack`, then
`npm install /path/to/aberwest-bedrock-0.1.0.tgz` in that app.

## Publishing

```bash
npm login
npm version patch   # or minor / major
npm publish         # runs typecheck + build first; publishes as public
```

The `@aberwest` scope must exist on npm: create an npm organization called `aberwest`,
or use a user account with that name.
