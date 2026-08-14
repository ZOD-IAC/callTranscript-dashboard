'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DashboardFilters } from '@/lib/calls';
import { OUTCOMES, Outcome } from '@/types/call';

interface Props {
  filters: DashboardFilters;
  agentOptions: string[];
  onChange: (partial: Partial<DashboardFilters>) => void;
  onReset: () => void;
}

export function FiltersPanel({
  filters,
  agentOptions,
  onChange,
  onReset,
}: Props) {
  // Local copies for the two inputs that get typed into. Only pushed to the
  // URL (via onChange) 300ms after typing stops, so typing feels instant
  // and we're not re-filtering 300 rows on every keystroke.
  const [query, setQuery] = useState(filters.query);
  const [minDuration, setMinDuration] = useState(
    filters.minDuration?.toString() ?? '',
  );
  const [maxDuration, setMaxDuration] = useState(
    filters.maxDuration?.toString() ?? '',
  );

  useEffect(() => {
    const timer = setTimeout(() => onChange({ query }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({
        minDuration: minDuration ? Number(minDuration) : null,
        maxDuration: maxDuration ? Number(maxDuration) : null,
      });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDuration, maxDuration]);

  function toggleAgent(agent: string) {
    const next = filters.agents.includes(agent)
      ? filters.agents.filter((a) => a !== agent)
      : [...filters.agents, agent];
    onChange({ agents: next });
  }

  function toggleOutcome(outcome: Outcome) {
    const next = filters.outcomes.includes(outcome)
      ? filters.outcomes.filter((o) => o !== outcome)
      : [...filters.outcomes, outcome];
    onChange({ outcomes: next });
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-semibold'>Filters</h2>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 text-xs text-muted-foreground'
          onClick={onReset}
        >
          Clear all
        </Button>
      </div>

      <div>
        <p className='text-xs font-semibold text-muted-foreground mb-2'>
          Search transcript
        </p>
        <Input
          type='text'
          placeholder='e.g. dental benefit'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div>
        <p className='text-xs font-semibold text-muted-foreground mb-2'>
          Agents
        </p>
        <div className='max-h-40 overflow-y-auto space-y-1.5 pr-1'>
          {agentOptions.map((agent) => (
            <label
              key={agent}
              className='flex items-center gap-2 text-sm cursor-pointer'
            >
              <Checkbox
                checked={filters.agents.includes(agent)}
                onCheckedChange={() => toggleAgent(agent)}
              />
              {agent}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className='text-xs font-semibold text-muted-foreground mb-2'>
          Outcome
        </p>
        <div className='space-y-1.5'>
          {OUTCOMES.map((outcome) => (
            <label
              key={outcome}
              className='flex items-center gap-2 text-sm capitalize cursor-pointer'
            >
              <Checkbox
                checked={filters.outcomes.includes(outcome)}
                onCheckedChange={() => toggleOutcome(outcome)}
              />
              {outcome.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className='text-xs font-semibold text-muted-foreground mb-2'>
          Date range
        </p>
        <div className='space-y-2'>
          <Input
            type='date'
            value={filters.dateFrom ?? ''}
            onChange={(e) => onChange({ dateFrom: e.target.value || null })}
          />
          <Input
            type='date'
            value={filters.dateTo ?? ''}
            onChange={(e) => onChange({ dateTo: e.target.value || null })}
          />
        </div>
      </div>

      <div>
        <p className='text-xs font-semibold text-muted-foreground mb-2'>
          Duration (sec)
        </p>
        <div className='flex gap-2'>
          <Input
            type='number'
            placeholder='min'
            value={minDuration}
            onChange={(e) => setMinDuration(e.target.value)}
          />
          <Input
            type='number'
            placeholder='max'
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
