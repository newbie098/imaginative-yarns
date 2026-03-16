const STORAGE_KEY = "story-past-picks";

interface PastPicks {
  [questionId: string]: string[];
}

export function getPastPicks(): PastPicks {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePicks(answers: Record<string, string>): void {
  try {
    const past = getPastPicks();
    for (const [questionId, value] of Object.entries(answers)) {
      if (!value) continue;
      if (!past[questionId]) past[questionId] = [];
      if (!past[questionId].includes(value)) {
        past[questionId].push(value);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(past));
  } catch {
    // localStorage unavailable
  }
}

export function getPicksForQuestion(questionId: string): string[] {
  return getPastPicks()[questionId] || [];
}
