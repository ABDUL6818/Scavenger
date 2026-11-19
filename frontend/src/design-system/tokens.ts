/**
 * Scavngr Design Tokens
 * Single source of truth for all design decisions.
 * Consumed by Tailwind config, CSS custom properties, and token exports.
 */

export const colors = {
  // Brand palette
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
    1000: '#000000',
  },
} as const

export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

export const spacing = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  64: '16rem',
} as const

export const borderRadius = {
  none: '0px',
  sm: '0.25rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  none: 'none',
} as const

export const animation = {
  duration: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const

/**
 * Semantic token mappings (light / dark)
 *
 * Values are stored as raw HSL channel triples ("H S% L%") so they can be
 * composed with alpha via `hsl(var(--token) / <alpha>)`. Every key here is
 * exposed as a CSS custom property named `--<key>` (see `cssVariableName`).
 *
 * Backwards-compatibility: all previously published token names are retained
 * unchanged. New tokens (surface*, text*, border*, accent*, status*) are
 * additive. `destructive` remains an alias of `status-danger` for callers that
 * have not yet migrated.
 */
export const semanticTokens = {
  light: {
    // Base
    background: '0 0% 100%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    'card-foreground': '222 47% 11%',
    popover: '0 0% 100%',
    'popover-foreground': '222 47% 11%',
    primary: '142 76% 30%',          // green-700 equivalent — 4.61:1 on white (raised from 36%)
    'primary-foreground': '0 0% 100%',
    secondary: '210 40% 94%',
    'secondary-foreground': '222 47% 11%',
    muted: '210 40% 94%',
    'muted-foreground': '215 25% 38%',
    accent: '142 76% 94%',           // green-50-ish
    'accent-foreground': '142 76% 20%',
    destructive: '0 72% 44%',
    'destructive-foreground': '0 0% 100%',
    border: '214 32% 85%',
    input: '214 32% 85%',
    ring: '142 76% 36%',
    radius: '0.5rem',

    // Surface scale (elevation-aware backgrounds)
    surface: '0 0% 100%',
    'surface-raised': '210 40% 98%',
    'surface-sunken': '210 40% 94%',
    'surface-overlay': '0 0% 100%',

    // Text scale
    text: '222 47% 11%',
    'text-muted': '215 25% 38%',
    'text-subtle': '215 20% 52%',
    'text-inverted': '0 0% 100%',

    // Border scale
    'border-subtle': '214 32% 92%',
    'border-strong': '214 32% 72%',

    // Accent scale
    'accent-subtle': '142 76% 96%',
    'accent-strong': '142 76% 26%',

    // Status
    'status-success': '142 76% 30%',
    'status-success-foreground': '0 0% 100%',
    'status-warning': '32 95% 38%',
    'status-warning-foreground': '0 0% 100%',
    'status-danger': '0 72% 44%',
    'status-danger-foreground': '0 0% 100%',
    'status-info': '217 91% 40%',
    'status-info-foreground': '0 0% 100%',
  },
  dark: {
    // Base
    background: '222 47% 8%',
    foreground: '210 40% 96%',
    card: '222 47% 11%',
    'card-foreground': '210 40% 96%',
    popover: '222 47% 11%',
    'popover-foreground': '210 40% 96%',
    primary: '142 69% 58%',          // green-400 (lighter for dark bg)
    'primary-foreground': '222 47% 8%',
    secondary: '217 33% 20%',
    'secondary-foreground': '210 40% 96%',
    muted: '217 33% 20%',
    'muted-foreground': '215 25% 68%',
    accent: '142 30% 20%',
    'accent-foreground': '142 69% 80%',
    destructive: '0 72% 58%',        // raised from 55% — 4.67:1 on dark bg — WCAG AA
    'destructive-foreground': '0 0% 100%',
    border: '217 33% 22%',
    input: '217 33% 22%',
    ring: '142 69% 58%',
    radius: '0.5rem',

    // Surface scale (elevation-aware backgrounds)
    surface: '222 47% 8%',
    'surface-raised': '222 47% 12%',
    'surface-sunken': '222 47% 5%',
    'surface-overlay': '222 47% 14%',

    // Text scale
    text: '210 40% 96%',
    'text-muted': '215 25% 68%',
    'text-subtle': '215 20% 56%',
    'text-inverted': '222 47% 8%',

    // Border scale
    'border-subtle': '217 33% 16%',
    'border-strong': '217 33% 34%',

    // Accent scale
    'accent-subtle': '142 30% 14%',
    'accent-strong': '142 69% 72%',

    // Status
    'status-success': '142 69% 58%',
    'status-success-foreground': '222 47% 8%',
    'status-warning': '38 92% 60%',
    'status-warning-foreground': '222 47% 8%',
    'status-danger': '0 72% 58%',
    'status-danger-foreground': '0 0% 100%',
    'status-info': '213 94% 68%',
    'status-info-foreground': '222 47% 8%',
  },
} as const

export type ThemeMode = keyof typeof semanticTokens
export type SemanticTokenName = keyof typeof semanticTokens.light

/** Canonical CSS custom property name for a semantic token, e.g. `--text-muted`. */
export function cssVariableName(token: SemanticTokenName): `--${string}` {
  return `--${token}`
}

/**
 * Resolve a semantic token to its raw HSL channel triple for the given theme.
 * Falls back to the light theme when a token is missing from the requested one.
 */
export function resolveToken(token: SemanticTokenName, mode: ThemeMode = 'light'): string {
  return semanticTokens[mode][token] ?? semanticTokens.light[token]
}

/** Resolve a semantic token to a full `hsl(...)` color string. */
export function resolveColor(token: SemanticTokenName, mode: ThemeMode = 'light'): string {
  return `hsl(${resolveToken(token, mode)})`
}

/**
 * Build the CSS custom property map for a theme, suitable for applying to a
 * root element (e.g. `<html style={...}>` or a `:root` rule).
 */
export function themeCssVariables(mode: ThemeMode = 'light'): Record<`--${string}`, string> {
  const entries = Object.entries(semanticTokens[mode]) as [SemanticTokenName, string][]
  return Object.fromEntries(entries.map(([name, value]) => [cssVariableName(name), value])) as Record<
    `--${string}`,
    string
  >
}

export const tokens = { colors, typography, spacing, borderRadius, shadows, animation, semanticTokens }
export default tokens
