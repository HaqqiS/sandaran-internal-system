---
trigger: always_on
---

# Mobile-First & shadcn/ui Development Rules

## Core Directive

ALWAYS design for mobile screens (375px) first. Desktop styles should only be added via 'md:' or 'lg:' prefixes. Never use 'max-w' as a primary container without a responsive 'w-full'.

## UI Framework (shadcn/ui)

- **Component Source**: Use `pnpm dlx shadcn@latest add [component]` to install new components.
- **Styling**: Use Tailwind CSS variables for colors to ensure Dark Mode compatibility.
- **Form Handling**: Use `@tanstack/react-form` with `zod` for validation (standard for shadcn forms).
- **Icons**: Exclusively use `@tabler/icons-react`.

## Mobile-First Patterns

1. **Layout**: Use `flex-col` by default; switch to `flex-row` only at `md:` breakpoint.
2. **Typography**: Use Inter and Geist fonts (configured in layout.tsx). Headlines: `text-xl` mobile, `text-3xl` on `md:`.
3. **Touch Targets**: Ensure buttons and interactive elements have a minimum height of `h-10` (40px) for easy tapping.
4. **Navigation**: Use shadcn `Sidebar` with `collapsible="offcanvas"` for mobile navigation. The sidebar automatically collapses into an offcanvas drawer on mobile via `useSidebar()`.

## Next.js & Tech Stack

- **Architecture**: Use the App Router. Prioritize Server Components (`page.tsx`) and use `'use client'` sparingly for shadcn interactivity.
- **Performance**: Use `next/image` for all images with appropriate `sizes` attributes for mobile optimization.
- **Linting**: Follow BiomeJS rules. If the agent suggests ESLint/Prettier changes, ignore them and stay with Biome.
- State Management: Use Zustand for global/shared client state.

## Verification

Before finishing a task, the agent MUST:

1. Verify the UI layout in the Antigravity Browser at a 375px width.
2. Ensure no horizontal scrolling exists on mobile view.
