// Writes dist/_headers for Cloudflare from the headers in vercel.json, so the
// Content-Security-Policy (and its script hashes, which change whenever an
// inline script does) is edited in one place whichever host serves the site.
// It also writes dist/_redirects: /wa, the short WhatsApp link for the Instagram
// bio, which reads its target from SITE.whatsappUrl so the number and the opening
// message stay in one place, and /review, the short link to the Google review
// dialog (SITE.googleReviews.write) for cards, QR codes and thank-you messages.
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

// A regex rather than an import: site.ts is TypeScript, and this script runs on
// plain node. The guard turns a reformatted field into a failed build instead of
// a dead link in the bio.
const site = readFileSync('src/data/site.ts', 'utf8');
const whatsapp = site.match(/whatsappUrl:\s*'(https:\/\/wa\.me\/[^']+)'/)?.[1];
if (!whatsapp) throw new Error('whatsappUrl not found in src/data/site.ts');
const review = site.match(/write:\s*'(https:\/\/g\.page\/[^']+)'/)?.[1];
if (!review) throw new Error('googleReviews.write not found in src/data/site.ts');
// 302, not 301: browsers keep a 301 for good, and the number or the message may change.
writeFileSync(
  'dist/_redirects',
  `/wa ${whatsapp} 302
/review ${review} 302
`
);
console.log('dist/_redirects written (/wa -> WhatsApp, /review -> Google review)');
