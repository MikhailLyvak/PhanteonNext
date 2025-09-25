import axiosInterceptor from '@/interceptor/axiosClient';

export interface Subscription {
  id: number;
  subscription_type: 'monthly' | 'yearly';
  price: number;
  ai_assistant_access: boolean;
  custom_indicators_access: boolean;
  screener_access: boolean;
  blog_access: boolean;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const response = await axiosInterceptor.get('/api/subscriptions/');
  return response.data;
}

