"use client"

import React from 'react'
import NavBar from './navBar'
import Footer from './footer'
import Box from '@mui/material/Box'

export default function PageShell({ children }) {
  return (
    <Box component="div" sx={{ minHeight: '100vh', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <NavBar />
      {children}
      <Footer />
    </Box>
  )
}
