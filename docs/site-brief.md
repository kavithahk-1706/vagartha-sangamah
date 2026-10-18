# Site Brief: वागर्थसङ्गमः (Vāgartha-saṅgamaḥ)

One-time setup spec for Claude Code. Read this whole file before writing any code. After scaffolding, keep this file in the repo as `docs/site-brief.md`. It's the source of truth for style and structure.

---

## 0. Names (all Sanskrit, use exactly as given)

| Thing | Devanagari | IAST | Meaning |
|---|---|---|---|
| Site name | वागर्थसङ्गमः | Vāgartha-saṅgamaḥ | "The confluence of word and meaning" |
| Each study page | `<text>`-बोधिनी | `<text>`-bodhinī | "That which awakens [the text]", the traditional commentary-naming style, e.g. सप्तश्लोकी-बोधिनी / Saptaślokī-bodhinī |
| Roots index | धातुमञ्जरी | Dhātu-mañjarī | "A flower-cluster of roots" |

- Repo / URL slug: `vagartha-sangamah`
- In the UI, show the Devanagari first and the IAST beneath it.
- **Every Sanskrit heading or label also gets a short English gloss**, so a visitor who doesn't know Sanskrit isn't lost. Format: `अनुक्रमणिका · Contents`. Add the IAST too where it fits without crowding (big section headings); small labels and nav get just Devanagari + English. The gloss is a plain translation, e.g. अनुक्रमणिका → Contents, धातुमञ्जरी → Root index.

## 1. What this site is

A personal study archive of Sanskrit texts of every kind: stotras, Devī Māhātmya chapters, Bhagavad Gītā chapters, kāvya like the Gīta Govinda, subhāṣitas, anything in Sanskrit. Each page (a *bodhinī*) is one finished study unit with word-by-word breakdowns, meanings, metre, insights and cross-references. The site grows by one page at a time. The global roots index (*Dhātu-mañjarī*) doubles as a Sanskrit grammar study guide.

**Mood:** a palm-leaf manuscript in a lamp-lit temple. Calm, readable, made for sitting with a single shloka. It should feel traditional and reverent, not like a flashy "spiritual website", a blog, or a startup landing page.

---

## 2. Tech

- **Static site.** Use **Astro** with content collections (or Eleventy if there's a strong reason). Everything must render at build time, with no client-side data fetching needed to read a page.
- **Deploy** to **GitHub Pages** through a GitHub Actions workflow.
- **Mobile-first, but desktop must use the space well.** The main reading context is a phone during pūjā, so phones get a full-width single column. On laptops and desktops the layout must **not** be a narrow centred column with large empty margins. See §5a for the responsive layout rules.
- **Fast:** no heavy JS frameworks on content pages. A small amount of JS is fine for collapsibles and the theme toggle.
- **Light and dark mode:** follow the system setting, with a manual toggle in the header.

---

## 3. Repo layout

```
content/
  studies/
    <collection>/<slug>.md          # one study page (Markdown + YAML frontmatter)
  roots/
    <collection>/<slug>.roots.yml   # root occurrences for that study (data only)
docs/
  site-brief.md                     # this file
src/ ...                            # layouts, components, styles (your call)
public/images/                      # public-domain art only (see §8)
```

Collections so far: `devi-mahatmya`, `gita`, `stotras`. Create new collection folders as needed. Each one is a section on the home page.

---

## 4. Study page frontmatter (contract)

Every study page has this frontmatter. Build the layouts against it.

```yaml
title: "Saptaślokī Durgā"
slug: "devi-mahatmya/saptashloki-durga"
collection: "Devi Mahatmya"
theme: "devi"                 # deity colour theme key, see §6
essence: "One-line essence of the whole text."
source: "Compiled from Devī Māhātmya ch. 1, 4, 11"
deity: "Durgā"
verses: 7
metres: ["anuṣṭup", "vasantatilakā", "indravajrā"]
studied_on: 2026-10-18
tags: []
related: []                   # other study slugs
```

---

## 5. Page anatomy

### Study page
1. **Header band:** title in large serif, the essence line, and small pills for the collection, verse count, metres and date. It sits on a soft theme gradient (see §6).
2. **Overview** and **The arc**: normal prose.
3. **Preliminaries** (viniyoga and the like): same card style as the verses.
4. **Verse cards.** Each verse heading carries a stable anchor id: `v1`, `v2`… (preliminaries are `p1`, `p2`…). The roots index links straight to these anchors, so they must never change. Each card contains:
   - a small source + metre pill (e.g. *DM 11.10 · anuṣṭup*)
   - **Devanagari**: the hero of the card, large, centred, line-broken as chanted
   - **IAST** underneath, smaller, italic or muted
   - **Padaccheda** line
   - **Word table**, collapsible (open by default on desktop, collapsed on mobile). Every word in the table that has a root links to that root's page.
   - **Meaning**
   - **Context**, **Insights**, **Cross-references**, **Reading notes**, each as a labelled sub-block. Give Reading notes a distinct subtle style (a margin-note feel), because they record Kavitha's own alternate readings.
5. **Metre notes.** Render `scansion` blocks as wrapping syllable+weight units (see §5a), never as monospace pre blocks.
6. **Realizations (from Kavitha):** a warm, distinct block. Each entry is a quoted line in her own words (in double quotes), styled like a personal journal margin, not like the main text.
7. **Open threads.**
8. **Footer** with prev/next within the collection and related studies.

### 5a. Responsive layout (applies to every page)

| Width | Layout |
|---|---|
| < 640px (phone) | Single column, full width with a 16px gutter. Word tables collapsed by default; when open, each row stacks as a small card (word on top, grammar, then meaning) instead of a wide table. |
| 640–1023px (tablet) | Single column, wider cards, word tables open by default. |
| ≥ 1024px (laptop) | **Three-zone layout**: a sticky left rail with the page's table of contents (preliminaries + verse list, linking to `#p1…`, `#v1…`, highlighting the current verse on scroll), a main column, and the verse cards spreading **two-up internally** (see below). Max page width ~1280px, centred. |
| ≥ 1440px (desktop) | Same as laptop, plus a sticky **right rail** for quick context: the page's frontmatter pills (collection, metres, date), links to the Dhātu-mañjarī pages for roots in the current verse, and prev/next. Max page width ~1440px. |

**Verse cards on ≥1024px:** split each card into two columns. On the left, the Devanagari + IAST + padaccheda + meaning (the "reading" side). On the right, the word table (the "study" side). Context, Insights, Cross-references and Reading notes run full-width underneath, inside the same card.

**Other rules:**
- **One common content width.** Every section in the main column (Overview, The arc, verse cards and everything inside them: Context, Insights, Cross-references, Reading notes; Metre notes, Realizations, Open threads) spans the **full width of the main column**. No inner `max-width` / `ch` caps on prose, lists, blockquotes or callouts that leave empty space beside them. The main column itself is what's bounded (by the rails and the overall max page width).
- **Justified prose.** Running English prose (Overview, The arc, Context, Insights, Reading notes, Realizations, Open threads, list items) is `text-align: justify` with `hyphens: auto` (set `lang="en"` on the page; give IAST spans `lang="sa-Latn"` so English hyphenation rules don't break Sanskrit words). On phones (<640px) prose falls back to `text-align: left` to avoid gappy lines. **Never justify** Devanagari/IAST verse lines (keep them centred), table cells, headings, captions or scansion.
- **No scroll bars anywhere.** Nothing scrolls horizontally: not the page, not tables, not code blocks. Anything that overflows wraps onto the next line at the same width.
  - Tables: `table-layout: fixed`, width 100%, with proportional columns (word table ≈ 30% word / 30% root·grammar / 40% meaning). Every cell, **including the first (word) column**, wraps: `overflow-wrap: anywhere` plus normal wrapping at hyphens, so long compounds like `śaraṇa-āgata-dīna-ārta-paritrāṇa-parāyaṇe` break at their hyphens.
  - Code/pre blocks: `white-space: pre-wrap`. Don't use raw `<pre>` for anything that needs alignment.
  - **Scansion** is written in the Markdown as a fenced block with language `scansion`: space-separated `syllable:G` / `syllable:L` pairs, one line per pāda. Render each pair as a small inline unit (syllable on top, G/L under it, guru visually heavier) in a flex row with `flex-wrap: wrap`, so a long pāda wraps to the next line as whole syllable+weight units and never scrolls.
  - Inline metre patterns are written compactly (e.g. `GGLGLLLGLLGLGG`) and must not be letter-spaced so wide that they wrap mid-pattern.
- Home page: the study card grid goes 1 column on phones, 2 on tablets, 3 on laptops and 4 on wide desktops.
- Dhātu-mañjarī index: a multi-column list on desktop (3–4 columns, grouped by initial varṇa); root pages show occurrence groups in a 2-column grid on desktop.
- Test at 360px, 768px, 1280px and 1920px widths. No horizontal page scroll at any width.

### Home page
- **Hero section:** the site name वागर्थसङ्गमः large, then this verse as the purpose line:

  > वागर्थाविव सम्पृक्तौ वागर्थप्रतिपत्तये।
  > जगतः पितरौ वन्दे पार्वतीपरमेश्वरौ॥
  >
  > *vāgarthāv iva saṃpṛktau vāgarthapratipattaye*
  > *jagataḥ pitarau vande pārvatīparameśvarau*
  >
  > So that I may grasp words and their meanings, I bow to the parents of the world, Pārvatī and Parameśvara, who are eternally united with one another, the way a word is with its meaning.
  >
  > — Kālidāsa, Raghuvaṃśa 1.1

  Sizes: Devanagari largest, IAST smaller and muted, English smallest. The hero uses the reader's current theme with the `general` deity hue (so in Kalamkārī the title is myrobalan gold). Below the verse, **centred**, add a button labelled "पदशः · word by word →" with a one-line caption under it: *"Tap to see the word-by-word breakdown of this śloka."* It expands an inline word-by-word breakdown of this verse, rendered with the same verse-card component as study pages. Here's the content:

  | Word | Grammar | Meaning |
  |---|---|---|
  | vāgarthau | dual, vāk + artha | word and meaning |
  | iva | particle | like, as |
  | saṃpṛktau | ppp. of sam + √pṛc, dual | united, fused |
  | vāgartha-pratipattaye | dative | for the understanding of word and meaning |
  | jagataḥ | genitive sg. of jagat | of the world |
  | pitarau | dual of pitṛ | the two parents |
  | vande | 1st sg. present (ātmanepada), √vand | I bow, I salute |
  | pārvatī-parameśvarau | dual | Pārvatī and Parameśvara |

- **Dedication / preface:** below the hero, a centred heading **प्रस्तावना · Prastāvanā · Preface**, then the first paragraph of `content/pages/prastavana.md` centred, in *italics*, wrapped in “ ” quotation marks with a "पूर्णं पठतु · read in full →" link to a dedicated **प्रस्तावना · Prastāvanā · Preface** page (`/prastavana/`) that renders the whole file. Style it as a personal letter: justified on desktop, generous line height, no cards or boxes. Kavitha's lowercase style is intentional, so don't auto-capitalise.
- One section per collection, each holding a grid of study cards: title in Devanagari and IAST, essence, verse count, date, tinted with that study's deity theme.
- A link to the **Roots index**.
- Newest studies first within each section.

### Roots index: धातुमञ्जरी (`/dhatu-manjari/`, root pages at `/dhatu-manjari/<root-slug>/`)
- An alphabetical list in Sanskrit varṇa order (a ā i ī u ū ṛ … k kh g gh ṅ …), **not** English order.
- Each root shows √root, its sense, and a count of occurrences across all studies.
- Search or filter by root or meaning (a small client-side filter is fine).

### Root page (`/roots/<root-slug>/`)
- √root in Devanagari and IAST, its sense, and its gaṇa if given.
- **Every form encountered**, grouped by kind: finite verbs, participles, gerunds/infinitives, nouns/adjectives derived from it.
- Each occurrence row: the form (Devanagari + IAST), grammar label, a context snippet, and a **link to the exact verse anchor** on the study page (e.g. `/devi-mahatmya/saptashloki-durga/#v2`).
- All of this is **built automatically** at build time by aggregating every `*.roots.yml`. Root pages are never hand-edited.

---

### 5b. Motion

- **Page entrance (every page):** on load, content fades in and rises slightly (opacity 0→1, translateY 8–12px→0), staggered top to bottom (header → hero/title → first sections), about 400–600ms total, ease-out.
- **Page-to-page:** use Astro View Transitions (`<ClientRouter />` / `transition:` directives) for a soft cross-fade between pages. Shared elements (site title, a study's title from home card → study page) can morph with `transition:name`.
- **Scroll reveal:** verse cards and major sections fade/rise in gently as they enter the viewport (IntersectionObserver, once only, no re-animating on scroll back).
- **Restraint:** calm and devotional, not flashy. No bouncing, spinning, parallax or long delays; nothing over ~700ms; content must never be hidden if JS fails.
- **Accessibility:** respect `prefers-reduced-motion: reduce` by disabling all of the above (instant render).

## 6. Theming: reader themes × deity accents

`docs/theme-preview.html` (attached once) is the **visual reference** for this section. Match it.

Two independent layers:

> **The deity decides the hue, the theme decides the mood.**

1. **Reader theme** (वर्ण-पट / theme switcher, chosen by the visitor, remembered per device in `localStorage`, wrapped in try/catch): sets background, surfaces, text, borders, decorative colour, the theme's *signature* treatment, and the **lightness + chroma** of the accent.
2. **Deity accent** (from each study page's frontmatter `theme:` key, a historical name that means *deity accent*, not reader theme): sets only the accent **hue**. Pages without a deity (home, Dhātu-mañjarī, preface) use `general`, which falls back to the theme's own hue.

```css
--accent: oklch(var(--L) calc(var(--C) * var(--cmul)) var(--h));
/* dark mode, all themes: muted + pulled toward earth so accents sit like dye on cloth */
--accent: color-mix(in oklch, oklch(calc(var(--L) - .06) calc(var(--C) * var(--cmul) * .85) var(--h)) 82%, #8C8460);
```

The accent colours: site/page title, the 4px top band, section headings (except where a theme overrides), word-table word column, guru marks in scansion, and the Realizations stripe.

### 6a. Deity hues

| key | Devanagari | hue `--h` | chroma mult `--cmul` |
|---|---|---|---|
| `devi` | देवी | 25 | 1 |
| `krishna` | कृष्ण | 235 | 1 |
| `vishnu` | विष्णु | 268 | 1 |
| `shiva` | शिव | 235 | 0.25 (ash) |
| `ganesha` | गणेश | 48 | 1 |
| `lakshmi` | लक्ष्मी | 355 | 1 |
| `saraswati` | सरस्वती | 90 | 0.4 (white-gold) |
| `general` | सामान्य | theme's own `--th` | 1 |

Adding a deity later = one new row (hue + chroma multiplier). Nothing else changes.

### 6b. Reader themes (5, each with light + dark)

**Default: Kalamkārī.** All themes keep their own dark version and follow `prefers-color-scheme`, with a manual light/dark toggle. The reader's theme choice persists across modes.

| key | Name | Light | Dark | `--th` (general hue) |
|---|---|---|---|---|
| `kalamkari` | कलमकारी · Kalamkārī | cotton `#F4EEE1`, surface `#FBF7EE`, text iron-black `#1F1B18`, muted `#5E564C`, border `#DDD2BC`, decor myrobalan `#B07E14`; L .50 C .12 | iron-black cloth `#16130F`, surface `#1F1B16`, text `#E6DCC8`, muted `#A69C8A`, border `#3A332A`, decor `#C9A04A`; L .78 C .09 | 28 (**madder red**: the site title is madder gold, never blue) |
| `paurnami` | पौर्णमी · Paurṇamī | `#EEF0F5` / `#F8F9FC`, text `#141A2E`, muted `#4F5872`, border `#D3D8E5`, decor silver-blue `#7D8CAE`; L .46 C .12 | `#0B1124` / `#131C35`, text `#ECE8DA`, muted `#9AA3BD`, border `#24304F`, decor moonlight `#DCD6BE`; L .80 C .10 | 255 |
| `tadapatra` | ताडपत्र · Tāḍapatra | palm-leaf `#E8D9AE` / `#F0E4C0`, text soot `#1E1A16`, muted `#5A4E36`, border `#C9B47E`, decor `#6E521C`; L .42 C .14 | `#1C1913` / `#262118`, text `#E8D9AE`, muted `#A89A76`, border `#3A3326`, decor `#C9A75A`; L .74 C .12 | 28 |
| `kunkuma` | कुङ्कुम · Kuṅkuma | `#ECCFC6` / `#F6E3DD`, text `#280D0A`, muted `#6A3F38`, border `#D7A89C`, decor `#A01C14`; L .42 C .17 | `#1E0B0A` / `#2A1210`, text `#F6E6E2`, muted `#C49A93`, border `#45201C`, decor `#E0503F`; L .75 C .14 | 25 |
| `vrnda` | वृन्दा · Vṛndā | `#D4E4C3` / `#E5EFD8`, text `#0F1F0D`, muted `#3E5236`, border `#A9C392`, decor `#2E6B28`; L .42 C .13 | `#0A1A0E` / `#112617`, text `#E3F0DA`, muted `#97B18C`, border `#22402A`, decor `#6FCB63`; L .80 C .13 | 140 |

(Values are `bg / surface`.) Body text must meet WCAG AA (4.5:1) on its surface in every theme × mode; tune lightness if a combination fails, but keep the feel.

### 6c. Signatures: applied to **every** element of that kind, site-wide (not just one border)

- **Kalamkārī:** multicolour dye roles, **fixed regardless of deity**, with only the title and top band taking the deity hue. Headings indigo (`#263A6B` / dark `#8C9BC0`), word column madder (`#9E2B25` / `#D2704F`), grammar column leaf-green (`#3E6B35` / `#A3B272`), labels myrobalan (`#B07E14` / `#C9A04A`), guru marks indigo, laghu marks madder. Cards have a **printed band border** (nested 1px iron · gap · madder · gap · indigo rings, via box-shadow). Dividers are a **four-dye rule** (indigo | madder | myrobalan | leaf). Headings get a madder underline. Dark mode uses earthy, muted dyes (above), never saturated "scrapbook" colours.
- **Paurṇamī:** a moon-glow halo behind the site/page title, a soft radial moonlight from the top of the page, a silver rule with faint glow, and a soft halo shadow on cards.
- **Tāḍapatra:** ruled leaf lines on cards and Realizations (horizontal lines only), a **double left margin** rule, **leaf-ended cards** (`border-radius: 4px 40px 40px 4px`), ink-underlined headings, and a short centred solid rule.
- **Kuṅkuma:** **tilaka bars**: a thick 6px decor bar on the left of section headings and Realizations, and a 4px decor top edge on every card.
- **Vṛndā:** **leaf-cut corners** on cards and Realizations (`22px 3px 22px 3px`), a **vine rule** (an inline-SVG wave line, stroke only) for dividers, and a green left bar on headings.

### 6d. Dark-mode glows (dark only, static, subtle)

- **Paurṇamī:** cool moonlight from above, and a faint silver text-shadow on the title.
- **Kalamkārī:** the four dyes bleed softly in from the four corners (≈8–10% opacity radial gradients), and the title gets a faint glow.
- **Tāḍapatra:** a warm **dīpa (oil-lamp) glow** low beneath the page and cards, with an amber title glow.
- **Kuṅkuma:** ember warmth from the top-left, and the cards' top edges glow.
- **Vṛndā:** green moonlight through a canopy from the top, and the vine rule glows softly.

No animation on the glows. Respect the §8 hard rule: no dot, bubble or speckle textures. Glows are smooth gradients only.

### 6e. Theme switcher UI

A small control in the header: the 5 theme names (Devanagari + English gloss) plus a light/dark toggle. Each option shows a tiny swatch of that theme. The choice persists via `localStorage` and is applied before first paint (inline script in `<head>`) to avoid a flash.

---

## 7. Typography

- **Devanagari:** **Tiro Devanagari Sanskrit** (Google Fonts) everywhere: headings, verse cards, nav, labels. It was designed for Sanskrit, with classical conjuncts (क्र renders clearly, not like त्र). **Self-host it** (e.g. `@fontsource/tiro-devanagari-sanskrit`, bundled with the site) so it never depends on Google being reachable, with `font-display: swap`. Font stack: `'Tiro Devanagari Sanskrit', 'Noto Serif Devanagari', serif`. Sans Devanagari is a last resort only: text must still render if the web fonts fail, but it should never be *chosen* over the serif fonts in CSS. Large on verse cards, generous line height.
- **IAST / headings:** a serif with full diacritic support. Check that ā ī ū ṛ ṝ ḷ ṅ ñ ṭ ḍ ṇ ś ṣ ṃ ḥ all render correctly (e.g. Noto Serif, EB Garamond, or Gentium).
- **Notes / UI:** a quiet humanist sans (e.g. Noto Sans or Inter).
- **Scansion:** a monospace font.

---

## 8. Decoration and images

- **Decoration:** thin temple-border rules, simple single-line motifs used sparingly (a lamp, a single lotus in side profile, a flute for Krishna pages, a trident for Shiva pages). Use inline SVG and keep it spacious and minimal.
- **HARD RULE: no clustered dot, hole, bubble or grid-of-small-circles patterns or textures anywhere.** That includes dot-grid motifs and halftone or speckle textures. This is a personal requirement, so it is not negotiable.
- **Images:** only **public-domain** traditional art (e.g. Raja Ravi Varma, older Indian miniature paintings from Wikimedia Commons), with an attribution caption. No modern devotional art, stock images or AI-generated deity images. Images are optional and used sparingly, at most one per study page in the header area if one fits.

---

## 9. Content rules

- **No Hindi anywhere.** Sanskrit (Devanagari + IAST) and English only.
- Don't rewrite or "improve" study content. Render the Markdown as given.
- Preserve all diacritics exactly.
- **Smart quotes stay OFF** (`markdown.smartypants: false` in `astro.config.mjs`). Text renders exactly as typed. Reason: smartypants turns the IAST avagraha in *namo 'stu te* / *pañcadaśo 'dhyāyaḥ* into an opening quote (‘), which is wrong. Curly quotes are written directly in the source where wanted.

---

## 10. Definition of done (scaffold)

- [ ] Astro (or Eleventy) site builds and deploys to GitHub Pages via Actions
- [ ] Home page, study page layout, roots index and root page template all work
- [ ] All 8 deity themes, light + dark, plus a header toggle
- [ ] Verse anchors (`#v1`…) work and root pages link to them correctly
- [ ] `*.roots.yml` files aggregate automatically into root pages at build time
- [ ] Looks good on a phone at 360px width with no horizontal scroll
- [ ] First study page (Saptaślokī Durgā) renders correctly as the test case

---

## 11. Design debt (revisit later)

- **Palette:** resolved by the §6 theme system (5 reader themes × deity hues).