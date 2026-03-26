import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import { getHistory } from '../lib/storage';

export default function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [continentFilter, setContinentFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const continents = useMemo(() => {
    const all = entries.map((item) => item.payload?.continent).filter(Boolean);
    return ['All', ...Array.from(new Set(all))];
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((item) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.payload?.continent?.toLowerCase().includes(q) ||
        item.payload?.region_of_employment?.toLowerCase().includes(q) ||
        item.payload?.education_of_employee?.toLowerCase().includes(q);
      const matchesContinent = continentFilter === 'All' || item.payload?.continent === continentFilter;
      return matchesQuery && matchesContinent;
    });
  }, [entries, query, continentFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <SectionReveal className="mb-6">
        <h1 className="section-title text-3xl text-ivory sm:text-4xl md:text-5xl">Prediction History</h1>
        <p className="mt-2 text-ivory/75">Search, filter, and inspect your previous AI estimates in a brutalist analytics table.</p>
      </SectionReveal>

      <SectionReveal className="neo-brutal-card p-5 md:p-6">
        <div className="mb-5 grid gap-4 md:grid-cols-[1fr_230px]">
          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-gold">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Continent, region, education..."
              className="w-full rounded-xl border-[3px] border-borderStrong bg-obsidian/80 px-4 py-3 text-ivory outline-none transition focus:border-gold"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-gold">Continent</span>
            <select
              value={continentFilter}
              onChange={(event) => setContinentFilter(event.target.value)}
              className="rounded-xl border-[3px] border-borderStrong bg-obsidian/80 px-4 py-3 text-ivory outline-none transition focus:border-gold"
            >
              {continents.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:hidden">
          {filtered.map((entry) => {
            const expanded = expandedId === entry.id;
            return (
              <article key={entry.id} className="rounded-xl border-[3px] border-borderStrong bg-obsidian/70 p-4">
                <div className="grid gap-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm font-semibold text-ivory">{entry.payload.continent} · {entry.payload.education_of_employee}</p>
                  <p className="text-sm text-ivory/80">{entry.range}</p>
                  <p className="text-sm text-glow">{Math.round(entry.confidence * 100)}% confidence</p>
                </div>

                <button
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                  className="mt-3 w-full rounded-lg border-2 border-borderStrong bg-obsidian px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition hover:border-gold"
                >
                  {expanded ? 'Hide Details' : 'View Details'}
                </button>

                {expanded ? (
                  <div className="mt-3 grid gap-2">
                    <Detail label="Region" value={entry.payload.region_of_employment} />
                    <Detail label="Application Month" value={entry.payload.application_month} />
                    <Detail label="Job Experience" value={entry.payload.has_job_experience} />
                    <Detail label="Requires Training" value={entry.payload.requires_job_training} />
                    <Detail label="Employees" value={entry.payload.no_of_employees} />
                    <Detail label="Year Established" value={entry.payload.yr_of_estab} />
                    <Detail label="Prevailing Wage" value={`${entry.payload.prevailing_wage} (${entry.payload.unit_of_wage})`} />
                    <Detail label="Full Time" value={entry.payload.full_time_position} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border-[3px] border-borderStrong md:block">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slateDeep/95 text-left text-xs uppercase tracking-[0.17em] text-gold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Continent</th>
                <th className="px-4 py-3">Education</th>
                <th className="px-4 py-3">Estimate</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const expanded = expandedId === entry.id;
                return (
                  <FragmentRow
                    key={entry.id}
                    entry={entry}
                    expanded={expanded}
                    onToggle={() => setExpandedId(expanded ? null : entry.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {!filtered.length ? (
          <p className="mt-5 rounded-xl border-2 border-borderStrong bg-obsidian/70 p-4 text-center text-ivory/70">
            No predictions match this filter.
          </p>
        ) : null}
      </SectionReveal>
    </div>
  );
}

function FragmentRow({ entry, expanded, onToggle }) {
  const confidence = `${Math.round(entry.confidence * 100)}%`;

  return (
    <>
      <motion.tr
        whileHover={{ backgroundColor: 'rgba(194, 168, 120, 0.12)' }}
        className="border-t border-borderStrong/80"
      >
        <td className="px-4 py-3">{new Date(entry.createdAt).toLocaleDateString()}</td>
        <td className="px-4 py-3">{entry.payload.continent}</td>
        <td className="px-4 py-3">{entry.payload.education_of_employee}</td>
        <td className="px-4 py-3">{entry.range}</td>
        <td className="px-4 py-3 text-glow">{confidence}</td>
        <td className="px-4 py-3">
          <button
            onClick={onToggle}
            className="rounded-lg border-2 border-borderStrong bg-obsidian px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] transition hover:border-gold"
          >
            {expanded ? 'Hide' : 'Expand'}
          </button>
        </td>
      </motion.tr>

      {expanded ? (
        <tr className="border-t border-borderStrong/70 bg-slateDeep/60">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Detail label="Region" value={entry.payload.region_of_employment} />
              <Detail label="Application Month" value={entry.payload.application_month} />
              <Detail label="Job Experience" value={entry.payload.has_job_experience} />
              <Detail label="Requires Training" value={entry.payload.requires_job_training} />
              <Detail label="Employees" value={entry.payload.no_of_employees} />
              <Detail label="Year Established" value={entry.payload.yr_of_estab} />
              <Detail label="Prevailing Wage" value={`${entry.payload.prevailing_wage} (${entry.payload.unit_of_wage})`} />
              <Detail label="Full Time" value={entry.payload.full_time_position} />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border-2 border-borderStrong bg-obsidian/70 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-gold">{label}</p>
      <p className="mt-1 font-semibold text-ivory">{value}</p>
    </div>
  );
}
