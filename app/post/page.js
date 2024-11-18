import Banner from "../../components/banner"
import BlogPost from "../../components/blogPost"

export default function Page({postId}) {
    return (
        <div className="w-full m-auto flex flex-col">
            <div>
                <Banner pageName="blog" />
            </div>
            <div>
                <BlogPost postId={postId} />
            </div>
        </div>
    );
}