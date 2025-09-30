// Local font definitions for better TypeScript support
export const fonts = {
  // Direct font family approach
  sourceSansPro: 'Source Sans Pro',
  geistSans: 'Geist Sans',
  geistMono: 'Geist Mono',
  faustina: 'Faustina',
  spaceGrotesk: 'Space Grotesk',
} as const;

export type FontFamily = typeof fonts[keyof typeof fonts];