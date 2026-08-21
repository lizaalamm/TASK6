import { createTheme } from '@mui/material/styles';

const brownColors = {
  light: {
    primary: '#5D4037',
    secondary: '#8D6E63',
    background: '#F5F0EB',
    surface: '#FFFFFF',
    text: '#3E2723',
    accent: '#A1887F',
    border: '#D7CCC8',
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#EF5350',
  },
  dark: {
    primary: '#A1887F',
    secondary: '#8D6E63',
    background: '#1A1410',
    surface: '#2C1F1A',
    text: '#EFEBE8',
    accent: '#5D4037',
    border: '#4A3728',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
  }
};

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
      secondary: '#5D4037',
    },
    success: { main: brownColors.light.success },
    warning: { main: brownColors.light.warning },
    error: { main: brownColors.light.error },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, color: brownColors.light.text },
    h2: { fontWeight: 600, color: brownColors.light.text },
    h3: { fontWeight: 600, color: brownColors.light.text },
    h4: { fontWeight: 500, color: brownColors.light.text },
    h5: { fontWeight: 500, color: brownColors.light.text },
    h6: { fontWeight: 500, color: brownColors.light.text },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(62, 39, 35, 0.08)',
          borderRadius: 12,
          border: `1px solid ${brownColors.light.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(62, 39, 35, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brownColors.light.surface,
          color: brownColors.light.text,
          boxShadow: '0 1px 4px rgba(62, 39, 35, 0.08)',
          borderBottom: `1px solid ${brownColors.light.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: brownColors.light.surface,
          borderRight: `1px solid ${brownColors.light.border}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export const darkBrownTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: brownColors.dark.primary,
      light: '#A1887F',
      dark: '#5D4037',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brownColors.dark.secondary,
      light: '#A1887F',
      dark: '#3E2723',
      contrastText: '#FFFFFF',
    },
    background: {
      default: brownColors.dark.background,
      paper: brownColors.dark.surface,
    },
    text: {
      primary: brownColors.dark.text,
      secondary: '#D7CCC8',
    },
    success: { main: brownColors.dark.success },
    warning: { main: brownColors.dark.warning },
    error: { main: brownColors.dark.error },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, color: brownColors.dark.text },
    h2: { fontWeight: 600, color: brownColors.dark.text },
    h3: { fontWeight: 600, color: brownColors.dark.text },
    h4: { fontWeight: 500, color: brownColors.dark.text },
    h5: { fontWeight: 500, color: brownColors.dark.text },
    h6: { fontWeight: 500, color: brownColors.dark.text },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderRadius: 12,
          border: `1px solid ${brownColors.dark.border}`,
          backgroundColor: brownColors.dark.surface,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brownColors.dark.surface,
          color: brownColors.dark.text,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
          borderBottom: `1px solid ${brownColors.dark.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: brownColors.dark.surface,
          borderRight: `1px solid ${brownColors.dark.border}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: brownColors.dark.surface,
        },
      },
    },
  },
});