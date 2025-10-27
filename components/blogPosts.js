import Image from 'next/image'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Link from 'next/link'

export default function BlogPosts() {
    const posts = [
        { title: 'Meet AutoManage, the best AI management tools', date: 'Dec 22, 2023', img: '/assets/images/blog/blog-01.jpg', href: '/blog/post' },
        { title: 'How to earn more money as a wellness coach', date: 'Mar 15, 2023', img: '/assets/images/blog/blog-02.jpg', href: '/blog/post' },
        { title: 'The no-fuss guide to upselling and cross selling', date: 'Jan 05, 2023', img: '/assets/images/blog/blog-03.jpg', href: '/blog/post' },
    ]

    return (
        <Box component="section" sx={{ py: { xs: 6, md: 12 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {posts.map((p, idx) => (
                        <Grid key={idx} item xs={12} md={6} lg={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardMedia component="div" sx={{ position: 'relative', height: 220 }}>
                                    <Image src={p.img} alt={p.title} fill style={{ objectFit: 'cover' }} />
                                </CardMedia>
                                <CardContent>
                                    <Chip label={p.date} size="small" color="primary" sx={{ mb: 1 }} />
                                    <Typography variant="h6" component="h3" sx={{ mt: 1, mb: 1 }}>
                                        <Link href={p.href} style={{ textDecoration: 'none', color: 'inherit' }}>{p.title}</Link>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    )
}