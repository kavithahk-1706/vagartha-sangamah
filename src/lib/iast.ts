// Split plain text into runs, marking words that carry IAST diacritics so they can be
// wrapped in lang="sa-Latn" (keeps English hyphenation off Sanskrit). Mirrors markIast()
// in src/plugins/rehype-bodhini.mjs, for text rendered outside Markdown.
const IAST_MARK = /[āīūṛṝḷḹṅñṭḍṇśṣṃṁḥĀĪŪṚṜḶḸṄÑṬḌṆŚṢṂḤ]/;
const WORD = /[A-Za-zÀ-ɏḀ-ỿ’'-]+/g;

export function iastSegments(text: string): { text: string; sa: boolean }[] {
  const out: { text: string; sa: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(WORD)) {
    if (!IAST_MARK.test(m[0])) continue;
    if (m.index! > last) out.push({ text: text.slice(last, m.index), sa: false });
    out.push({ text: m[0], sa: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), sa: false });
  return out;
}
