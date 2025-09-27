import { Link, NavLink } from "react-router-dom"
import logo from "../assets/images/logo.svg"


function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 text-neutral-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-18 w-auto object-contain" />
        </Link>

        <nav className="hidden xl:flex items-center gap-8 text-[18px] font-medium">
          <a href="#about" className="relative py-2 hover:text-emerald-600 transition-colors">
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-emerald-600 hover:after:w-full after:transition-all">Giới thiệu</span>
          </a>
          <a href="#" className="relative py-2 hover:text-emerald-600 transition-colors">
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-emerald-600 hover:after:w-full after:transition-all">Ô tô</span>
          </a>
          <a href="#" className="relative py-2 hover:text-emerald-600 transition-colors">
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-emerald-600 hover:after:w-full after:transition-all">Phụ kiện xe</span>
          </a>
          <a href="#" className="relative py-2 hover:text-emerald-600 transition-colors">
            <span className="after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-emerald-600 hover:after:w-full after:transition-all">Pin và trạm sạc</span>
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/signin" className="hidden md:inline-flex px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[16px]">Đăng nhập</Link>
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

