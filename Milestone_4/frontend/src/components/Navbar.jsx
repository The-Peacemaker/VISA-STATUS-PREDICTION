import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { label: 'Home', to: '/' },
  { label: 'PREDICT', to: '/predict' },
  { label: 'History', to: '/history' },
];

export default function Navbar() {
  const location = useLocation();
  const onLanding = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const syncNavHeight = () => {
      if (!headerRef.current) {
        return;
      }
      const height = headerRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--app-nav-height', `${Math.ceil(height)}px`);
    };

    syncNavHeight();

    let observer;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      observer = new ResizeObserver(syncNavHeight);
      observer.observe(headerRef.current);
    }

    window.addEventListener('resize', syncNavHeight);
    return () => {
      window.removeEventListener('resize', syncNavHeight);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [menuOpen, location.pathname]);

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border-[3px] border-borderStrong bg-slateDeep/75 px-3 py-3 shadow-panel backdrop-blur-md md:px-6">
        <Link to="/" className="group inline-flex min-w-0 items-center gap-3" onClick={closeMenu}>
          <div className="h-10 w-10 rounded-lg border-[3px] border-gold/70 bg-obsidian grid place-items-center font-display text-lg text-gold transition group-hover:animate-pulseGlow">
            V
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-[0.8rem] leading-none text-ivory sm:text-base md:text-lg">VISA STATUS PREDICTION</p>
            <p className="hidden truncate text-[10px] uppercase tracking-[0.2em] text-gold/85 sm:block md:text-xs">
              Built by Benedict
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="grid h-10 w-10 place-items-center rounded-lg border-2 border-borderStrong bg-obsidian/50 text-ivory transition hover:border-gold/70 md:hidden"
        >
          <span className="text-lg leading-none">{menuOpen ? 'x' : '='}</span>
        </button>

        <nav className="hidden items-center gap-2 md:flex md:gap-3">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative overflow-hidden rounded-lg border-2 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition md:px-4 ${
                  isActive
                    ? 'border-gold bg-gold/15 text-ivory shadow-glowGold'
                    : 'border-borderStrong bg-obsidian/40 text-ivory/80 hover:border-gold/70 hover:text-ivory'
                }`
              }
            >
              {location.pathname === item.to ? (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-gold/18 to-glow/18"
                  transition={{ type: 'spring', stiffness: 330, damping: 30 }}
                />
              ) : null}
              {item.label}
            </NavLink>
          ))}

          {onLanding ? (
            <motion.a
              href="#how-it-works"
              whileTap={{ scale: 0.96 }}
              className="ml-2 hidden rounded-lg border-[3px] border-borderStrong bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-obsidian shadow-brutal transition hover:bg-ivory md:inline-block"
            >
              How It Works ?
            </motion.a>
          ) : null}
        </nav>
      </div>

      {menuOpen ? (
        <div className="mx-auto mt-2 w-full max-w-7xl rounded-2xl border-[3px] border-borderStrong bg-slateDeep/95 p-3 shadow-panel backdrop-blur-md md:hidden">
          <div className="grid gap-2">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg border-2 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition ${
                    isActive
                      ? 'border-gold bg-gold/15 text-ivory shadow-glowGold'
                      : 'border-borderStrong bg-obsidian/40 text-ivory/80 hover:border-gold/70 hover:text-ivory'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {onLanding ? (
              <a
                href="#how-it-works"
                onClick={closeMenu}
                className="mt-1 rounded-lg border-[3px] border-borderStrong bg-gold px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-obsidian shadow-brutal transition hover:bg-ivory"
              >
                How It Works?
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
