'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Call, SortDirection, SortKey } from '@/types/call';
import { formatDuration } from '@/lib/calls';
import { memo } from 'react';

interface Props {
  calls: Call[];
  isLoading: boolean;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onRowClick: (call: Call) => void;
}

const OUTCOME_STYLES: Record<Call['outcome'], string> = {
  qualified: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  callback: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  rejected: 'bg-red-100 text-red-700 hover:bg-red-100',
  no_answer: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'agent', label: 'Agent' },
  { key: 'duration', label: 'Duration' },
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'outcome', label: 'Outcome' },
  { key: 'sentiment', label: 'Sentiment' },
];

const OUTCOME_VARIANT: Record<
  Call['outcome'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  qualified: 'default',
  callback: 'secondary',
  rejected: 'destructive',
  no_answer: 'outline',
};

function CallsTableInner({
  calls,
  isLoading,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
}: Props) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className='text-center py-16 border rounded-lg bg-muted/30'>
        <p className='font-semibold'>No calls match these filters</p>
        <p className='text-sm text-muted-foreground mt-1'>
          Try widening your date range or clearing a filter.
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto border rounded-lg'>
      <Table className='min-w-160'>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                onClick={() => onSort(col.key)}
                className='cursor-pointer select-none hover:bg-muted/50'
              >
                {col.label}{' '}
                {sortKey === col.key
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow
              key={call.id}
              onClick={() => onRowClick(call)}
              className='cursor-pointer even:bg-muted/30'
            >
              <TableCell>{call.agent}</TableCell>
              <TableCell>{formatDuration(call.duration)}</TableCell>
              <TableCell>{new Date(call.timestamp).toLocaleString()}</TableCell>
              <TableCell>
                <Badge
                  className={`capitalize border-0 ${OUTCOME_STYLES[call.outcome]}`}
                >
                  {call.outcome.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell
                className={
                  call.sentiment == null
                    ? ''
                    : call.sentiment > 0.15
                      ? 'text-emerald-600'
                      : call.sentiment < -0.15
                        ? 'text-red-600'
                        : 'text-slate-500'
                }
              >
                {call.sentiment != null ? call.sentiment.toFixed(2) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const CallsTable = memo(CallsTableInner);
