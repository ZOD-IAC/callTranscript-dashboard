'use client';
import { Suspense, useMemo } from 'react';
import { useCalls } from '@/hooks/useCalls';
import { useDashboardState } from '@/hooks/useDashboardState';
import { CallsTable } from '@/components/CallsTable';
import {
  filterCalls,
  sortCalls,
  computeSummary,
  formatDuration,
} from '@/lib/calls';
import { Card, CardContent } from '@/components/ui/card';
import { OUTCOMES } from '@/types/call';
import { FiltersPanel } from '@/components/FiltersPanel';
import { uniqueAgents } from '@/lib/calls';
import { CallDetailSheet } from '@/components/CallDetailSheet';

const PAGE_SIZE = 20;

function DashboardInner() {
  const { calls, isLoading, error } = useCalls();
  const {
    state,
    setSort,
    setPage,
    openCall,
    closeCall,
    setFilters,
    resetFilters,
  } = useDashboardState();
  const selectedCall = state.selectedCallId
    ? (calls?.find((c) => c.id === state.selectedCallId) ?? null)
    : null;
  const agentOptions = useMemo(
    () => (calls ? uniqueAgents(calls) : []),
    [calls],
  );

  const filtered = useMemo(
    () => (calls ? filterCalls(calls, state.filters) : []),
    [calls, state.filters],
  );
  const sorted = useMemo(
    () => sortCalls(filtered, state.sortKey, state.sortDirection),
    [filtered, state.sortKey, state.sortDirection],
  );
  const summary = useMemo(() => computeSummary(filtered), [filtered]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(state.page, totalPages);
  const pageItems = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (error) {
    return <p className='text-red-600 text-center mt-24'>Error: {error}</p>;
  }

  return (
    <div className='min-h-screen bg-muted/20'>
      <header className='border-b bg-background'>
        <div className='mx-auto max-w-7xl px-6 py-4'>
          <h1 className='text-xl font-semibold'>Call Transcript Dashboard</h1>
          <p className='text-sm text-muted-foreground'>Adstia Agency</p>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row gap-6 items-start'>
        {/* Sidebar */}
        <aside className='w-full md:w-64 shrink-0 bg-background border rounded-lg p-4 md:sticky md:top-6'>
          <FiltersPanel
            filters={state.filters}
            agentOptions={agentOptions}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </aside>
        {/* Main content */}
        <div className='flex-1 min-w-0 w-full space-y-6'>
          {/* Summary strip */}
          <div className='grid grid-cols-2 md:grid-cols-6 gap-3'>
            <Card>
              <CardContent className='pt-4'>
                <p className='text-xs text-muted-foreground'>Total calls</p>
                <p className='text-2xl font-bold'>{summary.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-4'>
                <p className='text-xs text-muted-foreground'>Avg duration</p>
                <p className='text-2xl font-bold'>
                  {formatDuration(summary.avgDuration)}
                </p>
              </CardContent>
            </Card>
            {OUTCOMES.map((outcome) => (
              <Card key={outcome}>
                <CardContent className='pt-4'>
                  <p className='text-xs text-muted-foreground capitalize'>
                    {outcome.replace('_', ' ')}
                  </p>
                  <p className='text-2xl font-bold'>
                    {summary.byOutcome[outcome]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card>
            <CardContent className='pt-4'>
              <CallsTable
                calls={pageItems}
                isLoading={isLoading}
                sortKey={state.sortKey}
                sortDirection={state.sortDirection}
                onSort={setSort}
                onRowClick={(call) => openCall(call.id)}
              />
              {!isLoading && totalPages > 1 && (
                <div className='flex items-center justify-center gap-3 mt-4 text-sm'>
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className='px-3 py-1 border rounded disabled:opacity-40'
                  >
                    Prev
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className='px-3 py-1 border rounded disabled:opacity-40'
                  >
                    Next
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <CallDetailSheet
        call={selectedCall}
        searchTerm={state.filters.query}
        onClose={closeCall}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
