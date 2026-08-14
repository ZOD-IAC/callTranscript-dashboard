'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DashboardFilters, EMPTY_FILTERS } from '@/lib/calls';
import { Outcome, SortDirection, SortKey } from '@/types/call';

const VALID_OUTCOMES: Outcome[] = [
  'qualified',
  'callback',
  'rejected',
  'no_answer',
];
const VALID_SORT_KEYS: SortKey[] = [
  'agent',
  'duration',
  'timestamp',
  'outcome',
  'sentiment',
];

export interface DashboardState {
  filters: DashboardFilters;
  sortKey: SortKey;
  sortDirection: SortDirection;
  page: number;
  selectedCallId: string | null;
}

export function useDashboardState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: DashboardState = useMemo(() => {
    const agents = searchParams.get('agents');
    const outcomes = searchParams.get('outcomes');
    const sort = searchParams.get('sort');
    const dir = searchParams.get('dir');
    const page = searchParams.get('page');
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');

    return {
      filters: {
        agents: agents
          ? agents.split(',').filter(Boolean)
          : EMPTY_FILTERS.agents,
        outcomes: outcomes
          ? (outcomes
              .split(',')
              .filter((o) =>
                VALID_OUTCOMES.includes(o as Outcome),
              ) as Outcome[])
          : EMPTY_FILTERS.outcomes,
        dateFrom: searchParams.get('from') || null,
        dateTo: searchParams.get('to') || null,
        minDuration: minDuration ? Number(minDuration) : null,
        maxDuration: maxDuration ? Number(maxDuration) : null,
        query: searchParams.get('q') || '',
      },
      sortKey: VALID_SORT_KEYS.includes(sort as SortKey)
        ? (sort as SortKey)
        : 'timestamp',
      sortDirection: dir === 'asc' ? 'asc' : 'desc',
      page: page ? Math.max(1, Number(page)) : 1,
      selectedCallId: searchParams.get('call'),
    };
  }, [searchParams]);

  const patch = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') params.delete(key);
        else params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setFilters = useCallback(
    (partial: Partial<DashboardFilters>) => {
      const updates: Record<string, string | null> = { page: null }; // reset page on filter change
      if ('agents' in partial)
        updates.agents = partial.agents!.length
          ? partial.agents!.join(',')
          : null;
      if ('outcomes' in partial)
        updates.outcomes = partial.outcomes!.length
          ? partial.outcomes!.join(',')
          : null;
      if ('dateFrom' in partial) updates.from = partial.dateFrom ?? null;
      if ('dateTo' in partial) updates.to = partial.dateTo ?? null;
      if ('minDuration' in partial)
        updates.minDuration =
          partial.minDuration != null ? String(partial.minDuration) : null;
      if ('maxDuration' in partial)
        updates.maxDuration =
          partial.maxDuration != null ? String(partial.maxDuration) : null;
      if ('query' in partial) updates.q = partial.query || null;
      patch(updates);
    },
    [patch],
  );

  const setSort = useCallback(
    (key: SortKey) => {
      if (key === state.sortKey) {
        patch({ dir: state.sortDirection === 'asc' ? 'desc' : 'asc' });
      } else {
        patch({ sort: key, dir: 'asc' });
      }
    },
    [patch, state.sortKey, state.sortDirection],
  );

  const setPage = useCallback(
    (page: number) => patch({ page: page > 1 ? String(page) : null }),
    [patch],
  );
  const openCall = useCallback((id: string) => patch({ call: id }), [patch]);
  const closeCall = useCallback(() => patch({ call: null }), [patch]);

  const resetFilters = useCallback(() => {
    patch({
      agents: null,
      outcomes: null,
      from: null,
      to: null,
      minDuration: null,
      maxDuration: null,
      q: null,
      page: null,
    });
  }, [patch]);

  return {
    state,
    setFilters,
    setSort,
    setPage,
    openCall,
    closeCall,
    resetFilters,
  };
}
