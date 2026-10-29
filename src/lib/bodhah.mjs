// Build-time aggregation of every bodhinī's बोधाः section into the Bodha-mañjarī.
// No data file: the entries are read straight from content/studies/**/*.md.
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';
import { listFiles } from './roots.mjs';

const STUDIES_DIR = path.resolve(process.cwd(), 'content/studies');

// Same test as rehype-bodhini: `## बोधाः (from Kavitha) {#bodhah}`; older pages may say "Realizations".
// (No \b after ḥ: outside Unicode mode it is not a word character.)
const BODHAH_HEAD = /^##\s+(बोधाः|bodh[aā][hḥ](?![a-z])|realizations\b)/i;
const ANCHOR_ATTR = /\s*\{#([A-Za-z0-9_-]+)\}/;

/** Split the बोधाः section into blockquotes, each one bodha (consecutive `>` lines). */
function blockquotes(lines) {
  const out = [];
  let cur = null;
  for (const line of lines) {
    if (/^\s*>/.test(line)) {
      cur ??= [];
      cur.push(line.replace(/^\s*>\s?/, ''));
    } else if (cur) {
      out.push(cur);
      cur = null;
    }
  }
  if (cur) out.push(cur);
  // Paragraphs inside one quote are separated by bare `>` lines.
  return out.map((q) =>
    q.join('\n').split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean)
  );
}

/** A leading `(on …)` note, allowing nested parentheses. Returns [note, rest] or [null, s]. */
function leadingParen(s) {
  if (!s.startsWith('(')) return [null, s];
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0) return [s.slice(1, i).trim(), s.slice(i + 1).trim()];
  }
  return [null, s];
}

/** `**1.** {#r1} (on [v. 1](#v1)) “…”` → { number, anchor, on, paragraphs } */
function parseEntry(paragraphs) {
  let [first, ...rest] = paragraphs;
  let number = null;
  let anchor = null;
  const num = first.match(/^\*\*\s*(\d+)\.?\s*\*\*\s*/);
  if (num) {
    number = Number(num[1]);
    first = first.slice(num[0].length);
  }
  const id = first.match(/^\{#([A-Za-z0-9_-]+)\}\s*/) || first.match(/\s*\{#([A-Za-z0-9_-]+)\}\s*$/);
  if (id) {
    anchor = id[1];
    first = first.replace(id[0], ' ').trim();
  }
  const [on, body] = leadingParen(first);
  return { number, anchor, on: on?.replace(/^on\s+/i, '') ?? null, paragraphs: [body, ...rest].filter(Boolean) };
}

/** Every `](#id)` target in a Markdown string. */
function localLinks(s) {
  return [...String(s).matchAll(/\]\(#([A-Za-z0-9_-]+)\)/g)].map((m) => m[1]);
}

/**
 * One record per bodhinī that has a बोधाः section, newest study first:
 * { study, title, title_devanagari, studied_on, sectionId, entries[] }.
 * Throws when an entry's own anchor or a verse link points at an id the study does not have.
 */
export function aggregateBodhah() {
  const studies = [];
  const problems = [];

  for (const file of listFiles(STUDIES_DIR, '.md')) {
    const src = fs.readFileSync(file, 'utf8');
    const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const data = fm ? yamlLoad(fm[1]) ?? {} : {};
    const rel = path.relative(STUDIES_DIR, file).replace(/\\/g, '/').replace(/\.md$/, '');
    const study = data.slug || rel;
    const name = path.basename(file);

    const lines = src.normalize('NFC').split(/\r?\n/);
    const start = lines.findIndex((l) => BODHAH_HEAD.test(l));
    if (start === -1) continue;
    let end = lines.findIndex((l, i) => i > start && /^#{1,2}\s/.test(l));
    if (end === -1) end = lines.length;

    // Only an explicit `{#…}` on the heading is a stable target; otherwise link to the page itself.
    const sectionId = lines[start].match(ANCHOR_ATTR)?.[1] ?? null;
    const anchors = new Set([...src.matchAll(/\{#([\w-]+)\}/g)].map((m) => m[1]));
    const entries = blockquotes(lines.slice(start + 1, end)).map(parseEntry);

    // Each bodha's own page lives at /bodha-manjari/<study>/<n>/: its written number, else its position.
    const seen = new Set();
    entries.forEach((e, i) => {
      e.n = e.number ?? i + 1;
      if (seen.has(e.n)) problems.push(`${name}: two bodhāḥ numbered ${e.n}`);
      seen.add(e.n);
    });

    for (const e of entries) {
      if (e.anchor && !anchors.has(e.anchor)) problems.push(`${name}: bodha #${e.anchor} has no anchor`);
      for (const id of [...localLinks(e.on), ...e.paragraphs.flatMap(localLinks)]) {
        if (!anchors.has(id)) problems.push(`${name}: bodha ${e.number ?? '?'} links to #${id}, not found in ${study}`);
      }
    }
    if (!entries.length) continue;

    studies.push({
      study,
      title: data.title,
      title_devanagari: data.title_devanagari,
      text_name: data.text_name,
      text_name_devanagari: data.text_name_devanagari,
      source: data.source,
      essence: data.essence,
      theme: data.theme,
      collection: data.collection,
      studied_on: data.studied_on ? new Date(data.studied_on) : null,
      sectionId,
      entries,
    });
  }

  if (problems.length) {
    throw new Error(`[bodha-manjari] Broken bodha links:\n  - ${problems.join('\n  - ')}`);
  }
  return studies.sort((a, b) => (b.studied_on?.getTime() ?? 0) - (a.studied_on?.getTime() ?? 0));
}

/** Site-relative path of a bodhinī's bodhāḥ page (all its bodhāḥ in one grid). */
export function bodhiniPath(study) {
  return `bodha-manjari/${study}/`;
}

/** Site-relative path of a bodha's own page. */
export function bodhaPath(study, entry) {
  return `bodha-manjari/${study}/${entry.n}/`;
}

/** Where a bodha sits on its study page: its own anchor, else the बोधाः section, else the page. */
export function bodhaAnchor(s, entry) {
  return entry.anchor ? `#${entry.anchor}` : s.sectionId ? `#${s.sectionId}` : '';
}

// Bodhāḥ are Kavitha's own words: quote any entry that doesn't already open with a quote mark.
const OPEN_QUOTE = /^["“‘']/;
const CLOSE_QUOTE = /["”’']\s*$/;
export function quoted(paras) {
  if (!paras.length || OPEN_QUOTE.test(paras[0])) return paras;
  const out = [...paras];
  out[0] = `“${out[0]}`;
  if (!CLOSE_QUOTE.test(out.at(-1))) out[out.length - 1] += '”';
  return out;
}

/** A bodha line as plain text: link text kept, emphasis marks dropped. */
export function plainText(md) {
  return String(md)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*?([^*]+)\*\*?/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The first ~`max` characters of a bodha, cut at a word, without its quote marks. */
export function preview(paragraphs, max = 60) {
  const s = plainText(paragraphs.join(' ')).replace(/^["“‘']/, '');
  if (s.length <= max) return s.replace(/["”’']$/, '');
  const cut = s.slice(0, max + 1);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : s.slice(0, max)).replace(/[\s,;:.—-]+$/, '')}…`;
}

// ── Inline Markdown for a bodha: links, **bold**, *italic*. Bodhāḥ use nothing else. ──
const IAST_MARK = /[āīūṛṝḷḹṅñṭḍṇśṣṃṁḥĀĪŪṚṜḶḸṄÑṬḌṆŚṢṂḤ]/;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Render one line of a bodha to HTML. `#id` links are rewritten to `studyHref#id`, so every
 * verse link lands on the study page. Italic IAST gets lang="sa-Latn" (as on the study page).
 */
export function inlineHtml(md, studyHref) {
  let s = esc(md);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    const target = href.startsWith('#') ? `${studyHref}${href}` : href;
    return `<a href="${target}">${text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, (_, t) => (IAST_MARK.test(t) ? `<em lang="sa-Latn">${t}</em>` : `<em>${t}</em>`));
  return s;
}
