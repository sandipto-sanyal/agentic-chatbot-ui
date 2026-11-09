# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev        # Vite dev server (Vite's default port)
npm run build      # tsc -b (typecheck) && vite build -> dist/
npm run lint       # oxlint, configured in .oxlintrc.json
npm run preview    # serve the built dist/
```

- No test runner or test script is configured, so there is no single-test command. Verify changes with `npm run build` and `npm run lint`.
- `tsc -b` typechecks only `src/` and `vite.config.ts` (see `include` in `tsconfig.app.json`).

## Architecture

- Client-only React 19 SPA built with Vite 8. `index.html` loads `src/main.tsx`, which mounts `<App />` under `StrictMode`.
- `src/App.tsx` owns routing: `BrowserRouter`, a top nav, and three routes (`/`, `/about`, `/dashboard`). Pages in `src/pages/` are placeholder content only.
- Styling is Tailwind CSS v4 via the `@tailwindcss/vite` plugin. There is no `tailwind.config`; theme tokens and shadcn CSS variables live in `src/index.css` (`@theme` and `@theme inline` blocks). The Geist font comes from `@fontsource-variable/geist`.
- shadcn/ui is configured by `components.json` (style `base-nova`, lucide icons). Its generated code lives outside `src/`: `components/ui/button.tsx` (built on `@base-ui/react` and `class-variance-authority`) and `lib/utils.ts` (`cn` helper). Nothing imports them yet. Because `tsconfig.app.json` includes only `src/`, they are typechecked only once a file under `src/` imports them.
- The `@/` alias maps to the repo root, not `src/`. It is declared in `vite.config.ts` (`resolve.alias`) and in `tsconfig.json` / `tsconfig.app.json` (`paths`), so `@/components/ui/button` resolves to `components/ui/button.tsx`. `components.json` also references `@/hooks`, but that directory does not exist yet.
- No backend lives in this repo. The page copy mentions a Flask backend, and the websocket notes below describe the contract for an external server at `127.0.0.1:5000`. No client code connects to it yet.

## Known issues

- `src/index.css`: `--color-tertiary:` has an empty value.
- `--color-primary` is set in both `@theme` (`#4f46e5`) and `@theme inline` (`var(--primary)`).
- `oxlint` warns at `components/ui/button.tsx:57` because `buttonVariants` is exported next to the component, which breaks fast refresh.
- `button.tsx` and `lib/utils.ts` import `cn` from the npm package `cn`, not from `clsx` and `tailwind-merge` as shadcn templates usually do.

# Project specification
1. Project must use client side routing
1. it must use tailwind css classNames
1. it must use shadcn components instead of direct react components

