import React from 'react'
import { getPostSlugs, getPostData } from '../../lib/markdown'
import Box from '@mui/material/Box'
import Image from 'next/image'
import blurDataURLForPath from '../../lib/blurPlaceholder'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export async function getStaticPaths() {
  const slugs = getPostSlugs().map((s) => s.replace(/\.md$/, ''))
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const post = await getPostData(params.slug)
  return { props: { post } }
}

export default function PostPage({ post }) {
  // The existing BlogPost component is fairly opinionated; we'll pass the HTML
  // content as a prop and render a simple wrapper here to avoid heavy edits.
  // normalize date to yyyy-mm-dd for display
  const rawDate = post.frontmatter.date || post.frontmatter.publishDate || ''
  let displayDate = rawDate
  try {
    const d = new Date(rawDate)
    if (!Number.isNaN(d.getTime())) {
      displayDate = d.toISOString().slice(0, 10)
    }
  } catch (e) {
    // leave displayDate as rawDate if parsing fails
  }

  const cover = post.frontmatter.coverImage || ''
  const coverAlt = post.frontmatter.coverAlt || post.frontmatter.title || ''

  return (
    <Box component="main">
      {/* Hero section: full-bleed background image with overlay and title/meta on top */}
      {cover ? (
        <Box
          component="header"
          sx={{
            width: '100%',
            height: { xs: 240, sm: 320, md: 420 },
            position: 'relative',
            display: 'block',
            bgcolor: 'grey.900',
            color: 'common.white',
            overflow: 'hidden',
          }}
          aria-label={coverAlt}
        >
          <Image
            src={cover}
            alt={coverAlt}
            fill
            sizes="(max-width: 600px) 100vw, 1200px"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            placeholder="blur"
            blurDataURL={blurDataURLForPath(cover)}
          />

          {/* dark overlay for contrast */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.45)',
              zIndex: 1,
            }}
          />

          <Container
            maxWidth="lg"
            sx={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              py: { xs: 3, sm: 4, md: 6 },
            }}
          >
            <Box>
              <Typography
                component="h1"
                variant="h3"
                sx={{ fontWeight: 700, color: 'common.white', mb: 1 }}
              >
                {post.frontmatter.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                {post.frontmatter.author}{displayDate ? ` · ${displayDate}` : ''}
              </Typography>
            </Box>
          </Container>
        </Box>
      ) : (
        <Box component="header" sx={{ py: { xs: 4, md: 6 } }}>
          <Container maxWidth="lg">
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {post.frontmatter.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {post.frontmatter.author}{displayDate ? ` · ${displayDate}` : ''}
            </Typography>
          </Container>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </Container>
    </Box>
  )
}
