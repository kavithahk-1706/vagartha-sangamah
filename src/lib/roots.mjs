// Build-time aggregation of content/roots/**/*.roots.yml into the Dhātu-mañjarī.
// Plain ESM so both astro.config (markdown plugins) and pages can use it.
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

const ROOTS_DIR = path.resolve(process.cwd(), 'content/roots');
const STUDIES_DIR = path.resolve(process.cwd(), 'content/studies');

function listFiles(dir, suffix) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(suffix))
    .map((d) => path.join(d.parentPath ?? d.path, d.name))
    .sort();
}

/** Every roots file: { file, study, entries[] } */
export function loadRootFiles() {
  return listFiles(ROOTS_DIR, '.roots.yml').map((file) => {
    const data = yamlLoad(fs.readFileSync(file, 'utf8')) ?? {};
    const rel = path.relative(ROOTS_DIR, file).replace(/\\/g, '/').replace(/\.roots\.yml$/, '');
    return { file, study: data.study || rel, entries: data.entries || [] };
  });
}

/** Every study page: slug -> { title, title_devanagari, anchors:Set } (read straight from disk) */
export function loadStudyIndex() {
  const index = new Map();
  for (const file of listFiles(STUDIES_DIR, '.md')) {
    const src = fs.readFileSync(file, 'utf8');
    const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const data = fm ? yamlLoad(fm[1]) ?? {} : {};
    const rel = path.relative(STUDIES_DIR, file).replace(/\\/g, '/').replace(/\.md$/, '');
    const anchors = new Set([...src.matchAll(/\{#([\w-]+)\}/g)].map((m) => m[1]));
    index.set(data.slug || rel, { title: data.title, title_devanagari: data.title_devanagari, anchors });
  }
  return index;
}

// ── IAST → slug (same rules as the scripture-study-page skill) ──
const SLUG_MAP = [
  ['ṝ', 'rii'], ['ṛ', 'ri'], ['ḹ', 'lrii'], ['ḷ', 'lri'],
  ['ā', 'aa'], ['ī', 'ii'], ['ū', 'uu'],
  ['ṅ', 'ng'], ['ñ', 'ny'], ['ṭ', 'tt'], ['ḍ', 'dd'], ['ṇ', 'nn'],
  ['ś', 'sh'], ['ṣ', 'ss'], ['ṃ', 'm'], ['ṁ', 'm'], ['ḥ', 'h'],
];
export function iastToSlug(s) {
  let out = s.normalize('NFC').toLowerCase().replace(/√/g, '').trim();
  for (const [a, b] of SLUG_MAP) out = out.split(a).join(b);
  return out.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Sanskrit varṇa order ──
export const VARNAS = [
  'a', 'ā', 'i', 'ī', 'u', 'ū', 'ṛ', 'ṝ', 'ḷ', 'ḹ', 'e', 'ai', 'o', 'au', 'ṃ', 'ḥ',
  'k', 'kh', 'g', 'gh', 'ṅ', 'c', 'ch', 'j', 'jh', 'ñ',
  'ṭ', 'ṭh', 'ḍ', 'ḍh', 'ṇ', 't', 'th', 'd', 'dh', 'n',
  'p', 'ph', 'b', 'bh', 'm', 'y', 'r', 'l', 'v', 'ś', 'ṣ', 's', 'h',
];
const VARNA_DEVA = {
  a: 'अ', ā: 'आ', i: 'इ', ī: 'ई', u: 'उ', ū: 'ऊ', ṛ: 'ऋ', ṝ: 'ॠ', ḷ: 'ऌ', ḹ: 'ॡ',
  e: 'ए', ai: 'ऐ', o: 'ओ', au: 'औ', k: 'क', kh: 'ख', g: 'ग', gh: 'घ', ṅ: 'ङ',
  c: 'च', ch: 'छ', j: 'ज', jh: 'झ', ñ: 'ञ', ṭ: 'ट', ṭh: 'ठ', ḍ: 'ड', ḍh: 'ढ', ṇ: 'ण',
  t: 'त', th: 'थ', d: 'द', dh: 'ध', n: 'न', p: 'प', ph: 'फ', b: 'ब', bh: 'भ', m: 'म',
  y: 'य', r: 'र', l: 'ल', v: 'व', ś: 'श', ṣ: 'ष', s: 'स', h: 'ह',
};
const RANK = new Map(VARNAS.map((v, i) => [v, i]));

export function varnaTokens(iast) {
  const s = iast.normalize('NFC').toLowerCase().replace(/ṁ/g, 'ṃ').replace(/[^a-zāīūṛṝḷḹṃḥṅñṭḍṇśṣ]/g, '');
  const out = [];
  for (let i = 0; i < s.length; ) {
    const two = s.slice(i, i + 2);
    if (RANK.has(two)) { out.push(two); i += 2; }
    else { out.push(s[i]); i += 1; }
  }
  return out;
}

export function compareVarna(a, b) {
  const ta = varnaTokens(a), tb = varnaTokens(b);
  for (let i = 0; i < Math.min(ta.length, tb.length); i++) {
    const d = (RANK.get(ta[i]) ?? 999) - (RANK.get(tb[i]) ?? 999);
    if (d) return d;
  }
  return ta.length - tb.length;
}

export function firstVarna(iast) {
  const t = varnaTokens(iast)[0] || '';
  return { iast: t, deva: VARNA_DEVA[t] || t };
}

/**
 * Aggregate all roots files into one record per root slug.
 * Throws when a roots entry points at a study or verse anchor that does not exist,
 * so a broken link from a root page fails the build.
 */
export function aggregateRoots() {
  const studies = loadStudyIndex();
  const roots = new Map();
  const problems = [];

  for (const { file, study, entries } of loadRootFiles()) {
    const info = studies.get(study);
    if (!info) problems.push(`${path.basename(file)}: study "${study}" has no page in content/studies`);
    for (const e of entries) {
      const slug = e.slug || iastToSlug(e.root || '');
      if (!slug) { problems.push(`${path.basename(file)}: entry without root/slug (${e.form})`); continue; }
      if (info && e.anchor && !info.anchors.has(e.anchor)) {
        problems.push(`${path.basename(file)}: "${e.form}" → #${e.anchor} not found in ${study}`);
      }
      let r = roots.get(slug);
      if (!r) {
        r = { slug, root: e.root, root_devanagari: e.root_devanagari, sense: e.sense, gana: e.gana, occurrences: [] };
        roots.set(slug, r);
      } else {
        if (e.sense && r.sense && e.sense !== r.sense) {
          console.warn(`[dhatu-manjari] √${slug}: differing senses "${r.sense}" vs "${e.sense}" (${path.basename(file)})`);
        }
        r.sense ||= e.sense;
        r.gana ??= e.gana;
        r.root_devanagari ||= e.root_devanagari;
      }
      r.occurrences.push({
        ...e,
        slug,
        study,
        studyTitle: info?.title,
        studyTitleDeva: info?.title_devanagari,
      });
    }
  }

  if (problems.length) {
    throw new Error(`[dhatu-manjari] Broken root links:\n  - ${problems.join('\n  - ')}`);
  }
  return [...roots.values()].sort((a, b) => compareVarna(a.root || a.slug, b.root || b.slug));
}

/** Lookup used by the markdown plugin to link word-table rows to root pages. */
export function rootLinksForStudy(study) {
  const byFormAnchor = new Map();
  const byRoot = new Map();
  const all = new Set();
  for (const f of loadRootFiles()) {
    for (const e of f.entries) {
      const slug = e.slug || iastToSlug(e.root || '');
      all.add(slug);
      if (f.study !== study) continue;
      if (e.form) byFormAnchor.set(`${e.anchor}|${normForm(e.form)}`, slug);
      if (e.root) byRoot.set(normForm(e.root), slug);
    }
  }
  return { byFormAnchor, byRoot, all };
}

export function normForm(s) {
  return String(s).normalize('NFC').toLowerCase().replace(/[√\s*_]/g, '');
}
