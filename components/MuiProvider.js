"use client"

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/styled-engine';

export default function MuiProvider({ children }) {
  // Azure-inspired palette with warm accent and neutral greys
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        // Azure / Microsoft blue range
        light: '#4FB3FF',
        main: '#0078D4',
        dark: '#005A9E',
        contrastText: '#fff',
      },
      secondary: {
        // warm accent (orange/red)
        light: '#FF8A50',
        main: '#FF6A00',
        dark: '#D84315',
        contrastText: '#fff',
      },
      background: {
        default: '#F6F8FA',
        paper: '#ffffff',
      },
      text: {
        primary: '#0F1724', // near-black for crisp tech look
        secondary: '#6B7280',
      },
      grey: {
        50: '#FBFBFC',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
      },
    },
    shape: { borderRadius: 10 },
    typography: {
      // prefer the locally bundled Geist fonts (variables defined in app/layout.js)
      fontFamily: 'var(--font-geist-sans), Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      h1: { fontFamily: 'var(--font-geist-mono), var(--font-geist-sans)', fontWeight: 700 },
      h2: { fontFamily: 'var(--font-geist-mono), var(--font-geist-sans)', fontWeight: 700 },
      h3: { fontFamily: 'var(--font-geist-mono), var(--font-geist-sans)', fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 6px 20px rgba(2,6,23,0.08)',
            border: '1px solid rgba(15,23,36,0.04)',
            overflow: 'hidden',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: { backgroundColor: '#ffffff', color: '#0F1724', boxShadow: 'none', borderBottom: '1px solid rgba(15,23,36,0.06)' },
        },
      },
    },
  });

  // Global styles applied via MUI's GlobalStyles to harmonize fonts, link colors, and subtle background
  const global = (
    <GlobalStyles
      styles={{
        'html, body, #__next': { height: '100%' },
        body: {
          background: 'linear-gradient(180deg, #FBFDFF 0%, #F6F8FA 100%)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        a: { color: theme.palette.primary.main, textDecoration: 'none' },
        '.muted': { color: theme.palette.text.secondary },
        // Typography and article (.prose) enhancements for blog content
        '.prose': {
          color: theme.palette.text.primary,
          fontSize: '1rem',
          lineHeight: 1.75,
          // paragraphs use sans variable for body text
          fontFamily: 'var(--font-geist-sans), Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
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
          background: '#0B1220',
          color: '#E6EDF3',
          padding: '1rem',
          borderRadius: 8,
          overflowX: 'auto',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace',
          fontSize: '0.9rem',
        },
        '.prose code': {
          background: 'rgba(2,6,23,0.06)',
          padding: '0.2rem 0.4rem',
          borderRadius: 4,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace',
        },
        '.prose blockquote': {
          borderLeft: `4px solid ${theme.palette.primary.light}`,
          paddingLeft: '1rem',
          color: theme.palette.text.secondary,
          margin: '1rem 0',
        },
        '.prose ul, .prose ol': { marginLeft: '1.25rem', marginBottom: '1rem' },
      }}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {global}
      {children}
    </ThemeProvider>
  );
}
