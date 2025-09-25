import { useQuery } from '@tanstack/react-query';
import { getUserSubscriptions } from '../../api/Subscriptions';

export function useGetUserSubscriptions() {
  return useQuery({
    queryKey: ['userSubscriptions'],
    queryFn: getUserSubscriptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

