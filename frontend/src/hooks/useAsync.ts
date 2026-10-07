import { useEffect, useState } from 'react';

type AsyncFn<T> = (signal: AbortSignal) => Promise<T>;

export function useAsync<T>(fn: AsyncFn<T> | null, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fn) {
      setData(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    setData(null);
    setError(null);
    // Ignore results that land after cleanup (unmount or deps change)
    fn(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted && e.name !== 'AbortError') setError(e);
      });
    return () => controller.abort();
  }, deps);

  return { data, error };
}
