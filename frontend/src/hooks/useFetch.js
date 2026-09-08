import { useState, useEffect, useCallback } from 'react';

/**
 * useFetch — generic data fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(studentService.getMyProfile);
 *
 * How it works:
 * - Calls the provided `fetchFn` immediately on mount
 * - Manages loading, data, and error state
 * - Returns a `refetch` function to manually re-trigger the call
 */
const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export default useFetch;
