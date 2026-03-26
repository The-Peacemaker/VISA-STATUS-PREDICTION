import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import { ToastProvider } from './components/ToastProvider';
import CustomCursor from './components/CustomCursor';

const pageMap = {
  '/': HomePage,
  '/predict': DashboardPage,
  '/dashboard': DashboardPage,
  '/history': HistoryPage,
};

export default function App() {
  const location = useLocation();
  const ActivePage = pageMap[location.pathname] ?? HomePage;

  return (
    <ToastProvider>
      <div className="relative min-h-screen overflow-hidden bg-obsidian text-ivory">
        <CustomCursor />
        <div className="lux-grid pointer-events-none fixed inset-0 z-0 opacity-55" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-grain bg-[length:3px_3px] opacity-40" />
        <div className="pointer-events-none fixed -top-48 right-[-9rem] z-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none fixed -bottom-56 -left-24 z-0 h-[30rem] w-[30rem] rounded-full bg-glow/20 blur-3xl" />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed left-[-20%] top-[15%] z-0 h-56 w-[40rem] rounded-full bg-gradient-to-r from-transparent via-gold/20 to-transparent blur-2xl"
          animate={{ x: ['0%', '65%', '0%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed right-[-15%] top-[55%] z-0 h-52 w-[34rem] rounded-full bg-gradient-to-r from-transparent via-glow/20 to-transparent blur-2xl"
          animate={{ x: ['0%', '-55%', '0%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />

        <Navbar />
        <motion.div
          key={`route-line-${location.pathname}`}
          className="fixed left-0 right-0 top-0 z-50 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent"
          initial={{ scaleX: 0, opacity: 0.7 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          style={{ transformOrigin: 'left center' }}
        />
        <main
          className="relative z-10 px-3 pb-16 sm:px-4 md:px-8 md:pb-20 lg:px-12"
          style={{ paddingTop: 'calc(var(--app-nav-height, 88px) + 0.9rem)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <ActivePage />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ToastProvider>
  );
}
