"use client"

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';

// color mode context for toggling light/dark
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export function useColorMode() {
  return React.useContext(ColorModeContext);
}

export default function MuiProvider({ children }) {
  // Enhanced theme: gradients, tertiary accent, stronger shadows, and motion (respecting reduced-motion)
  // Keep default MUI shadows so elevation indices (e.g. elevation={4}) exist
  const defaultTheme = createTheme();

  // color mode (light/dark) persisted in localStorage
  const [mode, setMode] = React.useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('color-mode') : null;
      if (stored === 'light' || stored === 'dark') return stored;
      // fallback to preferred color scheme
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch (e) {
      return 'light';
    }
  });

  const colorMode = React.useMemo(() => ({
    mode,
    toggleColorMode: () => {
      setMode((prev) => {
        const next = prev === 'light' ? 'dark' : 'light';
        try { localStorage.setItem('color-mode', next); } catch (e) {}
        return next;
      });
    }
  }), [mode]);

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: mode === 'light'
        ? { light: '#4FB3FF', main: '#0066B8', dark: '#005A9E', contrastText: '#fff' }
        : { light: '#8ECBFF', main: '#4FB3FF', dark: '#1E6FB8', contrastText: '#061226' },
      secondary: { main: '#FF9F3A', contrastText: '#111' },
      tertiary: { main: '#7C3AED', contrastText: '#fff' },
      background: mode === 'light' ? { default: '#F5F8FA', paper: '#FFFFFF' } : { default: '#071021', paper: '#0F1724' },
      text: mode === 'light' ? { primary: '#0F1724', secondary: '#475569' } : { primary: '#E6EDF3', secondary: '#AAB3BD' },
    },
    shape: { borderRadius: 12 },
    // reuse the default theme's shadows so elevations like 4 are available
    shadows: defaultTheme.shadows,
    typography: {
      fontFamily: 'var(--font-geist-sans), Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      h1: { fontFamily: 'var(--font-geist-mono), var(--font-geist-sans)', fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontFamily: 'var(--font-geist-mono), var(--font-geist-sans)', fontSize: '1.9rem', fontWeight: 700 },
      h3: { fontSize: '1.4rem', fontWeight: 700 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: mode === 'light'
              ? 'linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.6))'
              : 'linear-gradient(180deg, rgba(10,16,28,0.72), rgba(10,16,28,0.55))',
            backdropFilter: 'saturate(120%) blur(6px)',
            borderBottom: mode === 'light' ? '1px solid rgba(15,23,36,0.06)' : '1px solid rgba(255,255,255,0.03)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            transition: 'transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms',
            boxShadow: mode === 'light' ? '0 8px 30px rgba(6,18,40,0.06)' : '0 10px 40px rgba(2,6,23,0.5)',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-6px)',
              boxShadow: mode === 'light' ? '0 18px 50px rgba(6,18,40,0.12)' : '0 22px 60px rgba(2,6,23,0.6)',
            },
          },
        },
      },
      MuiButton: {
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: 'linear-gradient(90deg, #0078D4 0%, #4FB3FF 100%)',
              color: '#fff',
              boxShadow: '0 8px 20px rgba(2,6,23,0.08)',
              padding: '10px 18px',
              ':hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 40px rgba(2,6,23,0.12)' },
            },
          },
          {
            props: { variant: 'contained', color: 'secondary' },
            style: { background: 'linear-gradient(90deg,#FF9F3A 0%, #FFB86B 100%)', color: '#111' },
          },
        ],
        styleOverrides: { root: { borderRadius: 10, transition: 'transform 200ms, box-shadow 200ms' } },
      },
    },
  }), [mode]);

  // Global styles applied via MUI's GlobalStyles to harmonize fonts, link colors, and subtle background
  const global = (
    <GlobalStyles
      styles={{
        'html, body, #__next': { height: '100%' },
        ':root': {
          '--accent-gradient': 'linear-gradient(90deg, #0078D4 0%, #4FB3FF 100%)',
          '--focus-ring': '3px solid rgba(0,120,212,0.18)',
        },
        // color-scheme helps the UA render form controls and scrollbars correctly
        html: { colorScheme: theme.palette.mode },
        body: {
          background: mode === 'light'
            ? 'linear-gradient(180deg, #FBFDFF 0%, #F6F8FA 100%)'
            : 'linear-gradient(180deg, #071021 0%, #0B1220 100%)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          color: theme.palette.text.primary,
        },
        a: { color: theme.palette.primary.main, textDecoration: 'none' },
        '.muted': { color: theme.palette.text.secondary },
        // Typography and article (.prose) enhancements for blog content
        '.prose': {
          color: theme.palette.text.primary,
          fontSize: '1rem',
          lineHeight: 1.7,
          // paragraphs use sans variable for body text
          fontFamily: 'var(--font-geist-sans), Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          maxWidth: '70ch',
        },
        '.prose h1, .prose h2, .prose h3, .prose h4': {
          color: theme.palette.text.primary,
          // headings keep the mono variable for techy look
          fontFamily: 'var(--font-geist-mono), var(--font-geist-sans)',
          fontWeight: 700,
          marginTop: '1.6rem',
          marginBottom: '0.6rem',
        },
        '.prose h1': { fontSize: '2rem' },
        '.prose h2': { fontSize: '1.6rem' },
        '.prose p': { marginBottom: '1rem', color: theme.palette.text.primary },
        '.prose a': { color: theme.palette.primary.main, textDecoration: 'underline' },
        '.prose img': { maxWidth: '100%', height: 'auto', borderRadius: 8, display: 'block', margin: '1rem auto' },
        '.prose pre': {
          background: mode === 'light' ? 'rgba(6,18,40,0.06)' : '#041026',
          color: mode === 'light' ? '#061026' : '#E6EDF3',
          padding: '1rem',
          borderRadius: 8,
          overflowX: 'auto',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace',
          fontSize: '0.9rem',
          border: mode === 'light' ? '1px solid rgba(6,18,40,0.03)' : '1px solid rgba(255,255,255,0.03)'
        },
        '.prose code': {
          background: mode === 'light' ? 'rgba(2,6,23,0.06)' : 'rgba(255,255,255,0.03)',
          padding: '0.2rem 0.4rem',
          borderRadius: 6,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace',
        },
        // Prism-like syntax highlighting for pre > code
        '.prose pre[class*="language-"]': {
          padding: '1rem',
          borderRadius: 8,
          overflow: 'auto',
        },
        '.prose .token.comment, .prose .token.prolog, .prose .token.doctype, .prose .token.cdata': { color: mode === 'light' ? '#6B7280' : '#8B98A8' },
        '.prose .token.punctuation': { color: mode === 'light' ? '#374151' : '#AAB3BD' },
        '.prose .token.property, .prose .token.tag, .prose .token.constant, .prose .token.symbol, .prose .token.deleted': { color: '#7C3AED' },
        '.prose .token.boolean, .prose .token.number': { color: '#FF9F3A' },
        '.prose .token.selector, .prose .token.attr-name, .prose .token.string, .prose .token.char, .prose .token.builtin, .prose .token.inserted': { color: '#4FB3FF' },
        '.prose .token.operator, .prose .token.entity, .prose .token.url, .prose .language-css .token.string, .prose .style .token.string': { color: '#FFB86B' },
        '.prose blockquote': {
          borderLeft: `4px solid ${theme.palette.primary.light}`,
          paddingLeft: '1rem',
          color: theme.palette.text.secondary,
          margin: '1rem 0',
          background: mode === 'light' ? 'rgba(0,120,212,0.02)' : 'rgba(255,255,255,0.02)',
          borderRadius: 6,
        },
        '.prose ul, .prose ol': { marginLeft: '1.25rem', marginBottom: '1rem' },
        // Micro-interactions but respect reduced motion
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            transition: 'none !important',
            animation: 'none !important',
            transform: 'none !important',
          },
        },
        // Visible focus styles for keyboard users
        'a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible': {
          outline: 'none',
          boxShadow: '0 0 0 4px rgba(0,120,212,0.12)',
          borderRadius: 8,
        },
        // Forced-colors / High Contrast support (Windows)
        '@media (forced-colors: active)': {
          '*': {
            background: 'Window',
            color: 'WindowText',
            borderColor: 'WindowText',
          },
          'a': { color: 'LinkText' },
          'img': { border: '1px solid WindowText' },
        },
        // Provide a fallback focus style for browsers without :focus-visible
        'a:focus, button:focus': {
          boxShadow: '0 0 0 3px rgba(0,120,212,0.10)',
        },
      }}
    />
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {global}
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
