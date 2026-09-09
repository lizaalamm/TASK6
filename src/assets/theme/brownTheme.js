/**
 * src/assets/theme/brownTheme.js
 * ----------------------------------------------------------------------------
 * Design system for the Car Showroom app — warm "espresso & gold" identity.
 *
 *  - `brownTheme`     → light mode (cream canvas, espresso text, gold accents)
 *  - `darkBrownTheme` → dark mode (deep roast canvas, warm glowing accents)
 *
 * Shared tokens live in `designTokens` (gradients, shadows, radii) so any
 * component can stay on-brand without hardcoding hex values:
 *
 *   import { designTokens } from '../assets/theme/brownTheme';
 * ----------------------------------------------------------------------------
 */
import { createTheme } from '@mui/material/styles';

/** Brand palette per colour mode. */
const brownColors = {
  light: {
    primary: '#5D4037', // espresso
    secondary: '#8D6E63', // warm taupe
    background: '#F7F2EC', // cream canvas
    surface: '#FFFFFF',
    text: '#3E2723', // dark roast
    accent: '#D4A24C', // showroom gold
    accentDeep: '#B07C24',
    border: '#E7DCD2',
    success: '#2E7D32',
    warning: '#EF6C00',
    error: '#C62828',
    info: '#1565C0',
  },
  dark: {
    primary: '#D4A24C', // gold leads in dark mode for contrast
    secondary: '#A1887F',
    background: '#14100C', // near-black roast
    surface: '#221915',
    text: '#F5EFE7',
    accent: '#D4A24C',
    accentDeep: '#B07C24',
    border: '#3A2C26',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#64B5F6',
  },
};

/**
 * Reusable brand tokens: gradients, glow shadows and radii.
 * Each gradient has a matching `*Glow` shadow for hover states.
 */
export const designTokens = {
  gradients: {
    gold: 'linear-gradient(135deg, #D4A24C 0%, #B07C24 100%)',
    espresso: 'linear-gradient(135deg, #5D4037 0%, #3E2723 100%)',
    espressoGold: 'linear-gradient(135deg, #5D4037 0%, #D4A24C 100%)',
    royal: 'linear-gradient(135deg, #7B1FA2 0%, #BA68C8 100%)',
    forest: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    ember: 'linear-gradient(135deg, #C62828 0%, #EF5350 100%)',
    ocean: 'linear-gradient(135deg, #1565C0 0%, #64B5F6 100%)',
    sunset: 'linear-gradient(135deg, #EF6C00 0%, #FFB74D 100%)',
  },
  shadows: {
    card: '0 6px 20px rgba(62, 39, 35, 0.08)',
    cardHover: '0 14px 36px rgba(62, 39, 35, 0.16)',
    goldGlow: '0 8px 24px rgba(212, 162, 76, 0.35)',
    darkCard: '0 6px 20px rgba(0, 0, 0, 0.45)',
    darkCardHover: '0 14px 36px rgba(0, 0, 0, 0.6)',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
};

/** Shared typography — Inter with tight, confident headings. */
const typography = (text) => ({
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 800, color: text, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, color: text, letterSpacing: '-0.015em' },
  h3: { fontWeight: 700, color: text },
  h4: { fontWeight: 600, color: text },
  h5: { fontWeight: 600, color: text },
  h6: { fontWeight: 600, color: text },
  button: { fontWeight: 600, letterSpacing: '0.01em' },
});

/**
 * Shared component overrides factory — same soul, per-mode colours.
 * @param {'light'|'dark'} mode - Which palette to style for.
 * @param {object} c - The palette for that mode.
 */
const componentOverrides = (mode, c) => {
  const isDark = mode === 'dark';
  return {
    // Cards lift + glow on hover for a tactile, premium feel.
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: isDark ? designTokens.shadows.darkCard : designTokens.shadows.card,
          borderRadius: designTokens.radius.lg,
          border: `1px solid ${c.border}`,
          backgroundColor: c.surface,
          transition: 'transform .25s ease, box-shadow .25s ease',
        },
      },
    },
    // Buttons: gradient primary, soft press-down feedback.
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          textTransform: 'none',
          fontWeight: 600,
          padding: '9px 26px',
          transition: 'transform .15s ease, box-shadow .2s ease, filter .2s ease',
          '&:active': { transform: 'scale(.97)' },
        },
        containedPrimary: {
          background: isDark
            ? designTokens.gradients.gold
            : designTokens.gradients.espressoGold,
          boxShadow: isDark
            ? '0 6px 18px rgba(212,162,76,.3)'
            : '0 6px 18px rgba(93,64,55,.28)',
          '&:hover': {
            filter: 'brightness(1.06)',
            boxShadow: designTokens.shadows.goldGlow,
          },
        },
      },
    },
    // Frosted-glass top bar.
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDark
            ? 'rgba(34, 25, 21, 0.82)'
            : 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          color: c.text,
          boxShadow: '0 1px 12px rgba(62, 39, 35, 0.08)',
          borderBottom: `1px solid ${c.border}`,
        },
      },
    },
    // Sidebar: deep gradient rail with light text in both modes.
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: isDark
            ? 'linear-gradient(180deg, #1D1410 0%, #2A1E18 60%, #241A15 100%)'
            : 'linear-gradient(180deg, #3E2723 0%, #4E342E 55%, #5D4037 100%)',
          color: '#F5EFE7',
          borderRight: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: designTokens.radius.sm, fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: designTokens.radius.md },
        rounded: { borderRadius: designTokens.radius.lg },
      },
    },
    // Pill-shaped inputs with a gold focus ring.
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          transition: 'box-shadow .2s ease',
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${c.accent}33` },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    // Sleek rounded dialogs.
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designTokens.radius.xl,
          border: `1px solid ${c.border}`,
        },
      },
    },
    // Underline-free, modern table headers.
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: designTokens.radius.pill },
        bar: { borderRadius: designTokens.radius.pill },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
  };
};

// --- Light theme ---------------------------------------------------------------
export const brownTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brownColors.light.primary,
      light: '#795548',
      dark: '#3E2723',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brownColors.light.secondary,
      light: '#A1887F',
      dark: '#5D4037',
      contrastText: '#FFFFFF',
    },
    background: {
      default: brownColors.light.background,
      paper: brownColors.light.surface,
    },
    text: {
      primary: brownColors.light.text,
      secondary: '#6D5B53',
    },
    success: { main: brownColors.light.success },
    warning: { main: brownColors.light.warning },
    error: { main: brownColors.light.error },
    info: { main: brownColors.light.info },
    divider: brownColors.light.border,
  },
  typography: typography(brownColors.light.text),
  shape: { borderRadius: 12 },
  components: componentOverrides('light', brownColors.light),
});

// --- Dark theme ------------------------------------------------------------------
export const darkBrownTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: brownColors.dark.primary,
      light: '#E3B96B',
      dark: '#B07C24',
      contrastText: '#1A1410',
    },
    secondary: {
      main: brownColors.dark.secondary,
      light: '#BCAAA4',
      dark: '#5D4037',
      contrastText: '#FFFFFF',
    },
    background: {
      default: brownColors.dark.background,
      paper: brownColors.dark.surface,
    },
    text: {
      primary: brownColors.dark.text,
      secondary: '#CBB9AC',
    },
    success: { main: brownColors.dark.success },
    warning: { main: brownColors.dark.warning },
    error: { main: brownColors.dark.error },
    info: { main: brownColors.dark.info },
    divider: brownColors.dark.border,
  },
  typography: typography(brownColors.dark.text),
  shape: { borderRadius: 12 },
  components: componentOverrides('dark', brownColors.dark),
});

// Friendly aliases so new code can import semantic names.
export const lightTheme = brownTheme;
export const darkTheme = darkBrownTheme;
