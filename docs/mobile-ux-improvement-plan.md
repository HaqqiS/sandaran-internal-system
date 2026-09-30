# Mobile UX & Stability Improvement Plan — Astaloka Internal System

**Scope:** Dialog / Sheet / Drawer / input / scroll problems on phones, plus desktop polish for admin & CEO.
**Stack:** Next.js 15, React 19, shadcn/ui on Radix UI, vaul (Drawer), Lenis + GSAP, Tailwind v4.

## 0. Constraints (decided)

| Constraint | Decision |
|---|---|
| Theme & fonts (tweakcn preset) | **Do not change.** No edits to color tokens, `--font-*`, radius. |
| Drawer (vaul) | **Keep it** on mobile for its rounded, modern look. We harden it instead of replacing it. |
| Radix → Base UI migration | **Postponed.** Re-evaluate only at the decision gate (section 10). |
| Priority | Mobile first. Desktop layouts matter mainly for admin/CEO. |

---

## 1. Root causes (ranked by likely impact)

| # | Cause | Evidence in code | Symptom |
|---|---|---|---|
| A | Lenis runs on the **whole app** and is stopped/started only inside `Dialog`/`Drawer` `handleOpenChange` | `layout.tsx` wraps everything in `SmoothScrollProvider`; `dialog.tsx`, `drawer.tsx` call `lenis.stop()/start()` | Page stuck after a form closes itself (`onOpenChange(false)` from the parent never triggers the wrapper); Sheet/Popover/Dropdown/AlertDialog conflict with Lenis; needing `data-lenis-prevent` and `onWheel` hacks |
| B | `DropdownMenu` (modal) opening a Dialog leaves `pointer-events: none` on `<body>` | `projects-client.tsx` (Edit/Delete from dropdown), `ConfirmDeleteDialog` already has a workaround that resets `body.style.pointerEvents` | **Inputs can't be touched**, taps do nothing |
| C | `DialogContent` / `SheetContent` have no max height or overflow | `dialog.tsx`, `sheet.tsx` | Tall forms can't scroll on phones; manual scrollbars added per component |
| D | `useIsMobile` starts as `undefined` → first render is the desktop Dialog, then flips to Drawer | `use-mobile.ts` | Remount flicker, state loss, dialog "closes" right after opening |
| E | vaul Drawer + on-screen keyboard + drag gestures | Drawer wraps forms with inputs | Drawer drags/closes while touching inputs, jumps when keyboard opens |
| F | Command/Select inputs use `text-sm` (14px) | `CommandInput` in `command.tsx` | iOS Safari zooms on focus, layout shifts, popovers dismiss |
| G | Popover/Command inside a modal Dialog/Drawer can't scroll by touch | `project-selector.tsx`, `user-select.tsx`, `item-form.tsx` use `onWheel` hacks | Lists don't scroll |
| H | Possible missing Tailwind variants (`data-open:`, `data-closed:`, `data-checked:`) | `globals.css` imports only `tailwindcss` + `tw-animate-css` | Overlay animations / checkbox checked style may not apply with Radix (`data-state`) |

---

## 2. Phase 0 — Baseline & repro (30 min)

1. Create a short checklist of the bugs as **repeatable scenarios** (see section 9).
2. Test on at least: **iOS Safari** and **Android Chrome** (real devices, not only DevTools).
3. Note per scenario: works / broken. Re-run after each phase to see what actually fixed what.

Work on a branch: `fix/mobile-overlays`. One commit per phase so any phase can be reverted.

---

## 3. Phase 1 — Scope Lenis to the homepage only (highest impact)

**Goal:** dashboard uses native scrolling. Lenis + GSAP ScrollTrigger only where they're needed (homepage).

**3.1 Remove the provider from the root layout**

```tsx
// src/app/layout.tsx
<TRPCReactProvider>
  <Toaster richColors position="top-center" duration={5000} />
  {children}
</TRPCReactProvider>
```

**3.2 Add it to the homepage shell**

```tsx
// src/components/homepage/homepage-shell.tsx
import { SmoothScrollProvider } from "~/components/providers/smooth-scroll-provider";

return (
  <SmoothScrollProvider>
    <div className="cursor-none selection:bg-[var(--hp-clay)] selection:text-[var(--hp-ink)]">
      {/* ...existing content unchanged... */}
    </div>
  </SmoothScrollProvider>
);
```

Notes:
- `useLenis()` already returns no-op `stop`/`start` when there is no provider, so `Dialog`/`Drawer` keep working on dashboard pages with **no code changes**.
- Effect order (children before parent) is the same as today, so the homepage ScrollTrigger setup behaves as before.
- When navigating homepage → dashboard, the provider unmounts and `lenis.destroy()` runs, restoring native scroll.

**3.3 Verify:** open `/dashboard`, `/projects`; scrolling is native; dialogs open/close; after a successful form submit the page still scrolls.

---

## 4. Phase 2 — Make overlays scrollable by default

**4.1 `dialog.tsx` — add to the `DialogContent` class list**

```
max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain
```

Dialogs that already pass `p-0 gap-0 overflow-hidden` (ReportDialog, DepositDialog, WithdrawDialog) keep their own inner scroll body: `tailwind-merge` lets the later `overflow-hidden` win. No change needed there.

**4.2 `sheet.tsx` — add to the `SheetContent` class list**

```
overflow-y-auto overscroll-contain
```

The mobile sidebar also uses `SheetContent`; in `sidebar.tsx` pass `overflow-hidden` in its `className` so the sidebar keeps its own scroll area.

**4.3 Verify:** open the tallest form (report/project) on a small phone; the whole form is reachable with native touch scrolling.

---

## 5. Phase 3 — Fix `useIsMobile` (no first-render flip)

```ts
// src/hooks/use-mobile.ts
import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

export function useIsMobile() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches, // client
    () => false, // server
  );
}
```

The server snapshot stays `false` (safe for SSR), but the first client render already reads the real value, so a phone never mounts the desktop Dialog first.

---

## 6. Phase 4 — Harden the vaul Drawer (keeping it)

**Goal:** keep the rounded Drawer, remove the input/keyboard/drag problems.

**6.1 Stop drags from starting inside the form body**
Add `data-vaul-no-drag` to every scrollable form body inside a Drawer. Only the header/handle area then drags the sheet.

```tsx
<div className="flex-1 min-h-0 overflow-y-auto px-4 py-4" data-vaul-no-drag>
  {/* form */}
</div>
```

*(Optional stronger option: replace the plain handle `div` in `drawer.tsx` with `DrawerPrimitive.Handle` and pass `handleOnly` to `Drawer`. Check the handle's look afterwards, vaul injects its own handle styles.)*

**6.2 Background scaling**
`drawer.tsx` defaults `shouldScaleBackground = true`, but nothing in the app has a `data-vaul-drawer-wrapper` element, so it does nothing useful. Choose one:
- Default it to `false`; **or**
- Keep the iOS-style scale-back effect by wrapping the app content in `<div data-vaul-drawer-wrapper className="bg-background">` in the internal layout.

**6.3 Keyboard behaviour**
Vaul repositions the drawer when the keyboard opens (`repositionInputs`, default `true`). This helps on some devices and causes jumps on others.
- Test with default first.
- If the drawer jumps, set `repositionInputs={false}` and rely on: `h-[85dvh]` (already used), the inner scroll body, and `scroll-pb-24` so a focused input scrolls above the footer.
- Android Chrome only: in `layout.tsx` you can add
  ```ts
  export const viewport = { interactiveWidget: "resizes-content" };
  ```
  so the layout viewport shrinks with the keyboard. Test it; iOS ignores it.

**6.4 Avoid `autoFocus` on inputs inside drawers**
Auto-focus on open triggers the keyboard during the open animation, which is a common cause of jumpy/closing drawers (`TaskForm` uses `autoFocus`, that one is inline, not in a drawer, so it's fine).

**6.5 Keep footers outside the scroll body**
All existing drawers already use header / scroll body / footer. Keep it that way (see Phase 6 for a shared component).

---

## 7. Phase 5 — Fix "inputs can't be touched" after opening a dialog from a menu

This is the most likely cause of untouchable inputs: a modal `DropdownMenu` closing while a Dialog opens leaves `body { pointer-events: none }`.

**7.1 Make menus that open dialogs non-modal**

```tsx
// projects-client.tsx, user-columns.tsx, transaction-list.tsx, item-actions.tsx
<DropdownMenu modal={false}>
```

`item-actions.tsx` already does this. Apply it to every dropdown whose items open a Dialog/Sheet/AlertDialog.

**7.2 Verify:** open the dropdown → Edit → dialog opens → tap an input immediately; it focuses.

**7.3 Cleanup (after verification):** the `pointer-events` reset `useEffect` in `confirm-delete-dialog.tsx` can be removed. Keep it until the whole app has been tested.

---

## 8. Phase 6 — Shared `ResponsiveFormDialog` + popover fixes

**8.1 Why:** `ProjectDialog`, `ReportDialog`, `UploadDialog`, `LogisticItemDialog`, `TransactionDialog`, `DepositDialog`, `WithdrawDialog` all repeat the same Dialog/Drawer split with slightly different classes. One shared component means one place to fix bugs.

```tsx
// src/components/shared/responsive-form-dialog.tsx
"use client";

import type * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";

interface ResponsiveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  onSubmit: () => void;
  isPending?: boolean;
  children: React.ReactNode;
}

export function ResponsiveFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  isPending = false,
  children,
}: ResponsiveFormDialogProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <div className="flex max-h-[90dvh] flex-col">
            <div className="shrink-0 border-b px-4 pt-4 pb-3 pr-12">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-0.5">
                  {description}
                </DialogDescription>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
            <div className="flex shrink-0 justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-4 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button onClick={onSubmit} disabled={isPending}>
                {submitLabel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex h-[85dvh] flex-col">
        <DrawerHeader className="shrink-0 border-b pb-3 text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
          data-vaul-no-drag
        >
          {children}
        </div>
        <DrawerFooter className="mt-0 flex shrink-0 flex-row gap-2 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button className="flex-1" onClick={onSubmit} disabled={isPending}>
            {submitLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
```

Migration order (lowest risk first): `TransactionDialog` → `LogisticItemDialog` → `UploadDialog` → `DepositDialog` / `WithdrawDialog` → `ReportDialog` → `ProjectDialog`. Keep the existing draft-saving logic (`getValues()` on close) in each caller; it stays in the caller's `onOpenChange`.

**8.2 Popovers / Command lists inside modal overlays**
Touch/wheel scrolling of a Popover portaled out of a modal Dialog/Drawer is blocked by the modal's scroll lock. Fix:
- Add `modal` to `Popover` when it's used inside a Dialog/Drawer (`ProjectForm` already does; add to `ReportForm` date picker, `UserSelect`, `LogisticItemForm` unit picker).
- Then remove the `onWheel` / `onTouchMove` stopPropagation hacks and `data-lenis-prevent` (Phase 1 already removed Lenis from these pages).

**8.3 iOS zoom on focus**
In `command.tsx`, `CommandInput` uses `text-sm` (14px). iOS zooms into inputs below 16px, which shifts the layout and can dismiss popovers. Change it to `text-base md:text-sm` (same pattern as `Input`/`Textarea`). This uses your existing scale and does not change the theme.

**8.4 Tailwind variants check (H)**
If overlay open/close animations or checked checkboxes look wrong, add after `tw-animate-css` in `globals.css`:

```css
@import "shadcn/tailwind.css";
```

(`shadcn` is already a devDependency.) Confirm first by checking if a checked `Checkbox` shows the primary color; if it does, skip this.

---

## 9. Phase 7 — Cleanup, small extras, desktop polish

**Cleanup (only after phases 1–6 are verified):**
- Remove `useLenis` imports from `dialog.tsx` and `drawer.tsx` (dead code once Lenis is homepage-only).
- Remove `data-lenis-prevent` and `onWheel`/`onTouchMove` hacks from dialogs, `ProjectSelector`, `LogisticItemForm`.
- Remove the `pointer-events` reset in `ConfirmDeleteDialog`.

**Small extras:**
- `ImageUpload`: `capture="environment"` forces the camera on phones and hides the gallery. Remove it if users should also pick existing photos, or make it a prop.
- `gsap.ticker.lagSmoothing(0)` + Lenis RAF currently run on every page; Phase 1 removes this cost from the dashboard (better battery on phones).

**Desktop polish for admin/CEO (optional, after stability):**
- `UsersClient` / `DataTable`: on mobile show a card list per user (name, role badge, actions) instead of a wide table; keep the table from `md` up.
- Use `max-w-screen-2xl mx-auto` for wide dashboards so content doesn't stretch on large monitors.
- Sticky table headers and a visible horizontal scroll hint for wide tables.
- Reuse the existing mobile-card / desktop-table pattern already used in `ItemList` and `TransactionHistory`.

---

## 10. Test matrix & acceptance criteria

| # | Scenario | Pass condition |
|---|---|---|
| 1 | Open Project form from dropdown → tap each input | Every input focuses immediately |
| 2 | Open Report form (tall) on a small phone | Whole form scrolls natively; footer button always visible |
| 3 | Focus a textarea inside a Drawer (keyboard opens) | Drawer doesn't close or jump; focused field stays visible |
| 4 | Submit a form successfully | Dialog closes; page scrolls normally afterwards |
| 5 | Date picker inside Dialog/Drawer | Calendar opens, selecting a date doesn't close the parent |
| 6 | Project selector / user select list with many items | List scrolls by touch |
| 7 | Rotate phone with a dialog open | Layout adapts; no remount/state loss |
| 8 | Homepage scroll (hero, portfolio, philosophy) | Animations and pinning unchanged |
| 9 | Navigate homepage → dashboard → back | No stuck scroll lock, no double smooth-scroll |
| 10 | Desktop admin: users table, dialogs | Same behaviour as before |

Run on iOS Safari + Android Chrome + desktop Chrome. A phase is "done" only when its scenarios pass on both phones.

---

## 11. Suggested timeline

| Phase | Effort | Risk |
|---|---|---|
| 0 Baseline | 0.5 h | none |
| 1 Lenis scope | 0.5–1 h | low |
| 2 Overlay scroll | 0.5 h | low |
| 3 `useIsMobile` | 0.25 h | low |
| 4 Drawer hardening | 1–2 h (device testing) | medium |
| 5 Dropdown → dialog fix | 0.5–1 h | low |
| 6 Shared dialog + popovers | 3–5 h | medium |
| 7 Cleanup + desktop polish | 2–4 h | low |

Roughly **1.5–2 working days** including testing. Phases 1–5 are the quick wins; do those first and re-test before touching Phase 6.

---

## 12. Decision gate: Base UI

After Phases 1–5, re-run the test matrix.
- **All pass:** no migration needed.
- **Some still fail on Radix primitives** (not Lenis, not vaul, not styling): document exactly which scenario and component, then evaluate a per-component Base UI migration (start with Dialog and Popover, keep vaul).

Reasons to stay on Radix for now: Base UI is newer with fewer mobile edge cases documented, migration touches many files (`asChild` → `render`, different Select/Menu APIs), and vaul and Lenis would remain either way.

---

## 13. Files touched (summary)

| File | Change |
|---|---|
| `src/app/layout.tsx` | Remove `SmoothScrollProvider` |
| `src/components/homepage/homepage-shell.tsx` | Add `SmoothScrollProvider` |
| `src/components/ui/dialog.tsx` | Max height + overflow; later remove Lenis calls |
| `src/components/ui/sheet.tsx` | Overflow + overscroll |
| `src/components/ui/sidebar.tsx` | `overflow-hidden` on mobile `SheetContent` |
| `src/components/ui/drawer.tsx` | `shouldScaleBackground` default; later remove Lenis calls |
| `src/components/ui/command.tsx` | `CommandInput` → `text-base md:text-sm` |
| `src/hooks/use-mobile.ts` | `useSyncExternalStore` |
| `src/components/shared/responsive-form-dialog.tsx` | **New** shared dialog/drawer |
| Dialog wrappers (7 files) | Migrate to `ResponsiveFormDialog` |
| `projects-client.tsx`, `user-columns.tsx`, `transaction-list.tsx` | `DropdownMenu modal={false}` |
| `report-form.tsx`, `user-select.tsx`, `item-form.tsx` | `Popover modal` |
| `confirm-delete-dialog.tsx` | Remove pointer-events workaround (after verification) |
| `globals.css` | Only if Phase 8.4 check shows missing variants (`@import "shadcn/tailwind.css"`) |

Theme tokens, fonts and radius are **not** modified anywhere in this plan.
