import Link from 'next/link'
import Image from 'next/image'
import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return d
  }
}

export default function BlogCard({ post }) {
  const fm = post.frontmatter || post || {}
  const title = fm.title || post.title || post.slug
  const date = fm.date || fm.publishDate || post.date
  const excerpt = fm.excerpt || post.excerpt || (post.content ? post.content.slice(0, 160) + '...' : '')
  const slug = post.slug || fm.slug

  const cover = fm.coverImage || fm.image || post.coverImage || '/assets/images/blog/blog-01.jpg'
  const coverAlt = fm.coverAlt || fm.coverAlt || post.coverAlt || title

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
            <Image src={cover} alt={coverAlt} fill style={{ objectFit: 'cover' }} />
          </Box>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="h6" component="h3">
                {title}
              </Typography>
              {date && <Chip label={formatDate(date)} color="primary" size="small" />}
            </Box>
            {excerpt && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{excerpt}</Typography>}
          </CardContent>
        </Card>
      </Link>
    </Box>
  )
}
