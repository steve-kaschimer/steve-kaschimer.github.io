import ContactForm from "../../components/contactForm"
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

export default function Page() {
    return (
        <Box>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <ContactForm />
            </Container>
        </Box>
    );
}