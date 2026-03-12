import { useEffect, useRef } from 'react';

import { EVAL_COOLDOWN_MS } from '@/constants/notification-config';
import { evaluateReminders } from '@/features/notifications/evaluate-reminders';
import type { HomeData } from '@/hooks/use-home-data';

/**
 * Evaluates and schedules local notifications when home data is available.
 *
 * Guards against redundant work from rapid Home-screen focus events
 * (e.g. navigating back-and-forth) by enforcing a minimum interval
 * between evaluation runs ({@link EVAL_COOLDOWN_MS}, default 60 s).
 *
 * The evaluation layer itself is idempotent (cancel-then-schedule) and
 * has its own cooldown for service reminders, so even without this
 * guard no duplicate notifications would fire — but skipping the work
 * avoids unnecessary permission checks and AsyncStorage reads.
 */
export function useNotifications(data: HomeData | null): void {
  const lastEvalAt = useRef(0);

  useEffect(() => {
    if (!data) return;

    const now = Date.now();
    if (now - lastEvalAt.current < EVAL_COOLDOWN_MS) return;
    lastEvalAt.current = now;

    evaluateReminders(data);
  }, [data]);
}
