import Banner from "../components/banner"
import About from "../components/about"
export default function Home() {
  return (
    <div>
      <div id="banner">
        <Banner pageName="about" />
      </div>
      <div id="main">
        <About />
      </div>
    </div>
  );
}
