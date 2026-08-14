import { Call, Outcome, SortDirection, SortKey } from '@/types/call';

export interface DashboardFilters {
  agents: string[];
  outcomes: Outcome[];
  dateFrom: string | null; // YYYY-MM-DD
  dateTo: string | null;
  minDuration: number | null;
  maxDuration: number | null;
  query: string;
}

export const EMPTY_FILTERS: DashboardFilters = {
  agents: [],
  outcomes: [],
  dateFrom: null,
  dateTo: null,
  minDuration: null,
  maxDuration: null,
  query: '',
};

export function filterCalls(calls: Call[], filters: DashboardFilters): Call[] {
  const q = filters.query.trim().toLowerCase();

  return calls.filter((call) => {
    if (filters.agents.length && !filters.agents.includes(call.agent))
      return false;
    if (filters.outcomes.length && !filters.outcomes.includes(call.outcome))
      return false;
    if (filters.minDuration != null && call.duration < filters.minDuration)
      return false;
    if (filters.maxDuration != null && call.duration > filters.maxDuration)
      return false;

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom + 'T00:00:00Z').getTime();
      if (new Date(call.timestamp).getTime() < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo + 'T23:59:59Z').getTime();
      if (new Date(call.timestamp).getTime() > to) return false;
    }
    if (q && !call.transcript.toLowerCase().includes(q)) return false;

    return true;
  });
}

export function sortCalls(
  calls: Call[],
  sortKey: SortKey,
  direction: SortDirection,
): Call[] {
  return [...calls].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'agent':
        cmp = a.agent.localeCompare(b.agent);
        break;
      case 'duration':
        cmp = a.duration - b.duration;
        break;
      case 'timestamp':
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'outcome':
        cmp = a.outcome.localeCompare(b.outcome);
        break;
      case 'sentiment':
        cmp = a.sentiment - b.sentiment;
        break;
    }
    return direction === 'asc' ? cmp : -cmp;
  });
}

export interface Summary {
  total: number;
  avgDuration: number;
  byOutcome: Record<Outcome, number>;
}

export function computeSummary(calls: Call[]): Summary {
  const byOutcome: Record<Outcome, number> = {
    qualified: 0,
    callback: 0,
    rejected: 0,
    no_answer: 0,
  };
  let totalDuration = 0;

  for (const call of calls) {
    byOutcome[call.outcome]++;
    totalDuration += call.duration;
  }

  return {
    total: calls.length,
    avgDuration: calls.length ? Math.round(totalDuration / calls.length) : 0,
    byOutcome,
  };
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function uniqueAgents(calls: Call[]): string[] {
  return Array.from(new Set(calls.map((c) => c.agent))).sort();
}
