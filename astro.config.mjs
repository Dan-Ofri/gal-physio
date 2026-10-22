import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // See the note on SITE.url in src/data/site.ts.
  site: 'https://physiog.co.il',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
