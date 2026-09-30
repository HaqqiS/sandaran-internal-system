# Phase 0 — Baseline & Repro Checklist

**Branch:** `fix/mobile-overlays`  
**Recorded:** 2026-09-30  
**Purpose:** Concrete repro scenarios + current state audit before any code changes.

---

## A. Codebase Audit (snapshot at branch creation)

| Root Cause | File(s) | Current State | Fix Phase |
|---|---|---|---|
| **A — Lenis on whole app** | `src/app/layout.tsx` L78–81 | `SmoothScrollProvider` wraps **all** children; `dialog.tsx` + `drawer.tsx` call `lenis.stop()/start()` | Phase 1 |
| **A — Lenis in Dialog** | `src/components/ui/dialog.tsx` L6,14–25 | `useLenis()` + `handleOpenChange` → `lenis.stop/start` | Phase 1 (cleanup Phase 7) |
| **A — Lenis in Drawer** | `src/components/ui/drawer.tsx` L5,13–25 | Same pattern; `shouldScaleBackground=true` (no wrapper element) | Phase 1 + 4 |
| **B — DropdownMenu modal leaves `pointer-events:none`** | `confirm-delete-dialog.tsx` L42–59 | Body `pointer-events` reset hack present; `item-actions.tsx` already has `modal={false}`; `user-columns.tsx` L200, `transaction-list.tsx` L272 **missing** `modal={false}` | Phase 5 |
| **C — DialogContent no max-height** | `src/components/ui/dialog.tsx` L85 | No `max-h` or `overflow-y-auto` in class string | Phase 2 |
| **C — SheetContent no overflow** | `src/components/ui/sheet.tsx` | Not audited yet — verify in Phase 2 | Phase 2 |
| **D — `useIsMobile` starts `undefined`** | `src/hooks/use-mobile.ts` | `useState(undefined)` + `useEffect` → first render returns `!!undefined = false` (desktop) on a phone | Phase 3 |
| **E — vaul + keyboard + drag** | All Drawer form usages | No `data-vaul-no-drag` on form bodies; `shouldScaleBackground=true` with no wrapper | Phase 4 |
| **F — `CommandInput` text-sm** | `src/components/ui/command.tsx` L74 | `text-sm` (14px) — triggers iOS Safari zoom on focus | Phase 6 |
| **G — Popover/Command touch scroll** | `project-selector.tsx`, `user-select.tsx`, `item-form.tsx` | No `onWheel`/`onTouchMove` hacks found currently (may be hidden elsewhere) — verify on device | Phase 6 |
| **H — Tailwind data-* variants** | `src/styles/globals.css` | Only `@import "tailwindcss"` + `tw-animate-css` — no `shadcn/tailwind.css` | Phase 6 (if needed) |

---

## B. Test Scenarios (run before every phase)

> **Rating key:** ✅ Pass · ❌ Fail · ⚠️ Partial · 🔲 Not yet tested

### Scenario 1 — Open Project form from a dropdown → tap each input

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Open Projects page | Page loads, list visible | 🔲 | 🔲 |
| Tap ⋯ menu → Edit | Dropdown opens | 🔲 | 🔲 |
| Project form opens | Dialog/Drawer appears | 🔲 | 🔲 |
| Tap "Name" input immediately | Input focuses, keyboard opens | 🔲 | 🔲 |
| Tap "Description" input | Input focuses | 🔲 | 🔲 |
| Tap outside to close | Form closes, page still interactive | 🔲 | 🔲 |

---

### Scenario 2 — Tall form scrolling on small phone

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Open a tall form (Report / Project) | Form appears | 🔲 | 🔲 |
| Swipe up on form body | Whole form scrolls natively | 🔲 | 🔲 |
| Scroll to bottom | Footer buttons (Submit/Cancel) visible | 🔲 | 🔲 |
| Tap Submit | Form closes successfully | 🔲 | 🔲 |

---

### Scenario 3 — Textarea in Drawer + keyboard

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Open a Drawer form | Drawer slides up | 🔲 | 🔲 |
| Tap a textarea | Keyboard opens | 🔲 | 🔲 |
| Drawer stays open | Does NOT close or jump | 🔲 | 🔲 |
| Focused field visible | Not hidden behind keyboard | 🔲 | 🔲 |
| Dismiss keyboard | Drawer stays in place | 🔲 | 🔲 |

---

### Scenario 4 — Successful form submit → page still scrolls

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Submit any form successfully | Toast appears, overlay closes | 🔲 | 🔲 |
| Scroll the page | Native scrolling works (no stuck lock) | 🔲 | 🔲 |
| Open another overlay | Works normally | 🔲 | 🔲 |

---

### Scenario 5 — Date picker inside Dialog/Drawer

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Open Report form | Drawer/Dialog opens | 🔲 | 🔲 |
| Tap date field | Calendar/picker opens | 🔲 | 🔲 |
| Select a date | Date appears in field; parent does NOT close | 🔲 | 🔲 |
| Dismiss picker | Form still open, data retained | 🔲 | 🔲 |

---

### Scenario 6 — Scrollable list inside overlay (project selector / user select)

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Open a form with a combobox/selector | Popover opens with a list | 🔲 | 🔲 |
| Swipe up/down on list | List scrolls by touch | 🔲 | 🔲 |
| Select an item | Selection applied, popover closes | 🔲 | 🔲 |

---

### Scenario 7 — Rotate phone with dialog open

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Open any overlay | Opens normally | 🔲 | 🔲 |
| Rotate from portrait → landscape | Layout adapts | 🔲 | 🔲 |
| Form content / state preserved | No remount, no state loss | 🔲 | 🔲 |
| Rotate back | Still works | 🔲 | 🔲 |

---

### Scenario 8 — Homepage scroll & animations

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Visit `/` homepage | Loads, custom cursor visible (desktop) | 🔲 | 🔲 |
| Scroll through hero, portfolio, philosophy | Lenis smooth scroll + GSAP pins work | 🔲 | 🔲 |
| Scroll to bottom | No stuck scroll | 🔲 | 🔲 |

---

### Scenario 9 — Navigate homepage → dashboard → back

| Step | Expected | iOS Safari | Android Chrome |
|---|---|---|---|
| Visit `/` → scroll down | Smooth scroll active | 🔲 | 🔲 |
| Click Login / nav to `/dashboard` | Dashboard loads | 🔲 | 🔲 |
| Dashboard page scrolls natively | No Lenis double-scroll effect | 🔲 | 🔲 |
| Browser Back → homepage | Lenis re-activates, animations play | 🔲 | 🔲 |
| No stuck scroll lock | — | 🔲 | 🔲 |

---

### Scenario 10 — Desktop admin: users table & dialogs

| Step | Expected | Desktop Chrome |
|---|---|---|
| Visit `/users` | Table visible | 🔲 |
| Hover rows, click ⋯ | Dropdown opens | 🔲 |
| Click Edit | Dialog opens | 🔲 |
| Interact with all inputs | All focusable, no stuck pointer | 🔲 |
| Delete action | Confirm dialog → deletes | 🔲 |

---

## C. How to fill this in

1. Run `npm run dev` and open the app on real devices (or BrowserStack).
2. Go through each scenario row by row.
3. Replace 🔲 with ✅ / ❌ / ⚠️ and add a short note if broken.
4. Save the file, commit it: `git commit -m "phase(0): baseline repro checklist filled in"`.
5. Move on to Phase 1.

---

## D. Re-run log

| After Phase | Date | Tester | iOS result | Android result | Notes |
|---|---|---|---|---|---|
| Baseline (before any changes) | 2026-09-30 | — | 🔲 | 🔲 | Branch created, audit complete |
| After Phase 1 | — | — | 🔲 | 🔲 | — |
| After Phase 2 | — | — | 🔲 | 🔲 | — |
| After Phase 3 | — | — | 🔲 | 🔲 | — |
| After Phase 4 | — | — | 🔲 | 🔲 | — |
| After Phase 5 | — | — | 🔲 | 🔲 | — |
| After Phase 6 | — | — | 🔲 | 🔲 | — |
