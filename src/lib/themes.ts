import type { MotifName } from '../components/Motif.astro';

// Which single-line motif accompanies each deity theme.
const motifs: Record<string, MotifName> = {
  devi: 'lotus',
  lakshmi: 'lotus',
  saraswati: 'lotus',
  krishna: 'flute',
  vishnu: 'lotus',
  shiva: 'trident',
  ganesha: 'lamp',
  general: 'lamp',
};

export function motifFor(theme: string | undefined): MotifName {
  return (theme && motifs[theme]) || 'lamp';
}
