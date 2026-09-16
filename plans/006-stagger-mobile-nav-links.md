# 006 — Stagger the mobile nav menu links on open

- **Status**: DONE
- **Commit**: ff7f096
- **Severity**: LOW (missed opportunity)
- **Category**: Missed opportunities / Cohesion

## Problem

`src/components/Nav.astro`'s mobile menu overlay (`#mobile-menu`, styled at lines 209-236) already animates its own entrance (translateY + scale + opacity, on a deliberate custom curve — see plan 002/003). The 4 nav links inside it, however, have no entrance motion of their own — they simply exist inside the overlay and appear the instant the overlay's opacity reaches visible, all 4 at once:

```astro
<!-- src/components/Nav.astro:138-150 — current -->
<nav
  aria-label="תפריט ניווט נייד"
  class="flex flex-1 flex-col items-center justify-center gap-2 px-6"
>
  {
    links.map(({ href, label }) => (
      <a
        href={href}
        class="w-full rounded-2xl py-4 text-center text-xl font-semibold text-neutral-700 transition-[background-color,color,transform] duration-150 hover:bg-neutral-100 hover:text-teal-700 active:scale-[0.97]"
      >
        {label}
      </a>
    ))
  }
</nav>
```

(class shown already includes plan 001's `transition-[background-color,color,transform]`; if plan 001 hasn't run yet, the live class will instead read `transition-all duration-150 hover:...` — either way, this plan only edits the `<style>` block, not this class attribute.)

The hamburger icon already gets deliberate, crafted motion (plan-independent, pre-existing); the links it reveals deserve the same level of polish, especially since this is the first fully custom navigation moment mobile visitors interact with.

## Target

Add link-level opacity+translateY entrance motion, staggered on open, to `Nav.astro`'s existing `<style>` block. Per the audit playbook's interruptibility guidance, the stagger applies asymmetrically: staggered on entrance, instant together on exit (so closing the menu doesn't feel laggy or leave links visible after the overlay has faded):

```css
/* Nav.astro — target, append to the existing <style> block (after the reduced-motion block from plan 003, if applied; otherwise after the #mobile-menu[data-open='true'] rule) */

/* ── Mobile nav links — staggered entrance ── */
#mobile-menu nav a {
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
  transition-delay: 0ms; /* exit: disappear together with the overlay, no stagger */
}
#mobile-menu[data-open='true'] nav a {
  opacity: 1;
  transform: translateY(0);
}
#mobile-menu[data-open='true'] nav a:nth-child(1) {
  transition-delay: 80ms;
}
#mobile-menu[data-open='true'] nav a:nth-child(2) {
  transition-delay: 120ms;
}
#mobile-menu[data-open='true'] nav a:nth-child(3) {
  transition-delay: 160ms;
}
#mobile-menu[data-open='true'] nav a:nth-child(4) {
  transition-delay: 200ms;
}

@media (prefers-reduced-motion: reduce) {
  #mobile-menu nav a {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

The 80ms starting offset lets the overlay itself become visible first before links start appearing; the 40ms step between links stays within the audit playbook's 30–80ms stagger budget.

## Repo conventions to follow

- Depends on plan 002 for `var(--ease-out)` — if plan 002 hasn't run, inline `cubic-bezier(0.23, 1, 0.32, 1)` instead.
- If plan 003 has already run, this block's reduced-motion rule should be added inside that same `@media (prefers-reduced-motion: reduce) { ... }` block in `Nav.astro` rather than as a second separate media query — keep one reduced-motion block per file, matching `global.css`'s convention of one block per stylesheet.
- `nav[aria-label="תפריט ניווט נייד"] a` is exactly `links.map(...)`'s 4 items (`אודות`, `שירותים`, `המלצות`, `יצירת קשר`, from the `links` array at `Nav.astro:4-9`) — the `:nth-child` rule is correct for exactly 4 items; do not generalize.

## Steps

1. `src/components/Nav.astro` — append the `/* ── Mobile nav links — staggered entrance ── */` CSS block shown in Target to the end of the `<style>` block (or merge its `@media (prefers-reduced-motion: reduce)` rule into plan 003's block if that plan already ran — check for an existing `@media (prefers-reduced-motion: reduce)` block in this file first).

## Boundaries

- Do NOT change the `<nav>` or `<a>` markup, or the `links` array — CSS-only addition.
- Do NOT change the overlay's own (`#mobile-menu`) opacity/transform timing — this plan only adds motion to its child links.
- Do NOT stagger the bottom CTA area (`Nav.astro:152-175`, the "תיאום ייעוץ ראשוני" button and phone link below the nav) — scope is exactly the 4 links inside `<nav aria-label="תפריט ניווט נייד">`.
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**: run `npm run dev` on a narrow viewport (or DevTools device toolbar), tap the hamburger icon, and confirm:
  - The 4 links fade/slide up one after another in list order, starting shortly after the overlay itself becomes visible — not all 4 at once, not so slow it feels sluggish.
  - Closing the menu (tap the close button or a link) makes the links disappear together with the overlay, with no lingering staggered exit.
  - In DevTools, set Animations playback to 10% (or slow-motion via the Rendering panel emulation) and confirm the visible order is link 1 → 2 → 3 → 4, roughly 40ms apart.
  - Toggle `prefers-reduced-motion` to `reduce` and confirm all 4 links are simply present at full opacity with no fade/slide/stagger when the menu opens.
- **Done when**: the 4 mobile nav links visibly stagger in on open, disappear together on close, and are unaffected under reduced motion.
