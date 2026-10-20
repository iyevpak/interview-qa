import { createTheme } from '@mui/material';

export const C = {
  paper: '#f6f1e7',
  card: '#fffdf8',
  ink: '#1d1b16',
  muted: '#6f6a5e',
  rule: '#e3dccb',
  accent: '#c2410c', // burnt orange — red-pen marks
  accentSoft: '#fbe6d6',
  moss: '#3f6212',
  code: '#1b1a17',
};

export const fonts = {
  display: '"Fraunces", Georgia, serif',
  body: '"Instrument Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export const theme = createTheme({
  palette: {
    primary: { main: C.accent },
    secondary: { main: C.moss },
    background: { default: C.paper, paper: C.card },
    text: { primary: C.ink, secondary: C.muted },
    divider: C.rule,
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.display, fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontFamily: fonts.display, fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: fonts.display, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontFamily: fonts.body, fontSize: 12, background: C.ink } } },
  },
});
