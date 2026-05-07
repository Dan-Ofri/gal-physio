import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.galofri-physio.co.il',
  vite: {
    plugins: [tailwindcss()],
  },
});
