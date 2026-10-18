// Turns `### 1. jñāninām api {#v1}` into a heading with id="v1" (Pandoc-style attribute).
// Verse anchors (#v1…, #p1…) are linked from root pages, so they must come from the source, not be generated.
const ID_RE = /\s*\{#([A-Za-z0-9_-]+)\}\s*$/;

function walk(node, fn) {
  fn(node);
  if (node.children) for (const c of node.children) walk(c, fn);
}

export default function remarkHeadingIds() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'heading' || !node.children?.length) return;
      const last = node.children[node.children.length - 1];
      if (last.type !== 'text') return;
      const m = last.value.match(ID_RE);
      if (!m) return;
      last.value = last.value.replace(ID_RE, '');
      node.data ??= {};
      node.data.hProperties = { ...(node.data.hProperties || {}), id: m[1] };
    });
  };
}
