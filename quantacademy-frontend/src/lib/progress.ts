// Simple localStorage-based progress tracking for personal use

const STORAGE_KEY = "quantacademy-progress";

interface StrategyProgress {
  completed: boolean;
  quizScore: number | null;
  quizTotal: number | null;
}

interface ProgressMap {
  [slug: string]: StrategyProgress;
}

function load(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getProgress(slug: string): StrategyProgress | undefined {
  return load()[slug];
}

export function markComplete(slug: string, score: number, total: number) {
  const data = load();
  data[slug] = { completed: true, quizScore: score, quizTotal: total };
  save(data);
}

export function markIncomplete(slug: string) {
  const data = load();
  data[slug] = { completed: false, quizScore: null, quizTotal: null };
  save(data);
}

export function getQuizScore(slug: string): { score: number; total: number } | null {
  const p = load()[slug];
  if (!p || p.quizScore === null || p.quizTotal === null) return null;
  return { score: p.quizScore, total: p.quizTotal };
}

export function getCompletedStrategies(): string[] {
  const data = load();
  return Object.entries(data)
    .filter(([, p]) => p.completed)
    .map(([slug]) => slug);
}

export function getCompletionStats(): { completed: number; total: number; percentage: number } {
  const data = load();
  const completed = Object.values(data).filter((p) => p.completed).length;
  return { completed, total: 45, percentage: Math.round((completed / 45) * 100) };
}

export function resetAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
