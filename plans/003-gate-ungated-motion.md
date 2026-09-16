# 003 — Gate remaining motion behind `prefers-reduced-motion`

- **Status**: DONE
- **Commit**: ff7f096
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files, 2 additions

## Problem

`src/styles/global.css:100-108` already handles reduced motion correctly for `.animate-fade-up`, `.animate-fade-in`, and `.reveal-init` (drops movement, keeps the element visible). Two other animated elements are not covered by any reduced-motion rule:

1. The scroll-hint chevron in the hero uses Tailwind's built-in `animate-bounce` utility, which is a separate class from the custom `.animate-fade-up`/`.animate-fade-in` keyframes and is not matched by the existing media query:

```astro
<!-- src/components/Hero.astro:112 — current -->
<svg
  class="h-5 w-5 animate-bounce"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"></svg>
```

2. `src/components/Nav.astro`'s `<style>` block (lines 178-237) defines the hamburger→X rotation and the mobile-menu overlay's translate+scale entrance/exit, and contains no `@media (prefers-reduced-motion: reduce)` block at all — this motion currently always runs regardless of the user's OS setting.

## Target

1. Gate the scroll-hint bounce with Tailwind's `motion-reduce:` variant (maps to `@media (prefers-reduced-motion: reduce)`, same idiom Tailwind already provides — no custom CSS needed):

```astro
<!-- Hero.astro:112 — target -->
<svg
  class="h-5 w-5 animate-bounce motion-reduce:animate-none"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"></svg>
```

2. Add a reduced-motion block to `Nav.astro`'s `<style>` that removes the movement (rotation, translate, scale) but keeps the opacity/visibility change so the menu still visibly opens and closes — same "keep opacity, drop transform" pattern already used in `global.css:100-108`:

```css
/* Nav.astro — target, append at the end of the existing <style> block, after the #mobile-menu[data-open='true'] rule */
@media (prefers-reduced-motion: reduce) {
  .menu-bar {
    transition: none !important;
  }
  #mobile-menu {
    transition: none !important;
    transform: none !important;
  }
}
```

With no `transition`, the hamburger bars snap instantly to their rotated/faded `[aria-expanded='true']` state instead of animating, and `#mobile-menu`'s `opacity`/`visibility` still change instantly between its closed and `[data-open='true']` rules (state is still communicated, just not animated) — forcing `transform: none` means the translate+scale never renders even during that instant swap.

## Repo conventions to follow

- `global.css:100-108` is the exemplar for this exact pattern (media query name, comment style, "drop movement keep opacity" philosophy) — match its approach rather than inventing a new one.
- Use Tailwind's `motion-reduce:` variant for anything expressible as a utility class (Hero.astro), and a plain `@media` block inside the component's own `<style>` tag for anything that isn't (Nav.astro, which uses hand-written CSS already).

## Steps

1. `src/components/Hero.astro:112` — add `motion-reduce:animate-none` to the `class` attribute, after `animate-bounce`.
2. `src/components/Nav.astro` — append the `@media (prefers-reduced-motion: reduce) { ... }` block shown in Target to the end of the existing `<style>` block (after the `#mobile-menu[data-open='true']` rule, before the closing `</style>` tag).

## Boundaries

- Do NOT remove or restructure the existing hamburger/overlay CSS — only add the reduced-motion override on top of it.
- Do NOT touch `global.css:100-108` (already correct, out of scope).
- Do NOT add a `<script>`-based `useReducedMotion` check — this project has no JS animation state to branch on; a CSS media query is sufficient and consistent with the rest of the codebase.
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` succeeds; `npm run lint` reports no new issues.
- **Feel check**: run `npm run dev`. In Chrome DevTools, open the Rendering tab and set "Emulate CSS media feature prefers-reduced-motion" to `reduce`, then:
  - Confirm the hero's scroll-hint chevron is static (no bounce).
  - Open the mobile menu (narrow viewport or device toolbar): confirm the hamburger icon still visibly indicates open/closed state (no rotation animation, but the bars can snap instantly) and the menu overlay still appears/disappears (opacity/visibility change), just without the translate+scale motion.
  - Reset the emulation to "No emulation" and confirm both animations are fully back to normal (bounce chevron, animated hamburger morph, animated menu slide).
- **Done when**: with reduced-motion emulated, no element moves via `transform`, but all state changes (menu open/closed, hamburger open/closed) remain visually indicated.
