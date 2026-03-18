import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getIncomingRequests } from '@/services/transfer-service';
import type { IncomingTransferRequest } from '@/types/transfer';

type UseTransferRequestsResult = {
  requests: IncomingTransferRequest[];
  refresh: () => Promise<void>;
};

export function useTransferRequests(enabled: boolean): UseTransferRequestsResult {
  const [requests, setRequests] = useState<IncomingTransferRequest[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await getIncomingRequests();
      setRequests(data);
    } catch {
      setRequests([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        setRequests([]);
        return;
      }
      let cancelled = false;
      getIncomingRequests()
        .then((data) => { if (!cancelled) setRequests(data); })
        .catch(() => {});
      return () => { cancelled = true; };
    }, [enabled]),
  );

  return { requests, refresh };
}
