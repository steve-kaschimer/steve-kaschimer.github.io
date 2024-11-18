import Banner from "../../components/banner"
import ContactForm from "../../components/contactForm"

export default function Page() {
    return (
        <div className="w-full m-auto flex flex-col">
            <div>
                <Banner pageName="contact" />
            </div>
            <div>
                <ContactForm />
            </div>
        </div>
    );
}