// Prefix a site-relative path with the deploy base (e.g. /vagartha-sangamah/).
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return `${base}/${clean}`;
}

// Shared view-transition name for a study's title (home card → study page morph).
export function studyTitleTransition(id: string): string {
  return `study-title-${id.replace(/[^a-z0-9]+/gi, '-')}`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
