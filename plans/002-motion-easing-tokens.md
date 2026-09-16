# 002 — Introduce shared easing tokens and stop hand-typing curves

- **Status**: TODO
- **Commit**: ff7f096
- **Severity**: LOW
- **Category**: Cohesion & tokens / Easing & duration
- **Estimated scope**: 2 files, 1 new token block + 4 call-site edits

## Problem

`src/styles/global.css` already defines a full design-token system in its `@theme` block (color scale, spacing, radius, shadows — see `global.css:9-81`) but has no easing tokens. The two animation keyframes fall back to the generic, weak built-in `ease`:

```css
/* src/styles/global.css:79-80 — current */
--animate-fade-up: fadeUp 0.7s ease both;
--animate-fade-in: fadeIn 0.8s ease both;
```

The scroll-reveal transition hand-types its own one-off curve instead of using a shared token:

```css
/* src/styles/global.css:299-301 — current */
transition:
  opacity 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
  transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

Separately, `src/components/Nav.astro` already has a good, deliberate custom curve for the hamburger and mobile-menu overlay, hand-typed in three places with no shared name:

```css
/* src/components/Nav.astro:197, 224-225, 232-234 — current, three occurrences of the same literal */
transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease;
```

## Target

Add three named easing tokens to the existing `@theme` block, then point every one of the above at a token instead of a literal. Values are exact — do not approximate:

```css
/* src/styles/global.css — add inside the existing @theme block, near the other tokens */
@theme {
  /* ...existing tokens unchanged... */

  /* ── Motion — shared easing curves ── */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out — entrances/exits */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out — on-screen movement */
  --ease-drawer: cubic-bezier(0.16, 1, 0.3, 1);      /* this site's existing menu/drawer curve, now shared */
}
```

```css
/* global.css:79-80 — target */
--animate-fade-up: fadeUp 0.7s var(--ease-out) both;
--animate-fade-in: fadeIn 0.8s var(--ease-out) both;
```

```css
/* global.css:299-301 — target */
transition:
  opacity 0.65s var(--ease-out),
  transform 0.65s var(--ease-out);
```

```css
/* Nav.astro:197 — target */
transition: transform 300ms var(--ease-drawer), opacity 200ms ease;
```

```css
/* Nav.astro:224-225 and :232-234 — target (both occurrences) */
transition:
  opacity 300ms var(--ease-drawer),
  transform 300ms var(--ease-drawer),
  visibility 0ms linear 300ms;   /* keep the visibility line's own timing unchanged in each block */
```

## Repo conventions to follow

- Tokens live in `src/styles/global.css`'s `@theme` block, grouped and comment-labeled like the existing sections (`/* ── Brand palette ── */`, `/* ── Shadows ── */`). Add the new `/* ── Motion — shared easing curves ── */` group after the existing `/* Shadows */` group and before `/* Animations */` (global.css:73-81).
- CSS custom properties defined in `global.css`'s `:root`-level `@theme` block are available anywhere in the app, including inside Astro component `<style>` blocks (Astro scoping only scopes selectors, not variable inheritance) — `Nav.astro` can reference `var(--ease-drawer)` without importing anything.
- Exemplar: `--shadow-teal` (global.css:74) is already exactly this pattern — a named token referenced by class rules elsewhere in the file.

## Steps

1. `src/styles/global.css` — inside the `@theme { ... }` block, after the `/* Shadows */` group (ends at line 76) and before `/* Animations */` (line 78), insert the three-line `/* ── Motion — shared easing curves ── */` group shown in Target.
2. `src/styles/global.css:79-80` — replace `ease` with `var(--ease-out)` in both `--animate-fade-up` and `--animate-fade-in`.
3. `src/styles/global.css:299-301` — replace both `cubic-bezier(0.25, 0.46, 0.45, 0.94)` occurrences with `var(--ease-out)`.
4. `src/components/Nav.astro:197` — replace `cubic-bezier(0.16, 1, 0.3, 1)` with `var(--ease-drawer)`.
5. `src/components/Nav.astro:224-225` — replace both `cubic-bezier(0.16, 1, 0.3, 1)` occurrences with `var(--ease-drawer)`.
6. `src/components/Nav.astro:232-234` — replace both `cubic-bezier(0.16, 1, 0.3, 1)` occurrences with `var(--ease-drawer)`.

## Boundaries

- Do NOT change any duration values — only the easing curves become tokens/variables.
- Do NOT touch the `visibility 0ms linear` lines in Nav.astro's mobile-menu transitions.
- Do NOT introduce a duration-scale token system — this plan is easing only.
- Do NOT modify `.btn-primary`/`.btn-secondary` or any other `transition:` declarations not listed above (see plan 005 for buttons).
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` succeeds (Tailwind v4's `@theme` block is standard CSS custom-property syntax, so a typo would only surface visually, not as a build error — check output carefully).
- **Feel check**: run `npm run dev` and confirm:
  - The hero section's staggered fade-up entrance (badge → heading → subheadline → CTAs → photo) looks the same or slightly snappier than before — no visible regression in the entrance curve.
  - Scrolling down still triggers each section's fade-up-on-scroll (`#about`, `#services`, `#testimonials`, `#contact`) with no visible change in feel from before.
  - The hamburger icon still morphs to an X, and the mobile menu overlay still opens/closes with the same feel as before (this is a pure refactor — the drawer curve's actual value is unchanged, just renamed to a variable).
  - In DevTools, inspect `#site-header`'s computed `@theme` custom properties (or search global.css's compiled output) to confirm `--ease-out`, `--ease-in-out`, `--ease-drawer` resolve to the exact cubic-bezier values above.
- **Done when**: no literal `cubic-bezier(...)` or bare `ease` remains at any of the 6 edited call sites, all reference the new tokens, and the site's motion looks unchanged (this plan is a pure consolidation, not a redesign).
