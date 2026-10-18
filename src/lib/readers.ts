// Reader themes for the header switcher (brief §6b/§6e). Colours here only drive the swatches;
// the real tokens live in src/styles/themes.css.
export interface Reader {
  key: string;
  deva: string;
  iast: string;
  light: { bg: string; surface: string; decor: string; accent: string };
  dark: { bg: string; surface: string; decor: string; accent: string };
}

export const DEFAULT_READER = 'kalamkari';

export const readers: Reader[] = [
  {
    key: 'kalamkari',
    deva: 'कलमकारी',
    iast: 'Kalamkārī',
    light: { bg: '#F4EEE1', surface: '#FBF7EE', decor: '#B07E14', accent: 'oklch(0.50 0.12 78)' },
    dark: { bg: '#16130F', surface: '#1F1B16', decor: '#C9A04A', accent: 'oklch(0.72 0.077 78)' },
  },
  {
    key: 'paurnami',
    deva: 'पौर्णमी',
    iast: 'Paurṇamī',
    light: { bg: '#EEF0F5', surface: '#F8F9FC', decor: '#7D8CAE', accent: 'oklch(0.46 0.12 255)' },
    dark: { bg: '#0B1124', surface: '#131C35', decor: '#DCD6BE', accent: 'oklch(0.74 0.085 255)' },
  },
  {
    key: 'tadapatra',
    deva: 'ताडपत्र',
    iast: 'Tāḍapatra',
    light: { bg: '#E8D9AE', surface: '#F0E4C0', decor: '#6E521C', accent: 'oklch(0.42 0.14 28)' },
    dark: { bg: '#1C1913', surface: '#262118', decor: '#C9A75A', accent: 'oklch(0.68 0.10 28)' },
  },
  {
    key: 'kunkuma',
    deva: 'कुङ्कुम',
    iast: 'Kuṅkuma',
    light: { bg: '#ECCFC6', surface: '#F6E3DD', decor: '#A01C14', accent: 'oklch(0.42 0.17 25)' },
    dark: { bg: '#1E0B0A', surface: '#2A1210', decor: '#E0503F', accent: 'oklch(0.69 0.12 25)' },
  },
  {
    key: 'vrnda',
    deva: 'वृन्दा',
    iast: 'Vṛndā',
    light: { bg: '#D4E4C3', surface: '#E5EFD8', decor: '#2E6B28', accent: 'oklch(0.42 0.13 140)' },
    dark: { bg: '#0A1A0E', surface: '#112617', decor: '#6FCB63', accent: 'oklch(0.74 0.11 140)' },
  },
];
