# Gal Ofri Physiotherapy — CLAUDE.md

Marketing site for Gal Ofri, a licensed physiotherapist (B.P.T) in Tel Aviv. Astro 5 + Tailwind v4 + TypeScript, fully Hebrew, RTL. Static, no backend, no CMS — content lives in code.

## Mobile-first priority

**Confirmed with the site owner: most visitors arrive on a phone.** Mobile is not a secondary breakpoint checked after desktop — it is the primary experience. This applies to every layer: layout and spacing, tap target size, copy length, image weight/loading strategy, animation cost on lower-end devices, and the contact form's usability with an on-screen keyboard open. When reviewing or building any UI, check mobile first. `screenshots/capture.mjs` captures **mobile by default, before desktop** (390×844, iPhone-class viewport, run first in the script's loop) — always look at the `mobile-*.png` files, not just `desktop-*.png`.

## Stack & structure

- **Astro 5** (`.astro` components/pages), **Tailwind v4** via `@tailwindcss/vite` (config lives in `src/styles/global.css` under `@theme`, not a `tailwind.config.js`), strict TypeScript.
- Path aliases (`tsconfig.json`): `@components/*`, `@layouts/*`, `@styles/*`, `@data/*`. Use these, not relative `../../` chains.
- `src/data/site.ts` is the single source of truth for site-wide facts — phone, WhatsApp link, address, opening hours, socials, OG image. Never hardcode these values in a component; import from `@data/site`.
- `src/components/` — one component per section (`Hero`, `About`, `Services`, `Quote`, `Testimonials`, `Contact`, `Nav`, `Footer`, `SEO`). `src/layouts/BaseLayout.astro` wraps every page and owns the `<html lang="he" dir="rtl">`, skip-link, and scroll-reveal `IntersectionObserver` script.
- `src/pages/` — `index.astro` plus standalone legal pages (`privacy`, `accessibility`, `cancellation`).

## Design system (`src/styles/global.css`)

- Brand palette is **peach-orange** (`--color-teal-*` is the primary scale — the name is legacy, it is not teal). Warm neutrals (`--color-neutral-*`), dark warm-brown for footer/dark sections (`--color-navy-*`, `--color-section-dark`), gradient CTA colors (`--color-brand-amber*`).
- Every text color choice in this file has a WCAG contrast ratio commented next to it (e.g. `7.52:1 on warm white ✅`). When introducing a new text/background pairing, verify contrast and comment it the same way — don't guess.
- Reusable primitives already exist: `.btn-primary`, `.btn-secondary`, `.section-padding`, `.container-prose`, `.form-input`/`.form-label`/`.form-error`. Reuse these instead of rebuilding button/section styles inline.
- Motion: `.reveal-init`/`.reveal-in` (scroll-triggered fade-up, wired in `BaseLayout.astro`) and `--animate-fade-up`/`--animate-fade-in`. Every animation must have a `prefers-reduced-motion: reduce` fallback — follow the existing pattern in `global.css`, don't add motion that bypasses it.
- `:focus-visible` is styled globally — never add `outline: none` without an equivalent replacement.

## Content & language rules

- All user-facing copy is Hebrew. RTL is the default direction — use logical CSS properties (`start`/`end`, `ps-`/`pe-`, `ms-`/`me-`) not `left`/`right` physical properties, matching the existing `focus:start-4` pattern in `BaseLayout.astro`.
- This is a healthcare-adjacent business (physiotherapy). Keep medical claims modest and accurate — no diagnostic or treatment-outcome guarantees in marketing copy.
- `jsx-a11y` lint rules run on `.astro` files — accessibility is enforced, not optional. Real photos of the clinic/practitioner are being integrated into `src/assets/`; prefer them over stock imagery when swapping placeholders.

## Commands

```
npm run dev           # astro dev, localhost:4321
npm run build          # astro build
npm run lint / lint:fix
npm run format / format:check   # prettier, incl. prettier-plugin-tailwindcss (class sorting) — run before committing
```

## Design skills (installed)

`.claude/skills/`, `.claude/agents/`, and `.agents/` are git-ignored (vendored, reinstallable — see below); `PRODUCT.md` and `skills-lock.json` are the committed, human-authored/reproducible parts.

- **`impeccable`** (pbakaus/impeccable) — design/QA skill with ~24 subcommands (`audit`, `critique`, `polish`, `animate`, `typeset`, `layout`, …) plus a deterministic anti-"AI slop" detector (generic cream/terracotta palettes, SaaS-card kits, template chrome, etc.). Installed a `PostToolUse` hook (fast detector after every `Edit`/`Write` on UI files) and a `Stop` hook (full pass) in `.claude/settings.local.json` (machine-local, git-ignored — reinstall with `npx impeccable install` on any new checkout/machine). `PRODUCT.md` at repo root is already written (ran `/impeccable init`) — it records confirmed audience/voice/constraints and explicitly flags **positioning as unconfirmed** (Gal hasn't confirmed the actual differentiator vs. other Tel Aviv clinics). `/impeccable live` gives a live in-browser variant-picking mode against the dev server — prefer it over extending `screenshots/capture.mjs` for iterating on one section's look.
- **`frontend-design`** (Anthropic's official `anthropics/skills`) — shorter, principle-based guidance for avoiding templated/generic AI design defaults. Complements Impeccable rather than duplicating it.
- **Emil Kowalski's animation skills** (`emilkowalski/skills`, 38k★) — installed a curated 7-of-13 subset relevant to this site (not the full pack, to avoid context bloat): `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `emil-design-eng`, `apple-design`, `mobile-native`. Skipped the React/Expo/Swift-specific ones (`ask-sonner`, `animate-expo`, `write-swift`, `pick-ui-library`) since this site has no React. Use `animate` when building new motion, `review-animations`/`improve-animations` to audit what exists (currently `--animate-fade-up`, `--animate-fade-in`, `.reveal-init`/`.reveal-in` in `global.css`), `mobile-native` given this is a mobile-heavy marketing site. Reinstall/update with `npx skills@latest experimental_install` (reads `skills-lock.json`).

## Visual QA

`screenshots/capture.mjs` drives headless **Puppeteer** against a running `npm run dev` server, scrolls to each section (`#services`, `#about`, `#testimonials`, `#contact`, `footer[aria-label]`), and screenshots each at two viewports — **mobile (390×844) first, then desktop (1440×900)** — into `screenshots/mobile-*.png` and `screenshots/desktop-*.png`.

- After any visual/layout change, start the dev server, run `node screenshots/capture.mjs`, and actually look at the resulting PNGs (via Read) before calling the change done — check `mobile-*` first per the mobile-first priority above, not just `desktop-*`.
- `capture.mjs`/`quote_shot.mjs` are tracked source (real tooling); the PNGs they generate (`screenshots/*.png`) are git-ignored output, and excluded from Claude's own context via `.claudeignore`.
- For interactive iteration on a specific section's design (not just a static check), prefer Impeccable's `live` mode over extending `capture.mjs` — it already does real-browser, HMR-backed variant iteration; don't reinvent that in the Puppeteer script.

## Git conventions

Commit subjects follow Conventional Commits style already used in history: `feat:`, `fix:`, `refactor:`, `redesign:`. Keep that prefix convention. Only commit when explicitly asked.

## Known issues

- **The contact form does not actually send anywhere yet.** `Contact.astro` posts to Web3Forms (`https://api.web3forms.com/submit`), but the hidden `access_key` field is still the literal placeholder `YOUR_WEB3FORMS_ACCESS_KEY` — every real submission currently fails silently into the error state (which does point people to WhatsApp as a fallback, but the "leave your details" flow itself reaches nobody). Needs a real Web3Forms access key (Gal or Dan signs up at web3forms.com with an email, gets a free key) pasted into `Contact.astro:230` before this form can be trusted to capture real leads.

## Boundaries

- Don't add a CMS, backend, or client-side framework (React/Vue/etc.) to solve something Astro + vanilla JS already handles — this site is intentionally static and dependency-light (check `package.json` before reaching for a new library).
- Don't rename `--color-teal-*` tokens site-wide as a "cleanup" — it's a large, unrequested diff; note the misnomer instead if it comes up.
