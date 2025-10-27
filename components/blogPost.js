import React from 'react'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

/**
 * BlogPost (clean)
 * Props:
 *  - post: { frontmatter: { title, cover, author, authorImage, date, authorBio }, content: HTML }
 *  - postId: optional (for placeholder rendering)
 */
export default function BlogPost({ post, postId }) {
    if (!post) {
        return (
            <Box component="main" sx={{ py: 6 }}>
                <Container maxWidth="lg">
                    <Typography variant="h5">Post not available</Typography>
                    {postId ? (
                        <Typography variant="body2" color="text.secondary">Requested id: {postId}</Typography>
                    ) : (
                        <Typography variant="body2" color="text.secondary">No post data provided.</Typography>
                    )}
                </Container>
            </Box>
        )
    }

    const { frontmatter = {}, content = '' } = post

    return (
        <Box component="main" sx={{ py: { xs: 4, md: 8 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={8}>
                        <Card sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
                            {frontmatter.cover ? (
                                <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', height: { xs: 220, md: 380 }, mb: 3 }}>
                                    <Image src={frontmatter.cover} alt={frontmatter.title || 'cover'} fill style={{ objectFit: 'cover' }} />
                                </Box>
                            ) : null}

                            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                                {frontmatter.title}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Avatar src={frontmatter.authorImage || '/assets/images/blog/author-01.png'} alt={frontmatter.author || 'Author'} />
                                    <Box>
                                        <Typography variant="body2">{frontmatter.author}</Typography>
                                        <Typography variant="caption" color="text.secondary">{frontmatter.date || frontmatter.publishDate}</Typography>
                                    </Box>
                                </Box>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    {frontmatter.tags && frontmatter.tags.slice?.(0,3).map((t) => (<Chip key={t} label={t} size="small" />))}
                                </Stack>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ maxWidth: '65ch', mx: 'auto' }}>
                                <article className="prose" dangerouslySetInnerHTML={{ __html: content }} />
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Card sx={{ position: 'sticky', top: 96 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 1 }}>About the author</Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                    <Avatar src={frontmatter.authorImage || '/assets/images/blog/author-01.png'} alt={frontmatter.author || 'Author'} sx={{ width: 64, height: 64 }} />
                                    <Box>
                                        <Typography variant="subtitle2">{frontmatter.author}</Typography>
                                        <Typography variant="caption" color="text.secondary">{frontmatter.authorBio || 'Author bio not provided.'}</Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="body2" sx={{ mb: 1 }} className="muted">Share</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button variant="outlined" size="small">Twitter</Button>
                                    <Button variant="outlined" size="small">LinkedIn</Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}
