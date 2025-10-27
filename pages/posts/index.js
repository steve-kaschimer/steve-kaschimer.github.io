import Link from 'next/link'
import { getAllPosts } from '../../lib/markdown'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

export async function getStaticProps() {
  const posts = getAllPosts()
  return { props: { posts } }
}

export default function PostsIndex({ posts }) {
  return (
    <main>
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 3 }}>Posts</Typography>
        <List>
          {posts.map((p) => (
            <ListItem key={p.slug} disableGutters>
              <ListItemText
                primary={<Link href={`/posts/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.frontmatter.title || p.slug}</Link>}
                secondary={p.frontmatter.description || ''}
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </main>
  )
}
