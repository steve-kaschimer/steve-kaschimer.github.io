import Banner from "../../components/banner"
import Work from "../../components/work"

export default function Page() {
    return (
        <div className="w-full m-auto flex flex-col">
            <div>
                <Banner pageName="work" />
            </div>
            <div>
                <Work />
            </div>
        </div>
    );
}