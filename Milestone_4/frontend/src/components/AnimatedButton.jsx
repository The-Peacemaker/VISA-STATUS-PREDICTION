import { motion } from 'framer-motion';

export default function AnimatedButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, rotate: -0.4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-xl border-[3px] border-borderStrong bg-gold px-6 py-3 font-body text-sm font-bold uppercase tracking-[0.15em] text-obsidian shadow-brutal transition-colors duration-300 hover:bg-ivory ${className}`}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ivory/50 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
