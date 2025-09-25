import { getSubscriptions } from '@/api/Subscriptions/getSubscriptions';
import { useQuery } from '@tanstack/react-query';

export function useGetSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });
}

