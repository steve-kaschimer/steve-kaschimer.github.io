import Link from 'next/link'
import Image from 'next/image'
import * as React from 'react'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
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
      <Card elevation={3} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'relative', width: '100%', height: 260 }}>
          <Image src={cover} alt={coverAlt} fill style={{ objectFit: 'cover' }} />
        </Box>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="h6" component="h3">
              <Link href={`/posts/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{title}</Link>
            </Typography>
            {date && <Chip label={formatDate(date)} color="primary" size="small" />}
          </Box>
          {excerpt && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{excerpt}</Typography>}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button size="small" variant="contained" component="a" href={`/posts/${slug}`}>Read</Button>
        </CardActions>
      </Card>
    </Box>
  )
}
