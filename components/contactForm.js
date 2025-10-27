
import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

export default function ContactForm() {
    return (
      <Box component="section" sx={{ py: 4 }}>
        <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="flex-start">
            <Grid item xs={12} lg={7}>
              <Box sx={{ pl: { xs: 0, md: 2 } }}>
                <Box sx={{ my: 2 }}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 2 }}>Let's talk about:</Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <li><Typography variant="h6">Cloud</Typography></li>
                    <li><Typography variant="h6">DevOps</Typography></li>
                    <li><Typography variant="h6">Custom Development</Typography></li>
                    <li><Typography variant="h6">Data and Analytics</Typography></li>
                    <li><Typography variant="h6">Your Next Big Thing</Typography></li>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ fontSize: 32, color: 'primary.main' }}>
                      {/* location icon SVG */}
                      <svg width="29" height="35" viewBox="0 0 29 35"><path d="M14.5 0.710938C6.89844 0.710938 0.664062 6.72656 0.664062 14.0547C0.664062 19.9062 9.03125 29.5859 12.6406 33.5234C13.1328 34.0703 13.7891 34.3437 14.5 34.3437C15.2109 34.3437 15.8672 34.0703 16.3594 33.5234C19.9688 29.6406 28.3359 19.9062 28.3359 14.0547C28.3359 6.67188 22.1016 0.710938 14.5 0.710938ZM14.9375 32.2109C14.6641 32.4844 14.2812 32.4844 14.0625 32.2109C11.3828 29.3125 2.57812 19.3594 2.57812 14.0547C2.57812 7.71094 7.9375 2.625 14.5 2.625C21.0625 2.625 26.4219 7.76562 26.4219 14.0547C26.4219 19.3594 17.6172 29.2578 14.9375 32.2109Z"/></svg>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>My Location</Typography>
                      <Typography variant="body2"><a href="https://www.bing.com/" target="_blank" rel="noreferrer">660 Woodward Ave Ste 1975<br/>Detroit, MI 48226</a></Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ fontSize: 32, color: 'primary.main' }}>
                      {/* mail icon */}
                      <svg width="34" height="25" viewBox="0 0 34 25"><path d="M30.5156 0.960938H3.17188C1.42188 0.960938 0 2.38281 0 4.13281V20.9219C0 22.6719 1.42188 24.0938 3.17188 24.0938H30.5156C32.2656 24.0938 33.6875 22.6719 33.6875 20.9219V4.13281C33.6875 2.38281 32.2656 0.960938 30.5156 0.960938ZM30.5156 2.875C30.7891 2.875 31.0078 2.92969 31.2266 3.09375L17.6094 11.3516C17.1172 11.625 16.5703 11.625 16.0781 11.3516L2.46094 3.09375C2.67969 2.98438 2.89844 2.875 3.17188 2.875H30.5156ZM30.5156 22.125H3.17188C2.51562 22.125 1.91406 21.5781 1.91406 20.8672V5.00781L15.0391 12.9922C15.5859 13.3203 16.1875 13.4844 16.7891 13.4844C17.3906 13.4844 17.9922 13.3203 18.5391 12.9922L31.6641 5.00781V20.8672C31.7734 21.5781 31.1719 22.125 30.5156 22.125Z"/></svg>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>How Can I Help?</Typography>
                      <Typography variant="body2"><a href="mailto:steve.kaschimer@slalom.com">steve.kaschimer@slalom.com</a></Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Paper elevation={2} sx={{ p: { xs: 3, md: 6 } }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Send us a Message</Typography>
                <Box component="form" noValidate>
                  <TextField fullWidth label="Full Name*" name="fullName" placeholder="Adam Gelius" variant="standard" sx={{ mb: 2 }} />
                  <TextField fullWidth label="Email*" name="email" placeholder="example@yourmail.com" variant="standard" sx={{ mb: 2 }} />
                  <TextField fullWidth label="Phone*" name="phone" placeholder="+885 1254 5211 552" variant="standard" sx={{ mb: 2 }} />
                  <TextField fullWidth label="Message*" name="message" placeholder="type your message here" variant="standard" multiline rows={4} sx={{ mb: 2 }} />
                  <Box>
                    <Button type="submit" variant="contained">Send Message</Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
}