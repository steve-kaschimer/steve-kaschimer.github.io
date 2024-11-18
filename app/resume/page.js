import Banner from "../../components/banner"
import Resume from "../../components/resume"

export default function Page() {
    return (
        <div className="w-full m-auto flex flex-col">
            <div>
                <Banner pageName="resume" />
            </div>
            <div>
                <Resume />
            </div>
        </div>
    );
}