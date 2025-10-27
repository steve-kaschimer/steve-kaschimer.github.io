"use client"

import { useMemo, useState } from 'react'
import BlogCard from './blogCard'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const PAGE_SIZE = 6

export default function BlogList({ posts = [] }) {
  const [page, setPage] = useState(1)

  const total = posts.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const visible = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return posts.slice(start, start + PAGE_SIZE)
  }, [posts, page])

  if (!posts || posts.length === 0) {
    return (
      <Box component="section" sx={{ py: 6 }}>
        <Typography align="center" color="text.secondary">No posts yet.</Typography>
      </Box>
    )
  }

  return (
    <Box component="section" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 4, md: 8 } }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
        <Grid container spacing={3}>
          {visible.map((p) => (
            <Grid item key={p.slug} size={{ xs: 12, sm: 6, md: 4 }}>
              <BlogCard post={p} />
            </Grid>
          ))}
        </Grid>

        {totalPages > 1 && (
          <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
            />
            <Typography variant="body2" color="text.secondary">Page {page} of {totalPages}</Typography>
          </Stack>
        )}
      </Box>
    </Box>
  )
}
