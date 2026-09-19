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

- **Typography is a pair, not one family**: `--font-sans` (Assistant) for UI and running text, `--font-heading` (Rubik) for every heading. Both are self-hosted via fontsource. Rubik is loaded **Hebrew-subset only**, with a hand-written `@font-face` in `global.css` rather than the package's stylesheet — the H1's comma is a Latin-range character, so importing every subset made LCP wait on a Latin font file to render one glyph. Latin digits and punctuation in headings fall back to the sans stack on purpose. Don't "fix" this by switching to the package's default `@import`, and re-measure before adding a font `preload`: preloading helped only once the Latin file was gone, and hurt before that.
- Brand palette is **bright tangerine on warm graphite** (`--color-teal-*` is the primary scale — the name is legacy, it is not teal). Rebuilt Sep 2026 after the practitioner rejected the previous peach-orange scale as "orange-brown-red".
- **`--color-teal-*` is a ramp of roles, not of one hue, and 600/700/800 are deliberately not orange.** The old scale read as rust because its deep steps carried headings, links and the CTA, and an orange dark enough to hold white text at 4.5:1 is rust by definition — `#c2410c`, the shallowest one that passes, sits at H17°/V76°, which is the same coordinates as the `#be4a1e` that was rejected. There is no hue fix; the roles had to separate. So 50–500 are decorative tangerine fills, 600 (`#44403c`) is body ink and 700/800 (`#1c1917`) are graphite. The ~50 `text-teal-700` call sites across the components and policy pages are why the names stayed.
- **The load-bearing rule: orange never carries small text, and never carries meaning alone.** `--color-teal-500` (`#f97316`) is 2.70:1 on the page background — under 4.5:1 for text _and_ under 3:1 for a UI boundary. It is a fill: discs, rules, dots, icon backgrounds. The single exception is `--color-brand-amber` (`#ea580c`, 3.43:1), allowed on display type at 24px+/18.66px+bold and on the focused-field border, both of which are 3:1 thresholds. Don't reach for it anywhere else.
- Because no text is orange any more, the light sections carry their brand colour through two primitives — `.heading-rule` (a tangerine bar under a section heading, `+ .heading-rule-start` where the heading is start-aligned rather than centred) and `.eyebrow` (an ink label with a tangerine dot) — plus a handful of fills. Strip those and the page renders as graphite on cream with no palette at all; that is what happens if you only swap tokens and skip the placement. Both put the colour in a pseudo-element rather than in the text, which is what keeps them on the right side of the rule above. Apply them to **every** section: the first pass put `.heading-rule` on Services and Contact only, and About and Testimonials read as a monochrome break in the scroll until someone noticed.
- `--color-navy-900` (`#14100e`) is **faintly warm on purpose and used at `/84`, not `/70`**. It overlays a sunlit clinic photo in `Contact.astro` and `Quote.astro`; a fully neutral ink at 70% leaves the warm room showing through as flat grey, which looked worse than the brown it replaced. Verified by rendering both, not by reading the hex.
- `.btn-primary` is a **flat** graphite background, not a gradient. That is partly aesthetic and partly so axe-core can evaluate it: it reports a gradient background as `incomplete` and checks nothing, which is why the old rust CTA was never actually covered by `accessibility.spec.ts`. Don't reintroduce a gradient there without checking what the suite then stops seeing.
- Every text color choice in this file has a WCAG contrast ratio commented next to it (e.g. `16.86:1 on warm white ✅`). When introducing a new text/background pairing, verify contrast and comment it the same way — don't guess.
- Reusable primitives already exist: `.btn-primary`, `.btn-secondary`, `.section-padding`, `.container-prose`, `.form-input`/`.form-label`/`.form-error`. Reuse these instead of rebuilding button/section styles inline.
- Motion: `.reveal-init`/`.reveal-in` (scroll-triggered fade-up, wired in `BaseLayout.astro`) and `--animate-fade-up`/`--animate-fade-in`. Every animation must have a `prefers-reduced-motion: reduce` fallback — follow the existing pattern in `global.css`, don't add motion that bypasses it.
- `:focus-visible` is styled globally — never add `outline: none` without an equivalent replacement.
- **The hero's two decorative discs are not a first-paint cost worth removing.** `blur-[140px]` over 640px and `blur-[120px]` over 480px look like an obvious target. Baking them into the radial gradients they mathematically resolve to — profile sampled numerically, output pixel-identical at a max channel diff of 4/255 at 390×844 — measured _slower_: FCP 3080ms against 2848ms, LCP 3228ms against 2876ms, six interleaved runs at 1.6 Mbps with a 6× CPU slowdown, no overlap between the ranges. A blur samples a small source and composites it; the equivalent gradient evaluates 17 stops across a box grown by 3σ on every side, 1480px square, which is the larger job. Leave them. The two figures are comparative only, from a local server that did **not** compress: treat the delta as real and the absolute numbers as meaningless. Vercel serves the CSS brotli'd at 9.3kB, not the 58.8kB on disk, and Lighthouse mobile against the live site reports FCP 1.3s / LCP 1.8s, both scoring 98.
- **Never put an `animation-delay` on an element that could be the LCP candidate.** `--animate-fade-up`/`--animate-fade-in` use `animation-fill-mode: both`, so the element holds `opacity: 0` for the whole delay — and Chrome permanently disqualifies an element that was invisible at its first paint from ever becoming an LCP candidate. The hero photo carried `[animation-delay:0.55s]` and was therefore never measured at all: reported LCP was the 3.5k nav logo, not the 88k photo, which made the number look ~600ms better than the page deserved. Removing the fade does not change when the photo arrives (1489ms against 1557ms, same file); it only lets the metric see the right element. Below-the-fold reveals (`.reveal-init`) are unaffected, since an LCP candidate has to be in the viewport. The mechanism is what matters here, not the millisecond figures, which came from the same uncompressed local harness; verify any claim of this kind against Lighthouse or PageSpeed on the deployed URL, never against `npm run dev` or an ad-hoc static server.

## Icons

Two families on purpose, and an audit keeps proposing to collapse them into one. Do not.

- **Line icons are Lucide/Feather** — 24-unit viewBox, `fill="none"`, `stroke="currentColor"`, round caps and joins. The four policy/FAQ pages ended on a Heroicons v1 Home until Sep 2026; its 1px arc corners read visibly softer than everything around it. If you add a line icon, take it from Lucide.
- **Brand marks are the official Simple Icons silhouettes** (`fill="currentColor"`): WhatsApp, Instagram, Waze, Google Maps. **Never swap one for a generic outline equivalent** to "match the line icons." Waze was a generic navigation arrow once and was reverted — that arrow is a send/compass glyph and nothing about it says Waze — and redrawing these marks also breaks the brands' own usage guidelines. Confirmed with the site owner: recognisability is the point.
- **The "solid brand marks look heavier than the line icons" objection has been measured and is mostly false.** Each glyph rendered alone at 200×200, black on white, mean ink coverage including antialiasing: Google Maps **35.0%** vs Waze **24.1%**, Instagram **42.0%** vs WhatsApp **33.6%**. Both pairs run _opposite_ to the intuition, because Simple Icons glyphs are silhouettes with knocked-out counters, not the four-colour consumer logos people picture. The only real gap is the stroked phone (**23.6%**) against WhatsApp (**33.6%**), 1.43x, which is inherent to stroke-versus-fill and is the price of the official mark. Re-measure before reopening this; do not argue it from the `fill=` attribute or from memory of the logos.
- Balance already comes from **shared containers**, not from matching the glyphs: the footer socials and the nav WhatsApp sit in identical `h-11 w-11` circles, Waze and Google Maps in matched bordered pills, and the sticky bar pairs each icon with a text label in a 50/50 split.
- **`stroke-width` is normalised by rendered pixels, not by the attribute.** It lives in the 24-unit viewBox, so thickness is `stroke-width x px/24`. Icons land in a narrow rendered band, roughly **1.3–1.7px**, which means the attribute scales with the box: 2 at 20px and 16px, 2.5 at 14px, 3 at 12px, 1.5 at 32px. Flattening every icon to `stroke-width="2"` looks like consistency and produces the opposite — it would thin the 14px qualification badges in `About.astro` to 1.17px, turn the 12px cancellation marks into 1px hairlines, and leave the 32px success check in `Contact.astro` heaviest on the site at 2.67px. The small-icon exceptions carry comments saying so.

## Content & language rules

- All user-facing copy is Hebrew. RTL is the default direction — use logical CSS properties (`start`/`end`, `ps-`/`pe-`, `ms-`/`me-`) not `left`/`right` physical properties, matching the existing `focus:start-4` pattern in `BaseLayout.astro`.
- This is a healthcare-adjacent business (physiotherapy). Keep medical claims modest and accurate — no diagnostic or treatment-outcome guarantees in marketing copy.
- **Never select the testimonial cards, or anything else the scripts drive, by tag name.** `Testimonials.astro`'s dot observer used `article[id^="testimonial-card-"]`; the cards became `<div role="listitem">` when the list roles were fixed, the selector went quiet rather than throwing, and the pagination dots sat grey and equal-width at every scroll position for anyone who did not look. Key on the id or a class the markup owns. Guarded now by "the pagination dot follows the card on screen" in `e2e/homepage.spec.ts`.

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

## Source images in `src/assets`

The six large PNGs behind the hero, about, quote, contact and service cards look like obvious optimisation targets. They are not — each candidate was measured against what Astro actually ships (`dist/_astro/*.webp`, compared pixel-by-pixel at every generated variant) and every one made things worse:

- **Converting them to WebP degrades the output.** libvips takes a scale-on-load fast path for WebP input, using libwebp's rescaler instead of lanczos3. Forcing a full decode first gives bit-identical output, which proves the cause — but nothing in the source file can opt out of it. Down to 33 dB PSNR on the largest service-card variant. PNG input has no such path.
- **Downscaling them changes the output and makes the site heavier.** The sources are cropped by `object-cover` to a different aspect than their own, so the source height needed is larger than the widths in `widths={[…]}` imply — naively resizing by width alone silently dropped the largest service-card variant from 1100×825 to 1100×600. Sizing them correctly fixes that, but the extra resampling step still costs 32–43 dB and adds ~8% to shipped bytes.
- **Recompressing the PNGs losslessly makes them bigger** (9.13 MB vs 8.20 MB for `quote-bg`); they are already better compressed than libvips manages. Note that sharp's `png({ effort: … })` turns on palette quantisation, which is lossy — it looks like a lossless knob and is not.

What did work was deleting 55 MB of exact duplicates and unreferenced renders, which left every shipped byte identical. Full-resolution originals of everything removed are in `../GalOfriPhysiotherapy-source-assets/`, outside the repo.

The same applies to `public/`, which is not an archive — every byte in it is served from the CDN at a guessable URL whether or not anything links to it. The header's wordmark was cropped down to `public/logo-compact.svg` in Sep 2026, and the full `public/logo.svg` it came from was moved out to `../GalOfriPhysiotherapy-source-assets/logo.svg` rather than left to ship unreferenced. Restoring it needs no copy of the file, only `git show f244434:public/logo.svg > public/logo.svg`.

### Setting both `width` and `height` crops at build time, silently

Passing **both** `width` and `height` to `<Image>` makes Astro's sharp service
resize with `fit: cover` and `position: centre` (see
`astro/dist/assets/services/sharp.js`), so the file the browser receives is
**already cropped to that aspect**. Any `object-position` in the class list then
has no excess left to position and does nothing. There is no warning: the page
just quietly shows a centre crop.

This bit twice, because most sources here are tall portraits (1536x2752) pulled
into square or 4:3 slots:

- `About.astro` asked for `object-top` and got a centre crop that sliced the top
  of Gal's head off. Fixed with `position="top"`, which is the build-time
  equivalent of `object-top` (both are 0%).
- `Hero.astro` asked for `object-[center_18%]`. That one has **no** build-time
  equivalent - `position` only takes named values (`top`/`centre`/`bottom`, plus
  `attention`/`entropy`), and 18% is measured against the full image, so the
  arithmetic only closes if the whole portrait ships. Fixed by dropping `height`
  so only the width is resized and the browser does the crop, at ~28kB on the
  largest srcset variant.

Rules of thumb:

- If the class list has an `object-position` other than the default, the shipped
  image **must not** be pre-cropped to the display aspect - drop `height`.
- If it is plain `object-center`, `width` + `height` is correct and cheapest,
  because centre matches sharp's default. That is why Quote, Contact and the
  service cards are fine as they are.
- If it is exactly `object-top` or `object-bottom`, keep both and pass the
  matching `position`.
- Verify by rendering, not by reading: the dev server applies the same
  build-time crop, so this cannot be caught in devtools. Screenshot the
  `<figure>` itself - `screenshots/capture.mjs` anchors to section tops, and on
  mobile the About and Hero photos sit outside that frame.

The hero and about photos are **placeholders**. When the real ones land, re-check
this for each: the same `position="top"` that fixes today's About photo will crop
a differently framed photo just as badly, and the symptom looks identical.

## Visual QA

`screenshots/capture.mjs` drives headless **Puppeteer** against a running `npm run dev` server, scrolls to each section (`#services`, `#about`, `#testimonials`, `#contact`, `footer[aria-label]`), and screenshots each at two viewports — **mobile (390×844) first, then desktop (1440×900)** — into `screenshots/mobile-*.png` and `screenshots/desktop-*.png`.

- After any visual/layout change, start the dev server, run `node screenshots/capture.mjs`, and actually look at the resulting PNGs (via Read) before calling the change done — check `mobile-*` first per the mobile-first priority above, not just `desktop-*`.
- `capture.mjs`/`quote_shot.mjs` are tracked source (real tooling); the PNGs they generate (`screenshots/*.png`) are git-ignored output, and excluded from Claude's own context via `.claudeignore`.
- **The top level of `screenshots/` belongs to `capture.mjs` and nothing else.** Its twelve files are overwritten every run, so that directory never grows. Every other render — variant sweeps, transition frames, candidate comparisons — goes in a subfolder named after what is being investigated (`header/`, `logo/`, `pal/`, `sheet/`, `comps/`). `screenshots/README.md` has the full convention. Ad-hoc measurement scripts are named `.<name>.tmp.mjs` and deleted when done; they had piled up at the top level until Sep 2026.
- For interactive iteration on a specific section's design (not just a static check), prefer Impeccable's `live` mode over extending `capture.mjs` — it already does real-browser, HMR-backed variant iteration; don't reinvent that in the Puppeteer script.

## Git conventions

Commit subjects follow Conventional Commits style already used in history: `feat:`, `fix:`, `refactor:`, `redesign:`. Keep that prefix convention. Only commit when explicitly asked.

**Never `git add -A` or `git add .` — stage the specific files you changed.**
This working tree routinely holds someone else's half-finished work, and a
blanket add sweeps it into your commit under your commit message. It happened
on 2026-09-19: a CI commit swallowed an in-progress palette redesign, five
source files and `PRODUCT.md`, and had to be unpicked with `reset --soft` and a
force-push. `git status` before committing, and name the paths.

## CI and deployment (`.github/workflows/ci.yml`)

**Production deploys are gated on CI, and `main` no longer deploys on push.**
If you push to `main` and nothing appears on Vercel for a few minutes, that is
the design, not a breakage. `vercel.json` carries
`git.deploymentEnabled: { "main": false }`, so Vercel's git integration ignores
pushes to `main`; the workflow's `deploy` job fires the project's
`ci-production` deploy hook after the `verify` job is green. A red suite means
no deploy at all. Recover a stuck deploy with Redeploy in the Vercel dashboard,
or by POSTing the hook. Preview deployments for feature branches are untouched
— only `main` is disabled.

- The hook URL takes **no auth header**, so anyone holding it can deploy. It
  lives in the `VERCEL_DEPLOY_HOOK_URL` repository secret and must never be
  pasted into a file, a commit or a chat. Rotate it from the Vercel project's
  Git settings if it leaks.
- Vercel's **Ignored Build Step is the wrong tool here** and was rejected on
  purpose. It runs at push time, when the workflow has only just been queued,
  so it would have to poll for a CI result from inside a Vercel build — and a
  build it skips is canceled outright, with nothing to start it again once CI
  turns green. Don't "simplify" the deploy job into it.
- Do not swap `git.deploymentEnabled` for the deprecated `github.enabled`.
  The latter is documented to stop deploy hooks firing, which would break this
  chain. `git.deploymentEnabled: false` plus a deploy hook is verified working
  (observed 2026-09-19: a push to `main` produced no deployment, and the
  production deployment appeared only after the `deploy` job ran).
- **Bumping `@playwright/test` means bumping the container tag in the same
  commit.** The job runs in `mcr.microsoft.com/playwright:v<version>-noble`,
  pinned by hand, and nothing derives one from the other. If they drift, the
  installed Playwright asks for a browser revision the image does not carry.
  The "Confirm the image carries every browser this Playwright wants" step
  catches it by checking that the paths `playwright install --dry-run` names
  actually exist — `--dry-run` alone exits 0 either way and cannot catch this.
- **The workflow declares a Playwright project per browser, and CI has to have
  every one of them.** `playwright.config.ts` grew a `Desktop Firefox` project
  in `c90c09d` while CI installed only `chromium webkit`, and every run for the
  next ten hours failed on `browserType.launch: Executable doesn't exist` —
  seven tests red, fifty-two green underneath, nobody blocked, so the signal
  was ignored instead of fixed. The image now supplies all three, so adding a
  project is usually free; adding one the image lacks is not.
- **`HOME` is set to `/root` on the test step, and removing it breaks Firefox
  only.** The runner points `HOME` at `/github/home`, which the container's
  root user does not own, and Firefox refuses to launch under a `$HOME` it does
  not own — the same seven header tests go red, with a different message. It is
  scoped to that one step so the npm cache keeps its usual location.
- CI runs on **every branch push**, not just `main`, so the result arrives
  before the merge rather than after it. One job, not two: splitting lint/build
  from e2e made the second job redo checkout and `npm ci` for no benefit.
- `PW_SKIP_BUILD=1` tells the `webServer` block to run `npm run preview`
  without rebuilding, because CI already ran `npm run build` as its own step
  (which keeps a build failure reported as a build failure rather than as a
  webServer that exited early). Locally, leave it unset.
- **Don't reintroduce `actions/cache` for the browsers.** It was there, and the
  container replaced it. Caching the binaries never helped much: the cache does
  not hold the apt packages they link against, so `install-deps` still ran on
  every hit, at 35–59s depending on how the apt mirrors felt that minute. The
  image carries both, and pulling it costs 24–32s instead. Measured over four
  cached runs and three container runs: ~2:32 average before, ~2:08 after, and
  a much narrower spread. Don't expect more than that from this job — most of
  what is left is the suite itself.

## Security headers (`vercel.json`)

- `vercel.json` sets a strict `Content-Security-Policy` (plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`) applied by Vercel to every response.
- `script-src` is locked to `'self'` plus four SHA-256 hashes — Astro inlines the small per-page `<script type="module">` blocks (Nav's menu toggle, `BaseLayout`'s scroll-reveal observer, `Contact`'s form handler, `Testimonials`' carousel dots) directly into the HTML instead of emitting external files, so a plain `'self'` would block them.
- **If you edit the inline `<script>` in `Nav.astro`, `BaseLayout.astro`, `Contact.astro`, or `Testimonials.astro`, the browser will silently block it in production** (CSP violation, swallowed unless devtools console is open) because its hash changed. After such an edit, run `npm run build`, recompute the three hashes (`grep -o '<script type="module">.*</script>' dist/index.html` piped through a sha256/base64 step, or reuse the one-off Puppeteer check from the security review), and update the `script-src` value in `vercel.json` to match.
- `style-src` keeps `'unsafe-inline'` because of the one inline `style="backdrop-filter:..."` in `Contact.astro`; everything else on the site is external CSS via Tailwind, so this is the only relaxation from a fully strict policy.

## Known issues

- **The testimonials carousel needs `contain-paint` below `lg` or the whole page becomes swipeable sideways.** A horizontal scroller's clipped content still counts towards `<html>`'s scrollable overflow even though every ancestor up to `<body>` reports the correct width, so the document went to 801px at a 390px viewport and a diagonal swipe slid the site off screen — in Chromium _and_ WebKit. `overflow-x: hidden`/`clip` on html, body or any wrapper does not fix it; paint containment is the only thing that does, and it has to come back off at `lg` where the scroller becomes a plain grid. The breakpoint was `md` until Sep 2026; the carousel now runs to `lg`, because three columns at 768px left each quote in a 141px-wide box showing 128 of 523px of text. Guarded by "the document never becomes horizontally scrollable" in `e2e/homepage.spec.ts`; that test primes every section's scroll-reveal first, because a section still carrying its reveal `transform` contains the overflow and would make the assertion vacuous.
- ~~The contact form does not actually send anywhere yet.~~ **Resolved 2026-09-17**, and **confirmed end to end on 2026-09-19**: a real Web3Forms access key is set in `Contact.astro` and a submission through the live site returned `{"success": true}` with the payload echoed back. Two test messages were delivered in the process.
- **The contact form cannot be tested end to end from headless Chrome, and the failure looks exactly like a broken form.** Web3Forms' bot layer answers the CORS preflight with `403`, so the browser never sends the POST, `fetch` throws `net::ERR_FAILED`, and the page shows its own error state — with no CSP violation and nothing in the console. The signal it keys on is the headless signature: Chrome announces `HeadlessChrome` in `Sec-CH-UA`, and the 403 response asks for exactly those client hints back (`accept-ch: Sec-CH-UA-Bitness, Sec-CH-UA-Arch, …`). Overriding the UA **and** `userAgentMetadata` through CDP `Network.setUserAgentOverride` gets `OPTIONS 200` and `POST 200`; interleaved A/B, repeated, with nothing else changed. `curl` is no help either — it gets its own 403, `"Use our API in client side … (Pro plan is required)"`, because it looks like a server. To exercise the form's own success and error branches without sending anything, intercept the request and stub it, **and answer the `OPTIONS` with CORS headers** — stubbing only the POST makes a "success" fixture come back looking like a failure.
- **The production domain isn't connected yet — this is expected, not a bug.** `SITE.url` (`@data/site`) is hardcoded to `https://www.galofri-physio.co.il`, which every canonical/OG/JSON-LD tag derives from — but the domain is registered and _not yet pointed at Vercel_ (confirmed 2026-09-16: real WHOIS status "registered but isn't pointed at a website"). The actual live site during development is `https://gal-physio.vercel.app`. This means canonical URLs, `og:image`, and JSON-LD `@id`/`url` currently point at a domain that doesn't resolve — social share previews of the live dev URL won't show the OG image correctly until either the real domain is connected (update DNS in Vercel's project settings) or `SITE.url` is temporarily pointed at the Vercel URL. Don't "fix" this by silently changing `SITE.url` — it's already set correctly for the intended final domain; just don't be surprised when og:image checks against the live URL fail before launch.

## Boundaries

- Don't add a CMS, backend, or client-side framework (React/Vue/etc.) to solve something Astro + vanilla JS already handles — this site is intentionally static and dependency-light (check `package.json` before reaching for a new library).
- Don't rename `--color-teal-*` tokens site-wide as a "cleanup" — it's a large, unrequested diff; note the misnomer instead if it comes up. (`--font-serif` → `--font-heading` was renamed in Sep 2026, but only because the heading face was being replaced anyway and the old name would have described a sans as a serif — a second misnomer rather than one removed.)
