"use client"

import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 6, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="body2">© {year} Steve Kaschimer. All rights reserved.</Typography>
            <Typography variant="caption" color="text.secondary">Built with Next.js & Material UI.</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <a href="/resume" aria-label="Resume"><Typography variant="body2">Resume</Typography></a>
            <IconButton aria-label="GitHub" component="a" href="https://github.com/steve-kaschimer" target="_blank" rel="noopener noreferrer">
              <GitHubIcon />
            </IconButton>
            <IconButton aria-label="LinkedIn" component="a" href="https://www.linkedin.com/in/skaschimer" target="_blank" rel="noopener noreferrer">
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
