import Image from "next/image";
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import React from 'react'

export default function Hero() {
    return (
        <Box component="section" sx={{ position: 'relative', bgcolor: 'primary.main', py: { xs: 4, md: 8 } }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: '100%', maxWidth: 845, position: 'relative', zIndex: 10, mt: 4 }}>
                        <Box sx={{ mt: { xs: 4, md: 8 } }}>
                            <Box sx={{ position: 'relative', width: '100%', height: { xs: 220, md: 420 } }}>
                                <Image src="/assets/images/hero/hero-image.jpg" alt="hero" fill style={{ objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}