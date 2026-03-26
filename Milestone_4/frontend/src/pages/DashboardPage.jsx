import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AnimatedButton from '../components/AnimatedButton';
import SectionReveal from '../components/SectionReveal';
import SkeletonCard from '../components/SkeletonCard';
import { useToast } from '../components/ToastProvider';
import { getPredictionMode, predictVisa } from '../lib/mockApi';
import { generateSmartRandomInput } from '../lib/smartScenario';
import { savePrediction } from '../lib/storage';

const initialForm = {
  continent: 'Asia',
  education_of_employee: "Master's",
  has_job_experience: 'Y',
  requires_job_training: 'N',
  no_of_employees: 500,
  yr_of_estab: 2010,
  region_of_employment: 'West',
  prevailing_wage: 4200,
  unit_of_wage: 'Month',
  full_time_position: 'Y',
  application_month: String(new Date().getMonth() + 1),
};

const continents = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
const educationLevels = ['High School', "Bachelor's", "Master's", 'Doctorate'];
const binaryChoices = ['Y', 'N'];
const employmentRegions = ['Northeast', 'Midwest', 'South', 'West', 'Island'];
const wageUnits = ['Hour', 'Week', 'Month', 'Year'];
const monthOptions = Array.from({ length: 12 }, (_, idx) => String(idx + 1));

const fieldAnimationOrder = [
  'continent',
  'education_of_employee',
  'region_of_employment',
  'application_month',
  'has_job_experience',
  'requires_job_training',
  'unit_of_wage',
  'full_time_position',
  'no_of_employees',
  'yr_of_estab',
  'prevailing_wage',
];

const optionMap = {
  continent: continents,
  education_of_employee: educationLevels,
  region_of_employment: employmentRegions,
  application_month: monthOptions,
  has_job_experience: binaryChoices,
  requires_job_training: binaryChoices,
  unit_of_wage: wageUnits,
  full_time_position: binaryChoices,
};

const statusChips = ['Prediction Workspace', 'Confidence Scoring', 'Trend Analytics'];
const predictionMode = getPredictionMode();

function normalizeConfidencePercent(confidenceValue) {
  const numeric = Number(confidenceValue);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  // Accept both 0-1 (ratio) and 0-100 (already percent) inputs.
  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

export default function DashboardPage() {
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [shuffleState, setShuffleState] = useState('idle');
  const [activeField, setActiveField] = useState('');
  const [aiScenarioMeta, setAiScenarioMeta] = useState(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileBurstActive, setMobileBurstActive] = useState(false);
  const fieldRefs = useRef({});
  const resultAnchorRef = useRef(null);
  const { pushToast } = useToast();

  const isShuffleRunning = shuffleState !== 'idle';
  const isInputLocked = isLoading || isShuffleRunning;
  const speedFactor = isMobileViewport ? 0.78 : 1;

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const syncMobile = () => setIsMobileViewport(query.matches);

    syncMobile();
    query.addEventListener('change', syncMobile);
    window.addEventListener('resize', syncMobile);

    return () => {
      query.removeEventListener('change', syncMobile);
      window.removeEventListener('resize', syncMobile);
    };
  }, []);

  const confidencePercent = useMemo(() => {
    if (!result) {
      return 0;
    }
    return normalizeConfidencePercent(result.confidence);
  }, [result]);

  const confidenceData = useMemo(
    () => [
      { name: 'confidence', value: confidencePercent },
      { name: 'remaining', value: 100 - confidencePercent },
    ],
    [confidencePercent]
  );

  const handleChange = (event) => {
    if (isInputLocked) {
      return;
    }
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const registerFieldRef = (name) => (node) => {
    if (node) {
      fieldRefs.current[name] = node;
    }
  };

  const scrollFieldIntoView = (name) => {
    if (!isMobileViewport) {
      return;
    }
    const target = fieldRefs.current[name];
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const runPrediction = async (sourceForm) => {
    setIsLoading(true);
    setResult(null);

    try {
      const payload = {
        ...sourceForm,
        no_of_employees: Number(sourceForm.no_of_employees),
        yr_of_estab: Number(sourceForm.yr_of_estab),
        prevailing_wage: Number(sourceForm.prevailing_wage),
        application_month: Number(sourceForm.application_month),
      };

      const response = await predictVisa(payload);
      setResult(response);
      savePrediction(response);
      pushToast('Prediction complete: AI forecast generated.', 'success');
    } catch {
      pushToast('Prediction failed. Please retry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isInputLocked) {
      return;
    }

    await runPrediction(form);
  };

  const animateFieldValue = async (name, targetValue) => {
    const options = optionMap[name];

    if (options) {
      for (let idx = 0; idx < 3; idx += 1) {
        const flickerOption = options[(idx + Math.floor(Math.random() * options.length)) % options.length];
        setForm((current) => ({ ...current, [name]: flickerOption }));
        await wait(Math.round(65 * speedFactor));
      }
      setForm((current) => ({ ...current, [name]: targetValue }));
      await wait(Math.round(90 * speedFactor));
      return;
    }

    const numericTarget = Number(targetValue);
    const currentNumeric = Number(form[name]) || numericTarget;
    const direction = numericTarget >= currentNumeric ? 1 : -1;

    for (let idx = 0; idx < 4; idx += 1) {
      const delta = Math.max(1, Math.round(Math.abs(numericTarget - currentNumeric) / (5 - idx)));
      const flicker = numericTarget - direction * delta + Math.round((Math.random() - 0.5) * delta);
      setForm((current) => ({ ...current, [name]: Math.max(0, flicker) }));
      await wait(Math.round(50 * speedFactor));
    }

    setForm((current) => ({ ...current, [name]: targetValue }));
    await wait(Math.round(100 * speedFactor));
  };

  const handleShuffle = async () => {
    if (isInputLocked) {
      return;
    }

    const generated = generateSmartRandomInput();
    setResult(null);
    setAiScenarioMeta(null);

    if (isMobileViewport && navigator.vibrate) {
      navigator.vibrate([18, 12, 34]);
    }

    if (isMobileViewport) {
      setMobileBurstActive(true);
      window.setTimeout(() => setMobileBurstActive(false), 520);
    }

    setShuffleState('activation');
    await wait(Math.round(220 * speedFactor));

    setShuffleState('chaos');
    await wait(Math.round((isMobileViewport ? 340 : 420) * speedFactor));

    setShuffleState('generating');
    if (isMobileViewport) {
      scrollFieldIntoView(fieldAnimationOrder[0]);
      await wait(Math.round(180 * speedFactor));
    }

    for (const name of fieldAnimationOrder) {
      setActiveField(name);
      scrollFieldIntoView(name);
      await wait(Math.round(90 * speedFactor));
      await animateFieldValue(name, generated.form[name]);
      await wait(Math.round(90 * speedFactor));
    }

    setActiveField('');
    setShuffleState('lockin');
    setAiScenarioMeta(generated.meta);
    await wait(Math.round(360 * speedFactor));

    setShuffleState('idle');
    pushToast('Scenario generated. Running prediction...', 'success');

    if (isMobileViewport && resultAnchorRef.current) {
      resultAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      await wait(Math.round(220 * speedFactor));
    }

    await runPrediction(generated.form);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <SectionReveal className="mb-6">
        <h1 className="section-title text-3xl text-ivory sm:text-4xl md:text-5xl">Prediction Studio</h1>
        <p className="mt-2 max-w-3xl text-ivory/75">
          Submit application context and review estimated processing-time output with confidence and chart-based visualization.
        </p>
        <p className="mt-2 max-w-3xl text-sm text-ivory/60">
          {predictionMode === 'live-api'
            ? 'Live API mode: results are served from the deployed Vercel backend model endpoint.'
            : 'Mock mode: set VITE_API_BASE_URL to enable live backend predictions.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {statusChips.map((chip, idx) => (
            <motion.span
              key={chip}
              className="rounded-full border-2 border-borderStrong bg-obsidian/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-ivory/80"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
            >
              {chip}
            </motion.span>
          ))}
        </div>
      </SectionReveal>

      <div className={`dashboard-shell grid gap-6 lg:grid-cols-[0.95fr_1.05fr] ${isShuffleRunning ? 'shuffle-active' : ''} ${shuffleState === 'chaos' ? 'shuffle-chaos' : ''}`}>
        <SectionReveal className="neo-brutal-card p-5 md:p-6">
          <h2 className="section-title text-2xl text-ivory">Application Inputs</h2>
          {aiScenarioMeta ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border-2 border-gold/80 bg-obsidian/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold"
              title="AI-generated scenarios are randomized but constrained to realistic combinations."
            >
              AI Generated Scenario
              <span className="truncate text-ivory/70 normal-case tracking-normal text-xs">
                {aiScenarioMeta.country} · {aiScenarioMeta.visaType} · {aiScenarioMeta.processingOffice}
              </span>
            </motion.div>
          ) : null}

          <form
            className={`dashboard-form mt-5 grid gap-4 ${shuffleState === 'chaos' ? 'shuffle-chaos' : ''} ${shuffleState === 'lockin' ? 'shuffle-lockin' : ''}`}
            onSubmit={handleSubmit}
          >
            <Field
              label="Continent"
              fieldName="continent"
              registerFieldRef={registerFieldRef}
              isActive={activeField === 'continent'}
              isAnimating={isShuffleRunning}
            >
              <Select name="continent" value={form.continent} onChange={handleChange} options={continents} disabled={isInputLocked} />
            </Field>
            <Field
              label="Education of Employee"
              fieldName="education_of_employee"
              registerFieldRef={registerFieldRef}
              isActive={activeField === 'education_of_employee'}
              isAnimating={isShuffleRunning}
            >
              <Select
                name="education_of_employee"
                value={form.education_of_employee}
                onChange={handleChange}
                options={educationLevels}
                disabled={isInputLocked}
              />
            </Field>
            <Field
              label="Region of Employment"
              fieldName="region_of_employment"
              registerFieldRef={registerFieldRef}
              isActive={activeField === 'region_of_employment'}
              isAnimating={isShuffleRunning}
            >
              <Select
                name="region_of_employment"
                value={form.region_of_employment}
                onChange={handleChange}
                options={employmentRegions}
                disabled={isInputLocked}
              />
            </Field>
            <Field
              label="Application Month"
              fieldName="application_month"
              registerFieldRef={registerFieldRef}
              isActive={activeField === 'application_month'}
              isAnimating={isShuffleRunning}
            >
              <Select
                name="application_month"
                value={form.application_month}
                onChange={handleChange}
                options={monthOptions}
                disabled={isInputLocked}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Has Job Experience"
                fieldName="has_job_experience"
                registerFieldRef={registerFieldRef}
                isActive={activeField === 'has_job_experience'}
                isAnimating={isShuffleRunning}
              >
                <Select
                  name="has_job_experience"
                  value={form.has_job_experience}
                  onChange={handleChange}
                  options={binaryChoices}
                  disabled={isInputLocked}
                />
              </Field>
              <Field
                label="Requires Job Training"
                fieldName="requires_job_training"
                registerFieldRef={registerFieldRef}
                isActive={activeField === 'requires_job_training'}
                isAnimating={isShuffleRunning}
              >
                <Select
                  name="requires_job_training"
                  value={form.requires_job_training}
                  onChange={handleChange}
                  options={binaryChoices}
                  disabled={isInputLocked}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Unit of Wage"
                fieldName="unit_of_wage"
                registerFieldRef={registerFieldRef}
                isActive={activeField === 'unit_of_wage'}
                isAnimating={isShuffleRunning}
              >
                <Select
                  name="unit_of_wage"
                  value={form.unit_of_wage}
                  onChange={handleChange}
                  options={wageUnits}
                  disabled={isInputLocked}
                />
              </Field>
              <Field
                label="Full-Time Position"
                fieldName="full_time_position"
                registerFieldRef={registerFieldRef}
                isActive={activeField === 'full_time_position'}
                isAnimating={isShuffleRunning}
              >
                <Select
                  name="full_time_position"
                  value={form.full_time_position}
                  onChange={handleChange}
                  options={binaryChoices}
                  disabled={isInputLocked}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field
                label="No. of Employees"
                fieldName="no_of_employees"
                registerFieldRef={registerFieldRef}
                isActive={activeField === 'no_of_employees'}
                isAnimating={isShuffleRunning}
              >
                <input
                  type="number"
                  name="no_of_employees"
                  value={form.no_of_employees}
                  onChange={handleChange}
                  min={1}
                  placeholder="e.g., 500"
                  className="w-full rounded-xl border-[3px] border-borderStrong bg-obsidian/85 px-4 py-3 text-ivory placeholder-ivory/40 outline-none transition focus:border-gold focus:shadow-glowGold"
                  disabled={isInputLocked}
                  required
                />
              </Field>
              <Field
                label="Year of Establishment"
                fieldName="yr_of_estab"
                registerFieldRef={registerFieldRef}
                isActive={activeField === 'yr_of_estab'}
                isAnimating={isShuffleRunning}
              >
                <input
                  type="number"
                  name="yr_of_estab"
                  value={form.yr_of_estab}
                  onChange={handleChange}
                  min={1800}
                  max={new Date().getFullYear()}
                  placeholder="e.g., 2010"
                  className="w-full rounded-xl border-[3px] border-borderStrong bg-obsidian/85 px-4 py-3 text-ivory placeholder-ivory/40 outline-none transition focus:border-gold focus:shadow-glowGold"
                  disabled={isInputLocked}
                  required
                />
              </Field>
              <Field
                label="Prevailing Wage (USD)"
                fieldName="prevailing_wage"
                registerFieldRef={registerFieldRef}
                isActive={activeField === 'prevailing_wage'}
                isAnimating={isShuffleRunning}
              >
                <input
                  type="number"
                  name="prevailing_wage"
                  value={form.prevailing_wage}
                  onChange={handleChange}
                  min={0}
                  step="0.1"
                  placeholder="e.g., 4200"
                  className="w-full rounded-xl border-[3px] border-borderStrong bg-obsidian/85 px-4 py-3 text-ivory placeholder-ivory/40 outline-none transition focus:border-gold focus:shadow-glowGold"
                  disabled={isInputLocked}
                  required
                />
              </Field>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <motion.button
                type="button"
                onClick={handleShuffle}
                disabled={isInputLocked}
                whileHover={{ rotate: -1.5, scale: 1.015 }}
                whileTap={{ scale: isMobileViewport ? 0.96 : 0.98, y: isMobileViewport ? 3 : 2 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className={`shuffle-button group relative flex min-h-12 items-center justify-center gap-2 rounded-xl border-[3px] border-gold/90 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-ivory ${isMobileViewport ? 'mobile-shuffle-button' : ''} ${mobileBurstActive ? 'mobile-shuffle-burst' : ''} ${isInputLocked ? 'cursor-not-allowed opacity-65' : ''}`}
                aria-label="AI Shuffle"
              >
                <span className="shuffle-ripple" />
                <span className="mobile-shuffle-orbit mobile-shuffle-orbit-a" aria-hidden="true" />
                <span className="mobile-shuffle-orbit mobile-shuffle-orbit-b" aria-hidden="true" />
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M4 7h3c2.6 0 4.3 1.1 6.1 3.7l.4.6C15.3 14 17 15 19.6 15H22" />
                  <path d="M18 5l4 2-4 2" />
                  <path d="M4 17h3c2.4 0 4-.9 5.4-2.8" />
                  <path d="M18 13l4 2-4 2" />
                </svg>
                <span className="relative z-10">
                  {isShuffleRunning ? (isMobileViewport ? 'Generating...' : 'Generating Scenario...') : 'AI Shuffle'}
                </span>
              </motion.button>

              <AnimatedButton
                type="submit"
                disabled={isInputLocked}
                className={`w-full ${isInputLocked ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                {isLoading ? 'Calculating...' : 'Generate Estimate'}
              </AnimatedButton>
            </div>

            {isMobileViewport ? (
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-gold/85">
                Tap AI Shuffle for a guided smart-scenario scroll
              </p>
            ) : null}
          </form>
        </SectionReveal>

        <div ref={resultAnchorRef}>
          <SectionReveal className="space-y-5" delay={0.06}>
          {isLoading ? (
            <div className="grid gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <div className="neo-brutal-card p-5">
                <div className="shimmer-block h-56 rounded-xl" />
              </div>
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="neo-brutal-card animate-pulseGlow p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">Estimated Processing Time</p>
                  <p className="section-title mt-2 text-3xl text-ivory sm:text-4xl">{result.range}</p>
                  <p className="mt-2 text-sm text-ivory/70">
                    Point estimate: <CountUpValue value={result.predictedDays} /> days
                  </p>
                </div>

                <div className="neo-brutal-card p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">Confidence Score</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-borderStrong">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidencePercent}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full bg-gradient-to-r from-gold to-glow"
                    />
                  </div>
                  <p className="mt-3 section-title text-3xl text-glow sm:text-4xl">{confidencePercent}%</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="neo-brutal-card p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">Radial Gauge</p>
                  <div className="mt-4 h-56 w-full">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={confidenceData}
                          dataKey="value"
                          innerRadius={58}
                          outerRadius={78}
                          strokeWidth={0}
                        >
                          <Cell fill="#C2A878" />
                          <Cell fill="#2B2B2B" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: '#111',
                            border: '2px solid #2B2B2B',
                            borderRadius: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="neo-brutal-card p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">Processing Trends</p>
                  <div className="mt-4 h-56 w-full">
                    <ResponsiveContainer>
                      <LineChart data={result.trend}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#2B2B2B" />
                        <XAxis dataKey="month" stroke="#F5F5DC" />
                        <YAxis stroke="#F5F5DC" />
                        <Tooltip
                          contentStyle={{
                            background: '#111',
                            border: '2px solid #2B2B2B',
                            borderRadius: '12px',
                          }}
                        />
                        <Line type="monotone" dataKey="days" stroke="#8EE6E6" strokeWidth={3} dot={{ fill: '#C2A878' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="neo-brutal-card p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Continent-Wise Comparison</p>
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer>
                    <BarChart data={result.comparison}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#2B2B2B" />
                      <XAxis dataKey="segment" stroke="#F5F5DC" />
                      <YAxis stroke="#F5F5DC" />
                      <Tooltip
                        contentStyle={{
                          background: '#111',
                          border: '2px solid #2B2B2B',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="days" fill="#C2A878" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="neo-brutal-card p-8 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Awaiting Prediction</p>
              <p className="section-title mt-3 text-3xl text-ivory">Run the model to reveal your AI estimate.</p>
              <p className="mt-2 text-sm text-ivory/70">A full result card, gauge, and trend analytics will appear here.</p>
            </div>
          )}
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, fieldName, registerFieldRef, isActive = false, isAnimating = false }) {
  return (
    <label className={`grid gap-2 ${isAnimating ? 'field-animating' : ''}`}>
      <span className="text-xs uppercase tracking-[0.2em] text-gold">{label}</span>
      <div ref={registerFieldRef ? registerFieldRef(fieldName) : undefined} className={`field-shell ${isActive ? 'field-active' : ''}`}>
        {children}
      </div>
    </label>
  );
}

function Select({ name, value, onChange, options, disabled = false }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full cursor-pointer rounded-xl border-[3px] border-borderStrong bg-obsidian/85 px-4 py-3 text-ivory outline-none transition focus:border-gold focus:shadow-glowGold"
      required
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function CountUpValue({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const duration = 700;
    let raf = null;

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round((from + (value - from) * eased) * 10) / 10);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [value]);

  return <span className="text-gold">{display}</span>;
}
