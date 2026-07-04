import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Cormorant Garamond', Georgia, serif"
const BODY_FONT = "'Manrope', 'Inter', system-ui, sans-serif"

const base = {
  dark: true,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#061E29',
  surface: '#103247',
  raised: '#1D546D',
  text: '#F3F4F4',
  muted: '#5F9598',
  line: 'rgba(255,255,255,0.08)',
  accent: '#5F9598',
  accentSoft: 'rgba(95,149,152,0.14)',
  onAccent: '#F3F4F4',
  glow: 'rgba(29,84,109,0.22)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Editorial', note: 'Deep reads, thoughtful commentary, and polished stories.' },
  listing: { ...base, kicker: 'Directory', note: 'Browse polished business profiles and standout services.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Fresh opportunities, limited offers, and useful finds.' },
  image: { ...base, kicker: 'Gallery', note: 'Visual posts curated for quick discovery.' },
  sbm: { ...base, kicker: 'Resources', note: 'Collected links and references worth opening.' },
  pdf: { ...base, kicker: 'Library', note: 'Downloadable files and practical reference documents.' },
  profile: { ...base, kicker: 'People', note: 'Profiles, portfolios, and notable contributors.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
