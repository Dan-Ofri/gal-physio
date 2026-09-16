# 004 — Stagger the Services and Testimonials card entrances

- **Status**: TODO
- **Commit**: ff7f096
- **Severity**: LOW (missed opportunity — additive, not corrective)
- **Category**: Missed opportunities / Cohesion
- **Estimated scope**: 2 files + global.css, ~10 lines of new CSS + 2 class edits

## Problem

`src/layouts/BaseLayout.astro:54-70` observes every `section:not(#hero)` with a single `IntersectionObserver` and adds `.reveal-in` to the whole `<section>` at once (`global.css:296-313`). This means the Services grid's 3 cards and the Testimonials grid's 3 cards each fade up together as one flat block — the heading, intro paragraph, and every card animate in lockstep with zero separation, even though each is a visually distinct item in a `role="list"`.

```astro
<!-- src/components/Services.astro:87-91 — current -->
<div
  class="mt-10 grid gap-6 md:grid-cols-3"
  role="list"
  aria-label="שירותי הפיזיותרפיה שלי"
>
  {services.map((service) => (
    <article
```

```astro
<!-- src/components/Testimonials.astro:73-78 — current -->
<div
  class="mt-14 grid gap-6 md:grid-cols-3"
  role="list"
  aria-label="המלצות מטופלים"
>
  {testimonials.map((t) => (
    <article
```

## Target

A new `.stagger-children` utility in `global.css` that, combined with the section's existing `.reveal-init`/`.reveal-in` lifecycle, fades each direct child in with a per-item delay (70ms step, within the 30–80ms stagger budget) when the ancestor section becomes visible:

```css
/* src/styles/global.css — add immediately after the existing .reveal-init / .reveal-in / reduced-motion block (after line 313) */

/* ─── Staggered Children (used inside a .reveal-init section) ──────────────── */
.stagger-children > * {
  transition:
    opacity 0.5s var(--ease-out),
    transform 0.5s var(--ease-out);
}
.reveal-init .stagger-children > * {
  opacity: 0;
  transform: translateY(20px);
}
.reveal-in .stagger-children > *:nth-child(1) { transition-delay: 0ms; }
.reveal-in .stagger-children > *:nth-child(2) { transition-delay: 70ms; }
.reveal-in .stagger-children > *:nth-child(3) { transition-delay: 140ms; }

@media (prefers-reduced-motion: reduce) {
  .stagger-children > * {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

```astro
<!-- Services.astro:87-90 — target (add stagger-children to the existing class list) -->
<div
  class="mt-10 grid gap-6 md:grid-cols-3 stagger-children"
  role="list"
  aria-label="שירותי הפיזיותרפיה שלי"
>
```

```astro
<!-- Testimonials.astro:73-76 — target -->
<div
  class="mt-14 grid gap-6 md:grid-cols-3 stagger-children"
  role="list"
  aria-label="המלצות מטופלים"
>
```

## Repo conventions to follow

- This plan depends on plan 002 (`var(--ease-out)` must exist) — apply plan 002 first, or inline `cubic-bezier(0.23, 1, 0.32, 1)` if run standalone.
- Follows the exact structure of the existing `.reveal-init`/`.reveal-in` block (`global.css:295-313`) as its exemplar: same section header comment style (`/* ─── Name ─────... ─── */`), same "opacity 0 + translateY, drop on `.reveal-in`" shape, same reduced-motion carve-out placed immediately after.
- Only 2 grids in the codebase currently have exactly 3 children (`services`, `testimonials` arrays in their respective `.astro` files) — the `:nth-child(1/2/3)` rule is sufficient; do not generalize to more items speculatively.

## Steps

1. `src/styles/global.css` — after the closing `}` of the reduced-motion block that ends the `.reveal-init` section (the block ending at line 313), insert the `/* ─── Staggered Children ── */` CSS shown in Target.
2. `src/components/Services.astro:88` — add ` stagger-children` to the end of the grid `<div>`'s `class` attribute.
3. `src/components/Testimonials.astro:74` — add ` stagger-children` to the end of the grid `<div>`'s `class` attribute.

## Boundaries

- Do NOT change `BaseLayout.astro`'s `IntersectionObserver` script — the existing section-level trigger is reused as-is; this plan only adds child-level timing on top of it.
- Do NOT apply `.stagger-children` to any other grid/list in the codebase (e.g. `Contact.astro`'s info rows) — scope is exactly the two 3-item card grids named above.
- Do NOT change card markup, only the grid container's `class` attribute and the new global CSS rule.
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**: run `npm run dev`, reload the page, and scroll slowly to the Services section, then the Testimonials section:
  - Confirm the 3 cards in each grid fade up one after another (left-to-right or RTL-appropriate order) rather than all at once — the stagger should read as a quick ripple, not be so subtle it's imperceptible or so slow it feels laggy.
  - In DevTools Elements panel, confirm each `article` inside `.stagger-children` has `transition-delay: 0ms/70ms/140ms` per its position via the Styles pane.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm all 3 cards in both grids appear immediately at full opacity with no stagger and no movement.
  - Scroll back up and down again — since the section-level `IntersectionObserver` unobserves after first trigger (`BaseLayout.astro:60`), confirm the stagger only plays once per page load, consistent with the rest of the site's reveal behavior (not a regression, just confirming no double-fire).
- **Done when**: both grids visibly stagger on first scroll-into-view, reduced-motion users see no stagger and no movement, and no other section's reveal timing changed.
