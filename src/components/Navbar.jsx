import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onSearch, searchTerm, setSearchTerm }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchTerm?.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const navLinks = [
    { label: 'Home', path: '/', isRoute: true },
    { label: 'TV Shows', action: () => onSearch && onSearch('TV Series') },
    { label: 'Movies', action: () => onSearch && onSearch('Movies') },
    { label: 'New & Popular', action: () => onSearch && onSearch('Trending') },
    { label: 'My List', path: '/watchlist', isRoute: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-4 sm:px-8 md:px-12 py-3.5 ${
        isScrolled
          ? 'bg-brand-bg/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80 py-3'
          : 'bg-linear-to-b from-black/95 via-black/50 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-8 md:gap-10">
          <Link
            to="/"
            className="group flex items-center gap-1.5 focus:outline-none"
          >
            <span className="text-brand-red font-black text-2xl sm:text-3xl tracking-tighter bg-linear-to-r from-brand-red via-[#ff2a34] to-brand-red bg-clip-text group-hover:brightness-125 transition-all">
              CINEMATRIX
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-wide">
            {navLinks.map((link, idx) => (
              <li key={idx}>
                {link.isRoute ? (
                  <Link
                    to={link.path}
                    className={`relative py-1 transition-all duration-200 ${
                      location.pathname === link.path && (!searchTerm || link.path === '/watchlist')
                        ? 'text-white font-semibold'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {location.pathname === link.path && (!searchTerm || link.path === '/watchlist') && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-red rounded-full shadow-[0_0_8px_#E50914]" />
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={link.action}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Search, Notifications & Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Animated Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className={`flex items-center rounded-full transition-all duration-300 ${
              isSearchActive || (searchTerm && searchTerm.length > 0)
                ? 'bg-black/80 border border-white/25 px-3 py-1.5 shadow-lg shadow-black/50'
                : 'bg-transparent border border-transparent'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsSearchActive(!isSearchActive)}
              className="text-gray-300 hover:text-white p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Titles, people, genres..."
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => {
                if (!searchTerm) setIsSearchActive(false);
              }}
              className={`bg-transparent text-xs sm:text-sm text-white focus:outline-none transition-all duration-300 font-normal ${
                isSearchActive || (searchTerm && searchTerm.length > 0)
                  ? 'w-40 sm:w-60 px-2'
                  : 'w-0 px-0'
              }`}
            />
          </form>

          {/* Bell Icon */}
          <button
            className="hidden sm:flex text-gray-300 hover:text-white transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full ring-2 ring-black" />
          </button>

          {/* Profile Avatar (Classic Netflix Smiley) */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-md overflow-hidden transition-transform group-hover:scale-105 shadow-md ring-1 ring-white/10 group-hover:ring-white/40">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                alt="Netflix Profile"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
                className="w-full h-full object-cover"
              />
              <div
                style={{ display: 'none' }}
                className="w-full h-full bg-[#0071eb] items-center justify-center text-white"
              >
                <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
                  <circle cx="11" cy="12" r="2.5" />
                  <circle cx="21" cy="12" r="2.5" />
                  <path d="M9 19c2 3.5 12 3.5 14 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform group-hover:translate-y-0.5 hidden sm:block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 p-1 text-white focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 top-14 bg-brand-bg/95 backdrop-blur-2xl flex flex-col items-start justify-start px-8 pt-8 pb-12 gap-6 text-base font-semibold transition-all duration-300 md:hidden z-40 border-t border-white/10 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map((link, idx) => (
          <div key={idx} className="w-full">
            {link.isRoute ? (
              <Link
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full py-1 text-left transition-colors ${
                  location.pathname === link.path ? 'text-brand-red font-bold' : 'text-gray-200 hover:text-brand-red'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (link.action) link.action();
                }}
                className="block w-full py-1 text-left text-gray-200 hover:text-brand-red transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
