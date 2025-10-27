
import Link from 'next/link'
import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export default function Banner({ pageName }) {
  let pageTitle = "";
  switch (pageName) {
    case "contact":
      pageTitle = "Contact Me";
      break;
    case "resume":
      pageTitle = "My Resume";
      break;
    case "work":
      pageTitle = "My Work";
      break;
    case "about":
      pageTitle = "About Me";
      break;
    case "blog":
      pageTitle = "Tech Notes";
      break;
  }
  return (
    <Box component="section" sx={{ position: 'relative', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: '1 1 0' }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>{pageTitle}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" component="a" href="/about">About</Button>
              <Button variant="outlined" component="a" href="/contact">Contact</Button>
            </Box>
          </Box>
        </Box>
      </Container>
      {/* decorative shapes */}
      <Box sx={{ position: 'absolute', left: 0, top: 0, zIndex: -1 }}>
        <svg
          width="495"
          height="470"
          viewBox="0 0 495 470"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="55"
            cy="442"
            r="138"
            stroke="white"
            strokeOpacity="0.04"
            strokeWidth="50"
          />
          <circle
            cx="446"
            r="39"
            stroke="white"
            strokeOpacity="0.04"
            strokeWidth="20"
          />
          <path
            d="M245.406 137.609L233.985 94.9852L276.609 106.406L245.406 137.609Z"
            stroke="white"
            strokeOpacity="0.08"
            strokeWidth="12"
          />
        </svg>
        <svg
          width="493"
          height="470"
          viewBox="0 0 493 470"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="462"
            cy="5"
            r="138"
            stroke="white"
            strokeOpacity="0.04"
            strokeWidth="50"
          />
          <circle
            cx="49"
            cy="470"
            r="39"
            stroke="white"
            strokeOpacity="0.04"
            strokeWidth="20"
          />
          <path
            d="M222.393 226.701L272.808 213.192L259.299 263.607L222.393 226.701Z"
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="13"
          />
        </svg>
      </Box>
    </Box>
  )
}
