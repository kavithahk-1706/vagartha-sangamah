// Scansion (brief §5a):
//   ```scansion
//   dur:G ge:G smṛ:L tā:G …      ← one line per pāda
//   ```
// becomes rows of wrapping syllable+weight units (syllable on top, G/L beneath),
// so a long pāda wraps as whole units and never scrolls.
// Also tags inline metre patterns like `GGLGLLLGLLGLGG` so they stay unbroken and tightly set.
const PATTERN = /^[GL\s|·-]+$/;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function walk(node, fn, parent = null, index = 0) {
  fn(node, parent, index);
  if (node.children) node.children.forEach((c, i) => walk(c, fn, node, i));
}

function renderScansion(src) {
  const rows = src
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const units = line.split(/\s+/).map((pair) => {
        const m = pair.match(/^(.*):([GLgl])$/);
        if (!m) return `<span class="syl"><span class="s">${esc(pair)}</span><span class="w"></span></span>`;
        const w = m[2].toUpperCase();
        const name = w === 'G' ? 'guru' : 'laghu';
        return `<span class="syl ${name}" title="${name}"><span class="s">${esc(m[1])}</span><span class="w">${w}</span></span>`;
      });
      return `<div class="scan-row">${units.join('')}</div>`;
    });
  return `<div class="scansion" lang="sa-Latn">${rows.join('')}</div>`;
}

export default function remarkScansion() {
  return (tree) => {
    walk(tree, (node, parent, index) => {
      if (node.type === 'code' && node.lang === 'scansion' && parent) {
        parent.children[index] = { type: 'html', value: renderScansion(node.value) };
      } else if (node.type === 'inlineCode' && PATTERN.test(node.value) && /[GL]{3,}/.test(node.value)) {
        node.data = { ...(node.data || {}), hProperties: { className: ['metre-pattern'] } };
      }
    });
  };
}
