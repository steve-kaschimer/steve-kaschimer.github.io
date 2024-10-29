import Banner from "../../components/banner"
import BlogPosts from "../../components/blogPosts"

export default function Page() {
    return (
        <div className="w-full m-auto flex flex-col">
            <div>
                <Banner pageName="blog" />
            </div>
            <div>
                <BlogPosts />
            </div>
        </div>
    );
}