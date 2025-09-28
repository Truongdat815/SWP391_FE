import HeroSlider from "../components/HeroSlider"
import AboutVinfast from "../components/AboutVinfast"
import SimpleAccessories from "../components/SimpleAccessories"
import SimpleBattery from "../components/SimpleBattery"

function Home() {
  return (
    <main className="bg-white">
      <section className="px-4 lg:px-6 py-6">
        <HeroSlider />
      </section>
      <AboutVinfast />
      <SimpleAccessories />
      <SimpleBattery />
    </main>
  )
}

export default Home


