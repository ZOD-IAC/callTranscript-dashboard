'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Call } from '@/types/call';
import { formatDuration } from '@/lib/calls';
import { TranscriptView } from '@/components/TranscriptView';

interface Props {
  call: Call | null;
  searchTerm: string;
  onClose: () => void;
}

const OUTCOME_STYLES: Record<Call['outcome'], string> = {
  qualified: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  callback: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  rejected: 'bg-red-100 text-red-700 hover:bg-red-100',
  no_answer: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
};

export function CallDetailSheet({ call, searchTerm, onClose }: Props) {
  return (
    <Dialog open={!!call} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
        {call && (
          <>
            <DialogHeader>
              <DialogTitle>{call.agent}</DialogTitle>
            </DialogHeader>

            <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground -mt-2'>
              <span>{new Date(call.timestamp).toLocaleString()}</span>
              <span>·</span>
              <span>{formatDuration(call.duration)}</span>
              <span>·</span>
              <Badge
                className={`capitalize border-0 ${OUTCOME_STYLES[call.outcome]}`}
              >
                {call.outcome.replace('_', ' ')}
              </Badge>
              <span>·</span>
              <span>
                sentiment{' '}
                <span
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
                </span>
              </span>
            </div>

            <div className='mt-4 border-t pt-4'>
              <p className='text-xs font-semibold text-muted-foreground mb-3'>
                Transcript
              </p>
              <TranscriptView
                transcript={call.transcript}
                searchTerm={searchTerm}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
