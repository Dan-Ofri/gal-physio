// Writes dist/_headers for Cloudflare from the headers in vercel.json, so the
// Content-Security-Policy (and its script hashes, which change whenever an
// inline script does) is edited in one place whichever host serves the site.
// Run after `npm run build`.
import { readFileSync, writeFileSync } from 'node:fs';

const rules = JSON.parse(readFileSync('vercel.json', 'utf8')).headers;

const lines = [];
for (const rule of rules) {
  // Vercel's "/(.*)" is every path; Cloudflare spells that "/*".
  lines.push(rule.source === '/(.*)' ? '/*' : rule.source);
  for (const { key, value } of rule.headers) lines.push(`  ${key}: ${value}`);
  lines.push('');
}

// Vercel marks the hashed /_astro files immutable by itself; Cloudflare does not.
lines.push('/_astro/*', '  Cache-Control: public, max-age=31536000, immutable', '');

writeFileSync('dist/_headers', lines.join('\n'));
console.log(`dist/_headers written (${rules.length} rule from vercel.json, plus /_astro/*)`);
