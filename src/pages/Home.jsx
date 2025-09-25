function Home() {
  return (
    <main className="bg-neutral-900 text-white">
      <section className="relative">
        <div className="absolute inset-0 bg-[url('https://cmu-cdn.vinfast.vn/2025/07/c3240abf-vinfastchamsocchiasekvto-1536x645.png')] bg-center bg-cover opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Unleash the Road: Discover
            <br />
            Your Perfect <span className="text-orange-500">Cars</span> Ride Today
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl">
            Giao diện demo theo thiết kế cung cấp, sử dụng TailwindCSS.
          </p>
          <div className="mt-10">
            <a href="#" className="inline-flex px-6 py-3 rounded-md bg-orange-600 hover:bg-orange-500">Learn More</a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home


