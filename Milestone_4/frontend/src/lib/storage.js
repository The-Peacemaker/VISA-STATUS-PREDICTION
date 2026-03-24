import { historySeed } from '../data/historySeed';

const STORAGE_KEY = 'visa-ai-history';

export function getHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historySeed));
    return historySeed;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return historySeed;
  } catch {
    return historySeed;
  }
}

export function savePrediction(entry) {
  const current = getHistory();
  const updated = [entry, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
