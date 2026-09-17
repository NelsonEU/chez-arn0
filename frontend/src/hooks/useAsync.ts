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
    fn(controller.signal)
      .then(setData)
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e);
      });
    return () => controller.abort();
  }, deps);

  return { data, error };
}
