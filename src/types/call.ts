export type Outcome = 'qualified' | 'callback' | 'rejected' | 'no_answer';

export interface Call {
  id: string;
  agent: string;
  duration: number;
  timestamp: string;
  outcome: Outcome;
  sentiment: number;
  transcript: string;
}

export const OUTCOMES: Outcome[] = [
  'qualified',
  'callback',
  'rejected',
  'no_answer',
];

export type SortKey =
  | 'agent'
  | 'duration'
  | 'timestamp'
  | 'outcome'
  | 'sentiment';
export type SortDirection = 'asc' | 'desc';
