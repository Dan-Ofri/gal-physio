# Gal Ofri Physiotherapy

Marketing site for Gal Ofri, a licensed physiotherapist (B.P.T) in Tel Aviv. Hebrew, RTL, static — built with [Astro](https://astro.build) and [Tailwind CSS v4](https://tailwindcss.com).

🔗 Live at [gal-physio.vercel.app](https://gal-physio.vercel.app) until the domain [www.galofri-physio.co.il](https://www.galofri-physio.co.il) is connected.

## Stack

- **Astro 7** — static site generation, no backend/CMS
- **Tailwind CSS v4** — design tokens defined in `src/styles/global.css` (`@theme` block, not a `tailwind.config.js`)
- **TypeScript** (strict)
- **Playwright** + axe-core for end-to-end and accessibility tests (`e2e/`)

See [CLAUDE.md](CLAUDE.md) for project structure, conventions, and the design/animation/QA tooling set up for this repo.

## Layout

```
src/          the site: components, pages, layouts, data, styles, assets/photos
public/       served as-is at the site root: icons, OG image, robots.txt, manifest
e2e/          Playwright specs
scripts/      repo maintenance: check-tidy, prune-screenshots
screenshots/  visual QA renders (git-ignored output; see its README)
```

Source originals (full-resolution photos, logo masters, retired assets) live outside the repo in `../GalOfriPhysiotherapy-source-assets/`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321
```

## Scripts

| Command                                   | Description                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                             | Start the dev server                                                      |
| `npm run build`                           | Production build to `dist/`                                               |
| `npm run preview`                         | Preview the production build locally                                      |
| `npm run lint` / `npm run lint:fix`       | ESLint (Astro + jsx-a11y rules)                                           |
| `npm run format` / `npm run format:check` | Prettier (incl. Tailwind class sorting)                                   |
| `npm test`                                | Playwright e2e suite (builds and serves the site itself)                  |
| `npm run check:tidy`                      | Repo hygiene: orphaned assets, unreferenced public files, stale doc paths |
| `npm run clean:shots`                     | Delete `screenshots/` topic folders untouched for 30 days                 |
| `node screenshots/capture.mjs`            | Screenshot every section against a running dev server, for visual review  |

## Deployment

Static output (`npm run build` → `dist/`) on Vercel. Every push runs CI (lint, format, tidy check, build, e2e); production deploys only when CI is green on `main`, via a deploy hook. Feature branches get Vercel preview deployments. Details in CLAUDE.md under "CI and deployment".
