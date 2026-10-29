<div align="center">

# वागर्थसङ्गमः
### Vāgartha-saṅgamaḥ

*the confluence of word and meaning*

> वागर्थाविव सम्पृक्तौ वागर्थप्रतिपत्तये।
> जगतः पितरौ वन्दे पार्वतीपरमेश्वरौ॥
>
> So that I may grasp words and their meanings, I bow to the parents of the world, Pārvatī and Parameśvara, who are eternally united with one another, the way a word is with its meaning.
>
> — Kālidāsa, *Raghuvaṃśa* 1.1

**[Visit the site →](https://USERNAME.github.io/vagartha-sangamah/)**

</div>

---

## What this is

A personal, public archive of Sanskrit texts studied **word by word**: stotras, chapters of the Devī Māhātmya and the Bhagavad Gītā, kāvya, subhāṣitas, anything in Sanskrit.

Each finished study becomes a **bodhinī** (*"she who awakens"*), named the way traditional commentaries are named. For every verse, a bodhinī gives:

- the verse in **Devanāgarī** and **IAST**
- **padaccheda** (sandhi split) and a **word table** with root, grammar and meaning
- the full **meaning**, narrative **context**, **insights** and **cross-references**
- **reading notes**: alternate splits, corrections and variant readings (pāṭhabheda)
- **metre** with syllable-by-syllable scansion
- **बोधाः (Awakenings)**, in my own words

Every verbal root met along the way feeds the **धातुमञ्जरी · Dhātu-mañjarī**, a site-wide root index. Each root gets a page listing every form encountered across all studies, with its grammar and a link back to the exact verse. It's a Sanskrit grammar study guide that grows on its own.

Read the full preface on the site: **प्रस्तावना · Prastāvanā**.

## Studies so far

| Bodhinī | Text | Source |
|---|---|---|
| सप्तश्लोकी-बोधिनी · Saptaślokī-bodhinī | Saptaślokī Durgā | Devī Māhātmya 1.55, 4.17, 11.10, 11.12, 11.24, 11.29, 11.39 |

## How it's built

- **[Astro](https://astro.build)** static site with content collections. Every page is rendered at build time.
- **Deployed** to GitHub Pages via GitHub Actions on every push to `main`.
- **Content is plain Markdown + YAML.** The HTML is generated, never hand-edited.
- **Themes × deity accents:** the reader picks one of five themes (कलमकारी Kalamkārī, पौर्णमी Paurṇamī, ताडपत्र Tāḍapatra, कुङ्कुम Kuṅkuma, वृन्दा Vṛndā), each with light and dark modes. Each study's presiding deity sets only the accent **hue**: `oklch(theme-L theme-C deity-hue)`.
- **Typography:** [Tiro Devanagari Sanskrit](https://fonts.google.com/specimen/Tiro+Devanagari+Sanskrit), designed for Sanskrit, self-hosted.
- No horizontal scrolling anywhere; mobile-first, with a contents rail and two-up verse cards on desktop.

The full design spec lives in [`docs/site-brief.md`](docs/site-brief.md).

## Repository layout

```
content/
  studies/<collection>/<slug>.md           # one bodhinī (study page)
  roots/<collection>/<slug>.roots.yml      # its root occurrences (data only)
  pages/prastavana.md                      # the preface
docs/
  site-brief.md                            # design + structure spec (source of truth)
  theme-preview.html                       # visual reference for the theme system
src/                                       # layouts, components, styles
```

## Adding a new study

1. Add `content/studies/<collection>/<slug>.md`, a bodhinī with the required frontmatter (`title`, `title_devanagari`, `text_name`, `slug`, `collection`, `theme`, `essence`, `source`, `verses`, `metres`, `studied_on`, …).
2. Add `content/roots/<collection>/<slug>.roots.yml`, with one entry per root occurrence linked to a verse anchor (`v1`, `v2`, … / `p1`, … for preliminaries).
3. Push. The home page, the Dhātu-mañjarī and every affected root page rebuild automatically.

**Conventions:**
- Verse anchors (`{#v1}`) are permanent, because root pages link to them.
- The roots file extension is always `.roots.yml`.
- Smart quotes are **off**, so IAST avagraha (*namo 'stu te*) renders correctly.
- Write scansion as a fenced ` ```scansion ` block of `syllable:G` / `syllable:L` pairs.
- No Hindi; Sanskrit (Devanāgarī + IAST) and English only.

## Running locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
```

If content looks stale after swapping files, stop the dev server, delete `.astro/` and `node_modules/.vite/`, and run `npm run dev` again.

## Credits

- Verse texts follow the Gita Press editions unless a reading note says otherwise.
- Fonts: Tiro Devanagari Sanskrit, Noto Serif Devanagari and EB Garamond, under the SIL Open Font License.
- Built with [Claude Code](https://claude.com/claude-code).

## License
study content © Kavitha
