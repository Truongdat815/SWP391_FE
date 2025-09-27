import HeroSlider from "../components/HeroSlider"
import AboutVinfast from "../components/AboutVinfast"

function Home() {
  return (
    <main className="bg-white">
      <section className="px-4 lg:px-6 py-6">
        <HeroSlider />
      </section>
      <AboutVinfast />
    </main>
  )
}

export default Home


