import { useEffect, useState } from 'react';

export function useJsonData(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError(null);
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e);
      });
    return () => controller.abort();
  }, [url]);

  return { data, error };
}
