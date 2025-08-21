import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '@/api/Blog/getBlogs';

export function useGetBlogs() {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: getBlogs,
  });
}


