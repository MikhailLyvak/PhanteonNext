import axiosClient from '@/interceptor/axiosClient';

export type BlogListItem = {
  id: number;
  title: string;
  slug: string;
  cover?: string;
  created_at: string;
  reactions: { '👍': number; '👎': number; '♥': number };
  comments_count: number;
};

export async function getBlogs(): Promise<BlogListItem[]> {
  const { data } = await axiosClient.get('/api/blog/');
  return data;
}


