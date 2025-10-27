import BlogList from "../components/blogList"
import { getAllPosts } from "../lib/markdown"
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

export default async function Home() {
  const all = getAllPosts()

  // only include posts with a valid frontmatter date (or publishDate)
  // and where that date is today or earlier
  const now = new Date()
  const posts = all.filter((p) => {
    const fm = p.frontmatter || {}
    const raw = fm.date || fm.publishDate
    if (!raw) return false
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return false
    // compare only date (ignore time) by zeroing times
    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return dOnly.getTime() <= nowOnly.getTime()
  })

  return (
    <Box>
      <Container component="main" id="main" maxWidth="lg" sx={{ mt: 4 }}>
        <BlogList posts={posts} />
      </Container>
    </Box>
  )
}
