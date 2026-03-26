import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import SectionReveal from '../components/SectionReveal';
import { INPUT_FIELD_KEYS, VISUALIZATION_PANELS } from '../lib/dashboardMeta';
import { getHistory } from '../lib/storage';

const steps = [
  {
    title: 'Provide Application Inputs',
    body: 'Enter continent, education, employment context, wage details, and application month.',
  },
  {
    title: 'Run Prediction Flow',
    body: 'The prediction engine evaluates the submitted profile and returns estimated processing-time output.',
  },
  {
    title: 'Review Visual Insights',
    body: 'Review confidence score, month-wise trend analysis, and continent-wise comparison charts.',
  },
];

const features = [
  'Processing Time Prediction',
  'AI Confidence Score',
  'Trend Analysis',
  'Prediction History Vault',
];

const tickerItems = [
  'PROFILE-DRIVEN PREDICTION',
  'CONFIDENCE-BASED RESULTS',
  '12-MONTH TREND VISUALIZATION',
  'CONTINENT COMPARISON ANALYTICS',
  'EXPORTABLE HISTORY TRACKING',
];

function useAnimatedCounter(targets) {
  const [values, setValues] = useState(targets.map(() => 0));

  useEffect(() => {
    const start = performance.now();
    const duration = 1450;

    let raf = null;
    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValues(targets.map((item) => Math.round(item.value * eased)));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targets]);

  return values;
}

export default function HomePage() {
  const [historyCount, setHistoryCount] = useState(() => getHistory().length);

  useEffect(() => {
    const refreshHistoryCount = () => {
      setHistoryCount(getHistory().length);
    };

    window.addEventListener('focus', refreshHistoryCount);
    window.addEventListener('storage', refreshHistoryCount);
    window.addEventListener('visa-history-updated', refreshHistoryCount);

    return () => {
      window.removeEventListener('focus', refreshHistoryCount);
      window.removeEventListener('storage', refreshHistoryCount);
      window.removeEventListener('visa-history-updated', refreshHistoryCount);
    };
  }, []);

  const statsTarget = useMemo(
    () => [
      { label: 'Input Dimensions', value: INPUT_FIELD_KEYS.length },
      { label: 'Visualization Panels', value: VISUALIZATION_PANELS.length },
      { label: 'History Tracking', value: historyCount },
    ],
    [historyCount]
  );

  const counters = useAnimatedCounter(statsTarget);

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, idx) => ({
        id: idx,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
      <SectionReveal className="relative overflow-hidden rounded-3xl border-[3px] border-borderStrong bg-slateDeep/60 px-6 py-12 shadow-panel md:px-12 md:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(194,168,120,0.18),transparent_42%),radial-gradient(circle_at_80%_30%,rgba(142,230,230,0.16),transparent_35%)]" />
          <motion.div
            aria-hidden="true"
            className="hero-orb absolute -left-8 top-8 h-32 w-32 bg-gold/80"
            animate={{ x: [0, 12, -6, 0], y: [0, -9, 8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="hero-orb absolute right-8 top-10 h-28 w-28 bg-glow/80"
            animate={{ x: [0, -9, 10, 0], y: [0, 8, -8, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {particles.map((dot) => (
            <motion.span
              key={dot.id}
              className="absolute rounded-full bg-ivory/50"
              style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size }}
              animate={{ y: [0, -10, 0], opacity: [0.45, 0.8, 0.45] }}
              transition={{ repeat: Infinity, duration: 3.8, delay: dot.delay }}
            />
          ))}
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border-2 border-gold/60 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Visa Processing Intelligence Platform
            </p>
            <h1 className="section-title text-4xl leading-tight text-ivory md:text-6xl">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="block"
              >
                Visa Status Prediction &
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
                className="gradient-text block"
              >
                Processing Time Estimator
              </motion.span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-ivory/80 md:text-lg">
              A structured prediction interface for visa processing-time estimation, designed with clear inputs,
              transparent outputs, and analytics-ready visual interpretation.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4" id="predict">
              <a href="#how-it-works">
                <AnimatedButton>How It Works?</AnimatedButton>
              </a>
              <Link
                to="/predict"
                className="rounded-xl border-[3px] border-borderStrong bg-obsidian/50 px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-ivory transition hover:border-gold"
              >
                Predict
              </Link>
            </div>
          </div>

          <div className="neo-brutal-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Platform Snapshot</p>
            <div className="mt-3 space-y-4">
              <div className="rounded-xl border-2 border-borderStrong bg-obsidian/70 p-3">
                <p className="text-sm text-ivory/70">Prediction Dimensions</p>
                <p className="section-title mt-1 text-2xl text-ivory">Workforce + Wage + Region + Month</p>
              </div>
              <div className="rounded-xl border-2 border-borderStrong bg-obsidian/70 p-3">
                <p className="text-sm text-ivory/70">Insight Outputs</p>
                <p className="section-title mt-1 text-2xl text-glow">Confidence + Trend + Comparison</p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.03}>
        <div className="glass-strip px-3">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`} className="text-xs font-semibold uppercase tracking-[0.2em] text-ivory/85">
                {item}
                <span className="ml-6 text-gold">◆</span>
              </span>
            ))}
          </div>
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-5" delay={0.05}>
        <h2 id="how-it-works" className="section-title text-3xl text-ivory md:text-4xl">
          How It Works
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              whileHover={{ y: -6, rotate: index === 1 ? -0.8 : 0.6 }}
              className="neo-brutal-card p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Step {index + 1}</p>
              <h3 className="section-title mt-2 text-2xl text-ivory">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/80">{step.body}</p>
            </motion.article>
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-5" delay={0.07}>
        <h2 className="section-title text-3xl text-ivory md:text-4xl">Feature Matrix</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? -0.6 : 0.6 }}
              className="neo-brutal-card p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Capability {index + 1}</p>
              <p className="mt-2 text-lg font-semibold text-ivory">{feature}</p>
            </motion.div>
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-5" delay={0.1}>
        <h2 className="section-title text-3xl text-ivory md:text-4xl">Live Stats</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {statsTarget.map((item, idx) => (
            <div key={item.label} className="neo-brutal-card p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-gold">{item.label}</p>
              <p className="section-title mt-3 text-4xl text-glow">
                {counters[idx].toLocaleString()}
                {item.suffix || ''}
              </p>
            </div>
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="space-y-5" delay={0.12}>
        <h2 className="section-title text-3xl text-ivory md:text-4xl">Platform Highlights</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              title: 'Structured Prediction Workflow',
              body: 'Inputs are organized around real model features to support reliable, repeatable scenario evaluation.',
            },
            {
              title: 'Visualization-First Interpretation',
              body: 'Each prediction is accompanied by confidence and chart-based context to improve interpretation quality.',
            },
          ].map((item, index) => (
            <motion.blockquote
              key={item.title}
              whileHover={{ y: -5, rotate: index ? 0.5 : -0.5 }}
              className="neo-brutal-card p-5"
            >
              <p className="text-base text-ivory/90">{item.body}</p>
              <footer className="mt-4 border-t-2 border-borderStrong pt-3 text-sm text-gold">
                {item.title}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </SectionReveal>
    </div>
  );
}
