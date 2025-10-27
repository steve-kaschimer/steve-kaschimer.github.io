import BlogList from "../components/blogList"
import { getAllPosts } from "../lib/markdown"
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

export default async function Home() {
  const posts = getAllPosts()

  return (
    <Box>
      <Container component="main" id="main" maxWidth="lg" sx={{ mt: 4 }}>
        <BlogList posts={posts} />
      </Container>
    </Box>
  )
}
