// @ts-check
import { defineConfig } from 'astro/config';
import remarkHeadingIds from './src/plugins/remark-heading-ids.mjs';
import remarkScansion from './src/plugins/remark-scansion.mjs';
import rehypeBodhini from './src/plugins/rehype-bodhini.mjs';

// GitHub Pages project site: https://<github-user>.github.io/vagartha-sangamah/
// Set SITE_URL in the deploy workflow (or edit the fallback) once the repo exists.
const site = process.env.SITE_URL || 'https://example.github.io';
const base = '/vagartha-sangamah';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    // Render Markdown as given (brief §9): no automatic curly quotes or dashes.
    smartypants: false,
    remarkPlugins: [remarkHeadingIds, remarkScansion],
    rehypePlugins: [[rehypeBodhini, { base }]],
  },
});
