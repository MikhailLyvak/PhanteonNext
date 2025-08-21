import axiosClient from '@/interceptor/axiosClient';

export type BlogComment = {
  id: number;
  user: number;
  user_name: string;
  parent: number | null;
  content: string;
  created_at: string;
};

export type BlogDetail = {
  id: number;
  title: string;
  slug: string;
  cover?: string;
  created_at: string;
  reactions: { '👍': number; '👎': number; '♥': number };
  comments: BlogComment[];
  content_markdown: string;
  content_html: string;
};

export async function getBlogDetail(slug: string): Promise<BlogDetail> {
  const { data } = await axiosClient.get(`/api/blog/${slug}/`);
  return data;
}


