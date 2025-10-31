"use client"

import React from 'react'
import NavBar from './navBar'
import Footer from './footer'
import Box from '@mui/material/Box'

export default function PageShell({ children }) {
  return (
    <Box component="div" sx={{ minHeight: '100vh', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* Visually-hidden H1 for accessibility and heading structure */}
      <Box
        component="h1"
        sx={{
          border: 0,
          clip: 'rect(0 0 0 0)',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden',
          padding: 0,
          position: 'absolute',
          width: '1px',
          whiteSpace: 'nowrap',
        }}
      >
        Steve Kaschimer — Tech Notes
      </Box>
      <NavBar />
      {children}
      <Footer />
    </Box>
  )
}
