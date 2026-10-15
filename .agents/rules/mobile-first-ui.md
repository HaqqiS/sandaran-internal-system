---
trigger: always_on
---

# Agent Rules — Sandaran Internal System

**Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI, tRPC v11, TanStack Query v5, Zustand v5, Prisma v6, Better Auth, Vaul, Sonner, Cloudinary, Biome, and Vitest.

## 1. Core Principles

- Inspect relevant code, callers, documentation, and package versions before making changes.
- Follow existing project patterns and documented conventions over generic preferences.
- Keep changes minimal and scoped to the requested task. Avoid unrelated refactors, mass replacements, file renames, dependency changes, or architecture redesigns.
- Preserve existing functionality, responsive behavior, accessibility, and desktop UX unless explicitly asked to change them.
- Apply rules to new or directly affected code. Do not modify unrelated code merely for consistency.
- Consult `DESIGN-SYSTEM.md`, `docs/ARCHITECTURE.md`, `docs/PERMISSIONS.md`, and relevant feature implementations when applicable. Verify file paths before relying on documentation.
- When instructions conflict, prioritize explicit user requirements, verified project-specific conventions, and existing implementation over generic rules.
- If a change could affect shared behavior or introduce significant risk, explain the concern and choose the narrowest safe solution.

## 2. Mobile-First UI/UX

### Responsive Layouts

- Build mobile-first using Tailwind breakpoints, then enhance for larger screens.
- Fix mobile issues without unnecessarily changing established desktop layouts.
- Prevent horizontal overflow, clipped content, overlapping elements, and unreadable text.
- Use responsive sizing, wrapping, and deliberate overflow handling instead of arbitrary width reductions.
- Reuse existing shared components and responsive patterns when appropriate.
- Do not introduce a shared component solely to remove duplication when the implementations have meaningfully different behavior.

### Touch Targets

- Apply touch-target improvements at the usage site rather than globally changing shared UI primitives.
- Use responsive sizing when suitable, e.g. `min-h-11 md:min-h-8`.
- Preserve compact controls and information density in dashboards, tables, toolbars, and data-heavy interfaces.
- Do not indiscriminately enlarge every button, input, checkbox, badge, or table action.

### Typography

- Use readable typography appropriate to content, context, and screen size.
- Prefer existing Tailwind utilities and design-system tokens.
- Small sizes such as `text-xs`, `text-[11px]`, and `text-[10px]` are allowed for badges, metadata, compact labels, and secondary information when legible.
- Do not globally increase font sizes or replace arbitrary sizes without checking their purpose and visual impact.
- Prevent clipping and layout issues at narrow widths and increased browser zoom.

### Navigation & Interaction

- Follow the existing information architecture. Do not force every navigation flow into drawers, sheets, or bottom navigation.
- Keep primary actions discoverable and reachable on mobile.
- Preserve browser history and established navigation behavior.
- Add interaction feedback where useful without unnecessary animations or dependencies.

### Dialogs, Forms & States

- Reuse established responsive Dialog/Drawer patterns. Do not replace them with standalone components without a concrete reason.
- Follow existing form libraries, validation schemas, and submission patterns. Do not introduce another form library or adapter without justification.
- Use appropriate input types, `inputMode`, `autoComplete`, accessible labels, and validation feedback.
- Preserve keyboard behavior, focus management, and submission states.
- Provide suitable loading, empty, success, and error states for data-dependent views.
- Use skeletons when they match the expected content layout. Spinners remain appropriate for buttons, short operations, and compact actions.
- Do not mass-replace existing loading patterns without a specific UX requirement.

## 3. shadcn/ui & Accessibility

### Shared Component Integrity

- Treat `src/components/ui/*` as shared foundational primitives.
- **Do not modify shadcn/ui defaults or primitive implementations to solve a page-specific problem.**
- Prefer usage-site `className`, existing props, supported variants, or feature-level wrappers.
- Preserve default dimensions, variants, styling, and accessibility behavior unless a change is explicitly requested or a verified shared defect requires it.
- Check whether a primitive already exists before adding another.
- Avoid unnecessary global changes to button sizes, input heights, checkbox dimensions, spacing, or typography.
- If a shared primitive genuinely needs modification, establish the impact and use the smallest appropriate fix.

### Accessibility

- Use semantic HTML and keyboard-accessible interactive elements with visible focus indicators.
- Give icon-only controls accessible names and informative images meaningful alternative text. Use empty alt text for decorative images.
- Preserve Radix keyboard navigation, focus management, and dialog semantics.
- Maintain sufficient contrast in light and dark themes.
- Respect reduced-motion preferences when introducing animations.
- Check narrow screens, keyboard navigation, and increased zoom when relevant.

### Theme & Styling

- Follow existing CSS variables, theme tokens, and `DESIGN-SYSTEM.md` conventions.
- Maintain compatibility with the project's existing theme implementation.
- Avoid unnecessary hardcoded colors, new design tokens, or styling systems.

## 4. Project Stack Conventions

### Next.js & React

- Prefer Server Components by default. Use `"use client"` only when client-side state, effects, browser APIs, interactivity, or client context require it.
- Respect App Router conventions and server/client boundaries.
- Reuse established server-side data-fetching patterns and tRPC callers.
- Do not move working server logic into client components without a concrete need.
- Use `next/image` where appropriate and follow existing image-handling conventions.

### tRPC & TanStack Query

- Use the project's tRPC patterns for internal API communication.
- Preserve existing query, mutation, cache invalidation, optimistic update, and error-handling conventions.
- Avoid raw `fetch` for internal APIs when an established tRPC implementation exists.
- Do not duplicate query keys or introduce redundant caching layers.

### Zustand

- Inspect each store's purpose, consumers, and hydration behavior before changing it.
- Follow existing store boundaries and initialization patterns.
- Do not assume every store contains only local UI state.
- Avoid duplicating server state or removing stores without understanding their role.

### Prisma & Database

- Access Prisma through established server-side boundaries.
- Use `select` and `include` deliberately to retrieve required data.
- Paginate potentially large collections where appropriate; do not force pagination onto small, bounded datasets or operations that need complete results.
- Preserve transactions, relations, constraints, and data semantics.
- Do not change schemas, migrations, or database behavior incidentally during UI work.

### Authentication & Permissions

- Follow Better Auth and the repository's actual authentication helpers. Verify implementation before using any API or helper.
- Use existing procedures such as `publicProcedure`, `protectedProcedure`, `adminProcedure`, and `projectProcedure` where appropriate.
- Follow `docs/PERMISSIONS.md` for role and authorization requirements.
- Enforce permissions server-side. Hiding a UI action is not authorization.
- Preserve session initialization, hydration, and role-specific navigation.

### Cloudinary & Uploads

- Follow the existing signed client-to-Cloudinary upload workflow and established tRPC signing endpoint.
- Preserve validation, progress feedback, and error handling.
- Maintain storage conventions, including `url` and `publicId` where required.
- Preserve asset deletion and database consistency workflows.
- Do not replace direct uploads with server-side file forwarding or change storage conventions without explicit justification.

### Icons, Notifications & Utilities

- Prefer `@tabler/icons-react` and existing icon sizing conventions.
- Use Sonner and established notification patterns.
- Avoid adding dependencies when existing project utilities already solve the problem.

## 5. Code Quality & Architecture

### TypeScript & Validation

- Preserve strict typing and infer types from existing schemas where appropriate.
- Avoid `any`, unsafe assertions, and ignored errors unless justified.
- Follow existing Zod validation patterns and the installed version.
- Validate untrusted input at the appropriate boundaries.

### Files & Naming

- Follow existing naming, folder structure, and import aliases.
- Do not rename or reorganize files to enforce generic conventions.
- A file exceeding 300 lines is not, by itself, a reason to refactor. Split files when it improves cohesion and maintainability, preferably within the task's scope.
- Keep abstractions proportional to actual reuse and complexity.

### Dependencies & Tooling

- Follow installed package versions, `biome.json`, and existing project scripts.
- Use the established package manager and tooling.
- Do not introduce competing libraries, formatters, or linters without justification.
- Avoid unrelated dependency upgrades and configuration changes.

## 6. Performance & UX

- Avoid unnecessary client components, rerenders, network requests, and heavy dependencies.
- Use appropriate image sizing and loading priorities.
- Communicate pending operations and handle failures clearly.
- Use optimistic updates only with appropriate rollback and error handling.
- Avoid unnecessary animations or gestures that complicate usability.
- Do not sacrifice accessibility, maintainability, or existing behavior for minor optimizations.

## 7. Change Workflow

### Before Changes

1. Inspect the target code, its callers, shared components, and established patterns.
2. Identify the actual issue and its scope.
3. Check relevant documentation, permissions, and installed APIs.
4. Choose the smallest safe change that satisfies the request.

### After Changes

1. Review the diff for unintended modifications.
2. Check relevant mobile and desktop layouts, interactions, and UI states.
3. Run applicable type checks, linting, and tests using available project scripts.
4. Report what changed, what was verified, and any remaining limitations. Never claim checks passed if they were not run.

**Core rule:** Preserve working code and shared component defaults. Follow the actual project, solve problems at the narrowest appropriate level, and improve mobile UX without degrading desktop behavior.
