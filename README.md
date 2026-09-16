# Gal Ofri Physiotherapy

Marketing site for Gal Ofri, a licensed physiotherapist (B.P.T) in Tel Aviv. Hebrew, RTL, static — built with [Astro](https://astro.build) and [Tailwind CSS v4](https://tailwindcss.com).

🔗 [www.galofri-physio.co.il](https://www.galofri-physio.co.il)

## Stack

- **Astro 5** — static site generation, no backend/CMS
- **Tailwind CSS v4** — design tokens defined in `src/styles/global.css` (`@theme` block, not a `tailwind.config.js`)
- **TypeScript** (strict)

See [CLAUDE.md](CLAUDE.md) for project structure, conventions, and the design/animation/QA tooling set up for this repo.

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` / `npm run lint:fix` | ESLint (Astro + jsx-a11y rules) |
| `npm run format` / `npm run format:check` | Prettier (incl. Tailwind class sorting) |
| `node screenshots/capture.mjs` | Screenshot every section against a running dev server, for visual review |

## Deployment

Static output (`npm run build` → `dist/`), deployed via Vercel from this repo's `main` branch.
