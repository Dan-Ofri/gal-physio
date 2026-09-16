# 005 — Add real press feedback to the primary/secondary buttons

- **Status**: TODO
- **Commit**: ff7f096
- **Severity**: LOW (missed opportunity)
- **Category**: Missed opportunities / Physicality

## Problem

`.btn-primary` and `.btn-secondary` in `global.css` are the two button styles used for every CTA on the site, including the highest-value action on the page ("לתיאום ייעוץ ראשוני" — book a consultation). Both have a hover lift (`translateY(-1px)`), but neither gives tactile feedback on the actual click:

```css
/* src/styles/global.css:155-181 — current, relevant lines only */
.btn-primary {
  /* ... */
  transition: box-shadow 200ms ease, transform 150ms ease;
  /* ... */
}
.btn-primary:hover {
  /* ... */
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
}
```

```css
/* global.css:182-204 — current, relevant lines only */
.btn-secondary {
  /* ... */
  transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease, transform 150ms ease;
  /* ... */
}
.btn-secondary:hover {
  /* ... */
  transform: translateY(-1px);
}
/* no :active rule exists at all */
```

`.btn-primary:active` only cancels the hover lift (returns to `translateY(0)`, i.e. the resting position) — it doesn't communicate "this was pressed." `.btn-secondary` has no `:active` rule whatsoever, so clicking it currently produces no visual feedback beyond whatever the hover state already shows.

## Target

Both buttons press down with a subtle `scale(0.97)` on `:active`, combined with their existing `translateY(0)` reset, per the audit playbook's press-feedback spec (`transform: scale(0.97)` on `:active`, kept within the 0.95–0.98 range):

```css
/* global.css — target */
.btn-primary:active {
  transform: translateY(0) scale(0.97);
}

.btn-secondary:active {
  transform: translateY(0) scale(0.97);
}
```

## Repo conventions to follow

- This depends on plan 002 only in spirit (both buttons' `transition` lines already include `transform 150ms ease`, which already covers the new `:active` rule — no transition timing needs to change here). If plan 002 has already run, `ease` on these two lines will still read `ease`, not `var(--ease-out)`, because plan 002's scope intentionally excludes `.btn-primary`/`.btn-secondary` — leave that alone; this plan is scale-only.
- Exemplar already in the codebase: `src/components/Nav.astro:145` already does exactly this pattern correctly (`active:scale-[0.97]` on the mobile menu links) — match its `0.97` value exactly for consistency site-wide.

## Steps

1. `src/styles/global.css` — find `.btn-primary:active { transform: translateY(0); }` (around line 178) and change the declaration to `transform: translateY(0) scale(0.97);`.
2. `src/styles/global.css` — immediately after the `.btn-secondary:hover { ... }` block (around line 199-204), add a new rule:
   ```css
   .btn-secondary:active {
     transform: translateY(0) scale(0.97);
   }
   ```

## Boundaries

- Do NOT change either button's `transition` property list or durations.
- Do NOT touch `.btn-secondary:hover`'s existing `translateY(-1px)` — only add the new `:active` rule after it.
- Do NOT apply this pattern to any other element — scope is exactly `.btn-primary` and `.btn-secondary` in `global.css`.
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**: run `npm run dev` and, on both a primary button (e.g. "לתיאום ייעוץ ראשוני" in the hero) and a secondary button (e.g. "השירותים שלי" in the hero):
  - Press and hold the mouse button down: confirm the button visibly shrinks slightly (scale 0.97) while held, on top of losing its hover lift.
  - Release: confirm it springs back to the hover state (if cursor still over it) within the existing 150ms transform transition — no lag, no snapping.
  - In DevTools Animations/Elements panel, confirm `:active` computed `transform` reads `translateY(0px) scale(0.97)` on both buttons.
- **Done when**: both button classes shrink subtly on press and the effect is visually consistent with the existing mobile-menu-link press feedback (`Nav.astro:145`).
