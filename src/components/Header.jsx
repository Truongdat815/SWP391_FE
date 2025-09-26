import { Link, NavLink } from "react-router-dom"
import logo from "../assets/images/vinfast-logo.png"


function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 text-neutral-900 shadow-header border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="VinFast" className="h-8 w-auto object-contain" />
          <span className="hidden sm:inline-block text-xl font-semibold tracking-wide text-[rgb(var(--vin-primary))]">VinFast</span>
        </Link>

        <nav className="hidden xl:flex items-center gap-8 text-[16px]">
          <NavLink to="/about" className={({ isActive }) => `relative py-2 transition-colors hover:text-[rgb(var(--vin-accent))] ${isActive ? 'text-[rgb(var(--vin-accent))]' : ''}`}>
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[rgb(var(--vin-accent))] hover:after:w-full after:transition-all">Giới thiệu</span>
          </NavLink>
          <NavLink to="/listing" className={({ isActive }) => `relative py-2 transition-colors hover:text-[rgb(var(--vin-accent))] ${isActive ? 'text-[rgb(var(--vin-accent))]' : ''}`}>
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[rgb(var(--vin-accent))] hover:after:w-full after:transition-all">Ô tô</span>
          </NavLink>
          <a href="#" className="relative py-2 hover:text-[rgb(var(--vin-accent))] transition-colors">
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[rgb(var(--vin-accent))] hover:after:w-full after:transition-all">Phụ kiện xe</span>
          </a>
          <a href="#" className="relative py-2 hover:text-[rgb(var(--vin-accent))] transition-colors">
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[rgb(var(--vin-accent))] hover:after:w-full after:transition-all">Pin và trạm sạc</span>
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/signin" className="hidden md:inline-flex text-[rgb(var(--vin-accent))] hover:text-[rgb(var(--vin-accent))]/80 font-medium text-[16px]">Đăng nhập</Link>
          <button aria-label="Menu" className="inline-flex xl:hidden p-2 rounded-md hover:bg-neutral-100">
            <span className="sr-only">Open menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header


