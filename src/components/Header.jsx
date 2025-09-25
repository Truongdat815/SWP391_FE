import { Link, NavLink } from "react-router"


function Header() {
  return (
    <header className="w-full bg-neutral-900 text-white">
      <div className="hidden md:block border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="opacity-80">+12505550199</span>
            <span className="opacity-80">Autovault@gmail.com</span>
            <span className="opacity-80">280 Augusta Avenue, M5T 2L9 Toronto, Canada</span>
          </div>
          <div className="flex items-center gap-3 opacity-80">
            <span>in</span>
            <span>fb</span>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-6 rounded-sm bg-orange-500" />
            <span className="font-extrabold tracking-wider">AUTO<span className="text-orange-500">VAULT</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <NavLink to="/" className={({ isActive }) => `hover:text-orange-500 ${isActive ? 'text-orange-500' : ''}`}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => `hover:text-orange-500 ${isActive ? 'text-orange-500' : ''}`}>About Us</NavLink>
            <NavLink to="/listing" className={({ isActive }) => `hover:text-orange-500 ${isActive ? 'text-orange-500' : ''}`}>Listing</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `hover:text-orange-500 ${isActive ? 'text-orange-500' : ''}`}>Shop</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `hover:text-orange-500 ${isActive ? 'text-orange-500' : ''}`}>Contact</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/signin" className="hidden md:inline-flex px-4 py-2 rounded-md bg-white text-neutral-900 hover:bg-gray-100">Sign In</Link>
            <Link to="/add-car" className="inline-flex px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500">Add Car</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


