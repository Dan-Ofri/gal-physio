// Fails when the repo drifts out of order. Runs in CI before the build
// (`npm run check:tidy`), so a red check blocks the production deploy like any
// other failure. The folder rules it enforces are written up in CLAUDE.md
// under "Housekeeping"; this file is what keeps them from being aspirational.
//
// It walks the filesystem rather than asking git, so it behaves the same in a
// CI checkout without git and locally, where it also catches untracked strays
// before they are committed.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOP_LEVEL, isThrowaway } from './screenshots-layout.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Generated, vendored or machine-local. Never inspected.
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  '.astro',
  '.vercel',
  '.claude',
  '.agents',
  '.impeccable',
  'test-results',
  'playwright-report',
  'blob-report',
]);

const posix = (p) => p.split(sep).join('/');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(join(dir, entry.name)));
    } else {
      out.push(posix(join(dir, entry.name)));
    }
  }
  return out;
}

const files = walk('.').map((f) => f.replace(/^\.\//, ''));
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const under = (dir) => files.filter((f) => f.startsWith(`${dir}/`));

const problems = [];
const fail = (rule, file, hint) => problems.push({ rule, file, hint });

// Everything that can pull in a file from src/assets or public/.
const sourceText = files
  .filter((f) =>
    /^(src\/.*\.(astro|ts|mjs|css|md)|astro\.config\.mjs|vercel\.json|public\/site\.webmanifest)$/.test(
      f
    )
  )
  .map(read)
  .join('\n');

// 1. Every file in src/assets is imported somewhere. Astro only ships what is
//    imported, so an orphan costs nothing at runtime, which is exactly why they
//    pile up: 25 of 32 files here were orphans by Oct 2026, ~57MB of the repo.
for (const f of under('src/assets')) {
  const rel = f.slice('src/'.length); // "assets/photos/hero.jpg"
  if (!sourceText.includes(rel)) {
    fail(
      'unused asset',
      f,
      'Nothing imports it. Move it to ../GalOfriPhysiotherapy-source-assets/ (see the README there), then delete it here.'
    );
  }
}

// 2. Every file in public/ is referenced. Unlike src/assets, public/ is served
//    whether or not anything links to it, at a guessable URL. These two are
//    fetched by browsers and crawlers by convention, not by link.
const PUBLIC_BY_CONVENTION = new Set(['public/favicon.ico', 'public/robots.txt']);
for (const f of under('public')) {
  if (PUBLIC_BY_CONVENTION.has(f)) continue;
  const url = f.slice('public'.length); // "/og-image.jpg"
  if (!sourceText.includes(url) && !sourceText.includes(basename(f))) {
    fail(
      'unreferenced public file',
      f,
      'It is served to the world but nothing links to it. Move it out of public/.'
    );
  }
}

// 3. Shipped file names are lowercase kebab-case: no spaces, no capitals, no
//    "WhatsApp Image … (3).jpeg". They become URLs and import paths.
const KEBAB = /^[a-z0-9]+(?:[-.][a-z0-9]+)*$/;
for (const f of [...under('src/assets'), ...under('public')]) {
  if (!KEBAB.test(basename(f))) {
    fail('file name', f, 'Rename to lowercase kebab-case, e.g. service-sports.jpg.');
  }
}

// 4. Size ceilings. Removing a file from the repo does not remove it from git
//    history, so the only cheap moment to stop a heavy one is before its first
//    commit: the 7-9 MB placeholder PNGs are still in .git today.
//    - src/assets: Astro re-encodes these, so the source only has to be good,
//      not small, and it must stay full resolution (CLAUDE.md, "Source images").
//      The shoot photos are ~1.1 MB at 4000x6000; re-encoded with sharp they
//      measure 1.1-1.35 MB at quality 85-90 and ~3.5 MB at 100, so 3 MB leaves
//      room for the photographer's edits and stops a PNG or quality-100 export.
//    - public/: served byte for byte, never re-encoded. og-image.jpg is the
//      largest at 85 kB, and WhatsApp drops a share image over ~300 kB.
const MB = 1024 * 1024;
const CEILINGS = [
  [
    'src/assets',
    3 * MB,
    'Re-export as JPEG, full resolution, quality 85-90. Do not downscale (CLAUDE.md).',
  ],
  [
    'public',
    300 * 1024,
    'Compress it; public/ is served as-is, and WhatsApp ignores share images over ~300 kB.',
  ],
];
for (const [dir, limit, hint] of CEILINGS) {
  for (const f of under(dir)) {
    const size = statSync(join(ROOT, f)).size;
    if (size > limit) {
      const fmt = (n) => (n >= MB ? `${(n / MB).toFixed(1)} MB` : `${Math.round(n / 1024)} kB`);
      fail(
        'file too large',
        f,
        `${fmt(size)}, over the ${fmt(limit)} ceiling for ${dir}/. ${hint}`
      );
    }
  }
}

// 5. The top level of screenshots/ holds the tooling, its README and the fourteen
//    files capture.mjs overwrites on every run. Anything else goes in a topic
//    subfolder (screenshots/README.md).
for (const f of under('screenshots')) {
  const rest = f.slice('screenshots/'.length);
  if (!rest.includes('/') && !TOP_LEVEL.has(rest) && !isThrowaway(rest)) {
    fail('screenshots top level', f, 'Move it into a topic subfolder, e.g. screenshots/header/.');
  }
}

// 6. Throwaway scripts (`.<name>.tmp.mjs`) are deleted when done. Locally they
//    are allowed while work is in progress; in CI one can only be there because
//    it was committed.
if (process.env.CI) {
  for (const f of files.filter((f) => isThrowaway(basename(f)))) {
    fail('committed throwaway script', f, 'Delete it; *.tmp.mjs files are never committed.');
  }
}

// 7. plans/ holds open work only. A finished plan is deleted in the commit that
//    finishes it; git history keeps it. Six DONE plans sat here for three weeks.
for (const f of under('plans').filter((f) => f.endsWith('.md'))) {
  if (/\|\s*DONE\s*\||^\s*status\s*:\s*done\b/im.test(read(f))) {
    fail('finished plan', f, 'Delete finished plans (and their row in plans/README.md).');
  }
}

// 8. Paths named in the docs exist. CLAUDE.md is read at the start of every
//    session, so a paragraph about a file that is gone is worse than no
//    paragraph: it was spent defending six PNGs that nothing used any more.
//    Globs, placeholders and generated output (git-ignored renders, dist/) are
//    not checked. To mention a file that no longer exists on purpose, write it
//    as `git show <sha>:<path>`, which this deliberately does not match.
const DOCS = ['CLAUDE.md', 'README.md', 'PRODUCT.md', 'screenshots/README.md'].filter((f) =>
  existsSync(join(ROOT, f))
);
const REPO_PATH = /^(?:src|public|e2e|scripts|screenshots|plans|\.github)\/[\w./@-]+$/;
const GENERATED = /^(?:dist\/|screenshots\/.*\.(?:png|jpe?g|svg|html)$)/;
const basenames = new Set(files.map((f) => basename(f)));
const CODE_FILE = /^[\w.-]+\.(?:astro|ts|mjs)$/;

for (const doc of DOCS) {
  const text = read(doc);
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const tokens = [...line.matchAll(/`([^`\s]+)`/g)].map((m) => m[1]);
    // Relative markdown links: [label](path) and [label](path#L12).
    tokens.push(
      ...[...line.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)]
        .map((m) => m[1])
        .filter((p) => !/^(?:https?:|mailto:)/.test(p))
    );
    for (const raw of tokens) {
      const p = raw.replace(/\/$/, '').replace(/[.,:;]$/, '');
      if (/[*<>{}$]|\.\.\//.test(p)) continue;
      if (/git show/.test(line) && line.includes(`:${p}`)) continue;
      if (REPO_PATH.test(p) || DOCS.includes(p)) {
        if (GENERATED.test(p)) continue;
        const docDir = doc.includes('/') ? doc.slice(0, doc.lastIndexOf('/')) : '';
        if (!existsSync(join(ROOT, p)) && !existsSync(join(ROOT, docDir, p))) {
          fail(
            'stale doc path',
            `${doc}:${i + 1}`,
            `\`${p}\` does not exist. Update or remove the passage.`
          );
        }
      } else if (CODE_FILE.test(p) && !basenames.has(p)) {
        fail(
          'stale doc path',
          `${doc}:${i + 1}`,
          `No file named \`${p}\` exists anywhere in the repo.`
        );
      }
    }
  });
}

if (problems.length === 0) {
  console.log(`check:tidy passed (${files.length} files).`);
} else {
  const width = Math.max(...problems.map((p) => p.rule.length));
  for (const { rule, file, hint } of problems) {
    console.error(`${rule.padEnd(width)}  ${file}\n${' '.repeat(width)}  ${hint}`);
    if (process.env.GITHUB_ACTIONS)
      console.error(`::error file=${file.split(':')[0]}::${rule}: ${hint}`);
  }
  console.error(
    `\ncheck:tidy failed: ${problems.length} problem(s). Rules: CLAUDE.md, "Housekeeping".`
  );
  process.exit(1);
}
