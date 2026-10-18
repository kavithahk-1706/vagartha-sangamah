import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Study pages (bodhinīs). The frontmatter `slug` becomes the entry id and URL path.
const studies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/studies' }),
  schema: z.object({
    title: z.string(),
    title_devanagari: z.string().optional(),
    text_name: z.string().optional(),
    text_name_devanagari: z.string().optional(),
    slug: z.string(),
    collection: z.string(),
    theme: z.string().default('general'),
    essence: z.string(),
    source: z.string().optional(),
    deity: z.string().optional(),
    verses: z.number().optional(),
    metres: z.array(z.string()).default([]),
    studied_on: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    // Optional public-domain header image (see docs/site-brief.md §8)
    image: z
      .object({ src: z.string(), alt: z.string(), credit: z.string() })
      .optional(),
  }),
});

// Standalone pages (e.g. the prastāvanā). Rendered as written: no reshaping, no recasing.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/pages' }),
  schema: z.object({
    title: z.string(),
    title_devanagari: z.string().optional(),
    gloss: z.string().optional(),
  }),
});

export const collections = { studies, pages };
