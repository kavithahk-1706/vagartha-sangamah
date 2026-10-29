// Turns `### 1. jñāninām api {#v1}` into a heading with id="v1" (Pandoc-style attribute).
// Verse anchors (#v1…, #p1…) are linked from root pages, so they must come from the source, not be generated.
// Paragraphs take the same trailing attribute, or one right after a leading bold number,
// as in a बोधाः (Bodhāḥ) entry: `> **1.** {#r1} (on [v. 1](#v1)) “…”`.
const ID_RE = /\s*\{#([A-Za-z0-9_-]+)\}\s*$/;
const LEAD_ID_RE = /^\s*\{#([A-Za-z0-9_-]+)\}/;

function setId(node, id) {
  node.data ??= {};
  node.data.hProperties = { ...(node.data.hProperties || {}), id };
}

function walk(node, fn) {
  fn(node);
  if (node.children) for (const c of node.children) walk(c, fn);
}

export default function remarkHeadingIds() {
  return (tree) => {
    walk(tree, (node) => {
      if ((node.type !== 'heading' && node.type !== 'paragraph') || !node.children?.length) return;
      const [first, second] = node.children;
      if (node.type === 'paragraph' && first.type === 'strong' && second?.type === 'text') {
        const lead = second.value.match(LEAD_ID_RE);
        if (lead) {
          second.value = second.value.replace(LEAD_ID_RE, '');
          setId(node, lead[1]);
          return;
        }
      }
      const last = node.children[node.children.length - 1];
      if (last.type !== 'text') return;
      const m = last.value.match(ID_RE);
      if (!m) return;
      last.value = last.value.replace(ID_RE, '');
      setId(node, m[1]);
    });
  };
}
