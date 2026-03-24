import { useEffect, useMemo, useState } from 'react';
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
  const { pushToast } = useToast();

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
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const payload = {
        ...form,
        no_of_employees: Number(form.no_of_employees),
        yr_of_estab: Number(form.yr_of_estab),
        prevailing_wage: Number(form.prevailing_wage),
        application_month: Number(form.application_month),
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

  return (
    <div className="mx-auto w-full max-w-7xl">
      <SectionReveal className="mb-6">
        <h1 className="section-title text-4xl text-ivory md:text-5xl">Prediction Studio</h1>
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

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionReveal className="neo-brutal-card p-5 md:p-6">
          <h2 className="section-title text-2xl text-ivory">Application Inputs</h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <Field label="Continent">
              <Select name="continent" value={form.continent} onChange={handleChange} options={continents} />
            </Field>
            <Field label="Education of Employee">
              <Select
                name="education_of_employee"
                value={form.education_of_employee}
                onChange={handleChange}
                options={educationLevels}
              />
            </Field>
            <Field label="Region of Employment">
              <Select
                name="region_of_employment"
                value={form.region_of_employment}
                onChange={handleChange}
                options={employmentRegions}
              />
            </Field>
            <Field label="Application Month">
              <Select
                name="application_month"
                value={form.application_month}
                onChange={handleChange}
                options={Array.from({ length: 12 }, (_, idx) => String(idx + 1))}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Has Job Experience">
                <Select
                  name="has_job_experience"
                  value={form.has_job_experience}
                  onChange={handleChange}
                  options={binaryChoices}
                />
              </Field>
              <Field label="Requires Job Training">
                <Select
                  name="requires_job_training"
                  value={form.requires_job_training}
                  onChange={handleChange}
                  options={binaryChoices}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Unit of Wage">
                <Select name="unit_of_wage" value={form.unit_of_wage} onChange={handleChange} options={wageUnits} />
              </Field>
              <Field label="Full-Time Position">
                <Select
                  name="full_time_position"
                  value={form.full_time_position}
                  onChange={handleChange}
                  options={binaryChoices}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="No. of Employees">
                <input
                  type="number"
                  name="no_of_employees"
                  value={form.no_of_employees}
                  onChange={handleChange}
                  min={1}
                  className="w-full rounded-xl border-[3px] border-borderStrong bg-obsidian/85 px-4 py-3 text-ivory outline-none transition focus:border-gold focus:shadow-glowGold"
                  required
                />
              </Field>
              <Field label="Year of Establishment">
                <input
                  type="number"
                  name="yr_of_estab"
                  value={form.yr_of_estab}
                  onChange={handleChange}
                  min={1800}
                  max={new Date().getFullYear()}
                  className="w-full rounded-xl border-[3px] border-borderStrong bg-obsidian/85 px-4 py-3 text-ivory outline-none transition focus:border-gold focus:shadow-glowGold"
                  required
                />
              </Field>
              <Field label="Prevailing Wage">
                <input
                  type="number"
                  name="prevailing_wage"
                  value={form.prevailing_wage}
                  onChange={handleChange}
                  min={0}
                  step="0.1"
                  className="w-full rounded-xl border-[3px] border-borderStrong bg-obsidian/85 px-4 py-3 text-ivory outline-none transition focus:border-gold focus:shadow-glowGold"
                  required
                />
              </Field>
            </div>

            <AnimatedButton
              type="submit"
              disabled={isLoading}
              className={`mt-3 w-full ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              {isLoading ? 'Calculating...' : 'Generate Estimate'}
            </AnimatedButton>
          </form>
        </SectionReveal>

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
                  <p className="section-title mt-2 text-4xl text-ivory">{result.range}</p>
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
                  <p className="mt-3 section-title text-4xl text-glow">{confidencePercent}%</p>
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
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-gold">{label}</span>
      {children}
    </label>
  );
}

function Select({ name, value, onChange, options }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
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
