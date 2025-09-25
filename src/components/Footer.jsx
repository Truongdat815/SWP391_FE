function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-7 rounded-sm bg-orange-500" />
            <span className="text-xl font-extrabold tracking-wider">AUTO<span className="text-orange-500">VAULT</span></span>
          </div>
          <p className="mt-5 text-white/70">
            Welcome to Autovault where innovation drives every journey. Discover a range of designed to elevate.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold">Contact & legal</h4>
          <ul className="mt-5 space-y-3 text-white/80">
            <li><a href="#" className="hover:text-orange-500">Legal</a></li>
            <li><a href="#" className="hover:text-orange-500">Privacy policy</a></li>
            <li><a href="#" className="hover:text-orange-500">Cookies policy</a></li>
            <li><a href="#" className="hover:text-orange-500">Disclaimer</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold">Quick Links</h4>
          <ul className="mt-5 space-y-3 text-white/80">
            <li><a href="#" className="hover:text-orange-500">Get In Touch</a></li>
            <li><a href="#" className="hover:text-orange-500">Car Reviews</a></li>
            <li><a href="#" className="hover:text-orange-500">Maintenance Tips</a></li>
            <li><a href="#" className="hover:text-orange-500">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold">Contact Us</h4>
          <ul className="mt-5 space-y-3 text-white/80">
            <li className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 rounded-full bg-white/10" />
              <span>+12505550199</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 rounded-full bg-white/10" />
              <span>autovault@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <p className="text-white/70 text-sm">Copyright © 2025 All Rights Reserved by Autovalut</p>
          <div className="flex items-center gap-4">
            <span className="w-9 h-9 rounded-full border border-white/30 grid place-items-center">x</span>
            <span className="w-9 h-9 rounded-full border border-white/30 grid place-items-center">in</span>
            <span className="w-9 h-9 rounded-full border border-white/30 grid place-items-center">f</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


