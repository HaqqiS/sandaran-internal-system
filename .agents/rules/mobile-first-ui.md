---
trigger: always_on
---

---

title: Cursor Rules — Mobile-First Stack
description: AI agent rules for Next.js 15 + shadcn/ui + tRPC + TanStack + Zustand + Prisma
stack:

- Next.js 15
- shadcn/ui + Radix UI
- Tailwind CSS v4
- tRPC v11 + TanStack Query v5
- Zustand v5
- Prisma v6
- Better Auth v1.3
- Vaul + Sonner
- Biome + Vitest
  updated: 2026-04-22
  rules: 36

---

# Cursor Rules — Mobile-First Stack

> Agent rules for **Next.js 15 · shadcn/ui · Radix UI · tRPC v11 · TanStack Query v5** > **Zustand v5 · Prisma v6 · Better Auth · Vaul · Sonner · Biome · Vitest**

## Contents

- [Mobile-First UI/UX](#mobile-first-uiux)
- [Stack Conventions](#stack-conventions)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Code Quality & Architecture](#code-quality--architecture)
- [UX Patterns](#ux-patterns)

---

## 📱 Mobile-First UI/UX

> You are an expert in Mobile-First UI/UX using Next.js 15, shadcn/ui, Radix UI, Tailwind CSS v4, Vaul, and Sonner.

### Touch Targets

All interactive elements must meet minimum touch target sizes: 44×44pt (iOS) / 48×48dp (Android). Use `min-h-11 min-w-11` or `p-3` as a baseline. Never rely on `cursor: pointer` alone — the tap area matters.

### Thumb Zone Awareness

Place primary actions in the bottom 40% of the screen (thumb zone). Destructive or secondary actions go in the harder-to-reach top zone. Use `pb-safe` and `env(safe-area-inset-bottom)` for devices with home indicators.

### Navigation Patterns

Use bottom tab bars for top-level navigation. Avoid deep nav hierarchies (max 3 levels). Prefer sheet-based flows (`vaul` Drawer) over full page pushes for contextual actions. Always support swipe-to-back gestures and browser back button.

### Typography & Readability

Minimum body text: 14px (mobile), 16px (desktop). Use `text-sm` as the floor, `text-base` for body. Set `leading-relaxed` on paragraphs. Support Dynamic Type via `rem` units — never use `px` for font sizes. Test at 200% zoom.

### Interaction Feedback

Every tap must produce immediate feedback: `active:scale-95`, `active:opacity-70`, or haptic via the Vibration API. Use `sonner` for toast notifications. Use skeleton loaders (`animate-pulse`) over spinners. Never leave the user wondering if their tap registered.

### Dark Mode & Color

All components must support dark mode via `next-themes`. Use Tailwind's `dark:` variant consistently. Maintain WCAG AA contrast ratios (4.5:1 body, 3:1 large text) in both themes. Never hardcode colors — use CSS variables from your `globals.css` theme tokens.

### Sheets & Drawers (Vaul)

Prefer `vaul` Drawer over Dialog for mobile-initiated flows. Drawers slide from bottom, feel native. Use `snapPoints` for multi-state drawers. Radix Dialog is acceptable for desktop-first confirmations. Never use both for the same intent.

### Forms & Input (TanStack Form + Zod)

Use `@tanstack/react-form` with `@tanstack/zod-form-adapter` for all forms. Set correct `inputMode` and `type` attributes (`email`, `tel`, `url`, `numeric`). Enable `autoComplete` and `autoCapitalize` appropriately. Show inline field errors immediately on blur, not only on submit.

### Whitespace & Visual Hierarchy

Use whitespace to group related content and separate sections — not decorative padding. Follow an 8pt grid (`gap-2`, `gap-4`, `gap-6`, `gap-8`). Clear hierarchy: one H1 per view, descriptive subheadings, supporting body text. Content first, chrome second.

### Loading / Empty / Error States

Every data-dependent view needs three states: loading (skeleton, not spinner), empty (illustrated CTA — never blank), error (helpful message + retry action). Use TanStack Query's `isPending`, `isError`, `data === undefined` guards. Never render null silently.

---

## 🏗️ Stack Conventions

> Conventions for the specific libraries in this project.

### tRPC (v11)

All server communication goes through tRPC. Never use raw `fetch` for internal API calls. Colocate router procedures with their feature folder. Use `superjson` as transformer. Prefer `useQuery` / `useMutation` from `@trpc/react-query` — do not call procedures imperatively unless in a server action.

### TanStack Query (v5)

Cache keys are managed by tRPC — never manually define `queryKey` for tRPC routes. For non-tRPC queries, use descriptive array keys: `['user', userId, 'posts']`. Prefer `staleTime` over disabling caching. Use `suspense: true` + React Suspense for server-synced views.

### Zustand (v5)

Zustand is for local UI state only (modals, sidebar open, theme override, multi-step wizard). Server state lives in TanStack Query via tRPC. Create one store per feature domain. Use `immer` middleware for nested state updates. Never store derived data — compute it with selectors.

### Prisma (v6)

Database access only inside tRPC routers or Server Actions marked `'use server'`. Never query Prisma from client components. Use `select` to return only needed fields — never `findMany` without a `select` in list views. Always paginate — default limit: 20, max: 100.

### Better Auth (v1.3)

Session is accessed via `auth()` in server components / tRPC context. Never pass the full session to client components — pass only the fields needed. Protect tRPC procedures with an `authedProcedure` middleware. Redirect unauthenticated users in middleware, not in components.

### shadcn/ui + Radix UI

shadcn/ui is the default component library — never build modal, dropdown, tooltip, or select from scratch. Install components via `npx shadcn@latest add <component>`. Extend, don't fork. Compose Radix primitives only when shadcn doesn't have what you need. Keep custom variants in `cva()` inside the component file.

### Icons (@tabler/icons-react)

Use `@tabler/icons-react` exclusively. Import named icons: `import { IconUser } from '@tabler/icons-react'`. Default size: `size={20}` for UI icons, `size={16}` inside buttons/badges. Never use emoji as icons in production UI. Never mix icon libraries.

### Drag & Drop (@dnd-kit)

All drag-and-drop uses `@dnd-kit/core` + `@dnd-kit/sortable`. Wrap drag contexts in `DndContext` at the feature level, not globally. Use `restrictToVerticalAxis` or `restrictToParentElement` modifiers to constrain movement. Always implement keyboard DnD for accessibility.

### Image Uploads (Cloudinary + react-dropzone)

Use `react-dropzone` for the drop zone UI. Compress before upload with `browser-image-compression` (max 1MB, max 1920px). Upload in a tRPC mutation that calls `cloudinary` server-side. Show upload progress. Store only the Cloudinary `public_id` in the DB, not the full URL.

### Linting & Formatting (Biome)

Biome is the single formatter + linter — never mix with ESLint or Prettier. Run `biome check --write` on save. No unused imports, no `console.log` in committed code. Follow the project's `biome.json` config. CI must pass Biome checks before merge.

---

## ♿ Accessibility

> Accessibility is not a phase — it's built in from the first component.

### Keyboard Navigation

All interactive elements reachable via Tab. Visible focus rings always on (never `outline: none` without a custom replacement). Modal dialogs trap focus and restore it on close — Radix handles this automatically, don't override it.

### Screen Readers (VoiceOver / TalkBack)

Every image needs `alt` text (decorative images: `alt=''`). Icon-only buttons need `aria-label`. Dynamic content changes announced via `aria-live='polite'`. Use semantic HTML — `<button>`, `<nav>`, `<main>`, `<section>`, `<article>` — not `<div onClick>`.

### Color Contrast

Body text: minimum 4.5:1 contrast ratio. Large text (18pt+ or 14pt bold): 3:1. UI components and focus indicators: 3:1. Test both light and dark themes. Use Tailwind's default palette — it's contrast-safe at the `500`+ scale on white and `400`- on dark backgrounds.

### Font Scaling (Dynamic Type)

All font sizes in `rem` — never `px`. Test at 200% browser zoom and with OS font size set to largest. Components must not overflow or clip at large sizes. Use `clamp()` for display sizes that would otherwise break layout.

---

## ⚡ Performance

> Performance is a feature — especially on mid-range mobile devices.

### React Server Components (Next.js 15)

Default to Server Components. Add `'use client'` only when you need: `useState`, `useEffect`, event handlers, browser APIs, or context. Move as much data fetching as possible to RSC + tRPC server-side caller. Never fetch in a client component what can be fetched on the server.

### Bundle Size

Import only named exports: `import { Button } from '@/components/ui/button'` not `import * from 'shadcn'`. Use `next/dynamic` with `ssr: false` for heavy client-only components (charts, rich editors). Audit with `@next/bundle-analyzer` before shipping new heavy deps.

### Images

Always use `next/image`. Always set `width` and `height` (or `fill` with a sized container) to prevent CLS. Use `priority` only for above-the-fold LCP images. Use Cloudinary transformations (`f_auto,q_auto,w_800`) via URL params, not locally.

### Core Web Vitals Targets

LCP < 2.5s, CLS < 0.1, INP < 200ms on a Moto G4 equivalent. Use Lighthouse CI in your pipeline. Avoid layout shifts from async fonts — use `font-display: swap` and `next/font`. Measure on real devices, not just DevTools throttle.

---

## 🧹 Code Quality & Architecture

> Clean, predictable code that scales with the team.

### TypeScript Strict

TypeScript strict mode. No `any`, no `as unknown as X`, no `@ts-ignore` without a dated comment explaining why. Prefer `type` over `interface` for data shapes. Infer Zod types with `z.infer<typeof schema>` — don't duplicate type definitions.

### File Size & Colocation

Max 300 lines per file. Feature folders contain: `page.tsx`, `_components/`, `_hooks/`, `_store.ts`, `schema.ts`. Shared UI in `components/ui/`. Shared logic in `lib/`. Don't reach into another feature's internals — expose a public API via the folder's `index.ts`.

### Naming Conventions

Components: PascalCase. Hooks: `use` prefix, camelCase. Stores: `use[Feature]Store`. tRPC routers: `[feature]Router`. Zod schemas: `[feature]Schema`. Files: `kebab-case.ts` for utilities/lib, `PascalCase.tsx` for components. Never abbreviate unless the abbreviation is universally known (`id`, `url`, `db`).

### Zod v4 Validation

Zod schemas are the single source of truth for data shapes. Define schemas in a co-located `schema.ts`. Use `z.infer` to derive TypeScript types — never duplicate. Validate at every boundary: tRPC input, form input, env vars (via `@t3-oss/env-nextjs`), and external API responses.

---

## ✨ UX Patterns

> Patterns that make mobile apps feel native and delightful.

### Optimistic Updates

Use TanStack Query's `onMutate` / `onError` / `onSettled` lifecycle for optimistic UI. Update the cache immediately on user action, rollback on error, and revalidate on settle. Show a `sonner` toast on error with a retry action. Never wait for a server round-trip before updating the UI for common actions.

### Onboarding

Keep onboarding to 3 steps or fewer. Always provide a 'Skip' option. Request permissions in context — explain why before the system prompt appears. Use progressive disclosure: show advanced features only after the user completes core actions.

### Gestures

Swipe-to-delete on list items (via `@dnd-kit` or CSS translate + threshold logic). Pull-to-refresh via TanStack Query `refetch`. Drawer dismiss via downward swipe (Vaul handles this). Long-press for contextual menus (DropdownMenu on `onPointerDown` with a timer). Never require two-handed gestures for primary actions.

### Toasts & Notifications (Sonner)

Use `sonner` for all transient feedback: success, error, loading, info. Position: `top-center` on mobile, `top-center` on desktop. Duration: 3s for info/success, persistent for errors until dismissed. Never stack more than 3 toasts. Use `toast.promise()` for async actions.
