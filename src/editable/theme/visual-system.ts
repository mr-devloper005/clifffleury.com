import { slot4BrandConfig } from './brand.config'

export type Slot4VisualPreset =
  | 'editorial-paper'
  | 'luxury-atelier'
  | 'brutalist-index'
  | 'organic-journal'
  | 'tech-directory'
  | 'retro-bulletin'
  | 'visual-gallery'

export const visualPresets = {
  'editorial-paper': {
    label: 'Editorial Paper',
    mood: 'calm magazine authority',
    fontDirection: 'serif headlines with quiet sans body',
    colors: {
      background: '#F3F4F4',
      foreground: '#061E29',
      muted: '#5F9598',
      primary: '#061E29',
      accent: '#1D546D',
      surface: '#F3F4F4',
    },
    shape: 'soft editorial cards with fine borders',
  },
  'luxury-atelier': {
    label: 'Luxury Atelier',
    mood: 'premium, restrained, polished',
    fontDirection: 'Cormorant Garamond headlines with Outfit body',
    colors: {
      background: '#061E29',
      foreground: '#F3F4F4',
      muted: '#5F9598',
      primary: '#1D546D',
      accent: '#5F9598',
      surface: '#1D546D',
    },
    shape: 'dark panels, gold hairlines, editorial spacing',
  },
  'brutalist-index': {
    label: 'Brutalist Index',
    mood: 'bold, raw, memorable',
    fontDirection: 'condensed headings, mono labels, hard rhythm',
    colors: {
      background: '#F3F4F4',
      foreground: '#061E29',
      muted: '#5F9598',
      primary: '#061E29',
      accent: '#1D546D',
      surface: '#F3F4F4',
    },
    shape: 'sharp edges, thick borders, offset blocks',
  },
  'organic-journal': {
    label: 'Organic Journal',
    mood: 'warm, natural, trustworthy',
    fontDirection: 'rounded serif or humanist sans with soft captions',
    colors: {
      background: '#F3F4F4',
      foreground: '#061E29',
      muted: '#5F9598',
      primary: '#1D546D',
      accent: '#5F9598',
      surface: '#F3F4F4',
    },
    shape: 'rounded cards, natural spacing, calm texture',
  },
  'tech-directory': {
    label: 'Tech Directory',
    mood: 'clean, fast, useful',
    fontDirection: 'modern sans with crisp mono data accents',
    colors: {
      background: '#F3F4F4',
      foreground: '#061E29',
      muted: '#5F9598',
      primary: '#1D546D',
      accent: '#5F9598',
      surface: '#F3F4F4',
    },
    shape: 'clean grids, pill filters, sharp information hierarchy',
  },
  'retro-bulletin': {
    label: 'Retro Bulletin',
    mood: 'playful, local, energetic',
    fontDirection: 'chunky headings with friendly body type',
    colors: {
      background: '#F3F4F4',
      foreground: '#061E29',
      muted: '#5F9598',
      primary: '#061E29',
      accent: '#1D546D',
      surface: '#F3F4F4',
    },
    shape: 'stickers, tabs, framed modules, playful dividers',
  },
  'visual-gallery': {
    label: 'Visual Gallery',
    mood: 'cinematic, image-led, immersive',
    fontDirection: 'minimal sans with oversized display moments',
    colors: {
      background: '#061E29',
      foreground: '#F3F4F4',
      muted: '#5F9598',
      primary: '#1D546D',
      accent: '#5F9598',
      surface: '#1D546D',
    },
    shape: 'dark cards, large media, glass overlays',
  },
} as const

export const visualSystem = {
  productKind: slot4BrandConfig.productKind,
  recommendedPreset: 'tech-directory',
  radius: {
    sm: '0.75rem',
    md: '1.25rem',
    lg: '2rem',
    xl: '2.75rem',
  },
  motion: {
    pageLoad: 'animate-in fade-in slide-in-from-bottom-4 duration-700',
    cardHover: 'transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl',
    softHover: 'transition duration-300 hover:opacity-85',
    reduceMotionSafe: 'motion-reduce:transform-none motion-reduce:transition-none',
  },
  typography: {
    eyebrow: 'text-xs font-semibold uppercase tracking-[0.24em]',
    heroTitle: 'text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl',
    sectionTitle: 'text-3xl font-semibold tracking-[-0.04em] sm:text-4xl',
    body: 'text-base leading-8',
    caption: 'text-xs font-medium uppercase tracking-[0.18em]',
  },
  surfaces: {
    glass: 'border border-white/15 bg-white/10 backdrop-blur-xl',
    paper: 'border border-[rgba(6,30,41,0.1)] bg-[var(--slot4-cream)] shadow-[0_24px_70px_rgba(6,30,41,0.08)]',
    quiet: 'border border-[rgba(6,30,41,0.1)] bg-[rgba(29,84,109,0.08)]',
    dark: 'border border-white/10 bg-black/30 shadow-[0_24px_70px_rgba(0,0,0,0.25)]',
  },
  layout: {
    page: 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
    sectionY: 'py-12 sm:py-16 lg:py-20',
    cardGrid: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
  },
} as const

export function getVisualPreset(name: Slot4VisualPreset = visualSystem.recommendedPreset as Slot4VisualPreset) {
  return visualPresets[name]
}
