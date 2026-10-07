# screenshots/

Everything here except the two `.mjs` scripts and this file is generated and
git-ignored (`screenshots/**/*.png|jpg|svg|html`), and nothing in here is
precious. Two rules keep it that way, and both are enforced by code rather than
by memory.

## The top level belongs to the capture scripts

`node screenshots/capture.mjs` writes exactly twelve files here, overwriting
them on every run, so the top level never grows:

```
mobile-hero.png   mobile-services.png   mobile-about.png
mobile-testimonials.png   mobile-contact.png   mobile-footer.png
desktop-hero.png  desktop-services.png  desktop-about.png
desktop-testimonials.png  desktop-contact.png  desktop-footer.png
```

Those are the canonical "what does the site look like right now" set, and the
ones CLAUDE.md tells you to read after a visual change, mobile first.
`quote_shot.mjs` adds `quote.png`. The list itself lives in
`scripts/screenshots-layout.mjs`; `npm run check:tidy` fails on anything else
at this level.

## Every other render goes in a topic folder, and expires

One-off comparisons, variant sweeps, transition frames, candidate palettes:
make a folder named after what you are investigating (`header/`, `cta/`,
`logo-colours/`) and put them there. Reuse a folder if one already fits.

**A topic folder that nobody has touched for 30 days is deleted.**
`capture.mjs` runs the pruner first thing, and `npm run clean:shots` runs it on
its own (`-- --dry-run` to only list, `-- --days 7` to change the threshold). A
folder is dated by its newest file, so adding one render keeps the whole
folder. There is no catalogue of folders to keep up to date: the folder name is
the description, and a stale one removes itself.

To keep a render, move it to `../GalOfriPhysiotherapy-source-assets/` with a
line in that folder's README. Everything that had accumulated here until Oct
2026 (126 MB: palettes, logo colourways, header states, CTA variants, ink-weight
measurements, v2/v3 versions) is in `design-renders-2026/` there.

**An HTML harness that renders comparisons belongs in its topic folder here,
never in `public/`.** Every byte of `public/` is served from the CDN at a
guessable URL whether or not anything links to it, so a local comparison page
parked there is published to the world, and published broken, since the site's
CSP pins `font-src` to `'self'` and these pages tend to pull Google Fonts.

## Throwaway scripts

Ad-hoc measurement and render scripts are fine here, but name them
`.<something>.tmp.mjs` and delete them when done. The leading dot keeps them
out of the way, `*.tmp.mjs` makes it obvious they are not tooling, the pruner
leaves them alone while in use, and CI fails if one is committed.
