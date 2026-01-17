

import { useQuery } from '@tanstack/react-query';
import { fetchBurialPoints } from '@/lib/api';

export function useBurialPoints(limit: number = 1000) {
  const query = useQuery({
    queryKey: ['burialPoints', limit],
    queryFn: () => fetchBurialPoints(limit),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  return {
    burialPoints: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
