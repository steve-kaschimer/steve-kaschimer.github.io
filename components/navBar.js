"use client"

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Image from 'next/image'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from './MuiProvider';

export default function NavBar() {
  const nextPath = usePathname()
  // fallback for pages-router pages where usePathname may be undefined
  const pathname = nextPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const navItems = [
    { title: 'Home', href: '/' },
    { title: 'About', href: '/about' },
  ]

  const theme = useTheme();
  const colorMode = useColorMode();

  return (
    <Box sx={{ flexGrow: 1, mb: 3 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ gap: 2, alignItems: 'center', color: 'text.primary' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: { xs: 32, sm: 44, md: 70 }, '& img': { height: '100%', width: 'auto', display: 'block', mixBlendMode: 'normal', filter: 'none', opacity: 1 } }}>
                {/* Use SVG logo to avoid PNG alpha blending; force normal blend/filter for crisp display */}
                <Image src="/assets/images/logo/technotes_logo.png" alt="Site logo" width={196} height={70} priority />
              </Box>
            </Link>
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Button
                  key={item.href}
                  component="a"
                  href={item.href}
                  variant={active ? 'contained' : 'text'}
                  color={active ? 'secondary' : 'inherit'}
                  sx={active ? { boxShadow: 'none' } : { color: 'text.primary' }}
                >
                  {item.title}
                </Button>
              )
            })}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton color="inherit" onClick={handleMenu} aria-label="menu" sx={{ color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <MenuItem
                    key={item.href}
                    onClick={handleClose}
                    component="a"
                    href={item.href}
                    selected={active}
                  >
                    {item.title}
                  </MenuItem>
                )
              })}
            </Menu>
          </Box>
          {/* Dark mode toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <IconButton
              sx={{ ml: 1, color: 'text.primary' }}
              onClick={() => colorMode.toggleColorMode()}
              color="inherit"
              aria-label="toggle color mode"
              title={colorMode.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={colorMode.mode === 'dark'}
            >
              {colorMode.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  )
}