'use client';

import { useState } from 'react';

interface UseReminderOptions {
  eventId: string;
  initialReminded: boolean;
  isLoggedIn: boolean;
}

export function useReminder({ eventId, initialReminded, isLoggedIn }: UseReminderOptions) {
  const [reminded, setReminded] = useState(initialReminded);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleReminder() {
    if (!isLoggedIn) {
      return { redirectLogin: true };
    }

    const previousState = reminded;
    const nextState = !previousState;

    // Optimistic UI update
    setReminded(nextState);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${eventId}/reminder`, {
        method: nextState ? 'PUT' : 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to update reminder');
      }

      const data = await res.json();
      setReminded(data.reminded);
      return { success: true };
    } catch (err: unknown) {
      // Rollback on network or server error
      setReminded(previousState);
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  return {
    reminded,
    loading,
    error,
    toggleReminder,
    setReminded,
  };
}
