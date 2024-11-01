import Banner from "../../components/banner"
import About from "../../components/about"
import Team from "../../components/team"

export default function Page() {
    return (
        <div className="w-full m-auto flex flex-col">
            <div>
                <Banner pageName="about" />
            </div>
            <div>
                <About />
                <Team />
            </div>
        </div>
    );
}