import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash link clicks for smooth scrolling
  useEffect(() => {
    const handleHashClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target && target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const hash = target.getAttribute('href').substring(1);
        const element = document.getElementById(hash);
        if (element) {
          const offset = 80; // Account for fixed navbar
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleHashClick);
    return () => document.removeEventListener('click', handleHashClick);
  }, []);

  const handleHomeClick = (e) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHashLinkClick = (e, hash) => {
    if (isHomePage) {
      // If on homepage, just scroll to section
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    // If not on homepage, let Link navigate to /#hash
    // The Home page will handle scrolling after navigation
  };

  const menuItems = [
    { name: 'Trang chủ', href: '/', isHash: false, isHome: true },
    { name: 'Dòng xe', href: isHomePage ? '#models' : '/cars', isHash: isHomePage, hash: 'models' },
    { name: 'Phụ kiện', href: isHomePage ? '#accessories' : '/#accessories', isHash: true, hash: 'accessories' },
    { name: 'Trạm sạc', href: isHomePage ? '#charging' : '/#charging', isHash: true, hash: 'charging' },
    { name: 'Đại lý', href: '/dealers', isHash: false }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <Link 
              to="/" 
              onClick={(e) => {
                if (isHomePage) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center space-x-3"
            >
              <div className="bg-white p-2 rounded-lg shadow-md">
                <img src={logo} alt="Electra Logo" className="h-8 w-auto" />
              </div>
              <span className={`text-2xl font-extrabold ${isScrolled || !isHomePage ? 'bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent' : 'text-white'}`}>Electra</span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {menuItems.map((item, index) => {
                // Use Link for all items, but handle hash links specially
                const menuProps = { to: item.href };
                
                // Add onClick handler
                if (item.isHome && isHomePage) {
                  menuProps.onClick = handleHomeClick;
                } else if (item.hash) {
                  menuProps.onClick = (e) => handleHashLinkClick(e, item.hash);
                }
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link
                      {...menuProps}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isScrolled || !isHomePage
                          ? 'text-slate-700 hover:text-emerald-600 font-medium' 
                          : 'text-white hover:text-emerald-300 font-medium'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Login Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signin"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 inline-block"
                >
                  Đăng nhập
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${
                isScrolled || !isHomePage
                  ? 'text-gray-700 hover:text-green-600' 
                  : 'text-white hover:text-green-200'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-md"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item, index) => {
                const menuProps = { to: item.href };
                
                // Add onClick handler
                const handleClick = (e) => {
                  setIsMobileMenuOpen(false);
                  if (item.isHome && isHomePage) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (item.hash) {
                    handleHashLinkClick(e, item.hash);
                  }
                };
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      {...menuProps}
                      onClick={handleClick}
                      className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full mt-4 bg-[#6CA12B] text-white px-6 py-3 rounded-full font-semibold text-center inline-block"
                >
                  Đăng nhập
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
