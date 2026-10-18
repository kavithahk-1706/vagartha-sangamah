// Display names for collections (the first segment of a study slug).
// Add a line here when a new collection folder appears; unknown folders fall back to frontmatter `collection`.
export const collectionMeta: Record<string, { deva: string; iast: string; en: string }> = {
  'devi-mahatmya': { deva: 'देवीमाहात्म्यम्', iast: 'Devī-māhātmyam', en: 'The Glory of the Goddess' },
  gita: { deva: 'श्रीमद्भगवद्गीता', iast: 'Śrīmad-bhagavad-gītā', en: 'The Song of the Lord' },
  stotras: { deva: 'स्तोत्राणि', iast: 'Stotrāṇi', en: 'Hymns of praise' },
};

// Home page section order; anything else follows alphabetically.
export const collectionOrder = ['devi-mahatmya', 'gita', 'stotras'];

export function collectionKey(slug: string): string {
  return slug.split('/')[0];
}
