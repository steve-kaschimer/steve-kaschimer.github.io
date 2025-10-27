import BlogPost from "../../components/blogPost"
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

export default function Page({postId}) {
    return (
        <Box>
        
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <BlogPost postId={postId} />
            </Container>
        </Box>
    );
}