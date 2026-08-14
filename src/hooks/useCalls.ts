'use client';

import { useEffect, useState } from 'react';
import { Call } from '@/types/call';

export function useCalls() {
  const [calls, setCalls] = useState<Call[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/data/calls.json')
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to load call data (${res.status})`);
        return res.json();
      })
      .then((data: Call[]) => {
        if (!cancelled) setCalls(data);
      })
      .catch((err: Error) => {
        if (!cancelled)
          setError(err.message || 'Something went wrong loading call data.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { calls, isLoading: calls === null && error === null, error };
}
