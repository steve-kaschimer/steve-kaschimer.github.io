import Link from 'next/link'
import Image from 'next/image'
import blurDataURLForPath from '../lib/blurPlaceholder'
import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return d
  }
}

function estimateReadTime(text) {
  if (!text) return null
  const words = text.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

export default function BlogCard({ post }) {
  const fm = post.frontmatter || post || {}
  const title = fm.title || post.title || post.slug
  const date = fm.date || fm.publishDate || post.date
  const excerpt = fm.excerpt || post.excerpt || (post.content ? post.content.slice(0, 160) + '...' : '')
  const slug = post.slug || fm.slug

  const cover = fm.coverImage || fm.image || post.coverImage || '/assets/images/blog/blog-01.jpg'
  const coverAlt = fm.coverAlt || fm.coverAlt || post.coverAlt || title
  const author = fm.author || post.author || 'Steve Kaschimer'
  const readTime = estimateReadTime(fm.excerpt || post.content || fm.content)
  // per-image tiny SVG blurDataURL placeholder
  const blurDataURL = blurDataURLForPath(cover)

  return (
    <Box mb={4}>
      <Link href={`/posts/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <Card
          elevation={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            // default animation
            transition: 'transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms ease',
            willChange: 'transform',
            '&:hover, &:focus-within': {
              transform: 'scale(1.015)',
              boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
            },
            // respect users' reduced motion preference
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              '&:hover, &:focus-visible': {
                transform: 'none',
                boxShadow: 'none',
              },
            },
            outline: 'none',
          }}
          
        >
          <Box sx={{ position: 'relative', width: '100%', height: 260 }}>
            <Image src={cover} alt={coverAlt} fill style={{ objectFit: 'cover' }} placeholder="blur" blurDataURL={blurDataURL} />
            {/* overlay to ensure title contrast */}
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 40%, rgba(2,6,23,0.50) 100%)', pointerEvents: 'none' }} />
            {/* metadata chips */}
            <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, left: 12, pointerEvents: 'none' }}>
              <Chip label={author} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', fontWeight: 600 }} />
              {readTime && <Chip label={readTime} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.35)', color: '#fff' }} />}
            </Stack>
            {/* title over hero */}
            <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 16, pointerEvents: 'none' }}>
              <Typography variant="h6" component="h3" sx={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)', fontWeight: 800 }}>
                {title}
              </Typography>
            </Box>
          </Box>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ width: '100%' }}>
                {/* screen-reader-only title fallback */}
                <Box component="span" sx={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: 'hidden',
                  clip: 'rect(0,0,0,0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}>{title}</Box>
              </Box>
              {date && <Chip label={formatDate(date)} color="secondary" size="small" />}
            </Box>
            {excerpt && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{excerpt}</Typography>}
          </CardContent>
        </Card>
      </Link>
    </Box>
  )
}
