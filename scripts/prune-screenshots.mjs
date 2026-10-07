// Deletes investigation renders in screenshots/ that nobody has touched for a
// while, so the folder cannot silently grow to 126 MB again (it had by Oct
// 2026). Runs at the start of every `node screenshots/capture.mjs`, and on its
// own as `npm run clean:shots`. Everything outside the canonical set is
// disposable by convention (screenshots/README.md): a render worth keeping
// belongs in ../GalOfriPhysiotherapy-source-assets/, not here.
//
//   node scripts/prune-screenshots.mjs              delete what is stale
//   node scripts/prune-screenshots.mjs --dry-run    list it, delete nothing
//   node scripts/prune-screenshots.mjs --days 7     change the threshold
//
// A topic folder is judged by its newest file, so adding one render to an old
// investigation keeps the whole folder. The canonical set and the tooling are
// never touched, and neither is a throwaway script, which may be mid-use.

import { readdirSync, statSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOP_LEVEL, isThrowaway } from './screenshots-layout.mjs';

const SHOTS = fileURLToPath(new URL('../screenshots/', import.meta.url));
const DAY = 24 * 60 * 60 * 1000;

function newestMtime(path) {
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let newest = 0;
  for (const name of readdirSync(path)) newest = Math.max(newest, newestMtime(join(path, name)));
  return newest;
}

export function pruneScreenshots({ days = 30, dryRun = false, log = console.log } = {}) {
  const cutoff = Date.now() - days * DAY;
  const removed = [];
  for (const entry of readdirSync(SHOTS, { withFileTypes: true })) {
    if (TOP_LEVEL.has(entry.name) || isThrowaway(entry.name)) continue;
    const path = join(SHOTS, entry.name);
    // An empty folder has no files to date it by; treat it as stale.
    if (newestMtime(path) >= cutoff) continue;
    if (!dryRun) rmSync(path, { recursive: true, force: true });
    removed.push(entry.isDirectory() ? `${entry.name}/` : entry.name);
  }
  if (removed.length) {
    log(
      `${dryRun ? 'Would prune' : 'Pruned'} ${removed.length} stale item(s) from screenshots/ (untouched for ${days}+ days):`
    );
    for (const name of removed) log(`  ${name}`);
  }
  return removed;
}

// Run directly, not imported by capture.mjs. Compared case-insensitively
// because Windows hands the drive letter back in either case.
const same = (a, b) => resolve(a).toLowerCase() === resolve(b).toLowerCase();
if (process.argv[1] && same(fileURLToPath(import.meta.url), process.argv[1])) {
  const args = process.argv.slice(2);
  const daysArg = args.indexOf('--days');
  const days = daysArg === -1 ? 30 : Number(args[daysArg + 1]);
  if (!Number.isFinite(days) || days < 1) {
    console.error('--days takes a whole number of days, at least 1.');
    process.exit(1);
  }
  const removed = pruneScreenshots({ days, dryRun: args.includes('--dry-run') });
  if (!removed.length) console.log(`Nothing in screenshots/ is older than ${days} days.`);
}
