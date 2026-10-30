// Reshapes a bodhinī's flat Markdown HTML into the page anatomy of docs/site-brief.md §5:
//   - every `## Heading` becomes <section class="sec sec-<heading>">
//   - under "Verses" / "Preliminaries", every `### … {#vN}` becomes a verse card
//   - inside a card: source/metre pill, Devanagari, IAST, padaccheda, collapsible word table,
//     and labelled sub-blocks (Meaning, Context, Insights, Cross-references, Reading notes …)
//   - word-table words that have a root link to /dhatu-manjari/<root-slug>/
// Content itself is never rewritten; only wrapped and classed.
import path from 'node:path';
import { iastToSlug, normForm, rootLinksForStudy } from '../lib/roots.mjs';

const DEVANAGARI = /[ऀ-ॿ]/;
const CARD_SECTIONS = new Set(['verses', 'preliminaries']);
const BODHAH = 'बोधाः';
// No \b after ḥ: outside Unicode mode it is not a word character, so \b never matches there.
const isBodhah = (s) => s.trim().startsWith(BODHAH) || /^bodh[aā][hḥ](?![a-z])/i.test(s.trim().normalize('NFC'));

const el = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const txt = (value) => ({ type: 'text', value });

function toText(node) {
  if (node.type === 'text') return node.value;
  return (node.children || []).map(toText).join('');
}
const isBlank = (n) => n.type === 'text' && !n.value.trim();
const kebab = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** "**Meaning:** text" → "Meaning" (and strips the label from the paragraph). */
function takeLabel(p) {
  const kids = p.children.filter((c) => !isBlank(c));
  const first = kids[0];
  if (!first || first.type !== 'element' || first.tagName !== 'strong') return null;
  let label = toText(first).trim();
  const idx = p.children.indexOf(first);
  const next = p.children[idx + 1];
  if (label.endsWith(':')) label = label.slice(0, -1).trim();
  else if (next?.type === 'text' && next.value.startsWith(':')) next.value = next.value.slice(1);
  else return null;
  p.children.splice(0, idx + 1);
  if (p.children[0]?.type === 'text') p.children[0].value = p.children[0].value.replace(/^\s+/, '');
  return label;
}

function splitBy(children, tagName) {
  const groups = [];
  let cur = { head: null, body: [] };
  for (const n of children) {
    if (n.type === 'element' && n.tagName === tagName) {
      groups.push(cur);
      cur = { head: n, body: [] };
    } else cur.body.push(n);
  }
  groups.push(cur);
  return groups;
}

function linkWordTable(table, anchor, links, base) {
  const tbody = table.children.find((c) => c.tagName === 'tbody');
  if (!tbody) return;
  for (const tr of tbody.children.filter((c) => c.tagName === 'tr')) {
    const cells = tr.children.filter((c) => c.tagName === 'td');
    if (cells.length < 2) continue;
    const form = toText(cells[0]).trim();
    const gram = toText(cells[1]);
    let slug = links.byFormAnchor.get(`${anchor}|${normForm(form)}`);
    const m = gram.match(/√\s*([^\s·,;()|/]+)/);
    if (!slug && m) slug = links.byRoot.get(normForm(m[1]));
    if (!slug && m && links.all.has(iastToSlug(m[1]))) slug = iastToSlug(m[1]);
    if (!slug) continue;
    cells[0].children = [
      el('a', { href: `${base}/dhatu-manjari/${slug}/`, title: m ? `√${m[1]}` : undefined }, cells[0].children),
    ];
  }
}

/** Copy each column header onto its cells, so phones can show rows as stacked cards. */
function labelCells(table) {
  const thead = table.children.find((c) => c.tagName === 'thead');
  const tbody = table.children.find((c) => c.tagName === 'tbody');
  if (!thead || !tbody) return;
  const headRow = thead.children.find((c) => c.tagName === 'tr');
  const labels = (headRow?.children || []).filter((c) => c.tagName === 'th').map((th) => toText(th).trim());
  for (const tr of tbody.children.filter((c) => c.tagName === 'tr')) {
    tr.children.filter((c) => c.tagName === 'td').forEach((td, i) => {
      td.properties = { ...td.properties, dataLabel: labels[i] || '' };
    });
  }
}

function buildCard(h3, body, links, base) {
  const anchor = h3.properties?.id;
  const out = [h3];
  let inHead = true;
  let block = null;
  let bodhah = null;

  for (const n of body) {
    if (isBlank(n)) continue;
    if (n.type === 'element' && n.tagName === 'p') {
      const label = takeLabel(n);
      // "**बोधाः:** [1](#r1), …" sits on the title row, far right, in parentheses; the links speak for themselves, so no label.
      if (label && isBodhah(label)) {
        bodhah = el('p', { className: ['vc-bodhah'] }, [txt('('), ...n.children, txt(')')]);
        continue;
      }
      if (label && /^padaccheda$/i.test(label)) {
        inHead = false;
        block = null;
        n.properties = { ...n.properties, className: ['vc-padaccheda'] };
        n.children.unshift(el('span', { className: ['vc-label'] }, [txt(`${label} · word split`)]));
        out.push(n);
        continue;
      }
      if (label) {
        inHead = false;
        block = el('div', { className: ['vc-block', `vc-${kebab(label)}`] }, [
          el('span', { className: ['vc-label'] }, [txt(label)]),
        ]);
        if (n.children.some((c) => !isBlank(c))) block.children.push(n);
        out.push(block);
        continue;
      }
      if (inHead) {
        const kids = n.children.filter((c) => !isBlank(c));
        const t = toText(n).trim();
        if (kids.length === 1 && kids[0].tagName === 'em' && /^(source|metre|meter)\b/i.test(t)) {
          const clean = t.replace(/\b(source|metre|meter)\s*:\s*/gi, '');
          out.push(el('p', { className: ['vc-pill'] }, [el('span', { className: ['pill'] }, [txt(clean)])]));
        } else if (DEVANAGARI.test(t)) {
          n.properties = { ...n.properties, className: ['vc-deva'], lang: 'sa' };
          out.push(n);
        } else {
          n.properties = { ...n.properties, className: ['vc-iast'], lang: 'sa-Latn' };
          out.push(n);
        }
        continue;
      }
    }
    if (n.type === 'element' && n.tagName === 'table') {
      inHead = false;
      block = null;
      if (anchor) linkWordTable(n, anchor, links, base);
      labelCells(n);
      out.push(
        el('details', { className: ['vc-words'], open: true }, [
          el('summary', {}, [
            el('span', { className: ['deva'], lang: 'sa' }, [txt('पदशः')]),
            el('span', { className: ['muted'] }, [txt('word by word')]),
          ]),
          el('div', { className: ['table-wrap'] }, [n]),
        ]),
      );
      continue;
    }
    if (block) block.children.push(n);
    else out.push(n);
  }
  // Group into the "reading" side (pill, Devanagari, IAST, padaccheda, meaning) beside the
  // "study" side (word table), then the notes full-width below (brief §5a).
  // Phones stack them; ≥1024px puts reading and study side by side.
  const cls = (n) => n.properties?.className || [];
  const text = [], words = [], notes = [];
  for (const n of out.slice(1)) {
    if (cls(n).includes('vc-words')) words.push(n);
    else if (['vc-pill', 'vc-deva', 'vc-iast', 'vc-padaccheda', 'vc-meaning'].some((c) => cls(n).includes(c))) text.push(n);
    else if (!words.length && !notes.length && !cls(n).includes('vc-block')) text.push(n);
    else notes.push(n);
  }
  const top = el('div', { className: ['vc-top', words.length ? 'has-words' : 'no-words'] }, [
    el('div', { className: ['vc-text'] }, text),
    ...words,
  ]);
  const children = [bodhah ? el('div', { className: ['vc-head'] }, [out[0], bodhah]) : out[0], top];
  if (notes.length) children.push(el('div', { className: ['vc-notes'] }, notes));
  return el('article', { className: ['verse-card'] }, children);
}

// An entry already opens with a quote, optionally after its number and verse note: `1. (on v. 1) “…`.
const OPEN_QUOTE = /^\s*(\d+\.\s*)?(\([^)]*\)\s*)?["“‘']/;

/** Bodhāḥ are Kavitha's own words: put every entry in double quotes. */
function quoteEntries(nodes) {
  for (const n of nodes) {
    if (n.type !== 'element') continue;
    const hasBlockKids = (n.children || []).some((c) => c.tagName === 'p' || c.tagName === 'ul' || c.tagName === 'ol');
    if ((n.tagName === 'p' || n.tagName === 'li') && !hasBlockKids) {
      if (!OPEN_QUOTE.test(toText(n))) {
        n.children.unshift(txt('“'));
        n.children.push(txt('”'));
      }
      n.properties = { ...n.properties, className: [...(n.properties?.className || []), 'quoted'] };
    } else if (n.children) quoteEntries(n.children);
  }
}

// IAST in running English prose gets lang="sa-Latn", so English hyphenation (justified prose)
// never splits a Sanskrit word. Detected by its diacritics: an italic phrase containing any is
// tagged whole; elsewhere each diacritic-bearing word is wrapped in its own span.
const IAST_MARK = /[āīūṛṝḷḹṅñṭḍṇśṣṃṁḥĀĪŪṚṜḶḸṄÑṬḌṆŚṢṂḤ]/;
const WORD = /[A-Za-zÀ-ɏḀ-ỿ’'-]+/g;
const SKIP_TAGS = new Set(['pre', 'code', 'script', 'style', 'svg']);

function markIast(nodes) {
  for (const n of nodes) {
    if (n.type !== 'element' || SKIP_TAGS.has(n.tagName) || n.properties?.lang) continue;
    if ((n.tagName === 'em' || n.tagName === 'i') && IAST_MARK.test(toText(n))) {
      n.properties = { ...n.properties, lang: 'sa-Latn' };
      continue;
    }
    const next = [];
    for (const c of n.children || []) {
      if (c.type !== 'text' || !IAST_MARK.test(c.value)) {
        next.push(c);
        continue;
      }
      let last = 0;
      for (const m of c.value.matchAll(WORD)) {
        if (!IAST_MARK.test(m[0])) continue;
        if (m.index > last) next.push(txt(c.value.slice(last, m.index)));
        next.push(el('span', { lang: 'sa-Latn' }, [txt(m[0])]));
        last = m.index + m[0].length;
      }
      if (last < c.value.length) next.push(txt(c.value.slice(last)));
    }
    n.children = next;
    markIast(n.children);
  }
}

export default function rehypeBodhini({ base = '' } = {}) {
  base = base.replace(/\/$/, '');
  return (tree, file) => {
    const fm = file.data?.astro?.frontmatter || {};
    const studiesDir = path.resolve(process.cwd(), 'content/studies');
    const study =
      fm.slug ||
      (file.path ? path.relative(studiesDir, file.path).replace(/\\/g, '/').replace(/\.md$/, '') : '');
    const links = rootLinksForStudy(study);

    const [lead, ...sections] = splitBy(tree.children, 'h2');
    const out = [...lead.body];
    for (const { head, body } of sections) {
      let key = kebab(toText(head));
      // बोधाः (Bodhāḥ, "Awakenings"): Kavitha's own words. Older pages may still say "Realizations".
      if (isBodhah(toText(head)) || key.startsWith('realizations')) key = 'bodhah';
      let content = body;
      if (CARD_SECTIONS.has(key)) {
        const [loose, ...cards] = splitBy(body, 'h3');
        content = [...loose.body, ...cards.map(({ head: h3, body: b }) => buildCard(h3, b, links, base))];
      }
      if (key === 'bodhah') {
        head.children = [
          el('span', { lang: 'sa' }, [txt(BODHAH)]),
          txt(' '),
          el('span', { className: ['h-sub'] }, [txt('(from Kavitha)')]),
        ];
        quoteEntries(content);
      }
      out.push(el('section', { className: ['sec', `sec-${key}`] }, [head, ...content]));
    }

    markIast(out);

    tree.children = out;
  };
}
