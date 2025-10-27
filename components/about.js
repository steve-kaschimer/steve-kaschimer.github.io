import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'
import Icon from '@mdi/react'
import { mdiTwitter, mdiLinkedin, mdiEmailOutline, mdiCellphone, mdiReact } from '@mdi/js'

export default function About() {
    return (
        <Box component="section" sx={{ py: { xs: 4, md: 8 } }} id="about">
            <Container maxWidth="lg">
                <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Hi, I&apos;m Steve!</Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1" paragraph>
                            I&apos;ve been in this industry for over 20 years, and never have had a day where I learn nothing. I love to challenge myself by learning new things. All. The. Time. I&apos;m a proud Senior Consultant with Slalom, and love the variety of projects that I am privileged to work on.
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 2 }}>About Me</Typography>
                        <Box component="ul" sx={{ pl: 3 }}>
                            <li>I have a B.S. in Computer Information Systems and a M.S. in Information Management, both from Arizona State University (Go Sun Devils!).</li>
                            <li>I volunteer my time outside of work to various causes that mean something to me including: <a href="https://www.forgottenharvest.org" target="_blank" rel="noreferrer">Forgotten Harvest</a>, <a href="https://pack248.org" target="_blank" rel="noreferrer">Cub Scout Pack 248</a>, <a href="https://scouting.org" target="_blank" rel="noreferrer">Boy Scouts of America</a>, and <a href="https://freedomaintfree.us" target="_blank" rel="noreferrer">#32 Freedom Ain&apos;t Free</a></li>
                            <li>I have a family full of boys... 5 of them to be precise... two extremely sweet Golden Doodles... and a loving wife who puts up with all of us!</li>
                        </Box>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button component="a" href="/contact" variant="contained">Contact</Button>
                            <Button component="a" href="/resume" variant="outlined">Resume</Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Tech Stack</Typography>
                        <Box sx={{ mt: 1 }}>
                            <a href="https://skillicons.dev" target="_blank" rel="noreferrer"><img src="https://skillicons.dev/icons?i=azure,cs,dotnet,windows,ubuntu,visualstudio,vscode,docker,js,html,css,react,nextjs,gatsby,github,githubactions,md,npm,py,postman,nodejs,notion,powershell,tailwind,terraform,ts,rabbitmq,raspberrypi,linkedin,devto,stackoverflow&perline=8" alt="My Skills"/></a>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6">Get in Touch</Typography>
                            <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
                                <li><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Icon path={mdiTwitter} size={0.9} /><a href="https://twitter.com/iamskratsch" target="_blank" rel="noreferrer">Twitter</a></Box></li>
                                <li><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Icon path={mdiLinkedin} size={0.9} /><a href="https://www.linkedin.com/in/skaschimer/" target="_blank" rel="noreferrer">LinkedIn</a></Box></li>
                                <li><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Icon path={mdiEmailOutline} size={0.9} /><a href="mailto:steve.kaschimer@slalom.com">Email</a></Box></li>
                                <li><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Icon path={mdiCellphone} size={0.9} /><a href="tel:13132845656">Call</a></Box></li>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}
