import { useQuery } from '@tanstack/react-query';
import { getBlogDetail } from '@/api/Blog/getBlogDetail';

export function useGetBlogDetail(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => getBlogDetail(slug),
    enabled: !!slug,
  });
}


