# 001 — Replace `transition-all` with scoped transition properties

- **Status**: DONE
- **Commit**: ff7f096
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 4 files, ~7 one-line class edits

## Problem

Several interactive elements use Tailwind's `transition-all` (`transition-property: all`), which forces the browser to watch every animatable CSS property for changes instead of only the ones that actually move. It is flagged as a finding regardless of severity of visible jank per the animation audit playbook. Every instance below only ever changes color/border/box-shadow/transform on hover or active state — never anything that needs `all`.

```astro
<!-- src/components/Services.astro:95 — current -->class="group flex h-full flex-col overflow-hidden
rounded-2xl bg-white ring-1 ring-neutral-200 transition-all duration-300 ease-out
hover:-translate-y-0.5 hover:ring-teal-200/70 hover:shadow-[0_4px_20px_-4px_rgb(0_0_0_/_0.08)]"
```

```astro
<!-- src/components/Testimonials.astro:81 — current -->class="group flex flex-col rounded-3xl
bg-neutral-50 p-9 ring-1 ring-neutral-100 transition-all duration-300 hover:-translate-y-1.5
hover:shadow-card-hover hover:ring-teal-100"
```

```astro
<!-- src/components/Contact.astro:126 — current -->class="inline-flex items-center gap-1.5
rounded-xl border border-white/20 px-3.5 py-2 text-xs font-medium text-white/70 transition-all
duration-200 hover:border-white/40 hover:text-white"
```

```astro
<!-- src/components/Contact.astro:139 — current (identical pattern, Waze button) -->class="inline-flex
items-center gap-1.5 rounded-xl border border-white/20 px-3.5 py-2 text-xs font-medium text-white/70
transition-all duration-200 hover:border-white/40 hover:text-white"
```

```astro
<!-- src/components/Footer.astro:146 — current -->class="flex h-8 w-8 items-center justify-center
rounded-full border border-teal-200 text-neutral-500 transition-all duration-200
hover:border-teal-400 hover:text-teal-600"
```

```astro
<!-- src/components/Nav.astro:14 — current (header scroll state) -->class="fixed inset-x-0 top-0
z-50 transition-all duration-500 ease-out"
```

```astro
<!-- src/components/Nav.astro:145 — current (mobile menu link) -->class="w-full rounded-2xl py-4
text-center text-xl font-semibold text-neutral-700 transition-all duration-150 hover:bg-neutral-100
hover:text-teal-700 active:scale-[0.97]"
```

## Target

Each `transition-all` replaced with a property list matching exactly what that element's hover/active state changes:

```astro
<!-- Services.astro:95 — target (transform + box-shadow: the ring is a box-shadow under the hood) -->class="group
flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200
transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5
hover:ring-teal-200/70 hover:shadow-[0_4px_20px_-4px_rgb(0_0_0_/_0.08)]"
```

```astro
<!-- Testimonials.astro:81 — target -->class="group flex flex-col rounded-3xl bg-neutral-50 p-9
ring-1 ring-neutral-100 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5
hover:shadow-card-hover hover:ring-teal-100"
```

```astro
<!-- Contact.astro:126 and :139 — target (only color + border-color change; Tailwind's transition-colors already covers both) -->class="inline-flex
items-center gap-1.5 rounded-xl border border-white/20 px-3.5 py-2 text-xs font-medium text-white/70
transition-colors duration-200 hover:border-white/40 hover:text-white"
```

```astro
<!-- Footer.astro:146 — target -->class="flex h-8 w-8 items-center justify-center rounded-full
border border-teal-200 text-neutral-500 transition-colors duration-200 hover:border-teal-400
hover:text-teal-600"
```

```astro
<!-- Nav.astro:14 — target (background-color via color-mix, backdrop-filter, box-shadow all toggle via .is-scrolled) -->class="fixed
inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-500 ease-out"
```

```astro
<!-- Nav.astro:145 — target (background-color + color on hover, transform on :active) -->class="w-full
rounded-2xl py-4 text-center text-xl font-semibold text-neutral-700
transition-[background-color,color,transform] duration-150 hover:bg-neutral-100 hover:text-teal-700
active:scale-[0.97]"
```

## Repo conventions to follow

- This is a Tailwind v4 project (`@tailwindcss/vite`, no `tailwind.config.js`) — use Tailwind's built-in `transition-colors` utility where only color/border-color/background-color change (it already bundles the right property list), and the `transition-[prop,prop]` arbitrary-value syntax otherwise, matching the arbitrary-value style already used in this codebase (e.g. `[animation-delay:0.25s]` in `src/components/Hero.astro:26`).
- Do not introduce a `transition-property` custom token system — this plan is a targeted correctness fix, not a design-system change (see plan 002 for shared easing tokens).

## Steps

1. `src/components/Services.astro:95` — replace `transition-all duration-300 ease-out` with `transition-[transform,box-shadow] duration-300 ease-out`.
2. `src/components/Testimonials.astro:81` — replace `transition-all duration-300` with `transition-[transform,box-shadow] duration-300`.
3. `src/components/Contact.astro:126` — replace `transition-all duration-200` with `transition-colors duration-200`.
4. `src/components/Contact.astro:139` — replace `transition-all duration-200` with `transition-colors duration-200`.
5. `src/components/Footer.astro:146` — replace `transition-all duration-200` with `transition-colors duration-200`.
6. `src/components/Nav.astro:14` — replace `transition-all duration-500 ease-out` with `transition-[background-color,backdrop-filter,box-shadow] duration-500 ease-out`.
7. `src/components/Nav.astro:145` — replace `transition-all duration-150` with `transition-[background-color,color,transform] duration-150`.

## Boundaries

- Do NOT touch any other classes on these elements (colors, spacing, radii).
- Do NOT change markup/structure — class-attribute edits only.
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run lint` (no new errors), `npm run build` (succeeds).
- **Feel check**: run `npm run dev`, open the site, and confirm:
  - Hovering the 3 service cards and 3 testimonial cards still lifts them and shows the shadow/ring exactly as before — no visual difference from pre-change behavior.
  - Hovering the Maps/Waze buttons in the contact section and the footer social icon still transitions border/text color smoothly.
  - Scrolling the page still smoothly transitions the header's background blur-in.
  - Opening the mobile menu (narrow viewport) and hovering/tapping a nav link still shows the background/color/press-scale transition.
  - In DevTools Performance panel (or Rendering → Paint flashing), confirm hovering a service card no longer triggers a "recalculate style" pass across unrelated properties (optional spot-check, not blocking).
- **Done when**: all 7 locations use scoped `transition-colors` / `transition-[...]` instead of `transition-all`, and every hover/active interaction above looks pixel-identical to before the change.
