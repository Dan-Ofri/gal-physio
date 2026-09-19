# screenshots/

Everything here except the two `.mjs` scripts and this file is generated and
git-ignored (`screenshots/**/*.png|jpg|svg|html`). Nothing in here is precious —
but it does need to stay findable, which is what this file is for.

**An HTML harness that renders comparisons belongs in its topic folder here,
never in `public/`.** Every byte of `public/` is served from the CDN at a
guessable URL whether or not anything links to it, so a local comparison page
parked there is published to the world — and published broken, since the site's
CSP pins `font-src` to `'self'` and these pages tend to pull Google Fonts.
`pal/palettes.html` arrived that way and was moved out.

## The rule

**The top level belongs to `capture.mjs` and nothing else.**

`node screenshots/capture.mjs` writes exactly twelve files there, overwriting
them each run:

```
mobile-hero.png   mobile-services.png   mobile-about.png
mobile-testimonials.png   mobile-contact.png   mobile-footer.png
desktop-hero.png  desktop-services.png  desktop-about.png
desktop-testimonials.png  desktop-contact.png  desktop-footer.png
```

Those are the canonical "what does the site look like right now" set, and the
ones CLAUDE.md tells you to read after a visual change — mobile first.
Because they are always overwritten, the top level never grows.

**Every other render goes in a named subfolder.** One-off comparisons,
variant sweeps, transition frames, candidate palettes: make a folder named
after the thing you are investigating and put them there. If a topic folder
already fits, reuse it rather than inventing a near-duplicate.

## Current folders

| folder     | what is in it                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `header/`  | header and mobile-menu work: glass states, menu background candidates, transition frames, sticky-bar opacity sweeps                 |
| `logo/`    | logo colourways and the full-vs-compact lockup comparison                                                                           |
| `pal/`     | brand palette exploration (clean, eucalyptus, quiet, sage, slate, teal), plus `palettes.html`, the page that renders the comparison |
| `sheet/`   | early full-page design sheets                                                                                                       |
| `comps/`   | annotated design comps, including their source HTML                                                                                 |
| `archive/` | renders kept only because deleting someone else's work is not mine to do                                                            |

## Working scripts

- `capture.mjs` — the canonical set. Mobile viewport first, then desktop, per
  the mobile-first priority in CLAUDE.md. Needs a dev server on 4321.
- `quote_shot.mjs` — one section, writes `quote.png`.

## Throwaway scripts

Ad-hoc measurement and render scripts are fine here, but name them
`.<something>.tmp.mjs` and delete them when done. The leading dot keeps them
out of the way, and `*.tmp.mjs` makes it obvious they are not tooling anyone
should depend on. Do not leave them behind: `capture.mjs` and
`quote_shot.mjs` are the only scripts here that are real.
