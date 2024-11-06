import Banner from "../components/banner"
import About from "../components/about"
export default function Home() {
  return (
    <div>
      <div>
        <Banner pageName="about" />
      </div>
      <div>
        <About />
      </div>
    </div>
  );
}
