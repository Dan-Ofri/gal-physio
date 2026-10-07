// What the top level of screenshots/ is allowed to hold, defined once. The
// capture script writes these files, the pruner spares them, and check:tidy
// flags anything else. See screenshots/README.md.

export const sections = [
  { name: 'hero', selector: 'body' },
  { name: 'services', selector: '#services' },
  { name: 'about', selector: '#about' },
  { name: 'quote', selector: '#quote' },
  { name: 'testimonials', selector: '#testimonials' },
  { name: 'contact', selector: '#contact' },
  { name: 'footer', selector: 'footer[aria-label]' },
];

// Mobile-first: most visitors are on a phone (see CLAUDE.md), so mobile is captured
// by default alongside desktop, not as an opt-in extra.
export const viewports = [
  { key: 'mobile', width: 390, height: 844, deviceScaleFactor: 2 }, // iPhone 12/13/14-class
  { key: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];

export const shotName = (viewport, section) => `${viewport}-${section}.png`;

// Tracked tooling, plus the files the scripts overwrite on every run.
export const TOP_LEVEL = new Set([
  'README.md',
  'capture.mjs',
  ...viewports.flatMap(({ key }) => sections.map(({ name }) => shotName(key, name))),
]);

// Ad-hoc scripts, allowed while in use and deleted when done.
export const isThrowaway = (name) => name.endsWith('.tmp.mjs');
