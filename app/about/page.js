import Banner from "../../components/banner"
import About from "../../components/about"

export default function Page() {
    return (
        <div className="w-full m-auto flex flex-col">
            <div>
                <Banner pageName="about" />
            </div>
            <div>
                <About />
            </div>
        </div>
    );
}