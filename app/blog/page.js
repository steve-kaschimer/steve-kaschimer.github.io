import BlogPosts from "../../components/blogPosts"
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

export default function Page() {
    return (
        <Box>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <BlogPosts />
            </Container>
        </Box>
    );
}